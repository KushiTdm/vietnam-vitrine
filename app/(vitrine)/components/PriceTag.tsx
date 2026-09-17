"use client";

import { approxUsd, formatVnd, type Pack } from "@hanoi/registry";
import { useLanguage } from "./LanguageProvider";

/**
 * Le prix se lit de deux façons, et les deux comptent : le montant d'un coup, et la
 * mensualité. Un commerçant raisonne en trésorerie avant de raisonner en investissement.
 * Le montant en dollars sert aux prospects étrangers ; il reste discret.
 */
export default function PriceTag({ pack, size = "md" }: { pack: Pack; size?: "md" | "lg" }) {
  const { t } = useLanguage();

  if (pack.price === null) {
    return (
      <div>
        <p className={`font-display ${size === "lg" ? "text-4xl" : "text-3xl"} leading-tight`}>
          {t("onRequest")}
        </p>
        <p className="mt-1 text-[14px] text-muted">{t("contactUs")}</p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-[13px] uppercase tracking-[0.14em] text-muted">{t("priceAlone")}</p>
      <p className={`font-display ${size === "lg" ? "text-4xl" : "text-3xl"} leading-tight`}>
        {pack.from && <span className="text-[0.6em] align-middle text-muted">{t("from")} </span>}
        {formatVnd(pack.price)}
        <span className="ml-2 align-middle text-[0.45em] font-sans text-muted">
          {approxUsd(pack.price)}
        </span>
      </p>

      {pack.priceWithMaintenance !== null && pack.monthly !== null && (
        <p className="mt-3 border-t border-line pt-3 text-[14px] leading-snug text-muted">
          <span className="uppercase tracking-[0.1em]">{t("priceWith")}</span>
          <br />
          <span className="text-ink">
            {formatVnd(pack.priceWithMaintenance)} + {formatVnd(pack.monthly)}
            {t("perMonth")}
          </span>
        </p>
      )}
    </div>
  );
}
