/**
 * Récupération lexicale — BM25 sur le corpus de `lib/chat/kb`.
 *
 * Pourquoi lexical d'abord, et pas des vecteurs : le corpus est petit (une
 * quarantaine d'extraits par langue), il est indexé DANS la langue de la
 * question (chaque langue a son corpus), et le vocabulaire d'un prospect
 * recoupe celui de l'offre — « giá », « gói », « đặt lịch », « délai ». BM25
 * répond en moins d'une milliseconde, sans appel réseau, sans quota, et ne
 * peut pas devenir obsolète. Le reclassement sémantique de `embeddings.ts`
 * vient par-dessus quand il est disponible, jamais à la place.
 *
 * Deux choix qui font la différence sur ce corpus :
 *   - les BIGRAMMES sont indexés en plus des unigrammes. Le vietnamien écrit
 *     ses mots en syllabes séparées par des espaces : « đặt lịch », « cà phê »,
 *     « bao nhiêu » ne veulent rien dire syllabe par syllabe. Un bigramme est
 *     aussi plus rare qu'un unigramme, donc mieux noté par l'IDF ;
 *   - chaque extrait porte des `keywords` indexés avec son texte : c'est là
 *     qu'on met « premium » pour Cao Cấp, ou « CMS » pour un mot qu'on ne dit
 *     jamais mais que le visiteur tape.
 */

import { PACKS, type Locale } from "@/lib/registry";
import { normalize } from "./guard";
import { PACK_NAMES, corpus } from "./kb/corpus";
import type { Chunk } from "./kb/types";

// ────────────────────────────────────────────────────────────
// Tokenisation
// ────────────────────────────────────────────────────────────

/** Mots vides, volontairement courts : mieux vaut garder un mot que perdre un sens. */
const STOPWORDS: Record<Locale, Set<string>> = {
  vi: new Set(["cua", "va", "la", "co", "cho", "voi", "duoc", "mot", "nay", "do", "thi", "minh", "anh", "chi", "a", "ah", "nhe", "ban", "toi", "em", "shop", "vay", "ma", "o", "khi"]),
  // Les interrogatifs sont dans la liste pour une raison précise : les titres
  // de la FAQ SONT des questions. Sans ça, « how do I get chosen » tombait sur
  // « Do I get trained on it? » — un mot commun sans rapport de sens, mais rare
  // dans le corpus, donc très bien noté par l'IDF.
  en: new Set(["the", "a", "an", "of", "and", "is", "are", "to", "for", "with", "my", "i", "you", "do", "does", "did", "it", "on", "in", "me", "we", "your", "that", "this", "how", "what", "which", "when", "where", "why", "there", "any", "anything", "get", "got", "would", "should", "could", "will", "about", "if"]),
  fr: new Set(["le", "la", "les", "de", "des", "du", "un", "une", "et", "est", "sont", "pour", "avec", "mon", "ma", "mes", "je", "vous", "ce", "que", "qui", "il", "elle", "au", "aux", "en", "sur", "dans", "par", "combien", "comment", "quel", "quelle", "quels", "quelles", "pourquoi", "quand", "faut", "dois", "puis", "y", "ai", "as", "avez", "si"]),
};

/**
 * Termes qu'un visiteur tape mais qui n'existent nulle part dans le corpus,
 * étendus vers ce qui s'y trouve. Le plus important : « CMS », mot interdit à
 * l'écrit côté réponse, mais que les clients techniques emploient.
 */
const QUERY_EXPANSIONS: Record<string, string[]> = {
  cms: ["tu sua noi dung", "espace de gestion", "self service editing", "admin"],
  wordpress: ["site", "web", "refonte"],
  wix: ["site", "web"],
  shopify: ["ban hang", "ecommerce", "panier", "cart"],
  seo: ["google", "tim kiem", "search"],
  api: ["ket noi", "integration"],
  app: ["web", "site", "pwa"],
  blog: ["tin tuc", "actualites", "news"],
};

/**
 * Désuffixation minimale : le pluriel français et anglais, rien d'autre.
 * « restaurants » doit trouver « restaurant », « packs » trouver « pack ».
 * Appliquée aux documents ET aux questions, donc la justesse linguistique
 * importe moins que la cohérence : « mois » → « moi » des deux côtés, ça
 * marche. Le vietnamien ne marque pas le pluriel, la règle ne s'y applique pas.
 */
function stem(word: string, locale: Locale): string {
  if (locale === "vi") return word;
  if (word.length > 3 && word.endsWith("s") && !word.endsWith("ss") && !word.endsWith("us")) {
    return word.slice(0, -1);
  }
  return word;
}

function tokenize(text: string, locale: Locale): string[] {
  const stop = STOPWORDS[locale];
  const words = normalize(text)
    .replace(/[^\p{L}\p{N}\s]+/gu, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => stem(w, locale));

  const unigrams = words.filter((w) => w.length > 1 && !stop.has(w));

  // Bigrammes en vietnamien SEULEMENT. La langue y écrit ses mots en syllabes
  // séparées (« đặt lịch », « cà phê ») : sans bigramme, on indexe des moitiés
  // de mots. En français et en anglais, ils faisaient surtout remonter des
  // tournures de question (« combien coûte », « do I get ») communes à des
  // extraits sans rapport — mesuré : le taux de bonne réponse en tête baissait.
  if (locale !== "vi") return unigrams;

  const bigrams: string[] = [];
  for (let i = 0; i < words.length - 1; i++) bigrams.push(`${words[i]} ${words[i + 1]}`);
  return [...unigrams, ...bigrams];
}

function expand(tokens: string[]): string[] {
  const out = [...tokens];
  for (const token of tokens) {
    const extra = QUERY_EXPANSIONS[token];
    if (extra) out.push(...extra.flatMap((e) => e.split(/\s+/).concat(e.includes(" ") ? [e] : [])));
  }
  return out;
}

// ────────────────────────────────────────────────────────────
// Index BM25
// ────────────────────────────────────────────────────────────

/** Extraits non-paliers conservés quand les quatre fiches entrent d'un coup. */
const OTHERS_KEPT = 3;

const K1 = 1.5;
/**
 * Normalisation par la longueur, volontairement plus douce que le 0,75 usuel.
 * Les extraits n'ont pas du tout la même taille ici : trois lignes pour la
 * FAQ, trente pour un pack ou un métier. À 0,75, la question « vous faites
 * quoi pour les restaurants » remontait la présentation du studio (courte,
 * où le mot apparaît une fois) avant la page métier (longue, où il est le
 * sujet). À 0,5, la richesse d'un extrait cesse d'être une pénalité.
 */
const B = 0.5;

type Doc = { chunk: Chunk; tf: Map<string, number>; length: number };
type Index = { docs: Doc[]; df: Map<string, number>; avgLength: number };

const indexes = new Map<Locale, Index>();

function buildIndex(locale: Locale): Index {
  const docs: Doc[] = corpus(locale).map((chunk) => {
    const tokens = tokenize(
      [chunk.title, chunk.body, ...(chunk.keywords ?? [])].join(" \n "),
      locale,
    );
    const tf = new Map<string, number>();
    for (const token of tokens) tf.set(token, (tf.get(token) ?? 0) + 1);
    return { chunk, tf, length: tokens.length };
  });

  const df = new Map<string, number>();
  for (const doc of docs) {
    for (const token of doc.tf.keys()) df.set(token, (df.get(token) ?? 0) + 1);
  }

  const avgLength = docs.reduce((sum, d) => sum + d.length, 0) / Math.max(1, docs.length);
  return { docs, df, avgLength };
}

function getIndex(locale: Locale): Index {
  let index = indexes.get(locale);
  if (!index) {
    index = buildIndex(locale);
    indexes.set(locale, index);
  }
  return index;
}

export type Hit = { chunk: Chunk; score: number };

/**
 * Les `limit` extraits les plus proches de la question, notés BM25 puis
 * pondérés par le `boost` de l'extrait. Le score renvoyé est normalisé sur
 * [0, 1] (1 = meilleur de cette recherche) pour pouvoir être fusionné avec
 * une similarité cosinus, qui vit sur la même échelle.
 */
export function search(query: string, locale: Locale, limit = 12): Hit[] {
  const index = getIndex(locale);
  const tokens = expand(tokenize(query, locale));
  if (!tokens.length) return [];

  const N = index.docs.length;
  const scored: Hit[] = index.docs.map((doc) => {
    let score = 0;
    for (const token of tokens) {
      const tf = doc.tf.get(token);
      if (!tf) continue;
      const df = index.df.get(token) ?? 0;
      // IDF de Robertson, lissé : un terme présent partout ne départage rien.
      const idf = Math.log(1 + (N - df + 0.5) / (df + 0.5));
      const norm = tf * (K1 + 1);
      const denom = tf + K1 * (1 - B + (B * doc.length) / index.avgLength);
      score += idf * (norm / denom);
    }
    return { chunk: doc.chunk, score: score * (doc.chunk.boost ?? 1) };
  });

  const best = scored.filter((h) => h.score > 0).sort((a, b) => b.score - a.score);
  if (!best.length) return [];

  const max = best[0]!.score;
  return best.slice(0, limit).map((h) => ({ ...h, score: h.score / max }));
}

/** Utilitaire de diagnostic : vide les index (utilisé par les tests). */
export function resetIndexes(): void {
  indexes.clear();
}

/**
 * Complète une sélection d'extraits pour que les paliers y soient tous, ou
 * aucun.
 *
 * Observé en conditions réelles : à la question « je tiens un petit café,
 * quel pack ? », la recherche avait ramené Khởi Đầu et Doanh Nghiệp, pas
 * Phát Triển. Le modèle a recommandé Phát Triển — qu'il connaît par la grille
 * de prix, toujours présente — puis a décrit les fonctionnalités de Khởi Đầu,
 * le seul palier détaillé sous ses yeux. Une réponse fausse sur la question la
 * plus chère de toutes.
 *
 * Dès qu'un palier est en jeu, les quatre entrent donc ensemble : ils portent
 * chacun leur liste de « PAS dans ce pack », et c'est cette liste qui empêche
 * de mélanger. Le coût est d'environ 2 500 caractères de prompt, uniquement
 * sur les questions qui parlent de paliers.
 */
export function withPackCoherence(chunks: Chunk[], locale: Locale, query?: string): Chunk[] {
  // Trois déclencheurs, et ils disent tous la même chose : « une
  // recommandation de palier est sur le point d'être faite ».
  //
  //  1. un palier est déjà dans les résultats ;
  //  2. la QUESTION en nomme un — « Khởi Đầu khác Phát Triển ở đâu ? » ne
  //     ramenait que des pages métier, qui citent les noms des paliers dans un
  //     texte plus court que les fiches elles-mêmes ;
  //  3. le visiteur a nommé son MÉTIER. C'est le cas le plus fréquent et le
  //     plus coûteux : à « tôi có một quán cà phê nhỏ », la recherche rendait
  //     la page café et rien d'autre. Le modèle recommandait quand même un
  //     palier — la méthode de vente le lui demande — en le décrivant de
  //     mémoire, et attribuait à Phát Triển l'espace de gestion, qui est une
  //     option à 12,9 M₫. Dire son métier, c'est demander une recommandation.
  const named = query ? PACK_NAMES.some((name) => normalize(query).includes(name)) : false;
  const tradeKnown = chunks.some((c) => c.topic === "metier");
  if (!named && !tradeKnown && !chunks.some((c) => c.topic === "pack")) return chunks;

  const present = new Set(chunks.map((c) => c.id));
  const missing = corpus(locale).filter(
    (c) => c.topic === "pack" && !present.has(c.id),
  );
  if (!missing.length) return chunks;

  // Ordre de la grille, pour que le modèle lise l'escalier dans le bon sens.
  // Un extrait de topic `pack` qui n'est pas une fiche de palier — l'escalier
  // tarifaire — n'a pas de rang dans la grille : il passe derrière, pas devant.
  const order = PACKS.map((p) => `pack:${p.id}`);
  const rank = (id: string) => {
    const index = order.indexOf(id);
    return index === -1 ? order.length : index;
  };
  const packs = [...chunks.filter((c) => c.topic === "pack"), ...missing].sort(
    (a, b) => rank(a.id) - rank(b.id),
  );

  // Les quatre paliers pèsent déjà ~2 500 caractères : on écourte donc la
  // queue. Trois extraits et pas deux : à deux, une question précise posée par
  // quelqu'un qui a aussi nommé son métier — « je veux que les touristes
  // comprennent mon menu » — perdait sa réponse (la FAQ langues) au profit des
  // paliers. Le troisième rang la sauve.
  //
  // La page MÉTIER passe d'abord, quel que soit
  // son score : c'est elle qui porte l'argument du commerce du visiteur, et
  // c'est souvent elle qui a fait entrer les paliers. Plafonner sans la
  // protéger la faisait éjecter par la présentation du studio — on se
  // retrouvait à vendre des paliers sans savoir à qui.
  const nonPacks = chunks.filter((c) => c.topic !== "pack");
  const others = [
    ...nonPacks.filter((c) => c.topic === "metier"),
    ...nonPacks.filter((c) => c.topic !== "metier"),
  ].slice(0, OTHERS_KEPT);
  return [...packs, ...others];
}
