import { BOUNDARIES } from "./content";
import { Lit, Reveal } from "./motion";

/**
 * Les limites — ce que Biume ne fait pas.
 *
 * Cette section existe parce que le produit n'a, à ce jour, aucune
 * preuve sociale à afficher : ni témoignage, ni chiffre d'usage, ni
 * logo. Plutôt que d'en inventer, la page prend le pari inverse et
 * énonce ses bornes. C'est la forme de crédibilité qui reste
 * disponible, et c'est la plus solide.
 *
 * Le vert de la validation les porte : ce sont des engagements, pas
 * des excuses.
 */
export function Boundaries() {
  return (
    <section
      id="limites"
      aria-labelledby="lv4-limites-title"
      className="scroll-mt-16 border-b border-[color:var(--lv4-line)]"
    >
      <div className="mx-auto max-w-[1320px] px-[var(--lv4-gutter)] py-20 md:py-28">
        <div className="grid gap-x-8 gap-y-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Reveal>
              <p className="lv4-note flex items-center gap-3 text-[color:var(--lv4-green)]">
                <span aria-hidden="true" className="lv4-tick" />
                Les limites
              </p>
            </Reveal>
            <Reveal as="h2">
              <span id="lv4-limites-title" className="lv4-h2 mt-6 block">
                Ce que Biume ne fait pas.
              </span>
            </Reveal>
            <Reveal as="p">
              <span className="lv4-body mt-5 block text-[color:var(--lv4-text-2)]">
                Biume est un produit jeune, sans clientèle à exhiber. À
                défaut de témoignages, voici ses bornes — elles sont
                vérifiables dès la première séance.
              </span>
            </Reveal>
          </div>

          <Reveal className="lg:col-span-7 lg:col-start-6">
            <Lit className="lv4-surface px-6 py-2 md:px-8">
              <ul>
                {BOUNDARIES.map((line, index) => (
                  <li
                    key={line}
                    className="grid grid-cols-[1.75rem_1fr] items-baseline gap-x-4 border-b border-[color:var(--lv4-line)] py-5 last:border-b-0"
                  >
                    <span
                      aria-hidden="true"
                      className="lv4-note text-[color:var(--lv4-green)]"
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="text-[1.02rem] leading-[1.55] tracking-[-0.01em]">
                      {line}
                    </span>
                  </li>
                ))}
              </ul>
            </Lit>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
