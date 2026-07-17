# Marketing Hero Headline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the long marketing hero headline with the approved five-word promise, accessible solid-color emphasis, and a restrained blue-to-violet accent rule.

**Architecture:** Keep the change inside the existing server-rendered `LandingHero` component and the soft-machine theme tokens. Extend the existing Bun markup test before implementation so the approved copy, decorative accent, and no-gradient-text constraint are covered without introducing a new component or client-side behavior.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS v4, Bun test, TypeScript

---

## File map

- Modify `apps/marketing/__tests__/landing-hero.test.tsx`: lock the approved headline and decorative accent into the existing hero contract.
- Modify `apps/marketing/app/globals.css`: add the accessible blue text token to the existing soft-machine palette.
- Modify `apps/marketing/components/landing/landing-hero.tsx`: render the shorter two-line headline, solid color emphasis, and decorative gradient rule.

### Task 1: Refine the marketing hero headline

**Files:**
- Modify: `apps/marketing/__tests__/landing-hero.test.tsx:50-74`
- Modify: `apps/marketing/app/globals.css:187-200`
- Modify: `apps/marketing/components/landing/landing-hero.tsx:19-27`

- [ ] **Step 1: Write the failing hero contract test**

Replace the old headline assertion in `apps/marketing/__tests__/landing-hero.test.tsx` and add explicit checks for the decorative rule:

```tsx
expect(text).toContain("Le propriétaire comprend. Vous décidez.");
expect(text).not.toContain(
  "De vos notes au propriétaire, sans perdre votre regard métier.",
);
expect(html).toContain('data-hero-headline-accent="true"');
expect(html).toContain('aria-hidden="true"');
```

In the source-level hero test, add the following constraints after the existing `heroSource` assertions:

```tsx
expect(heroSource).toContain("var(--machine-blue-ink)");
expect(heroSource).toContain("bg-linear-to-r");
expect(heroSource).not.toContain("bg-clip-text");
expect(heroSource).not.toContain("text-transparent");
```

- [ ] **Step 2: Run the focused test and confirm the expected failure**

Run:

```bash
bun test apps/marketing/__tests__/landing-hero.test.tsx
```

Expected: FAIL because the rendered hero still contains the old headline and no `data-hero-headline-accent` element or `--machine-blue-ink` reference.

- [ ] **Step 3: Add the accessible blue text token**

In the `.soft-machine-theme` token group in `apps/marketing/app/globals.css`, add the darker tonal blue next to the existing connection blue:

```css
--machine-blue: #5d9bb8;
--machine-blue-ink: #4f859f;
--machine-blue-soft: #e8f1f5;
```

`#4F859F` reaches 3.77:1 against the `#F7F7F4` hero canvas, above the WCAG AA 3:1 requirement for this large display text.

- [ ] **Step 4: Implement the approved two-line headline and accent rule**

Replace the current heading in `apps/marketing/components/landing/landing-hero.tsx` with:

```tsx
<h1 className="mx-auto max-w-[19ch] text-balance text-[clamp(3rem,7vw,6rem)] font-bold leading-[0.92] tracking-[-0.035em]">
  <span className="block">
    Le propriétaire{" "}
    <span className="text-[color:var(--machine-blue-ink)]">comprend.</span>
  </span>
  <span className="block">
    Vous{" "}
    <span className="text-[color:var(--machine-violet)]">décidez.</span>
  </span>
</h1>
<span
  aria-hidden="true"
  data-hero-headline-accent="true"
  className="mx-auto mt-4 block h-[3px] w-[clamp(5rem,10vw,8rem)] rounded-full bg-linear-to-r from-[color:var(--machine-blue)] to-[color:var(--machine-violet)]"
/>
```

Do not change the supporting paragraph, CTA links, hero image, reassurance row, or `HeroMechanism` motion island.

- [ ] **Step 5: Run the focused test and confirm it passes**

Run:

```bash
bun test apps/marketing/__tests__/landing-hero.test.tsx
```

Expected: all tests in `landing-hero.test.tsx` PASS.

- [ ] **Step 6: Run static verification**

Run:

```bash
bunx tsc --noEmit -p apps/marketing/tsconfig.json
```

Expected: exit code 0 with no TypeScript errors.

Run:

```bash
bun --filter @biume/marketing lint -- components/landing/landing-hero.tsx __tests__/landing-hero.test.tsx
```

Expected: exit code 0 with no ESLint errors.

- [ ] **Step 7: Inspect responsive rendering**

Start the marketing app:

```bash
bun run dev:marketing
```

Inspect `/` at approximately `375x812` and `1440x1000`. Confirm that the first sentence can wrap naturally on mobile, the two intentional sentence lines remain balanced on desktop, no word overflows, the solid blue and violet text remain crisp, and the 3px gradient rule stays subordinate to the headline.

- [ ] **Step 8: Commit the implementation**

```bash
git add apps/marketing/__tests__/landing-hero.test.tsx apps/marketing/app/globals.css apps/marketing/components/landing/landing-hero.tsx
git commit -m "feat(marketing): refine hero headline"
```

### Task 2: Tighten the CTA-to-media spacing

**Files:**
- Modify: `apps/marketing/__tests__/landing-hero.test.tsx:76-105`
- Modify: `apps/marketing/components/landing/landing-hero.tsx:58-72`

- [ ] **Step 1: Write the failing spacing contract test**

In the existing source-level hero test in `apps/marketing/__tests__/landing-hero.test.tsx`, add these assertions next to the other `heroSource` layout constraints:

```tsx
expect(heroSource).toContain("mx-auto mt-8 aspect-[16/10]");
expect(heroSource).not.toContain("mx-auto mt-12 aspect-[16/10]");
```

- [ ] **Step 2: Run the focused test and confirm the expected failure**

Run:

```bash
bun test apps/marketing/__tests__/landing-hero.test.tsx
```

Expected: FAIL because the media container still uses `mt-12`.

- [ ] **Step 3: Move the hero image upward by one spacing step**

In `apps/marketing/components/landing/landing-hero.tsx`, change only the media container's top-margin utility:

```diff
- className="relative mx-auto mt-12 aspect-[16/10] w-full max-w-5xl overflow-hidden rounded-[var(--machine-media-radius)] bg-[color:var(--machine-violet-soft)]"
+ className="relative mx-auto mt-8 aspect-[16/10] w-full max-w-5xl overflow-hidden rounded-[var(--machine-media-radius)] bg-[color:var(--machine-violet-soft)]"
```

Do not alter CTA spacing, media dimensions, image crop, reassurance spacing, section padding, or responsive structure.

- [ ] **Step 4: Run the focused test and confirm it passes**

Run:

```bash
bun test apps/marketing/__tests__/landing-hero.test.tsx
```

Expected: all tests in `landing-hero.test.tsx` PASS.

- [ ] **Step 5: Run scoped static verification**

Run:

```bash
bun --filter @biume/marketing lint -- components/landing/landing-hero.tsx __tests__/landing-hero.test.tsx
```

Expected: exit code 0 with no ESLint errors.

Run:

```bash
git diff --check
```

Expected: exit code 0 with no whitespace errors.

- [ ] **Step 6: Inspect responsive rendering**

Start the marketing app on an available local port and inspect `/` at approximately `390x844` and `1440x1000`. Confirm that the media container begins exactly `32px` below the CTA group, enters the composition earlier on mobile and desktop, does not crowd either CTA, and introduces no horizontal overflow.

- [ ] **Step 7: Commit the spacing refinement**

```bash
git add apps/marketing/__tests__/landing-hero.test.tsx apps/marketing/components/landing/landing-hero.tsx
git commit -m "fix(marketing): tighten hero media spacing"
```
