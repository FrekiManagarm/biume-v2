import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { JsonLd, pageBreadcrumbJsonLd } from "../lib/seo";
import { webAppPath } from "../lib/web-app-url";
import LandingFooter from "./footer";
import { Header } from "./header";

type Stat = {
  value: string;
  label: string;
};

type VisualItem = {
  label: string;
  value: string;
};

type ContentSection = {
  eyebrow: string;
  title: string;
  body: string;
};

type MarketingPageProps = {
  path: string;
  breadcrumbName: string;
  eyebrow: string;
  title: ReactNode;
  description: string;
  badge: string;
  image: {
    src: string;
    alt: string;
  };
  visualTitle: string;
  visualSubtitle: string;
  stats: readonly Stat[];
  visualItems: readonly VisualItem[];
  sections: readonly ContentSection[];
  sidePanel: {
    eyebrow: string;
    title: string;
    body: string;
    items: readonly string[];
  };
};

export function MarketingPage({
  path,
  breadcrumbName,
  eyebrow,
  title,
  description,
  badge,
  image,
  visualTitle,
  visualSubtitle,
  stats,
  visualItems,
  sections,
  sidePanel,
}: MarketingPageProps) {
  return (
    <>
      <JsonLd data={pageBreadcrumbJsonLd({ path, name: breadcrumbName })} />
      <Header />
      <div className="min-h-dvh overflow-x-hidden bg-[color:var(--v2-canvas)] text-[color:var(--v2-ink)] selection:bg-[color:var(--v2-accent)]/25">
        <main id="contenu" tabIndex={-1}>
          <section className="border-b border-[color:var(--v2-line)] px-5 py-20 md:px-8 md:py-28">

            <div className="mx-auto grid w-full max-w-[1200px] gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
              <div className="max-w-3xl">
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
                    className="v2-btn v2-btn-primary v2-btn-lg w-full sm:w-auto"
                  >
                    Commencer gratuitement
                  </Link>
                  <Link
                    href="/"
                    className="v2-btn v2-btn-secondary v2-btn-lg w-full sm:w-auto"
                  >
                    Retour a l&apos;accueil
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

              <PageVisual
                badge={badge}
                image={image}
                title={visualTitle}
                subtitle={visualSubtitle}
                items={visualItems}
              />
            </div>
          </section>

          <section className="px-5 py-20 md:px-8 md:py-28">
            <div className="mx-auto grid max-w-[1200px] gap-5 lg:grid-cols-[1.12fr_0.88fr]">
              <div className="grid gap-5 md:grid-cols-2">
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

              <aside className="rounded-[24px] bg-[color:var(--v2-espresso)] p-7 text-white md:p-9">
                <p className="v2-eyebrow text-[color:var(--v2-green)]">
                  {sidePanel.eyebrow}
                </p>
                <h2 className="v2-display mt-5 text-[clamp(2rem,4vw,3.4rem)] font-medium leading-[1.02] tracking-[-0.045em]">
                  {sidePanel.title}
                </h2>
                <p className="mt-5 text-sm leading-6 text-white/65 md:text-base md:leading-7">
                  {sidePanel.body}
                </p>
                <div className="mt-7 divide-y divide-white/12">
                  {sidePanel.items.map((item, index) => (
                    <div
                      key={item}
                      className="grid grid-cols-[auto_1fr] gap-3 py-4 first:pt-0 last:pb-0"
                    >
                      <span className="v2-mono text-sm font-medium text-white/45">
                        0{index + 1}
                      </span>
                      <p className="text-sm font-medium leading-6 text-white">
                        {item}
                      </p>
                    </div>
                  ))}
                </div>
              </aside>
            </div>
          </section>
        </main>
        <LandingFooter />
      </div>
    </>
  );
}

function PageVisual({
  badge,
  image,
  title,
  subtitle,
  items,
}: {
  badge: string;
  image: MarketingPageProps["image"];
  title: string;
  subtitle: string;
  items: readonly VisualItem[];
}) {
  return (
    <div className="landing-reveal landing-reveal-3 min-w-0">
      <div className="v2-panel relative mx-auto w-full max-w-2xl overflow-hidden p-2.5">
        <div className="overflow-hidden rounded-[18px] bg-[color:var(--v2-surface)] text-[color:var(--v2-ink)]">
          <div className="border-b border-[color:var(--v2-line)] px-4 py-4 md:px-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="v2-eyebrow text-[10px]">
                  Biume
                </p>
                <h2 className="v2-display mt-2 text-2xl font-medium tracking-[-0.04em]">
                  {title}
                </h2>
                <p className="mt-1 text-sm text-[color:var(--v2-ink-soft)]">{subtitle}</p>
              </div>
              <div className="hidden rounded-full bg-[color:var(--v2-green-soft)] px-3 py-1 text-xs font-semibold text-[color:var(--v2-green-ink)] sm:block">
                {badge}
              </div>
            </div>
          </div>

          <div className="grid gap-0 md:grid-cols-[1.04fr_0.96fr]">
            <div className="relative min-h-65 border-b border-[color:var(--v2-line)] bg-[color:var(--v2-bone)] md:border-b-0 md:border-r">
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="(min-width: 1024px) 340px, 100vw"
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-linear-to-t from-[color:var(--v2-canvas)]/82 via-transparent to-transparent" />
            </div>

            <div className="p-5">
              <p className="v2-eyebrow v2-eyebrow-green text-[10px]">
                Points cles
              </p>
              <div className="mt-4 divide-y divide-[color:var(--v2-line)]">
                {items.map((item) => (
                  <div key={item.label} className="py-4 first:pt-0 last:pb-0">
                    <p className="v2-mono text-[10px] font-medium uppercase tracking-[0.16em] text-[color:var(--v2-ink-faint)]">
                      {item.label}
                    </p>
                    <p className="mt-2 text-sm font-medium leading-6">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-5 border-t border-[color:var(--v2-line)] pt-4">
                <p className="text-sm font-medium text-[color:var(--v2-ink-soft)]">
                  Meme exigence produit, meme clarte pour chaque page.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
