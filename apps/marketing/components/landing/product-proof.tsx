const editorFields = [
  {
    label: "Observations",
    value:
      "Une tension plus présente a été observée du côté gauche, au niveau du thorax.",
  },
  { label: "Anatomie", value: "Thorax · côté gauche" },
  {
    label: "Recommandations",
    value:
      "Ajoutez uniquement les recommandations que vous souhaitez transmettre.",
  },
  {
    label: "Notes",
    value: "Champ libre, modifiable avant la finalisation.",
  },
] as const;

export function ProductProof() {
  return (
    <section
      id="comment-ca-marche"
      data-landing-section="product-proof"
      className="scroll-mt-18 px-4 py-10 sm:px-6 md:py-20 lg:px-8"
    >
      <div className="mx-auto max-w-[90rem]">
        <div className="grid gap-6 lg:grid-cols-[0.76fr_1.24fr] lg:items-end">
          <div>
            <p className="cinematic-scene-label">Scène 03 · Le document</p>
            <p className="mt-4 border-l-2 border-[color:var(--carnet-blue)] pl-3 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--carnet-ink)]">
              Ce qui existe aujourd&apos;hui
            </p>
            <h2 className="mt-4 max-w-3xl text-4xl font-semibold leading-[0.96] tracking-[-0.052em] text-[color:var(--carnet-ink)] md:text-6xl">
              Pas une promesse abstraite.{" "}
              <span className="font-[family-name:var(--font-newsreader)] font-normal italic">
                Les outils réellement disponibles.
              </span>
            </h2>
          </div>
          <p className="max-w-[56ch] text-base leading-7 text-[color:var(--carnet-muted)] md:text-lg md:leading-8 lg:justify-self-end">
            L&apos;éditeur structure le compte rendu. Vous adaptez les mots,
            prévisualisez le résultat et choisissez vous-même quand le
            finaliser.
          </p>
        </div>

        <div
          data-product-stage="editor"
          className="cinematic-product-stage mt-10 grid gap-0 md:mt-14 lg:grid-cols-[minmax(0,1.42fr)_minmax(18rem,0.58fr)] lg:items-center"
        >
          <article
            data-product-editor
            className="overflow-hidden rounded-[0.75rem_0.75rem_2rem_0.75rem] border border-[color:var(--carnet-line)] bg-[color:var(--carnet-surface)] shadow-[0_36px_90px_-62px_rgba(29,29,33,0.38)]"
          >
            <div className="flex flex-col gap-4 border-b border-[color:var(--carnet-line)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
              <div>
                <p className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-[color:var(--carnet-muted)]">
                  Éditeur de compte rendu
                </p>
                <h3 className="mt-1 text-lg font-semibold tracking-[-0.025em] text-[color:var(--carnet-ink)]">
                  Séance du 12 juillet
                </h3>
              </div>
              <span className="w-fit rounded-full bg-[color:var(--carnet-violet-soft)] px-3 py-1.5 font-mono text-[0.65rem] font-semibold text-[color:var(--carnet-violet)]">
                Brouillon modifiable
              </span>
            </div>

            <div className="grid md:grid-cols-[11rem_1fr]">
              <aside
                aria-label="Rubriques illustrées du compte rendu"
                className="border-b border-[color:var(--carnet-line)] bg-[color:var(--carnet-muted-surface)] p-4 md:border-b-0 md:border-r"
              >
                <ol className="grid grid-cols-2 gap-2 md:grid-cols-1">
                  {editorFields.map((field, index) => (
                    <li
                      key={field.label}
                      className={`rounded-lg px-3 py-2.5 text-sm font-medium ${
                        index === 0
                          ? "bg-[color:var(--carnet-surface)] text-[color:var(--carnet-ink)]"
                          : "text-[color:var(--carnet-muted)]"
                      }`}
                    >
                      {field.label}
                    </li>
                  ))}
                </ol>
              </aside>

              <div className="p-5 sm:p-7">
                <div className="grid gap-4 sm:grid-cols-2">
                  {editorFields.map((field, index) => (
                    <div
                      key={field.label}
                      className={`border-b border-[color:var(--carnet-line)] pb-4 ${
                        index === 0 ? "sm:col-span-2" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-[color:var(--carnet-muted)]">
                          {field.label}
                        </p>
                        {index === 0 ? (
                          <span className="rounded-full bg-[color:var(--carnet-blue-soft)] px-2.5 py-1 font-mono text-[0.62rem] font-semibold text-[color:var(--carnet-ink)]">
                            Adapter le langage
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-2 text-sm leading-6 text-[color:var(--carnet-ink)]">
                        {field.value}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex flex-wrap justify-end gap-2">
                  <span className="inline-flex min-h-10 items-center rounded-full border border-[color:var(--carnet-line)] px-4 text-xs font-semibold text-[color:var(--carnet-ink)]">
                    Prévisualiser
                  </span>
                  <span className="inline-flex min-h-10 items-center rounded-full bg-[color:var(--carnet-green)] px-4 text-xs font-semibold text-[color:var(--carnet-ink)]">
                    Finaliser
                  </span>
                </div>
              </div>
            </div>
          </article>

          <div
            data-product-outcomes="true"
            className="grid border-x border-b border-[color:var(--carnet-line)] lg:border-y lg:border-l-0"
          >
            <article
              data-product-output="pdf"
              className="border-b border-[color:var(--carnet-line)] bg-[color:var(--carnet-surface)] p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[color:var(--carnet-ink)]">
                    PDF professionnel
                  </p>
                  <h3 className="mt-3 text-lg font-semibold tracking-[-0.025em] text-[color:var(--carnet-ink)]">
                    Compte-rendu-seance.pdf
                  </h3>
                </div>
                <span className="flex size-9 items-center justify-center rounded-full bg-[color:var(--carnet-green-soft)] font-mono text-xs font-semibold text-[color:var(--carnet-ink)]">
                  PDF
                </span>
              </div>
              <p className="mt-4 text-sm leading-6 text-[color:var(--carnet-muted)]">
                Téléchargé ou joint à l&apos;email que vous choisissez
                d&apos;envoyer.
              </p>
            </article>

            <article
              data-product-output="reminder"
              className="bg-[color:var(--carnet-surface)] p-5"
            >
              <p className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[color:var(--carnet-ink)]">
                Relance de rendez-vous
              </p>
              <h3 className="mt-3 text-lg font-semibold tracking-[-0.025em] text-[color:var(--carnet-ink)]">
                Échéance choisie par le praticien : dans 30 jours
              </h3>
              <p className="mt-4 text-sm leading-6 text-[color:var(--carnet-muted)]">
                Un message de reprise de rendez-vous planifié selon votre
                échéance.
              </p>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}
