import { FACTS } from "./content";
import { Parallax, Reveal } from "./motion";

/**
 * Le constat. Trois faits, pas trois arguments — et surtout pas trois
 * cartes alignées : une liste numérotée séparée par des filets, avec
 * l'intitulé calé à gauche et le contenu en colonne de droite.
 *
 * Le bloc de titre dérive à contre-scroll : c'est ce décalage qui
 * empêche la section de retomber à plat après le relief du relevé.
 */
export function Facts() {
  return (
    <section
      id="constat"
      aria-labelledby="lv4-constat-title"
      className="scroll-mt-16 border-b border-[color:var(--lv4-line)]"
    >
      <div className="mx-auto max-w-[1320px] px-[var(--lv4-gutter)] py-20 md:py-28">
        <div className="grid gap-x-8 gap-y-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Parallax distance={30}>
              <Reveal>
                <p className="lv4-note flex items-center gap-3 text-[color:var(--lv4-violet)]">
                  <span aria-hidden="true" className="lv4-tick" />
                  Le constat
                </p>
              </Reveal>
              <Reveal as="h2">
                <span id="lv4-constat-title" className="lv4-h2 mt-6 block">
                  Le problème n&apos;est pas d&apos;écrire. C&apos;est de
                  réécrire.
                </span>
              </Reveal>
            </Parallax>
          </div>

          <ol className="lg:col-span-7 lg:col-start-6">
            {FACTS.map((fact) => (
              <Reveal
                as="li"
                key={fact.n}
                className="grid grid-cols-[2.5rem_1fr] gap-x-4 border-t border-[color:var(--lv4-line)] py-7 first:border-t-0 first:pt-0 sm:grid-cols-[4rem_1fr]"
              >
                <span className="lv4-note pt-1.5 text-[color:var(--lv4-violet)]">
                  {fact.n}
                </span>
                <div>
                  <h3 className="lv4-h3">{fact.title}</h3>
                  <p className="lv4-body mt-2.5 text-[color:var(--lv4-text-2)]">
                    {fact.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
