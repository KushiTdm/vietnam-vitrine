// Coquille racine, volontairement vide de CSS et de police — c'est
// `(vitrine)/layout.tsx` qui porte son propre CSS et ses propres polices,
// sur un <div> wrapper. Voir ce fichier pour le pourquoi.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
