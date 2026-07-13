# Biume Marketing Landing Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the Biume marketing homepage as a human, documentary and conversion-focused landing page for French animal osteopaths.

**Architecture:** Keep the existing Next.js marketing app and its route, SEO helpers and conversion URLs. Static landing sections remain Server Components; the billing selector stays the only client state. Home-specific semantic tokens are scoped under `.landing-theme`, so secondary marketing pages keep their current styles while the homepage gains an automatic light and dark palette.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS v4, `next/image`, `next/font`, Bun tests, native CSS animations.

## Global Constraints

- Use Bun commands only.
- Modify `apps/marketing`; do not modify `apps/web`.
- Preserve every route, canonical URL, JSON-LD helper and CTA destination.
- Keep `webAppPath("/signup")`, `prefetch={false}` and the existing Cal.com URL.
- Keep prices at 29,99 € monthly and 24,99 € monthly with annual billing.
- Use `#6B5AC8` for action and `#198754` for validated, sent or received states.
- Keep the existing Biume logo and its violet, blue and green gradient.
- Use Manrope for display and body copy; reserve Geist Mono for functional values.
- Buttons use full radius, cards 16 pixels, controls 10 pixels and media 20 pixels.
- Use the exact primary CTA label `Essayer gratuitement` everywhere.
- Do not display invented ratings, testimonials, customer logos, performance numbers or product claims.
- Do not use em dash or en dash characters in visible copy.
- Do not add GSAP, Motion, Framer Motion or another animation dependency.
- Do not use gradient headlines, technical grids, scan lines, perpetual animation, parallax or floating card stacks.
- All motion must stop under `prefers-reduced-motion: reduce`.
- The homepage must work in system light mode, system dark mode and without JavaScript.
- Target LCP below 2.5 seconds, INP below 200 milliseconds and CLS below 0.1.
- Preserve unrelated working-tree changes and stage only files named in each task.

## File Structure

**Create:**

- `apps/marketing/public/assets/images/landing/hero-practitioner-horse.png`: documentary hero image.
- `apps/marketing/public/assets/images/landing/practitioner-dog.png`: manual-care feature image.
- `apps/marketing/public/assets/images/landing/practitioner-owner-animal.png`: final CTA image.
- `apps/marketing/__tests__/home-landing.test.tsx`: homepage design, copy and conversion contract.
- `apps/marketing/components/faq.tsx`: static native FAQ section.

**Modify:**

- `apps/marketing/app/layout.tsx`: add Manrope for the homepage while retaining Geist Sans for secondary pages and Geist Mono for functional values.
- `apps/marketing/app/globals.css`: scoped homepage palette and motivated motion.
- `apps/marketing/app/page.tsx`: final homepage assembly and preserved Service JSON-LD.
- `apps/marketing/app/opengraph-image.tsx`: align social headline and palette with the landing.
- `apps/marketing/components/header.tsx`: compact sticky desktop header and native mobile menu.
- `apps/marketing/components/hero.tsx`: asymmetric hero and factual reassurance strip.
- `apps/marketing/components/features.tsx`: problem, journey, product outcome and practitioner-control sections.
- `apps/marketing/components/pricing.tsx`: simple one-offer pricing surface.
- `apps/marketing/components/cta.tsx`: documentary final CTA.
- `apps/marketing/components/footer.tsx`: simplified hierarchy with all current links preserved.
- `apps/marketing/__tests__/marketing-pages.test.tsx`: correct the shared footer copy assertion.
- `apps/marketing/__tests__/opengraph-image.test.ts`: update the approved social headline assertion.

---

### Task 1: Produce the Documentary Image Set

**Files:**

- Create: `apps/marketing/public/assets/images/landing/hero-practitioner-horse.png`
- Create: `apps/marketing/public/assets/images/landing/practitioner-dog.png`
- Create: `apps/marketing/public/assets/images/landing/practitioner-owner-animal.png`

**Interfaces:**

- Consumes: the approved photography direction in `docs/superpowers/specs/2026-07-11-marketing-landing-redesign-design.md`.
- Produces: three local image paths used by `HeroSection`, `FeaturesSection` and `CTASection`.

- [ ] **Step 1: Generate the hero image**

Use the repository image-generation skill with this exact prompt:

```text
Documentary editorial photograph for a premium French vertical SaaS landing page. A female animal osteopath in practical neutral everyday clothing gently works with a relaxed chestnut horse at the open entrance of a real stable. Focus on the practitioner's hands at the horse's shoulder and the quiet trust between human and animal. Natural overcast daylight, cool off-white and muted green environment, subtle violet textile detail only, candid moment, tactile textures, realistic French countryside setting, high-end magazine photography, vertical 4:5 composition with calm negative space on the left. No medical coat, no veterinarian props, no laptop, no smartphone, no text, no logo, no interface, nobody looking at camera, no futuristic lighting, anatomically correct hands and horse.
```

Save the selected result as `apps/marketing/public/assets/images/landing/hero-practitioner-horse.png`.

- [ ] **Step 2: Generate the dog-care image**

Use this exact prompt:

```text
Documentary close-up photograph of an animal osteopath working manually with a calm medium-sized dog on a simple treatment mat in a credible independent practice. Frame the practitioner's hands, the dog's relaxed posture and natural tactile contact. Soft window daylight, cool neutral room, restrained violet fabric accent and natural green plant far in the background, candid and grounded, contemporary French editorial photography, horizontal 3:2 composition. No medical coat, no stethoscope, no laptop, no smartphone, no text, no interface, no animal looking at camera, no glossy pet-food advertising look, anatomically correct hands and dog.
```

Save the selected result as `apps/marketing/public/assets/images/landing/practitioner-dog.png`.

- [ ] **Step 3: Generate the final CTA image**

Use this exact prompt:

```text
Quiet documentary photograph after an animal osteopathy session. An independent female practitioner speaks naturally with a dog owner while the relaxed dog rests between them. Real modest practice environment, warm human connection without posing, natural side light, cool off-white palette, one subtle violet object and a muted green plant, premium but believable French editorial photography, horizontal 4:3 composition with negative space for adjacent copy. No medical coat, no laptop, no smartphone, no text, no interface, nobody looking at camera, no staged handshake, anatomically correct people and dog.
```

Save the selected result as `apps/marketing/public/assets/images/landing/practitioner-owner-animal.png`.

- [ ] **Step 4: Inspect every asset at original resolution**

Open all three files with the image inspection tool. Reject and regenerate any image containing malformed hands, doubled limbs, implausible animal anatomy, generated text, clinical props or direct eye contact with the camera.

- [ ] **Step 5: Verify files and dimensions**

Run:

```bash
test -s apps/marketing/public/assets/images/landing/hero-practitioner-horse.png
test -s apps/marketing/public/assets/images/landing/practitioner-dog.png
test -s apps/marketing/public/assets/images/landing/practitioner-owner-animal.png
sips -g pixelWidth -g pixelHeight apps/marketing/public/assets/images/landing/*.png
```

Expected: all commands exit 0; each image is at least 1024 pixels on its shortest required display axis.

- [ ] **Step 6: Commit the approved assets**

```bash
git add apps/marketing/public/assets/images/landing
git commit -m "feat(marketing): add documentary landing imagery"
```

---

### Task 2: Build the Theme, Header and Hero Contract

**Files:**

- Create: `apps/marketing/__tests__/home-landing.test.tsx`
- Modify: `apps/marketing/app/layout.tsx`
- Modify: `apps/marketing/app/globals.css`
- Modify: `apps/marketing/components/header.tsx`
- Modify: `apps/marketing/components/hero.tsx`

**Interfaces:**

- Consumes: the three image paths from Task 1 and `webAppPath(path: `/${string}`): string`.
- Produces: `Header(): JSX.Element`, `HeroSection(): JSX.Element`, the `.landing-theme` token scope and reusable `.landing-reveal*` motion classes.

- [ ] **Step 1: Write the failing hero contract test**

Create `apps/marketing/__tests__/home-landing.test.tsx`:

```tsx
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "bun:test";

import { HeroSection } from "../components/hero";

describe("Biume home landing", () => {
  test("hero leads with post-session value and factual reassurance", () => {
    const html = renderToStaticMarkup(<HeroSection />);

    expect(html).toContain("Le suivi post-séance des ostéopathes animaliers");
    expect(html).toContain("Chaque séance mérite une suite.");
    expect(html).toContain("Essayer gratuitement");
    expect(html).toContain("Voir le parcours");
    expect(html).toContain("15 jours");
    expect(html).toContain("Sans carte bancaire");
    expect(html).toContain("Validé par vous");
    expect(html).toContain("Exemple de suivi");
    expect(html).toContain("Retour reçu à J+7");
    expect(html).toContain("hero-practitioner-horse.png");
    expect(html).not.toContain("4.9/5");
    expect(html).not.toContain("simplifiés par l");
    expect(html).not.toContain("diagnostics");
  });
});
```

- [ ] **Step 2: Run the hero test and confirm the old page fails**

Run:

```bash
bun test apps/marketing/__tests__/home-landing.test.tsx -t "hero leads"
```

Expected: FAIL because the current hero still contains the IA-led headline and unsupported rating.

- [ ] **Step 3: Switch the font variables**

Replace the font setup in `apps/marketing/app/layout.tsx` with:

```tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono, Manrope } from "next/font/google";
import { rootMetadata } from "../lib/metadata";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = rootMetadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${manrope.variable} ${geistMono.variable} antialiased`}
      suppressHydrationWarning
    >
      <body>{children}</body>
    </html>
  );
}
```

Do not modify `packages/ui/src/styles/globals.css`. The `.landing-theme` override below redirects the inherited `--font-geist-sans` token to Manrope only inside the homepage wrapper.

- [ ] **Step 4: Add scoped tokens and motion utilities**

Replace `apps/marketing/app/globals.css` with:

```css
@import "@biume/ui/globals.css";

.landing-theme {
  --font-geist-sans: var(--font-manrope);
  --background: #f5f5f3;
  --foreground: #18171a;
  --card: #ffffff;
  --card-foreground: #18171a;
  --muted: #ececea;
  --muted-foreground: #666369;
  --border: #dcdadf;
  --primary: #6b5ac8;
  --primary-foreground: #ffffff;
  --secondary: #198754;
  --secondary-foreground: #ffffff;
  color-scheme: light;
}

@media (prefers-color-scheme: dark) {
  .landing-theme {
    --background: #151417;
    --foreground: #f3f2ef;
    --card: #1e1d21;
    --card-foreground: #f3f2ef;
    --muted: #29272d;
    --muted-foreground: #aaa6ae;
    --border: #38353d;
    --primary: #9a8ce9;
    --primary-foreground: #17151f;
    --secondary: #48bb7d;
    --secondary-foreground: #102117;
    color-scheme: dark;
  }
}

@layer utilities {
  .landing-reveal {
    animation: landing-reveal 560ms cubic-bezier(0.16, 1, 0.3, 1) both;
  }

  .landing-reveal-delay-1 {
    animation-delay: 80ms;
  }

  .landing-reveal-delay-2 {
    animation-delay: 160ms;
  }

  .landing-reveal-delay-3 {
    animation-delay: 240ms;
  }

  .landing-media-reveal {
    animation: landing-media-reveal 720ms cubic-bezier(0.16, 1, 0.3, 1) 120ms both;
  }

  .landing-journey-card {
    animation: landing-card-reveal 620ms cubic-bezier(0.16, 1, 0.3, 1) both;
    animation-timeline: view();
    animation-range: entry 5% cover 32%;
  }
}

@keyframes landing-reveal {
  from {
    opacity: 0;
    transform: translate3d(0, 18px, 0);
  }
  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
}

@keyframes landing-media-reveal {
  from {
    opacity: 0;
    clip-path: inset(10% 0 22% 18% round 20px);
    transform: translate3d(0, 18px, 0);
  }
  to {
    opacity: 1;
    clip-path: inset(0 0 0 0 round 20px);
    transform: translate3d(0, 0, 0);
  }
}

@keyframes landing-card-reveal {
  from {
    opacity: 0;
    transform: translate3d(0, 20px, 0);
  }
  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .landing-reveal,
  .landing-media-reveal,
  .landing-journey-card {
    animation: none;
  }

  html:focus-within {
    scroll-behavior: auto;
  }
}
```

- [ ] **Step 5: Replace the header**

Implement `apps/marketing/components/header.tsx` as a Server Component with:

- `sticky top-0`, a single bottom border and no floating pill container;
- the existing six destinations;
- a desktop navigation shown from `md`;
- a native mobile `<details>` menu labeled `Menu`;
- no hand-written SVG icon;
- 44-pixel minimum interactive height;
- the exact CTA `Essayer gratuitement`.

Use this navigation data unchanged:

```tsx
const navLinks = [
  { href: "/logiciel-osteopathe-animalier", label: "Produit" },
  { href: "/compte-rendu-osteopathe-animalier", label: "Compte rendu" },
  { href: "/blog", label: "Blog" },
  { href: "/tarifs", label: "Tarifs" },
] as const;
```

The root classes must be:

```tsx
<header className="sticky inset-x-0 top-0 z-40 border-b border-border/80 bg-background/92 backdrop-blur-xl">
  <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-4 px-4 md:px-6">
```

- [ ] **Step 6: Replace the hero and reassurance strip**

Implement `apps/marketing/components/hero.tsx` with these exact content constants:

```tsx
const reassurance = [
  { value: "15 jours", label: "Essai gratuit" },
  { value: "Sans carte bancaire", label: "Vous testez librement" },
  { value: "Validé par vous", label: "Votre expertise reste centrale" },
] as const;
```

The component must use:

```tsx
<section className="px-4 pb-16 pt-10 md:px-6 md:pb-22 md:pt-14">
  <div className="mx-auto grid min-h-[calc(100dvh-4.5rem)] max-w-7xl items-center gap-10 lg:grid-cols-[0.86fr_1.14fr]">
```

The copy column contains exactly four hero elements: category, heading, subtext and CTA group. Use `next/image` for `/assets/images/landing/hero-practitioner-horse.png` with `priority`, explicit `sizes`, `fill` and an aspect-ratio wrapper using `bg-muted` as the stable image-failure fallback. Add one labeled illustrative output card with `Exemple de suivi`, `Naya va mieux depuis la séance` and `Retour reçu à J+7`.

Place the three reassurance facts in a separate bordered grid below the hero content, not inside the CTA group.

- [ ] **Step 7: Run the focused test**

```bash
bun test apps/marketing/__tests__/home-landing.test.tsx -t "hero leads"
```

Expected: PASS.

- [ ] **Step 8: Commit the homepage foundation**

```bash
git add apps/marketing/app/layout.tsx apps/marketing/app/globals.css apps/marketing/components/header.tsx apps/marketing/components/hero.tsx apps/marketing/__tests__/home-landing.test.tsx
git commit -m "feat(marketing): rebuild landing hero"
```

---

### Task 3: Build the Conversion Narrative Sections

**Files:**

- Modify: `apps/marketing/components/features.tsx`
- Modify: `apps/marketing/__tests__/home-landing.test.tsx`

**Interfaces:**

- Consumes: `/assets/images/landing/practitioner-dog.png` and `.landing-journey-card` from Task 2.
- Produces: `FeaturesSection(): JSX.Element` containing `#probleme`, `#parcours`, `#resultat` and `#controle`.

- [ ] **Step 1: Add the failing narrative test**

Append inside the existing `describe` block:

```tsx
test("story explains the problem, journey, output and practitioner control", () => {
  const html = renderToStaticMarkup(<FeaturesSection />);

  expect(html).toContain("La séance ne s&#x27;arrête pas au rendez-vous.");
  expect(html).toContain("Un fil clair, du rendez-vous au prochain échange.");
  expect(html).toContain("Observer");
  expect(html).toContain("Valider");
  expect(html).toContain("Suivre");
  expect(html).toContain("Revoir");
  expect(html).toContain("Le propriétaire comprend. Vous gardez le fil.");
  expect(html).toContain("Résumé propriétaire");
  expect(html).toContain("Retour à J+7");
  expect(html).toContain("Timeline animal");
  expect(html).toContain("Biume prépare. Vous décidez.");
  expect(html).toContain("practitioner-dog.png");
  expect(html).not.toContain("Actions automatiques");
  expect(html).not.toContain("Patient timeline");
});
```

Add this import at the top:

```tsx
import { FeaturesSection } from "../components/features";
```

- [ ] **Step 2: Verify the narrative test fails**

```bash
bun test apps/marketing/__tests__/home-landing.test.tsx -t "story explains"
```

Expected: FAIL because the old feature console and numbered cards are still rendered.

- [ ] **Step 3: Replace the feature data**

Use these exact constants in `apps/marketing/components/features.tsx`:

```tsx
const journey = [
  {
    title: "Observer",
    body: "Vous notez l’essentiel pendant ou juste après la séance.",
  },
  {
    title: "Valider",
    body: "Biume structure. Vous relisez chaque mot avant l’envoi.",
  },
  {
    title: "Suivre",
    body: "Le propriétaire répond simplement à J+7.",
  },
  {
    title: "Revoir",
    body: "L’évolution reste lisible au fil des rendez-vous.",
  },
] as const;

const outcomes = [
  {
    title: "Résumé propriétaire",
    body: "Une version courte et claire, validée par vous.",
  },
  {
    title: "Retour à J+7",
    body: "Le propriétaire partage ce qu’il observe sans friction.",
  },
  {
    title: "Timeline animal",
    body: "Séances, retours et évolution restent dans le même fil.",
  },
] as const;
```

- [ ] **Step 4: Implement the four distinct section layouts**

Replace `FeaturesSection` so it renders, in order:

1. `#probleme`: two-column copy plus `next/image` for `practitioner-dog.png`, with stacked text on mobile and a reserved `bg-muted` aspect-ratio wrapper.
2. `#parcours`: vertically stacked heading and four journey cards. Use `overflow-x-auto snap-x snap-mandatory` below `md`, `md:grid md:grid-cols-2`, and `lg:grid-cols-4`.
3. `#resultat`: asymmetric output document on the left and three outcome rows on the right. Label the sample `Exemple de résumé` so it cannot be read as customer proof.
4. `#controle`: one violet-tinted horizontal section with the heading and the exact approved control copy.

Use these section classes to keep the layouts distinct:

```tsx
const sectionClass = "px-4 py-16 md:px-6 md:py-24";
const containerClass = "mx-auto max-w-7xl";
```

The practitioner-control copy is exactly:

```text
Vous relisez, corrigez et validez chaque message avant l'envoi. Biume n'établit aucun diagnostic et ne parle jamais à votre place.
```

- [ ] **Step 5: Run the narrative test**

```bash
bun test apps/marketing/__tests__/home-landing.test.tsx -t "story explains"
```

Expected: PASS.

- [ ] **Step 6: Commit the narrative sections**

```bash
git add apps/marketing/components/features.tsx apps/marketing/__tests__/home-landing.test.tsx
git commit -m "feat(marketing): tell the post-session story"
```

---

### Task 4: Build Pricing, FAQ and Final Conversion Sections

**Files:**

- Modify: `apps/marketing/components/pricing.tsx`
- Create: `apps/marketing/components/faq.tsx`
- Modify: `apps/marketing/components/cta.tsx`
- Modify: `apps/marketing/__tests__/home-landing.test.tsx`

**Interfaces:**

- Consumes: `webAppPath("/signup")`, the scoped theme tokens and `/assets/images/landing/practitioner-owner-animal.png`.
- Produces: `PricingSection(): JSX.Element`, `LandingFaq(): JSX.Element`, `CTASection(): JSX.Element`.

- [ ] **Step 1: Add the failing decision-section test**

Add imports:

```tsx
import { CTASection } from "../components/cta";
import { LandingFaq } from "../components/faq";
import { PricingSection } from "../components/pricing";
```

Append this test:

```tsx
test("decision sections present one offer, real objections and the final CTA", () => {
  const pricing = renderToStaticMarkup(<PricingSection />);
  const faq = renderToStaticMarkup(<LandingFaq />);
  const cta = renderToStaticMarkup(<CTASection />);

  expect(pricing).toContain("Un abonnement simple. Une seule offre.");
  expect(pricing).toContain("24,99 €");
  expect(pricing).toContain("29,99 €");
  expect(pricing).toContain("Essayer gratuitement");
  expect(pricing).not.toContain("Plan complet");
  expect(faq.match(/<details/g)?.length).toBe(5);
  expect(faq).toContain("Est-ce que l&#x27;IA écrit à ma place ?");
  expect(faq).toContain("Comment mes données sont-elles protégées ?");
  expect(cta).toContain("Donnez une suite claire à chaque séance.");
  expect(cta).toContain("practitioner-owner-animal.png");
  expect(cta).toContain("Essayer gratuitement");
});
```

- [ ] **Step 2: Verify the decision-section test fails**

```bash
bun test apps/marketing/__tests__/home-landing.test.tsx -t "decision sections"
```

Expected: FAIL because the current pricing card, FAQ copy and final CTA differ.

- [ ] **Step 3: Simplify pricing while preserving local state**

Keep `"use client"` and `type BillingCycle = "annual" | "monthly"`.

Use this exact option data:

```tsx
const billingOptions = {
  annual: {
    label: "Annuel",
    price: "24,99 €",
    suffix: "par mois, facturé annuellement",
    detail: "299,88 € facturés une fois par an",
  },
  monthly: {
    label: "Mensuel",
    price: "29,99 €",
    suffix: "par mois",
    detail: "Facturation mensuelle, résiliable à tout moment",
  },
} satisfies Record<
  BillingCycle,
  { label: string; price: string; suffix: string; detail: string }
>;

const includedGroups = [
  {
    title: "Suivi propriétaire",
    items: ["Résumés validés", "Timeline animal", "Relances J+7 et J+30"],
  },
  {
    title: "Pratique quotidienne",
    items: ["Patients et clients", "Documents illimités", "Support pendant l’essai"],
  },
] as const;
```

Render a single bordered two-column section at `lg`, not a card inside another card. Use native buttons with `aria-pressed`, a visible focus ring and a minimum 44-pixel height. The CTA text is `Essayer gratuitement`.

- [ ] **Step 4: Create the native FAQ**

Create `apps/marketing/components/faq.tsx` with this exact data:

```tsx
const faqItems = [
  {
    question: "Est-ce que Biume remplace mon logiciel de gestion ?",
    answer:
      "Non. Vous pouvez conserver votre agenda, votre facturation et vos habitudes. Biume se concentre sur le résumé propriétaire, le suivi post-séance et l’évolution de l’animal.",
  },
  {
    question: "Est-ce que l'IA écrit à ma place ?",
    answer:
      "Biume prépare une formulation à partir de vos observations. Vous relisez, corrigez et validez toujours le contenu avant son envoi.",
  },
  {
    question: "Puis-je modifier un résumé avant de l'envoyer ?",
    answer:
      "Oui. Chaque résumé reste modifiable afin de conserver votre vocabulaire, votre niveau de détail et vos recommandations.",
  },
  {
    question: "Comment mes données sont-elles protégées ?",
    answer:
      "Biume est hébergé en France et conçu pour respecter le RGPD. Vos données ne sont pas vendues et restent liées à votre activité.",
  },
  {
    question: "Puis-je résilier à tout moment ?",
    answer:
      "Oui pour la formule mensuelle. La formule annuelle reste active jusqu’à la fin de la période déjà facturée.",
  },
] as const;
```

Render five native `<details>` elements with visible focus styles on `<summary>`. Do not add a client component or accordion dependency.

- [ ] **Step 5: Replace the final CTA**

Implement `CTASection` as a two-column section with:

- heading `Donnez une suite claire à chaque séance.`;
- body `Essayez Biume pendant 15 jours, sans carte bancaire.`;
- primary link `Essayer gratuitement` to signup;
- secondary Cal.com link `Voir la démonstration`;
- `next/image` using `practitioner-owner-animal.png` inside a reserved `bg-muted` aspect-ratio wrapper;
- no FAQ, eyebrow, scan line or gradient wash.

- [ ] **Step 6: Run the focused test**

```bash
bun test apps/marketing/__tests__/home-landing.test.tsx -t "decision sections"
```

Expected: PASS.

- [ ] **Step 7: Commit the decision sections**

```bash
git add apps/marketing/components/pricing.tsx apps/marketing/components/faq.tsx apps/marketing/components/cta.tsx apps/marketing/__tests__/home-landing.test.tsx
git commit -m "feat(marketing): complete landing conversion path"
```

---

### Task 5: Assemble the Homepage, Footer and Social Preview

**Files:**

- Modify: `apps/marketing/app/page.tsx`
- Modify: `apps/marketing/app/opengraph-image.tsx`
- Modify: `apps/marketing/components/footer.tsx`
- Modify: `apps/marketing/__tests__/marketing-pages.test.tsx`
- Modify: `apps/marketing/__tests__/opengraph-image.test.ts`

**Interfaces:**

- Consumes: every component produced by Tasks 2 through 4.
- Produces: the final `/` route, shared footer and aligned Open Graph copy.

- [ ] **Step 1: Update the footer contract first**

Change the expectation in `apps/marketing/__tests__/marketing-pages.test.tsx` to:

```tsx
expect(html).toContain("Hébergé en France, conforme au RGPD");
```

Run:

```bash
bun test apps/marketing/__tests__/marketing-pages.test.tsx
```

Expected: FAIL because the current footer string lacks accents and the article.

- [ ] **Step 2: Simplify the footer without dropping links**

Keep the complete `productLinks` and `legalLinks` arrays. Change only layout and visible copy:

- use a plain top border and three responsive columns;
- render `productLinks` as a two-column grouped grid on `sm` and larger instead of one long vertical list;
- keep the Biume logo and the existing one-sentence description;
- use `Hébergé en France, conforme au RGPD` exactly;
- remove the decorative green dot;
- keep external-link security attributes.

Run the marketing page test again. Expected: PASS.

- [ ] **Step 3: Assemble the route**

Replace the JSX returned by `apps/marketing/app/page.tsx` with this component order while preserving the existing `JsonLd` data object:

```tsx
return (
  <div className="landing-theme min-h-dvh overflow-x-hidden bg-background text-foreground selection:bg-primary/25">
    <JsonLd data={serviceSchema} />
    <Header />
    <main>
      <HeroSection />
      <FeaturesSection />
      <PricingSection />
      <LandingFaq />
      <CTASection />
    </main>
    <LandingFooter />
  </div>
);
```

Extract the existing inline JSON-LD object into a local `const serviceSchema` above the component without changing its keys or values.

- [ ] **Step 4: Align the Open Graph headline**

In `apps/marketing/app/opengraph-image.tsx`, set:

```tsx
export const headline = "Chaque séance mérite une suite.";
```

Update the corresponding expectation in `apps/marketing/__tests__/opengraph-image.test.ts`:

```tsx
expect(headline).toBe("Chaque séance mérite une suite.");
```

Keep the existing dimensions, `ImageResponse`, data URI logo and image-render test.

- [ ] **Step 5: Run affected tests**

```bash
bun test apps/marketing/__tests__/marketing-pages.test.tsx apps/marketing/__tests__/opengraph-image.test.ts apps/marketing/__tests__/seo.test.tsx
```

Expected: all tests PASS.

- [ ] **Step 6: Commit the assembled page**

```bash
git add apps/marketing/app/page.tsx apps/marketing/app/opengraph-image.tsx apps/marketing/components/footer.tsx apps/marketing/__tests__/marketing-pages.test.tsx apps/marketing/__tests__/opengraph-image.test.ts
git commit -m "feat(marketing): assemble redesigned homepage"
```

---

### Task 6: Enforce the Anti-Slop Contract and Verify the Render

**Files:**

- Modify: `apps/marketing/__tests__/home-landing.test.tsx`
- Modify only when a check fails: files listed in Tasks 2 through 5.

**Interfaces:**

- Consumes: final `HomePage` and the complete homepage component tree.
- Produces: automated rejection of old IA-led copy, unsupported proof, banned visual hooks, duplicate CTA wording and forbidden dash characters.

- [ ] **Step 1: Add the whole-page contract test**

Add this import:

```tsx
import HomePage from "../app/page";
```

Append this test:

```tsx
test("assembled page preserves the conversion and anti-slop contract", () => {
  const html = renderToStaticMarkup(<HomePage />);
  const primaryCtaCount = html.match(/Essayer gratuitement/g)?.length ?? 0;

  expect(html).toContain("landing-theme");
  expect(html).toContain("Chaque séance mérite une suite.");
  expect(html).toContain("Un abonnement simple. Une seule offre.");
  expect(html).toContain("Les questions avant de commencer.");
  expect(html).toContain("Hébergé en France, conforme au RGPD");
  expect(html).toContain("http://localhost:3001/signup");
  expect(primaryCtaCount).toBeGreaterThanOrEqual(4);
  expect(html).not.toMatch(/[—–]/);
  expect(html).not.toContain("4.9/5");
  expect(html).not.toContain("IA au service");
  expect(html).not.toContain("hero-scan-line");
  expect(html).not.toContain("hero-field-drift");
  expect(html).not.toContain("bg-clip-text");
  expect(html).not.toContain("Commencer gratuitement");
  expect(html).not.toContain("Démarrer l");
});
```

- [ ] **Step 2: Run the full homepage contract**

```bash
bun test apps/marketing/__tests__/home-landing.test.tsx
```

Expected: all homepage tests PASS. If an assertion fails, make the exact copy or class correction named by the failure, then rerun until green.

- [ ] **Step 3: Run the static banned-pattern scan**

```bash
rg -n "4\.9/5|hero-scan-line|hero-field-drift|bg-clip-text|L'IA au service|Commencer gratuitement|Démarrer l'essai|—|–" apps/marketing/app/page.tsx apps/marketing/components/{header,hero,features,pricing,faq,cta,footer}.tsx
```

Expected: no matches.

- [ ] **Step 4: Run automated project verification**

```bash
bun test apps/marketing/__tests__
bun --filter @biume/marketing lint
bun run check-types
bun --filter @biume/marketing build
```

Expected: all commands exit 0. Record any unrelated pre-existing failure separately and do not change unrelated packages to hide it.

- [ ] **Step 5: Start the marketing app**

```bash
bun --filter @biume/marketing dev
```

Expected: Next.js serves the homepage on `http://127.0.0.1:3000/` or reports the already-running local server.

- [ ] **Step 6: Capture the approved viewport matrix**

Use the Playwright CLI skill, snapshot before interaction, and capture:

```text
1440 x 1000, system light
834 x 1112, system light
390 x 844, system light
1440 x 1000, emulated dark
390 x 844, emulated dark
390 x 844, prefers-reduced-motion reduce
```

Save screenshots under `output/playwright/landing-redesign/`. Inspect each image for horizontal overflow, CTA wrapping, cropped hands or animals, invisible focus styles, inconsistent radii, excessive empty space and hero CTA placement.

- [ ] **Step 7: Run Lighthouse on the local homepage**

```bash
bunx --bun lighthouse http://127.0.0.1:3000/ --only-categories=performance,accessibility,seo --chrome-flags="--headless --no-sandbox" --output=json --output-path=output/playwright/landing-redesign/lighthouse.json
```

Expected: accessibility and SEO at least 95, no layout-shift warning attributable to landing images, and no render-blocking animation dependency.

- [ ] **Step 8: Commit the final contract and visual fixes**

```bash
git add apps/marketing/__tests__/home-landing.test.tsx apps/marketing/app apps/marketing/components
git commit -m "test(marketing): enforce landing design contract"
```

Before committing, confirm `git diff --cached --name-only` contains only files from this plan and no files under `apps/web`, `packages/transactional`, `.agents`, `.claude`, `.superpowers` or `output/playwright`.

---

## Final Acceptance Checklist

- [ ] Hero promise is `Chaque séance mérite une suite.` and does not lead with IA.
- [ ] CTA label is `Essayer gratuitement` in header, hero, pricing and final CTA.
- [ ] Unsupported `4.9/5` proof is absent.
- [ ] Three generated documentary images pass anatomy and authenticity review.
- [ ] Violet is used for action and green only for semantic validation.
- [ ] No gradient headline, technical grid, scan line, parallax or perpetual animation remains.
- [ ] Pricing preserves 29,99 € monthly and 24,99 € annual monthly equivalent.
- [ ] FAQ uses five native `details` elements.
- [ ] Light, dark and reduced-motion renderings are complete.
- [ ] Mobile hero CTA appears before the image and does not wrap.
- [ ] Existing SEO schema, routes and CTA destinations remain intact.
- [ ] Bun tests, lint, type-check and build pass or have separately documented unrelated failures.
- [ ] No unrelated working-tree changes are staged.
