import type { L10n, PackId } from "@/lib/registry";

/**
 * L'argumentaire de vente, palier par palier — la seule partie du corpus qui
 * ne décrit pas ce qu'un pack CONTIENT, mais ce qu'il CHANGE pour le commerce.
 *
 * Pourquoi ce fichier existe : le registre liste des fonctionnalités
 * (« réservation en ligne », « 5 trang »). Un commerçant n'achète pas une
 * fonctionnalité, il achète un problème résolu — « le client réserve à 23 h
 * pendant que vous fermez ». Sans ces lignes, l'assistant récitait un
 * catalogue et laissait le visiteur choisir le moins cher par défaut.
 *
 * Règles de rédaction :
 *   - une promesse concrète, jamais un adjectif (« rapide », « moderne ») ;
 *   - `over` ne parle que de ce que le palier ajoute au palier PRÉCÉDENT :
 *     c'est la phrase qui fait monter d'un cran, elle doit tenir seule ;
 *   - `ceiling` dit honnêtement ce que le palier ne fait pas. C'est ce qui
 *     rend le reste crédible, et c'est déjà la vente du palier suivant ;
 *   - rien qui ne soit vérifiable dans la matrice de `features.ts`. Un
 *     argument inventé se paie en rendez-vous.
 */
export type PackSellingPoints = {
  /** Ce que le commerce gagne, en une phrase. */
  promise: L10n;
  /** Ce que ce palier ajoute au précédent. `null` pour le premier. */
  over: L10n | null;
  /** Les signaux qui désignent ce palier chez le visiteur. */
  forWhom: L10n;
  /** Ce que ce palier ne fait pas — et qui se règle au palier du dessus. */
  ceiling: L10n | null;
};

export const SELLING: Record<PackId, PackSellingPoints> = {
  "khoi-dau": {
    promise: {
      vi: "Khách tìm thấy quán trên Google, xem giá, rồi bấm gọi hoặc nhắn Zalo ngay.",
      en: "Customers find you on Google, see your prices, and call or message on Zalo in one tap.",
      fr: "Le client vous trouve sur Google, voit vos prix, et vous appelle ou vous écrit sur Zalo en un geste.",
    },
    over: null,
    forWhom: {
      vi: "Chưa có web, ngân sách hạn chế, và chỉ cần một điều duy nhất: để khách tìm ra và gọi được.",
      en: "No site yet, a tight budget, and one thing to achieve: be found and be called.",
      fr: "Pas encore de site, un budget serré, et une seule chose à obtenir : être trouvé et être appelé.",
    },
    ceiling: {
      vi: "Chưa có đặt lịch, chưa có mã QR in được, chưa có đánh giá Google, chỉ một ngôn ngữ — và mỗi lần đổi giá đều phải nhờ Neuraweb.",
      en: "No booking, no printable QR, no Google reviews, one language only — and every price change goes through Neuraweb.",
      fr: "Pas de réservation, pas de QR imprimable, pas d'avis Google, une seule langue — et chaque changement de prix passe par Neuraweb.",
    },
  },

  "phat-trien": {
    promise: {
      vi: "Khách tự đặt lịch lúc 11 giờ đêm, tin nhắn Zalo về thẳng máy anh/chị — không bỏ lỡ cuộc gọi nào nữa.",
      en: "Customers book themselves at 11pm and the Zalo message lands on your phone — no more missed calls.",
      fr: "Le client réserve seul à 23 h, le message Zalo arrive sur votre téléphone — plus d'appel manqué.",
    },
    over: {
      vi: "Năm trang thay vì một, ba ngôn ngữ thay vì một, đặt lịch trực tuyến, mã QR dán được lên bàn, đánh giá Google và mục tin tức để đăng khuyến mãi. Đây là bước biến một trang giới thiệu thành nơi thật sự nhận khách.",
      en: "Five pages instead of one, three languages instead of one, online booking, a QR to stick on the table, Google reviews and a news section for promotions. This is what turns a listing into something that actually takes bookings.",
      fr: "Cinq pages au lieu d'une, trois langues au lieu d'une, la réservation en ligne, le QR à coller sur la table, les avis Google et les actualités pour annoncer une promo. C'est ce qui fait passer d'une fiche à un site qui prend des rendez-vous.",
    },
    forWhom: {
      vi: "Có giờ giấc phải giữ, có khách nước ngoài, có khuyến mãi để đăng, và điện thoại reo lúc đang bận tay.",
      en: "You have opening hours to hold, foreign customers, promotions to post, and a phone that rings while your hands are full.",
      fr: "Vous avez des horaires à tenir, des clients étrangers, des promos à annoncer, et un téléphone qui sonne quand vous avez les mains prises.",
    },
    ceiling: {
      vi: "Chưa bán hàng trực tuyến (giỏ hàng, thanh toán, giao hàng), và giá vẫn do Neuraweb sửa.",
      en: "No online selling yet (cart, payment, delivery), and prices are still edited by Neuraweb.",
      fr: "Pas encore de vente en ligne (panier, paiement, livraison), et les prix sont encore modifiés par Neuraweb.",
    },
  },

  "cao-cap": {
    promise: {
      vi: "Anh/chị bán hàng cả lúc đang ngủ, tiền về thẳng tài khoản, không ai ăn phần trăm.",
      en: "You sell while you sleep, the money lands straight in your account, and nobody takes a cut.",
      fr: "Vous vendez pendant que vous dormez, l'argent arrive directement sur votre compte, personne ne prend de commission.",
    },
    over: {
      vi: "Giỏ hàng, VietQR và MoMo, giao hàng qua GHTK · GHN · Viettel Post, khách theo dõi đơn, tích điểm cho khách quen, bảng điều khiển đơn hàng — và anh/chị TỰ sửa giá, tự đổi ảnh, không cần gọi ai, không tính tiền theo giờ.",
      en: "Cart, VietQR and MoMo, delivery via GHTK · GHN · Viettel Post, order tracking for the customer, loyalty points for regulars, an orders dashboard — and you edit your own prices and photos, without calling anyone and without paying by the hour.",
      fr: "Le panier, VietQR et MoMo, la livraison via GHTK · GHN · Viettel Post, le suivi de commande pour le client, la fidélité pour les habitués, le tableau de bord des commandes — et vous modifiez vos prix et vos photos vous-même, sans appeler personne et sans payer à l'heure.",
    },
    forWhom: {
      vi: "Có sản phẩm để bán, có giao hàng, có khách quen cần kéo quay lại — và ngán chuyện nhắn tin xác nhận từng đơn.",
      en: "You have products to sell, you deliver, you have regulars worth bringing back — and you are tired of confirming every order by message.",
      fr: "Vous avez des produits à vendre, vous livrez, vous avez des habitués à faire revenir — et vous en avez assez de confirmer chaque commande à la main.",
    },
    ceiling: {
      vi: "Một địa chỉ duy nhất. Nhiều chi nhánh, phân quyền nhân viên hay xuất dữ liệu sang KiotViet thì thuộc gói Doanh Nghiệp.",
      en: "A single address. Several branches, staff permissions or exporting to KiotViet belong to Doanh Nghiệp.",
      fr: "Une seule adresse. Plusieurs succursales, des droits par employé ou l'export vers KiotViet relèvent de Doanh Nghiệp.",
    },
  },

  "doanh-nghiep": {
    promise: {
      vi: "Nhiều chi nhánh, một bảng điều khiển duy nhất — và mỗi quản lý chỉ thấy phần của mình.",
      en: "Several branches, a single console — and each manager sees only their own.",
      fr: "Plusieurs adresses, une seule console — et chaque responsable ne voit que la sienne.",
    },
    over: {
      vi: "Nhiều chi nhánh, phân quyền theo nhân viên, gói trả trước, hóa đơn điện tử VAT, xuất dữ liệu sang KiotViet · Sapo · Excel.",
      en: "Multi-branch, per-staff permissions, prepaid packages, VAT e-invoicing, export to KiotViet · Sapo · Excel.",
      fr: "Multi-succursales, droits par employé, forfaits prépayés, facture électronique VAT, export vers KiotViet · Sapo · Excel.",
    },
    forWhom: {
      vi: "Chuỗi cửa hàng, nhượng quyền, hoặc từ hai điểm bán trở lên.",
      en: "A chain, a franchise, or two or more points of sale.",
      fr: "Une chaîne, une franchise, ou deux points de vente et plus.",
    },
    ceiling: null,
  },
};
