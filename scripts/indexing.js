#!/usr/bin/env node
/**
 * Google Indexing API — envoie à Google les URLs de https://vn.neuraweb.fr.
 *
 * Adapté du script de neuraweb.fr : en plus des <loc>, il lit les
 * <xhtml:link hreflang="…" href="…"> du sitemap. La vitrine ne met que la
 * version vietnamienne dans <loc> ; les versions /en et /fr n'existent que
 * dans les alternates.
 *
 * Prérequis :
 *   1. Service account Google Cloud avec l'API "Indexing API" activée
 *   2. Son email ajouté comme propriétaire de la propriété vn.neuraweb.fr
 *      (ou de la propriété domaine neuraweb.fr) dans Search Console
 *   3. Clé dans apps/vitrine/.env : GOOGLE_SERVICE_ACCOUNT_JSON=<JSON ou base64>
 *      OU fichier scripts/service-account.json
 *      OU GOOGLE_SERVICE_ACCOUNT_KEY_PATH=/chemin/vers/key.json
 *      (.env et service-account.json sont ignorés par git)
 *
 * Usage :
 *   node scripts/indexing.js --dry-run              # lister sans appeler l'API
 *   node scripts/indexing.js --lang=en,fr           # seulement EN + FR
 *   node scripts/indexing.js --lang=vi              # seulement VI
 *   node scripts/indexing.js                        # toutes les langues
 *   node scripts/indexing.js --type=URL_DELETED     # signaler une suppression
 *   node scripts/indexing.js --limit=50             # limiter le nombre d'URLs
 *
 * Quota par défaut : 200 requêtes/jour, partagé avec neuraweb.fr si les deux
 * sites utilisent le même projet Google Cloud.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const https = require('https');

const SITEMAP_URL = 'https://vn.neuraweb.fr/sitemap.xml';
const INDEXING_ENDPOINT = 'https://indexing.googleapis.com/v3/urlNotifications:publish';
const TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';
const SCOPE = 'https://www.googleapis.com/auth/indexing';

// VI n'a pas de préfixe d'URL (langue par défaut), EN et FR en ont un.
const LANGS = ['vi', 'en', 'fr'];

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v = 'true'] = a.replace(/^--/, '').split('=');
    return [k, v];
  })
);

const NOTIFY_TYPE = args.type || 'URL_UPDATED';
const DRY_RUN = args['dry-run'] === 'true';
const LIMIT = args.limit ? parseInt(args.limit, 10) : Infinity;
const WANTED_LANGS = args.lang ? args.lang.split(',').map((l) => l.trim()) : LANGS;
const KEY_PATH =
  process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH ||
  path.join(__dirname, 'service-account.json');

// Node ne lit pas .env tout seul : on lit apps/vitrine/.env (ignoré par git)
// sans écraser les variables déjà présentes dans le shell.
function loadDotEnv() {
  const file = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    const m = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/.exec(line);
    if (!m || m[1] in process.env) continue;
    process.env[m[1]] = m[2].replace(/^(['"])(.*)\1$/, '$2');
  }
}
loadDotEnv();

// Ordre : GOOGLE_SERVICE_ACCOUNT_JSON (JSON brut ou base64), puis fichier.
function loadServiceAccount() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (raw) {
    const text = raw.trim().startsWith('{')
      ? raw
      : Buffer.from(raw, 'base64').toString('utf8');
    return JSON.parse(text);
  }
  if (fs.existsSync(KEY_PATH)) return JSON.parse(fs.readFileSync(KEY_PATH, 'utf8'));
  console.error('\nClé service account introuvable.');
  console.error('Définissez GOOGLE_SERVICE_ACCOUNT_JSON dans apps/vitrine/.env (JSON ou base64),');
  console.error(`ou GOOGLE_SERVICE_ACCOUNT_KEY_PATH, ou placez le fichier à ${KEY_PATH}`);
  process.exit(1);
}

const badLang = WANTED_LANGS.filter((l) => !LANGS.includes(l));
if (badLang.length) {
  console.error(`Langue inconnue : ${badLang.join(', ')} (attendu : ${LANGS.join(', ')})`);
  process.exit(1);
}

// ───────────────────────── HTTP helpers ─────────────────────────
function httpsRequest(url, options = {}, body = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () =>
        resolve({ status: res.statusCode, headers: res.headers, body: data })
      );
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

// ───────────────────────── JWT (RS256) ─────────────────────────
function base64url(input) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function buildJWT(serviceAccount) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const claim = {
    iss: serviceAccount.client_email,
    scope: SCOPE,
    aud: TOKEN_ENDPOINT,
    exp: now + 3600,
    iat: now,
  };
  const unsigned = `${base64url(JSON.stringify(header))}.${base64url(
    JSON.stringify(claim)
  )}`;
  const signature = crypto
    .createSign('RSA-SHA256')
    .update(unsigned)
    .sign(serviceAccount.private_key);
  return `${unsigned}.${base64url(signature)}`;
}

async function getAccessToken(serviceAccount) {
  const jwt = buildJWT(serviceAccount);
  const body = new URLSearchParams({
    grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
    assertion: jwt,
  }).toString();

  const { status, body: responseBody } = await httpsRequest(
    TOKEN_ENDPOINT,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(body),
      },
    },
    body
  );

  const parsed = JSON.parse(responseBody);
  if (status !== 200 || !parsed.access_token) {
    throw new Error(`Token error (${status}): ${responseBody}`);
  }
  return parsed.access_token;
}

// ───────────────────── Sitemap parsing ─────────────────────
async function fetchUrl(url) {
  const { status, body } = await httpsRequest(url, { method: 'GET' });
  if (status !== 200) throw new Error(`GET ${url} → ${status}`);
  return body;
}

function decodeXml(s) {
  return s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
}

// <loc> + href des <xhtml:link> (alternates hreflang), quel que soit l'ordre
// des attributs.
function extractUrls(xml) {
  const urls = [];
  const locRegex = /<loc>([^<]+)<\/loc>/g;
  let m;
  while ((m = locRegex.exec(xml)) !== null) urls.push(decodeXml(m[1].trim()));

  const linkRegex = /<xhtml:link\b[^>]*>/g;
  while ((m = linkRegex.exec(xml)) !== null) {
    const href = /href="([^"]+)"/.exec(m[0]);
    if (href) urls.push(decodeXml(href[1].trim()));
  }
  return urls;
}

async function collectAllUrls(rootSitemap) {
  const xml = await fetchUrl(rootSitemap);
  const isIndex = /<sitemapindex[\s>]/i.test(xml);
  if (!isIndex) return extractUrls(xml);

  const all = [];
  for (const child of extractUrls(xml)) {
    all.push(...extractUrls(await fetchUrl(child)));
  }
  return all;
}

function langOf(url) {
  const first = new URL(url).pathname.split('/')[1];
  return first === 'en' || first === 'fr' ? first : 'vi';
}

// ───────────────────── Indexing API call ─────────────────────
async function notifyUrl(url, accessToken) {
  const payload = JSON.stringify({ url, type: NOTIFY_TYPE });
  const { status, body } = await httpsRequest(
    INDEXING_ENDPOINT,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
      },
    },
    payload
  );
  return { status, body };
}

// ───────────────────────── Main ─────────────────────────
(async () => {
  console.log(
    `\n[Indexing API] type=${NOTIFY_TYPE} langues=${WANTED_LANGS.join(',')} dryRun=${DRY_RUN}`
  );

  const all = [...new Set(await collectAllUrls(SITEMAP_URL))];
  const unique = all.filter((u) => WANTED_LANGS.includes(langOf(u))).slice(0, LIMIT);
  console.log(
    `[Indexing API] ${unique.length} URLs retenues sur ${all.length} dans ${SITEMAP_URL}`
  );

  if (DRY_RUN) {
    unique.forEach((u) => console.log(`  - [${langOf(u)}] ${u}`));
    return;
  }

  const serviceAccount = loadServiceAccount();
  const accessToken = await getAccessToken(serviceAccount);
  console.log('[Indexing API] Access token obtenu\n');

  let ok = 0;
  let failed = 0;
  const errors = [];

  for (let i = 0; i < unique.length; i++) {
    const url = unique[i];
    try {
      const { status, body } = await notifyUrl(url, accessToken);
      if (status >= 200 && status < 300) {
        ok++;
        console.log(`  ✓ [${i + 1}/${unique.length}] ${url}`);
      } else {
        failed++;
        errors.push({ url, status, body });
        console.log(`  ✗ [${i + 1}/${unique.length}] ${url} → HTTP ${status}`);
      }
    } catch (err) {
      failed++;
      errors.push({ url, error: err.message });
      console.log(`  ✗ [${i + 1}/${unique.length}] ${url} → ${err.message}`);
    }
    // Throttle léger pour rester sous la limite de concurrence de Google
    await new Promise((r) => setTimeout(r, 150));
  }

  console.log(`\n[Indexing API] Terminé : ${ok} succès / ${failed} échecs`);
  if (errors.length) {
    const logFile = path.join(__dirname, `indexing-errors-${Date.now()}.json`);
    fs.writeFileSync(logFile, JSON.stringify(errors, null, 2));
    console.log(`Détails des erreurs : ${logFile}`);
  }
})().catch((err) => {
  console.error('\n[Indexing API] Erreur fatale :', err);
  process.exit(1);
});
