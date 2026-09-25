/**
 * Tests des liens proposés sous une réponse (`lib/chat/links.ts`).
 *
 *   cd apps/vitrine && tsx --test tests/*.test.mts
 *
 * Ces liens existent parce que le modèle ne sait pas recopier un chemin en
 * vietnamien : mesuré sur quatre formulations, il ne le reproduisait qu'une
 * fois sur quatre, et les corrections par la consigne ont fait tomber le
 * score à zéro. Ils sont donc construits ici, à partir du registre — et ce
 * fichier vérifie qu'ils ne dépendent plus ni de la langue ni du modèle.
 */
import { test } from "node:test";
import assert from "node:assert/strict";

import { linksFor } from "../lib/chat/links.ts";
import { corpus } from "../lib/chat/kb/corpus.ts";
import type { Locale } from "../lib/registry/types.ts";

const LOCALES: Locale[] = ["vi", "en", "fr"];
const chunk = (id: string, locale: Locale) => corpus(locale).find((c) => c.id === id)!;

test("métier en tête : les démos de ce métier sont proposées, dans les trois langues", () => {
  for (const locale of LOCALES) {
    const links = linksFor([chunk("metier:cafe", locale)], locale);
    assert.ok(links.length >= 2, `trop peu de liens en ${locale}`);
    for (const link of links) {
      assert.match(link.href, /\/metiers\/quan-ca-phe\/[\w-]+$/, `chemin douteux : ${link.href}`);
      assert.ok(link.label.trim().length > 2, "libellé vide");
    }
  }
});

test("les chemins portent le préfixe de langue, sauf en vietnamien", () => {
  assert.ok(linksFor([chunk("metier:cafe", "vi")], "vi")[0]!.href.startsWith("/metiers/"));
  assert.ok(linksFor([chunk("metier:cafe", "fr")], "fr")[0]!.href.startsWith("/fr/metiers/"));
  assert.ok(linksFor([chunk("metier:cafe", "en")], "en")[0]!.href.startsWith("/en/metiers/"));
});

test("métier relégué : une question de prix ne propose pas de démos au hasard", () => {
  // Les quatre paliers entrent dès qu'une recommandation s'annonce, et
  // entraînent souvent une page métier avec eux. Proposer trois démos de café
  // à qui demande seulement un prix n'a aucun sens.
  const locale: Locale = "vi";
  const chunks = [
    chunk("pack:khoi-dau", locale),
    chunk("pack:phat-trien", locale),
    chunk("escalier", locale),
    chunk("metier:cafe", locale),
  ];
  const links = linksFor(chunks, locale);
  assert.ok(
    !links.some((l) => l.href.includes("/metiers/")),
    `démos proposées à tort : ${links.map((l) => l.href).join(", ")}`,
  );
  assert.equal(links.length, 1, "la grille de prix devrait être le seul lien");
});

test("prestation : sa page est proposée", () => {
  const links = linksFor([chunk("service:ia", "fr")], "fr");
  assert.deepEqual(
    links.map((l) => l.href),
    ["/fr/services/tich-hop-ai"],
  );
});

test("jamais plus de quatre liens, jamais deux fois le même", () => {
  const locale: Locale = "vi";
  const chunks = [
    chunk("metier:cafe", locale),
    chunk("metier:restaurant", locale),
    chunk("metier:cafe", locale),
  ];
  const links = linksFor(chunks, locale);
  assert.ok(links.length <= 4, `${links.length} liens`);
  assert.equal(new Set(links.map((l) => l.href)).size, links.length, "doublon");
});

test("aucun extrait exploitable : aucun lien inventé", () => {
  assert.deepEqual(linksFor([chunk("faq:domaine", "fr")], "fr"), []);
});
