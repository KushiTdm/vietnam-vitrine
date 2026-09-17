"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { L10n, Locale } from "@/lib/registry";
import { UI } from "../lib/ui";

export const LOCALES: Locale[] = ["vi", "en", "fr"];

type Ctx = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  /** Traduit un champ localisé du registre. */
  tr: (value: L10n) => string;
  /** Texte d'interface de la vitrine. */
  t: (key: string) => string;
};

const LanguageContext = createContext<Ctx | null>(null);

const KEY = "hanoi.showcase.locale";

export default function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Le vietnamien fait foi : la vitrine s'ouvre toujours en VI, puis suit le choix
  // mémorisé. Aucune détection navigateur au premier rendu — elle provoquerait un
  // écart d'hydratation, et un prospect vietnamien sur un téléphone configuré en
  // anglais reste un prospect vietnamien.
  const [locale, setLocaleState] = useState<Locale>("vi");

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(KEY);
      // Lecture après le premier rendu, exprès : lire localStorage dans l'initialiseur
      // de useState provoquerait un écart d'hydratation (le serveur rend toujours "vi").
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (saved === "vi" || saved === "en" || saved === "fr") setLocaleState(saved);
    } catch {
      /* stockage indisponible : on reste en vietnamien */
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try {
      window.localStorage.setItem(KEY, l);
    } catch {
      /* sans importance */
    }
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      locale,
      setLocale,
      tr: (v: L10n) => v[locale] ?? v.vi,
      t: (k: string) => UI[locale][k] ?? UI.vi[k] ?? k,
    }),
    [locale, setLocale],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): Ctx {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage doit être utilisé dans LanguageProvider");
  return ctx;
}
