/**
 * Tests des mécanismes de coût et de saturation du chatbot.
 *
 *   cd apps/vitrine && tsx --test tests/*.test.mts   (ou `pnpm test` à la racine)
 *
 * Ce qui est vérifié ici tient en deux promesses :
 *   1. la même question ne se paie qu'une fois — mais deux questions
 *      différentes ne se confondent jamais, même normalisées ;
 *   2. quand le fournisseur sature, la route cesse de l'appeler et sait dire
 *      au visiteur combien de temps attendre.
 */
import { test } from "node:test";
import assert from "node:assert/strict";

import { cacheSize, clearCache, getCached, setCached } from "../lib/chat/cache.ts";
import { clearSaturation, noteSaturation, saturationRemaining } from "../lib/chat/guard.ts";

// ────────────────────────────────────────────────────────────
// Cache de réponses
// ────────────────────────────────────────────────────────────

test("cache : la même question ressert la même réponse", () => {
  clearCache();
  setCached("Combien coûte le pack Business ?", "fr", "11.900.000₫", ["pack:phat-trien"]);
  const hit = getCached("Combien coûte le pack Business ?", "fr");
  assert.equal(hit?.response, "11.900.000₫");
  assert.deepEqual(hit?.sources, ["pack:phat-trien"]);
});

test("cache : casse, accents et ponctuation ne créent pas deux entrées", () => {
  clearCache();
  setCached("Combien coûte le pack Business ?", "fr", "réponse", []);
  assert.ok(getCached("combien coute le pack business", "fr"), "accents/casse");
  assert.ok(getCached("  COMBIEN COÛTE LE PACK BUSINESS !!  ", "fr"), "ponctuation");
});

test("cache : deux langues, deux entrées — jamais de réponse dans la mauvaise", () => {
  clearCache();
  setCached("combien coute le pack business", "fr", "réponse française", []);
  assert.equal(getCached("combien coute le pack business", "vi"), null);
  assert.equal(getCached("combien coute le pack business", "en"), null);
});

test("cache : deux questions différentes ne se confondent pas", () => {
  clearCache();
  setCached("combien coute le pack business", "fr", "prix business", []);
  assert.equal(getCached("combien coute le pack premium", "fr"), null);
});

test("cache : une question trop courte n'est pas mémorisée", () => {
  clearCache();
  // « et ? », « ok », « oui » dépendent entièrement de ce qui précède :
  // les resservir hors contexte donnerait une réponse absurde.
  setCached("ok", "fr", "réponse", []);
  assert.equal(cacheSize(), 0);
  assert.equal(getCached("ok", "fr"), null);
});

// ────────────────────────────────────────────────────────────
// Saturation du modèle
// ────────────────────────────────────────────────────────────

test("saturation : au repos, rien à attendre", () => {
  clearSaturation();
  assert.equal(saturationRemaining(), 0);
});

test("saturation : un 429 amont pose un refroidissement", () => {
  clearSaturation();
  const wait = noteSaturation(null);
  assert.ok(wait > 0, "une attente par défaut est retenue");
  const remaining = saturationRemaining();
  assert.ok(remaining > 0 && remaining <= wait, `attente restante incohérente : ${remaining}`);
  clearSaturation();
});

test("saturation : l'en-tête Retry-After du fournisseur est respecté", () => {
  clearSaturation();
  assert.equal(noteSaturation("90"), 90);
  clearSaturation();
});

test("saturation : une valeur fantaisiste est plafonnée à 5 minutes", () => {
  clearSaturation();
  // Sans plafond, un `Retry-After: 86400` fermerait le chat pour la journée.
  assert.equal(noteSaturation("86400"), 300);
  clearSaturation();
});

test("saturation : un en-tête illisible retombe sur l'attente par défaut", () => {
  clearSaturation();
  const wait = noteSaturation("bientôt");
  assert.ok(wait > 0 && wait <= 300);
  clearSaturation();
});
