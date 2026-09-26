import { existsSync } from "node:fs";
import path from "node:path";
import type { NextConfig } from "next";

// apps/vitrine a son propre dépôt git (déploiement Vercel autonome), mais en local ses
// dépendances viennent du node_modules du monorepo parent (liens pnpm). Sans racine
// explicite, Turbopack s'arrête à la limite du dépôt git, ne retrouve plus le paquet
// `next` et répond 500 sur toutes les pages (« route not found /[locale]/(vitrine)/page »).
// Sur Vercel il n'y a pas de monorepo autour de ce dossier : la condition est fausse et
// la configuration ne change pas.
const monorepoRoot = path.resolve(process.cwd(), "../..");
const inMonorepo = existsSync(path.join(monorepoRoot, "pnpm-workspace.yaml"));

const nextConfig: NextConfig = {
  // Déployé sur Vercel : l'optimiseur d'images natif fait le travail, pas
  // besoin du loader custom /cdn-cgi/image/ de la variante Cloudflare
  // (voir apps/site/image-loader.ts) — toutes les images de la vitrine sont
  // des assets locaux sous public/vitrine/.
  ...(inMonorepo ? { turbopack: { root: monorepoRoot } } : {}),
};

export default nextConfig;
