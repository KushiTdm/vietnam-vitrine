"use client";

import Link from "next/link";
import { PROCESS } from "@/lib/registry";
import { agency } from "../showcase.config";
import { useLanguage } from "./LanguageProvider";

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
          <div className="flex gap-5">
            <Link href="/qua-tang" className="tap text-gold underline underline-offset-4 hover:text-on-deep">
              {t("navGift")}
            </Link>
            <Link href="/packs" className="tap underline underline-offset-4 hover:text-on-deep">
              {t("navPacks")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
