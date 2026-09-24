import { NextResponse, type NextRequest } from "next/server";

const LOCALES = ["vi", "en", "fr"] as const;
const DEFAULT_LOCALE = "vi";

/**
 * VI est la langue par défaut de la vitrine, sans préfixe d'URL (voir
 * LanguageProvider : « le vietnamien fait foi »). EN et FR sont préfixés.
 * Toute la vitrine vit physiquement sous app/[locale]/(vitrine)/ ; ce
 * proxy (ex-"middleware", renommé en Next 16) fait le pont entre ça et des
 * URLs publiques "as-needed" :
 *
 *  - /, /packs, /metiers/...   → réécrits en interne vers /vi/... (le
 *    visiteur ne voit jamais le préfixe, VI reste la langue par défaut).
 *  - /en/..., /fr/...          → laissés tels quels, ils correspondent déjà
 *    au segment [locale].
 *  - /vi, /vi/...              → redirigés (308) vers l'équivalent sans
 *    préfixe, pour ne jamais avoir deux URLs indexables pour le même
 *    contenu.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const [, first, ...rest] = pathname.split("/");

  if (first === DEFAULT_LOCALE) {
    const url = request.nextUrl.clone();
    url.pathname = rest.length ? `/${rest.join("/")}` : "/";
    return NextResponse.redirect(url, 308);
  }

  if ((LOCALES as readonly string[]).includes(first)) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = `/${DEFAULT_LOCALE}${pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  // Exclut `/api` (les route handlers ne vivent pas sous [locale] : les
  // réécrire donnerait /vi/api/... qui n'existe pas), les internes Next, et
  // tout chemin avec une extension (icon.svg, robots.txt, sitemap.xml, assets
  // sous public/) — rien de tout cela n'a de variante par langue.
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
