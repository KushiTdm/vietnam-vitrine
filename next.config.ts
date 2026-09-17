import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Racine du monorepo : Turbopack ne doit pas s'arrêter au dossier de l'app.
const workspaceRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

const nextConfig: NextConfig = {
  turbopack: { root: workspaceRoot },
  // Le registre est du TypeScript source, partagé sans étape de build.
  transpilePackages: ["@hanoi/registry"],
  // Déployé sur Vercel : l'optimiseur d'images natif fait le travail, pas
  // besoin du loader custom /cdn-cgi/image/ de la variante Cloudflare
  // (voir apps/site/image-loader.ts) — toutes les images de la vitrine sont
  // des assets locaux sous public/vitrine/.
};

export default nextConfig;
