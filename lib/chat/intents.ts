/**
 * Détection d'intention — les deux raccourcis qui répondent sans appeler le
 * modèle : « donnez-moi vos coordonnées » et « je veux un rendez-vous ».
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
