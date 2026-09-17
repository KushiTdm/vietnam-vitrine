import { FEATURES } from "./features";
import { PACKS } from "./packs";
import { DEMOS } from "./demos";
import { VERTICALS, featuresOf } from "./verticals";
import type { Demo, Feature, FeatureValue, PackId, Vertical, VerticalId } from "./types";

/** Les démos d'un métier, dans l'ordre des paliers. */
export function demosFor(vertical: VerticalId): Demo[] {
  const order = PACKS.map((p) => p.id);
  return DEMOS.filter((d) => d.vertical === vertical).sort(
    (a, b) => order.indexOf(a.pack) - order.indexOf(b.pack),
  );
}

/** Les démos d'un palier, tous métiers confondus. */
export function demosOf(pack: PackId): Demo[] {
  const order = VERTICALS.map((v) => v.id);
  return DEMOS.filter((d) => d.pack === pack).sort(
    (a, b) => order.indexOf(a.vertical) - order.indexOf(b.vertical),
  );
}

/**
 * Une démo est publiable quand elle est réellement prête à être montrée en rendez-vous.
 * Une maquette encore en français ne l'est pas : elle reste dans le registre pour que
 * les audits la voient, mais la vitrine ne l'affiche pas.
 */
export function isPublic(demo: Demo): boolean {
  return demo.status === "live";
}

/** La démo principale d'une case — la première déclarée. */
export function demoAt(vertical: VerticalId, pack: PackId): Demo | undefined {
  return DEMOS.find((d) => d.vertical === vertical && d.pack === pack);
}

/** Toutes les démos d'une case : plusieurs directions artistiques au même palier. */
export function demosAt(vertical: VerticalId, pack: PackId): Demo[] {
  return DEMOS.filter((d) => d.vertical === vertical && d.pack === pack);
}

/** Matrice applicable à un métier : globale + surcharges + extras. */
export function featuresForVertical(vertical: Vertical | VerticalId): Feature[] {
  const v = typeof vertical === "string" ? VERTICALS.find((x) => x.id === vertical) : vertical;
  if (!v) return FEATURES;
  return featuresOf(v, FEATURES);
}

export function valueOf(vertical: VerticalId, pack: PackId, featureId: string): FeatureValue {
  const f = featuresForVertical(vertical).find((x) => x.id === featureId);
  return f ? f.values[pack] : false;
}

export function isIncluded(vertical: VerticalId, pack: PackId, featureId: string): boolean {
  return valueOf(vertical, pack, featureId) !== false;
}

/** Ce que ce palier apporte de plus que le précédent, pour ce métier. */
export function gainsOver(vertical: VerticalId, pack: PackId): Feature[] {
  const order = PACKS.map((p) => p.id);
  const i = order.indexOf(pack);
  if (i <= 0) return featuresForVertical(vertical).filter((f) => f.values[pack] !== false);
  const previous = order[i - 1];
  return featuresForVertical(vertical).filter(
    (f) => f.values[pack] !== false && f.values[previous] === false,
  );
}

/** Fonctionnalités incluses / absentes pour un couple métier × palier. */
export function splitFeatures(vertical: VerticalId, pack: PackId) {
  const all = featuresForVertical(vertical);
  return {
    included: all.filter((f) => f.values[pack] !== false),
    missing: all.filter((f) => f.values[pack] === false),
  };
}

/** Paliers d'un métier, avec la démo associée quand elle existe. */
export function ladderFor(
  vertical: VerticalId,
): { pack: PackId; demo: Demo | undefined; demos: Demo[] }[] {
  const v = VERTICALS.find((x) => x.id === vertical);
  if (!v) return [];
  return v.packs.map((pack) => ({
    pack,
    demo: demoAt(vertical, pack),
    demos: demosAt(vertical, pack),
  }));
}

/*
 * Sélecteurs publics. La vitrine n'utilise QUE ceux-ci : leur nom dit qu'ils
 * excluent les démos non publiables, ce que les sélecteurs bruts ne font pas.
 * Les audits, eux, veulent tout voir et gardent `demosFor` / `demosOf` / `demosAt`.
 */

/** Les démos publiables d'un métier. */
export function publicDemosFor(vertical: VerticalId): Demo[] {
  return demosFor(vertical).filter(isPublic);
}

/** Les démos publiables d'un palier, tous métiers confondus. */
export function publicDemosOf(pack: PackId): Demo[] {
  return demosOf(pack).filter(isPublic);
}

/** Les variantes publiables d'une case (métier × palier). */
export function publicDemosAt(vertical: VerticalId, pack: PackId): Demo[] {
  return demosAt(vertical, pack).filter(isPublic);
}

/** La démo publiable principale d'une case, s'il y en a une. */
export function publicDemoAt(vertical: VerticalId, pack: PackId): Demo | undefined {
  return publicDemosAt(vertical, pack)[0];
}

/**
 * URL à ouvrir pour une démo : `demo.url` explicite, sinon `NEXT_PUBLIC_DEMOS_BASE_URL`
 * (déploiement vitrine séparé des démos), sinon same-origin (un seul projet Next).
 * Variable *publique*, inlinée au build : à définir uniquement sur le déploiement
 * Vercel de la vitrine, jamais sur le Worker Cloudflare qui sert déjà les démos
 * en same-origin.
 */
export function demoUrl(demo: Demo, opts?: { embed?: boolean; locale?: string }): string {
  const base = demo.url ?? process.env.NEXT_PUBLIC_DEMOS_BASE_URL ?? "";
  const params = new URLSearchParams();
  if (opts?.embed) params.set("embed", "1");
  if (opts?.locale) params.set("lang", opts.locale);
  const q = params.toString();
  return `${base}${demo.path}${q ? `?${q}` : ""}`;
}
