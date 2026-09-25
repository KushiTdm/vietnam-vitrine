/**
 * Tests des deux raccourcis qui répondent sans appeler le modèle.
 *
 *   cd apps/vitrine && tsx --test tests/*.test.mts
 *
 * Ce qui compte ici n'est pas ce qu'ils attrapent — c'est ce qu'ils LAISSENT
 * PASSER. Un déclencheur trop large ne fait pas une réponse un peu à côté :
 * il remplace une vente par une réponse administrative, et l'échange s'arrête
 * là.
 */
import { test } from "node:test";
import assert from "node:assert/strict";

import { isBookingRequest, isContactRequest } from "../lib/chat/intents.ts";

test("contact : une vraie demande de coordonnées est reconnue", () => {
  for (const [q, l] of [
    ["Vous avez un numéro de téléphone ?", "fr"],
    ["je peux vous contacter comment", "fr"],
    ["what is your phone number", "en"],
    ["cho mình xin số zalo", "vi"],
    ["số điện thoại của shop là gì", "vi"],
  ] as const) {
    assert.ok(isContactRequest(q, l), `manqué : ${q}`);
  }
});

test("contact : nommer un canal ne suffit pas à déclencher le raccourci", () => {
  // Cas observé : « commandes Zalo » renvoyait le bouton de contact au lieu de
  // vendre l'automatisation. Zalo est dans une phrase commerciale sur deux ici.
  for (const [q, l] of [
    ["Je perds une heure chaque soir à recopier mes commandes Zalo", "fr"],
    ["mes clients réservent par Zalo, je veux automatiser", "fr"],
    ["I want an assistant answering on Zalo OA", "en"],
    ["khách đặt món qua Zalo, tôi muốn tự động hóa", "vi"],
    ["je veux un email au nom de mon domaine", "fr"],
    ["tôi muốn có email theo tên miền", "vi"],
  ] as const) {
    assert.equal(isContactRequest(q, l), false, `faux positif : ${q}`);
  }
});

test("rendez-vous : une demande explicite est reconnue", () => {
  for (const [q, l] of [
    ["je voudrais prendre rendez-vous", "fr"],
    ["can we book a meeting next week", "en"],
    ["mình muốn đặt lịch hẹn", "vi"],
  ] as const) {
    assert.ok(isBookingRequest(q, l), `manqué : ${q}`);
  }
});

test("rendez-vous : une question de prix n'ouvre pas le calendrier", () => {
  for (const [q, l] of [
    ["combien coûte le pack Business", "fr"],
    ["how long does delivery take", "en"],
    ["gói Phát Triển giá bao nhiêu", "vi"],
  ] as const) {
    assert.equal(isBookingRequest(q, l), false, `faux positif : ${q}`);
  }
});
