import Image from "next/image";

const journey = [
  {
    title: "Observer",
    body: "Vous notez l’essentiel pendant ou juste après la séance.",
  },
  {
    title: "Valider",
    body: "Biume structure. Vous relisez chaque mot avant l’envoi.",
  },
  {
    title: "Suivre",
    body: "Le propriétaire répond simplement à J+7.",
  },
  {
    title: "Revoir",
    body: "L’évolution reste lisible au fil des rendez-vous.",
  },
] as const;

const outcomes = [
  {
    title: "Résumé propriétaire",
    body: "Une version courte et claire, validée par vous.",
  },
  {
    title: "Retour à J+7",
    body: "Le propriétaire partage ce qu’il observe sans friction.",
  },
  {
    title: "Timeline animal",
    body: "Séances, retours et évolution restent dans le même fil.",
  },
] as const;

const sectionClass = "px-4 py-16 md:px-6 md:py-24";
const containerClass = "mx-auto max-w-7xl";

export function FeaturesSection() {
  return (
    <>
      <section id="probleme" className={sectionClass}>
        <div
          className={`${containerClass} grid items-center gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:gap-16`}
        >
          <div className="max-w-xl">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              Après la séance
            </p>
            <h2 className="mt-4 text-4xl font-semibold leading-[1.02] tracking-[-0.035em] text-foreground md:text-5xl">
              La séance ne s&apos;arrête pas au rendez-vous.
            </h2>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              Le propriétaire doit encore comprendre vos observations, savoir
              quoi surveiller et reconnaître le bon moment pour reprendre
              contact.
            </p>
          </div>

          <div className="relative aspect-[3/2] overflow-hidden rounded-[20px] bg-muted">
            <Image
              src="/assets/images/landing/practitioner-dog.png"
              alt="Une praticienne accompagne un chien pendant une séance manuelle"
              fill
              sizes="(min-width: 1280px) 700px, (min-width: 1024px) 56vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      <section id="parcours" className={`${sectionClass} border-y border-border`}>
        <div className={containerClass}>
          <div className="max-w-3xl">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              Le parcours
            </p>
            <h2 className="mt-4 text-4xl font-semibold leading-[1.02] tracking-[-0.035em] text-foreground md:text-5xl">
              Un fil clair, du rendez-vous au prochain échange.
            </h2>
          </div>

          <div className="mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 md:grid md:grid-cols-2 md:overflow-visible md:snap-none md:pb-0 lg:grid-cols-4">
            {journey.map((step) => (
              <article
                key={step.title}
                className="landing-journey-card w-[82vw] max-w-sm shrink-0 snap-start rounded-2xl border border-border bg-card p-6 text-card-foreground md:w-auto md:max-w-none"
              >
                <h3 className="text-xl font-semibold tracking-tight">
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

      <section id="resultat" className={sectionClass}>
        <div className={containerClass}>
          <div className="max-w-3xl">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              Le résultat
            </p>
            <h2 className="mt-4 text-4xl font-semibold leading-[1.02] tracking-[-0.035em] text-foreground md:text-5xl">
              Le propriétaire comprend. Vous gardez le fil.
            </h2>
          </div>

          <div className="mt-10 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start lg:gap-16">
            <article
              className="rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-[0_24px_60px_-48px_rgba(24,23,26,0.42)] md:p-8"
              aria-label="Exemple de résumé"
            >
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
                Exemple de résumé
              </p>
              <h3 className="mt-4 text-2xl font-semibold tracking-tight">
                Après la séance
              </h3>
              <dl className="mt-8 divide-y divide-border border-y border-border">
                <div className="grid gap-2 py-5 sm:grid-cols-[0.42fr_0.58fr] sm:gap-6">
                  <dt className="text-sm font-semibold text-foreground">
                    Points observés
                  </dt>
                  <dd className="text-sm leading-6 text-muted-foreground">
                    Vos observations, présentées dans un langage accessible.
                  </dd>
                </div>
                <div className="grid gap-2 py-5 sm:grid-cols-[0.42fr_0.58fr] sm:gap-6">
                  <dt className="text-sm font-semibold text-foreground">
                    Conseils transmis
                  </dt>
                  <dd className="text-sm leading-6 text-muted-foreground">
                    Vos recommandations, relues et validées avant l&apos;envoi.
                  </dd>
                </div>
                <div className="grid gap-2 py-5 sm:grid-cols-[0.42fr_0.58fr] sm:gap-6">
                  <dt className="text-sm font-semibold text-foreground">
                    Prochaine étape
                  </dt>
                  <dd className="text-sm leading-6 text-muted-foreground">
                    Les repères que vous choisissez pour la suite.
                  </dd>
                </div>
              </dl>
            </article>

            <div className="divide-y divide-border border-y border-border">
              {outcomes.map((outcome) => (
                <article key={outcome.title} className="py-6 first:pt-0 lg:py-8">
                  <h3 className="text-xl font-semibold tracking-tight text-foreground">
                    {outcome.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {outcome.body}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="controle" className={sectionClass}>
        <div
          className={`${containerClass} grid gap-5 rounded-2xl border border-primary/20 bg-primary/10 px-6 py-8 md:px-10 md:py-10 lg:grid-cols-[0.7fr_1.3fr] lg:items-center lg:gap-12`}
        >
          <h2 className="text-3xl font-semibold leading-tight tracking-[-0.025em] text-foreground md:text-4xl">
            Biume prépare. Vous décidez.
          </h2>
          <p className="text-base leading-7 text-muted-foreground md:text-lg md:leading-8">
            Vous relisez, corrigez et validez chaque message avant l&apos;envoi.
            Biume n&apos;établit aucun diagnostic et ne parle jamais à votre
            place.
          </p>
        </div>
      </section>
    </>
  );
}
