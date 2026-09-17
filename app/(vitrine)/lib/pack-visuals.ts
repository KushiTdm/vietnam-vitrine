import type { PackId } from "@/lib/registry";

/**
 * Visuel par palier — mockup d'appareil composé à partir d'une vraie capture de démo
 * (voir `visuels-packs/` à la racine du repo pour la recette : Playwright avec
 * `prefers-reduced-motion: reduce`, puis composition). Même dispositif que
 * `/vitrine/hero-commercante.*` : poster webp + vidéo silencieuse en boucle, jamais
 * d'écran de démo brut à l'écran (bandeau de comparaison de palier, bulle de chat de
 * démo) — ce qui est montré est déjà recadré en amont.
 */
export const PACK_VISUAL: Record<PackId, { poster: string; mp4: string; webm: string }> = {
  "khoi-dau": {
    poster: "/vitrine/pack-khoi-dau.webp",
    mp4: "/vitrine/pack-khoi-dau.mp4",
    webm: "/vitrine/pack-khoi-dau.webm",
  },
  "phat-trien": {
    poster: "/vitrine/pack-phat-trien.webp",
    mp4: "/vitrine/pack-phat-trien.mp4",
    webm: "/vitrine/pack-phat-trien.webm",
  },
  "cao-cap": {
    poster: "/vitrine/pack-cao-cap.webp",
    mp4: "/vitrine/pack-cao-cap.mp4",
    webm: "/vitrine/pack-cao-cap.webm",
  },
  "doanh-nghiep": {
    poster: "/vitrine/pack-doanh-nghiep.webp",
    mp4: "/vitrine/pack-doanh-nghiep.mp4",
    webm: "/vitrine/pack-doanh-nghiep.webm",
  },
};
