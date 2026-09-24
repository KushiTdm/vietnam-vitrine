import type { Metadata } from "next";
import { Be_Vietnam_Pro, Lora } from "next/font/google";
import type { Locale } from "@/lib/registry";
import LanguageProvider from "./components/LanguageProvider";
import ScrollFx from "./components/ScrollFx";
import SiteHeader from "./components/SiteHeader";
import SiteFooter from "./components/SiteFooter";
import Chatbot from "./components/Chatbot";
import { agency } from "./showcase.config";
import "./vitrine.css";

// Le sous-ensemble « vietnamese » n'est pas optionnel : sans lui, đ ơ ư ệ ầ retombent
// sur une police système et la démo paraît cassée à la première ligne de titre.
const body = Be_Vietnam_Pro({
  variable: "--font-body",
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

const display = Lora({
  variable: "--font-display",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const OG_LOCALE: Record<Locale, string> = { vi: "vi_VN", en: "en_US", fr: "fr_FR" };

// VI n'a pas de préfixe d'URL (langue par défaut, voir proxy.ts) — les deux autres si.
function homePath(locale: Locale): string {
  return locale === "vi" ? "/" : `/${locale}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = (await params) as { locale: Locale };

  return {
    metadataBase: new URL(agency.url),
    title: {
      default: `${agency.name} — Website cho quán, salon và cửa hàng ở Hà Nội`,
      template: `%s · ${agency.name}`,
    },
    description:
      "Ba gói website cho cửa hàng nhỏ ở Hà Nội: Khởi Đầu, Phát Triển, Cao Cấp. Xem bản demo hoạt động thật trên điện thoại của bạn.",
    // hreflang : chaque langue pointe vers son URL propre, "x-default" vers VI (la
    // langue par défaut, servie sans préfixe — voir proxy.ts).
    alternates: {
      canonical: homePath(locale),
      languages: {
        vi: homePath("vi"),
        en: homePath("en"),
        fr: homePath("fr"),
        "x-default": homePath("vi"),
      },
    },
    // Sans `images`, tout lien de la vitrine collé sur Zalo, Messenger ou
    // Facebook s'affiche en rectangle gris — c'est le canal de vente réel,
    // pas un détail de référencement. Les pages métier surchargent cette
    // carte par la leur (`metiers/[vertical]/layout.tsx`). Le texte de la
    // carte reste en vietnamien quelle que soit la langue tant qu'il n'est
    // pas traduit (TODO EN/FR) — seul `locale` (og:locale) suit l'URL.
    openGraph: {
      type: "website",
      locale: OG_LOCALE[locale],
      siteName: agency.name,
      images: [{ url: "/vitrine/og-accueil.webp", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      images: ["/vitrine/og-accueil.webp"],
    },
  };
}

// Pas de <html>/<body> ici : ils appartiennent au layout racine
// (app/[locale]/layout.tsx, volontairement vide de CSS). C'est ce layout de
// la vitrine qui porte son propre CSS et ses propres polices, sur ce <div>
// — jamais plus haut.
export default async function VitrineLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = (await params) as { locale: Locale };

  return (
    <div className={`flex min-h-dvh flex-col ${body.variable} ${display.variable}`}>
      {/* Premier enfant : son script d'amorce doit s'exécuter avant la peinture. */}
      <ScrollFx />
      <LanguageProvider locale={locale}>
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
        {/* Sous le footer dans l'arbre, flottant à l'écran : il doit rester
            à l'intérieur de LanguageProvider, sa langue vient de l'URL. */}
        <Chatbot />
      </LanguageProvider>
    </div>
  );
}
