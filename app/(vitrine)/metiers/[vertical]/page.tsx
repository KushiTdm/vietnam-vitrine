"use client";

import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { use } from "react";
import {
  publicDemosAt,
  demoUrl,
  getPack,
  getVertical,
  type PackId,
} from "@hanoi/registry";
import { useLanguage } from "../../components/LanguageProvider";
import DeviceFrame from "../../components/DeviceFrame";
import PriceTag from "../../components/PriceTag";
import FeatureMatrix from "../../components/FeatureMatrix";
import { TILE } from "../../lib/tiles";

export default function VerticalPage({ params }: { params: Promise<{ vertical: string }> }) {
  const { vertical: slug } = use(params);
  const { t, tr } = useLanguage();

  const vertical = getVertical(slug);
  if (!vertical) notFound();

  return (
    <>
      {/* ────────────── Le métier ────────────── */}
      <section className="mx-auto max-w-6xl px-4 pb-10 pt-10 sm:px-6 md:pt-16">
        <Link href="/#metiers" className="tap text-[14px] text-muted hover:text-ink">
          ← {t("navMetiers")}
        </Link>

        <div className="mt-4 flex items-start gap-4">
          {/* Même vignette que la tuile de l'accueil : le prospect reconnaît
              l'image sur laquelle il vient de cliquer. Repli sur l'emoji du
              registre pour un métier qui n'a pas encore sa photo. */}
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-line sm:h-20 sm:w-20">
            {TILE[vertical.id] ? (
              <Image src={TILE[vertical.id]!} alt="" fill sizes="80px" className="object-cover" />
            ) : (
              <span aria-hidden className="absolute inset-0 flex items-center justify-center text-3xl">
                {vertical.icon}
              </span>
            )}
          </div>
          <div>
            <h1 className="font-display text-[2rem] leading-tight sm:text-5xl">
              {tr(vertical.name)}
            </h1>
            <p className="mt-1 text-[15px] text-muted">{vertical.nativeName}</p>
          </div>
        </div>

        {/* L'argument propre au métier : c'est ce qui distingue un vendeur de sites
            de quelqu'un qui comprend le commerce. */}
        <p
          className="mt-8 max-w-2xl border-l-2 pl-5 font-display text-xl leading-snug sm:text-2xl"
          data-reveal
          style={{ borderColor: vertical.accent }}
        >
          {tr(vertical.pitch)}
        </p>
      </section>

      {/* ────────────── Les paliers de ce métier ────────────── */}
      <section className="border-t border-line bg-white/60">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-16">
          <h2 className="font-display text-3xl" data-reveal>
            {t("packsForTrade")}
          </h2>

          <div className="mt-8 grid gap-10 lg:grid-cols-3">
            {vertical.packs.flatMap((packId: PackId) => {
              const pack = getPack(packId)!;
              const variants = publicDemosAt(vertical.id, packId);
              // Une case sans démo publiable garde sa colonne : le prospect voit le
              // palier et son prix, avec « on en parle » à la place de l'aperçu.
              return (variants.length ? variants : [undefined]).map((demo, i) => {

              return (
                <article key={`${packId}-${i}`} className="flex flex-col gap-6">
                  {/* La révélation s'arrête à l'en-tête : l'article contient le cadre
                      téléphone, et animer un conteneur d'iframe la fait repeindre. */}
                  <header data-reveal style={{ ["--d" as string]: `${i * 70}ms` }}>
                    <h3
                      className="font-display text-2xl leading-tight"
                      style={{ color: pack.accent }}
                    >
                      {tr(pack.gridName)}
                    </h3>
                    {demo && (
                      <p className="mt-1 text-[15px] text-muted">
                        {demo.businessName} · {demo.district}
                        {demo.variant && (
                          <span className="block text-[13px]">{demo.variant}</span>
                        )}
                      </p>
                    )}
                  </header>

                  {demo ? (
                    <DeviceFrame
                      url={demoUrl(demo)}
                      title={`${demo.businessName} — ${tr(pack.gridName)}`}
                      accent={pack.accent}
                    />
                  ) : (
                    <div className="flex aspect-[9/16] w-full max-w-[360px] items-center justify-center rounded-2xl border border-dashed border-line p-6 text-center text-[15px] text-muted">
                      {t("notSold")}
                    </div>
                  )}

                  <PriceTag pack={pack} />

                  {demo && (
                    <Link
                      href={`/metiers/${vertical.slug}/${packId}`}
                      className="tap justify-center rounded-full px-5 text-[15px] font-medium text-white transition-opacity hover:opacity-90"
                      style={{ backgroundColor: pack.accent }}
                    >
                      {t("seePack")}
                    </Link>
                  )}
                </article>
              );
              });
            })}
          </div>
        </div>
      </section>

      {/* ────────────── Ce que le site fait pour ce métier ────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-16">
        <h2 className="font-display text-3xl" data-reveal>
          {t("whatItDoes")}
        </h2>
        <p className="mt-2 max-w-xl text-[16px] text-muted" data-reveal style={{ ["--d" as string]: "60ms" }}>
          {t("compareLead")}
        </p>
        <div className="mt-8" data-reveal style={{ ["--d" as string]: "120ms" }}>
          <FeatureMatrix vertical={vertical.id} packs={vertical.packs} />
        </div>
      </section>
    </>
  );
}
