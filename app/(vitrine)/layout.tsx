import type { Metadata } from "next";
import { Be_Vietnam_Pro, Lora } from "next/font/google";
import LanguageProvider from "./components/LanguageProvider";
import ScrollFx from "./components/ScrollFx";
import SiteHeader from "./components/SiteHeader";
import SiteFooter from "./components/SiteFooter";
import ContactBar from "./components/ContactBar";
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

export const metadata: Metadata = {
  metadataBase: new URL(agency.url),
  title: {
    default: `${agency.name} — Website cho quán, salon và cửa hàng ở Hà Nội`,
    template: `%s · ${agency.name}`,
  },
  description:
    "Ba gói website cho cửa hàng nhỏ ở Hà Nội: Khởi Đầu, Phát Triển, Cao Cấp. Xem bản demo hoạt động thật trên điện thoại của bạn.",
  // Sans `images`, tout lien de la vitrine collé sur Zalo, Messenger ou
  // Facebook s'affiche en rectangle gris — c'est le canal de vente réel,
  // pas un détail de référencement. Les pages métier surchargent cette
  // carte par la leur (`metiers/[vertical]/layout.tsx`).
  openGraph: {
    type: "website",
    locale: "vi_VN",
    siteName: agency.name,
    images: [{ url: "/vitrine/og-accueil.webp", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/vitrine/og-accueil.webp"],
  },
};

// Pas de <html>/<body> ici : ils appartiennent au layout racine d'apps/site
// (volontairement vide de CSS). C'est ce layout de la vitrine qui porte son
// propre CSS et ses propres polices, sur ce <div> — jamais plus haut.
export default function VitrineLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`flex min-h-dvh flex-col ${body.variable} ${display.variable}`}>
      {/* Premier enfant : son script d'amorce doit s'exécuter avant la peinture. */}
      <ScrollFx />
      <LanguageProvider>
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
        <ContactBar />
      </LanguageProvider>
    </div>
  );
}
