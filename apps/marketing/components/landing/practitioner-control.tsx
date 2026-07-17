const decisions = [
  "Modifier",
  "Reformuler",
  "Supprimer",
  "Partager après validation",
] as const;

export function PractitionerControl() {
  return (
    <section
      data-landing-section="control"
      className="bg-[color:var(--machine-violet)] px-4 py-16 text-white sm:px-6 md:py-24 lg:px-8"
    >
      <div className="mx-auto grid max-w-[90rem] gap-10 lg:grid-cols-[1fr_1.15fr] lg:items-end">
        <div>
          <h2 className="max-w-[12ch] text-balance text-[clamp(2.5rem,5vw,5rem)] font-bold leading-[0.94] tracking-[-0.035em]">
            Biume prépare. Vous décidez.
          </h2>
          <p className="mt-6 max-w-[56ch] text-base leading-7 text-white/75 md:text-lg">
            Chaque proposition reste modifiable. Rien n’est partagé tant que
            vous ne l’avez pas choisi.
          </p>
        </div>
        <ul className="grid gap-3 sm:grid-cols-2">
          {decisions.map((decision) => (
            <li
              key={decision}
              className="flex min-h-16 items-center gap-3 rounded-[var(--machine-control-radius)] bg-white/[0.12] px-4"
            >
              <span aria-hidden="true" className="size-2 rounded-full bg-white/60" />
              <span className="font-semibold">{decision}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
