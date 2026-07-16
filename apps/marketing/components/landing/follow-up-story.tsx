export function FollowUpStory() {
  return (
    <section
      data-landing-section="follow-up"
      className="bg-[color:var(--carnet-blue-soft)] px-4 py-10 sm:px-6 md:py-20 lg:px-8"
    >
      <div className="mx-auto grid max-w-[90rem] gap-10 lg:grid-cols-[0.84fr_1.16fr] lg:items-center lg:gap-16">
        <div>
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--carnet-ink)]">
            La continuité après la séance
          </p>
          <h2 className="mt-4 max-w-[15ch] text-4xl font-semibold leading-[0.96] tracking-[-0.052em] text-[color:var(--carnet-ink)] md:text-6xl">
            Le suivi ne repose plus sur votre mémoire.
          </h2>
          <p className="mt-5 max-w-[52ch] text-base leading-7 text-[color:var(--carnet-muted)]">
            Le compte rendu, l’échéance et la prochaine étape restent dans le même parcours.
          </p>
        </div>
        <div className="relative grid gap-4 border-l border-[color:var(--carnet-blue)] pl-5 sm:pl-8">
          <article className="mr-8 rounded-[1.5rem_1.5rem_1.5rem_0.5rem] bg-[color:var(--carnet-surface)] p-5 shadow-[0_22px_55px_-40px_rgba(93,155,184,0.55)]">
            <p className="font-mono text-xs text-[color:var(--carnet-muted)]">Après la séance</p>
            <h3 className="mt-2 text-lg font-semibold">Compte rendu prêt à relire</h3>
          </article>
          <article className="ml-8 rounded-[1.5rem_1.5rem_0.5rem_1.5rem] bg-[color:var(--carnet-green-soft)] p-5">
            <p className="font-mono text-xs text-[color:var(--carnet-green-ink)]">Échéance choisie par le praticien</p>
            <h3 className="mt-2 text-lg font-semibold">Suivi prévu dans 30 jours</h3>
          </article>
        </div>
      </div>
    </section>
  );
}
