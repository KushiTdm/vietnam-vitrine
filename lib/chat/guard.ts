/**
 * Garde-fous du chatbot public (`app/api/chat`).
 *
 * Trois couches, dans cet ordre de coût croissant :
 *   1. `detectAbuse` — prompt injection et sondes techniques, refusées sans
 *      jamais appeler le modèle ;
 *   2. les compteurs par IP (débit, strikes hors-sujet, blocage temporaire) ;
 *   3. `scrubResponse` — dernier filet AVANT l'envoi au visiteur : e-mails,
 *      numéros de téléphone et la clé d'API elle-même ne sortent pas d'ici,
 *      même si le modèle décidait de les inventer ou de les recracher.
 *
 * État en mémoire (Maps au niveau module) : perdu à chaque cold start Vercel.
 * Assumé — ce projet n'a pas de base de données (voir `packs.ts`, l'infra est
 * volontairement minimale) et la fenêtre de chaque compteur est courte. Le but
 * n'est pas de tenir un registre d'abus, c'est de couper un flood en cours.
 */

// ────────────────────────────────────────────────────────────
// Normalisation
// ────────────────────────────────────────────────────────────

/**
 * Minuscules, sans diacritiques, apostrophes réduites à des espaces.
 *
 * Deux pièges valent une substitution explicite :
 *   - `đ` (U+0111) n'a pas de décomposition NFD — sans elle, « đóng vai »
 *     resterait « đong vai » et passerait à côté des motifs écrits en ASCII ;
 *     les Vietnamiens tapent souvent sans accents, et les deux graphies doivent
 *     tomber sur la même chaîne ;
 *   - l'apostrophe, droite ou typographique : « variable d'environnement » et
 *     « variable d environnement » doivent être le même texte pour les motifs.
 */
export function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\u0111/g, "d")
    .replace(/['\u2018\u2019`]/g, " ")
    .replace(/\s+/g, " ");
}

// ────────────────────────────────────────────────────────────
// Détection — prompt injection & sondes techniques
// ────────────────────────────────────────────────────────────

/**
 * Motifs évalués sur le message NORMALISÉ. Volontairement étroits : une
 * question commerciale maladroite ne doit jamais tomber dedans. « Gói nào phù
 * hợp với tôi ? » ou « c'est quoi votre prix ? » ne matchent rien ici.
 */
const INJECTION_PATTERNS: RegExp[] = [
  // Réécriture des consignes — FR / EN / VI
  /ignore (all |your |the )?(previous |above )?(instructions|rules|prompt)/,
  /(oublie|ignore) (tes|les|toutes les) (instructions|consignes|regles)/,
  /(bo qua|quen di) .{0,20}(huong dan|chi dan|quy tac|lenh)/,
  /instructions? precedentes?/,
  /previous instructions/,
  // Extraction du prompt système
  /(system|systeme) ?prompt/,
  /prompt (he thong|goc)/,
  /(ton|votre|your|tu) prompt/,
  /(reveal|show|print|repeat|affiche|montre|repete|revele|cho (toi|minh) xem|tiet lo) (me )?(ton|tes|your|the|tu|cac) ?(prompt|instructions|consignes|system|contexte)/,
  /quelles sont tes (instructions|consignes|regles)/,
  /what are your (instructions|rules)/,
  // Contournement de rôle
  /jailbreak/,
  /\bdan mode\b/,
  /developer mode/,
  /mode developpeur/,
  /(you are now|tu es maintenant|ban bay gio la)/,
  /(act as|pretend to be|agis comme|fais semblant d ?etre|dong vai|gia vo la)/,
  /roleplay as/,
  // Pêche aux secrets. Ces mots-clés se suffisent à eux-mêmes : aucun prospect
  // ne demande une clé d'API à un vendeur de sites web. En vietnamien le
  // possessif suit le nom (« khóa API của bạn ») — d'où des motifs sans préfixe.
  /(api ?key|cle api|khoa api|ma api|api token|secret key)/,
  /(your|ta|tes|votre|vos|cua ban) (token|secret|credentials)/,
  /(service ?role|env(ironment)? variable|variable d ?environnement|bien moi truong)/,
  /(database|server|serveur|admin) (password|mot de passe|mat khau)/,
  // Pêche aux données personnelles du gérant (le prénom seul est public)
  /(adresse|address|dia chi|domicile) (de |du |cua )?(nacer|patron|gerant|chu|owner|boss)/,
  /(nom de famille|last ?name|full ?name|ho va ten|ten day du) (de |du |cua )?(nacer|gerant|owner)/,
  /(passport|visa|carte d ?identite|cmnd|cccd|so tai khoan|compte bancaire|bank account|iban)/,
];

/** Sondes techniques : la personne teste une faille, ce n'est pas un prospect. */
const PROBE_PATTERNS: RegExp[] = [
  /<script[\s>]/,
  /<\?php/,
  /\bunion select\b/,
  /\bdrop table\b/,
  /select .{1,60} from .{1,60}(where|;|--)/,
  /\.\.\/\.\.\//,
  /\$\{.+\}/,
  /\{\{.+\}\}/,
  /(curl|wget) +https?:\/\//,
  /etc\/passwd/,
  /process\.env/,
];

export type AbuseType = "injection" | "probe";

/** Type d'abus détecté dans le message visiteur, ou `null`. */
export function detectAbuse(message: string): AbuseType | null {
  const msg = normalize(message);
  if (INJECTION_PATTERNS.some((p) => p.test(msg))) return "injection";
  if (PROBE_PATTERNS.some((p) => p.test(msg))) return "probe";
  return null;
}

// ────────────────────────────────────────────────────────────
// Compteurs par IP
// ────────────────────────────────────────────────────────────

/**
 * Fenêtre des strikes hors-sujet. Volontairement courte : passé ce délai, un
 * visiteur qui a plaisanté trois fois retrouve un assistant normal. Le but est
 * de couper un troll en cours, pas de fermer la porte à un prospect maladroit.
 */
const STRIKE_TTL_MS = 15 * 60 * 1000;
const SIGNAL_TTL_MS = 60 * 60 * 1000;
export const ABUSE_BLOCK_MINUTES = 60;
/** Nombre de signaux (injection, sonde, flood) avant blocage de l'IP. */
export const ABUSE_MAX_SIGNALS = 3;
/** Nombre de réponses hors-sujet avant de passer en réponses statiques. */
export const OFF_TOPIC_MAX_STRIKES = 3;

type Counter = { count: number; expiresAt: number };

const offTopicStrikes = new Map<string, Counter>();
const abuseSignals = new Map<string, Counter>();
const blockedIps = new Map<string, number>();

function bump(store: Map<string, Counter>, key: string, ttl: number): number {
  const now = Date.now();
  const entry = store.get(key);
  if (!entry || now >= entry.expiresAt) {
    store.set(key, { count: 1, expiresAt: now + ttl });
    return 1;
  }
  entry.count += 1;
  return entry.count;
}

function read(store: Map<string, Counter>, key: string): number {
  const entry = store.get(key);
  if (!entry || Date.now() >= entry.expiresAt) return 0;
  return entry.count;
}

/** Incrémente et renvoie les strikes hors-sujet de l'IP (fenêtre 30 min). */
export function registerOffTopicStrike(ip: string): number {
  return bump(offTopicStrikes, ip, STRIKE_TTL_MS);
}

export function getOffTopicStrikes(ip: string): number {
  return read(offTopicStrikes, ip);
}

/**
 * Enregistre un signal d'abus et bloque l'IP à partir du 3e sur une heure.
 * Renvoie `true` si l'IP vient d'être (ou est déjà) bloquée.
 */
export function registerAbuseSignal(ip: string): boolean {
  const signals = bump(abuseSignals, ip, SIGNAL_TTL_MS);
  if (signals >= ABUSE_MAX_SIGNALS) {
    blockedIps.set(ip, Date.now() + ABUSE_BLOCK_MINUTES * 60 * 1000);
    return true;
  }
  return false;
}

export function isIpBlocked(ip: string): boolean {
  const until = blockedIps.get(ip);
  if (!until) return false;
  if (Date.now() >= until) {
    blockedIps.delete(ip);
    return false;
  }
  return true;
}

// ────────────────────────────────────────────────────────────
// Saturation du modèle — refroidissement global
// ────────────────────────────────────────────────────────────

/**
 * Quand le fournisseur répond 429, le quota du palier gratuit est atteint :
 * continuer à l'appeler ne fait que rallonger la file et gaspiller des appels
 * qui échoueront tous. On pose donc un refroidissement GLOBAL — pas par IP,
 * puisque la limite ne l'est pas — pendant lequel la route ne tente plus rien
 * et renvoie au visiteur le nombre de secondes à attendre. Le widget bloque
 * l'envoi pendant ce temps-là.
 */
const DEFAULT_COOLDOWN_S = 45;
const MAX_COOLDOWN_S = 300;
let saturatedUntil = 0;

/**
 * Enregistre une saturation. Respecte l'en-tête `Retry-After` du fournisseur
 * quand il en envoie un, borné à 5 minutes pour ne pas fermer le chat une
 * demi-heure sur une valeur fantaisiste. Renvoie l'attente retenue.
 */
export function noteSaturation(retryAfter?: string | null): number {
  const parsed = retryAfter ? Number.parseInt(retryAfter, 10) : Number.NaN;
  const seconds = Number.isFinite(parsed) && parsed > 0
    ? Math.min(parsed, MAX_COOLDOWN_S)
    : DEFAULT_COOLDOWN_S;
  saturatedUntil = Math.max(saturatedUntil, Date.now() + seconds * 1000);
  return seconds;
}

/** Secondes restantes avant de pouvoir rappeler le modèle ; 0 si disponible. */
export function saturationRemaining(): number {
  const remaining = saturatedUntil - Date.now();
  return remaining > 0 ? Math.ceil(remaining / 1000) : 0;
}

/** Lève le refroidissement — utilisé par les tests. */
export function clearSaturation(): void {
  saturatedUntil = 0;
}

// ────────────────────────────────────────────────────────────
// Débit — fenêtre fixe par clé
// ────────────────────────────────────────────────────────────

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export type RateLimitResult = { allowed: boolean; retryAfter?: number };

export function rateLimit(key: string, max: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now >= bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }
  if (bucket.count >= max) {
    return { allowed: false, retryAfter: Math.ceil((bucket.resetAt - now) / 1000) };
  }
  bucket.count += 1;
  return { allowed: true };
}

/** IP cliente derrière le proxy Vercel (`x-forwarded-for` est renseigné). */
export function getClientIp(headers: Headers): string {
  const xff = headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  return headers.get("x-real-ip") ?? "unknown";
}

// ────────────────────────────────────────────────────────────
// Filtrage de la réponse — rien de personnel ne sort d'ici
// ────────────────────────────────────────────────────────────

/** Suites de chiffres pouvant former un numéro de téléphone. */
const PHONE_CANDIDATE = /[+(]?\d[\d\s().-]{6,20}\d/g;
/** Un prix vietnamien : groupes de 3 séparés par des points (« 24.900.000 »). */
const PRICE_SHAPE = /^\d{1,3}(\.\d{3})+$/;
const EMAIL = /[\w.+-]+@[\w-]+\.[\w.-]+/g;
/** Lien markdown : `[libellé](cible)`. */
const MD_LINK = /\[([^\]]+)\]\(([^)\s]+)\)/g;
/** Adresse absolue écrite en clair. */
const BARE_URL = /\bhttps?:\/\/[^\s)<>"']+/g;
/** Nom de domaine sans protocole — liste de TLD fermée pour éviter les faux positifs. */
const BARE_DOMAIN = /\b[a-z0-9][a-z0-9-]*\.(?:vn|com|fr|net|org|io|me)(?:\.[a-z]{2})?(?:\/[^\s),.]*)?/gi;
/**
 * Chemin interne cité dans une réponse. Le `(?<=...)` exige un début de ligne,
 * une espace ou une ouvrante juste avant : « 5 USD/mois » ou « GHTK/GHN » ne
 * sont pas des chemins et doivent être épargnés.
 */
const INTERNAL_PATH = /(?<=^|[\s(«"'*])\/[a-z][\w-]*(?:\/[\w-]+)*\/?/gim;
/**
 * Les seules routes de la vitrine. Le modèle invente des chemins qui SONT la
 * traduction de la page (« /bang-gia » pour la grille de prix, en vietnamien) :
 * plausibles, cliquables, et en 404. Tout ce qui n'est pas là-dedans saute.
 */
const ALLOWED_PATH = /^\/(?:(?:en|fr)\/)?(?:packs|qua-tang|metiers(?:\/[\w-]+){0,2})\/?$/;

/**
 * Retire de la réponse tout ce qui ne doit jamais être écrit par l'assistant :
 * adresses e-mail, numéros de téléphone, adresses web et chemins internes
 * inventés, et la clé d'API si elle venait à apparaître (elle n'est jamais dans
 * le contexte du modèle — ceci est une ceinture en plus des bretelles). Le
 * remplacement pointe vers le bouton de contact du site : le visiteur garde un
 * chemin, l'information reste côté page.
 *
 * Les montants en ₫ sont épargnés : « 24.900.000₫ » a la forme d'un numéro
 * long, mais c'est un prix — d'où les deux tests `PRICE_SHAPE` et le suffixe
 * monétaire.
 */
export function scrubResponse(text: string, contactHint: string): string {
  let out = text.replace(EMAIL, contactHint);

  // Le modèle invente des domaines (« https://neuraweb.com/packs ») même quand
  // le prompt le lui interdit. Un lien markdown interne est réduit à son
  // chemin, le reste à son libellé ; les adresses absolues restantes sautent.
  // Les chemins internes (`/packs`, `/fr/metiers/...`) sont préservés : ce sont
  // les seuls liens que le widget rend cliquables.
  out = out.replace(MD_LINK, (_m, label: string, href: string) =>
    href.startsWith("/") ? href : label,
  );
  out = out.replace(BARE_URL, "").replace(BARE_DOMAIN, "");
  out = out.replace(INTERNAL_PATH, (match) => (ALLOWED_PATH.test(match.trim()) ? match : ""));
  out = out.replace(/[ \t]{2,}/g, " ").replace(/ +([,.;:!?])/g, "$1");

  out = out.replace(PHONE_CANDIDATE, (match, offset: number, full: string) => {
    const trimmed = match.trim();
    const digits = trimmed.replace(/\D/g, "");
    // Trop court pour un numéro : années, quantités, plafonds de photos.
    if (digits.length < 9 || digits.length > 15) return match;
    // Prix : soit la graphie « 1.300.000 », soit un symbole monétaire juste après.
    if (PRICE_SHAPE.test(trimmed)) return match;
    if (/^\s*(₫|đ|vnd|usd|\$)/i.test(full.slice(offset + match.length))) return match;
    return match.replace(trimmed, contactHint);
  });

  const apiKey = process.env.MISTRAL_API_KEY;
  if (apiKey && apiKey.length > 8 && out.includes(apiKey)) {
    out = out.split(apiKey).join("[…]");
  }

  return out;
}

/**
 * Prestataires que le modèle cite de lui-même — registrars et hébergeurs —
 * alors que trois consignes le lui interdisent : la règle du prompt, la phrase
 * « Neuraweb ne recommande aucun registrar » écrite dans l'extrait, et
 * l'interdiction générale de nommer une société tierce.
 *
 * À l'essai, « Le nom de domaine, je l'achète où ? » a produit « Namecheap,
 * GoDaddy ou VietDomain » — les deux premiers existent et ne sont pas nos
 * partenaires, le troisième n'existe pas du tout. Un commerçant qui le cherche
 * tombe sur rien, ou pire. Une consigne ne suffit pas pour ça : il faut un
 * test sur la sortie.
 *
 * Liste courte et bornée par des frontières de mots : on ne bloque que des
 * marques de domaine et d'hébergement, jamais un mot qu'un visiteur pourrait
 * employer pour son propre commerce.
 */
const PROVIDER_NAMES = [
  "namecheap", "godaddy", "gandi", "ovh", "ovhcloud", "hostinger", "bluehost",
  "dreamhost", "porkbun", "cloudflare", "vercel", "netlify", "hostgator",
  "mat bao", "matbao", "pa vietnam", "pavietnam", "tenten", "nhan hoa",
  "nhanhoa", "azdigi", "vietnix", "vinahost", "viettel idc", "vietdomain",
];

/** La réponse nomme-t-elle un prestataire tiers ? */
export function namesForbiddenProvider(text: string): string | null {
  const haystack = normalize(text);
  for (const name of PROVIDER_NAMES) {
    if (new RegExp(`\\b${name.replace(/ /g, "\\s+")}\\b`).test(haystack)) return name;
  }
  return null;
}

// ────────────────────────────────────────────────────────────
// Nettoyage périodique
// ────────────────────────────────────────────────────────────

const cleanup = setInterval(() => {
  const now = Date.now();
  for (const store of [offTopicStrikes, abuseSignals]) {
    for (const [key, entry] of Array.from(store.entries())) {
      if (now >= entry.expiresAt) store.delete(key);
    }
  }
  for (const [ip, until] of Array.from(blockedIps.entries())) {
    if (now >= until) blockedIps.delete(ip);
  }
  for (const [key, bucket] of Array.from(buckets.entries())) {
    if (now >= bucket.resetAt) buckets.delete(key);
  }
}, 10 * 60 * 1000);
// Ne pas maintenir le process actif uniquement pour ce timer.
if (typeof (cleanup as { unref?: () => void }).unref === "function") {
  (cleanup as { unref: () => void }).unref();
}
