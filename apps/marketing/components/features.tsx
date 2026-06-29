const workflowSteps = [
  {
    number: "01",
    label: "IA",
    title: "Intelligence Artificielle",
    body: "L'IA analyse vos observations en temps réel, reformule vos comptes-rendus en langage professionnel et suggère des plans de traitement basés sur l'historique.",
  },
  {
    number: "02",
    label: "PDF",
    title: "Rapports Automatisés",
    body: "Générez des rapports PDF impeccables en un clic. Personnalisez vos modèles, ajoutez votre logo et laissez Biume gérer la mise en page.",
  },
  {
    number: "03",
    label: "Suivi",
    title: "Suivi Patient 360°",
    body: "Accédez à l'historique complet de chaque animal : consultations, courbes de poids, documents et échanges avec les propriétaires.",
  },
] as const;

const featureRows = [
  ["report.writer", "compte rendu complet", "18 min"],
  ["client.version", "vulgarisation prete", "1 clic"],
  ["patient.timeline", "historique consolide", "42 fiches"],
  ["followup.reminder", "suivi conseille", "48 h"],
] as const;

const signals = [
  ["Diagnostic", "T12-L1 et bassin droit"],
  ["Conseil", "Repos relatif, 48 heures"],
  ["Document", "PDF signe, logo cabinet"],
  ["Client", "Resume simple envoye"],
] as const;

export function FeaturesSection() {
  return (
    <>
      <section
        id="console"
        className="px-4 py-8 md:px-6 md:py-14"
      >
        <div className="mx-auto grid max-w-7xl overflow-hidden rounded-[2rem] border border-border bg-card shadow-[0_34px_100px_-76px_rgba(20,18,28,0.5)] lg:grid-cols-[0.82fr_1.18fr]">
          <div className="border-b border-border p-6 md:p-9 lg:border-b-0 lg:border-r">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              Plateforme tout-en-un
            </p>
            <h2 className="mt-4 max-w-xl text-4xl font-semibold leading-none tracking-tight text-foreground md:text-6xl">
              Conçu pour votre{" "}
              <span className="text-primary">
                tranquillité d&apos;esprit
              </span>
            </h2>
            <p className="mt-5 max-w-[58ch] text-base leading-7 text-muted-foreground">
              Libérez-vous des tâches administratives et concentrez-vous sur ce
              qui compte vraiment : le soin des animaux.
            </p>

            <div className="mt-8 grid grid-cols-2 gap-3">
              {[
                ["4.7/5", "clarte client"],
                ["6", "seances / jour"],
                ["3", "versions de rapport"],
                ["0", "copier-coller inutile"],
              ].map(([value, label]) => (
                <div key={label} className="border-t border-border pt-3">
                  <p className="font-mono text-2xl font-semibold tracking-tight text-foreground">
                    {value}
                  </p>
                  <p className="mt-1 text-xs font-medium text-muted-foreground">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative bg-muted/35 p-4 md:p-8">
            <GridLines />
            <div className="relative mx-auto max-w-2xl rounded-[1.7rem] border border-border bg-background p-4 shadow-[0_26px_80px_-62px_rgba(20,18,28,0.46)] md:p-5">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                  <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Patient timeline
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold tracking-tight">
                    Dossier Oslo
                  </h3>
                </div>
                <span className="rounded-full bg-secondary/12 px-3 py-1 text-xs font-semibold text-secondary">
                  complet
                </span>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-[0.78fr_1.22fr]">
                <div className="space-y-3">
                  {signals.map(([label, value]) => (
                    <div
                      key={label}
                      className="rounded-[1.15rem] border border-primary/10 bg-card/85 p-3"
                    >
                      <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        {label}
                      </p>
                      <p className="mt-2 text-sm font-semibold text-foreground">
                        {value}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="rounded-[1.35rem] bg-foreground p-4 text-background shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] ring-1 ring-primary/15">
                  <div className="flex items-center justify-between">
                    <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-background/45">
                      Actions automatiques
                    </p>
                    <span className="rounded-full bg-primary/25 px-2.5 py-1 text-[10px] font-semibold text-background">
                      3 pretes
                    </span>
                  </div>
                  <div className="mt-5 divide-y divide-background/10">
                    {featureRows.map(([event, label, value], index) => (
                      <div
                        key={event}
                        className="grid grid-cols-[1fr_auto] gap-3 py-3 first:pt-0 last:pb-0"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-mono text-xs font-semibold text-background/80">
                            {event}
                          </p>
                          <p className="mt-1 text-xs text-background/45">
                            {label}
                          </p>
                        </div>
                        <span
                          className={
                            index < 2
                              ? "rounded-full bg-secondary/20 px-2.5 py-1 text-xs font-semibold text-background"
                              : "rounded-full bg-background/10 px-2.5 py-1 text-xs font-semibold text-background/60"
                          }
                        >
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="workflow" className="px-4 py-8 md:px-6 md:py-14">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-6 lg:grid-cols-[0.65fr_1.35fr] lg:items-end">
            <div>
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
                Fonctionnalités
              </p>
              <h2 className="mt-4 text-4xl font-semibold leading-none tracking-tight text-foreground md:text-6xl">
                Libérez votre temps pour{" "}
                <span className="text-secondary">
                  l&apos;essentiel
                </span>
              </h2>
            </div>
            <p className="max-w-[62ch] text-base leading-7 text-muted-foreground lg:justify-self-end">
              Une application santé animale qui s&apos;adapte à votre pratique
              et libère votre temps pour l&apos;essentiel.
            </p>
          </div>

          <div className="mt-10 grid gap-4 lg:grid-cols-[1.1fr_0.9fr_1.25fr]">
            {workflowSteps.map((step, index) => (
              <article
                key={step.number}
                className={
                  index === 1
                    ? "rounded-[1.7rem] border border-primary/25 bg-primary/12 p-6 shadow-[0_28px_80px_-66px_rgba(124,102,238,0.6)] md:p-7 lg:mt-14"
                    : index === 2
                      ? "rounded-[1.7rem] border border-secondary/25 bg-secondary/10 p-6 md:p-7"
                      : "rounded-[1.7rem] border border-primary/15 bg-card p-6 md:p-7"
                }
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="font-mono text-sm font-semibold text-muted-foreground">
                    {step.number}
                  </span>
                  <span className="rounded-full bg-background px-3 py-1 text-xs font-semibold text-muted-foreground">
                    {step.label}
                  </span>
                </div>
                <h3 className="mt-7 text-2xl font-semibold leading-tight tracking-tight text-foreground">
                  {step.title}
                </h3>
                <p className="mt-4 text-sm leading-6 text-muted-foreground">
                  {step.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function GridLines() {
  return (
    <div
      className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(20,18,28,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(20,18,28,0.04)_1px,transparent_1px)] bg-size-[52px_52px]"
      aria-hidden="true"
    />
  );
}
