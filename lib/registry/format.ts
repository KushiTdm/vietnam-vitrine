import type { L10n, Locale } from "./types";

/** 4900000 → « 4.900.000₫ ». Format vietnamien, déterministe serveur et client. */
export function formatVnd(n: number): string {
  return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "₫";
}

/** Taux indicatif affiché à côté du prix en ₫, pour les prospects étrangers. */
export const VND_PER_USD = 25_400;

export function approxUsd(n: number): string {
  return `~$${Math.round(n / VND_PER_USD).toLocaleString("en-US")}`;
}

/** Sélection d'une chaîne localisée avec repli VI. */
export function tr(value: L10n, locale: Locale): string {
  return value[locale] ?? value.vi;
}
