import type { MetadataRoute } from "next";
import { SERVICES } from "@/lib/registry";
import { agency } from "./[locale]/(vitrine)/showcase.config";

// Les pages de prestations sont dérivées du registre : en ajouter une la fait
// entrer dans le sitemap sans y penser.
const ROUTES = [
  "/",
  "/packs",
  "/qua-tang",
  ...SERVICES.map((s) => `/services/${s.slug}`),
];

// VI n'a pas de préfixe d'URL (langue par défaut, voir proxy.ts) — les
// deux autres si. `alternates.languages` déclare les trois versions de
// chaque page pour que les moteurs de recherche ne les traitent pas comme
// du contenu dupliqué.
function withLocale(path: string, locale: "vi" | "en" | "fr"): string {
  if (locale === "vi") return path;
  return path === "/" ? `/${locale}` : `/${locale}${path}`;
}

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map((path) => ({
    url: `${agency.url}${withLocale(path, "vi")}`,
    lastModified: new Date(),
    alternates: {
      languages: {
        vi: `${agency.url}${withLocale(path, "vi")}`,
        en: `${agency.url}${withLocale(path, "en")}`,
        fr: `${agency.url}${withLocale(path, "fr")}`,
      },
    },
  }));
}
