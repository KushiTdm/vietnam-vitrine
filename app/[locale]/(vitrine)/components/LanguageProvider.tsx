"use client";

import { createContext, useContext, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import NextLink, { type LinkProps } from "next/link";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import type { L10n, Locale } from "@/lib/registry";
import { UI } from "../lib/ui";

export const LOCALES: Locale[] = ["vi", "en", "fr"];
const DEFAULT_LOCALE: Locale = "vi";

type Ctx = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  /** Traduit un champ localisé du registre. */
  tr: (value: L10n) => string;
  /** Texte d'interface de la vitrine. */
  t: (key: string) => string;
};

const LanguageContext = createContext<Ctx | null>(null);

/** Retire un préfixe /en ou /fr en tête de chemin. /vi n'apparaît jamais ici : VI n'a pas
 * de préfixe (voir proxy.ts), donc un pathname côté client ne le porte jamais. */
function stripLocalePrefix(pathname: string): string {
  const match = pathname.match(/^\/(en|fr)(\/.*)?$/);
  return match ? (match[2] ?? "/") : pathname;
}

/** Préfixe un href interne (commençant par /) selon la langue cible ; laisse
 * les liens externes, ancres pures et protocole-relatifs tels quels. */
export function localizeHref(href: string, locale: Locale): string {
  if (!href.startsWith("/") || href.startsWith("//")) return href;
  if (locale === DEFAULT_LOCALE) return href;
  const [path, ...rest] = href.split(/(?=[?#])/);
  const prefixed = path === "/" ? `/${locale}` : `/${locale}${path}`;
  return prefixed + rest.join("");
}

/**
 * `params.locale` vient du segment de route `app/[locale]/`, lu une seule fois ici et
 * distribué par contexte — pas de retour au localStorage : l'URL est désormais la seule
 * source de vérité pour la langue (voir proxy.ts pour le VI par défaut sans préfixe).
 */
export default function LanguageProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const value = useMemo<Ctx>(
    () => ({
      locale,
      setLocale: (l: Locale) => router.push(localizeHref(stripLocalePrefix(pathname), l)),
      tr: (v: L10n) => v[locale] ?? v.vi,
      t: (k: string) => UI[locale][k] ?? UI.vi[k] ?? k,
    }),
    [locale, pathname, router],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): Ctx {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage doit être utilisé dans LanguageProvider");
  return ctx;
}

/**
 * `next/link` localisé : mêmes props, mais `href` (une chaîne interne, jamais un objet
 * `UrlObject` ici) est préfixé selon la langue courante. Substitut direct de `Link` — importé
 * partout dans la vitrine sous cet alias pour ne jamais coller un lien qui ramène VI en FR/EN.
 */
export function LocalizedLink({
  href,
  ...props
}: LinkProps & AnchorHTMLAttributes<HTMLAnchorElement> & { children?: ReactNode }) {
  const { locale } = useLanguage();
  const localized = typeof href === "string" ? localizeHref(href, locale) : href;
  return <NextLink href={localized} {...props} />;
}
