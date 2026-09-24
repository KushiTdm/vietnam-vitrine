/**
 * État du chatbot — `GET /api/chat/health`.
 *
 * Répond à la seule question qu'on se pose quand le widget dit « assistant
 * indisponible » : qu'est-ce qui manque ? Sans ce point de contrôle, la
 * réponse se cherche dans les journaux de la plateforme, et on finit par
 * supposer au lieu de vérifier.
 *
 * N'expose AUCUN secret : des booléens, des noms de modèles et des compteurs.
 * Jamais une clé, jamais une URL de base, jamais un fragment de l'une ou de
 * l'autre — c'est la condition pour que cette route puisse rester ouverte.
 */

import { NextResponse, type NextRequest } from "next/server";
import type { Locale } from "@/lib/registry";
import { cacheSize } from "@/lib/chat/cache";
import { semanticAvailable } from "@/lib/chat/embeddings";
import { rateLimit, saturationRemaining } from "@/lib/chat/guard";
import { corpus } from "@/lib/chat/kb/corpus";
import { supabaseReady } from "@/lib/supabase/rest";

export const dynamic = "force-dynamic";

const LOCALES: Locale[] = ["vi", "en", "fr"];

/**
 * Appelle réellement le fournisseur, au plus petit coût possible (un jeton),
 * et renvoie SON code de retour.
 *
 * C'est la différence entre « une erreur est survenue » et « 401 Invalid API
 * Key » : une clé configurée n'est pas une clé valide, et rien d'autre ne
 * permet de faire la différence depuis l'extérieur. Le message du fournisseur
 * est repris tel quel — il ne contient jamais la clé, seulement un motif.
 */
async function pingModel(): Promise<{ ok: boolean; status: number | null; detail: string | null }> {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) return { ok: false, status: null, detail: "clé absente" };

  try {
    const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: process.env.CHAT_MODEL ?? "ministral-3b-latest",
        messages: [{ role: "user", content: "ping" }],
        max_tokens: 1,
      }),
      signal: AbortSignal.timeout(12_000),
    });
    if (response.ok) return { ok: true, status: response.status, detail: null };
    return {
      ok: false,
      status: response.status,
      detail: (await response.text().catch(() => "")).slice(0, 200) || null,
    };
  } catch (error) {
    // Un dépassement de délai remonte ici : c'est un diagnostic en soi.
    return { ok: false, status: null, detail: (error as Error)?.name ?? "échec réseau" };
  }
}

export async function GET(request: NextRequest) {
  const modelConfigured = Boolean(process.env.MISTRAL_API_KEY);

  // `?ping=1` consomme un appel : plafonné pour que cette route ouverte ne
  // devienne pas un moyen de vider le quota.
  const wantsPing = new URL(request.url).searchParams.get("ping") === "1";
  const pingAllowed = rateLimit("health-ping", 5, 60_000).allowed;
  const ping = wantsPing && pingAllowed ? await pingModel() : null;

  return NextResponse.json({
    /** Sans clé, le widget renvoie tout le monde vers le bouton de contact. */
    model: {
      configured: modelConfigured,
      name: process.env.CHAT_MODEL ?? "ministral-3b-latest",
      note: modelConfigured
        ? null
        : "MISTRAL_API_KEY absente de cet environnement. Sur Vercel : Settings → Environment Variables, puis REDÉPLOYER — une variable ajoutée ne s'applique pas au déploiement déjà en ligne.",
      /** Ajouter `?ping=1` pour vérifier que la clé est VALIDE, pas seulement présente. */
      ping: wantsPing
        ? ping ?? { ok: false, status: null, detail: "trop de tests, réessayez dans une minute" }
        : "ajouter ?ping=1 pour tester la clé auprès du fournisseur",
    },
    /** Le suivi dans l'app mobile. Facultatif : son absence ne casse rien. */
    tracking: {
      configured: supabaseReady(),
      note: supabaseReady() ? null : "SUPABASE_URL et/ou SUPABASE_SERVICE_ROLE_KEY absentes : aucune conversation n'est journalisée.",
    },
    /** Reclassement sémantique : actif seulement si les vecteurs sont à jour. */
    semantic: {
      available: semanticAvailable(),
      note: semanticAvailable()
        ? null
        : "Inactif : clé absente, vecteurs non générés, ou empreinte du corpus différente (pnpm rag:embeddings). La recherche lexicale prend le relais.",
    },
    corpus: Object.fromEntries(LOCALES.map((l) => [l, corpus(l).length])),
    /** Secondes restantes avant de pouvoir rappeler le modèle. 0 = disponible. */
    cooldownSeconds: saturationRemaining(),
    cachedAnswers: cacheSize(),
  });
}
