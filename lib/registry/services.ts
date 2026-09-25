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
 * ⚠️ PLANCHERS À VALIDER, mais adossés au marché de Hanoi (relevé de
 * septembre 2026, sources dans le README) :
 *   - application mobile : 35–80 M₫ pour une app simple chez les agences
 *     locales, 150 M₫ et plus dès que le code source est remis ;
 *   - chatbot sur mesure : 125–375 M₫ au premier niveau, quand les
 *     plateformes SaaS génériques tournent à 150 k₫–2 M₫/mois. Entre les
 *     deux, rien — c'est le trou qu'occupe cette offre ;
 *   - automatisation : aucun marché packagé ici, surtout de la revente de
 *     licences. Le repère est l'heure, 35 à 55 USD pour un développeur
 *     confirmé à Hanoi.
 *
 * L'escalier qui en résulte, paliers de sites compris :
 * 4,9 (site) → 9,9 (automatisation) → 11,9 (site) → 19,9 (IA) →
 * 24,9 (site) → 49,9 (app) → 60 (Doanh Nghiệp).
 */

export type ServiceId = "mobile" | "automatisation" | "ia";

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
  /** Plancher indicatif en ₫. Le devis se fait après un échange. */
  floor: number;
  monthly?: number;
  leadTime: L10n;
  accent: string;
  icon: string;
};

export const SERVICES: Service[] = [
  {
    id: "mobile",
    slug: "ung-dung-android",
    name: { vi: "Ứng dụng Android", en: "Android app", fr: "Application Android" },
    tagline: {
      vi: "Quán của anh/chị, nằm sẵn trong điện thoại khách",
      en: "Your business, sitting on the customer's phone",
      fr: "Votre établissement, posé sur le téléphone du client",
    },
    promise: {
      vi: "Quán của anh/chị nằm sẵn trong điện thoại khách, không phải chờ khách nhớ ra mà tìm lại.",
      en: "Your business sits on the customer's phone, instead of waiting to be remembered and searched for again.",
      fr: "Votre établissement est posé sur le téléphone du client, au lieu d'attendre qu'il pense à vous rechercher.",
    },
    problems: [
      {
        vi: "Thẻ tích điểm bằng giấy: khách làm mất, nhân viên quên đóng dấu, và không ai biết ai đến bao nhiêu lần.",
        en: "The paper loyalty card: customers lose it, staff forget to stamp it, and nobody knows who came how often.",
        fr: "La carte de fidélité en carton : le client la perd, l'employé oublie de tamponner, et personne ne sait qui vient combien de fois.",
      },
      {
        vi: "Khuyến mãi đăng lên Facebook chìm sau ba tiếng, đúng những khách quen nhất lại không thấy.",
        en: "A promotion posted on Facebook sinks within three hours, and the most loyal customers are exactly the ones who miss it.",
        fr: "Une promo publiée sur Facebook disparaît en trois heures, et ce sont justement vos habitués qui ne la voient pas.",
      },
      {
        vi: "Khách muốn đặt lại đúng món hôm trước, nhưng phải nhắn tin mô tả lại từ đầu.",
        en: "A customer wants the same order as last time, and has to describe it from scratch in a message.",
        fr: "Un client veut recommander la même chose que la dernière fois, et doit tout redécrire dans un message.",
      },
    ],
    bullets: [
      {
        vi: "Thẻ tích điểm trong điện thoại, quét mã là cộng điểm — không còn thẻ giấy để mất.",
        en: "A loyalty card inside the phone, points added by scanning a code — no paper left to lose.",
        fr: "Une carte de fidélité dans le téléphone, les points s'ajoutent en scannant un code — plus de carton à perdre.",
      },
      {
        vi: "Đặt món hoặc đặt lịch trong vài lần chạm, kèm lịch sử đơn cũ để đặt lại một chạm.",
        en: "Ordering or booking in a few taps, with past orders kept so re-ordering takes one.",
        fr: "Commande ou réservation en quelques touches, avec l'historique pour recommander en une seule.",
      },
      {
        vi: "Thông báo đẩy khi có khuyến mãi — đến thẳng màn hình khách, không qua thuật toán của ai.",
        en: "Push notifications for promotions — straight to the customer's screen, through nobody's algorithm.",
        fr: "Des notifications pour vos promos — droit sur l'écran du client, sans passer par l'algorithme de personne.",
      },
      {
        vi: "Đưa lên Google Play dưới tên của anh/chị, và mã nguồn bàn giao nếu anh/chị yêu cầu.",
        en: "Published on Google Play under your name, with the source code handed over on request.",
        fr: "Publiée sur Google Play à votre nom, code source remis sur demande.",
      },
    ],
    forWhom: {
      vi: "Có khách quay lại đều đặn — quán quen, phòng gym, salon có khách ruột.",
      en: "You have regulars who come back — a neighbourhood café, a gym, a salon with a loyal base.",
      fr: "Vous avez des habitués qui reviennent — un café de quartier, une salle de sport, un salon avec sa clientèle.",
    },
    notForWhom: {
      vi: "Nếu khách chỉ ghé một lần rồi thôi — quán trong khu du lịch, cửa hàng bán cho khách vãng lai — thì ứng dụng chưa đáng tiền. Một trang web tốt sẽ có ích hơn.",
      en: "If customers come once and never return — a spot in a tourist area, a shop selling to passers-by — an app is not worth it yet. A good website will do more.",
      fr: "Si vos clients viennent une fois et ne reviennent pas — un lieu de passage touristique, une boutique de rue — l'application n'en vaut pas encore la peine. Un bon site vous servira davantage.",
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
          vi: "Chỉ khi có lý do. Lý do thường là điểm tích lũy: khách tải để không mất phần thưởng đang tích. Vì vậy thẻ tích điểm luôn là thứ làm trước, không phải làm sau.",
          en: "Only if there is a reason. The reason is usually points: they install it so as not to lose the reward they are building up. That is why the loyalty card is built first, not last.",
          fr: "Seulement s'ils ont une raison. Cette raison, c'est presque toujours les points : on installe pour ne pas perdre la récompense en cours. C'est pourquoi la carte de fidélité se construit en premier, pas en dernier.",
        },
      },
    ],
    floor: 49_900_000,
    leadTime: { vi: "4–6 tuần", en: "4–6 weeks", fr: "4 à 6 semaines" },
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
        vi: "Đơn đặt đến từ Zalo, từ Facebook, từ điện thoại — rồi tối đến phải chép tay lại vào một chỗ.",
        en: "Orders arrive on Zalo, on Facebook, by phone — and every evening you copy them by hand into one place.",
        fr: "Les commandes arrivent par Zalo, par Facebook, par téléphone — et le soir, vous les recopiez à la main au même endroit.",
      },
      {
        vi: "Khách quên lịch hẹn vì không ai kịp nhắn nhắc, và chỗ trống đó không bán lại được.",
        en: "A customer misses their slot because nobody had time to send a reminder, and that slot cannot be resold.",
        fr: "Un client oublie son rendez-vous faute de rappel, et ce créneau-là ne se revend pas.",
      },
      {
        vi: "Muốn biết hôm nay bán được bao nhiêu thì phải mở ba chỗ và cộng tay.",
        en: "Knowing what you took today means opening three places and adding it up by hand.",
        fr: "Savoir ce que vous avez encaissé aujourd'hui demande d'ouvrir trois endroits et d'additionner à la main.",
      },
    ],
    bullets: [
      {
        vi: "Đơn từ Zalo và Facebook tự rơi vào một bảng tính duy nhất, đúng định dạng anh/chị cần.",
        en: "Orders from Zalo and Facebook drop by themselves into a single spreadsheet, in the format you need.",
        fr: "Les commandes de Zalo et Facebook tombent seules dans un tableur unique, au format dont vous avez besoin.",
      },
      {
        vi: "Tin nhắn nhắc khách trước hẹn 24 giờ, tự gửi, không cần ai nhớ.",
        en: "A reminder goes out 24 hours before the slot, on its own, with nobody to remember it.",
        fr: "Un rappel part 24 h avant le créneau, tout seul, sans que personne ait à y penser.",
      },
      {
        vi: "Tổng kết doanh thu mỗi tối gửi về điện thoại anh/chị, đã cộng sẵn.",
        en: "The day's takings reach your phone each evening, already totalled.",
        fr: "Le chiffre du jour arrive sur votre téléphone chaque soir, déjà additionné.",
      },
      {
        vi: "Đồng bộ tồn kho với KiotViet hoặc Sapo, và chuẩn bị sẵn hóa đơn VAT.",
        en: "Stock synced with KiotViet or Sapo, and VAT invoices prepared in advance.",
        fr: "Le stock synchronisé avec KiotViet ou Sapo, et les factures VAT préparées d'avance.",
      },
    ],
    forWhom: {
      vi: "Mỗi ngày mất khoảng một giờ cho những việc chép đi chép lại. Một giờ mỗi ngày là hơn ba mươi giờ mỗi tháng.",
      en: "You lose about an hour a day to copying things back and forth. An hour a day is more than thirty hours a month.",
      fr: "Vous perdez environ une heure par jour à recopier les mêmes choses. Une heure par jour, c'est plus de trente heures par mois.",
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
        q: { vi: "Nếu hỏng thì sao?", en: "What if it breaks?", fr: "Et si ça tombe en panne ?" },
        a: {
          vi: "Anh/chị được báo ngay khi có lỗi, và mọi thứ vẫn làm được bằng tay như trước — không có việc nào bị khóa cứng vào hệ thống. Phí duy trì hằng tháng là để theo dõi và sửa khi công cụ bên ngoài thay đổi.",
          en: "You are told the moment something fails, and everything can still be done by hand as before — nothing gets locked inside the system. The monthly fee pays for watching it and fixing it when an outside tool changes.",
          fr: "Vous êtes prévenu dès qu'une étape échoue, et tout reste faisable à la main comme avant — rien n'est enfermé dans le système. L'entretien mensuel paie la surveillance et la réparation quand un outil extérieur change.",
        },
      },
    ],
    floor: 9_900_000,
    monthly: 990_000,
    leadTime: { vi: "1–3 tuần", en: "1–3 weeks", fr: "1 à 3 semaines" },
    accent: "#9A5B23",
    icon: "⚙️",
  },

  {
    id: "ia",
    slug: "tich-hop-ai",
    name: { vi: "Tích hợp AI", en: "AI integration", fr: "Intégration d'IA" },
    tagline: {
      vi: "Trả lời khách lúc nửa đêm, không cần anh/chị thức",
      en: "Answering at midnight, without you being awake",
      fr: "Répondre à minuit, sans que vous soyez debout",
    },
    promise: {
      vi: "Khách hỏi lúc 11 giờ đêm vẫn có người trả lời, còn anh/chị thì đang ngủ.",
      en: "A customer asking at 11pm still gets an answer, while you are asleep.",
      fr: "Le client qui écrit à 23 h obtient une réponse, pendant que vous dormez.",
    },
    problems: [
      {
        vi: "Tin nhắn Zalo và bình luận Facebook đến cả ngày lẫn đêm, và mười câu hỏi giống hệt nhau lặp lại mỗi tuần.",
        en: "Zalo messages and Facebook comments arrive day and night, and the same ten questions come back every week.",
        fr: "Les messages Zalo et les commentaires Facebook tombent jour et nuit, et les dix mêmes questions reviennent chaque semaine.",
      },
      {
        vi: "Khách hỏi giá lúc nửa đêm, sáng mai mới trả lời được — đến lúc đó họ đã đặt chỗ khác.",
        en: "Someone asks the price at midnight and you answer next morning — by then they have booked elsewhere.",
        fr: "Quelqu'un demande un prix à minuit, vous répondez le lendemain — entre-temps il a réservé ailleurs.",
      },
      {
        vi: "Chatbot dựng sẵn ngoài thị trường trả lời chung chung, không biết gì về quán của anh/chị.",
        en: "Off-the-shelf chatbots answer in generalities and know nothing about your business.",
        fr: "Les chatbots tout faits répondent en généralités et ne connaissent rien à votre établissement.",
      },
    ],
    bullets: [
      {
        vi: "Trợ lý trả lời trên website và trên Zalo OA, bằng tiếng Việt và tiếng Anh.",
        en: "An assistant answering on your site and on Zalo OA, in Vietnamese and English.",
        fr: "Un assistant qui répond sur votre site et sur Zalo OA, en vietnamien et en anglais.",
      },
      {
        vi: "Chỉ nói về quán của anh/chị — giá, giờ mở cửa, đường đi, đặt lịch — và chỉ dựa trên thông tin anh/chị đưa.",
        en: "Talking only about your business — prices, hours, directions, bookings — and only from what you give it.",
        fr: "Qui ne parle que de votre établissement — prix, horaires, itinéraire, réservations — et uniquement à partir de ce que vous lui donnez.",
      },
      {
        vi: "Tự trả lời bình luận Facebook, và chuyển cho anh/chị khi câu hỏi vượt ngoài phạm vi.",
        en: "Auto-replies to Facebook comments, and hands over to you when a question goes beyond its scope.",
        fr: "Réponses automatiques aux commentaires Facebook, et passage de relais dès qu'une question sort de son périmètre.",
      },
      {
        vi: "Viết mô tả sản phẩm, tóm tắt đánh giá của khách để anh/chị biết họ khen chê gì.",
        en: "Product descriptions written for you, customer reviews summarised so you know what they praise and what they don't.",
        fr: "Fiches produits rédigées, avis clients résumés pour savoir ce qu'on vous reproche.",
      },
    ],
    forWhom: {
      vi: "Trả lời tin nhắn chiếm mất buổi tối, và một phần khách hỏi xong không thấy quay lại.",
      en: "Answering messages eats your evenings, and some of the people who ask never come back.",
      fr: "Répondre aux messages vous prend vos soirées, et une partie de ceux qui demandent ne revient jamais.",
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
    ],
    floor: 19_900_000,
    monthly: 990_000,
    leadTime: { vi: "2–4 tuần", en: "2–4 weeks", fr: "2 à 4 semaines" },
    accent: "#8E2A20",
    icon: "🤖",
  },
];

export const SERVICE_IDS: ServiceId[] = SERVICES.map((s) => s.id);

export function getService(slug: string): Service | undefined {
  return SERVICES.find((s) => s.slug === slug || s.id === slug);
}
