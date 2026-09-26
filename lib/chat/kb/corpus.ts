/**
 * Le corpus du RAG : la base de connaissances découpée en extraits autonomes.
 *
 * D'où vient chaque extrait :
 *   - le registre (`lib/registry`) pour les packs, options, non-inclus,
 *     modifications, métiers, démos et déroulé — la source de vérité ;
 *   - `qua-tang/data.ts` pour l'opération « Mỗi tuần một trang », c'est-à-dire
 *     exactement ce qui est publié sur la page ;
 *   - `kb/faq.ts` pour ce qu'aucun des deux ne dit.
 *
 * Rien n'est recopié : changer un prix dans `packs.ts` change le corpus, donc
 * ce que le chatbot récupère, donc ce qu'il répond.
 *
 * ⚠️ Ne JAMAIS ajouter ici `PLAN-PACKS-VIETNAM.md` ni `OFFRE-JEU-FACEBOOK.md` :
 * ces documents contiennent l'économie de l'offre, les KPI, les planchers de
 * négociation et les réponses aux objections. Ce corpus est lu par des
 * prospects, à travers les réponses du chatbot.
 */

import {
  DEMOS,
  FEATURES,
  FEATURE_GROUP_LABELS,
  MODIFICATIONS_NOTE,
  MODIFICATIONS_SCOPE,
  NOT_INCLUDED,
  NOT_INCLUDED_TITLE,
  OPTIONS,
  PACKS,
  PLANNED_VERTICALS,
  SERVICES,
  PROCESS,
  VERTICALS,
  approxUsd,
  featuresForVertical,
  formatVnd,
  tr,
  type FeatureValue,
  type L10n,
  type Locale,
  type Pack,
  type PackId,
} from "@/lib/registry";
import {
  CRITERIA,
  EXCLUSIONS,
  GATE,
  GIFTS,
  RULES,
  SERVICE_FEE_ITEMS,
  WEEKS,
} from "@/app/[locale]/(vitrine)/qua-tang/data";
import { agency } from "@/app/[locale]/(vitrine)/showcase.config";
import { UI } from "@/app/[locale]/(vitrine)/lib/ui";
import { FAQ } from "./faq";
import { SELLING } from "./selling";
import { TECH } from "./tech";
import type { Chunk } from "./types";

/** Préfixe d'URL de la vitrine : VI est servi sans préfixe (voir `proxy.ts`). */
function path(p: string, locale: Locale): string {
  if (locale === "vi") return p;
  return p === "/" ? `/${locale}` : `/${locale}${p}`;
}

function money(n: number): string {
  return `${formatVnd(n)} (${approxUsd(n)})`;
}

/**
 * Le tarif horaire des modifications (« 500.000₫/heure ») est un prix de Neuraweb : la page
 * des tarifs, pas le chatbot. On garde le sens — facturé à l'heure sans entretien — et on
 * retire le montant.
 */
const HOURLY_RATE: Record<Locale, [RegExp, string]> = {
  vi: [/\d[\d.,]*₫\/giờ/g, "tính phí theo giờ"],
  en: [/\d[\d.,]*₫\/hour started/g, "billed by the hour started"],
  fr: [/\d[\d.,]*₫\/heure entamée/g, "facturées à l'heure entamée"],
};

function featureText(value: FeatureValue, locale: Locale): string | null {
  if (value === false) return null;
  if (value === true) return { vi: "Có", en: "Included", fr: "Inclus" }[locale];
  const [pattern, replacement] = HOURLY_RATE[locale];
  return tr(value, locale).replace(pattern, replacement);
}

/**
 * Deux règles du jeu Facebook portent des montants (la valeur du site offert, les frais de
 * mise en service). Le règlement complet, lui, est sur `/qua-tang` : le chatbot dit ce qui
 * est offert et ce qui est à la charge du gagnant, et renvoie vers la page pour les chiffres.
 */
function giftRuleText(rule: { title: L10n; body: L10n }, locale: Locale): string | null {
  const p = path("/qua-tang", locale);
  switch (rule.title.vi) {
    case "Phần được tặng":
      return {
        vi: `Thiết kế và lập trình một trang web, đúng phạm vi công bố ở trên, bàn giao trong 7 ngày kể từ khi nhận đủ nội dung. Giá trị của phần được tặng: xem trang ${p}, KHÔNG nêu số tiền.`,
        en: `The design and build of a website matching the scope published above, delivered within 7 days of receiving all content. Value of what is given: see the ${p} page, do NOT state any amount.`,
        fr: `La conception et le développement d'une page conforme au périmètre publié ci-dessus, livrée sous 7 jours à compter de la réception de l'intégralité du contenu. Valeur de ce qui est offert : voir la page ${p}, n'écris AUCUN montant.`,
      }[locale];
    case "Phần tự trả":
      return {
        vi: `Phí mở dịch vụ, trả một lần trước khi lên sóng, và tên miền do anh/chị tự mua, đứng tên anh/chị. Neuraweb không cầm tiền tên miền. Số tiền phí mở dịch vụ: xem trang ${p}, KHÔNG nêu số tiền.`,
        en: `The setup fee, paid once before launch, and the domain name, bought by you, in your name. Neuraweb never handles the domain payment. Amount of the setup fee: see the ${p} page, do NOT state any amount.`,
        fr: `Les frais de mise en service, payés une seule fois avant la mise en ligne, et le nom de domaine acheté par vous, à votre nom. Neuraweb n'encaisse jamais le prix du domaine. Montant des frais de mise en service : voir la page ${p}, n'écris AUCUN montant.`,
      }[locale];
    default:
      return null;
  }
}

const L = {
  vi: {
    packTitle: (n: string) => `Gói ${n} — giá và nội dung`,
    pricePage: (p: string) => `Giá: xem trang ${p}. KHÔNG nêu số tiền trong câu trả lời, chỉ dẫn khách tới trang này.`,
    twoWays: "Hai cách mua: A. trả một lần; B. gói có bảo trì hằng tháng. Chọn A hoặc B, không cộng hai phương án lại với nhau.",
    quotePage: (p: string) => `Theo yêu cầu (dự án riêng, làm việc trực tiếp với Neuraweb). Giá: xem trang ${p}. KHÔNG nêu số tiền.`,
    optionsPricePage: (p: string) => `Giá của từng tùy chọn: xem trang ${p}. KHÔNG nêu số tiền trong câu trả lời.`,
    deployPricePage: (p: string) => `Số tiền phí triển khai: xem trang ${p}. KHÔNG nêu số tiền trong câu trả lời.`,
    lead: "Thời gian giao",
    notIn: "KHÔNG có trong gói này",
    optionsTitle: "Các tùy chọn trả thêm",
    optionsIntro:
      "Tùy chọn là khoản trả thêm ngoài giá gói, không có sẵn trong gói trừ khi ghi rõ.",
    includedIn: "đã bao gồm trong Cao Cấp và Doanh Nghiệp",
    modifTitle: "Sửa đổi sau khi bàn giao",
    inScope: "Trong phạm vi",
    outScope: "Ngoài phạm vi, tính phí riêng",
    byPack: "Theo từng gói",
    tradeTitle: (n: string) => `Ngành ${n} — gói và bản demo`,
    packsFor: "Các gói bán cho ngành này",
    specific: "Tính năng riêng của ngành",
    demos: "Bản demo hoạt động thật",
    page: "Trang",
    processTitle: "Quy trình làm việc",
    agencyTitle: "Neuraweb — studio thiết kế web tại Hà Nội",
    agencyBody: (a: string, c: string) =>
      `${a} là một studio thiết kế web nhỏ tại ${c}, do Nacer sáng lập và điều hành — anh Nacer là giám đốc (CEO), và cũng là người trực tiếp làm. Làm website cho quán cà phê, salon, cửa hàng, nhà hàng và homestay ở Hà Nội. Ngôn ngữ làm việc: tiếng Việt, tiếng Anh, tiếng Pháp. Muốn liên hệ, khách bấm nút nhận báo giá hoặc nút Zalo ngay trên trang.`,
    giftWhat: "Chương trình tặng web — phần được tặng",
    giftHow: "Chương trình tặng web — cách tham gia và cách chọn",
    giftTerms: "Chương trình tặng web — hai khoản tự trả và phần chưa có",
    giftRules: "Chương trình tặng web — thể lệ đầy đủ",
    giftCal: "Chương trình tặng web — lịch 8 tuần",
    giftGate: "Điều kiện bắt buộc để được xét",
    giftRank: "Các hồ sơ hợp lệ được xếp hạng theo",
    giftPaid: "Cơ sở được chọn tự trả",
    giftFee: (p: string) => `Phí mở dịch vụ (số tiền: xem trang ${p}), trả một lần, gồm`,
    paidOptionPage: (p: string) => `tùy chọn trả thêm — giá xem trang ${p}`,
    giftDomain: "Tên miền (~300.000₫/năm) do anh/chị tự mua, đứng tên anh/chị.",
    giftNotFree: "LƯU Ý: chương trình KHÔNG hoàn toàn miễn phí. Cơ sở được chọn tự trả phí mở dịch vụ (một lần) và tự mua tên miền. KHÔNG bao giờ nói là không mất chi phí nào.",
    giftExcl: "Trang tặng CHƯA có (thuộc các gói trả phí)",
    week: "Tuần",
    sellPromise: "Được gì",
    sellOver: "Hơn gói dưới ở chỗ",
    sellFor: "Hợp với ai",
    sellCeiling: "Gói này KHÔNG làm được",
    ladderTitle: "Vì sao nên lên gói trên — phép tính tự nó nói",
    serviceTitle: (n: string) => `${n} — tính phí sau khi trao đổi`,
    serviceLead: "Thời gian",
    serviceQuote: "Giá chính xác chốt sau một buổi trao đổi 15 phút — tùy phạm vi công việc.",
    serviceFor: "Hợp với ai",
    serviceTiers: "Các gói theo quy mô",
    serviceFaq: "Câu hỏi thường gặp",
    serviceCases: "Tình huống điển hình (không phải lời chứng thực của khách)",
    faqTitle: (q: string) => q,
  },
  en: {
    packTitle: (n: string) => `${n} pack — price and contents`,
    pricePage: (p: string) => `Price: see the ${p} page. Do NOT state any amount in the reply, point the visitor to that page.`,
    twoWays: "Two ways to buy: A. pay once; B. a plan with monthly upkeep. Choose A or B, never add both.",
    quotePage: (p: string) => `On quotation (a bespoke project, worked on directly with Neuraweb). Price: see the ${p} page. Do NOT state any amount.`,
    optionsPricePage: (p: string) => `Price of each option: see the ${p} page. Do NOT state any amount in the reply.`,
    deployPricePage: (p: string) => `Amount of the deployment fee: see the ${p} page. Do NOT state any amount in the reply.`,
    lead: "Lead time",
    notIn: "NOT in this pack",
    optionsTitle: "Paid add-on options",
    optionsIntro: "An option is paid on top of the pack price and is never included unless stated.",
    includedIn: "already included in Cao Cấp and Doanh Nghiệp",
    modifTitle: "Changes after delivery",
    inScope: "In scope",
    outScope: "Out of scope, billed separately",
    byPack: "By pack",
    tradeTitle: (n: string) => `${n} — packs and demos`,
    packsFor: "Packs sold for this trade",
    specific: "Trade-specific features",
    demos: "Working demos",
    page: "Page",
    processTitle: "How a project runs",
    agencyTitle: "Neuraweb — a web studio in Hà Nội",
    agencyBody: (a: string, c: string) =>
      `${a} is a small web studio in ${c}, founded and run by Nacer, its CEO — who also builds the sites himself. It builds websites for cafés, salons, shops, restaurants and homestays in Hanoi. Working languages: Vietnamese, English, French. To get in touch, visitors use the quote button or the Zalo button on the page.`,
    giftWhat: "Free-website programme — what is given",
    giftHow: "Free-website programme — how to enter and how the pick is made",
    giftTerms: "Free-website programme — the two costs you cover, and what is not included",
    giftRules: "Free-website programme — full terms",
    giftCal: "Free-website programme — the 8-week calendar",
    giftGate: "Requirement before any ranking",
    giftRank: "Valid entries are then ranked on",
    giftPaid: "The chosen business pays",
    giftFee: (p: string) => `Setup fee (amount: see the ${p} page), paid once, covering`,
    paidOptionPage: (p: string) => `paid option — price on the ${p} page`,
    giftDomain: "The domain name (~300,000₫/year) is bought by you, in your name.",
    giftNotFree: "NOTE: the programme is NOT entirely free. The chosen business pays a one-off setup fee and buys its own domain name. NEVER say there is no cost at all.",
    giftExcl: "The free page does NOT include (these belong to the paid packs)",
    week: "Week",
    sellPromise: "What it changes",
    sellOver: "What it adds over the tier below",
    sellFor: "Who it is for",
    sellCeiling: "What this tier does NOT do",
    ladderTitle: "Why the tier above — the arithmetic says it",
    serviceTitle: (n: string) => `${n} — quoted after a scoping call`,
    serviceLead: "Lead time",
    serviceQuote: "The exact figure is set after a 15-minute call — it depends on the scope.",
    serviceFor: "Who it is for",
    serviceTiers: "Tiers by scope",
    serviceFaq: "Frequently asked questions",
    serviceCases: "Typical situations (not customer testimonials)",
    faqTitle: (q: string) => q,
  },
  fr: {
    packTitle: (n: string) => `Pack ${n} — prix et contenu`,
    pricePage: (p: string) => `Prix : voir la page ${p}. N'écris AUCUN montant dans la réponse, renvoie le visiteur vers cette page.`,
    twoWays: "Deux façons d'acheter : A. payer une fois ; B. un forfait avec entretien mensuel. Choisir A ou B, ne jamais additionner les deux.",
    quotePage: (p: string) => `Sur devis (projet sur mesure, travaillé directement avec Neuraweb). Prix : voir la page ${p}. N'écris AUCUN montant.`,
    optionsPricePage: (p: string) => `Prix de chaque option : voir la page ${p}. N'écris AUCUN montant dans la réponse.`,
    deployPricePage: (p: string) => `Montant des frais de déploiement : voir la page ${p}. N'écris AUCUN montant dans la réponse.`,
    lead: "Délai de livraison",
    notIn: "PAS dans ce pack",
    optionsTitle: "Options en supplément",
    optionsIntro:
      "Une option se paie en plus du prix du pack et n'y est jamais incluse, sauf mention contraire.",
    includedIn: "déjà inclus dans Cao Cấp et Doanh Nghiệp",
    modifTitle: "Modifications après livraison",
    inScope: "Dans le périmètre",
    outScope: "Hors périmètre, facturé à part",
    byPack: "Par palier",
    tradeTitle: (n: string) => `${n} — paliers et démos`,
    packsFor: "Paliers vendus pour ce métier",
    specific: "Fonctionnalités propres au métier",
    demos: "Démos qui fonctionnent réellement",
    page: "Page",
    processTitle: "Déroulé d'un projet",
    agencyTitle: "Neuraweb — studio web à Hanoï",
    agencyBody: (a: string, c: string) =>
      `${a} est un petit studio web à ${c}, fondé et dirigé par Nacer, son CEO — qui réalise aussi les sites lui-même. Il réalise des sites pour les cafés, salons, boutiques, restaurants et homestays de Hanoï. Langues de travail : vietnamien, anglais, français. Pour le contact, les visiteurs utilisent le bouton de devis ou le bouton Zalo de la page.`,
    giftWhat: "Opération « un site par semaine » — ce qui est offert",
    giftHow: "Opération « un site par semaine » — participation et sélection",
    giftTerms: "Opération « un site par semaine » — les deux postes à votre charge et ce qui n'y est pas",
    giftRules: "Opération « un site par semaine » — règlement complet",
    giftCal: "Opération « un site par semaine » — calendrier des 8 semaines",
    giftGate: "Prérequis avant tout classement",
    giftRank: "Les candidatures valides sont ensuite classées sur",
    giftPaid: "L'établissement choisi règle",
    giftFee: (p: string) => `Frais de mise en service (montant : voir la page ${p}), payés une seule fois, comprenant`,
    paidOptionPage: (p: string) => `option payante — prix sur la page ${p}`,
    giftDomain: "Le nom de domaine (~300.000₫/an) est acheté par vous, à votre nom.",
    giftNotFree: "ATTENTION : l'opération n'est PAS entièrement gratuite. L'établissement choisi règle des frais de mise en service (une seule fois) et achète son nom de domaine. Ne dis JAMAIS qu'il n'y a aucun frais.",
    giftExcl: "La page offerte NE comprend PAS (ces éléments relèvent des packs payants)",
    week: "Semaine",
    sellPromise: "Ce que ça change",
    sellOver: "Ce que ça ajoute au palier du dessous",
    sellFor: "Pour qui",
    sellCeiling: "Ce que ce palier NE fait PAS",
    ladderTitle: "Pourquoi monter d'un palier — le calcul le dit tout seul",
    serviceTitle: (n: string) => `${n} — chiffré après un échange`,
    serviceLead: "Délai",
    serviceQuote: "Le montant exact se fixe après un échange de 15 minutes — il dépend du périmètre.",
    serviceFor: "Pour qui",
    serviceTiers: "Formules selon l'ampleur",
    serviceFaq: "Questions fréquentes",
    serviceCases: "Situations types (pas des témoignages de clients)",
    faqTitle: (q: string) => q,
  },
} as const;

// ────────────────────────────────────────────────────────────
// Packs
// ────────────────────────────────────────────────────────────

/**
 * Les noms par lesquels un visiteur DÉSIGNE un palier, en vietnamien comme en
 * nom commercial. Volontairement restreint aux noms propres : ni « pro », ni
 * « gói », ni « moins cher », qui apparaissent dans trop de questions sans
 * qu'il s'agisse de comparer des paliers.
 *
 * Sert à `withPackCoherence` : dès qu'une question nomme un palier, les quatre
 * entrent dans le prompt, sinon le modèle compare avec ce qu'il a sous la main.
 */
export const PACK_NAMES = [
  "khoi dau", "starter",
  "phat trien", "business",
  "cao cap", "premium",
  "doanh nghiep", "enterprise", "entreprise",
];

/** Les alias commerciaux d'un palier, toutes langues : « premium » → Cao Cấp. */
const PACK_ALIASES: Record<string, string[]> = {
  "khoi-dau": ["khoi dau", "starter", "basique", "basic", "co ban", "pack 1", "re nhat", "moins cher"],
  "phat-trien": ["phat trien", "business", "pro", "trung binh", "pack 2"],
  "cao-cap": ["cao cap", "premium", "luxe", "e-commerce", "ecommerce", "ban hang", "pack 3"],
  "doanh-nghiep": ["doanh nghiep", "enterprise", "entreprise", "chuoi", "franchise", "multi", "pack 4"],
};

/**
 * Le prix d'un pack N'EST PAS dans le chatbot : il renvoie vers la page. Un petit modèle
 * recopiait mal les montants (« 19,9 M₫ par mois » pour un prix payé une fois), en
 * inventait, et contredisait la page dès qu'un prix changeait. La page est toujours
 * juste — elle lit le même registre — et ne se trompe pas de phrase.
 */
function packPrice(pack: Pack, locale: Locale): string[] {
  const l = L[locale];
  const packs = path("/packs", locale);
  if (pack.price === null) return [l.quotePage(packs)];
  const lines = [l.pricePage(packs)];
  if (pack.priceWithMaintenance !== null && pack.monthly !== null) lines.push(l.twoWays);
  return lines;
}

function packChunk(pack: Pack, locale: Locale): Chunk {
  const l = L[locale];
  const name = tr(pack.gridName, locale);

  // « Prise de rendez-vous — Inclus » : le « — Inclus » ne dit rien que la
  // présence dans la liste ne dise déjà. On ne garde la valeur que lorsqu'elle
  // précise quelque chose (« 8 pages + espace client », « jusqu'à 60 photos »).
  // Sur quatre fiches injectées ensemble, ça retire un millier de caractères
  // de prompt à chaque message sans retirer une seule information.
  const plainYes = { vi: "Có", en: "Included", fr: "Inclus" }[locale];
  const included: string[] = [];
  for (const [group, label] of Object.entries(FEATURE_GROUP_LABELS)) {
    const rows = FEATURES.filter((f) => f.group === group)
      .map((f) => {
        const value = featureText(f.values[pack.id], locale);
        if (!value) return null;
        return value === plainYes ? tr(f.label, locale) : `${tr(f.label, locale)} — ${value}`;
      })
      .filter(Boolean);
    if (rows.length) included.push(`${tr(label, locale)} : ${rows.join(" · ")}`);
  }

  const excluded = FEATURES.filter((f) => f.values[pack.id] === false)
    .map((f) => tr(f.label, locale))
    .join(" · ");

  // L'argumentaire voyage AVEC les faits du palier, il n'est pas un extrait
  // séparé : quand `withPackCoherence` fait entrer les quatre paliers, les
  // quatre arguments entrent avec eux. Un prix sans son bénéfice, c'est une
  // ligne de catalogue ; le visiteur choisit alors le moins cher par défaut.
  const sell = SELLING[pack.id];
  const previous = PACKS[PACKS.findIndex((p) => p.id === pack.id) - 1];

  return {
    id: `pack:${pack.id}`,
    topic: "pack",
    locale,
    title: l.packTitle(name),
    body: [
      tr(pack.pitch, locale),
      `▶ ${l.sellPromise} : ${tr(sell.promise, locale)}`,
      sell.over && previous
        ? `▶ ${l.sellOver} (${tr(previous.gridName, locale)}) : ${tr(sell.over, locale)}`
        : "",
      `▶ ${l.sellFor} : ${tr(sell.forWhom, locale)}`,
      ...packPrice(pack, locale),
      `${l.lead} : ${tr(pack.leadTime, locale)}`,
      ...included,
      excluded ? `⛔ ${l.notIn} : ${excluded}` : "",
      sell.ceiling ? `⛔ ${l.sellCeiling} : ${tr(sell.ceiling, locale)}` : "",
    ]
      .filter(Boolean)
      .join("\n"),
    keywords: [...(PACK_ALIASES[pack.id] ?? []), tr(pack.tierName, locale)],
    boost: 1.4,
  };
}

// ────────────────────────────────────────────────────────────
// Corpus
// ────────────────────────────────────────────────────────────

function buildChunks(locale: Locale): Chunk[] {
  const l = L[locale];
  const chunks: Chunk[] = [];

  chunks.push({
    id: "agence",
    topic: "agence",
    locale,
    title: l.agencyTitle,
    body: l.agencyBody(agency.name, agency.city),
    keywords: [
      "neuraweb", "nacer", "hanoi", "ha noi", "studio", "agence", "agency",
      "ceo", "giam doc", "dieu hanh", "nguoi sang lap", "chu", "dirigeant",
      "directeur", "patron", "fondateur", "founder", "who runs", "boss",
    ],
  });

  for (const pack of PACKS) chunks.push(packChunk(pack, locale));

  chunks.push({
    id: "options",
    topic: "option",
    locale,
    title: l.optionsTitle,
    body: [
      l.optionsIntro,
      ...OPTIONS.map((o) =>
        o.price !== undefined
          ? `· ${tr(o.label, locale)}`
          : `· ${tr(o.label, locale)} (${l.includedIn})`,
      ),
      l.optionsPricePage(path("/packs", locale)),
    ].join("\n"),
    keywords: ["option", "tuy chon", "supplement", "logo", "zalo oa", "ads", "photo", "langue", "ngon ngu"],
    boost: 1.2,
  });

  // ── L'escalier tarifaire ─────────────────────────────────────────────────
  // L'argument de vente le plus fort de la grille, et il était absent du RAG :
  // il vit dans `OFFRE-COMMERCIALE.md`, que le corpus n'indexe pas. Calculé
  // ici depuis le registre plutôt que recopié — si un prix bouge, l'argument
  // reste juste, ou disparaît s'il cesse d'être vrai.
  const espaceGestion = OPTIONS.find((o) => o.id === "espace-gestion");
  const rungs: { lower: PackId; upper: PackId }[] = [
    { lower: "khoi-dau", upper: "phat-trien" },
    { lower: "phat-trien", upper: "cao-cap" },
  ];

  const ladder = rungs
    .map(({ lower, upper }) => {
      const low = PACKS.find((p) => p.id === lower);
      const up = PACKS.find((p) => p.id === upper);
      const option = espaceGestion?.priceByPack?.[lower];
      if (!low?.price || !up?.price || !option) return null;

      const total = low.price + option;
      const gap = up.price - total;
      // L'argument ne tient que si le palier supérieur coûte à peine plus.
      // Au-delà de 10 % d'écart, on se tait plutôt que de forcer le trait.
      // Le calcul reste fait ici, sur le registre ; seuls les MONTANTS n'en sortent plus.
      if (gap <= 0 || gap > up.price * 0.1) return null;

      const optionName = tr(espaceGestion!.label, locale);
      const packs = path("/packs", locale);
      const lowName = tr(low.gridName, locale);
      const upName = tr(up.gridName, locale);
      return {
        vi: `${lowName} cộng tùy chọn « ${optionName} » có giá gần bằng ${upName} — nhưng ${upName} có TOÀN BỘ những gì gói đó có. So sánh và giá: xem trang ${packs}.`,
        en: `${lowName} plus the « ${optionName} » option costs almost the same as ${upName} — but ${upName} gives EVERYTHING that tier contains. Comparison and prices: see the ${packs} page.`,
        fr: `${lowName} plus l'option « ${optionName} » coûte presque autant que ${upName} — mais ${upName} apporte TOUT ce que ce palier contient. Comparaison et prix : voir la page ${packs}.`,
      }[locale];
    })
    .filter(Boolean) as string[];

  if (ladder.length) {
    chunks.push({
      id: "escalier",
      topic: "pack",
      locale,
      title: l.ladderTitle,
      body: [
        ...ladder,
        {
          vi: "Lưu ý cho đúng: Phát Triển vẫn CHƯA bao gồm « Tự sửa nội dung » — phép tính so sánh giá, không phải nội dung. Ngược lại, Cao Cấp thì ĐÃ bao gồm sẵn.",
          en: "One precision, to stay honest: Phát Triển still does NOT include « self-service editing » — the arithmetic compares prices, not contents. Cao Cấp, on the other hand, does include it.",
          fr: "Une précision, pour rester honnête : Phát Triển n'inclut TOUJOURS PAS « l'espace de gestion » — le calcul compare des prix, pas des contenus. Cao Cấp, lui, l'inclut bel et bien.",
        }[locale],
      ].join("\n"),
      keywords: ["escalier", "comparaison", "so sanh gia", "chenh lech", "difference de prix", "upgrade", "len goi", "monter", "vaut mieux", "worth it"],
      boost: 1.2,
    });
  }

  chunks.push({
    id: "non-inclus",
    topic: "non-inclus",
    locale,
    title: tr(NOT_INCLUDED_TITLE, locale),
    body: NOT_INCLUDED.map((item) => {
      // `from` (« à partir de ») est un drapeau d'affichage ajouté au registre
      // après coup. On le lit par `in` plutôt que directement : un déploiement
      // a échoué le 24 sept. 2026 parce que la version du registre poussée sur
      // Vercel ne le déclarait pas encore. Un fanion de présentation ne doit
      // pas pouvoir casser un build.
      const startsFrom = "from" in item && item.from === true;
      const from = startsFrom ? { vi: "từ ", en: "from ", fr: "à partir de " }[locale] : "";
      // L'unité de l'infra porte déjà son équivalent (« /mois (~5 USD) ») :
      // sans ce test, la ligne sortait « 130.000₫ (~$5)/mois (~5 USD) ».
      const unit = tr(item.unit, locale);
      // Le déploiement est un prix de Neuraweb : la page, pas le chatbot. Le domaine et
      // l'infrastructure sont des estimations de fournisseurs tiers : elles restent.
      if (item.id === "deploiement") return `· ${tr(item.label, locale)} — ${tr(item.note, locale)}`;
      const amount = /USD|\$/i.test(unit) ? formatVnd(item.amount) : money(item.amount);
      return `· ${tr(item.label, locale)} — ${from}${amount}${unit} — ${tr(item.note, locale)}`;
    })
      .concat(l.deployPricePage(path("/packs", locale)))
      .join("\n"),
    keywords: ["trien khai", "deploiement", "deployment", "ten mien", "domain", "domaine", "hosting", "ha tang"],
    boost: 1.3,
  });

  const modifByPack = FEATURES.find((f) => f.id === "modifications");
  chunks.push({
    id: "modifications",
    topic: "modifications",
    locale,
    title: l.modifTitle,
    body: [
      `${l.inScope} : ${MODIFICATIONS_SCOPE.included.map((x) => tr(x, locale)).join(" · ")}`,
      `${l.outScope} : ${MODIFICATIONS_SCOPE.excluded.map((x) => tr(x, locale)).join(" · ")}`,
      modifByPack
        ? `${l.byPack} : ${PACKS.map((p) => {
            const value = featureText(modifByPack.values[p.id], locale);
            return value ? `${tr(p.gridName, locale)} — ${value}` : null;
          })
            .filter(Boolean)
            .join(" | ")}`
        : "",
      tr(MODIFICATIONS_NOTE, locale),
    ]
      .filter(Boolean)
      .join("\n"),
    keywords: ["sua doi", "modification", "change", "edit", "entretien", "bao tri", "maintenance"],
    boost: 1.2,
  });

  for (const vertical of VERTICALS) {
    const packNames = vertical.packs
      .map((id) => PACKS.find((p) => p.id === id))
      .filter(Boolean)
      .map((p) => tr(p!.gridName, locale))
      .join(" · ");

    const extras = (featuresForVertical(vertical.id) ?? [])
      .filter((f) => !FEATURES.some((g) => g.id === f.id))
      .map((f) => tr(f.label, locale))
      .join(" · ");

    // Chaque démo avec le chemin de SA page : `/metiers/<métier>/<palier>`,
    // l'écran qui l'affiche en direct. Sans ce chemin, l'assistant nommait
    // « Phin » et « Ngõ Nhỏ » sans pouvoir dire où les voir — et il ne peut
    // pas donner l'adresse brute des démos, qui porte le nom de l'hébergeur.
    const demos = DEMOS.filter((d) => d.vertical === vertical.id && d.status === "live")
      .map((d) => {
        const pack = PACKS.find((p) => p.id === d.pack);
        const label = `${d.businessName} (${pack ? tr(pack.gridName, locale) : d.pack}, ${d.district})`;
        // `Trang : /chemin` plutôt que `→ /chemin`. Mesuré : avec la flèche,
        // le modèle vietnamien remplaçait le chemin par un mot — « → Đây »,
        // « → đường dẫn » — ou fabriquait un slug à partir du nom du commerce.
        // La flèche se lit comme un gabarit à remplir ; une étiquette se lit
        // comme une valeur à recopier.
        return `${label} ${l.page} : ${path(`/metiers/${vertical.slug}/${d.pack}`, locale)}`;
      })
      .join("\n    ");

    chunks.push({
      id: `metier:${vertical.id}`,
      topic: "metier",
      locale,
      title: l.tradeTitle(tr(vertical.name, locale)),
      body: [
        `${vertical.nativeName} — ${tr(vertical.tagline, locale)}`,
        tr(vertical.pitch, locale),
        `${l.packsFor} : ${packNames}`,
        extras ? `${l.specific} : ${extras}` : "",
        demos ? `${l.demos} : ${demos}` : "",
        `${l.page} : ${path(`/metiers/${vertical.slug}`, locale)}`,
      ]
        .filter(Boolean)
        .join("\n"),
      keywords: [vertical.nativeName, vertical.slug, vertical.id],
      // Quand un visiteur nomme son métier, sa page métier passe devant les
      // extraits généraux qui ne font que citer le mot au passage.
      boost: 1.25,
    });
  }

  if (PLANNED_VERTICALS.length) {
    chunks.push({
      id: "metier:a-venir",
      topic: "metier",
      locale,
      title: {
        vi: "Ngành chưa có bản demo",
        en: "Trades without a demo yet",
        fr: "Métiers sans démo pour l'instant",
      }[locale],
      body: [
        {
          vi: "Các ngành sau đã nằm trong kế hoạch nhưng chưa có bản demo. Vẫn nhận làm: cùng bảng giá, bàn bạc cụ thể theo nhu cầu.",
          en: "These trades are planned but have no demo yet. They are still taken on: same price grid, scoped case by case.",
          fr: "Ces métiers sont prévus mais n'ont pas encore de démo. Ils sont tout de même pris : même grille de prix, périmètre discuté au cas par cas.",
        }[locale],
        ...PLANNED_VERTICALS.map((v) => `· ${tr(v.name, locale)} (${v.nativeName}) — ${tr(v.note, locale)}`),
      ].join("\n"),
      keywords: PLANNED_VERTICALS.flatMap((v) => [v.id, v.nativeName]),
    });
  }

  chunks.push({
    id: "process",
    topic: "process",
    locale,
    title: l.processTitle,
    body: PROCESS.map((s) => `${s.step}. ${tr(s.label, locale)}`).join("\n"),
    keywords: ["quy trinh", "process", "deroule", "etapes", "how it works", "dat coc", "acompte"],
  });

  // ── Opération « Mỗi tuần một trang » ──────────────────────────────────────
  chunks.push({
    id: "jeu:offert",
    topic: "jeu",
    locale,
    title: l.giftWhat,
    body: [l.giftNotFree, ...GIFTS.map((g) => `· ${tr(g.title, locale)} — ${tr(g.body, locale)}`)].join("\n"),
    keywords: ["tang", "mien phi", "free", "gratuit", "offert", "qua tang", "jeu", "giveaway"],
    boost: 1.2,
  });

  chunks.push({
    id: "jeu:participer",
    topic: "jeu",
    locale,
    title: l.giftHow,
    body: [
      // Les deux gestes et le format du commentaire viennent des textes de la
      // page, pas d'une reformulation : sans eux, le modèle inventait un
      // gabarit de commentaire de toutes pièces.
      `1. ${UI[locale].giftStep1}`,
      `2. ${UI[locale].giftStep2} : ${UI[locale].giftCommentExample}`,
      UI[locale].giftNominateNote ?? "",
      UI[locale].giftNoShare ?? "",
      UI[locale].giftRun ?? "",
      `${l.giftGate} : ${tr(GATE.label, locale)}`,
      `${l.giftRank} : ${CRITERIA.map((c) => `${tr(c.label, locale)} (${c.weight} %)`).join(" · ")}`,
      RULES.filter((r) => ["Cách tham gia", "Ai được tham gia", "Cách chọn"].includes(r.title.vi))
        .map((r) => `${tr(r.title, locale)} : ${tr(r.body, locale)}`)
        .join("\n"),
    ]
      .filter(Boolean)
      .join("\n"),
    keywords: ["tham gia", "binh luan", "comment", "participer", "enter", "tieu chi", "criteres", "chon", "mau binh luan", "format"],
    boost: 1.2,
  });

  chunks.push({
    id: "jeu:conditions",
    topic: "jeu",
    locale,
    title: l.giftTerms,
    body: [
      l.giftNotFree,
      `${l.giftPaid} :`,
      `${l.giftFee(path("/qua-tang", locale))} : ${SERVICE_FEE_ITEMS.map((i) => tr(i, locale)).join(" · ")}`,
      l.giftDomain,
      `${l.giftExcl} : ${EXCLUSIONS.map((e) => {
        // « +1.500.000₫ », « +6.900.000₫ » : des prix d'options, donc la page des tarifs.
        const where =
          "pack" in e.where
            ? tr(e.where.pack.gridName, locale)
            : /\d/.test(e.where.text)
              ? l.paidOptionPage(path("/packs", locale))
              : e.where.text;
        return `${tr(e.what, locale)} (→ ${where})`;
      }).join(" · ")}`,
    ].join("\n"),
    keywords: ["phi mo dich vu", "50 usd", "service fee", "mise en service", "exclusions"],
  });

  chunks.push({
    id: "jeu:reglement",
    topic: "jeu",
    locale,
    title: l.giftRules,
    body: RULES.map((r) => `${tr(r.title, locale)} : ${giftRuleText(r, locale) ?? tr(r.body, locale)}`).join("\n"),
    keywords: ["the le", "reglement", "rules", "terms", "facebook", "meta", "du lieu", "donnees"],
  });

  chunks.push({
    id: "jeu:calendrier",
    topic: "jeu",
    locale,
    title: l.giftCal,
    body: WEEKS.map((w) => `${l.week} ${w.n} — ${w.date} — ${tr(w.theme, locale)}`).join("\n"),
    keywords: ["lich", "calendrier", "calendar", "tuan", "semaine", "week", "khi nao"],
  });

  // ── Technique ─────────────────────────────────────────────────────────────
  // Un extrait par fait plutôt qu'un gros bloc : « c'est du WordPress ? » et
  // « où sont mes données ? » n'appellent pas la même réponse, et un extrait
  // court se sert tel quel, sans appel au modèle.
  for (const fact of TECH) {
    chunks.push({
      id: `tech:${fact.id}`,
      topic: "tech",
      locale,
      title: tr(fact.label, locale),
      body: tr(fact.body, locale),
      keywords: fact.keywords,
      boost: 1.1,
    });
  }

  // ── Prestations chiffrées après échange ───────────────────────────────────
  for (const service of SERVICES) {
    const servicePage = path(`/services/${service.slug}`, locale);

    chunks.push({
      id: `service:${service.id}`,
      topic: "service",
      locale,
      title: l.serviceTitle(tr(service.name, locale)),
      body: [
        tr(service.promise, locale),
        service.bullets.map((b) => `· ${tr(b, locale)}`).join("\n"),
        // Les formules, prix compris : sans elles l'assistant ne connaît que le
        // plancher et ne peut pas répondre à « et pour une app d'équipe ? ».
        `${l.serviceTiers} :\n${service.tiers
          .map((tier) => {
            return `· ${tr(tier.name, locale)} (${tr(tier.scope, locale)}) — ${l.serviceLead} : ${tr(tier.leadTime, locale)}`;
          })
          .join("\n")}`,
        // La FAQ de la page, mot pour mot : sans elle l'assistant contredisait la page
        // (« mon site est sous Wix, on peut y mettre le chatbot ? » — la page dit oui,
        // l'assistant disait non, faute de l'avoir lu).
        `${l.serviceFaq} :\n${service.faq
          .map((item) => `· ${tr(item.q, locale)} — ${tr(item.a, locale)}`)
          .join("\n")}`,
        `${l.serviceFor} : ${tr(service.forWhom, locale)}`,
        // Le « pas pour vous » entre dans l'extrait : c'est lui qui empêche
        // l'assistant de vendre une application à un commerce de passage.
        `⛔ ${tr(service.notForWhom, locale)}`,
        // Les secteurs seuls, pas les récits : assez pour que l'assistant sache
        // que l'offre vaut pour une école ou un exportateur autant que pour un
        // café, sans alourdir chaque extrait de douze phrases.
        `${l.serviceCases} : ${service.cases.map((c) => tr(c.sector, locale)).join(" · ")}`,
        `${l.serviceLead} : ${tr(service.leadTime, locale)}`,
        l.pricePage(servicePage),
        l.serviceQuote,
        `${l.page} : ${path(`/services/${service.slug}`, locale)}`,
      ].join("\n"),
      keywords: [
        service.id,
        ...(service.id === "mobile"
          ? ["ung dung", "app", "android", "google play", "dien thoai", "application", "mobile", "apk", "the tich diem", "fidelite", "loyalty", "dai ly", "nhan vien ban hang", "commerciaux", "sales team", "hoc vien"]
          : service.id === "automatisation"
            ? ["tu dong", "automatisation", "automation", "workflow", "zapier", "n8n", "kiotviet", "sapo", "misa", "bang tinh", "spreadsheet", "google sheets", "lap di lap lai", "bao gia", "devis", "quote", "hoa don", "facture", "invoice", "nhac lich", "rappel", "reminder", "crm", "bao cao", "rapport", "bieu mau", "formulaire"]
            : ["ai", "tri tue nhan tao", "chatbot", "tro ly", "assistant", "intelligence artificielle", "zalo oa", "tu tra loi", "llm", "gpt", "chatbot website", "chatbot site", "site web", "widget", "messenger", "tro ly noi bo", "assistant interne", "internal assistant", "tai lieu", "documents", "cham soc khach hang", "support client", "customer support"]),
      ],
      boost: 1.15,
    });
  }

  // ── FAQ rédigée ───────────────────────────────────────────────────────────
  for (const entry of FAQ) {
    chunks.push({
      id: `faq:${entry.id}`,
      topic: "faq",
      locale,
      title: l.faqTitle(tr(entry.question, locale)),
      body: tr(entry.answer, locale),
      keywords: entry.keywords,
      boost: 1.15,
      ...(entry.direct === false ? { direct: false as const } : {}),
    });
  }

  return chunks;
}

const cache = new Map<Locale, Chunk[]>();

/** Le corpus d'une langue, construit une fois puis mémorisé. */
export function corpus(locale: Locale): Chunk[] {
  let chunks = cache.get(locale);
  if (!chunks) {
    chunks = buildChunks(locale);
    cache.set(locale, chunks);
  }
  return chunks;
}
