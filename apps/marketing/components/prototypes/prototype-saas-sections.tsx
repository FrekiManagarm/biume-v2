import { webAppPath } from "../../lib/web-app-url";
import { MagneticLink, TransitDocuments } from "./prototype-motion";
import { SAAS_NARRATIVE_CONTENT } from "./prototype-saas-content";

const signupUrl = webAppPath("/signup");

const themes = {
  light: {
    section: "border-[#16322e]/20",
    muted: "text-[#31514b]",
    accent: "text-[#176a5a]",
    surface: "bg-[#d8e9df]",
    quietSurface: "bg-[#f4f6f1]",
    contrastSurface: "bg-[#16322e] text-[#f5f3eb]",
    button: "bg-[#176a5a] text-white hover:bg-[#115246]",
    line: "border-[#16322e]/20",
    comparison: "bg-[#e4e9e3]",
  },
  night: {
    section: "border-white/15",
    muted: "text-white/70",
    accent: "text-[#ef9b70]",
    surface: "bg-[#172a2b]",
    quietSurface: "bg-[#18282a]",
    contrastSurface: "bg-[#e48c65] text-[#192023]",
    button: "bg-[#ef9b70] text-[#101d1e] hover:bg-[#ffc19e]",
    line: "border-white/15",
    comparison: "bg-[#142526]",
  },
} as const;

function Arrow() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="ml-2 size-4">
      <path d="M3.5 10h12m-4-4 4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function NarrativeSaasSections({ tone }: { tone: "light" | "night" }) {
  const theme = themes[tone];
  const methodSteps = [
    "Vos notes restent la base.",
    ...SAAS_NARRATIVE_CONTENT.method.steps,
  ];
  const useCases = [
    ...SAAS_NARRATIVE_CONTENT.useCases,
    {
      title: "Avant le partage",
      body: "Validez le contenu avant de décider de le partager au propriétaire.",
    },
  ];

  return (
    <div className={`border-t ${theme.section}`}>
      <section id="preuve" className={`px-4 py-9 md:px-6 lg:px-8 ${theme.quietSurface}`}>
        <div className="mx-auto flex max-w-[1400px] flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className={`text-sm font-semibold ${theme.accent}`}>{SAAS_NARRATIVE_CONTENT.trust.eyebrow}</p>
            <p className="mt-1 font-semibold">{SAAS_NARRATIVE_CONTENT.trust.title}</p>
          </div>
          <p className={`max-w-[62ch] text-sm leading-6 ${theme.muted}`}>{SAAS_NARRATIVE_CONTENT.trust.body}</p>
        </div>
      </section>

      <section id="methode" className={`border-t px-4 py-20 md:px-6 lg:px-8 lg:py-28 ${theme.section}`}>
        <div className="mx-auto max-w-[1400px]">
          <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-end">
            <div>
              <p className={`text-sm font-semibold ${theme.accent}`}>La méthode</p>
              <h2 className="mt-5 max-w-[10ch] text-balance text-[clamp(2.8rem,5vw,5rem)] font-semibold leading-[0.91] tracking-[-0.038em]">{SAAS_NARRATIVE_CONTENT.tension.title}</h2>
            </div>
            <p className={`max-w-[52ch] text-pretty text-lg leading-8 ${theme.muted}`}>{SAAS_NARRATIVE_CONTENT.tension.body}</p>
          </div>
          <ol className={`mt-14 border-t ${theme.line}`}>
            {methodSteps.map((step, index) => (
              <li key={step} className={`grid gap-4 border-b py-5 sm:grid-cols-[4rem_1fr] sm:items-center ${theme.line}`}>
                <span className={`font-mono text-xs font-semibold tracking-[0.16em] ${theme.accent}`}>0{index + 1}</span>
                <p className="max-w-[55ch] text-lg leading-7">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="produit" className={`border-t px-4 py-20 md:px-6 lg:px-8 lg:py-28 ${theme.section}`}>
        <div className="mx-auto max-w-[1400px]">
          <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
            <h2 className="max-w-[9ch] text-balance text-[clamp(2.8rem,5vw,5rem)] font-semibold leading-[0.91] tracking-[-0.038em]">Un parcours que vous gardez en main.</h2>
            <ul className={`grid gap-x-8 gap-y-4 border-l pl-6 text-lg leading-7 sm:grid-cols-2 ${theme.line}`}>
              {SAAS_NARRATIVE_CONTENT.benefits.map((benefit) => (
                <li key={benefit} className="flex gap-3"><span aria-hidden="true" className={`mt-2 size-2 shrink-0 rounded-full ${tone === "light" ? "bg-[#176a5a]" : "bg-[#ef9b70]"}`} />{benefit}</li>
              ))}
            </ul>
          </div>
          <div className="mt-16"><TransitDocuments tone={tone} /></div>
        </div>
      </section>

      <section id="cas" className={`border-t px-4 py-20 md:px-6 lg:px-8 lg:py-28 ${theme.section} ${theme.surface}`}>
        <div className="mx-auto max-w-[1400px]">
          <p className={`text-sm font-semibold ${theme.accent}`}>Dans la pratique</p>
          <h2 className="mt-5 max-w-[13ch] text-balance text-[clamp(2.8rem,5vw,5rem)] font-semibold leading-[0.91] tracking-[-0.038em]">Trois moments où garder le fil.</h2>
          <div className={`mt-12 divide-y border-y ${theme.line}`}>
            {useCases.map((useCase, index) => (
              <article key={useCase.title} className="grid gap-4 py-7 md:grid-cols-[5rem_minmax(12rem,0.55fr)_1fr] md:items-start">
                <span className={`font-mono text-xs font-semibold tracking-[0.16em] ${theme.accent}`}>0{index + 1}</span>
                <h3 className="text-xl font-semibold tracking-[-0.02em]">{useCase.title}</h3>
                <p className={`max-w-[48ch] leading-7 ${theme.muted}`}>{useCase.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="comparatif" className={`border-t px-4 py-20 md:px-6 lg:px-8 lg:py-28 ${theme.section}`}>
        <div className="mx-auto grid max-w-[1400px] gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-center">
          <div>
            <p className={`text-sm font-semibold ${theme.accent}`}>Avant / avec Biume</p>
            <h2 className="mt-5 max-w-[9ch] text-balance text-[clamp(2.8rem,5vw,5rem)] font-semibold leading-[0.91] tracking-[-0.038em]">Moins à retrouver, plus à relier.</h2>
          </div>
          <dl className={`overflow-hidden border ${theme.line} ${theme.comparison}`}>
            <div className={`grid gap-3 p-6 md:grid-cols-[10rem_1fr] md:items-baseline ${theme.line} border-b`}>
              <dt className={`text-sm font-semibold ${theme.muted}`}>Sans Biume</dt>
              <dd className="text-lg leading-7">{SAAS_NARRATIVE_CONTENT.comparison.without}</dd>
            </div>
            <div className={`grid gap-3 p-6 md:grid-cols-[10rem_1fr] md:items-baseline ${theme.contrastSurface}`}>
              <dt className="text-sm font-semibold opacity-75">Avec Biume</dt>
              <dd className="text-lg leading-7">{SAAS_NARRATIVE_CONTENT.comparison.with}</dd>
            </div>
          </dl>
        </div>
      </section>

      <section id="tarifs" className={`border-t px-4 py-20 md:px-6 lg:px-8 lg:py-28 ${theme.section}`}>
        <div className="mx-auto grid max-w-[1400px] gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div>
            <p className={`text-sm font-semibold ${theme.accent}`}>Tarifs</p>
            <h2 className="mt-5 max-w-[9ch] text-balance text-[clamp(2.8rem,5vw,5rem)] font-semibold leading-[0.91] tracking-[-0.038em]">Essayez avec le temps de décider.</h2>
            <p className={`mt-6 max-w-[36ch] text-lg leading-8 ${theme.muted}`}>15 jours d’essai, sans carte bancaire.</p>
          </div>
          <div className={`border-t ${theme.line}`}>
            <div className={`flex flex-wrap items-baseline justify-between gap-4 border-b py-6 ${theme.line}`}>
              <div><p className="text-lg font-semibold">Annuel</p><p className={`mt-1 text-sm ${theme.muted}`}>{SAAS_NARRATIVE_CONTENT.pricing.annualDetail}</p></div>
              <p className="text-3xl font-semibold tracking-[-0.03em]">{SAAS_NARRATIVE_CONTENT.pricing.annual} <span className={`text-sm font-medium ${theme.muted}`}>/ mois</span></p>
            </div>
            <div className="flex flex-wrap items-baseline justify-between gap-4 py-6">
              <div><p className="text-lg font-semibold">Mensuel</p><p className={`mt-1 text-sm ${theme.muted}`}>{SAAS_NARRATIVE_CONTENT.pricing.monthlyDetail}</p></div>
              <p className="text-3xl font-semibold tracking-[-0.03em]">{SAAS_NARRATIVE_CONTENT.pricing.monthly} <span className={`text-sm font-medium ${theme.muted}`}>/ mois</span></p>
            </div>
          </div>
        </div>
      </section>

      <section id="faq" className={`border-t px-4 py-20 md:px-6 lg:px-8 lg:py-28 ${theme.section} ${theme.quietSurface}`}>
        <div className="mx-auto grid max-w-[1400px] gap-10 lg:grid-cols-[0.72fr_1.28fr]">
          <div>
            <p className={`text-sm font-semibold ${theme.accent}`}>Questions fréquentes</p>
            <h2 className="mt-5 max-w-[8ch] text-balance text-[clamp(2.8rem,5vw,5rem)] font-semibold leading-[0.91] tracking-[-0.038em]">Les réponses essentielles.</h2>
          </div>
          <div className={`border-t ${theme.line}`}>
            {SAAS_NARRATIVE_CONTENT.faq.map((item) => (
              <details key={item.question} className={`group border-b ${theme.line}`}>
                <summary className="transit-focus flex min-h-12 cursor-pointer list-none items-center justify-between gap-6 py-4 text-lg font-semibold [&::-webkit-details-marker]:hidden">
                  {item.question}<span aria-hidden="true" className={`text-2xl font-normal ${theme.accent} group-open:rotate-45`}>+</span>
                </summary>
                <p className={`max-w-[54ch] pb-5 leading-7 ${theme.muted}`}>{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className={`border-t px-4 py-20 md:px-6 lg:px-8 lg:py-28 ${theme.section} ${theme.contrastSurface}`}>
        <div className="mx-auto flex max-w-[1400px] flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-semibold opacity-75">Prêt à préparer votre premier suivi ?</p>
            <h2 className="mt-4 max-w-[12ch] text-balance text-[clamp(2.8rem,5vw,5rem)] font-semibold leading-[0.91] tracking-[-0.038em]">Vos notes peuvent déjà faire le lien.</h2>
          </div>
          <MagneticLink href={signupUrl} dataConversion="prototype-signup" className={`transit-focus transit-action inline-flex min-h-12 shrink-0 items-center justify-center px-5 text-sm font-semibold ${tone === "light" ? "bg-[#f5f3eb] text-[#16322e] hover:bg-white" : "bg-[#101d1e] text-[#f5f3eb] hover:bg-[#263a3b]"}`}>
            Essayer gratuitement<Arrow />
          </MagneticLink>
        </div>
      </section>
    </div>
  );
}
