/**
 * Génère `lib/chat/kb/embeddings.json` — les vecteurs du corpus du chatbot.
 *
 *   cd apps/vitrine && tsx scripts/build-embeddings.mts
 *   (ou, depuis la racine du monorepo : pnpm rag:embeddings)
 *
 * La clé `MISTRAL_API_KEY` est lue dans `apps/vitrine/.env.local` puis `.env`
 * (ou dans l'environnement si elle y est déjà : `MISTRAL_API_KEY=... tsx ...`).
 *
 * À relancer chaque fois que le registre, la FAQ ou les données du jeu
 * changent. Si on oublie, rien ne casse : le fichier porte l'empreinte du
 * corpus, `embeddings.ts` la vérifie et se désactive tout seul — le chatbot
 * retombe sur BM25 et le journal du serveur le dit.
 *
 * Les vecteurs sont quantifiés en int8 : 1024 dimensions passent de 4 Ko à
 * 1 Ko, l'erreur introduite est très en dessous de ce qui sépare deux extraits
 * voisins, et le fichier reste lisible dans une revue de code.
 */

import { existsSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { corpus } from "@/lib/chat/kb/corpus";
import { corpusHash } from "@/lib/chat/embeddings";
import type { Locale } from "@/lib/registry";

const LOCALES: Locale[] = ["vi", "en", "fr"];
const MODEL = "mistral-embed";
const OUT = resolve(process.cwd(), "lib/chat/kb/embeddings.json");
/** L'API accepte des lots ; on reste large sous la limite de jetons par requête. */
const BATCH = 32;

// `tsx` ne charge aucun fichier .env — seul Next le fait. Sans cette boucle, une clé
// écrite dans apps/vitrine/.env reste invisible et le script répond « manquante ».
// Même ordre de priorité que Next : .env.local avant .env, une variable déjà
// présente dans l'environnement n'est jamais écrasée.
for (const file of [".env.local", ".env"]) {
  if (existsSync(file)) process.loadEnvFile(file);
}

const apiKey = process.env.MISTRAL_API_KEY;
if (!apiKey) {
  console.error("MISTRAL_API_KEY manquante. Rien n'a été écrit.");
  process.exit(1);
}

/** Le texte vectorisé : exactement ce que le modèle devra rapprocher d'une question. */
function textOf(chunk: { title: string; body: string; keywords?: string[] }): string {
  return [chunk.title, chunk.body, (chunk.keywords ?? []).join(" ")].filter(Boolean).join("\n");
}

async function embedBatch(inputs: string[]): Promise<number[][]> {
  const response = await fetch("https://api.mistral.ai/v1/embeddings", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model: MODEL, input: inputs }),
  });
  if (!response.ok) {
    throw new Error(`API ${response.status} — ${await response.text().catch(() => "")}`);
  }
  const json = await response.json();
  return json.data.map((d: { embedding: number[] }) => d.embedding);
}

/** Vecteur unitaire → int8 + échelle, encodé en base64. */
function quantize(vector: number[]): { scale: number; data: string } {
  const norm = Math.sqrt(vector.reduce((sum, x) => sum + x * x, 0)) || 1;
  const unit = vector.map((x) => x / norm);
  const max = Math.max(...unit.map(Math.abs)) || 1;
  const scale = max / 127;
  const bytes = Buffer.from(Int8Array.from(unit.map((x) => Math.round(x / scale))).buffer);
  return { scale, data: bytes.toString("base64") };
}

const entries: { key: string; text: string }[] = [];
for (const locale of LOCALES) {
  for (const chunk of corpus(locale)) {
    entries.push({ key: `${locale}:${chunk.id}`, text: textOf(chunk) });
  }
}

console.log(`${entries.length} extraits à vectoriser (${LOCALES.join(", ")})…`);

const vectors: Record<string, { scale: number; data: string }> = {};
for (let i = 0; i < entries.length; i += BATCH) {
  const slice = entries.slice(i, i + BATCH);
  const embeddings = await embedBatch(slice.map((e) => e.text));
  slice.forEach((entry, j) => {
    vectors[entry.key] = quantize(embeddings[j]!);
  });
  console.log(`  ${Math.min(i + BATCH, entries.length)}/${entries.length}`);
}

const payload = { model: MODEL, corpusHash: corpusHash(), vectors };
writeFileSync(OUT, `${JSON.stringify(payload, null, 0)}\n`, "utf8");

const sizeKb = Math.round(JSON.stringify(payload).length / 1024);
console.log(`Écrit : ${OUT} (${sizeKb} Ko, empreinte ${payload.corpusHash})`);
