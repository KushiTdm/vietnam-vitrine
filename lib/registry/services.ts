import type { L10n } from "./types";

/**
 * Les trois prestations de développement, au-delà des paliers de sites :
 * application Android, automatisation, intégration d'IA.
 *
 * Elles vivent ici, dans le registre, et non dans la base de connaissances du
 * chatbot où elles étaient nées : la page `/services/[service]` et le chatbot
 * doivent dire exactement la même chose. Une seule définition, deux lecteurs.
 *
 * Elles ne sont PAS des paliers (`packs.ts`) et n'entrent pas dans la matrice
 * de comparaison : un pack se vend sur catalogue, celles-ci se chiffrent après
 * un échange, comme Doanh Nghiệp. D'où `floor`, un plancher annoncé, et pas un
 * prix ferme.
 *
 * Elles s'adressent à TOUTE activité — école, clinique, exportateur, agence
 * immobilière, distributeur, autant que café ou salon. Les exemples de la page
 * (`cases`) le montrent : un visiteur qui ne se reconnaît ni dans un café ni
 * dans un salon doit pourtant se reconnaître quelque part.
 *
 * Chaque prestation se décline en FORMULES (`tiers`), du plus simple au plus
 * large. Le plancher de la prestation (`floor`, `monthly`) est celui de la
 * première formule : il est dérivé, jamais recopié, pour que la carte d'accueil
 * et la page ne puissent pas diverger.
 *
 * ⚠️ PRIX À VALIDER, mais adossés au marché de Hanoi (relevé de septembre 2026,
 * sources dans le README) :
 *   - application mobile : 35–80 M₫ pour une app simple chez les agences
 *     locales, 60–150 M₫ en standard (sans code source), 150 M₫ et plus dès que
 *     le code source est remis. Nos trois formules — 49,9 / 89,9 / 129,9 M₫ —
 *     remettent toutes le code, et restent sous les 150 M₫ ;
 *   - chatbot sur mesure : 125–375 M₫ au premier niveau, 375–750 M₫ au
 *     deuxième, quand les plateformes SaaS génériques tournent à 150 k₫–2 M₫ par
 *     mois. Entre les deux, rien — c'est le trou qu'occupent nos formules
 *     19,9 / 34,9 / 59,9 M₫, toutes sous le premier prix des agences ;
 *   - automatisation : mise en place de base à 10–30 M₫, déploiement complexe à
 *     20–50 M₫, maintenance à 2–5 M₫ par mois chez les prestataires locaux ;
 *     développeur confirmé à 35–55 USD l'heure. Nos formules : 9,9 / 24,9 /
 *     44,9 M₫, avec un entretien de 0,99 à 2,49 M₫ par mois.
 *
 * L'escalier des planchers, paliers de sites compris :
 * 4,9 (site) → 9,9 (automatisation) → 11,9 (site) → 19,9 (IA) →
 * 24,9 (site) → 49,9 (app) → 60 (Doanh Nghiệp).
 *
 * Les `cases` sont des SITUATIONS TYPES, pas des références clients : personne
 * n'a encore acheté ces prestations à Hanoi, et aucun résultat chiffré n'y est
 * avancé. La page le dit en toutes lettres (`serviceCasesNote`).
 *
 * Le calendrier (`process`) est propre à chaque prestation. Ne jamais y
 * recopier les « 7 jours » des sites : c'est le délai d'un pack, pas celui
 * d'une application ni d'une automatisation. Un test le garde.
 */

export type ServiceId = "mobile" | "automatisation" | "ia";

/** Une formule d'une prestation : de la plus simple à la plus large. */
export type ServiceTier = {
  id: string;
  name: L10n;
  /** Ce que la formule couvre, en une phrase. */
  scope: L10n;
  /** Plancher indicatif en ₫. Le devis se fait après un échange. */
  floor: number;
  monthly?: number;
  leadTime: L10n;
};

/**
 * Un visuel de la page : `/vitrine/<image>.webp`, plus `.mp4` et `.webm` si `video`.
 * Les fichiers vivent dans `public/vitrine/` ; un test vérifie qu'ils existent tous.
 */
export type ServiceVisual = {
  /** Nom de fichier sans extension. */
  image: string;
  alt: L10n;
  /** Boucle vidéo du même nom ; l'image en est le poster. */
  video?: boolean;
  /** Scène générée avec des personnes : la page la légende « illustration ». */
  illustration?: boolean;
  /** `object-position` du recadrage, quand le centre ne suffit pas. */
  focus?: string;
};

/** Une situation type. Ni témoignage ni référence : voir l'en-tête du fichier. */
export type ServiceCase = {
  /** Nom de fichier sans extension. Une nature morte du secteur, jamais un client. */
  image: string;
  /** Le secteur, en quelques mots : c'est ce que l'œil du visiteur cherche. */
  sector: L10n;
  /** Ce qui coince, tel qu'on le vit. */
  situation: L10n;
  /** Ce qu'on met en place, sans promesse chiffrée. */
  built: L10n;
};

/** Une étape du calendrier propre à la prestation. */
export type ServiceStep = {
  /** Vignette facultative, décorative (alt vide). L'étape 3 n'en a pas : elle varie selon la prestation. */
  image?: string;
  title: L10n;
  /** Quand : relatif, car la durée dépend de la formule (« Semaine 1 », etc.). */
  when: L10n;
  detail: L10n;
};

/** Une capture RÉELLE (jamais retouchée, jamais générée) et sa légende. */
export type ServiceProofItem = {
  /** Nom de fichier sans extension. */
  image: string;
  alt: L10n;
  caption: L10n;
};

/** Ce qui prouve que le produit existe : des captures, pas des images inventées. */
export type ServiceProof = {
  /** La mention d'honnêteté affichée sous les captures. */
  note: L10n;
  items: ServiceProofItem[];
};

export type Service = {
  id: ServiceId;
  /** Slug d'URL, en vietnamien comme ceux des métiers. */
  slug: string;
  name: L10n;
  /** Sous-titre du héros, une ligne. */
  tagline: L10n;
  /** Ce que ça change, en une phrase. */
  promise: L10n;
  /** Les douleurs que le visiteur reconnaît avant d'entendre parler d'outils. */
  problems: L10n[];
  /** Ce qu'on livre concrètement, avec les outils d'ici. */
  bullets: L10n[];
  forWhom: L10n;
  /** Dire à qui ce n'est PAS destiné : c'est ce qui rend le reste crédible. */
  notForWhom: L10n;
  faq: { q: L10n; a: L10n }[];
  /** Du plus simple au plus large. Le premier fixe le plancher annoncé. */
  tiers: ServiceTier[];
  /** Plancher de la prestation : celui de la première formule. */
  floor: number;
  monthly?: number;
  /** La fourchette d'ensemble ; chaque formule porte son propre délai. */
  leadTime: L10n;
  /** Quelques situations types, dans des secteurs volontairement variés. */
  cases: ServiceCase[];
  /** Le calendrier de la prestation, quatre étapes. */
  process: ServiceStep[];
  /** Vignette de la carte d'accueil, décorative (alt vide). Nom de fichier sans extension. */
  card: string;
  hero: ServiceVisual;
  /** Second visuel : au-dessus des problèmes, ou à côté de ce qu'on livre. */
  banner: ServiceVisual & { at: "problems" | "deliverables" };
  /** Captures réelles, quand le produit existe et se montre : aujourd'hui, seul l'assistant IA. */
  proof?: ServiceProof;
  accent: string;
  icon: string;
};

/** Les trois vignettes du calendrier, communes aux trois prestations. */
const STEP_IMAGE = {
  call: "svc-etape-rdv",
  quote: "svc-etape-devis",
  handover: "svc-etape-prise-en-main",
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Application Android
// ─────────────────────────────────────────────────────────────────────────────

const MOBILE_TIERS: ServiceTier[] = [
  {
    id: "client",
    name: {
      vi: "Ứng dụng khách hàng",
      en: "Customer app",
      fr: "Application client",
    },
    scope: {
      vi: "Thẻ tích điểm, thực đơn hoặc danh mục, thông báo đẩy, liên hệ nhanh. Không cần máy chủ phức tạp.",
      en: "Loyalty card, menu or catalogue, push notifications, quick contact. No heavy server needed.",
      fr: "Carte de fidélité, carte ou catalogue, notifications, contact rapide. Pas de serveur lourd.",
    },
    floor: 49_900_000,
    leadTime: { vi: "4–6 tuần", en: "4–6 weeks", fr: "4 à 6 semaines" },
  },
  {
    id: "commande",
    name: {
      vi: "Ứng dụng đặt hàng & đặt lịch",
      en: "Ordering & booking app",
      fr: "Application de commande et réservation",
    },
    scope: {
      vi: "Tài khoản khách, đặt hàng hoặc đặt lịch, thanh toán VietQR và MoMo, cùng trang quản lý dành cho anh/chị.",
      en: "Customer accounts, orders or bookings, VietQR and MoMo payment, and a back-office for you.",
      fr: "Comptes clients, commandes ou réservations, paiement VietQR et MoMo, et un espace de gestion pour vous.",
    },
    floor: 89_900_000,
    leadTime: { vi: "6–10 tuần", en: "6–10 weeks", fr: "6 à 10 semaines" },
  },
  {
    id: "equipe",
    name: {
      vi: "Ứng dụng cho đội ngũ & đại lý",
      en: "App for your team & dealers",
      fr: "Application pour votre équipe et vos revendeurs",
    },
    scope: {
      vi: "Nhiều vai trò (nhân viên, quản lý, đại lý), nhận đơn khi mất mạng, đồng bộ với KiotViet, Sapo hoặc phần mềm đang dùng.",
      en: "Several roles (staff, managers, dealers), offline order-taking, sync with KiotViet, Sapo or your current software.",
      fr: "Plusieurs rôles (employés, managers, revendeurs), prise de commande hors ligne, synchronisation avec KiotViet, Sapo ou votre logiciel actuel.",
    },
    floor: 129_900_000,
    leadTime: { vi: "10–16 tuần", en: "10–16 weeks", fr: "10 à 16 semaines" },
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Automatisation
// ─────────────────────────────────────────────────────────────────────────────

const AUTOMATION_TIERS: ServiceTier[] = [
  {
    id: "flux",
    name: { vi: "Một quy trình", en: "One workflow", fr: "Un flux" },
    scope: {
      vi: "Một việc lặp lại, làm trọn từ đầu đến cuối — ví dụ biểu mẫu → bảng tính → tin Zalo báo cho anh/chị.",
      en: "One repetitive task automated end to end — e.g. form → spreadsheet → Zalo alert to you.",
      fr: "Une tâche répétitive automatisée de bout en bout — par exemple formulaire → tableur → alerte Zalo pour vous.",
    },
    floor: 9_900_000,
    monthly: 990_000,
    leadTime: { vi: "1–2 tuần", en: "1–2 weeks", fr: "1 à 2 semaines" },
  },
  {
    id: "pack",
    name: { vi: "Gói 3–5 quy trình", en: "Pack of 3–5 workflows", fr: "Pack de 3 à 5 flux" },
    scope: {
      vi: "Nhiều quy trình nối với nhau, cộng thêm bảng tổng hợp và báo cáo tự động mỗi tối hoặc mỗi tuần.",
      en: "Several linked workflows, plus a summary sheet and an automatic report each evening or week.",
      fr: "Plusieurs flux reliés entre eux, plus un tableau de synthèse et un rapport automatique chaque soir ou chaque semaine.",
    },
    floor: 24_900_000,
    monthly: 1_490_000,
    leadTime: { vi: "2–4 tuần", en: "2–4 weeks", fr: "2 à 4 semaines" },
  },
  {
    id: "systeme",
    name: { vi: "Kết nối hệ thống", en: "Systems integration", fr: "Connexion de vos logiciels" },
    scope: {
      vi: "Nối phần mềm bán hàng, kế toán, CRM hoặc hệ thống riêng với nhau, có nhật ký lỗi và cảnh báo khi một bước thất bại.",
      en: "Linking your sales, accounting or CRM software — or your own system — with an error log and an alert when a step fails.",
      fr: "Relier vos logiciels de vente, de comptabilité, de CRM — ou votre système maison — avec un journal d'erreurs et une alerte dès qu'une étape échoue.",
    },
    floor: 44_900_000,
    monthly: 2_490_000,
    leadTime: { vi: "4–8 tuần", en: "4–8 weeks", fr: "4 à 8 semaines" },
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Intégration d'IA
// ─────────────────────────────────────────────────────────────────────────────

const AI_TIERS: ServiceTier[] = [
  {
    id: "site",
    name: { vi: "Chatbot cho website", en: "Website chatbot", fr: "Chatbot sur votre site" },
    scope: {
      vi: "Trợ lý trên website bằng tiếng Việt và tiếng Anh, trả lời từ tài liệu anh/chị đưa, xin thông tin khi khách muốn được gọi lại.",
      en: "An assistant on your site in Vietnamese and English, answering from the material you provide and collecting details when a visitor wants a call back.",
      fr: "Un assistant sur votre site en vietnamien et en anglais, qui répond à partir de vos documents et recueille les coordonnées d'un visiteur à rappeler.",
    },
    floor: 19_900_000,
    monthly: 990_000,
    leadTime: { vi: "2–3 tuần", en: "2–3 weeks", fr: "2 à 3 semaines" },
  },
  {
    id: "multicanal",
    name: {
      vi: "Đa kênh: website + Zalo OA + Messenger",
      en: "Multichannel: website + Zalo OA + Messenger",
      fr: "Multicanal : site + Zalo OA + Messenger",
    },
    scope: {
      vi: "Cùng một trợ lý trả lời trên website, Zalo OA, Messenger và bình luận Facebook, có chuyển giao cho người thật.",
      en: "One assistant answering on your website, Zalo OA, Messenger and Facebook comments, with hand-over to a human.",
      fr: "Un seul assistant qui répond sur le site, Zalo OA, Messenger et les commentaires Facebook, avec passage de relais à un humain.",
    },
    floor: 34_900_000,
    monthly: 1_490_000,
    leadTime: {
      vi: "3–5 tuần, chưa kể thời gian Zalo duyệt tài khoản OA",
      en: "3–5 weeks, not counting Zalo's review of the OA account",
      fr: "3 à 5 semaines, hors délai de validation du compte OA par Zalo",
    },
  },
  {
    id: "donnees",
    name: {
      vi: "Trợ lý nối với dữ liệu của anh/chị",
      en: "Assistant connected to your data",
      fr: "Assistant branché sur vos données",
    },
    scope: {
      vi: "Trợ lý đọc catalogue, tài liệu nội bộ, đơn hàng hoặc lịch đặt chỗ từ phần mềm anh/chị đang dùng; có bản chỉ dành cho nhân viên.",
      en: "An assistant that reads your catalogue, internal documents, orders or bookings from the software you already use, with a staff-only version.",
      fr: "Un assistant qui lit votre catalogue, vos documents internes, vos commandes ou vos réservations dans les logiciels que vous utilisez, avec une version réservée à l'équipe.",
    },
    floor: 59_900_000,
    monthly: 2_490_000,
    leadTime: { vi: "5–8 tuần", en: "5–8 weeks", fr: "5 à 8 semaines" },
  },
];

/**
 * « Qui travaille avec vous » — le petit bloc sous les formules de prix, commun aux trois
 * prestations. C'est une ILLUSTRATION, pas une photo : personne n'a voulu poser, et un visage
 * photoréaliste généré présenté comme « la personne derrière le devis » serait une fausse
 * preuve. Un avatar dessiné ne trompe personne, et la page le légende comme tel.
 *
 * Le texte ne dit que ce que le site dit déjà ailleurs (extrait « Neuraweb — studio web à
 * Hanoi » du chatbot) : un petit studio, fondé et dirigé par Nacer, qui fait le travail
 * lui-même. Le prénom est la seule information personnelle publiée.
 */
export const ABOUT = {
  image: "svc-personne-illustration",
  alt: {
    vi: "Minh họa: một người đàn ông tóc nâu buộc củ hành ngồi làm việc bên máy tính ở quán cà phê Hà Nội",
    en: "Illustration: a man with brown hair tied in a bun working on a laptop in a Hanoi café",
    fr: "Illustration : un homme aux cheveux bruns attachés en chignon travaille sur un ordinateur portable dans un café de Hanoi",
  },
  eyebrow: { vi: "Ai làm việc với anh/chị", en: "Who you will work with", fr: "Qui travaille avec vous" },
  text: {
    vi: "Neuraweb là một studio thiết kế web nhỏ ở Hà Nội, do Nacer sáng lập và điều hành. Nacer là người trực tiếp làm.",
    en: "Neuraweb is a small web studio in Hanoi, founded and run by Nacer, who does the work directly.",
    fr: "Neuraweb est un petit studio web à Hanoi, fondé et dirigé par Nacer, qui réalise directement le travail.",
  },
} satisfies { image: string; alt: L10n; eyebrow: L10n; text: L10n };

export const SERVICES: Service[] = [
  {
    id: "mobile",
    slug: "ung-dung-android",
    name: { vi: "Ứng dụng Android", en: "Android app", fr: "Application Android" },
    tagline: {
      vi: "Doanh nghiệp của anh/chị, nằm sẵn trong điện thoại khách và đội ngũ",
      en: "Your business, sitting in the phones of your customers and your team",
      fr: "Votre activité, posée dans le téléphone de vos clients et de votre équipe",
    },
    promise: {
      vi: "Khách hàng và đội ngũ của anh/chị có sẵn trong điện thoại những gì họ cần — không phải nhớ ra rồi đi tìm lại.",
      en: "Your customers and your team have what they need already on their phone, instead of having to remember you and search again.",
      fr: "Vos clients et votre équipe ont sous la main, dans leur téléphone, ce dont ils ont besoin — au lieu d'avoir à penser à vous et à vous rechercher.",
    },
    problems: [
      {
        vi: "Thẻ tích điểm giấy, thẻ thành viên, phiếu học phí: khách làm mất, nhân viên quên đóng dấu, và không ai biết ai đã đến bao nhiêu lần.",
        en: "Paper loyalty cards, membership cards, fee slips: customers lose them, staff forget to stamp them, and nobody knows who came how often.",
        fr: "Cartes de fidélité, cartes de membre, carnets de séances en carton : le client les perd, l'employé oublie de tamponner, et personne ne sait qui vient combien de fois.",
      },
      {
        vi: "Khuyến mãi, lịch nghỉ, nhắc lịch hẹn đăng lên Facebook hay nhóm Zalo thì chìm sau vài giờ — đúng những người quan trọng nhất lại không thấy.",
        en: "Promotions, closure notices and appointment reminders posted on Facebook or in a Zalo group sink within hours — and the people who matter most miss them.",
        fr: "Promos, jours de fermeture, rappels de rendez-vous publiés sur Facebook ou dans un groupe Zalo disparaissent en quelques heures — et ce sont justement ceux qui comptent le plus qui ne les voient pas.",
      },
      {
        vi: "Khách hay đại lý muốn đặt lại y như lần trước, hoặc đội bán hàng ngoài thị trường ghi đơn ra giấy — rồi ai đó phải gõ lại tất cả.",
        en: "A customer wants to reorder exactly what they had last time, or your field sales team writes orders on paper — and someone has to type it all again.",
        fr: "Un client veut recommander exactement comme la dernière fois, ou vos commerciaux notent leurs commandes sur papier — et quelqu'un doit tout retaper.",
      },
    ],
    bullets: [
      {
        vi: "Thẻ tích điểm và tài khoản thành viên trong điện thoại: quét mã là cộng điểm, không còn thẻ giấy để mất.",
        en: "A loyalty card and member account inside the phone: scan a code and the points are added — no paper left to lose.",
        fr: "Une carte de fidélité et un compte membre dans le téléphone : on scanne un code, les points s'ajoutent — plus de carton à perdre.",
      },
      {
        vi: "Đặt món, đặt lịch, đăng ký lớp hoặc đặt hàng trong vài lần chạm, kèm lịch sử để đặt lại chỉ một chạm.",
        en: "Ordering, booking, enrolling in a class or placing an order in a few taps, with history kept so reordering takes one.",
        fr: "Commande, réservation ou inscription à un cours en quelques touches, avec l'historique pour recommander en une seule.",
      },
      {
        vi: "Thông báo đẩy — khuyến mãi, nhắc lịch, tin lớp học — đến thẳng màn hình khách, không qua thuật toán của ai.",
        en: "Push notifications — promotions, appointment reminders, class news — straight to the customer's screen, through nobody's algorithm.",
        fr: "Des notifications — promos, rappels de rendez-vous, infos de cours — droit sur l'écran du client, sans passer par l'algorithme de personne.",
      },
      {
        vi: "Khi cần, thêm phần dành cho đội ngũ: nhận đơn ngoài thị trường kể cả khi mất mạng, xem tồn kho, đồng bộ về hệ thống văn phòng.",
        en: "When needed, a part for your team: take orders in the field even without a signal, check stock, sync back to the office system.",
        fr: "Si besoin, un espace pour votre équipe : prise de commande sur le terrain même sans réseau, consultation du stock, synchronisation avec le système du bureau.",
      },
      {
        vi: "Đưa lên Google Play dưới tên của anh/chị, và mã nguồn bàn giao nếu anh/chị yêu cầu.",
        en: "Published on Google Play under your name, with the source code handed over on request.",
        fr: "Publiée sur Google Play à votre nom, code source remis sur demande.",
      },
    ],
    forWhom: {
      vi: "Có người quay lại hoặc dùng lại đều đặn mỗi tuần: khách quen, học viên, bệnh nhân, đại lý, đội bán hàng ngoài thị trường — ngành nào cũng vậy.",
      en: "You have people who come back or use you every week — regulars, students, patients, dealers, a field sales team. The trade doesn't matter.",
      fr: "Vous avez des gens qui reviennent ou vous utilisent chaque semaine — habitués, élèves, patients, revendeurs, commerciaux sur le terrain. Peu importe le secteur.",
    },
    notForWhom: {
      vi: "Nếu khách chỉ đến một lần rồi thôi — điểm du lịch, cửa hàng bán cho khách vãng lai, dịch vụ người ta chỉ mua vài năm một lần — thì ứng dụng chưa đáng tiền. Một trang web tốt sẽ có ích hơn.",
      en: "If customers come once and never return — a tourist spot, a shop selling to passers-by, a service people buy every few years — an app is not worth it yet. A good website will do more.",
      fr: "Si vos clients viennent une fois et ne reviennent pas — un lieu de passage touristique, une boutique de rue, un service qu'on n'achète que tous les quelques ans — l'application n'en vaut pas encore la peine. Un bon site vous servira davantage.",
    },
    faq: [
      {
        q: { vi: "Sao không làm cho iPhone luôn?", en: "Why not iPhone too?", fr: "Pourquoi pas l'iPhone aussi ?" },
        a: {
          vi: "Vì phần lớn khách ở Hà Nội dùng Android. Làm Android trước để ứng dụng đến tay đa số khách sớm nhất, với chi phí thấp nhất. Bản iPhone làm sau, khi đã biết khách dùng ứng dụng thế nào.",
          en: "Because most customers in Hanoi carry Android. Android first puts the app in the majority of hands soonest, for the lowest cost. The iPhone build comes after, once you know how the app is actually used.",
          fr: "Parce que la plupart des clients de Hanoi ont un Android. Commencer par Android met l'application entre le plus de mains possible, au coût le plus bas. La version iPhone vient après, quand on sait comment l'application est réellement utilisée.",
        },
      },
      {
        q: { vi: "Khách có chịu tải ứng dụng không?", en: "Will customers actually install it?", fr: "Les clients vont-ils l'installer ?" },
        a: {
          vi: "Chỉ khi có lý do. Lý do thường là điểm tích lũy: khách tải để không mất phần thưởng đang tích. Vì vậy thẻ tích điểm luôn là thứ làm trước, không phải làm sau. Với nhân viên và đại lý thì đơn giản hơn: đó là công cụ làm việc của họ.",
          en: "Only if there is a reason. The reason is usually points: they install it so as not to lose the reward they are building up. That is why the loyalty card is built first, not last. For staff and dealers it is simpler: it is their work tool.",
          fr: "Seulement s'ils ont une raison. Cette raison, c'est presque toujours les points : on installe pour ne pas perdre la récompense en cours. C'est pourquoi la carte de fidélité se construit en premier, pas en dernier. Pour les employés et les revendeurs, c'est plus simple : c'est leur outil de travail.",
        },
      },
      {
        q: {
          vi: "Sau khi ra mắt còn những khoản phí nào?",
          en: "What costs remain after launch?",
          fr: "Quels frais restent après la mise en ligne ?",
        },
        a: {
          vi: "Tài khoản nhà phát triển Google Play: phí 25 USD một lần, đóng thẳng cho Google và đứng tên anh/chị. Với các gói có tài khoản khách hoặc đơn hàng, có thêm chi phí máy chủ hằng tháng, từ khoảng 5 USD tùy nhu cầu thực tế và được nói rõ trong báo giá.",
          en: "The Google Play developer account costs a one-off 25 USD, paid straight to Google and held in your name. For tiers with customer accounts or orders, there is also a monthly server cost, from around 5 USD depending on real usage, stated in the quote.",
          fr: "Le compte développeur Google Play coûte 25 USD une seule fois, payés directement à Google et à votre nom. Pour les formules avec comptes clients ou commandes, s'ajoute un coût de serveur mensuel, à partir d'environ 5 USD selon l'usage réel, indiqué dans le devis.",
        },
      },
    ],
    tiers: MOBILE_TIERS,
    floor: MOBILE_TIERS[0].floor,
    monthly: MOBILE_TIERS[0].monthly,
    leadTime: { vi: "4–16 tuần tùy gói", en: "4–16 weeks depending on the tier", fr: "4 à 16 semaines selon la formule" },
    cases: [
      {
        image: "svc-cas-android-langues",
        sector: { vi: "Trung tâm ngoại ngữ", en: "Language school", fr: "Centre de langues" },
        situation: {
          vi: "Mỗi ngày phụ huynh nhắn Zalo hỏi lịch học, buổi nghỉ và học phí; nhân viên tư vấn trả lời cùng một nội dung hàng chục lần.",
          en: "Every day parents message on Zalo to ask about timetables, absences and fees; the front desk gives the same answers dozens of times.",
          fr: "Chaque jour, des parents écrivent sur Zalo pour connaître l'emploi du temps, les absences et les frais ; l'accueil donne les mêmes réponses des dizaines de fois.",
        },
        built: {
          vi: "Một ứng dụng có thời khóa biểu, thông báo nghỉ học và nhắc học phí gửi thẳng đến điện thoại phụ huynh.",
          en: "An app with the timetable, absence alerts and fee reminders sent straight to the parents' phones.",
          fr: "Une application avec l'emploi du temps, les alertes d'absence et les rappels de frais envoyés directement sur le téléphone des parents.",
        },
      },
      {
        image: "metier-clinique",
        sector: { vi: "Phòng khám nha khoa", en: "Dental practice", fr: "Cabinet dentaire" },
        situation: {
          vi: "Bệnh nhân quên tái khám sau sáu tháng, và mỗi lần đặt lịch lại phải gọi điện hoặc nhắn tin.",
          en: "Patients forget their six-month check-up, and every booking means a phone call or a message.",
          fr: "Les patients oublient leur contrôle de six mois, et chaque rendez-vous passe par un appel ou un message.",
        },
        built: {
          vi: "Ứng dụng đặt lịch, xem lịch sử điều trị, và nhận thông báo nhắc tái khám đúng hạn.",
          en: "A booking app with treatment history, and a reminder that arrives exactly when the check-up is due.",
          fr: "Une application de prise de rendez-vous, avec l'historique des soins et un rappel qui arrive au moment du contrôle.",
        },
      },
      {
        image: "svc-cas-android-distributeur",
        sector: { vi: "Nhà phân phối, đại lý", en: "Distributor", fr: "Distributeur" },
        situation: {
          vi: "Mười hai nhân viên bán hàng ghi đơn ra giấy hoặc nhắn Zalo cho văn phòng, và tối nào kế toán cũng phải gõ lại.",
          en: "Twelve sales reps write orders on paper or message the office on Zalo, and every evening accounting retypes them.",
          fr: "Douze commerciaux notent leurs commandes sur papier ou les envoient au bureau par Zalo, et chaque soir la comptabilité les retape.",
        },
        built: {
          vi: "Ứng dụng nội bộ: chọn khách, chọn hàng, xem tồn kho, gửi đơn — kể cả khi mất sóng — rồi tự đồng bộ về phần mềm bán hàng.",
          en: "An internal app: pick the shop, pick the goods, check stock, send the order — even without signal — then sync it to the sales software.",
          fr: "Une application interne : on choisit le client, les produits, on consulte le stock, on envoie la commande — même sans réseau — et elle se synchronise avec le logiciel de vente.",
        },
      },
      {
        image: "metier-cafe",
        sector: { vi: "Quán, salon, phòng tập", en: "Café, salon or gym", fr: "Café, salon ou salle de sport" },
        situation: {
          vi: "Khách quen tích điểm bằng thẻ giấy; đến kỳ khuyến mãi, ưu đãi đăng Facebook mà đúng khách quen lại không thấy.",
          en: "Regulars collect points on a paper card; when a promotion comes, it is posted on Facebook and the regulars are the ones who don't see it.",
          fr: "Les habitués cumulent leurs points sur une carte en carton ; quand une promo arrive, elle est publiée sur Facebook et ce sont justement les habitués qui ne la voient pas.",
        },
        built: {
          vi: "Thẻ tích điểm số, cộng điểm bằng cách quét mã, và thông báo ưu đãi gửi riêng cho khách đã tích đủ điểm.",
          en: "A digital loyalty card, points added by scanning a code, and an offer notification sent only to customers who have earned enough points.",
          fr: "Une carte de fidélité numérique, des points ajoutés en scannant un code, et une notification d'offre envoyée seulement aux clients qui ont assez de points.",
        },
      },
    ],
    process: [
      {
        image: STEP_IMAGE.call,
        title: { vi: "Trao đổi và chốt phạm vi", en: "Call and fix the scope", fr: "Échange et périmètre figé" },
        when: { vi: "Tuần 0", en: "Week 0", fr: "Semaine 0" },
        detail: {
          vi: "Buổi trao đổi 15 phút, sau đó anh/chị nhận báo giá bằng văn bản, nêu rõ từng hạng mục.",
          en: "A 15-minute call, then a written quote listing each item.",
          fr: "Un échange de 15 minutes, puis un devis écrit qui détaille chaque poste.",
        },
      },
      {
        image: STEP_IMAGE.quote,
        title: {
          vi: "Đặt cọc 50% và duyệt bản thiết kế",
          en: "50% deposit and design sign-off",
          fr: "Acompte 50 % et maquettes validées",
        },
        when: { vi: "Tuần 1–2", en: "Weeks 1–2", fr: "Semaines 1–2" },
        detail: {
          vi: "Anh/chị xem và duyệt từng màn hình trước khi lập trình — sửa một bản vẽ rẻ hơn sửa trong code.",
          en: "You review every screen before any code is written — changing a drawing is cheaper than changing code.",
          fr: "Vous validez chaque écran avant la moindre ligne de code — corriger un dessin coûte moins cher que corriger du code.",
        },
      },
      {
        title: {
          vi: "Lập trình, cài thử trên điện thoại của anh/chị",
          en: "Build, with test versions on your own phone",
          fr: "Développement, avec des versions de test sur votre téléphone",
        },
        when: {
          vi: "Phần lớn dự án — mỗi tuần một bản thử",
          en: "The bulk of the project — a test build every week",
          fr: "Le gros du projet — une version de test chaque semaine",
        },
        detail: {
          vi: "Mỗi tuần anh/chị cầm bản mới nhất trên tay và dùng thử. Điều gì chưa đúng thì nói ngay, không đợi đến cuối.",
          en: "Each week you hold the latest build and try it. Anything off gets said straight away, not at the end.",
          fr: "Chaque semaine, vous avez la dernière version en main et vous l'essayez. Ce qui ne va pas se dit tout de suite, pas à la fin.",
        },
      },
      {
        image: STEP_IMAGE.handover,
        title: {
          vi: "Đưa lên Google Play và hướng dẫn",
          en: "Google Play release and training",
          fr: "Publication Google Play et formation",
        },
        when: { vi: "Tuần cuối", en: "Final week", fr: "Dernière semaine" },
        detail: {
          vi: "Đăng lên Google Play, hướng dẫn đội ngũ, thanh toán phần còn lại. Google cần thêm vài ngày để duyệt — bước này không do chúng tôi quyết định.",
          en: "Published on Google Play, team trained, balance paid. Google needs a few more days to review — that step is not ours to control.",
          fr: "Publication sur Google Play, formation de l'équipe, règlement du solde. Google met quelques jours de plus à valider — cette étape ne dépend pas de nous.",
        },
      },
    ],
    card: "svc-accueil-android",
    hero: {
      image: "svc-hero-android",
      video: true,
      illustration: true,
      alt: {
        vi: "Một bàn tay cầm điện thoại Android tắt màn hình ở quầy quán cà phê Hà Nội, cạnh phin cà phê",
        en: "A hand holding an Android phone with its screen off at a Hanoi café counter, next to a phin coffee filter",
        fr: "Une main tient un téléphone Android à l'écran éteint au comptoir d'un café de Hanoi, près d'un filtre phin",
      },
    },
    banner: {
      image: "svc-probleme-android",
      alt: {
        vi: "Hộp thiếc đựng đầy thẻ tích điểm giấy nhàu nát",
        en: "A tin full of crumpled paper loyalty cards",
        fr: "Une boîte en fer remplie de cartes de fidélité froissées",
      },
      at: "problems",
    },
    accent: "#0E5B4C",
    icon: "📱",
  },

  {
    id: "automatisation",
    slug: "tu-dong-hoa",
    name: { vi: "Tự động hóa công việc", en: "Workflow automation", fr: "Automatisation" },
    tagline: {
      vi: "Việc lặp lại mỗi tối, để máy làm",
      en: "What you redo every evening, done by itself",
      fr: "Ce que vous refaites chaque soir, fait tout seul",
    },
    promise: {
      vi: "Những việc anh/chị làm đi làm lại mỗi tối sẽ tự chạy, không cần ai bấm nút.",
      en: "The things you redo every evening run on their own, with nobody pressing a button.",
      fr: "Ce que vous refaites tous les soirs tourne tout seul, sans que personne appuie sur un bouton.",
    },
    problems: [
      {
        vi: "Thông tin đến từ nhiều nơi — Zalo, Facebook, email, biểu mẫu website, điện thoại — rồi tối đến phải chép tay vào một chỗ.",
        en: "Information arrives from everywhere — Zalo, Facebook, email, website forms, phone — and every evening you copy it by hand into one place.",
        fr: "L'information arrive de partout — Zalo, Facebook, e-mail, formulaire du site, téléphone — et le soir, vous la recopiez à la main au même endroit.",
      },
      {
        vi: "Nhắc lịch hẹn, nhắc thanh toán, gửi báo giá, xuất hóa đơn: việc nào cũng nhỏ, cộng lại mất cả buổi, và hay bị quên đúng lúc bận.",
        en: "Appointment reminders, payment chasers, quotes, invoices: each task is small, together they eat half a day, and they get forgotten exactly when you're busy.",
        fr: "Rappels de rendez-vous, relances de paiement, devis, factures : chaque tâche est petite, ensemble elles prennent une demi-journée, et on les oublie justement quand on est débordé.",
      },
      {
        vi: "Muốn biết hôm nay bán được bao nhiêu, ai còn nợ, hàng nào sắp hết thì phải mở ba chỗ và cộng tay.",
        en: "Knowing what you took today, who still owes you and what's running low means opening three places and adding it up by hand.",
        fr: "Savoir ce que vous avez encaissé, qui vous doit encore de l'argent, quel produit va manquer demande d'ouvrir trois endroits et d'additionner à la main.",
      },
    ],
    bullets: [
      {
        vi: "Đơn hàng và liên hệ từ Zalo, Facebook, email và biểu mẫu tự rơi vào một bảng tính hoặc phần mềm duy nhất, đúng định dạng anh/chị cần.",
        en: "Orders and enquiries from Zalo, Facebook, email and web forms drop by themselves into a single spreadsheet or tool, in the format you need.",
        fr: "Les commandes et demandes venues de Zalo, Facebook, e-mail et formulaires tombent seules dans un tableur ou un outil unique, au format dont vous avez besoin.",
      },
      {
        vi: "Tin nhắn nhắc khách trước hẹn 24 giờ, nhắc thanh toán khi quá hạn — tự gửi, không cần ai nhớ.",
        en: "A reminder goes out 24 hours before the appointment and a chaser when a payment is late — on their own, with nobody to remember.",
        fr: "Un rappel part 24 h avant le rendez-vous, une relance dès qu'un paiement est en retard — tout seuls, sans que personne ait à y penser.",
      },
      {
        vi: "Báo giá, hợp đồng, hóa đơn tạo từ mẫu có sẵn và gửi cho khách qua Zalo hoặc email chỉ với một lần bấm.",
        en: "Quotes, contracts and invoices generated from your templates and sent to the customer by Zalo or email with a single click.",
        fr: "Devis, contrats et factures générés à partir de vos modèles et envoyés au client par Zalo ou e-mail en un clic.",
      },
      {
        vi: "Tổng kết doanh thu mỗi tối gửi về điện thoại anh/chị, đã cộng sẵn.",
        en: "The day's takings reach your phone each evening, already totalled.",
        fr: "Le chiffre du jour arrive sur votre téléphone chaque soir, déjà additionné.",
      },
      {
        vi: "Đồng bộ tồn kho với KiotViet, Sapo hoặc MISA, và chuẩn bị sẵn hóa đơn VAT.",
        en: "Stock synced with KiotViet, Sapo or MISA, and VAT invoices prepared in advance.",
        fr: "Le stock synchronisé avec KiotViet, Sapo ou MISA, et les factures VAT préparées d'avance.",
      },
    ],
    forWhom: {
      vi: "Mỗi ngày mất khoảng một giờ cho việc chép đi chép lại — nhập đơn, gửi báo giá, nhắc lịch, làm báo cáo — dù anh/chị làm ngành nào. Một giờ mỗi ngày là hơn ba mươi giờ mỗi tháng.",
      en: "You lose about an hour a day to copying things back and forth — entering orders, sending quotes, chasing appointments, building reports — whatever your trade. An hour a day is more than thirty hours a month.",
      fr: "Vous perdez environ une heure par jour à recopier les mêmes choses — saisir des commandes, envoyer des devis, relancer des rendez-vous, faire des rapports — quel que soit votre secteur. Une heure par jour, c'est plus de trente heures par mois.",
    },
    notForWhom: {
      vi: "Nếu mỗi ngày chỉ vài đơn và anh/chị nhớ hết trong đầu, tự động hóa chưa giải quyết vấn đề gì. Nó bắt đầu có lý khi số lượng vượt trí nhớ.",
      en: "If you take a handful of orders a day and keep them all in your head, automation solves nothing yet. It starts to pay when the volume outgrows memory.",
      fr: "Si vous prenez quelques commandes par jour et que vous les retenez de tête, l'automatisation ne résout rien encore. Elle devient utile quand le volume dépasse la mémoire.",
    },
    faq: [
      {
        q: { vi: "Tôi có phải đổi cách làm không?", en: "Do I have to change how I work?", fr: "Dois-je changer ma façon de travailler ?" },
        a: {
          vi: "Không. Việc nối vào đúng những công cụ anh/chị đang dùng — Zalo, Facebook, bảng tính, phần mềm bán hàng. Nếu phải đổi thói quen thì tự động hóa đã hỏng ngay từ đầu.",
          en: "No. It plugs into the tools you already use — Zalo, Facebook, your spreadsheet, your point of sale. If it forced you to change habits, the automation would already have failed.",
          fr: "Non. Ça se branche sur les outils que vous utilisez déjà — Zalo, Facebook, votre tableur, votre logiciel de caisse. Si ça vous obligeait à changer vos habitudes, l'automatisation aurait déjà échoué.",
        },
      },
      {
        q: {
          vi: "Có làm được với phần mềm tôi đang dùng không?",
          en: "Will it work with the software I already use?",
          fr: "Est-ce que ça marche avec le logiciel que j'utilise déjà ?",
        },
        a: {
          vi: "Nếu phần mềm có kết nối mở (API, webhook) hoặc xuất được file, Google Sheets, email thì nối được. Nếu không, bảng tính hoặc email làm cầu nối. Chúng tôi kiểm tra điều này trong buổi trao đổi 15 phút, trước khi báo giá.",
          en: "If the software has an open connection (API, webhook) or can export a file, a Google Sheet or an email, it can be connected. If not, a spreadsheet or email acts as the bridge. We check this during the 15-minute call, before quoting.",
          fr: "Si le logiciel offre une connexion ouverte (API, webhook) ou sait exporter un fichier, une feuille Google Sheets ou un e-mail, on peut le relier. Sinon, un tableur ou un e-mail sert de pont. On le vérifie pendant l'échange de 15 minutes, avant de chiffrer.",
        },
      },
      {
        q: { vi: "Nếu hỏng thì sao?", en: "What if it breaks?", fr: "Et si ça tombe en panne ?" },
        a: {
          vi: "Anh/chị được báo ngay khi có lỗi, và mọi thứ vẫn làm được bằng tay như trước — không có việc nào bị khóa cứng vào hệ thống. Phí duy trì hằng tháng là để theo dõi và sửa khi công cụ bên ngoài thay đổi.",
          en: "You are told the moment something fails, and everything can still be done by hand as before — nothing gets locked inside the system. The monthly fee pays for watching it and fixing it when an outside tool changes.",
          fr: "Vous êtes prévenu dès qu'une étape échoue, et tout reste faisable à la main comme avant — rien n'est enfermé dans le système. L'entretien mensuel paie la surveillance et la réparation quand un outil extérieur change.",
        },
      },
    ],
    tiers: AUTOMATION_TIERS,
    floor: AUTOMATION_TIERS[0].floor,
    monthly: AUTOMATION_TIERS[0].monthly,
    leadTime: { vi: "1–8 tuần tùy gói", en: "1–8 weeks depending on the tier", fr: "1 à 8 semaines selon la formule" },
    cases: [
      {
        image: "svc-cas-automatisation-boutique",
        sector: { vi: "Shop bán hàng đa kênh", en: "Multi-channel online shop", fr: "Boutique en ligne multicanale" },
        situation: {
          vi: "Đơn đến từ Zalo, Facebook và website; mỗi tối phải chép lại vào một bảng tính và trừ tồn kho bằng tay, thỉnh thoảng bán trùng món đã hết.",
          en: "Orders come from Zalo, Facebook and the website; every evening they are copied into a spreadsheet and stock is deducted by hand, and now and then an item that's gone gets sold twice.",
          fr: "Les commandes arrivent de Zalo, Facebook et du site ; chaque soir on les recopie dans un tableur et on déduit le stock à la main, et il arrive de vendre deux fois un article déjà épuisé.",
        },
        built: {
          vi: "Mọi đơn tự rơi vào một bảng, tồn kho được trừ ngay, và tối đến một bản tổng kết doanh thu gửi về điện thoại.",
          en: "Every order lands in one sheet, stock is deducted immediately, and an evening takings summary reaches your phone.",
          fr: "Chaque commande tombe dans une seule feuille, le stock est déduit aussitôt, et un récapitulatif du chiffre du jour arrive le soir sur le téléphone.",
        },
      },
      {
        image: "svc-cas-automatisation-atelier",
        sector: {
          vi: "Xưởng nội thất, công ty thiết kế",
          en: "Interior workshop or design firm",
          fr: "Atelier d'agencement ou bureau de design",
        },
        situation: {
          vi: "Khách gửi yêu cầu qua biểu mẫu, và báo giá làm tay trong Excel. Nhiều báo giá đi muộn, hoặc không ai nhắc lại sau khi gửi.",
          en: "Customers send requests through a form and quotes are built by hand in Excel. Many go out late, or nobody follows up after sending.",
          fr: "Les clients envoient leur demande par formulaire et les devis se font à la main dans Excel. Beaucoup partent en retard, ou personne ne relance après l'envoi.",
        },
        built: {
          vi: "Biểu mẫu tạo báo giá PDF từ mẫu có sẵn, gửi cho khách, và ba ngày sau tự nhắn hỏi thăm nếu khách chưa trả lời.",
          en: "The form produces a PDF quote from your template, sends it, and three days later follows up on its own if the customer hasn't answered.",
          fr: "Le formulaire produit un devis PDF à partir de votre modèle, l'envoie, et relance tout seul trois jours plus tard si le client n'a pas répondu.",
        },
      },
      {
        image: "metier-salon",
        sector: {
          vi: "Phòng khám, spa, trung tâm đào tạo",
          en: "Clinic, spa or training centre",
          fr: "Clinique, spa ou centre de formation",
        },
        situation: {
          vi: "Mỗi buổi luôn có vài khách quên lịch hẹn, và không ai đủ rảnh để nhắn nhắc từng người.",
          en: "Every session a few clients forget their slot, and nobody has time to message each one.",
          fr: "À chaque session, quelques clients oublient leur créneau, et personne n'a le temps de les prévenir un par un.",
        },
        built: {
          vi: "Tin nhắn nhắc hẹn 24 giờ trước, khách trả lời để xác nhận hoặc dời lịch; chỗ trống được báo ngay để bán lại.",
          en: "A reminder 24 hours ahead, the customer replies to confirm or reschedule; freed slots are flagged straight away so they can be resold.",
          fr: "Un rappel 24 h avant, le client répond pour confirmer ou reporter ; les créneaux libérés sont signalés aussitôt pour être revendus.",
        },
      },
      {
        image: "svc-cas-automatisation-immobilier",
        sector: { vi: "Môi giới bất động sản", en: "Real-estate agency", fr: "Agence immobilière" },
        situation: {
          vi: "Khách để lại số qua quảng cáo Facebook, nhưng phải hàng giờ sau mới có người gọi — lúc đó khách đã hỏi bên khác.",
          en: "A prospect leaves a number through a Facebook ad, but nobody calls for hours — by then they have asked someone else.",
          fr: "Un prospect laisse son numéro via une pub Facebook, mais personne ne rappelle avant des heures — il a déjà demandé ailleurs.",
        },
        built: {
          vi: "Mỗi liên hệ mới tự vào bảng khách, được chia cho nhân viên theo lượt, và một tin Zalo báo ngay cho người được giao.",
          en: "Each new lead goes into the customer sheet, is handed to an agent in turn, and a Zalo message alerts them immediately.",
          fr: "Chaque nouveau contact entre dans la feuille clients, est attribué à un agent à tour de rôle, et un message Zalo l'alerte aussitôt.",
        },
      },
    ],
    process: [
      {
        image: STEP_IMAGE.call,
        title: {
          vi: "Xem việc anh/chị đang làm",
          en: "Look at what you redo",
          fr: "On regarde ce que vous refaites",
        },
        when: { vi: "Ngày 1–2", en: "Days 1–2", fr: "Jours 1–2" },
        detail: {
          vi: "Buổi trao đổi 15 phút, rồi chúng tôi xem cách anh/chị làm hôm nay và chỉ ra việc nào đáng tự động hóa, việc nào không.",
          en: "A 15-minute call, then we look at how you work today and point out which tasks are worth automating and which are not.",
          fr: "Un échange de 15 minutes, puis on regarde comment vous travaillez aujourd'hui et on indique ce qui vaut la peine d'être automatisé — et ce qui ne le vaut pas.",
        },
      },
      {
        image: STEP_IMAGE.quote,
        title: {
          vi: "Đặt cọc 50% và dựng quy trình đầu tiên",
          en: "50% deposit, then the first workflow",
          fr: "Acompte 50 % puis premier flux",
        },
        when: { vi: "Tuần 1", en: "Week 1", fr: "Semaine 1" },
        detail: {
          vi: "Nối vào đúng những công cụ anh/chị đang dùng. Anh/chị không phải cài hay học thêm gì.",
          en: "Plugged into the tools you already use. You install nothing and learn nothing new.",
          fr: "Branché sur les outils que vous utilisez déjà. Vous n'installez rien et n'apprenez rien de nouveau.",
        },
      },
      {
        title: {
          vi: "Chạy thử song song",
          en: "Run alongside your current way",
          fr: "Essai en parallèle",
        },
        when: { vi: "Từ tuần 2", en: "From week 2", fr: "À partir de la semaine 2" },
        detail: {
          vi: "Máy chạy trên dữ liệu thật, anh/chị vẫn làm như cũ. Hai bên đối chiếu; sai chỗ nào sửa chỗ đó trước khi bỏ cách cũ.",
          en: "It runs on your real data while you carry on as before. The two are compared; anything that differs is fixed before the old way is dropped.",
          fr: "Il tourne sur vos vraies données pendant que vous continuez comme avant. On compare les deux ; ce qui diffère est corrigé avant d'abandonner l'ancienne méthode.",
        },
      },
      {
        image: STEP_IMAGE.handover,
        title: {
          vi: "Bật chính thức, cảnh báo và hướng dẫn",
          en: "Go live, alerts and handover",
          fr: "Mise en service, alertes et prise en main",
        },
        when: { vi: "Cuối dự án", en: "End of the project", fr: "En fin de projet" },
        detail: {
          vi: "Bật chính thức, hướng dẫn ngắn, thanh toán phần còn lại. Từ đây phí duy trì hằng tháng bắt đầu: chúng tôi theo dõi và báo ngay khi có bước hỏng.",
          en: "Switched on, short handover, balance paid. The monthly upkeep starts here: we watch it and tell you the moment a step fails.",
          fr: "Mise en route, courte prise en main, règlement du solde. L'entretien mensuel démarre ici : on surveille et on vous prévient dès qu'une étape échoue.",
        },
      },
    ],
    card: "svc-accueil-automatisation",
    hero: {
      image: "svc-hero-automatisation",
      video: true,
      illustration: true,
      alt: {
        vi: "Một người đàn ông ngồi ghế thấp buổi tối, chép đơn hàng từ điện thoại vào máy tính, xung quanh là các gói hàng",
        en: "A man on a low stool in the evening, copying orders from his phone into a laptop, surrounded by parcels",
        fr: "Un homme sur un tabouret bas, le soir, recopie des commandes de son téléphone vers son ordinateur, entouré de colis",
      },
    },
    banner: {
      image: "svc-apres-automatisation",
      illustration: true,
      alt: {
        vi: "Điện thoại và laptop đã gập trên bàn gỗ, phía sau là hai người đang ăn tối",
        en: "A phone and a closed laptop on a wooden table, two people having dinner behind them",
        fr: "Un téléphone et un ordinateur refermé sur une table en bois, deux personnes qui dînent derrière",
      },
      at: "deliverables",
    },
    accent: "#9A5B23",
    icon: "⚙️",
  },

  {
    id: "ia",
    slug: "tich-hop-ai",
    name: { vi: "Tích hợp AI", en: "AI integration", fr: "Intégration d'IA" },
    tagline: {
      vi: "Trợ lý hiểu doanh nghiệp của anh/chị, trên website lẫn Zalo",
      en: "An assistant that knows your business, on your website and on Zalo",
      fr: "Un assistant qui connaît votre activité, sur votre site comme sur Zalo",
    },
    promise: {
      vi: "Khách hỏi lúc 11 giờ đêm vẫn có người trả lời, còn anh/chị thì đang ngủ.",
      en: "A customer asking at 11pm still gets an answer, while you are asleep.",
      fr: "Le client qui écrit à 23 h obtient une réponse, pendant que vous dormez.",
    },
    problems: [
      {
        vi: "Tin nhắn Zalo, bình luận Facebook, câu hỏi trên website đến cả ngày lẫn đêm, và mười câu hỏi giống hệt nhau lặp lại mỗi tuần.",
        en: "Zalo messages, Facebook comments and website enquiries arrive day and night, and the same ten questions come back every week.",
        fr: "Messages Zalo, commentaires Facebook et questions sur le site tombent jour et nuit, et les dix mêmes questions reviennent chaque semaine.",
      },
      {
        vi: "Khách hỏi giá lúc nửa đêm — hoặc từ múi giờ khác — sáng mai mới trả lời được; lúc đó họ đã liên hệ bên khác.",
        en: "Someone asks the price at midnight — or from another time zone — and you answer next morning; by then they have contacted someone else.",
        fr: "Quelqu'un demande un prix à minuit — ou depuis un autre fuseau horaire — vous répondez le lendemain ; entre-temps il a contacté quelqu'un d'autre.",
      },
      {
        vi: "Chatbot dựng sẵn trả lời chung chung, không biết gì về doanh nghiệp của anh/chị; còn nhân viên mới thì hỏi đi hỏi lại chủ cùng những câu về giá và quy trình.",
        en: "Off-the-shelf chatbots answer in generalities and know nothing about your business; and new staff keep asking you the same questions about prices and procedures.",
        fr: "Les chatbots tout faits répondent en généralités et ne connaissent rien à votre activité ; et les nouveaux employés vous reposent sans cesse les mêmes questions sur les prix et les procédures.",
      },
    ],
    bullets: [
      {
        vi: "Chatbot ngay trên website của anh/chị, trả lời 24/7 bằng tiếng Việt và tiếng Anh, và xin tên, số điện thoại khi khách muốn được gọi lại.",
        en: "A chatbot right on your website, answering 24/7 in Vietnamese and English, and asking for a name and phone number when a visitor wants a call back.",
        fr: "Un chatbot directement sur votre site, qui répond 24 h/24 en vietnamien et en anglais, et demande un nom et un numéro quand le visiteur veut être rappelé.",
      },
      {
        vi: "Cùng trợ lý đó chạy được trên Zalo OA, Messenger và bình luận Facebook: thiết lập một lần, dùng nhiều kênh.",
        en: "The same assistant can run on Zalo OA, Messenger and Facebook comments: set up once, used on several channels.",
        fr: "Le même assistant peut tourner sur Zalo OA, Messenger et les commentaires Facebook : configuré une fois, utilisé sur plusieurs canaux.",
      },
      {
        vi: "Chỉ nói về doanh nghiệp của anh/chị — giá, giờ mở cửa, đường đi, đặt lịch — và chỉ dựa trên thông tin anh/chị đưa; gặp câu hỏi ngoài phạm vi thì chuyển cho anh/chị.",
        en: "Talking only about your business — prices, hours, directions, bookings — and only from what you give it; a question beyond its scope is handed over to you.",
        fr: "Ne parle que de votre activité — prix, horaires, itinéraire, réservations — et uniquement à partir de ce que vous lui donnez ; une question hors périmètre vous est transmise.",
      },
      {
        vi: "Trợ lý nội bộ: nhân viên hỏi bảng giá, quy trình, catalogue và nhận câu trả lời rút từ tài liệu của anh/chị.",
        en: "An internal assistant: staff ask about price lists, procedures or the catalogue and get answers drawn from your own documents.",
        fr: "Un assistant interne : vos employés l'interrogent sur les tarifs, les procédures ou le catalogue et obtiennent des réponses tirées de vos propres documents.",
      },
      {
        vi: "Những việc chữ nghĩa lặp lại: viết mô tả sản phẩm, tóm tắt đánh giá của khách, phân loại email, đọc hóa đơn hoặc đơn hàng thành bảng.",
        en: "Repetitive text work: product descriptions, customer-review summaries, sorting emails, reading invoices or orders into a table.",
        fr: "Le travail sur les textes qui se répète : fiches produits, résumé des avis clients, tri des e-mails, lecture de factures ou de commandes vers un tableau.",
      },
    ],
    forWhom: {
      vi: "Trả lời tin nhắn của khách — hoặc câu hỏi của nhân viên — chiếm mất buổi tối của anh/chị, và một phần người hỏi xong không thấy quay lại. Ngành nào cũng có tình huống này.",
      en: "Answering customers' messages — or your staff's questions — eats your evenings, and some of the people who ask never come back. Every trade has this.",
      fr: "Répondre aux messages des clients — ou aux questions de vos employés — vous prend vos soirées, et une partie de ceux qui demandent ne revient jamais. Tous les secteurs connaissent ça.",
    },
    notForWhom: {
      vi: "Nếu mỗi tuần chỉ có vài tin nhắn, anh/chị tự trả lời vẫn tốt hơn — và ấm áp hơn. Trợ lý chỉ đáng tiền khi số tin nhắn bắt đầu làm anh/chị mệt.",
      en: "If you get a few messages a week, answering them yourself is better — and warmer. An assistant earns its keep when the volume starts to wear you out.",
      fr: "Si vous recevez quelques messages par semaine, y répondre vous-même reste préférable — et plus chaleureux. L'assistant se justifie quand le volume commence à vous fatiguer.",
    },
    faq: [
      {
        q: { vi: "Trợ lý có bịa ra không?", en: "Will it make things up?", fr: "Va-t-il inventer des choses ?" },
        a: {
          vi: "Nó chỉ trả lời từ thông tin anh/chị đưa vào, và khi không có thông tin thì nói thẳng là chưa chắc rồi mời khách liên hệ. Giá, giờ mở cửa, điều kiện — không tự chế ra.",
          en: "It answers only from what you put in, and when it has nothing it says so and invites the customer to get in touch. Prices, hours, conditions — none of it is improvised.",
          fr: "Il ne répond qu'à partir de ce que vous lui donnez, et quand il n'a rien, il le dit et invite le client à vous écrire. Les prix, les horaires, les conditions — rien n'est improvisé.",
        },
      },
      {
        q: { vi: "Khách có biết đang nói chuyện với máy không?", en: "Will customers know it's a machine?", fr: "Le client saura-t-il que c'est une machine ?" },
        a: {
          vi: "Có, và điều đó được nói rõ. Trợ lý tự giới thiệu là trợ lý, và chuyển sang anh/chị ngay khi câu hỏi vượt ngoài phạm vi. Giả vờ là người thật thì mất lòng tin, mà lòng tin mới là thứ bán hàng.",
          en: "Yes, and that is stated plainly. The assistant introduces itself as one and hands over to you the moment a question goes beyond it. Pretending to be human costs trust, and trust is what sells.",
          fr: "Oui, et c'est dit clairement. L'assistant se présente comme tel et vous passe la main dès qu'une question le dépasse. Se faire passer pour un humain coûte la confiance, et c'est la confiance qui vend.",
        },
      },
      {
        q: {
          vi: "Website của tôi không do Neuraweb làm, có gắn chatbot được không?",
          en: "My website was not built by Neuraweb — can it still carry the chatbot?",
          fr: "Mon site n'a pas été fait par Neuraweb : peut-on quand même y mettre le chatbot ?",
        },
        a: {
          vi: "Được, nếu website cho phép chèn một đoạn mã nhỏ — phần lớn website làm sẵn hoặc tự lập trình đều cho phép. Chúng tôi kiểm tra trước khi báo giá. Trợ lý hiện ra dưới dạng khung chat ở góc màn hình và không đụng đến phần còn lại của trang.",
          en: "Yes, as long as the website lets you add a small snippet of code — most ready-made or custom-built sites do. We check before quoting. The assistant appears as a chat window in the corner and leaves the rest of the page untouched.",
          fr: "Oui, tant que le site accepte l'ajout d'un petit extrait de code — la plupart des sites, sur mesure ou clés en main, le permettent. On le vérifie avant de chiffrer. L'assistant apparaît en fenêtre de discussion dans un coin et ne touche pas au reste de la page.",
        },
      },
    ],
    tiers: AI_TIERS,
    floor: AI_TIERS[0].floor,
    monthly: AI_TIERS[0].monthly,
    leadTime: { vi: "2–8 tuần tùy gói", en: "2–8 weeks depending on the tier", fr: "2 à 8 semaines selon la formule" },
    cases: [
      {
        image: "svc-cas-ia-ecole",
        sector: {
          vi: "Trường mầm non, trung tâm đào tạo",
          en: "Nursery or training centre",
          fr: "École maternelle ou centre de formation",
        },
        situation: {
          vi: "Phụ huynh hỏi học phí, giờ đón trẻ và thủ tục nhập học vào buổi tối, sau giờ làm — lúc không còn ai ở văn phòng.",
          en: "Parents ask about fees, pick-up times and enrolment in the evening, after work — when the office is empty.",
          fr: "Les parents posent leurs questions sur les frais, les horaires de sortie et l'inscription le soir, après le travail — quand le bureau est vide.",
        },
        built: {
          vi: "Chatbot trên website và Zalo OA trả lời từ bảng học phí và quy định của trường, và ghi lại số điện thoại của phụ huynh muốn được gọi lại sáng hôm sau.",
          en: "A chatbot on the website and Zalo OA answers from the school's fee table and rules, and notes the number of any parent who wants a call back next morning.",
          fr: "Un chatbot sur le site et sur Zalo OA répond à partir de la grille des frais et du règlement, et note le numéro des parents qui veulent être rappelés le lendemain matin.",
        },
      },
      {
        image: "metier-clinique",
        sector: { vi: "Phòng khám, nha khoa", en: "Clinic or dental practice", fr: "Clinique ou cabinet dentaire" },
        situation: {
          vi: "Khách hỏi giá và giờ khám mọi lúc, đôi khi hỏi cả những điều thuộc về chuyên môn mà chỉ bác sĩ mới được trả lời.",
          en: "Patients ask about prices and opening hours at all hours, and sometimes about medical matters that only a doctor should answer.",
          fr: "Les patients demandent tarifs et horaires à toute heure, et parfois des choses médicales auxquelles seul un praticien doit répondre.",
        },
        built: {
          vi: "Trợ lý trả lời về giá và lịch khám, gợi ý đặt lịch, và từ chối đưa lời khuyên y tế — chuyển ngay cho nhân viên.",
          en: "The assistant answers on prices and schedules, offers to book, and declines to give medical advice — handing over to the team instead.",
          fr: "L'assistant répond sur les tarifs et les horaires, propose de réserver, et refuse de donner un avis médical — il passe la main à l'équipe.",
        },
      },
      {
        image: "svc-cas-ia-export",
        sector: { vi: "Nhà xuất khẩu, xưởng sản xuất", en: "Exporter or workshop", fr: "Exportateur ou atelier de fabrication" },
        situation: {
          vi: "Người mua ở châu Âu hoặc Mỹ gửi câu hỏi về mẫu mã, số lượng tối thiểu và thời gian giao hàng vào đúng lúc Hà Nội đang ngủ.",
          en: "Buyers in Europe or the US send questions on models, minimum order and lead time just when Hanoi is asleep.",
          fr: "Des acheteurs d'Europe ou des États-Unis posent leurs questions sur les modèles, les quantités minimales et les délais au moment précis où Hanoi dort.",
        },
        built: {
          vi: "Chatbot tiếng Anh trên website trả lời từ catalogue và điều kiện đặt hàng, rồi xin email để đội kinh doanh gửi báo giá.",
          en: "An English-language chatbot on the website answers from the catalogue and order terms, then asks for an email so the sales team can send a quote.",
          fr: "Un chatbot en anglais sur le site répond à partir du catalogue et des conditions de commande, puis demande un e-mail pour que l'équipe commerciale envoie un devis.",
        },
      },
      {
        image: "svc-cas-ia-chaine",
        sector: {
          vi: "Chuỗi vài cơ sở",
          en: "Small multi-outlet business",
          fr: "Petite chaîne de quelques points de vente",
        },
        situation: {
          vi: "Nhân viên mới ở mỗi cơ sở hỏi đi hỏi lại quản lý về công thức, bảng giá và quy trình mở cửa.",
          en: "New staff at each outlet keep asking the manager about recipes, price lists and opening procedures.",
          fr: "Les nouveaux employés de chaque point de vente demandent sans cesse au responsable les recettes, les tarifs et la procédure d'ouverture.",
        },
        built: {
          vi: "Trợ lý nội bộ mà nhân viên hỏi ngay trên điện thoại, trả lời từ sổ tay nhân viên và bảng giá, kèm dẫn nguồn để kiểm tra lại.",
          en: "An internal assistant staff can ask on their phone, answering from the staff handbook and price list, with its source cited so they can double-check.",
          fr: "Un assistant interne que les employés interrogent sur leur téléphone, qui répond à partir du guide du personnel et de la grille des prix, en citant sa source pour vérifier.",
        },
      },
    ],
    process: [
      {
        image: STEP_IMAGE.call,
        title: {
          vi: "Gom thông tin của doanh nghiệp",
          en: "Gather your business information",
          fr: "Rassembler les informations de votre activité",
        },
        when: { vi: "Tuần 1", en: "Week 1", fr: "Semaine 1" },
        detail: {
          vi: "Buổi trao đổi 15 phút, rồi anh/chị đưa bảng giá, câu hỏi thường gặp, catalogue hoặc tài liệu. Trợ lý chỉ biết những gì anh/chị đưa.",
          en: "A 15-minute call, then you hand over price lists, common questions, catalogue or documents. The assistant only knows what you give it.",
          fr: "Un échange de 15 minutes, puis vous remettez tarifs, questions fréquentes, catalogue ou documents. L'assistant ne sait que ce que vous lui donnez.",
        },
      },
      {
        image: STEP_IMAGE.quote,
        title: {
          vi: "Đặt cọc 50% và cài đặt trợ lý",
          en: "50% deposit, then set-up",
          fr: "Acompte 50 % puis paramétrage",
        },
        when: { vi: "Tuần 1–2", en: "Weeks 1–2", fr: "Semaines 1–2" },
        detail: {
          vi: "Thiết lập giọng nói, phạm vi trả lời, và lúc nào thì chuyển cho anh/chị.",
          en: "Tone of voice, scope of answers, and the moment it hands over to you.",
          fr: "Ton, périmètre des réponses, et moment où il vous passe la main.",
        },
      },
      {
        title: {
          vi: "Thử bằng những câu hỏi khó",
          en: "Test with your trickiest questions",
          fr: "Essai avec vos questions pièges",
        },
        when: { vi: "Trước khi mở cho khách", en: "Before opening to customers", fr: "Avant l'ouverture au public" },
        detail: {
          vi: "Anh/chị và nhân viên hỏi thử những câu khó nhất. Chỗ nào trả lời sai hoặc bịa ra thì sửa, cho đến khi anh/chị yên tâm.",
          en: "You and your staff throw the hardest questions at it. Wherever it gets something wrong or invents, we fix it until you're comfortable.",
          fr: "Vous et vos équipes lui posez les questions les plus difficiles. Partout où il se trompe ou invente, on corrige jusqu'à ce que vous soyez rassuré.",
        },
      },
      {
        image: STEP_IMAGE.handover,
        title: {
          vi: "Mở cho khách và theo dõi",
          en: "Go live and monitor",
          fr: "Mise en ligne et suivi",
        },
        when: { vi: "Cuối dự án, rồi hằng tháng", en: "End of the project, then monthly", fr: "En fin de projet, puis chaque mois" },
        detail: {
          vi: "Bật trên website hoặc Zalo, thanh toán phần còn lại. Những tuần đầu chúng tôi đọc các cuộc trò chuyện thật và bổ sung phần còn thiếu; phí duy trì hằng tháng bắt đầu từ đây.",
          en: "Switched on for your website or Zalo, balance paid. In the first weeks we read real conversations and fill any gap; the monthly upkeep starts here.",
          fr: "Mise en route sur votre site ou Zalo, règlement du solde. Les premières semaines, on lit les vraies conversations et on comble les manques ; l'entretien mensuel démarre ici.",
        },
      },
    ],
    card: "svc-accueil-ia",
    hero: {
      image: "svc-hero-ia",
      video: true,
      illustration: true,
      alt: {
        vi: "Một người phụ nữ nhắn tin bằng điện thoại trong phòng tối lúc khuya, đèn ngủ vàng và quạt trần đang quay",
        en: "A woman typing on her phone late at night in a dark bedroom, a warm bedside lamp and a ceiling fan turning",
        fr: "Une femme écrit sur son téléphone tard le soir dans une chambre sombre, lampe chaude et ventilateur au plafond",
      },
    },
    banner: {
      image: "svc-probleme-ia",
      focus: "center 65%",
      alt: {
        vi: "Điện thoại đặt trên bàn đầu giường, cạnh cặp kính và ly nước, ánh đèn đường lọt qua cửa chớp",
        en: "A phone on a bedside table next to reading glasses and a glass of water, street light through louvered shutters",
        fr: "Un téléphone sur une table de chevet, près de lunettes et d'un verre d'eau, lumière de rue à travers les persiennes",
      },
      at: "problems",
    },
    proof: {
      note: {
        vi: "Ảnh chụp thật, không chỉnh sửa — trợ lý của chính Neuraweb, đang chạy trên trang này (giao diện tiếng Việt). Trợ lý có thể trả lời sai sót; giá chính thức xem ở bảng giá.",
        en: "Real screenshots, unedited — Neuraweb's own assistant, running on this page (Vietnamese interface). It can make mistakes; the official price is the one on the pricing page.",
        fr: "Captures réelles, non retouchées — l'assistant de Neuraweb lui-même, tel qu'il tourne sur cette page (interface en vietnamien). Il peut se tromper ; le prix officiel est celui de la page des tarifs.",
      },
      items: [
        {
          image: "svc-chat-salutation",
          alt: {
            vi: "Khung chat của trợ lý: lời chào tự giới thiệu là trợ lý, kèm dòng lưu ý “Trả lời tự động, có thể sai sót”",
            en: "The chat window: the assistant introduces itself as one, with the note “Automatic replies, mistakes possible”",
            fr: "La fenêtre de discussion : l'assistant se présente comme tel, avec la mention « Réponse automatique, erreurs possibles »",
          },
          caption: {
            vi: "Lời chào: trợ lý tự giới thiệu là trợ lý và nói rõ đây là trả lời tự động.",
            en: "The greeting: it introduces itself as an assistant and says its replies are automatic.",
            fr: "La salutation : il se présente comme un assistant et précise que ses réponses sont automatiques.",
          },
        },
        {
          image: "svc-chat-prix",
          alt: {
            vi: "Trợ lý trả lời câu hỏi về giá mà không nêu số tiền nào, dẫn tới trang Bảng giá luôn cập nhật",
            en: "The assistant answers a price question without quoting any amount, and points to the always up-to-date pricing page",
            fr: "L'assistant répond à une question de prix sans citer de montant, et renvoie vers la page des tarifs, toujours à jour",
          },
          caption: {
            vi: "Câu hỏi về giá: trợ lý không tự nêu số tiền mà dẫn tới trang Bảng giá, luôn cập nhật — nên không thể nhầm.",
            en: "A price question: the assistant quotes no amount and points to the pricing page, always up to date — so it cannot get it wrong.",
            fr: "Une question de prix : l'assistant ne cite aucun montant et renvoie vers la page des tarifs, toujours à jour — il ne peut donc pas se tromper.",
          },
        },
        {
          image: "svc-chat-rappel",
          alt: {
            vi: "Chọn ngày để đặt lịch trao đổi 15 phút, theo giờ Hà Nội",
            en: "Choosing a day to book a 15-minute call, in Hanoi time",
            fr: "Choix du jour pour réserver un échange de 15 minutes, en heure de Hanoi",
          },
          caption: {
            vi: "Đặt lịch trao đổi 15 phút: khách chọn ngày, giờ Hà Nội.",
            en: "Booking a 15-minute call: the visitor picks a day, in Hanoi time.",
            fr: "Réserver un échange de 15 minutes : le visiteur choisit un jour, en heure de Hanoi.",
          },
        },
      ],
    },
    accent: "#8E2A20",
    icon: "🤖",
  },
];

export const SERVICE_IDS: ServiceId[] = SERVICES.map((s) => s.id);

export function getService(slug: string): Service | undefined {
  return SERVICES.find((s) => s.slug === slug || s.id === slug);
}
