import type {
  ReportTransformationDemo,
  ReportTransformationStep,
} from "./report-transformation-demo";

function RailStateContent({
  step,
  demo,
}: {
  step: ReportTransformationStep;
  demo: ReportTransformationDemo;
}) {
  switch (step.id) {
    case "note":
      return (
        <div className="mt-5 border-l-2 border-[color:var(--cinematic-rust)] pl-4">
          <p className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[color:var(--cinematic-trace-muted)]">
            Note technique
          </p>
          <p className="mt-2 max-w-[48ch] text-sm leading-6 text-[color:var(--cinematic-paper)]">
            {demo.observation}
          </p>
        </div>
      );
    case "structure":
      return (
        <dl className="mt-5 grid max-w-xl grid-cols-2 gap-x-5 gap-y-3 text-sm">
          <div>
            <dt className="font-mono text-[0.65rem] uppercase tracking-[0.12em] text-[color:var(--cinematic-trace-muted)]">
              Zone
            </dt>
            <dd className="mt-1 text-[color:var(--cinematic-paper)]">
              Thorax
            </dd>
          </div>
          <div>
            <dt className="font-mono text-[0.65rem] uppercase tracking-[0.12em] text-[color:var(--cinematic-trace-muted)]">
              Côté
            </dt>
            <dd className="mt-1 text-[color:var(--cinematic-paper)]">
              Gauche
            </dd>
          </div>
          <div className="col-span-2">
            <dt className="font-mono text-[0.65rem] uppercase tracking-[0.12em] text-[color:var(--cinematic-trace-muted)]">
              Mobilité
            </dt>
            <dd className="mt-1 leading-6 text-[color:var(--cinematic-paper)]">
              {demo.observation}
            </dd>
          </div>
        </dl>
      );
    case "language":
      return (
        <div className="mt-5 border-l-2 border-[color:var(--cinematic-rust)] pl-4">
          <p className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[color:var(--cinematic-trace-muted)]">
            Proposition adaptée
          </p>
          <p className="mt-2 max-w-[48ch] text-sm leading-6 text-[color:var(--cinematic-paper)]">
            {demo.adaptedProposal}
          </p>
          <p className="mt-2 text-xs leading-5 text-[color:var(--cinematic-trace-muted)]">
            {demo.help}
          </p>
        </div>
      );
    case "final":
      return (
        <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 font-mono text-xs">
          <span
            data-report-final-status
            className="inline-flex items-center gap-2 text-[color:var(--cinematic-paper)]"
          >
            <span
              data-report-final-dot
              aria-hidden="true"
              className="size-1.5 rounded-full bg-[color:var(--carnet-green)]"
            />
            {demo.finalStatus}
          </span>
          <span className="text-[color:var(--cinematic-trace-muted)]">
            {demo.fileName}
          </span>
        </div>
      );
  }
}

function TransformationStep({
  step,
  index,
  demo,
}: {
  step: ReportTransformationStep;
  index: number;
  demo: ReportTransformationDemo;
}) {
  return (
    <li
      data-report-state={step.id}
      className="border-t border-[color:var(--cinematic-trace-line)] py-8 first:border-[color:var(--cinematic-rust)] md:py-10"
    >
      <div className="grid gap-4 sm:grid-cols-[4.5rem_1fr]">
        <span className="font-mono text-xs text-[color:var(--cinematic-trace-muted)]">
          0{index + 1} / 04
        </span>
        <div>
          <h3 className="text-2xl font-semibold tracking-[-0.035em] text-[color:var(--cinematic-paper)] md:text-3xl">
            {step.label}
          </h3>
          <p className="mt-2 max-w-[44ch] text-sm leading-6 text-[color:var(--cinematic-trace-muted)] md:text-base md:leading-7">
            {step.body}
          </p>
          <RailStateContent step={step} demo={demo} />
        </div>
      </div>
    </li>
  );
}

function DocumentState({
  step,
  index,
  demo,
}: {
  step: ReportTransformationStep;
  index: number;
  demo: ReportTransformationDemo;
}) {
  if (step.id === "note") {
    return (
      <article
        data-report-layer={step.id}
        className="grid gap-4 border-b border-[color:var(--carnet-muted)]/25 py-7 sm:grid-cols-[3rem_1fr] sm:py-9"
      >
        <span className="font-mono text-[0.65rem] text-[color:var(--carnet-muted)]">
          0{index + 1}
        </span>
        <div>
          <p className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[color:var(--carnet-muted)]">
            Note technique
          </p>
          <p
            data-report-annotation
            className="mt-4 font-[family-name:var(--font-newsreader)] text-xl italic leading-8 text-[color:var(--cinematic-rust)]"
          >
            {demo.observation}
          </p>
        </div>
      </article>
    );
  }

  if (step.id === "structure") {
    return (
      <article
        data-report-layer={step.id}
        className="grid gap-4 border-b border-[color:var(--carnet-muted)]/25 py-7 sm:grid-cols-[3rem_1fr] sm:py-9"
      >
        <span className="font-mono text-[0.65rem] text-[color:var(--carnet-muted)]">
          0{index + 1}
        </span>
        <div>
          <p className="border-l-2 border-[color:var(--cinematic-rust)] pl-3 font-mono text-[0.65rem] font-semibold uppercase tracking-[0.14em]">
            Observation structurée
          </p>
          <dl className="mt-5 grid grid-cols-2 gap-5 text-sm">
            <div>
              <dt className="font-mono text-[0.62rem] uppercase tracking-[0.12em] text-[color:var(--carnet-muted)]">
                Zone
              </dt>
              <dd className="mt-1">Thorax</dd>
            </div>
            <div>
              <dt className="font-mono text-[0.62rem] uppercase tracking-[0.12em] text-[color:var(--carnet-muted)]">
                Côté
              </dt>
              <dd className="mt-1">Gauche</dd>
            </div>
            <div className="col-span-2">
              <dt className="font-mono text-[0.62rem] uppercase tracking-[0.12em] text-[color:var(--carnet-muted)]">
                Mobilité
              </dt>
              <dd className="mt-1">Améliorée pendant la séance</dd>
            </div>
          </dl>
          <p className="mt-5 text-base leading-7">{demo.observation}</p>
        </div>
      </article>
    );
  }

  if (step.id === "language") {
    return (
      <article
        data-report-layer={step.id}
        className="grid gap-4 border-b border-[color:var(--carnet-muted)]/25 py-7 sm:grid-cols-[3rem_1fr] sm:py-9"
      >
        <span className="font-mono text-[0.65rem] text-[color:var(--carnet-muted)]">
          0{index + 1}
        </span>
        <div>
          <p className="border-l-2 border-[color:var(--cinematic-rust)] pl-3 font-mono text-[0.65rem] font-semibold uppercase tracking-[0.14em]">
            Proposition adaptée
          </p>
          <p className="mt-4 text-base leading-7">{demo.adaptedProposal}</p>
          <p className="mt-4 text-xs leading-5 text-[color:var(--carnet-muted)]">
            {demo.help}
          </p>
        </div>
      </article>
    );
  }

  return (
    <article
      data-report-layer={step.id}
      className="grid gap-4 py-7 sm:grid-cols-[3rem_1fr] sm:py-9"
    >
      <span className="font-mono text-[0.65rem] text-[color:var(--carnet-muted)]">
        0{index + 1}
      </span>
      <div>
        <div className="flex items-center justify-between gap-4">
          <p className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.14em]">
            {demo.finalStatus}
          </p>
          <span
            aria-label="Document validé"
            className="inline-flex items-center gap-2 font-mono text-[0.62rem] text-[color:var(--carnet-muted)]"
          >
            <span
              aria-hidden="true"
              className="size-1.5 rounded-full bg-[color:var(--carnet-green)]"
            />
            Validé
          </span>
        </div>
        <p className="mt-4 text-base leading-7">{demo.adaptedProposal}</p>
        <div className="mt-6 flex flex-col gap-4 border-t border-[color:var(--carnet-muted)]/25 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <span className="font-mono text-xs text-[color:var(--carnet-muted)]">
            {demo.fileName}
          </span>
          <span className="inline-flex min-h-9 items-center justify-center rounded-full bg-[color:var(--carnet-ink)] px-4 text-xs font-semibold text-[color:var(--cinematic-paper)]">
            Partager le PDF
          </span>
        </div>
      </div>
    </article>
  );
}

function ReportPaper({ demo }: { demo: ReportTransformationDemo }) {
  return (
    <div data-report-document className="cinematic-report-paper px-5 sm:px-8">
      <div className="flex items-center justify-between gap-4 border-b border-[color:var(--carnet-muted)]/25 py-5">
        <div>
          <p className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.15em] text-[color:var(--carnet-muted)]">
            Compte rendu propriétaire
          </p>
          <p className="mt-1 text-sm font-semibold">Séance · Cheval</p>
        </div>
        <span className="font-mono text-[0.65rem] text-[color:var(--carnet-muted)]">
          Trace de séance
        </span>
      </div>
      {demo.steps.map((step, index) => (
        <DocumentState
          key={step.id}
          step={step}
          index={index}
          demo={demo}
        />
      ))}
    </div>
  );
}

export function ReportTransformationStory({
  demo,
}: Readonly<{ demo: ReportTransformationDemo }>) {
  return (
    <section
      id="produit"
      data-landing-section="transformation"
      data-report-raccord="gesture-to-document"
      className="cinematic-trace scroll-mt-18 px-4 py-10 sm:px-6 md:py-20 lg:px-8"
    >
      <div className="relative mx-auto max-w-[90rem]">
        <div className="max-w-4xl">
          <p className="cinematic-scene-label">Scène 02 · La trace</p>
          <p className="mt-4 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--cinematic-rust)]">
            Du geste au document
          </p>
          <div
            aria-hidden="true"
            className="cinematic-report-rule mt-5 h-px w-16"
          />
          <h2 className="mt-4 text-4xl font-semibold leading-[0.96] tracking-[-0.052em] md:text-6xl lg:text-7xl">
            Une note devient un document que le propriétaire peut{" "}
            <span className="font-[family-name:var(--font-newsreader)] font-normal italic">
              comprendre.
            </span>
          </h2>
        </div>

        <div className="mt-10 grid gap-12 md:mt-12 lg:mt-16 lg:grid-cols-[0.78fr_1.22fr] lg:items-start lg:gap-16">
          <ol>
            {demo.steps.map((step, index) => (
              <TransformationStep
                key={step.id}
                step={step}
                index={index}
                demo={demo}
              />
            ))}
          </ol>
          <ReportPaper demo={demo} />
        </div>
      </div>
    </section>
  );
}
