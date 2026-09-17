import type { Demo } from "./types";

/**
 * Les démos du portfolio. **Ajouter une démo = ajouter une entrée ici.**
 *
 * `evidence` est lu par l'agent de conformité (`tools/audit/packs.mjs`) : pour chaque
 * fonctionnalité que le registre annonce incluse dans ce pack, il cherche la preuve
 * déclarée dans le code. Une fonctionnalité annoncée sans preuve déclarée est signalée
 * « non vérifiable » — ce n'est pas une erreur, c'est une preuve à écrire.
 */
export const DEMOS: Demo[] = [
  // ────────────────────────────── Cafés ──────────────────────────────
  {
    id: "cafe-khoi-dau",
    vertical: "cafe",
    pack: "khoi-dau",
    businessName: "Ngõ Nhỏ",
    district: "Hoàn Kiếm",
    designNote: {
      vi: "Một trang, nền kem, bảng giá là nội dung chính.",
      en: "One page, cream ground, the price board is the content.",
      fr: "Une page, fond crème, la carte des prix EST le contenu.",
    },
    path: "/demo/cafe-khoi-dau",
    url: null,
    status: "live",
    defaultLocale: "vi",
    evidence: {
      pages: { routes: ["page.tsx"] },
      langues: { grep: [{ file: "i18n.tsx", pattern: 'value: "en"' }] },
      responsive: { grep: [{ file: "page.module.css", pattern: "@media \\(min-width" }] },
      contact: { grep: [{ file: "ContactBar.tsx", pattern: "zalo\\.me/.+m\\.me/|maps/dir" }] },
      gbp: {
        files: ["JsonLd.tsx"],
        grep: [
          { file: "JsonLd.tsx", pattern: "application/ld\\+json" },
          { file: "site.config.ts", pattern: "openingHoursSchema" },
          { file: "layout.tsx", pattern: "LocalBusinessJsonLd" },
        ],
      },
      catalogue: { grep: [{ file: "menu.ts", pattern: "MENU_ITEMS" }] },
      galerie: { grep: [{ file: "page.tsx", pattern: "styles\\.galleryGrid" }] },
      seo: { grep: [{ file: "layout.tsx", pattern: "export const metadata" }] },
    },
    knownGaps: [
      "formation : engagement de service (guide PDF), rien à vérifier dans le code — voir reports/CONFORMITE.md",
    ],
  },
  {
    id: "cafe-phat-trien",
    vertical: "cafe",
    pack: "phat-trien",
    businessName: "Phin",
    district: "Hoàn Kiếm",
    designNote: {
      vi: "Nhiều trang, đặt bàn ba bước, xác nhận qua Zalo.",
      en: "Multi-page, three-step table booking, Zalo confirmation.",
      fr: "Multi-pages, réservation en trois étapes, confirmation Zalo.",
    },
    path: "/demo/cafe-phat-trien",
    url: null,
    status: "live",
    defaultLocale: "vi",
    evidence: {
      pages: { routes: ["page.tsx", "qr/page.tsx"] },
      langues: { grep: [{ file: "i18n.tsx", pattern: 'value: "en"' }] },
      responsive: { grep: [{ file: "page.module.css", pattern: "@media \\(min-width" }] },
      contact: { grep: [{ file: "ContactBar.tsx", pattern: "zalo\\.me|m\\.me|maps/dir" }] },
      gbp: {
        files: ["JsonLd.tsx"],
        grep: [
          { file: "JsonLd.tsx", pattern: "application/ld\\+json" },
          { file: "site.config.ts", pattern: "openingHoursSchema" },
        ],
      },
      catalogue: { grep: [{ file: "page.tsx", pattern: "menu\\.map\\(" }] },
      galerie: { grep: [{ file: "page.tsx", pattern: "styles\\.galleryImage" }] },
      avis: {
        files: ["Reviews.tsx"],
        grep: [{ file: "Reviews.tsx", pattern: "REVIEWS" }],
      },
      reservation: {
        files: ["ReservationForm.tsx"],
        api: ["api/reservations/route.ts"],
      },
      qr: { grep: [{ file: "qr/page.tsx", pattern: "QRCode\\.toDataURL" }] },
      tracking: {
        grep: [
          { file: "Analytics.tsx", pattern: "NEXT_PUBLIC_GA_ID" },
          { file: "Analytics.tsx", pattern: "fbq" },
          { file: "layout.tsx", pattern: "<Analytics />" },
        ],
      },
      seo: {
        grep: [
          { file: "layout.tsx", pattern: "export const metadata" },
          { file: "JsonLd.tsx", pattern: "application/ld\\+json" },
        ],
      },
    },
    knownGaps: [
      "pages : le palier annonce 5 pages, la démo en a 2 (accueil en ancres + /qr). Écart réel, à coder ou à requalifier.",
      "actus : pas de section tin tức / actualités (annoncée dès Phát Triển)",
      "tracking : GA4 et Pixel sont câblés mais dormants — ils n'émettent qu'une fois NEXT_PUBLIC_GA_ID et NEXT_PUBLIC_FB_PIXEL_ID renseignés",
      "formation : engagement de service (1 h en ligne), rien à vérifier dans le code",
    ],
  },
  {
    id: "cafe-cao-cap",
    vertical: "cafe",
    pack: "cao-cap",
    businessName: "Đèn Lồng",
    district: "Tây Hồ",
    designNote: {
      vi: "Ứng dụng di động: giỏ hàng, theo dõi đơn, bảng điều khiển.",
      en: "A mobile app: cart, order tracking, dashboard.",
      fr: "Une app mobile : panier, suivi de commande, tableau de bord.",
    },
    path: "/demo/cafe-cao-cap",
    url: null,
    status: "live",
    defaultLocale: "vi",
    evidence: {
      pages: {
        routes: [
          "page.tsx",
          "(shop)/carte/page.tsx",
          "(shop)/le-lieu/page.tsx",
          "(shop)/moi/page.tsx",
          "dashboard/page.tsx",
          "qr/page.tsx",
        ],
      },
      langues: { grep: [{ file: "lib/i18n.tsx", pattern: 'value: "en"' }] },
      responsive: { grep: [{ file: "page.module.css", pattern: "@media \\(min-width" }] },
      contact: {
        grep: [
          { file: "page.tsx", pattern: "tel:\\$\\{site\\.phone\\}" },
          { file: "page.tsx", pattern: "zalo\\.me" },
          { file: "page.tsx", pattern: "m\\.me" },
          { file: "lib/site-content.ts", pattern: "export const MAP_LINK" },
        ],
      },
      gbp: {
        files: ["JsonLd.tsx"],
        grep: [
          { file: "JsonLd.tsx", pattern: "application/ld\\+json" },
          { file: "site.config.ts", pattern: "openingHoursSchema" },
        ],
      },
      catalogue: {
        routes: ["(shop)/produit/[id]/page.tsx"],
        grep: [{ file: "lib/products.ts", pattern: "export const PRODUCTS" }],
      },
      avis: {
        grep: [
          { file: "lib/site-content.ts", pattern: "export const REVIEWS" },
          { file: "page.tsx", pattern: 'id="avis"' },
        ],
      },
      panier: {
        routes: ["(shop)/panier/page.tsx"],
        grep: [{ file: "(shop)/cart-context.tsx", pattern: "CartProvider|useCart" }],
      },
      paiement: {
        grep: [
          { file: "lib/vietqr.ts", pattern: "img\\.vietqr\\.io" },
          { file: "(shop)/panier/page.tsx", pattern: 'paymentMethod === "vietqr"' },
        ],
      },
      suivi: {
        routes: ["(shop)/commande/[id]/page.tsx"],
        api: ["api/orders/[id]/route.ts"],
      },
      dashboard: {
        routes: ["dashboard/page.tsx"],
        api: ["api/orders/route.ts"],
        files: ["lib/dashboard-auth.ts"],
      },
      fidelite: { grep: [{ file: "lib/i18n.tsx", pattern: "me\\.cardLabel" }] },
      qr: { grep: [{ file: "qr/page.tsx", pattern: "QRCode\\.toDataURL" }] },
      tracking: {
        grep: [
          { file: "Analytics.tsx", pattern: "NEXT_PUBLIC_GA_ID" },
          { file: "Analytics.tsx", pattern: "fbq" },
          { file: "layout.tsx", pattern: "<Analytics />" },
        ],
      },
      seo: {
        grep: [
          { file: "layout.tsx", pattern: "export const metadata" },
          { file: "JsonLd.tsx", pattern: "application/ld\\+json" },
        ],
      },
      // Étape 18 (§2.4 du plan CMS). `getVisiblePatch` (pas `getPublishedPatch` seul,
      // corrigé à l'étape 16) est bien ce qu'appelle ce layout — vérifié dans le fichier
      // avant d'écrire ce grep, pas supposé.
      "admin-contenu": {
        files: ["lib/cms-schema.ts"],
        routes: ["quan-tri/noi-dung/page.tsx"],
        grep: [
          { file: "lib/cms-schema.ts", pattern: "locales:\\s*\\[" },
          { file: "layout.tsx", pattern: "getVisiblePatch" },
        ],
      },
    },
    knownGaps: [
      "livraison : aucun choix de transporteur GHTK / GHN / Viettel Post — la commande est un retrait au comptoir",
      "succursales : multi-succursales annoncé au palier Cao Cấp, absent ici (le modèle existe dans apps/artisanat)",
      "reservation : la réservation de table existe au palier Phát Triển et disparaît au Cao Cấp — régression à corriger",
      "galerie : pas de section galerie dédiée alors que les deux paliers inférieurs en ont une",
      "actus : pas de section tin tức / actualités",
      "fidelite : la carte « neuvième tasse offerte » est un texte fixe, non calculé depuis l'historique de commandes",
      "formation : engagement de service (2 h sur place), rien à vérifier dans le code",
    ],
  },

  // ────────────────────────────── Salons ──────────────────────────────
  {
    id: "salon-khoi-dau",
    vertical: "salon",
    pack: "khoi-dau",
    businessName: "Tiệm Cắt Số 7",
    district: "Hoàn Kiếm",
    designNote: {
      vi: "Chữ in hoa, than chì và đồng thau. Bảng giá chính là trang web.",
      en: "Caps, graphite and brass. The price grid is the page.",
      fr: "Capitales, graphite et laiton. La grille tarifaire EST la page.",
    },
    path: "/demo/salon-khoi-dau",
    url: null,
    status: "live",
    defaultLocale: "vi",
    evidence: {
      pages: { routes: ["page.tsx"], files: ["StarterPack.tsx"] },
      responsive: {
        grep: [
          { file: "khoi-dau.css", pattern: "@media" },
          { file: "../_salons-shared/components/MobileBar.tsx", pattern: "mbar" },
        ],
      },
      contact: {
        grep: [
          { file: "StarterPack.tsx", pattern: "ZALO_HREF" },
          { file: "StarterPack.tsx", pattern: "MESSENGER_HREF" },
          { file: "StarterPack.tsx", pattern: "MAPS_HREF" },
        ],
      },
      gbp: {
        files: ["../_salons-shared/components/JsonLd.tsx", "../_salons-shared/lib/business.ts"],
        grep: [
          { file: "../_salons-shared/components/JsonLd.tsx", pattern: "application/ld\\+json" },
          { file: "page.tsx", pattern: 'LocalBusinessJsonLd pack="A"' },
        ],
      },
      catalogue: { grep: [{ file: "../_salons-shared/lib/data.ts", pattern: "export const SERVICES_A" }] },
      reservation: {
        grep: [
          { file: "StarterPack.tsx", pattern: "SLOTS_A" },
          { file: "StarterPack.tsx", pattern: "TAKEN_A" },
          { file: "StarterPack.tsx", pattern: "setBooked\\(true\\)" },
        ],
      },
      seo: { grep: [{ file: "page.tsx", pattern: "export const metadata" }] },
    },
    knownGaps: [
      "langues : VI + FR seulement — le palier Khởi Đầu annonce VI + EN (écart E2, chiffré dans reports/CONFORMITE.md)",
      "galerie : aucune galerie photos — la seule image de contenu est le hero. Écart réel, le moins cher à combler du portfolio.",
      "formation : engagement de service (guide PDF), rien à vérifier dans le code",
    ],
  },
  {
    id: "salon-phat-trien",
    vertical: "salon",
    pack: "phat-trien",
    businessName: "Hương Salon",
    district: "Ba Đình",
    designNote: {
      vi: "Kem, hồng đậm và vàng. Lookbook là danh mục.",
      en: "Cream, hot pink and gold. The lookbook is the catalogue.",
      fr: "Crème, rose vif et or. Le lookbook EST le catalogue.",
    },
    path: "/demo/salon-phat-trien",
    url: null,
    status: "live",
    defaultLocale: "vi",
    evidence: {
      pages: {
        routes: ["page.tsx", "qr/page.tsx"],
        files: ["BusinessPack.tsx"],
      },
      responsive: {
        grep: [
          { file: "phat-trien.css", pattern: "@media" },
          { file: "../_salons-shared/components/MobileBar.tsx", pattern: "mbar" },
        ],
      },
      gbp: {
        files: ["../_salons-shared/components/JsonLd.tsx", "../_salons-shared/lib/business.ts"],
        grep: [
          { file: "../_salons-shared/components/JsonLd.tsx", pattern: "application/ld\\+json" },
          { file: "page.tsx", pattern: 'LocalBusinessJsonLd pack="B"' },
        ],
      },
      catalogue: { grep: [{ file: "../_salons-shared/lib/data.ts", pattern: "export const SERVICES_B" }] },
      galerie: { grep: [{ file: "BusinessPack.tsx", pattern: "pb-mosaic" }] },
      lookbook: {
        grep: [
          { file: "../_salons-shared/lib/data.ts", pattern: "export const LOOKS_B" },
          { file: "BusinessPack.tsx", pattern: 'id="b-look"' },
        ],
      },
      stylist: {
        grep: [
          { file: "../_salons-shared/lib/data.ts", pattern: "export const TEAM_B" },
          { file: "BusinessPack.tsx", pattern: "setStylist" },
        ],
      },
      "panier-services": {
        grep: [
          { file: "BusinessPack.tsx", pattern: "pb-cart__item" },
          { file: "BusinessPack.tsx", pattern: "const dur = items.length" },
        ],
      },
      reservation: {
        grep: [
          { file: "../_salons-shared/lib/data.ts", pattern: "export const SLOTS_B" },
          { file: "BusinessPack.tsx", pattern: "pb-slot" },
        ],
      },
      paiement: {
        files: ["../_salons-shared/lib/vietqr.ts"],
        grep: [
          { file: "../_salons-shared/lib/vietqr.ts", pattern: "img\\.vietqr\\.io" },
          { file: "BusinessPack.tsx", pattern: 'pay === "VietQR"' },
        ],
      },
      avis: {
        files: ["../_salons-shared/components/Reviews.tsx"],
        grep: [{ file: "../_salons-shared/lib/data.ts", pattern: "export const REVIEWS_B" }],
      },
      qr: { grep: [{ file: "../_salons-shared/components/QrSheet.tsx", pattern: "QRCode\\.toDataURL" }] },
      tracking: {
        grep: [
          { file: "../_salons-shared/components/Analytics.tsx", pattern: "NEXT_PUBLIC_GA_ID" },
          { file: "../_salons-shared/components/Analytics.tsx", pattern: "fbq" },
          { file: "page.tsx", pattern: "<Analytics />" },
        ],
      },
      seo: { grep: [{ file: "page.tsx", pattern: "export const metadata" }] },
    },
    knownGaps: [
      "langues : VI + FR seulement — le palier annonce VI + EN + FR (écart E2)",
      "contact : les liens du pied de page (téléphone, Zalo, réseaux) mènent tous à /demo — aucun tel:, zalo.me ni itinéraire réel. Écart réel, une heure de travail.",
      "actus : seul un bandeau promotionnel existe, pas de rubrique tin tức",
      "rappel : le rappel Zalo 24 h est écrit dans la copie, pas implémenté (il demande une Zalo OA au nom du salon)",
      "paiement : seul VietQR est réel (QR NAPAS). MoMo et ZaloPay restent simulés — ils exigent un compte marchand ; la démo le dit désormais au lieu de le laisser croire.",
      "formation : engagement de service (1 h en ligne), rien à vérifier dans le code",
    ],
  },
  {
    id: "salon-doanh-nghiep",
    vertical: "salon",
    pack: "doanh-nghiep",
    businessName: "Sen Vàng",
    district: "Ba Đình · TP.HCM · Đà Nẵng",
    designNote: {
      vi: "Ngọc bích, ngà và vàng. Số buổi còn lại thay cho danh mục.",
      en: "Jade, ivory and gold. The sessions left replace the catalogue.",
      fr: "Jade, ivoire et or. Le solde de séances remplace le catalogue.",
    },
    path: "/demo/salon-doanh-nghiep",
    url: null,
    status: "live",
    defaultLocale: "vi",
    evidence: {
      pages: {
        routes: ["page.tsx", "qr/page.tsx"],
        files: ["EnterprisePack.tsx"],
      },
      responsive: {
        grep: [
          { file: "doanh-nghiep.css", pattern: "@media" },
          { file: "../_salons-shared/components/MobileBar.tsx", pattern: "mbar" },
        ],
      },
      gbp: {
        files: ["../_salons-shared/components/JsonLd.tsx", "../_salons-shared/lib/business.ts"],
        grep: [
          { file: "../_salons-shared/components/JsonLd.tsx", pattern: "department" },
          { file: "page.tsx", pattern: 'LocalBusinessJsonLd pack="C"' },
        ],
      },
      catalogue: {
        grep: [
          { file: "../_salons-shared/lib/data.ts", pattern: "export const TREATS_C" },
          { file: "EnterprisePack.tsx", pattern: 'id="c-treat"' },
        ],
      },
      galerie: { grep: [{ file: "../_salons-shared/lib/data.ts", pattern: "export const IMG_C" }] },
      succursales: {
        grep: [
          { file: "../_salons-shared/lib/data.ts", pattern: "export const BRANCHES_C" },
          { file: "EnterprisePack.tsx", pattern: "setBranch" },
        ],
      },
      forfaits: {
        grep: [
          { file: "../_salons-shared/lib/data.ts", pattern: "export const COMBOS_C" },
          { file: "EnterprisePack.tsx", pattern: 'id="c-combo"' },
        ],
      },
      reservation: {
        grep: [
          { file: "../_salons-shared/lib/data.ts", pattern: "export const SLOTS_C" },
          { file: "EnterprisePack.tsx", pattern: "setStaff" },
        ],
      },
      stylist: {
        grep: [
          { file: "../_salons-shared/lib/data.ts", pattern: "export const STAFF_C" },
          { file: "EnterprisePack.tsx", pattern: "staffInfo" },
        ],
      },
      "panier-services": {
        grep: [{ file: "EnterprisePack.tsx", pattern: "confirmHref" }],
      },
      dashboard: {
        grep: [
          { file: "../_salons-shared/lib/data.ts", pattern: "export const KPIS_C" },
          { file: "../_salons-shared/lib/data.ts", pattern: "export const CHART_C" },
          { file: "EnterprisePack.tsx", pattern: 'id="c-admin"' },
        ],
      },
      avis: {
        files: ["../_salons-shared/components/Reviews.tsx"],
        grep: [{ file: "../_salons-shared/lib/data.ts", pattern: "export const REVIEWS_C" }],
      },
      qr: { grep: [{ file: "../_salons-shared/components/QrSheet.tsx", pattern: "QRCode\\.toDataURL" }] },
      tracking: {
        grep: [
          { file: "../_salons-shared/components/Analytics.tsx", pattern: "NEXT_PUBLIC_GA_ID" },
          { file: "../_salons-shared/components/Analytics.tsx", pattern: "fbq" },
          { file: "page.tsx", pattern: "<Analytics />" },
        ],
      },
      seo: { grep: [{ file: "page.tsx", pattern: "export const metadata" }] },
      // Étape 18 (§2.4 du plan CMS). Premier schéma à locales réduites (["vi","fr"]) —
      // le pattern ne cible qu'un `locales: [`, pas son contenu exact, exprès.
      "admin-contenu": {
        files: ["lib/cms-schema.ts"],
        routes: ["quan-tri/noi-dung/page.tsx"],
        grep: [
          { file: "lib/cms-schema.ts", pattern: "locales:\\s*\\[" },
          { file: "layout.tsx", pattern: "getVisiblePatch" },
        ],
      },
    },
    knownGaps: [
      "langues : VI + FR seulement (écart E2)",
      "contact : les liens du pied de page mènent à /demo — aucun tel: ni itinéraire réel",
      "dashboard : l'aperçu du back-office est une maquette à données figées (KPIS_C, CHART_C). Acceptable au palier sur devis, où le back-office fait partie du cahier des charges — la fiche technique le dit maintenant explicitement.",
      "vat, roles, export, panier, paiement, livraison, suivi, fidelite, actus, lookbook : au périmètre du palier Doanh Nghiệp, PAS implémentés. SPECS.C les présente désormais comme « périmètre à chiffrer », plus comme des écrans livrés (écart E4). admin-contenu EST implémenté depuis l'étape 15 (espace de gestion inclus) — retiré de cette liste à l'étape 18.",
      "formation : engagement de service (formation d'équipe), rien à vérifier dans le code",
    ],
  },

  // ────────────────────────────── Boutiques ──────────────────────────────
  {
    id: "shop-khoi-dau",
    vertical: "shop",
    pack: "khoi-dau",
    businessName: "Maison Sarv",
    district: "Hàng Gai, Hoàn Kiếm",
    designNote: {
      vi: "Nền kem, chữ serif thanh, bố cục một trang duy nhất.",
      en: "Cream ground, fine serif, a single-page layout.",
      fr: "Fond crème, serif fin, mise en page sur une seule page.",
    },
    path: "/demo/shop-khoi-dau",
    url: null,
    status: "live",
    defaultLocale: "vi",
    evidence: {
      pages: { routes: ["page.tsx"] },
      langues: { grep: [{ file: "../_shop-shared/components/LanguageProvider.tsx", pattern: 'LOCALES: Locale\\[\\] = \\["vi", "en", "fr"\\]' }] },
      responsive: { grep: [{ file: "page.tsx", pattern: "md:grid-cols-" }] },
      contact: { grep: [{ file: "../_shop-shared/components/ContactBar.tsx", pattern: "mapsDirections" }] },
      gbp: {
        files: ["../_shop-shared/components/JsonLd.tsx"],
        grep: [
          { file: "../_shop-shared/components/JsonLd.tsx", pattern: "application/ld\\+json" },
          { file: "../_shop-shared/site.config.ts", pattern: "openingHoursSchema" },
          { file: "page.tsx", pattern: "<LocalBusinessJsonLd />" },
        ],
      },
      catalogue: { grep: [{ file: "../_shop-shared/lib/products.ts", pattern: "SHORT_LIST_IDS" }] },
      galerie: { grep: [{ file: "page.tsx", pattern: "GALLERY\\.map" }] },
      seo: { grep: [{ file: "layout.tsx", pattern: "export const metadata" }] },
    },
    knownGaps: [
      "formation : engagement de service (guide PDF), rien à vérifier dans le code",
    ],
  },
  {
    id: "shop-phat-trien",
    vertical: "shop",
    pack: "phat-trien",
    businessName: "Maison Sarv",
    district: "Hàng Gai, Hoàn Kiếm",
    designNote: {
      vi: "Nền giấy dó ấm, vân kẻ mảnh, nhiều trang và nhiều mục hơn.",
      en: "Warm paper ground, fine ruling, more pages and more sections.",
      fr: "Fond papier chaud, filets fins, plus de pages et de rubriques.",
    },
    path: "/demo/shop-phat-trien",
    url: null,
    status: "live",
    defaultLocale: "vi",
    evidence: {
      pages: {
        routes: [
          "page.tsx",
          "san-pham/page.tsx",
          "ve-chung-toi/page.tsx",
          "tin-tuc/page.tsx",
          "dat-lich/page.tsx",
          "qr/page.tsx",
        ],
      },
      langues: { grep: [{ file: "../_shop-shared/components/LanguageProvider.tsx", pattern: 'LOCALES: Locale\\[\\] = \\["vi", "en", "fr"\\]' }] },
      responsive: { grep: [{ file: "page.tsx", pattern: "lg:grid-cols-|md:grid-cols-" }] },
      contact: { grep: [{ file: "../_shop-shared/components/ContactBar.tsx", pattern: "mapsDirections" }] },
      gbp: {
        files: ["../_shop-shared/components/JsonLd.tsx"],
        grep: [
          { file: "../_shop-shared/components/JsonLd.tsx", pattern: "application/ld\\+json" },
          { file: "layout.tsx", pattern: "<LocalBusinessJsonLd />" },
        ],
      },
      catalogue: {
        routes: ["san-pham/page.tsx"],
        grep: [{ file: "../_shop-shared/lib/products.ts", pattern: "export const CATEGORIES" }],
      },
      galerie: { grep: [{ file: "ve-chung-toi/page.tsx", pattern: "VILLAGE_IMAGES" }] },
      actus: {
        routes: ["tin-tuc/page.tsx"],
        grep: [{ file: "lib/copy/phat-trien.ts", pattern: "export const NEWS" }],
      },
      avis: {
        grep: [
          { file: "lib/copy/phat-trien.ts", pattern: "export const REVIEWS" },
          { file: "page.tsx", pattern: "REVIEWS\\.map" },
        ],
      },
      reservation: {
        routes: ["dat-lich/page.tsx"],
        api: ["api/reservations/route.ts"],
      },
      qr: {
        routes: ["qr/page.tsx"],
        grep: [{ file: "qr/page.tsx", pattern: "QRCode\\.toDataURL" }],
      },
      tracking: {
        grep: [
          { file: "../_shop-shared/components/Analytics.tsx", pattern: "NEXT_PUBLIC_GA_ID" },
          { file: "../_shop-shared/components/Analytics.tsx", pattern: "fbq" },
          { file: "layout.tsx", pattern: "<Analytics />" },
        ],
      },
      seo: {
        grep: [
          { file: "layout.tsx", pattern: "export const metadata" },
          { file: "../_shop-shared/components/JsonLd.tsx", pattern: "application/ld\\+json" },
        ],
      },
    },
    knownGaps: [
      "tracking : GA4 et Pixel sont câblés mais dormants tant que NEXT_PUBLIC_GA_ID et NEXT_PUBLIC_FB_PIXEL_ID ne sont pas renseignés",
      "formation : engagement de service (1 h en ligne), rien à vérifier dans le code",
    ],
  },
  {
    id: "shop-cao-cap",
    vertical: "shop",
    pack: "cao-cap",
    businessName: "Maison Sarv",
    district: "Hàng Gai · Xuân Diệu · Kim Mã",
    designNote: {
      vi: "Nền chàm sẫm, hoa văn hình học, vòm cong và chỉ vàng.",
      en: "Deep indigo ground, geometric motifs, arches and gold rules.",
      fr: "Fond indigo profond, motifs géométriques, arches et filets d'or.",
    },
    path: "/demo/shop-cao-cap",
    url: null,
    status: "live",
    defaultLocale: "vi",
    evidence: {
      pages: {
        routes: [
          "page.tsx",
          "san-pham/page.tsx",
          "san-pham/[id]/page.tsx",
          "gio-hang/page.tsx",
          "don-hang/[code]/page.tsx",
          "quan-tri/page.tsx",
          "qr/page.tsx",
        ],
      },
      langues: { grep: [{ file: "../_shop-shared/components/LanguageProvider.tsx", pattern: 'LOCALES: Locale\\[\\] = \\["vi", "en", "fr"\\]' }] },
      responsive: { grep: [{ file: "page.tsx", pattern: "lg:grid-cols-|md:grid-cols-" }] },
      contact: { grep: [{ file: "../_shop-shared/components/ContactBar.tsx", pattern: "mapsDirections" }] },
      gbp: {
        files: ["../_shop-shared/components/JsonLd.tsx"],
        grep: [
          { file: "../_shop-shared/components/JsonLd.tsx", pattern: "department" },
          { file: "layout.tsx", pattern: "<LocalBusinessJsonLd branches />" },
        ],
      },
      catalogue: {
        routes: ["san-pham/[id]/page.tsx"],
        grep: [{ file: "../_shop-shared/lib/products.ts", pattern: "export const PRODUCTS" }],
      },
      galerie: { grep: [{ file: "page.tsx", pattern: "MOTIFS\\.map" }] },
      avis: {
        grep: [
          { file: "lib/copy/cao-cap.ts", pattern: "export const REVIEWS_CC" },
          { file: "page.tsx", pattern: "REVIEWS_CC\\.map" },
        ],
      },
      panier: {
        routes: ["gio-hang/page.tsx"],
        grep: [{ file: "../_shop-shared/components/CartProvider.tsx", pattern: "useCart" }],
      },
      paiement: {
        files: ["lib/vietqr.ts"],
        api: ["api/orders/route.ts", "api/webhooks/paiement/route.ts"],
        grep: [{ file: "lib/orders.ts", pattern: "cod|vietqr|momo" }],
      },
      livraison: { grep: [{ file: "../_shop-shared/site.config.ts", pattern: "ghtk" }] },
      suivi: {
        routes: ["don-hang/[code]/page.tsx"],
        api: ["api/orders/[code]/route.ts"],
      },
      dashboard: {
        routes: ["quan-tri/page.tsx"],
        grep: [{ file: "lib/order-store.ts", pattern: "export async function" }],
      },
      fidelite: { grep: [{ file: "lib/order-store.ts", pattern: "pointsForPhone" }] },
      succursales: {
        grep: [
          { file: "../_shop-shared/site.config.ts", pattern: "branches" },
          { file: "PremiumChrome.tsx", pattern: "setBranchId" },
        ],
      },
      qr: {
        routes: ["qr/page.tsx"],
        grep: [{ file: "qr/page.tsx", pattern: "QRCode\\.toDataURL" }],
      },
      tracking: {
        grep: [
          { file: "../_shop-shared/components/Analytics.tsx", pattern: "NEXT_PUBLIC_GA_ID" },
          { file: "../_shop-shared/components/Analytics.tsx", pattern: "fbq" },
          { file: "layout.tsx", pattern: "<Analytics />" },
        ],
      },
      seo: {
        grep: [
          { file: "layout.tsx", pattern: "export const metadata" },
          { file: "../_shop-shared/components/JsonLd.tsx", pattern: "application/ld\\+json" },
        ],
      },
      // Étape 18 (§2.4 du plan CMS). Première démo activée dans `CMS_REGISTRY`
      // (étape 11) ; `getVisiblePatch` vérifié dans `layout.tsx` avant d'écrire ce grep.
      "admin-contenu": {
        files: ["lib/cms-schema.ts"],
        routes: ["quan-tri/noi-dung/page.tsx"],
        grep: [
          { file: "lib/cms-schema.ts", pattern: "locales:\\s*\\[" },
          { file: "layout.tsx", pattern: "getVisiblePatch" },
        ],
      },
    },
    knownGaps: [
      "reservation : le palier Cao Cấp annonce la prise de rendez-vous ; elle existe au Phát Triển (/phat-trien/dat-lich) et disparaît ici. Régression à corriger.",
      "actus : pas de rubrique tin tức au Cao Cấp alors que le Phát Triển en a une — même régression",
      "galerie : la galerie tient dans la bande « hoa văn » et les fiches produit, il n'y a pas de section galerie dédiée comme au Khởi Đầu",
      "formation : engagement de service (2 h sur place), rien à vérifier dans le code",
    ],
  },
  // ────────────────────────────── Restaurants ──────────────────────────────
  // Reprises des maquettes du dossier Restaurants (marché français) et relocalisées
  // à Hanoi. Une démo ne passe en `live` qu'une fois entièrement vietnamisée :
  // une adresse parisienne dans une tournée à Hanoi coûte la vente.
  {
    id: "restaurant-khoi-dau",
    vertical: "restaurant",
    pack: "khoi-dau",
    businessName: "Xưởng Bếp",
    variant: "Atelier",
    district: "Hai Bà Trưng",
    designNote: {
      vi: "Bếp mở, chữ serif cổ điển, ảnh lớn.",
      en: "Open kitchen, classical serif, large photography.",
      fr: "Cuisine ouverte, serif classique, grande photographie.",
    },
    path: "/demo/restaurant-khoi-dau",
    url: null,
    status: "live",
    defaultLocale: "vi",
    evidence: {
      pages: { routes: ["page.tsx", "menu/page.tsx", "privatisation/page.tsx"] },
      catalogue: { grep: [{ file: "data.ts", pattern: "export const FULL_MENU" }] },
      contact: { grep: [{ file: "components/Contact.tsx", pattern: "tel:\\+84" }] },
      "trich-dan": { grep: [{ file: "data.ts", pattern: "export const TESTIMONIALS" }] },
      galerie: { grep: [{ file: "data.ts", pattern: "INSTAGRAM_PHOTOS" }] },
      responsive: { grep: [{ file: "demo.css", pattern: "@media" }] },
    },
    knownGaps: [
      "langues : vietnamien seulement — le palier annonce VI + EN",
      "reservation : le formulaire d'accueil n'envoie rien (conforme au palier Khởi Đầu)",
      "gbp, seo : pas de fiche Google Business ni de JSON-LD",
    ],
  },
  {
    id: "restaurant-phat-trien",
    vertical: "restaurant",
    pack: "phat-trien",
    businessName: "Quán Mai",
    variant: "Marguerite",
    district: "Đống Đa",
    designNote: {
      vi: "Nền giấy ấm, chữ grotesque, màu cà chua và nghệ.",
      en: "Warm paper ground, grotesque type, tomato and saffron.",
      fr: "Fond papier chaud, grotesque, tomate et safran.",
    },
    path: "/demo/restaurant-phat-trien",
    url: null,
    status: "live",
    defaultLocale: "vi",
    evidence: {
      pages: { routes: ["page.tsx", "carte/page.tsx", "reservation/page.tsx"] },
      catalogue: { grep: [{ file: "lib/menu-data.ts", pattern: "export const MENU" }] },
      reservation: { routes: ["reservation/page.tsx"] },
      contact: { grep: [{ file: "components/Nav.tsx", pattern: "zalo\\.me" }] },
      galerie: { grep: [{ file: "page.tsx", pattern: "const GALLERY" }] },
      responsive: { grep: [{ file: "layout.tsx", pattern: "device-width" }] },
      plateformes: { grep: [{ file: "page.tsx", pattern: "shopeefood" }] },
    },
    knownGaps: [
      "langues : vietnamien seulement — le palier annonce VI + EN + FR",
      "menu-qr-table : pas de mã QR par table",
      "actus, avis, tracking, qr, admin-contenu, seo : absents",
    ],
  },
  {
    id: "restaurant-phat-trien-jardin",
    vertical: "restaurant",
    pack: "phat-trien",
    businessName: "Vườn Vàng",
    variant: "Le Jardin d'Or",
    district: "Tây Hồ",
    designNote: {
      vi: "Nhà hàng sang, nền tối, chỉ vàng, hiệu ứng cuộn.",
      en: "Fine dining, dark ground, gold rules, scroll effects.",
      fr: "Gastronomique, fond sombre, filets d'or, effets au scroll.",
    },
    path: "/demo/restaurant-phat-trien-jardin",
    url: null,
    status: "live",
    defaultLocale: "vi",
    evidence: {
      pages: { routes: ["page.tsx", "menu/page.tsx", "reservation/page.tsx"] },
      catalogue: { grep: [{ file: "menu/page.tsx", pattern: "const menuData" }] },
      reservation: { routes: ["reservation/page.tsx"] },
      contact: { grep: [{ file: "components/WhatsAppButton.tsx", pattern: "zalo\\.me" }] },
      avis: { grep: [{ file: "page.tsx", pattern: "const avis" }] },
      galerie: { grep: [{ file: "page.tsx", pattern: "HISTOIRE_IMG|CTA_IMG" }] },
      responsive: { grep: [{ file: "layout.tsx", pattern: "device-width" }] },
    },
    knownGaps: [
      "langues : vietnamien seulement — le palier annonce VI + EN + FR",
      "menu-qr-table, plateformes, qr, actus, tracking, admin-contenu : absents",
    ],
  },
  {
    id: "restaurant-cao-cap",
    vertical: "restaurant",
    pack: "cao-cap",
    businessName: "Chợ Xanh",
    variant: "Séraphine",
    district: "Cầu Giấy",
    designNote: {
      vi: "Quán chợ, đặt trước và đến lấy, có màn hình cho bếp.",
      en: "Market bistro, order-ahead pickup, a screen for the kitchen.",
      fr: "Bistrot de marché, commande à emporter, un écran pour la cuisine.",
    },
    path: "/demo/restaurant-cao-cap",
    url: null,
    status: "live",
    defaultLocale: "vi",
    evidence: {
      // Étape 18 (§2.4 du plan CMS). Seule preuve déclarée pour cette démo à ce jour —
      // les autres fonctionnalités du palier restent `non-verifiable`, écart préexistant
      // non traité ici (hors périmètre de cette étape, qui ne touche que `admin-contenu`).
      // `locales: ["vi"]` ici (une seule langue, cf. `CMS_REGISTRY`) ; `getVisiblePatch`
      // vérifié dans `layout.tsx` avant d'écrire ce grep.
      "admin-contenu": {
        files: ["lib/cms-schema.ts"],
        routes: ["quan-tri/noi-dung/page.tsx"],
        grep: [
          { file: "lib/cms-schema.ts", pattern: "locales:\\s*\\[" },
          { file: "layout.tsx", pattern: "getVisiblePatch" },
        ],
      },
    },
    knownGaps: [
      "paiement : simulation de carte bancaire à l'écran /commande, pas de VietQR ni MoMo réels",
      "livraison : aucun choix de transporteur GHTK / GHN / Viettel Post — modèle sur place ou click & collect uniquement",
      "succursales : un seul établissement, pas de multi-succursales",
      "plateformes : aucun lien GrabFood / ShopeeFood / Be",
      "avis, tracking, qr, menu-qr-table : absents",
      "formation : engagement de service (2 h sur place), rien à vérifier dans le code",
    ],
  },
  {
    id: "restaurant-cao-cap-voltaire",
    vertical: "restaurant",
    pack: "cao-cap",
    businessName: "Phố Cổ",
    variant: "Voltaire",
    district: "Hoàn Kiếm",
    designNote: {
      vi: "Quán quen: có tài khoản khách, tích điểm, hai ngôn ngữ.",
      en: "A regulars' place: customer accounts, points, two languages.",
      fr: "La table des habitués : comptes clients, points, deux langues.",
    },
    path: "/demo/restaurant-cao-cap-voltaire",
    url: null,
    status: "live",
    defaultLocale: "vi",
    evidence: {
      // Étape 18 (§2.4 du plan CMS). Seule preuve déclarée pour cette démo à ce jour —
      // même écart préexistant que `restaurant-cao-cap`, non traité ici. `locales:
      // ["vi","en"]` (cf. `CMS_REGISTRY`) ; `getVisiblePatch` vérifié dans `layout.tsx`
      // avant d'écrire ce grep.
      "admin-contenu": {
        files: ["lib/cms-schema.ts"],
        routes: ["quan-tri/noi-dung/page.tsx"],
        grep: [
          { file: "lib/cms-schema.ts", pattern: "locales:\\s*\\[" },
          { file: "layout.tsx", pattern: "getVisiblePatch" },
        ],
      },
    },
    knownGaps: [
      "fidelite : le solde de points et l'historique du compte client sont des données figées (mockup), pas calculées depuis de vraies commandes — même caveat que le dashboard de salon-doanh-nghiep",
      "paiement : aucune réservation ne déclenche de paiement réel, VietQR/MoMo absents",
      "livraison, succursales, plateformes : absents (établissement unique, sur place uniquement)",
      "avis, tracking, qr, menu-qr-table : absents",
      "formation : engagement de service (2 h sur place), rien à vérifier dans le code",
    ],
  },
  // ────────────────────────────── Homestays ──────────────────────────────
  // Reprises des maquettes du dossier hotels (Riviera française, Panama, Galápagos)
  // et relocalisées à Hanoi. Comme pour les restaurants : `live` seulement une fois
  // entièrement vietnamisées.
  // Paliers réordonnés (§ revue commerciale post-livraison) : le style de
  // « Nhà Bên Hồ » est le plus abouti et passe au palier le plus cher, "Sen
  // Villa" descend au palier intermédiaire, "Ngõ Nhỏ Homestay" au palier
  // d'entrée — chaque `businessName`/`designNote`/`evidence` reste attaché à
  // SON contenu, seuls `id`/`pack`/`path` tournent avec le contenu déplacé.
  // Le CMS (§2.1), lui, reste rattaché au CHEMIN `/demo/homestay-cao-cap`
  // (donc à Nhà Bên Hồ désormais), pas au contenu Sen Villa qui l'avait
  // avant la rotation — voir `homestay-cao-cap/lib/cms-schema.ts`.
  {
    id: "homestay-cao-cap",
    vertical: "homestay",
    pack: "cao-cap",
    businessName: "Nhà Bên Hồ",
    variant: "Maison Éclat",
    district: "Tây Hồ",
    designNote: {
      vi: "Sáu trang tĩnh, ảnh lớn, chữ serif — nhẹ và nhanh trên 4G.",
      en: "Six static pages, large photography, serif type — light and fast on 4G.",
      fr: "Six pages statiques, grande photographie, serif — léger et rapide en 4G.",
    },
    path: "/demo/homestay-cao-cap",
    url: null,
    status: "live",
    defaultLocale: "vi",
    evidence: {
      pages: {
        routes: [
          "page.tsx",
          "chambres/page.tsx",
          "experiences/page.tsx",
          "restaurant/page.tsx",
          "spa/page.tsx",
          "contact/page.tsx",
        ],
      },
      chambres: { grep: [{ file: "lib/data.ts", pattern: "bedType" }] },
      catalogue: { grep: [{ file: "lib/data.ts", pattern: "pricePerNight" }] },
      contact: { grep: [{ file: "contact/page.tsx", pattern: "tel:\\+33" }] },
      seo: { grep: [{ file: "page.tsx", pattern: "application/ld\\+json" }] },
      gbp: { grep: [{ file: "page.tsx", pattern: "LodgingBusiness" }] },
      galerie: { grep: [{ file: "lib/data.ts", pattern: "images" }] },
      responsive: { grep: [{ file: "demo.css", pattern: "@media" }] },
      "trich-dan": { grep: [{ file: "lib/data.ts", pattern: "TESTIMONIALS" }] },
      acces: { grep: [{ file: "contact/page.tsx", pattern: "Nội Bài" }] },
      // Ajouté avec la rotation des paliers : le CMS suit ce chemin, pas ce
      // contenu — un nouveau schéma (`rooms`, pas `villas`) a été écrit pour
      // décrire les données réelles de `lib/data.ts`.
      "admin-contenu": {
        files: ["lib/cms-schema.ts"],
        routes: ["quan-tri/noi-dung/page.tsx"],
        grep: [
          { file: "lib/cms-schema.ts", pattern: "locales:\\s*\\[" },
          { file: "layout.tsx", pattern: "getVisiblePatch" },
        ],
      },
    },
    knownGaps: [
      "langues : vietnamien seulement — le palier annonce VI + EN, et un homestay vit de la clientèle étrangère : c'est LA priorité de cette verticale",
      "reservation : formulaire de contact, pas de demande de chambre datée",
      "acces : pas encore de page « đường từ Nội Bài » avec les tarifs Grab et taxi",
    ],
  },
  {
    id: "homestay-phat-trien",
    vertical: "homestay",
    pack: "phat-trien",
    businessName: "Sen Villa",
    variant: "Galápagos",
    district: "Sóc Sơn",
    designNote: {
      vi: "Ba biệt thự riêng, cuộn mượt, ảnh toàn màn hình, đặt phòng trong trang.",
      en: "Three private villas, smooth scrolling, full-bleed photography, in-page booking.",
      fr: "Trois villas privées, défilement fluide, photographie pleine page, réservation dans la page.",
    },
    path: "/demo/homestay-phat-trien",
    url: null,
    status: "live",
    defaultLocale: "vi",
    evidence: {
      pages: {
        routes: [
          "page.tsx",
          "villas/yellow-heron-house/page.tsx",
          "villas/sandy-feet-house/page.tsx",
          "villas/flip-flop-house/page.tsx",
        ],
      },
      // La seule démo du portfolio avec une vraie bascule de langue.
      langues: { grep: [{ file: "lib/LanguageContext.tsx", pattern: "vi. \\| .en" }] },
      chambres: { files: ["components/VillaPageLayout.tsx", "components/VillasSlider.tsx"] },
      catalogue: { grep: [{ file: "components/VillasSlider.tsx", pattern: "priceFrom" }] },
      reservation: { files: ["components/ReservationModal.tsx"] },
      contact: { grep: [{ file: "components/ZaloTab.tsx", pattern: "33749775654" }] },
      "trich-dan": { grep: [{ file: "components/Testimonials.tsx", pattern: "TESTIMONIALS" }] },
      galerie: { grep: [{ file: "components/VillaPageLayout.tsx", pattern: "gallery" }] },
      "plusieurs-maisons": { grep: [{ file: "components/VillasSlider.tsx", pattern: "const VILLAS" }] },
      acces: { grep: [{ file: "lib/translations.ts", pattern: "Nội Bài" }] },
      seo: { grep: [{ file: "layout.tsx", pattern: "description" }] },
      responsive: { grep: [{ file: "layout.tsx", pattern: "viewport|device-width" }] },
    },
    knownGaps: [
      "acompte : le bouton de réservation ouvre Zalo, il n'encaisse rien — VietQR à brancher pour un vrai encaissement en ligne",
      "langues : l'interface bascule VI ↔ EN, mais le contenu des pages villa reste en vietnamien seul",
      "calendrier : pas de disponibilité par nuit",
      "suivi, dashboard, fidelite, admin-contenu : absents — le CMS est resté au palier Cao Cấp (`homestay-cao-cap`) lors de la rotation des paliers, pas du contenu",
    ],
  },
  {
    id: "homestay-khoi-dau",
    vertical: "homestay",
    pack: "khoi-dau",
    businessName: "Ngõ Nhỏ Homestay",
    variant: "Casa Sucre",
    district: "Hoàn Kiếm",
    designNote: {
      vi: "Nhà cổ phố cũ: nhiều căn, hướng dẫn quanh nhà, hỏi phòng qua Zalo.",
      en: "An old-quarter house: several rooms, a neighbourhood guide, Zalo enquiry.",
      fr: "Une maison du vieux quartier : plusieurs chambres, guide du quartier, demande par Zalo.",
    },
    path: "/demo/homestay-khoi-dau",
    url: null,
    status: "live",
    defaultLocale: "vi",
    evidence: {
      pages: { routes: ["page.tsx", "property/[propertyId]/page.tsx", "room/[roomId]/page.tsx"] },
      chambres: { routes: ["room/[roomId]/page.tsx"], files: ["components/RoomCard.tsx"] },
      catalogue: { grep: [{ file: "lib/hotel-data.ts", pattern: "pricePerNight|price:" }] },
      reservation: { files: ["components/BookingWidget.tsx"] },
      contact: { grep: [{ file: "lib/hotel-data.ts", pattern: "zaloNumber" }] },
      "trich-dan": { grep: [{ file: "components/Testimonials.tsx", pattern: "testimonials" }] },
      galerie: { grep: [{ file: "lib/hotel-data.ts", pattern: "images" }] },
      "plusieurs-maisons": { grep: [{ file: "components/PropertySelector.tsx", pattern: "properties" }] },
      seo: { grep: [{ file: "layout.tsx", pattern: "export const metadata" }] },
      acces: { grep: [{ file: "components/LocalGuide.tsx", pattern: "localGuide" }] },
      responsive: { grep: [{ file: "layout.tsx", pattern: "device-width" }] },
    },
    knownGaps: [
      "langues : vietnamien seulement — un homestay vit de la clientèle étrangère, l'anglais est la priorité de cette verticale",
      "calendrier : pas de disponibilité par nuit, la demande part en message",
      "qr, actus, tracking, admin-contenu : absents",
    ],
  },
];

export function getDemo(id: string): Demo | undefined {
  return DEMOS.find((d) => d.id === id);
}
