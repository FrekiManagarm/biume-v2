# Atelier de précision Landing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the complete Biume marketing homepage in the approved “L’atelier de précision” direction, from header to footer, with new imagery, product-led storytelling, accessible motion, and an extensible pricing manifest.

**Architecture:** Keep the homepage composed by the Next.js App Router server page and isolate only interactive motion, editing, mobile-menu, and pricing controls in small client leaves. Each narrative section owns one responsibility and exposes stable data markers for server-rendered Bun tests. Pricing is driven by typed plan data so the one-plan layout collapses cleanly today and a multi-plan selector appears automatically later.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4, `motion/react`, Bun tests, Next Image, Hanken Grotesk.

## Global Constraints

- Work only inside `apps/marketing`, its landing tests, and the new landing design assets.
- Use Bun commands; do not add npm, Yarn, or pnpm files.
- Add no dependency: `motion`, Next.js, React, Tailwind CSS v4, and Hanken Grotesk are already available.
- Preserve `#6B5AC8` for decisions, `#5D9BB8` for connections, and `#2E9866` only for confirmed states.
- Keep body text contrast at 4.5:1 minimum and large text contrast at 3:1 minimum.
- Keep surface radii at 16 px maximum and dominant media radii at 24 px maximum.
- Keep display letter-spacing between `-0.03em` and `-0.04em`; cap display size at `6rem`.
- Do not add gradient text, decorative grids, repeating stripes, glow, default glassmorphism, side accent stripes, or repeated eyebrow labels.
- Do not invent testimonials, usage numbers, logos, outcomes, or compliance claims.
- Keep the exact prices: annual `24,99 €` per month with `299,88 €` billed once per year; monthly `29,99 €` per month.
- Keep the 15-day free trial without a credit card and both signup and demo conversion paths.
- Every animated component must preserve visible server markup and support `prefers-reduced-motion`.
- Full-height composition must use content-driven `min-height`, never `h-screen`.
- Mobile layouts below `768px` must collapse to one column without horizontal overflow.
- Keep the existing Service JSON-LD unchanged and do not add SoftwareApplication, Product, or Offer markup.
- Do not delete existing public assets; stop referencing superseded assets instead.

---

## File Structure

### Files created

- `apps/marketing/components/landing/transformation-workshop.tsx` — server section for the notes-to-owner narrative.
- `apps/marketing/components/landing/transformation-motion.tsx` — client motion leaf for the three transformation stages.
- `apps/marketing/components/landing/practitioner-control-demo.tsx` — local interactive editing and validation leaf.
- `apps/marketing/components/landing/follow-up-continuity.tsx` — ordered post-session timeline.
- `apps/marketing/components/landing/field-stories.tsx` — documentary photography section.
- `apps/marketing/components/landing/pricing-manifest.tsx` — server pricing section and typed plan data.
- `apps/marketing/components/landing/pricing-controls.tsx` — billing-cycle and future plan selector client leaf.
- `apps/marketing/components/landing/landing-close.tsx` — final conversion composition.
- `apps/marketing/__tests__/transformation-workshop.test.tsx` — transformation content and motion-source contract.
- `apps/marketing/__tests__/practitioner-control.test.tsx` — control demonstration contract.
- `apps/marketing/__tests__/field-stories.test.tsx` — documentary imagery and claim-safety contract.
- `apps/marketing/__tests__/pricing-manifest.test.tsx` — single-plan, multi-plan, price, and accessibility contract.
- `apps/marketing/public/assets/images/landing/atelier-hero.webp` — new hero documentary image.
- `apps/marketing/public/assets/images/landing/atelier-practice.webp` — new practitioner gesture image.
- `apps/marketing/public/assets/images/landing/atelier-owner.webp` — new practitioner-owner restitution image.

### Files modified

- `apps/marketing/app/page.tsx` — complete new section composition.
- `apps/marketing/app/globals.css` — atelier tokens, motion utilities, FAQ transitions, reduced-motion rules.
- `apps/marketing/components/landing/landing-shell.tsx` — rename the scoped theme class and preserve font loading.
- `apps/marketing/components/landing/landing-header.tsx` — new compact navigation and conversion treatment.
- `apps/marketing/components/landing/header-motion.tsx` — sticky header material and scroll transition.
- `apps/marketing/components/landing/landing-hero.tsx` — new asymmetric hero.
- `apps/marketing/components/landing/practitioner-control.tsx` — new violet section wrapping the client demo.
- `apps/marketing/components/landing/landing-faq.tsx` — new objection-handling composition.
- `apps/marketing/components/footer.tsx` — new anthracite footer presentation with identical destinations.
- `apps/marketing/__tests__/landing-foundation.test.tsx` — new theme-name and token contract.
- `apps/marketing/__tests__/landing-hero.test.tsx` — new promise, media, conversion, and server/client boundaries.
- `apps/marketing/__tests__/follow-up-flow.test.tsx` — new continuity component and confirmed-green contract.
- `apps/marketing/__tests__/landing-close.test.tsx` — new close composition while preserving FAQ, footer, and conversions.
- `apps/marketing/__tests__/home-landing.test.tsx` — new complete section order and factual story.
- `apps/marketing/__tests__/landing-content.test.ts` — preserve the factual transformation example.

### Superseded files removed after reference checks

- `apps/marketing/components/landing/hero-mechanism.tsx`
- `apps/marketing/components/landing/report-transformation-story.tsx`
- `apps/marketing/components/landing/follow-up-flow.tsx`
- `apps/marketing/components/landing/use-moments.tsx`
- `apps/marketing/components/landing/pricing-decision.tsx`
- `apps/marketing/components/landing/pricing-selector.tsx`
- `apps/marketing/components/landing/final-cta.tsx`
- `apps/marketing/__tests__/report-transformation-story.test.tsx`
- `apps/marketing/__tests__/use-moments.test.tsx`
- `apps/marketing/__tests__/pricing-decision.test.tsx`

---

### Task 1: Establish the atelier theme foundation

**Files:**
- Modify: `apps/marketing/components/landing/landing-shell.tsx`
- Modify: `apps/marketing/app/globals.css`
- Modify: `apps/marketing/__tests__/landing-foundation.test.tsx`

**Interfaces:**
- Produces: scoped `.atelier-theme`, `.atelier-action`, `.atelier-reveal`, and semantic `--atelier-*` variables consumed by every later task.
- Preserves: `LandingShell({ children }: { children: ReactNode }): JSX.Element`.

- [ ] **Step 1: Rewrite the foundation assertions before changing production code**

Replace the current theme-specific expectations with:

```tsx
describe("atelier precision landing foundation", () => {
  test("scopes the approved theme and font to the homepage", () => {
    const html = renderToStaticMarkup(
      <LandingShell><main>Contenu</main></LandingShell>,
    );

    expect(html).toContain("atelier-theme");
    expect(html).toContain("font-[family-name:var(--font-hanken)]");
    expect(html).toContain("Contenu");
  });

  test("defines semantic colors, restrained radii and reduced motion", async () => {
    const css = await Bun.file(new URL("../app/globals.css", import.meta.url)).text();

    expect(css).toMatch(/--atelier-violet:\s*#6b5ac8;/i);
    expect(css).toMatch(/--atelier-blue:\s*#5d9bb8;/i);
    expect(css).toMatch(/--atelier-green:\s*#2e9866;/i);
    expect(css).toMatch(/--atelier-surface-radius:\s*1rem;/);
    expect(css).toMatch(/--atelier-media-radius:\s*1\.5rem;/);
    expect(css).toContain("prefers-reduced-motion: reduce");
    expect(css).not.toContain("background-clip: text");
    expect(css).not.toContain("repeating-linear-gradient");
  });
});
```

- [ ] **Step 2: Run the focused test and verify the new contract fails**

Run:

```bash
bun test apps/marketing/__tests__/landing-foundation.test.tsx
```

Expected: FAIL because `LandingShell` still renders `soft-machine-theme` and `--atelier-*` tokens do not exist.

- [ ] **Step 3: Rename the scoped shell theme**

Make `landing-shell.tsx` render this exact outer contract while preserving the existing `Hanken_Grotesk` setup:

```tsx
export function LandingShell({ children }: { children: ReactNode }) {
  return (
    <div
      className={`${hanken.variable} atelier-theme min-h-dvh overflow-x-clip bg-[color:var(--atelier-canvas)] font-[family-name:var(--font-hanken)] text-[color:var(--atelier-ink)] selection:bg-[color:var(--atelier-violet-soft)]`}
    >
      {children}
    </div>
  );
}
```

- [ ] **Step 4: Replace the old landing token block and motion utilities**

In `app/globals.css`, replace `.soft-machine-theme`, `.machine-action`, and their reduced-motion rules with this token contract and retain the existing native `details` animation under the new scope:

```css
.atelier-theme {
  --background: #f7f7f4;
  --foreground: #1d1d21;
  --card: #fdfdfb;
  --card-foreground: #1d1d21;
  --muted: #ecece7;
  --muted-foreground: #5f5f66;
  --border: #deded7;
  --primary: #6b5ac8;
  --primary-foreground: #ffffff;
  --secondary: #5d9bb8;
  --secondary-foreground: #ffffff;
  --ring: #6b5ac8;
  --atelier-canvas: #f7f7f4;
  --atelier-surface: #fdfdfb;
  --atelier-muted-surface: #ecece7;
  --atelier-ink: #1d1d21;
  --atelier-muted: #5f5f66;
  --atelier-line: #deded7;
  --atelier-anthracite: #202024;
  --atelier-violet: #6b5ac8;
  --atelier-violet-soft: #eeebfb;
  --atelier-blue: #5d9bb8;
  --atelier-blue-soft: #e8f1f5;
  --atelier-green: #2e9866;
  --atelier-green-ink: #21734d;
  --atelier-green-soft: #e7f3ed;
  --atelier-surface-radius: 1rem;
  --atelier-media-radius: 1.5rem;
  --atelier-ease: cubic-bezier(0.16, 1, 0.3, 1);
  color-scheme: light;
  isolation: isolate;
}

.atelier-action {
  transition: transform 180ms var(--atelier-ease), background-color 180ms ease,
    border-color 180ms ease, color 180ms ease;
}

.atelier-action:hover { transform: translateY(-2px); }
.atelier-action:active { transform: scale(0.98); }

@media (prefers-reduced-motion: reduce) {
  .atelier-action { transition: none; }
  .atelier-action:hover, .atelier-action:active { transform: none; }
}
```

- [ ] **Step 5: Run foundation tests and commit**

Run:

```bash
bun test apps/marketing/__tests__/landing-foundation.test.tsx
```

Expected: PASS.

Commit:

```bash
git add apps/marketing/app/globals.css apps/marketing/components/landing/landing-shell.tsx apps/marketing/__tests__/landing-foundation.test.tsx
git commit -m "feat(marketing): establish atelier landing theme"
```

---

### Task 2: Build the new header, hero, and hero photograph

**Files:**
- Modify: `apps/marketing/components/landing/landing-header.tsx`
- Modify: `apps/marketing/components/landing/header-motion.tsx`
- Modify: `apps/marketing/components/landing/landing-hero.tsx`
- Create: `apps/marketing/public/assets/images/landing/atelier-hero.webp`
- Modify: `apps/marketing/__tests__/landing-hero.test.tsx`

**Interfaces:**
- Preserves: `LandingHeader(): JSX.Element` and `LandingHero(): JSX.Element` as server components.
- Consumes: `webAppPath("/signup")`, existing `MobileMenu`, and `HeaderMotion`.
- Produces: `data-landing-section="hero"`, `data-hero-product-preview`, `data-conversion="hero-signup"`, and an in-page `href="#produit"` product path.

- [ ] **Step 1: Write the new hero and navigation assertions**

Update the primary hero test to assert:

```tsx
test("renders the approved promise, new documentary image and product proof", () => {
  const html = renderWithLandingImageConfig(<LandingHero />);
  const text = textOnly(html);

  expect(text).toContain("Votre regard métier, jusqu’au propriétaire.");
  expect(text).toContain(
    "Biume transforme vos notes en un compte rendu clair, que vous relisez, adaptez et partagez uniquement quand vous le décidez.",
  );
  expect(text).toContain("15 jours gratuits");
  expect(text).toContain("Sans carte bancaire");
  expect(html).toContain("atelier-hero.webp");
  expect(html).toContain('data-hero-product-preview="true"');
  expect(text).toContain("Notes professionnelles");
  expect(text).toContain("Version propriétaire");
  expect(text).toContain("À relire");
  expect(html).toContain('data-conversion="hero-signup"');
  expect(html).toContain('href="#produit"');
  expect(text).toContain("Voir le parcours");
  expect(html).not.toMatch(exactZeroOpacity);
});
```

Retain the header test but replace “Comment ça marche” with “Méthode” and require these destinations: `#produit`, `#methode`, `#tarifs`, `/blog`, signin, demo, and two signup anchors.

- [ ] **Step 2: Run the hero test and verify it fails**

Run:

```bash
bun test apps/marketing/__tests__/landing-hero.test.tsx
```

Expected: FAIL on the old headline, old `soft-machine-hero.png`, and old navigation label.

- [ ] **Step 3: Generate the documentary hero image**

Use the image-generation skill with this exact art direction:

```text
Create a wide documentary photograph for a French professional software landing page. An independent female animal osteopath in her late thirties finishes a calm session with a chestnut horse in a real stable doorway. Her gesture is precise and professional, one hand resting near the horse’s shoulder; the horse is calm and attentive. Natural overcast daylight, restrained neutral colors, subtle violet fabric detail, credible rural environment, premium editorial photography without looking like advertising. Compose the practitioner and horse on the right half and preserve generous clean negative space on the left for interface copy. Eye-level camera, 35mm lens feel, realistic skin, hands and horse anatomy, no medical equipment, no text, no logo, no dramatic sunset, no clinical mood, no childlike styling. Landscape 16:10.
```

Inspect the result at original detail. Reject any image with incorrect fingers, horse anatomy, visible text, or insufficient left-side negative space. Save the accepted asset as `apps/marketing/public/assets/images/landing/atelier-hero.webp` with a practical web width around 1800 px.

- [ ] **Step 4: Implement the compact header**

Use this navigation data and exact labels in `landing-header.tsx`:

```tsx
const navigation = [
  { href: "#produit", label: "Produit" },
  { href: "#methode", label: "Méthode" },
  { href: "#tarifs", label: "Tarifs" },
  { href: "/blog", label: "Ressources" },
] as const;
```

Keep the logo, signin, demo, desktop signup, compact mobile signup, and `MobileMenu`. Replace every `--machine-*` token with `--atelier-*`, use `atelier-action`, keep 44 px targets, and preserve the external demo attributes.

- [ ] **Step 5: Implement the asymmetric server-rendered hero**

Build `LandingHero` with this semantic structure:

```tsx
export function LandingHero() {
  return (
    <section data-landing-section="hero" className="px-4 pb-20 pt-10 sm:px-6 lg:px-8 lg:pb-28 lg:pt-16">
      <div className="relative mx-auto min-h-[46rem] max-w-[90rem] overflow-hidden lg:min-h-[44rem]">
        <div className="relative z-20 max-w-[46rem] pt-8 lg:w-[55%] lg:pt-20">
          <h1 className="max-w-[11ch] text-balance text-[clamp(3.25rem,7vw,6rem)] font-bold leading-[0.92] tracking-[-0.038em]">
            Votre regard métier, <span className="text-[color:var(--atelier-violet)]">jusqu’au propriétaire.</span>
          </h1>
          <p className="mt-6 max-w-[58ch] text-pretty text-base leading-7 text-[color:var(--atelier-muted)] md:text-lg">
            Biume transforme vos notes en un compte rendu clair, que vous relisez, adaptez et partagez uniquement quand vous le décidez.
          </p>
          <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row">
            <Link
              href={webAppPath("/signup")}
              prefetch={false}
              data-conversion="hero-signup"
              className="atelier-action inline-flex min-h-12 items-center justify-center rounded-full bg-[color:var(--atelier-violet)] px-6 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--atelier-violet)]"
            >
              Préparer mon premier compte rendu
            </Link>
            <Link
              href="#produit"
              className="atelier-action inline-flex min-h-12 items-center justify-center rounded-full border border-[color:var(--atelier-line)] bg-[color:var(--atelier-surface)] px-6 text-sm font-semibold text-[color:var(--atelier-ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--atelier-violet)]"
            >
              Voir le parcours
            </Link>
          </div>
          <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-[color:var(--atelier-muted)]">
            <li>15 jours gratuits</li>
            <li>Sans carte bancaire</li>
          </ul>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-[25rem] overflow-hidden rounded-[var(--atelier-media-radius)] lg:inset-y-0 lg:left-auto lg:right-0 lg:h-auto lg:w-[48%]">
          <Image src="/assets/images/landing/atelier-hero.webp" alt="Une ostéopathe animalière termine une séance calme auprès d’un cheval" fill priority sizes="(min-width: 1024px) 48vw, 100vw" className="object-cover" />
        </div>
        <div data-hero-product-preview="true" className="absolute bottom-6 left-0 z-30 w-[min(34rem,88%)] rounded-[var(--atelier-surface-radius)] bg-[color:var(--atelier-surface)] shadow-[0_6px_8px_rgba(107,90,200,0.16)] lg:bottom-10 lg:left-[40%]">
          <div className="flex items-center justify-between border-b border-[color:var(--atelier-line)] px-5 py-4">
            <p className="text-sm font-semibold">Préparation propriétaire</p>
            <span className="rounded-full bg-[color:var(--atelier-violet-soft)] px-3 py-1.5 text-xs font-semibold text-[color:var(--atelier-violet)]">À relire</span>
          </div>
          <div className="grid gap-3 p-4 sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:p-5">
            <div className="rounded-[var(--atelier-surface-radius)] bg-[color:var(--atelier-muted-surface)] p-4">
              <h2 className="text-xs font-semibold">Notes professionnelles</h2>
              <p className="mt-2 text-sm leading-6 text-[color:var(--atelier-muted)]">{REPORT_TRANSFORMATION_DEMO.note}</p>
            </div>
            <span aria-hidden="true" className="mx-auto hidden h-1 w-8 rounded-full bg-[color:var(--atelier-blue)] sm:block" />
            <div className="rounded-[var(--atelier-surface-radius)] bg-[color:var(--atelier-violet-soft)] p-4">
              <h2 className="text-xs font-semibold">Version propriétaire</h2>
              <p className="mt-2 text-sm leading-6">{REPORT_TRANSFORMATION_DEMO.ownerSummary}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
```

Import `REPORT_TRANSFORMATION_DEMO` and `webAppPath` in addition to `Image` and `Link`. Keep the preview text visible before hydration and do not add a client boundary to `LandingHero`.

- [ ] **Step 6: Run hero tests and commit**

Run:

```bash
bun test apps/marketing/__tests__/landing-hero.test.tsx
```

Expected: PASS.

Commit:

```bash
git add apps/marketing/components/landing/landing-header.tsx apps/marketing/components/landing/header-motion.tsx apps/marketing/components/landing/landing-hero.tsx apps/marketing/public/assets/images/landing/atelier-hero.webp apps/marketing/__tests__/landing-hero.test.tsx
git commit -m "feat(marketing): rebuild atelier header and hero"
```

---

### Task 3: Implement the sticky transformation workshop

**Files:**
- Create: `apps/marketing/components/landing/transformation-workshop.tsx`
- Create: `apps/marketing/components/landing/transformation-motion.tsx`
- Create: `apps/marketing/__tests__/transformation-workshop.test.tsx`
- Preserve: `apps/marketing/components/landing/report-transformation-demo.ts`

**Interfaces:**
- Consumes: `REPORT_TRANSFORMATION_DEMO` with `note`, `sections`, and `ownerSummary`.
- Produces: `TransformationWorkshop({ demo }: { demo: typeof REPORT_TRANSFORMATION_DEMO }): JSX.Element`.
- Produces markers: `data-landing-section="transformation"`, `data-transformation-stage="notes|proposal|review"`.

- [ ] **Step 1: Write the transformation contract test**

```tsx
import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { REPORT_TRANSFORMATION_DEMO } from "../components/landing/report-transformation-demo";
import { TransformationWorkshop } from "../components/landing/transformation-workshop";
import { exactZeroOpacity, textOnly } from "./landing-test-utils";

describe("transformation workshop", () => {
  test("renders all three factual stages before hydration", () => {
    const html = renderToStaticMarkup(<TransformationWorkshop demo={REPORT_TRANSFORMATION_DEMO} />);
    const text = textOnly(html);

    expect(text).toContain("Ce que vous notez reste précis.");
    expect(text).toContain(REPORT_TRANSFORMATION_DEMO.note);
    expect(text).toContain("Reformulation proposée");
    expect(text).toContain(REPORT_TRANSFORMATION_DEMO.ownerSummary);
    expect(html.match(/data-transformation-stage=/g)).toHaveLength(3);
    expect(html).not.toMatch(exactZeroOpacity);
  });

  test("isolates motion in a reduced-motion client leaf", async () => {
    const source = await Bun.file(new URL("../components/landing/transformation-motion.tsx", import.meta.url)).text();
    expect(source).toMatch(/^"use client";/);
    expect(source).toContain("useReducedMotion");
    expect(source).toContain('from "motion/react"');
    expect(source).not.toMatch(/window\.addEventListener\(["']scroll/);
    expect(source).not.toMatch(/opacity\s*:\s*0/);
  });
});
```

- [ ] **Step 2: Run the new test and verify it fails**

Run:

```bash
bun test apps/marketing/__tests__/transformation-workshop.test.tsx
```

Expected: FAIL because both component files are absent.

- [ ] **Step 3: Implement the visible server section**

Create `transformation-workshop.tsx` with an `id="produit"`, the heading “Ce que vous notez reste précis. Ce que le propriétaire lit devient clair.”, and pass exactly these stages to the client leaf:

```tsx
const stages = [
  { id: "notes", title: "Notes de séance", body: demo.note, tone: "neutral" },
  { id: "proposal", title: "Reformulation proposée", body: demo.sections.map((section) => `${section.label} : ${section.value}`).join(" · "), tone: "blue" },
  { id: "review", title: "Compte rendu à valider", body: demo.ownerSummary, tone: "violet" },
] as const;
```

The section uses a two-column desktop layout with narrative copy on the left and a sticky `top-28` stage on the right. Below `lg`, render the same stages in document order without sticky positioning.

- [ ] **Step 4: Implement transform-only stage motion**

In `transformation-motion.tsx`, export:

```tsx
export type TransformationStage = {
  id: "notes" | "proposal" | "review";
  title: string;
  body: string;
  tone: "neutral" | "blue" | "violet";
};

export function TransformationMotion({ stages }: { stages: readonly TransformationStage[] }) {
  const reduceMotion = useReducedMotion();
  return (
    <div className="relative grid gap-5 lg:min-h-[42rem]">
      {stages.map((stage, index) => (
        <motion.article
          key={stage.id}
          data-transformation-stage={stage.id}
          initial={false}
          whileInView={reduceMotion ? undefined : { y: index * -10, rotate: (index - 1) * 0.6 }}
          viewport={{ once: true, amount: 0.55 }}
          transition={{ duration: reduceMotion ? 0 : 0.52, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-[var(--atelier-surface-radius)] p-6"
        >
          <h3>{stage.title}</h3><p>{stage.body}</p>
        </motion.article>
      ))}
    </div>
  );
}
```

Add tone-specific backgrounds with `cn` or explicit conditional strings. Do not set initial opacity to zero.

- [ ] **Step 5: Run the transformation tests and commit**

Run:

```bash
bun test apps/marketing/__tests__/landing-content.test.ts apps/marketing/__tests__/transformation-workshop.test.tsx
```

Expected: PASS.

Commit:

```bash
git add apps/marketing/components/landing/transformation-workshop.tsx apps/marketing/components/landing/transformation-motion.tsx apps/marketing/__tests__/transformation-workshop.test.tsx
git commit -m "feat(marketing): add transformation workshop"
```

---

### Task 4: Demonstrate practitioner control and follow-up continuity

**Files:**
- Modify: `apps/marketing/components/landing/practitioner-control.tsx`
- Create: `apps/marketing/components/landing/practitioner-control-demo.tsx`
- Create: `apps/marketing/components/landing/follow-up-continuity.tsx`
- Create: `apps/marketing/__tests__/practitioner-control.test.tsx`
- Modify: `apps/marketing/__tests__/follow-up-flow.test.tsx`

**Interfaces:**
- Produces: `PractitionerControl(): JSX.Element` server wrapper.
- Produces: `PractitionerControlDemo(): JSX.Element` local client interaction.
- Produces: `FollowUpContinuity(): JSX.Element` with three ordered steps.
- Produces markers: `data-control-passage`, `data-control-status`, `data-follow-up-step`.

- [ ] **Step 1: Write failing tests for both sections**

Create `practitioner-control.test.tsx`:

```tsx
import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { PractitionerControl } from "../components/landing/practitioner-control";
import { textOnly } from "./landing-test-utils";

describe("practitioner control", () => {
  test("shows source, editable owner version and explicit validation", () => {
    const html = renderToStaticMarkup(<PractitionerControl />);
    const text = textOnly(html);
    expect(text).toContain("Biume prépare. Vous gardez la main.");
    expect(text).toContain("Texte professionnel");
    expect(text).toContain("Version propriétaire");
    expect(text).toContain("Reformuler");
    expect(text).toContain("Valider ce passage");
    expect(text).toContain("Rien n’est partagé automatiquement");
    expect(html).toContain('data-control-status="ready"');
  });
});
```

Update `follow-up-flow.test.tsx` to import `FollowUpContinuity` and require step labels in this exact order: `Compte rendu finalisé`, `Suivi préparé`, `Rappel confirmé`. Assert only the last step contains `atelier-green-soft` and `atelier-green-ink`.

- [ ] **Step 2: Run both tests and verify failure**

Run:

```bash
bun test apps/marketing/__tests__/practitioner-control.test.tsx apps/marketing/__tests__/follow-up-flow.test.tsx
```

Expected: FAIL because the control is still a static list and `FollowUpContinuity` does not exist.

- [ ] **Step 3: Implement the violet server wrapper and local demo**

Make `PractitionerControl` render the exact heading, supporting copy, and `<PractitionerControlDemo />` inside a full violet section. In the client leaf, use local state only:

```tsx
const passages = [
  {
    id: "mobility",
    source: "Restriction thoracique gauche. Mobilité améliorée après travail.",
    owner: "La mobilité du thorax s’est améliorée pendant le travail manuel.",
  },
  {
    id: "advice",
    source: "Conseiller du calme pendant 48 h.",
    owner: "Prévoyez une activité calme pendant les prochaines 48 heures.",
  },
] as const;
```

`Reformuler` toggles between the approved owner text and one alternate factual phrasing. `Valider ce passage` changes `data-control-status` from `ready` to `confirmed` and the button label to `Passage validé`; it never performs a network request. Keep every source and owner passage visible in the initial server output.

- [ ] **Step 4: Implement the ordered continuity timeline**

Create `follow-up-continuity.tsx` as a server component with `id="methode"` and:

```tsx
const steps = [
  { title: "Compte rendu finalisé", body: "Vous relisez et finalisez le document après la séance.", confirmed: false },
  { title: "Suivi préparé", body: "Vous choisissez la date et le message du prochain rappel.", confirmed: false },
  { title: "Rappel confirmé", body: "Le rappel est enregistré à la date que vous avez choisie.", confirmed: true },
] as const;
```

Use an anthracite background. Use blue connectors between steps. Apply green only to the confirmed status in the final item. Use a real ordered list and vertical layout below `lg`.

- [ ] **Step 5: Run tests and commit**

Run:

```bash
bun test apps/marketing/__tests__/practitioner-control.test.tsx apps/marketing/__tests__/follow-up-flow.test.tsx
```

Expected: PASS.

Commit:

```bash
git add apps/marketing/components/landing/practitioner-control.tsx apps/marketing/components/landing/practitioner-control-demo.tsx apps/marketing/components/landing/follow-up-continuity.tsx apps/marketing/__tests__/practitioner-control.test.tsx apps/marketing/__tests__/follow-up-flow.test.tsx
git commit -m "feat(marketing): show practitioner control and continuity"
```

---

### Task 5: Add the documentary field-stories section

**Files:**
- Create: `apps/marketing/components/landing/field-stories.tsx`
- Create: `apps/marketing/public/assets/images/landing/atelier-practice.webp`
- Create: `apps/marketing/public/assets/images/landing/atelier-owner.webp`
- Create: `apps/marketing/__tests__/field-stories.test.tsx`

**Interfaces:**
- Produces: `FieldStories(): JSX.Element` server component.
- Produces markers: `data-landing-section="field-stories"` and two `data-field-image` values.

- [ ] **Step 1: Write the documentary-content test**

```tsx
import { describe, expect, test } from "bun:test";
import { renderWithLandingImageConfig, textOnly } from "./landing-test-utils";
import { FieldStories } from "../components/landing/field-stories";

describe("field stories", () => {
  test("returns the product story to real practice without invented proof", () => {
    const html = renderWithLandingImageConfig(<FieldStories />);
    const text = textOnly(html).toLowerCase();
    expect(text).toContain("conçu autour du terrain, pas autour d’un écran");
    expect(html).toContain("atelier-practice.webp");
    expect(html).toContain("atelier-owner.webp");
    expect(html.match(/data-field-image=/g)).toHaveLength(2);
    expect(text).not.toContain("témoignage");
    expect(text).not.toMatch(/\b\d+(?:[,.]\d+)?\s*%\b/);
  });
});
```

- [ ] **Step 2: Run the test and verify failure**

Run:

```bash
bun test apps/marketing/__tests__/field-stories.test.tsx
```

Expected: FAIL because `FieldStories` does not exist.

- [ ] **Step 3: Generate both documentary assets**

Generate `atelier-practice.webp` with:

```text
Documentary close-up photograph of an independent female animal osteopath’s precise hands palpating the shoulder and upper back of a calm medium-size dog after a session, real practice room, natural side light, restrained charcoal, muted violet and soft neutral palette, credible professional gesture, no medical equipment, no text, no logo, realistic hands and dog anatomy, premium but unposed editorial photography, landscape 4:5 crop with the gesture centered.
```

Generate `atelier-owner.webp` with:

```text
Documentary photograph of a female animal osteopath explaining post-session recommendations to an adult dog owner while the calm dog rests naturally between them, bright real consultation room, attentive professional body language, restrained neutral palette with a subtle violet detail, natural daylight, premium editorial realism without looking staged, no text, no logo, realistic hands, faces and dog anatomy, landscape 4:5 crop with clean space around both people.
```

Inspect both at original detail. Reject anatomical defects, visible text, artificial smiles, clinical props, and inconsistent color treatment. Save at approximately 1400 px on the long edge.

- [ ] **Step 4: Implement the asymmetric photo section**

Create a server component with one text column and a two-image composition. Use `next/image`, `sizes`, descriptive French alt text, `rounded-[var(--atelier-media-radius)]`, and no shadows on the bordered text content. The copy must make only this claim: Biume follows the real sequence of writing, explaining, validating, and maintaining contact after the session.

- [ ] **Step 5: Run the test and commit**

Run:

```bash
bun test apps/marketing/__tests__/field-stories.test.tsx
```

Expected: PASS.

Commit:

```bash
git add apps/marketing/components/landing/field-stories.tsx apps/marketing/public/assets/images/landing/atelier-practice.webp apps/marketing/public/assets/images/landing/atelier-owner.webp apps/marketing/__tests__/field-stories.test.tsx
git commit -m "feat(marketing): add documentary field stories"
```

---

### Task 6: Build the extensible pricing manifest

**Files:**
- Create: `apps/marketing/components/landing/pricing-manifest.tsx`
- Create: `apps/marketing/components/landing/pricing-controls.tsx`
- Create: `apps/marketing/__tests__/pricing-manifest.test.tsx`

**Interfaces:**
- Produces: `BillingCycle = "annual" | "monthly"`.
- Produces: `PricingPlan` and `PRICING_PLANS`.
- Produces: `PricingManifest({ plans? }: { plans?: readonly PricingPlan[] }): JSX.Element`.
- Produces: `PricingControls({ plans }: { plans: readonly PricingPlan[] }): JSX.Element`.

- [ ] **Step 1: Write single-plan and multi-plan tests**

```tsx
import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { PricingManifest, PRICING_PLANS, type PricingPlan } from "../components/landing/pricing-manifest";
import { conversionAnchors, textOnly } from "./landing-test-utils";
import { webAppPath } from "../lib/web-app-url";

describe("pricing manifest", () => {
  test("renders one transparent offer without a plan selector", () => {
    const html = renderToStaticMarkup(<PricingManifest />);
    const text = textOnly(html);
    expect(PRICING_PLANS).toHaveLength(1);
    expect(text).toContain("Tout le parcours. Un seul abonnement.");
    expect(text).toContain("24,99 €");
    expect(text).toContain("299,88 € facturés une fois par an");
    expect(text).toContain("29,99 €");
    expect(html).not.toContain("data-plan-selector");
    expect(html.match(/aria-pressed="true"/g)).toHaveLength(1);
    expect(html.match(/aria-pressed="false"/g)).toHaveLength(1);
    expect(conversionAnchors(html, "pricing-signup")[0]).toContain(`href="${webAppPath("/signup")}"`);
  });

  test("reveals the plan selector when more than one plan exists", () => {
    const second: PricingPlan = { ...PRICING_PLANS[0]!, id: "collective", name: "Collectif" };
    const html = renderToStaticMarkup(<PricingManifest plans={[PRICING_PLANS[0]!, second]} />);
    expect(html).toContain("data-plan-selector");
    expect(html).toContain("Indépendant");
    expect(html).toContain("Collectif");
  });
});
```

- [ ] **Step 2: Run the new test and verify failure**

Run:

```bash
bun test apps/marketing/__tests__/pricing-manifest.test.tsx
```

Expected: FAIL because the manifest modules do not exist.

- [ ] **Step 3: Define exact pricing types and current data**

In `pricing-manifest.tsx` define:

```tsx
export type BillingCycle = "annual" | "monthly";
export type BillingPrice = {
  label: string;
  displayPrice: string;
  suffix: string;
  detail: string;
};
export type PricingPlan = {
  id: string;
  name: string;
  headline: string;
  included: readonly string[];
  prices: Record<BillingCycle, BillingPrice>;
};

export const PRICING_PLANS = [{
  id: "independent",
  name: "Indépendant",
  headline: "Tout le parcours. Un seul abonnement.",
  included: [
    "Compte rendu propriétaire structuré",
    "Reformulation et validation passage par passage",
    "Export PDF professionnel",
    "Suivi et rappel après séance",
  ],
  prices: {
    annual: { label: "Annuel", displayPrice: "24,99 €", suffix: "par mois, facturé annuellement", detail: "299,88 € facturés une fois par an" },
    monthly: { label: "Mensuel", displayPrice: "29,99 €", suffix: "par mois", detail: "Facturation mensuelle, résiliable en fin de période" },
  },
}] as const satisfies readonly PricingPlan[];
```

- [ ] **Step 4: Implement the server manifest and client controls**

`PricingManifest` renders a full violet section with `id="tarifs"`, the approved heading, trial copy, and `<PricingControls plans={plans} />`.

`PricingControls` uses two local state values:

```tsx
const [planId, setPlanId] = useState(plans[0]?.id ?? "");
const [cycle, setCycle] = useState<BillingCycle>("annual");
const selectedPlan = plans.find((plan) => plan.id === planId) ?? plans[0];
```

Render the plan selector only when `plans.length > 1`, with `data-plan-selector`, `aria-pressed`, and 44 px buttons. Always render annual/monthly billing buttons. Keep a mounted `aria-live="polite" aria-atomic="true"` region around the selected price. Render inclusions as border-separated rows, not a card list. The signup link uses `data-conversion="pricing-signup"` and `prefetch={false}`.

- [ ] **Step 5: Run pricing tests and commit**

Run:

```bash
bun test apps/marketing/__tests__/pricing-manifest.test.tsx
```

Expected: PASS.

Commit:

```bash
git add apps/marketing/components/landing/pricing-manifest.tsx apps/marketing/components/landing/pricing-controls.tsx apps/marketing/__tests__/pricing-manifest.test.tsx
git commit -m "feat(marketing): add extensible pricing manifest"
```

---

### Task 7: Rebuild the FAQ, final close, footer, and homepage composition

**Files:**
- Modify: `apps/marketing/components/landing/landing-faq.tsx`
- Create: `apps/marketing/components/landing/landing-close.tsx`
- Modify: `apps/marketing/components/footer.tsx`
- Modify: `apps/marketing/app/page.tsx`
- Modify: `apps/marketing/__tests__/landing-close.test.tsx`
- Modify: `apps/marketing/__tests__/home-landing.test.tsx`

**Interfaces:**
- Consumes all section exports from Tasks 2–6.
- Produces exactly seven section markers in order: `hero`, `transformation`, `control`, `follow-up`, `field-stories`, `pricing`, `faq-cta`.
- Preserves all existing footer destinations and the unchanged Service JSON-LD.

- [ ] **Step 1: Rewrite the full-page order and close assertions**

In `home-landing.test.tsx`, use these markers:

```tsx
const markers = [
  'data-landing-section="hero"',
  'data-landing-section="transformation"',
  'data-landing-section="control"',
  'data-landing-section="follow-up"',
  'data-landing-section="field-stories"',
  'data-landing-section="pricing"',
  'data-landing-section="faq-cta"',
] as const;
```

Require the approved headline, the factual transformation demo, “Biume prépare. Vous gardez la main.”, “Le compte rendu ouvre la suite.”, both new field image filenames, both prices, five FAQ items, the final signup and demo conversions, unique IDs, live anchor targets, visible skip link, unchanged Service JSON-LD, and no unsupported claims.

In `landing-close.test.tsx`, retain all five factual FAQ answer assertions and footer destination assertions. Replace the old final image assertion with the new `LandingClose` heading “Préparez votre prochain compte rendu.” and require both final conversion markers.

- [ ] **Step 2: Run the page tests and verify failure**

Run:

```bash
bun test apps/marketing/__tests__/home-landing.test.tsx apps/marketing/__tests__/landing-close.test.tsx
```

Expected: FAIL because `app/page.tsx` still assembles superseded sections and `LandingClose` does not exist.

- [ ] **Step 3: Restyle FAQ and implement the final close**

Keep the exact FAQ questions, answers, legal links, native disclosures, and 44 px targets. Change the visible heading to “Avant de commencer.” and replace every machine token with atelier tokens.

Create `landing-close.tsx` as a blue full-height-within-section composition containing:

- Heading “Préparez votre prochain compte rendu.”
- Copy “15 jours pour découvrir tout le parcours, sans carte bancaire.”
- Signup link with `data-conversion="final-signup"`.
- External demo link with `data-conversion="final-demo"`, `target="_blank"`, and `rel="noopener noreferrer"`.

- [ ] **Step 4: Recompose the entire homepage**

Replace the homepage imports and main content with:

```tsx
<LandingShell>
  <JsonLd data={serviceSchema} />
  <a
    href="#contenu"
    className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:inline-flex focus:min-h-11 focus:items-center focus:rounded-full focus:bg-[color:var(--atelier-violet)] focus:px-4 focus:text-sm focus:font-semibold focus:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--atelier-violet)]"
  >
    Aller au contenu
  </a>
  <LandingHeader />
  <main id="contenu" tabIndex={-1}>
    <LandingHero />
    <TransformationWorkshop demo={REPORT_TRANSFORMATION_DEMO} />
    <PractitionerControl />
    <FollowUpContinuity />
    <FieldStories />
    <PricingManifest />
    <section data-landing-section="faq-cta" className="px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <div className="mx-auto grid max-w-[90rem] gap-16 lg:grid-cols-[1.1fr_0.9fr]">
        <LandingFaq />
        <LandingClose />
      </div>
    </section>
  </main>
  <LandingFooter />
</LandingShell>
```

- [ ] **Step 5: Restyle the footer without changing destinations**

Keep the exact href order currently asserted in `landing-close.test.tsx`. Use an anthracite background, atelier line and muted colors, 44 px anchors, and the existing external demo attributes. Do not add a contact link or compliance claim.

- [ ] **Step 6: Run page, close, and SEO tests and commit**

Run:

```bash
bun test apps/marketing/__tests__/home-landing.test.tsx apps/marketing/__tests__/landing-close.test.tsx apps/marketing/__tests__/seo.test.tsx apps/marketing/__tests__/mobile-menu.test.ts
```

Expected: PASS.

Commit:

```bash
git add apps/marketing/app/page.tsx apps/marketing/components/landing/landing-faq.tsx apps/marketing/components/landing/landing-close.tsx apps/marketing/components/footer.tsx apps/marketing/__tests__/home-landing.test.tsx apps/marketing/__tests__/landing-close.test.tsx
git commit -m "feat(marketing): assemble complete atelier landing"
```

---

### Task 8: Remove superseded components and update the full landing test suite

**Files:**
- Remove the superseded component and test files listed in “File Structure”.
- Modify any surviving test that still imports a superseded component.

**Interfaces:**
- Produces: no source or test import that references the old hero mechanism, transformation story, follow-up flow, use moments, pricing decision, pricing selector, or final CTA.

- [ ] **Step 1: Confirm every superseded file is unreferenced**

Run:

```bash
rg -n "HeroMechanism|ReportTransformationStory|FollowUpFlow|UseMoments|PricingDecision|PricingSelector|FinalCta|hero-mechanism|report-transformation-story|follow-up-flow|use-moments|pricing-decision|pricing-selector|final-cta" apps/marketing --glob '!components/landing/hero-mechanism.tsx' --glob '!components/landing/report-transformation-story.tsx' --glob '!components/landing/follow-up-flow.tsx' --glob '!components/landing/use-moments.tsx' --glob '!components/landing/pricing-decision.tsx' --glob '!components/landing/pricing-selector.tsx' --glob '!components/landing/final-cta.tsx' --glob '!__tests__/report-transformation-story.test.tsx' --glob '!__tests__/use-moments.test.tsx' --glob '!__tests__/pricing-decision.test.tsx'
```

Expected: no output. If output appears, replace the surviving import with the corresponding new component before removing files.

- [ ] **Step 2: Remove only the confirmed superseded files**

Run:

```bash
git rm apps/marketing/components/landing/hero-mechanism.tsx apps/marketing/components/landing/report-transformation-story.tsx apps/marketing/components/landing/follow-up-flow.tsx apps/marketing/components/landing/use-moments.tsx apps/marketing/components/landing/pricing-decision.tsx apps/marketing/components/landing/pricing-selector.tsx apps/marketing/components/landing/final-cta.tsx apps/marketing/__tests__/report-transformation-story.test.tsx apps/marketing/__tests__/use-moments.test.tsx apps/marketing/__tests__/pricing-decision.test.tsx
```

- [ ] **Step 3: Run the complete marketing landing test set**

Run:

```bash
bun test apps/marketing/__tests__/landing-foundation.test.tsx apps/marketing/__tests__/landing-hero.test.tsx apps/marketing/__tests__/landing-content.test.ts apps/marketing/__tests__/transformation-workshop.test.tsx apps/marketing/__tests__/practitioner-control.test.tsx apps/marketing/__tests__/follow-up-flow.test.tsx apps/marketing/__tests__/field-stories.test.tsx apps/marketing/__tests__/pricing-manifest.test.tsx apps/marketing/__tests__/landing-close.test.tsx apps/marketing/__tests__/home-landing.test.tsx apps/marketing/__tests__/mobile-menu.test.ts apps/marketing/__tests__/seo.test.tsx
```

Expected: all tests PASS with zero failures.

- [ ] **Step 4: Run static quality checks**

Run:

```bash
bun --filter @biume/marketing lint
bun --filter @biume/marketing build
```

Expected: both commands exit 0. The build must complete without missing image, client-boundary, or hydration errors.

- [ ] **Step 5: Commit cleanup**

```bash
git add apps/marketing
git commit -m "refactor(marketing): remove superseded landing modules"
```

---

### Task 9: Perform responsive, motion, and accessibility verification

**Files:**
- Modify only the landing component or CSS file implicated by each observed defect.
- Add a regression assertion to the closest landing test for each code-level defect fixed.

**Interfaces:**
- Verifies the complete `/` route at desktop, tablet, mobile, keyboard, and reduced-motion settings.

- [ ] **Step 1: Start the marketing app**

Run:

```bash
bun run dev:marketing
```

Expected: Next.js serves the marketing app on `http://localhost:3000`.

- [ ] **Step 2: Capture the required viewport set**

Use browser automation to capture full-page screenshots at widths `320`, `390`, `768`, `1024`, `1280`, and `1440` px. At each width verify:

- No horizontal scroll.
- No heading or CTA overflow.
- Header and mobile menu remain operable.
- Hero reading order is copy, photograph, then product proof.
- Sticky transformation becomes a normal vertical sequence below `1024px`.
- Pricing selector remains fully visible and usable.
- FAQ and final CTA do not create nested-card framing.

- [ ] **Step 3: Verify interaction and keyboard behavior**

Use Tab and Shift+Tab from the skip link through the entire page. Verify visible focus on navigation, signup, demo, transformation controls, practitioner-control buttons, billing buttons, FAQ summaries, legal links, and footer links. Activate the mobile menu and confirm selecting a link removes `open`.

- [ ] **Step 4: Verify reduced motion**

Emulate `prefers-reduced-motion: reduce`, reload, and verify all content remains visible. Confirm there is no transform choreography, smooth scrolling, or FAQ transition under reduced motion.

- [ ] **Step 5: Verify color contrast and generated media**

Check body copy on canvas, violet, blue, and anthracite surfaces against WCAG AA. Inspect all three generated images at desktop and mobile crops for face, hand, and animal-anatomy defects and verify the alt text matches visible content.

- [ ] **Step 6: Fix defects with focused regression tests**

For every defect, first add a failing assertion to the closest test, run that single test to confirm failure, patch the implicated component or CSS with `apply_patch`, and rerun the single test. Do not combine unrelated visual fixes.

- [ ] **Step 7: Run final verification**

Run:

```bash
bun test apps/marketing/__tests__
bun --filter @biume/marketing lint
bun --filter @biume/marketing build
git diff --check
```

Expected: all commands exit 0, all tests pass, and `git diff --check` prints no errors.

- [ ] **Step 8: Commit verified polish**

```bash
git add apps/marketing
git commit -m "fix(marketing): polish responsive atelier landing"
```
