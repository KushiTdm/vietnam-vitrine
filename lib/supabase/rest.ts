/**
 * Client Supabase minimal, sur `fetch` — pas de `@supabase/supabase-js`.
 *
 * PostgREST est une API HTTP ordinaire : pour insérer trois lignes et lire
 * deux tables, une dépendance de 150 Ko dans le bundle serverless n'apporte
 * rien. Ce fichier fait 100 lignes et ne fait jamais tomber la vitrine :
 * toute erreur est journalisée puis avalée.
 *
 * ⚠️ `SUPABASE_SERVICE_ROLE_KEY` contourne la RLS. Elle n'est lue que côté
 * serveur (jamais de préfixe `NEXT_PUBLIC_`) et n'est jamais renvoyée au
 * visiteur — `scrubResponse` la retirerait de toute façon d'une réponse.
 *
 * Toutes les écritures portent `site: 'vn'` (voir `SITE`). La base est
 * partagée avec neuraweb.fr ; sans cette colonne, les conversations et les
 * RDV de Hanoi apparaîtraient dans le suivi de l'agence française.
 */

/** Le discriminant de partition. Cette application n'écrit jamais autre chose. */
export const SITE = "vn" as const;

function config(): { url: string; key: string } | null {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return { url: url.replace(/\/+$/, ""), key };
}

/** La base est-elle configurée ? Sert à dégrader proprement, pas à tester une clé. */
export function supabaseReady(): boolean {
  return config() !== null;
}

function headers(key: string, extra?: Record<string, string>): HeadersInit {
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
    ...extra,
  };
}

/**
 * Insère des lignes, sans bloquer l'appelant ni propager d'erreur.
 *
 * Le visiteur attend une réponse du chatbot : il ne doit jamais attendre une
 * écriture de journal, ni voir une erreur parce que la base est indisponible.
 * D'où le `void` : on lance, on ne suit pas.
 */
export function insert(table: string, rows: Record<string, unknown>[]): void {
  const cfg = config();
  if (!cfg || !rows.length) return;

  void fetch(`${cfg.url}/rest/v1/${table}`, {
    method: "POST",
    headers: headers(cfg.key, { Prefer: "return=minimal" }),
    body: JSON.stringify(rows.map((row) => ({ site: SITE, ...row }))),
    signal: AbortSignal.timeout(5_000),
  })
    .then(async (response) => {
      if (!response.ok) {
        console.warn(`[supabase] insert ${table} ${response.status}`, await response.text().catch(() => ""));
      }
    })
    .catch((error) => console.warn(`[supabase] insert ${table} échoué :`, error?.message));
}

/**
 * Insère une ligne en attendant le résultat — pour ce qui doit être confirmé
 * au visiteur, comme un rendez-vous. Renvoie la ligne créée, ou l'erreur
 * PostgREST (`code` 23505 = violation d'unicité, donc créneau déjà pris).
 */
export async function insertReturning<T>(
  table: string,
  row: Record<string, unknown>,
): Promise<{ data: T | null; code?: string; message?: string }> {
  const cfg = config();
  if (!cfg) return { data: null, message: "supabase non configuré" };

  try {
    const response = await fetch(`${cfg.url}/rest/v1/${table}`, {
      method: "POST",
      headers: headers(cfg.key, { Prefer: "return=representation" }),
      body: JSON.stringify({ site: SITE, ...row }),
      signal: AbortSignal.timeout(8_000),
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      return { data: null, code: payload?.code, message: payload?.message ?? `HTTP ${response.status}` };
    }
    return { data: (Array.isArray(payload) ? payload[0] : payload) as T };
  } catch (error) {
    return { data: null, message: (error as Error)?.message };
  }
}

/**
 * Lit des lignes. `query` est une chaîne PostgREST déjà formée
 * (`select=*&date=gte.2026-09-24`) ; le filtre de site est ajouté ici pour
 * qu'aucun appelant ne puisse l'oublier.
 */
export async function select<T>(table: string, query: string): Promise<T[]> {
  const cfg = config();
  if (!cfg) return [];

  try {
    const response = await fetch(`${cfg.url}/rest/v1/${table}?site=eq.${SITE}&${query}`, {
      headers: headers(cfg.key),
      signal: AbortSignal.timeout(8_000),
    });
    if (!response.ok) {
      console.warn(`[supabase] select ${table} ${response.status}`);
      return [];
    }
    return (await response.json()) as T[];
  } catch (error) {
    console.warn(`[supabase] select ${table} échoué :`, (error as Error)?.message);
    return [];
  }
}
