import Link from "next/link";
import type { ReactNode } from "react";
import { webAppPath } from "../lib/web-app-url";
import { absoluteUrl, JsonLd, siteName, siteUrl } from "../lib/seo";
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
  schemaType?: "Product" | "Service" | "Article";
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
    audience: {
      "@type": "Audience",
      audienceType: "Ostéopathes animaliers et thérapeutes animaliers",
    },
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
    <>
      <JsonLd data={schema} />
      <Header />
      <div className="min-h-[100dvh] overflow-x-hidden bg-background text-foreground selection:bg-primary/20">
        <main>
          <section className="relative overflow-hidden px-4 pb-10 pt-[7.5rem] md:px-6 md:pb-14 md:pt-[8.5rem]">
            <PageBackdrop />
            <div className="relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
              <div>
                <div className="landing-reveal inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/8 px-3 py-1.5 text-sm font-semibold text-primary shadow-[0_16px_44px_-34px_rgba(124,102,238,0.6)] backdrop-blur-md">
                  <span className="relative flex size-2.5 rounded-full bg-secondary">
                    <span className="absolute inset-0 rounded-full bg-secondary/45 landing-pulse" />
                  </span>
                  {eyebrow}
                </div>
                <h1 className="landing-reveal landing-reveal-2 mt-7 max-w-3xl text-4xl font-semibold leading-none tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                  {title}
                </h1>
                <p className="landing-reveal landing-reveal-3 mt-6 max-w-[64ch] text-base leading-7 text-muted-foreground md:text-lg">
                  {description}
                </p>
                <div className="landing-reveal landing-reveal-4 mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href={webAppPath("/signup")}
                    prefetch={false}
                    className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-[0_18px_42px_-30px_rgba(124,102,238,0.75)] transition-all hover:bg-primary/88 active:scale-[0.98]"
                  >
                    Essayer 15 jours gratuitement
                  </Link>
                  <Link
                    href="https://cal.com/mathieu-chambaud-biume"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center rounded-full border border-border bg-card/70 px-5 py-3 text-sm font-semibold text-foreground transition-all hover:border-foreground/20 hover:bg-card active:scale-[0.98]"
                  >
                    Voir une demo
                  </Link>
                </div>
                <div className="landing-reveal landing-reveal-5 mt-10 grid max-w-xl grid-cols-3 divide-x divide-border border-y border-border py-4">
                  {stats.map((stat) => (
                    <div key={stat.label} className="px-4 first:pl-0 last:pr-0">
                      <p className="font-mono text-lg font-semibold tracking-tight md:text-2xl">
                        {stat.value}
                      </p>
                      <p className="mt-1 text-xs font-medium leading-4 text-muted-foreground">
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <aside className="landing-reveal landing-reveal-3 rounded-[2rem] border border-border bg-card p-5 shadow-[0_42px_110px_-72px_rgba(20,18,28,0.52)] md:p-7">
                <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
                  {panel.eyebrow}
                </p>
                <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight md:text-5xl">
                  {panel.title}
                </h2>
                <p className="mt-5 text-sm leading-6 text-muted-foreground md:text-base md:leading-7">
                  {panel.body}
                </p>
                <div className="mt-6 divide-y divide-border rounded-[1.3rem] border border-border bg-background">
                  {panel.items.map((item, index) => (
                    <div
                      key={item}
                      className="grid grid-cols-[auto_1fr] gap-3 px-4 py-4"
                    >
                      <span className="font-mono text-xs font-semibold text-primary">
                        0{index + 1}
                      </span>
                      <p className="text-sm font-medium leading-6">{item}</p>
                    </div>
                  ))}
                </div>
              </aside>
            </div>
          </section>

          <section className="px-4 py-8 md:px-6 md:py-14">
            <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-2">
              {sections.map((section, index) => (
                <article
                  key={section.title}
                  className={
                    index === 0
                      ? "rounded-[1.7rem] border border-primary/20 bg-primary/10 p-6 md:col-span-2 md:p-8"
                      : "rounded-[1.7rem] border border-border bg-card p-6 md:p-7"
                  }
                >
                  <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                    {section.eyebrow}
                  </p>
                  <h2 className="mt-4 text-2xl font-semibold leading-tight tracking-tight md:text-4xl">
                    {section.title}
                  </h2>
                  <p className="mt-4 text-sm leading-6 text-muted-foreground md:text-base md:leading-7">
                    {section.body}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section className="px-4 py-8 md:px-6 md:py-14">
            <div className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="rounded-[2rem] border border-border bg-foreground p-6 text-background md:p-8">
                <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                  FAQ
                </p>
                <h2 className="mt-4 text-3xl font-semibold leading-none tracking-tight md:text-5xl">
                  Questions fréquentes
                </h2>
                <p className="mt-5 text-sm leading-6 text-background/62">
                  Des réponses simples pour décider si Biume correspond à votre
                  pratique.
                </p>
              </div>
              <div className="divide-y divide-border rounded-[2rem] border border-border bg-card px-5 md:px-7">
                {faq.map((item) => (
                  <div key={item.question} className="py-5 first:pt-6 last:pb-6">
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
          </section>

          <section className="px-4 py-8 md:px-6 md:py-14">
            <div className="mx-auto max-w-7xl border-t border-border pt-8">
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
                Continuer
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                {internalLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:border-primary/30 hover:text-primary"
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
    </>
  );
}

function PageBackdrop() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-background" />
      <div
        className="absolute inset-0 opacity-[0.62] dark:opacity-[0.18]"
        style={{
          backgroundImage:
            "linear-gradient(to right, color-mix(in oklab, var(--border) 72%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in oklab, var(--border) 62%, transparent) 1px, transparent 1px)",
          backgroundSize: "54px 54px",
        }}
      />
      <div className="absolute inset-x-0 bottom-0 h-44 bg-linear-to-t from-background to-transparent" />
    </div>
  );
}
