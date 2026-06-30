import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
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
      <Header />
      <div className="min-h-[100dvh] overflow-x-hidden bg-background text-foreground selection:bg-primary/20">
        <main>
          <section className="relative overflow-hidden px-4 pb-10 pt-[7.5rem] md:px-6 md:pb-14 md:pt-[8.5rem]">
            <PageBackdrop />

            <div className="relative mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
              <div className="max-w-3xl">
                <div className="landing-reveal inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/8 px-3 py-1.5 text-sm font-semibold text-primary shadow-[0_16px_44px_-34px_rgba(124,102,238,0.6)] backdrop-blur-md">
                  <span className="relative flex size-2.5 rounded-full bg-secondary">
                    <span className="absolute inset-0 rounded-full bg-secondary/45 landing-pulse" />
                  </span>
                  {eyebrow}
                </div>

                <h1 className="landing-reveal landing-reveal-2 mt-7 max-w-3xl text-4xl font-semibold leading-none tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
                  {title}
                </h1>

                <p className="landing-reveal landing-reveal-3 mt-6 max-w-[62ch] text-base leading-7 text-muted-foreground md:text-lg">
                  {description}
                </p>

                <div className="landing-reveal landing-reveal-4 mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href={webAppPath("/signup")}
                    prefetch={false}
                    className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-[0_18px_42px_-30px_rgba(124,102,238,0.75)] transition-all hover:bg-primary/88 active:scale-[0.98] sm:w-auto"
                  >
                    Commencer gratuitement
                    <ArrowIcon />
                  </Link>
                  <Link
                    href="/"
                    className="inline-flex w-full items-center justify-center rounded-full border border-border bg-card/70 px-5 py-3 text-sm font-semibold text-foreground transition-all hover:border-foreground/20 hover:bg-card active:scale-[0.98] sm:w-auto"
                  >
                    Retour a l&apos;accueil
                  </Link>
                </div>

                <div className="landing-reveal landing-reveal-5 mt-10 grid max-w-xl grid-cols-3 divide-x divide-border border-y border-border py-4">
                  {stats.map((stat) => (
                    <div key={stat.label} className="px-4 first:pl-0 last:pr-0">
                      <p className="font-mono text-lg font-semibold tracking-tight text-foreground md:text-2xl">
                        {stat.value}
                      </p>
                      <p className="mt-1 text-xs font-medium leading-4 text-muted-foreground">
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

          <section className="px-4 py-8 md:px-6 md:py-14">
            <div className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-[1.12fr_0.88fr]">
              <div className="grid gap-4 md:grid-cols-2">
                {sections.map((section, index) => (
                  <article
                    key={section.title}
                    className={
                      index === 0
                        ? "rounded-[1.7rem] border border-primary/20 bg-primary/10 p-6 shadow-[0_28px_80px_-66px_rgba(124,102,238,0.55)] md:col-span-2 md:p-8"
                        : "rounded-[1.7rem] border border-border bg-card p-6 md:p-7"
                    }
                  >
                    <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                      {section.eyebrow}
                    </p>
                    <h2 className="mt-4 text-2xl font-semibold leading-tight tracking-tight text-foreground md:text-4xl">
                      {section.title}
                    </h2>
                    <p className="mt-4 text-sm leading-6 text-muted-foreground md:text-base md:leading-7">
                      {section.body}
                    </p>
                  </article>
                ))}
              </div>

              <aside className="rounded-[2rem] border border-border bg-foreground p-6 text-background shadow-[0_34px_100px_-76px_rgba(20,18,28,0.66)] md:p-8">
                <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                  {sidePanel.eyebrow}
                </p>
                <h2 className="mt-4 text-3xl font-semibold leading-none tracking-tight md:text-5xl">
                  {sidePanel.title}
                </h2>
                <p className="mt-5 text-sm leading-6 text-background/62 md:text-base md:leading-7">
                  {sidePanel.body}
                </p>
                <div className="mt-7 divide-y divide-background/10">
                  {sidePanel.items.map((item, index) => (
                    <div
                      key={item}
                      className="grid grid-cols-[auto_1fr] gap-3 py-4 first:pt-0 last:pb-0"
                    >
                      <span className="font-mono text-sm font-semibold text-background/42">
                        0{index + 1}
                      </span>
                      <p className="text-sm font-medium leading-6 text-background">
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
      <div className="relative mx-auto w-full max-w-2xl overflow-hidden rounded-[2rem] border border-border bg-card/95 p-3 shadow-[0_42px_110px_-72px_rgba(20,18,28,0.52)] backdrop-blur-xl">
        <div
          className="pointer-events-none absolute inset-0 rounded-[2rem] bg-[linear-gradient(rgba(20,18,28,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(20,18,28,0.04)_1px,transparent_1px)] bg-size-[34px_34px]"
          aria-hidden="true"
        />

        <div className="relative overflow-hidden rounded-[1.7rem] border border-border/70 bg-background text-foreground shadow-[0_30px_76px_-58px_rgba(20,18,28,0.74)]">
          <div className="border-b border-border bg-card/70 px-4 py-4 md:px-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Biume
                </p>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight">
                  {title}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {subtitle}
                </p>
              </div>
              <div className="hidden rounded-full border border-secondary/20 bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary sm:block">
                {badge}
              </div>
            </div>
          </div>

          <div className="grid gap-0 md:grid-cols-[1.04fr_0.96fr]">
            <div className="relative min-h-[260px] border-b border-border bg-muted/25 md:border-b-0 md:border-r">
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="(min-width: 1024px) 340px, 100vw"
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-linear-to-t from-background/82 via-background/10 to-transparent" />
            </div>

            <div className="p-5">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-secondary">
                Points cles
              </p>
              <div className="mt-4 divide-y divide-border">
                {items.map((item) => (
                  <div key={item.label} className="py-4 first:pt-0 last:pb-0">
                    <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      {item.label}
                    </p>
                    <p className="mt-2 text-sm font-semibold leading-6 text-foreground">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-5 rounded-[1.1rem] border border-secondary/20 bg-secondary/8 px-4 py-3">
                <p className="text-sm font-semibold text-foreground">
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

function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      className="size-4 transition-transform group-hover:translate-x-0.5"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3 8h9m0 0-3.5-3.5M12 8l-3.5 3.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}
