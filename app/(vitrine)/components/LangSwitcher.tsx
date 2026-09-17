"use client";

import { LOCALES, useLanguage } from "./LanguageProvider";

/**
 * Le sélecteur de langue est un argument de vente autant qu'une commodité : il montre
 * en un geste que le site parle aux clients vietnamiens ET aux touristes. Il reste
 * donc visible en permanence, y compris sur 320 px.
 */
export default function LangSwitcher({ tone = "light" }: { tone?: "light" | "dark" }) {
  const { locale, setLocale, t } = useLanguage();
  const on = tone === "dark";

  return (
    <div
      role="group"
      aria-label={t("lang")}
      className={`flex items-center gap-0.5 rounded-full border p-0.5 ${
        on ? "border-[rgba(243,237,227,0.24)]" : "border-line"
      }`}
    >
      {LOCALES.map((code) => {
        const active = code === locale;
        return (
          <button
            key={code}
            type="button"
            onClick={() => setLocale(code)}
            aria-pressed={active}
            className={`min-h-11 min-w-11 rounded-full px-2 text-[12px] font-medium uppercase tracking-[0.08em] transition-colors ${
              active
                ? on
                  ? "bg-on-deep text-deep"
                  : "bg-ink text-ground"
                : on
                  ? "text-[rgba(243,237,227,0.7)] hover:text-on-deep"
                  : "text-muted hover:text-ink"
            }`}
          >
            {code}
          </button>
        );
      })}
    </div>
  );
}
