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
        <div className="relative mx-auto grid max-w-7xl gap-4 overflow-hidden rounded-[2.25rem] border border-border bg-background p-4 shadow-[0_38px_120px_-84px_rgba(20,18,28,0.66)] lg:grid-cols-[1.2fr_0.8fr]">
          <div
            className="hero-color-wash pointer-events-none absolute inset-0 bg-[linear-gradient(125deg,rgba(124,102,238,0.16),rgba(255,255,255,0)_42%,rgba(32,184,100,0.18)_72%,rgba(124,102,238,0.12))]"
            aria-hidden="true"
          />
          <div className="relative overflow-hidden rounded-[1.85rem] border border-white/10 bg-foreground p-6 text-background shadow-[0_34px_100px_-76px_rgba(20,18,28,0.72)] md:p-9">
            <div
              className="hero-scan-line absolute inset-x-0 top-0 h-24 bg-linear-to-b from-transparent via-secondary/16 to-transparent"
              aria-hidden="true"
            />
            <p className="relative font-mono text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
              Prêt à démarrer ?
            </p>
            <h2 className="relative mt-4 max-w-3xl text-4xl font-semibold leading-none tracking-tight md:text-6xl">
              Faites voir la valeur de chaque séance{" "}
              <span className="text-secondary">
                après le rendez-vous
              </span>
            </h2>
            <p className="relative mt-5 max-w-[62ch] text-base leading-7 text-background/62">
              Testez les résumés propriétaire, la timeline animal et les
              relances de suivi pendant 15 jours, sans carte bancaire.
            </p>
            <div className="relative mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href={webAppPath("/signup")}
                prefetch={false}
                className="inline-flex items-center justify-center rounded-full bg-secondary px-5 py-3 text-sm font-semibold text-secondary-foreground shadow-[0_18px_42px_-32px_rgba(32,184,100,0.48)] transition-all hover:bg-secondary/88 active:scale-[0.98]"
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

          <div className="relative rounded-[1.85rem] border border-white/70 bg-background/84 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.78)] backdrop-blur-xl md:p-8">
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
