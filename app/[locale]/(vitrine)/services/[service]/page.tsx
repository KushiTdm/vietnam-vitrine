"use client";

import Image from "next/image";
import { notFound } from "next/navigation";
import { use } from "react";
import {
  ABOUT,
  NOT_INCLUDED_NOTE,
  approxUsd,
  formatVnd,
  getService,
} from "@/lib/registry";
import { agency } from "../../showcase.config";
import { useLanguage, LocalizedLink as Link } from "../../components/LanguageProvider";
import LoopVideo from "../../components/LoopVideo";

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
 *
 * Le bas de page est propre à chaque prestation : cas concrets, puis
 * calendrier avec ses délais réels. Le pied de page global, lui, raconte le
 * déroulé d'un site en sept jours — il s'efface ici (voir SiteFooter).
 *
 * Les visuels viennent eux aussi du registre (`hero`, `banner`, `cases[].image`,
 * `process[].image`). Une scène générée avec des personnes porte la légende
 * « illustration » ; une nature morte n'en a pas besoin. Aucune image ici ne
 * montre une interface : les écrans sont des captures réelles ou du HTML, pas
 * une image générée.
 */

/** La légende d'honnêteté posée sur une scène générée. */
function IllustrationBadge({ label }: { label: string }) {
  return (
    <span className="absolute bottom-3 left-3 rounded-full bg-[rgba(20,18,14,0.62)] px-3 py-1 text-[12px] text-on-deep">
      {label}
    </span>
  );
}

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

        <div className="mt-4 grid gap-10 lg:grid-cols-2 lg:items-stretch">
          <div className="flex min-w-0 flex-col justify-center">
            <p
              className="text-[13px] font-medium uppercase tracking-[0.18em]"
              style={{ color: service.accent }}
            >
              {t("servicesEyebrow")}
            </p>
            <h1 className="mt-2 font-display text-[2rem] leading-tight sm:text-5xl">
              {tr(service.name)}
            </h1>

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
          </div>

          {/* Même panneau que le héros de l'accueil : étiré sur la hauteur du
              texte à partir de lg, en 3:2 en dessous. Le sujet reste dans les
              60 % centraux : le recadrage `object-cover` y est presque carré. */}
          <div className="relative aspect-[3/2] w-full overflow-hidden rounded-2xl border border-line bg-[rgba(22,20,15,0.04)] lg:aspect-auto lg:min-h-[26rem]">
            {service.hero.video ? (
              <LoopVideo
                name={service.hero.image}
                alt={tr(service.hero.alt)}
                sizes="(max-width: 1024px) 100vw, 576px"
                preload
                focus={service.hero.focus}
              />
            ) : (
              <Image
                src={`/vitrine/${service.hero.image}.webp`}
                alt={tr(service.hero.alt)}
                fill
                sizes="(max-width: 1024px) 100vw, 576px"
                preload
                className="object-cover"
                style={service.hero.focus ? { objectPosition: service.hero.focus } : undefined}
              />
            )}
            {service.hero.illustration ? <IllustrationBadge label={t("imageIllustration")} /> : null}
          </div>
        </div>
      </section>

      {/* ────────────── Ce qui coince ────────────── */}
      <section className="border-y border-line bg-white/60">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-16">
          <h2 className="font-display text-3xl" data-reveal>
            {t("serviceProblems")}
          </h2>
          {service.banner.at === "problems" ? (
            <div
              className="relative mt-6 aspect-[16/9] w-full overflow-hidden rounded-2xl border border-line bg-[rgba(22,20,15,0.04)] sm:aspect-[21/9]"
              data-reveal
            >
              <Image
                src={`/vitrine/${service.banner.image}.webp`}
                alt={tr(service.banner.alt)}
                fill
                sizes="(max-width: 1152px) 100vw, 1152px"
                className="object-cover"
                style={service.banner.focus ? { objectPosition: service.banner.focus } : undefined}
              />
              {service.banner.illustration ? <IllustrationBadge label={t("imageIllustration")} /> : null}
            </div>
          ) : null}
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
        <div
          className={
            service.banner.at === "deliverables"
              ? "mt-6 grid gap-8 md:grid-cols-2 md:items-center"
              : "mt-6"
          }
        >
          <ul
            className={
              service.banner.at === "deliverables"
                ? "grid gap-y-4"
                : "grid gap-x-8 gap-y-4 md:grid-cols-2"
            }
          >
            {service.bullets.map((bullet, i) => (
              <li key={i} className="flex gap-3 text-[16px] leading-snug" data-reveal>
                <span aria-hidden="true" style={{ color: service.accent }}>
                  —
                </span>
                <span>{tr(bullet)}</span>
              </li>
            ))}
          </ul>

          {service.banner.at === "deliverables" ? (
            <div
              className="relative aspect-[3/2] w-full overflow-hidden rounded-2xl border border-line bg-[rgba(22,20,15,0.04)]"
              data-reveal
            >
              <Image
                src={`/vitrine/${service.banner.image}.webp`}
                alt={tr(service.banner.alt)}
                fill
                sizes="(max-width: 768px) 100vw, 560px"
                className="object-cover"
                style={service.banner.focus ? { objectPosition: service.banner.focus } : undefined}
              />
              {service.banner.illustration ? <IllustrationBadge label={t("imageIllustration")} /> : null}
            </div>
          ) : null}
        </div>

        {/* Des captures RÉELLES du produit, quand il existe : c'est la seule chose
            de la page qu'aucun générateur d'images ne peut fournir. La mention dit
            qu'elles ne sont pas retouchées et que l'assistant peut se tromper. */}
        {service.proof ? (
          <div className="mt-12">
            <ul className="grid justify-items-center gap-8 sm:grid-cols-3 sm:justify-items-stretch">
              {service.proof.items.map((item, i) => (
                <li
                  key={item.image}
                  className="w-full max-w-[320px] sm:max-w-none"
                  style={{ ["--d" as string]: `${i * 80}ms` }}
                  data-reveal
                >
                  <div className="relative aspect-[720/1064] w-full overflow-hidden rounded-2xl border border-line bg-white shadow-[0_8px_30px_rgba(22,20,15,0.08)]">
                    <Image
                      src={`/vitrine/${item.image}.webp`}
                      alt={tr(item.alt)}
                      fill
                      sizes="(max-width: 640px) 320px, 360px"
                      className="object-cover"
                    />
                  </div>
                  <p className="mt-3 text-[14px] leading-snug text-muted">{tr(item.caption)}</p>
                </li>
              ))}
            </ul>
            <p className="mt-6 max-w-2xl text-[13px] leading-relaxed text-muted">{tr(service.proof.note)}</p>
          </div>
        ) : null}
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

      {/* ────────────── Le prix, formule par formule ──────────────
          Un seul « à partir de » ne dit pas assez : une app de fidélité et une
          app pour une force de vente ne sont pas le même chantier. Chaque
          formule porte son prix ET son délai — c'est ce qui remplace le « 7
          jours » des sites, faux ici. */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-16">
        <h2 className="font-display text-3xl" data-reveal>
          {t("servicePrice")}
        </h2>
        <p className="mt-2 max-w-xl text-[16px] text-muted" data-reveal>
          {t("serviceTiersLead")}
        </p>

        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {service.tiers.map((tier, i) => (
            <div
              key={tier.id}
              className="flex flex-col rounded-2xl border border-line p-6"
              style={{ background: `${service.accent}0d`, ["--d" as string]: `${i * 60}ms` }}
              data-reveal
            >
              <h3 className="font-display text-[21px] leading-tight">{tr(tier.name)}</h3>
              <p className="mt-2 text-[15px] leading-snug text-muted">{tr(tier.scope)}</p>
              <p className="mt-auto pt-5 font-display text-[1.7rem] leading-none">
                <span className="text-[15px] font-normal text-muted">{t("from")} </span>
                {formatVnd(tier.floor)}
                <span className="ml-2 text-[14px] font-normal text-muted">
                  {approxUsd(tier.floor)}
                </span>
              </p>
              {tier.monthly ? (
                <p className="mt-2 text-[15px] text-ink">
                  + {formatVnd(tier.monthly)}
                  <span className="text-muted">{t("perMonth")}</span>
                </p>
              ) : null}
              <p className="mt-3 border-t border-line pt-3 text-[14px]">
                <span className="text-muted">{t("serviceLead")} : </span>
                {tr(tier.leadTime)}
              </p>
            </div>
          ))}
        </div>

        {/* Qui travaille avec vous : une illustration, jamais une photo générée qui ferait
            passer un visage inventé pour « la personne derrière le devis ». */}
        <div className="mt-10 flex flex-col items-center gap-6 rounded-2xl border border-line bg-white/60 p-5 sm:flex-row sm:gap-8" data-reveal>
          <div className="relative aspect-[4/3] w-full max-w-[320px] shrink-0 overflow-hidden rounded-xl bg-[rgba(22,20,15,0.04)] sm:w-[280px]">
            <Image
              src={`/vitrine/${ABOUT.image}.webp`}
              alt={tr(ABOUT.alt)}
              fill
              sizes="(max-width: 640px) 320px, 280px"
              className="object-cover"
            />
            <IllustrationBadge label={t("imageIllustration")} />
          </div>
          <div>
            <p className="text-[13px] font-medium uppercase tracking-[0.14em]" style={{ color: service.accent }}>
              {tr(ABOUT.eyebrow)}
            </p>
            <p className="mt-2 max-w-xl font-display text-[20px] leading-snug text-ink">{tr(ABOUT.text)}</p>
          </div>
        </div>

        <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-muted">{t("serviceQuote")}</p>
        <p className="mt-2 text-[14px] text-muted">{tr(NOT_INCLUDED_NOTE)}</p>
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

      {/* ────────────── Cas concrets ──────────────
          Des situations types, dans des secteurs volontairement variés : un
          visiteur qui n'est ni café ni salon doit se reconnaître quelque part.
          Ce ne sont PAS des références clients — la note le dit, et aucun
          résultat chiffré n'est avancé. */}
      <section className="border-t border-line">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-16">
          <h2 className="font-display text-3xl" data-reveal>
            {t("serviceCasesTitle")}
          </h2>
          <p className="mt-2 max-w-xl text-[15px] text-muted" data-reveal>
            {t("serviceCasesNote")}
          </p>

          <ul className="mt-6 grid gap-5 md:grid-cols-2">
            {service.cases.map((item, i) => (
              <li
                key={i}
                className="overflow-hidden rounded-2xl border border-line bg-white/60"
                style={{ ["--d" as string]: `${i * 60}ms` }}
                data-reveal
              >
                {/* Des objets du secteur, pas un client : le secteur est écrit
                    juste dessous, d'où l'alt vide. */}
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-[rgba(22,20,15,0.04)]">
                  <Image
                    src={`/vitrine/${item.image}.webp`}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 100vw, 576px"
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <p
                    className="text-[13px] font-medium uppercase tracking-[0.14em]"
                    style={{ color: service.accent }}
                  >
                    {tr(item.sector)}
                  </p>
                  <p className="mt-4 text-[13px] uppercase tracking-[0.12em] text-muted">
                    {t("serviceCaseSituation")}
                  </p>
                  <p className="mt-1 text-[16px] leading-snug text-ink">{tr(item.situation)}</p>
                  <p className="mt-4 text-[13px] uppercase tracking-[0.12em] text-muted">
                    {t("serviceCaseBuilt")}
                  </p>
                  <p className="mt-1 text-[16px] leading-snug text-ink">{tr(item.built)}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ────────────── Le calendrier de CETTE prestation ──────────────
          Même bande sombre que le pied de page, dont elle prend la place sur
          les pages de prestation (SiteFooter la masque sous /services/) : le
          calendrier du footer est celui des sites — « 7 jours » — et
          mentirait sous une application ou une automatisation. L'ancre
          #quy-trinh est reprise pour que le lien du menu continue de tomber
          sur le bon calendrier. */}
      <section id="quy-trinh" className="bg-deep text-on-deep">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 md:py-20">
          <h2 className="font-display text-3xl md:text-4xl">{t("serviceProcessTitle")}</h2>
          <p className="mt-2 max-w-xl text-[16px] text-[rgba(243,237,227,0.7)]">
            {t("serviceProcessLead")}
          </p>

          <ol className="mt-8 grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
            {service.process.map((step, i) => (
              <li key={i} className="flex flex-col border-t border-[rgba(243,237,227,0.2)] pt-4">
                <div className="flex items-baseline gap-3">
                  <span className="font-display text-2xl text-gold">{i + 1}</span>
                  <span className="text-[12px] font-medium uppercase tracking-[0.14em] text-gold">
                    {tr(step.when)}
                  </span>
                </div>
                <p className="mt-2 text-[17px] font-medium leading-snug">{tr(step.title)}</p>
                <p className="mt-2 text-[15px] leading-relaxed text-[rgba(243,237,227,0.7)]">
                  {tr(step.detail)}
                </p>
                {/* Sous le texte et calée en bas : l'étape 3 n'a pas de vignette
                    (elle varie selon la prestation), et un texte qui démarre plus
                    haut que ses voisines se voit bien plus qu'un bas de colonne vide. */}
                {step.image ? (
                  <div className="mt-auto pt-5">
                    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl">
                      <Image
                        src={`/vitrine/${step.image}.webp`}
                        alt=""
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 280px"
                        className="object-cover"
                      />
                    </div>
                  </div>
                ) : null}
              </li>
            ))}
          </ol>
          {service.process.some((step) => step.image) ? (
            <p className="mt-6 text-[12px] text-[rgba(243,237,227,0.55)]">{t("imageIllustration")}</p>
          ) : null}
        </div>
      </section>
    </>
  );
}
