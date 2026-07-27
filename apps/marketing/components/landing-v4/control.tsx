import { CONTROL_PASSAGES } from "./content";
import { Lit, Reveal } from "./motion";

const GUARANTEES = [
  "Chaque passage se corrige à la main, dans le texte.",
  "Le bouton d'envoi reste inactif tant qu'un passage n'a pas été relu.",
  "Aucun destinataire n'est ajouté sans que vous l'ayez saisi.",
] as const;

/** Marque d'état, sous la couleur de son rôle : le vert confirme, le
 *  violet signale la main du praticien, le contour vide une relecture
 *  encore due. La forme porte l'information autant que la couleur —
 *  l'état reste lisible sans percevoir la teinte. */
function StateMark({ state }: { state: string }) {
  if (state === "valide") {
    return (
      <span className="lv4-note flex items-center gap-2.5 text-[color:var(--lv4-green)]">
        <span aria-hidden="true" className="lv4-pulse size-2 bg-current" />
        Validé
      </span>
    );
  }

  if (state === "revu") {
    return (
      <span className="lv4-note flex items-center gap-2.5 text-[color:var(--lv4-violet)]">
        <span aria-hidden="true" className="h-0.5 w-3.5 bg-current" />
        Corrigé par vous
      </span>
    );
  }

  return (
    <span className="lv4-note flex items-center gap-2.5 text-[color:var(--lv4-text-3)]">
      <span
        aria-hidden="true"
        className="size-2 border border-current bg-transparent"
      />
      À relire
    </span>
  );
}

/**
 * Le contrôle — la promesse qui compte le plus : Biume prépare, le
 * praticien décide.
 *
 * La surface montrée est un brouillon incomplet, pas un écran de
 * réussite : l'envoi est fermé parce qu'un passage n'a pas encore été
 * relu, et la barre de progression le dit. C'est l'état vrai du
 * produit à ce moment du parcours.
 */
export function Control() {
  return (
    <section
      id="controle"
      aria-labelledby="lv4-controle-title"
      className="scroll-mt-16 border-b border-[color:var(--lv4-line)]"
    >
      <div className="mx-auto max-w-[1320px] px-[var(--lv4-gutter)] py-20 md:py-28">
        <div className="grid gap-x-8 gap-y-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Reveal>
              <p className="lv4-note flex items-center gap-3 text-[color:var(--lv4-violet)]">
                <span aria-hidden="true" className="lv4-tick" />
                Le contrôle
              </p>
            </Reveal>

            <Reveal as="h2">
              <span id="lv4-controle-title" className="lv4-h2 mt-6 block">
                Rien ne part sans vous.
              </span>
            </Reveal>

            <Reveal as="p">
              <span className="lv4-body mt-5 block text-[color:var(--lv4-text-2)]">
                Le compte rendu est un brouillon jusqu&apos;à ce que vous
                l&apos;ayez relu passage par passage. Tant qu&apos;un passage
                attend, l&apos;envoi reste fermé — ce n&apos;est pas un
                réglage, c&apos;est le fonctionnement.
              </span>
            </Reveal>

            <Reveal>
              <ul className="mt-8">
                {GUARANTEES.map((line) => (
                  <li
                    key={line}
                    className="flex gap-3.5 border-t border-[color:var(--lv4-line)] py-3.5 text-[0.95rem] leading-[1.5] last:border-b last:border-b-[color:var(--lv4-line)]"
                  >
                    <span
                      aria-hidden="true"
                      className="mt-2 size-1.5 shrink-0 bg-[color:var(--lv4-violet)]"
                    />
                    {line}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>

          <Reveal className="lg:col-span-7 lg:col-start-6">
            <Lit className="lv4-surface overflow-hidden">
              <div className="border-b border-[color:var(--lv4-line)] bg-white/[0.03] px-5 py-3.5 md:px-7">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <p className="lv4-note text-[color:var(--lv4-text)]">
                    Compte rendu · brouillon
                  </p>
                  <p className="lv4-note text-[color:var(--lv4-text-3)]">
                    2 passages sur 3 relus
                  </p>
                </div>
                {/* La progression réelle de la relecture. Les deux
                    tiers relus sont acquis, la lumière violette
                    travaille sur le tiers restant. */}
                <div className="mt-3 flex h-[3px] gap-1 overflow-hidden">
                  <span className="w-2/3 bg-[color:var(--lv4-green)]" />
                  <span className="lv4-shimmer flex-1" />
                </div>
              </div>

              <ol>
                {CONTROL_PASSAGES.map((passage) => (
                  <li
                    key={passage.id}
                    className="border-b border-[color:var(--lv4-line)] px-5 py-5 md:px-7 md:py-6"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                      <p className="lv4-note text-[color:var(--lv4-text-3)]">
                        {passage.label}
                      </p>
                      <StateMark state={passage.state} />
                    </div>
                    <p
                      className={`mt-3 text-[0.98rem] leading-[1.6] ${
                        passage.state === "attente"
                          ? "text-[color:var(--lv4-text-3)]"
                          : "text-[color:var(--lv4-text)]"
                      }`}
                    >
                      {passage.state === "revu" ? (
                        <span className="[text-decoration-color:var(--lv4-violet)] [text-decoration-line:underline] [text-decoration-thickness:1px] [text-underline-offset:0.32em]">
                          {passage.text}
                        </span>
                      ) : (
                        passage.text
                      )}
                    </p>
                  </li>
                ))}
              </ol>

              <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-5 md:px-7">
                <p className="lv4-note max-w-[26ch] text-[color:var(--lv4-text-3)]">
                  Envoi ouvert quand les 3 passages sont relus
                </p>
                <span
                  aria-disabled="true"
                  className="lv4-note inline-flex min-h-11 cursor-not-allowed items-center rounded-[3px] border border-[color:var(--lv4-line)] px-4 text-[color:var(--lv4-text-3)]"
                >
                  Envoyer au propriétaire
                </span>
              </div>
            </Lit>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
