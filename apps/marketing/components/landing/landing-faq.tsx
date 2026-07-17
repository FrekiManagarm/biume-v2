import Link from "next/link";

const faqItems = [
  {
    question: "Biume remplace-t-il un logiciel de gestion ?",
    answer:
      "Non. Biume se concentre sur le compte rendu propriétaire et le suivi post-séance. Il complète votre organisation actuelle.",
  },
  {
    question: "Biume écrit-il à la place du praticien ?",
    answer:
      "Biume prépare une proposition à partir de vos notes. Lorsque vous l'appliquez, elle remplace le texte du champ courant et reste entièrement modifiable.",
  },
  {
    question: "Chaque texte peut-il être modifié avant le partage ?",
    answer:
      "Oui. Vous pouvez modifier chaque champ avant de déclencher vous-même le téléchargement ou l'envoi.",
  },
  {
    question: "Que reçoit le propriétaire ?",
    answer:
      "Le propriétaire reçoit le PDF professionnel joint à l'email que vous choisissez d'envoyer.",
  },
  {
    question: "Comment arrêter l'abonnement ?",
    answer:
      "Vous pouvez demander l'annulation depuis les paramètres de facturation. Elle prend effet à la fin de la période en cours.",
  },
] as const;

export function LandingFaq() {
  return (
    <div
      data-landing-faq
      className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-16"
    >
      <div className="max-w-xl">
        <h2 className="max-w-[15ch] text-balance text-[clamp(2.25rem,4.5vw,4.5rem)] font-bold leading-none tracking-[-0.03em] text-[color:var(--machine-ink)]">
          Les questions qui comptent avant de commencer.
        </h2>
        <p className="mt-5 text-sm leading-6 text-[color:var(--machine-muted)] md:text-base md:leading-7">
          Pour la confidentialité, consultez notre{" "}
          <Link
            href="/privacy"
            className="inline-flex min-h-11 items-center align-middle font-semibold text-[color:var(--machine-ink)] underline decoration-[color:var(--machine-blue)] underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--machine-violet)]"
          >
            politique de confidentialité
          </Link>
          . Les conditions contractuelles sont détaillées dans nos{" "}
          <Link
            href="/cgu"
            className="inline-flex min-h-11 items-center align-middle font-semibold text-[color:var(--machine-ink)] underline decoration-[color:var(--machine-blue)] underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--machine-violet)]"
          >
            CGU
          </Link>
          .
        </p>
      </div>

      <div className="border-t border-[color:var(--machine-line)]">
        {faqItems.map((item) => (
          <details
            key={item.question}
            data-faq-item={item.question}
            className="group border-b border-[color:var(--machine-line)] py-4"
          >
            <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-5 rounded-sm py-2 text-base font-semibold leading-7 text-[color:var(--machine-ink)] marker:hidden focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[color:var(--machine-violet)]">
              <span>{item.question}</span>
              <span
                data-faq-indicator
                aria-hidden="true"
                className="flex size-8 shrink-0 items-center justify-center rounded-full border border-[color:var(--machine-line)] text-lg font-medium"
              >
                +
              </span>
            </summary>
            <p className="max-w-[68ch] pb-3 pt-2 text-sm leading-6 text-[color:var(--machine-muted)] md:text-base md:leading-7">
              {item.answer}
            </p>
          </details>
        ))}
      </div>
    </div>
  );
}
