export function PractitionerControl() {
  return (
    <section
      data-landing-section="control"
      className="bg-[color:var(--carnet-anthracite)] px-4 py-10 text-white sm:px-6 md:py-16 lg:px-8"
    >
      <div className="mx-auto grid max-w-[90rem] gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--carnet-logo-green)]">
            Votre validation reste centrale
          </p>
          <h2 className="mt-4 text-4xl font-semibold leading-[0.96] tracking-[-0.052em] md:text-6xl">
            Biume prépare. Vous décidez.
          </h2>
        </div>
        <p className="flex min-h-12 items-center gap-3 rounded-full border border-white/15 px-5 text-sm font-semibold text-white/80">
          <span aria-hidden="true" className="size-2 rounded-full bg-[color:var(--carnet-green)]" />
          Rien ne part sans votre validation.
        </p>
      </div>
    </section>
  );
}
