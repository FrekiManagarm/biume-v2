import { Reveal } from "./motion";

/**
 * Les numéros sont légitimes ici : la liste est une séquence de lecture
 * ordonnée, pas une décoration posée au-dessus de chaque section.
 */
export const FAQ_ITEMS = [
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

export function Faq() {
  return (
    <section
      id="questions"
      aria-labelledby="lv2-faq-title"
      className="scroll-mt-20 border-t border-[color:var(--lv2-line)]"
    >
      <div className="mx-auto grid max-w-[1240px] gap-12 px-5 py-24 md:px-8 md:py-32 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
        <Reveal as="h2">
          <span
            id="lv2-faq-title"
            className="lv2-headline block text-[color:var(--lv2-ink)]"
          >
            Avant de commencer.
          </span>
        </Reveal>

        <div>
          {FAQ_ITEMS.map((item, index) => (
            <Reveal key={item.question}>
              <details className="group border-b border-[color:var(--lv2-line)] first:border-t">
                <summary className="grid cursor-pointer list-none grid-cols-[2rem_minmax(0,1fr)_2.5rem] items-center gap-4 py-6 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--lv2-violet)] [&::-webkit-details-marker]:hidden">
                  <span className="lv2-fn text-[color:var(--lv2-ink-2)]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="text-[1.05rem] font-semibold leading-[1.35] tracking-[-0.015em] text-[color:var(--lv2-ink)] transition-colors duration-[120ms] group-hover:text-[color:var(--lv2-violet)] group-open:text-[color:var(--lv2-violet)] md:text-[1.15rem]">
                    {item.question}
                  </span>
                  <span
                    aria-hidden="true"
                    className="flex size-9 items-center justify-center justify-self-end rounded-full border border-[color:var(--lv2-line)] text-[color:var(--lv2-violet)] transition-[transform,border-color,background-color,color] duration-[200ms] ease-[cubic-bezier(0.4,0,0.2,1)] group-open:rotate-45 group-open:border-[color:var(--lv2-violet)] group-open:bg-[color:var(--lv2-violet)] group-open:text-white"
                  >
                    <svg
                      viewBox="0 0 16 16"
                      className="size-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    >
                      <path d="M8 3.5v9M3.5 8h9" />
                    </svg>
                  </span>
                </summary>
                <p className="max-w-[58ch] pb-7 pl-[3rem] text-[0.98rem] leading-[1.7] text-[color:var(--lv2-ink-2)]">
                  {item.answer}
                </p>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
