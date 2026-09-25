import type { L10n } from "@/lib/registry";

/**
 * Les trois prestations de développement que neuraweb.fr vend en France,
 * transposées au marché de Hanoi : application Android, automatisation,
 * intégration d'IA.
 *
 * Ce ne sont PAS des paliers de la grille (`packs.ts`) : un pack se vend sur
 * catalogue, ces trois-là se chiffrent après un échange, comme Doanh Nghiệp.
 * D'où un simple `floor` — un plancher annoncé — et pas un prix ferme.
 *
 * ⚠️ PRIX À VALIDER (`confirm: true`), mais ADOSSÉS AU MARCHÉ DE HANOI.
 *
 * Une première version divisait les montants français par 8,8 — le rapport
 * observé entre les deux grilles de sites (Starter 1 490 € ↔ 4,9 M₫). La
 * méthode était fausse : ce rapport décrit le marché du site vitrine, qui est
 * commoditisé ici (des sites à 3 M₫ existent). L'app mobile, l'automatisation
 * et l'IA ne se vendent pas sur ce marché-là, et leurs prix locaux sont
 * ancrés sur des références d'entreprise, pas sur la concurrence des petits
 * studios. Le facteur réel est plus proche de 3 que de 9.
 *
 * Relevé de marché, septembre 2026 (sources dans le README) :
 *   - Application mobile : 35–80 M₫ pour une app simple, 60–150 M₫ en
 *     standard, 150 M₫ et plus quand le code source est remis. Une agence de
 *     Hanoi affiche « à partir de 60 M₫ » SANS remise du code ni publication
 *     sur le store.
 *   - Chatbot IA sur mesure : 125–375 M₫ pour un niveau FAQ mono-canal,
 *     750 M₫ et plus pour du RAG multilingue. En face, les plateformes SaaS
 *     génériques (Ahachat, Fchat, Botbanhang) tournent à 150 k₫–2 M₫/mois.
 *     Entre les deux, rien : c'est exactement le trou que cette offre occupe.
 *   - Automatisation : aucun marché packagé au Vietnam, surtout de la revente
 *     de licences. Le repère est donc l'heure de travail — 35 à 55 USD/h pour
 *     un développeur confirmé à Hanoi, soit 900 k₫ à 1,4 M₫.
 *
 * Les planchers ci-dessous se lisent ainsi : sous la référence marché pour
 * rester vendable à un commerçant, et assez haut pour que la prestation ne
 * passe pas pour un gadget. Ils s'insèrent dans l'escalier existant :
 * 4,9 (site) → 9,9 (automatisation) → 11,9 (site) → 19,9 (IA) →
 * 24,9 (site) → 49,9 (app) → 60 (Doanh Nghiệp).
 *
 * Ce qui change vraiment d'un marché à l'autre n'est pas le prix mais les
 * OUTILS : ici, Zalo, Facebook, KiotViet, VietQR et la facture VAT. Un
 * argumentaire recopié de la France parlerait de Slack et de HubSpot, et ne
 * dirait rien à un gérant de quán ăn.
 */
export type Service = {
  id: "mobile" | "automatisation" | "ia";
  name: L10n;
  /** Ce que ça change, en une phrase. */
  promise: L10n;
  /** Ce qu'on fait concrètement, avec les outils d'ici. */
  examples: L10n;
  forWhom: L10n;
  /** Plancher indicatif en ₫. Le devis se fait après un échange. */
  floor: number;
  /** Entretien mensuel indicatif, quand la prestation en demande un. */
  monthly?: number;
  leadTime: L10n;
  /** Montants dérivés, pas encore arbitrés par Nacer. */
  confirm: true;
};

export const SERVICES: Service[] = [
  {
    id: "mobile",
    name: {
      vi: "Ứng dụng Android",
      en: "Android app",
      fr: "Application Android",
    },
    promise: {
      vi: "Quán của anh/chị nằm sẵn trong điện thoại khách, không phải chờ khách nhớ ra mà tìm lại.",
      en: "Your business sits on the customer's phone, instead of waiting to be remembered and searched for again.",
      fr: "Votre établissement est posé sur le téléphone du client, au lieu d'attendre qu'il pense à vous rechercher.",
    },
    examples: {
      vi: "Thẻ tích điểm thay thẻ giấy hay bị mất, đặt món hoặc đặt lịch trong vài lần chạm, thông báo đẩy khi có khuyến mãi, lịch sử đơn cũ. Đưa lên Google Play dưới tên của anh/chị. Làm Android trước vì phần lớn khách ở Hà Nội dùng Android; iPhone tính sau nếu cần.",
      en: "A loyalty card that replaces the paper one customers keep losing, ordering or booking in a few taps, push notifications for promotions, past-order history. Published on Google Play under your name. Android first, because that is what most customers in Hanoi carry; iPhone later if it turns out to be needed.",
      fr: "Une carte de fidélité qui remplace celle en carton que vos clients perdent, la commande ou la réservation en quelques touches, des notifications quand vous lancez une promo, l'historique des commandes. Publiée sur Google Play à votre nom. Android d'abord, parce que c'est ce que la plupart des clients de Hanoi ont en main ; l'iPhone plus tard si le besoin apparaît.",
    },
    forWhom: {
      vi: "Có khách quay lại đều đặn — quán quen, phòng gym, salon có khách ruột. Nếu khách chỉ đến một lần thì chưa cần ứng dụng.",
      en: "You have regulars who come back — a neighbourhood café, a gym, a salon with a loyal base. If customers come once, an app is not what you need.",
      fr: "Vous avez des habitués qui reviennent — un café de quartier, une salle de sport, un salon avec sa clientèle. Si vos clients ne viennent qu'une fois, une application n'est pas ce qu'il vous faut.",
    },
    // 49,9 M₫ : sous les 60 M₫ affichés par les agences de Hanoi pour une app
    // simple, ET le code source est remis — ce que les mêmes agences facturent
    // à partir de 150 M₫. L'argument de vente tient dans cet écart.
    floor: 49_900_000,
    leadTime: { vi: "4–6 tuần", en: "4–6 weeks", fr: "4 à 6 semaines" },
    confirm: true,
  },

  {
    id: "automatisation",
    name: {
      vi: "Tự động hóa công việc",
      en: "Workflow automation",
      fr: "Automatisation",
    },
    promise: {
      vi: "Những việc anh/chị làm đi làm lại mỗi tối sẽ tự chạy, không cần ai bấm nút.",
      en: "The things you redo every evening run on their own, with nobody pressing a button.",
      fr: "Ce que vous refaites tous les soirs tourne tout seul, sans que personne appuie sur un bouton.",
    },
    examples: {
      vi: "Đơn đặt từ Zalo hay Facebook tự vào bảng tính, nhắc khách trước hẹn 24 giờ, tổng hợp doanh thu gửi về máy anh/chị mỗi tối, đồng bộ tồn kho với KiotViet hoặc Sapo, chuẩn bị hóa đơn VAT. Nối vào những công cụ anh/chị đang dùng, không bắt đổi cách làm.",
      en: "Orders from Zalo or Facebook drop into a spreadsheet by themselves, customers get a reminder 24 hours before their slot, the day's takings reach your phone every evening, stock syncs with KiotViet or Sapo, VAT invoices get prepared. Plugged into the tools you already use — you change nothing in how you work.",
      fr: "Les commandes arrivées par Zalo ou Facebook tombent seules dans un tableur, le client reçoit un rappel 24 h avant son créneau, le chiffre du jour arrive sur votre téléphone chaque soir, le stock se synchronise avec KiotViet ou Sapo, les factures VAT se préparent. Branché sur les outils que vous utilisez déjà — vous ne changez rien à votre façon de travailler.",
    },
    forWhom: {
      vi: "Mỗi ngày mất một giờ để chép tay đơn hàng, nhắn nhắc khách, cộng sổ. Một giờ mỗi ngày là hơn ba mươi giờ mỗi tháng.",
      en: "You lose an hour a day copying orders by hand, sending reminders, adding up the till. An hour a day is more than thirty hours a month.",
      fr: "Vous perdez une heure par jour à recopier des commandes, envoyer des rappels, faire vos comptes. Une heure par jour, c'est plus de trente heures par mois.",
    },
    // 9,9 M₫ ≈ 8 à 10 heures au tarif d'un développeur confirmé de Hanoi.
    // L'ancienne valeur, 3,9 M₫, revenait à facturer trois heures un chantier
    // qui en demande deux à cinq jours.
    floor: 9_900_000,
    monthly: 990_000,
    leadTime: { vi: "1–3 tuần", en: "1–3 weeks", fr: "1 à 3 semaines" },
    confirm: true,
  },

  {
    id: "ia",
    name: {
      vi: "Tích hợp AI",
      en: "AI integration",
      fr: "Intégration d'IA",
    },
    promise: {
      vi: "Khách hỏi lúc 11 giờ đêm vẫn có người trả lời, còn anh/chị thì đang ngủ.",
      en: "A customer asking at 11pm still gets an answer, while you are asleep.",
      fr: "Le client qui écrit à 23 h obtient une réponse, pendant que vous dormez.",
    },
    examples: {
      vi: "Trợ lý trả lời trên website và trên Zalo OA, bằng tiếng Việt và tiếng Anh, chỉ nói về quán của anh/chị — giá, giờ mở cửa, đường đi, đặt lịch. Tự trả lời bình luận Facebook. Viết mô tả sản phẩm. Tóm tắt đánh giá của khách để anh/chị biết họ khen chê gì. Trợ lý chỉ trả lời từ thông tin anh/chị đưa, không tự bịa.",
      en: "An assistant answering on your site and on Zalo OA, in Vietnamese and English, talking only about your business — prices, opening hours, directions, bookings. Auto-replies to Facebook comments. Product descriptions written for you. Customer reviews summarised so you know what they praise and what they don't. It answers only from what you give it, and invents nothing.",
      fr: "Un assistant qui répond sur votre site et sur Zalo OA, en vietnamien et en anglais, et qui ne parle que de votre établissement — prix, horaires, itinéraire, réservations. Réponses automatiques aux commentaires Facebook. Fiches produits rédigées. Avis clients résumés pour savoir ce qu'on vous reproche. Il ne répond qu'à partir de ce que vous lui donnez, et n'invente rien.",
    },
    forWhom: {
      vi: "Tin nhắn Zalo và bình luận Facebook đến cả ngày lẫn đêm, và mười câu hỏi giống hệt nhau lặp lại mỗi tuần.",
      en: "Zalo messages and Facebook comments arrive day and night, and the same ten questions come back every week.",
      fr: "Les messages Zalo et les commentaires Facebook tombent jour et nuit, et les dix mêmes questions reviennent chaque semaine.",
    },
    // 19,9 M₫ : six fois moins que le premier prix d'agence pour un chatbot
    // sur mesure (125 M₫), et très au-dessus d'un abonnement SaaS générique —
    // ce qui est livré n'est pas un widget de questions-réponses mais un
    // assistant qui ne parle que de SON commerce, en deux langues.
    // L'ancienne valeur, 4,9 M₫, ne payait même pas un mois du SaaS d'en face.
    floor: 19_900_000,
    monthly: 990_000,
    leadTime: { vi: "2–4 tuần", en: "2–4 weeks", fr: "2 à 4 semaines" },
    confirm: true,
  },
];
