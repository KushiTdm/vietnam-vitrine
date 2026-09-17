"use client";

import Link from "next/link";
import { agency } from "../showcase.config";
import LangSwitcher from "./LangSwitcher";
import { useLanguage } from "./LanguageProvider";

export default function SiteHeader() {
  const { t } = useLanguage();

  const links = [
    { href: "/#metiers", label: t("navMetiers") },
    { href: "/packs", label: t("navPacks") },
    { href: "/#quy-trinh", label: t("navProcess") },
  ];

  // Séparé de `links` : offre à durée limitée (8 semaines, cf. `apps/site/app/(vitrine)/qua-tang/`),
  // donc en couleur pour rester visible sans devenir une entrée de nav permanente qu'il
  // faudrait penser à retirer à la fin de l'opération.
  const giftHref = "/qua-tang";

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-ground/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-5 gap-y-2 px-4 py-2 sm:px-6">
        <Link href="/" className="tap font-display text-lg tracking-tight">
          {agency.name}
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <Link
            href={giftHref}
            className="tap rounded-full px-3 text-[14px] font-medium text-gold transition-opacity hover:opacity-80"
          >
            {t("navGift")}
          </Link>
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="tap rounded-full px-3 text-[14px] text-muted transition-colors hover:text-ink"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <LangSwitcher />
          <a
            href={`https://zalo.me/${agency.zalo}`}
            target="_blank"
            rel="noreferrer"
            className="hidden min-h-11 items-center rounded-full bg-ink px-4 text-[14px] font-medium text-ground transition-opacity hover:opacity-90 sm:inline-flex"
          >
            {t("quote")}
          </a>
        </div>
      </div>
    </header>
  );
}
