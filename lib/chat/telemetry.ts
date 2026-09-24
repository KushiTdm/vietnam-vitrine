/**
 * Journalisation du chatbot vers Supabase — le suivi de Hanoi dans l'app
 * mobile passe par ici.
 *
 * Deux tables, partagées avec neuraweb.fr et partitionnées par la colonne
 * `site` (migration `site_partition_france_vietnam`) :
 *   - `chat_logs`            : une ligne par échange visiteur ↔ assistant ;
 *   - `chat_security_events` : injections, sondes, trolling, débit dépassé.
 *
 * Tout est en « lance et oublie » : le visiteur attend une réponse du
 * chatbot, jamais une écriture en base. Une base injoignable ne dégrade rien
 * d'autre que le suivi.
 */

import { insert } from "@/lib/supabase/rest";

/**
 * `contact`, `faq` et `cached` marquent les réponses servies SANS appel au
 * modèle : coordonnées renvoyées vers le bouton de la page, texte de la base
 * de connaissances servi tel quel, réponse déjà rédigée resservie. Compter
 * ces trois-là dans l'app mobile, c'est mesurer la part gratuite — la
 * métrique de coût la plus utile.
 */
export type ChatIntent = "normal" | "booking" | "qualification" | "contact" | "faq" | "cached";

export type SecurityEventType = "injection" | "probe" | "off_topic" | "rate_limit" | "blocked";
export type SecuritySeverity = "low" | "medium" | "high";

/** Un échange complet, tel qu'il apparaîtra dans l'onglet « Visiteurs ». */
export function logChat(entry: {
  sessionId: string;
  ip: string;
  lang: string;
  userMessage: string;
  assistantResponse: string;
  intent: ChatIntent;
}): void {
  insert("chat_logs", [
    {
      session_id: entry.sessionId,
      ip: entry.ip,
      lang: entry.lang,
      user_message: entry.userMessage.slice(0, 2000),
      assistant_response: entry.assistantResponse.slice(0, 4000),
      intent: entry.intent,
    },
  ]);
}

// Les événements répétitifs (un flood en cours) ne doivent pas créer une
// ligne par requête : une par IP et par type toutes les 10 minutes suffit à
// savoir ce qui se passe.
const DB_THROTTLE_MS = 10 * 60 * 1000;
const lastLogged = new Map<string, number>();

function shouldLog(key: string): boolean {
  const now = Date.now();
  const previous = lastLogged.get(key);
  if (previous && now - previous < DB_THROTTLE_MS) return false;
  lastLogged.set(key, now);
  return true;
}

export function reportSecurityEvent(event: {
  ip: string;
  sessionId: string;
  lang: string;
  eventType: SecurityEventType;
  severity: SecuritySeverity;
  userMessage?: string;
  details?: string;
}): void {
  if (!shouldLog(`${event.ip}:${event.eventType}`)) return;

  insert("chat_security_events", [
    {
      ip: event.ip,
      session_id: event.sessionId,
      lang: event.lang,
      event_type: event.eventType,
      severity: event.severity,
      user_message: event.userMessage?.slice(0, 500) ?? null,
      details: event.details?.slice(0, 500) ?? null,
    },
  ]);
}

// Purge du garde-fou de doublons, même convention que les Maps de `guard.ts`.
const cleanup = setInterval(() => {
  const now = Date.now();
  for (const [key, at] of Array.from(lastLogged.entries())) {
    if (now - at >= DB_THROTTLE_MS) lastLogged.delete(key);
  }
}, 10 * 60 * 1000);
if (typeof (cleanup as { unref?: () => void }).unref === "function") {
  (cleanup as { unref: () => void }).unref();
}
