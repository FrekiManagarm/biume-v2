# Biume Marketing Soft Machine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the Biume marketing homepage as a vivid, product-led “soft machine” landing page that converts animal osteopaths to a free trial or free demonstration.

**Architecture:** Keep the Next.js App Router route and all factual SEO and conversion contracts. Build the homepage from focused Server Components, with three small Client Component islands for the hero choreography, notes-to-report progression and post-session flow. Scope the new Hanken Grotesk typography and design tokens to the homepage so secondary marketing routes retain their current visual behavior.

**Tech Stack:** Bun, Next.js 16, React 19, TypeScript, Tailwind CSS v4, `next/font`, `next/image`, `motion/react`, Bun tests.

## Global Constraints

- Work only in `apps/marketing` unless a root-level test or documentation file is explicitly named.
- Use Bun commands only.
- Preserve the Biume logo and the existing violet `#6B5AC8`, blue `#5D9BB8` and green `#2E9866` roles.
- Green means confirmed, sent or received. Do not use it as arbitrary decoration or as the pricing section background.
- Use Hanken Grotesk for homepage display, body and interface text. Reserve monospace for prices, dates and statuses only.
- Display letter spacing must never be tighter than `-0.04em`.
- Cards top out at 16 pixels radius; dominant media top out at 24 pixels; controls use 10 pixels; pill buttons are allowed.
- Preserve `webAppPath("/signup")`, `prefetch={false}`, the Cal.com demonstration URL and every existing footer destination.
- Preserve prices of `29,99 €` monthly and `24,99 €` per month with annual billing.
- Do not invent testimonials, customer logos, ratings, metrics, performance claims or urgency.
- Keep page content visible in server markup. Motion enhances content but never reveals content from an initially hidden state.
- Support WCAG 2.2 AA, keyboard navigation, 44-pixel targets and `prefers-reduced-motion`.
- Do not add a new animation, styling or state-management dependency.
- Do not use gradient text, decorative grids, glassmorphism, striped backgrounds, hand-drawn SVGs, repeated uppercase section kickers or side-stripe accent borders.
- Keep `experimental.inlineCss: true` in `apps/marketing/next.config.ts`.
- Do not manually edit generated files or unrelated marketing routes.

## File Structure

**Create:**

- `apps/marketing/public/assets/images/landing/soft-machine-hero.png`: original hero raster illustration.
- `apps/marketing/components/landing/landing-shell.tsx`: homepage token and font scope.
- `apps/marketing/components/landing/hero-mechanism.tsx`: client-only hero choreography.
- `apps/marketing/components/landing/practitioner-control.tsx`: practitioner decision proof.
- `apps/marketing/components/landing/follow-up-flow.tsx`: client-enhanced post-session sequence.
- `apps/marketing/components/landing/use-moments.tsx`: three factual use moments.
- `apps/marketing/__tests__/landing-foundation.test.tsx`: typography, token and shell contracts.
- `apps/marketing/__tests__/follow-up-flow.test.tsx`: control and post-session contracts.
- `apps/marketing/__tests__/use-moments.test.tsx`: factual use-moment contracts.

**Rewrite or modify:**

- `apps/marketing/app/layout.tsx`: load Hanken Grotesk as a scoped CSS variable.
- `apps/marketing/app/globals.css`: replace homepage-specific “carnet” styling with the soft-machine theme and motion system while preserving shared route styles.
- `apps/marketing/app/page.tsx`: assemble the seven approved homepage moments and preserve Service JSON-LD.
- `apps/marketing/app/opengraph-image.tsx`: align the social promise and palette with the new direction.
- `apps/marketing/components/landing/landing-header.tsx`: compact header and both conversion paths.
- `apps/marketing/components/landing/landing-hero.tsx`: server-rendered hero content and illustration.
- `apps/marketing/components/landing/report-transformation-demo.ts`: retain one factual shared transformation fixture.
- `apps/marketing/components/landing/report-transformation-story.tsx`: focused notes-to-report proof with one client enhancement.
- `apps/marketing/components/landing/pricing-decision.tsx`: remove the embedded control interlude and restyle the pricing decision.
- `apps/marketing/components/landing/pricing-selector.tsx`: retain accessible state and update visual classes.
- `apps/marketing/components/landing/landing-faq.tsx`: remove editorial typography and preserve native details.
- `apps/marketing/components/landing/final-cta.tsx`: use documentary imagery and both approved conversion paths.
- `apps/marketing/components/footer.tsx`: homepage-compatible color tokens without changing links.
- `apps/marketing/__tests__/home-landing.test.tsx`: new page assembly and SSR contract.
- `apps/marketing/__tests__/landing-hero.test.tsx`: new header and hero contract.
- `apps/marketing/__tests__/report-transformation-story.test.tsx`: new transformation contract.
- `apps/marketing/__tests__/pricing-decision.test.tsx`: updated pricing-only contract.
- `apps/marketing/__tests__/landing-close.test.tsx`: free-demo fallback in the final CTA.
- `apps/marketing/__tests__/opengraph-image.test.ts`: new social promise.

**Remove after replacement:**

- `apps/marketing/components/landing/product-proof.tsx`: superseded by `ReportTransformation` and `UseMoments`.
- `apps/marketing/__tests__/product-proof.test.tsx`: superseded by focused transformation and use-moment tests.

---

### Task 1: Produce the Original Soft-Machine Hero Asset

**Files:**

- Create: `apps/marketing/public/assets/images/landing/soft-machine-hero.png`

**Interfaces:**

- Consumes: color roles from `apps/marketing/DESIGN.md` and the image brief in the approved design spec.
- Produces: `/assets/images/landing/soft-machine-hero.png`, used by `LandingHero` with a wide responsive crop.

- [ ] **Step 1: Generate the raster illustration**

Use the repository image generation skill with this exact prompt:

```text
Wide premium three-dimensional abstract illustration for Biume, a French software product for animal osteopaths. Show a calm “soft machine” transforming one loose note-shaped object on the left into a structured document-shaped object in the center, then into one small confirmed follow-up signal on the right. Tactile molded materials, precise soft geometry, quiet physical depth, contemporary product-art direction, wide 16:10 composition with breathing room around every object. Use Biume decision violet #6B5AC8 for active mechanisms, connection blue #5D9BB8 for the path between objects, and validation green #2E9866 only on the final confirmed signal. Neutral off-white #F7F7F4 background and deep anthracite #202024 structural details. No text, no letters, no numbers, no logo, no people, no animals, no medical symbols, no robots, no screens, no glowing AI orb, no tubes, no colored balls, no green hills, no funnels, no imitation of Clay artwork, no hand-drawn or sketch style. Realistic soft studio lighting, polished but not glossy, crisp edges, accessible contrast, original composition.
```

Save the selected result at the exact path above.

- [ ] **Step 2: Inspect the asset at original resolution**

Open the file with the image inspection tool. Reject and regenerate if it contains embedded text, logo-like marks, recognizable Clay contraptions, broken geometry, unexplained green decoration or an unclear left-to-right transformation.

- [ ] **Step 3: Verify asset dimensions and size**

Run:

```bash
test -s apps/marketing/public/assets/images/landing/soft-machine-hero.png
sips -g pixelWidth -g pixelHeight apps/marketing/public/assets/images/landing/soft-machine-hero.png
du -h apps/marketing/public/assets/images/landing/soft-machine-hero.png
```

Expected: file exists; width is at least 1400 pixels; height is at least 850 pixels. If the PNG exceeds 3 MB, optimize it without changing visible dimensions before continuing.

- [ ] **Step 4: Commit the approved asset**

```bash
git add apps/marketing/public/assets/images/landing/soft-machine-hero.png
git commit -m "feat(marketing): add soft machine hero artwork"
```

---

### Task 2: Establish the Homepage Font, Tokens and Shell

**Files:**

- Create: `apps/marketing/components/landing/landing-shell.tsx`
- Create: `apps/marketing/__tests__/landing-foundation.test.tsx`
- Modify: `apps/marketing/app/layout.tsx`
- Modify: `apps/marketing/app/globals.css`

**Interfaces:**

- Produces: `LandingShell({ children }: { children: ReactNode })`, the `--font-hanken` CSS variable and `.soft-machine-theme` semantic tokens consumed by every later component.

- [ ] **Step 1: Write the failing foundation test**

Create `apps/marketing/__tests__/landing-foundation.test.tsx`:

```tsx
import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import { LandingShell } from "../components/landing/landing-shell";

describe("soft machine landing foundation", () => {
  test("scopes the approved theme and font to the homepage", () => {
    const html = renderToStaticMarkup(
      <LandingShell><main>Contenu</main></LandingShell>,
    );

    expect(html).toContain("soft-machine-theme");
    expect(html).toContain("font-[family-name:var(--font-hanken)]");
    expect(html).toContain("Contenu");
  });

  test("defines semantic colors, restrained radii and reduced motion", async () => {
    const css = await Bun.file(new URL("../app/globals.css", import.meta.url)).text();

    expect(css).toMatch(/--machine-violet:\s*#6b5ac8;/i);
    expect(css).toMatch(/--machine-blue:\s*#5d9bb8;/i);
    expect(css).toMatch(/--machine-green:\s*#2e9866;/i);
    expect(css).toMatch(/--machine-surface-radius:\s*1rem;/);
    expect(css).toMatch(/--machine-media-radius:\s*1\.5rem;/);
    expect(css).toContain("prefers-reduced-motion: reduce");
    expect(css).not.toContain("background-clip: text");
    expect(css).not.toContain("repeating-linear-gradient");
  });

  test("loads Hanken Grotesk through next font", async () => {
    const layout = await Bun.file(new URL("../app/layout.tsx", import.meta.url)).text();

    expect(layout).toContain('import { Hanken_Grotesk } from "next/font/google"');
    expect(layout).toContain('variable: "--font-hanken"');
  });
});
```

- [ ] **Step 2: Run the test and verify failure**

Run:

```bash
bun test apps/marketing/__tests__/landing-foundation.test.tsx
```

Expected: FAIL because `landing-shell.tsx` does not exist and Hanken Grotesk is not loaded.

- [ ] **Step 3: Add the scoped font and shell**

Update `apps/marketing/app/layout.tsx` to load the variable without changing secondary-page classes:

```tsx
import type { Metadata } from "next";
import { Hanken_Grotesk } from "next/font/google";

import { rootMetadata } from "../lib/metadata";
import "./globals.css";

const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken",
  display: "swap",
});

export const metadata: Metadata = rootMetadata;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={`${hanken.variable} antialiased`} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
```

Create `apps/marketing/components/landing/landing-shell.tsx`:

```tsx
import type { ReactNode } from "react";

export function LandingShell({ children }: { children: ReactNode }) {
  return (
    <div className="soft-machine-theme min-h-dvh overflow-x-clip bg-[color:var(--machine-canvas)] font-[family-name:var(--font-hanken)] text-[color:var(--machine-ink)] selection:bg-[color:var(--machine-violet-soft)]">
      {children}
    </div>
  );
}
```

- [ ] **Step 4: Replace only the homepage-specific theme block**

Keep `.landing-theme` and all shared route styles. Replace the old `.carnet-theme` block and its homepage-only helpers with:

```css
.soft-machine-theme {
  --background: #f7f7f4;
  --foreground: #1d1d21;
  --card: #fdfdfb;
  --card-foreground: #1d1d21;
  --muted: #ecece7;
  --muted-foreground: #696970;
  --border: #deded7;
  --primary: #6b5ac8;
  --primary-foreground: #ffffff;
  --secondary: #5d9bb8;
  --secondary-foreground: #ffffff;
  --ring: #6b5ac8;
  --machine-canvas: #f7f7f4;
  --machine-surface: #fdfdfb;
  --machine-muted-surface: #ecece7;
  --machine-ink: #1d1d21;
  --machine-muted: #696970;
  --machine-line: #deded7;
  --machine-anthracite: #202024;
  --machine-violet: #6b5ac8;
  --machine-violet-soft: #eeebfb;
  --machine-blue: #5d9bb8;
  --machine-blue-soft: #e8f1f5;
  --machine-green: #2e9866;
  --machine-green-ink: #21734d;
  --machine-green-soft: #e7f3ed;
  --machine-control-radius: 0.625rem;
  --machine-surface-radius: 1rem;
  --machine-media-radius: 1.5rem;
  --machine-ease: cubic-bezier(0.16, 1, 0.3, 1);
  color-scheme: light;
  isolation: isolate;
}

.machine-action {
  transition: transform 180ms var(--machine-ease), background-color 180ms ease,
    border-color 180ms ease, color 180ms ease;
}

.machine-action:hover { transform: translateY(-2px); }
.machine-action:active { transform: scale(0.98); }

@media (prefers-reduced-motion: reduce) {
  .machine-action { transition: none; }
  .machine-action:hover, .machine-action:active { transform: none; }
  html:focus-within { scroll-behavior: auto; }
}
```

- [ ] **Step 5: Run the foundation test**

Run:

```bash
bun test apps/marketing/__tests__/landing-foundation.test.tsx
```

Expected: 3 tests PASS.

- [ ] **Step 6: Commit the foundation**

```bash
git add apps/marketing/app/layout.tsx apps/marketing/app/globals.css apps/marketing/components/landing/landing-shell.tsx apps/marketing/__tests__/landing-foundation.test.tsx
git commit -m "feat(marketing): establish soft machine landing foundation"
```

---

### Task 3: Build the Compact Header and Demonstrative Hero

**Files:**

- Create: `apps/marketing/components/landing/hero-mechanism.tsx`
- Rewrite: `apps/marketing/components/landing/landing-header.tsx`
- Rewrite: `apps/marketing/components/landing/landing-hero.tsx`
- Rewrite: `apps/marketing/__tests__/landing-hero.test.tsx`
- Modify: `apps/marketing/app/globals.css`

**Interfaces:**

- Consumes: `soft-machine-hero.png`, `webAppPath("/signup")`, and `https://cal.com/mathieu-chambaud-biume`.
- Produces: `LandingHeader`, `LandingHero` and the client island `HeroMechanism`.

- [ ] **Step 1: Replace the hero test with the new contract**

Write tests that render `LandingHeader` and `LandingHero`, then assert:

```tsx
expect(text).toContain("De vos notes au propriétaire, sans perdre votre regard métier.");
expect(text).toContain("15 jours d’essai");
expect(text).toContain("Sans carte bancaire");
expect(text).toContain("Rien ne part sans vous");
expect(html).toContain("soft-machine-hero.png");
expect(html).toContain('data-conversion="hero-signup"');
expect(html).toContain('data-conversion="hero-demo"');
expect(html).toContain(`href="${webAppPath("/signup")}"`);
expect(html).toContain('href="https://cal.com/mathieu-chambaud-biume"');
expect(html).toContain("data-hero-mechanism");
expect(html).not.toMatch(exactZeroOpacity);
expect(html).not.toContain("visibility:hidden");
```

Add a source test asserting that only `hero-mechanism.tsx` has `"use client"` and imports `motion/react`; `landing-hero.tsx` stays a Server Component.

- [ ] **Step 2: Run the hero test and verify failure**

Run:

```bash
bun test apps/marketing/__tests__/landing-hero.test.tsx
```

Expected: FAIL on the new promise, demo conversion and hero asset.

- [ ] **Step 3: Implement the client enhancement**

Create `hero-mechanism.tsx` with visible default content and reduced-motion handling:

```tsx
"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

export function HeroMechanism({ children }: { children: ReactNode }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      data-hero-mechanism
      initial={reduceMotion ? false : { scale: 1.015 }}
      animate={{ scale: 1 }}
      transition={{ duration: reduceMotion ? 0 : 0.72, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
```

Do not add `opacity: 0` to any initial state.

- [ ] **Step 4: Implement the server-rendered hero**

Rewrite `landing-hero.tsx` around this structure:

```tsx
<section data-landing-section="hero" className="px-4 pb-16 pt-12 sm:px-6 lg:px-8 lg:pb-24 lg:pt-20">
  <div className="mx-auto max-w-[90rem] text-center">
    <h1 className="mx-auto max-w-[15ch] text-balance text-[clamp(3rem,7vw,6rem)] font-bold leading-[0.92] tracking-[-0.035em]">
      De vos notes au propriétaire, sans perdre votre regard métier.
    </h1>
    <p className="mx-auto mt-6 max-w-[62ch] text-pretty text-base leading-7 text-[color:var(--machine-muted)] md:text-lg md:leading-8">
      Biume organise vos observations en un compte rendu clair, puis vous aide à garder le fil après la séance. Vous relisez et décidez de chaque partage.
    </p>
    <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
      <Link href={webAppPath("/signup")} prefetch={false} data-conversion="hero-signup" className="machine-action inline-flex min-h-12 items-center justify-center rounded-full bg-[color:var(--machine-violet)] px-6 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--machine-violet)]">
        Essayer gratuitement
      </Link>
      <Link href="https://cal.com/mathieu-chambaud-biume" target="_blank" rel="noopener noreferrer" data-conversion="hero-demo" className="machine-action inline-flex min-h-12 items-center justify-center rounded-full border border-[color:var(--machine-line)] bg-[color:var(--machine-surface)] px-6 text-sm font-semibold text-[color:var(--machine-ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--machine-violet)]">
        Demander une démo
      </Link>
    </div>
    <HeroMechanism>
      <div className="relative mx-auto mt-12 aspect-[16/10] w-full max-w-5xl overflow-hidden rounded-[var(--machine-media-radius)] bg-[color:var(--machine-violet-soft)]">
        <Image src="/assets/images/landing/soft-machine-hero.png" alt="Un mécanisme abstrait transforme des notes en document structuré puis en suivi validé" fill priority sizes="(min-width: 1280px) 1024px, 92vw" className="object-cover" />
      </div>
    </HeroMechanism>
    <ul className="mx-auto mt-8 flex max-w-3xl flex-col border-y border-[color:var(--machine-line)] sm:flex-row">
      {['15 jours d’essai', 'Sans carte bancaire', 'Rien ne part sans vous'].map((item) => <li key={item} className="flex min-h-12 flex-1 items-center justify-center px-4 py-3 text-sm font-semibold sm:border-r sm:last:border-r-0">{item}</li>)}
    </ul>
  </div>
</section>
```

Import `Image`, `Link`, `webAppPath` and `HeroMechanism` at the top of the file. Keep both CTA labels on one line at 320 pixels.

- [ ] **Step 5: Rewrite the header**

Keep the existing navigation labels and mobile native `<details>`, but:

- replace every `--carnet-*` token with the corresponding `--machine-*` token;
- add a desktop `Demander une démo` link before `Essayer gratuitement`;
- keep two responsive signup anchors with `data-conversion="header-signup"`;
- give the mobile menu a fixed or portal-safe surface if visual verification shows clipping;
- keep every target at `min-h-11` or larger.

- [ ] **Step 6: Run the hero tests**

Run:

```bash
bun test apps/marketing/__tests__/landing-hero.test.tsx
```

Expected: PASS with server-visible content and one client island.

- [ ] **Step 7: Commit the header and hero**

```bash
git add apps/marketing/components/landing/hero-mechanism.tsx apps/marketing/components/landing/landing-header.tsx apps/marketing/components/landing/landing-hero.tsx apps/marketing/app/globals.css apps/marketing/__tests__/landing-hero.test.tsx
git commit -m "feat(marketing): build demonstrative soft machine hero"
```

---

### Task 4: Rebuild the Notes-to-Report Product Proof

**Files:**

- Modify: `apps/marketing/components/landing/report-transformation-demo.ts`
- Rewrite: `apps/marketing/components/landing/report-transformation-story.tsx`
- Rewrite: `apps/marketing/__tests__/report-transformation-story.test.tsx`
- Modify: `apps/marketing/app/globals.css`

**Interfaces:**

- Produces: `REPORT_TRANSFORMATION_DEMO` with `note`, `sections` and `ownerSummary`; `ReportTransformationStory({ demo })` with SSR-visible layers and one `motion/react` enhancement.

- [ ] **Step 1: Write the failing transformation contract**

The test must assert this exact visible sequence:

```tsx
for (const copy of [
  "Voyez vos notes prendre forme.",
  "Notes de séance",
  "Restriction thoracique gauche",
  "Biume organise",
  "Synthèse propriétaire",
  "La mobilité du thorax a été travaillée pendant la séance.",
  "Vous relisez",
  "Prêt à relire",
]) {
  expect(text).toContain(copy);
}
expect(html.match(/data-transformation-stage=/g)).toHaveLength(3);
expect(html).not.toMatch(exactZeroOpacity);
expect(html).not.toContain("visibility:hidden");
```

Add source assertions for `useReducedMotion`, `motion/react`, no perpetual repeat and no direct `window.addEventListener("scroll")`.

- [ ] **Step 2: Run the test and verify failure**

```bash
bun test apps/marketing/__tests__/report-transformation-story.test.tsx
```

Expected: FAIL on the new heading and stage markers.

- [ ] **Step 3: Normalize the shared fixture**

Export this stable shape from `report-transformation-demo.ts`:

```ts
export const REPORT_TRANSFORMATION_DEMO = {
  note: "Restriction thoracique gauche. Mobilité améliorée après travail. Conseiller du calme pendant 48 h.",
  sections: [
    { label: "Zone observée", value: "Thorax gauche" },
    { label: "Évolution", value: "Mobilité améliorée après le travail manuel" },
    { label: "Conseil", value: "Prévoir une activité calme pendant 48 heures" },
  ],
  ownerSummary:
    "La mobilité du thorax a été travaillée pendant la séance. Prévoyez une activité calme pendant les prochaines 48 heures.",
} as const;

export type ReportTransformationDemo = typeof REPORT_TRANSFORMATION_DEMO;
```

- [ ] **Step 4: Implement the transformation component**

Use this visible-first structure. Tailwind classes may be wrapped for readability, but preserve the markers and source order exactly:

```tsx
"use client";

import { motion, useReducedMotion } from "motion/react";

import type { ReportTransformationDemo } from "./report-transformation-demo";

export function ReportTransformationStory({ demo }: { demo: ReportTransformationDemo }) {
  const reduceMotion = useReducedMotion();

  return (
    <section id="produit" data-landing-section="transformation" className="scroll-mt-20 bg-[color:var(--machine-blue-soft)] px-4 py-16 sm:px-6 md:py-24 lg:px-8">
      <div className="mx-auto max-w-[90rem]">
        <h2 className="max-w-[14ch] text-balance text-[clamp(2.25rem,4.5vw,4.5rem)] font-bold leading-none tracking-[-0.03em]">Voyez vos notes prendre forme.</h2>
        <p className="mt-5 max-w-[65ch] text-pretty text-base leading-7 text-[color:var(--machine-muted)] md:text-lg">Le même regard métier, organisé pour être compris sans perdre sa précision.</p>
        <div className="mt-10 grid items-stretch gap-4 lg:grid-cols-[0.8fr_auto_1fr_auto_1.1fr]">
          <article data-transformation-stage="notes" className="rounded-[var(--machine-surface-radius)] bg-[color:var(--machine-anthracite)] p-6 text-white">
            <h3 className="text-lg font-semibold">Notes de séance</h3>
            <p className="mt-5 text-sm leading-6 text-white/75">{demo.note}</p>
          </article>
          <motion.div aria-hidden="true" initial={false} whileInView={{ scaleX: 1 }} style={{ scaleX: reduceMotion ? 1 : 0.4 }} viewport={{ once: true, amount: 0.6 }} className="hidden h-1 w-12 self-center rounded-full bg-[color:var(--machine-blue)] lg:block" />
          <article data-transformation-stage="organized" className="rounded-[var(--machine-surface-radius)] bg-[color:var(--machine-surface)] p-6">
            <h3 className="text-lg font-semibold">Biume organise</h3>
            <dl className="mt-5 space-y-4">{demo.sections.map((section) => <div key={section.label}><dt className="text-xs font-semibold text-[color:var(--machine-muted)]">{section.label}</dt><dd className="mt-1 text-sm leading-6">{section.value}</dd></div>)}</dl>
          </article>
          <motion.div aria-hidden="true" initial={false} whileInView={{ scaleX: 1 }} style={{ scaleX: reduceMotion ? 1 : 0.4 }} viewport={{ once: true, amount: 0.6 }} className="hidden h-1 w-12 self-center rounded-full bg-[color:var(--machine-blue)] lg:block" />
          <article data-transformation-stage="review" className="rounded-[var(--machine-surface-radius)] bg-[color:var(--machine-surface)] p-6">
            <div className="flex flex-wrap items-center justify-between gap-3"><h3 className="text-lg font-semibold">Synthèse propriétaire</h3><span className="rounded-full bg-[color:var(--machine-green-soft)] px-3 py-1.5 text-xs font-semibold text-[color:var(--machine-green-ink)]">Prêt à relire</span></div>
            <p className="mt-5 text-sm leading-6">{demo.ownerSummary}</p>
            <p className="mt-5 border-t border-[color:var(--machine-line)] pt-4 text-xs text-[color:var(--machine-muted)]">Vous relisez avant chaque partage.</p>
          </article>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Run the transformation tests**

```bash
bun test apps/marketing/__tests__/report-transformation-story.test.tsx
```

Expected: PASS and no hidden SSR content.

- [ ] **Step 6: Commit the product proof**

```bash
git add apps/marketing/components/landing/report-transformation-demo.ts apps/marketing/components/landing/report-transformation-story.tsx apps/marketing/app/globals.css apps/marketing/__tests__/report-transformation-story.test.tsx
git commit -m "feat(marketing): rebuild notes to report proof"
```

---

### Task 5: Add Practitioner Control and the Post-Session Flow

**Files:**

- Create: `apps/marketing/components/landing/practitioner-control.tsx`
- Create: `apps/marketing/components/landing/follow-up-flow.tsx`
- Create: `apps/marketing/__tests__/follow-up-flow.test.tsx`

**Interfaces:**

- Produces: `PractitionerControl()` as a Server Component and `FollowUpFlow()` as a reduced-motion-aware Client Component.

- [ ] **Step 1: Write the failing control and flow tests**

```tsx
const control = textOnly(renderToStaticMarkup(<PractitionerControl />));
expect(control).toContain("Biume prépare. Vous décidez.");
expect(control).toContain("Modifier");
expect(control).toContain("Reformuler");
expect(control).toContain("Supprimer");
expect(control).toContain("Partager après validation");

const flowHtml = renderToStaticMarkup(<FollowUpFlow />);
const flowText = textOnly(flowHtml);
expect(flowText).toContain("La séance se termine. Le fil continue.");
expect(flowText).toContain("Compte rendu envoyé");
expect(flowText).toContain("Retour à J+7");
expect(flowText).toContain("Timeline enrichie");
expect(flowHtml.match(/data-follow-up-step=/g)).toHaveLength(3);
expect(flowHtml).not.toMatch(exactZeroOpacity);
```

- [ ] **Step 2: Run the test and verify failure**

```bash
bun test apps/marketing/__tests__/follow-up-flow.test.tsx
```

Expected: FAIL because both components are missing.

- [ ] **Step 3: Implement `PractitionerControl`**

Create the Server Component with no card wrapper and no conversion CTA:

```tsx
const decisions = ["Modifier", "Reformuler", "Supprimer", "Partager après validation"] as const;

export function PractitionerControl() {
  return (
    <section data-landing-section="control" className="bg-[color:var(--machine-violet)] px-4 py-16 text-white sm:px-6 md:py-24 lg:px-8">
      <div className="mx-auto grid max-w-[90rem] gap-10 lg:grid-cols-[1fr_1.15fr] lg:items-end">
        <div><h2 className="max-w-[12ch] text-balance text-[clamp(2.5rem,5vw,5rem)] font-bold leading-[0.94] tracking-[-0.035em]">Biume prépare. Vous décidez.</h2><p className="mt-6 max-w-[56ch] text-base leading-7 text-white/75 md:text-lg">Chaque proposition reste modifiable. Rien n’est partagé tant que vous ne l’avez pas choisi.</p></div>
        <ul className="grid gap-3 sm:grid-cols-2">{decisions.map((decision) => <li key={decision} className="flex min-h-16 items-center gap-3 rounded-[var(--machine-control-radius)] bg-white/[0.12] px-4"><span aria-hidden="true" className="size-2 rounded-full bg-white/60" /><span className="font-semibold">{decision}</span></li>)}</ul>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Implement `FollowUpFlow`**

Create the client component with all copy in static markup:

```tsx
"use client";

import { motion, useReducedMotion } from "motion/react";

const steps = [
  { title: "Compte rendu envoyé", body: "Le propriétaire reçoit le document que vous avez validé.", confirmed: false },
  { title: "Retour à J+7", body: "Le prochain échange reste visible au bon moment.", confirmed: false },
  { title: "Timeline enrichie", body: "La séance et son suivi restent disponibles pour la prochaine consultation.", confirmed: true },
] as const;

export function FollowUpFlow() {
  const reduceMotion = useReducedMotion();
  return (
    <section id="comment-ca-marche" data-landing-section="follow-up" className="scroll-mt-20 bg-[color:var(--machine-anthracite)] px-4 py-16 text-white sm:px-6 md:py-24 lg:px-8">
      <div className="mx-auto max-w-[90rem]"><h2 className="max-w-[14ch] text-balance text-[clamp(2.25rem,4.5vw,4.5rem)] font-bold leading-none tracking-[-0.03em]">La séance se termine. Le fil continue.</h2><p className="mt-5 max-w-[60ch] text-base leading-7 text-white/70 md:text-lg">Le compte rendu, le prochain échange et l’historique de l’animal restent reliés.</p>
        <ol className="mt-10 grid gap-4 lg:grid-cols-3">{steps.map((step, index) => <motion.li key={step.title} data-follow-up-step={step.title} initial={reduceMotion ? false : { x: -8 }} whileInView={{ x: 0 }} viewport={{ once: true, amount: 0.55 }} transition={{ duration: reduceMotion ? 0 : 0.42, delay: reduceMotion ? 0 : index * 0.08, ease: [0.16, 1, 0.3, 1] }} className="rounded-[var(--machine-surface-radius)] bg-white/[0.07] p-6"><div className="flex items-center justify-between gap-3"><span className="font-mono text-xs text-white/55">0{index + 1}</span>{step.confirmed ? <span className="rounded-full bg-[color:var(--machine-green-soft)] px-2.5 py-1 text-xs font-semibold text-[color:var(--machine-green-ink)]">Confirmé</span> : null}</div><h3 className="mt-8 text-xl font-semibold">{step.title}</h3><p className="mt-3 text-sm leading-6 text-white/65">{step.body}</p></motion.li>)}</ol>
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Run the flow tests**

```bash
bun test apps/marketing/__tests__/follow-up-flow.test.tsx
```

Expected: PASS with all three steps visible in static markup.

- [ ] **Step 6: Commit the flow**

```bash
git add apps/marketing/components/landing/practitioner-control.tsx apps/marketing/components/landing/follow-up-flow.tsx apps/marketing/__tests__/follow-up-flow.test.tsx
git commit -m "feat(marketing): show practitioner control and follow-up flow"
```

---

### Task 6: Add Factual Use Moments and Simplify Pricing

**Files:**

- Create: `apps/marketing/components/landing/use-moments.tsx`
- Create: `apps/marketing/__tests__/use-moments.test.tsx`
- Rewrite: `apps/marketing/components/landing/pricing-decision.tsx`
- Modify: `apps/marketing/components/landing/pricing-selector.tsx`
- Rewrite: `apps/marketing/__tests__/pricing-decision.test.tsx`

**Interfaces:**

- Produces: `UseMoments()`, unchanged `billingOptions`, `PricingDecision()` and accessible `PricingSelector` behavior.

- [ ] **Step 1: Write the failing use-moment test**

```tsx
const html = renderWithLandingImageConfig(<UseMoments />);
const text = textOnly(html);

for (const copy of [
  "Trois moments où Biume fait la différence.",
  "Rendre le compte rendu lisible",
  "Préparer le suivi après la séance",
  "Retrouver le fil à la prochaine consultation",
]) expect(text).toContain(copy);

expect(html).toContain("hero-practitioner-horse.png");
expect(html.match(/data-use-moment=/g)).toHaveLength(3);
expect(html).not.toContain("+40%");
expect(html).not.toContain("témoignage");
```

- [ ] **Step 2: Write the revised pricing expectations**

Keep every existing value assertion for `billingOptions`, both `aria-pressed` states and the mounted `aria-live="polite"` container. Remove the expectation that `PricingDecision` contains `Biume prépare. Vous décidez.` because that content moved to its own component. Add:

```tsx
expect(text).toContain("Un prix simple pour prolonger chaque séance.");
expect(html).toContain("bg-[color:var(--machine-violet-soft)]");
expect(html).not.toContain("var(--machine-green-soft)");
```

- [ ] **Step 3: Run both tests and verify failure**

```bash
bun test apps/marketing/__tests__/use-moments.test.tsx apps/marketing/__tests__/pricing-decision.test.tsx
```

Expected: FAIL because `UseMoments` is missing and pricing still uses the old interlude.

- [ ] **Step 4: Implement `UseMoments`**

Create three visibly different compositions rather than equal cards:

```tsx
import Image from "next/image";

export function UseMoments() {
  return (
    <section data-landing-section="use-moments" className="px-4 py-16 sm:px-6 md:py-24 lg:px-8">
      <div className="mx-auto max-w-[90rem]"><h2 className="max-w-[16ch] text-balance text-[clamp(2.25rem,4.5vw,4.5rem)] font-bold leading-none tracking-[-0.03em]">Trois moments où Biume fait la différence.</h2>
        <div className="mt-12 space-y-4">
          <article data-use-moment="report" className="grid overflow-hidden rounded-[var(--machine-surface-radius)] bg-[color:var(--machine-surface)] lg:grid-cols-[1.15fr_0.85fr]"><div className="relative min-h-72"><Image src="/assets/images/landing/hero-practitioner-horse.png" alt="Une ostéopathe animalière accompagne un cheval pendant une séance" fill sizes="(min-width:1024px) 58vw, 100vw" className="object-cover" /></div><div className="flex flex-col justify-center p-6 md:p-10"><h3 className="text-2xl font-semibold tracking-[-0.025em]">Rendre le compte rendu lisible</h3><p className="mt-4 text-base leading-7 text-[color:var(--machine-muted)]">Gardez vos termes précis dans les notes, puis préparez une synthèse que le propriétaire peut relire après la séance.</p></div></article>
          <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]"><article data-use-moment="follow-up" className="rounded-[var(--machine-surface-radius)] bg-[color:var(--machine-blue-soft)] p-6 md:p-10"><h3 className="text-2xl font-semibold tracking-[-0.025em]">Préparer le suivi après la séance</h3><div className="mt-8 rounded-[var(--machine-control-radius)] bg-[color:var(--machine-surface)] p-4"><span className="font-mono text-xs text-[color:var(--machine-muted)]">J+7 · À PRÉPARER</span><p className="mt-3 text-sm leading-6">Faire le point sur le confort et l’évolution observée.</p></div></article><article data-use-moment="history" className="rounded-[var(--machine-surface-radius)] bg-[color:var(--machine-anthracite)] p-6 text-white md:p-10"><h3 className="text-2xl font-semibold tracking-[-0.025em]">Retrouver le fil à la prochaine consultation</h3><ol className="mt-8 space-y-4 border-l border-white/20 pl-5"><li><span className="font-mono text-xs text-white/50">12 MAI</span><p className="mt-1 text-sm">Séance et compte rendu finalisé</p></li><li><span className="font-mono text-xs text-white/50">19 MAI</span><p className="mt-1 text-sm">Suivi ajouté à la timeline</p></li></ol></article></div>
        </div>
      </div>
    </section>
  );
}
```

Do not add unsupported response, reminder-delivery or outcome claims.

- [ ] **Step 5: Refactor pricing without changing state logic**

Remove `data-control-interlude` and its heading from `pricing-decision.tsx`. Use the heading `Un prix simple pour prolonger chaque séance.` Place the selector and included list in a violet-soft section. Keep exactly one signup link with `data-conversion="pricing-signup"` and `prefetch={false}`.

In `pricing-selector.tsx`, replace `--carnet-*` token references with `--machine-*`. Keep `useState`, `aria-pressed`, the permanently mounted live region and the existing keyed inner price transition. Do not import Motion.

- [ ] **Step 6: Run the tests**

```bash
bun test apps/marketing/__tests__/use-moments.test.tsx apps/marketing/__tests__/pricing-decision.test.tsx
```

Expected: PASS.

- [ ] **Step 7: Commit use moments and pricing**

```bash
git add apps/marketing/components/landing/use-moments.tsx apps/marketing/components/landing/pricing-decision.tsx apps/marketing/components/landing/pricing-selector.tsx apps/marketing/__tests__/use-moments.test.tsx apps/marketing/__tests__/pricing-decision.test.tsx
git commit -m "feat(marketing): add use moments and simplify pricing"
```

---

### Task 7: Assemble the Homepage and Rebuild Its Close

**Files:**

- Modify: `apps/marketing/app/page.tsx`
- Modify: `apps/marketing/components/landing/landing-faq.tsx`
- Modify: `apps/marketing/components/landing/final-cta.tsx`
- Modify: `apps/marketing/components/footer.tsx`
- Modify: `apps/marketing/app/opengraph-image.tsx`
- Rewrite: `apps/marketing/__tests__/home-landing.test.tsx`
- Rewrite: `apps/marketing/__tests__/landing-close.test.tsx`
- Modify: `apps/marketing/__tests__/opengraph-image.test.ts`
- Remove: `apps/marketing/components/landing/product-proof.tsx`
- Remove: `apps/marketing/__tests__/product-proof.test.tsx`

**Interfaces:**

- Consumes: all components from Tasks 2 through 6.
- Produces: the final `/` homepage, factual Service JSON-LD and aligned social preview.

- [ ] **Step 1: Write the new homepage assembly test**

Render `<Home />` and assert these section markers occur once and in order:

```ts
const markers = [
  'data-landing-section="hero"',
  'data-landing-section="transformation"',
  'data-landing-section="control"',
  'data-landing-section="follow-up"',
  'data-landing-section="use-moments"',
  'data-landing-section="pricing"',
  'data-landing-section="faq-cta"',
] as const;
```

Assert the memorable line, both final conversions, both prices, five `data-faq-item` markers, unique IDs, working navigation anchors, Service JSON-LD and absence of the old `carnet-theme`, `ProductProof`, ratings, metrics, “hébergé en France” and automatic-send claims.

- [ ] **Step 2: Update the close test**

Preserve the five exact FAQ questions and answers. Replace the old “no competing demo” expectation with:

```tsx
expect(conversionAnchors(html, "final-signup")).toHaveLength(1);
expect(conversionAnchors(html, "final-demo")).toHaveLength(1);
expect(html).toContain(`href="${webAppPath("/signup")}"`);
expect(html).toContain('href="https://cal.com/mathieu-chambaud-biume"');
expect(html).toContain("practitioner-owner-animal.png");
```

- [ ] **Step 3: Run the page and close tests and verify failure**

```bash
bun test apps/marketing/__tests__/home-landing.test.tsx apps/marketing/__tests__/landing-close.test.tsx apps/marketing/__tests__/opengraph-image.test.ts
```

Expected: FAIL because the new components are not assembled and the final demo link is missing.

- [ ] **Step 4: Assemble `app/page.tsx`**

Use this exact order inside `LandingShell`:

```tsx
<LandingShell>
  <JsonLd data={serviceSchema} />
  <LandingHeader />
  <main id="contenu">
    <LandingHero />
    <ReportTransformationStory demo={REPORT_TRANSFORMATION_DEMO} />
    <PractitionerControl />
    <FollowUpFlow />
    <UseMoments />
    <PricingDecision />
    <section id="questions" data-landing-section="faq-cta" className="px-4 py-16 sm:px-6 md:py-24 lg:px-8">
      <div className="mx-auto max-w-[90rem]">
        <LandingFaq />
        <FinalCta />
      </div>
    </section>
  </main>
  <LandingFooter />
</LandingShell>
```

Keep the existing `serviceSchema` object unchanged.

- [ ] **Step 5: Rewrite the FAQ and final CTA styling**

For `LandingFaq`, keep the native `<details>` structure, five items and legal links. Remove the repeated uppercase kicker and serif span. Use `Les questions qui comptent avant de commencer.` as the H2.

For `FinalCta`, use a two-column 16-pixel surface with the existing `practitioner-owner-animal.png`. Use the heading `Prêt à transformer votre prochain compte rendu ?`, a signup button and a bordered demo button. Both labels must remain on one line at 320 pixels.

- [ ] **Step 6: Align footer tokens and Open Graph copy**

Keep every footer link and external-link attribute. Under `.soft-machine-theme`, use machine tokens for borders, muted text and focus.

Change the Open Graph headline to `De vos notes au propriétaire.` and subtitle to `Un compte rendu clair, un suivi qui continue après la séance.` Keep the logo and 1200 × 630 response.

- [ ] **Step 7: Remove the superseded proof files**

```diff
*** Delete File: apps/marketing/components/landing/product-proof.tsx
*** Delete File: apps/marketing/__tests__/product-proof.test.tsx
```

Verify no import remains:

```bash
rg -n "ProductProof|product-proof" apps/marketing --glob '!node_modules/**'
```

Expected: no output.

- [ ] **Step 8: Run the assembled homepage tests**

```bash
bun test apps/marketing/__tests__/home-landing.test.tsx apps/marketing/__tests__/landing-close.test.tsx apps/marketing/__tests__/opengraph-image.test.ts
```

Expected: PASS.

- [ ] **Step 9: Commit the assembled page**

```bash
git add apps/marketing/app/page.tsx apps/marketing/app/opengraph-image.tsx apps/marketing/components/landing/landing-faq.tsx apps/marketing/components/landing/final-cta.tsx apps/marketing/components/footer.tsx apps/marketing/__tests__/home-landing.test.tsx apps/marketing/__tests__/landing-close.test.tsx apps/marketing/__tests__/opengraph-image.test.ts apps/marketing/components/landing/product-proof.tsx apps/marketing/__tests__/product-proof.test.tsx
git commit -m "feat(marketing): assemble soft machine homepage"
```

---

### Task 8: Verify Accessibility, Responsiveness and Production Build

**Files:**

- Modify only files implicated by verification failures.

**Interfaces:**

- Consumes: completed homepage from Tasks 1 through 7.
- Produces: verified responsive and production-ready landing page.

- [ ] **Step 1: Run all marketing tests**

```bash
bun test apps/marketing/__tests__
```

Expected: all tests PASS. Fix regressions only when they conflict with neither the approved spec nor factual product behavior.

- [ ] **Step 2: Run lint and production build**

```bash
bun --filter @biume/marketing lint
bun --filter @biume/marketing build
```

Expected: both commands exit 0. The build must retain inline critical CSS and generate `/` successfully.

- [ ] **Step 3: Start the marketing server**

```bash
bun run dev:marketing
```

Expected: Next.js serves the marketing app at `http://localhost:3000`.

- [ ] **Step 4: Inspect desktop, tablet and mobile**

Use browser automation to capture and inspect:

- 1440 × 1000;
- 768 × 1024;
- 375 × 812;
- 320 × 720 for CTA label stress testing.

At each viewport verify: no horizontal overflow; H1 does not overflow; both hero CTAs remain discoverable; illustration crop remains meaningful; section order is intact; pricing selector fits; FAQ summary targets remain at least 44 pixels; final CTA labels stay on one line.

- [ ] **Step 5: Verify keyboard and reduced motion**

Tab through skip/content focus, header navigation, hero trial, hero demo, pricing controls, every FAQ summary, final trial, final demo and footer links. Every focused element must show a visible violet outline.

Emulate `prefers-reduced-motion: reduce`, reload and confirm all content remains visible, no sequence loops and no scroll trap appears.

- [ ] **Step 6: Verify contrast and claims**

Check text contrast for white-on-violet, white-on-anthracite, muted-on-canvas, green-ink-on-green-soft and all focus indicators. Body text must meet 4.5:1; large text must meet 3:1.

Run:

```bash
rg -ni "témoignage|clients? satisfaits?|\+[0-9]+%|hébergé en France|conforme au RGPD|envoi automatique" apps/marketing/app/page.tsx apps/marketing/components/landing
```

Expected: no unsupported homepage claims.

- [ ] **Step 7: Run the final verification suite**

```bash
bun test apps/marketing/__tests__
bun --filter @biume/marketing lint
bun --filter @biume/marketing build
git diff --check
```

Expected: every command exits 0.

- [ ] **Step 8: Commit verification fixes if needed**

If verification required changes:

```bash
git add apps/marketing
git commit -m "fix(marketing): harden soft machine landing"
```

If no changes were required, do not create an empty commit.
