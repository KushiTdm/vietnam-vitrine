import type { Metadata } from "next";

/**
 * `page.tsx` est un composant client (il lit la langue choisie via l'URL) et ne peut
 * donc pas exporter `metadata` — même contrainte que `metiers/[vertical]/layout.tsx`.
 * Pas de segment dynamique propre à cette page, donc un objet statique suffit pour le
 * texte — seul `alternates.languages` a besoin des trois chemins.
 *
 * Carte de partage dédiée : c'est le lien collé chaque dimanche soir sur Facebook,
 * elle ne doit plus hériter de `/vitrine/og-accueil.webp`. Texte encore vietnamien
 * uniquement (TODO EN/FR) : l'opération cible d'abord les commerçants de quartier.
 */
export const metadata: Metadata = {
  title: "Tặng một trang web, mỗi tuần",
  description:
    "8 tuần, mỗi tuần một cơ sở kinh doanh ở Hà Nội được tặng một trang web — xét chọn theo tiêu chí, không bốc thăm may rủi.",
  alternates: {
    languages: { vi: "/qua-tang", en: "/en/qua-tang", fr: "/fr/qua-tang", "x-default": "/qua-tang" },
  },
  openGraph: {
    title: "Tặng một trang web, mỗi tuần",
    description:
      "8 tuần, mỗi tuần một cơ sở kinh doanh ở Hà Nội được tặng một trang web — xét chọn theo tiêu chí, không bốc thăm may rủi.",
    images: [{ url: "/vitrine/og-qua-tang.webp", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image", images: ["/vitrine/og-qua-tang.webp"] },
};

export default function GiftLayout({ children }: { children: React.ReactNode }) {
  return children;
}
