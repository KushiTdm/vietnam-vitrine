import type { Feature, L10n } from "./types";

const yes: L10n = { vi: "Có", en: "Included", fr: "Inclus" };

/**
 * Matrice de comparaison du portfolio — reprise de la grille §12 et de
 * `artisanat-vietnam-landing/lib/packs.ts`, étendue au palier Doanh Nghiệp.
 *
 * C'est la seule définition de « ce que contient un pack ». Une verticale peut la
 * surcharger (`Vertical.overrides`) ou l'étendre (`Vertical.extraFeatures`) — jamais
 * la contredire ailleurs dans le code.
 */
export const FEATURES: Feature[] = [
  // ---------- Socle ----------
  {
    id: "pages",
    group: "socle",
    label: { vi: "Số trang", en: "Pages", fr: "Nombre de pages" },
    values: {
      "khoi-dau": { vi: "1 trang", en: "1 page", fr: "1 page" },
      "phat-trien": { vi: "5 trang", en: "5 pages", fr: "5 pages" },
      "cao-cap": { vi: "8 trang + khu vực khách hàng", en: "8 pages + customer area", fr: "8 pages + espace client" },
      "doanh-nghiep": { vi: "Không giới hạn + back-office", en: "Unlimited + back office", fr: "Illimité + back-office" },
    },
  },
  {
    id: "langues",
    group: "socle",
    label: { vi: "Ngôn ngữ", en: "Languages", fr: "Langues" },
    values: {
      "khoi-dau": { vi: "VI + EN", en: "VI + EN", fr: "VI + EN" },
      "phat-trien": { vi: "VI + EN + FR", en: "VI + EN + FR", fr: "VI + EN + FR" },
      "cao-cap": { vi: "VI + EN + FR", en: "VI + EN + FR", fr: "VI + EN + FR" },
      "doanh-nghiep": { vi: "VI + EN + FR", en: "VI + EN + FR", fr: "VI + EN + FR" },
    },
  },
  {
    id: "responsive",
    group: "socle",
    label: { vi: "Hiển thị tốt trên điện thoại", en: "Mobile-first responsive", fr: "Responsive mobile d'abord" },
    values: { "khoi-dau": yes, "phat-trien": yes, "cao-cap": yes, "doanh-nghiep": yes },
  },
  {
    id: "contact",
    group: "socle",
    label: {
      vi: "Gọi · Zalo · Messenger · Chỉ đường",
      en: "Call · Zalo · Messenger · Directions",
      fr: "Appel · Zalo · Messenger · Itinéraire",
    },
    values: { "khoi-dau": yes, "phat-trien": yes, "cao-cap": yes, "doanh-nghiep": yes },
  },
  {
    id: "gbp",
    group: "socle",
    label: { vi: "Hồ sơ Google Business", en: "Google Business profile", fr: "Fiche Google Business" },
    values: { "khoi-dau": yes, "phat-trien": yes, "cao-cap": yes, "doanh-nghiep": yes },
  },

  // ---------- Contenu ----------
  {
    id: "catalogue",
    group: "contenu",
    label: { vi: "Danh mục sản phẩm / dịch vụ", en: "Product & service catalogue", fr: "Catalogue produits / services" },
    values: {
      "khoi-dau": { vi: "6 dòng kèm giá", en: "6 lines with prices", fr: "6 lignes avec prix" },
      "phat-trien": { vi: "Đầy đủ, theo danh mục", en: "Full, by category", fr: "Complet, par catégorie" },
      "cao-cap": { vi: "Đầy đủ + trang chi tiết", en: "Full + detail pages", fr: "Complet + fiches détaillées" },
      "doanh-nghiep": { vi: "Đầy đủ + quản lý riêng", en: "Full + own admin", fr: "Complet + administration propre" },
    },
  },
  {
    id: "galerie",
    group: "contenu",
    label: { vi: "Thư viện ảnh", en: "Photo gallery", fr: "Galerie photos" },
    values: { "khoi-dau": yes, "phat-trien": yes, "cao-cap": yes, "doanh-nghiep": yes },
  },
  {
    id: "actus",
    group: "contenu",
    label: { vi: "Tin tức & khuyến mãi", en: "News & promotions", fr: "Actualités & promotions" },
    values: { "khoi-dau": false, "phat-trien": yes, "cao-cap": yes, "doanh-nghiep": yes },
  },
  {
    id: "avis",
    group: "contenu",
    label: { vi: "Đánh giá Google", en: "Google reviews", fr: "Avis Google" },
    values: { "khoi-dau": false, "phat-trien": yes, "cao-cap": yes, "doanh-nghiep": yes },
  },
  {
    // Décision d'offre inversée à l'étape 18 du plan CMS (2026) — l'ancien commentaire
    // ici disait « ne jamais remettre `yes` sur les trois paliers tarifés » en citant
    // `apps/artisanat/CONDITIONS-COMMERCIALES.md` §2 (« Aucun pack ne contient de CMS
    // par défaut »). Cette référence est doublement caduque : le fichier a disparu avec
    // `apps/artisanat` au commit `8a1dcf9`, et la décision elle-même a changé.
    //
    // Ce qui a changé, concrètement : un CMS maison existe désormais
    // (`apps/site/lib/cms/**`), démontrable par un prospect anonyme sur 6 démos, et
    // cloisonné démo par démo par une allowlist statique (`CMS_REGISTRY` dans
    // `apps/site/lib/cms/registry.ts`) — une démo absente de cette liste répond 404 sur
    // ses routes `/api/cms/*`, quelle que soit la valeur ci-dessous. La matrice peut
    // donc annoncer l'inclusion sans mentir, ce qui n'était pas vrai avant.
    //
    // Nouvelle règle (§2.1 du plan CMS) : inclus sur Cao Cấp et Doanh Nghiệp, option
    // payante et volontairement chère sur Khởi Đầu / Phát Triển (`OPTIONS` de
    // `packs.ts`, id `espace-gestion`, 6,9 M₫ / 12,9 M₫ — pas un contenu de ces deux
    // paliers, d'où `false` ici). NE PAS remettre `false` sur `cao-cap` en croyant
    // corriger une régression : c'est la décision actuelle, l'inverse de l'ancienne.
    //
    // Piège pour la suite : ce `yes` global suppose que TOUTE démo `cao-cap` et
    // `doanh-nghiep` du registre a et son `lib/cms-schema.ts` déclaré dans
    // `CMS_REGISTRY`, et son `evidence["admin-contenu"]` dans `demos.ts` — sinon
    // `pnpm audit:packs` la signale `non-verifiable` (preuve à écrire) ou pire,
    // `manquant` (si l'evidence existe mais rate). Vérifié à l'étape 18 : les 5 démos
    // `cao-cap` existantes (cafe, shop, homestay, les deux restaurant) et l'unique démo
    // `doanh-nghiep` (salon) sont TOUTES dans `CMS_REGISTRY` — la bascule globale ne
    // crée donc aucune fuite ni aucun trou. Si une future démo `cao-cap` ou
    // `doanh-nghiep` n'a PAS le CMS, ne touchez pas à cette ligne : utilisez
    // `verticals.overrides` pour ce métier précis, comme `reservation` le fait déjà
    // chez les salons — ne cassez pas l'offre des autres métiers pour un seul cas.
    id: "admin-contenu",
    group: "contenu",
    label: { vi: "Tự sửa nội dung & giá", en: "Edit content & prices yourself", fr: "Modifier contenu et prix vous-même" },
    values: { "khoi-dau": false, "phat-trien": false, "cao-cap": yes, "doanh-nghiep": yes },
  },

  // ---------- Conversion ----------
  {
    id: "reservation",
    group: "conversion",
    label: { vi: "Đặt lịch trực tuyến", en: "Online booking", fr: "Prise de rendez-vous en ligne" },
    values: {
      "khoi-dau": false,
      "phat-trien": { vi: "Xác nhận Zalo trong 15 phút", en: "Zalo confirmation in 15 min", fr: "Confirmation Zalo en 15 min" },
      "cao-cap": yes,
      "doanh-nghiep": { vi: "Phân bổ phòng & nhân sự", en: "Room & staff allocation", fr: "Allocation cabines & personnel" },
    },
  },
  {
    id: "qr",
    group: "conversion",
    label: { vi: "Mã QR in được", en: "Printable QR code", fr: "QR code imprimable" },
    values: { "khoi-dau": false, "phat-trien": yes, "cao-cap": yes, "doanh-nghiep": yes },
  },
  {
    id: "seo",
    group: "conversion",
    label: { vi: "SEO địa phương", en: "Local SEO", fr: "SEO local" },
    values: {
      "khoi-dau": { vi: "Cơ bản", en: "Basic", fr: "Basique" },
      "phat-trien": { vi: "Đầy đủ + JSON-LD", en: "Full + JSON-LD", fr: "Complet + JSON-LD" },
      "cao-cap": { vi: "Đầy đủ + JSON-LD", en: "Full + JSON-LD", fr: "Complet + JSON-LD" },
      "doanh-nghiep": { vi: "Đầy đủ + theo chi nhánh", en: "Full + per branch", fr: "Complet + par succursale" },
    },
  },
  {
    id: "tracking",
    group: "conversion",
    label: { vi: "GA4 + Facebook Pixel", en: "GA4 + Facebook Pixel", fr: "GA4 + Pixel Facebook" },
    values: { "khoi-dau": false, "phat-trien": yes, "cao-cap": yes, "doanh-nghiep": yes },
  },

  // ---------- Vente ----------
  {
    id: "panier",
    group: "vente",
    label: { vi: "Giỏ hàng & đặt hàng trực tuyến", en: "Cart & online ordering", fr: "Panier & commande en ligne" },
    values: { "khoi-dau": false, "phat-trien": false, "cao-cap": yes, "doanh-nghiep": yes },
  },
  {
    id: "paiement",
    group: "vente",
    label: { vi: "VietQR · MoMo · COD", en: "VietQR · MoMo · COD", fr: "VietQR · MoMo · paiement à la livraison" },
    values: { "khoi-dau": false, "phat-trien": false, "cao-cap": yes, "doanh-nghiep": yes },
  },
  {
    id: "livraison",
    group: "vente",
    label: { vi: "GHTK · GHN · Viettel Post", en: "GHTK · GHN · Viettel Post", fr: "GHTK · GHN · Viettel Post" },
    values: { "khoi-dau": false, "phat-trien": false, "cao-cap": yes, "doanh-nghiep": yes },
  },
  {
    id: "suivi",
    group: "vente",
    label: { vi: "Theo dõi đơn hàng", en: "Order tracking", fr: "Suivi de commande" },
    values: { "khoi-dau": false, "phat-trien": false, "cao-cap": yes, "doanh-nghiep": yes },
  },
  {
    id: "fidelite",
    group: "vente",
    label: { vi: "Tích điểm khách quen", en: "Loyalty points", fr: "Fidélité (points)" },
    values: { "khoi-dau": false, "phat-trien": false, "cao-cap": yes, "doanh-nghiep": yes },
  },
  {
    id: "forfaits",
    group: "vente",
    label: { vi: "Gói trả trước / liệu trình", en: "Prepaid packages", fr: "Forfaits prépayés" },
    values: { "khoi-dau": false, "phat-trien": false, "cao-cap": false, "doanh-nghiep": yes },
  },
  {
    id: "vat",
    group: "vente",
    label: { vi: "Hóa đơn điện tử VAT", en: "VAT e-invoicing", fr: "Facture électronique VAT" },
    values: { "khoi-dau": false, "phat-trien": false, "cao-cap": false, "doanh-nghiep": yes },
  },

  // ---------- Pilotage ----------
  {
    id: "dashboard",
    group: "pilotage",
    label: { vi: "Bảng điều khiển đơn hàng", en: "Orders dashboard", fr: "Tableau de bord des commandes" },
    values: { "khoi-dau": false, "phat-trien": false, "cao-cap": yes, "doanh-nghiep": yes },
  },
  {
    id: "succursales",
    group: "pilotage",
    label: { vi: "Nhiều chi nhánh", en: "Multi-branch", fr: "Multi-succursales" },
    values: { "khoi-dau": false, "phat-trien": false, "cao-cap": yes, "doanh-nghiep": yes },
  },
  {
    id: "roles",
    group: "pilotage",
    label: { vi: "Phân quyền nhân viên", en: "Staff roles & permissions", fr: "Rôles et permissions" },
    values: { "khoi-dau": false, "phat-trien": false, "cao-cap": false, "doanh-nghiep": yes },
  },
  {
    id: "export",
    group: "pilotage",
    label: { vi: "Xuất dữ liệu (KiotViet, Sapo, Excel)", en: "Data export (KiotViet, Sapo, Excel)", fr: "Export (KiotViet, Sapo, Excel)" },
    values: { "khoi-dau": false, "phat-trien": false, "cao-cap": false, "doanh-nghiep": yes },
  },

  // ---------- Accompagnement ----------
  {
    id: "formation",
    group: "accompagnement",
    label: { vi: "Hướng dẫn sử dụng", en: "Training", fr: "Formation & prise en main" },
    values: {
      "khoi-dau": { vi: "Hướng dẫn PDF", en: "PDF guide", fr: "Guide PDF" },
      "phat-trien": { vi: "1 giờ trực tuyến", en: "1 h online", fr: "1 h en ligne" },
      "cao-cap": { vi: "2 giờ tại cửa hàng", en: "2 h on site", fr: "2 h sur place" },
      "doanh-nghiep": { vi: "Đào tạo theo nhóm", en: "Team training", fr: "Formation d'équipe" },
    },
  },
  {
    // §2.2 du plan CMS (étape 18) — la ligne qui manquait : que se passe-t-il quand le
    // client demande un changement APRÈS la livraison ? Avant cette étape, rien ne le
    // disait, et la réponse de fait était « gratuitement sur Zalo » — la fuite de marge
    // n°1 identifiée par l'agent commercial du plan. Le périmètre exact d'une
    // « modification légère » (✅ prix, faute, photo, horaires, actu — ❌ page, langue,
    // refonte, réservation, charte graphique, traduction) est affiché sur `/packs`,
    // pas ici : voir `MODIFICATIONS_SCOPE` dans `packs.ts`, identique pour tous les
    // paliers (seuls le prix et le quota varient, donc ci-dessous).
    //
    // Le calcul doit se faire tout seul chez le client : sur Starter, l'entretien
    // (490.000₫/mois) est déjà moins cher qu'UNE seule intervention ponctuelle
    // (500.000₫/heure entamée) dès la première demande — inutile de le vendre plus fort
    // que ça.
    id: "modifications",
    group: "accompagnement",
    label: { vi: "Sửa đổi sau khi bàn giao", en: "Changes after delivery", fr: "Modifications après livraison" },
    values: {
      "khoi-dau": {
        vi: "500.000₫/giờ nếu không có bảo trì · 2 chỉnh sửa nhẹ/tháng nếu có bảo trì",
        en: "500,000₫/hour started without maintenance · 2 light edits/month with it",
        fr: "500.000₫/heure entamée sans entretien · 2 modifications légères/mois avec",
      },
      "phat-trien": {
        vi: "500.000₫/giờ nếu không có bảo trì · 4 chỉnh sửa nhẹ/tháng nếu có bảo trì",
        en: "500,000₫/hour started without maintenance · 4 light edits/month with it",
        fr: "500.000₫/heure entamée sans entretien · 4 modifications légères/mois avec",
      },
      "cao-cap": {
        vi: "Không giới hạn, tự sửa · thêm 2 việc ngoài phạm vi/tháng nếu có bảo trì",
        en: "Unlimited, by yourself · plus 2 off-scope tasks/month with maintenance",
        fr: "Illimité, par vous-même · + 2 interventions hors périmètre/mois avec entretien",
      },
      "doanh-nghiep": {
        vi: "Không giới hạn, tự sửa · theo hợp đồng",
        en: "Unlimited, by yourself · per contract",
        fr: "Illimité, par vous-même · selon contrat",
      },
    },
  },
];

export const FEATURE_GROUP_LABELS: Record<Feature["group"], L10n> = {
  socle: { vi: "Nền tảng", en: "Foundations", fr: "Socle" },
  contenu: { vi: "Nội dung", en: "Content", fr: "Contenu" },
  conversion: { vi: "Thu hút khách", en: "Getting customers", fr: "Conversion" },
  vente: { vi: "Bán hàng", en: "Selling", fr: "Vente" },
  pilotage: { vi: "Quản lý", en: "Running it", fr: "Pilotage" },
  accompagnement: { vi: "Hỗ trợ", en: "Support", fr: "Accompagnement" },
};
