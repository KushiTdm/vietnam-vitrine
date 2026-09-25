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
  ENTERPRISE_FLOOR,
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

function featureText(value: FeatureValue, locale: Locale): string | null {
  if (value === false) return null;
  if (value === true) return { vi: "Có", en: "Included", fr: "Inclus" }[locale];
  return tr(value, locale);
}

const L = {
  vi: {
    packTitle: (n: string) => `Gói ${n} — giá và nội dung`,
    once: "Trả một lần, không bảo trì",
    plan: "Kèm bảo trì",
    onDelivery: "trả khi bàn giao, RỒI",
    monthly: "mỗi tháng",
    yearly: "Nếu trả bảo trì cả năm một lần",
    yearlyTail: "cho 12 tháng sử dụng (chỉ tính 10 tháng)",
    exclusive: "Chọn A hoặc B, không cộng hai phương án lại với nhau.",
    quote: (f: string) => `Theo yêu cầu, thường từ ${f}`,
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
    giftFee: "Phí mở dịch vụ 50 USD (~1.300.000₫), trả một lần, gồm",
    giftDomain: "Tên miền (~300.000₫/năm) do anh/chị tự mua, đứng tên anh/chị.",
    giftExcl: "Trang tặng CHƯA có (thuộc các gói trả phí)",
    week: "Tuần",
    sellPromise: "Được gì",
    sellOver: "Hơn gói dưới ở chỗ",
    sellFor: "Hợp với ai",
    sellCeiling: "Gói này KHÔNG làm được",
    ladderTitle: "Vì sao nên lên gói trên — phép tính tự nó nói",
    serviceTitle: (n: string) => `${n} — tính phí sau khi trao đổi`,
    serviceFrom: "Từ",
    serviceMonthly: "phí duy trì hằng tháng",
    serviceLead: "Thời gian",
    serviceQuote: "Giá chính xác chốt sau một buổi trao đổi 15 phút — tùy phạm vi công việc.",
    serviceFor: "Hợp với ai",
    faqTitle: (q: string) => q,
  },
  en: {
    packTitle: (n: string) => `${n} pack — price and contents`,
    once: "One-off payment, no care plan",
    plan: "With the care plan",
    onDelivery: "on delivery, THEN",
    monthly: "every month",
    yearly: "Paying the care plan a year at a time",
    yearlyTail: "for 12 months of service (10 months charged)",
    exclusive: "A or B — never add the two together.",
    quote: (f: string) => `On quotation, usually from ${f}`,
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
    giftFee: "Setup fee of $50 (~1,300,000₫), one-off, covering",
    giftDomain: "The domain name (~300,000₫/year) is bought by you, in your name.",
    giftExcl: "The free page does NOT include (these belong to the paid packs)",
    week: "Week",
    sellPromise: "What it changes",
    sellOver: "What it adds over the tier below",
    sellFor: "Who it is for",
    sellCeiling: "What this tier does NOT do",
    ladderTitle: "Why the tier above — the arithmetic says it",
    serviceTitle: (n: string) => `${n} — quoted after a scoping call`,
    serviceFrom: "From",
    serviceMonthly: "monthly upkeep",
    serviceLead: "Lead time",
    serviceQuote: "The exact figure is set after a 15-minute call — it depends on the scope.",
    serviceFor: "Who it is for",
    faqTitle: (q: string) => q,
  },
  fr: {
    packTitle: (n: string) => `Pack ${n} — prix et contenu`,
    once: "Paiement unique, sans entretien",
    plan: "Avec entretien",
    onDelivery: "à la livraison, PUIS",
    monthly: "chaque mois",
    yearly: "Entretien réglé à l'année",
    yearlyTail: "pour 12 mois de service (10 mois facturés)",
    exclusive: "A ou B — ne jamais additionner les deux.",
    quote: (f: string) => `Sur devis, généralement à partir de ${f}`,
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
    giftFee: "Frais de mise en service de 50 USD (~1.300.000₫), une seule fois, comprenant",
    giftDomain: "Le nom de domaine (~300.000₫/an) est acheté par vous, à votre nom.",
    giftExcl: "La page offerte NE comprend PAS (ces éléments relèvent des packs payants)",
    week: "Semaine",
    sellPromise: "Ce que ça change",
    sellOver: "Ce que ça ajoute au palier du dessous",
    sellFor: "Pour qui",
    sellCeiling: "Ce que ce palier NE fait PAS",
    ladderTitle: "Pourquoi monter d'un palier — le calcul le dit tout seul",
    serviceTitle: (n: string) => `${n} — chiffré après un échange`,
    serviceFrom: "À partir de",
    serviceMonthly: "entretien mensuel",
    serviceLead: "Délai",
    serviceQuote: "Le montant exact se fixe après un échange de 15 minutes — il dépend du périmètre.",
    serviceFor: "Pour qui",
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

function packPrice(pack: Pack, locale: Locale): string[] {
  const l = L[locale];
  if (pack.price === null) return [l.quote(money(ENTERPRISE_FLOOR))];

  const from = pack.from ? { vi: "từ ", en: "from ", fr: "à partir de " }[locale] : "";
  const lines = [`A. ${l.once} : ${from}${money(pack.price)}`];
  if (pack.priceWithMaintenance !== null && pack.monthly !== null) {
    lines.push(
      `B. ${l.plan} : ${from}${money(pack.priceWithMaintenance)} ${l.onDelivery} ${money(pack.monthly)} ${l.monthly}`,
    );
    if (pack.yearlyMaintenance !== null) {
      lines.push(`   ${l.yearly} : ${money(pack.yearlyMaintenance)} ${l.yearlyTail}`);
    }
    lines.push(l.exclusive);
  }
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
      ...OPTIONS.map((o) => {
        const unit = o.unit ? tr(o.unit, locale) : "";
        if (o.price !== undefined) return `· ${tr(o.label, locale)} — ${money(o.price)}${unit}`;
        const byPack = Object.entries(o.priceByPack ?? {})
          .map(([id, amount]) => {
            const pack = PACKS.find((p) => p.id === id);
            return `${pack ? tr(pack.gridName, locale) : id} +${money(amount as number)}`;
          })
          .join(" · ");
        return `· ${tr(o.label, locale)} — ${byPack} (${l.includedIn})`;
      }),
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
      if (gap <= 0 || gap > up.price * 0.1) return null;

      const optionName = tr(espaceGestion!.label, locale);
      const included = tr(up.gridName, locale);
      return {
        vi: `${tr(low.gridName, locale)} (${formatVnd(low.price)}) + tùy chọn « ${optionName} » (${formatVnd(option)}) = ${formatVnd(total)}. Trong khi ${included} có giá ${formatVnd(up.price)} — chỉ hơn ${formatVnd(gap)} — và đổi lại là TOÀN BỘ những gì gói đó có.`,
        en: `${tr(low.gridName, locale)} (${formatVnd(low.price)}) + the « ${optionName} » option (${formatVnd(option)}) = ${formatVnd(total)}. ${included} costs ${formatVnd(up.price)} — just ${formatVnd(gap)} more — and gives EVERYTHING that tier contains instead.`,
        fr: `${tr(low.gridName, locale)} (${formatVnd(low.price)}) + l'option « ${optionName} » (${formatVnd(option)}) = ${formatVnd(total)}. ${included} coûte ${formatVnd(up.price)} — soit ${formatVnd(gap)} de plus — et apporte à la place TOUT ce que ce palier contient.`,
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
      const amount = /USD|\$/i.test(unit) ? formatVnd(item.amount) : money(item.amount);
      return `· ${tr(item.label, locale)} — ${from}${amount}${unit} — ${tr(item.note, locale)}`;
    }).join("\n"),
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
      .map((p) => `${tr(p!.gridName, locale)}${p!.price !== null ? ` (${money(p!.price)})` : ""}`)
      .join(" · ");

    const extras = (featuresForVertical(vertical.id) ?? [])
      .filter((f) => !FEATURES.some((g) => g.id === f.id))
      .map((f) => tr(f.label, locale))
      .join(" · ");

    const demos = DEMOS.filter((d) => d.vertical === vertical.id && d.status === "live")
      .map((d) => {
        const pack = PACKS.find((p) => p.id === d.pack);
        return `${d.businessName} (${pack ? tr(pack.gridName, locale) : d.pack}, ${d.district})`;
      })
      .join(" · ");

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
    body: GIFTS.map((g) => `· ${tr(g.title, locale)} — ${tr(g.body, locale)}`).join("\n"),
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
      `${l.giftPaid} :`,
      `${l.giftFee} : ${SERVICE_FEE_ITEMS.map((i) => tr(i, locale)).join(" · ")}`,
      l.giftDomain,
      `${l.giftExcl} : ${EXCLUSIONS.map((e) => {
        const where = "pack" in e.where ? tr(e.where.pack.gridName, locale) : e.where.text;
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
    body: RULES.map((r) => `${tr(r.title, locale)} : ${tr(r.body, locale)}`).join("\n"),
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
    const price = [
      `${l.serviceFrom} ${money(service.floor)}`,
      service.monthly ? `${money(service.monthly)} ${l.serviceMonthly}` : "",
    ]
      .filter(Boolean)
      .join(" + ");

    chunks.push({
      id: `service:${service.id}`,
      topic: "service",
      locale,
      title: l.serviceTitle(tr(service.name, locale)),
      body: [
        tr(service.promise, locale),
        service.bullets.map((b) => `· ${tr(b, locale)}`).join("\n"),
        `${l.serviceFor} : ${tr(service.forWhom, locale)}`,
        // Le « pas pour vous » entre dans l'extrait : c'est lui qui empêche
        // l'assistant de vendre une application à un commerce de passage.
        `⛔ ${tr(service.notForWhom, locale)}`,
        `${price} · ${l.serviceLead} : ${tr(service.leadTime, locale)}`,
        l.serviceQuote,
      ].join("\n"),
      keywords: [
        service.id,
        ...(service.id === "mobile"
          ? ["ung dung", "app", "android", "google play", "dien thoai", "application", "mobile", "apk"]
          : service.id === "automatisation"
            ? ["tu dong", "automatisation", "automation", "workflow", "zapier", "n8n", "kiotviet", "sapo", "bang tinh", "spreadsheet", "google sheets", "lap di lap lai"]
            : ["ai", "tri tue nhan tao", "chatbot", "tro ly", "assistant", "intelligence artificielle", "zalo oa", "tu tra loi", "llm", "gpt"]),
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
