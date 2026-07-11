const faqItems = [
  {
    question: "Est-ce que Biume remplace mon logiciel de gestion ?",
    answer:
      "Non. Vous pouvez conserver votre agenda, votre facturation et vos habitudes. Biume se concentre sur le résumé propriétaire, le suivi post-séance et l’évolution de l’animal.",
  },
  {
    question: "Est-ce que l'IA écrit à ma place ?",
    answer:
      "Biume prépare une formulation à partir de vos observations. Vous relisez, corrigez et validez toujours le contenu avant son envoi.",
  },
  {
    question: "Puis-je modifier un résumé avant de l'envoyer ?",
    answer:
      "Oui. Chaque résumé reste modifiable afin de conserver votre vocabulaire, votre niveau de détail et vos recommandations.",
  },
  {
    question: "Comment mes données sont-elles protégées ?",
    answer:
      "Biume est hébergé en France et conçu pour respecter le RGPD. Vos données ne sont pas vendues et restent liées à votre activité.",
  },
  {
    question: "Puis-je résilier à tout moment ?",
    answer:
      "Oui pour la formule mensuelle. La formule annuelle reste active jusqu’à la fin de la période déjà facturée.",
  },
] as const;

export function LandingFaq() {
  return (
    <section id="faq" className="px-4 py-16 md:px-6 md:py-24">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16">
        <div className="max-w-xl">
          <h2 className="text-4xl font-semibold leading-[1.02] tracking-[-0.035em] text-foreground md:text-5xl">
            Les questions avant de commencer.
          </h2>
          <p className="mt-5 text-base leading-7 text-muted-foreground">
            Compatibilité, contrôle des textes, données et résiliation.
          </p>
        </div>

        <div className="divide-y divide-border border-y border-border">
          {faqItems.map((item) => (
            <details key={item.question} className="group py-5">
              <summary className="min-h-11 cursor-pointer rounded-sm py-2 pr-4 text-base font-semibold leading-7 text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
                {item.question}
              </summary>
              <p className="max-w-[68ch] pb-2 pt-3 text-sm leading-6 text-muted-foreground md:text-base md:leading-7">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
