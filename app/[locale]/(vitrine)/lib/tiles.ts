import type { VerticalId } from "@/lib/registry";

/**
 * Vignette photo par métier, en remplacement des emoji du registre (☕ ✂️ 🏮 🍜
 * 🏨 🦷) : un emoji est rendu différemment sur chaque appareil et n'a aucun
 * rapport avec la direction artistique de la vitrine.
 *
 * Le registre garde son champ `icon` — il sert de repli textuel et reste utile
 * hors écran (QR, exports). C'est ici, côté vitrine, que vivent les assets de
 * la vitrine, pas dans le paquet partagé.
 *
 * Nature morte à plat, fond de béton crème, lumière rasante de gauche :
 * les six partagent le même dispositif, c'est ce qui en fait une série.
 *
 * Volontairement PARTIELLE : `VerticalId` couvre aussi `fitness`, `tour` et
 * `moto`, qui n'ont pas encore de vignette. Les composants retombent sur
 * l'emoji du registre — un métier ajouté au registre sans photo doit
 * s'afficher, pas planter.
 */
export const TILE: Partial<Record<VerticalId, string>> = {
  cafe: "/vitrine/metier-cafe.webp",
  salon: "/vitrine/metier-salon.webp",
  shop: "/vitrine/metier-shop.webp",
  restaurant: "/vitrine/metier-restaurant.webp",
  homestay: "/vitrine/metier-homestay.webp",
  clinique: "/vitrine/metier-clinique.webp",
};
