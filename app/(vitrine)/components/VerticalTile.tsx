"use client";

import Image from "next/image";
import Link from "next/link";
import type { Vertical, VerticalId } from "@/lib/registry";
import { publicDemosFor } from "@/lib/registry";
import { useLanguage } from "./LanguageProvider";
import { TILE } from "../lib/tiles";

/**
 * Bandeau visuel de la tuile : la photo si le métier en a une, sinon l'emoji
 * du registre. `TILE` est partielle par construction — un métier ajouté au
 * registre avant sa séance photo doit s'afficher, pas casser la grille.
 */
function TileVisual({
  id,
  icon,
  dimmed = false,
}: {
  id: VerticalId;
  icon: string;
  dimmed?: boolean;
}) {
  const src = TILE[id];

  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden bg-[rgba(22,20,15,0.04)]">
      {src ? (
        // Le nom du métier est juste en dessous : la vignette est décorative
        // pour un lecteur d'écran, d'où l'alt vide.
        <Image
          src={src}
          alt=""
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className={`object-cover${dimmed ? " opacity-45 grayscale" : ""}`}
        />
      ) : (
        <span
          aria-hidden
          className={`absolute inset-0 flex items-center justify-center text-4xl${
            dimmed ? " opacity-40" : ""
          }`}
        >
          {icon}
        </span>
      )}
    </div>
  );
}

/**
 * Un prospect ne cherche pas un pack, il cherche son métier. C'est la porte d'entrée
 * réelle de la vitrine — le prix vient après.
 */
/** `index` ne sert qu'au décalage de la révélation au scroll (`--d`). */
export default function VerticalTile({ vertical, index = 0 }: { vertical: Vertical; index?: number }) {
  const { tr, t } = useLanguage();
  const count = publicDemosFor(vertical.id).length;

  return (
    <Link
      href={`/metiers/${vertical.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-white transition-colors hover:border-ink"
      data-reveal
      style={{ ["--d" as string]: `${index * 70}ms` }}
    >
      <TileVisual id={vertical.id} icon={vertical.icon} />

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-xl leading-tight">{tr(vertical.name)}</h3>
        <p className="mt-1 text-[15px] leading-snug text-muted">{tr(vertical.tagline)}</p>
        <span className="mt-4 text-[14px] font-medium" style={{ color: vertical.accent }}>
          {t("seeDemos")} ({count}) →
        </span>
      </div>
    </Link>
  );
}

export function PlannedTile({
  id,
  icon,
  name,
  note,
  index = 0,
}: {
  id: VerticalId;
  icon: string;
  name: string;
  note: string;
  index?: number;
}) {
  const { t } = useLanguage();
  return (
    <div
      className="flex flex-col overflow-hidden rounded-2xl border border-dashed border-line"
      data-reveal
      style={{ ["--d" as string]: `${index * 70}ms` }}
    >
      {/* Désaturée et en retrait : la tuile doit se lire « pas encore » avant
          même qu'on arrive au mot « Bientôt ». */}
      <TileVisual id={id} icon={icon} dimmed />

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-xl leading-tight text-muted">{name}</h3>
        <p className="mt-1 text-[15px] leading-snug text-muted">{note}</p>
        <span className="mt-4 text-[13px] uppercase tracking-[0.12em] text-muted">{t("soon")}</span>
      </div>
    </div>
  );
}
