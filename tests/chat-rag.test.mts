/**
 * Tests du RAG du chatbot : corpus, récupération, assemblage du prompt.
 *
 *   cd apps/vitrine && tsx --test tests/*.test.mts   (ou `pnpm test` à la racine)
 *
 * Volontairement HORS LIGNE : seul BM25 est mesuré ici, jamais le reclassement
 * sémantique, qui dépend d'une clé d'API et d'un quota. Ce que ces tests
 * garantissent, c'est donc le plancher — ce que le chatbot retrouve même sans
 * vecteurs, même sans réseau. Le reclassement ne fait que remonter.
 *
 * Les cas de recherche sont écrits dans la langue et le vocabulaire d'un
 * commerçant, pas dans ceux de l'offre : « je veux encaisser depuis le
 * téléphone », pas « VietQR ». C'est tout l'intérêt de la mesure.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";

// Imports relatifs et fichiers désignés un par un, jamais le baril
// `lib/registry/index.ts` : sous le lanceur de tests (.mts = ESM strict), un
// module qui ne fait que des `export *` ne présente que son `default`, et les
// imports nommés échouent. Le code de l'application, lui, passe par le
// bundler et garde `@/lib/registry`.
import { corpus } from "../lib/chat/kb/corpus.ts";
import { FAQ } from "../lib/chat/kb/faq.ts";
import { search, withPackCoherence } from "../lib/chat/retrieval.ts";
import { buildSystemPrompt } from "../lib/chat/context.ts";
import { ABOUT, SERVICES } from "../lib/registry/services.ts";
import { ENTERPRISE_FLOOR, PACKS } from "../lib/registry/packs.ts";
import { formatVnd } from "../lib/registry/format.ts";
import type { Locale } from "../lib/registry/types.ts";

const LOCALES: Locale[] = ["vi", "en", "fr"];

// ────────────────────────────────────────────────────────────
// Corpus
// ────────────────────────────────────────────────────────────

test("corpus : les trois langues exposent exactement les mêmes extraits", () => {
  const ids = LOCALES.map((l) => corpus(l).map((c) => c.id).sort());
  assert.deepEqual(ids[1], ids[0]);
  assert.deepEqual(ids[2], ids[0]);
});

test("corpus : aucun extrait vide, aucun identifiant en double", () => {
  for (const locale of LOCALES) {
    const chunks = corpus(locale);
    assert.equal(new Set(chunks.map((c) => c.id)).size, chunks.length, `doublon en ${locale}`);
    for (const chunk of chunks) {
      assert.ok(chunk.title.trim().length > 3, `titre vide : ${chunk.id} (${locale})`);
      assert.ok(chunk.body.trim().length > 20, `corps trop court : ${chunk.id} (${locale})`);
    }
  }
});

test("corpus : chaque pack est présent, SANS son prix, avec un renvoi vers la page des tarifs", () => {
  // Décision du 26 sept. 2026 : le chatbot ne cite plus les prix, il renvoie vers la page.
  // Un petit modèle recopiait mal les montants et en inventait ; la page, elle, lit le
  // registre et ne se trompe pas.
  for (const locale of LOCALES) {
    const packsPage = locale === "vi" ? "/packs" : `/${locale}/packs`;
    for (const pack of PACKS) {
      const chunk = corpus(locale).find((c) => c.id === `pack:${pack.id}`);
      assert.ok(chunk, `pack absent : ${pack.id} (${locale})`);
      assert.ok(chunk!.body.includes(packsPage), `renvoi vers ${packsPage} absent de ${chunk!.id} (${locale})`);
      if (pack.price !== null) {
        assert.ok(!chunk!.body.includes(formatVnd(pack.price)), `prix encore présent dans ${chunk!.id} (${locale})`);
      }
    }
  }
});

test("corpus : chaque démo publiée porte l'adresse de sa page", () => {
  // Nommer « Phin » sans dire où le voir ne sert à rien, et l'adresse brute
  // de la démo est interdite (elle porte le nom de l'hébergeur).
  for (const locale of LOCALES) {
    const cafe = corpus(locale).find((c) => c.id === "metier:cafe")!;
    assert.ok(
      /\/metiers\/quan-ca-phe\/(khoi-dau|phat-trien|cao-cap)/.test(cafe.body),
      `aucun chemin de démo en ${locale}`,
    );
  }
});

test("corpus : chaque prestation porte l'adresse de sa page", () => {
  for (const service of SERVICES) {
    const chunk = corpus("fr").find((c) => c.id === `service:${service.id}`)!;
    assert.ok(chunk.body.includes(`/services/${service.slug}`), `chemin absent : ${service.id}`);
  }
});

test("corpus : chaque entrée de la FAQ devient un extrait", () => {
  const ids = corpus("fr").map((c) => c.id);
  for (const entry of FAQ) assert.ok(ids.includes(`faq:${entry.id}`), `FAQ absente : ${entry.id}`);
});

test("corpus : rien qui ne doive être lu par un prospect", () => {
  // Noms de prestataires, technologies internes, et le mot « CMS », proscrit
  // face au client (nom commercial : « Tự sửa nội dung » / « espace de gestion »).
  const forbidden = [/\bCMS\b/, /Cloudflare/i, /Vercel/i, /Supabase/i, /\bD1\b/, /\bR2\b/, /Worker/i, /Mistral/i];
  for (const locale of LOCALES) {
    for (const chunk of corpus(locale)) {
      const text = `${chunk.title}\n${chunk.body}`;
      for (const pattern of forbidden) {
        assert.ok(!pattern.test(text), `${chunk.id} (${locale}) contient ${pattern}`);
      }
    }
  }
});

test("corpus : le déploiement n'est jamais présenté comme offert", () => {
  // Règle d'offre du 24 sept. 2026 : à l'écrit, c'est toujours « non inclus ».
  const claims = [
    /déploiement\s+(est\s+)?(offert|gratuit|inclus)/i,
    /deployment\s+(is\s+)?(free|included|waived)/i,
    /phí triển khai\s+(được\s+)?(miễn phí|tặng)/i,
  ];
  for (const locale of LOCALES) {
    for (const chunk of corpus(locale)) {
      for (const claim of claims) {
        assert.ok(!claim.test(chunk.body), `${chunk.id} (${locale}) promet un déploiement offert`);
      }
    }
  }
});

// ────────────────────────────────────────────────────────────
// Récupération — BM25 seul
// ────────────────────────────────────────────────────────────

const CASES: { q: string; locale: Locale; expect: string[] }[] = [
  // Questions directes
  { q: "Gói Khởi Đầu giá bao nhiêu?", locale: "vi", expect: ["pack:khoi-dau"] },
  { q: "combien coûte le pack Business", locale: "fr", expect: ["pack:phat-trien"] },
  { q: "how much is the premium pack", locale: "en", expect: ["pack:cao-cap"] },
  { q: "bao lâu thì xong website", locale: "vi", expect: ["faq:delai"] },
  { q: "le déploiement est inclus dans le prix ?", locale: "fr", expect: ["non-inclus"] },
  { q: "quelles options en supplément", locale: "fr", expect: ["options"] },
  // Le visiteur nomme son métier
  { q: "tôi mở quán cà phê ở Đống Đa", locale: "vi", expect: ["metier:cafe"] },
  { q: "je tiens un salon de coiffure", locale: "fr", expect: ["metier:salon"] },
  { q: "I run a homestay in the old quarter", locale: "en", expect: ["metier:homestay"] },
  { q: "vous faites quoi pour les restaurants", locale: "fr", expect: ["metier:restaurant"] },
  { q: "j'ai une clinique dentaire", locale: "fr", expect: ["metier:a-venir"] },
  // Le visiteur décrit un besoin, sans le vocabulaire de l'offre
  { q: "je veux encaisser mes clients directement depuis le téléphone", locale: "fr", expect: ["faq:paiement-en-ligne", "pack:cao-cap"] },
  { q: "khách của tôi muốn đặt bàn trước", locale: "vi", expect: ["faq:reservation", "metier:restaurant"] },
  { q: "is there anything to pay every month", locale: "en", expect: ["faq:hebergement", "non-inclus", "modifications"] },
  { q: "je veux que les touristes étrangers comprennent mon menu", locale: "fr", expect: ["faq:langues", "options"] },
  { q: "ai sẽ viết nội dung cho trang web", locale: "vi", expect: ["faq:contenu-a-fournir"] },
  { q: "mon budget est serré, le moins cher possible", locale: "fr", expect: ["pack:khoi-dau"] },
  { q: "tôi có nhiều chi nhánh ở Hà Nội", locale: "vi", expect: ["pack:doanh-nghiep"] },
  { q: "what happens if I want to change a photo next year", locale: "en", expect: ["modifications", "faq:modifier-moi-meme", "faq:garantie"] },
  // Opération « un site par semaine »
  { q: "làm sao tham gia chương trình tặng web", locale: "vi", expect: ["jeu:participer", "jeu:offert"] },
  { q: "how do I get chosen for the free site", locale: "en", expect: ["jeu:participer", "jeu:offert", "jeu:reglement"] },
  // Le visiteur emploie un mot qu'on n'écrit jamais
  { q: "CMS pour éditer le contenu moi-même", locale: "fr", expect: ["faq:modifier-moi-meme", "pack:cao-cap"] },
  // Technique — la question qui sortait des langages faux
  { q: "C'est fait avec quel langage ?", locale: "fr", expect: ["tech:socle"] },
  { q: "what technology do you use?", locale: "en", expect: ["tech:socle"] },
  { q: "web làm bằng công nghệ gì?", locale: "vi", expect: ["tech:socle"] },
  { q: "C'est du WordPress ?", locale: "fr", expect: ["tech:pas-wordpress"] },
  { q: "où sont stockées les données de mes clients ?", locale: "fr", expect: ["tech:donnees", "faq:hebergement"] },
  // Les trois prestations chiffrées après échange
  { q: "Vous faites aussi des applications mobiles ?", locale: "fr", expect: ["service:mobile"] },
  { q: "anh có làm app Android không?", locale: "vi", expect: ["service:mobile"] },
  { q: "je perds une heure par jour à recopier mes commandes", locale: "fr", expect: ["service:automatisation"] },
  { q: "can you connect my orders to KiotViet?", locale: "en", expect: ["service:automatisation"] },
  { q: "je veux un chatbot IA sur mon site", locale: "fr", expect: ["service:ia"] },
  { q: "tôi muốn trợ lý AI trả lời khách trên Zalo", locale: "vi", expect: ["service:ia"] },
];

/**
 * Reproduit exactement la sélection de `route.ts` : mêmes candidats, même
 * seuil, même plafond, même cohérence des paliers. L'assertion porte donc sur
 * ce que le modèle a RÉELLEMENT sous les yeux — pas sur une place dans un
 * classement intermédiaire, qui ne veut rien dire pour la réponse finale.
 */
function injected(q: string, locale: Locale) {
  const top = search(q, locale, 12)
    .filter((h) => h.score >= 0.25)
    .slice(0, 5)
    .map((h) => h.chunk);
  return withPackCoherence(top, locale, q).map((c) => c.id);
}

for (const { q, locale, expect } of CASES) {
  test(`recherche [${locale}] « ${q.slice(0, 46)} »`, () => {
    const ids = injected(q, locale);
    assert.ok(
      ids.some((id) => expect.includes(id)),
      `attendu l'un de ${expect.join(" | ")}, obtenu ${ids.join(", ") || "rien"}`,
    );
  });
}

test("recherche : une question sans rapport ne ramène rien de significatif", () => {
  // Le seuil de `route.ts` est 0,12 ; au-dessous, aucun extrait n'est injecté
  // et le modèle n'a pas de matière pour broder.
  const hits = search("quelle est la capitale du Brésil", "fr", 5).filter((h) => h.score >= 0.12);
  const ids = hits.map((h) => h.chunk.id);
  assert.ok(ids.length <= 2, `trop d'extraits pour une question hors-sujet : ${ids.join(", ")}`);
});

// ────────────────────────────────────────────────────────────
// Assemblage du prompt
// ────────────────────────────────────────────────────────────

test("prompt : la liste des packs est présente même sans extrait, SANS montant, avec le renvoi vers la page", () => {
  for (const locale of LOCALES) {
    const prompt = buildSystemPrompt(locale, []);
    const packsPage = locale === "vi" ? "/packs" : `/${locale}/packs`;
    assert.ok(prompt.includes(packsPage), `renvoi vers ${packsPage} absent du prompt (${locale})`);
    for (const pack of PACKS) {
      assert.ok(prompt.includes(pack.gridName[locale]), `pack absent de la liste (${locale}) : ${pack.id}`);
      if (pack.price !== null) assert.ok(!prompt.includes(formatVnd(pack.price)), `prix dans le prompt (${locale}) : ${pack.id}`);
    }
  }
});

test("prompt : les extraits récupérés sont injectés, les règles restent en dernier", () => {
  const chunks = search("combien coûte le pack Business", "fr", 3).map((h) => h.chunk);
  assert.ok(chunks.length > 0);
  const prompt = buildSystemPrompt("fr", chunks);
  for (const chunk of chunks) assert.ok(prompt.includes(chunk.title), `extrait absent : ${chunk.id}`);
  // Les règles passent après les extraits : c'est ce qui résiste à une consigne
  // glissée par un visiteur dans sa question.
  assert.ok(prompt.lastIndexOf("RÈGLES") > prompt.indexOf(chunks[0]!.title));
});

test("prompt : le RAG divise la taille du prompt par deux au moins", () => {
  // Injecter tout le corpus ferait un prompt de 32 000 caractères à chaque
  // message. La version récupérée tient entre 6 000 et 15 000 : le haut de la
  // fourchette est atteint sur les questions de paliers, où les quatre fiches
  // entrent ensemble, argumentaire compris.
  //
  // La borne a monté de 14 000 à 18 000 le jour où l'assistant est devenu
  // commercial : méthode de vente dans le prompt (~2 100 caractères), et
  // argumentaire attaché à chaque fiche de palier. Une question qui nomme un
  // métier ou un palier coûte désormais ~16 500 caractères contre ~11 000 —
  // c'est le prix d'une recommandation argumentée plutôt que d'une liste.
  //
  // Ce que ça ne touche pas : une question de FAQ reste à ~6 400, et la
  // majorité d'entre elles ne déclenche aucun appel (cache, réponse directe).
  // L'invariant qui compte — rester sous la moitié du corpus complet — tient
  // toujours et est vérifié juste en dessous.
  const everything = buildSystemPrompt("fr", corpus("fr")).length;
  const chunks = withPackCoherence(
    search("je veux vendre en ligne avec livraison", "fr", 12)
      .filter((h) => h.score >= 0.25)
      .slice(0, 5)
      .map((h) => h.chunk),
    "fr",
  );
  const size = buildSystemPrompt("fr", chunks).length;
  assert.ok(size < 18_000, `prompt de ${size} caractères`);
  assert.ok(size < everything / 2, `${size} n'est pas la moitié de ${everything}`);
});

// ────────────────────────────────────────────────────────────
// Cohérence de l'escalier : paliers de sites et prestations
// ────────────────────────────────────────────────────────────

test("prestations : les planchers s'insèrent dans la grille sans la contredire", () => {
  // L'escalier voulu, relevé sur le marché de Hanoi en septembre 2026 :
  //   4,9 (site) → 9,9 (automatisation) → 11,9 (site) → 19,9 (IA)
  //   → 24,9 (site) → 49,9 (app) → 60 (Doanh Nghiệp)
  // Un prix qui sortirait de cet ordre casserait l'argument de vente : une
  // automatisation plus chère qu'un site Business, ou une app moins chère
  // qu'un site Premium, ne se défend pas en rendez-vous.
  const floor = (id: string) => SERVICES.find((s) => s.id === id)!.floor;
  const pack = (id: string) => PACKS.find((p) => p.id === id)!.price!;

  assert.ok(floor("automatisation") > pack("khoi-dau"), "automatisation sous le site Starter");
  assert.ok(floor("automatisation") < pack("phat-trien"), "automatisation au-dessus du site Business");
  assert.ok(floor("ia") > pack("phat-trien"), "IA sous le site Business");
  assert.ok(floor("ia") < pack("cao-cap"), "IA au-dessus du site Premium");
  assert.ok(floor("mobile") > pack("cao-cap"), "app mobile sous le site Premium");
  assert.ok(floor("mobile") < ENTERPRISE_FLOOR, "app mobile au-dessus du plancher Doanh Nghiệp");
});

test("prestations : aucun plancher ne descend sous le repère du marché local", () => {
  // Repères relevés (README) : app simple à partir de 35 M₫ chez les agences,
  // chatbot sur mesure à partir de 125 M₫, et ~900 k₫ l'heure de développeur
  // confirmé. On ne s'aligne pas dessus, mais on ne descend pas non plus à un
  // niveau qui ferait passer la prestation pour un gadget.
  const floor = (id: string) => SERVICES.find((s) => s.id === id)!.floor;
  assert.ok(floor("mobile") >= 35_000_000, "app mobile sous le premier prix du marché");
  assert.ok(floor("ia") >= 15_000_000, "IA au niveau d'un abonnement SaaS générique");
  assert.ok(floor("automatisation") >= 8 * 900_000, "automatisation sous huit heures de travail");
});

// ────────────────────────────────────────────────────────────
// Formules, cas concrets et calendrier propre à chaque prestation
// ────────────────────────────────────────────────────────────

test("prestations : formules du plus simple au plus large, plancher dérivé de la première", () => {
  for (const service of SERVICES) {
    assert.ok(service.tiers.length >= 3, `${service.id} : moins de trois formules`);
    assert.equal(service.floor, service.tiers[0].floor, `${service.id} : plancher recopié, pas dérivé`);
    assert.equal(service.monthly, service.tiers[0].monthly, `${service.id} : entretien recopié, pas dérivé`);
    for (let i = 1; i < service.tiers.length; i++) {
      assert.ok(
        service.tiers[i].floor > service.tiers[i - 1].floor,
        `${service.id} : la formule « ${service.tiers[i].id} » n'est pas plus chère que la précédente`,
      );
    }
  }
});

test("prestations : chacune montre des cas variés et un calendrier en quatre étapes", () => {
  for (const service of SERVICES) {
    assert.ok(service.cases.length >= 4, `${service.id} : moins de quatre cas concrets`);
    assert.equal(service.process.length, 4, `${service.id} : le calendrier n'a pas quatre étapes`);
    // Des secteurs distincts : quatre variantes du même café ne « touchent pas tout le monde ».
    const sectors = new Set(service.cases.map((c) => c.sector.fr));
    assert.equal(sectors.size, service.cases.length, `${service.id} : deux cas dans le même secteur`);
  }
});

test("prestations : le « 7 jours » des sites n'apparaît sous aucune prestation", () => {
  // Le pied de page des sites promet sept jours ; une application ou une
  // automatisation ne se livre pas en sept jours. Le calendrier de chaque
  // prestation, ses délais et ceux de ses formules ne doivent pas le recopier.
  const sevenDays = /\b7\s*(ngày|days|jours)\b|\bsept jours\b|\bseven days\b/i;
  for (const service of SERVICES) {
    const texts = [
      ...LOCALES.map((l) => service.leadTime[l]),
      ...service.tiers.flatMap((t) => LOCALES.map((l) => t.leadTime[l])),
      ...service.process.flatMap((s) => LOCALES.flatMap((l) => [s.title[l], s.when[l], s.detail[l]])),
    ];
    for (const text of texts) assert.ok(!sevenDays.test(text), `${service.id} promet 7 jours : « ${text} »`);
  }
});

test("prestations : les formules restent sous le premier prix des agences de Hanoi", () => {
  // Relevé de septembre 2026 (README) : chatbot sur mesure dès 125 M₫, app dont
  // l'agence remet le code dès 150 M₫, déploiement d'automatisation complexe
  // jusqu'à 50 M₫. C'est l'argument de vente : on ne le perd pas en douce en
  // relevant une formule au-dessus de ce que facture une agence.
  const top = (id: string) => Math.max(...SERVICES.find((s) => s.id === id)!.tiers.map((t) => t.floor));
  assert.ok(top("ia") < 125_000_000, "IA : une formule dépasse le premier prix d'un chatbot sur mesure");
  assert.ok(top("mobile") < 150_000_000, "app : une formule atteint le prix où les agences remettent le code");
  assert.ok(top("automatisation") <= 50_000_000, "automatisation : une formule dépasse un déploiement complexe");
});

test("corpus : chaque prestation porte ses formules, SANS leurs prix, avec un renvoi vers sa page", () => {
  for (const locale of LOCALES) {
    for (const service of SERVICES) {
      const body = corpus(locale).find((c) => c.id === `service:${service.id}`)!.body;
      const page = locale === "vi" ? `/services/${service.slug}` : `/${locale}/services/${service.slug}`;
      assert.ok(body.includes(page), `renvoi vers ${page} absent (${locale})`);
      for (const tier of service.tiers) {
        assert.ok(body.includes(tier.name[locale]), `${service.id}/${tier.id} absente en ${locale}`);
        assert.ok(!body.includes(formatVnd(tier.floor)), `prix de ${service.id}/${tier.id} encore présent en ${locale}`);
        if (tier.monthly) assert.ok(!body.includes(formatVnd(tier.monthly)), `mensualité de ${service.id}/${tier.id} encore présente en ${locale}`);
      }
    }
  }
});

test("prompt : les prestations ne sont plus réservées à qui a acheté un site chez nous", () => {
  // La règle d'origine disait « vendues APRÈS un site, jamais à la place » : elle
  // empêchait de proposer un chatbot à une clinique ou un exportateur qui a déjà
  // son site. Elle a été remplacée ; ce test empêche son retour.
  for (const locale of LOCALES) {
    const prompt = buildSystemPrompt(locale, []);
    assert.ok(!/APRÈS un site|AFTER a site|bán SAU website/.test(prompt), `ancienne règle « après un site » en ${locale}`);
  }
});

test("prestations : chaque visuel référencé existe dans public/vitrine, avec un alt dans les trois langues", () => {
  // Une image renommée ou oubliée ne casse rien à la compilation : la page
  // affiche un carré vide. Ce test le rattrape avant la mise en ligne.
  const exists = (file: string) => existsSync(new URL(`../public/vitrine/${file}`, import.meta.url));
  assert.ok(exists(`${ABOUT.image}.webp`), `${ABOUT.image}.webp absent de public/vitrine/`);
  for (const locale of LOCALES) assert.ok(ABOUT.alt[locale].trim() && ABOUT.text[locale].trim(), `bloc « qui travaille avec vous » incomplet en ${locale}`);
  for (const service of SERVICES) {
    const files = [
      `${service.card}.webp`,
      `${service.hero.image}.webp`,
      ...(service.hero.video ? [`${service.hero.image}.mp4`, `${service.hero.image}.webm`] : []),
      `${service.banner.image}.webp`,
      ...service.cases.map((c) => `${c.image}.webp`),
      ...service.process.flatMap((step) => (step.image ? [`${step.image}.webp`] : [])),
      ...(service.proof?.items.map((item) => `${item.image}.webp`) ?? []),
    ];
    for (const file of files) assert.ok(exists(file), `${service.id} : ${file} absent de public/vitrine/`);
    for (const visual of [service.hero, service.banner, ...(service.proof?.items ?? [])]) {
      for (const locale of LOCALES) {
        assert.ok(visual.alt[locale]?.trim(), `${service.id} : alt vide en ${locale} (${visual.image})`);
      }
    }
  }
});

test("corpus : la FAQ de chaque prestation est lue par l'assistant, mot pour mot", () => {
  // Régression : la page affichait « on peut mettre le chatbot sur un site qui n'est pas
  // de Neuraweb » quand l'assistant, qui n'avait pas lu cette FAQ, répondait le contraire.
  // La page et le chatbot doivent dire la même chose : une seule source, deux lecteurs.
  for (const locale of LOCALES) {
    for (const service of SERVICES) {
      const body = corpus(locale).find((c) => c.id === `service:${service.id}`)!.body;
      for (const item of service.faq) {
        assert.ok(body.includes(item.a[locale]), `FAQ « ${item.q[locale]} » absente de ${service.id} en ${locale}`);
      }
    }
  }
});

test("corpus : aucun prix de pack, d'option ou de prestation nulle part dans ce que lit le chatbot", () => {
  // Le garde-fou ne vaut que si les extraits ne portent plus de prix de Neuraweb : un montant
  // présent dans un extrait serait « autorisé » dans la réponse. Sont exclus, parce qu'ils
  // portent légitimement des montants : l'opération « un site par semaine » (frais de 50 USD)
  // et les estimations de tiers (nom de domaine, infrastructure).
  const NEURAWEB_PRICES = [
    ...PACKS.flatMap((p) => [p.price, p.priceWithMaintenance, p.monthly, p.yearlyMaintenance]),
    ENTERPRISE_FLOOR,
    ...SERVICES.flatMap((s) => s.tiers.flatMap((t) => [t.floor, t.monthly])),
  ].filter((n): n is number => typeof n === "number" && n > 0);
  const exempt = (id: string) => id.startsWith("gift") || id.startsWith("jeu") || id === "non-inclus" || id.startsWith("faq:") || id === "tech" || id.startsWith("tech:");
  for (const locale of LOCALES) {
    for (const chunk of corpus(locale)) {
      if (exempt(chunk.id)) continue;
      for (const amount of NEURAWEB_PRICES) {
        assert.ok(!chunk.body.includes(formatVnd(amount)), `${chunk.id} (${locale}) contient ${formatVnd(amount)}`);
      }
    }
  }
});

test("corpus : le montant des frais de déploiement n'est plus écrit dans l'extrait « non inclus »", () => {
  for (const locale of LOCALES) {
    const body = corpus(locale).find((c) => c.id === "non-inclus")!.body;
    assert.ok(!body.includes("1.300.000"), `frais de déploiement chiffrés (${locale})`);
    assert.ok(body.includes("/packs") || body.includes(`/${locale}/packs`), `renvoi vers la page absent (${locale})`);
  }
});
