# After dark only prototype Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the Laboratoire prototype completely and leave `/after-dark` as the only immersive SaaS landing.

**Architecture:** The App Router entrypoint for Laboratoire and its two runtime images are deleted. The shared prototype landing, SaaS-section, and motion components are narrowed to their night-only APIs, removing unused light-theme types and branches while retaining After dark’s existing content, anchors, CTAs, and animations.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Tailwind CSS v4, Motion, Bun test runner.

---

## File structure

- Delete: `apps/marketing/app/laboratoire/page.tsx` — removes the light route so App Router returns its standard 404.
- Delete: `apps/marketing/public/assets/images/prototypes/laboratoire-hero.webp` — no longer referenced runtime image.
- Delete: `apps/marketing/public/assets/images/prototypes/laboratoire-followup.webp` — no longer referenced runtime image.
- Modify: `apps/marketing/components/prototypes/prototype-landings.tsx` — keeps only `AfterDarkLanding` and simplifies its shared helpers.
- Modify: `apps/marketing/components/prototypes/prototype-saas-sections.tsx` — removes the `light | night` API and retains the night presentation.
- Modify: `apps/marketing/components/prototypes/prototype-motion.tsx` — removes the unused light branches from the rail and document sequence.
- Modify: `apps/marketing/components/prototypes/prototype-saas-sections.test.tsx` — locks the single-route and night-only contract.

### Task 1: Remove the light route and narrow the prototype API to After dark

**Files:**
- Delete: `apps/marketing/app/laboratoire/page.tsx`
- Delete: `apps/marketing/public/assets/images/prototypes/laboratoire-hero.webp`
- Delete: `apps/marketing/public/assets/images/prototypes/laboratoire-followup.webp`
- Modify: `apps/marketing/components/prototypes/prototype-landings.tsx`
- Modify: `apps/marketing/components/prototypes/prototype-saas-sections.tsx`
- Modify: `apps/marketing/components/prototypes/prototype-motion.tsx`
- Modify: `apps/marketing/components/prototypes/prototype-saas-sections.test.tsx`

- [ ] **Step 1: Replace the dual-route assertion with a failing After-dark-only contract**

```tsx
import * as landings from "./prototype-landings";

test("exposes only the After dark landing", () => {
  expect(Object.keys(landings)).toEqual(["AfterDarkLanding"]);
});

test("renders every required section anchor in the night presentation", () => {
  const html = renderToStaticMarkup(<NarrativeSaasSections />);

  for (const id of requiredSectionIds) {
    expect(html).toContain(`id=\"${id}\"`);
  }
});
```

Remove the `LaboratoireLanding` import and the existing light render from the test file, but retain the test that verifies the document triptych appears once in `AfterDarkLanding`.

- [ ] **Step 2: Run the test to confirm the new public API contract fails**

Run: `bun test apps/marketing/components/prototypes/prototype-saas-sections.test.tsx`

Expected: FAIL because `prototype-landings.tsx` still exports `LaboratoireLanding`, and because `NarrativeSaasSections` still requires a `tone` prop.

- [ ] **Step 3: Delete only the resolved Laboratoire files**

Run these exact commands after confirming the targets exist:

```bash
rm apps/marketing/app/laboratoire/page.tsx
rm apps/marketing/public/assets/images/prototypes/laboratoire-hero.webp
rm apps/marketing/public/assets/images/prototypes/laboratoire-followup.webp
```

Do not delete `after-dark-hero.webp`, `after-dark-report-detail.webp`, or anything beneath `public/assets/images/prototypes/_sources/`.

- [ ] **Step 4: Keep only the night implementation in shared components**

In `prototype-landings.tsx`, remove `LaboratoireLanding` in its entirety and simplify `Brand` to the night class used by After dark:

```tsx
function Brand() {
  return (
    <Link href="/" aria-label="Retour à l’accueil Biume" className="transit-focus inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[#f5f3eb]">
      <Image src="/brand/biume-logo.svg" alt="" width={28} height={28} className="size-7" priority />
      Biume
    </Link>
  );
}
```

Call the retained helpers without theme props:

```tsx
<Brand />
<TransitRail />
<NarrativeSaasSections />
```

In `prototype-saas-sections.tsx`, replace the theme map and `tone` prop with the current `night` values as one constant:

```tsx
const theme = {
  section: "border-white/15",
  muted: "text-white/70",
  accent: "text-[#ef9b70]",
  surface: "bg-[#172a2b]",
  quietSurface: "bg-[#18282a]",
  contrastSurface: "bg-[#e48c65] text-[#192023]",
  button: "bg-[#ef9b70] text-[#101d1e] hover:bg-[#ffc19e]",
  line: "border-white/15",
  comparison: "bg-[#142526]",
} as const;

```

Change the function signature to `export function NarrativeSaasSections()` and preserve its existing seven-section JSX. Replace the two tone conditionals with their existing night classes: `bg-[#ef9b70]` for benefit dots and `bg-[#101d1e] text-[#f5f3eb] hover:bg-[#263a3b]` for the final CTA.

In `prototype-motion.tsx`, make both APIs night-only:

```tsx
export function TransitRail() {
  const words = ["observer", "rendre lisible", "rester présent"];
  const content = [...words, ...words, ...words];

  return (
    <LazyMotion features={domAnimation} strict>
      <div aria-hidden="true" className="overflow-hidden border-y border-[#ef9b70]/35 py-3 font-mono text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#ef9b70]">
        <m.div className="flex w-max gap-8 whitespace-nowrap" animate={{ x: ["0%", "-33.333%"] }} transition={{ duration: 21, repeat: Infinity, ease: "linear" }}>
          {content.map((word, index) => <span key={`${word}-${index}`}>{word}</span>)}
        </m.div>
      </div>
    </LazyMotion>
  );
}

export function TransitDocuments() {
  const stages = [
    { label: "Ce que vous observez", body: "Tension dorsale plus souple après relâchement. Appui à surveiller sur les départs.", offset: -18 },
    { label: "Ce que Biume organise", body: "Les observations deviennent un résumé fidèle, prêt à être relu par vous.", offset: 0 },
    { label: "Ce que le propriétaire garde", body: "Deux jours plus calmes. Reprendre contact si la démarche change ou inquiète.", offset: 18 },
  ];
}
```

The document classes must retain `bg-[#e48c65] text-[#192023]` for the middle stage and `bg-[#18282a] text-[#f5f3eb]` for the two surrounding stages.

- [ ] **Step 5: Run the focused test suite**

Run: `bun test apps/marketing/components/prototypes/prototype-*.test.ts`

Expected: PASS. The test should verify the sole `AfterDarkLanding` export, all seven anchors, and exactly one document triptych in the remaining route.

- [ ] **Step 6: Commit the clean removal**

```bash
git add -u apps/marketing/app/laboratoire/page.tsx apps/marketing/public/assets/images/prototypes/laboratoire-hero.webp apps/marketing/public/assets/images/prototypes/laboratoire-followup.webp
git add apps/marketing/components/prototypes/prototype-landings.tsx apps/marketing/components/prototypes/prototype-saas-sections.tsx apps/marketing/components/prototypes/prototype-motion.tsx apps/marketing/components/prototypes/prototype-saas-sections.test.tsx
git commit -m "feat(marketing): keep after dark as the only prototype"
```

### Task 2: Verify the remaining route and the deleted route behavior

**Files:**
- Modify only if a verified defect is found: `apps/marketing/components/prototypes/prototype-landings.tsx`, `prototype-saas-sections.tsx`, or `prototype-motion.tsx`.

- [ ] **Step 1: Lint and build the marketing application**

Run: `bun --filter @biume/marketing lint && bun --filter @biume/marketing build`

Expected: both commands exit 0; the Next.js route list contains `/after-dark` and does not contain `/laboratoire`.

- [ ] **Step 2: Inspect the production route and route removal in a browser**

Run `bun x next start --port 3100` from `apps/marketing`, then inspect:

```text
http://localhost:3100/after-dark
http://localhost:3100/laboratoire
```

At `1280×720` and `390×844`, confirm `/after-dark` retains its hero, seven anchor sections, prices, FAQ, signup CTAs, night theme, and no horizontal overflow. Confirm `/laboratoire` returns the standard not-found response rather than redirecting to After dark.

- [ ] **Step 3: Check repository integrity and commit any verified polish fix**

Run: `git diff --check && git status --short`

Expected: no whitespace errors; the deleted Laboratoire route and two WebPs are absent from the tracked tree; `_sources/` remains untouched. If browser verification requires a scoped change, commit only that change:

```bash
git add apps/marketing/components/prototypes
git commit -m "fix(marketing): polish after dark only prototype"
```
