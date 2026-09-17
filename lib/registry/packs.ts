import type { L10n, Pack, PackId } from "./types";

/**
 * Grille de prix de référence — §12 de PLAN-PACKS-VIETNAM.md.
 * Montants en ₫, TVA non incluse. Entretien annuel : 10 mois payés, 12 mois servis.
 */
export const PACKS: Pack[] = [
  {
    id: "khoi-dau",
    rank: 1,
    gridName: { vi: "Khởi Đầu", en: "Khởi Đầu · Starter", fr: "Khởi Đầu · Starter" },
    tierName: { vi: "Gói cơ bản", en: "Starter pack", fr: "Pack Starter" },
    pitch: {
      vi: "Một trang duy nhất, đủ để khách tìm thấy bạn, xem giá và bấm gọi.",
      en: "A single page — enough for customers to find you, see prices and call.",
      fr: "Une seule page — de quoi vous trouver, voir les prix et appeler.",
    },
    price: 4_900_000,
    priceWithMaintenance: 3_900_000,
    monthly: 490_000,
    yearlyMaintenance: 4_900_000,
    from: false,
    leadTime: { vi: "5 ngày", en: "5 days", fr: "5 jours" },
    accent: "#8E2A20",
    ground: "#FBF7F1",
    onGround: "#1B1A17",
  },
  {
    id: "phat-trien",
    rank: 2,
    gridName: { vi: "Phát Triển", en: "Phát Triển · Business", fr: "Phát Triển · Business" },
    tierName: { vi: "Gói phát triển", en: "Business pack", fr: "Pack Business" },
    pitch: {
      vi: "Năm trang, đặt lịch có xác nhận qua Zalo, mã QR in được, tin tức và đánh giá.",
      en: "Five pages, Zalo-confirmed booking, a printable QR, news and reviews.",
      fr: "Cinq pages, réservation confirmée par Zalo, QR imprimable, actus et avis.",
    },
    price: 11_900_000,
    priceWithMaintenance: 9_900_000,
    monthly: 990_000,
    yearlyMaintenance: 9_900_000,
    from: false,
    leadTime: { vi: "7 ngày", en: "7 days", fr: "7 jours" },
    accent: "#9A5B23",
    ground: "#F4EEE4",
    onGround: "#221D16",
  },
  {
    id: "cao-cap",
    rank: 3,
    gridName: { vi: "Cao Cấp", en: "Cao Cấp · Premium", fr: "Cao Cấp · Premium" },
    tierName: { vi: "Gói cao cấp", en: "Premium pack", fr: "Pack Premium" },
    pitch: {
      vi: "Bán hàng trực tuyến thật: giỏ hàng, VietQR, giao hàng, theo dõi đơn và bảng điều khiển.",
      en: "Real online selling: cart, VietQR, delivery, order tracking and a dashboard.",
      fr: "La vente en ligne réelle : panier, VietQR, livraison, suivi de commande et tableau de bord.",
    },
    // §2.1 du plan CMS (étape 18) : depuis cette étape, ce palier inclut l'espace de
    // gestion (`admin-contenu` dans features.ts) SANS que ce prix change. C'est
    // délibéré et documenté deux fois exprès (ici et sur `OPTIONS` plus bas) : le CMS
    // ajoute de la valeur perçue à coût constant, c'est ce qui fait tenir l'escalier
    // commercial Starter+option ≈ Business, Business+option ≈ Premium. Augmenter ce
    // prix casserait l'argument — ne pas le faire pour « valoriser » le CMS.
    price: 24_900_000,
    priceWithMaintenance: 21_900_000,
    monthly: 1_990_000,
    yearlyMaintenance: 19_900_000,
    from: true,
    leadTime: { vi: "10–14 ngày", en: "10–14 days", fr: "10 à 14 jours" },
    accent: "#D9A02B",
    ground: "#0E2B4A",
    onGround: "#EDE3CE",
  },
  {
    // Décision §4 : le pack Sen Vàng (multi-succursales, forfaits prépayés, back-office
    // à rôles, export KiotViet, PWA offline) ne tient pas dans Cao Cấp à 24,9 M₫.
    // Il devient un quatrième palier, non tarifé, vendu sur cahier des charges.
    id: "doanh-nghiep",
    rank: 4,
    gridName: { vi: "Doanh Nghiệp", en: "Doanh Nghiệp · Enterprise", fr: "Doanh Nghiệp · Entreprise" },
    tierName: { vi: "Gói doanh nghiệp", en: "Enterprise pack", fr: "Pack Entreprise" },
    pitch: {
      vi: "Nhiều chi nhánh, gói trả trước, phân quyền back-office, xuất dữ liệu — theo yêu cầu.",
      en: "Multi-branch, prepaid packages, role-based back office, data export — on specification.",
      fr: "Multi-succursales, forfaits prépayés, back-office à rôles, export — sur cahier des charges.",
    },
    price: null,
    priceWithMaintenance: null,
    monthly: null,
    yearlyMaintenance: null,
    from: true,
    leadTime: { vi: "Theo dự án", en: "Per project", fr: "Selon le projet" },
    accent: "#0E5B4C",
    ground: "#0B1512",
    onGround: "#F7F5EF",
  },
];

/** Plancher indicatif du palier sur devis, affiché en toutes lettres. */
export const ENTERPRISE_FLOOR = 60_000_000;

export const PACK_IDS: PackId[] = PACKS.map((p) => p.id);

export function getPack(id: string): Pack | undefined {
  return PACKS.find((p) => p.id === id);
}

/**
 * Une option vendue en supplément. `price` est un montant fixe, valable quel que soit
 * le palier (ex. un logo coûte pareil pour tout le monde). `priceByPack` modélise une
 * option dont le tarif dépend d'où elle s'insère dans l'échelle — un seul cas
 * aujourd'hui, l'espace de gestion (§2.1 du plan CMS, étape 18) : cher sur Starter,
 * moins cher sur Business, absent de la liste sur Cao Cấp/Doanh Nghiệp puisqu'il y est
 * inclus (voir `admin-contenu` dans `features.ts`, pas ici). Une option porte l'un OU
 * l'autre champ, jamais les deux : un prix fixe n'a pas besoin d'une carte par palier,
 * et un prix par palier n'a pas de valeur unique à afficher.
 */
export type Option = {
  id: string;
  label: L10n;
  price?: number;
  priceByPack?: Partial<Record<PackId, number>>;
  unit?: L10n;
};

/** Options vendues en supplément — §12 de PLAN-PACKS-VIETNAM.md, §2.1 du plan CMS. */
export const OPTIONS: Option[] = [
  { id: "langue", label: { vi: "Thêm một ngôn ngữ", en: "Extra language", fr: "Langue supplémentaire" }, price: 1_500_000 },
  { id: "logo", label: { vi: "Thiết kế logo", en: "Logo design", fr: "Création de logo" }, price: 2_500_000 },
  { id: "zalo-oa", label: { vi: "Zalo OA", en: "Zalo OA", fr: "Zalo OA" }, price: 1_500_000 },
  { id: "photo", label: { vi: "Chụp ảnh sản phẩm", en: "Product photo shoot", fr: "Shooting photo produits" }, price: 2_000_000 },
  // Remplace les trois anciennes options `espace-contenus` / `espace-catalogue` /
  // `espace-boutique` (4,9 / 6,9 / 9,9 M₫, jamais vendues : aucune démo ne les montrait).
  // Une seule option désormais, à prix variable selon le palier où elle s'achète — elle
  // n'apparaît que là où le CMS N'EST PAS inclus (Starter, Business). Sur Cao Cấp et
  // Doanh Nghiệp il est inclus dans le prix du pack, ce n'est plus une option : voir
  // `admin-contenu` dans `features.ts`, et le commentaire sur `PACKS["cao-cap"].price`
  // ci-dessus qui rappelle que ce prix ne bouge pas pour autant.
  //
  // Jamais le mot « CMS » dans un texte visible (nom commercial choisi en étape 12,
  // repris dans `PasscodeGate.tsx` / `CmsEditor.tsx`) : « Tự sửa nội dung » (vi),
  // « Espace de gestion » (fr), « Self-service editing » (en).
  {
    id: "espace-gestion",
    label: { vi: "Tự sửa nội dung", en: "Self-service editing", fr: "Espace de gestion" },
    priceByPack: { "khoi-dau": 6_900_000, "phat-trien": 12_900_000 },
  },
  {
    id: "ads",
    label: { vi: "Quản lý Facebook Ads", en: "Facebook Ads management", fr: "Gestion Facebook Ads" },
    price: 3_000_000,
    unit: { vi: "/tháng", en: "/month", fr: "/mois" },
  },
];

/**
 * Périmètre d'une « modification légère » après livraison (§2.2 du plan CMS, étape 18).
 * Le PRIX et le QUOTA varient par palier (voir la ligne `modifications` du groupe
 * `accompagnement` dans `features.ts`) ; le PÉRIMÈTRE, lui, est identique pour tout le
 * monde — d'où une seule liste ici plutôt qu'une par palier. Affiché tel quel sur
 * `/packs`, à ne pas reformuler : c'est la liste qui évite l'appel « et si je veux
 * juste... » sur un cas hors périmètre.
 */
export const MODIFICATIONS_SCOPE: { included: L10n[]; excluded: L10n[] } = {
  included: [
    { vi: "Đổi giá một món / dịch vụ", en: "Change the price of an item", fr: "Changer le prix d'un plat / service" },
    { vi: "Sửa một lỗi chính tả", en: "Fix a typo", fr: "Corriger une faute" },
    { vi: "Thay một ảnh trong thư viện", en: "Replace a gallery photo", fr: "Remplacer une photo de la galerie" },
    { vi: "Cập nhật giờ mở cửa", en: "Update the opening hours", fr: "Mettre à jour les horaires" },
    { vi: "Đăng một tin tức", en: "Publish a news item", fr: "Publier une actualité" },
  ],
  excluded: [
    { vi: "Thêm một trang mới", en: "Add a new page", fr: "Ajouter une page" },
    { vi: "Thêm một ngôn ngữ mới", en: "Add a new language", fr: "Ajouter une langue" },
    { vi: "Làm lại bố cục một mục", en: "Redesign a section's layout", fr: "Refaire la mise en page d'une section" },
    { vi: "Gắn thêm module đặt lịch", en: "Add a booking module", fr: "Brancher un module de réservation" },
    { vi: "Đổi bộ nhận diện thương hiệu", en: "Change the visual identity", fr: "Changer la charte graphique" },
    // La traduction est un métier, pas une modification : jamais dans le forfait.
    { vi: "Dịch nội dung sang ngôn ngữ khác", en: "Translate content into another language", fr: "Traduire un contenu" },
  ],
};

/** Note affichée sous le périmètre — non cumulable, délai de traitement. */
export const MODIFICATIONS_NOTE: L10n = {
  vi: "Không dồn sang tháng sau. Gộp các yêu cầu trong một lần gửi, xử lý trong vòng 48 giờ làm việc.",
  en: "Doesn't roll over to next month. Send requests in one batch — handled within 48 business hours.",
  fr: "Non cumulable d'un mois sur l'autre. Un envoi groupé, traité sous 48 h ouvrées.",
};

/** Les quatre étapes affichées sur l'accueil et la page process. */
export const PROCESS: { step: number; label: L10n }[] = [
  { step: 1, label: { vi: "Chọn gói", en: "Pick a pack", fr: "Choix du pack" } },
  { step: 2, label: { vi: "Đặt cọc 50%", en: "50% deposit", fr: "Acompte 50 %" } },
  { step: 3, label: { vi: "Nhận web trong 7 ngày", en: "Site in 7 days", fr: "Site en 7 jours" } },
  { step: 4, label: { vi: "Bàn giao & hướng dẫn", en: "Handover & training", fr: "Livraison & formation" } },
];
