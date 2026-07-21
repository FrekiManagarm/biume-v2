# After dark orbit motion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn `/after-dark` into a high-variance, scroll-led SaaS landing where the relationship between observation, document, and follow-up is made physical through motion.

**Architecture:** Create isolated client Motion leaves for the hero approach, copper trajectory, document stack, and case relay. Keep `AfterDarkLanding` and the factual SaaS content server-rendered; they compose static copy and images into those leaves. No new animation dependency is required because `motion` is already in `apps/marketing/package.json`.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Tailwind CSS v4, Motion 12, Bun test runner.

---

## File structure

- Create: `apps/marketing/components/prototypes/after-dark-orbit-motion.tsx` — isolated client components for the orbital motion sequences.
- Create: `apps/marketing/components/prototypes/after-dark-orbit-motion.test.tsx` — static render and source-policy coverage for the new leaves.
- Modify: `apps/marketing/components/prototypes/prototype-landings.tsx` — composes the orbital hero and transitions into the existing page.
- Modify: `apps/marketing/components/prototypes/prototype-saas-sections.tsx` — replaces static method/document/use-case treatment with orbital sequences while preserving anchors and factual content.
- Modify: `apps/marketing/components/prototypes/prototype-saas-sections.test.tsx` — locks the orbital attributes alongside the current route/anchor checks.

### Task 1: Add isolated orbital motion leaves

**Files:**
- Create: `apps/marketing/components/prototypes/after-dark-orbit-motion.tsx`
- Create: `apps/marketing/components/prototypes/after-dark-orbit-motion.test.tsx`

- [ ] **Step 1: Write the failing render and policy tests**

```tsx
import { expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import { OrbitCaseRelay, OrbitDocumentStack, OrbitTrajectory } from "./after-dark-orbit-motion";

test("renders the trajectory stages and the orbital sequence markers", () => {
  const html = renderToStaticMarkup(
    <OrbitTrajectory stages={["Observer", "Clarifier", "Transmettre", "Suivre"]}>
      <p>Le texte de méthode reste lisible.</p>
    </OrbitTrajectory>,
  );

  expect(html).toContain('data-orbit-trajectory="true"');
  expect(html).toContain("Observer");
  expect(html).toContain("Suivre");
});

test("uses only motion-safe scroll primitives", async () => {
  const source = await Bun.file("apps/marketing/components/prototypes/after-dark-orbit-motion.tsx").text();
  expect(source).toContain("useScroll");
  expect(source).not.toContain("addEventListener(\"scroll\"");
  expect(source).not.toContain("useReducedMotion");
});
```

- [ ] **Step 2: Run the test to verify the new module is missing**

Run: `bun test apps/marketing/components/prototypes/after-dark-orbit-motion.test.tsx`

Expected: FAIL with a module-not-found error for `after-dark-orbit-motion`.

- [ ] **Step 3: Implement the motion leaves in one client module**

```tsx
"use client";

import { domAnimation, LazyMotion, m, useScroll, useSpring, useTransform } from "motion/react";
import type { ReactNode } from "react";
import { useRef } from "react";

const easeOut = [0.16, 1, 0.3, 1] as const;
const orbitSpring = { stiffness: 150, damping: 24, mass: 0.45 };

export function OrbitTrajectory({ stages, children }: { stages: readonly string[]; children: ReactNode }) {
  const target = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target, offset: ["start 80%", "end 35%"] });
  const pathLength = useSpring(scrollYProgress, orbitSpring);

  return (
    <LazyMotion features={domAnimation} strict>
      <section ref={target} data-orbit-trajectory="true" className="relative overflow-clip">
        <m.svg aria-hidden="true" viewBox="0 0 1000 320" className="pointer-events-none absolute inset-x-0 top-0 hidden h-full w-full text-[#ef9b70] md:block">
          <m.path d="M0 235 C164 54 316 307 510 142 S770 34 1000 198" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ pathLength }} />
        </m.svg>
        <ol className="relative">{stages.map((stage, index) => <m.li key={stage} whileInView={{ x: index % 2 ? 20 : -20, opacity: 1 }} initial={{ opacity: 0.18 }} viewport={{ once: true, amount: 0.6 }} transition={{ duration: 0.42, delay: index * 0.06, ease: easeOut }}>{stage}</m.li>)}</ol>
        {children}
      </section>
    </LazyMotion>
  );
}
```

Add `OrbitHeroMedia`, `OrbitDocumentStack`, and `OrbitCaseRelay` to the same module. Each must own a local `useScroll` target; use `y`, `scale`, `rotate`, `opacity`, and `layout` only. `OrbitDocumentStack` uses the existing three factual document texts, and `OrbitCaseRelay` receives the factual use cases as props. Do not use `useState`, global state, timers, manual scroll listeners, CSS gradients, extra images, or a third-party package.

- [ ] **Step 4: Run the new tests**

Run: `bun test apps/marketing/components/prototypes/after-dark-orbit-motion.test.tsx`

Expected: PASS with both the render and source-policy tests green.

- [ ] **Step 5: Commit the motion primitives**

```bash
git add apps/marketing/components/prototypes/after-dark-orbit-motion.tsx apps/marketing/components/prototypes/after-dark-orbit-motion.test.tsx
git commit -m "feat(marketing): add after dark orbital motion primitives"
```

### Task 2: Compose the orbital scroll through the dark landing

**Files:**
- Modify: `apps/marketing/components/prototypes/prototype-landings.tsx`
- Modify: `apps/marketing/components/prototypes/prototype-saas-sections.tsx`
- Modify: `apps/marketing/components/prototypes/prototype-saas-sections.test.tsx`

- [ ] **Step 1: Extend the existing landing test with a failing orbital contract**

```tsx
test("keeps the orbital scroll choreography in the dark route", () => {
  const html = renderToStaticMarkup(<AfterDarkLanding />);

  expect(html).toContain('data-orbit-hero="true"');
  expect(html).toContain('data-orbit-trajectory="true"');
  expect(html).toContain('data-orbit-documents="true"');
  expect(html).toContain('data-orbit-cases="true"');
});
```

- [ ] **Step 2: Run the test to verify the new choreography markers are absent**

Run: `bun test apps/marketing/components/prototypes/prototype-saas-sections.test.tsx`

Expected: FAIL because no orbital component is composed yet.

- [ ] **Step 3: Replace static visual rhythm with the approved orbital sequence**

In `prototype-landings.tsx`, replace the current hero `ParallaxMedia` wrapper with `OrbitHeroMedia`; preserve the real `after-dark-hero.webp`, the current dark overlay, heading, CTAs, and `min-h-[100dvh]`. Place a small copper sequence indicator inside the hero, not a second CTA or decorative badge.

```tsx
<OrbitHeroMedia className="absolute inset-0 -z-20">
  <Image src="/assets/images/prototypes/after-dark-hero.webp" alt="Une main de praticien posée sur l’épaule d’un cheval à la tombée du jour" fill priority sizes="100vw" className="object-cover object-[61%_center]" />
</OrbitHeroMedia>
```

In `prototype-saas-sections.tsx`, preserve the seven existing anchor IDs and factual copy but change their visual grouping:

```tsx
<OrbitTrajectory stages={["Observer", "Clarifier", "Transmettre", "Suivre"]}>
  <div className="mx-auto max-w-[1400px]">
    <h2>{SAAS_NARRATIVE_CONTENT.tension.title}</h2>
    <p>{SAAS_NARRATIVE_CONTENT.tension.body}</p>
  </div>
</OrbitTrajectory>

<OrbitDocumentStack />

<OrbitCaseRelay items={useCases} />
```

The implementation must keep comparison, pricing, and FAQ quieter: `whileInView` opacity/y reveals only, no sticky behavior. The desktop method/document/case composition may overlap through CSS grid and sticky placement; every sequence collapses to one normal-flow column below `md`. Do not add generic cards or a three-column card row.

- [ ] **Step 4: Run focused landing tests and lint**

Run: `bun test apps/marketing/components/prototypes/prototype-*.test.ts && bun test apps/marketing/components/prototypes/prototype-*.test.tsx && bun --filter @biume/marketing lint`

Expected: all prototype tests and the marketing linter pass.

- [ ] **Step 5: Commit the composed choreography**

```bash
git add apps/marketing/components/prototypes/prototype-landings.tsx apps/marketing/components/prototypes/prototype-saas-sections.tsx apps/marketing/components/prototypes/prototype-saas-sections.test.tsx
git commit -m "feat(marketing): choreograph after dark scroll journey"
```

### Task 3: Validate visual motion and responsive pacing

**Files:**
- Modify only if a verified issue appears: `after-dark-orbit-motion.tsx`, `prototype-landings.tsx`, or `prototype-saas-sections.tsx`.

- [ ] **Step 1: Build the marketing application**

Run: `bun --filter @biume/marketing build`

Expected: exit 0; build lists `/after-dark` and does not list `/laboratoire`.

- [ ] **Step 2: Inspect the production landing in a browser**

Run `bun x next start --port 3100` from `apps/marketing`, then inspect `http://localhost:3100/after-dark` at `1280×720` and `390×844`.

At desktop, scroll through hero, method, product, cases, pricing and FAQ. Confirm the hero image stays dominant, the copper trajectory progresses, the document stack and case relay visibly change with scroll, pricing/FAQ are calmer, and no new color appears. At mobile, confirm normal single-column reading, no clipped documents, no horizontal overflow, and working anchors/CTAs.

- [ ] **Step 3: Apply only verified visual fixes and run final checks**

Run: `bun test apps/marketing/components/prototypes/prototype-*.test.ts && bun test apps/marketing/components/prototypes/prototype-*.test.tsx && bun --filter @biume/marketing lint && bun --filter @biume/marketing build && git diff --check`

Expected: all commands pass. If browser QA exposed a scoped P0/P1/P2 issue, commit only the corrected prototype files:

```bash
git add apps/marketing/components/prototypes
git commit -m "fix(marketing): refine after dark orbital pacing"
```
