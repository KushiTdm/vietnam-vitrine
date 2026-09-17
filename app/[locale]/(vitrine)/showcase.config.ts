// Identité de l'agence sur la vitrine.
// PLACEHOLDERS : à remplacer avant toute mise en ligne (§12 du plan showcase).

export const agency = {
  // TODO: nom réel du studio
  name: "Web Hà Nội",
  // TODO: votre numéro, format E.164 pour tel:
  phone: "+33749775654",
  phoneDisplay: "+33 7 49 77 56 54",
  // TODO: votre Zalo (indicatif 84, sans + ni 0)
  zalo: "33749775654",
  // TODO: votre page Facebook (pour m.me/)
  facebookPage: "webhanoi.studio",
  email: "xinchao@webhanoi.vn",
  socials: {
    facebook: "https://www.facebook.com/people/Neuraweb/61587416320627/",
    x: "https://x.com/neurawebtech",
  },
  // Domaine de CE projet (vitrine, déployée sur Vercel) — pas celui des
  // démos (`hanoi-demos-site.san3neb.workers.dev`, resté sur Cloudflare et
  // référencé via NEXT_PUBLIC_DEMOS_BASE_URL, voir packages/registry).
  // TODO: confirmer le sous-domaine exact une fois attaché dans Vercel.
  url: "https://vn.neuraweb.fr",
  city: "Hà Nội",
} as const;
