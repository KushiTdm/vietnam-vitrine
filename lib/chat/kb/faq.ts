import type { L10n } from "@/lib/registry";

/**
 * La FAQ du chatbot — la seule partie de la base de connaissances écrite à la
 * main. Tout le reste (packs, options, non-inclus, métiers, jeu) est dérivé du
 * registre et de `qua-tang/data.ts` : ne PAS recopier ici un prix ou une
 * fonctionnalité qui y figure déjà, il deviendrait faux au premier changement.
 *
 * Ce fichier est fait pour grossir : chaque question posée deux fois en
 * rendez-vous mérite une entrée. Ajouter une entrée suffit, le reste (index,
 * récupération, prompt) s'adapte tout seul.
 *
 * Règles de rédaction, non négociables :
 *   - aucune coordonnée (numéro, e-mail, adresse) : on renvoie au bouton de
 *     contact de la page ;
 *   - jamais « déploiement offert » : l'écrit dit toujours « non inclus » ;
 *   - jamais le mot « CMS », ni le nom d'un hébergeur ou d'un prestataire ;
 *   - une réponse courte, chiffrée quand c'est possible.
 *
 * `confirm: true` marque une réponse déduite d'une pratique évidente plutôt
 * que d'un document publié : à relire et à figer par Nacer.
 */
export type FaqEntry = {
  id: string;
  question: L10n;
  answer: L10n;
  /** Termes de recherche supplémentaires, toutes langues confondues. */
  keywords?: string[];
  /** Réponse déduite, pas documentée — à valider. */
  confirm?: true;
  /**
   * `false` interdit de servir cette réponse telle quelle, sans passer par le
   * modèle. À mettre sur les entrées qui sont des OCCASIONS DE VENTE : « mes
   * clients peuvent-ils réserver ? » appelle une recommandation de palier avec
   * son prix, pas un paragraphe figé. Les entrées administratives (domaine,
   * paiement, garantie) n'ont rien à gagner d'un détour par le modèle : leur
   * texte écrit à la main est déjà la meilleure réponse possible.
   */
  direct?: false;
};

export const FAQ: FaqEntry[] = [
  {
    id: "paiement",
    question: {
      vi: "Thanh toán thế nào?",
      en: "How do I pay?",
      fr: "Comment se passe le paiement ?",
    },
    answer: {
      vi: "Đặt cọc 50% để bắt đầu, phần còn lại thanh toán khi bàn giao. Không có phí ẩn, không hoa hồng trên doanh thu của anh/chị.",
      en: "A 50% deposit starts the work, the balance is paid on delivery. No hidden fees, and no commission on your sales.",
      fr: "Un acompte de 50 % lance le travail, le solde est réglé à la livraison. Pas de frais cachés, et aucune commission sur vos ventes.",
    },
    keywords: ["dat coc", "acompte", "deposit", "50%", "facture", "hoa don", "invoice"],
    confirm: true,
  },
  {
    id: "delai",
    question: {
      vi: "Bao lâu thì có web?",
      en: "How long until the site is live?",
      fr: "En combien de temps le site est-il en ligne ?",
    },
    answer: {
      vi: "Thời gian tính từ lúc nhận đủ nội dung: 5 ngày cho Khởi Đầu, 7 ngày cho Phát Triển, 10–14 ngày cho Cao Cấp. Chậm nhất luôn là lúc chờ ảnh và thông tin từ phía anh/chị.",
      en: "Counted from the moment all content is in: 5 days for Khởi Đầu, 7 days for Phát Triển, 10–14 days for Cao Cấp. The slow part is always waiting for your photos and details.",
      fr: "Le délai court à partir de la réception de l'intégralité du contenu : 5 jours pour Khởi Đầu, 7 jours pour Phát Triển, 10 à 14 jours pour Cao Cấp. Ce qui retarde, c'est toujours l'attente des photos et des informations.",
    },
    keywords: ["bao lau", "delai", "lead time", "how long", "nhanh", "urgent", "combien de temps"],
  },
  {
    id: "contenu-a-fournir",
    question: {
      vi: "Tôi cần chuẩn bị gì?",
      en: "What do I need to provide?",
      fr: "Que dois-je fournir ?",
    },
    answer: {
      vi: "Tên và địa chỉ cơ sở, số điện thoại và Zalo, giờ mở cửa, danh sách món hoặc dịch vụ kèm giá, và ảnh. Nếu chưa có ảnh đẹp, có tùy chọn chụp ảnh sản phẩm. Gửi gọn một lần là nhanh nhất.",
      en: "Your business name and address, phone and Zalo, opening hours, your list of items or services with prices, and photos. If you don't have good photos, a product shoot is available as an option. Sending everything in one go is the fastest route.",
      fr: "Le nom et l'adresse de l'établissement, le téléphone et le Zalo, les horaires, la liste des plats ou services avec les prix, et des photos. Si vous n'avez pas de bonnes photos, un shooting produits est proposé en option. Tout envoyer en une fois est ce qui va le plus vite.",
    },
    keywords: [
      "chuan bi", "noi dung", "viet noi dung", "ai viet", "content", "who writes",
      "copywriting", "photos", "anh", "chup anh", "texte", "redaction", "fournir",
      "provide", "envoyer", "gui",
    ],
  },
  {
    id: "propriete",
    question: {
      vi: "Web có thuộc về tôi không?",
      en: "Do I own the site?",
      fr: "Le site m'appartient-il ?",
    },
    answer: {
      vi: "Có. Trang web và nội dung là của anh/chị. Tên miền do anh/chị tự mua và đứng tên anh/chị, nên nó là của anh/chị vĩnh viễn, kể cả khi sau này không làm việc với Neuraweb nữa.",
      en: "Yes. The site and its content are yours. The domain is bought by you, in your name, so it stays yours for good — even if you stop working with Neuraweb later.",
      fr: "Oui. Le site et son contenu sont à vous. Le nom de domaine est acheté par vous, à votre nom : il reste le vôtre définitivement, même si vous cessez de travailler avec Neuraweb.",
    },
    keywords: ["so huu", "ownership", "propriete", "code source", "ma nguon", "belongs"],
    confirm: true,
  },
  {
    id: "hebergement",
    question: {
      vi: "Chi phí duy trì hằng tháng là bao nhiêu?",
      en: "What does it cost to keep the site running?",
      fr: "Combien coûte le maintien en ligne ?",
    },
    answer: {
      vi: "Khởi Đầu và Phát Triển là trang tĩnh: không có chi phí hạ tầng hằng tháng. Cao Cấp, Doanh Nghiệp và tùy chọn Tự sửa nội dung cần cơ sở dữ liệu, phần hạ tầng này do anh/chị chi trả, từ khoảng 5 USD/tháng tùy nhu cầu. Tên miền gia hạn mỗi năm. Bảo trì hằng tháng là tùy chọn, không bắt buộc.",
      en: "Khởi Đầu and Phát Triển are static sites: no monthly infrastructure cost. Cao Cấp, Doanh Nghiệp and the self-service editing option need a database, and that infrastructure is on you, from about $5/month depending on your needs. The domain renews yearly. The monthly care plan is optional.",
      fr: "Khởi Đầu et Phát Triển sont des sites statiques : aucun coût d'infrastructure mensuel. Cao Cấp, Doanh Nghiệp et l'option espace de gestion reposent sur une base de données, dont l'infrastructure est à votre charge, à partir d'environ 5 USD/mois selon le besoin. Le domaine se renouvelle chaque année. L'entretien mensuel, lui, est optionnel.",
    },
    keywords: [
      "hosting", "hebergement", "hang thang", "monthly", "every month", "month",
      "moi thang", "tous les mois", "frais mensuels", "recurring", "recurrent",
      "duy tri", "abonnement", "subscription", "maintenance", "bao tri",
    ],
  },
  {
    id: "domaine",
    question: {
      vi: "Tên miền thì sao?",
      en: "What about the domain name?",
      fr: "Et le nom de domaine ?",
    },
    answer: {
      vi: "Anh/chị tự mua, đứng tên anh/chị, ở nhà cung cấp anh/chị tự chọn — khoảng 300.000₫/năm cho .com, cao hơn cho .vn. Neuraweb không giới thiệu nhà cung cấp nào cụ thể. Lưu ý: tên miền .vn yêu cầu giấy tờ tùy thân Việt Nam hoặc giấy phép kinh doanh. Neuraweb không cầm tiền tên miền của anh/chị.",
      en: "You buy it yourself, in your name, from the registrar of your own choosing — around 300,000₫/year for a .com, more for a .vn. Neuraweb does not recommend any particular registrar. Note that a .vn domain requires Vietnamese ID or a registered business. Neuraweb never handles your domain payment.",
      fr: "Vous l'achetez vous-même, à votre nom, chez le registrar de votre choix — environ 300.000₫/an pour un .com, davantage pour un .vn. Neuraweb ne recommande aucun registrar en particulier. À savoir : un domaine .vn exige une pièce d'identité vietnamienne ou une entreprise enregistrée. Neuraweb n'encaisse jamais le prix du domaine.",
    },
    keywords: ["ten mien", "domain", "domaine", ".vn", ".com", "registrar"],
  },
  {
    id: "langues",
    question: {
      vi: "Web có mấy ngôn ngữ?",
      en: "How many languages does the site have?",
      fr: "Combien de langues sur le site ?",
    },
    answer: {
      vi: "Khởi Đầu có một ngôn ngữ; thêm ngôn ngữ thứ hai là tùy chọn 1.500.000₫. Phát Triển, Cao Cấp và Doanh Nghiệp có tiếng Việt, tiếng Anh và tiếng Pháp. Dịch nội dung là một nghề riêng, không nằm trong gói sửa đổi.",
      en: "Khởi Đầu ships with one language; a second one is a 1,500,000₫ option. Phát Triển, Cao Cấp and Doanh Nghiệp come in Vietnamese, English and French. Translating content is a trade of its own and is never counted as a light edit.",
      fr: "Khởi Đầu est livré en une seule langue ; la seconde est une option à 1.500.000₫. Phát Triển, Cao Cấp et Doanh Nghiệp sont en vietnamien, anglais et français. La traduction est un métier, jamais une modification incluse.",
    },
    keywords: [
      "ngon ngu", "tieng anh", "english", "langue", "multilingue", "traduction", "dich",
      "khach nuoc ngoai", "khach tay", "touriste", "touristes", "etranger", "etrangers",
      "tourist", "tourists", "foreign", "foreigner", "tay", "expat",
    ],
  },
  {
    id: "google",
    question: {
      vi: "Khách có tìm thấy tôi trên Google không?",
      en: "Will customers find me on Google?",
      fr: "Mes clients me trouveront-ils sur Google ?",
    },
    answer: {
      vi: "Mọi gói đều có hồ sơ Google Business — tạo mới hoặc nhận lại hồ sơ cũ, cập nhật địa chỉ, giờ mở cửa và liên kết tới web. Từ Phát Triển trở lên có thêm tối ưu tìm kiếm địa phương. Web mới cần vài tuần để Google ghi nhận đầy đủ.",
      en: "Every pack includes a Google Business profile — created or claimed, with your address, hours and a link to the site. From Phát Triển up, local search optimisation is added. A brand-new site takes a few weeks before Google fully picks it up.",
      fr: "Tous les packs incluent la fiche Google Business — créée ou revendiquée, avec l'adresse, les horaires et le lien vers le site. À partir de Phát Triển s'ajoute l'optimisation pour la recherche locale. Un site tout neuf met quelques semaines avant d'être pleinement pris en compte par Google.",
    },
    keywords: ["google", "seo", "tim kiem", "search", "maps", "referencement", "google business"],
  },
  {
    id: "reservation",
    direct: false,
    question: {
      vi: "Khách đặt lịch trên web được không?",
      en: "Can customers book from the site?",
      fr: "Les clients peuvent-ils réserver depuis le site ?",
    },
    answer: {
      vi: "Từ gói Phát Triển: khách bấm đặt lịch, tin nhắn Zalo được soạn sẵn gửi thẳng cho anh/chị, anh/chị xác nhận lại. Gói Cao Cấp lưu đơn và lịch hẹn vào hệ thống, có bảng theo dõi riêng.",
      en: "From Phát Triển on: the customer taps to book and a pre-filled Zalo message reaches you, which you confirm. Cao Cấp records orders and bookings in the system, with its own dashboard.",
      fr: "À partir de Phát Triển : le client appuie sur réserver, un message Zalo pré-rempli vous arrive, vous confirmez. Cao Cấp enregistre les commandes et les réservations dans le système, avec son tableau de bord.",
    },
    keywords: ["dat lich", "dat ban", "booking", "reservation", "rendez-vous", "zalo"],
  },
  {
    id: "paiement-en-ligne",
    direct: false,
    question: {
      vi: "Bán hàng và nhận tiền trên web được không?",
      en: "Can I sell and take payment on the site?",
      fr: "Puis-je vendre et encaisser sur le site ?",
    },
    answer: {
      vi: "Có, từ gói Cao Cấp: giỏ hàng, VietQR, MoMo, thu tiền khi nhận hàng, giao qua GHTK · GHN · Viettel Post, khách theo dõi được đơn. Tiền về thẳng tài khoản của anh/chị, Neuraweb không lấy phần trăm nào.",
      en: "Yes, from Cao Cấp: cart, VietQR, MoMo, cash on delivery, shipping via GHTK · GHN · Viettel Post, and order tracking for the customer. The money goes straight to your account — Neuraweb takes no cut.",
      fr: "Oui, à partir de Cao Cấp : panier, VietQR, MoMo, paiement à la livraison, expédition via GHTK · GHN · Viettel Post, et suivi de commande pour le client. L'argent arrive directement sur votre compte, Neuraweb ne prend aucun pourcentage.",
    },
    keywords: [
      "ban hang", "thanh toan", "thanh toan online", "vietqr", "momo", "cod",
      "ecommerce", "e-commerce", "paiement", "paiement en ligne", "pay", "pay online",
      "online payment", "checkout", "gio hang", "panier", "cart", "commission",
    ],
  },
  {
    id: "modifier-moi-meme",
    direct: false,
    question: {
      vi: "Tôi tự sửa giá và nội dung được không?",
      en: "Can I edit prices and content myself?",
      fr: "Puis-je modifier les prix et le contenu moi-même ?",
    },
    answer: {
      vi: "Có sẵn trong Cao Cấp và Doanh Nghiệp. Với Khởi Đầu và Phát Triển, đó là tùy chọn trả thêm. Không mua tùy chọn thì gửi yêu cầu cho Neuraweb: có bảo trì thì nằm trong hạn mức hằng tháng, không có bảo trì thì tính 500.000₫ cho mỗi giờ bắt đầu.",
      en: "Included in Cao Cấp and Doanh Nghiệp. On Khởi Đầu and Phát Triển it is a paid option. Without it, you send the change to Neuraweb: covered by your monthly quota if you have the care plan, otherwise 500,000₫ per hour started.",
      fr: "Inclus dans Cao Cấp et Doanh Nghiệp. Sur Khởi Đầu et Phát Triển, c'est une option payante. Sans elle, vous envoyez la demande à Neuraweb : comprise dans le quota mensuel si vous avez l'entretien, sinon 500.000₫ par heure entamée.",
    },
    keywords: ["tu sua", "self service", "espace de gestion", "admin", "back office", "editer", "modifier"],
  },
  {
    id: "garantie",
    question: {
      vi: "Nếu có lỗi sau khi bàn giao thì sao?",
      en: "What if something is wrong after delivery?",
      fr: "Et s'il y a une erreur après la livraison ?",
    },
    answer: {
      vi: "Lỗi chính tả hoặc thông tin sai được sửa miễn phí trong 7 ngày đầu sau khi lên mạng — đó là hoàn thiện, không phải sửa đổi. Sau đó áp dụng chính sách sửa đổi thông thường.",
      en: "A typo or a factual mistake is fixed free of charge in the first 7 days after going live — that's finishing the job, not a change request. After that, the normal change policy applies.",
      fr: "Une coquille ou une erreur factuelle est corrigée gratuitement dans les 7 jours suivant la mise en ligne — c'est de la finition, pas une modification. Ensuite, la politique de modifications s'applique.",
    },
    keywords: ["loi", "bug", "erreur", "garantie", "warranty", "sua loi", "correction"],
    confirm: true,
  },
  {
    id: "formation",
    question: {
      vi: "Có hướng dẫn sử dụng không?",
      en: "Do I get trained on it?",
      fr: "Suis-je formé à l'outil ?",
    },
    answer: {
      vi: "Có, theo từng gói: hướng dẫn PDF với Khởi Đầu, 1 giờ trực tuyến với Phát Triển, 2 giờ tại cửa hàng với Cao Cấp, đào tạo theo nhóm với Doanh Nghiệp. Phí triển khai còn kèm 15 phút hướng dẫn lúc bàn giao.",
      en: "Yes, by pack: a PDF guide with Khởi Đầu, 1 hour online with Phát Triển, 2 hours on site with Cao Cấp, team training with Doanh Nghiệp. The deployment fee also covers a 15-minute handover.",
      fr: "Oui, selon le palier : guide PDF avec Khởi Đầu, 1 h en ligne avec Phát Triển, 2 h sur place avec Cao Cấp, formation d'équipe avec Doanh Nghiệp. Les frais de déploiement comprennent en plus une prise en main de 15 minutes.",
    },
    keywords: ["huong dan", "training", "formation", "apprendre", "prise en main"],
  },
  {
    id: "facebook",
    direct: false,
    question: {
      vi: "Tôi có Facebook rồi, cần web làm gì?",
      en: "I already have a Facebook page — why a website?",
      fr: "J'ai déjà une page Facebook, pourquoi un site ?",
    },
    answer: {
      vi: "Web không thay thế Facebook, nó bổ sung: một địa chỉ thuộc về anh/chị, hiện trên Google Maps, mã QR dán tại quán, và khách xem được giá, giờ mở cửa, đường đi mà không cần tài khoản mạng xã hội.",
      en: "A site doesn't replace Facebook, it completes it: an address that belongs to you, presence on Google Maps, a QR code to display in the shop, and customers who can see prices, hours and directions without needing a social account.",
      fr: "Le site ne remplace pas Facebook, il le complète : une adresse qui vous appartient, une présence sur Google Maps, un QR code à afficher dans l'établissement, et des clients qui voient les prix, les horaires et l'itinéraire sans compte sur un réseau social.",
    },
    keywords: ["facebook", "fanpage", "instagram", "mang xa hoi", "reseaux sociaux", "pourquoi un site"],
  },
  {
    id: "demos",
    direct: false,
    question: {
      vi: "Có xem thử được không?",
      en: "Can I see a real example?",
      fr: "Puis-je voir un exemple réel ?",
    },
    answer: {
      vi: "Được. Mỗi ngành nghề có bản demo hoạt động thật, mở trực tiếp trên điện thoại — không phải ảnh chụp màn hình. Xem ở trang ngành nghề tương ứng, hoặc so sánh cả bảng giá ở /packs.",
      en: "Yes. Every trade has working demos you can open on your phone — not screenshots. Look at the page for your trade, or compare everything on /packs.",
      fr: "Oui. Chaque métier a des démos qui fonctionnent réellement, à ouvrir sur votre téléphone — pas des captures d'écran. Voyez la page de votre métier, ou comparez tout sur /packs.",
    },
    keywords: ["demo", "vi du", "example", "exemple", "portfolio", "xem thu", "voir"],
  },
  {
    id: "france-vietnam",
    question: {
      vi: "Neuraweb ở Pháp hay ở Việt Nam?",
      en: "Is Neuraweb French or Vietnamese?",
      fr: "Neuraweb est française ou vietnamienne ?",
    },
    answer: {
      vi: "Neuraweb có hai nhánh riêng biệt, cùng một người sáng lập là Nacer. Nhánh Hà Nội — chính là ở đây — làm website cho quán và cửa hàng tại Hà Nội, báo giá bằng tiền đồng, làm việc bằng tiếng Việt. Nhánh Pháp phục vụ thị trường Pháp với bảng giá riêng bằng euro. Hai bảng giá độc lập: giá bên Pháp không áp dụng ở đây, và ngược lại.",
      en: "Neuraweb has two separate arms, founded by the same person, Nacer. The Hanoi arm — this one — builds sites for Hanoi businesses, quotes in dong and works in Vietnamese. The French arm serves the French market with its own euro price list. The two grids are independent: French prices do not apply here, and vice versa.",
      fr: "Neuraweb a deux antennes distinctes, avec le même fondateur, Nacer. L'antenne de Hanoi — celle-ci — réalise des sites pour les commerces de Hanoi, chiffre en dongs et travaille en vietnamien. L'antenne française adresse le marché français avec sa propre grille en euros. Les deux grilles sont indépendantes : les prix français ne s'appliquent pas ici, et inversement.",
    },
    keywords: [
      "phap", "france", "french", "phap quoc", "euro", "eur", "chau au", "europe",
      "vietnam", "viet nam", "ha noi", "hanoi", "nuoc nao", "which country",
      "meme agence", "same company", "difference", "khac nhau",
    ],
  },
  {
    id: "agence",
    question: {
      vi: "Neuraweb là ai?",
      en: "Who is Neuraweb?",
      fr: "Qui est Neuraweb ?",
    },
    answer: {
      vi: "Một studio thiết kế web nhỏ tại Hà Nội, do Nacer sáng lập và điều hành: anh là giám đốc (CEO) và cũng là người trực tiếp thiết kế, lập trình. Làm việc bằng tiếng Việt, tiếng Anh và tiếng Pháp, chuyên cho quán cà phê, salon, cửa hàng, nhà hàng và homestay trong thành phố.",
      en: "A small web studio in Hà Nội, founded and run by Nacer, its CEO, who designs and builds the sites himself. It works in Vietnamese, English and French, for the city's cafés, salons, shops, restaurants and homestays.",
      fr: "Un petit studio web à Hanoï, fondé et dirigé par Nacer, son CEO, qui conçoit et développe lui-même les sites. Il travaille en vietnamien, en anglais et en français, pour les cafés, salons, boutiques, restaurants et homestays de la ville.",
    },
    keywords: [
      "neuraweb", "nacer", "ai lam", "who", "qui", "agence", "studio", "equipe",
      "ceo", "giam doc", "dieu hanh", "dirigeant", "directeur", "patron",
      "fondateur", "founder", "boss", "chu doanh nghiep",
    ],
  },
];
