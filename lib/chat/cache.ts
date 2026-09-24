/**
 * Cache de réponses — le levier de coût le plus rentable du chatbot.
 *
 * Sur une vitrine, les visiteurs posent les mêmes dix questions : « combien
 * ça coûte », « c'est quoi la différence », « en combien de temps ». Chacune
 * déclenchait un appel au modèle. Ici, la même question dans la même langue
 * ressert la réponse déjà rédigée.
 *
 * Trois garde-fous pour que ça ne dégrade rien :
 *   - clé = langue + question NORMALISÉE (casse, accents et ponctuation
 *     retirés) : « Combien ça coûte ? » et « combien ca coute » se
 *     rejoignent, mais deux questions différentes ne se confondent jamais ;
 *   - uniquement les questions de PREMIER TOUR. Dès qu'il y a un historique,
 *     la réponse dépend de ce qui précède et ne se réutilise pas ;
 *   - durée de vie courte (6 h) et taille bornée, pour qu'un changement de
 *     prix dans le registre se propage vite.
 */

import { normalize } from "./guard";

type Entry = { response: string; sources: string[]; expiresAt: number };

const TTL_MS = 6 * 60 * 60 * 1000;
const MAX_ENTRIES = 300;
/** En dessous, la question est trop courte pour être identifiable (« ok », « et ? »). */
const MIN_LENGTH = 8;

const store = new Map<string, Entry>();

function key(message: string, locale: string): string {
  return `${locale}|${normalize(message).replace(/[^\p{L}\p{N} ]+/gu, "").trim()}`;
}

/** Réponse déjà rédigée pour cette question, ou `null`. */
export function getCached(message: string, locale: string): Entry | null {
  if (message.trim().length < MIN_LENGTH) return null;
  const entry = store.get(key(message, locale));
  if (!entry) return null;
  if (Date.now() >= entry.expiresAt) {
    store.delete(key(message, locale));
    return null;
  }
  return entry;
}

/** Mémorise une réponse du modèle. À n'appeler que sur un premier tour. */
export function setCached(message: string, locale: string, response: string, sources: string[]): void {
  if (message.trim().length < MIN_LENGTH) return;

  // Éviction du plus ancien inséré : une Map JS conserve l'ordre d'insertion,
  // ce qui suffit ici — on borne la mémoire, on ne cherche pas le LRU parfait.
  if (store.size >= MAX_ENTRIES) {
    const oldest = store.keys().next().value;
    if (oldest) store.delete(oldest);
  }
  store.set(key(message, locale), { response, sources, expiresAt: Date.now() + TTL_MS });
}

/** Vide le cache — utilisé par les tests. */
export function clearCache(): void {
  store.clear();
}

/** Diagnostic : taille courante du cache. */
export function cacheSize(): number {
  return store.size;
}
