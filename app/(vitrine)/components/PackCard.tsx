"use client";

import Link from "next/link";
import { publicDemosOf, type Pack } from "@/lib/registry";
import { useLanguage } from "./LanguageProvider";
import PriceTag from "./PriceTag";
import { PACK_VISUAL } from "../lib/pack-visuals";

/** `index` ne sert qu'au décalage de la révélation au scroll (`--d`). */
export default function PackCard({ pack, index = 0 }: { pack: Pack; index?: number }) {
  const { tr, t } = useLanguage();
  const count = publicDemosOf(pack.id).length;
  const visual = PACK_VISUAL[pack.id];

  return (
    <article
      className="flex flex-col overflow-hidden rounded-2xl border border-line bg-white"
      data-reveal
      style={{ borderTop: `3px solid ${pack.accent}`, ["--d" as string]: `${index * 80}ms` }}
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

      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-display text-2xl leading-tight">{tr(pack.gridName)}</h3>
        <p className="mt-2 text-[15px] leading-snug text-muted">{tr(pack.pitch)}</p>

        <div className="mt-6">
          <PriceTag pack={pack} />
        </div>

        <p className="mt-4 text-[14px] text-muted">
          {t("leadTime")} · {tr(pack.leadTime)}
        </p>

        <Link
          href={`/packs#${pack.id}`}
          className="tap mt-6 justify-center rounded-full px-5 text-[15px] font-medium text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: pack.accent }}
        >
          {count > 0 ? t("seePack") : t("contactUs")}
        </Link>
      </div>
    </article>
  );
}
