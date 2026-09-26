"use client";

import Image from "next/image";
import { useEffect, useRef, useSyncExternalStore } from "react";

/**
 * Boucle vidéo d'un héros de prestation : `/vitrine/<name>.webm`, `.mp4`, et
 * `<name>.webp` pour poster.
 *
 * Le poster est TOUJOURS rendu, en `<Image>` : c'est lui qui peint en premier
 * (LCP), lui que voit un visiteur en « réduire les animations » ou en économie
 * de données, et lui qui reste sous la vidéo le temps qu'elle démarre. La
 * vidéo, elle, n'est montée que si le visiteur peut la recevoir — ce que le
 * héros de l'accueil ne vérifie pas encore.
 *
 * Lecture et pause suivent la visibilité : une boucle hors écran ne consomme
 * ni batterie ni données.
 */

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

type NetworkInformation = { saveData?: boolean };

function canPlay(): boolean {
  const connection = (navigator as Navigator & { connection?: NetworkInformation }).connection;
  return !window.matchMedia(REDUCED_MOTION).matches && !connection?.saveData;
}

function subscribe(onChange: () => void): () => void {
  const query = window.matchMedia(REDUCED_MOTION);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

export default function LoopVideo({
  name,
  alt,
  sizes,
  preload = false,
  focus,
}: {
  name: string;
  alt: string;
  sizes: string;
  /** Vrai pour un héros au-dessus de la ligne de flottaison. */
  preload?: boolean;
  /** `object-position` du recadrage. */
  focus?: string;
}) {
  // Côté serveur, et jusqu'à l'hydratation : faux — le poster seul.
  const playable = useSyncExternalStore(subscribe, canPlay, () => false);
  const video = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = video.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) void el.play().catch(() => {});
      else el.pause();
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [playable]);

  const style = focus ? { objectPosition: focus } : undefined;

  return (
    <>
      <Image
        src={`/vitrine/${name}.webp`}
        alt={alt}
        fill
        sizes={sizes}
        preload={preload}
        className="object-cover"
        style={style}
      />
      {playable ? (
        <video
          ref={video}
          aria-hidden="true"
          muted
          loop
          playsInline
          preload="metadata"
          poster={`/vitrine/${name}.webp`}
          className="absolute inset-0 h-full w-full object-cover"
          style={style}
        >
          <source src={`/vitrine/${name}.webm`} type="video/webm" />
          <source src={`/vitrine/${name}.mp4`} type="video/mp4" />
        </video>
      ) : null}
    </>
  );
}
