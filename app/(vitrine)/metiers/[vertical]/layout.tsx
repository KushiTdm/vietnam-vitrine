import type { Metadata } from "next";
import { getVertical } from "@hanoi/registry";

/**
 * Ce layout n'existe que pour porter les métadonnées de la page métier :
 * `page.tsx` est un composant client (il lit la langue choisie côté
 * navigateur) et ne peut donc pas exporter `metadata`. Un layout serveur
 * qui l'enveloppe le peut.
 *
 * Chaque métier a sa propre carte de partage — c'est le lien qu'on colle
 * dans un groupe Facebook de commerçants d'un quartier, pas l'accueil.
 * Le vietnamien fait foi : le choix de langue est côté client, invisible
 * du serveur au moment où la carte est générée.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ vertical: string }>;
}): Promise<Metadata> {
  const { vertical: slug } = await params;
  const vertical = getVertical(slug);
  if (!vertical) return {};

  // Les fichiers sont nommés d'après le slug du registre : og-quan-ca-phe.webp,
  // og-salon-spa.webp, og-cua-hang.webp, og-nha-hang.webp, og-homestay.webp.
  const image = `/vitrine/og-${vertical.slug}.webp`;

  return {
    title: vertical.name.vi,
    description: vertical.tagline.vi,
    openGraph: {
      title: vertical.name.vi,
      description: vertical.tagline.vi,
      images: [{ url: image, width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image", images: [image] },
  };
}

export default function VerticalLayout({ children }: { children: React.ReactNode }) {
  return children;
}
