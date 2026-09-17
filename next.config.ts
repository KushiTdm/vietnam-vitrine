import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Déployé sur Vercel : l'optimiseur d'images natif fait le travail, pas
  // besoin du loader custom /cdn-cgi/image/ de la variante Cloudflare
  // (voir apps/site/image-loader.ts) — toutes les images de la vitrine sont
  // des assets locaux sous public/vitrine/.
};

export default nextConfig;
