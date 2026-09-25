import type { Locale } from "@/lib/registry";

/** Les familles de contenu indexées — sert à pondérer et à diagnostiquer. */
export type ChunkTopic =
  | "pack"
  | "option"
  | "non-inclus"
  | "modifications"
  | "metier"
  | "process"
  | "jeu"
  | "faq"
  | "agence"
  /** Ce avec quoi les sites sont construits — voir `tech.ts`. */
  | "tech"
  /** Prestations chiffrées après échange : Android, automatisation, IA. */
  | "service";

/**
 * L'unité de récupération. Un chunk est autonome : le modèle doit pouvoir
 * répondre avec lui seul sous les yeux, sans le reste du corpus. D'où des
 * titres explicites et des prix réécrits dans chaque chunk concerné plutôt
 * qu'une référence à « la grille ci-dessus » qui, elle, ne sera pas là.
 */
export type Chunk = {
  /** Stable et lisible : `pack:cao-cap`, `metier:cafe`, `faq:domaine`. */
  id: string;
  topic: ChunkTopic;
  locale: Locale;
  title: string;
  body: string;
  /**
   * Termes que le corps ne contient pas mais qu'un visiteur peut taper :
   * noms commerciaux dans une autre langue, synonymes, fautes courantes.
   * Indexés comme le corps, jamais montrés au modèle.
   */
  keywords?: string[];
  /** Multiplicateur de score. > 1 pour ce qui se demande tout le temps. */
  boost?: number;
  /**
   * `false` interdit de servir cet extrait tel quel, sans appel au modèle.
   * Voir `direct` dans `faq.ts` : les questions qui ouvrent une vente méritent
   * une recommandation, pas un paragraphe figé.
   */
  direct?: false;
};
