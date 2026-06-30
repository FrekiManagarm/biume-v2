import Link from "next/link";
import { webAppPath } from "../lib/web-app-url";

const faqItems = [
  {
    question: "Est-ce que Biume redige a ma place ?",
    answer:
      "Biume propose une trame et des formulations. Vous gardez la validation finale avant tout envoi.",
  },
  {
    question: "Mes clients liront-ils le compte rendu ?",
    answer:
      "Biume privilégie un résumé propriétaire court, clair et actionnable plutôt qu'un long rapport technique.",
  },
  {
    question: "Est-ce compatible avec mon outil actuel ?",
    answer:
      "Oui. Gardez votre agenda ou votre facturation; Biume se concentre sur le suivi post-séance.",
  },
] as const;

export function CTASection() {
  return (
    <>
      <section className="px-4 py-8 md:px-6 md:py-14">
        <div className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[2rem] border border-border bg-foreground p-6 text-background shadow-[0_34px_100px_-76px_rgba(20,18,28,0.66)] md:p-9">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              Prêt à démarrer ?
            </p>
            <h2 className="mt-4 max-w-3xl text-4xl font-semibold leading-none tracking-tight md:text-6xl">
              Faites voir la valeur de chaque séance{" "}
              <span className="bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
                après le rendez-vous
              </span>
            </h2>
            <p className="mt-5 max-w-[62ch] text-base leading-7 text-background/62">
              Testez les résumés propriétaire, la timeline animal et les
              relances de suivi pendant 15 jours, sans carte bancaire.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href={webAppPath("/signup")}
                prefetch={false}
                className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-[0_18px_42px_-30px_rgba(124,102,238,0.75)] transition-all hover:bg-primary/88 active:scale-[0.98]"
              >
                Commencer gratuitement
              </Link>
              <Link
                href="https://cal.com/mathieu-chambaud-biume"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-full border border-background/18 px-5 py-3 text-sm font-semibold text-background transition-all hover:bg-background/10 active:scale-[0.98]"
              >
                Reserver une demo
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] border border-secondary/20 bg-secondary/8 p-6 md:p-8">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
              Lancez-vous sans risque
            </p>
            <h3 className="mt-4 text-2xl font-semibold tracking-tight">
              Un outil pensé pour les praticiens manuels de santé animale.
            </h3>
            <div className="mt-5 divide-y divide-border">
              {faqItems.map((item) => (
                <div key={item.question} className="py-5 first:pt-0 last:pb-0">
                  <h3 className="text-base font-semibold tracking-tight">
                    {item.question}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {item.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
