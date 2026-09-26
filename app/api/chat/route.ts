/**
 * Chatbot public de la vitrine — `POST /api/chat`.
 *
 * Chemin d'une requête, du moins cher au plus cher :
 *   origine → format → IP bloquée ? → débit IP → débit session →
 *   injection / sonde ? → troll déjà repéré ? → modèle saturé ? →
 *   raccourci « contact » → intention de RDV → cache de réponses →
 *   RÉCUPÉRATION (BM25 + reclassement sémantique) → réponse directe de la
 *   base de connaissances ? → appel au modèle → marqueur [HS] →
 *   filtrage de la réponse.
 *
 * Tout ce qui est refusé ou servi avant l'appel au modèle ne consomme aucun
 * jeton : c'est la seule protection budgétaire qui tienne sur un palier
 * gratuit. Quatre chemins répondent sans rien dépenser — coordonnées, RDV,
 * cache, base de connaissances — et sont journalisés comme tels (`intent`)
 * pour qu'on puisse mesurer la part gratuite dans l'app mobile.
 *
 * Chaque échange est écrit dans Supabase avec `site = 'vn'` : la base est
 * partagée avec neuraweb.fr, et les deux offres ne doivent jamais se
 * mélanger dans le suivi.
 *
 * Le prompt système vient de `lib/chat/context.ts` : une base fixe (identité,
 * grille de prix, interdits) à laquelle s'ajoutent les seuls extraits de la
 * base de connaissances qui concernent la question posée.
 * La clé d'API n'est jamais placée dans le contexte du modèle, et
 * `scrubResponse` la retire quand même de la sortie par précaution.
 */

import { NextResponse, type NextRequest } from "next/server";
import type { Locale } from "@/lib/registry";
import { buildSystemPrompt } from "@/lib/chat/context";
import { rerank } from "@/lib/chat/embeddings";
import { search, withPackCoherence } from "@/lib/chat/retrieval";
import {
  ABUSE_BLOCK_MINUTES,
  OFF_TOPIC_MAX_STRIKES,
  detectAbuse,
  getClientIp,
  getOffTopicStrikes,
  isIpBlocked,
  amountsNotIn,
  namesForbiddenProvider,
  noteSaturation,
  rateLimit,
  registerAbuseSignal,
  registerOffTopicStrike,
  saturationRemaining,
  scrubResponse,
} from "@/lib/chat/guard";
import { getCached, setCached } from "@/lib/chat/cache";
import { isBookingRequest, isContactRequest } from "@/lib/chat/intents";
import { linksFor, withPricingLink } from "@/lib/chat/links";
import { logChat, reportSecurityEvent, type ChatIntent } from "@/lib/chat/telemetry";

// Rendu à la demande : la route lit des en-têtes de requête et un état par IP.
export const dynamic = "force-dynamic";

// ────────────────────────────────────────────────────────────
// Configuration
// ────────────────────────────────────────────────────────────

/** Mistral, palier gratuit de La Plateforme — même choix que le site FR. */
const AI_MODEL = process.env.CHAT_MODEL ?? "ministral-3b-latest";
/**
 * 400 jetons = environ 1 200 caractères, soit bien plus que les « 3 à 4
 * phrases » que le prompt impose. Descendre plus bas tronquerait les
 * recommandations finales, qui sont les réponses les plus utiles.
 */
const MAX_TOKENS = 400;
const MAX_MESSAGES_PER_SESSION = 20;
/** Deux secondes entre deux messages d'une même session. */
const MIN_MESSAGE_INTERVAL_MS = 2_000;
/** Plafond par IP : le sessionId vient du client, l'IP non. */
const IP_MAX_MESSAGES = 30;
const IP_WINDOW_MS = 10 * 60 * 1000;
const MESSAGE_MIN_LENGTH = 2;
const MESSAGE_MAX_LENGTH = 500;
/** Format imposé au sessionId généré par le widget : `session_<ts>_<rand>`. */
const SESSION_ID_PATTERN = /^[\w.-]{8,64}$/;
/** L'historique vient du client : borné avant d'entrer dans le prompt. */
/**
 * Quatre tours plutôt que six, 500 caractères plutôt que 800 : l'historique
 * était le deuxième poste de jetons après les extraits, et un prospect qui
 * remonte à plus de deux échanges ne s'y réfère quasiment jamais.
 */
const MAX_HISTORY_ITEMS = 4;
const MAX_HISTORY_ITEM_LENGTH = 500;
/** Extraits candidats sortis de BM25 avant reclassement sémantique. */
const RAG_CANDIDATES = 12;
/** Extraits finalement injectés dans le prompt. */
const RAG_TOP_K = 5;
/**
 * Score BM25 minimal, relatif au meilleur extrait de la recherche (les scores
 * sont normalisés, le premier vaut 1). Deux effets : une question sans rapport
 * ne ramène plus rien — le modèle doit dire qu'il ne sait pas au lieu de
 * broder — et la queue de liste, qui n'a qu'un mot en commun avec la question,
 * n'encombre plus le prompt.
 */
const RAG_MIN_SCORE = 0.25;
/**
 * Réponse directe depuis la base de connaissances, sans appel au modèle.
 *
 * Quand une question de premier tour tombe franchement sur une entrée de la
 * FAQ — celle-ci en tête, la suivante loin derrière — la meilleure réponse
 * possible est déjà écrite : c'est le texte de la FAQ, rédigé à la main, dans
 * la bonne langue, avec les bons chiffres. La faire reformuler par un modèle
 * de 3 milliards de paramètres coûte un appel et ne peut que l'abîmer.
 *
 * Le seuil porte sur le SECOND extrait : le premier vaut toujours 1 après
 * normalisation. `CHAT_FAQ_DIRECT=0` désactive ce chemin.
 */
const FAQ_DIRECT_MAX_RUNNER_UP = 0.4;
const FAQ_DIRECT_MAX_QUESTION_LENGTH = 120;

/** Le modèle préfixe ceci quand le message est hors-sujet ; jamais renvoyé au visiteur. */
const OFF_TOPIC_MARKER = /^\s*\[HS\]\s*/;

const LOCALES: Locale[] = ["vi", "en", "fr"];

const sessions = new Map<string, { count: number; lastMessage: number }>();

setInterval(
  () => {
    const now = Date.now();
    for (const [id, data] of Array.from(sessions.entries())) {
      if (now - data.lastMessage > 30 * 60 * 1000) sessions.delete(id);
    }
  },
  30 * 60 * 1000,
).unref?.();

// ────────────────────────────────────────────────────────────
// Textes — jamais de coordonnées, toujours le bouton de la page
// ────────────────────────────────────────────────────────────

type Strings = {
  /** Remplace toute coordonnée que le modèle aurait écrite (voir `scrubResponse`). */
  contactHint: string;
  invalidMessage: string;
  sessionRequired: string;
  waitBeforeSend: string;
  limitReached: string;
  configMissing: string;
  apiError: string;
  defaultResponse: string;
  blocked: string;
  abuseRefusal: string;
  offTopicLimited: string;
  contactAnswer: string;
  /** Le modèle a cité un montant absent des extraits : on renvoie vers la page des tarifs. */
  priceRedirect: string;
  /** Modèle saturé : le widget bloque l'envoi et affiche ce décompte. */
  saturated: string;
  /** Intention de rendez-vous détectée : le widget ouvre le choix des créneaux. */
  bookingIntro: string;
};

const T: Record<Locale, Strings> = {
  vi: {
    contactHint: 'nút "Nhận báo giá" trên trang',
    invalidMessage: "Tin nhắn không hợp lệ. Anh/chị nhập từ 2 đến 500 ký tự nhé.",
    sessionRequired: "Thiếu mã phiên trò chuyện.",
    waitBeforeSend: "Anh/chị đợi {time} giây rồi gửi tiếp nhé.",
    limitReached:
      'Cuộc trò chuyện đã đạt giới hạn tin nhắn. Anh/chị bấm nút "Nhận báo giá" trên trang để nhắn trực tiếp nhé.',
    configMissing: "Trợ lý đang tạm nghỉ. Anh/chị dùng nút \"Nhận báo giá\" trên trang giúp mình nhé.",
    apiError: 'Có lỗi xảy ra. Anh/chị thử lại, hoặc bấm nút "Nhận báo giá" trên trang nhé.',
    defaultResponse: 'Mình chưa xử lý được câu này. Anh/chị bấm nút "Nhận báo giá" trên trang nhé.',
    blocked: "Khung chat tạm khóa do có hoạt động bất thường. Anh/chị dùng nút liên hệ trên trang nhé.",
    abuseRefusal:
      "Mình không trả lời yêu cầu dạng này được ạ. Mình chỉ tư vấn về các gói website của Neuraweb ở Hà Nội. 😊 Anh/chị đang cần web cho quán hay cửa hàng nào ạ?",
    offTopicLimited:
      "Có lẽ mình không phải người phù hợp cho chủ đề này. 😊 Khung chat này chỉ dành cho các gói website của Neuraweb — anh/chị dùng nút liên hệ trên trang cho những việc khác nhé.",
    contactAnswer:
      'Anh/chị bấm nút "Nhận báo giá" ở đầu trang hoặc "Nhắn Zalo" ở cuối trang là nhắn được ngay — mình trả lời trong ngày. Trước đó, anh/chị muốn mình tư vấn gói nào phù hợp không ạ?',
    priceRedirect:
      "Mình không nêu số tiền trong tin nhắn để tránh nhầm lẫn — giá đầy đủ và luôn cập nhật nằm ở trang Bảng giá: /packs (chưa gồm phí triển khai và tên miền). Với ứng dụng Android, tự động hóa và tích hợp AI, giá từng gói nằm ở trang riêng của từng dịch vụ.",
    saturated:
      "Trợ lý đang nhận quá nhiều câu hỏi cùng lúc. Anh/chị đợi {time} giây rồi gửi lại giúp mình nhé.",
    bookingIntro:
      "Rất vui được hẹn gặp anh/chị! Đây là các khung giờ còn trống (giờ Hà Nội). Anh/chị chọn một ngày nhé:",
  },
  en: {
    contactHint: 'the "Get a quote" button on this page',
    invalidMessage: "Invalid message. Please type between 2 and 500 characters.",
    sessionRequired: "Chat session ID missing.",
    waitBeforeSend: "Please wait {time} second(s) before sending another message.",
    limitReached:
      'This conversation has reached its message limit. Use the "Get a quote" button on the page to reach us directly.',
    configMissing: 'The assistant is unavailable right now. Please use the "Get a quote" button on the page.',
    apiError: 'Something went wrong. Try again, or use the "Get a quote" button on the page.',
    defaultResponse: "I couldn't handle that one. Please use the contact button on the page.",
    blocked: "Chat access is temporarily suspended after unusual activity. Please use the contact button on the page.",
    abuseRefusal:
      "I can't answer that kind of request. I'm here for Neuraweb's website packs in Hanoi. 😊 What kind of business is the site for?",
    offTopicLimited:
      "I don't think I'm the right contact for this topic. 😊 This chat only covers Neuraweb's website packs — please use the contact button on the page for anything else.",
    contactAnswer:
      'Use the "Get a quote" button at the top of the page, or "Message on Zalo" at the bottom — we reply the same day. Before that, would you like help picking the right pack?',
    priceRedirect:
      "I don't quote amounts in chat, to avoid any mix-up — the full, always up-to-date prices are on the pricing page: /en/packs (deployment and domain name not included). For the Android app, automation and AI integration, the price of each tier is on that service's own page.",
    saturated:
      "The assistant is handling too many questions at once. Please try again in {time} seconds.",
    bookingIntro:
      "Happy to meet! Here are the free slots (Hanoi time). Pick a day that suits you:",
  },
  fr: {
    contactHint: "le bouton de contact de la page",
    invalidMessage: "Message invalide. Merci de saisir entre 2 et 500 caractères.",
    sessionRequired: "Identifiant de session manquant.",
    waitBeforeSend: "Merci de patienter {time} seconde(s) avant d'envoyer un autre message.",
    limitReached:
      "Cette conversation a atteint sa limite de messages. Utilisez le bouton de contact de la page pour nous écrire directement.",
    configMissing: "L'assistant est momentanément indisponible. Utilisez le bouton de contact de la page.",
    apiError: "Une erreur est survenue. Réessayez, ou utilisez le bouton de contact de la page.",
    defaultResponse: "Je n'ai pas pu traiter cette demande. Utilisez le bouton de contact de la page.",
    blocked: "L'accès au chat est temporairement suspendu suite à une activité inhabituelle. Utilisez le bouton de contact de la page.",
    abuseRefusal:
      "Je ne peux pas répondre à ce type de demande. Je suis là pour les packs de sites web de Neuraweb à Hanoi. 😊 C'est pour quel type de commerce ?",
    offTopicLimited:
      "Je ne suis pas le bon interlocuteur pour ce sujet. 😊 Ce chat ne couvre que les packs de sites Neuraweb — pour le reste, utilisez le bouton de contact de la page.",
    contactAnswer:
      "Le bouton « Nhận báo giá » en haut de page, ou « Nhắn Zalo » en bas, permet de nous écrire directement — réponse dans la journée. Avant ça, je vous aide à choisir le pack ?",
    priceRedirect:
      "Je ne cite pas de montants dans la discussion, pour éviter toute confusion — les prix complets et à jour sont sur la page des tarifs : /fr/packs (frais de déploiement et nom de domaine non inclus). Pour l'application Android, l'automatisation et l'intégration d'IA, le prix de chaque formule est sur la page propre à chaque prestation.",
    saturated:
      "L'assistant reçoit trop de questions en même temps. Réessayez dans {time} secondes.",
    bookingIntro:
      "Avec plaisir ! Voici les créneaux libres (heure de Hanoi). Choisissez un jour :",
  },
};

// ────────────────────────────────────────────────────────────
// Handler
// ────────────────────────────────────────────────────────────

type Body = {
  message?: unknown;
  sessionId?: unknown;
  locale?: unknown;
  history?: unknown;
  /** Champ leurre : un humain ne le remplit jamais, il n'est pas affiché. */
  website?: unknown;
};

/** Refuse les appels venant d'un autre site : ce point d'entrée sert la vitrine. */
function isForeignOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false; // requête same-origin classique, ou navigation directe
  try {
    return new URL(origin).host !== request.headers.get("host");
  } catch {
    return true;
  }
}

export async function POST(request: NextRequest) {
  let locale: Locale = "vi";

  try {
    if (isForeignOrigin(request)) {
      return NextResponse.json({ error: T.vi.blocked }, { status: 403 });
    }

    const body: Body = await request.json();
    locale = LOCALES.includes(body.locale as Locale) ? (body.locale as Locale) : "vi";
    const t = T[locale];

    // Honeypot : rempli ⇒ bot. Réponse 200 volontairement banale, pour ne pas
    // apprendre au script ce qui l'a trahi.
    if (typeof body.website === "string" && body.website.trim() !== "") {
      return NextResponse.json({ response: t.offTopicLimited, remainingMessages: 0, maxMessages: MAX_MESSAGES_PER_SESSION });
    }

    const message = typeof body.message === "string" ? body.message.trim() : "";
    if (message.length < MESSAGE_MIN_LENGTH || message.length > MESSAGE_MAX_LENGTH) {
      return NextResponse.json({ error: t.invalidMessage }, { status: 400 });
    }

    const sessionId = typeof body.sessionId === "string" ? body.sessionId : "";
    if (!SESSION_ID_PATTERN.test(sessionId)) {
      return NextResponse.json({ error: t.sessionRequired }, { status: 400 });
    }

    const ip = getClientIp(request.headers);

    if (isIpBlocked(ip)) {
      return NextResponse.json({ error: t.blocked }, { status: 429 });
    }

    // Débit par IP — sans lui, régénérer un sessionId suffisait à repartir à zéro.
    const ipCheck = rateLimit(`chat:${ip}`, IP_MAX_MESSAGES, IP_WINDOW_MS);
    if (!ipCheck.allowed) {
      registerAbuseSignal(ip);
      reportSecurityEvent({
        ip, sessionId, lang: locale,
        eventType: "rate_limit", severity: "medium",
        details: `Plus de ${IP_MAX_MESSAGES} messages en 10 min, toutes sessions confondues`,
      });
      return NextResponse.json(
        { error: t.limitReached, retryAfter: ipCheck.retryAfter ?? 60 },
        { status: 429, headers: { "Retry-After": String(ipCheck.retryAfter ?? 60) } },
      );
    }

    // Débit par session — c'est le quota affiché au visiteur dans le widget.
    const now = Date.now();
    const session = sessions.get(sessionId);
    if (session) {
      if (now - session.lastMessage < MIN_MESSAGE_INTERVAL_MS) {
        const wait = Math.ceil((MIN_MESSAGE_INTERVAL_MS - (now - session.lastMessage)) / 1000);
        return NextResponse.json(
          { error: t.waitBeforeSend.replace("{time}", String(wait)), retryAfter: wait },
          { status: 429 },
        );
      }
      if (session.count >= MAX_MESSAGES_PER_SESSION) {
        return NextResponse.json({ error: t.limitReached }, { status: 429 });
      }
      sessions.set(sessionId, { count: session.count + 1, lastMessage: now });
    } else {
      sessions.set(sessionId, { count: 1, lastMessage: now });
    }

    const used = sessions.get(sessionId)?.count ?? 1;
    const remainingMessages = Math.max(0, MAX_MESSAGES_PER_SESSION - used);
    const meta = { remainingMessages, maxMessages: MAX_MESSAGES_PER_SESSION };

    /**
     * Répond au visiteur ET écrit l'échange dans le suivi, en un seul geste.
     *
     * Centralisé exprès : la route a sept sorties différentes (refus, cache,
     * coordonnées, RDV, base de connaissances, modèle, hors-sujet) et l'onglet
     * « Visiteurs » de l'app mobile doit toutes les voir. Un `NextResponse`
     * écrit à la main quelque part, et une conversation disparaît du suivi
     * sans que personne ne s'en aperçoive.
     */
    const reply = (response: string, intent: ChatIntent, extra?: Record<string, unknown>) => {
      logChat({
        sessionId,
        ip,
        lang: locale,
        userMessage: message,
        assistantResponse: response,
        intent,
      });
      return NextResponse.json({ response, ...meta, ...extra });
    };

    // 🛡️ Injection de prompt ou sonde technique : refus statique, signal compté,
    // blocage de l'IP au 3e signal en une heure. Aucun appel au modèle.
    const abuse = detectAbuse(message);
    if (abuse) {
      const blocked = registerAbuseSignal(ip);
      console.warn(
        `[chat] ${abuse} depuis ${ip}${blocked ? ` → IP bloquée ${ABUSE_BLOCK_MINUTES} min` : ""}`,
      );
      reportSecurityEvent({
        ip, sessionId, lang: locale,
        eventType: abuse, severity: "high",
        userMessage: message,
        details: blocked ? `IP bloquée ${ABUSE_BLOCK_MINUTES} min après signaux répétés` : undefined,
      });
      return reply(t.abuseRefusal, "normal");
    }

    // 🛡️ Troll déjà repéré : plus aucun appel API tant que la fenêtre court.
    if (getOffTopicStrikes(ip) >= OFF_TOPIC_MAX_STRIKES) {
      return reply(t.offTopicLimited, "normal");
    }

    // ── Trois chemins qui répondent sans appeler le modèle ────────────────

    // Demande de coordonnées → le bouton de la page, pas un numéro écrit ici.
    if (isContactRequest(message, locale)) {
      return reply(t.contactAnswer, "contact", { showContact: true });
    }

    // Intention de rendez-vous → le widget ouvre le choix des créneaux, servis
    // par `GET /api/booking` (créneaux de Hanoi, fuseau d'Indochine).
    if (isBookingRequest(message, locale)) {
      return reply(t.bookingIntro, "booking", { showBookingDates: true });
    }

    // Même question, même langue, premier tour : la réponse est déjà rédigée.
    const firstTurn = !Array.isArray(body.history) || body.history.length === 0;
    if (firstTurn) {
      const cached = getCached(message, locale);
      if (cached) return reply(cached.response, "cached", { sources: cached.sources });
    }

    const apiKey = process.env.MISTRAL_API_KEY;
    if (!apiKey) {
      console.error("[chat] MISTRAL_API_KEY absente");
      return NextResponse.json({ error: t.configMissing }, { status: 503 });
    }

    // 🛑 Modèle saturé : inutile de réessayer avant la fin du refroidissement,
    // l'appel échouerait aussi. Le widget bloque l'envoi et décompte.
    // Ce contrôle vient APRÈS les chemins gratuits : une question déjà en
    // cache doit rester servie même quand le modèle est indisponible.
    const cooldown = saturationRemaining();
    if (cooldown > 0) {
      return NextResponse.json(
        { error: t.saturated.replace("{time}", String(cooldown)), retryAfter: cooldown },
        { status: 503, headers: { "Retry-After": String(cooldown) } },
      );
    }

    // Historique fourni par le client : bornes de taille ET de rôle, pour qu'il
    // ne puisse pas injecter un faux tour « system ».
    const history = Array.isArray(body.history) ? body.history.slice(-MAX_HISTORY_ITEMS) : [];
    const turns: { role: "user" | "assistant"; content: string }[] = [];
    for (const item of history) {
      const role = (item as { role?: unknown })?.role;
      const content = (item as { content?: unknown })?.content;
      if ((role === "user" || role === "assistant") && typeof content === "string") {
        turns.push({ role, content: content.slice(0, MAX_HISTORY_ITEM_LENGTH) });
      }
    }

    // 🔎 Récupération. La question précédente du visiteur est jointe à la
    // requête : « et le Premium ? » ne veut rien dire toute seule, et c'est
    // exactement la forme que prend une deuxième question.
    const previousQuestion = turns.filter((t) => t.role === "user").at(-1)?.content ?? "";
    const query = `${previousQuestion} ${message}`.trim();
    const candidates = search(query, locale, RAG_CANDIDATES).filter((h) => h.score >= RAG_MIN_SCORE);
    const ranked = await rerank(query, locale, candidates);
    // Deux listes, deux usages : `relevant` garde l'ordre de pertinence et
    // sert à choisir les liens ; `chunks` y ajoute les paliers manquants et
    // part dans le prompt.
    const relevant = ranked.slice(0, RAG_TOP_K).map((h) => h.chunk);
    const chunks = withPackCoherence(relevant, locale, query);
    const links = linksFor(relevant, locale);

    // 💬 La meilleure réponse est parfois déjà écrite. Voir la constante
    // `FAQ_DIRECT_MAX_RUNNER_UP` : question de premier tour, courte, tombant
    // franchement sur une entrée de la FAQ → on sert ce texte, tel quel.
    const best = ranked[0];
    // Le visiteur a nommé son métier ⇒ c'est une conversation de vente, pas
    // une consultation de FAQ. Observé : « J'ai un petit café à Đống Đa »
    // renvoyait le paragraphe « qui est Neuraweb » — une occasion perdue.
    const sellingContext = ranked.some((h) => h.chunk.topic === "metier");
    if (
      process.env.CHAT_FAQ_DIRECT !== "0" &&
      firstTurn &&
      best?.chunk.topic === "faq" &&
      best.chunk.direct !== false &&
      !sellingContext &&
      message.length <= FAQ_DIRECT_MAX_QUESTION_LENGTH &&
      (ranked[1]?.score ?? 0) <= FAQ_DIRECT_MAX_RUNNER_UP
    ) {
      return reply(best.chunk.body, "faq", {
        sources: [best.chunk.id],
        links,
      });
    }

    const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
      { role: "system", content: buildSystemPrompt(locale, chunks) },
      ...turns,
      { role: "user", content: message },
    ];

    const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: AI_MODEL,
        messages,
        max_tokens: MAX_TOKENS,
        temperature: 0.4,
        stream: false,
      }),
      signal: AbortSignal.timeout(20_000),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.error("[chat] Mistral", response.status, detail);
      // 429 en amont = quota du palier gratuit atteint, pas une panne : le
      // visiteur doit lire « indisponible pour le moment », pas « erreur ».
      if (response.status === 429) {
        const wait = noteSaturation(response.headers.get("retry-after"));
        return NextResponse.json(
          { error: t.saturated.replace("{time}", String(wait)), retryAfter: wait },
          { status: 503, headers: { "Retry-After": String(wait) } },
        );
      }
      return NextResponse.json({ error: t.apiError }, { status: 502 });
    }

    const completion = await response.json();
    const raw: string = completion?.choices?.[0]?.message?.content?.trim() || t.defaultResponse;

    // 🛡️ Marqueur [HS] : le modèle signale un message sans rapport. On le retire
    // de la réponse et on compte un strike par IP — au 3e, réponses statiques.
    let content = raw;
    if (OFF_TOPIC_MARKER.test(raw)) {
      content = raw.replace(OFF_TOPIC_MARKER, "");
      const strikes = registerOffTopicStrike(ip);
      if (strikes === OFF_TOPIC_MAX_STRIKES) {
        reportSecurityEvent({
          ip, sessionId, lang: locale,
          eventType: "off_topic", severity: "high",
          userMessage: message,
          details: `${strikes} messages hors-sujet en moins de 15 min — passage en réponses statiques`,
        });
      }
    }

    let answer = scrubResponse(content, t.contactHint);
    let intent: ChatIntent = "normal";
    const sources = chunks.map((c) => c.id);

    // 🛡️ Dernier filet : si la réponse nomme un prestataire tiers, on sert
    // l'extrait le mieux classé à la place. Le texte écrit à la main est de
    // toute façon la meilleure réponse à ce genre de question — c'est
    // exactement ce que le modèle aurait dû reformuler.
    const provider = namesForbiddenProvider(answer);
    if (provider && chunks[0]) {
      console.warn(`[chat] réponse remplacée : elle nommait « ${provider} »`);
      answer = chunks[0].body;
      intent = "faq";
    }
    // 🛡️ Montants : le chatbot renvoie vers la page des tarifs au lieu de citer un prix.
    // Tout montant qui ne figure pas dans les extraits de CE tour vient du modèle (sa
    // mémoire, son imagination) : la réponse est remplacée par le renvoi.
    const invented = amountsNotIn(answer, chunks.map((c) => `${c.title}\n${c.body}`).join("\n"));
    if (invented.length) {
      console.warn(`[chat] réponse remplacée : montant(s) absent(s) des extraits (${invented.join(", ")})`);
      answer = t.priceRedirect;
      intent = "faq";
    }
    // Le cache ne retient que les premiers tours : au-delà, la réponse dépend
    // de ce qui précède et ne se réutilise pas. Un hors-sujet n'est pas gardé.
    if (firstTurn && !OFF_TOPIC_MARKER.test(raw)) setCached(message, locale, answer, sources);

    // Les liens sont construits ici, pas écrits par le modèle : voir
    // `lib/chat/links.ts`. C'est ce qui rend le comportement identique dans
    // les trois langues.
    return reply(answer, intent, { sources, links: withPricingLink(links, answer, locale) });
  } catch (error) {
    // `AbortSignal.timeout` remonte ici comme une TimeoutError : même traitement.
    console.error("[chat] erreur:", error);
    return NextResponse.json({ error: T[locale].apiError }, { status: 500 });
  }
}

/** Le widget n'interroge que POST ; tout le reste est explicitement fermé. */
export function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
