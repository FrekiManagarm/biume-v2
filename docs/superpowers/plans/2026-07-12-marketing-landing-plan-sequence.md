# Cinematic Marketing Landing — Plan-séquence Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Re-stage the approved Biume marketing homepage as an original, conversion-focused five-scene documentary plan-séquence while preserving every factual claim, price, CTA destination, SEO contract, accessibility guarantee, and performance budget.

**Architecture:** Keep `app/page.tsx` and all meaningful copy as React Server Components. Add two narrowly scoped client leaves: one IntersectionObserver scene controller that exposes the active scene as a root data attribute, and one Motion-powered hero-media raccord that animates only `transform`. Keep the existing pricing selector client island, convert the report story back to a fully server-rendered CSS composition, and use the shared scene controller only for page-level atmosphere such as the header state. Tailwind v4 remains the styling system; the cinematic art direction lives in the existing scoped global stylesheet and does not create a second design system.

**Tech Stack:** Next.js 16 App Router, React 19 Server Components, TypeScript, Tailwind CSS v4, Motion 12 (`motion/react` with `LazyMotion` + `domAnimation`), Bun test runner, Bun/Turbo, Next image optimization, Playwright, Lighthouse.

## Global Constraints

- Work only in `/Users/mathieuchambaud/Documents/Perso-Projects/biume-v2/.worktrees/marketing-cinematic-plan-sequence` on `codex/marketing-cinematic-plan-sequence`.
- Treat `docs/superpowers/specs/2026-07-12-marketing-landing-plan-sequence-design.md` as the source of truth.
- Keep exactly five `<section data-landing-section>` elements in this order: `hero`, `transformation`, `product-proof`, `pricing`, `faq-cta`.
- Preserve all approved copy, prices, claims, schema data, signup destinations, privacy/CGU links, and `data-conversion` hooks.
- Never add unsupported testimonials, fabricated metrics, automatic-sharing claims, video, audio, WebGL, GSAP, scroll hijacking, a custom cursor, or perpetual motion.
- Keep all essential copy and controls visible in server markup with JavaScript disabled. Never use `opacity: 0`, `visibility: hidden`, or off-screen positioning for semantic content.
- Animate only `transform` and, for decorative crossfades only, `opacity`. Honor `prefers-reduced-motion` with a fully readable static composition.
- Use the existing Biume violet, ink, canvas, green, and blue tokens. Violet is reserved for conversion/action and small editorial accents; green is confirmation; blue is informational. Do not introduce a rainbow palette or decorative brand gradients; photographic legibility scrims and the dark-to-paper raccord are the only gradients allowed.
- Keep `apps/marketing/app/globals.css` Tailwind discovery directives intact. Never delete `.next` as a first response to a style issue; first restart the marketing dev server and inspect emitted CSS.
- Performance acceptance: mobile Lighthouse performance >= 95; accessibility and SEO = 100; LCP < 2.5 s; CLS < 0.1; TBT < 100 ms; cinematic JavaScript addition <= 20 KB gzip; mobile hero source <= 24 KiB.
- Editorial acceptance: the main narrative fits <= 7 viewports at 1440×1000 and <= 8 viewports at 390×844 without hiding content.
- Use `apply_patch` for source edits, Bun for all package commands, and make the small commits listed below.

---

## File Map

### Create

- `apps/marketing/components/landing/cinematic-scene-controller.tsx` — observes the five scenes and writes `data-cinematic-scene` on `<html>`.
- `apps/marketing/components/landing/cinematic-hero-media.tsx` — one Motion client leaf for restrained hero image depth/raccord.
- `apps/marketing/__tests__/cinematic-scene-controller.test.tsx` — source-level contract for observer lifecycle and no scroll listener.
- `apps/marketing/__tests__/cinematic-hero-media.test.tsx` — Motion bundle, reduced-motion, and transform-only contract.
- `apps/marketing/__tests__/cinematic-assets.test.ts` — mobile hero file signature and byte-budget contract.
- `apps/marketing/public/assets/images/landing/hero-practitioner-horse-mobile.webp` — 4:5 mobile art-direction source, <= 24 KiB.

### Modify

- `apps/marketing/app/page.tsx` — mount the scene controller and apply the cinematic root class while keeping five server-rendered scenes.
- `apps/marketing/app/globals.css` — cinematic variables, scene raccords, header states, responsive composition, and reduced-motion rules.
- `apps/marketing/components/landing/header-motion.tsx` — add stable cinematic header hooks; remain server-side.
- `apps/marketing/components/landing/landing-hero.tsx` — full-bleed documentary hero, art-directed `<picture>`, server-rendered copy and CTA.
- `apps/marketing/components/landing/report-transformation-story.tsx` — remove local client observer and become the server-rendered “La trace” act.
- `apps/marketing/components/landing/product-proof.tsx` — stage editor/PDF/reminder as “Le document,” not a card collection.
- `apps/marketing/components/landing/pricing-decision.tsx` — stage control statement and offer as the quiet “Le choix” act.
- `apps/marketing/components/landing/landing-faq.tsx` — editorial objection handling inside “La suite.”
- `apps/marketing/components/landing/final-cta.tsx` — photographic epilogue with one dominant signup action.
- `apps/marketing/__tests__/home-landing.test.tsx` — five-act, hydration-island, conversion, and factual contracts.
- `apps/marketing/__tests__/landing-hero.test.tsx` — art direction, priority/LCP, copy, and server/client boundary contracts.
- `apps/marketing/__tests__/report-transformation-story.test.tsx` — four-state story and server-rendering contract.
- `apps/marketing/__tests__/product-proof.test.tsx` — scene label and proof hierarchy contract.
- `apps/marketing/__tests__/pricing-decision.test.tsx` — scene label, control, price, and single-action contract.
- `apps/marketing/__tests__/landing-close.test.tsx` — scene-five and epilogue contract.

### Preserve unchanged

- `apps/marketing/components/landing/pricing-selector.tsx` — existing `useState` client island and accessible live region.
- `apps/marketing/components/landing/report-transformation-demo.ts` — factual report content.
- `apps/marketing/lib/web-app-url.ts` — signup/signin destination builder.
- `apps/marketing/app/layout.tsx` and `apps/marketing/lib/seo.tsx` — metadata/schema behavior.
- `packages/ui/src/styles/globals.css` — shared Tailwind setup.

---

## Task 1: Lock the cinematic page contract and mobile asset budget

**Files:**

- Create: `apps/marketing/__tests__/cinematic-assets.test.ts`
- Create: `apps/marketing/public/assets/images/landing/hero-practitioner-horse-mobile.webp`

- [ ] **Step 1: Write the failing mobile-asset budget test**

Create `cinematic-assets.test.ts`:

```ts
import { describe, expect, test } from "bun:test";

describe("cinematic landing assets", () => {
  test("keeps the mobile hero as a small WebP source", async () => {
    const asset = Bun.file(
      new URL(
        "../public/assets/images/landing/hero-practitioner-horse-mobile.webp",
        import.meta.url,
      ),
    );
    const bytes = new Uint8Array(await asset.arrayBuffer());
    const signature = new TextDecoder().decode(bytes.slice(0, 12));

    expect(signature.slice(0, 4)).toBe("RIFF");
    expect(signature.slice(8, 12)).toBe("WEBP");
    expect(asset.size).toBeLessThanOrEqual(24 * 1024);
  });
});
```

- [ ] **Step 2: Run the asset test and confirm the missing-file failure**

```bash
bun test apps/marketing/__tests__/cinematic-assets.test.ts
```

Expected: missing/empty asset makes the RIFF/WEBP assertions fail.

- [ ] **Step 3: Generate the mobile art-direction source from the approved photograph**

Run from the worktree root:

```bash
ffmpeg -y \
  -i apps/marketing/public/assets/images/landing/hero-practitioner-horse.png \
  -vf "scale=640:800:flags=lanczos" \
  -frames:v 1 -c:v libwebp -quality 48 -compression_level 6 \
  apps/marketing/public/assets/images/landing/hero-practitioner-horse-mobile.webp
file apps/marketing/public/assets/images/landing/hero-practitioner-horse-mobile.webp
wc -c apps/marketing/public/assets/images/landing/hero-practitioner-horse-mobile.webp
```

Expected: `Web/P image`, 640×800, and byte count <= `24576`. If the count is higher, rerun the same command with `-quality 44`; do not reduce dimensions below 640×800.

- [ ] **Step 4: Run the asset test and commit green**

```bash
bun test apps/marketing/__tests__/cinematic-assets.test.ts
git add apps/marketing/__tests__/cinematic-assets.test.ts apps/marketing/public/assets/images/landing/hero-practitioner-horse-mobile.webp
git commit -m "feat(marketing): add mobile cinematic hero asset"
```

Expected: one asset test passes and the commit succeeds with a green suite.

---

## Task 2: Add the global scene controller without scroll listeners

**Files:**

- Create: `apps/marketing/components/landing/cinematic-scene-controller.tsx`
- Create: `apps/marketing/__tests__/cinematic-scene-controller.test.tsx`
- Modify: `apps/marketing/app/page.tsx`
- Modify: `apps/marketing/__tests__/home-landing.test.tsx`

- [ ] **Step 1: Write the failing observer-lifecycle test**

Create `cinematic-scene-controller.test.tsx`:

```tsx
import { describe, expect, test } from "bun:test";

describe("cinematic scene controller", () => {
  test("uses one observer and never installs a raw scroll listener", async () => {
    const source = await Bun.file(
      new URL(
        "../components/landing/cinematic-scene-controller.tsx",
        import.meta.url,
      ),
    ).text();

    expect(source).toMatch(/^"use client";/);
    expect(source).toContain("IntersectionObserver");
    expect(source).toContain('[data-landing-section]');
    expect(source).toContain("data-cinematic-scene");
    expect(source).toContain("observer.disconnect()");
    expect(source).not.toContain('addEventListener("scroll"');
    expect(source).not.toContain('from "motion/react"');
    expect(source).not.toContain("repeat: Infinity");
  });
});
```

In `home-landing.test.tsx`, rename the suite to `Biume cinematic plan-sequence homepage` and add `expect(html).toContain("cinematic-theme");` to the five-section assembly test.

- [ ] **Step 2: Run the test and confirm the missing-module failure**

```bash
bun test apps/marketing/__tests__/cinematic-scene-controller.test.tsx apps/marketing/__tests__/home-landing.test.tsx
```

Expected: `ENOENT` for `cinematic-scene-controller.tsx` and a missing `cinematic-theme` assertion.

- [ ] **Step 3: Implement the minimal client controller**

Create `cinematic-scene-controller.tsx` with this interface and lifecycle:

```tsx
"use client";

import { useEffect } from "react";

const SCENE_SELECTOR = "[data-landing-section]";

export function CinematicSceneController() {
  useEffect(() => {
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>(SCENE_SELECTOR),
    );
    const ratios = new Map<Element, number>();

    const setScene = (section: HTMLElement) => {
      const scene = section.dataset.landingSection;
      if (scene) document.documentElement.dataset.cinematicScene = scene;
    };

    if (sections[0]) setScene(sections[0]);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) ratios.set(entry.target, entry.intersectionRatio);

        const active = sections.reduce<HTMLElement | undefined>(
          (best, section) =>
            !best || (ratios.get(section) ?? 0) > (ratios.get(best) ?? 0)
              ? section
              : best,
          undefined,
        );
        if (active && (ratios.get(active) ?? 0) > 0) setScene(active);
      },
      { rootMargin: "-18% 0px -52%", threshold: [0, 0.15, 0.35, 0.6] },
    );

    for (const section of sections) observer.observe(section);
    return () => {
      observer.disconnect();
      delete document.documentElement.dataset.cinematicScene;
    };
  }, []);

  return null;
}
```

Format the callback over multiple lines if ESLint requires it; preserve the behavior exactly.

- [ ] **Step 4: Mount the controller and cinematic theme in the server page**

In `app/page.tsx`, import `CinematicSceneController`, render it immediately inside the root `<div>`, and change the root class prefix to:

```tsx
<div className="carnet-theme cinematic-theme min-h-dvh overflow-x-clip ...">
  <CinematicSceneController />
```

Do not move `JsonLd`, the header, or any section into a client component.

- [ ] **Step 5: Run the controller and homepage tests**

```bash
bun test apps/marketing/__tests__/cinematic-scene-controller.test.tsx apps/marketing/__tests__/home-landing.test.tsx
```

Expected: controller and homepage tests pass; all five existing sections and factual contracts remain intact.

- [ ] **Step 6: Commit**

```bash
git add apps/marketing/components/landing/cinematic-scene-controller.tsx apps/marketing/__tests__/cinematic-scene-controller.test.tsx apps/marketing/app/page.tsx apps/marketing/__tests__/home-landing.test.tsx
git commit -m "feat(marketing): add cinematic scene controller"
```

---

## Task 3: Build the full-bleed documentary hero and cinematic header

**Files:**

- Create: `apps/marketing/components/landing/cinematic-hero-media.tsx`
- Create: `apps/marketing/__tests__/cinematic-hero-media.test.tsx`
- Modify: `apps/marketing/components/landing/landing-hero.tsx`
- Modify: `apps/marketing/components/landing/header-motion.tsx`
- Modify: `apps/marketing/app/globals.css`
- Modify: `apps/marketing/__tests__/landing-hero.test.tsx`

- [ ] **Step 1: Write the failing Motion-budget test**

Create `cinematic-hero-media.test.tsx`:

```tsx
import { describe, expect, test } from "bun:test";

describe("cinematic hero media", () => {
  test("loads the small Motion feature bundle and honors reduced motion", async () => {
    const source = await Bun.file(
      new URL("../components/landing/cinematic-hero-media.tsx", import.meta.url),
    ).text();

    expect(source).toMatch(/^"use client";/);
    expect(source).toContain("LazyMotion");
    expect(source).toContain("domAnimation");
    expect(source).toContain("useReducedMotion");
    expect(source).toContain("useScroll");
    expect(source).toContain("useTransform");
    expect(source).not.toContain("domMax");
    expect(source).not.toContain("AnimatePresence");
    expect(source).not.toContain("repeat: Infinity");
    expect(source).not.toMatch(/filter:|blur\(|boxShadow:/);
  });
});
```

In `landing-hero.test.tsx`, replace the old lazy/desktop-only photo assertions with:

```ts
expect(html).toContain("hero-practitioner-horse-mobile.webp");
expect(html).toContain("hero-practitioner-horse.png");
expect(html).toContain("<picture");
expect(html).toContain('media="(max-width: 767px)"');
expect(html.toLowerCase()).toContain('fetchpriority="high"');
expect(html).not.toContain('loading="lazy"');
expect(html).toContain('data-cinematic-hero-media="true"');
expect(html).toContain("Scène 01 · Le geste");
```

Keep all approved-copy, CTA, product-fragment, and unsupported-claim assertions.

- [ ] **Step 2: Run the test and confirm the missing-module failure**

```bash
bun test apps/marketing/__tests__/cinematic-hero-media.test.tsx apps/marketing/__tests__/landing-hero.test.tsx
```

Expected: missing cinematic media module plus the red `<picture>`/priority assertions.

- [ ] **Step 3: Implement the transform-only media leaf**

Create `cinematic-hero-media.tsx`:

```tsx
"use client";

import { domAnimation, LazyMotion, m, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";

export type CinematicHeroMediaProps = {
  alt: string;
  desktop: { src: string; srcSet?: string; sizes?: string };
  mobile: { srcSet?: string };
};

export function CinematicHeroMedia({ alt, desktop, mobile }: CinematicHeroMediaProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: frameRef,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "7%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.035]);

  return (
    <LazyMotion features={domAnimation} strict>
      <div ref={frameRef} data-cinematic-hero-media="true" className="cinematic-hero-media">
        <m.div
          className="cinematic-hero-media__depth"
          style={reduceMotion ? undefined : { y, scale }}
        >
          <picture>
            <source media="(max-width: 767px)" srcSet={mobile.srcSet} />
            <img
              src={desktop.src}
              srcSet={desktop.srcSet}
              sizes={desktop.sizes}
              alt={alt}
              width={1122}
              height={1402}
              fetchPriority="high"
              className="cinematic-hero-media__image"
            />
          </picture>
        </m.div>
      </div>
    </LazyMotion>
  );
}
```

Line-wrap imports and props to satisfy formatting. Do not add an initial opacity or initial hidden state.

- [ ] **Step 4: Convert the server hero to an art-directed `<picture>`**

In `landing-hero.tsx`:

1. Replace `Image` with `getImageProps` from `next/image`.
2. Import `CinematicHeroMedia`.
3. Build props inside `LandingHero`:

```tsx
const alt = "Une ostéopathe animalière observe un cheval pendant une séance";
const desktopImage = getImageProps({
  src: "/assets/images/landing/hero-practitioner-horse.png",
  alt,
  width: 1122,
  height: 1402,
  quality: 55,
  sizes: "(min-width: 1280px) 100vw, 100vw",
});
const mobileImage = getImageProps({
  src: "/assets/images/landing/hero-practitioner-horse-mobile.webp",
  alt,
  width: 640,
  height: 800,
  quality: 48,
  sizes: "100vw",
});
```

Pass only serializable strings into the client leaf:

```tsx
<CinematicHeroMedia
  alt={alt}
  desktop={{
    src: desktopImage.props.src,
    srcSet: desktopImage.props.srcSet,
    sizes: desktopImage.props.sizes,
  }}
  mobile={{ srcSet: mobileImage.props.srcSet }}
/>
```

4. Restructure the section as one full-bleed frame. Keep the copy lower-left, CTA row above the fold, reassurance line beneath it, and the product proof as a restrained document fragment near the lower-right. Add this visible label before the eyebrow:

```tsx
<p className="cinematic-scene-label">Scène 01 · Le geste</p>
```

5. Keep the exact existing H1, paragraph, CTA labels, reassurance strings, proposal text, and `data-conversion="hero-signup"`.

The section shell must be:

```tsx
<section
  data-landing-section="hero"
  className="cinematic-hero relative isolate min-h-[calc(100svh-4.5rem)] overflow-hidden"
>
```

- [ ] **Step 5: Add stable header hooks without hydration**

In `header-motion.tsx`, add `data-cinematic-header` to the `<header>` and `data-cinematic-header-surface` to the surface. Keep the component server-side and visible without JS.

- [ ] **Step 6: Add the cinematic hero/header CSS**

Append scoped rules under `.cinematic-theme` in `globals.css`:

```css
.cinematic-theme {
  --cinematic-night: #171319;
  --cinematic-paper: #f4efe5;
  --cinematic-rust: #a8452e;
}

.cinematic-hero { background: var(--cinematic-night); color: #fffaf2; }
.cinematic-hero-media { position: absolute; inset: 0; z-index: -2; overflow: hidden; }
.cinematic-hero-media__depth,
.cinematic-hero-media__depth picture { display: block; width: 100%; height: 100%; }
.cinematic-hero-media__depth { transform-origin: 50% 35%; }
.cinematic-hero-media__image { width: 100%; height: 100%; object-fit: cover; object-position: 58% 42%; }
.cinematic-hero::after {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -1;
  background: linear-gradient(90deg, rgba(16, 12, 17, 0.88) 0%, rgba(16, 12, 17, 0.38) 55%, rgba(16, 12, 17, 0.08) 100%);
  pointer-events: none;
}
.cinematic-scene-label { font-family: var(--font-geist-mono); font-size: 0.68rem; font-weight: 650; letter-spacing: 0.16em; text-transform: uppercase; }

[data-cinematic-header] { transition: color 240ms ease, border-color 240ms ease; }
[data-cinematic-header-surface] { transition: background-color 240ms ease, opacity 240ms ease; }
html[data-cinematic-scene="hero"] [data-cinematic-header] { color: #fffaf2; border-color: rgba(255, 250, 242, 0.18); }
html[data-cinematic-scene="hero"] [data-cinematic-header-surface] { background: transparent; opacity: 0; }

@media (max-width: 767px) {
  .cinematic-hero-media__image { object-position: 56% 38%; }
  .cinematic-hero::after { background: linear-gradient(0deg, rgba(16, 12, 17, 0.92) 0%, rgba(16, 12, 17, 0.35) 62%, rgba(16, 12, 17, 0.12) 100%); }
}

@media (prefers-reduced-motion: reduce) {
  [data-cinematic-header],
  [data-cinematic-header-surface],
  .cinematic-hero-media__depth { transition: none; transform: none !important; }
}
```

The gradient here is a photographic legibility scrim, not a decorative brand gradient. Do not use gradient text or multiple color stops elsewhere.

- [ ] **Step 7: Run focused tests and lint**

```bash
bun test apps/marketing/__tests__/cinematic-hero-media.test.tsx apps/marketing/__tests__/landing-hero.test.tsx apps/marketing/__tests__/home-landing.test.tsx
bun --filter @biume/marketing lint
```

Expected: hero/media and homepage tests pass. ESLint exits 0.

- [ ] **Step 8: Commit**

```bash
git add apps/marketing/components/landing/cinematic-hero-media.tsx apps/marketing/components/landing/landing-hero.tsx apps/marketing/components/landing/header-motion.tsx apps/marketing/app/globals.css apps/marketing/__tests__/cinematic-hero-media.test.tsx apps/marketing/__tests__/landing-hero.test.tsx
git commit -m "feat(marketing): stage cinematic documentary hero"
```

---

## Task 4: Turn the report transformation into the dark “La trace” act

**Files:**

- Modify: `apps/marketing/components/landing/report-transformation-story.tsx`
- Modify: `apps/marketing/app/globals.css`
- Modify: `apps/marketing/__tests__/report-transformation-story.test.tsx`
- Modify: `apps/marketing/__tests__/home-landing.test.tsx`

- [ ] **Step 1: Replace the local-observer test with a server-story contract**

In `report-transformation-story.test.tsx`, keep the four factual-state assertions and replace the observer assertions with:

```ts
expect(source).not.toContain('"use client"');
expect(source).not.toContain("useEffect");
expect(source).not.toContain("IntersectionObserver");
expect(source).not.toContain('from "motion/react"');
expect(html).toContain("Scène 02 · La trace");
expect(html).toContain('data-report-raccord="gesture-to-document"');
expect(html).not.toMatch(exactZeroOpacity);
```

In `home-landing.test.tsx`, update the hydration contract now that all final boundaries exist:

```ts
const clientIslands = [
  "../components/landing/cinematic-scene-controller.tsx",
  "../components/landing/cinematic-hero-media.tsx",
  "../components/landing/pricing-selector.tsx",
];
```

Move `report-transformation-story.tsx` into `serverComponents`. Keep `landing-hero.tsx` server-side and add `cinematic-hero-media.tsx` only to `clientIslands`.

- [ ] **Step 2: Run the focused test and confirm failure**

```bash
bun test apps/marketing/__tests__/report-transformation-story.test.tsx apps/marketing/__tests__/home-landing.test.tsx
```

Expected: failures because the component is still a client observer and has no scene/raccord label.

- [ ] **Step 3: Make the transformation story server-rendered**

Remove `"use client"`, React hooks, ratio maps, local IntersectionObserver, active-index state, and any `data-active` logic from `report-transformation-story.tsx`. Render all four existing states in their current order as static semantic articles inside:

```tsx
<section
  id="produit"
  data-landing-section="transformation"
  data-report-raccord="gesture-to-document"
  className="cinematic-trace scroll-mt-18 px-4 py-10 sm:px-6 md:py-20 lg:px-8"
>
```

Place `<p className="cinematic-scene-label">Scène 02 · La trace</p>` above the existing heading. Preserve the exact line `Une note devient un document que le propriétaire peut comprendre.` and the four report values from `REPORT_TRANSFORMATION_DEMO`.

Use a numbered editorial rail (`01`–`04`) and one large paper surface; do not wrap every state in a floating rounded card. The first state is a rust pencil annotation and the last state is the finished paper, but every state remains present and readable in source order.

- [ ] **Step 4: Add the dark-to-paper raccord CSS**

Add scoped styles:

```css
.cinematic-trace {
  position: relative;
  background: var(--cinematic-night);
  color: #fffaf2;
}
.cinematic-trace::before {
  content: "";
  position: absolute;
  inset: 0 0 auto;
  height: 9rem;
  background: linear-gradient(180deg, rgba(16, 12, 17, 0), var(--cinematic-night));
  transform: translateY(-100%);
  pointer-events: none;
}
.cinematic-report-paper {
  background: var(--cinematic-paper);
  color: var(--carnet-ink);
  box-shadow: 0 48px 110px -72px rgba(0, 0, 0, 0.8);
}
.cinematic-report-rule { background: var(--cinematic-rust); }
```

Use only these semantic colors in the act: night, paper, rust, and existing muted ink. Remove any violet/blue/green decoration from the transformation scene except a factual “validated” status that may remain green.

- [ ] **Step 5: Run focused tests**

```bash
bun test apps/marketing/__tests__/report-transformation-story.test.tsx apps/marketing/__tests__/home-landing.test.tsx
```

Expected: report and homepage tests pass, including the exact three-island boundary.

- [ ] **Step 6: Commit**

```bash
git add apps/marketing/components/landing/report-transformation-story.tsx apps/marketing/app/globals.css apps/marketing/__tests__/report-transformation-story.test.tsx apps/marketing/__tests__/home-landing.test.tsx
git commit -m "feat(marketing): create report transformation act"
```

---

## Task 5: Stage the editor and outcomes as “Le document”

**Files:**

- Modify: `apps/marketing/components/landing/product-proof.tsx`
- Modify: `apps/marketing/app/globals.css`
- Modify: `apps/marketing/__tests__/product-proof.test.tsx`

- [ ] **Step 1: Write the failing scene and hierarchy assertions**

Add to `product-proof.test.tsx`:

```ts
expect(html).toContain("Scène 03 · Le document");
expect(html).toContain('data-product-stage="editor"');
expect(html).toContain('data-product-outcomes="true"');
expect(html.match(/data-product-editor=/g)).toHaveLength(1);
expect(html.match(/data-product-output=/g)).toHaveLength(2);
expect(html).not.toMatch(exactZeroOpacity);
```

Import `exactZeroOpacity` from `landing-test-utils`.

- [ ] **Step 2: Run and confirm the new assertions fail**

```bash
bun test apps/marketing/__tests__/product-proof.test.tsx
```

Expected: failures for the missing scene/stage/outcome hooks only.

- [ ] **Step 3: Recompose the proof as one operational stage**

In `product-proof.tsx`:

- Add `<p className="cinematic-scene-label">Scène 03 · Le document</p>` before the current eyebrow.
- Add `data-product-stage="editor"` to the single composition wrapper around the editor.
- Add `data-product-outcomes="true"` to the wrapper containing PDF and reminder.
- Keep every current capability and factual output verbatim.
- Make the editor occupy the dominant 70% column; visually connect PDF and reminder with a thin rule originating from the editor footer.
- Reduce card language: the two outputs may keep one border and paper background, but remove their unrelated asymmetric radii and colored tile backgrounds.

Use this desktop grid:

```tsx
className="cinematic-product-stage mt-10 grid gap-0 md:mt-14 lg:grid-cols-[minmax(0,1.42fr)_minmax(18rem,0.58fr)] lg:items-center"
```

- [ ] **Step 4: Add restrained document-stage CSS**

```css
.cinematic-product-stage { position: relative; }
.cinematic-product-stage [data-product-editor] { position: relative; z-index: 1; }
.cinematic-product-stage [data-product-outcomes="true"] { position: relative; }
@media (min-width: 1024px) {
  .cinematic-product-stage [data-product-outcomes="true"]::before {
    content: "";
    position: absolute;
    top: 50%;
    right: 100%;
    width: 4rem;
    height: 1px;
    background: var(--carnet-line);
  }
}
```

- [ ] **Step 5: Run tests and commit**

```bash
bun test apps/marketing/__tests__/product-proof.test.tsx apps/marketing/__tests__/home-landing.test.tsx
git add apps/marketing/components/landing/product-proof.tsx apps/marketing/app/globals.css apps/marketing/__tests__/product-proof.test.tsx
git commit -m "feat(marketing): stage product document proof"
```

Expected: product proof and homepage tests pass.

---

## Task 6: Make pricing the quiet “Le choix” conversion act

**Files:**

- Modify: `apps/marketing/components/landing/pricing-decision.tsx`
- Modify: `apps/marketing/app/globals.css`
- Modify: `apps/marketing/__tests__/pricing-decision.test.tsx`

- [ ] **Step 1: Write the failing scene and action assertions**

Add to the first pricing test:

```ts
expect(html).toContain("Scène 04 · Le choix");
expect(html).toContain('data-pricing-stage="decision"');
expect(html).toContain('data-pricing-offer="single"');
expect(html.match(/data-conversion="pricing-signup"/g)).toHaveLength(1);
```

- [ ] **Step 2: Run and confirm failure**

```bash
bun test apps/marketing/__tests__/pricing-decision.test.tsx
```

Expected: missing scene/stage/offer hooks; all price and accessibility assertions still pass.

- [ ] **Step 3: Recompose pricing without changing its behavior**

In `pricing-decision.tsx`:

- Add `<p className="cinematic-scene-label">Scène 04 · Le choix</p>` above `Biume prépare. Vous décidez.`
- Add `data-pricing-stage="decision"` to the section’s inner wrapper.
- Add `data-pricing-offer="single"` to the wrapper containing `PricingSelector` and the CTA.
- Preserve `billingOptions`, all included features, `PricingSelector`, `prefetch={false}`, and the one `pricing-signup` link.
- Remove the default “floating pricing card” shadow. Use a quiet paper column separated by one vertical rule on desktop and one top rule on mobile.
- Keep violet on the selected billing state and the signup button only; use ink/line/canvas elsewhere.

- [ ] **Step 4: Add the pricing stage CSS**

```css
.cinematic-pricing-offer {
  border-top: 1px solid var(--carnet-line);
  background: transparent;
}
@media (min-width: 1024px) {
  .cinematic-pricing-offer {
    border-top: 0;
    border-left: 1px solid var(--carnet-line);
  }
}
```

Apply `cinematic-pricing-offer` to `data-pricing-offer="single"` and remove the old box shadow/radius wrapper classes.

- [ ] **Step 5: Run tests and commit**

```bash
bun test apps/marketing/__tests__/pricing-decision.test.tsx apps/marketing/__tests__/home-landing.test.tsx
git add apps/marketing/components/landing/pricing-decision.tsx apps/marketing/app/globals.css apps/marketing/__tests__/pricing-decision.test.tsx
git commit -m "feat(marketing): focus cinematic pricing decision"
```

Expected: pricing and homepage tests pass.

---

## Task 7: Finish with the human “La suite” epilogue

**Files:**

- Modify: `apps/marketing/app/page.tsx`
- Modify: `apps/marketing/components/landing/landing-faq.tsx`
- Modify: `apps/marketing/components/landing/final-cta.tsx`
- Modify: `apps/marketing/app/globals.css`
- Modify: `apps/marketing/__tests__/landing-close.test.tsx`
- Modify: `apps/marketing/__tests__/home-landing.test.tsx`

- [ ] **Step 1: Write the failing fifth-scene/epilogue assertions**

Add to `landing-close.test.tsx`:

```ts
expect(html).toContain('data-epilogue="human-followup"');
expect(html).toContain("practitioner-owner-animal.png");
expect(html).not.toMatch(exactZeroOpacity);
```

Import `exactZeroOpacity`. In `home-landing.test.tsx`, require `Scène 05 · La suite` and `data-epilogue="human-followup"`.

- [ ] **Step 2: Run and confirm failure**

```bash
bun test apps/marketing/__tests__/landing-close.test.tsx apps/marketing/__tests__/home-landing.test.tsx
```

Expected: missing scene/epilogue hooks.

- [ ] **Step 3: Give the fifth section an editorial opening**

In the `faq-cta` section inside `app/page.tsx`, add this before `<LandingFaq />`:

```tsx
<p className="cinematic-scene-label mb-8 md:mb-12">Scène 05 · La suite</p>
```

Preserve the section ID, marker, compact mobile spacing, FAQ, and final CTA.

In `home-landing.test.tsx`, lock the completed narrative with:

```ts
for (const label of [
  "Scène 01 · Le geste",
  "Scène 02 · La trace",
  "Scène 03 · Le document",
  "Scène 04 · Le choix",
  "Scène 05 · La suite",
]) {
  expect(text).toContain(label);
}
```

- [ ] **Step 4: Refine FAQ typography and photographic epilogue**

In `landing-faq.tsx`, keep native `<details>`, all five answers, legal links, 44px targets, and no hydration. Remove pill-like decoration from the `+` indicator: use a typographic plus with a single bottom rule per item.

In `final-cta.tsx`:

- Add `data-epilogue="human-followup"` to the `<aside>`.
- Keep the existing photograph, exact copy, and only one signup anchor.
- Change the image to fill roughly 58% of the desktop width and let the text overlap the photographic boundary by at most 4rem on desktop.
- Remove the generic rounded-card outline; use an editorial top rule and a paper text panel.
- Keep `Image` responsive and below-the-fold lazy by default.

- [ ] **Step 5: Add epilogue CSS and reduced-motion-safe details behavior**

```css
.cinematic-epilogue {
  border-top: 1px solid var(--carnet-line);
  background: var(--cinematic-paper);
}
.cinematic-epilogue-copy { position: relative; z-index: 1; }
@media (min-width: 1024px) {
  .cinematic-epilogue-copy { margin-left: -4rem; }
}
```

Apply these classes in `final-cta.tsx`. Keep the existing reduced-motion block for native details transitions; no FAQ answer may be hidden by CSS when `<details open>`.

- [ ] **Step 6: Run the close and full homepage tests**

```bash
bun test apps/marketing/__tests__/landing-close.test.tsx apps/marketing/__tests__/home-landing.test.tsx
```

Expected: both files pass, including exact five-section order, factual claims, signup mappings, and scene labels.

- [ ] **Step 7: Commit**

```bash
git add apps/marketing/app/page.tsx apps/marketing/components/landing/landing-faq.tsx apps/marketing/components/landing/final-cta.tsx apps/marketing/app/globals.css apps/marketing/__tests__/landing-close.test.tsx apps/marketing/__tests__/home-landing.test.tsx
git commit -m "feat(marketing): complete cinematic human epilogue"
```

---

## Task 8: Integrate the five acts and enforce no-JS/reduced-motion semantics

**Files:**

- Modify: `apps/marketing/app/globals.css`
- Modify: `apps/marketing/__tests__/home-landing.test.tsx`
- Modify: `apps/marketing/__tests__/landing-hero.test.tsx`
- Modify: `apps/marketing/__tests__/report-transformation-story.test.tsx`

- [ ] **Step 1: Add failing global semantic safeguards**

In `home-landing.test.tsx`, add:

```ts
expect(html).not.toMatch(/style="[^"]*opacity:\s*0(?:[;\s"])/i);
expect(html).not.toContain("visibility:hidden");
expect(html).not.toContain('aria-hidden="true" data-report-state');
```

Add a source/CSS test:

```ts
expect(css).toContain("@media (prefers-reduced-motion: reduce)");
expect(css).toMatch(/\.cinematic-hero-media__depth[^}]*transform:\s*none\s*!important/s);
expect(css).not.toContain("scroll-snap-type");
expect(css).not.toContain("cursor: none");
expect(css).not.toContain("background-clip: text");
expect(css).not.toContain("@keyframes landing-hero-enter");
expect(css).not.toContain("@keyframes landing-hero-photo-enter");
```

- [ ] **Step 2: Run the full marketing suite and observe any contract failures**

```bash
cd apps/marketing && bun test
```

Expected before fixes: only assertions that expose a remaining hidden semantic state, old animation rule, or CSS forbidden pattern may fail; there must be no factual-copy regression.

- [ ] **Step 3: Remove obsolete Carnet hero/report CSS**

In `globals.css`, delete rules no longer referenced by source, including old `.landing-hero-entry`, `.landing-hero-photo`, `@keyframes landing-hero-enter`, `@keyframes landing-hero-photo-enter`, and old report `data-active` selectors. Keep generic `.carnet-theme`, token definitions, button behavior, details behavior, Tailwind imports/sources, and all legal-page styles.

Search before removal:

```bash
rg -n "landing-hero-entry|landing-hero-photo|data-active|report.*active" apps/marketing
```

Expected after source cleanup: matches exist only in tests/CSS slated for deletion, then no matches after test updates.

- [ ] **Step 4: Make the static fallback deliberately complete**

Ensure default CSS shows:

- the full hero image and copy before hydration;
- a solid readable header before the scene controller sets a root attribute;
- all four report states in document order;
- both prices through the existing selector server output;
- all FAQ summaries and native details content;
- the final photograph, copy, and signup CTA.

The active-scene attribute may change color/surface emphasis only. It must never gate semantic display.

- [ ] **Step 5: Run all marketing tests**

```bash
cd apps/marketing && bun test
```

Expected: `81+ pass`, `0 fail`; exact count may increase with the two new test files.

- [ ] **Step 6: Commit integration cleanup**

```bash
git add apps/marketing/app/globals.css apps/marketing/__tests__/home-landing.test.tsx apps/marketing/__tests__/landing-hero.test.tsx apps/marketing/__tests__/report-transformation-story.test.tsx
git commit -m "refactor(marketing): harden cinematic progressive enhancement"
```

---

## Task 9: Production verification, visual QA, and performance gates

**Files:**

- Modify only if verification exposes an in-scope defect in the files above.

- [ ] **Step 1: Run static verification**

```bash
cd /Users/mathieuchambaud/Documents/Perso-Projects/biume-v2/.worktrees/marketing-cinematic-plan-sequence
bun --filter @biume/marketing lint
bun run check-types
bun --filter @biume/marketing build
```

Expected: all commands exit 0. Do not claim success if any command is skipped.

- [ ] **Step 2: Start a clean production server on an unused port**

```bash
PORT=3100 bun --filter @biume/marketing start
```

Run this only after `build`; keep it in a managed terminal session for the following checks. Expected: Next reports ready at `http://localhost:3100`.

- [ ] **Step 3: Run responsive and interaction checks with Playwright**

Use Playwright against `http://localhost:3100` at:

- desktop: 1440×1000;
- tablet: 834×1112;
- mobile: 390×844;
- narrow mobile: 320×700.

At every size verify: no horizontal overflow; five scenes in order; hero H1/primary CTA visible; header readable before and after leaving hero; menu keyboard-operable; four report states readable; annual/monthly selector works; five FAQs open by keyboard; all signup links target the application; final CTA is not clipped.

Save screenshots outside source control under `/tmp/biume-cinematic-qa/`:

```bash
mkdir -p /tmp/biume-cinematic-qa
bunx playwright screenshot --viewport-size="1440,1000" --full-page http://localhost:3100 /tmp/biume-cinematic-qa/desktop.png
bunx playwright screenshot --viewport-size="390,844" --full-page http://localhost:3100 /tmp/biume-cinematic-qa/mobile.png
```

Expected: full-page screenshots exist and show no unstyled HTML, flat card wall, clipped text, accidental color, or large blank gap.

- [ ] **Step 4: Verify reduced motion and no JavaScript**

Use a Playwright script or browser context with `reducedMotion: "reduce"`, then a second context with `javaScriptEnabled: false`. In both contexts assert the H1, all five scene labels, `data-report-state` count 4, `24,99 €`, five FAQ summaries, and final signup CTA are visible. In reduced motion, computed transform on `.cinematic-hero-media__depth` must be `none`.

Expected: all content is readable; no element remains transparent/hidden; the header defaults to its solid surface without JS.

- [ ] **Step 5: Verify the CSS delivery path that previously regressed**

Start the dev server in a separate managed session:

```bash
bun run dev:marketing
```

Open `http://localhost:3000`, hard refresh once, and inspect the returned document/styles. Confirm `.cinematic-theme`, `.cinematic-hero`, Tailwind utility output, and the five styled scenes are present. If HTML appears unstyled, stop and restart this dev process before changing source; compare production port 3100 to isolate an in-memory Next dev compilation issue.

Expected: both production and freshly restarted development servers render styled output.

- [ ] **Step 6: Run Lighthouse budgets**

```bash
mkdir -p /tmp/biume-cinematic-qa
bunx lighthouse http://localhost:3100 \
  --only-categories=performance,accessibility,seo \
  --form-factor=mobile \
  --screenEmulation.mobile=true \
  --output=json \
  --output-path=/tmp/biume-cinematic-qa/lighthouse-mobile.json \
  --chrome-flags="--headless --no-sandbox"
```

Read the report and require:

- performance >= `0.95`;
- accessibility = `1`;
- SEO = `1`;
- LCP < `2500` ms;
- CLS < `0.1`;
- TBT < `100` ms.

Compare with the recorded baseline: mobile 98/100/100 with 2338 ms LCP; desktop 100/100/100 with 554 ms LCP. Any regression below the required gates must be fixed before proceeding.

- [ ] **Step 7: Check JavaScript and page-length budgets**

Inspect the production build output for the route chunks containing `cinematic-hero-media` and `cinematic-scene-controller`; gzip their added client chunks and require combined incremental size <= 20 KiB:

```bash
find apps/marketing/.next/static/chunks -type f -name '*.js' -print0 \
  | xargs -0 rg -l "data-cinematic-scene|data-cinematic-hero-media"
```

Run `gzip -c <each-matched-file> | wc -c` and sum unique files. In screenshots/browser metrics, require the main content height <= 7000 px at 1440×1000 and <= 6752 px at 390×844.

- [ ] **Step 8: Self-review against the spec and scan for placeholders**

```bash
rg -n "T[O]DO|T[B]D|F[I]XME|P[L]ACEHOLDER|lorem ipsum|repeat: Infinity|scroll-snap-type|cursor: none|bg-clip-text" \
  apps/marketing/app apps/marketing/components/landing apps/marketing/__tests__
git diff main...HEAD --check
git status --short
```

Expected: no placeholders/forbidden patterns, no whitespace errors, and only intentional files. Re-read every heading in the approved design spec and explicitly check scenes, color discipline, conversion hierarchy, reduced motion, no-JS, responsive art direction, and performance.

- [ ] **Step 9: Fix any verification defect with a focused regression test**

For each defect: add or tighten the smallest failing Bun test, run it red, patch the minimal source/CSS, rerun it green, then rerun the full marketing suite and affected build/Lighthouse gate. Do not bundle unrelated cleanup.

- [ ] **Step 10: Commit verified polish only if changes were needed**

```bash
git add apps/marketing
git commit -m "fix(marketing): polish cinematic landing verification"
```

If verification required no code changes, do not create an empty commit.

---

## Final Acceptance Checklist

- [ ] Exactly five server-rendered conversion scenes remain in approved order.
- [ ] The experience reads as one documentary plan-séquence, not a collection of generic cards.
- [ ] The hero is immersive on mobile and desktop, art-directed, eager, and performant.
- [ ] The gesture-to-document raccord is legible without JavaScript.
- [ ] Violet, green, blue, rust, paper, night, and ink are used only for their approved roles.
- [ ] Every factual sentence, price, CTA destination, legal link, and schema contract still passes tests.
- [ ] Exactly three client islands exist: scene controller, hero media, and pricing selector.
- [ ] No raw scroll listener, scroll hijack, infinite animation, hidden semantic content, or unsupported claim exists.
- [ ] Keyboard, reduced-motion, no-JS, 320px mobile, tablet, and desktop checks pass.
- [ ] Marketing tests, lint, type-check, and production build pass.
- [ ] Lighthouse and image/JS/page-length budgets pass.
- [ ] `git diff main...HEAD --check` is clean and the worktree contains no unintended changes.
