import type { L10n } from "@/lib/registry";

/**
 * Ce avec quoi les sites sont réellement construits.
 *
 * Pourquoi ce fichier existe : interrogé sur le langage utilisé, l'assistant
 * citait des technologies fausses. Ce n'était pas une hallucination gratuite —
 * le prompt ne disait rien du sujet, et les seules mentions techniques
 * alentour parlaient d'applications mobiles et de migrations WordPress. Le
 * modèle prenait ce qui traînait. Un fait absent se remplace toujours par un
 * fait voisin.
 *
 * La frontière, elle, ne bouge pas : on nomme les outils de DÉVELOPPEMENT,
 * jamais l'hébergeur, les serveurs, ni la façon dont l'infrastructure est
 * payée (règle d'offre du 24 sept. 2026, voir `packs.ts`).
 */
export type TechFact = { id: string; label: L10n; body: L10n; keywords?: string[] };

export const TECH: TechFact[] = [
  {
    id: "socle",
    label: {
      vi: "Website được làm bằng gì",
      en: "What the sites are built with",
      fr: "Avec quoi les sites sont faits",
    },
    body: {
      vi: "Next.js và React, viết bằng TypeScript, giao diện dựng bằng Tailwind CSS. Đây là bộ công cụ mà các trang lớn dùng, không phải mẫu dựng sẵn. Mọi dòng code đều do Neuraweb viết riêng cho cơ sở của anh/chị.",
      en: "Next.js and React, written in TypeScript, with Tailwind CSS for the interface. The same toolset large sites run on — not a drag-and-drop template. Every line is written for your business.",
      fr: "Next.js et React, en TypeScript, avec Tailwind CSS pour l'interface. La boîte à outils des grands sites, pas un gabarit à glisser-déposer. Chaque ligne est écrite pour votre établissement.",
    },
    // « technology » manquait : le mot anglais le plus évident pour poser la
    // question, et la désuffixation ne le rapproche pas de « techno ».
    keywords: [
      "cong nghe", "ngon ngu lap trinh", "lam bang gi", "dung gi", "viet bang gi", "code",
      "technologie", "technology", "technologies", "techno", "tech", "tech stack",
      "langage", "quel langage", "language", "programming", "programmation",
      "developpe avec", "developed with", "built with", "coded",
      "stack", "framework", "next js", "nextjs", "react", "typescript", "tailwind",
    ],
  },
  {
    id: "pas-wordpress",
    label: {
      vi: "Không dùng WordPress, không dùng trình kéo-thả",
      en: "No WordPress, no page builder",
      fr: "Ni WordPress, ni constructeur de pages",
    },
    body: {
      vi: "Không WordPress, không Wix, không plugin phải cập nhật mỗi tháng. Trang được xuất ra dạng tĩnh: mở gần như tức thì trên điện thoại Android phổ thông với mạng 4G — đúng cái điện thoại khách của anh/chị đang cầm — và không có chỗ cho plugin bị hack.",
      en: "No WordPress, no Wix, no plugins to patch every month. The pages are served as static files: they open almost instantly on an ordinary Android phone over 4G — the phone your customers actually hold — and there is no plugin left to be hacked.",
      fr: "Ni WordPress, ni Wix, ni extensions à corriger tous les mois. Les pages sont servies en statique : elles s'ouvrent presque instantanément sur un téléphone Android ordinaire en 4G — celui que tiennent vos clients — et il ne reste aucune extension à pirater.",
    },
    keywords: ["wordpress", "wix", "plugin", "kéo tha", "keo tha", "page builder", "elementor", "template", "mau dung san"],
  },
  {
    id: "donnees",
    label: {
      vi: "Nơi lưu dữ liệu",
      en: "Where the data lives",
      fr: "Où vivent les données",
    },
    body: {
      vi: "Gói Khởi Đầu và Phát Triển là trang tĩnh, không có cơ sở dữ liệu nào cả. Từ Cao Cấp trở lên (và với tùy chọn Tự sửa nội dung), đơn hàng, lịch hẹn và nội dung được lưu trong một cơ sở dữ liệu và một kho tệp riêng của anh/chị — phần hạ tầng này do anh/chị chi trả, từ khoảng 5 USD/tháng.",
      en: "Khởi Đầu and Phát Triển are static sites with no database at all. From Cao Cấp up (and with the self-service editing option), orders, bookings and content live in a database and a file store that are yours — that infrastructure is on you, from about $5/month.",
      fr: "Khởi Đầu et Phát Triển sont des sites statiques, sans aucune base de données. À partir de Cao Cấp (et avec l'option espace de gestion), commandes, réservations et contenus vivent dans une base de données et un stockage de fichiers qui sont les vôtres — cette infrastructure est à votre charge, à partir d'environ 5 USD/mois.",
    },
    keywords: ["co so du lieu", "database", "base de donnees", "luu tru", "storage", "donnees", "du lieu", "serveur", "server"],
  },
  {
    id: "code-a-vous",
    label: {
      vi: "Mã nguồn thuộc về anh/chị",
      en: "The code is yours",
      fr: "Le code vous appartient",
    },
    body: {
      vi: "Trang web, nội dung và mã nguồn là của anh/chị. Nếu anh/chị yêu cầu, Neuraweb bàn giao toàn bộ mã nguồn — không khóa, không ràng buộc. Tên miền cũng đứng tên anh/chị. Anh/chị không bị phụ thuộc vào ai.",
      en: "The site, its content and its source code are yours. On request, Neuraweb hands over the whole codebase — no lock-in, no strings. The domain is in your name too. You depend on nobody.",
      fr: "Le site, son contenu et son code source sont à vous. Sur demande, Neuraweb remet l'intégralité du code — sans verrou, sans contrepartie. Le domaine est également à votre nom. Vous ne dépendez de personne.",
    },
    keywords: ["ma nguon", "source code", "code source", "github", "ban giao", "handover", "lock in", "phu thuoc"],
  },
];
