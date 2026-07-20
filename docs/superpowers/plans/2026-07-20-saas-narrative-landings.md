# SaaS narrative landings Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give both experimental Biume landing routes a complete, evidence-backed SaaS conversion journey while preserving their distinct light and night narratives.

**Architecture:** A typed, static content model will keep product facts, use cases, pricing, and FAQ answers consistent across both routes. Server-rendered section components will map that model into a light or night presentation, and small client motion components will supply only the immersive transitions. The two route compositions remain separate so each page can vary pacing, media, and copy without duplicating SaaS facts.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Tailwind CSS v4, Motion, Bun test runner.

---

## File structure

- Create: `apps/marketing/components/prototypes/prototype-saas-content.ts` — typed factual content for trust, method, product benefits, use cases, comparison, pricing, and FAQ.
- Create: `apps/marketing/components/prototypes/prototype-saas-content.test.ts` — locks the required section inventory and existing price/trial facts.
- Create: `apps/marketing/components/prototypes/prototype-saas-sections.tsx` — reusable narrative SaaS sections with `light` and `night` variants.
- Create: `apps/marketing/components/prototypes/prototype-saas-sections.test.tsx` — verifies that every conversion anchor is emitted.
- Create: `apps/marketing/components/prototypes/prototype-motion.test.ts` — prevents prototype motion from adding a reduced-motion branch.
- Modify: `apps/marketing/components/prototypes/prototype-motion.tsx` — retain the immersive motion for every visitor; remove all `prefers-reduced-motion` branches.
- Modify: `apps/marketing/components/prototypes/prototype-landings.tsx` — give both route compositions anchors and the complete section stack.
- Modify: `apps/marketing/app/globals.css` — remove the prototype-specific reduced-motion override while retaining the focus and interaction utilities.

### Task 1: Lock the truthful SaaS content model

**Files:**
- Create: `apps/marketing/components/prototypes/prototype-saas-content.ts`
- Create: `apps/marketing/components/prototypes/prototype-saas-content.test.ts`

- [ ] **Step 1: Write the failing content-contract test**

```ts
import { expect, test } from "bun:test";

import { SAAS_NARRATIVE_CONTENT } from "./prototype-saas-content";

test("contains every required SaaS conversion section", () => {
  expect(Object.keys(SAAS_NARRATIVE_CONTENT)).toEqual([
    "trust",
    "tension",
    "method",
    "benefits",
    "useCases",
    "comparison",
    "pricing",
    "faq",
  ]);
});

test("keeps the published trial and price facts", () => {
  expect(SAAS_NARRATIVE_CONTENT.pricing).toMatchObject({
    annual: "24,99 €",
    monthly: "29,99 €",
    trial: "15 jours",
    cardRequired: false,
  });
});
```

- [ ] **Step 2: Run the test to verify it fails because the content module does not exist**

Run: `bun test apps/marketing/components/prototypes/prototype-saas-content.test.ts`

Expected: FAIL with a module-not-found error for `prototype-saas-content`.

- [ ] **Step 3: Add a typed content model using only verified marketing facts**

```ts
export const SAAS_NARRATIVE_CONTENT = {
  trust: {
    eyebrow: "Conçu pour la continuité après la séance",
    points: ["Notes de séance", "Résumé propriétaire", "Suivi utile"],
  },
  tension: {
    title: "Entre ce que vous observez et ce qui reste, il y a souvent un vide.",
    body: "Les notes sont précises pour vous. Le propriétaire a besoin de repères clairs pour la suite.",
  },
  method: [
    { number: "01", title: "Observer", body: "Vous conservez vos observations de séance." },
    { number: "02", title: "Clarifier", body: "Vous relisez une formulation prête à être partagée." },
    { number: "03", title: "Transmettre", body: "Le propriétaire reçoit un document professionnel." },
    { number: "04", title: "Suivre", body: "Les retours restent liés au dossier de l’animal." },
  ],
  benefits: [
    "Compte rendu propriétaire structuré",
    "Validation par le praticien avant partage",
    "Export PDF professionnel",
    "Relances de suivi après séance",
  ],
  useCases: ["Compte rendu après séance", "Retour propriétaire à J+7", "Préparation du prochain rendez-vous"],
  comparison: {
    before: "Notes dispersées et mémoire du propriétaire",
    after: "Dossier, résumé et suivi reliés à la séance",
  },
  pricing: { annual: "24,99 €", monthly: "29,99 €", trial: "15 jours", cardRequired: false },
  faq: [
    { question: "Biume remplace-t-il un logiciel de gestion ?", answer: "Non. Biume se concentre sur le compte rendu propriétaire et le suivi post-séance." },
    { question: "Chaque texte peut-il être modifié ?", answer: "Oui. Le praticien relit et modifie chaque contenu avant le partage." },
    { question: "Puis-je arrêter l’abonnement ?", answer: "Oui. Le mensuel est résiliable en fin de période." },
  ],
} as const;
```

- [ ] **Step 4: Run the content-contract test**

Run: `bun test apps/marketing/components/prototypes/prototype-saas-content.test.ts`

Expected: PASS with 2 passing tests.

- [ ] **Step 5: Commit the content contract**

```bash
git add apps/marketing/components/prototypes/prototype-saas-content.ts apps/marketing/components/prototypes/prototype-saas-content.test.ts
git commit -m "feat(marketing): add narrative SaaS content contract"
```

### Task 2: Build themed narrative SaaS sections

**Files:**
- Create: `apps/marketing/components/prototypes/prototype-saas-sections.tsx`
- Create: `apps/marketing/components/prototypes/prototype-saas-sections.test.tsx`
- Modify: `apps/marketing/components/prototypes/prototype-landings.tsx`

- [ ] **Step 1: Write the failing render test for the section inventory**

```tsx
import { renderToStaticMarkup } from "react-dom/server";
import { expect, test } from "bun:test";

import { NarrativeSaasSections } from "./prototype-saas-sections";

test("renders every conversion anchor for the light route", () => {
  const html = renderToStaticMarkup(<NarrativeSaasSections tone="light" />);

  for (const anchor of ["#preuve", "#methode", "#produit", "#cas", "#comparatif", "#tarifs", "#faq"]) {
    expect(html).toContain(`id=\"${anchor.slice(1)}\"`);
  }
});
```

- [ ] **Step 2: Run the render test to verify it fails because the component does not exist**

Run: `bun test apps/marketing/components/prototypes/prototype-saas-sections.test.tsx`

Expected: FAIL with a module-not-found error for `prototype-saas-sections`.

- [ ] **Step 3: Implement the section component and test file**

```tsx
import { webAppPath } from "../../lib/web-app-url";
import { MagneticLink, TransitDocuments } from "./prototype-motion";
import { SAAS_NARRATIVE_CONTENT } from "./prototype-saas-content";

export function NarrativeSaasSections({ tone }: { tone: "light" | "night" }) {
  const isNight = tone === "night";
  const theme = isNight ? "bg-[#101d1e] text-[#f5f3eb]" : "bg-[#eef1ed] text-[#16322e]";
  const muted = isNight ? "text-white/70" : "text-[#31514b]";
  const panel = isNight ? "border-white/15 bg-[#172a2b]" : "border-[#16322e]/20 bg-[#f4f6f1]";

  return (
    <div className={theme}>
      <section id="preuve" className="border-y border-current/15 px-4 py-10 md:px-8">
        <p className="mx-auto max-w-[90rem] text-sm font-semibold uppercase tracking-[0.12em]">{SAAS_NARRATIVE_CONTENT.trust.eyebrow}</p>
        <ul className="mx-auto mt-6 grid max-w-[90rem] gap-3 sm:grid-cols-3">
          {SAAS_NARRATIVE_CONTENT.trust.points.map((point) => <li key={point} className={`border p-4 ${panel}`}>{point}</li>)}
        </ul>
      </section>
      <section id="methode" className="px-4 py-20 md:px-8">
        <div className="mx-auto max-w-[90rem]"><h2>{SAAS_NARRATIVE_CONTENT.tension.title}</h2><p className={muted}>{SAAS_NARRATIVE_CONTENT.tension.body}</p></div>
        <ol className="mx-auto mt-12 grid max-w-[90rem] gap-3 md:grid-cols-4">
          {SAAS_NARRATIVE_CONTENT.method.map((step) => <li key={step.number} className={`border p-5 ${panel}`}><span>{step.number}</span><h3>{step.title}</h3><p className={muted}>{step.body}</p></li>)}
        </ol>
      </section>
      <section id="produit" className={`border-y px-4 py-20 md:px-8 ${panel}`}>
        <div className="mx-auto max-w-[90rem]"><h2>Le produit garde le fil de la séance.</h2><ul>{SAAS_NARRATIVE_CONTENT.benefits.map((benefit) => <li key={benefit}>{benefit}</li>)}</ul><TransitDocuments tone={tone} /></div>
      </section>
      <section id="cas" className="px-4 py-20 md:px-8">
        <div className="mx-auto max-w-[90rem]"><h2>Trois moments où le suivi reste présent.</h2><div className="mt-10 grid gap-3 md:grid-cols-3">{SAAS_NARRATIVE_CONTENT.useCases.map((useCase, index) => <article key={useCase} className={`border p-6 ${panel}`}><span>0{index + 1}</span><h3>{useCase}</h3></article>)}</div></div>
      </section>
      <section id="comparatif" className={`border-y px-4 py-20 md:px-8 ${panel}`}><div className="mx-auto grid max-w-[90rem] gap-4 md:grid-cols-2"><article><h2>Sans fil commun</h2><p className={muted}>{SAAS_NARRATIVE_CONTENT.comparison.before}</p></article><article><h2>Avec Biume</h2><p className={muted}>{SAAS_NARRATIVE_CONTENT.comparison.after}</p></article></div></section>
      <section id="tarifs" className="px-4 py-20 md:px-8"><div className="mx-auto max-w-[90rem]"><p>Essai gratuit de {SAAS_NARRATIVE_CONTENT.pricing.trial}, sans carte bancaire.</p><h2>{SAAS_NARRATIVE_CONTENT.pricing.annual} / mois en annuel</h2><p className={muted}>{SAAS_NARRATIVE_CONTENT.pricing.monthly} / mois en mensuel, résiliable en fin de période.</p></div></section>
      <section id="faq" className={`border-y px-4 py-20 md:px-8 ${panel}`}><div className="mx-auto max-w-[90rem]"><h2>Avant de commencer.</h2>{SAAS_NARRATIVE_CONTENT.faq.map((item) => <details key={item.question} className="border-b border-current/20 py-4"><summary>{item.question}</summary><p className={muted}>{item.answer}</p></details>)}<MagneticLink href={webAppPath("/signup")} className="transit-action mt-8 inline-flex min-h-12 items-center px-5 font-semibold" dataConversion="prototype-saas-final-cta">Essayer gratuitement →</MagneticLink></div></section>
    </div>
  );
}
```

The completed component must use semantic headings, native `<details>` for FAQ items, and `MagneticLink` for its final signup CTA. It must not introduce customer quotes, client logos, metrics, or integration claims.

- [ ] **Step 4: Add the themed section stack to each route after its existing hero and transition rail**

```tsx
<NarrativeSaasSections tone="light" />
// and, in AfterDarkLanding:
<NarrativeSaasSections tone="night" />
```

Adjust the route navigation to link to `#methode`, `#produit`, `#tarifs`, and `#faq`; preserve the skip link and the route-specific hero/media sections.

- [ ] **Step 5: Run the component tests**

Run: `bun test apps/marketing/components/prototypes/prototype-saas-content.test.ts apps/marketing/components/prototypes/prototype-saas-sections.test.tsx`

Expected: PASS with the content and anchor tests green.

- [ ] **Step 6: Commit the narrative sections**

```bash
git add apps/marketing/components/prototypes/prototype-saas-sections.tsx apps/marketing/components/prototypes/prototype-saas-sections.test.tsx apps/marketing/components/prototypes/prototype-landings.tsx
git commit -m "feat(marketing): add themed SaaS narrative sections"
```

### Task 3: Keep the motion immersive for every visitor

**Files:**
- Modify: `apps/marketing/components/prototypes/prototype-motion.tsx`
- Modify: `apps/marketing/app/globals.css`

- [ ] **Step 1: Write the failing source-level guard test**

```ts
import { expect, test } from "bun:test";

test("prototype motion does not branch on reduced-motion preferences", async () => {
  const source = await Bun.file("apps/marketing/components/prototypes/prototype-motion.tsx").text();
  expect(source).not.toContain("useReducedMotion");
  expect(source).not.toContain("prefers-reduced-motion");
});
```

Save it as `apps/marketing/components/prototypes/prototype-motion.test.ts`.

- [ ] **Step 2: Run the guard test to verify it fails**

Run: `bun test apps/marketing/components/prototypes/prototype-motion.test.ts`

Expected: FAIL because the current component imports and calls `useReducedMotion`.

- [ ] **Step 3: Remove every reduced-motion branch from prototype motion**

```tsx
import { domAnimation, LazyMotion, m, useMotionValue, useScroll, useSpring, useTransform } from "motion/react";

function move(event: PointerEvent<HTMLAnchorElement>) {
  if (event.pointerType !== "mouse") return;
  const bounds = event.currentTarget.getBoundingClientRect();
  rawX.set(((event.clientX - bounds.left) / bounds.width - 0.5) * 10);
  rawY.set(((event.clientY - bounds.top) / bounds.height - 0.5) * 8);
}

<m.div animate={{ x: ["0%", "-33.333%"] }} transition={{ duration: 21, repeat: Infinity, ease: "linear" }} />
<m.div ref={target} className={className} style={{ y, scale }}>{children}</m.div>
```

Always provide the existing `whileInView` transforms and the 1.2 second path reveal. Remove only the `.transit-*` `@media (prefers-reduced-motion: reduce)` block from `apps/marketing/app/globals.css`; do not alter unrelated site-wide styles.

- [ ] **Step 4: Run the guard test**

Run: `bun test apps/marketing/components/prototypes/prototype-motion.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit the motion decision**

```bash
git add apps/marketing/components/prototypes/prototype-motion.tsx apps/marketing/components/prototypes/prototype-motion.test.ts apps/marketing/app/globals.css
git commit -m "feat(marketing): keep prototype motion fully immersive"
```

### Task 4: Verify the complete conversion journey in the browser

**Files:**
- Modify only if verification exposes a concrete layout, anchor, or contrast issue: `apps/marketing/components/prototypes/prototype-landings.tsx`, `apps/marketing/components/prototypes/prototype-saas-sections.tsx`, or `apps/marketing/app/globals.css`.

- [ ] **Step 1: Run all prototype tests**

Run: `bun test apps/marketing/components/prototypes/prototype-*.test.ts`

Expected: PASS.

- [ ] **Step 2: Lint and build the marketing application**

Run: `bun --filter @biume/marketing lint && bun --filter @biume/marketing build`

Expected: both commands exit with code 0 and the build lists `/laboratoire` and `/after-dark` as static routes.

- [ ] **Step 3: Start the built site and inspect both routes**

Run: `bun x next start --port 3100` from `apps/marketing`.

Inspect at `1280×720` and `390×844`:

```text
http://localhost:3100/laboratoire
http://localhost:3100/after-dark
```

Confirm that every anchor (`#preuve`, `#methode`, `#produit`, `#cas`, `#comparatif`, `#tarifs`, `#faq`) resolves, both CTAs point to the signup URL, pricing displays 24,99 €/mois annual and 29,99 €/mois monthly, and no horizontal overflow appears.

- [ ] **Step 4: Run the final diff check and commit verification fixes if needed**

Run: `git diff --check`

Expected: no output. If visual verification required scoped fixes, commit only those files:

```bash
git add apps/marketing/components/prototypes apps/marketing/app/globals.css
git commit -m "fix(marketing): polish narrative SaaS landing sections"
```
