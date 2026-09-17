"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Révélation au scroll — un seul observateur pour toute la vitrine.
 *
 * Contrat déclaratif : `data-reveal` sur un élément — valeurs `up` (défaut), `left`,
 * `right`, `scale`, `none` — et `--d` en style en ligne pour décaler une cascade.
 * La classe `.is-in` est posée UNE fois puis l'élément est oublié : rien ne se rejoue
 * au scroll inverse.
 *
 * Règle propre à la vitrine : rien qui contienne une `iframe` ne porte `data-reveal`.
 * Les cadres téléphone chargent les démos pour de vrai — c'est ce qu'on tend au
 * prospect pendant le rendez-vous — et animer leur conteneur les fait repeindre.
 *
 * Filet de sécurité n°1 — l'état masqué en CSS n'est armé que sous
 * `[data-reveal-ready]`, posé par le script d'amorce ci-dessous avant la peinture du
 * corps. Sans JavaScript l'attribut n'existe jamais et la page est entièrement
 * visible ; s'il est posé mais que l'hydratation n'aboutit pas, le garde-fou le
 * retire au bout de 2,5 s. Une page qui reste blanche coûte plus cher que pas
 * d'animation du tout.
 *
 * Filet de sécurité n°2 — un `IntersectionObserver` seul ne suffit pas : sur un saut
 * d'ancre (#gia, #metiers) ou un scroll très rapide, un bloc peut passer de « sous
 * l'écran » à « au-dessus de l'écran » sans changement d'état, donc sans rappel, et
 * rester invisible pour toujours. Le balayage au scroll ci-dessous le rattrape.
 *
 * `prefers-reduced-motion: reduce` court-circuite l'amorce : rien n'est jamais masqué.
 */
const BOOT =
  "(function(){var d=document.documentElement;try{" +
  "if(!('IntersectionObserver' in window))return;" +
  "if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;" +
  "d.setAttribute('data-reveal-ready','');" +
  "setTimeout(function(){if(!d.hasAttribute('data-reveal-live'))" +
  "d.removeAttribute('data-reveal-ready')},2500)}catch(e){" +
  "d.removeAttribute('data-reveal-ready')}})()";

const SEL = "[data-reveal]:not(.is-in)";

export default function ScrollFx() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    if (!root.hasAttribute("data-reveal-ready")) return;
    root.setAttribute("data-reveal-live", "");

    const show = (el: Element) => {
      el.classList.add("is-in");
      io.unobserve(el);
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const passed = e.boundingClientRect.bottom <= (e.rootBounds?.top ?? 0);
          if (e.isIntersecting || passed) show(e.target);
        }
      },
      // `threshold: 0` et non 0.1 : un bloc plus haut que l'écran (la matrice de
      // comparaison) n'atteindrait jamais 10 % de visibilité et resterait masqué.
      { threshold: 0, rootMargin: "0px 0px -8% 0px" },
    );

    const observe = (node: ParentNode) => node.querySelectorAll?.(SEL).forEach((el) => io.observe(el));
    observe(document);

    let frame = 0;
    const sweep = () => {
      frame = 0;
      document.querySelectorAll(SEL).forEach((el) => {
        if (el.getBoundingClientRect().bottom <= 0) show(el);
      });
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(sweep);
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    // Les blocs rendus après coup : changement de langue, navigation client.
    const mo = new MutationObserver((records) => {
      for (const r of records) {
        r.addedNodes.forEach((n) => {
          if (!(n instanceof Element)) return;
          if (n.matches(SEL)) io.observe(n);
          observe(n);
        });
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [pathname]);

  return <script dangerouslySetInnerHTML={{ __html: BOOT }} />;
}
