# V3 Clinical Studio Landing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild `/v3` as an autonomous Clinical Studio landing that preserves Biume’s existing animal-osteopath workflow while replacing the current visual language and motion system.

**Architecture:** Keep `/v3` server-rendered and self-contained. `V3Landing` remains the composition entry point; small presentational sections and static demo data live together in `components/v3/v3-landing.tsx`, while all variant-specific tokens, responsive layout and CSS animations stay in `app/v3/v3.css`. No API, client state, new dependency or product-route change is required.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS v4, Lucide React, native CSS animations, Bun test.

---

## File structure

- Modify: `apps/marketing/app/v3/page.tsx` — retain the route and `noindex` metadata, revise only copy if it no longer reflects the new hero.
- Modify: `apps/marketing/components/v3/v3-landing.tsx` — replace the existing V3 composition with the Clinical Studio sections and their static display data.
- Modify: `apps/marketing/app/v3/v3.css` — replace V3 tokens and add the scan, reveal and horizontal-journey effects without touching global styles.
- Create: `apps/marketing/__tests__/v3-clinical-studio.test.tsx` — render the route and lock in the V3 claims, conversion URLs, access hooks and motion contract.

### Task 1: Lock down the V3 route contract

**Files:**
- Create: `apps/marketing/__tests__/v3-clinical-studio.test.tsx`
- Modify: `apps/marketing/app/v3/page.tsx:7-16`

- [ ] **Step 1: Write the failing route test**

```tsx
import { describe, expect, test } from "bun:test";

import V3Page, { metadata } from "../app/v3/page";
import { renderWithLandingImageConfig, textOnly } from "./landing-test-utils";

describe("V3 Clinical Studio landing", () => {
  test("keeps the route private to experiments", () => {
    expect(metadata.robots).toEqual({ index: false, follow: false });
    expect(metadata.title).toContain("Biume");
  });

  test("keeps the approved practitioner workflow and conversion links", () => {
    const html = renderWithLandingImageConfig(<V3Page />);
    const content = textOnly(html);

    expect(content).toContain("Vos notes gardent votre regard.");
    expect(content).toContain("Vous relisez, adaptez et validez");
    expect(content).toContain("ostéopathes animaliers indépendants");
    expect(html).toContain('href="/signup"');
    expect(html).toContain('href="/signin"');
    expect(html).toContain('data-conversion="v3-hero-signup"');
    expect(html).toContain('data-conversion="v3-pricing-signup"');
    expect(html).not.toContain("diagnostic");
    expect(html).not.toContain("guéri");
  });
});
```

- [ ] **Step 2: Run the test to establish the baseline**

Run: `bun test apps/marketing/__tests__/v3-clinical-studio.test.tsx`

Expected: the assertions documenting the new Clinical Studio route fail until the landing copy and structure are rebuilt.

- [ ] **Step 3: Keep the route boundary explicit**

Ensure `apps/marketing/app/v3/page.tsx` remains a small server component with the following route shape; do not import any design or product document.

```tsx
import type { Metadata } from "next";

import { V3Landing } from "../../components/v3/v3-landing";

import "./v3.css";

export const metadata: Metadata = {
  title: "Biume — De vos notes au propriétaire",
  description:
    "Une variante de landing Biume : des observations de séance, une préparation claire, puis votre validation.",
  robots: { index: false, follow: false },
};

export default function V3Page() {
  return <V3Landing />;
}
```

- [ ] **Step 4: Re-run the route test**

Run: `bun test apps/marketing/__tests__/v3-clinical-studio.test.tsx`

Expected: it may still fail on the hero assertions; the metadata assertion passes.

- [ ] **Step 5: Commit the route contract**

```bash
git add apps/marketing/app/v3/page.tsx apps/marketing/__tests__/v3-clinical-studio.test.tsx
git commit -m "test(marketing): define v3 clinical studio contract"
```

### Task 2: Recompose the landing around the Clinical Studio narrative

**Files:**
- Modify: `apps/marketing/components/v3/v3-landing.tsx:1-460`
- Test: `apps/marketing/__tests__/v3-clinical-studio.test.tsx`

- [ ] **Step 1: Extend the failing test with the three required journey stages**

```tsx
test("shows the note-to-validation journey as three labelled stages", () => {
  const html = renderWithLandingImageConfig(<V3Page />);

  for (const label of ["01 — Observer", "02 — Préparer", "03 — Valider"]) {
    expect(html).toContain(label);
  }

  expect(html).toContain('id="fonctionnement"');
  expect(html).toContain('aria-label="Parcours de la note au compte rendu"');
});
```

- [ ] **Step 2: Run the focused test**

Run: `bun test apps/marketing/__tests__/v3-clinical-studio.test.tsx`

Expected: FAIL because the existing journey does not expose the Clinical Studio stage labels or landmark.

- [ ] **Step 3: Replace the current section list with static, bounded display data and fonts**

At the top of `v3-landing.tsx`, declare the only workflow content used by the page. Keep it static so the route stays server-rendered and no claim extends beyond the approved scope.

```tsx
import { Fraunces, Instrument_Sans } from "next/font/google";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-v3-display",
  display: "swap",
});

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-v3-sans",
  display: "swap",
});

const journeyStages = [
  {
    id: "observe",
    label: "01 — Observer",
    title: "Votre observation reste le point de départ.",
    detail: "Dictée ou note courte : vous posez les éléments de la séance pendant qu’ils sont encore précis.",
    sample: "Mobilité plus libre à droite. Marche douce aujourd’hui.",
  },
  {
    id: "prepare",
    label: "02 — Préparer",
    title: "Biume rend le message lisible.",
    detail: "Une base de compte rendu claire pour le propriétaire, construite à partir de votre regard métier.",
    sample: "Luma a retrouvé plus de liberté dans ses mouvements.",
  },
  {
    id: "validate",
    label: "03 — Valider",
    title: "La dernière décision vous appartient.",
    detail: "Vous relisez, adaptez et choisissez le moment de l’envoi. Rien ne part sans vous.",
    sample: "Votre version est prête à être validée.",
  },
] as const;
```

- [ ] **Step 4: Implement the page sections with semantic landmarks**

Use the above data in a `CareJourney` component and keep the page composition in this exact order.

```tsx
export function V3Landing() {
  return (
    <div className={`${fraunces.variable} ${instrumentSans.variable} v3 min-h-[100dvh] overflow-x-clip`}>
      <V3Header />
      <main id="contenu" tabIndex={-1}>
        <ClinicalHero />
        <CareJourney />
        <ProductWorkbench />
        <ControlProof />
        <PricingPanel />
        <V3Close />
      </main>
      <V3Footer />
    </div>
  );
}
```

`CareJourney` must render `<section id="fonctionnement" aria-label="Parcours de la note au compte rendu">`, map `journeyStages` to articles, and use each stage `id` as its React key. Preserve the existing signup/signin URLs through `webAppPath`, `data-conversion` attributes, Biume logo image, footer, pricing and calendar demo URL.

- [ ] **Step 5: Run the V3 tests**

Run: `bun test apps/marketing/__tests__/v3-clinical-studio.test.tsx`

Expected: PASS for the content and route contract.

- [ ] **Step 6: Commit the structural rewrite**

```bash
git add apps/marketing/components/v3/v3-landing.tsx apps/marketing/__tests__/v3-clinical-studio.test.tsx
git commit -m "feat(marketing): compose v3 clinical studio landing"
```

### Task 3: Implement the distinct visual system and intentional motion

**Files:**
- Modify: `apps/marketing/app/v3/v3.css:1-360`
- Modify: `apps/marketing/components/v3/v3-landing.tsx:1-460`
- Test: `apps/marketing/__tests__/v3-clinical-studio.test.tsx`

- [ ] **Step 1: Add a failing source-level test for the V3 motion contract**

```tsx
test("uses the Clinical Studio scan effects without a reduced-motion override", async () => {
  const css = await Bun.file(
    new URL("../app/v3/v3.css", import.meta.url),
  ).text();

  expect(css).toContain("@keyframes v3-scan");
  expect(css).toContain("@keyframes v3-reveal");
  expect(css).toContain(".v3-journey-track");
  expect(css).not.toContain("prefers-reduced-motion");
});
```

- [ ] **Step 2: Run the focused motion test**

Run: `bun test apps/marketing/__tests__/v3-clinical-studio.test.tsx`

Expected: FAIL because the scan and reveal keyframes do not exist yet (and the old reduced-motion media query is still present).

- [ ] **Step 3: Replace the V3 tokens and add the effect primitives**

Put the colour and motion contract at the top of `v3.css`. Keep all selectors V3-prefixed and use CSS instead of a new animation package.

```css
.v3 {
  --v3-paper: #efeee7;
  --v3-ink: #151611;
  --v3-signal: #b6ff2c;
  --v3-mist: #d8d8ce;
  --v3-line: #b9b9ac;
  --v3-panel: #f8f8f1;
  --v3-ease: cubic-bezier(0.16, 1, 0.3, 1);
  background: var(--v3-paper);
  color: var(--v3-ink);
}

.v3-scan-frame { position: relative; overflow: hidden; }
.v3-scan-frame::after {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent 0 42%, rgb(182 255 44 / 0.72) 50%, transparent 58%);
  content: "";
  mix-blend-mode: multiply;
  pointer-events: none;
  transform: translateX(-115%);
  animation: v3-scan 1.25s 520ms var(--v3-ease) both;
}

@keyframes v3-scan {
  to { transform: translateX(115%); }
}

@keyframes v3-reveal {
  from { clip-path: inset(0 100% 0 0); transform: translateY(0.35em); }
  to { clip-path: inset(0); transform: translateY(0); }
}
```

Remove the full `@media (prefers-reduced-motion: reduce)` block. The approved interaction contract intentionally retains V3 motion at every preference setting.

- [ ] **Step 4: Add responsive journey geometry and non-shifting interactive states**

```css
.v3-journey-track {
  display: grid;
  grid-auto-columns: minmax(18rem, 31rem);
  grid-auto-flow: column;
  gap: 1px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  background: var(--v3-ink);
}

.v3-journey-card {
  min-height: 28rem;
  scroll-snap-align: start;
  background: var(--v3-panel);
  padding: clamp(1.5rem, 4vw, 3rem);
  transition: background-color 180ms ease, color 180ms ease, box-shadow 180ms ease;
}

.v3-journey-card:hover {
  background: var(--v3-signal);
  box-shadow: inset 0 0 0 1px var(--v3-ink);
}

@media (max-width: 767px) {
  .v3-journey-track { grid-auto-flow: row; grid-auto-columns: auto; overflow: visible; scroll-snap-type: none; }
  .v3-journey-card { min-height: 0; }
}
```

Give the hero preview the classes `v3-scan-frame` and `v3-product-preview`; give the journey wrapper `v3-journey-track` and each stage article `v3-journey-card`. Use `:focus-visible` outlines on all links and buttons. Do not use transform scale on cards or controls, so hover feedback never changes surrounding layout.

- [ ] **Step 5: Run the V3 tests**

Run: `bun test apps/marketing/__tests__/v3-clinical-studio.test.tsx`

Expected: PASS, including the explicit absence of `prefers-reduced-motion` in V3 CSS.

- [ ] **Step 6: Commit the visual and motion system**

```bash
git add apps/marketing/app/v3/v3.css apps/marketing/components/v3/v3-landing.tsx apps/marketing/__tests__/v3-clinical-studio.test.tsx
git commit -m "feat(marketing): add v3 clinical studio motion"
```

### Task 4: Verify the route in the marketing application

**Files:**
- Modify: `apps/marketing/components/v3/v3-landing.tsx`
- Modify: `apps/marketing/app/v3/v3.css`
- Test: `apps/marketing/__tests__/v3-clinical-studio.test.tsx`

- [ ] **Step 1: Run the targeted V3 test suite**

Run: `bun test apps/marketing/__tests__/v3-clinical-studio.test.tsx`

Expected: PASS with both metadata/content assertions and the V3 CSS motion contract.

- [ ] **Step 2: Run marketing lint**

Run: `bun --filter @biume/marketing lint`

Expected: exit code 0 with no lint errors in the V3 route, component or test.

- [ ] **Step 3: Run the production build**

Run: `bun --filter @biume/marketing build`

Expected: exit code 0 and a generated `/v3` route.

- [ ] **Step 4: Inspect local responsive layouts**

Run: `bun --filter @biume/marketing dev`

Expected: the server announces a local URL. Inspect `/v3` at 375 px, 768 px, 1024 px and 1440 px: the journey stacks below 768 px, no viewport has horizontal document overflow, every CTA has a visible focus state, the scan enters over the hero panel, and the signup/signin links resolve to their existing app URLs.

- [ ] **Step 5: Commit the responsive verification adjustments**

```bash
git add apps/marketing/app/v3/page.tsx apps/marketing/components/v3/v3-landing.tsx apps/marketing/app/v3/v3.css apps/marketing/__tests__/v3-clinical-studio.test.tsx
git commit -m "fix(marketing): refine v3 clinical studio responsiveness"
```
