"use client";

import { PROCESS } from "@/lib/registry";
import { agency } from "../showcase.config";
import { useLanguage, LocalizedLink as Link } from "./LanguageProvider";

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-5 w-5">
      <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.51 1.49-3.9 3.77-3.9 1.09 0 2.24.2 2.24.2v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.44 2.91h-2.34V22c4.78-.76 8.44-4.92 8.44-9.94Z" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-5 w-5">
      <path d="M18.24 2H21l-6.4 7.32L22.14 22H16.2l-4.65-6.08L6.2 22H3.42l6.85-7.83L2.4 2h6.08l4.2 5.56L18.24 2Zm-1.06 18.17h1.53L7.9 3.74H6.26l10.92 16.43Z" />
    </svg>
  );
}

export default function SiteFooter() {
  const { t, tr } = useLanguage();

  return (
    <footer className="bg-deep text-on-deep">
      {/* ---------- Quy trình ---------- */}
      <section id="quy-trinh" className="mx-auto max-w-6xl px-4 py-14 sm:px-6 md:py-20">
        <h2 className="font-display text-3xl md:text-4xl">{t("processTitle")}</h2>
        <p className="mt-2 max-w-xl text-[16px] text-[rgba(243,237,227,0.7)]">
          {t("processLead")}
        </p>

        <ol className="mt-8 grid gap-x-6 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
          {PROCESS.map((step) => (
            <li key={step.step} className="border-t border-[rgba(243,237,227,0.2)] pt-4">
              <span className="font-display text-2xl text-gold">{step.step}</span>
              <p className="mt-1 text-[16px] leading-snug">{tr(step.label)}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ---------- Contact ---------- */}
      <section className="border-t border-[rgba(243,237,227,0.14)]">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-12 sm:px-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="font-display text-3xl">{t("contactTitle")}</h2>
            <p className="mt-2 max-w-md text-[16px] text-[rgba(243,237,227,0.7)]">
              {t("contactLead")}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <a
              href={`https://zalo.me/${agency.zalo}`}
              target="_blank"
              rel="noreferrer"
              className="tap rounded-full bg-gold px-6 text-[15px] font-medium text-deep transition-opacity hover:opacity-90"
            >
              {t("zalo")}
            </a>
            <a
              href={`tel:${agency.phone}`}
              className="tap rounded-full border border-[rgba(243,237,227,0.3)] px-6 text-[15px] font-medium transition-colors hover:border-on-deep"
            >
              {t("call")} · {agency.phoneDisplay}
            </a>
          </div>
        </div>
      </section>

      <div className="border-t border-[rgba(243,237,227,0.14)]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-6 text-[14px] text-[rgba(243,237,227,0.6)] sm:px-6">
          <p>
            {agency.name} · {agency.city}
          </p>
          <div className="flex items-center gap-5">
            <Link href="/qua-tang" className="tap text-gold underline underline-offset-4 hover:text-on-deep">
              {t("navGift")}
            </Link>
            <Link href="/packs" className="tap underline underline-offset-4 hover:text-on-deep">
              {t("navPacks")}
            </Link>
            <div className="flex items-center gap-3">
              <a
                href={agency.socials.facebook}
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="tap text-[rgba(243,237,227,0.6)] transition-colors hover:text-on-deep"
              >
                <FacebookIcon />
              </a>
              <a
                href={agency.socials.x}
                target="_blank"
                rel="noreferrer"
                aria-label="X (Twitter)"
                className="tap text-[rgba(243,237,227,0.6)] transition-colors hover:text-on-deep"
              >
                <XIcon />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
