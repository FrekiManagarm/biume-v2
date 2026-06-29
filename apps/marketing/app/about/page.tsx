export default function AboutPage() {
  return (
    <main className="min-h-[100dvh] bg-background px-4 py-24 text-foreground md:px-6">
      <section className="mx-auto max-w-3xl">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          A propos
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-6xl">
          Biume aide les therapeutes animaliers a gagner du temps sur leurs
          rapports.
        </h1>
        <p className="mt-6 text-base leading-7 text-muted-foreground">
          Cette page sera completee avec l&apos;histoire du produit, la mission
          et les informations d&apos;equipe.
        </p>
      </section>
    </main>
  );
}
