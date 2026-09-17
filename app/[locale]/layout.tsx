import { notFound } from "next/navigation";
import type { Locale } from "@/lib/registry";

export const LOCALES: Locale[] = ["vi", "en", "fr"];

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

// Coquille racine, volontairement vide de CSS et de police — c'est
// `(vitrine)/layout.tsx` qui porte son propre CSS et ses propres polices,
// sur un <div> wrapper. `[locale]` est le premier segment de l'arbre (pas de
// app/layout.tsx au-dessus) : ce layout EST le layout racine, donc le seul
// endroit qui reçoit `params.locale` en étant encore autorisé à poser
// <html>/<body>.
export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!LOCALES.includes(locale as Locale)) notFound();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
