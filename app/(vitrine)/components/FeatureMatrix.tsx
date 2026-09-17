"use client";

import { Fragment, useState } from "react";
import {
  FEATURE_GROUP_LABELS,
  PACKS,
  featuresForVertical,
  type Feature,
  type PackId,
  type VerticalId,
} from "@hanoi/registry";
import { useLanguage } from "./LanguageProvider";

/**
 * La matrice est l'outil de closing. Chaque ligne a été vérifiée dans le code par
 * l'audit de conformité — c'est ce qui autorise à la montrer telle quelle.
 *
 * En dessous de `sm`, pas de tableau qui scrolle latéralement : une colonne figée
 * (libellés) posée sur des colonnes qui scrollent en dessous se traduit, à mi-scroll,
 * par du texte à moitié recouvert — repéré en test réel sur téléphone. On bascule donc
 * sur des onglets de palier + une liste pleine largeur, sans aucun scroll horizontal.
 * Le tableau original reste pour `sm:` et plus, où il tient sans scroller.
 */
export default function FeatureMatrix({
  vertical,
  packs,
}: {
  vertical?: VerticalId;
  packs?: PackId[];
}) {
  const { tr } = useLanguage();
  const columns = PACKS.filter((p) => !packs || packs.includes(p.id));
  const features = vertical
    ? featuresForVertical(vertical)
    : featuresForVertical("cafe");

  const groups = [...new Set(features.map((f) => f.group))];

  const [active, setActive] = useState<PackId>(columns[0].id);
  // Retombe sur la première colonne si `active` ne correspond plus aux paliers
  // affichés (changement de métier côté client sans démontage du composant).
  const activePack = columns.find((p) => p.id === active) ?? columns[0];

  const cell = (f: Feature, id: PackId) => {
    const v = f.values[id];
    if (v === false) return <span className="text-muted/50">—</span>;
    if (v === true) return <span aria-label="inclus">✓</span>;
    return <span className="text-[14px] leading-snug">{tr(v)}</span>;
  };

  return (
    <>
      <div className="sm:hidden">
        <div
          role="group"
          aria-label="Palier"
          className="flex gap-1.5 overflow-x-auto pb-1"
        >
          {columns.map((p) => {
            const isActive = p.id === activePack.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setActive(p.id)}
                aria-pressed={isActive}
                className={`min-h-11 shrink-0 whitespace-nowrap rounded-full border px-4 text-[14px] font-medium transition-colors ${
                  isActive
                    ? "border-transparent text-white"
                    : "border-line text-muted"
                }`}
                style={isActive ? { backgroundColor: p.accent } : undefined}
              >
                {tr(p.gridName)}
              </button>
            );
          })}
        </div>

        <div className="mt-4 overflow-hidden rounded-2xl border border-line bg-white">
          {groups.map((g) => (
            <div key={g}>
              <p className="bg-[rgba(22,20,15,0.03)] px-4 py-2.5 text-[13px] font-medium uppercase tracking-[0.14em] text-muted">
                {tr(FEATURE_GROUP_LABELS[g])}
              </p>
              <ul>
                {features
                  .filter((f) => f.group === g)
                  .map((f) => (
                    <li
                      key={f.id}
                      className="flex items-baseline justify-between gap-4 border-t border-line px-4 py-3 text-[15px]"
                    >
                      <span className="text-muted">{tr(f.label)}</span>
                      <span className="text-right">
                        {cell(f, activePack.id)}
                      </span>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="hidden overflow-x-auto rounded-2xl border border-line bg-white sm:block">
        <table className="w-full min-w-[42rem] border-collapse text-left">
          <thead>
            <tr className="border-b border-line">
              <th
                scope="col"
                className="sticky left-0 z-10 bg-white p-4 text-[14px] font-medium"
              >
                <span className="sr-only">Fonctionnalité</span>
              </th>
              {columns.map((p) => (
                <th
                  key={p.id}
                  scope="col"
                  className="p-4 align-bottom text-[15px] font-medium"
                  style={{ borderTop: `3px solid ${p.accent}` }}
                >
                  {tr(p.gridName)}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {groups.map((g) => (
              <Fragment key={g}>
                <tr className="bg-[rgba(22,20,15,0.03)]">
                  <th
                    scope="colgroup"
                    colSpan={columns.length + 1}
                    className="sticky left-0 p-3 text-[13px] font-medium uppercase tracking-[0.14em] text-muted"
                  >
                    {tr(FEATURE_GROUP_LABELS[g])}
                  </th>
                </tr>
                {features
                  .filter((f) => f.group === g)
                  .map((f) => (
                    <tr key={f.id} className="border-t border-line align-top">
                      <th
                        scope="row"
                        className="sticky left-0 z-10 bg-white p-4 text-[15px] font-normal"
                      >
                        {tr(f.label)}
                      </th>
                      {columns.map((p) => (
                        <td key={p.id} className="p-4 text-[15px]">
                          {cell(f, p.id)}
                        </td>
                      ))}
                    </tr>
                  ))}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
