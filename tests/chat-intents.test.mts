/**
 * Tests des trois raccourcis qui répondent sans appeler le modèle (contact, rendez-vous, site offert).
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

import { isBookingRequest, isContactRequest, isGiftRequest } from "../lib/chat/intents.ts";

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

test("site offert : une question sur l'opération est reconnue", () => {
  for (const [q, l] of [
    ["chương trình tặng web là gì?", "vi"],
    ["Trang web được tặng trị giá bao nhiêu?", "vi"],
    ["phí mở dịch vụ là bao nhiêu", "vi"],
    ["moi tuan mot trang la gi vay", "vi"],
    ["làm sao để nhận website miễn phí", "vi"],
    ["How does the free website giveaway work?", "en"],
    ["Is the free website really free?", "en"],
    ["how do I win a website", "en"],
    ["Comment gagner un site ?", "fr"],
    ["Le site offert est-il vraiment gratuit ?", "fr"],
    ["Le jeu concours, c'est quoi ?", "fr"],
    ["l'opération un site par semaine", "fr"],
  ] as const) {
    assert.ok(isGiftRequest(q, l), `manqué : ${q}`);
  }
});

test("site offert : une question de vente ne renvoie PAS vers le jeu", () => {
  // Le piège du vietnamien : « tăng » (augmenter) et « tặng » (offrir) sont identiques sans accents.
  for (const [q, l] of [
    ["Tôi muốn tăng website lên top Google", "vi"],
    ["làm sao để tăng web traffic", "vi"],
    ["khách được tặng điểm thưởng khi quét mã", "vi"],
    ["bên anh tư vấn miễn phí không?", "vi"],
    ["khi nào tôi nhận trang web", "vi"],
    ["tên miền miễn phí không?", "vi"],
    ["Gói Phát Triển giá bao nhiêu?", "vi"],
    ["Do you offer a free consultation?", "en"],
    ["Do you do a free site audit?", "en"],
    ["what is the deployment fee?", "en"],
    ["is there a setup fee for the Business pack?", "en"],
    ["Can I get a website built in a week?", "en"],
    ["Vous faites un devis gratuit ?", "fr"],
    ["Y a-t-il des frais de mise en service sur le pack Business ?", "fr"],
    ["mon salon organise un concours photo, je veux une page pour ça", "fr"],
    ["Combien de temps pour avoir mon site ?", "fr"],
  ] as const) {
    assert.equal(isGiftRequest(q, l), false, `faux positif : ${q}`);
  }
});
