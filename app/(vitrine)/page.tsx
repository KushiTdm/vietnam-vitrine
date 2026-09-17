"use client";

import Link from "next/link";
import { PACKS, PLANNED_VERTICALS, VERTICALS } from "@hanoi/registry";
import { useLanguage } from "./components/LanguageProvider";
import PackCard from "./components/PackCard";
import VerticalTile, { PlannedTile } from "./components/VerticalTile";

export default function Home() {
  const { t, tr } = useLanguage();

  // Le palier sur devis ne s'affiche pas sur l'accueil : l'argumentaire terrain reste
  // à trois niveaux, le quatrième ne sort que face à une chaîne (§4 du plan showcase).
  const tiered = PACKS.filter((p) => p.price !== null);

  const proof = [t("proofDelivery"), t("proofLangs"), t("proofResponsive"), t("proofPay")];

  return (
    <>
      {/* ────────────── Hero ────────────── */}
      <section className="mx-auto max-w-6xl px-4 pb-12 pt-12 sm:px-6 md:pb-16 md:pt-20">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-stretch">
          <div className="flex min-w-0 flex-col justify-center">
            <p className="text-[13px] uppercase tracking-[0.24em] text-muted">{t("heroKicker")}</p>
            <h1 className="mt-4 font-display text-[2.1rem] leading-[1.12] sm:text-5xl md:text-6xl">
              {t("heroTitle")}
            </h1>
            <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-muted">{t("heroLead")}</p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="#metiers"
                className="tap rounded-full bg-ink px-6 text-[15px] font-medium text-ground transition-opacity hover:opacity-90"
              >
                {t("heroCta")}
              </Link>
              <Link
                href="/packs"
                className="tap rounded-full border border-line px-6 text-[15px] font-medium transition-colors hover:border-ink"
              >
                {t("heroCta2")}
              </Link>
            </div>
          </div>

          {/* Le pitch dit « le client appelle depuis son téléphone ». Il faut le
              montrer : l'écran est volontairement éteint, on vend la scène, pas
              une capture d'interface — vidéo comme fixe : jamais allumé.
              Panneau étiré sur toute la hauteur de la colonne de texte à partir de
              lg (`self-stretch` via `items-stretch` du grid) : sur un hero à deux
              colonnes égales, une vidéo cantonnée à un ratio fixe paraît chétive à
              côté d'un titre sur trois lignes. */}
          <div className="relative aspect-[3/2] w-full overflow-hidden rounded-2xl border border-line bg-[rgba(22,20,15,0.04)] lg:aspect-auto lg:min-h-[28rem]">
            <video
              aria-label={t("heroAlt")}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              poster="/vitrine/hero-commercante.webp"
              className="absolute inset-0 h-full w-full object-cover"
            >
              <source src="/vitrine/hero-commercante.webm" type="video/webm" />
              <source src="/vitrine/hero-commercante.mp4" type="video/mp4" />
            </video>
          </div>
        </div>

        <ul className="mt-10 flex flex-wrap gap-x-3 gap-y-2 text-[14px] text-muted">
          {proof.map((p) => (
            <li key={p} className="rounded-full border border-line px-3 py-1.5">
              {p}
            </li>
          ))}
        </ul>
      </section>

      {/* ────────────── Les trois packs ────────────── */}
      <section id="gia" className="border-y border-line bg-white/60">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 md:py-20">
          <h2 className="font-display text-3xl md:text-4xl" data-reveal>
            {t("packsTitle")}
          </h2>
          <p className="mt-2 max-w-xl text-[16px] text-muted" data-reveal style={{ ["--d" as string]: "60ms" }}>
            {t("packsLead")}
          </p>

          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {tiered.map((pack, i) => (
              <PackCard key={pack.id} pack={pack} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ────────────── Les métiers ────────────── */}
      <section id="metiers" className="mx-auto max-w-6xl px-4 py-14 sm:px-6 md:py-20">
        <h2 className="font-display text-3xl md:text-4xl" data-reveal>
          {t("metiersTitle")}
        </h2>
        <p className="mt-2 max-w-xl text-[16px] text-muted" data-reveal style={{ ["--d" as string]: "60ms" }}>
          {t("metiersLead")}
        </p>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {VERTICALS.map((v, i) => (
            <VerticalTile key={v.id} vertical={v} index={i} />
          ))}
          {PLANNED_VERTICALS.map((v, i) => (
            <PlannedTile
              key={v.id}
              id={v.id}
              icon={v.icon}
              name={tr(v.name)}
              note={tr(v.note)}
              index={VERTICALS.length + i}
            />
          ))}
        </div>
      </section>
    </>
  );
}
