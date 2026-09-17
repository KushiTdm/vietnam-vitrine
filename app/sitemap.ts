import type { MetadataRoute } from "next";
import { agency } from "./(vitrine)/showcase.config";

const ROUTES = ["/", "/packs", "/qua-tang"];

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map((path) => ({
    url: `${agency.url}${path}`,
    lastModified: new Date(),
  }));
}
