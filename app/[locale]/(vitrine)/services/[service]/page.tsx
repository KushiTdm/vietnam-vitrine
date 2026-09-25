"use client";

import { notFound } from "next/navigation";
import { use } from "react";
import {
  NOT_INCLUDED_NOTE,
  approxUsd,
  formatVnd,
  getService,
} from "@/lib/registry";
import { agency } from "../../showcase.config";
import { useLanguage, LocalizedLink as Link } from "../../components/LanguageProvider";

/**
 * Page d'une prestation — application Android, automatisation, intégration
 * d'IA. Transposition des pages de service de neuraweb.fr, dont elle garde la
 * progression (la douleur, puis ce qu'on livre, puis le prix, puis les
 * objections) mais rien de l'habillage : ici, papier chaud, encre profonde et
 * or, comme le reste de la vitrine. Le bleu nuit du site français ne dit rien
 * à un gérant de quán ăn.
 *
 * Tout le contenu vient de `lib/registry/services.ts` — le même fichier que
 * lit le chatbot. Une prestation ajoutée là apparaît ici sans une ligne à
 * écrire, et surtout : la page et l'assistant ne peuvent pas se contredire.
 */
export default function ServicePage({
  params,
}: {
  params: Promise<{ locale: string; service: string }>;
}) {
  const { service: slug } = use(params);
  const { t, tr } = useLanguage();

  const service = getService(slug);
  if (!service) notFound();

  return (
    <>
      {/* ────────────── La prestation ────────────── */}
      <section className="mx-auto max-w-6xl px-4 pb-10 pt-10 sm:px-6 md:pt-16">
        <Link href="/#services" className="tap text-[14px] text-muted hover:text-ink">
          ← {t("navServices")}
        </Link>

        <div className="mt-4 flex items-start gap-4">
          <span
            aria-hidden="true"
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-[26px]"
            style={{ background: `${service.accent}1a` }}
          >
            {service.icon}
          </span>
          <div>
            <p className="text-[13px] uppercase tracking-[0.18em] text-muted">
              {t("servicesEyebrow")}
            </p>
            <h1 className="mt-1 font-display text-[2rem] leading-tight sm:text-5xl">
              {tr(service.name)}
            </h1>
          </div>
        </div>

        <p className="mt-5 max-w-2xl font-display text-[22px] leading-snug text-ink sm:text-[26px]">
          {tr(service.promise)}
        </p>

        <div className="mt-7 flex flex-wrap items-center gap-3">
          <a
            href={`https://zalo.me/${agency.zalo}`}
            target="_blank"
            rel="noreferrer"
            className="tap rounded-full bg-ink px-6 text-[15px] font-medium text-ground transition-opacity hover:opacity-90"
          >
            {t("zalo")}
          </a>
          <Link
            href="/packs"
            className="tap rounded-full border border-line px-6 text-[15px] font-medium transition-colors hover:border-ink"
          >
            {t("navPacks")}
          </Link>
        </div>
      </section>

      {/* ────────────── Ce qui coince ────────────── */}
      <section className="border-y border-line bg-white/60">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-16">
          <h2 className="font-display text-3xl" data-reveal>
            {t("serviceProblems")}
          </h2>
          <ul className="mt-6 grid gap-x-8 gap-y-5 md:grid-cols-3">
            {service.problems.map((problem, i) => (
              <li key={i} className="border-t border-line pt-4" data-reveal>
                <span className="font-display text-2xl" style={{ color: service.accent }}>
                  {i + 1}
                </span>
                <p className="mt-1 text-[16px] leading-snug text-ink">{tr(problem)}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ────────────── Ce qu'on livre ────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-16">
        <h2 className="font-display text-3xl" data-reveal>
          {t("serviceWhat")}
        </h2>
        <ul className="mt-6 grid gap-x-8 gap-y-4 md:grid-cols-2">
          {service.bullets.map((bullet, i) => (
            <li key={i} className="flex gap-3 text-[16px] leading-snug" data-reveal>
              <span aria-hidden="true" style={{ color: service.accent }}>
                —
              </span>
              <span>{tr(bullet)}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* ────────────── À qui, et à qui pas ────────────── */}
      <section className="border-t border-line bg-white/60">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-2 md:py-16">
          <div data-reveal>
            <h2 className="font-display text-2xl">{t("serviceFor")}</h2>
            <p className="mt-3 text-[16px] leading-relaxed text-ink">{tr(service.forWhom)}</p>
          </div>
          {/* Dire quand ce n'est PAS le moment est ce qui rend le reste
              croyable — et c'est le ton du reste du site. */}
          <div data-reveal>
            <h2 className="font-display text-2xl text-muted">{t("serviceNotFor")}</h2>
            <p className="mt-3 text-[16px] leading-relaxed text-muted">
              {tr(service.notForWhom)}
            </p>
          </div>
        </div>
      </section>

      {/* ────────────── Le prix ────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-16">
        <h2 className="font-display text-3xl" data-reveal>
          {t("servicePrice")}
        </h2>
        <div
          className="mt-6 rounded-2xl border border-line p-6 md:p-8"
          style={{ background: `${service.accent}0d` }}
          data-reveal
        >
          <p className="font-display text-[2rem] leading-none sm:text-4xl">
            <span className="text-[16px] font-normal text-muted">{t("from")} </span>
            {formatVnd(service.floor)}
            <span className="ml-2 text-[15px] font-normal text-muted">
              {approxUsd(service.floor)}
            </span>
          </p>
          {service.monthly ? (
            <p className="mt-2 text-[16px] text-ink">
              + {formatVnd(service.monthly)}
              <span className="text-muted">{t("perMonth")}</span>
            </p>
          ) : null}
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted">
            {t("serviceQuote")}
          </p>
          <p className="mt-2 text-[14px] text-muted">{tr(NOT_INCLUDED_NOTE)}</p>
          <p className="mt-4 text-[15px]">
            <span className="text-muted">{t("serviceLead")} : </span>
            {tr(service.leadTime)}
          </p>
        </div>
      </section>

      {/* ────────────── Objections ────────────── */}
      <section className="border-t border-line bg-white/60">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-16">
          <h2 className="font-display text-3xl" data-reveal>
            {t("serviceFaq")}
          </h2>
          <dl className="mt-6 grid gap-x-10 gap-y-6 md:grid-cols-2">
            {service.faq.map((item, i) => (
              <div key={i} className="border-t border-line pt-4" data-reveal>
                <dt className="font-display text-[19px]">{tr(item.q)}</dt>
                <dd className="mt-2 text-[16px] leading-relaxed text-muted">{tr(item.a)}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </>
  );
}
