import { FAQ } from "./content";
import { Reveal } from "./motion";

/**
 * Questions. `details`/`summary` natifs : le clavier, la recherche
 * dans la page et les lecteurs d'écran fonctionnent sans qu'on ait
 * une seule ligne de JavaScript à écrire. L'ouverture animée passe
 * par `::details-content`, derrière un `@supports`.
 */
export function Faq() {
  return (
    <section
      aria-labelledby="lv4-faq-title"
      className="border-b border-[color:var(--lv4-line)]"
    >
      <div className="mx-auto max-w-[1320px] px-[var(--lv4-gutter)] py-20 md:py-28">
        <div className="grid gap-x-8 gap-y-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Reveal>
              <p className="lv4-note flex items-center gap-3 text-[color:var(--lv4-violet)]">
                <span aria-hidden="true" className="lv4-tick" />
                Questions
              </p>
            </Reveal>
            <Reveal as="h2">
              <span id="lv4-faq-title" className="lv4-h2 mt-6 block">
                Ce qu&apos;on nous demande avant d&apos;essayer.
              </span>
            </Reveal>
          </div>

          <div className="lg:col-span-7 lg:col-start-6">
            {FAQ.map((entry) => (
              <Reveal
                key={entry.q}
                className="border-t border-[color:var(--lv4-line)] first:border-t-0"
              >
                <details className="group">
                  <summary className="flex min-h-16 items-center justify-between gap-6 py-4">
                    <span className="text-[1.05rem] font-medium leading-[1.35] tracking-[-0.02em] transition-colors duration-200 group-open:text-[color:var(--lv4-violet)]">
                      {entry.q}
                    </span>
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 16 16"
                      className="lv4-faq-sign size-4 shrink-0 text-[color:var(--lv4-violet)]"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    >
                      <path d="M8 2v12" />
                      <path d="M2 8h12" />
                    </svg>
                  </summary>
                  <p className="lv4-body pb-6 pr-10 text-[color:var(--lv4-text-2)]">
                    {entry.a}
                  </p>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
