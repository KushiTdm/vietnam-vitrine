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

import { NextResponse } from "next/server";
import type { Locale } from "@/lib/registry";
import { cacheSize } from "@/lib/chat/cache";
import { semanticAvailable } from "@/lib/chat/embeddings";
import { saturationRemaining } from "@/lib/chat/guard";
import { corpus } from "@/lib/chat/kb/corpus";
import { supabaseReady } from "@/lib/supabase/rest";

export const dynamic = "force-dynamic";

const LOCALES: Locale[] = ["vi", "en", "fr"];

export function GET() {
  const modelConfigured = Boolean(process.env.MISTRAL_API_KEY);

  return NextResponse.json({
    /** Sans clé, le widget renvoie tout le monde vers le bouton de contact. */
    model: {
      configured: modelConfigured,
      name: process.env.CHAT_MODEL ?? "ministral-3b-latest",
      note: modelConfigured
        ? null
        : "MISTRAL_API_KEY absente de cet environnement. Sur Vercel : Settings → Environment Variables, puis REDÉPLOYER — une variable ajoutée ne s'applique pas au déploiement déjà en ligne.",
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
