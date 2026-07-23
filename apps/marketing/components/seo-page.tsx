import Link from "next/link";
import type { ReactNode } from "react";
import { webAppPath } from "../lib/web-app-url";
import {
  absoluteUrl,
  JsonLd,
  pageBreadcrumbJsonLd,
  siteName,
  siteUrl,
} from "../lib/seo";
import LandingFooter from "./footer";
import { Header } from "./header";

type Stat = {
  value: string;
  label: string;
};

type Section = {
  eyebrow: string;
  title: string;
  body: string;
};

type Faq = {
  question: string;
  answer: string;
};

type LinkItem = {
  href: string;
  label: string;
};

type SeoPageProps = {
  path: string;
  eyebrow: string;
  title: ReactNode;
  description: string;
  stats: readonly Stat[];
  sections: readonly Section[];
  panel: {
    eyebrow: string;
    title: string;
    body: string;
    items: readonly string[];
  };
  faq: readonly Faq[];
  internalLinks: readonly LinkItem[];
  schemaType?: "Service" | "Article";
};

export function SeoPage({
  path,
  eyebrow,
  title,
  description,
  stats,
  sections,
  panel,
  faq,
  internalLinks,
  schemaType = "Service",
}: SeoPageProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": schemaType,
    name: typeof title === "string" ? title : siteName,
    url: absoluteUrl(path),
    description,
    provider: {
      "@type": "Organization",
      name: siteName,
      url: siteUrl,
    },
    areaServed: "FR",
    mainEntity:
      faq.length > 0
        ? faq.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: item.answer,
            },
          }))
        : undefined,
  };

  return (
    <div className="min-h-dvh overflow-x-hidden bg-[color:var(--v2-canvas)] text-[color:var(--v2-ink)] selection:bg-[color:var(--v2-accent)]/25">
      <JsonLd data={schema} />
      <JsonLd data={pageBreadcrumbJsonLd({ path, name: eyebrow })} />
      <Header />
      <main id="contenu" tabIndex={-1}>
          <section className="border-b border-[color:var(--v2-line)] px-5 py-20 md:px-8 md:py-28">
            <div className="mx-auto grid max-w-[1200px] gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
              <div>
                <p className="v2-eyebrow landing-reveal">
                  {eyebrow}
                </p>
                <h1 className="v2-display landing-reveal landing-reveal-2 mt-5 max-w-[16ch] text-[clamp(2.7rem,6vw,5.4rem)] font-medium leading-[1.02] tracking-[-0.05em] [text-wrap:balance]">
                  {title}
                </h1>
                <p className="landing-reveal landing-reveal-3 mt-6 max-w-[60ch] text-base leading-7 text-[color:var(--v2-ink-soft)] md:text-[1.05rem] md:leading-8">
                  {description}
                </p>
                <div className="landing-reveal landing-reveal-4 mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href={webAppPath("/signup")}
                    prefetch={false}
                    className="v2-btn v2-btn-primary v2-btn-lg"
                  >
                    Essayer 15 jours gratuitement
                  </Link>
                  <Link
                    href="https://cal.com/mathieu-chambaud-biume"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="v2-btn v2-btn-secondary v2-btn-lg"
                  >
                    Voir une demo
                  </Link>
                </div>
                <div className="landing-reveal landing-reveal-5 mt-10 grid max-w-xl grid-cols-3 divide-x divide-[color:var(--v2-line)] border-y border-[color:var(--v2-line)] py-4">
                  {stats.map((stat) => (
                    <div key={stat.label} className="px-4 first:pl-0 last:pr-0">
                      <p className="v2-mono text-lg font-medium tracking-tight md:text-2xl">
                        {stat.value}
                      </p>
                      <p className="mt-1 text-xs font-medium leading-4 text-[color:var(--v2-ink-faint)]">
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <aside className="v2-panel landing-reveal landing-reveal-3 p-6 md:p-8">
                <p className="v2-eyebrow v2-eyebrow-green">
                  {panel.eyebrow}
                </p>
                <h2 className="v2-display mt-5 text-[clamp(2rem,4vw,3.5rem)] font-medium leading-[1.02] tracking-[-0.045em]">
                  {panel.title}
                </h2>
                <p className="mt-5 text-sm leading-6 text-[color:var(--v2-ink-soft)] md:text-base md:leading-7">
                  {panel.body}
                </p>
                <div className="mt-7 divide-y divide-[color:var(--v2-line)] border-y border-[color:var(--v2-line)]">
                  {panel.items.map((item, index) => (
                    <div
                      key={item}
                      className="grid grid-cols-[auto_1fr] gap-3 py-4"
                    >
                      <span className="v2-mono text-xs font-medium text-[color:var(--v2-violet-ink)]">
                        0{index + 1}
                      </span>
                      <p className="text-sm font-medium leading-6 text-[color:var(--v2-ink)]">{item}</p>
                    </div>
                  ))}
                </div>
              </aside>
            </div>
          </section>

          <section className="px-5 py-20 md:px-8 md:py-28">
            <div className="mx-auto grid max-w-[1200px] gap-5 md:grid-cols-2">
              {sections.map((section, index) => (
                <article
                  key={section.title}
                  className={
                    index === 0
                      ? "v2-panel bg-[color:var(--v2-bone)] p-7 md:col-span-2 md:p-10"
                      : "v2-card p-7 md:p-8"
                  }
                >
                  <p className="v2-eyebrow">
                    {section.eyebrow}
                  </p>
                  <h2 className="v2-display mt-5 text-[clamp(1.7rem,3vw,2.8rem)] font-medium leading-[1.08] tracking-[-0.04em]">
                    {section.title}
                  </h2>
                  <p className="mt-4 text-sm leading-6 text-[color:var(--v2-ink-soft)] md:text-base md:leading-7">
                    {section.body}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section className="border-t border-[color:var(--v2-line)] px-5 py-20 md:px-8 md:py-28">
            <div className="mx-auto grid max-w-[1200px] gap-8 lg:grid-cols-[0.82fr_1.18fr]">
              <div className="rounded-[24px] bg-[color:var(--v2-espresso)] p-7 text-white md:p-9">
                <p className="v2-eyebrow text-[color:var(--v2-green)]">
                  FAQ
                </p>
                <h2 className="v2-display mt-5 text-[clamp(2rem,4vw,3.4rem)] font-medium leading-[1.02] tracking-[-0.045em]">
                  Questions fréquentes
                </h2>
                <p className="mt-5 text-sm leading-6 text-white/65">
                  Des réponses simples pour décider si Biume correspond à votre
                  pratique.
                </p>
              </div>
              <div className="divide-y divide-[color:var(--v2-line)] border-y border-[color:var(--v2-line)]">
                {faq.map((item) => (
                  <div
                    key={item.question}
                    className="py-6 first:pt-0 last:pb-0"
                  >
                    <h3 className="text-[1.05rem] font-medium tracking-[-0.02em]">
                      {item.question}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-[color:var(--v2-ink-soft)]">
                      {item.answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="px-5 py-20 md:px-8 md:py-24">
            <div className="mx-auto max-w-[1200px] border-t border-[color:var(--v2-line)] pt-8">
              <p className="v2-eyebrow v2-eyebrow-green">
                Continuer
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                {internalLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="v2-btn v2-btn-secondary px-4 py-2 text-sm"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </section>
      </main>
      <LandingFooter />
    </div>
  );
}
