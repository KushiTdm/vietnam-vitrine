"use client";

import Image from "next/image";
import { formatVnd } from "@/lib/registry";
import { agency } from "../showcase.config";
import { useLanguage } from "../components/LanguageProvider";
import {
  CRITERIA,
  EXCLUSIONS,
  GATE,
  GIFTS,
  KHOI_DAU,
  RULES,
  SERVICE_FEE_ITEMS,
  WEEKS,
} from "./data";

export default function GiftPage() {
  const { t, tr } = useLanguage();

  return (
    <>
      {/* ────────────── L'annonce ────────────── */}
      <section className="bg-deep text-on-deep">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:py-20 lg:grid-cols-[1fr_22rem] lg:items-center">
          <div className="flex flex-col gap-7">
            <p className="text-[13px] uppercase tracking-[0.24em] text-[rgba(243,237,227,0.7)]">
              {t("giftKicker")}
            </p>

            <h1 className="max-w-2xl font-display text-[2.3rem] leading-[1.1] sm:text-5xl md:text-6xl">
              {t("giftHeroTitle")}
            </h1>

            <div>
              <p className="font-display text-gold text-[2.75rem] leading-none sm:text-6xl md:text-[4.5rem]">
                {formatVnd(KHOI_DAU.price!)}
              </p>
              <p className="mt-2 text-[13px] uppercase tracking-[0.14em] text-[rgba(243,237,227,0.7)]">
                {t("giftValueCaption")}
              </p>
            </div>

            <p className="max-w-xl text-[17px] leading-relaxed text-[rgba(243,237,227,0.85)]">
              {t("giftHeroLead")}
            </p>

            <div className="flex flex-wrap gap-3">
              <a
                href="#tham-gia"
                className="tap rounded-full bg-gold px-6 text-[15px] font-medium text-deep transition-opacity hover:opacity-90"
              >
                {t("giftCtaSteps")}
              </a>
              <a
                href="#dieu-kien"
                className="tap rounded-full border border-[rgba(243,237,227,0.3)] px-6 text-[15px] font-medium transition-colors hover:border-on-deep"
              >
                {t("giftCtaTerms")}
              </a>
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-[rgba(243,237,227,0.7)]">
              <span>28/09/2026 → 22/11/2026</span>
              <span aria-hidden>·</span>
              <span>{t("giftRun")}</span>
            </div>

            <p className="max-w-xl border-t border-[rgba(243,237,227,0.18)] pt-5 text-[13px] leading-relaxed text-[rgba(243,237,227,0.65)]">
              * {t("giftFootnote")}{" "}
              <a href="#dieu-kien" className="underline underline-offset-4 hover:text-on-deep">
                {t("giftFootnoteLink")}
              </a>
            </p>
          </div>

          <div className="relative mx-auto aspect-[4/5] w-full max-w-xs overflow-hidden rounded-2xl lg:max-w-none">
            <Image
              src="/vitrine/qua-tang-hero-affiche.webp"
              alt={t("giftHeroImageAlt")}
              fill
              preload
              sizes="(max-width: 1024px) 20rem, 22rem"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* ────────────── Ce qui est offert ────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 md:py-20">
        <p className="text-[13px] uppercase tracking-[0.2em] text-muted" data-reveal>
          {t("giftReceivesKicker")}
        </p>
        <h2 className="mt-2 font-display text-3xl md:text-4xl" data-reveal style={{ ["--d" as string]: "40ms" }}>
          {t("giftReceivesTitle")}
        </h2>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {GIFTS.map((g, i) => (
            <div
              key={g.title.vi}
              className="rounded-2xl border border-line bg-white p-5"
              data-reveal
              style={{ ["--d" as string]: `${80 + i * 60}ms` }}
            >
              <h3 className="text-[13px] font-medium uppercase tracking-[0.1em] text-gold">{tr(g.title)}</h3>
              <p className="mt-2 text-[15px] leading-snug">{tr(g.body)}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-baseline justify-between gap-3 rounded-2xl bg-[rgba(184,137,43,0.08)] px-5 py-4">
          <p className="text-[15px] font-medium">{t("giftTotalLabel")}</p>
          <p className="font-display text-2xl text-gold">{formatVnd(KHOI_DAU.price!)}</p>
        </div>
      </section>

      {/* ────────────── Cách tham gia ────────────── */}
      <section id="tham-gia" className="border-y border-line bg-white/60">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 md:py-20">
          <p className="text-[13px] uppercase tracking-[0.2em] text-muted" data-reveal>
            {t("giftHowKicker")}
          </p>
          <h2 className="mt-2 font-display text-3xl md:text-4xl" data-reveal style={{ ["--d" as string]: "40ms" }}>
            {t("giftHowTitle")}
          </h2>

          <div className="mt-8 grid gap-8 lg:grid-cols-3 lg:items-center">
            <div className="flex gap-4" data-reveal="left">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink text-[15px] font-medium text-ground">
                1
              </span>
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 pt-1.5">
                <p className="text-[16px]">{t("giftStep1")}</p>
                <a
                  href={agency.socials.facebook}
                  target="_blank"
                  rel="noreferrer"
                  className="tap text-[14px] font-medium underline underline-offset-4 hover:no-underline"
                >
                  {agency.name} ↗
                </a>
              </div>
            </div>

            <div className="relative mx-auto aspect-[3/2] w-full overflow-hidden rounded-2xl" data-reveal>
              <Image
                src="/vitrine/qua-tang-remise.webp"
                alt={t("giftHowImageAlt")}
                fill
                sizes="(max-width: 1024px) 100vw, 33vw"
                className="object-cover"
              />
            </div>

            <div className="flex gap-4" data-reveal="right" style={{ ["--d" as string]: "60ms" }}>
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink text-[15px] font-medium text-ground">
                2
              </span>
              <div className="min-w-0 flex-1">
                <p className="pt-1.5 text-[16px]">{t("giftStep2")}</p>
                <div className="mt-3 rounded-xl border border-line bg-white p-4 text-[14px] leading-relaxed text-muted">
                  <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-muted">
                    {t("giftCommentLabel")}
                  </p>
                  <p className="mt-1.5 italic text-ink">{t("giftCommentExample")}</p>
                </div>
                <p className="mt-2 text-[13px] text-muted">{t("giftNominateNote")}</p>
              </div>
            </div>
          </div>

          <p className="mt-6 flex items-baseline gap-2 rounded-xl bg-[rgba(184,137,43,0.08)] px-4 py-3 text-[14px]">
            <span aria-hidden className="text-gold">
              ✓
            </span>
            <span>{t("giftNoShare")}</span>
          </p>
        </div>
      </section>

      {/* ────────────── Comment le choix est fait ────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 md:py-20">
        <p className="text-[13px] uppercase tracking-[0.2em] text-muted" data-reveal>
          {t("giftCriteriaKicker")}
        </p>
        <h2 className="mt-2 font-display text-3xl md:text-4xl" data-reveal style={{ ["--d" as string]: "40ms" }}>
          {t("giftCriteriaTitle")}
        </h2>
        <p className="mt-2 max-w-xl text-[16px] text-muted" data-reveal style={{ ["--d" as string]: "60ms" }}>
          {t("giftCriteriaLead")}
        </p>

        {/* Prérequis : un bloc à part, jamais dans la liste à barres pondérées — voir
            le commentaire sur `GATE` plus haut dans ce fichier. La conséquence de son
            absence est écrite en toutes lettres, pas laissée à un mot isolé. */}
        <div className="mt-8 max-w-2xl">
          <p className="text-[13px] font-medium uppercase tracking-[0.14em] text-muted">
            {t("giftCriteriaGateKicker")}
          </p>
          <div className="mt-3 flex items-start gap-3 rounded-xl border border-line bg-white p-4">
            <span
              aria-hidden
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink text-[13px] font-medium text-ground"
            >
              ✓
            </span>
            <p className="pt-0.5 text-[15px] font-medium">{tr(GATE.label)}</p>
          </div>
          <p className="mt-2 text-[13px] leading-relaxed text-muted">{t("giftCriteriaGateNote")}</p>
        </div>

        <p
          className="mt-9 max-w-2xl text-[13px] font-medium uppercase tracking-[0.14em] text-muted"
          data-reveal
        >
          {t("giftCriteriaThenLabel")}
        </p>

        <div className="mt-4 flex max-w-2xl flex-col gap-5">
          {CRITERIA.map((c) => (
            <div key={c.label.vi}>
              <div className="flex items-baseline justify-between gap-4">
                <p className="text-[15px]">{tr(c.label)}</p>
                <p className="whitespace-nowrap text-[13px] font-medium text-muted">{c.weight}%</p>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-line">
                <div className="h-full rounded-full bg-gold" style={{ width: `${c.weight}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ────────────── Lịch chương trình ────────────── */}
      <section className="border-y border-line bg-white/60">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 md:py-20">
          <p className="text-[13px] uppercase tracking-[0.2em] text-muted" data-reveal>
            {t("giftCalendarKicker")}
          </p>
          <h2 className="mt-2 font-display text-3xl md:text-4xl" data-reveal style={{ ["--d" as string]: "40ms" }}>
            {t("giftCalendarTitle")}
          </h2>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {WEEKS.map((w) => (
              <div
                key={w.n}
                className={`rounded-xl border p-3.5 ${
                  w.flag ? "border-[rgba(184,137,43,0.35)] bg-[rgba(184,137,43,0.08)]" : "border-line bg-white"
                }`}
              >
                <p className="text-[11px] uppercase tracking-[0.1em] text-muted">
                  {t("giftWeekLabel")} {w.n}/8
                </p>
                <p className="font-display text-lg">{w.date}</p>
                <p className={`mt-1 text-[13px] leading-snug ${w.flag ? "text-gold" : "text-muted"}`}>
                  {tr(w.theme)}
                </p>
              </div>
            ))}
          </div>

          <p className="mt-5 max-w-2xl text-[13px] text-muted">{t("giftCalendarNote")}</p>
        </div>
      </section>

      {/* ────────────── Bandeau ────────────── */}
      <section className="relative isolate h-64 overflow-hidden sm:h-80">
        <Image
          src="/vitrine/qua-tang-bande-pho-toi.webp"
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-deep/55" />
        <div className="relative mx-auto flex h-full max-w-6xl items-center px-4 sm:px-6">
          <p className="font-display text-2xl text-on-deep sm:text-3xl">{t("giftBandeauCaption")}</p>
        </div>
      </section>

      {/* ────────────── Điều kiện ────────────── */}
      <section id="dieu-kien" className="mx-auto max-w-6xl px-4 py-14 sm:px-6 md:py-20">
        <p className="text-[13px] uppercase tracking-[0.2em] text-muted" data-reveal>
          {t("giftTermsKicker")}
        </p>
        <h2 className="mt-2 font-display text-3xl md:text-4xl" data-reveal style={{ ["--d" as string]: "40ms" }}>
          {t("giftTermsTitle")}
        </h2>
        <p className="mt-2 max-w-xl text-[16px] text-muted" data-reveal style={{ ["--d" as string]: "60ms" }}>
          {t("giftTermsLead")}
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <div className="rounded-2xl border border-line bg-white p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h3 className="text-[16px] font-medium">{t("giftServiceFeeTitle")}</h3>
              <p className="whitespace-nowrap font-display text-xl text-gold">{t("giftServiceFeeAmount")}</p>
            </div>
            <p className="mt-3 text-[14px] leading-relaxed text-muted">{t("giftServiceFeeNote")}</p>

            <details className="mt-4 border-t border-line pt-3">
              <summary className="cursor-pointer text-[12px] font-medium uppercase tracking-[0.08em] text-muted">
                {t("giftServiceFeeDetails")}
              </summary>
              <ul className="mt-3 space-y-1.5 text-[14px] text-muted">
                {SERVICE_FEE_ITEMS.map((item) => (
                  <li key={item.vi} className="flex items-baseline justify-between gap-4">
                    <span>{tr(item)}</span>
                    <span aria-hidden className="text-ink">
                      ✓
                    </span>
                  </li>
                ))}
              </ul>
            </details>
          </div>

          <div className="rounded-2xl border border-line bg-white p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h3 className="text-[16px] font-medium">{t("giftDomainTitle")}</h3>
              <p className="whitespace-nowrap font-display text-xl text-gold">{t("giftDomainAmount")}</p>
            </div>
            <p className="mt-3 text-[14px] leading-relaxed text-muted">{t("giftDomainNote")}</p>
          </div>
        </div>

        <div className="mt-10">
          <h3 className="font-display text-2xl">{t("giftExclusionsTitle")}</h3>
          <p className="mt-2 max-w-xl text-[15px] text-muted">{t("giftExclusionsLead")}</p>

          <ul className="mt-5">
            {EXCLUSIONS.map((x) => (
              <li
                key={x.what.vi}
                className="flex items-baseline justify-between gap-4 border-b border-line py-2.5 text-[15px]"
              >
                <span>{tr(x.what)}</span>
                <span className="whitespace-nowrap text-[13px] font-medium text-muted">
                  {"pack" in x.where ? tr(x.where.pack.gridName) : x.where.text}
                </span>
              </li>
            ))}
          </ul>

          <p className="mt-4 text-[14px] text-muted">{t("giftFixNote")}</p>
        </div>
      </section>

      {/* ────────────── Thể lệ chương trình ────────────── */}
      <section className="border-y border-line bg-white/60">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 md:py-20">
          <p className="text-[13px] uppercase tracking-[0.2em] text-muted" data-reveal>
            {t("giftRulesKicker")}
          </p>
          <h2 className="mt-2 font-display text-3xl md:text-4xl" data-reveal style={{ ["--d" as string]: "40ms" }}>
            {t("giftRulesTitle")}
          </h2>

          <ol className="mt-8 grid gap-x-6 gap-y-6 sm:grid-cols-2">
            {RULES.map((r, i) => (
              <li key={r.title.vi} className="border-t border-line pt-4">
                <span className="font-display text-xl text-gold">{String(i + 1).padStart(2, "0")}</span>
                <p className="mt-1 text-[15px] font-medium">{tr(r.title)}</p>
                <p className="mt-1 text-[14px] leading-relaxed text-muted">{tr(r.body)}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ────────────── Mention obligatoire ────────────── */}
      <p className="mx-auto max-w-6xl px-4 pb-14 text-[13px] text-muted sm:px-6">{t("giftMetaDisclaimer")}</p>
    </>
  );
}
