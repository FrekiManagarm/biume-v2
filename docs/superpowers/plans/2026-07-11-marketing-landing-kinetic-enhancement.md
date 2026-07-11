# Biume Marketing Landing Kinetic Enhancement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the approved Biume homepage into a more modern, premium and visibly kinetic landing page while preserving its human and animal character, conversion contract, SEO, accessibility and performance.

**Architecture:** Keep the homepage content and SEO in Server Components. Add Motion 12 only to focused Client Component islands for viewport reveals, header response, journey progression and pricing state changes; native CSS continues to orchestrate the hero load and FAQ disclosure. Every island server-renders visible content and progressively enhances it after hydration, so the page remains complete without JavaScript.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS v4, `next/image`, `next/font`, Motion 12.42.2 imported from `motion/react`, Bun tests, Playwright CLI and Lighthouse.

## Global Constraints

- Use Bun commands only.
- Modify `apps/marketing`; do not modify `apps/web` or `packages/transactional`.
- Preserve every route, canonical URL, metadata export, Open Graph dimension, Service JSON-LD key and CTA destination.
- Keep `webAppPath("/signup")`, `prefetch={false}` and `https://cal.com/mathieu-chambaud-biume`.
- Keep prices at 29,99 € monthly and 24,99 € monthly with annual billing.
- Keep `#6B5AC8` as the light-mode action violet and green only for included, validated, sent or received states.
- Keep the current Biume logo and its violet, blue and green gradient.
- Keep Manrope scoped to the homepage and Geist Mono for functional values.
- Keep the exact primary CTA label `Essayer gratuitement` everywhere.
- Keep all current approved visible copy unless this plan gives an exact replacement.
- Do not display invented ratings, testimonials, customer logos, savings, urgency, performance numbers or product claims.
- Do not use em dash or en dash characters in visible copy.
- Add only `motion`; do not add GSAP, Framer Motion, WebGL, Three.js or another animation dependency.
- Do not use parallax, horizontal scroll hijacking, custom cursors, particles, autoplay video, gradient headlines, neon glows, technical grids, scan lines or perpetual decorative animation.
- Animate only transform and opacity in scroll-linked work. Never add a `window` scroll listener or React state update on every scroll frame.
- All motion must stop or become static under `prefers-reduced-motion: reduce`.
- The homepage must remain complete and navigable without JavaScript.
- Keep the priority hero image visible on first paint; do not apply initial opacity, delayed visibility or an LCP-blocking mask to it.
- Target Lighthouse performance at least 95, accessibility 100 and SEO 100; LCP below 2.5 seconds, INP below 200 milliseconds and CLS below 0.1.
- Preserve unrelated working-tree changes. `bun.lock` is already dirty: stage only Motion-related lock hunks and verify the staged lock diff before every commit.

## File Structure

**Create:**

- `apps/marketing/components/landing/motion-reveal.tsx`: progressive one-time viewport reveal with visible SSR fallback.
- `apps/marketing/components/landing/kinetic-header.tsx`: scroll-responsive header material using Motion values.
- `apps/marketing/components/landing/journey-story.tsx`: sticky desktop journey with a static mobile/no-JS sequence.

**Modify:**

- `apps/marketing/package.json`: add Motion.
- `bun.lock`: add only Motion and its transitive lock entries.
- `apps/marketing/app/globals.css`: cooler landing tokens, hero choreography, tactile states and native FAQ animation.
- `apps/marketing/components/header.tsx`: render navigation inside `KineticHeader`.
- `apps/marketing/components/hero.tsx`: asymmetric 12-column hero, larger media and compact reassurance rail.
- `apps/marketing/components/features.tsx`: editorial problem, kinetic journey, asymmetric outcome and stronger control interlude.
- `apps/marketing/components/pricing.tsx`: spring billing selector and price state transition.
- `apps/marketing/components/faq.tsx`: native animated disclosure indicator.
- `apps/marketing/components/cta.tsx`: larger photographic final conversion composition.
- `apps/marketing/__tests__/home-landing.test.tsx`: SSR, copy, motion and anti-slop contracts.
- `apps/marketing/__tests__/marketing-pages.test.tsx`: preserve shared header/footer expectations if markup changes require it.

---

### Task 1: Add the Motion Foundation and Progressive Reveal

**Files:**

- Modify: `apps/marketing/package.json`
- Modify partially: `bun.lock`
- Modify: `apps/marketing/app/globals.css`
- Create: `apps/marketing/components/landing/motion-reveal.tsx`
- Modify: `apps/marketing/__tests__/home-landing.test.tsx`

**Interfaces:**

- Consumes: React children and Motion `useInView`/`useReducedMotion` APIs.
- Produces: `MotionReveal({ children, className?, delay?, amount? }): JSX.Element` and reusable `.landing-button`/hero utility classes.

- [ ] **Step 1: Write the failing SSR visibility test**

Add this import to `apps/marketing/__tests__/home-landing.test.tsx`:

```tsx
import { MotionReveal } from "../components/landing/motion-reveal";
```

Add inside the existing `describe` block:

```tsx
test("motion reveal keeps content visible in server markup", () => {
  const html = renderToStaticMarkup(
    <MotionReveal delay={0.08}>
      <p>Contenu visible sans JavaScript</p>
    </MotionReveal>,
  );

  expect(html).toContain("Contenu visible sans JavaScript");
  expect(html).not.toContain("opacity:0");
  expect(html).not.toContain("visibility:hidden");
});
```

- [ ] **Step 2: Run the test and confirm the missing module fails**

Run:

```bash
bun test apps/marketing/__tests__/home-landing.test.tsx -t "motion reveal keeps"
```

Expected: FAIL because `components/landing/motion-reveal.tsx` does not exist.

- [ ] **Step 3: Install Motion with Bun without staging unrelated lock changes**

Run:

```bash
bun add --cwd apps/marketing motion@^12.42.2
```

Expected: `apps/marketing/package.json` gains `"motion": "^12.42.2"` and Bun updates `bun.lock`.

Before staging, inspect both the pre-existing and new lockfile diff:

```bash
git diff -- apps/marketing/package.json bun.lock
```

Do not use `git add bun.lock`. Later, use `git add -p bun.lock` and select only hunks that add the marketing Motion dependency, `motion`, `motion-dom` and `motion-utils`. Reject every pre-existing email, transactional or web workspace hunk.

- [ ] **Step 4: Create the progressive reveal island**

Create `apps/marketing/components/landing/motion-reveal.tsx`:

```tsx
"use client";

import {
  domAnimation,
  LazyMotion,
  m,
  useInView,
  useReducedMotion,
} from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";

type MotionRevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  amount?: number;
};

export function MotionReveal({
  children,
  className,
  delay = 0,
  amount = 0.28,
}: MotionRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount });
  const reduceMotion = useReducedMotion();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const isVisible = !isHydrated || reduceMotion || isInView;

  return (
    <LazyMotion features={domAnimation} strict>
      <m.div
        ref={ref}
        className={className}
        initial={false}
        animate={
          isVisible
            ? { opacity: 1, y: 0 }
            : { opacity: 0, y: 28 }
        }
        transition={{
          duration: 0.64,
          delay,
          ease: [0.16, 1, 0.3, 1],
        }}
      >
        {children}
      </m.div>
    </LazyMotion>
  );
}
```

This intentionally renders the visible state on the server and first client render. Only hydrated below-fold elements prepare themselves for a one-time viewport entrance.

- [ ] **Step 5: Recalibrate landing tokens and add tactile utilities**

In `apps/marketing/app/globals.css`, change only the landing token values to:

```css
.landing-theme {
  --font-geist-sans: var(--font-manrope);
  --background: #f3f4f6;
  --foreground: #17161a;
  --card: #fbfbfc;
  --card-foreground: #17161a;
  --muted: #e8e9ed;
  --muted-foreground: #626067;
  --border: #d8d9df;
  --primary: #6b5ac8;
  --primary-foreground: #ffffff;
  --secondary: #198754;
  --secondary-foreground: #ffffff;
  --landing-surface: #eef0f4;
  --landing-shadow: rgb(53 45 91 / 0.16);
  color-scheme: light;
}

@media (prefers-color-scheme: dark) {
  .landing-theme {
    --background: #141318;
    --foreground: #f2f1f5;
    --card: #1c1b21;
    --card-foreground: #f2f1f5;
    --muted: #27262d;
    --muted-foreground: #aaa7b0;
    --border: #37353e;
    --primary: #9a8ce9;
    --primary-foreground: #17151f;
    --secondary: #48bb7d;
    --secondary-foreground: #102117;
    --landing-surface: #201f27;
    --landing-shadow: rgb(0 0 0 / 0.38);
    color-scheme: dark;
  }
}
```

Add inside `@layer utilities`:

```css
.landing-button {
  transition:
    transform 220ms cubic-bezier(0.16, 1, 0.3, 1),
    background-color 220ms ease,
    border-color 220ms ease,
    color 220ms ease;
}

.landing-button:hover {
  transform: translate3d(0, -2px, 0);
}

.landing-button:active {
  transform: translate3d(0, 0, 0) scale(0.98);
}

.landing-media-frame {
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.24),
    0 32px 90px -56px var(--landing-shadow);
}
```

Extend the existing reduced-motion block:

```css
@media (prefers-reduced-motion: reduce) {
  .landing-button {
    transition: none;
  }

  .landing-button:hover,
  .landing-button:active {
    transform: none;
  }
}
```

- [ ] **Step 6: Run focused and full tests**

Run:

```bash
bun test apps/marketing/__tests__/home-landing.test.tsx -t "motion reveal keeps"
bun test apps/marketing/__tests__
bun --filter @biume/marketing lint
```

Expected: all commands PASS with no warnings introduced by Motion SSR.

- [ ] **Step 7: Stage only Task 1 changes and commit**

Run:

```bash
git add apps/marketing/package.json apps/marketing/app/globals.css apps/marketing/components/landing/motion-reveal.tsx apps/marketing/__tests__/home-landing.test.tsx
git add -p bun.lock
git diff --cached --name-only
git diff --cached -- bun.lock
```

Expected staged names: the four named marketing files plus `bun.lock`. The staged lock diff must contain only Motion-related packages and marketing dependency resolution.

Commit:

```bash
git commit -m "feat(marketing): add kinetic motion foundation"
```

---

### Task 2: Recompose the Header, Hero and Reassurance Rail

**Files:**

- Create: `apps/marketing/components/landing/kinetic-header.tsx`
- Modify: `apps/marketing/components/header.tsx`
- Modify: `apps/marketing/components/hero.tsx`
- Modify: `apps/marketing/app/globals.css`
- Modify: `apps/marketing/__tests__/home-landing.test.tsx`

**Interfaces:**

- Consumes: Motion, `webAppPath`, the existing navigation links and hero image.
- Produces: `KineticHeader({ children }): JSX.Element`, a 12-column `HeroSection()` and `.landing-hero-media`/`.landing-reassurance` hooks.

- [ ] **Step 1: Strengthen the hero contract first**

Replace the complete `hero leads with post-session value and factual reassurance` test with:

```tsx
test("hero leads with post-session value and factual reassurance", () => {
  const html = renderToStaticMarkup(<HeroSection />);

  expect(html).toContain("Le suivi post-séance des ostéopathes animaliers");
  expect(html).toContain("Chaque séance mérite une suite.");
  expect(html).toContain("Essayer gratuitement");
  expect(html).toContain("Voir le parcours");
  expect(html).toContain("15 jours");
  expect(html).toContain("Sans carte bancaire");
  expect(html).toContain("Validé par vous");
  expect(html).toContain("landing-hero-media");
  expect(html).toContain("landing-reassurance");
  expect(html).toContain("hero-practitioner-horse.png");
  expect(html).not.toContain("Exemple de suivi");
  expect(html).not.toContain("Naya va mieux depuis la séance");
  expect(html).not.toContain("Retour reçu à J+7");
  expect(html).not.toContain("4.9/5");
  expect(html).not.toContain("simplifiés par l");
  expect(html).not.toContain("diagnostics");
});
```

- [ ] **Step 2: Run the hero test and confirm the old overlay fails**

Run:

```bash
bun test apps/marketing/__tests__/home-landing.test.tsx -t "hero leads"
```

Expected: FAIL because the old hero still renders the illustrative overlay and lacks the new structural hooks.

- [ ] **Step 3: Create the scroll-responsive header shell**

Create `apps/marketing/components/landing/kinetic-header.tsx`:

```tsx
"use client";

import {
  domAnimation,
  LazyMotion,
  m,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import type { ReactNode } from "react";

export function KineticHeader({ children }: { children: ReactNode }) {
  const reduceMotion = useReducedMotion();
  const { scrollY } = useScroll();
  const surfaceOpacity = useTransform(scrollY, [0, 96], [0.5, 0.96]);
  const innerY = useTransform(scrollY, [0, 96], [0, -2]);
  const innerScale = useTransform(scrollY, [0, 96], [1, 0.97]);

  return (
    <LazyMotion features={domAnimation} strict>
      <header className="sticky inset-x-0 top-0 z-40 isolate border-b border-border/70">
        <m.div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-background/95 backdrop-blur-xl"
          style={{ opacity: reduceMotion ? 0.96 : surfaceOpacity }}
        />
        <m.div
          className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-4 px-4 md:px-6"
          style={reduceMotion ? undefined : { y: innerY, scale: innerScale }}
        >
          {children}
        </m.div>
      </header>
    </LazyMotion>
  );
}
```

- [ ] **Step 4: Put the existing navigation inside `KineticHeader`**

In `apps/marketing/components/header.tsx`, import:

```tsx
import { KineticHeader } from "./landing/kinetic-header";
```

Keep these exact declarations above `Header`:

```tsx
const navLinks = [
  { href: "/logiciel-osteopathe-animalier", label: "Produit" },
  { href: "/compte-rendu-osteopathe-animalier", label: "Compte rendu" },
  { href: "/blog", label: "Blog" },
  { href: "/tarifs", label: "Tarifs" },
] as const;

function BiumeMark() {
  return (
    <Image
      src="/brand/biume-logo.svg"
      alt=""
      width={32}
      height={32}
      className="size-8"
      priority
    />
  );
}

const navigationLinkClassName =
  "inline-flex min-h-11 items-center px-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";
```

Replace the current `<header>` and inner container wrappers with:

```tsx
export function Header() {
  return (
    <KineticHeader>
      <Link
        href="/"
        className="flex min-h-11 shrink-0 items-center gap-2 text-sm font-semibold tracking-tight text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        aria-label="Biume accueil"
      >
        <BiumeMark />
        <span>Biume</span>
      </Link>

      <nav className="hidden items-center md:flex" aria-label="Navigation principale">
        {navLinks.map((link) => (
          <Link key={link.href} href={link.href} className={navigationLinkClassName}>
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="hidden shrink-0 items-center gap-1 md:flex">
        <Link
          href={webAppPath("/signin")}
          prefetch={false}
          className={navigationLinkClassName}
        >
          Connexion
        </Link>
        <Link
          href={webAppPath("/signup")}
          prefetch={false}
          title="Essai gratuit"
          className="landing-button inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Essayer gratuitement
        </Link>
      </div>

      <details className="group relative md:hidden">
        <summary className="flex min-h-11 cursor-pointer list-none items-center rounded-full border border-border px-4 text-sm font-semibold text-foreground marker:hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
          Menu
        </summary>
        <div className="absolute right-0 top-[calc(100%+0.75rem)] w-[min(20rem,calc(100vw-2rem))] rounded-2xl border border-border bg-background p-3 shadow-lg">
          <nav className="flex flex-col" aria-label="Navigation mobile">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className={navigationLinkClassName}>
                {link.label}
              </Link>
            ))}
            <Link
              href={webAppPath("/signin")}
              prefetch={false}
              className={navigationLinkClassName}
            >
              Connexion
            </Link>
            <Link
              href={webAppPath("/signup")}
              prefetch={false}
              title="Essai gratuit"
              className="landing-button mt-2 inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Essayer gratuitement
            </Link>
          </nav>
        </div>
      </details>
    </KineticHeader>
  );
}
```

Do not change the navigation arrays, labels, hrefs or `prefetch` values outside this exact replacement.

- [ ] **Step 5: Replace the hero with the asymmetric composition**

Use this exact import and reassurance block at the top of `apps/marketing/components/hero.tsx`:

```tsx
import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";

import { webAppPath } from "../lib/web-app-url";

const reassurance = [
  { value: "15 jours", label: "Essai gratuit" },
  { value: "Sans carte bancaire", label: "Vous testez librement" },
  { value: "Validé par vous", label: "Votre expertise reste centrale" },
] as const;
```

Replace `HeroSection` with:

```tsx
export function HeroSection() {
  return (
    <section className="px-4 pb-10 pt-6 md:px-6 md:pb-14 md:pt-8">
      <div className="mx-auto grid min-h-[calc(100dvh-4.5rem)] max-w-7xl items-center gap-10 lg:grid-cols-12 lg:gap-6">
        <div className="relative z-10 max-w-2xl lg:col-span-6 lg:py-12">
          <p className="landing-reveal font-mono text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            Le suivi post-séance des ostéopathes animaliers
          </p>
          <h1 className="landing-reveal landing-reveal-delay-1 mt-5 text-5xl font-semibold leading-[0.94] tracking-[-0.055em] text-foreground sm:text-6xl lg:text-[3.5rem] xl:text-[4.75rem]">
            Chaque séance mérite une suite.
          </h1>
          <p className="landing-reveal landing-reveal-delay-2 mt-6 max-w-[52ch] text-base leading-7 text-muted-foreground md:text-lg md:leading-8">
            Biume transforme vos observations en un suivi clair que les propriétaires comprennent, gardent et utilisent.
          </p>
          <div className="landing-reveal landing-reveal-delay-3 mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href={webAppPath("/signup")}
              prefetch={false}
              className="landing-button inline-flex min-h-12 items-center justify-center whitespace-nowrap rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Essayer gratuitement
            </Link>
            <Link
              href="#parcours"
              className="landing-button inline-flex min-h-12 items-center justify-center whitespace-nowrap rounded-full border border-border bg-card px-6 text-sm font-semibold text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Voir le parcours
            </Link>
          </div>
        </div>

        <div className="landing-hero-media landing-media-frame relative mx-auto aspect-[4/5] w-full max-w-[42rem] overflow-hidden rounded-[24px] bg-muted lg:col-span-7 lg:col-start-6 lg:row-start-1 lg:justify-self-end lg:aspect-[5/6] lg:-mr-8 xl:-mr-16">
          <Image
            src="/assets/images/landing/hero-practitioner-horse.png"
            alt="Une ostéopathe animalière auprès d'un cheval pendant une séance"
            fill
            priority
            sizes="(min-width: 1280px) 670px, (min-width: 1024px) 56vw, 100vw"
            className="object-cover"
          />
        </div>
      </div>

      <div className="landing-reassurance mx-auto mt-6 max-w-7xl border-t border-border">
        <div className="grid sm:grid-cols-3">
          {reassurance.map((item, index) => (
            <div
              key={item.value}
              className="landing-reassurance-item border-b border-border py-5 sm:border-b-0 sm:px-6 sm:first:pl-0 sm:last:pr-0"
              style={{ "--reassurance-index": index } as CSSProperties}
            >
              <p className="font-mono text-sm font-semibold text-foreground md:text-base">
                {item.value}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

Use `style={{ "--reassurance-index": index } as CSSProperties}` in the final code.

- [ ] **Step 6: Add the stronger native hero choreography**

In `apps/marketing/app/globals.css`, replace the existing landing reveal timing and add:

```css
.landing-reveal {
  animation: landing-reveal 720ms cubic-bezier(0.16, 1, 0.3, 1) both;
}

.landing-reveal-delay-1 { animation-delay: 90ms; }
.landing-reveal-delay-2 { animation-delay: 180ms; }
.landing-reveal-delay-3 { animation-delay: 270ms; }

.landing-hero-media img {
  animation: landing-hero-settle 1200ms cubic-bezier(0.16, 1, 0.3, 1) both;
}

.landing-reassurance {
  animation: landing-line-reveal 760ms cubic-bezier(0.16, 1, 0.3, 1) 320ms both;
  transform-origin: left;
}

.landing-reassurance-item {
  animation: landing-reveal 580ms cubic-bezier(0.16, 1, 0.3, 1) both;
  animation-delay: calc(380ms + var(--reassurance-index) * 80ms);
}

@keyframes landing-hero-settle {
  from { transform: scale(1.035); }
  to { transform: scale(1); }
}

@keyframes landing-line-reveal {
  from { opacity: 0; transform: scaleX(0); }
  to { opacity: 1; transform: scaleX(1); }
}
```

Add `.landing-hero-media img`, `.landing-reassurance` and `.landing-reassurance-item` to the reduced-motion `animation: none` selector.

- [ ] **Step 7: Run hero and shared-page tests**

Run:

```bash
bun test apps/marketing/__tests__/home-landing.test.tsx -t "hero leads"
bun test apps/marketing/__tests__/marketing-pages.test.tsx
bun --filter @biume/marketing lint
```

Expected: all tests PASS. Inspect server markup to confirm the hero image has no opacity-zero style.

- [ ] **Step 8: Commit the kinetic hero**

```bash
git add apps/marketing/components/landing/kinetic-header.tsx apps/marketing/components/header.tsx apps/marketing/components/hero.tsx apps/marketing/app/globals.css apps/marketing/__tests__/home-landing.test.tsx
git commit -m "feat(marketing): amplify the landing hero"
```

---

### Task 3: Build the Sticky Follow-Up Journey

**Files:**

- Create: `apps/marketing/components/landing/journey-story.tsx`
- Modify: `apps/marketing/__tests__/home-landing.test.tsx`

**Interfaces:**

- Consumes: `steps: readonly JourneyStep[]` where `JourneyStep = { title: string; body: string }`.
- Produces: `JourneyStory({ steps }): JSX.Element` with `#parcours`, four `data-journey-step` articles and a `data-journey-progress` transform.

- [ ] **Step 1: Add the failing journey-island test**

Add:

```tsx
import { JourneyStory } from "../components/landing/journey-story";
```

Add inside the existing `describe` block:

```tsx
test("journey story exposes every step before hydration", () => {
  const html = renderToStaticMarkup(
    <JourneyStory
      steps={[
        { title: "Observer", body: "Noter l’essentiel." },
        { title: "Valider", body: "Relire chaque mot." },
        { title: "Suivre", body: "Recevoir le retour." },
        { title: "Revoir", body: "Garder l’évolution." },
      ]}
    />,
  );

  expect(html.match(/data-journey-step=/g)?.length).toBe(4);
  expect(html).toContain("Observer");
  expect(html).toContain("Revoir");
  expect(html).not.toContain("opacity:0");
});
```

- [ ] **Step 2: Run the test and confirm the missing module fails**

```bash
bun test apps/marketing/__tests__/home-landing.test.tsx -t "journey story exposes"
```

Expected: FAIL because `journey-story.tsx` does not exist.

- [ ] **Step 3: Create the journey story island**

Create `apps/marketing/components/landing/journey-story.tsx`:

```tsx
"use client";

import {
  domAnimation,
  LazyMotion,
  m,
  type MotionValue,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { useEffect, useRef, useState } from "react";

export type JourneyStep = {
  title: string;
  body: string;
};

type JourneyStoryProps = {
  steps: readonly JourneyStep[];
};

function JourneyMoment({
  step,
  index,
  progress,
  enhanced,
}: {
  step: JourneyStep;
  index: number;
  progress: MotionValue<number>;
  enhanced: boolean;
}) {
  const start = index / 4;
  const center = (index + 0.5) / 4;
  const end = (index + 1) / 4;
  const opacity = useTransform(
    progress,
    [Math.max(0, start - 0.08), center, Math.min(1, end + 0.08)],
    [0.42, 1, 0.58],
  );
  const y = useTransform(progress, [start, center, end], [22, 0, -10]);
  const scale = useTransform(progress, [start, center, end], [0.985, 1, 0.99]);

  return (
    <m.article
      data-journey-step={step.title}
      className="rounded-2xl border border-border bg-card p-6 text-card-foreground md:p-8"
      style={enhanced ? { opacity, y, scale } : undefined}
    >
      <h3 className="text-2xl font-semibold tracking-[-0.025em]">
        {step.title}
      </h3>
      <p className="mt-4 max-w-[42ch] text-base leading-7 text-muted-foreground">
        {step.body}
      </p>
    </m.article>
  );
}

export function JourneyStory({ steps }: JourneyStoryProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const [isHydrated, setIsHydrated] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 70%", "end 45%"],
  });

  useEffect(() => {
    setIsHydrated(true);
    const query = window.matchMedia("(min-width: 768px)");
    const update = () => setIsDesktop(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  const enhanced = isHydrated && isDesktop && !reduceMotion;

  return (
    <LazyMotion features={domAnimation} strict>
      <section
        ref={sectionRef}
        id="parcours"
        className="border-y border-border px-4 py-20 md:px-6 md:py-28"
      >
        <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-[0.72fr_1.28fr] md:gap-16">
          <div className="md:sticky md:top-28 md:self-start">
            <h2 className="max-w-xl text-4xl font-semibold leading-[0.98] tracking-[-0.045em] text-foreground md:text-6xl">
              Un fil clair, du rendez-vous au prochain échange.
            </h2>
            <div className="mt-10 hidden h-40 w-px overflow-hidden bg-border md:block">
              <m.div
                data-journey-progress
                className="h-full w-full origin-top bg-primary"
                style={{ scaleY: enhanced ? scrollYProgress : 1 }}
              />
            </div>
          </div>

          <div className="grid gap-5 md:gap-[28vh] md:pb-[22vh]">
            {steps.map((step, index) => (
              <JourneyMoment
                key={step.title}
                step={step}
                index={index}
                progress={scrollYProgress}
                enhanced={enhanced}
              />
            ))}
          </div>
        </div>
      </section>
    </LazyMotion>
  );
}
```

- [ ] **Step 4: Run the SSR journey test**

```bash
bun test apps/marketing/__tests__/home-landing.test.tsx -t "journey story exposes"
```

Expected: PASS with all four steps visible and no zero-opacity SSR style.

- [ ] **Step 5: Run lint and scan for forbidden scroll listeners**

```bash
bun --filter @biume/marketing lint
rg -n "addEventListener\([\"']scroll|window\.scrollY|requestAnimationFrame" apps/marketing/components/landing
```

Expected: lint PASS and the scan returns no matches. The `matchMedia` change listener is allowed and must have the cleanup shown above.

- [ ] **Step 6: Commit the journey island**

```bash
git add apps/marketing/components/landing/journey-story.tsx apps/marketing/__tests__/home-landing.test.tsx
git commit -m "feat(marketing): add kinetic follow-up journey"
```

---

### Task 4: Recompose the Problem, Outcome and Control Sections

**Files:**

- Modify: `apps/marketing/components/features.tsx`
- Modify: `apps/marketing/__tests__/home-landing.test.tsx`

**Interfaces:**

- Consumes: `MotionReveal`, `JourneyStory`, the existing `journey`/`outcomes` data and practitioner-dog image.
- Produces: `FeaturesSection(): JSX.Element` with four section IDs in source order and at least three distinct layout families.

- [ ] **Step 1: Extend the story contract with structural expectations**

Add to the existing story test:

```tsx
expect(html).toContain("data-problem-composition");
expect(html).toContain("data-product-outcome");
expect(html).toContain("data-control-interlude");
expect(html.match(/data-journey-step=/g)?.length).toBe(4);
expect(html).not.toContain("Après la séance</p>");
expect(html).not.toContain("Le parcours</p>");
expect(html).not.toContain("Le résultat</p>");
```

- [ ] **Step 2: Run the story test and confirm the old layout fails**

```bash
bun test apps/marketing/__tests__/home-landing.test.tsx -t "story explains"
```

Expected: FAIL because the current section lacks the new hooks and still renders three repeated eyebrow labels.

- [ ] **Step 3: Replace the feature orchestration**

At the top of `apps/marketing/components/features.tsx`, add:

```tsx
import { JourneyStory } from "./landing/journey-story";
import { MotionReveal } from "./landing/motion-reveal";
```

Use these exact data arrays before `FeaturesSection`:

```tsx
const journey = [
  {
    title: "Observer",
    body: "Vous notez l’essentiel pendant ou juste après la séance.",
  },
  {
    title: "Valider",
    body: "Biume structure. Vous relisez chaque mot avant l’envoi.",
  },
  {
    title: "Suivre",
    body: "Le propriétaire répond simplement à J+7.",
  },
  {
    title: "Revoir",
    body: "L’évolution reste lisible au fil des rendez-vous.",
  },
] as const;

const outcomes = [
  {
    title: "Résumé propriétaire",
    body: "Une version courte et claire, validée par vous.",
  },
  {
    title: "Retour à J+7",
    body: "Le propriétaire partage ce qu’il observe sans friction.",
  },
  {
    title: "Timeline animal",
    body: "Séances, retours et évolution restent dans le même fil.",
  },
] as const;
```

Replace `FeaturesSection` with this complete structure:

```tsx
export function FeaturesSection() {
  return (
    <>
      <section id="probleme" className="px-4 py-20 md:px-6 md:py-28">
        <div
          data-problem-composition
          className="mx-auto grid max-w-7xl items-end gap-8 lg:grid-cols-12 lg:gap-0"
        >
          <MotionReveal className="landing-media-frame relative aspect-[3/2] overflow-hidden rounded-[24px] bg-muted lg:col-span-7 lg:col-start-6 lg:row-start-1">
            <Image
              src="/assets/images/landing/practitioner-dog.png"
              alt="Une praticienne accompagne un chien pendant une séance manuelle"
              fill
              sizes="(min-width: 1280px) 720px, (min-width: 1024px) 58vw, 100vw"
              className="object-cover"
            />
          </MotionReveal>

          <MotionReveal
            delay={0.08}
            className="relative z-10 max-w-2xl rounded-2xl border border-border bg-background/95 p-6 backdrop-blur-sm lg:col-span-6 lg:col-start-1 lg:row-start-1 lg:mb-12 lg:p-10"
          >
            <h2 className="text-4xl font-semibold leading-[0.98] tracking-[-0.045em] text-foreground md:text-6xl">
              La séance ne s&apos;arrête pas au rendez-vous.
            </h2>
            <p className="mt-6 max-w-[52ch] text-lg leading-8 text-muted-foreground">
              Le propriétaire doit encore comprendre vos observations, savoir quoi surveiller et reconnaître le bon moment pour reprendre contact.
            </p>
          </MotionReveal>
        </div>
      </section>

      <JourneyStory steps={journey} />

      <section id="resultat" className="px-4 py-20 md:px-6 md:py-28">
        <div data-product-outcome className="mx-auto max-w-7xl">
          <MotionReveal className="max-w-4xl">
            <h2 className="text-4xl font-semibold leading-[0.98] tracking-[-0.045em] text-foreground md:text-6xl">
              Le propriétaire comprend. Vous gardez le fil.
            </h2>
          </MotionReveal>

          <div className="mt-12 grid gap-8 lg:grid-cols-12 lg:items-start">
            <MotionReveal className="rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-[0_28px_80px_-58px_var(--landing-shadow)] md:p-10 lg:col-span-8">
              <p className="font-mono text-xs font-semibold text-primary">
                Résumé propriétaire
              </p>
              <h3 className="mt-5 text-3xl font-semibold tracking-[-0.035em]">
                Après la séance
              </h3>
              <dl className="mt-8 grid gap-4 md:grid-cols-3">
                <div className="rounded-xl bg-[var(--landing-surface)] p-5">
                  <dt className="text-sm font-semibold">Points observés</dt>
                  <dd className="mt-3 text-sm leading-6 text-muted-foreground">
                    Vos observations, présentées dans un langage accessible.
                  </dd>
                </div>
                <div className="rounded-xl bg-[var(--landing-surface)] p-5">
                  <dt className="text-sm font-semibold">Conseils transmis</dt>
                  <dd className="mt-3 text-sm leading-6 text-muted-foreground">
                    Vos recommandations, relues et validées avant l&apos;envoi.
                  </dd>
                </div>
                <div className="rounded-xl bg-[var(--landing-surface)] p-5">
                  <dt className="text-sm font-semibold">Prochaine étape</dt>
                  <dd className="mt-3 text-sm leading-6 text-muted-foreground">
                    Les repères que vous choisissez pour la suite.
                  </dd>
                </div>
              </dl>
            </MotionReveal>

            <div className="grid gap-4 lg:col-span-4 lg:pt-16">
              {outcomes.map((outcome, index) => (
                <MotionReveal key={outcome.title} delay={index * 0.06}>
                  <article className="rounded-2xl border border-border bg-card p-6">
                    <h3 className="text-xl font-semibold tracking-tight text-foreground">
                      {outcome.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {outcome.body}
                    </p>
                  </article>
                </MotionReveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="controle" className="px-4 py-12 md:px-6 md:py-20">
        <div data-control-interlude className="mx-auto max-w-7xl">
          <MotionReveal className="grid gap-6 overflow-hidden rounded-2xl bg-primary px-6 py-10 text-primary-foreground md:px-12 md:py-14 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <h2 className="text-4xl font-semibold leading-[0.96] tracking-[-0.045em] md:text-6xl">
              Biume prépare. Vous décidez.
            </h2>
            <p className="max-w-[62ch] text-base leading-7 opacity-80 md:text-lg md:leading-8">
              Vous relisez, corrigez et validez chaque message avant l&apos;envoi. Biume n&apos;établit aucun diagnostic et ne parle jamais à votre place.
            </p>
          </MotionReveal>
        </div>
      </section>
    </>
  );
}
```

- [ ] **Step 4: Run the story and SSR visibility tests**

```bash
bun test apps/marketing/__tests__/home-landing.test.tsx -t "story explains"
bun test apps/marketing/__tests__/home-landing.test.tsx -t "motion reveal keeps"
bun --filter @biume/marketing lint
```

Expected: all tests PASS and the rendered section order remains `probleme`, `parcours`, `resultat`, `controle`.

- [ ] **Step 5: Commit the feature recomposition**

```bash
git add apps/marketing/components/features.tsx apps/marketing/components/landing/motion-reveal.tsx apps/marketing/__tests__/home-landing.test.tsx
git commit -m "feat(marketing): recompose the follow-up story"
```

---

### Task 5: Add Kinetic Decision Feedback and the Immersive Final CTA

**Files:**

- Modify: `apps/marketing/components/pricing.tsx`
- Modify: `apps/marketing/components/faq.tsx`
- Modify: `apps/marketing/components/cta.tsx`
- Modify: `apps/marketing/app/globals.css`
- Modify: `apps/marketing/__tests__/home-landing.test.tsx`

**Interfaces:**

- Consumes: existing billing data, `MotionReveal`, the native FAQ data and final documentary image.
- Produces: spring billing indicator, animated price content, native FAQ disclosure hooks and a 12-column final CTA.

- [ ] **Step 1: Extend the decision-section contract**

Add to the existing decision test:

```tsx
expect(pricing).toContain("data-billing-selector");
expect(pricing).toContain("data-billing-price");
expect(faq.match(/data-faq-item=/g)?.length).toBe(5);
expect(faq).toContain("data-faq-indicator");
expect(cta).toContain("data-final-cta");
```

- [ ] **Step 2: Run the decision test and confirm it fails**

```bash
bun test apps/marketing/__tests__/home-landing.test.tsx -t "decision sections"
```

Expected: FAIL because the new state and composition hooks do not exist.

- [ ] **Step 3: Add Motion imports and a spring selection indicator to pricing**

Use this complete import block at the top of `apps/marketing/components/pricing.tsx`:

```tsx
"use client";

import {
  AnimatePresence,
  domAnimation,
  LazyMotion,
  m,
  useReducedMotion,
} from "motion/react";
import Link from "next/link";
import { useState } from "react";

import { webAppPath } from "../lib/web-app-url";
```

Use these exact data declarations:

```tsx
type BillingCycle = "annual" | "monthly";

const billingOptions = {
  annual: {
    label: "Annuel",
    price: "24,99 €",
    suffix: "par mois, facturé annuellement",
    detail: "299,88 € facturés une fois par an",
  },
  monthly: {
    label: "Mensuel",
    price: "29,99 €",
    suffix: "par mois",
    detail: "Facturation mensuelle, résiliable à tout moment",
  },
} satisfies Record<
  BillingCycle,
  { label: string; price: string; suffix: string; detail: string }
>;

const includedGroups = [
  {
    title: "Suivi propriétaire",
    items: ["Résumés validés", "Timeline animal", "Relances J+7 et J+30"],
  },
  {
    title: "Pratique quotidienne",
    items: [
      "Patients et clients",
      "Documents illimités",
      "Support pendant l’essai",
    ],
  },
] as const;
```

Inside `PricingSection`, add:

```tsx
const reduceMotion = useReducedMotion();
```

Replace the section JSX with this structure:

```tsx
<section id="pricing" className="px-4 py-20 md:px-6 md:py-28">
  <LazyMotion features={domAnimation} strict>
    <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-start lg:gap-16">
      <div className="lg:sticky lg:top-28">
        <h2 className="max-w-xl text-4xl font-semibold leading-[0.98] tracking-[-0.045em] text-foreground md:text-6xl">
          Un abonnement simple. Une seule offre.
        </h2>
        <p className="mt-5 max-w-[50ch] text-base leading-7 text-muted-foreground">
          Essayez toutes les fonctionnalités pendant 15 jours, sans carte bancaire.
        </p>

        <div
          data-billing-selector
          className="mt-8 grid gap-2 rounded-xl bg-muted p-1.5 sm:grid-cols-2"
          role="group"
          aria-label="Choisir la facturation"
        >
          {(Object.keys(billingOptions) as BillingCycle[]).map((cycle) => {
            const option = billingOptions[cycle];
            const isSelected = billingCycle === cycle;
            return (
              <button
                key={cycle}
                type="button"
                aria-pressed={isSelected}
                onClick={() => setBillingCycle(cycle)}
                className="relative min-h-12 rounded-[10px] px-4 py-3 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                {isSelected ? (
                  <m.span
                    layoutId="billing-selection"
                    className="absolute inset-0 rounded-[10px] bg-foreground"
                    transition={
                      reduceMotion
                        ? { duration: 0 }
                        : { type: "spring", stiffness: 420, damping: 34 }
                    }
                  />
                ) : null}
                <span className={`relative block text-sm font-semibold ${isSelected ? "text-background" : "text-foreground"}`}>
                  {option.label}
                </span>
                <span className={`relative mt-1 block text-sm ${isSelected ? "text-background/75" : "text-muted-foreground"}`}>
                  {option.price} par mois
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-[0_30px_90px_-64px_var(--landing-shadow)] md:p-10">
        <AnimatePresence mode="wait" initial={false}>
          <m.div
            key={billingCycle}
            data-billing-price
            aria-live="polite"
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 1 } : { opacity: 0, y: -8 }}
            transition={{ duration: reduceMotion ? 0 : 0.28, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex flex-wrap items-end gap-x-3 gap-y-2">
              <span className="whitespace-nowrap font-mono text-5xl font-semibold leading-none tracking-[-0.05em] text-foreground md:text-7xl">
                {billing.price}
              </span>
              <span className="pb-1 text-sm leading-5 text-muted-foreground">
                {billing.suffix}
              </span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{billing.detail}</p>
          </m.div>
        </AnimatePresence>

        <div className="mt-8 grid gap-8 border-t border-border pt-8 sm:grid-cols-2">
          {includedGroups.map((group) => (
            <div key={group.title}>
              <h3 className="text-base font-semibold text-foreground">
                {group.title}
              </h3>
              <ul className="mt-4 space-y-3">
                {group.items.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm">
                    <span
                      className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-secondary/15 font-semibold text-secondary"
                      aria-hidden="true"
                    >
                      ✓
                    </span>
                    <span className="leading-5 text-foreground/85">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Link
          href={webAppPath("/signup")}
          prefetch={false}
          className="landing-button mt-8 inline-flex min-h-12 w-full items-center justify-center whitespace-nowrap rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Essayer gratuitement
        </Link>
      </div>
    </div>
  </LazyMotion>
</section>
```

- [ ] **Step 4: Add native FAQ indicators**

Use this exact FAQ data before the component:

```tsx
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
```

Replace `LandingFaq` in `apps/marketing/components/faq.tsx` with:

```tsx
export function LandingFaq() {
  return (
    <section id="faq" className="px-4 py-20 md:px-6 md:py-28">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16">
        <div className="max-w-xl">
          <h2 className="text-4xl font-semibold leading-[0.98] tracking-[-0.045em] text-foreground md:text-6xl">
            Les questions avant de commencer.
          </h2>
          <p className="mt-5 text-base leading-7 text-muted-foreground">
            Compatibilité, contrôle des textes, données et résiliation.
          </p>
        </div>

        <div className="border-t border-border">
          {faqItems.map((item) => (
            <details
              key={item.question}
              data-faq-item={item.question}
              className="group border-b border-border py-5"
            >
              <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-6 rounded-sm py-2 text-base font-semibold leading-7 text-foreground marker:hidden focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
                <span>{item.question}</span>
                <span
                  data-faq-indicator
                  aria-hidden="true"
                  className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border text-lg font-medium"
                >
                  +
                </span>
              </summary>
              <div className="faq-disclosure">
                <p className="max-w-[68ch] pb-2 pt-3 text-sm leading-6 text-muted-foreground md:text-base md:leading-7">
                  {item.answer}
                </p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Add native FAQ animation CSS**

Add to `apps/marketing/app/globals.css`:

```css
.landing-theme {
  interpolate-size: allow-keywords;
}

@supports selector(details::details-content) {
  .landing-theme details::details-content {
    block-size: 0;
    overflow-y: clip;
    opacity: 0;
    transition:
      block-size 360ms cubic-bezier(0.16, 1, 0.3, 1),
      content-visibility 360ms allow-discrete,
      opacity 240ms ease;
  }

  .landing-theme details[open]::details-content {
    block-size: auto;
    opacity: 1;
  }
}

[data-faq-indicator] {
  transition: transform 320ms cubic-bezier(0.16, 1, 0.3, 1);
}

details[open] [data-faq-indicator] {
  transform: rotate(45deg);
}

@media (prefers-reduced-motion: reduce) {
  .landing-theme details::details-content,
  [data-faq-indicator] {
    transition: none;
  }
}
```

- [ ] **Step 6: Replace the final CTA composition**

Import `MotionReveal` in `apps/marketing/components/cta.tsx`:

```tsx
import { MotionReveal } from "./landing/motion-reveal";
```

Replace `CTASection` with:

```tsx
export function CTASection() {
  return (
    <section className="px-4 py-20 md:px-6 md:py-28">
      <div
        data-final-cta
        className="mx-auto grid max-w-7xl overflow-hidden rounded-[24px] border border-border bg-card text-card-foreground lg:grid-cols-12 lg:items-stretch"
      >
        <MotionReveal className="flex flex-col justify-center p-6 md:p-10 lg:col-span-5 lg:p-12">
          <h2 className="max-w-xl text-4xl font-semibold leading-[0.98] tracking-[-0.045em] text-foreground md:text-6xl">
            Donnez une suite claire à chaque séance.
          </h2>
          <p className="mt-5 max-w-[44ch] text-base leading-7 text-muted-foreground md:text-lg md:leading-8">
            Essayez Biume pendant 15 jours, sans carte bancaire.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href={webAppPath("/signup")}
              prefetch={false}
              className="landing-button inline-flex min-h-12 items-center justify-center whitespace-nowrap rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Essayer gratuitement
            </Link>
            <Link
              href="https://cal.com/mathieu-chambaud-biume"
              target="_blank"
              rel="noopener noreferrer"
              className="landing-button inline-flex min-h-12 items-center justify-center whitespace-nowrap rounded-full border border-border bg-background px-6 text-sm font-semibold text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Voir la démonstration
            </Link>
          </div>
        </MotionReveal>

        <MotionReveal delay={0.08} className="landing-media-frame relative min-h-[22rem] bg-muted lg:col-span-7 lg:min-h-[38rem]">
          <Image
            src="/assets/images/landing/practitioner-owner-animal.png"
            alt="Une praticienne échange avec la propriétaire d’un animal après une séance"
            fill
            sizes="(min-width: 1280px) 760px, (min-width: 1024px) 58vw, 100vw"
            className="object-cover"
          />
        </MotionReveal>
      </div>
    </section>
  );
}
```

- [ ] **Step 7: Run decision, interaction and full tests**

```bash
bun test apps/marketing/__tests__/home-landing.test.tsx -t "decision sections"
bun test apps/marketing/__tests__
bun --filter @biume/marketing lint
```

Expected: all tests PASS. The initial server markup must contain annual price content, five native disclosures and both CTA destinations.

- [ ] **Step 8: Commit decision feedback**

```bash
git add apps/marketing/components/pricing.tsx apps/marketing/components/faq.tsx apps/marketing/components/cta.tsx apps/marketing/app/globals.css apps/marketing/__tests__/home-landing.test.tsx
git commit -m "feat(marketing): add kinetic decision feedback"
```

---

### Task 6: Enforce the Kinetic Contract and Verify Production Rendering

**Files:**

- Modify: `apps/marketing/__tests__/home-landing.test.tsx`
- Modify only when a check fails: files named in Tasks 1 through 5.
- Create verification artifacts only: `output/playwright/landing-kinetic/`

**Interfaces:**

- Consumes: final `HomePage`, Motion islands and all marketing sections.
- Produces: automated no-JS/motion safety contracts, production screenshots and Lighthouse evidence.

- [ ] **Step 1: Add the kinetic whole-page contract**

Inside the assembled-page test, add:

```tsx
expect(html).toContain("landing-hero-media");
expect(html).toContain("landing-reassurance");
expect(html).toContain("data-problem-composition");
expect(html).toContain("data-journey-step");
expect(html).toContain("data-product-outcome");
expect(html).toContain("data-control-interlude");
expect(html).toContain("data-billing-selector");
expect(html).toContain("data-final-cta");
expect(html).not.toContain("Exemple de suivi");
expect(html).not.toContain("Naya va mieux depuis la séance");
expect(html).not.toContain("opacity:0");
```

Add a source-safety test:

```tsx
test("motion islands avoid unsafe scroll and perpetual animation patterns", async () => {
  const files = [
    "../components/landing/motion-reveal.tsx",
    "../components/landing/kinetic-header.tsx",
    "../components/landing/journey-story.tsx",
  ];
  const source = (
    await Promise.all(
      files.map((path) => Bun.file(new URL(path, import.meta.url)).text()),
    )
  ).join("\n");

  expect(source).not.toContain('addEventListener("scroll"');
  expect(source).not.toContain("window.scrollY");
  expect(source).not.toContain("requestAnimationFrame");
  expect(source).not.toContain("repeat: Infinity");
  expect(source).toContain("useReducedMotion");
});
```

- [ ] **Step 2: Run the complete marketing verification**

```bash
bun test apps/marketing/__tests__
bun --filter @biume/marketing lint
bun run check-types
bun --filter @biume/marketing build
git diff --check
```

Expected: all commands exit 0. If `bun.lock` still shows local modifications, confirm they are the pre-existing user changes and do not stage them.

- [ ] **Step 3: Run banned-pattern and motion scans**

```bash
rg -n "4\.9/5|hero-scan-line|hero-field-drift|bg-clip-text|L'IA au service|Commencer gratuitement|Démarrer l'essai|—|–|repeat:\s*Infinity|window\.scrollY|addEventListener\([\"']scroll|requestAnimationFrame" apps/marketing/app/page.tsx apps/marketing/app/globals.css apps/marketing/components
```

Expected: no matches.

- [ ] **Step 4: Start the verified production server**

Run the build first, then start the marketing app on the first free local port. Prefer 3000; if another checkout owns it, do not stop that process. Use the correct worktree on another port and document the substitution.

```bash
bun --filter @biume/marketing start
```

Expected: the verified production homepage is reachable locally.

- [ ] **Step 5: Capture the required viewport matrix**

Use the Playwright CLI skill, snapshot before every interaction group and save under `output/playwright/landing-kinetic/`:

```text
desktop-light-1440x1000.png
tablet-light-834x1112.png
mobile-light-390x844.png
desktop-dark-1440x1000.png
mobile-dark-390x844.png
mobile-reduced-motion-390x844.png
mobile-no-js-390x844.png
```

Inspect every image for:

- hero H1 at most two lines on desktop;
- hero CTA group visible before the image on mobile;
- no CTA wrapping;
- credible crops of hands, faces and animals;
- no horizontal document overflow;
- at least four visibly different section layout families;
- correct violet action and semantic-only green;
- stable sticky journey with no content collision;
- FAQ, pricing and final CTA spacing in both themes.

- [ ] **Step 6: Verify interactions and motion behavior**

With Playwright:

- scroll from the problem section through all four journey moments and confirm progress reaches 1;
- confirm each journey article remains readable at the beginning, middle and end of the sticky sequence;
- switch annual to monthly and confirm `aria-pressed`, 29,99 €, suffix and detail change together;
- open and close a FAQ item with keyboard input;
- open the native mobile menu;
- tab through the first interactive elements and inspect focus outlines;
- confirm production console has no application error or hydration warning;
- emulate reduced motion and confirm hero, header, journey, price and FAQ transforms are static;
- disable JavaScript and confirm all copy, images, CTA hrefs, annual pricing, mobile menu and FAQ content remain available.

- [ ] **Step 7: Run Lighthouse on the verified production URL**

```bash
bunx --bun lighthouse http://127.0.0.1:3000/ --only-categories=performance,accessibility,seo --chrome-flags="--headless --no-sandbox" --output=json --output-path=output/playwright/landing-kinetic/lighthouse.json
```

If the verified worktree uses another port, change only the URL and document why.

Expected:

- performance at least 95;
- accessibility 100;
- SEO 100;
- LCP below 2.5 seconds;
- CLS below 0.1;
- no non-composited animation or delayed hero visibility caused by the landing.

- [ ] **Step 8: Run the design-taste pre-flight mechanically**

Record these counts and checks in the task report:

```bash
rg -n "uppercase.*tracking|tracking.*uppercase" apps/marketing/components/{hero,features,pricing,faq,cta}.tsx
rg -n "rounded-(lg|xl|2xl|\[20px\]|\[24px\]|full)" apps/marketing/components/{header,hero,features,pricing,faq,cta}.tsx
rg -n "text-secondary|bg-secondary|border-secondary" apps/marketing/components/{header,hero,features,pricing,faq,cta}.tsx
```

Expected:

- no more than three heading eyebrows across the complete page;
- buttons full-pill, cards 16 pixels, controls 10 pixels and media 20 to 24 pixels;
- green utilities appear only on included, validated, sent or received states.

- [ ] **Step 9: Commit the final contract and any evidence-based fixes**

Before committing:

```bash
git diff --cached --name-only
```

Expected: only files from this plan. Never stage `.superpowers`, `output/playwright`, `apps/web`, `packages/transactional`, `.agents`, `.claude` or unrelated `bun.lock` hunks.

Commit:

```bash
git add apps/marketing/__tests__/home-landing.test.tsx apps/marketing/app apps/marketing/components
git commit -m "test(marketing): enforce kinetic landing contract"
```

---

## Implementation References

- Motion installation and Next.js App Router guidance: `https://motion.dev/docs/react-installation`
- Motion `useInView`: `https://motion.dev/docs/react-use-in-view`
- Motion `useScroll`: `https://motion.dev/docs/react-use-scroll`
- Motion `useTransform`: `https://motion.dev/docs/react-use-transform`
- Motion `useReducedMotion`: `https://motion.dev/docs/react-use-reduced-motion`
- Native disclosure semantics: `https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/details`
- Progressive intrinsic-size interpolation: `https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/interpolate-size`

---

## Final Acceptance Checklist

- [ ] The landing is visibly more modern, asymmetric and kinetic than the first redesign.
- [ ] Hero category, heading, subtext and CTA group remain the only four hero text elements.
- [ ] The hero photograph is larger, has no fake overlay card and is visible immediately.
- [ ] The reassurance facts form a compact progressive rail below the hero.
- [ ] The problem, journey, outcome, control, pricing, FAQ and final CTA use at least four distinct layout families.
- [ ] The sticky desktop journey activates Observer, Valider, Suivre and Revoir without trapping scroll.
- [ ] Mobile and no-JavaScript journey content remains a normal readable sequence.
- [ ] Pricing preserves 29,99 € and 24,99 € with accessible spring-enhanced selection.
- [ ] FAQ preserves exactly five native `details` elements.
- [ ] Every primary CTA remains `Essayer gratuitement` and resolves to signup.
- [ ] Routes, schema, metadata, canonical URLs, OG output and Cal.com URL remain unchanged.
- [ ] Violet remains action and green remains semantic.
- [ ] No banned dash, fake proof, fake dashboard, gradient headline, parallax, perpetual loop or unsafe scroll listener exists.
- [ ] Light, dark, reduced-motion and no-JavaScript renders pass at desktop, tablet and mobile.
- [ ] Marketing tests, lint, type-check and production build pass.
- [ ] Lighthouse reaches performance 95+, accessibility 100 and SEO 100 with LCP below 2.5 seconds and CLS below 0.1.
- [ ] Only Motion-related `bun.lock` hunks are committed; all unrelated working-tree changes remain untouched.
