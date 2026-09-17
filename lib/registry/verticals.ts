import type { Feature, Vertical, VerticalId } from "./types";

const yes = { vi: "Có", en: "Included", fr: "Inclus" };

/**
 * Types de commerce du portfolio.
 *
 * `packs` déclare les paliers réellement proposés pour ce métier : toutes les verticales
 * n'ont pas quatre paliers pertinents (un homestay sans calendrier n'est pas un produit).
 * `overrides` corrige la matrice globale là où le métier l'exige — pour un salon, la prise
 * de rendez-vous EST le produit, elle ne peut pas commencer au palier 2.
 */
export const VERTICALS: Vertical[] = [
  {
    id: "cafe",
    slug: "quan-ca-phe",
    name: { vi: "Quán cà phê", en: "Coffee shops", fr: "Cafés" },
    nativeName: "Quán cà phê",
    tagline: {
      vi: "Khách tìm thấy bạn, xem giá, rồi đến.",
      en: "Customers find you, see the prices, then come.",
      fr: "Le client vous trouve, voit les prix, puis vient.",
    },
    pitch: {
      vi: "Ảnh đẹp và bảng giá rõ ràng bán được nhiều hơn một trang Facebook trôi mất sau ba ngày.",
      en: "Good photos and a clear price board sell more than a Facebook page buried after three days.",
      fr: "De bonnes photos et une carte claire vendent plus qu'une page Facebook enterrée en trois jours.",
    },
    packs: ["khoi-dau", "phat-trien", "cao-cap"],
    icon: "☕",
    accent: "#8E2A20",
  },
  {
    id: "salon",
    slug: "salon-spa",
    name: { vi: "Salon & spa", en: "Salons & spas", fr: "Salons & spas" },
    nativeName: "Salon tóc, spa, nail",
    tagline: {
      vi: "Đặt lịch trong 30 giây, không cần gọi điện.",
      en: "Book in 30 seconds, no phone call.",
      fr: "Réserver en 30 secondes, sans appeler.",
    },
    pitch: {
      vi: "Mỗi cuộc gọi nhỡ là một khách mất. Lịch hẹn tự chạy cả khi bạn đang cầm kéo.",
      en: "Every missed call is a lost customer. The booking runs while your hands are busy.",
      fr: "Chaque appel manqué est un client perdu. L'agenda tourne pendant que vous avez les mains prises.",
    },
    // Pas de Cao Cấp codé : Hương Salon couvre Phát Triển, Sen Vàng le palier sur devis.
    packs: ["khoi-dau", "phat-trien", "doanh-nghiep"],
    icon: "✂️",
    accent: "#D91F52",
    overrides: {
      // Pour un salon, la réservation est le produit : elle existe dès le premier palier,
      // sans confirmation automatique ni acompte.
      reservation: {
        "khoi-dau": {
          vi: "3 bước, không tài khoản, không đặt cọc",
          en: "3 steps, no account, no deposit",
          fr: "3 étapes, sans compte ni acompte",
        },
      },
      // L'acompte fixe (100.000₫) est plus léger qu'un panier complet : il descend d'un cran.
      paiement: {
        "phat-trien": {
          vi: "Đặt cọc 100.000₫ qua VietQR / MoMo",
          en: "100,000₫ deposit via VietQR / MoMo",
          fr: "Acompte de 100.000₫ par VietQR / MoMo",
        },
      },
    },
    extraFeatures: [
      {
        // À ne pas confondre avec `panier` (commande de MARCHANDISE, palier Cao Cấp) :
        // ici on empile des prestations sur un même rendez-vous et la durée cumulée se
        // calcule toute seule. Sans cette ligne, un prospect voit un « panier » dans la
        // démo Phát Triển alors que la matrice réserve le panier au Cao Cấp, et
        // l'argumentaire de montée en gamme tombe.
        id: "panier-services",
        group: "conversion",
        label: {
          vi: "Giỏ nhiều dịch vụ (tính thời gian)",
          en: "Multi-service basket (duration adds up)",
          fr: "Panier multi-services (durée cumulée)",
        },
        values: { "khoi-dau": false, "phat-trien": yes, "cao-cap": yes, "doanh-nghiep": yes },
      },
      {
        id: "stylist",
        group: "conversion",
        label: { vi: "Chọn thợ / kỹ thuật viên", en: "Pick your stylist", fr: "Choix du ou de la styliste" },
        values: { "khoi-dau": false, "phat-trien": yes, "cao-cap": yes, "doanh-nghiep": yes },
      },
      {
        id: "lookbook",
        group: "contenu",
        label: { vi: "Lookbook kiểu tóc", en: "Style lookbook", fr: "Lookbook des coupes" },
        values: { "khoi-dau": false, "phat-trien": yes, "cao-cap": yes, "doanh-nghiep": yes },
      },
      {
        id: "rappel",
        group: "conversion",
        label: { vi: "Nhắc hẹn Zalo 24h trước", en: "Zalo reminder 24 h before", fr: "Rappel Zalo 24 h avant" },
        values: { "khoi-dau": false, "phat-trien": yes, "cao-cap": yes, "doanh-nghiep": yes },
      },
    ],
  },
  {
    id: "shop",
    slug: "cua-hang",
    name: { vi: "Cửa hàng", en: "Shops", fr: "Boutiques" },
    nativeName: "Cửa hàng thủ công, quà tặng",
    tagline: {
      vi: "Bán hàng cả khi cửa hàng đã đóng.",
      en: "Sell after the shutters are down.",
      fr: "Vendre une fois le rideau baissé.",
    },
    pitch: {
      vi: "Khách du lịch tìm trên điện thoại trước khi đến phố. Có giỏ hàng và VietQR là bán được ngay trong đêm.",
      en: "Tourists search on their phone before walking the street. With a cart and VietQR you sell overnight.",
      fr: "Le touriste cherche sur son téléphone avant d'arriver dans la rue. Avec un panier et VietQR, vous vendez la nuit.",
    },
    packs: ["khoi-dau", "phat-trien", "cao-cap"],
    icon: "🏮",
    accent: "#D9A02B",
  },
  {
    id: "restaurant",
    slug: "nha-hang",
    name: { vi: "Nhà hàng", en: "Restaurants", fr: "Restaurants" },
    nativeName: "Nhà hàng, quán ăn",
    tagline: {
      vi: "Thực đơn đổi mỗi tuần, mã QR trên bàn không đổi.",
      en: "The menu changes weekly, the QR on the table doesn't.",
      fr: "Le menu change chaque semaine, le QR sur la table ne bouge pas.",
    },
    pitch: {
      vi: "Bạn tự sửa thực đơn và giá. Mã QR dán trên bàn vẫn thế — không phải in lại, không phải gọi ai.",
      en: "You edit the menu and the prices yourself. The QR stuck on the table stays the same — nothing to reprint, no one to call.",
      fr: "Vous changez le menu et les prix vous-même. Le QR collé sur la table ne bouge pas — rien à réimprimer, personne à appeler.",
    },
    packs: ["khoi-dau", "phat-trien", "cao-cap"],
    icon: "🍜",
    accent: "#C4462C",
    extraFeatures: [
      {
        id: "menu-qr-table",
        group: "conversion",
        label: {
          vi: "Thực đơn QR theo từng bàn",
          en: "Per-table QR menu",
          fr: "Menu QR par table",
        },
        values: {
          "khoi-dau": false,
          "phat-trien": {
            vi: "Mỗi bàn một mã, biết khách ngồi đâu",
            en: "One code per table — you know where they sit",
            fr: "Un code par table — vous savez où ils sont assis",
          },
          "cao-cap": yes,
          "doanh-nghiep": yes,
        },
      },
      {
        id: "plateformes",
        group: "vente",
        label: {
          vi: "GrabFood · ShopeeFood · Be",
          en: "GrabFood · ShopeeFood · Be",
          fr: "GrabFood · ShopeeFood · Be",
        },
        values: { "khoi-dau": false, "phat-trien": yes, "cao-cap": yes, "doanh-nghiep": yes },
      },
      {
        id: "trich-dan",
        group: "contenu",
        label: {
          vi: "Trích dẫn khách quen (viết sẵn)",
          en: "Written customer quotes",
          fr: "Citations de clients (rédigées)",
        },
        // Du contenu, pas une intégration : rien à brancher, donc dès le premier palier.
        // À ne pas confondre avec « Đánh giá Google », qui affiche la note réelle.
        values: { "khoi-dau": yes, "phat-trien": yes, "cao-cap": yes, "doanh-nghiep": yes },
      },
      {
        id: "click-collect",
        group: "vente",
        label: {
          vi: "Đặt trước, đến lấy (có khung giờ)",
          en: "Order ahead, pick up (timed slot)",
          fr: "Commander avant, venir chercher (créneau)",
        },
        values: { "khoi-dau": false, "phat-trien": false, "cao-cap": yes, "doanh-nghiep": yes },
      },
    ],
  },
  {
    id: "homestay",
    slug: "homestay",
    name: { vi: "Homestay", en: "Homestays", fr: "Homestays" },
    nativeName: "Homestay, khách sạn nhỏ",
    tagline: {
      vi: "Khách đặt thẳng với bạn, không qua ai.",
      en: "Guests book with you directly, through no one.",
      fr: "Le voyageur réserve chez vous, sans intermédiaire.",
    },
    pitch: {
      vi: "Booking lấy 15% mỗi đêm. Bốn mươi đêm một tháng là website đã trả xong sau ba tháng.",
      en: "Booking takes 15% of every night. At forty nights a month, the site pays for itself in three.",
      fr: "Booking prend 15 % de chaque nuit. À quarante nuits par mois, le site est remboursé en trois.",
    },
    packs: ["khoi-dau", "phat-trien", "cao-cap"],
    icon: "🏨",
    accent: "#1F6F6B",
    overrides: {
      // Un homestay sans page « chambres » n'est pas un produit : le voyageur veut
      // voir la chambre avant d'écrire. Elle existe donc dès le premier palier.
      pages: {
        "khoi-dau": {
          vi: "4 trang: giới thiệu, phòng, đường đi, liên hệ",
          en: "4 pages: about, rooms, how to get here, contact",
          fr: "4 pages : présentation, chambres, accès, contact",
        },
      },
      // La demande de réservation par Zalo remplace le formulaire de contact :
      // c'est le geste que fait vraiment un voyageur.
      reservation: {
        "khoi-dau": {
          vi: "Hỏi phòng qua Zalo hoặc WhatsApp",
          en: "Room enquiry via Zalo or WhatsApp",
          fr: "Demande de chambre par Zalo ou WhatsApp",
        },
      },
    },
    extraFeatures: [
      {
        id: "chambres",
        group: "contenu",
        label: { vi: "Trang từng phòng", en: "Per-room pages", fr: "Fiche par chambre" },
        values: {
          "khoi-dau": { vi: "Danh sách phòng", en: "Room list", fr: "Liste des chambres" },
          "phat-trien": yes,
          "cao-cap": yes,
          "doanh-nghiep": yes,
        },
      },
      {
        id: "calendrier",
        group: "conversion",
        label: {
          vi: "Lịch còn phòng theo đêm",
          en: "Night-by-night availability",
          fr: "Calendrier de disponibilité par nuit",
        },
        values: { "khoi-dau": false, "phat-trien": yes, "cao-cap": yes, "doanh-nghiep": yes },
      },
      {
        id: "plusieurs-maisons",
        group: "contenu",
        label: {
          vi: "Nhiều địa điểm (giới thiệu)",
          en: "Several houses (showcased)",
          fr: "Plusieurs maisons (présentées)",
        },
        // À ne pas confondre avec « Nhiều chi nhánh », qui est de la gestion :
        // réservations et tableau de bord séparés par établissement.
        values: { "khoi-dau": false, "phat-trien": yes, "cao-cap": yes, "doanh-nghiep": yes },
      },
      {
        id: "acompte",
        group: "vente",
        label: {
          vi: "Đặt cọc giữ phòng (VietQR / thẻ quốc tế)",
          en: "Deposit to hold the room (VietQR / foreign card)",
          fr: "Acompte pour tenir la chambre (VietQR / carte étrangère)",
        },
        // Le voyageur vietnamien paie en VietQR, l'étranger par carte : les deux
        // sont nécessaires, c'est ce qui distingue ce palier.
        values: { "khoi-dau": false, "phat-trien": false, "cao-cap": yes, "doanh-nghiep": yes },
      },
      {
        id: "acces",
        group: "contenu",
        label: {
          vi: "Đường từ sân bay Nội Bài (Grab, taxi, giá)",
          en: "Getting in from Nội Bài (Grab, taxi, fares)",
          fr: "Arrivée depuis Nội Bài (Grab, taxi, tarifs)",
        },
        values: { "khoi-dau": yes, "phat-trien": yes, "cao-cap": yes, "doanh-nghiep": yes },
      },
    ],
  },
];

export function getVertical(idOrSlug: string): Vertical | undefined {
  return VERTICALS.find((v) => v.id === idOrSlug || v.slug === idOrSlug);
}

export const VERTICAL_IDS: VerticalId[] = VERTICALS.map((v) => v.id);

/**
 * Verticales identifiées mais non codées — affichées en « bientôt » sur l'accueil,
 * pour que le prospect voie que son métier est prévu. Voir §5 du plan showcase.
 */
export const PLANNED_VERTICALS: {
  id: VerticalId;
  name: { vi: string; en: string; fr: string };
  nativeName: string;
  icon: string;
  note: { vi: string; en: string; fr: string };
}[] = [
  {
    id: "clinique",
    name: { vi: "Phòng khám", en: "Clinics", fr: "Cliniques" },
    nativeName: "Phòng khám, nha khoa",
    icon: "🦷",
    note: {
      vi: "Đặt lịch theo bác sĩ, xuất hóa đơn VAT.",
      en: "Book a named practitioner, VAT invoicing.",
      fr: "RDV avec praticien nommé, facture VAT.",
    },
  },
];

/** Fonctionnalités applicables à une verticale : matrice globale + extras du métier. */
export function featuresOf(vertical: Vertical, base: Feature[]): Feature[] {
  const merged = base.map((f) => {
    const o = vertical.overrides?.[f.id];
    return o ? { ...f, values: { ...f.values, ...o } } : f;
  });
  return [...merged, ...(vertical.extraFeatures ?? [])];
}
