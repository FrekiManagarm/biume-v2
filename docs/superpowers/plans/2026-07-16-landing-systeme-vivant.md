# Landing « Le système vivant » Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the Biume marketing homepage around daily time savings, precise owner-friendly reports, and continuous follow-up, using Biume’s violet/blue/green palette and a Clay-inspired living-system composition.

**Architecture:** Keep `app/page.tsx` as a server-rendered composition of focused landing sections. Isolate scroll and perpetual motion in four small client islands (`HeaderMotion`, `LivingSystemScene`, `ReportTransformationStory`, and `PricingSelector`) while keeping all essential copy visible in server HTML. Reuse the existing report demo, pricing data, signup routes, Cal.com destination, and local photography.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS v4, Motion 12, Bun test, Bun workspaces.

---

## File map

**Create**

- `apps/marketing/components/landing/living-system-scene.tsx` — animated hero visual only.
- `apps/marketing/components/landing/daily-flow.tsx` — server-rendered daily workflow timeline.
- `apps/marketing/components/landing/follow-up-story.tsx` — server-rendered follow-up continuity proof.
- `apps/marketing/components/landing/practitioner-control.tsx` — server-rendered control/trust statement.
- `apps/marketing/__tests__/daily-flow.test.tsx` — daily workflow contract.
- `apps/marketing/__tests__/landing-continuity.test.tsx` — follow-up and practitioner-control contracts.

**Modify**

- `apps/marketing/app/page.tsx` — assemble the eight narrative moments.
- `apps/marketing/app/globals.css` — Biume palette roles, hero scene motion, report replay, reduced-motion rules.
- `apps/marketing/components/landing/header-motion.tsx` — compacting client-side sticky header.
- `apps/marketing/components/landing/landing-header.tsx` — add the secondary demo path and floating navigation styling.
- `apps/marketing/components/landing/landing-hero.tsx` — new promise, split copy, CTA hierarchy, and scene composition.
- `apps/marketing/components/landing/report-transformation-story.tsx` — new copy and replay control while preserving SSR.
- `apps/marketing/components/landing/pricing-decision.tsx` — align offer presentation with the new visual system.
- `apps/marketing/components/landing/pricing-selector.tsx` — selected state uses Biume violet.
- `apps/marketing/components/landing/landing-faq.tsx` — add the contextual demo link.
- `apps/marketing/components/landing/final-cta.tsx` — new closing copy and single trial CTA.
- `apps/marketing/__tests__/landing-hero.test.tsx` — header, demo link, hero, and motion contracts.
- `apps/marketing/__tests__/report-transformation-story.test.tsx` — revised copy and replay behavior.
- `apps/marketing/__tests__/pricing-decision.test.tsx` — revised visual and control contracts.
- `apps/marketing/__tests__/landing-close.test.tsx` — contextual demo plus single final CTA.
- `apps/marketing/__tests__/home-landing.test.tsx` — eight-section integration, ordering, anchors, conversions, and client-island budget.

**Delete**

- `apps/marketing/components/landing/kinetic-header.tsx` — unused duplicate once `HeaderMotion` owns the compacting behavior.

## Task 1: Floating header and demo conversion path

**Files:**

- Modify: `apps/marketing/__tests__/landing-hero.test.tsx`
- Modify: `apps/marketing/components/landing/header-motion.tsx`
- Modify: `apps/marketing/components/landing/landing-header.tsx`

- [ ] **Step 1: Write the failing header tests**

Replace the first two header tests in `landing-hero.test.tsx` with tests that require a client motion boundary and two Cal.com links:

```tsx
test("header motion compacts with Motion and preserves reduced motion", async () => {
  const source = await Bun.file(
    new URL("../components/landing/header-motion.tsx", import.meta.url),
  ).text();

  expect(source).toMatch(/^"use client";/);
  expect(source).toContain('from "motion/react"');
  expect(source).toContain("useReducedMotion");
  expect(source).toContain("useScroll");
  expect(source).toContain("useTransform");
  expect(source).not.toContain('addEventListener("scroll"');
});

test("homepage header keeps trial dominant and demo available", () => {
  const html = renderWithLandingImageConfig(<LandingHeader />);
  const signupAnchors = conversionAnchors(html, "header-signup");
  const demoAnchors = conversionAnchors(html, "header-demo");

  for (const label of [
    "Produit",
    "Comment ça marche",
    "Tarifs",
    "Ressources",
    "Connexion",
  ]) {
    expect(html).toContain(label);
  }
  expect(html).toContain("Navigation mobile");
  expect(signupAnchors).toHaveLength(2);
  expect(demoAnchors).toHaveLength(2);
  for (const anchor of signupAnchors) {
    expect(anchor).toContain(`href="${webAppPath("/signup")}"`);
  }
  for (const anchor of demoAnchors) {
    expect(anchor).toContain(
      'href="https://cal.com/mathieu-chambaud-biume"',
    );
    expect(anchor).toContain('target="_blank"');
    expect(anchor).toContain('rel="noopener noreferrer"');
  }
});
```

- [ ] **Step 2: Run the tests and confirm the expected failure**

Run:

```bash
rtk bun test apps/marketing/__tests__/landing-hero.test.tsx
```

Expected: FAIL because `HeaderMotion` is not a client component and `header-demo` does not exist.

- [ ] **Step 3: Implement the compacting motion boundary**

Replace `header-motion.tsx` with this client wrapper:

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

export function HeaderMotion({ children }: Readonly<{ children: ReactNode }>) {
  const reduceMotion = useReducedMotion();
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 120], [0, -3]);
  const scale = useTransform(scrollY, [0, 120], [1, 0.985]);
  const surfaceOpacity = useTransform(scrollY, [0, 120], [0.92, 0.98]);

  return (
    <LazyMotion features={domAnimation} strict>
      <m.header
        data-header-motion
        className="sticky inset-x-0 top-0 z-40 px-3 pt-3 sm:px-5"
        style={reduceMotion ? undefined : { y, scale }}
      >
        <m.div
          data-header-surface
          aria-hidden="true"
          className="absolute inset-3 -z-10 rounded-[1.25rem] border border-[color:var(--carnet-line)] bg-[color:var(--carnet-surface)] shadow-[0_18px_45px_-35px_rgba(107,90,200,0.35)] backdrop-blur-xl"
          style={{ opacity: reduceMotion ? 0.98 : surfaceOpacity }}
        />
        <div className="mx-auto flex h-16 max-w-[90rem] items-center gap-3 px-4 sm:px-5">
          {children}
        </div>
      </m.header>
    </LazyMotion>
  );
}
```

In `landing-header.tsx`, rename the first navigation label to `Produit`, add `demoUrl`, and render a `data-conversion="header-demo"` link in both desktop actions and the mobile menu:

```tsx
const demoUrl = "https://cal.com/mathieu-chambaud-biume";

<Link
  href={demoUrl}
  target="_blank"
  rel="noopener noreferrer"
  data-conversion="header-demo"
  className="carnet-action inline-flex min-h-11 items-center rounded-full bg-[color:var(--carnet-muted-surface)] px-4 text-sm font-semibold text-[color:var(--carnet-ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--carnet-violet)]"
>
  Réserver une démo
</Link>
```

- [ ] **Step 4: Run the header tests**

Run:

```bash
rtk bun test apps/marketing/__tests__/landing-hero.test.tsx
```

Expected: PASS for the header tests; the old hero expectations may still fail until Task 2.

- [ ] **Step 5: Commit the header change**

```bash
rtk git add apps/marketing/components/landing/header-motion.tsx apps/marketing/components/landing/landing-header.tsx apps/marketing/__tests__/landing-hero.test.tsx
rtk proxy git commit -m "feat(marketing): add floating landing navigation"
```

## Task 2: Living-system hero

**Files:**

- Create: `apps/marketing/components/landing/living-system-scene.tsx`
- Modify: `apps/marketing/components/landing/landing-hero.tsx`
- Modify: `apps/marketing/app/globals.css`
- Modify: `apps/marketing/__tests__/landing-hero.test.tsx`

- [ ] **Step 1: Replace the hero content test with the approved contract**

```tsx
test("hero renders the approved time-saving living system", () => {
  const html = renderWithLandingImageConfig(<LandingHero />);
  const text = textOnly(html);

  expect(text).toContain("Votre journée, mieux orchestrée");
  expect(text).toContain(
    "Moins d’administratif. Plus de temps pour soigner.",
  );
  expect(text).toContain(
    "Biume transforme vos notes en comptes rendus précis et clairs, puis garde le fil du suivi propriétaire.",
  );
  expect(text).toContain("Essayer gratuitement");
  expect(text).toContain("Réserver une démo");
  expect(html).toContain("hero-practitioner-horse.png");
  expect(html).toContain('fetchpriority="high"');
  expect(html).toContain("data-living-system-scene");
  expect(html).toContain("data-system-document");
  expect(html).toContain("data-system-orbit");
  expect(conversionAnchors(html, "hero-signup")).toHaveLength(1);
  expect(conversionAnchors(html, "hero-demo")).toHaveLength(1);
  expect(html).not.toMatch(exactZeroOpacity);
});

test("hero motion is isolated and respects reduced motion", async () => {
  const [heroSource, sceneSource, css] = await Promise.all([
    Bun.file(new URL("../components/landing/landing-hero.tsx", import.meta.url)).text(),
    Bun.file(new URL("../components/landing/living-system-scene.tsx", import.meta.url)).text(),
    Bun.file(new URL("../app/globals.css", import.meta.url)).text(),
  ]);

  expect(heroSource).not.toContain('"use client"');
  expect(sceneSource).toMatch(/^"use client";/);
  expect(sceneSource).toContain('from "motion/react"');
  expect(sceneSource).toContain("useReducedMotion");
  expect(sceneSource).toContain("repeat: Infinity");
  expect(sceneSource).not.toMatch(/animate=\{\{[^}]*\b(?:top|left|width|height):/s);
  expect(css).toContain("--carnet-violet: #6b5ac8;");
  expect(css).toContain("--carnet-blue: #5d9bb8;");
  expect(css).toContain("--carnet-green: #2e9866;");
  expect(css).toMatch(/@media \(prefers-reduced-motion: reduce\)[\s\S]*living-system/);
});
```

- [ ] **Step 2: Run the hero tests and confirm failure**

```bash
rtk bun test apps/marketing/__tests__/landing-hero.test.tsx
```

Expected: FAIL on the new hero copy and missing `living-system-scene.tsx`.

- [ ] **Step 3: Create the isolated animated scene**

Create `living-system-scene.tsx` with one local image and transform-only Motion elements:

```tsx
"use client";

import Image from "next/image";
import { domAnimation, LazyMotion, m, useReducedMotion } from "motion/react";
import { memo } from "react";

export const LivingSystemScene = memo(function LivingSystemScene() {
  const reduceMotion = useReducedMotion();
  const float = reduceMotion
    ? undefined
    : { y: [0, -8, 0], rotate: [-2, 1, -2] };

  return (
    <LazyMotion features={domAnimation} strict>
      <div
        data-living-system-scene
        className="living-system-scene relative min-h-[23rem] overflow-hidden bg-[color:var(--carnet-blue-soft)] sm:min-h-[30rem] lg:min-h-[34rem]"
      >
        <Image
          src="/assets/images/landing/hero-practitioner-horse.png"
          alt="Une ostéopathe animalière observe un cheval pendant une séance"
          fill
          priority
          quality={65}
          sizes="(min-width: 1024px) 58vw, 100vw"
          className="object-cover object-center"
        />
        <span aria-hidden="true" data-system-orbit className="living-system-orbit" />
        {["Note de séance", "Compte rendu clair", "Suivi planifié"].map(
          (label, index) => (
            <m.div
              key={label}
              data-system-document={label}
              className="living-system-document"
              data-system-index={index}
              animate={float}
              transition={{
                type: "spring",
                stiffness: 100,
                damping: 20,
                repeat: Infinity,
                repeatDelay: 1.4 + index * 0.4,
              }}
            >
              <span>{label}</span>
            </m.div>
          ),
        )}
      </div>
    </LazyMotion>
  );
});
```

- [ ] **Step 4: Rebuild the server hero around the scene**

In `landing-hero.tsx`, keep the component server-side, render `<LivingSystemScene />`, and use this content hierarchy:

```tsx
<section data-landing-section="hero" className="px-4 pb-10 pt-4 sm:px-6 lg:px-8">
  <div className="mx-auto max-w-[90rem] overflow-hidden rounded-[2rem] bg-[color:var(--carnet-anthracite)] text-white sm:rounded-[3rem]">
    <LivingSystemScene />
    <div className="grid gap-8 px-6 py-8 sm:px-10 sm:py-10 lg:grid-cols-[1.25fr_0.75fr] lg:items-end lg:px-14 lg:py-12">
      <div>
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--carnet-logo-violet)]">
          Votre journée, mieux orchestrée
        </p>
        <h1 className="mt-4 max-w-[17ch] text-5xl font-semibold leading-[0.9] tracking-[-0.06em] sm:text-6xl lg:text-7xl">
          Moins d’administratif. Plus de temps pour soigner.
        </h1>
      </div>
      <div>
        <p className="max-w-[48ch] text-base leading-7 text-white/70">
          Biume transforme vos notes en comptes rendus précis et clairs, puis garde le fil du suivi propriétaire.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link href={webAppPath("/signup")} prefetch={false} data-conversion="hero-signup" className="carnet-action inline-flex min-h-12 items-center justify-center rounded-full bg-[color:var(--carnet-violet)] px-6 text-sm font-semibold text-white">
            Essayer gratuitement
          </Link>
          <Link href="https://cal.com/mathieu-chambaud-biume" target="_blank" rel="noopener noreferrer" data-conversion="hero-demo" className="carnet-action inline-flex min-h-12 items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-[color:var(--carnet-anthracite)]">
            Réserver une démo
          </Link>
        </div>
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 5: Add scene positioning and reduced-motion CSS**

Add named selectors in `globals.css` for `.living-system-scene`, `.living-system-orbit`, `.living-system-document`, and the three `data-system-index` positions. Use only fixed positioning properties for layout; animation remains exclusively Motion transforms. In the reduced-motion media query, set `animation: none` and `transition: none` for all `.living-system-*` elements.

- [ ] **Step 6: Run the hero tests**

```bash
rtk bun test apps/marketing/__tests__/landing-hero.test.tsx
```

Expected: PASS.

- [ ] **Step 7: Commit the hero**

```bash
rtk git add apps/marketing/components/landing/living-system-scene.tsx apps/marketing/components/landing/landing-hero.tsx apps/marketing/app/globals.css apps/marketing/__tests__/landing-hero.test.tsx
rtk proxy git commit -m "feat(marketing): build living-system landing hero"
```

## Task 3: Daily workflow timeline

**Files:**

- Create: `apps/marketing/components/landing/daily-flow.tsx`
- Create: `apps/marketing/__tests__/daily-flow.test.tsx`

- [ ] **Step 1: Write the failing component test**

```tsx
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "bun:test";

import { DailyFlow } from "../components/landing/daily-flow";
import { textOnly } from "./landing-test-utils";

describe("daily flow", () => {
  test("shows where Biume removes repeated work without invented savings", () => {
    const html = renderToStaticMarkup(<DailyFlow />);
    const text = textOnly(html);

    expect(html).toContain('data-landing-section="daily-flow"');
    expect(html).toContain('id="comment-ca-marche"');
    expect(text).toContain("Une journée de cabinet, sans ressaisie.");
    for (const step of ["Séance", "Notes", "Compte rendu", "Partage", "Suivi"]) {
      expect(text).toContain(step);
    }
    expect(html.match(/data-daily-step=/g)).toHaveLength(5);
    expect(text.toLowerCase()).not.toMatch(/\d+\s*(?:h|heure|minute)/);
  });
});
```

- [ ] **Step 2: Run the test and confirm the missing module failure**

```bash
rtk bun test apps/marketing/__tests__/daily-flow.test.tsx
```

Expected: FAIL because `daily-flow.tsx` does not exist.

- [ ] **Step 3: Implement the server-rendered timeline**

Create a `DailyFlow` component with this data contract and semantic structure:

```tsx
const dailySteps = [
  { label: "Séance", detail: "Vous restez concentré sur l’animal." },
  { label: "Notes", detail: "Vos observations gardent votre vocabulaire." },
  { label: "Compte rendu", detail: "Biume structure une base précise." },
  { label: "Partage", detail: "Vous relisez avant chaque envoi." },
  { label: "Suivi", detail: "La prochaine étape reste visible." },
] as const;

export function DailyFlow() {
  return (
    <section id="comment-ca-marche" data-landing-section="daily-flow" className="scroll-mt-24 px-4 py-10 sm:px-6 md:py-20 lg:px-8">
      <div className="mx-auto max-w-[90rem]">
        <div className="grid gap-6 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--carnet-violet)]">Le temps retrouvé</p>
          <div>
            <h2 className="text-4xl font-semibold leading-[0.96] tracking-[-0.052em] md:text-6xl">Une journée de cabinet, sans ressaisie.</h2>
            <p className="mt-5 max-w-[58ch] text-base leading-7 text-[color:var(--carnet-muted)]">De la séance au suivi, Biume garde le même fil pour éviter de recommencer le travail à chaque étape.</p>
          </div>
        </div>
        <ol className="mt-10 grid border-y border-[color:var(--carnet-line)] md:grid-cols-5">
          {dailySteps.map((step, index) => (
            <li key={step.label} data-daily-step={step.label} className="relative border-b border-[color:var(--carnet-line)] px-4 py-6 last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0">
              <span className="font-mono text-xs text-[color:var(--carnet-violet)]">0{index + 1}</span>
              <h3 className="mt-6 text-xl font-semibold tracking-[-0.03em]">{step.label}</h3>
              <p className="mt-3 text-sm leading-6 text-[color:var(--carnet-muted)]">{step.detail}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Run the daily-flow test**

```bash
rtk bun test apps/marketing/__tests__/daily-flow.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit the timeline**

```bash
rtk git add apps/marketing/components/landing/daily-flow.tsx apps/marketing/__tests__/daily-flow.test.tsx
rtk proxy git commit -m "feat(marketing): show the daily Biume workflow"
```

## Task 4: Replayable report transformation

**Files:**

- Modify: `apps/marketing/components/landing/report-transformation-story.tsx`
- Modify: `apps/marketing/app/globals.css`
- Modify: `apps/marketing/__tests__/report-transformation-story.test.tsx`

- [ ] **Step 1: Update the transformation contract**

Change the SSR test to require the new promise, one `id="produit"`, no `comment-ca-marche` id, and a replay button:

```tsx
for (const copy of [
  "Précis pour vous. Clair pour le propriétaire.",
  "Votre observation reste la source.",
  REPORT_NOTE_SUMMARY,
  demo.adaptedProposal,
  "Vous notez",
  "Biume organise",
  "Vous décidez",
  "Rejouer la transformation",
]) {
  expect(text).toContain(copy);
}
expect(html).toContain('id="produit"');
expect(html).not.toContain('id="comment-ca-marche"');
expect(html).toContain('type="button"');
expect(html).toContain("data-report-replay-stage");
```

Update the progressive-enhancement source assertions:

```tsx
expect(source).toContain("useState");
expect(source).toContain("setReplayKey");
expect(source).not.toContain("requestAnimationFrame");
expect(css).toContain("@keyframes report-replay");
expect(css).toMatch(/@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*report-replay-stage/);
```

- [ ] **Step 2: Run the transformation test and confirm failure**

```bash
rtk bun test apps/marketing/__tests__/report-transformation-story.test.tsx
```

Expected: FAIL on the new copy, replay state, and section id contract.

- [ ] **Step 3: Add replay state without hiding server content**

Add `useState` to the existing client component and wrap the note/bridge/document row in a keyed stage:

```tsx
const [replayKey, setReplayKey] = useState(0);

<div key={replayKey} data-report-replay-stage className="report-replay-stage mt-10 md:mt-14 md:grid md:grid-cols-[0.78fr_0.46fr_1.18fr] md:items-center">
  <SourceNote />
  <TransformationBridge />
  <OwnerDocument demo={demo} />
</div>

<button
  type="button"
  onClick={() => setReplayKey((current) => current + 1)}
  className="carnet-action mt-8 inline-flex min-h-11 items-center rounded-full border border-white/20 px-5 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--carnet-logo-violet)]"
>
  Rejouer la transformation
</button>
```

Keep the existing `REPORT_TRANSFORMATION_DEMO`, one-shot observer cleanup, and full SSR content. Change only the section copy and remove `id="comment-ca-marche"` from the inner stage.

- [ ] **Step 4: Add the replay keyframes**

```css
@keyframes report-replay {
  from {
    transform: translate3d(0, 10px, 0) scale(0.99);
  }
  to {
    transform: translate3d(0, 0, 0) scale(1);
  }
}

.report-replay-stage {
  animation: report-replay 680ms cubic-bezier(0.16, 1, 0.3, 1) both;
}
```

Disable this animation in the existing reduced-motion media query.

- [ ] **Step 5: Run the transformation test**

```bash
rtk bun test apps/marketing/__tests__/report-transformation-story.test.tsx
```

Expected: PASS.

- [ ] **Step 6: Commit the transformation update**

```bash
rtk git add apps/marketing/components/landing/report-transformation-story.tsx apps/marketing/app/globals.css apps/marketing/__tests__/report-transformation-story.test.tsx
rtk proxy git commit -m "feat(marketing): make report transformation replayable"
```

## Task 5: Follow-up continuity and practitioner control

**Files:**

- Create: `apps/marketing/components/landing/follow-up-story.tsx`
- Create: `apps/marketing/components/landing/practitioner-control.tsx`
- Create: `apps/marketing/__tests__/landing-continuity.test.tsx`

- [ ] **Step 1: Write the failing continuity tests**

```tsx
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "bun:test";

import { FollowUpStory } from "../components/landing/follow-up-story";
import { PractitionerControl } from "../components/landing/practitioner-control";
import { textOnly } from "./landing-test-utils";

describe("landing continuity", () => {
  test("shows a practitioner-chosen follow-up without unsupported automation", () => {
    const html = renderToStaticMarkup(<FollowUpStory />);
    const text = textOnly(html);

    expect(html).toContain('data-landing-section="follow-up"');
    expect(text).toContain("Le suivi ne repose plus sur votre mémoire.");
    expect(text).toContain("Compte rendu prêt à relire");
    expect(text).toContain("Suivi prévu dans 30 jours");
    expect(text).toContain("Échéance choisie par le praticien");
    expect(text).not.toContain("questionnaire automatique");
  });

  test("states that nothing is sent without practitioner validation", () => {
    const html = renderToStaticMarkup(<PractitionerControl />);
    const text = textOnly(html);

    expect(html).toContain('data-landing-section="control"');
    expect(text).toContain("Biume prépare. Vous décidez.");
    expect(text).toContain("Rien ne part sans votre validation.");
    expect(html).toContain("var(--carnet-green)");
  });
});
```

- [ ] **Step 2: Run the tests and confirm missing modules**

```bash
rtk bun test apps/marketing/__tests__/landing-continuity.test.tsx
```

Expected: FAIL because both components are missing.

- [ ] **Step 3: Implement `FollowUpStory`**

Create this two-column server component:

```tsx
export function FollowUpStory() {
  return (
    <section
      data-landing-section="follow-up"
      className="bg-[color:var(--carnet-blue-soft)] px-4 py-10 sm:px-6 md:py-20 lg:px-8"
    >
      <div className="mx-auto grid max-w-[90rem] gap-10 lg:grid-cols-[0.84fr_1.16fr] lg:items-center lg:gap-16">
        <div>
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--carnet-blue)]">
            La continuité après la séance
          </p>
          <h2 className="mt-4 max-w-[15ch] text-4xl font-semibold leading-[0.96] tracking-[-0.052em] text-[color:var(--carnet-ink)] md:text-6xl">
            Le suivi ne repose plus sur votre mémoire.
          </h2>
          <p className="mt-5 max-w-[52ch] text-base leading-7 text-[color:var(--carnet-muted)]">
            Le compte rendu, l’échéance et la prochaine étape restent dans le même parcours.
          </p>
        </div>
        <div className="relative grid gap-4 border-l border-[color:var(--carnet-blue)] pl-5 sm:pl-8">
          <article className="mr-8 rounded-[1.5rem_1.5rem_1.5rem_0.5rem] bg-[color:var(--carnet-surface)] p-5 shadow-[0_22px_55px_-40px_rgba(93,155,184,0.55)]">
            <p className="font-mono text-xs text-[color:var(--carnet-muted)]">Après la séance</p>
            <h3 className="mt-2 text-lg font-semibold">Compte rendu prêt à relire</h3>
          </article>
          <article className="ml-8 rounded-[1.5rem_1.5rem_0.5rem_1.5rem] bg-[color:var(--carnet-green-soft)] p-5">
            <p className="font-mono text-xs text-[color:var(--carnet-green-ink)]">Échéance choisie par le praticien</p>
            <h3 className="mt-2 text-lg font-semibold">Suivi prévu dans 30 jours</h3>
          </article>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Implement `PractitionerControl`**

Create this short full-width server component:

```tsx
export function PractitionerControl() {
  return (
    <section
      data-landing-section="control"
      className="bg-[color:var(--carnet-anthracite)] px-4 py-10 text-white sm:px-6 md:py-16 lg:px-8"
    >
      <div className="mx-auto grid max-w-[90rem] gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--carnet-logo-green)]">
            Votre validation reste centrale
          </p>
          <h2 className="mt-4 text-4xl font-semibold leading-[0.96] tracking-[-0.052em] md:text-6xl">
            Biume prépare. Vous décidez.
          </h2>
        </div>
        <p className="flex min-h-12 items-center gap-3 rounded-full border border-white/15 px-5 text-sm font-semibold text-white/80">
          <span aria-hidden="true" className="size-2 rounded-full bg-[color:var(--carnet-green)]" />
          Rien ne part sans votre validation.
        </p>
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Run the continuity tests**

```bash
rtk bun test apps/marketing/__tests__/landing-continuity.test.tsx
```

Expected: PASS.

- [ ] **Step 6: Commit the continuity sections**

```bash
rtk git add apps/marketing/components/landing/follow-up-story.tsx apps/marketing/components/landing/practitioner-control.tsx apps/marketing/__tests__/landing-continuity.test.tsx
rtk proxy git commit -m "feat(marketing): add follow-up and control story"
```

## Task 6: Offer, FAQ demo path, and final CTA

**Files:**

- Modify: `apps/marketing/components/landing/pricing-decision.tsx`
- Modify: `apps/marketing/components/landing/pricing-selector.tsx`
- Modify: `apps/marketing/components/landing/landing-faq.tsx`
- Modify: `apps/marketing/components/landing/final-cta.tsx`
- Modify: `apps/marketing/__tests__/pricing-decision.test.tsx`
- Modify: `apps/marketing/__tests__/landing-close.test.tsx`

- [ ] **Step 1: Add the revised offer and close expectations**

In `pricing-decision.test.tsx`, make the first test callback `async`, preserve all price assertions, and add:

```tsx
expect(text).toContain("Une offre. Deux rythmes.");
expect(text).toContain("Testez tout le parcours pendant 15 jours.");

const selectorSource = await Bun.file(
  new URL("../components/landing/pricing-selector.tsx", import.meta.url),
).text();
expect(selectorSource).toContain(
  "bg-[color:var(--carnet-violet)]",
);
```

In `landing-close.test.tsx`, keep the final CTA single-action test and add a separate FAQ demo test:

```tsx
test("keeps demo contextual near the FAQ without competing in the final CTA", () => {
  const faqHtml = renderToStaticMarkup(<LandingFaq />);
  const finalHtml = renderWithLandingImageConfig(<FinalCta />);

  expect(faqHtml).toContain(
    'href="https://cal.com/mathieu-chambaud-biume"',
  );
  expect(faqHtml).toContain('target="_blank"');
  expect(faqHtml).toContain("Réserver une démonstration");
  expect(finalHtml).not.toContain("cal.com");
  expect(finalHtml.match(/<a\b/g)).toHaveLength(1);
});
```

- [ ] **Step 2: Run the pricing and close tests**

```bash
rtk bun test apps/marketing/__tests__/pricing-decision.test.tsx apps/marketing/__tests__/landing-close.test.tsx
```

Expected: FAIL on the new copy, selected violet surface, and FAQ demo link.

- [ ] **Step 3: Restyle the offer without changing pricing data**

Keep `billingOptions` byte-for-byte unchanged. Replace the offer heading and supporting copy with:

```tsx
<p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--carnet-violet)]">
  Une offre. Deux rythmes.
</p>
<h2 className="mt-4 text-4xl font-semibold leading-[0.96] tracking-[-0.052em] text-[color:var(--carnet-ink)] md:text-6xl">
  Testez tout le parcours pendant 15 jours.
</h2>
```

In `pricing-selector.tsx`, change only the selected background span:

```tsx
<span
  aria-hidden="true"
  className="absolute inset-0 rounded-[0.6rem] bg-[color:var(--carnet-violet)]"
/>
```

Preserve `aria-pressed`, the mounted `aria-live="polite"` region, and `prefetch={false}`.

- [ ] **Step 4: Add the contextual demo link and preserve a single final action**

Add this link below the FAQ introduction:

```tsx
<Link
  href="https://cal.com/mathieu-chambaud-biume"
  target="_blank"
  rel="noopener noreferrer"
  data-conversion="faq-demo"
  className="carnet-action mt-6 inline-flex min-h-11 items-center rounded-full border border-[color:var(--carnet-line)] bg-[color:var(--carnet-surface)] px-5 text-sm font-semibold text-[color:var(--carnet-ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--carnet-violet)]"
>
  Réserver une démonstration
</Link>
```

Update the final copy exactly as follows while keeping one `final-signup` link and no Cal.com link:

```tsx
<p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--carnet-violet)]">
  Votre prochaine séance
</p>
<h2 className="mt-4 text-4xl font-semibold leading-[0.96] tracking-[-0.052em] text-[color:var(--carnet-ink)] md:text-6xl">
  Retrouvez du temps dès votre prochaine séance.
</h2>
<p className="mt-5 max-w-[42ch] text-base leading-7 text-[color:var(--carnet-muted)]">
  Créez votre espace, préparez un premier compte rendu et gardez la main jusqu’à l’envoi.
</p>
```

- [ ] **Step 5: Run the pricing and close tests**

```bash
rtk bun test apps/marketing/__tests__/pricing-decision.test.tsx apps/marketing/__tests__/landing-close.test.tsx
```

Expected: PASS.

- [ ] **Step 6: Commit the decision and close**

```bash
rtk git add apps/marketing/components/landing/pricing-decision.tsx apps/marketing/components/landing/pricing-selector.tsx apps/marketing/components/landing/landing-faq.tsx apps/marketing/components/landing/final-cta.tsx apps/marketing/__tests__/pricing-decision.test.tsx apps/marketing/__tests__/landing-close.test.tsx
rtk proxy git commit -m "feat(marketing): align offer and close with trial conversion"
```

## Task 7: Assemble the eight-section homepage

**Files:**

- Modify: `apps/marketing/app/page.tsx`
- Modify: `apps/marketing/app/globals.css`
- Modify: `apps/marketing/__tests__/home-landing.test.tsx`
- Delete: `apps/marketing/components/landing/kinetic-header.tsx`

- [ ] **Step 1: Rewrite the integration expectations**

Require this exact section order:

```tsx
const markers = [
  'data-landing-section="hero"',
  'data-landing-section="reassurance"',
  'data-landing-section="daily-flow"',
  'data-landing-section="transformation"',
  'data-landing-section="follow-up"',
  'data-landing-section="control"',
  'data-landing-section="pricing"',
  'data-landing-section="faq-cta"',
];

expect(html.match(/data-landing-section=/g)).toHaveLength(8);
for (const marker of markers) {
  expect(html).toContain(marker);
}
for (let index = 1; index < markers.length; index += 1) {
  expect(html.indexOf(markers[index - 1]!)).toBeLessThan(
    html.indexOf(markers[index]!),
  );
}
```

Update the approved-copy assertions to include the new hero, daily flow, report, follow-up, control, pricing, and final CTA copy. Update stable conversion counts to:

```tsx
const expectedCounts = {
  "header-signup": 2,
  "header-demo": 2,
  "hero-signup": 1,
  "hero-demo": 1,
  "pricing-signup": 1,
  "faq-demo": 1,
  "final-signup": 1,
} as const;
```

Update the client-island list to exactly:

```tsx
const clientIslands = [
  "../components/landing/header-motion.tsx",
  "../components/landing/living-system-scene.tsx",
  "../components/landing/report-transformation-story.tsx",
  "../components/landing/pricing-selector.tsx",
];
```

- [ ] **Step 2: Run the homepage integration test and confirm failure**

```bash
rtk bun test apps/marketing/__tests__/home-landing.test.tsx
```

Expected: FAIL because the page still assembles four sections.

- [ ] **Step 3: Assemble all sections in `app/page.tsx`**

Use this order inside `<main id="contenu">`:

```tsx
<LandingHero />
<section data-landing-section="reassurance" className="border-y border-[color:var(--carnet-line)] px-4 py-5 sm:px-6 lg:px-8">
  <ul className="mx-auto grid max-w-[90rem] gap-3 sm:grid-cols-3">
    <li>15 jours pour tout tester</li>
    <li>Sans carte bancaire</li>
    <li>Rien ne part sans votre validation</li>
  </ul>
</section>
<DailyFlow />
<ReportTransformationStory demo={REPORT_TRANSFORMATION_DEMO} />
<FollowUpStory />
<PractitionerControl />
<PricingDecision />
<section id="questions" data-landing-section="faq-cta" className="px-4 py-10 sm:px-6 md:py-20 lg:px-8">
  <div className="mx-auto max-w-[90rem]">
    <LandingFaq />
    <FinalCta />
  </div>
</section>
```

Delete `kinetic-header.tsx` after confirming no import remains.

- [ ] **Step 4: Finish global visual-system CSS**

Keep the exact existing Biume variables and fixed grain overlay. Delete the obsolete `.landing-hero-photo`, `.landing-hero-entry`, `.landing-hero-note`, `.landing-hero-report`, `@keyframes landing-hero-enter`, `@keyframes landing-hero-photo-enter`, `@keyframes landing-hero-note`, and `@keyframes landing-hero-report` blocks after `rg` confirms those names no longer occur in TSX. Keep the existing `.carnet-action` hover/active/focus behavior and FAQ disclosure transitions. Run this guard after cleanup:

```bash
rtk rg -n "landing-hero-(photo|entry|note|report)|landing-hero-(enter|photo-enter)" apps/marketing
```

Expected: no matches. Confirm every remaining CSS keyframe changes only `transform` or `opacity`.

- [ ] **Step 5: Run all homepage component tests**

```bash
rtk bun test apps/marketing/__tests__/landing-hero.test.tsx apps/marketing/__tests__/daily-flow.test.tsx apps/marketing/__tests__/report-transformation-story.test.tsx apps/marketing/__tests__/landing-continuity.test.tsx apps/marketing/__tests__/pricing-decision.test.tsx apps/marketing/__tests__/landing-close.test.tsx apps/marketing/__tests__/home-landing.test.tsx
```

Expected: PASS.

- [ ] **Step 6: Commit the integrated homepage**

```bash
rtk git add apps/marketing/app/page.tsx apps/marketing/app/globals.css apps/marketing/__tests__/home-landing.test.tsx apps/marketing/components/landing/kinetic-header.tsx
rtk proxy git commit -m "feat(marketing): assemble living-system homepage"
```

## Task 8: Full verification and interface audit

**Files:**

- Modify only files with concrete findings from the checks below.

- [ ] **Step 1: Run the complete marketing test suite**

```bash
rtk bun test apps/marketing/__tests__
```

Expected: all tests pass with zero failures.

- [ ] **Step 2: Run lint**

```bash
rtk bun --filter @biume/marketing lint
```

Expected: exit code 0.

- [ ] **Step 3: Build the marketing app**

```bash
rtk bun --filter @biume/marketing build
```

Expected: Next.js build succeeds and `/` is generated without type or hydration errors.

- [ ] **Step 4: Fetch the current Web Interface Guidelines**

```bash
rtk curl -fsSL https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md -o /tmp/biume-web-interface-guidelines.md
```

Expected: `/tmp/biume-web-interface-guidelines.md` exists and is non-empty.

- [ ] **Step 5: Start the marketing app and inspect desktop**

```bash
rtk bun run dev:marketing
```

Open `http://localhost:3000` in the in-app browser at a desktop viewport. Verify the floating header, LCP image, all eight sections, conversion destinations, report replay, price selection, FAQ disclosures, focus rings, and the absence of horizontal scrolling.

- [ ] **Step 6: Inspect mobile and reduced motion**

Use a 390 × 844 viewport. Verify one-column collapse, menu access to demo and trial, 44 px targets, no clipped copy, no horizontal scrolling, and a stable hero. Enable reduced motion and verify the header, hero scene, report replay, and section reveals remain readable and static.

- [ ] **Step 7: Apply only concrete audit fixes and rerun affected checks**

For every finding, record `file:line`, patch the smallest owning component, rerun its focused Bun test, then rerun lint and build. Do not add new features during audit cleanup.

- [ ] **Step 8: Check the final diff and commit verification fixes**

```bash
rtk git diff --check
rtk git status --short
rtk git add -A apps/marketing
rtk proxy git commit -m "fix(marketing): polish landing accessibility and responsive behavior"
```

If the audit produces no source changes, skip the final commit and record that verification completed without follow-up fixes.
