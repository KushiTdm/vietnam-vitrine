/**
 * Contrat unique du portfolio de démos.
 *
 * Ajouter une démo = ajouter une entrée dans `demos.ts`. La vitrine, les QR codes,
 * le sitemap, la matrice de comparaison et les deux agents de contrôle en dérivent :
 * aucune ligne de vitrine à écrire.
 */

export type Locale = "vi" | "en" | "fr";
export const LOCALES: Locale[] = ["vi", "en", "fr"];

export type L10n = Record<Locale, string>;

/** Les trois paliers tarifés, plus un palier sur devis (décision §4 du plan showcase). */
export type PackId = "khoi-dau" | "phat-trien" | "cao-cap" | "doanh-nghiep";

export type VerticalId =
  | "cafe"
  | "salon"
  | "shop"
  | "restaurant"
  | "homestay"
  | "clinique"
  | "fitness"
  | "tour"
  | "moto";

/** Valeur d'une fonctionnalité pour un pack : absente, incluse, ou incluse avec précision. */
export type FeatureValue = false | true | L10n;

/** Regroupement d'affichage dans la matrice de comparaison. */
export type FeatureGroup = "socle" | "contenu" | "conversion" | "vente" | "pilotage" | "accompagnement";

export type Feature = {
  id: string;
  group: FeatureGroup;
  label: L10n;
  /** Valeurs par défaut du portfolio, surchargeables par verticale via `Vertical.overrides`. */
  values: Record<PackId, FeatureValue>;
};

export type Pack = {
  id: PackId;
  /** Rang d'affichage, 1 → 4. */
  rank: number;
  /** Nom commercial dans la grille de prix. */
  gridName: L10n;
  tierName: L10n;
  pitch: L10n;
  /** `null` = sur devis (palier Doanh Nghiệp). */
  price: number | null;
  priceWithMaintenance: number | null;
  monthly: number | null;
  yearlyMaintenance: number | null;
  /** Affiche « dès » devant le prix. */
  from: boolean;
  /** Délai de livraison annoncé. */
  leadTime: L10n;
  accent: string;
  ground: string;
  onGround: string;
};

export type Vertical = {
  id: VerticalId;
  slug: string;
  name: L10n;
  /** Nom du métier en vietnamien courant, celui qu'un prospect reconnaît. */
  nativeName: string;
  tagline: L10n;
  /** L'argument de vente propre au métier, dit en rendez-vous. */
  pitch: L10n;
  /** Packs réellement proposés — un homestay ne se vend pas en Khởi Đầu. */
  packs: PackId[];
  /** Emoji de repli si aucune icône dessinée n'est fournie. */
  icon: string;
  accent: string;
  /** Fonctionnalités propres au métier, ajoutées à la matrice globale. */
  extraFeatures?: Feature[];
  /** Surcharges de la matrice globale : `{ [featureId]: { [packId]: valeur } }`. */
  overrides?: Record<string, Partial<Record<PackId, FeatureValue>>>;
};

/** Preuve d'implémentation, lue par l'agent de conformité (§10). */
export type Evidence = {
  /** Fichiers devant exister, relatifs à `apps/site/app/demo/<id>/`. */
  files?: string[];
  /** Routes Next devant exister (chemin de fichier `page.tsx` relatif au dossier de la démo). */
  routes?: string[];
  /** Handlers d'API devant exister, relatifs au dossier de la démo. */
  api?: string[];
  /** Motifs devant apparaître dans un fichier donné. */
  grep?: { file: string; pattern: string }[];
};

export type DemoStatus = "live" | "wip" | "planned";

export type Demo = {
  id: string;
  vertical: VerticalId;
  pack: PackId;
  /** Nom du commerce fictif : « Ngõ Nhỏ », « Hương Salon ». */
  businessName: string;
  /**
   * Nom de la direction artistique, quand plusieurs démos partagent un même palier
   * pour un même métier. Deux restaurants au palier Phát Triển ne sont pas deux
   * offres : c'est la même offre montrée sous deux partis pris visuels.
   */
  variant?: string;
  /** Quartier de Hanoi — jamais Saigon (§7 du plan packs). */
  district: string;
  /** Direction artistique en une ligne. */
  designNote: L10n;
  /** Chemin de la démo dans le projet unifié, ex. `/demo/cafe-cao-cap`. Toujours égal à `/demo/${id}`. */
  path: string;
  /** URL publique une fois déployée ; `null` tant que ce n'est pas en ligne. */
  url: string | null;
  status: DemoStatus;
  /** Langue d'ouverture — EN pour homestay et tours, VI partout ailleurs. */
  defaultLocale: Locale;
  /** Preuves d'implémentation par identifiant de fonctionnalité. */
  evidence?: Record<string, Evidence>;
  /** Écarts connus, affichés en mode interne uniquement. */
  knownGaps?: string[];
};
