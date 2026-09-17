import type { MetadataRoute } from "next";
import { agency } from "./(vitrine)/showcase.config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${agency.url}/sitemap.xml`,
  };
}
