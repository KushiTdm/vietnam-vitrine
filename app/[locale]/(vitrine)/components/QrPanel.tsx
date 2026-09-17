"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { useLanguage } from "./LanguageProvider";

/**
 * Le geste central du rendez-vous : le prospect ouvre la démo sur SON téléphone.
 * Tout le reste de la page est secondaire, donc le code reste grand et sans décor.
 *
 * `url` est same-origin (voir `demoUrl` dans le registre) : un chemin relatif,
 * correct pour l'iframe de la démo mais illisible pour un QR scanné par un
 * autre appareil. On le résout ici en absolu via `window.location.origin`,
 * ce qui reflète automatiquement l'hôte réel (localhost en dev, le domaine
 * public une fois déployé) sans dépendre d'une config figée.
 */
export default function QrPanel({ url }: { url: string }) {
  const { t, locale } = useLanguage();
  const [src, setSrc] = useState<string | null>(null);
  const [isLocalHost, setIsLocalHost] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const { origin, hostname } = window.location;
    setIsLocalHost(hostname === "localhost" || hostname === "127.0.0.1");

    // Le prospect scanne avec son propre téléphone : la démo doit s'ouvrir
    // dans la langue qu'il a choisie sur la vitrine, pas dans la langue par défaut.
    const absoluteUrl = /^https?:\/\//.test(url) ? url : `${origin}${url}`;
    const sep = absoluteUrl.includes("?") ? "&" : "?";
    const qrUrl = `${absoluteUrl}${sep}lang=${locale}`;
    QRCode.toDataURL(qrUrl, {
      margin: 1,
      width: 480,
      color: { dark: "#16140fff", light: "#ffffffff" },
      errorCorrectionLevel: "M",
    })
      .then((d) => {
        if (!cancelled) setSrc(d);
      })
      .catch(() => {
        /* un QR absent vaut mieux qu'une page cassée */
      });
    return () => {
      cancelled = true;
    };
  }, [url, locale]);

  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-line bg-white p-5">
      <div className="aspect-square w-full max-w-[220px] overflow-hidden rounded-lg bg-white">
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt="" width={220} height={220} className="h-full w-full" />
        ) : (
          <div className="h-full w-full animate-pulse bg-[rgba(22,20,15,0.06)]" />
        )}
      </div>
      <p className="text-center text-[14px] font-medium">{t("scanMe")}</p>
      {isLocalHost && <p className="text-center text-[14px] text-muted">{t("notDeployed")}</p>}
    </div>
  );
}
