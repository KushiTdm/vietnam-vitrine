/**
 * Les liens d'une réponse, construits par le serveur — jamais par le modèle.
 *
 * Pourquoi : mesuré sur quatre formulations vietnamiennes, le modèle ne
 * reproduisait le chemin d'une démo qu'une fois sur quatre. Il le remplaçait
 * par un mot (« → Đây », « → đường dẫn ») ou fabriquait un slug à partir du
 * nom du commerce. Deux tentatives de correction par la consigne — changer le
 * format, interdire explicitement la substitution — ont fait passer le score
 * de 1/4 à 0/4. Un modèle de trois milliards de paramètres ne recopie pas de
 * manière fiable une chaîne technique dans une langue qu'il maîtrise mal.
 *
 * Donc on cesse de le lui demander. Les extraits récupérés disent DE QUOI on
 * parle ; ce module en déduit les liens depuis le registre, et le widget les
 * affiche sous la réponse. Le résultat ne dépend plus de la langue, ni de
 * l'humeur du modèle : si la page métier du café est dans le contexte, les
 * trois démos de café sont proposées, en vietnamien comme en français.
 */

import { DEMOS, PACKS, SERVICES, VERTICALS, tr, type Locale } from "@/lib/registry";
import type { Chunk } from "./kb/types";

export type ChatLink = { label: string; href: string };

/** Au-delà, la réponse se transforme en annuaire. */
const MAX_LINKS = 4;

function path(p: string, locale: Locale): string {
  if (locale === "vi") return p;
  return p === "/" ? `/${locale}` : `/${locale}${p}`;
}

/**
 * Rang au-delà duquel un extrait de métier ne déclenche plus ses démos.
 *
 * Les quatre paliers entrent dans le contexte dès qu'une recommandation
 * s'annonce, et entraînent souvent une page métier avec eux. Sans ce seuil,
 * une simple question de prix — « gói Phát Triển giá bao nhiêu » — proposait
 * trois démos de café à quelqu'un qui n'avait jamais parlé de café.
 * On ne propose les démos d'un métier que si ce métier est vraiment le sujet.
 */
const TRADE_RANK_LIMIT = 2;

/**
 * Les liens utiles pour cette sélection d'extraits, dans l'ordre où ils
 * servent : la démo du métier dont on parle d'abord, la prestation ensuite,
 * la grille en dernier recours.
 *
 * `chunks` doit être la liste CLASSÉE PAR PERTINENCE (avant l'ajout des
 * paliers par cohérence) : c'est le rang qui dit si le métier est le sujet.
 */
export function linksFor(chunks: Chunk[], locale: Locale): ChatLink[] {
  const links: ChatLink[] = [];
  const seen = new Set<string>();

  const push = (label: string, href: string) => {
    if (seen.has(href) || links.length >= MAX_LINKS) return;
    seen.add(href);
    links.push({ label, href });
  };

  for (const [rank, chunk] of chunks.entries()) {
    // ── Démos du métier évoqué ────────────────────────────────────────────
    if (chunk.topic === "metier" && chunk.id.startsWith("metier:") && rank < TRADE_RANK_LIMIT) {
      const vertical = VERTICALS.find((v) => v.id === chunk.id.slice("metier:".length));
      if (!vertical) continue;

      for (const demo of DEMOS) {
        if (demo.vertical !== vertical.id || demo.status !== "live") continue;
        const pack = PACKS.find((p) => p.id === demo.pack);
        push(
          `${demo.businessName} · ${pack ? tr(pack.gridName, locale) : demo.pack}`,
          path(`/metiers/${vertical.slug}/${demo.pack}`, locale),
        );
      }
    }

    // ── Page d'une prestation ─────────────────────────────────────────────
    if (chunk.topic === "service" && chunk.id.startsWith("service:")) {
      const service = SERVICES.find((s) => s.id === chunk.id.slice("service:".length));
      if (service) push(tr(service.name, locale), path(`/services/${service.slug}`, locale));
    }
  }

  // ── La grille, quand on a parlé paliers sans rien d'autre à montrer ────
  if (!links.length && chunks.some((c) => c.topic === "pack")) {
    push(
      { vi: "Bảng giá", en: "Pricing", fr: "Tarifs" }[locale],
      path("/packs", locale),
    );
  }

  return links;
}
