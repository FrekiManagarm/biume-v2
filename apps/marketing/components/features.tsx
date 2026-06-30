const workflowSteps = [
  {
    number: "01",
    label: "Séance",
    title: "Résumé propriétaire",
    body: "Transformez vos points observés en compte rendu propriétaire clair, relu et validé par vous avant tout partage.",
  },
  {
    number: "02",
    label: "Timeline",
    title: "Évolution visible",
    body: "Conservez l'historique de chaque animal: confort, mobilité, zones suivies, retours propriétaire et documents utiles.",
  },
  {
    number: "03",
    label: "Relance",
    title: "Suivi post-séance",
    body: "Préparez les messages J+7 et J+30 pour recueillir un retour, rappeler les points à surveiller et proposer la prochaine étape.",
  },
] as const;

const featureRows = [
  ["session.summary", "résumé propriétaire", "1 clic"],
  ["followup.j7", "relance de suivi", "J+7"],
  ["animal.timeline", "timeline animal", "42 fiches"],
  ["owner.reply", "retour propriétaire", "J+30"],
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
        <div className="relative mx-auto grid max-w-7xl overflow-hidden rounded-[2.25rem] border border-border bg-background shadow-[0_38px_120px_-84px_rgba(20,18,28,0.62)] lg:grid-cols-[0.82fr_1.18fr]">
          <div
            className="hero-color-wash pointer-events-none absolute inset-0 bg-[linear-gradient(125deg,rgba(124,102,238,0.14),rgba(255,255,255,0)_42%,rgba(32,184,100,0.16)_72%,rgba(124,102,238,0.1))]"
            aria-hidden="true"
          />
          <div className="relative border-b border-border/80 p-6 md:p-9 lg:border-b-0 lg:border-r">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
              Suivi propriétaire
            </p>
            <h2 className="mt-4 max-w-xl text-4xl font-semibold leading-none tracking-tight text-foreground md:text-6xl">
              Conçu pour rendre la séance{" "}
              <span className="text-secondary">
                plus mémorable
              </span>
            </h2>
            <p className="mt-5 max-w-[58ch] text-base leading-7 text-muted-foreground">
              Ne laissez pas la valeur de votre travail disparaître après le
              rendez-vous. Biume aide le propriétaire à comprendre, suivre et
              revenir au bon moment.
            </p>

            <div className="mt-8 grid grid-cols-2 gap-3">
              {[
                ["1", "résumé clair"],
                ["J+7", "retour simple"],
                ["J+30", "prochaine étape"],
                ["0", "diagnostic IA"],
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

          <div className="relative bg-background/42 p-4 backdrop-blur-sm md:p-8">
            <GridLines />
            <div className="relative mx-auto max-w-2xl rounded-[1.7rem] border border-white/70 bg-background/86 p-4 shadow-[0_26px_80px_-62px_rgba(20,18,28,0.62)] backdrop-blur-xl md:p-5">
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
                      className="rounded-[1.15rem] border border-white/70 bg-background/72 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]"
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

                <div className="relative overflow-hidden rounded-[1.35rem] bg-foreground p-4 text-background shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] ring-1 ring-white/10">
                  <div className="hero-scan-line absolute inset-x-0 top-0 h-20 bg-linear-to-b from-transparent via-secondary/18 to-transparent" />
                  <div className="flex items-center justify-between">
                    <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-background/45">
                      Actions automatiques
                    </p>
                    <span className="rounded-full bg-secondary/25 px-2.5 py-1 text-[10px] font-semibold text-background">
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
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2.25rem] border border-border bg-background p-6 shadow-[0_38px_120px_-84px_rgba(20,18,28,0.58)] md:p-9">
          <div
            className="hero-field-drift pointer-events-none absolute -right-20 top-10 size-[28rem] rounded-full bg-[radial-gradient(circle,rgba(32,184,100,0.16),rgba(124,102,238,0.14)_42%,transparent_70%)] blur-2xl"
            aria-hidden="true"
          />
          <div className="relative grid gap-6 lg:grid-cols-[0.65fr_1.35fr] lg:items-end">
            <div>
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
                Fonctionnalités
              </p>
              <h2 className="mt-4 text-4xl font-semibold leading-none tracking-tight text-foreground md:text-6xl">
                Le suivi post-séance devient{" "}
                <span className="text-secondary">
                  votre avantage
                </span>
              </h2>
            </div>
            <p className="max-w-[62ch] text-base leading-7 text-muted-foreground lg:justify-self-end">
              Pour les ostéopathes animaliers et praticiens manuels, la
              différenciation se joue aussi après la séance: clarté,
              continuité et confiance propriétaire.
            </p>
          </div>

          <div className="relative mt-10 grid gap-4 lg:grid-cols-[1.1fr_0.9fr_1.25fr]">
            {workflowSteps.map((step, index) => (
              <article
                key={step.number}
                className={
                  index === 1
                    ? "rounded-[1.7rem] border border-secondary/25 bg-secondary/10 p-6 shadow-[0_28px_80px_-66px_rgba(20,18,28,0.5)] md:p-7 lg:mt-14"
                    : index === 2
                      ? "rounded-[1.7rem] border border-primary/20 bg-primary/10 p-6 md:p-7"
                      : "rounded-[1.7rem] border border-white/70 bg-background/82 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.76)] md:p-7"
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
