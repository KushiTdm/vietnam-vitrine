"use client";

import {
  ENTERPRISE_FLOOR,
  MODIFICATIONS_NOTE,
  MODIFICATIONS_SCOPE,
  NOT_INCLUDED,
  NOT_INCLUDED_TITLE,
  OPTIONS,
  PACKS,
  VERTICALS,
  getPack,
  publicDemosOf,
  formatVnd,
} from "@/lib/registry";
import { useLanguage, LocalizedLink as Link } from "../components/LanguageProvider";
import FeatureMatrix from "../components/FeatureMatrix";
import PriceTag from "../components/PriceTag";
import { PACK_VISUAL } from "../lib/pack-visuals";

export default function PacksPage() {
  const { t, tr } = useLanguage();

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6">
      <h1 className="font-display text-[2rem] leading-tight sm:text-5xl">{t("compareTitle")}</h1>
      <p className="mt-3 max-w-xl text-[16px] text-muted">{t("compareLead")}</p>

      {/* ────────────── Les quatre paliers ────────────── */}
      <section className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {PACKS.map((pack, i) => {
          const demos = publicDemosOf(pack.id);
          const visual = PACK_VISUAL[pack.id];
          return (
            <article
              key={pack.id}
              id={pack.id}
              className="flex scroll-mt-24 flex-col overflow-hidden rounded-2xl border border-line bg-white"
              data-reveal
              style={{ borderTop: `3px solid ${pack.accent}`, ["--d" as string]: `${i * 70}ms` }}
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-[rgba(22,20,15,0.04)]">
                <video
                  aria-hidden
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="none"
                  poster={visual.poster}
                  className="absolute inset-0 h-full w-full object-cover"
                >
                  <source src={visual.webm} type="video/webm" />
                  <source src={visual.mp4} type="video/mp4" />
                </video>
              </div>

              <div className="flex flex-1 flex-col p-5">
              <h2 className="font-display text-xl leading-tight">{tr(pack.gridName)}</h2>
              <p className="mt-2 text-[15px] leading-snug text-muted">{tr(pack.pitch)}</p>

              <div className="mt-5">
                <PriceTag pack={pack} />
              </div>

              {/* Toutes les démos de ce palier, tous métiers confondus. */}
              {demos.length > 0 && (
                <ul className="mt-5 space-y-1.5 border-t border-line pt-4">
                  {demos.map((d) => {
                    const v = VERTICALS.find((x) => x.id === d.vertical)!;
                    return (
                      <li key={d.id}>
                        <Link
                          href={`/metiers/${v.slug}/${d.pack}`}
                          className="tap text-[15px] underline underline-offset-4 hover:no-underline"
                        >
                          {tr(v.name)} — {d.businessName}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}

              {pack.price === null && (
                <p className="mt-5 border-t border-line pt-4 text-[14px] text-muted">
                  {t("from")} {formatVnd(ENTERPRISE_FLOOR)}
                </p>
              )}
              </div>
            </article>
          );
        })}
      </section>

      {/* ────────────── La matrice complète ────────────── */}
      <section className="mt-14" data-reveal>
        <FeatureMatrix />
      </section>

      {/* ────────────── Options et entretien ────────────── */}
      <section className="mt-14 grid gap-8 md:grid-cols-2">
        <div data-reveal="left">
          <h2 className="font-display text-2xl">{t("optionsTitle")}</h2>
          <ul className="mt-4">
            {OPTIONS.map((o) => (
              <li key={o.id} className="border-b border-line py-2.5 text-[15px]">
                {o.priceByPack ? (
                  // Prix variable selon le palier (l'espace de gestion, §2.1 du plan
                  // CMS) : une ligne par palier où c'est une OPTION — absent de cette
                  // liste sur Cao Cấp/Doanh Nghiệp puisqu'il y est inclus (matrice
                  // ci-dessus, ligne « Tự sửa nội dung & giá »).
                  <div>
                    <span>{tr(o.label)}</span>
                    <ul className="mt-1.5 space-y-1">
                      {Object.entries(o.priceByPack).map(([packId, price]) => {
                        const pack = getPack(packId);
                        if (!pack || price === undefined) return null;
                        return (
                          <li key={packId} className="flex items-baseline justify-between gap-4 text-[14px] text-muted">
                            <span>{tr(pack.gridName)}</span>
                            <span className="whitespace-nowrap font-medium text-ink">{formatVnd(price)}</span>
                          </li>
                        );
                      })}
                    </ul>
                    <p className="mt-1.5 text-[13px] italic text-muted">{t("optionByPackNote")}</p>
                  </div>
                ) : (
                  <div className="flex items-baseline justify-between gap-4">
                    <span>{tr(o.label)}</span>
                    <span className="whitespace-nowrap font-medium">
                      {o.price !== undefined && formatVnd(o.price)}
                      {o.unit && <span className="text-muted">{tr(o.unit)}</span>}
                    </span>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div data-reveal="right" style={{ ["--d" as string]: "70ms" }}>
          <h2 className="font-display text-2xl">{t("maintenanceTitle")}</h2>
          <p className="mt-2 text-[15px] text-muted">{t("maintenanceNote")}</p>
          <ul className="mt-4">
            {PACKS.filter((p) => p.yearlyMaintenance !== null).map((p) => (
              <li
                key={p.id}
                className="flex items-baseline justify-between gap-4 border-b border-line py-2.5 text-[15px]"
              >
                <span>{tr(p.gridName)}</span>
                <span className="whitespace-nowrap font-medium">
                  {formatVnd(p.yearlyMaintenance!)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ────────────── Non inclus dans le prix des packs ────────────── */}
      <section className="mt-14" data-reveal>
        <h2 className="font-display text-2xl">{tr(NOT_INCLUDED_TITLE)}</h2>
        <ul className="mt-4 max-w-2xl">
          {NOT_INCLUDED.map((item) => (
            <li key={item.id} className="border-b border-line py-3 text-[15px]">
              <div className="flex items-baseline justify-between gap-4">
                <span>{tr(item.label)}</span>
                <span className="whitespace-nowrap font-medium">
                  {formatVnd(item.amount)}
                  <span className="text-muted">{tr(item.unit)}</span>
                </span>
              </div>
              <p className="mt-1 text-[13px] leading-snug text-muted">{tr(item.note)}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* ────────────── Modifications après livraison (§2.2 du plan CMS) ────────────── */}
      <section className="mt-14" data-reveal>
        <h2 className="font-display text-2xl">{t("modificationsTitle")}</h2>
        <p className="mt-2 max-w-2xl text-[15px] text-muted">{t("modificationsLead")}</p>

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border border-line bg-white p-5">
            <h3 className="text-[13px] font-medium uppercase tracking-[0.14em] text-muted">
              {t("scopeIncludedTitle")}
            </h3>
            <ul className="mt-3 space-y-2 text-[15px]">
              {MODIFICATIONS_SCOPE.included.map((item, i) => (
                <li key={i} className="flex gap-2">
                  <span aria-hidden>✅</span>
                  <span>{tr(item)}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-line bg-white p-5">
            <h3 className="text-[13px] font-medium uppercase tracking-[0.14em] text-muted">
              {t("scopeExcludedTitle")}
            </h3>
            <ul className="mt-3 space-y-2 text-[15px]">
              {MODIFICATIONS_SCOPE.excluded.map((item, i) => (
                <li key={i} className="flex gap-2">
                  <span aria-hidden>❌</span>
                  <span>{tr(item)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="mt-4 text-[14px] text-muted">{tr(MODIFICATIONS_NOTE)}</p>
      </section>
    </div>
  );
}
