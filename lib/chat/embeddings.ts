/**
 * Reclassement sémantique — la seconde moitié du RAG.
 *
 * BM25 (`retrieval.ts`) trouve les extraits qui partagent des mots avec la
 * question. Il ne trouve pas ceux qui disent la même chose avec d'autres mots :
 * « je veux encaisser par téléphone » et « VietQR, MoMo » n'ont aucun mot en
 * commun. Les vecteurs, eux, les rapprochent.
 *
 * Le dispositif est volontairement facultatif et sans piège :
 *   - les vecteurs des extraits sont calculés HORS LIGNE (`scripts/build-embeddings.mts`)
 *     et versionnés dans `kb/embeddings.json` — à l'exécution, un seul appel
 *     réseau, pour la question ;
 *   - le fichier porte l'empreinte du corpus qui l'a produit. Si le registre
 *     change et que personne ne régénère, l'empreinte ne correspond plus et le
 *     reclassement se désactive tout seul. Jamais de réponse fondée sur des
 *     vecteurs périmés ;
 *   - toute erreur (pas de clé, quota, réseau, fichier vide) renvoie
 *     silencieusement au classement BM25, qui reste un bon classement.
 */

import { createHash } from "node:crypto";
import type { Locale } from "@/lib/registry";
import { corpus } from "./kb/corpus";
import type { Hit } from "./retrieval";
import vectorStore from "./kb/embeddings.json";

const EMBED_MODEL = "mistral-embed";
const EMBED_URL = "https://api.mistral.ai/v1/embeddings";
/**
 * Fusion par les RANGS, pas par les scores (Reciprocal Rank Fusion).
 *
 * Mesuré sur ce corpus : les similarités cosinus de `mistral-embed` tiennent
 * toutes entre 0,68 et 0,70, y compris entre une question et un extrait sans
 * rapport. Mélangées telles quelles à un score BM25 étalé sur [0, 1], elles ne
 * déplaçaient rien — le reclassement rendait exactement l'ordre d'entrée.
 * C'est le défaut classique d'un espace d'embedding « anisotrope » : ce qui
 * porte l'information, c'est l'ORDRE des similarités, pas leur valeur.
 *
 * RRF ne regarde donc que les rangs : score = Σ poids / (K + rang). `K` est
 * petit (10) parce que la liste de candidats l'est aussi ; à 60, valeur usuelle
 * sur des listes de milliers de documents, les premiers rangs s'écrasent.
 */
const RRF_K = 10;
const LEXICAL_WEIGHT = 1;
const SEMANTIC_WEIGHT = 0.8;

type VectorStore = {
  model: string;
  corpusHash: string;
  /** `"<locale>:<chunkId>"` → vecteur int8 encodé en base64, plus son échelle. */
  vectors: Record<string, { scale: number; data: string }>;
};

const store = vectorStore as VectorStore;

/**
 * Empreinte du corpus d'une langue. Doit être calculée exactement de la même
 * façon ici et dans le script de génération — d'où cette fonction exportée,
 * utilisée des deux côtés.
 */
export function corpusHash(): string {
  const hash = createHash("sha256");
  for (const locale of ["vi", "en", "fr"] as Locale[]) {
    for (const chunk of corpus(locale)) {
      // Les mots-clés entrent dans le texte vectorisé (voir `textOf` du script
      // de génération) : les oublier ici laisserait des vecteurs périmés passer
      // pour valides après un simple ajout de synonyme.
      hash.update(`${locale}:${chunk.id}\n${chunk.title}\n${chunk.body}\n${(chunk.keywords ?? []).join(",")}\n`);
    }
  }
  return hash.digest("hex").slice(0, 16);
}

/**
 * Cache des vecteurs de questions. Une question revient souvent — et deux
 * visiteurs qui écrivent la même chose ne doivent pas coûter deux appels.
 * Durée de vie courte : le vecteur d'une question ne périme pas, mais la
 * mémoire d'une instance serverless, si.
 */
const QUERY_CACHE_TTL_MS = 60 * 60 * 1000;
const QUERY_CACHE_MAX = 200;
const queryVectors = new Map<string, { vector: Float32Array; expiresAt: number }>();

/**
 * BM25 a-t-il déjà tranché ? Si le premier extrait domine largement le
 * second, le reclassement ne changera pas l'ordre : on économise l'appel
 * réseau, le quota, et 200 à 400 ms de latence. Mesuré sur 34 questions
 * d'évaluation : le cas se présente 7 fois (21 %), et dans ces 7 cas le
 * premier extrait était déjà le bon — le reclassement n'avait rien à y faire.
 */
function isDecisive(hits: Hit[]): boolean {
  if (hits.length === 1) return true;
  return hits[0]!.score >= 0.95 && (hits[1]?.score ?? 0) <= 0.45;
}

let warned = false;
function warnOnce(reason: string): void {
  if (warned) return;
  warned = true;
  console.warn(`[chat/rag] reclassement sémantique inactif — ${reason}. BM25 seul.`);
}

/** Le reclassement est-il utilisable dans cette instance ? */
export function semanticAvailable(): boolean {
  if (process.env.CHAT_RAG_EMBEDDINGS === "0") return false;
  if (!process.env.MISTRAL_API_KEY) return false;
  if (!store.vectors || Object.keys(store.vectors).length === 0) {
    warnOnce("aucun vecteur généré (pnpm rag:embeddings)");
    return false;
  }
  if (store.corpusHash !== corpusHash()) {
    warnOnce("les vecteurs ne correspondent plus au corpus (pnpm rag:embeddings)");
    return false;
  }
  return true;
}

function decode(entry: { scale: number; data: string }): Float32Array {
  const bytes = Buffer.from(entry.data, "base64");
  const out = new Float32Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) {
    // Int8 : les octets > 127 représentent des valeurs négatives.
    const signed = bytes[i]! > 127 ? bytes[i]! - 256 : bytes[i]!;
    out[i] = signed * entry.scale;
  }
  return out;
}

function cosine(a: Float32Array, b: Float32Array): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) {
    dot += a[i]! * b[i]!;
    na += a[i]! * a[i]!;
    nb += b[i]! * b[i]!;
  }
  if (!na || !nb) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

/** Vecteur d'un texte, via l'API. `null` si l'appel échoue, pour quelque raison que ce soit. */
export async function embed(text: string): Promise<Float32Array | null> {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) return null;

  const cacheKey = text.trim().toLowerCase();
  const cached = queryVectors.get(cacheKey);
  if (cached && Date.now() < cached.expiresAt) return cached.vector;

  try {
    const response = await fetch(EMBED_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model: EMBED_MODEL, input: [text] }),
      signal: AbortSignal.timeout(6_000),
    });
    if (!response.ok) {
      warnOnce(`l'API a répondu ${response.status}`);
      return null;
    }
    const json = await response.json();
    const vector: number[] | undefined = json?.data?.[0]?.embedding;
    if (!vector) return null;

    const value = Float32Array.from(vector);
    if (queryVectors.size >= QUERY_CACHE_MAX) {
      const oldest = queryVectors.keys().next().value;
      if (oldest) queryVectors.delete(oldest);
    }
    queryVectors.set(cacheKey, { vector: value, expiresAt: Date.now() + QUERY_CACHE_TTL_MS });
    return value;
  } catch {
    warnOnce("appel d'embedding impossible");
    return null;
  }
}

/**
 * Refond le classement de `hits` avec la similarité sémantique.
 * Rend la liste inchangée si le reclassement n'est pas disponible — l'appelant
 * n'a rien à vérifier.
 */
export async function rerank(query: string, locale: Locale, hits: Hit[]): Promise<Hit[]> {
  if (!hits.length || !semanticAvailable()) return hits;
  // Rien à gagner : BM25 a déjà mis un extrait très au-dessus des autres.
  if (isDecisive(hits)) return hits;

  const queryVector = await embed(query);
  if (!queryVector) return hits;

  // Rang lexical : l'ordre d'arrivée, déjà trié par `search`.
  const lexicalRank = new Map(hits.map((hit, index) => [hit.chunk.id, index]));

  // Rang sémantique : les mêmes candidats, retriés par similarité. Un extrait
  // sans vecteur (corpus modifié depuis la génération) part en fin de liste
  // plutôt que d'être écarté — il garde son rang lexical.
  const similarities = hits.map((hit) => {
    const entry = store.vectors[`${locale}:${hit.chunk.id}`];
    return { id: hit.chunk.id, similarity: entry ? cosine(queryVector, decode(entry)) : -1 };
  });
  similarities.sort((a, b) => b.similarity - a.similarity);
  const semanticRank = new Map(similarities.map((s, index) => [s.id, index]));

  return hits
    .map((hit) => ({
      ...hit,
      score:
        LEXICAL_WEIGHT / (RRF_K + (lexicalRank.get(hit.chunk.id) ?? hits.length)) +
        SEMANTIC_WEIGHT / (RRF_K + (semanticRank.get(hit.chunk.id) ?? hits.length)),
    }))
    .sort((a, b) => b.score - a.score);
}
