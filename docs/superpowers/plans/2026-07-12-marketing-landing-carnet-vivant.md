# Biume “Carnet vivant” Landing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current flat homepage with the approved, conversion-focused “Carnet vivant” experience while keeping every product claim truthful and making the 15-day trial genuinely card-free.

**Architecture:** Keep `apps/marketing/app/page.tsx` as a Server Component and render five semantic homepage moments. Put homepage-only UI under `apps/marketing/components/landing`, with only three client islands: header surface motion, the report transformation story, and the billing selector. Preserve the shared header, footer API, legacy landing theme, and motion wrapper used by SEO/blog pages; the homepage receives its own fixed-light `carnet-theme`.

**Tech Stack:** Next.js 16.2, React 19, TypeScript, Tailwind CSS v4, Motion 12 (`motion/react`), Bun test, Vitest, Autumn CLI, Next Image, Next Font.

## Global Constraints

- The approved source of truth is `docs/superpowers/specs/2026-07-12-marketing-landing-carnet-vivant-design.md`.
- Use Bun for every install, script, test, and build command; do not add another package manager or lockfile.
- Add no dependency: `motion@^12.42.2`, Next Image, Next Font, and native HTML controls cover the implementation.
- The homepage has exactly five elements marked `data-landing-section` between its header and footer.
- The main content is at most `6.2` viewport heights at `1440 x 1000` and at most `8` viewport heights at `390 x 844`, footer excluded.
- No empty vertical gap may exceed `160px` on desktop or `96px` on mobile.
- Use the approved palette by role: canvas `#f7f7f4`, surface `#fdfdfb`, ink `#1d1d21`, secondary text `#696970`, anthracite `#202024`, action violet `#6b5ac8`, information blue `#5d9bb8`, success green `#2e9866`.
- Reserve the historical `#8e82e8 -> #62a8c8 -> #28c978` gradient for the logo, one editorial underline, or the end of document progress; never put it on a title, background, shadow, or button.
- Geist remains the interface typeface, Geist Mono is limited to prices/steps/statuses, and Newsreader is limited to editorial words in large headings.
- Do not use gradient text, glassmorphism, neon glows, floating SaaS-card compositions, custom cursors, magnetic buttons, horizontal scroll, full-screen parallax, or perpetual animation.
- The hero photograph must be visible in the first frame; hero entry and photo keyframes animate only `transform`, never `opacity`.
- Only the report transformation is a sticky narrative sequence. It uses `useScroll`/`useTransform`, animates only `opacity` and transforms, and never updates React state per scroll frame.
- At widths below `768px`, with JavaScript disabled, and with `prefers-reduced-motion: reduce`, all four report states stay readable in normal flow with no sticky overlap.
- Every signup link uses `webAppPath("/signup")`, `prefetch={false}`, and a stable `data-conversion` value.
- Do not claim a timeline, owner responses, J+7 questionnaires, cat-report support, measured time savings, ratings, adoption, testimonials, hosting location, or compliance that is not documented.
- Keep the homepage JSON-LD as `Service`; do not add `SoftwareApplication`, `Product`, or `Offer` schema.
- Keep `apps/marketing/components/header.tsx`, `apps/marketing/components/footer.tsx`'s default export, and `apps/marketing/components/landing/kinetic-header.tsx` compatible with SEO/blog pages.
- Do not publish “Sans carte bancaire” until Autumn production is synchronized and a new production trial is verified without Stripe Checkout.
- Production Autumn synchronization (`bunx atmn push -p`) requires explicit user approval immediately before the command.

---

## File Structure

### Create

- `apps/marketing/__tests__/web-app-url.test.ts` — pure URL fallback and Turbo cache-input contract.
- `apps/web/autumn.config.test.ts` — monthly/yearly card-free trial contract.
- `apps/marketing/__tests__/landing-test-utils.tsx` — shared SSR render and link-query helpers for landing tests.
- `apps/marketing/components/landing/report-transformation-demo.ts` — typed, serializable, factual demo content.
- `apps/marketing/components/landing/header-motion.tsx` — homepage-only client island for the sticky header surface.
- `apps/marketing/components/landing/landing-header.tsx` — homepage navigation and always-visible mobile signup CTA.
- `apps/marketing/components/landing/landing-hero.tsx` — server-rendered hero, photo, and one integrated report surface.
- `apps/marketing/components/landing/report-transformation-story.tsx` — SSR-safe transformation story and the sole sticky narrative.
- `apps/marketing/components/landing/product-proof.tsx` — factual editor and output proof.
- `apps/marketing/components/landing/pricing-selector.tsx` — annual/monthly client selector and live price region.
- `apps/marketing/components/landing/pricing-decision.tsx` — practitioner-control copy, trial, price, feature list, and signup CTA.
- `apps/marketing/components/landing/landing-faq.tsx` — five native disclosures and legal references.
- `apps/marketing/components/landing/final-cta.tsx` — final image-led signup moment with no competing demo button.
- `apps/marketing/__tests__/landing-content.test.ts` — typed demo copy contract.
- `apps/marketing/__tests__/landing-hero.test.tsx` — header/hero SSR, conversion, and motion-safety contract.
- `apps/marketing/__tests__/report-transformation-story.test.tsx` — four-state SSR and scroll-motion source contract.
- `apps/marketing/__tests__/product-proof.test.tsx` — supported-capability and forbidden-claim contract.
- `apps/marketing/__tests__/pricing-decision.test.tsx` — pricing, accessibility, and conversion contract.
- `apps/marketing/__tests__/landing-close.test.tsx` — FAQ, final CTA, and shared-footer contract.

### Modify

- `apps/marketing/lib/web-app-url.ts` — safe production URL resolution.
- `turbo.json` — add `NEXT_PUBLIC_WEB_APP_URL` to build cache inputs.
- `apps/web/autumn.config.ts` — set both trial policies to `cardRequired: false`.
- `apps/marketing/app/globals.css` — append isolated `carnet-theme`, transform-only entrances, story layout, texture, and reduced-motion rules; preserve legacy landing CSS.
- `apps/marketing/components/footer.tsx` — remove the broken contact route and undocumented hosting/compliance claim while preserving the Cal.com demo link.
- `apps/marketing/lib/metadata.ts` — retain the existing metadata structure/canonical while removing the unsupported timeline claim from homepage metadata.
- `apps/marketing/app/page.tsx` — load Newsreader, correct Service copy, and assemble the five moments.
- `apps/marketing/__tests__/home-landing.test.tsx` — replace old homepage contracts with the final assembled-page contract.
- `apps/marketing/__tests__/marketing-pages.test.tsx` — update shared-footer expectations.
- `apps/marketing/__tests__/seo.test.tsx` — mock Newsreader and preserve the Service-schema contract.

### Delete only after `rg` proves they are unused

- `apps/marketing/components/hero.tsx`
- `apps/marketing/components/features.tsx`
- `apps/marketing/components/pricing.tsx`
- `apps/marketing/components/faq.tsx`
- `apps/marketing/components/cta.tsx`
- `apps/marketing/components/landing/journey-story.tsx`
- `apps/marketing/components/landing/motion-reveal.tsx`

### Preserve

- `apps/marketing/components/header.tsx` — shared secondary-page header.
- `apps/marketing/components/landing/kinetic-header.tsx` — still consumed by that shared header.
- Existing `.landing-theme`, `.landing-reveal`, `.landing-button`, and shared FAQ rules in `apps/marketing/app/globals.css` — still consumed outside the homepage.

---

### Task 1: Make application CTA URLs production-safe

**Files:**
- Create: `apps/marketing/__tests__/web-app-url.test.ts`
- Modify: `apps/marketing/lib/web-app-url.ts`
- Modify: `turbo.json`

**Interfaces:**
- Consumes: `process.env.NEXT_PUBLIC_WEB_APP_URL`, `process.env.NODE_ENV`, and paths typed as `` `/${string}` ``.
- Produces: `resolveWebAppUrl(configuredUrl: string | undefined, nodeEnv: string | undefined): string` and unchanged `webAppPath(path: `/${string}`): string` for every later CTA.

- [ ] **Step 1: Write the failing URL and Turbo contract**

Create `apps/marketing/__tests__/web-app-url.test.ts`:

```ts
import { describe, expect, test } from "bun:test";

import { resolveWebAppUrl } from "../lib/web-app-url";

describe("web application URL", () => {
  test("normalizes a configured non-local URL", () => {
    expect(
      resolveWebAppUrl("https://preview.biume.com///", "production"),
    ).toBe("https://preview.biume.com");
  });

  test("uses the safe application domain when production has no URL", () => {
    expect(resolveWebAppUrl(undefined, "production")).toBe(
      "https://app.biume.com",
    );
  });

  test.each([
    "http://localhost:3001",
    "http://127.0.0.1:3001",
    "http://[::1]:3001",
  ])("rejects %s as a production destination", (configuredUrl) => {
    expect(resolveWebAppUrl(configuredUrl, "production")).toBe(
      "https://app.biume.com",
    );
  });

  test.each(["development", "test", undefined])(
    "keeps the local fallback in %s",
    (nodeEnv) => {
      expect(resolveWebAppUrl(undefined, nodeEnv)).toBe(
        "http://localhost:3001",
      );
    },
  );

  test("declares the public URL as a Turbo build input", async () => {
    const turbo = (await Bun.file(
      new URL("../../../turbo.json", import.meta.url),
    ).json()) as { tasks: { build: { env: string[] } } };

    expect(turbo.tasks.build.env).toContain("NEXT_PUBLIC_WEB_APP_URL");
  });
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```bash
bun test apps/marketing/__tests__/web-app-url.test.ts
```

Expected: FAIL because `resolveWebAppUrl` is not exported; after temporarily exporting it, the Turbo assertion and production-localhost cases still fail.

- [ ] **Step 3: Implement safe URL resolution**

Replace `apps/marketing/lib/web-app-url.ts` with:

```ts
const PRODUCTION_WEB_APP_URL = "https://app.biume.com";
const LOCAL_WEB_APP_URL = "http://localhost:3001";
const localHostnames = new Set(["localhost", "127.0.0.1", "::1"]);

function isLocalUrl(value: string) {
  try {
    const hostname = new URL(value).hostname.replace(/^\[|\]$/g, "");
    return localHostnames.has(hostname);
  } catch {
    return false;
  }
}

export function resolveWebAppUrl(
  configuredUrl: string | undefined,
  nodeEnv: string | undefined,
) {
  const normalized = configuredUrl?.trim().replace(/\/+$/, "");

  if (normalized && !(nodeEnv === "production" && isLocalUrl(normalized))) {
    return normalized;
  }

  return nodeEnv === "production"
    ? PRODUCTION_WEB_APP_URL
    : LOCAL_WEB_APP_URL;
}

export function webAppPath(path: `/${string}`) {
  return `${resolveWebAppUrl(
    process.env.NEXT_PUBLIC_WEB_APP_URL,
    process.env.NODE_ENV,
  )}${path}`;
}
```

Add `"NEXT_PUBLIC_WEB_APP_URL"` immediately after `"NODE_ENV"` in `turbo.json`'s `tasks.build.env` array:

```json
        "NODE_ENV",
        "NEXT_PUBLIC_WEB_APP_URL",
        "VERCEL",
```

- [ ] **Step 4: Run the focused test and verify GREEN**

Run:

```bash
bun test apps/marketing/__tests__/web-app-url.test.ts
```

Expected: `9 pass, 0 fail`.

- [ ] **Step 5: Commit the URL guard**

```bash
git add apps/marketing/__tests__/web-app-url.test.ts apps/marketing/lib/web-app-url.ts turbo.json
git commit -m "fix(marketing): make app links production safe"
```

---

### Task 2: Make the 15-day trial card-free in code

**Files:**
- Create: `apps/web/autumn.config.test.ts`
- Modify: `apps/web/autumn.config.ts`

**Interfaces:**
- Consumes: `allInclusiveMonthly` and `allInclusiveYearly` plan objects exported by `apps/web/autumn.config.ts`.
- Produces: both plans with `freeTrial: { durationLength: 15, durationType: "day", cardRequired: false }`; the marketing copy may rely on this only after the release gate in Task 11.

- [ ] **Step 1: Write the failing Autumn policy test**

Create `apps/web/autumn.config.test.ts`:

```ts
import { describe, expect, test } from "vitest";

import {
  allInclusiveMonthly,
  allInclusiveYearly,
} from "./autumn.config";

describe("Autumn trial policy", () => {
  test.each([
    ["monthly", allInclusiveMonthly],
    ["yearly", allInclusiveYearly],
  ] as const)("%s plan offers 15 days without a card", (_name, plan) => {
    expect(plan.freeTrial).toEqual({
      durationLength: 15,
      durationType: "day",
      cardRequired: false,
    });
  });
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```bash
bun --filter @biume/web test autumn.config.test.ts
```

Expected: two failures showing `cardRequired: true` instead of `false`.

- [ ] **Step 3: Change only the two Autumn trial declarations**

In both `allInclusiveMonthly` and `allInclusiveYearly`, replace the declaration with:

```ts
  freeTrial: {
    durationLength: 15,
    durationType: "day",
    cardRequired: false,
  },
```

- [ ] **Step 4: Run the focused and full web tests**

Run:

```bash
bun --filter @biume/web test autumn.config.test.ts
bun --filter @biume/web test
```

Expected: the focused file reports `2 passed`; the full web suite exits `0`.

- [ ] **Step 5: Preview the local Autumn model without synchronizing external state**

Run from `apps/web` in a separate terminal:

```bash
bunx atmn preview
```

Expected: the preview lists both paid plans with a 15-day trial and `cardRequired: false`. Stop the preview with `Ctrl-C`. Do **not** run `bunx atmn push` or `bunx atmn push -p` in this task.

- [ ] **Step 6: Commit the local policy**

```bash
git add apps/web/autumn.config.ts apps/web/autumn.config.test.ts
git commit -m "feat(billing): remove card requirement from trials"
```

---

### Task 3: Lock the factual report-transformation content

**Files:**
- Create: `apps/marketing/components/landing/report-transformation-demo.ts`
- Create: `apps/marketing/__tests__/landing-content.test.ts`
- Create: `apps/marketing/__tests__/landing-test-utils.tsx`

**Interfaces:**
- Consumes: no runtime data or network request.
- Produces: `ReportTransformationDemo`, `ReportTransformationStep`, `REPORT_TRANSFORMATION_DEMO`, `renderWithLandingImageConfig`, `exactZeroOpacity`, `textOnly`, and `conversionAnchors`; Tasks 4 and 5 consume these exact names.

- [ ] **Step 1: Write the failing typed-content contract**

Create `apps/marketing/__tests__/landing-content.test.ts`:

```ts
import { describe, expect, test } from "bun:test";

import { REPORT_TRANSFORMATION_DEMO } from "../components/landing/report-transformation-demo";

describe("report transformation demo", () => {
  test("keeps the approved four-state factual content", () => {
    expect(REPORT_TRANSFORMATION_DEMO.steps.map((step) => step.label)).toEqual([
      "Noter",
      "Structurer",
      "Adapter le langage",
      "Finaliser",
    ]);
    expect(REPORT_TRANSFORMATION_DEMO.observation).toBe(
      "Mobilité réduite à gauche et tension modérée observée au niveau thoracique. La mobilité s'est améliorée pendant la séance.",
    );
    expect(REPORT_TRANSFORMATION_DEMO.adaptedProposal).toBe(
      "Une tension plus présente a été observée du côté gauche, au niveau du thorax. La mobilité s'est améliorée au cours de la séance.",
    );
    expect(REPORT_TRANSFORMATION_DEMO.help).toBe(
      "Cette proposition remplace le texte du champ lorsque vous choisissez de l'appliquer. Elle reste modifiable.",
    );
    expect(REPORT_TRANSFORMATION_DEMO.fileName).toBe(
      "Compte-rendu-seance.pdf",
    );
    expect(REPORT_TRANSFORMATION_DEMO.finalStatus).toBe(
      "Finalisé par vous",
    );
  });

  test("contains no unsupported outcome or diagnosis claim", () => {
    const serialized = JSON.stringify(REPORT_TRANSFORMATION_DEMO);

    for (const forbidden of [
      "diagnostic",
      "guéri",
      "timeline",
      "retour propriétaire",
      "J+7",
    ]) {
      expect(serialized.toLowerCase()).not.toContain(forbidden.toLowerCase());
    }
  });
});
```

- [ ] **Step 2: Run the test and verify RED**

Run:

```bash
bun test apps/marketing/__tests__/landing-content.test.ts
```

Expected: FAIL with `Cannot find module '../components/landing/report-transformation-demo'`.

- [ ] **Step 3: Create the typed, serializable demo**

Create `apps/marketing/components/landing/report-transformation-demo.ts`:

```ts
export type ReportTransformationStep =
  | Readonly<{ id: "note"; label: "Noter"; body: string }>
  | Readonly<{ id: "structure"; label: "Structurer"; body: string }>
  | Readonly<{
      id: "language";
      label: "Adapter le langage";
      body: string;
    }>
  | Readonly<{ id: "final"; label: "Finaliser"; body: string }>;

export type ReportTransformationDemo = Readonly<{
  observation: string;
  adaptedProposal: string;
  help: string;
  fileName: string;
  finalStatus: string;
  steps: readonly [
    Extract<ReportTransformationStep, { id: "note" }>,
    Extract<ReportTransformationStep, { id: "structure" }>,
    Extract<ReportTransformationStep, { id: "language" }>,
    Extract<ReportTransformationStep, { id: "final" }>,
  ];
}>;

export const REPORT_TRANSFORMATION_DEMO = {
  observation:
    "Mobilité réduite à gauche et tension modérée observée au niveau thoracique. La mobilité s'est améliorée pendant la séance.",
  adaptedProposal:
    "Une tension plus présente a été observée du côté gauche, au niveau du thorax. La mobilité s'est améliorée au cours de la séance.",
  help:
    "Cette proposition remplace le texte du champ lorsque vous choisissez de l'appliquer. Elle reste modifiable.",
  fileName: "Compte-rendu-seance.pdf",
  finalStatus: "Finalisé par vous",
  steps: [
    {
      id: "note",
      label: "Noter",
      body: "Vos observations restent dans votre vocabulaire de praticien.",
    },
    {
      id: "structure",
      label: "Structurer",
      body: "Biume les organise dans les rubriques du compte rendu.",
    },
    {
      id: "language",
      label: "Adapter le langage",
      body: "Vous choisissez d'appliquer une formulation plus accessible, puis vous la modifiez si nécessaire.",
    },
    {
      id: "final",
      label: "Finaliser",
      body: "Vous relisez, finalisez puis déclenchez le téléchargement ou le partage.",
    },
  ],
} as const satisfies ReportTransformationDemo;
```

- [ ] **Step 4: Add the shared SSR test helpers**

Create `apps/marketing/__tests__/landing-test-utils.tsx`:

```tsx
import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { imageConfigDefault } from "next/dist/shared/lib/image-config";
import { ImageConfigContext } from "next/dist/shared/lib/image-config-context.shared-runtime";

export const exactZeroOpacity =
  /\bopacity\s*:\s*(?:0+(?:\.0*)?|\.(?:0)+)(?![\d.eE+-])/;

export function textOnly(html: string) {
  return html
    .replace(/<[^>]+>/g, " ")
    .replaceAll("&#x27;", "'")
    .replaceAll("&#39;", "'")
    .replaceAll("&apos;", "'")
    .replaceAll("&quot;", '"')
    .replaceAll("&nbsp;", " ")
    .replaceAll("&amp;", "&")
    .replace(/\s+/g, " ")
    .trim();
}

export function renderWithLandingImageConfig(children: ReactNode) {
  return renderToStaticMarkup(
    <ImageConfigContext.Provider
      value={{ ...imageConfigDefault, qualities: [65, 75] }}
    >
      {children}
    </ImageConfigContext.Provider>,
  );
}

export function conversionAnchors(html: string, id: string) {
  return Array.from(
    html.matchAll(
      new RegExp(
        `<a\\b(?=[^>]*data-conversion="${id}")[^>]*>`,
        "g",
      ),
    ),
    (match) => match[0],
  );
}
```

- [ ] **Step 5: Run the content test and verify GREEN**

Run:

```bash
bun test apps/marketing/__tests__/landing-content.test.ts
```

Expected: `2 pass, 0 fail`.

- [ ] **Step 6: Commit the content contract**

```bash
git add apps/marketing/components/landing/report-transformation-demo.ts apps/marketing/__tests__/landing-content.test.ts apps/marketing/__tests__/landing-test-utils.tsx
git commit -m "test(marketing): lock report transformation copy"
```

---

### Task 4: Build the isolated theme, homepage header, and integrated hero

**Files:**
- Create: `apps/marketing/__tests__/landing-hero.test.tsx`
- Create: `apps/marketing/components/landing/header-motion.tsx`
- Create: `apps/marketing/components/landing/landing-header.tsx`
- Create: `apps/marketing/components/landing/landing-hero.tsx`
- Modify: `apps/marketing/app/globals.css`

**Interfaces:**
- Consumes: `webAppPath(path)`, `REPORT_TRANSFORMATION_DEMO.adaptedProposal`, Next Image, and the global Geist variables.
- Produces: `HeaderMotion({ children }: Readonly<{ children: ReactNode }>)`, `LandingHeader()`, and `LandingHero({ adaptedProposal }: Pick<ReportTransformationDemo, "adaptedProposal">)`; Task 9 assembles them unchanged.

- [ ] **Step 1: Write the failing header and hero contract**

Create `apps/marketing/__tests__/landing-hero.test.tsx`:

```tsx
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "bun:test";

import { HeaderMotion } from "../components/landing/header-motion";
import { LandingHeader } from "../components/landing/landing-header";
import { LandingHero } from "../components/landing/landing-hero";
import { REPORT_TRANSFORMATION_DEMO } from "../components/landing/report-transformation-demo";
import { webAppPath } from "../lib/web-app-url";
import {
  conversionAnchors,
  exactZeroOpacity,
  renderWithLandingImageConfig,
  textOnly,
} from "./landing-test-utils";

describe("Carnet vivant header and hero", () => {
  test("header motion is visible in server markup", () => {
    const html = renderToStaticMarkup(
      <HeaderMotion>
        <a href="/signup">Essayer</a>
      </HeaderMotion>,
    );

    expect(html).toContain("data-header-motion");
    expect(html).toContain("data-header-surface");
    expect(html).toContain("Essayer");
    expect(html).not.toMatch(exactZeroOpacity);
    expect(html).not.toContain("visibility:hidden");
  });

  test("homepage header keeps signup visible and navigation factual", () => {
    const html = renderWithLandingImageConfig(<LandingHeader />);
    const signupAnchors = conversionAnchors(html, "header-signup");

    for (const label of [
      "Le produit",
      "Comment ça marche",
      "Tarifs",
      "Ressources",
      "Connexion",
    ]) {
      expect(html).toContain(label);
    }
    expect(html).toContain("Navigation mobile");
    expect(html).toContain(">Essayer</a>");
    expect(signupAnchors).toHaveLength(2);
    for (const anchor of signupAnchors) {
      expect(anchor).toContain(`href="${webAppPath("/signup")}"`);
    }
  });

  test("hero renders approved copy and one integrated product surface", () => {
    const html = renderWithLandingImageConfig(
      <LandingHero
        adaptedProposal={REPORT_TRANSFORMATION_DEMO.adaptedProposal}
      />,
    );
    const text = textOnly(html);
    const signupAnchors = conversionAnchors(html, "hero-signup");

    expect(html).toContain(
      "Le compte rendu propriétaire des ostéopathes animaliers",
    );
    expect(text).toContain("Vos observations, dans des mots qui restent.");
    expect(html).toContain(
      "Biume structure vos notes et prépare un compte rendu clair pour le propriétaire. Vous relisez, corrigez et choisissez quand le partager.",
    );
    expect(html).toContain("Voir un exemple de compte rendu");
    expect(html).toContain("15 jours d&#x27;essai");
    expect(html).toContain("Sans carte bancaire");
    expect(html).toContain("Partagé par vous");
    expect(html).toContain("Proposition adaptée");
    expect(text).toContain(REPORT_TRANSFORMATION_DEMO.adaptedProposal);
    expect(html).toContain("Vous pouvez encore modifier ce texte");
    expect(html).toContain("Partager le PDF");
    expect(html).toContain("hero-practitioner-horse.png");
    expect(html).toContain("q=65");
    expect(html.match(/data-hero-product=/g)).toHaveLength(1);
    expect(text).not.toContain(REPORT_TRANSFORMATION_DEMO.observation);
    expect(signupAnchors).toHaveLength(1);
    expect(signupAnchors[0]).toContain(`href="${webAppPath("/signup")}"`);
    expect(html).not.toMatch(exactZeroOpacity);
  });

  test("hero animation is transform-only and the hero stays server-side", async () => {
    const heroSource = await Bun.file(
      new URL("../components/landing/landing-hero.tsx", import.meta.url),
    ).text();
    const css = await Bun.file(
      new URL("../app/globals.css", import.meta.url),
    ).text();
    const entryKeyframes = css.match(
      /@keyframes landing-hero-enter\s*{([\s\S]*?)\n}/,
    )?.[1];
    const photoKeyframes = css.match(
      /@keyframes landing-hero-photo-enter\s*{([\s\S]*?)\n}/,
    )?.[1];

    expect(heroSource).not.toContain('"use client"');
    expect(heroSource).not.toContain('from "motion/react"');
    expect(entryKeyframes).toBeDefined();
    expect(entryKeyframes).not.toContain("opacity");
    expect(photoKeyframes).toContain("scale(1.02)");
    expect(photoKeyframes).not.toContain("opacity");
    expect(css).toMatch(
      /@media \(prefers-reduced-motion: reduce\)[\s\S]*\.landing-hero-entry/,
    );
  });
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```bash
bun test apps/marketing/__tests__/landing-hero.test.tsx
```

Expected: FAIL because the three homepage components do not exist.

- [ ] **Step 3: Implement the non-zero header motion island**

Create `apps/marketing/components/landing/header-motion.tsx`:

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

export function HeaderMotion({
  children,
}: Readonly<{ children: ReactNode }>) {
  const reduceMotion = useReducedMotion();
  const { scrollY } = useScroll();
  const surfaceOpacity = useTransform(scrollY, [0, 96], [0.72, 0.98]);
  const innerY = useTransform(scrollY, [0, 96], [0, -2]);
  const innerScale = useTransform(scrollY, [0, 96], [1, 0.985]);

  return (
    <LazyMotion features={domAnimation} strict>
      <header
        data-header-motion
        className="sticky inset-x-0 top-0 z-40 isolate border-b border-[color:var(--carnet-line)]"
      >
        <m.div
          data-header-surface
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[color:var(--carnet-canvas)] backdrop-blur-xl"
          style={{
            opacity: reduceMotion === true ? 0.98 : surfaceOpacity,
          }}
        />
        <m.div
          className="mx-auto flex h-18 max-w-[90rem] items-center gap-3 px-4 sm:px-6 lg:px-8"
          style={
            reduceMotion === false
              ? { y: innerY, scale: innerScale }
              : undefined
          }
        >
          {children}
        </m.div>
      </header>
    </LazyMotion>
  );
}
```

- [ ] **Step 4: Implement the homepage-only header**

Create `apps/marketing/components/landing/landing-header.tsx`:

```tsx
import Image from "next/image";
import Link from "next/link";

import { webAppPath } from "../../lib/web-app-url";
import { HeaderMotion } from "./header-motion";

const navigation = [
  { href: "#produit", label: "Le produit" },
  { href: "#comment-ca-marche", label: "Comment ça marche" },
  { href: "#tarifs", label: "Tarifs" },
  { href: "/blog", label: "Ressources" },
] as const;

const navigationLinkClassName =
  "inline-flex min-h-11 items-center px-3 text-sm font-medium text-[color:var(--carnet-muted)] transition-colors hover:text-[color:var(--carnet-ink)] focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--carnet-violet)]";

function Brand() {
  return (
    <Link
      href="/"
      aria-label="Biume accueil"
      className="flex min-h-11 shrink-0 items-center gap-2.5 text-sm font-semibold tracking-[-0.02em] focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--carnet-violet)]"
    >
      <Image
        src="/brand/biume-logo.svg"
        alt=""
        width={32}
        height={32}
        className="size-8"
        priority
      />
      <span>Biume</span>
    </Link>
  );
}

function SignupLink({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      href={webAppPath("/signup")}
      prefetch={false}
      data-conversion="header-signup"
      className={`carnet-action inline-flex min-h-11 items-center justify-center rounded-full bg-[color:var(--carnet-violet)] font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--carnet-violet)] ${
        compact ? "px-4 text-sm lg:hidden" : "px-5 text-sm"
      }`}
    >
      {compact ? "Essayer" : "Essayer gratuitement"}
    </Link>
  );
}

export function LandingHeader() {
  return (
    <HeaderMotion>
      <Brand />

      <nav
        aria-label="Navigation principale"
        className="mx-auto hidden items-center lg:flex"
      >
        {navigation.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={navigationLinkClassName}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="ml-auto hidden shrink-0 items-center gap-1 lg:flex">
        <Link
          href={webAppPath("/signin")}
          prefetch={false}
          className={navigationLinkClassName}
        >
          Connexion
        </Link>
        <SignupLink />
      </div>

      <div className="ml-auto flex items-center gap-2 lg:hidden">
        <SignupLink compact />
        <details className="group relative">
          <summary className="flex min-h-11 cursor-pointer list-none items-center rounded-full border border-[color:var(--carnet-line)] bg-[color:var(--carnet-surface)] px-4 text-sm font-semibold marker:hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--carnet-violet)]">
            Menu
          </summary>
          <div className="absolute right-0 top-[calc(100%+0.75rem)] w-[min(20rem,calc(100vw-2rem))] rounded-[1.25rem] border border-[color:var(--carnet-line)] bg-[color:var(--carnet-surface)] p-3 shadow-[0_28px_70px_-46px_rgba(29,29,33,0.38)]">
            <nav className="flex flex-col" aria-label="Navigation mobile">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={navigationLinkClassName}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href={webAppPath("/signin")}
                prefetch={false}
                className={navigationLinkClassName}
              >
                Connexion
              </Link>
            </nav>
          </div>
        </details>
      </div>
    </HeaderMotion>
  );
}
```

- [ ] **Step 5: Implement the server-rendered integrated hero**

Create `apps/marketing/components/landing/landing-hero.tsx`:

```tsx
import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";

import { webAppPath } from "../../lib/web-app-url";
import type { ReportTransformationDemo } from "./report-transformation-demo";

const reassurance = [
  "15 jours d'essai",
  "Sans carte bancaire",
  "Partagé par vous",
] as const;

const entryStyle = (delay: number) =>
  ({ "--hero-delay": `${delay}ms` }) as CSSProperties;

export function LandingHero({
  adaptedProposal,
}: Pick<ReportTransformationDemo, "adaptedProposal">) {
  return (
    <section
      data-landing-section="hero"
      className="relative px-4 pb-12 pt-6 sm:px-6 sm:pb-16 lg:px-8 lg:pb-20 lg:pt-10"
    >
      <div
        aria-hidden="true"
        className="carnet-construction absolute inset-x-0 top-0 -z-10 h-[78%]"
      />
      <div className="mx-auto grid min-h-[calc(100svh-4.5rem)] max-w-[90rem] items-center gap-10 lg:grid-cols-[0.86fr_1.14fr] lg:gap-12 xl:gap-16">
        <div className="max-w-[42rem] py-4 lg:py-12">
          <p
            data-hero-entry
            style={entryStyle(0)}
            className="landing-hero-entry font-mono text-[0.7rem] font-semibold uppercase tracking-[0.17em] text-[color:var(--carnet-violet)]"
          >
            Le compte rendu propriétaire des ostéopathes animaliers
          </p>
          <h1
            data-hero-entry
            style={entryStyle(80)}
            className="landing-hero-entry mt-5 text-[clamp(3.25rem,6.5vw,6.5rem)] font-semibold leading-[0.9] tracking-[-0.065em] text-[color:var(--carnet-ink)]"
          >
            Vos observations, {" "}
            <span className="font-[family-name:var(--font-newsreader)] font-normal italic tracking-[-0.045em]">
              dans des mots qui restent.
            </span>
          </h1>
          <p
            data-hero-entry
            style={entryStyle(160)}
            className="landing-hero-entry mt-6 max-w-[56ch] text-base leading-7 text-[color:var(--carnet-muted)] md:text-lg md:leading-8"
          >
            Biume structure vos notes et prépare un compte rendu clair pour le
            propriétaire. Vous relisez, corrigez et choisissez quand le
            partager.
          </p>
          <div
            data-hero-entry
            style={entryStyle(240)}
            className="landing-hero-entry mt-8 flex flex-col gap-3 sm:flex-row"
          >
            <Link
              href={webAppPath("/signup")}
              prefetch={false}
              data-conversion="hero-signup"
              className="carnet-action inline-flex min-h-12 items-center justify-center rounded-full bg-[color:var(--carnet-violet)] px-6 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--carnet-violet)]"
            >
              Essayer gratuitement
            </Link>
            <Link
              href="#produit"
              className="carnet-action inline-flex min-h-12 items-center justify-center rounded-full border border-[color:var(--carnet-line)] bg-[color:var(--carnet-surface)] px-6 text-sm font-semibold text-[color:var(--carnet-ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--carnet-violet)]"
            >
              Voir un exemple de compte rendu
            </Link>
          </div>
          <ul
            data-hero-entry
            style={entryStyle(320)}
            className="landing-hero-entry mt-9 grid grid-cols-3 border-y border-[color:var(--carnet-line)]"
          >
            {reassurance.map((item) => (
              <li
                key={item}
                className="flex min-h-16 items-center gap-2 border-r border-[color:var(--carnet-line)] px-2 py-3 font-mono text-[0.64rem] font-semibold leading-4 text-[color:var(--carnet-ink)] last:border-r-0 sm:px-4 sm:text-xs sm:first:pl-0"
              >
                <span
                  aria-hidden="true"
                  className="size-1.5 rounded-full bg-[color:var(--carnet-violet)]"
                />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative mx-auto w-full max-w-[48rem] lg:justify-self-end">
          <div
            data-hero-photo
            className="landing-hero-photo relative aspect-[5/4] overflow-hidden rounded-[2rem_0.75rem_2rem_0.75rem] bg-[color:var(--carnet-muted-surface)] sm:aspect-[4/5]"
          >
            <Image
              src="/assets/images/landing/hero-practitioner-horse.png"
              alt="Une ostéopathe animalière observe un cheval pendant une séance"
              fill
              priority
              fetchPriority="high"
              quality={65}
              sizes="(min-width: 1280px) 720px, (min-width: 1024px) 52vw, 100vw"
              className="object-cover"
            />
          </div>

          <article
            data-hero-product
            aria-label="Exemple de proposition adaptée dans Biume"
            className="relative z-10 mx-auto -mt-14 w-[calc(100%-1.5rem)] overflow-hidden rounded-[0.8rem_0.8rem_2rem_0.8rem] border border-[color:var(--carnet-line)] bg-[color:var(--carnet-surface)] shadow-[0_36px_90px_-52px_rgba(29,29,33,0.45)] sm:-mt-20 sm:w-[88%] lg:mr-5"
          >
            <div className="flex items-center justify-between gap-4 border-b border-[color:var(--carnet-line)] px-5 py-4 sm:px-6">
              <div>
                <p className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-[color:var(--carnet-muted)]">
                  Compte rendu propriétaire
                </p>
                <p className="mt-1 text-sm font-semibold text-[color:var(--carnet-ink)]">
                  Proposition adaptée
                </p>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full bg-[color:var(--carnet-green-soft)] px-3 py-1.5 font-mono text-[0.65rem] font-semibold text-[color:var(--carnet-ink)]">
                <span
                  aria-hidden="true"
                  className="size-1.5 rounded-full bg-[color:var(--carnet-green)]"
                />
                Prêt à relire
              </span>
            </div>
            <div className="px-5 py-5 sm:px-6">
              <p className="text-sm leading-6 text-[color:var(--carnet-ink)] sm:text-base sm:leading-7">
                {adaptedProposal}
              </p>
              <div className="mt-5 flex flex-col gap-3 border-t border-[color:var(--carnet-line)] pt-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs leading-5 text-[color:var(--carnet-muted)]">
                  Vous pouvez encore modifier ce texte
                </p>
                <span className="inline-flex min-h-10 items-center justify-center rounded-full bg-[color:var(--carnet-ink)] px-4 text-xs font-semibold text-white">
                  Partager le PDF
                </span>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 6: Append the isolated fixed-light theme and transform-only feedback**

Append this block to `apps/marketing/app/globals.css`; do not edit or remove the existing `.landing-theme` or its dark-mode media query:

```css
.carnet-theme {
  interpolate-size: allow-keywords;
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
  --carnet-canvas: #f7f7f4;
  --carnet-surface: #fdfdfb;
  --carnet-muted-surface: #ecece7;
  --carnet-ink: #1d1d21;
  --carnet-muted: #696970;
  --carnet-line: #deded7;
  --carnet-anthracite: #202024;
  --carnet-violet: #6b5ac8;
  --carnet-violet-soft: #eeebfb;
  --carnet-blue: #5d9bb8;
  --carnet-blue-soft: #e8f1f5;
  --carnet-green: #2e9866;
  --carnet-green-soft: #e7f3ed;
  color-scheme: light;
  isolation: isolate;
}

.carnet-theme::before {
  position: fixed;
  z-index: 60;
  inset: 0;
  content: "";
  pointer-events: none;
  opacity: 0.022;
  background-image: radial-gradient(rgb(29 29 33 / 0.82) 0.45px, transparent 0.6px);
  background-size: 4px 4px;
  mix-blend-mode: multiply;
}

.carnet-construction {
  opacity: 0.32;
  background-image:
    linear-gradient(to right, rgb(29 29 33 / 0.055) 1px, transparent 1px),
    linear-gradient(to bottom, rgb(29 29 33 / 0.055) 1px, transparent 1px);
  background-size: 32px 32px;
  mask-image: linear-gradient(to bottom, black, transparent 94%);
}

.landing-hero-entry {
  animation: landing-hero-enter 400ms cubic-bezier(0.16, 1, 0.3, 1)
    var(--hero-delay, 0ms) both;
}

.landing-hero-photo {
  animation: landing-hero-photo-enter 720ms cubic-bezier(0.16, 1, 0.3, 1)
    both;
  box-shadow: 0 42px 110px -72px rgb(29 29 33 / 0.45);
}

.carnet-action {
  transition:
    transform 220ms cubic-bezier(0.16, 1, 0.3, 1),
    background-color 220ms ease,
    border-color 220ms ease,
    color 220ms ease;
}

.carnet-action:hover {
  transform: translate3d(0, -2px, 0);
}

.carnet-action:active {
  transform: scale(0.98);
}

@supports selector(details::details-content) {
  .carnet-theme details::details-content {
    block-size: 0;
    overflow-y: clip;
    opacity: 0;
    transition:
      block-size 360ms cubic-bezier(0.16, 1, 0.3, 1),
      content-visibility 360ms allow-discrete,
      opacity 240ms ease;
  }

  .carnet-theme details[open]::details-content {
    block-size: auto;
    opacity: 1;
  }
}

@keyframes landing-hero-enter {
  from {
    transform: translate3d(0, 14px, 0);
  }
  to {
    transform: translate3d(0, 0, 0);
  }
}

@keyframes landing-hero-photo-enter {
  from {
    transform: scale(1.02);
  }
  to {
    transform: scale(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .landing-hero-entry,
  .landing-hero-photo {
    animation: none;
  }

  .carnet-action {
    transition: none;
  }

  .carnet-action:hover,
  .carnet-action:active {
    transform: none;
  }

  .carnet-theme details::details-content {
    transition: none;
  }
}
```

- [ ] **Step 7: Run the focused test and verify GREEN**

Run:

```bash
bun test apps/marketing/__tests__/landing-hero.test.tsx
```

Expected: `4 pass, 0 fail`.

- [ ] **Step 8: Check that legacy secondary-page styling still exists**

Run:

```bash
rg -n '^\.landing-theme|prefers-color-scheme: dark|\.landing-reveal|\.landing-button' apps/marketing/app/globals.css
```

Expected: matches for all four patterns. The new homepage theme is additive, not a replacement.

- [ ] **Step 9: Commit the header and hero**

```bash
git add apps/marketing/__tests__/landing-hero.test.tsx apps/marketing/components/landing/header-motion.tsx apps/marketing/components/landing/landing-header.tsx apps/marketing/components/landing/landing-hero.tsx apps/marketing/app/globals.css
git commit -m "feat(marketing): build carnet vivant hero"
```

---

### Task 5: Build the one immersive report-transformation story

**Files:**
- Create: `apps/marketing/__tests__/report-transformation-story.test.tsx`
- Create: `apps/marketing/components/landing/report-transformation-story.tsx`
- Modify: `apps/marketing/app/globals.css`

**Interfaces:**
- Consumes: `ReportTransformationDemo` and the exact `REPORT_TRANSFORMATION_DEMO` object from Task 3.
- Produces: `ReportTransformationStory({ demo }: Readonly<{ demo: ReportTransformationDemo }>)`; it is the only narrative sticky section and the only component that maps scroll progress to report states.

- [ ] **Step 1: Write the failing SSR and motion-source contract**

Create `apps/marketing/__tests__/report-transformation-story.test.tsx`:

```tsx
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "bun:test";

import { ReportTransformationStory } from "../components/landing/report-transformation-story";
import { REPORT_TRANSFORMATION_DEMO } from "../components/landing/report-transformation-demo";
import { exactZeroOpacity, textOnly } from "./landing-test-utils";

describe("report transformation story", () => {
  test("exposes every state and factual field before hydration", () => {
    const demo = REPORT_TRANSFORMATION_DEMO;
    const html = renderToStaticMarkup(
      <ReportTransformationStory demo={demo} />,
    );
    const text = textOnly(html);

    expect(html.match(/data-report-state=/g)).toHaveLength(4);
    expect(html.match(/data-report-layer=/g)).toHaveLength(4);
    for (const label of [
      "Noter",
      "Structurer",
      "Adapter le langage",
      "Finaliser",
    ]) {
      expect(html).toContain(label);
    }
    expect(text).toContain(demo.observation);
    expect(text).toContain(demo.adaptedProposal);
    expect(text).toContain(demo.help);
    expect(html).toContain(demo.fileName);
    expect(html).toContain(demo.finalStatus);
    expect(html).toContain("Note technique");
    expect(html).toContain("Proposition adaptée");
    expect(html).not.toMatch(exactZeroOpacity);
    expect(html).not.toContain("visibility:hidden");
  });

  test("uses motion values without frame state or unsafe scroll code", async () => {
    const source = await Bun.file(
      new URL(
        "../components/landing/report-transformation-story.tsx",
        import.meta.url,
      ),
    ).text();

    expect(source).toContain("LazyMotion");
    expect(source).toContain("domAnimation");
    expect(source).toContain("useScroll");
    expect(source).toContain("useTransform");
    expect(source).toContain("useReducedMotion");
    expect(source).toContain("useSyncExternalStore");
    expect(source).not.toContain("useState(");
    expect(source).not.toContain("useMotionValueEvent");
    expect(source).not.toContain('addEventListener("scroll"');
    expect(source).not.toContain("window.scrollY");
    expect(source).not.toContain("requestAnimationFrame");
    expect(source).not.toContain("repeat: Infinity");
    expect(source).not.toContain("28vh");
    expect(source).not.toContain("22vh");
  });
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```bash
bun test apps/marketing/__tests__/report-transformation-story.test.tsx
```

Expected: FAIL because `report-transformation-story.tsx` does not exist.

- [ ] **Step 3: Implement the SSR-first story and desktop enhancement**

Create `apps/marketing/components/landing/report-transformation-story.tsx`:

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
import { useRef, useSyncExternalStore } from "react";

import type {
  ReportTransformationDemo,
  ReportTransformationStep,
} from "./report-transformation-demo";

const desktopMediaQuery = "(min-width: 768px)";

const stepRanges: Array<{
  input: number[];
  opacity: number[];
  y: number[];
}> = [
  { input: [0, 0.08, 0.28], opacity: [1, 1, 0.54], y: [0, 0, -8] },
  { input: [0.12, 0.34, 0.54], opacity: [0.54, 1, 0.54], y: [12, 0, -8] },
  { input: [0.4, 0.66, 0.84], opacity: [0.54, 1, 0.54], y: [12, 0, -8] },
  { input: [0.7, 0.92, 1], opacity: [0.54, 1, 1], y: [12, 0, 0] },
];

const layerRanges: Array<{
  input: number[];
  opacity: number[];
  y: number[];
}> = [
  { input: [0, 0.18, 0.3], opacity: [1, 1, 0], y: [0, 0, -10] },
  { input: [0.18, 0.34, 0.5], opacity: [0, 1, 0], y: [10, 0, -10] },
  { input: [0.44, 0.66, 0.8], opacity: [0, 1, 0], y: [10, 0, -10] },
  { input: [0.72, 0.9, 1], opacity: [0, 1, 1], y: [10, 0, 0] },
];

function subscribeToDesktop(update: () => void) {
  const query = window.matchMedia(desktopMediaQuery);
  query.addEventListener("change", update);
  return () => query.removeEventListener("change", update);
}

function getDesktopSnapshot() {
  return window.matchMedia(desktopMediaQuery).matches;
}

function getServerDesktopSnapshot() {
  return false;
}

function useDesktopEnhancement() {
  return useSyncExternalStore(
    subscribeToDesktop,
    getDesktopSnapshot,
    getServerDesktopSnapshot,
  );
}

function StepStateContent({
  step,
  demo,
}: {
  step: ReportTransformationStep;
  demo: ReportTransformationDemo;
}) {
  switch (step.id) {
    case "note":
      return (
        <div className="mt-5 border-l-2 border-[color:var(--carnet-blue)] pl-4">
          <p className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-white/70">
            Note technique
          </p>
          <p className="mt-2 max-w-[48ch] text-sm leading-6 text-white/78">
            {demo.observation}
          </p>
        </div>
      );
    case "structure":
      return (
        <dl className="mt-5 grid max-w-xl grid-cols-2 gap-x-5 gap-y-3 text-sm">
          <div>
            <dt className="font-mono text-[0.65rem] uppercase tracking-[0.12em] text-white/65">
              Zone
            </dt>
            <dd className="mt-1 text-white/78">Thorax</dd>
          </div>
          <div>
            <dt className="font-mono text-[0.65rem] uppercase tracking-[0.12em] text-white/65">
              Côté
            </dt>
            <dd className="mt-1 text-white/78">Gauche</dd>
          </div>
          <div className="col-span-2">
            <dt className="font-mono text-[0.65rem] uppercase tracking-[0.12em] text-white/65">
              Observation structurée
            </dt>
            <dd className="mt-1 leading-6 text-white/78">
              {demo.observation}
            </dd>
          </div>
        </dl>
      );
    case "language":
      return (
        <div className="mt-5 border-l-2 border-[color:var(--carnet-blue)] pl-4">
          <p className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-white/70">
            Proposition adaptée
          </p>
          <p className="mt-2 max-w-[48ch] text-sm leading-6 text-white/78">
            {demo.adaptedProposal}
          </p>
          <p className="mt-2 text-xs leading-5 text-white/65">{demo.help}</p>
        </div>
      );
    case "final":
      return (
        <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 font-mono text-xs">
          <span className="text-[color:var(--carnet-green)]">
            {demo.finalStatus}
          </span>
          <span className="text-white/55">{demo.fileName}</span>
        </div>
      );
  }
}

function TransformationStep({
  step,
  index,
  progress,
  enhanced,
  demo,
}: {
  step: ReportTransformationStep;
  index: number;
  progress: MotionValue<number>;
  enhanced: boolean;
  demo: ReportTransformationDemo;
}) {
  const range = stepRanges[index] ?? stepRanges[0]!;
  const opacity = useTransform(progress, range.input, range.opacity);
  const y = useTransform(progress, range.input, range.y);

  return (
    <m.li
      data-report-state={step.id}
      className="border-t border-white/14 py-8 md:min-h-72 md:py-12"
      style={enhanced ? { opacity, y } : undefined}
    >
      <div className="grid gap-4 sm:grid-cols-[4.5rem_1fr]">
        <span className="font-mono text-xs text-white/60">
          0{index + 1}
        </span>
        <div>
          <h3 className="text-2xl font-semibold tracking-[-0.035em] text-white md:text-3xl">
            {step.label}
          </h3>
          <p className="mt-2 max-w-[44ch] text-sm leading-6 text-white/60 md:text-base md:leading-7">
            {step.body}
          </p>
          <StepStateContent step={step} demo={demo} />
        </div>
      </div>
    </m.li>
  );
}

function DocumentBody({
  step,
  demo,
}: {
  step: ReportTransformationStep;
  demo: ReportTransformationDemo;
}) {
  if (step.id === "note") {
    return (
      <div>
        <p className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[color:var(--carnet-muted)]">
          Note technique
        </p>
        <p className="mt-3 text-base leading-7 text-[color:var(--carnet-ink)]">
          {demo.observation}
        </p>
      </div>
    );
  }

  if (step.id === "structure") {
    return (
      <div>
        <p className="border-l-2 border-[color:var(--carnet-blue)] pl-2 font-mono text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[color:var(--carnet-ink)]">
          Observation structurée
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {["Thorax", "Côté gauche", "Mobilité"].map((item) => (
            <span
              key={item}
              className="rounded-full bg-[color:var(--carnet-blue-soft)] px-3 py-1.5 font-mono text-[0.65rem] font-semibold text-[color:var(--carnet-ink)]"
            >
              {item}
            </span>
          ))}
        </div>
        <p className="mt-4 text-base leading-7 text-[color:var(--carnet-ink)]">
          {demo.observation}
        </p>
      </div>
    );
  }

  if (step.id === "language") {
    return (
      <div>
        <p className="border-l-2 border-[color:var(--carnet-blue)] pl-2 font-mono text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[color:var(--carnet-ink)]">
          Proposition adaptée
        </p>
        <p className="mt-3 text-base leading-7 text-[color:var(--carnet-ink)]">
          {demo.adaptedProposal}
        </p>
        <p className="mt-4 border-t border-[color:var(--carnet-line)] pt-4 text-xs leading-5 text-[color:var(--carnet-muted)]">
          {demo.help}
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <p className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[color:var(--carnet-ink)]">
          {demo.finalStatus}
        </p>
        <span className="size-2 rounded-full bg-[color:var(--carnet-green)]" />
      </div>
      <p className="mt-4 text-base leading-7 text-[color:var(--carnet-ink)]">
        {demo.adaptedProposal}
      </p>
      <div className="mt-6 flex items-center justify-between gap-4 border-t border-[color:var(--carnet-line)] pt-4">
        <span className="font-mono text-xs text-[color:var(--carnet-muted)]">
          {demo.fileName}
        </span>
        <span className="rounded-full bg-[color:var(--carnet-ink)] px-4 py-2 text-xs font-semibold text-white">
          Partager le PDF
        </span>
      </div>
    </div>
  );
}

function ReportDocumentLayer({
  step,
  index,
  progress,
  enhanced,
  demo,
}: {
  step: ReportTransformationStep;
  index: number;
  progress: MotionValue<number>;
  enhanced: boolean;
  demo: ReportTransformationDemo;
}) {
  const range = layerRanges[index] ?? layerRanges[0]!;
  const opacity = useTransform(progress, range.input, range.opacity);
  const y = useTransform(progress, range.input, range.y);

  return (
    <m.article
      data-report-layer={step.id}
      className="report-document-layer overflow-hidden rounded-[0.8rem_0.8rem_2.25rem_0.8rem] border border-black/10 bg-[color:var(--carnet-surface)] text-[color:var(--carnet-ink)] shadow-[0_42px_100px_-58px_rgba(0,0,0,0.65)]"
      style={enhanced ? { opacity, y } : undefined}
    >
      <div className="flex items-center justify-between border-b border-[color:var(--carnet-line)] px-6 py-5">
        <div>
          <p className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.15em] text-[color:var(--carnet-muted)]">
            Compte rendu propriétaire
          </p>
          <p className="mt-1 text-sm font-semibold">Séance · Cheval</p>
        </div>
        <span className="font-mono text-[0.65rem] text-[color:var(--carnet-muted)]">
          0{index + 1} / 04
        </span>
      </div>
      <div className="min-h-72 px-6 py-7">
        <DocumentBody step={step} demo={demo} />
      </div>
    </m.article>
  );
}

function ReportDocumentSequence({
  demo,
  progress,
  enhanced,
}: {
  demo: ReportTransformationDemo;
  progress: MotionValue<number>;
  enhanced: boolean;
}) {
  return (
    <div
      aria-hidden="true"
      className={enhanced ? "hidden md:sticky md:top-28 md:block" : "hidden"}
    >
      <div className="relative pl-6">
        <div className="absolute bottom-4 left-0 top-4 w-px overflow-hidden bg-white/16">
          <m.div
            className="h-full w-full origin-top bg-[linear-gradient(to_bottom,#6b5ac8,#5d9bb8,#2e9866)]"
            style={{ scaleY: progress }}
          />
        </div>
        <div className="report-document-layers">
          {demo.steps.map((step, index) => (
            <ReportDocumentLayer
              key={step.id}
              step={step}
              index={index}
              progress={progress}
              enhanced={enhanced}
              demo={demo}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function ReportTransformationStory({
  demo,
}: Readonly<{ demo: ReportTransformationDemo }>) {
  const sectionRef = useRef<HTMLElement>(null);
  const isDesktop = useDesktopEnhancement();
  const reduceMotion = useReducedMotion();
  const enhanced = isDesktop && reduceMotion === false;
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  return (
    <LazyMotion features={domAnimation} strict>
      <section
        ref={sectionRef}
        id="produit"
        data-landing-section="transformation"
        className={`scroll-mt-18 bg-[color:var(--carnet-anthracite)] px-4 py-12 text-white sm:px-6 md:py-20 lg:px-8 ${
          enhanced ? "md:min-h-[160svh]" : ""
        }`}
      >
        <div className="mx-auto max-w-[90rem]">
          <div className="max-w-4xl">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--carnet-blue)]">
              Du geste au document
            </p>
            <h2 className="mt-4 text-4xl font-semibold leading-[0.96] tracking-[-0.052em] md:text-6xl lg:text-7xl">
              Une note devient un document que le propriétaire peut {" "}
              <span className="font-[family-name:var(--font-newsreader)] font-normal italic">
                comprendre.
              </span>
            </h2>
          </div>

          <div
            className={`mt-12 gap-14 lg:mt-16 ${
              enhanced
                ? "md:grid md:grid-cols-[0.84fr_1.16fr] md:items-start"
                : ""
            }`}
          >
            <ol>
              {demo.steps.map((step, index) => (
                <TransformationStep
                  key={step.id}
                  step={step}
                  index={index}
                  progress={scrollYProgress}
                  enhanced={enhanced}
                  demo={demo}
                />
              ))}
            </ol>
            <ReportDocumentSequence
              demo={demo}
              progress={scrollYProgress}
              enhanced={enhanced}
            />
          </div>
        </div>
      </section>
    </LazyMotion>
  );
}
```

- [ ] **Step 4: Add the same-surface stacking rule**

Append to `apps/marketing/app/globals.css` before the reduced-motion block:

```css
.report-document-layers {
  display: grid;
}

.report-document-layer {
  grid-area: 1 / 1;
  will-change: transform, opacity;
}
```

This is the rule that prevents the rejected side-by-side “technical note versus owner version” composition: every state replaces the previous one in the same document surface.

- [ ] **Step 5: Run the focused test and verify GREEN**

Run:

```bash
bun test apps/marketing/__tests__/report-transformation-story.test.tsx
```

Expected: `2 pass, 0 fail`.

- [ ] **Step 6: Commit the story**

```bash
git add apps/marketing/__tests__/report-transformation-story.test.tsx apps/marketing/components/landing/report-transformation-story.tsx apps/marketing/app/globals.css
git commit -m "feat(marketing): add report transformation story"
```

---

### Task 6: Show only product capabilities that exist

**Files:**
- Create: `apps/marketing/__tests__/product-proof.test.tsx`
- Create: `apps/marketing/components/landing/product-proof.tsx`

**Interfaces:**
- Consumes: no client state and no network data.
- Produces: `ProductProof()` as the third `data-landing-section`, with one editor surface and exactly two output surfaces marked `data-product-output`.

- [ ] **Step 1: Write the failing capability contract**

Create `apps/marketing/__tests__/product-proof.test.tsx`:

```tsx
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "bun:test";

import { ProductProof } from "../components/landing/product-proof";
import { textOnly } from "./landing-test-utils";

describe("product proof", () => {
  test("shows the supported editor and two factual outputs", () => {
    const html = renderToStaticMarkup(<ProductProof />);
    const text = textOnly(html);

    expect(text).toContain(
      "Pas une promesse abstraite. Les outils réellement disponibles.",
    );
    for (const capability of [
      "Observations",
      "Anatomie",
      "Recommandations",
      "Notes",
      "Adapter le langage",
      "Prévisualiser",
      "Finaliser",
    ]) {
      expect(html).toContain(capability);
    }
    expect(html).toContain("PDF professionnel");
    expect(html).toContain("Compte-rendu-seance.pdf");
    expect(html).toContain("Relance de rendez-vous");
    expect(html).toContain(
      "Échéance choisie par le praticien : dans 30 jours",
    );
    expect(html.match(/data-product-output=/g)).toHaveLength(2);
  });

  test("does not sell unsupported results or owner-response features", () => {
    const html = renderToStaticMarkup(<ProductProof />).toLowerCase();

    for (const forbidden of [
      "timeline animal",
      "retour à j+7",
      "réponse propriétaire",
      "questionnaire",
      "documents illimités",
      "4.9/5",
      "gagnez du temps",
      "comptes rendus pour les chats",
    ]) {
      expect(html).not.toContain(forbidden);
    }
  });
});
```

- [ ] **Step 2: Run the test and verify RED**

Run:

```bash
bun test apps/marketing/__tests__/product-proof.test.tsx
```

Expected: FAIL because `product-proof.tsx` does not exist.

- [ ] **Step 3: Implement the editor and two output objects**

Create `apps/marketing/components/landing/product-proof.tsx`:

```tsx
const editorFields = [
  {
    label: "Observations",
    value:
      "Une tension plus présente a été observée du côté gauche, au niveau du thorax.",
  },
  { label: "Anatomie", value: "Thorax · côté gauche" },
  {
    label: "Recommandations",
    value:
      "Ajoutez uniquement les recommandations que vous souhaitez transmettre.",
  },
  {
    label: "Notes",
    value: "Champ libre, modifiable avant la finalisation.",
  },
] as const;

export function ProductProof() {
  return (
    <section
      id="comment-ca-marche"
      data-landing-section="product-proof"
      className="scroll-mt-18 px-4 py-12 sm:px-6 md:py-20 lg:px-8"
    >
      <div className="mx-auto max-w-[90rem]">
        <div className="grid gap-6 lg:grid-cols-[0.76fr_1.24fr] lg:items-end">
          <div>
            <p className="border-l-2 border-[color:var(--carnet-blue)] pl-3 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--carnet-ink)]">
              Ce qui existe aujourd&apos;hui
            </p>
            <h2 className="mt-4 max-w-3xl text-4xl font-semibold leading-[0.96] tracking-[-0.052em] text-[color:var(--carnet-ink)] md:text-6xl">
              Pas une promesse abstraite. {" "}
              <span className="font-[family-name:var(--font-newsreader)] font-normal italic">
                Les outils réellement disponibles.
              </span>
            </h2>
          </div>
          <p className="max-w-[56ch] text-base leading-7 text-[color:var(--carnet-muted)] lg:justify-self-end md:text-lg md:leading-8">
            L&apos;éditeur structure le compte rendu. Vous adaptez les mots,
            prévisualisez le résultat et choisissez vous-même quand le
            finaliser.
          </p>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-[1.42fr_0.58fr] lg:items-start">
          <article
            data-product-editor
            className="overflow-hidden rounded-[0.75rem_0.75rem_2rem_0.75rem] border border-[color:var(--carnet-line)] bg-[color:var(--carnet-surface)] shadow-[0_36px_90px_-62px_rgba(29,29,33,0.38)]"
          >
            <div className="flex flex-col gap-4 border-b border-[color:var(--carnet-line)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
              <div>
                <p className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-[color:var(--carnet-muted)]">
                  Éditeur de compte rendu
                </p>
                <h3 className="mt-1 text-lg font-semibold tracking-[-0.025em] text-[color:var(--carnet-ink)]">
                  Séance du 12 juillet
                </h3>
              </div>
              <span className="w-fit rounded-full bg-[color:var(--carnet-violet-soft)] px-3 py-1.5 font-mono text-[0.65rem] font-semibold text-[color:var(--carnet-violet)]">
                Brouillon modifiable
              </span>
            </div>

            <div className="grid md:grid-cols-[11rem_1fr]">
              <aside
                aria-label="Rubriques illustrées du compte rendu"
                className="hidden border-b border-[color:var(--carnet-line)] bg-[color:var(--carnet-muted-surface)] p-4 md:block md:border-b-0 md:border-r"
              >
                <ol className="grid grid-cols-2 gap-2 md:grid-cols-1">
                  {editorFields.map((field, index) => (
                    <li
                      key={field.label}
                      className={`rounded-lg px-3 py-2.5 text-sm font-medium ${
                        index === 0
                          ? "bg-[color:var(--carnet-surface)] text-[color:var(--carnet-ink)]"
                          : "text-[color:var(--carnet-muted)]"
                      }`}
                    >
                      {field.label}
                    </li>
                  ))}
                </ol>
              </aside>

              <div className="p-5 sm:p-7">
                <div className="grid gap-4 sm:grid-cols-2">
                  {editorFields.map((field, index) => (
                    <div
                      key={field.label}
                      className={`border-b border-[color:var(--carnet-line)] pb-4 ${
                        index === 0 ? "sm:col-span-2" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-[color:var(--carnet-muted)]">
                          {field.label}
                        </p>
                        {index === 0 ? (
                          <span className="rounded-full bg-[color:var(--carnet-blue-soft)] px-2.5 py-1 font-mono text-[0.62rem] font-semibold text-[color:var(--carnet-ink)]">
                            Adapter le langage
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-2 text-sm leading-6 text-[color:var(--carnet-ink)]">
                        {field.value}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex flex-wrap justify-end gap-2">
                  <span className="inline-flex min-h-10 items-center rounded-full border border-[color:var(--carnet-line)] px-4 text-xs font-semibold text-[color:var(--carnet-ink)]">
                    Prévisualiser
                  </span>
                  <span className="inline-flex min-h-10 items-center rounded-full bg-[color:var(--carnet-green)] px-4 text-xs font-semibold text-[color:var(--carnet-ink)]">
                    Finaliser
                  </span>
                </div>
              </div>
            </div>
          </article>

          <div className="grid gap-5 lg:pt-16">
            <article
              data-product-output="pdf"
              className="rounded-[0.75rem_0.75rem_1.5rem_0.75rem] border border-[color:var(--carnet-line)] bg-[color:var(--carnet-surface)] p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[color:var(--carnet-ink)]">
                    PDF professionnel
                  </p>
                  <h3 className="mt-3 text-lg font-semibold tracking-[-0.025em] text-[color:var(--carnet-ink)]">
                    Compte-rendu-seance.pdf
                  </h3>
                </div>
                <span className="flex size-9 items-center justify-center rounded-full bg-[color:var(--carnet-green-soft)] font-mono text-xs font-semibold text-[color:var(--carnet-ink)]">
                  PDF
                </span>
              </div>
              <p className="mt-4 text-sm leading-6 text-[color:var(--carnet-muted)]">
                Téléchargé ou joint à l&apos;email que vous choisissez
                d&apos;envoyer.
              </p>
            </article>

            <article
              data-product-output="reminder"
              className="rounded-[1.5rem_0.75rem_0.75rem_0.75rem] border border-[color:var(--carnet-line)] bg-[color:var(--carnet-blue-soft)] p-5"
            >
              <p className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[color:var(--carnet-ink)]">
                Relance de rendez-vous
              </p>
              <h3 className="mt-3 text-lg font-semibold tracking-[-0.025em] text-[color:var(--carnet-ink)]">
                Échéance choisie par le praticien : dans 30 jours
              </h3>
              <p className="mt-4 text-sm leading-6 text-[color:var(--carnet-muted)]">
                Un message de reprise de rendez-vous planifié selon votre
                échéance.
              </p>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Run the focused test and verify GREEN**

Run:

```bash
bun test apps/marketing/__tests__/product-proof.test.tsx
```

Expected: `2 pass, 0 fail`.

- [ ] **Step 5: Commit the factual product proof**

```bash
git add apps/marketing/__tests__/product-proof.test.tsx apps/marketing/components/landing/product-proof.tsx
git commit -m "feat(marketing): show factual product proof"
```

---

### Task 7: Combine practitioner control with an accessible price decision

**Files:**
- Create: `apps/marketing/__tests__/pricing-decision.test.tsx`
- Create: `apps/marketing/components/landing/pricing-selector.tsx`
- Create: `apps/marketing/components/landing/pricing-decision.tsx`

**Interfaces:**
- Consumes: `webAppPath("/signup")` and serializable `BillingOptions` supplied by the server component.
- Produces: `BillingCycle`, `BillingOption`, `BillingOptions`, `PricingSelector({ options, defaultCycle? })`, `billingOptions`, and `PricingDecision()` as the fourth `data-landing-section`.

- [ ] **Step 1: Write the failing pricing and accessibility contract**

Create `apps/marketing/__tests__/pricing-decision.test.tsx`:

```tsx
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "bun:test";

import {
  billingOptions,
  PricingDecision,
} from "../components/landing/pricing-decision";
import { webAppPath } from "../lib/web-app-url";
import {
  conversionAnchors,
  exactZeroOpacity,
  textOnly,
} from "./landing-test-utils";

describe("pricing decision", () => {
  test("leads with practitioner control and the annual price", () => {
    const html = renderToStaticMarkup(<PricingDecision />);
    const text = textOnly(html);
    const signupAnchors = conversionAnchors(html, "pricing-signup");

    expect(text).toContain("Biume prépare. Vous décidez.");
    expect(text).toContain(
      "Biume ne partage rien automatiquement. Vous relisez, corrigez et déclenchez vous-même le partage.",
    );
    expect(html).toContain("24,99 €");
    expect(html).toContain("par mois, facturé annuellement");
    expect(html).toContain("299,88 € facturés une fois par an");
    expect(html).toContain("29,99 € / mois");
    expect(billingOptions.annual).toEqual({
      label: "Annuel",
      selectorPrice: "24,99 € / mois",
      price: "24,99 €",
      suffix: "par mois, facturé annuellement",
      detail: "299,88 € facturés une fois par an",
    });
    expect(billingOptions.monthly).toEqual({
      label: "Mensuel",
      selectorPrice: "29,99 € / mois",
      price: "29,99 €",
      suffix: "par mois",
      detail: "Facturation mensuelle, résiliable en fin de période",
    });
    expect(text).toContain(
      "15 jours pour tester l'ensemble du parcours, sans carte bancaire.",
    );
    expect(html).toContain('aria-pressed="true"');
    expect(html).toContain('aria-pressed="false"');
    expect(html).toContain('aria-live="polite"');
    expect(signupAnchors).toHaveLength(1);
    expect(signupAnchors[0]).toContain(`href="${webAppPath("/signup")}"`);
    expect(html).not.toMatch(exactZeroOpacity);
  });

  test("keeps motion inside the price selector", async () => {
    const selectorSource = await Bun.file(
      new URL("../components/landing/pricing-selector.tsx", import.meta.url),
    ).text();
    const decisionSource = await Bun.file(
      new URL("../components/landing/pricing-decision.tsx", import.meta.url),
    ).text();

    expect(selectorSource).toContain('"use client"');
    expect(selectorSource).toContain("useState");
    expect(selectorSource).toContain("LazyMotion");
    expect(selectorSource).toContain("useReducedMotion");
    expect(selectorSource).not.toContain("repeat: Infinity");
    expect(decisionSource).not.toContain('"use client"');
    expect(decisionSource).not.toContain('from "motion/react"');
  });
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```bash
bun test apps/marketing/__tests__/pricing-decision.test.tsx
```

Expected: FAIL because the pricing components do not exist.

- [ ] **Step 3: Implement the isolated billing selector**

Create `apps/marketing/components/landing/pricing-selector.tsx`:

```tsx
"use client";

import {
  AnimatePresence,
  domAnimation,
  LazyMotion,
  m,
  useReducedMotion,
} from "motion/react";
import { useState } from "react";

export type BillingCycle = "annual" | "monthly";

export type BillingOption = Readonly<{
  label: string;
  selectorPrice: string;
  price: string;
  suffix: string;
  detail: string;
}>;

export type BillingOptions = Readonly<Record<BillingCycle, BillingOption>>;

export type PricingSelectorProps = Readonly<{
  options: BillingOptions;
  defaultCycle?: BillingCycle;
}>;

export function PricingSelector({
  options,
  defaultCycle = "annual",
}: PricingSelectorProps) {
  const [cycle, setCycle] = useState<BillingCycle>(defaultCycle);
  const reduceMotion = useReducedMotion();
  const selected = options[cycle];

  return (
    <LazyMotion features={domAnimation} strict>
      <div>
        <div
          data-billing-selector
          role="group"
          aria-label="Choisir la facturation"
          className="grid gap-1 rounded-xl bg-[color:var(--carnet-muted-surface)] p-1.5 sm:grid-cols-2"
        >
          {(Object.keys(options) as BillingCycle[]).map((optionCycle) => {
            const option = options[optionCycle];
            const isSelected = optionCycle === cycle;

            return (
              <button
                key={optionCycle}
                type="button"
                aria-pressed={isSelected}
                onClick={() => setCycle(optionCycle)}
                className={`relative min-h-12 rounded-[0.6rem] px-4 py-3 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--carnet-violet)] ${
                  isSelected
                    ? "text-white"
                    : "text-[color:var(--carnet-ink)]"
                }`}
              >
                {isSelected ? (
                  <m.span
                    layoutId="carnet-billing-selection"
                    className="absolute inset-0 rounded-[0.6rem] bg-[color:var(--carnet-ink)]"
                    transition={
                      reduceMotion === true
                        ? { duration: 0 }
                        : { type: "spring", stiffness: 420, damping: 34 }
                    }
                  />
                ) : null}
                <span className="relative block text-sm font-semibold">
                  {option.label}
                </span>
                <span
                  className={`relative mt-1 block font-mono text-xs ${
                    isSelected ? "text-white/70" : "text-[color:var(--carnet-muted)]"
                  }`}
                >
                  {option.selectorPrice}
                </span>
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <m.div
            key={cycle}
            data-billing-price
            aria-live="polite"
            aria-atomic="true"
            initial={
              reduceMotion === true ? false : { opacity: 0.72, y: 8 }
            }
            animate={{ opacity: 1, y: 0 }}
            exit={
              reduceMotion === true
                ? { opacity: 1 }
                : { opacity: 0.72, y: -6 }
            }
            transition={{
              duration: reduceMotion === true ? 0 : 0.24,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="mt-8"
          >
            <div className="flex flex-wrap items-end gap-x-3 gap-y-2">
              <span className="font-mono text-5xl font-semibold leading-none tracking-[-0.055em] text-[color:var(--carnet-ink)] md:text-7xl">
                {selected.price}
              </span>
              <span className="max-w-52 pb-1 text-sm leading-5 text-[color:var(--carnet-muted)]">
                {selected.suffix}
              </span>
            </div>
            <p className="mt-3 text-sm text-[color:var(--carnet-muted)]">
              {selected.detail}
            </p>
          </m.div>
        </AnimatePresence>
      </div>
    </LazyMotion>
  );
}
```

- [ ] **Step 4: Implement the server-rendered control and price section**

Create `apps/marketing/components/landing/pricing-decision.tsx`:

```tsx
import Link from "next/link";

import { webAppPath } from "../../lib/web-app-url";
import {
  PricingSelector,
  type BillingOptions,
} from "./pricing-selector";

export const billingOptions = {
  annual: {
    label: "Annuel",
    selectorPrice: "24,99 € / mois",
    price: "24,99 €",
    suffix: "par mois, facturé annuellement",
    detail: "299,88 € facturés une fois par an",
  },
  monthly: {
    label: "Mensuel",
    selectorPrice: "29,99 € / mois",
    price: "29,99 €",
    suffix: "par mois",
    detail: "Facturation mensuelle, résiliable en fin de période",
  },
} as const satisfies BillingOptions;

const included = [
  "Compte rendu structuré",
  "Adaptation du langage technique",
  "Prévisualisation et finalisation",
  "Export PDF professionnel",
  "Relance de rendez-vous planifiée",
] as const;

export function PricingDecision() {
  return (
    <section
      id="tarifs"
      data-landing-section="pricing"
      className="scroll-mt-18 border-y border-[color:var(--carnet-line)] px-4 py-12 sm:px-6 md:py-20 lg:px-8"
    >
      <div className="mx-auto max-w-[90rem]">
        <div
          data-control-interlude
          className="grid gap-6 border-b border-[color:var(--carnet-line)] pb-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-end"
        >
          <h2 className="text-4xl font-semibold leading-[0.96] tracking-[-0.052em] text-[color:var(--carnet-ink)] md:text-6xl">
            Biume prépare. {" "}
            <span className="font-[family-name:var(--font-newsreader)] font-normal italic text-[color:var(--carnet-violet)]">
              Vous décidez.
            </span>
          </h2>
          <p className="max-w-[60ch] text-base leading-7 text-[color:var(--carnet-muted)] lg:justify-self-end md:text-lg md:leading-8">
            Biume ne partage rien automatiquement. Vous relisez, corrigez et
            déclenchez vous-même le partage.
          </p>
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-[0.84fr_1.16fr] lg:items-start lg:gap-16">
          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--carnet-violet)]">
              Une offre, deux rythmes
            </p>
            <h3 className="mt-4 text-3xl font-semibold leading-[1] tracking-[-0.045em] text-[color:var(--carnet-ink)] md:text-5xl">
              Testez tout le parcours avant de choisir.
            </h3>
            <p className="mt-5 max-w-[48ch] text-base leading-7 text-[color:var(--carnet-muted)]">
              15 jours pour tester l&apos;ensemble du parcours, sans carte
              bancaire.
            </p>

            <ul className="mt-8 grid grid-cols-2 gap-3 border-t border-[color:var(--carnet-line)] pt-6 lg:grid-cols-1">
              {included.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-sm leading-6 text-[color:var(--carnet-ink)]"
                >
                  <span
                    aria-hidden="true"
                    className="mt-2 size-1.5 shrink-0 rounded-full bg-[color:var(--carnet-green)]"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-[0.8rem_0.8rem_2rem_0.8rem] border border-[color:var(--carnet-line)] bg-[color:var(--carnet-surface)] p-6 shadow-[0_36px_90px_-62px_rgba(29,29,33,0.38)] sm:p-8 lg:p-10">
            <PricingSelector options={billingOptions} />
            <Link
              href={webAppPath("/signup")}
              prefetch={false}
              data-conversion="pricing-signup"
              className="carnet-action mt-8 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[color:var(--carnet-violet)] px-6 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--carnet-violet)]"
            >
              Essayer gratuitement
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Run the focused test and verify GREEN**

Run:

```bash
bun test apps/marketing/__tests__/pricing-decision.test.tsx
```

Expected: `2 pass, 0 fail`.

- [ ] **Step 6: Commit the decision section**

```bash
git add apps/marketing/__tests__/pricing-decision.test.tsx apps/marketing/components/landing/pricing-selector.tsx apps/marketing/components/landing/pricing-decision.tsx
git commit -m "feat(marketing): add accessible pricing decision"
```

---

### Task 8: Resolve objections, close with one CTA, and clean the shared footer

**Files:**
- Create: `apps/marketing/__tests__/landing-close.test.tsx`
- Create: `apps/marketing/components/landing/landing-faq.tsx`
- Create: `apps/marketing/components/landing/final-cta.tsx`
- Modify: `apps/marketing/components/footer.tsx`
- Modify: `apps/marketing/__tests__/home-landing.test.tsx` (temporary footer expectation; Task 9 replaces the file)
- Modify: `apps/marketing/__tests__/marketing-pages.test.tsx`

**Interfaces:**
- Consumes: `webAppPath("/signup")`, `/privacy`, `/cgu`, the existing owner/practitioner photo, and the existing Cal.com demo URL.
- Produces: `LandingFaq()` with a root `<div>`, `FinalCta()` with a root `<aside>`, and the same default `LandingFooter` export consumed by secondary pages.

- [ ] **Step 1: Write the failing FAQ, final CTA, and footer contract**

Create `apps/marketing/__tests__/landing-close.test.tsx`:

```tsx
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "bun:test";

import LandingFooter from "../components/footer";
import { FinalCta } from "../components/landing/final-cta";
import { LandingFaq } from "../components/landing/landing-faq";
import { webAppPath } from "../lib/web-app-url";
import {
  conversionAnchors,
  renderWithLandingImageConfig,
  textOnly,
} from "./landing-test-utils";

describe("landing objection handling and close", () => {
  test("answers the five approved objections with native disclosures", () => {
    const html = renderToStaticMarkup(<LandingFaq />);
    const text = textOnly(html);

    expect(html.match(/<details/g)).toHaveLength(5);
    expect(html.match(/data-faq-item=/g)).toHaveLength(5);
    for (const question of [
      "Biume remplace-t-il un logiciel de gestion ?",
      "Biume écrit-il à la place du praticien ?",
      "Chaque texte peut-il être modifié avant le partage ?",
      "Que reçoit le propriétaire ?",
      "Comment arrêter l&#x27;abonnement ?",
    ]) {
      expect(html).toContain(question);
    }
    for (const answer of [
      "Non. Biume se concentre sur le compte rendu propriétaire et le suivi post-séance. Il complète votre organisation actuelle.",
      "Biume prépare une proposition à partir de vos notes. Lorsque vous l'appliquez, elle remplace le texte du champ courant et reste entièrement modifiable.",
      "Oui. Vous pouvez modifier chaque champ avant de déclencher vous-même le téléchargement ou l'envoi.",
      "Le propriétaire reçoit le PDF professionnel joint à l'email que vous choisissez d'envoyer.",
      "Vous pouvez demander l'annulation depuis les paramètres de facturation. Elle prend effet à la fin de la période en cours.",
    ]) {
      expect(text).toContain(answer);
    }
    expect(html).toContain('href="/privacy"');
    expect(html).toContain('href="/cgu"');
    expect(html).not.toContain("hébergé en France");
    expect(html).not.toContain("conforme au RGPD");
  });

  test("final moment presents one signup action and no competing demo", () => {
    const html = renderWithLandingImageConfig(<FinalCta />);
    const text = textOnly(html);
    const signupAnchors = conversionAnchors(html, "final-signup");

    expect(html).toContain("Votre prochain compte rendu");
    expect(text).toContain(
      "La séance est terminée. Le suivi peut commencer.",
    );
    expect(text).toContain(
      "Créez votre espace et préparez un premier document.",
    );
    expect(html).toContain("practitioner-owner-animal.png");
    expect(signupAnchors).toHaveLength(1);
    expect(signupAnchors[0]).toContain(`href="${webAppPath("/signup")}"`);
    expect(html.match(/<a\b/g)).toHaveLength(1);
    expect(html).not.toContain("cal.com");
  });

  test("shared footer keeps legal and demo links without unsupported claims", () => {
    const html = renderWithLandingImageConfig(<LandingFooter />);

    expect(html).toContain('href="/privacy"');
    expect(html).toContain('href="/cgu"');
    expect(html).toContain(
      'href="https://cal.com/mathieu-chambaud-biume"',
    );
    expect(html).not.toContain('href="/contact"');
    expect(html).not.toContain("Hébergé en France");
    expect(html).not.toContain("conforme au RGPD");
  });
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```bash
bun test apps/marketing/__tests__/landing-close.test.tsx
```

Expected: FAIL because the new FAQ/final components are absent; the footer assertions also fail on `/contact` and the undocumented claim.

- [ ] **Step 3: Implement the exact five native FAQ disclosures**

Create `apps/marketing/components/landing/landing-faq.tsx`:

```tsx
import Link from "next/link";

const faqItems = [
  {
    question: "Biume remplace-t-il un logiciel de gestion ?",
    answer:
      "Non. Biume se concentre sur le compte rendu propriétaire et le suivi post-séance. Il complète votre organisation actuelle.",
  },
  {
    question: "Biume écrit-il à la place du praticien ?",
    answer:
      "Biume prépare une proposition à partir de vos notes. Lorsque vous l'appliquez, elle remplace le texte du champ courant et reste entièrement modifiable.",
  },
  {
    question: "Chaque texte peut-il être modifié avant le partage ?",
    answer:
      "Oui. Vous pouvez modifier chaque champ avant de déclencher vous-même le téléchargement ou l'envoi.",
  },
  {
    question: "Que reçoit le propriétaire ?",
    answer:
      "Le propriétaire reçoit le PDF professionnel joint à l'email que vous choisissez d'envoyer.",
  },
  {
    question: "Comment arrêter l'abonnement ?",
    answer:
      "Vous pouvez demander l'annulation depuis les paramètres de facturation. Elle prend effet à la fin de la période en cours.",
  },
] as const;

export function LandingFaq() {
  return (
    <div
      data-landing-faq
      className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-16"
    >
      <div className="max-w-xl">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--carnet-violet)]">
          Avant de commencer
        </p>
        <h2 className="mt-4 text-4xl font-semibold leading-[0.96] tracking-[-0.052em] text-[color:var(--carnet-ink)] md:text-6xl">
          Les questions qui {" "}
          <span className="font-[family-name:var(--font-newsreader)] font-normal italic">
            comptent vraiment.
          </span>
        </h2>
        <p className="mt-5 text-sm leading-6 text-[color:var(--carnet-muted)] md:text-base md:leading-7">
          Pour la confidentialité, consultez notre {" "}
          <Link
            href="/privacy"
            className="font-semibold text-[color:var(--carnet-ink)] underline decoration-[color:var(--carnet-blue)] underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--carnet-violet)]"
          >
            politique de confidentialité
          </Link>
          . Les conditions contractuelles sont détaillées dans nos {" "}
          <Link
            href="/cgu"
            className="font-semibold text-[color:var(--carnet-ink)] underline decoration-[color:var(--carnet-blue)] underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--carnet-violet)]"
          >
            CGU
          </Link>
          .
        </p>
      </div>

      <div className="border-t border-[color:var(--carnet-line)]">
        {faqItems.map((item) => (
          <details
            key={item.question}
            data-faq-item={item.question}
            className="group border-b border-[color:var(--carnet-line)] py-4"
          >
            <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-5 rounded-sm py-2 text-base font-semibold leading-7 text-[color:var(--carnet-ink)] marker:hidden focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[color:var(--carnet-violet)]">
              <span>{item.question}</span>
              <span
                data-faq-indicator
                aria-hidden="true"
                className="flex size-8 shrink-0 items-center justify-center rounded-full border border-[color:var(--carnet-line)] text-lg font-medium"
              >
                +
              </span>
            </summary>
            <p className="max-w-[68ch] pb-3 pt-2 text-sm leading-6 text-[color:var(--carnet-muted)] md:text-base md:leading-7">
              {item.answer}
            </p>
          </details>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Implement the one-action final CTA**

Create `apps/marketing/components/landing/final-cta.tsx`:

```tsx
import Image from "next/image";
import Link from "next/link";

import { webAppPath } from "../../lib/web-app-url";

export function FinalCta() {
  return (
    <aside
      data-final-cta
      className="mt-12 grid overflow-hidden rounded-[0.8rem_0.8rem_2.25rem_0.8rem] border border-[color:var(--carnet-line)] bg-[color:var(--carnet-surface)] md:mt-16 lg:grid-cols-[1.08fr_0.92fr]"
    >
      <div className="relative min-h-56 bg-[color:var(--carnet-muted-surface)] sm:min-h-72 lg:min-h-[30rem]">
        <Image
          src="/assets/images/landing/practitioner-owner-animal.png"
          alt="Une praticienne échange avec la propriétaire d’un animal après une séance"
          fill
          sizes="(min-width: 1280px) 760px, (min-width: 1024px) 56vw, 100vw"
          className="object-cover"
        />
      </div>
      <div className="flex flex-col justify-center p-6 sm:p-10 lg:p-12">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--carnet-violet)]">
          Votre prochain compte rendu
        </p>
        <h2 className="mt-4 text-4xl font-semibold leading-[0.96] tracking-[-0.052em] text-[color:var(--carnet-ink)] md:text-6xl">
          La séance est terminée. {" "}
          <span className="font-[family-name:var(--font-newsreader)] font-normal italic">
            Le suivi peut commencer.
          </span>
        </h2>
        <p className="mt-5 max-w-[42ch] text-base leading-7 text-[color:var(--carnet-muted)]">
          Créez votre espace et préparez un premier document.
        </p>
        <Link
          href={webAppPath("/signup")}
          prefetch={false}
          data-conversion="final-signup"
          className="carnet-action mt-8 inline-flex min-h-12 w-fit items-center justify-center rounded-full bg-[color:var(--carnet-violet)] px-6 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--carnet-violet)]"
        >
          Essayer gratuitement
        </Link>
      </div>
    </aside>
  );
}
```

- [ ] **Step 5: Replace the footer with the same API and truthful content**

Replace `apps/marketing/components/footer.tsx` with:

```tsx
import Image from "next/image";
import Link from "next/link";

const productLinks = [
  { href: "/osteopathe-animalier", label: "Ostéopathe animalier" },
  {
    href: "/logiciel-osteopathe-animalier",
    label: "Logiciel ostéopathe animalier",
  },
  {
    href: "/compte-rendu-osteopathe-animalier",
    label: "Compte rendu propriétaire",
  },
  {
    href: "/modele-compte-rendu-osteopathe-animalier",
    label: "Modèle de compte rendu",
  },
  { href: "/suivi-post-seance-animal", label: "Suivi post-séance" },
  { href: "/blog", label: "Blog ostéopathe animalier" },
  { href: "/tarifs", label: "Tarifs" },
  { href: "/comparatifs", label: "Comparatifs" },
  { href: "/alternatives/animalib", label: "Alternative Animalib" },
  { href: "/alternatives/kiwiappli", label: "Alternative Kiwi Appli" },
  { href: "/alternatives/mytour", label: "Alternative MyTour" },
  { href: "/comparatifs/neovoice-vs-biume", label: "NeoVoice vs Biume" },
  { href: "/alternatives/neovoice", label: "Alternative NeoVoice" },
  {
    href: "https://cal.com/mathieu-chambaud-biume",
    label: "Démo",
  },
] as const;

const legalLinks = [
  { href: "/privacy", label: "Confidentialité" },
  { href: "/cgu", label: "CGU" },
] as const;

const LandingFooter = () => {
  return (
    <footer className="border-t border-border px-4 py-10 md:px-6 md:py-14">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 md:grid-cols-[1.2fr_1fr_auto]">
          <div>
            <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
              <Image
                src="/brand/biume-logo.svg"
                alt=""
                width={32}
                height={32}
                className="size-8"
              />
              Biume
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-6 text-muted-foreground">
              Le compte rendu propriétaire et le suivi post-séance pour les
              ostéopathes animaliers.
            </p>
          </div>

          <div>
            <h2 className="text-sm font-semibold">Produit</h2>
            <ul className="mt-4 grid gap-x-8 gap-y-2.5 sm:grid-cols-2">
              {productLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    {...(link.href.startsWith("http")
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-semibold">Légal</h2>
            <ul className="mt-4 space-y-2.5">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Biume. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
```

- [ ] **Step 6: Run the focused test and verify GREEN**

Run:

```bash
bun test apps/marketing/__tests__/landing-close.test.tsx
```

Expected: `3 pass, 0 fail`.

- [ ] **Step 7: Update stale shared-footer expectations and keep the suite green**

In the existing `apps/marketing/__tests__/home-landing.test.tsx`, replace:

```tsx
    expect(html).toContain("Hébergé en France, conforme au RGPD");
```

with:

```tsx
    expect(html).not.toContain("Hébergé en France");
    expect(html).not.toContain("conforme au RGPD");
    expect(html).not.toContain('href="/contact"');
```

In `apps/marketing/__tests__/marketing-pages.test.tsx`, replace the same positive claim assertion with:

```tsx
    expect(html).toContain('href="/privacy"');
    expect(html).toContain('href="/cgu"');
    expect(html).toContain(
      'href="https://cal.com/mathieu-chambaud-biume"',
    );
    expect(html).not.toContain('href="/contact"');
    expect(html).not.toContain("Hébergé en France");
    expect(html).not.toContain("conforme au RGPD");
```

Run:

```bash
bun test apps/marketing/__tests__/landing-close.test.tsx
bun test apps/marketing/__tests__/home-landing.test.tsx
bun test apps/marketing/__tests__/marketing-pages.test.tsx
```

Expected: all three commands exit `0`.

- [ ] **Step 8: Commit the objection and footer slice**

```bash
git add apps/marketing/__tests__/landing-close.test.tsx apps/marketing/__tests__/home-landing.test.tsx apps/marketing/__tests__/marketing-pages.test.tsx apps/marketing/components/landing/landing-faq.tsx apps/marketing/components/landing/final-cta.tsx apps/marketing/components/footer.tsx
git commit -m "feat(marketing): close landing with factual answers"
```

---

### Task 9: Assemble the five moments and retire only homepage-obsolete code

**Files:**
- Modify: `apps/marketing/app/page.tsx`
- Modify: `apps/marketing/lib/metadata.ts`
- Replace: `apps/marketing/__tests__/home-landing.test.tsx`
- Modify: `apps/marketing/__tests__/seo.test.tsx`
- Delete after reference audit: the seven files listed in the File Structure section.

**Interfaces:**
- Consumes: every public component and type produced by Tasks 1–8, plus the unchanged `JsonLd`, `siteName`, `siteUrl`, and default `LandingFooter` exports.
- Produces: the final homepage Server Component, five ordered `data-landing-section` markers, corrected `Service` and root metadata copy, Newsreader variable `--font-newsreader`, and zero references to the retired homepage components.

- [ ] **Step 1: Replace the homepage test with the final assembled-page contract**

Replace `apps/marketing/__tests__/home-landing.test.tsx` with:

```tsx
import { describe, expect, mock, test } from "bun:test";

import { REPORT_TRANSFORMATION_DEMO } from "../components/landing/report-transformation-demo";
import { webAppPath } from "../lib/web-app-url";
import {
  conversionAnchors,
  exactZeroOpacity,
  renderWithLandingImageConfig,
  textOnly,
} from "./landing-test-utils";

mock.module("next/font/google", () => ({
  Geist: () => ({ variable: "font-geist-sans" }),
  Geist_Mono: () => ({ variable: "font-geist-mono" }),
  Manrope: () => ({ variable: "font-manrope" }),
  Newsreader: () => ({ variable: "font-newsreader" }),
}));

const { default: HomePage } = await import("../app/page");

function getJsonLdSchemas(html: string) {
  return [
    ...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g),
  ].map(([, json]) => JSON.parse(json ?? "{}") as Record<string, unknown>);
}

describe("Biume Carnet vivant homepage", () => {
  test("assembles five ordered conversion moments", () => {
    const html = renderWithLandingImageConfig(<HomePage />);
    const markers = [
      'data-landing-section="hero"',
      'data-landing-section="transformation"',
      'data-landing-section="product-proof"',
      'data-landing-section="pricing"',
      'data-landing-section="faq-cta"',
    ];

    expect(html).toContain("carnet-theme");
    expect(html.match(/data-landing-section=/g)).toHaveLength(5);
    for (const marker of markers) {
      expect(html).toContain(marker);
    }
    for (let index = 1; index < markers.length; index += 1) {
      expect(html.indexOf(markers[index - 1]!)).toBeLessThan(
        html.indexOf(markers[index]!),
      );
    }
  });

  test("renders the approved promise, report story, proof, price and close", () => {
    const html = renderWithLandingImageConfig(<HomePage />);
    const text = textOnly(html);

    expect(text).toContain("Vos observations, dans des mots qui restent.");
    expect(text).toContain(
      "Une note devient un document que le propriétaire peut comprendre.",
    );
    expect(html.match(/data-report-state=/g)).toHaveLength(4);
    expect(text).toContain(REPORT_TRANSFORMATION_DEMO.observation);
    expect(text).toContain(REPORT_TRANSFORMATION_DEMO.adaptedProposal);
    expect(html).toContain("PDF professionnel");
    expect(html).toContain("Relance de rendez-vous");
    expect(html).toContain("24,99 €");
    expect(html).toContain("29,99 € / mois");
    expect(html.match(/<details/g)).toHaveLength(6);
    expect(html.match(/data-faq-item=/g)).toHaveLength(5);
    expect(text).toContain(
      "La séance est terminée. Le suivi peut commencer.",
    );
    expect(html).not.toMatch(exactZeroOpacity);
  });

  test("maps every stable conversion hook to the signup application", () => {
    const html = renderWithLandingImageConfig(<HomePage />);
    const expectedCounts = {
      "header-signup": 2,
      "hero-signup": 1,
      "pricing-signup": 1,
      "final-signup": 1,
    } as const;

    for (const [id, count] of Object.entries(expectedCounts)) {
      const anchors = conversionAnchors(html, id);
      expect(anchors).toHaveLength(count);
      for (const anchor of anchors) {
        expect(anchor).toContain(`href="${webAppPath("/signup")}"`);
      }
    }
  });

  test("keeps the homepage free of unsupported or broken claims", () => {
    const html = renderWithLandingImageConfig(<HomePage />);
    const normalized = html.toLowerCase();

    for (const forbidden of [
      "timeline animal",
      "retour à j+7",
      "naya va mieux depuis la séance",
      "réponse propriétaire centralisée",
      "questionnaire automatique",
      "4.9/5",
      "hébergé en france",
      "conforme au RGPD",
      'href="/contact"',
      "bg-clip-text",
    ]) {
      expect(normalized).not.toContain(forbidden.toLowerCase());
    }
  });

  test("keeps the home schema factual and service-shaped", () => {
    const html = renderWithLandingImageConfig(<HomePage />);
    const schemas = getJsonLdSchemas(html);
    const service = schemas.find((schema) => schema["@type"] === "Service");

    expect(service).toBeDefined();
    expect(service?.description).toBe(
      "Logiciel de compte rendu propriétaire et de suivi post-séance pour ostéopathes animaliers.",
    );
    expect(schemas.some((schema) => schema["@type"] === "SoftwareApplication")).toBe(
      false,
    );
    expect(service?.offers).toBeUndefined();
  });

  test("limits new client boundaries to the three approved islands", async () => {
    const clientIslands = [
      "../components/landing/header-motion.tsx",
      "../components/landing/report-transformation-story.tsx",
      "../components/landing/pricing-selector.tsx",
    ];
    const serverComponents = [
      "../components/landing/landing-header.tsx",
      "../components/landing/landing-hero.tsx",
      "../components/landing/product-proof.tsx",
      "../components/landing/pricing-decision.tsx",
      "../components/landing/landing-faq.tsx",
      "../components/landing/final-cta.tsx",
    ];

    for (const path of clientIslands) {
      const source = await Bun.file(new URL(path, import.meta.url)).text();
      expect(source).toMatch(/^"use client";/);
    }
    for (const path of serverComponents) {
      const source = await Bun.file(new URL(path, import.meta.url)).text();
      expect(source).not.toContain('"use client"');
    }
  });
});
```

The rendered homepage contains six `<details>` elements: one native mobile navigation menu and exactly five FAQ disclosures. The test therefore asserts both the total (`6`) and the FAQ-specific marker count (`5`).

- [ ] **Step 2: Add Newsreader to the SEO test font mock**

In `apps/marketing/__tests__/seo.test.tsx`, replace the existing font mock with:

```tsx
mock.module("next/font/google", () => ({
  Geist: () => ({ variable: "font-geist-sans" }),
  Geist_Mono: () => ({ variable: "font-geist-mono" }),
  Manrope: () => ({ variable: "font-manrope" }),
  Newsreader: () => ({ variable: "font-newsreader" }),
}));
```

In the existing `root metadata targets the primary acquisition keyword` test, replace:

```tsx
    expect(rootMetadata.description).toContain("suivi post-séance");
```

with:

```tsx
    expect(rootMetadata.description).toBe(
      "Biume aide les ostéopathes animaliers à structurer leurs observations, préparer des comptes rendus propriétaire clairs et organiser le suivi post-séance.",
    );
    expect(JSON.stringify(rootMetadata).toLowerCase()).not.toContain(
      "timeline animal",
    );
```

- [ ] **Step 3: Run the homepage contract and verify RED**

Run:

```bash
bun test apps/marketing/__tests__/home-landing.test.tsx
```

Expected: FAIL because `app/page.tsx` still assembles the old homepage, uses Manrope/`landing-theme`, and both the Service schema and root metadata keep stale timeline copy.

- [ ] **Step 4: Assemble the final Server Component page**

Replace `apps/marketing/app/page.tsx` with:

```tsx
import { Newsreader } from "next/font/google";

import LandingFooter from "../components/footer";
import { FinalCta } from "../components/landing/final-cta";
import { LandingFaq } from "../components/landing/landing-faq";
import { LandingHeader } from "../components/landing/landing-header";
import { LandingHero } from "../components/landing/landing-hero";
import { PricingDecision } from "../components/landing/pricing-decision";
import { ProductProof } from "../components/landing/product-proof";
import { ReportTransformationStory } from "../components/landing/report-transformation-story";
import { REPORT_TRANSFORMATION_DEMO } from "../components/landing/report-transformation-demo";
import { JsonLd, siteName, siteUrl } from "../lib/seo";

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  weight: "variable",
  style: ["normal", "italic"],
  display: "swap",
});

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: siteName,
  url: siteUrl,
  description:
    "Logiciel de compte rendu propriétaire et de suivi post-séance pour ostéopathes animaliers.",
  provider: {
    "@type": "Organization",
    name: siteName,
    url: siteUrl,
  },
  areaServed: "FR",
};

export default function Home() {
  return (
    <div
      className={`${newsreader.variable} carnet-theme min-h-dvh overflow-x-clip bg-[color:var(--carnet-canvas)] text-[color:var(--carnet-ink)] selection:bg-[color:var(--carnet-violet-soft)]`}
    >
      <JsonLd data={serviceSchema} />
      <LandingHeader />
      <main id="contenu">
        <LandingHero
          adaptedProposal={REPORT_TRANSFORMATION_DEMO.adaptedProposal}
        />
        <ReportTransformationStory demo={REPORT_TRANSFORMATION_DEMO} />
        <ProductProof />
        <PricingDecision />
        <section
          id="questions"
          data-landing-section="faq-cta"
          className="px-4 py-12 sm:px-6 md:py-20 lg:px-8"
        >
          <div className="mx-auto max-w-[90rem]">
            <LandingFaq />
            <FinalCta />
          </div>
        </section>
      </main>
      <LandingFooter />
    </div>
  );
}
```

- [ ] **Step 5: Make the existing root metadata factual without changing its structure**

In `apps/marketing/lib/metadata.ts`, replace only the root description and Open Graph description with:

```ts
  description:
    "Biume aide les ostéopathes animaliers à structurer leurs observations, préparer des comptes rendus propriétaire clairs et organiser le suivi post-séance.",
```

and:

```ts
    description:
      "Structurez vos observations et préparez un compte rendu propriétaire clair, relu et partagé par vous.",
```

Keep `metadataBase`, title, keywords, canonical, locale, Open Graph URL/type, and Twitter metadata unchanged.

- [ ] **Step 6: Run the homepage, SEO, and shared-page contracts**

Run:

```bash
bun test apps/marketing/__tests__/home-landing.test.tsx
bun test apps/marketing/__tests__/seo.test.tsx
bun test apps/marketing/__tests__/marketing-pages.test.tsx
```

Expected: all three commands exit `0`. The homepage file reports `6 pass`; the other test counts remain unchanged.

- [ ] **Step 7: Prove the old homepage files have no external consumers**

Run:

```bash
rg -n 'from "[^"]*/(hero|features|pricing|faq|cta|journey-story|motion-reveal)"' apps/marketing \
  --glob '!components/hero.tsx' \
  --glob '!components/features.tsx' \
  --glob '!components/pricing.tsx' \
  --glob '!components/faq.tsx' \
  --glob '!components/cta.tsx' \
  --glob '!components/landing/journey-story.tsx' \
  --glob '!components/landing/motion-reveal.tsx'
```

Expected: no output. If any path appears, stop this task and report that exact consumer; do not delete any of the seven files.

- [ ] **Step 8: Delete the seven now-obsolete files with an explicit patch**

Apply this deletion patch:

```diff
*** Begin Patch
*** Delete File: apps/marketing/components/hero.tsx
*** Delete File: apps/marketing/components/features.tsx
*** Delete File: apps/marketing/components/pricing.tsx
*** Delete File: apps/marketing/components/faq.tsx
*** Delete File: apps/marketing/components/cta.tsx
*** Delete File: apps/marketing/components/landing/journey-story.tsx
*** Delete File: apps/marketing/components/landing/motion-reveal.tsx
*** End Patch
```

Do not delete `apps/marketing/components/landing/kinetic-header.tsx`; `apps/marketing/components/header.tsx` still imports it for secondary pages.

- [ ] **Step 9: Run all automated verification for the assembled code**

Run:

```bash
bun test apps/marketing/__tests__
bun --filter @biume/web test
bun --filter @biume/marketing lint
bun run check-types
bun --filter @biume/marketing build
```

Expected: every command exits `0`; Next build reports the homepage and existing marketing routes successfully generated; no missing import references the deleted files.

- [ ] **Step 10: Commit the assembled landing and cleanup**

```bash
git add apps/marketing/app/page.tsx apps/marketing/lib/metadata.ts apps/marketing/__tests__/home-landing.test.tsx apps/marketing/__tests__/seo.test.tsx
git add -u apps/marketing/components/hero.tsx apps/marketing/components/features.tsx apps/marketing/components/pricing.tsx apps/marketing/components/faq.tsx apps/marketing/components/cta.tsx apps/marketing/components/landing/journey-story.tsx apps/marketing/components/landing/motion-reveal.tsx
git commit -m "feat(marketing): assemble carnet vivant landing"
```

---

### Task 10: Verify visual detail, progressive enhancement, and performance

**Files:**
- Verify only: all files changed in Tasks 1–9.
- Temporary output outside the repository: `/tmp/biume-carnet-lighthouse.json`.

**Interfaces:**
- Consumes: the built marketing site at `http://localhost:3000` and browser controls for viewport, JavaScript, reduced motion, keyboard, and Lighthouse.
- Produces: an acceptance decision against the exact visual, length, accessibility, and performance thresholds; no repository file is created by this task.

Use the `playwright` skill for browser verification. A failed check rejects the owning implementation task; do not weaken the threshold or record a pass. Return to that task, make a new RED/GREEN test cycle for the defect, and rerun this entire task.

- [ ] **Step 1: Start the production build and server**

Run:

```bash
bun --filter @biume/marketing build
bun --filter @biume/marketing start
```

Expected: build exits `0`; the second command keeps a production server available on `http://localhost:3000` with no console error.

- [ ] **Step 2: Verify the desktop composition at 1440 × 1000**

Open `http://localhost:3000` at exactly `1440 × 1000`, capture a full-page screenshot, and run this browser expression:

```js
(() => {
  const main = document.querySelector("main");
  const sections = [...document.querySelectorAll("[data-landing-section]")];
  return {
    sectionCount: sections.length,
    viewportRatio: main.getBoundingClientRect().height / window.innerHeight,
    horizontalOverflow:
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
    interSectionGaps: sections.slice(1).map((section, index) => {
      const previous = sections[index].getBoundingClientRect();
      const current = section.getBoundingClientRect();
      return Math.max(0, Math.round(current.top - previous.bottom));
    }),
  };
})()
```

Expected:

```json
{
  "sectionCount": 5,
  "viewportRatio": "<= 6.2",
  "horizontalOverflow": 0,
  "interSectionGaps": "every value <= 160"
}
```

In the screenshot, verify all of the following:

- the first screen explains the audience, result, and practitioner control without scrolling;
- exactly one report surface is attached to the horse photograph;
- that surface does not cover the title, practitioner face, hands, or working area;
- violet is used for action, blue for information/transformation, and green only for final/success states;
- no large decorative gradient, floating comparison cards, or generic dashboard grid appears;
- the transformation is the only sticky narrative sequence;
- the product proof is visible immediately after that sequence, not after an editorial detour.

- [ ] **Step 3: Verify tablet composition at 834 × 1112**

Set the viewport to exactly `834 × 1112`, reload, and inspect the hero, native menu breakpoint, report sequence, editor, outputs, price selector, FAQ, and final CTA.

Expected: no horizontal overflow, no text/image collision, no surface covering another surface, readable line lengths, and all interactive targets at least `44px` high.

- [ ] **Step 4: Verify mobile conversion and length at 390 × 844**

Set the viewport to exactly `390 × 844`, reload, capture a full-page screenshot, and rerun the expression from Step 2.

Expected:

```json
{
  "sectionCount": 5,
  "viewportRatio": "<= 8",
  "horizontalOverflow": 0,
  "interSectionGaps": "every value <= 96"
}
```

Also verify that `Essayer` remains visible in the header before the menu opens, the menu is usable through `<details>/<summary>`, the hero report surface sits below the important part of the photograph, all four report states are in normal vertical flow, and the annual/monthly controls do not overflow.

- [ ] **Step 5: Verify the exact homepage color contract in the browser**

Run:

```js
(() => {
  const style = getComputedStyle(document.querySelector(".carnet-theme"));
  return Object.fromEntries(
    [
      "--carnet-canvas",
      "--carnet-surface",
      "--carnet-ink",
      "--carnet-muted",
      "--carnet-anthracite",
      "--carnet-violet",
      "--carnet-blue",
      "--carnet-green",
    ].map((name) => [name, style.getPropertyValue(name).trim()]),
  );
})()
```

Expected:

```json
{
  "--carnet-canvas": "#f7f7f4",
  "--carnet-surface": "#fdfdfb",
  "--carnet-ink": "#1d1d21",
  "--carnet-muted": "#696970",
  "--carnet-anthracite": "#202024",
  "--carnet-violet": "#6b5ac8",
  "--carnet-blue": "#5d9bb8",
  "--carnet-green": "#2e9866"
}
```

Switch the operating-system color preference to dark and reload. Expected: these values do not change; only the homepage is deliberately fixed-light. Then open one SEO page such as `/logiciel-osteopathe-animalier` and confirm its existing `.landing-theme` dark behavior still works.

- [ ] **Step 6: Verify keyboard and native interaction behavior**

Starting with no focused element, use only `Tab`, `Shift+Tab`, `Enter`, `Space`, and arrow-free native controls.

Expected sequence and behavior:

1. logo and header links receive a visible focus ring;
2. the mobile `Menu` opens and closes with `Enter`/`Space` when tested at mobile width;
3. `Voir un exemple de compte rendu` moves focus context to `#produit` without horizontal movement;
4. annual and monthly buttons expose mutually exclusive `aria-pressed` values and the changed price is announced by the `aria-live="polite"` region;
5. all five FAQ summaries open with the keyboard and retain a visible focus ring;
6. the final signup CTA is the only action inside the final CTA object.

- [ ] **Step 7: Verify reduced motion and no-JavaScript fallbacks**

Emulate `prefers-reduced-motion: reduce`, reload at desktop width, and run:

```js
({
  visibleStates: [...document.querySelectorAll("[data-report-state]")].filter(
    (element) => element.getBoundingClientRect().height > 0,
  ).length,
  zeroOpacityCopy: [...document.querySelectorAll("main *")].filter(
    (element) =>
      (element.textContent ?? "").trim() &&
      getComputedStyle(element).opacity === "0",
  ).length,
})
```

Expected: `visibleStates` is `4` and `zeroOpacityCopy` is `0`; there is no sticky document overlap and no entrance movement.

Then disable JavaScript for `http://localhost:3000` and reload. Expected: hero copy/photo, four report states, product proof, annual price, five FAQ controls, and all signup links remain present and readable. Re-enable JavaScript before continuing.

- [ ] **Step 8: Run Lighthouse against the production server**

In another terminal, run:

```bash
bunx lighthouse http://localhost:3000 --only-categories=performance,accessibility,seo --chrome-flags="--headless --no-sandbox" --output=json --output-path=/tmp/biume-carnet-lighthouse.json
bun -e 'const r = await Bun.file("/tmp/biume-carnet-lighthouse.json").json(); console.log(JSON.stringify({ performance: r.categories.performance.score * 100, accessibility: r.categories.accessibility.score * 100, seo: r.categories.seo.score * 100, lcp: r.audits["largest-contentful-paint"].numericValue, cls: r.audits["cumulative-layout-shift"].numericValue }, null, 2))'
```

Expected:

- Performance `>= 95`;
- Accessibility `= 100`;
- SEO `= 100`;
- LCP `< 2500` milliseconds;
- CLS `< 0.1`.

- [ ] **Step 9: Confirm the repository is clean after verification**

Stop the production server with `Ctrl-C`, then run:

```bash
git status --short
```

Expected: no output. Lighthouse output is under `/tmp` and is not committed.

---

### Task 11: Synchronize the card-free trial behind explicit release gates

**Files:**
- External state only: Autumn sandbox and Autumn production plan configuration.
- Verify only: the existing signup/trial path in `apps/web`.

**Interfaces:**
- Consumes: the tested `apps/web/autumn.config.ts`, Autumn credentials already configured by the project owner, and explicit user authorization for each external write.
- Produces: a sandbox and then production trial that lasts 15 days without collecting a card; only after both verification steps is the landing claim release-safe.

- [ ] **Step 1: Request approval for the sandbox write**

Ask exactly:

> La configuration locale est validée. M’autorisez-vous à synchroniser maintenant l’essai de 15 jours sans carte vers l’environnement Autumn sandbox avec `bunx atmn push` ?

Expected: an explicit yes before any sandbox mutation. If approval is not given, stop with the code complete but the “Sans carte bancaire” release gate still closed.

- [ ] **Step 2: Push and verify the sandbox configuration**

After approval, run from `apps/web`:

```bash
bunx atmn push
```

Expected: Autumn reports both monthly and yearly plan updates successfully. Create a new sandbox account and start its trial. Expected: the trial becomes active for 15 days and the flow does not redirect to Stripe Checkout or request card details.

- [ ] **Step 3: Request separate approval for the production billing write**

Ask exactly:

> Le parcours sandbox est validé sans carte. M’autorisez-vous à appliquer la même configuration aux plans Autumn de production avec `bunx atmn push -p` ?

Expected: a new explicit yes immediately before the production command. Sandbox approval does not count as production approval.

- [ ] **Step 4: Push the production configuration**

After production approval, run from `apps/web`:

```bash
bunx atmn push -p
```

Expected: Autumn reports both production plan updates successfully and no unrelated plan/feature deletion.

- [ ] **Step 5: Verify a brand-new production trial end to end**

Use a new production account that has never held a Biume subscription. Start the 15-day trial from the real signup path.

Expected:

- the account receives an active 15-day trial;
- no Stripe Checkout redirect occurs;
- no card field is requested;
- monthly/yearly trial metadata matches `cardRequired: false`;
- existing customer billing remains unchanged.

Only after this step passes may the homepage containing `Sans carte bancaire` be published. Deployment itself follows the project’s existing release process; this plan does not invent a new deployment command.

---

## Final Verification Matrix

| Contract | Automated evidence | Browser/release evidence |
| --- | --- | --- |
| Safe CTA destination | `web-app-url.test.ts` | Every conversion anchor resolves to the application |
| Real card-free trial | `autumn.config.test.ts` | Sandbox and new production account skip Checkout |
| Five-moment rhythm | `home-landing.test.tsx` | Desktop/mobile height ratios and gap limits |
| Single integrated hero surface | `landing-hero.test.tsx` | No overlap with title, face, hands, or work area |
| Four truthful report states | `landing-content.test.ts`, story test | Desktop sticky; mobile/no-JS/reduced-motion normal flow |
| Supported product proof only | `product-proof.test.tsx` | Editor and two outputs are legible at all widths |
| Accessible price decision | `pricing-decision.test.tsx` | Keyboard toggle and live announcement |
| Five objections and one final action | `landing-close.test.tsx` | Native FAQ keyboard behavior and one closing CTA |
| Secondary pages preserved | marketing/SEO tests | SEO page retains its existing theme behavior |
| Performance and accessibility | build, lint, typecheck | Lighthouse 95/100/100, LCP <2.5s, CLS <0.1 |

## Definition of Done

- All eleven tasks are checked.
- Every code-task commit from Tasks 1–9 exists and `git status --short` is empty.
- All automated commands in Task 9 pass exactly as run.
- All browser thresholds in Task 10 pass at the specified viewports.
- Autumn sandbox and production checks in Task 11 pass after explicit approvals.
- The user reviews the final screenshots before the homepage is published.
