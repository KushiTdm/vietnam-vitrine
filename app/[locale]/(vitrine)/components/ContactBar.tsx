"use client";

import { agency } from "../showcase.config";
import { useLanguage } from "./LanguageProvider";

/**
 * Barre fixe en bas sur mobile : à 375 px, un prospect doit pouvoir appeler ou écrire
 * sans scroller. C'est la règle `contact-fold` de l'audit responsive, et c'est aussi
 * la manière dont les affaires se font ici — Zalo avant l'e-mail.
 */
export default function ContactBar() {
  const { t } = useLanguage();

  const items = [
    { href: `tel:${agency.phone}`, label: t("call") },
    { href: `https://zalo.me/${agency.zalo}`, label: t("zalo") },
    { href: `https://m.me/${agency.facebookPage}`, label: t("messenger") },
  ];

  return (
    <nav
      aria-label={t("contactTitle")}
      className="sticky bottom-0 z-30 border-t border-[rgba(243,237,227,0.14)] bg-deep text-on-deep md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="grid grid-cols-3">
        {items.map((it) => (
          <li key={it.href}>
            <a
              href={it.href}
              target={it.href.startsWith("tel:") ? undefined : "_blank"}
              rel="noreferrer"
              className="flex min-h-14 items-center justify-center px-2 text-center text-[14px] font-medium"
            >
              {it.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
