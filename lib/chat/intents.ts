/**
 * Détection d'intention — les trois raccourcis qui répondent sans appeler le
 * modèle : « donnez-moi vos coordonnées », « je veux un rendez-vous » et une
 * question sur le site offert (opération « un site par semaine »).
 *
 * Sorti de la route pour être testable : c'est de la logique métier, pas de
 * la plomberie HTTP, et une liste de mots-clés trop large coûte cher. Zalo en
 * est la démonstration — le mot seul a longtemps suffi à déclencher le
 * raccourci « contact », si bien que « je perds une heure à recopier mes
 * commandes Zalo », qui est une vente d'automatisation, recevait en réponse
 * l'adresse du bouton de contact. À Hanoi, Zalo est dans une phrase
 * commerciale sur deux : il ne peut pas être un déclencheur à lui seul.
 *
 * Règle de rédaction des listes : un déclencheur doit contenir l'INTENTION
 * (« votre numéro », « so zalo », « vous contacter »), jamais le seul nom
 * d'un canal.
 */

import type { Locale } from "@/lib/registry";
import { normalize } from "./guard";

/** Demandes de coordonnées → réponse statique qui renvoie au bouton de la page. */
const CONTACT_TRIGGERS: Record<Locale, string[]> = {
  vi: [
    "so dien thoai", "sdt", "so zalo", "zalo cua ban", "zalo cua shop",
    "goi cho ai", "lien he", "lien lac", "gap truc tiep", "dia chi cua ban",
    "van phong o dau", "chat voi nguoi that", "noi chuyen voi nguoi that",
    "email cua ban", "email cua shop",
  ],
  en: [
    "phone number", "your number", "call you", "contact you", "contact details",
    "get in touch", "email address", "your email", "your address",
    "where are you based", "office address", "talk to a human", "speak to someone",
    "whatsapp", "your zalo", "zalo number",
  ],
  fr: [
    "numero de telephone", "votre numero", "vous appeler", "vous contacter",
    "coordonnees", "adresse mail", "votre email", "votre adresse", "ou etes vous",
    "vos bureaux", "parler a quelqu un", "un humain", "whatsapp", "votre zalo",
    "numero zalo",
  ],
};

/**
 * Intention de rendez-vous. Volontairement plus étroite que la liste du site
 * français : ici, une détection à tort ouvre un calendrier au milieu d'une
 * question de prix.
 */
const BOOKING_TRIGGERS: Record<Locale, string[]> = {
  vi: [
    "dat lich hen", "dat lich tu van", "dat lich gap", "hen gap", "hen lich",
    "gap truc tiep", "gap mat", "lich trong", "khung gio", "xem lich",
    "muon gap", "co the gap", "sap xep gap", "hen mot buoi",
  ],
  en: [
    "book a meeting", "book a call", "book an appointment", "make an appointment",
    "schedule a call", "schedule a meeting", "set up a call", "available slots",
    "your availability", "meet in person", "meet you", "free slots",
  ],
  fr: [
    "prendre rendez", "prendre un rendez", "rendez-vous", "rendez vous", "un rdv",
    "prendre rdv", "reserver un creneau", "vos creneaux", "vos disponibilites",
    "vous rencontrer", "se rencontrer", "convenir d un moment", "fixer un moment",
  ],
};

/**
 * Questions sur le site offert. Le chatbot n'en répond pas : il renvoie vers la page de
 * l'offre (`/qua-tang`), où le règlement, les frais à la charge du gagnant et la valeur sont
 * écrits une fois pour toutes. Un petit modèle se trompait sur le fond — « aucun frais » pour
 * un site dont le gagnant règle des frais de mise en service.
 *
 * Même règle de rédaction que les listes ci-dessus : une INTENTION, pas un mot isolé. Ont été
 * écartés, parce qu'ils attrapaient des questions de vente : « được tặng » seul (les points
 * d'une carte de fidélité), « miễn phí » seul (une consultation gratuite), « free site »
 * (un audit gratuit), « concours » seul (un concours photo dans un salon), et « frais de mise
 * en service » / « setup fee » (qu'un visiteur dit pour les frais de déploiement d'un pack).
 */
const GIFT_TRIGGERS: Record<Locale, string[]> = {
  vi: [
    "web mien phi", "website mien phi", "trang web mien phi", "moi tuan mot trang",
    "phi mo dich vu", "giveaway", "chuong trinh tang web", "chuong trinh tang website",
    "chuong trinh tang trang",
  ],
  en: [
    "free website", "free web page", "free webpage", "website giveaway", "giveaway",
    "win a website", "win the website", "win a site", "site a week", "website a week",
    "site per week", "website per week", "page a week", "page per week",
  ],
  fr: [
    "site offert", "site gratuit", "page offerte", "page gratuite", "site par semaine",
    "operation un site", "jeu concours", "gagner un site", "gagner le site", "gagner une page",
  ],
};

/**
 * Vietnamien : « tặng » (offrir) et « tăng » (augmenter) deviennent le même mot une fois les
 * accents retirés, comme le fait `normalize`. « tôi muốn tăng website lên top Google » ne doit
 * pas renvoyer vers le jeu : ces déclencheurs se comparent donc AVEC leurs accents.
 */
const GIFT_TRIGGERS_VI_EXACT = [
  "chương trình tặng", "tặng web", "tặng website", "tặng trang web",
  "trang được tặng", "web được tặng", "website được tặng",
];

function matches(message: string, triggers: string[]): boolean {
  const msg = normalize(message);
  return triggers.some((k) => msg.includes(normalize(k)));
}

export function isContactRequest(message: string, locale: Locale): boolean {
  return matches(message, CONTACT_TRIGGERS[locale]);
}

export function isBookingRequest(message: string, locale: Locale): boolean {
  return matches(message, BOOKING_TRIGGERS[locale]);
}

export function isGiftRequest(message: string, locale: Locale): boolean {
  if (matches(message, GIFT_TRIGGERS[locale])) return true;
  if (locale !== "vi") return false;
  const raw = message.toLowerCase();
  return GIFT_TRIGGERS_VI_EXACT.some((trigger) => raw.includes(trigger));
}
