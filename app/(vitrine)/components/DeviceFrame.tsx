"use client";

import { useState } from "react";
import { useLanguage } from "./LanguageProvider";

/**
 * La démo tourne pour de vrai dans le cadre — jamais une capture d'écran. C'est ce que
 * le prospect doit pouvoir toucher pendant qu'on parle.
 *
 * L'iframe est chargée avec `?embed=1` : les démos y masquent leur barre de comparaison
 * de packs, qui n'a rien à faire dans un aperçu du site tel qu'il sera livré.
 */
export default function DeviceFrame({
  url,
  title,
  accent,
}: {
  url: string;
  title: string;
  accent: string;
}) {
  const { t, locale } = useLanguage();
  const [loaded, setLoaded] = useState(false);
  const sep = url.includes("?") ? "&" : "?";
  const embedUrl = `${url}${sep}embed=1&lang=${locale}`;
  // Le plein écran garde volontairement `embed` absent (barre de comparaison visible),
  // mais doit quand même ouvrir la démo dans la langue choisie sur la vitrine.
  const fullUrl = `${url}${sep}lang=${locale}`;

  return (
    <div className="flex w-full min-w-0 flex-col items-center gap-4">
      <div
        className="relative w-full max-w-[240px] rounded-[1.4rem] border-[4px] border-deep bg-deep shadow-[0_20px_60px_-20px_rgba(22,20,15,0.5)] sm:max-w-[360px] sm:rounded-[2.2rem] sm:border-[10px]"
        style={{ boxShadow: `0 0 0 1px ${accent}33, 0 20px 60px -20px rgba(22,20,15,0.5)` }}
      >
        {/* Encoche : purement décorative, retirée de l'arbre d'accessibilité. Ne
            doit JAMAIS chevaucher l'iframe — un header sticky de démo qui pose du
            contenu réel (logo, bouton) dès y=0 se retrouvait recouvert par cette
            encoche (ex. le bouton « Đặt bàn » de restaurant-phat-trien). L'iframe
            est donc inset de sa hauteur (h-5, 20px) via `top-5`/`bottom-0` sur un
            parent `bg-white` : l'encoche garde son emplacement visuel, mais dans
            une bande réservée, jamais par-dessus une page réelle.

            `height` explicite obligatoire : un <iframe> est un "replaced
            element" — en position absolute, `top`+`bottom` seuls (sans
            `height`) ne l'étirent PAS comme un élément normal, il retombe
            sur sa taille par défaut du navigateur (300×150px). Sans le
            `h-[calc(100%-20px)]` ci-dessous, tout ce qui dépasse ces 150px
            de haut dans la démo (donc presque tout) restait invisible dans
            le cadre — bug réel introduit par ce correctif lui-même,
            découvert en testant après déploiement. */}
        <div
          aria-hidden
          className="absolute left-1/2 top-0 z-10 h-5 w-28 -translate-x-1/2 rounded-b-2xl bg-deep"
        />
        <div className="relative aspect-[9/19] w-full overflow-hidden rounded-[1.5rem] bg-white">
          {!loaded && (
            <div className="absolute inset-0 animate-pulse bg-[rgba(22,20,15,0.06)]" aria-hidden />
          )}
          <iframe
            src={embedUrl}
            title={title}
            loading="lazy"
            onLoad={() => setLoaded(true)}
            className="absolute inset-x-0 top-5 h-[calc(100%-20px)] w-full border-0"
            // La démo est notre propre code : on l'autorise à occuper le cadre.
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          />
        </div>
      </div>

      <a
        href={fullUrl}
        target="_blank"
        rel="noreferrer"
        className="tap rounded-full border border-line px-5 text-[14px] font-medium transition-colors hover:border-ink"
      >
        {t("openFull")} ↗
      </a>
    </div>
  );
}
