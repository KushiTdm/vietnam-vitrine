import type { Metadata } from "next";
import { getVertical, tr, type Locale } from "@/lib/registry";

/**
 * Ce layout n'existe que pour porter les métadonnées de la page métier :
 * `page.tsx` est un composant client (il lit la langue choisie via l'URL) et
 * ne peut donc pas exporter `metadata`. Un layout serveur qui l'enveloppe le
 * peut — et reçoit `params.locale` au même titre que `params.vertical`
 * (même segment `[locale]`), donc la carte de partage suit désormais la
 * langue de l'URL au lieu d'être figée en vietnamien.
 *
 * Chaque métier a sa propre carte de partage — c'est le lien qu'on colle
 * dans un groupe Facebook de commerçants d'un quartier, pas l'accueil.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; vertical: string }>;
}): Promise<Metadata> {
  const { locale, vertical: slug } = (await params) as { locale: Locale; vertical: string };
  const vertical = getVertical(slug);
  if (!vertical) return {};

  // Les fichiers sont nommés d'après le slug du registre : og-quan-ca-phe.webp,
  // og-salon-spa.webp, og-cua-hang.webp, og-nha-hang.webp, og-homestay.webp.
  const image = `/vitrine/og-${vertical.slug}.webp`;
  const title = tr(vertical.name, locale);
  const description = tr(vertical.tagline, locale);
  const path = `/metiers/${vertical.slug}`;

  return {
    title,
    description,
    alternates: {
      languages: {
        vi: path,
        en: `/en${path}`,
        fr: `/fr${path}`,
        "x-default": path,
      },
    },
    openGraph: {
      title,
      description,
      images: [{ url: image, width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image", images: [image] },
  };
}

export default function VerticalLayout({ children }: { children: React.ReactNode }) {
  return children;
}
