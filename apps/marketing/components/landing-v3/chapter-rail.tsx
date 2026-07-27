"use client";

import { useEffect, useState } from "react";

import { CHAPTERS } from "./chapters";

/**
 * Rail de progression du récit, ancré au bord gauche.
 *
 * C'est l'indicateur que réclame tout format en chapitres : sans lui,
 * le lecteur ne sait ni où il en est ni combien il reste. Il sert
 * aussi de navigation — chaque entrée est un lien réel.
 *
 * Masqué sous 1280px : en dessous, il empiéterait sur le contenu et
 * la barre du masthead suffit à se repérer.
 */
export function ChapterRail() {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;

    const sections = CHAPTERS.map((chapter) =>
      document.getElementById(chapter.id),
    ).filter((node): node is HTMLElement => node !== null);

    if (sections.length === 0) return;

    // Bande de détection centrée : le chapitre actif est celui qui
    // occupe le milieu de l'écran, pas celui qui l'effleure.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    );

    for (const section of sections) observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    // Le rail vit dans la gouttière, jamais au-dessus du contenu. Il
    // n'apparaît qu'à partir de 1536px, où la marge laissée par le
    // conteneur de 1280px atteint 128px de chaque côté — le rail en
    // occupe 84 au plus. En dessous, la barre du masthead suffit.
    <nav
      aria-label="Progression dans la page"
      className="fixed left-6 top-1/2 hidden -translate-y-1/2 2xl:block"
      style={{ zIndex: "var(--lv3-z-rail)" }}
    >
      <ol className="flex flex-col gap-1">
        {CHAPTERS.map((chapter, index) => {
          const current = active === chapter.id;
          return (
            <li key={chapter.id}>
              <a
                href={`#${chapter.id}`}
                aria-current={current ? "true" : undefined}
                className="group flex min-h-9 w-[60px] items-center gap-2.5 rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--lv3-violet)]"
              >
                <span
                  aria-hidden="true"
                  className={`h-px shrink-0 transition-[width,background-color] duration-[320ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    current
                      ? "w-6 bg-[color:var(--lv3-violet)]"
                      : "w-3 bg-[color:var(--lv3-ink-2)] group-hover:w-5"
                  }`}
                />
                <span
                  aria-hidden="true"
                  className={`lv3-fn transition-colors duration-[320ms] ${
                    current
                      ? "text-[color:var(--lv3-violet)]"
                      : "text-[color:var(--lv3-ink-2)]"
                  }`}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                {/* Le libellé complet reste disponible aux lecteurs
                    d'écran sans jamais occuper de place à l'écran. */}
                <span className="sr-only">{chapter.label}</span>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
