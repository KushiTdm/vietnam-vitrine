"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { use } from "react";
import {
  publicDemoAt,
  demoUrl,
  publicDemosFor,
  publicDemosOf,
  getPack,
  getVertical,
  splitFeatures,
  VERTICALS,
  type PackId,
} from "@hanoi/registry";
import { useLanguage } from "../../../components/LanguageProvider";
import DeviceFrame from "../../../components/DeviceFrame";
import QrPanel from "../../../components/QrPanel";
import PriceTag from "../../../components/PriceTag";

/**
 * L'écran du rendez-vous. Ordre vertical imposé par l'usage réel :
 * la démo qui tourne, le QR, le prix, puis ce qui est inclus et ce qui ne l'est pas.
 */
export default function DemoPage({
  params,
}: {
  params: Promise<{ vertical: string; pack: string }>;
}) {
  const { vertical: slug, pack: packSlug } = use(params);
  const { t, tr } = useLanguage();

  const vertical = getVertical(slug);
  const pack = getPack(packSlug);
  if (!vertical || !pack) notFound();

  const demo = publicDemoAt(vertical.id, pack.id as PackId);
  if (!demo) notFound();

  const url = demoUrl(demo);
  const { included, missing } = splitFeatures(vertical.id, pack.id);

  const otherPacks = publicDemosFor(vertical.id).filter((d) => d.pack !== pack.id);
  const otherTrades = publicDemosOf(pack.id).filter((d) => d.vertical !== vertical.id);

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 pt-8 sm:px-6">
      <Link href={`/metiers/${vertical.slug}`} className="tap text-[14px] text-muted hover:text-ink">
        ← {tr(vertical.name)}
      </Link>

      <header className="mt-4">
        <p className="text-[13px] uppercase tracking-[0.2em]" style={{ color: pack.accent }}>
          {tr(pack.gridName)}
        </p>
        <h1 className="mt-2 font-display text-[2rem] leading-tight sm:text-4xl">
          {demo.businessName}
        </h1>
        <p className="mt-1 text-[15px] text-muted">{demo.district}</p>
      </header>

      {/* ────────────── La démo + le QR ────────────── */}
      <section className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0">
          <h2 className="sr-only">{t("demoLive")}</h2>
          <DeviceFrame url={url} title={demo.businessName} accent={pack.accent} />
        </div>

        <aside className="flex min-w-0 flex-col gap-6">
          <QrPanel url={url} />

          <div className="rounded-2xl border border-line bg-white p-5">
            <PriceTag pack={pack} size="lg" />
            <p className="mt-4 border-t border-line pt-3 text-[14px] text-muted">
              {t("leadTime")} · {tr(pack.leadTime)}
            </p>
          </div>

          <div>
            <h3 className="text-[13px] uppercase tracking-[0.14em] text-muted">{t("design")}</h3>
            <p className="mt-1 text-[15px] leading-snug">{tr(demo.designNote)}</p>
          </div>
        </aside>
      </section>

      {/* ────────────── Inclus / seulement au-dessus ────────────── */}
      <section className="mt-14 grid gap-8 md:grid-cols-2">
        <div data-reveal="left">
          <h2 className="font-display text-2xl">{t("included")}</h2>
          <ul className="mt-4 space-y-2">
            {included.map((f) => {
              const v = f.values[pack.id];
              return (
                <li key={f.id} className="flex gap-3 border-b border-line pb-2 text-[15px]">
                  <span aria-hidden style={{ color: pack.accent }}>
                    ✓
                  </span>
                  <span>
                    {tr(f.label)}
                    {typeof v === "object" && (
                      <span className="block text-[14px] text-muted">{tr(v)}</span>
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        {missing.length > 0 && (
          <div data-reveal="right" style={{ ["--d" as string]: "70ms" }}>
            {/* Le mécanisme de montée en gamme : montrer ce qui manque, nommément. */}
            <h2 className="font-display text-2xl text-muted">{t("onlyAbove")}</h2>
            <ul className="mt-4 space-y-2">
              {missing.map((f) => (
                <li
                  key={f.id}
                  className="flex gap-3 border-b border-line pb-2 text-[15px] text-muted"
                >
                  <span aria-hidden>—</span>
                  <span>{tr(f.label)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* ────────────── Circulation latérale ────────────── */}
      <section className="mt-14 grid gap-8 md:grid-cols-2">
        {otherPacks.length > 0 && (
          <div data-reveal>
            <h2 className="text-[13px] uppercase tracking-[0.14em] text-muted">
              {t("sameTradeOther")}
            </h2>
            <ul className="mt-3 space-y-2">
              {otherPacks.map((d) => {
                const p = getPack(d.pack)!;
                return (
                  <li key={d.id}>
                    <Link
                      href={`/metiers/${vertical.slug}/${d.pack}`}
                      className="tap text-[16px] underline underline-offset-4 hover:no-underline"
                      style={{ color: p.accent }}
                    >
                      {tr(p.gridName)} — {d.businessName}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {otherTrades.length > 0 && (
          <div data-reveal style={{ ["--d" as string]: "70ms" }}>
            <h2 className="text-[13px] uppercase tracking-[0.14em] text-muted">
              {t("samePackOther")}
            </h2>
            <ul className="mt-3 space-y-2">
              {otherTrades.map((d) => {
                const v = VERTICALS.find((x) => x.id === d.vertical)!;
                return (
                  <li key={d.id}>
                    <Link
                      href={`/metiers/${v.slug}/${d.pack}`}
                      className="tap text-[16px] underline underline-offset-4 hover:no-underline"
                    >
                      {tr(v.name)} — {d.businessName}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </section>

      <p className="mt-12 text-[14px] text-muted">{t("demoNote")}</p>
    </div>
  );
}
