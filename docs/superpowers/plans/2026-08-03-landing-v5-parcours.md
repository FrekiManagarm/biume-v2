# Landing v5 « Le parcours » Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `apps/marketing/components/landing-v5`, a new homepage that recreates the "Le parcours" design handoff pixel-for-pixel, and mount it at `/` in place of `<V2Landing />`.

**Architecture:** One `LandingV5MotionRoot` client component (Lenis + GSAP ScrollTrigger, single reveal batch) wraps a tree of mostly-server components; three sections (`masthead.tsx`, `specimen.tsx`, `follow-up.tsx`, `control.tsx`, `pricing.tsx`) are self-contained client islands that own their own local `ScrollTrigger`/`useState`, mirroring how `components/v2/masthead.tsx` and `components/v2/atelier-sequence.ts` already own their own triggers independently of `V2MotionRoot`. All copy lives in one `content.ts`. All new visual tokens live in `landing-v5.css` under a `.landing-v5` scope.

**Tech Stack:** Next.js App Router, React 19, Tailwind v4 (arbitrary values + CSS custom properties, no new abstraction layer), `@gsap/react` + `gsap`/`ScrollTrigger` + `lenis`, `@biume/ui/components/accordion` (base-ui), `next/font/google` (Hanken Grotesk), `bun:test` + `@testing-library/react` (via `__tests__/dom-test-utils.ts`) + `react-dom/server` (`renderToStaticMarkup`).

## Global Constraints

- The promise "en moins de cinq minutes" (or any elapsed-time claim) never appears anywhere in `landing-v5/content.ts` or component copy.
- No social proof anywhere: no testimonial, no user counter, no client logo. The product demo is the only proof, and it stays labelled "Séance fictive, écrite pour la démonstration."
- No `prefers-reduced-motion` guard anywhere in `landing-v5` — explicit, repeated product decision, already precedented in `components/v2/reveal.tsx`.
- Green (`--lv5-green*`) is reserved for confirmed/validated states only — never decorative, never a promise.
- All CTAs to the app use `webAppPath(...)` from `apps/marketing/lib/web-app-url.ts`, never a hardcoded app URL.
- Interactive targets are real semantic elements (`<button>`, not `role="button"` on a `<div>`) with real keyboard support, min `44px`/`min-h-11` hit area.
- Colors, type scale, radii, shadow values are the exact hex/`clamp()`/px values recorded in `docs/superpowers/specs/2026-08-03-landing-v5-parcours-design.md` and its copied handoff (`docs/superpowers/specs/assets/landing-v5-handoff/`) — do not eyeball or round them.
- No new npm dependency: `gsap`, `@gsap/react`, `lenis`, `lucide-react`, `@biume/ui` are already installed in `apps/marketing`.
- Every task's test file goes in `apps/marketing/__tests__/`, run via `bun test __tests__/<file>.test.tsx` from `apps/marketing/`.

---

## Task 1: Theme tokens, keyframes and fonts

**Files:**
- Create: `apps/marketing/components/landing-v5/landing-v5.css`
- Create: `apps/marketing/components/landing-v5/fonts.ts`
- Test: `apps/marketing/__tests__/landing-v5-foundation.test.tsx`

**Interfaces:**
- Produces: CSS custom properties consumed by every later component via `text-[color:var(--lv5-*)]` / `bg-[color:var(--lv5-*)]` Tailwind arbitrary values — `--lv5-violet`, `--lv5-violet-soft`, `--lv5-violet-ink`, `--lv5-blue`, `--lv5-blue-soft`, `--lv5-blue-ink`, `--lv5-green`, `--lv5-green-ink`, `--lv5-green-soft`, `--lv5-canvas`, `--lv5-surface`, `--lv5-surface-muted`, `--lv5-ink`, `--lv5-ink-soft`, `--lv5-ink-mid`, `--lv5-line`, `--lv5-anthracite`, `--lv5-radius-control`, `--lv5-radius-surface`, `--lv5-radius-media`, `--lv5-radius-phone`, `--lv5-shadow-manipulation`, `--lv5-shadow-focus`. Keyframes `biume-cue`, `biume-pulse`, `biume-volet`.
- Produces: `apps/marketing/components/landing-v5/fonts.ts` exports `landingV5Sans` (Hanken Grotesk `next/font/google` instance, `variable: "--font-landing-v5-sans"`) and `landingV5FontVariables` (string, same shape as `components/v2/fonts.ts`'s `v2FontVariables`).

- [ ] **Step 1: Write the failing test**

```tsx
// apps/marketing/__tests__/landing-v5-foundation.test.tsx
import { describe, expect, test } from "bun:test";

describe("landing-v5 foundation", () => {
  test("landing-v5.css defines the exact handoff tokens and keyframes", async () => {
    const css = await Bun.file(
      new URL("../components/landing-v5/landing-v5.css", import.meta.url),
    ).text();

    expect(css).toMatch(/--lv5-violet:\s*#6B5AC8;/i);
    expect(css).toMatch(/--lv5-violet-soft:\s*#EEEBFB;/i);
    expect(css).toMatch(/--lv5-violet-ink:\s*#4E3FA3;/i);
    expect(css).toMatch(/--lv5-blue:\s*#5D9BB8;/i);
    expect(css).toMatch(/--lv5-blue-soft:\s*#E8F1F5;/i);
    expect(css).toMatch(/--lv5-blue-ink:\s*#3d738c;/i);
    expect(css).toMatch(/--lv5-green:\s*#2E9866;/i);
    expect(css).toMatch(/--lv5-green-ink:\s*#21734D;/i);
    expect(css).toMatch(/--lv5-green-soft:\s*#E7F3ED;/i);
    expect(css).toMatch(/--lv5-canvas:\s*#F7F7F4;/i);
    expect(css).toMatch(/--lv5-surface:\s*#FDFDFB;/i);
    expect(css).toMatch(/--lv5-surface-muted:\s*#ECECE7;/i);
    expect(css).toMatch(/--lv5-ink:\s*#1D1D21;/i);
    expect(css).toMatch(/--lv5-ink-soft:\s*#696970;/i);
    expect(css).toMatch(/--lv5-ink-mid:\s*#4a4a52;/i);
    expect(css).toMatch(/--lv5-line:\s*#DEDED7;/i);
    expect(css).toMatch(/--lv5-anthracite:\s*#202024;/i);
    expect(css).toContain("@keyframes biume-cue");
    expect(css).toContain("@keyframes biume-pulse");
    expect(css).toContain("@keyframes biume-volet");
    expect(css).not.toContain("prefers-reduced-motion");
  });

  test("fonts.ts loads Hanken Grotesk through next/font/google", async () => {
    const fonts = await Bun.file(
      new URL("../components/landing-v5/fonts.ts", import.meta.url),
    ).text();

    expect(fonts).toContain(
      'import { Hanken_Grotesk } from "next/font/google"',
    );
    expect(fonts).toContain('variable: "--font-landing-v5-sans"');
    expect(fonts).toContain("landingV5FontVariables");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd apps/marketing && bun test __tests__/landing-v5-foundation.test.tsx`
Expected: FAIL (files don't exist yet)

- [ ] **Step 3: Write `landing-v5.css`**

```css
/* apps/marketing/components/landing-v5/landing-v5.css
   Scope de thème de la landing "Le parcours". Chargé par
   components/landing-v5/index.tsx uniquement. */

.landing-v5 {
  --lv5-violet: #6B5AC8;
  --lv5-violet-soft: #EEEBFB;
  --lv5-violet-ink: #4E3FA3;
  --lv5-blue: #5D9BB8;
  --lv5-blue-soft: #E8F1F5;
  --lv5-blue-ink: #3d738c;
  --lv5-green: #2E9866;
  --lv5-green-ink: #21734D;
  --lv5-green-soft: #E7F3ED;
  --lv5-canvas: #F7F7F4;
  --lv5-surface: #FDFDFB;
  --lv5-surface-muted: #ECECE7;
  --lv5-ink: #1D1D21;
  --lv5-ink-soft: #696970;
  --lv5-ink-mid: #4a4a52;
  --lv5-line: #DEDED7;
  --lv5-anthracite: #202024;

  --lv5-radius-control: 10px;
  --lv5-radius-surface: 16px;
  --lv5-radius-media: 24px;
  --lv5-radius-phone: 26px;

  --lv5-shadow-manipulation: 0 4px 8px rgba(29, 29, 33, .14);
  --lv5-shadow-focus: 0 6px 8px rgba(107, 90, 200, .16);

  background: var(--lv5-canvas);
  color: var(--lv5-ink);
}

/* Indice de défilement du hero. */
@keyframes biume-cue {
  0%, 100% { transform: translateY(0); opacity: .55; }
  50% { transform: translateY(7px); opacity: 1; }
}

/* Pastille du pill hero. */
@keyframes biume-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: .45; transform: scale(.82); }
}

/* Entrée d'un volet de la démonstration, rejouée à chaque changement
   de temps par specimen.tsx (reset + reflow + réapplication). */
@keyframes biume-volet {
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: none; }
}
```

- [ ] **Step 4: Write `fonts.ts`**

```ts
// apps/marketing/components/landing-v5/fonts.ts
import { Hanken_Grotesk } from "next/font/google";

export const landingV5Sans = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-landing-v5-sans",
  display: "swap",
});

export const landingV5FontVariables = [landingV5Sans.variable].join(" ");
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd apps/marketing && bun test __tests__/landing-v5-foundation.test.tsx`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add apps/marketing/components/landing-v5/landing-v5.css apps/marketing/components/landing-v5/fonts.ts apps/marketing/__tests__/landing-v5-foundation.test.tsx
git commit -m "feat(landing-v5): add theme tokens and Hanken Grotesk font"
```

---

## Task 2: `content.ts` — single source of copy

**Files:**
- Create: `apps/marketing/components/landing-v5/content.ts`
- Test: `apps/marketing/__tests__/landing-v5-content.test.ts`

**Interfaces:**
- Produces: `DEMO_URL`, `TRIAL_NOTE`, `HERO_PILL`, `HERO_TITLE`, `HERO_LEAD`, `HERO_CTA_PRIMARY`, `HERO_CTA_SECONDARY`, `HERO_CARD`, `FACTS_TITLE`, `FACTS_LEAD`, `FACTS`, `SPECIMEN_EYEBROW`, `SPECIMEN_TITLE`, `SPECIMEN_LEAD`, `SPECIMEN_SUBJECT`, `SPECIMEN_RAIL`, `SPECIMEN_STEPS`, `SPECIMEN_NOTE`, `PRACTICE_PLATE`, `CONTROL_EYEBROW`, `CONTROL_TITLE`, `CONTROL_LEAD`, `CONTROL_INVITE`, `CONTROL_PASSAGES`, `OWNER_PLATE`, `FOLLOW_UP_EYEBROW`, `FOLLOW_UP_TITLE`, `FOLLOW_UP`, `OWNER_EYEBROW`, `OWNER_TITLE`, `OWNER_LEAD`, `OWNER_POINTS`, `OWNER_MOCK_LINK`, `OWNER_MOCK_FOLLOWUP`, `SURFACES_TITLE`, `SURFACES_LEAD`, `SURFACES_MOBILE`, `SURFACES_WEB`, `AROUND_TITLE`, `AROUND_LEAD`, `AROUND_ITEMS`, `BOUNDARIES_TITLE`, `BOUNDARIES`, `PRICING_TITLE`, `PRICING_LEAD`, `PRICING_PLAN`, `PRICING_DEMO_CARD`, `FAQ_TITLE`, `FAQ`, `CLOSE_TITLE`, `CLOSE_LEAD`, `NAV_LINKS`, `FOOTER_COLUMNS`, `FOOTER_LINE` — every export is `as const`, consumed by later tasks' components and tests.

- [ ] **Step 1: Write the failing test**

```ts
// apps/marketing/__tests__/landing-v5-content.test.ts
import { describe, expect, test } from "bun:test";

import {
  BOUNDARIES,
  CONTROL_PASSAGES,
  DEMO_URL,
  FAQ,
  FACTS,
  FOLLOW_UP,
  HERO_LEAD,
  HERO_TITLE,
  PRICING_PLAN,
  SPECIMEN_NOTE,
  SPECIMEN_STEPS,
  SPECIMEN_SUBJECT,
  TRIAL_NOTE,
} from "../components/landing-v5/content";

describe("landing-v5 content", () => {
  test("locks the hero promise exactly", () => {
    expect(HERO_TITLE).toBe("Vos notes de séance, lisibles par le propriétaire.");
    expect(HERO_LEAD).toContain("Biume le met en forme pour le propriétaire.");
    expect(TRIAL_NOTE).toBe("15 jours d'essai, sans carte bancaire");
    expect(DEMO_URL).toBe("https://cal.com/mathieu-chambaud-biume");
  });

  test("never promises an elapsed time and never invents proof", () => {
    const serialized = JSON.stringify({
      FACTS,
      CONTROL_PASSAGES,
      FOLLOW_UP,
      BOUNDARIES,
      FAQ,
      SPECIMEN_STEPS,
    });

    expect(serialized).not.toMatch(/moins de cinq minutes/i);
    expect(serialized).not.toMatch(/témoignage|avis client|utilisateurs actifs/i);
  });

  test("locks the four specimen steps and the fictional-session note", () => {
    expect(SPECIMEN_SUBJECT).toBe("Nashira · jument selle français · 11 ans");
    expect(SPECIMEN_STEPS).toHaveLength(4);
    expect(SPECIMEN_STEPS.map((step) => step.id)).toEqual([
      "motif",
      "examen",
      "traitement",
      "suites",
    ]);
    expect(SPECIMEN_STEPS[0]!.raw).toContain("raideur post-transport");
    expect(SPECIMEN_NOTE).toContain("Séance fictive");
  });

  test("locks pricing values from a single source", () => {
    expect(PRICING_PLAN.monthly.price).toBe("29,99 €");
    expect(PRICING_PLAN.annual.price).toBe("24,99 €");
    expect(PRICING_PLAN.annual.note).toBe(
      "Facturé annuellement · 299,88 € par an",
    );
    expect(PRICING_PLAN.included).toHaveLength(5);
  });

  test("locks all six FAQ entries", () => {
    expect(FAQ).toHaveLength(6);
    expect(FAQ[0]!.q).toBe("Est-ce que Biume écrit à ma place ?");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd apps/marketing && bun test __tests__/landing-v5-content.test.ts`
Expected: FAIL (module not found)

- [ ] **Step 3: Write `content.ts`**

```ts
// apps/marketing/components/landing-v5/content.ts
/**
 * Source unique du texte de landing-v5. Aucune preuve inventée : pas de
 * témoignage, pas de compteur d'utilisateurs, pas de logo partenaire.
 * La seule démonstration autorisée est le produit lui-même, étiquetée
 * comme telle. La promesse chiffrée "en moins de cinq minutes" n'apparaît
 * nulle part (interdite par PRODUCT.md avant validation terrain).
 */

export const DEMO_URL = "https://cal.com/mathieu-chambaud-biume";
export const TRIAL_NOTE = "15 jours d'essai, sans carte bancaire";

export const NAV_LINKS = [
  { href: "#produit", label: "Le parcours" },
  { href: "#suivi", label: "Le suivi" },
  { href: "#proprietaire", label: "Le propriétaire" },
  { href: "#tarifs", label: "Tarifs" },
  { href: "#questions", label: "Questions" },
] as const;

/* ── Hero ──────────────────────────────────────────────────────── */

export const HERO_PILL = "Pour les ostéopathes et praticiens animaliers";

export const HERO_TITLE = "Vos notes de séance, lisibles par le propriétaire.";

export const HERO_LEAD =
  "Vous écrivez comme vous avez toujours écrit : abrégé, technique, rapide. Biume le met en forme pour le propriétaire. Vous relisez passage par passage, vous corrigez, et rien ne part avant que vous l'ayez décidé.";

export const HERO_CTA_PRIMARY = "Préparer mon premier compte rendu";
export const HERO_CTA_SECONDARY = "Voir le parcours";

export const HERO_CARD = {
  subject: "Nashira · séance du 12 mars",
  status: "Validé par vous",
  rawLabel: "Vos notes",
  raw: "palp : tension chaîne thoraco-lombaire G>D, restriction D14-L1 · suites : repos actif 48 h, revoir J+21",
  divider: "Biume met en forme",
  outLabel: "Compte rendu propriétaire",
  out: [
    "J'ai trouvé une zone de tension le long du dos, plus marquée à gauche, ainsi qu'une articulation du bas du dos qui bougeait moins bien que la normale.",
    "Pendant 48 heures, laissez-la bouger librement au pré, sans travail monté. Je la revois dans trois semaines.",
  ],
} as const;

/* ── Le constat ────────────────────────────────────────────────── */

export const FACTS_TITLE = "La séance finit dans la voiture.";
export const FACTS_LEAD =
  "Ce n'est pas un problème d'organisation. C'est la forme du métier — et c'est là que le temps part.";

export const FACTS = [
  {
    n: "01",
    title: "Le compte rendu se rédige le soir.",
    body: "Entre deux rendez-vous, sur un téléphone, après la dernière séance. Jamais au moment où le geste est encore frais.",
  },
  {
    n: "02",
    title: "Vos notes ne sont pas faites pour être lues.",
    body: "Elles sont faites pour être écrites vite et vous servir à vous. Envoyées telles quelles, le propriétaire ne peut pas les interpréter.",
  },
  {
    n: "03",
    title: "Les reformuler prend le temps d'une séance.",
    body: "Traduire vingt lignes techniques en un document lisible demande vingt à trente minutes. Multipliées par la semaine.",
  },
] as const;

/* ── Le relevé — démonstration ────────────────────────────────── */

export const SPECIMEN_EYEBROW = "Le relevé · démonstration";
export const SPECIMEN_TITLE = "Le même relevé, écrit deux fois.";
export const SPECIMEN_LEAD =
  "À gauche, vos notes. À droite, ce que le propriétaire reçoit. Faites défiler pour traverser les quatre temps du compte rendu.";
export const SPECIMEN_SUBJECT = "Nashira · jument selle français · 11 ans";
export const SPECIMEN_RAIL = ["Motif", "Examen", "Traitement", "Suites"] as const;
export const SPECIMEN_NOTE =
  "Séance fictive, écrite pour la démonstration. Aucun dossier réel n'est utilisé sur cette page.";

export const SPECIMEN_STEPS = [
  {
    id: "motif",
    heading: "Ce que vous notez en arrivant.",
    raw: "mot : raideur post-transport, refus incurvation D, prop. signale gêne dep. 3 sem",
    out: "Vous m'avez appelé parce que Nashira semblait gênée depuis environ trois semaines, en particulier depuis son dernier transport. À l'examen, elle avait effectivement du mal à s'incurver du côté droit.",
    body: "Biume repart de votre formulation, pas d'un formulaire. Les abréviations et l'ordre dans lequel vous écrivez restent les vôtres.",
  },
  {
    id: "examen",
    heading: "Le vocabulaire technique est traduit, pas effacé.",
    raw: "palp : tension chaîne thoraco-lombaire G>D, restriction D14-L1, sacro-iliaque D sensible",
    out: "J'ai trouvé une zone de tension le long du dos, plus marquée à gauche, ainsi qu'une articulation du bas du dos et le bassin droit qui bougeaient moins bien que la normale.",
    body: "La localisation reste exacte : rien n'est arrondi pour simplifier la phrase.",
  },
  {
    id: "traitement",
    heading: "Ce que vous avez fait, dit en clair.",
    raw: "ttt : tech. myotensives chaîne dorsale, mobilisation SI D, relâchement diaphragme",
    out: "J'ai travaillé en douceur sur les muscles du dos, remis en mouvement le bassin droit, puis relâché le diaphragme qui participait à la raideur.",
    body: "Le propriétaire comprend le geste et sa raison. C'est ce qui lui permet d'expliquer la séance à son entourage.",
  },
  {
    id: "suites",
    heading: "Les consignes deviennent des dates.",
    raw: "suites : repos actif 48 h, pas de cercle 5 j, revoir J+21",
    out: "Pendant 48 heures, laissez-la bouger librement au pré, sans travail monté. Évitez le travail en cercle pendant cinq jours. Je la revois dans trois semaines.",
    body: "Les suites sortent du paragraphe et deviennent des repères datés, que le propriétaire retrouve après votre départ.",
  },
] as const;

/* ── Plans photo réutilisables ────────────────────────────────── */

export const PRACTICE_PLATE = {
  eyebrow: "Ce que vos notes racontent",
  quote: "Vingt minutes de gestes tiennent en huit lignes d'abréviations.",
  attribution: "Le propriétaire, lui, n'était pas dans la pièce.",
  src: "/assets/images/landing/atelier-practice.webp",
  alt: "Une ostéopathe animalière, les deux mains posées sur le dos d'un chien.",
  objectPosition: "38% 42%",
  parallaxFactor: 0.2,
} as const;

export const OWNER_PLATE = {
  eyebrow: "Ce que le propriétaire retient",
  quote: "Ce que vous expliquez en partant, il l'aura oublié le soir.",
  attribution: "Le compte rendu prend le relais.",
  src: "/assets/images/landing/atelier-owner.webp",
  alt: "Une ostéopathe animalière assise au sol explique la séance à la propriétaire, le chien allongé entre elles.",
  objectPosition: "50% 34%",
  parallaxFactor: 0.18,
} as const;

/* ── Le contrôle ───────────────────────────────────────────────── */

export const CONTROL_EYEBROW = "Le contrôle";
export const CONTROL_TITLE = "Rien ne part avant que vous l'ayez validé.";
export const CONTROL_LEAD =
  "Chaque passage est relu séparément, et reste modifiable jusqu'à l'envoi. Le bouton d'envoi reste fermé tant qu'un passage attend votre regard.";
export const CONTROL_INVITE = "Essayez : validez les trois passages.";

export const CONTROL_PASSAGES = [
  {
    id: "p1",
    label: "Motif de la séance",
    text: "Vous m'avez appelé parce que Nashira semblait gênée depuis environ trois semaines, en particulier depuis son dernier transport.",
  },
  {
    id: "p2",
    label: "Examen",
    text: "J'ai trouvé une zone de tension le long du dos, plus marquée à gauche, ainsi qu'une articulation du bas du dos et le bassin droit qui bougeaient moins bien que la normale.",
  },
  {
    id: "p3",
    label: "Suites de séance",
    text: "Pendant 48 heures, laissez-la bouger librement au pré, sans travail monté. Évitez le travail en cercle pendant cinq jours.",
  },
] as const;

/* ── Le suivi ──────────────────────────────────────────────────── */

export const FOLLOW_UP_EYEBROW = "Le suivi";
export const FOLLOW_UP_TITLE = "La séance continue sans que vous y pensiez.";

export const FOLLOW_UP = [
  {
    when: "J+0",
    title: "Le compte rendu part",
    body: "Une fois que vous l'avez validé, et pas avant. Le propriétaire le reçoit en PDF, mis en page pour être lu sur un téléphone.",
  },
  {
    when: "J+2",
    title: "Vous demandez des nouvelles",
    body: "Un questionnaire court, préparé à partir des suites que vous avez écrites : comment l'animal a évolué, ce qui a été observé, si le propriétaire souhaite être recontacté.",
  },
  {
    when: "J+21",
    title: "Le contrôle revient dans votre semaine",
    body: "La date notée en fin de séance ressort d'elle-même, avec le compte rendu attaché. Et seules les réponses qui demandent une action vous sont signalées.",
  },
] as const;

/* ── Côté propriétaire ────────────────────────────────────────── */

export const OWNER_EYEBROW = "Côté propriétaire";
export const OWNER_TITLE = "Il n'installe rien, il ne crée pas de compte.";
export const OWNER_LEAD =
  "Le propriétaire ouvre un lien sécurisé depuis son téléphone. Il confirme son identité par un code à usage unique la première fois, puis reste connecté trente jours sur cet appareil.";

export const OWNER_POINTS = [
  "Il lit le compte rendu, mis en page pour un écran de téléphone.",
  "Il répond au questionnaire de suivi en trois questions.",
  "Il demande explicitement à être recontacté, s'il le souhaite.",
] as const;

export const OWNER_MOCK_LINK = {
  label: "Lien sécurisé",
  message: "Le compte rendu de Nashira est disponible.",
  codeLabel: "Code reçu par SMS",
  digits: ["4", "1", "8", ""],
} as const;

export const OWNER_MOCK_FOLLOWUP = {
  label: "Suivi · J+2",
  question: "Comment va Nashira depuis la séance ?",
  answers: ["Mieux qu'avant", "Nettement mieux", "Sans changement"],
  selectedIndex: 1,
  note: "Seules les réponses qui demandent une action vous sont signalées.",
} as const;

/* ── Surfaces mobile + web ────────────────────────────────────── */

export const SURFACES_TITLE = "Le terrain dans la poche, l'atelier au bureau.";
export const SURFACES_LEAD =
  "Le même rapport, le même dossier. Deux endroits pour le travailler, selon le moment de votre journée.";

export const SURFACES_MOBILE = {
  chip: "Mobile",
  precision: "Sur place, entre deux rendez-vous",
  cards: [
    { label: "10:30 · Nashira", value: "Séance terminée", tone: "neutral" },
    {
      label: "Brouillon prêt",
      value: "4 sections préremplies, 1 à vérifier",
      tone: "violet",
    },
    { label: "Envoyé · 14:02", value: "", tone: "green" },
  ],
  points: [
    "Les rendez-vous du jour, la séance à clôturer",
    "Créer un propriétaire et un animal en deux champs",
    "Valider et partager les cas simples",
  ],
} as const;

export const SURFACES_WEB = {
  chip: "Web",
  precision: "Au calme, pour les cas complexes",
  windowTitle: "Compte rendu · Nashira",
  points: [
    "L'anatomie détaillée et les corrections fines",
    "La mise en page du document et sa prévisualisation",
    "L'historique complet du dossier, l'administration",
  ],
} as const;

/* ── Autour du compte rendu ───────────────────────────────────── */

export const AROUND_TITLE = "Autour du compte rendu, ce qui est déjà là.";
export const AROUND_LEAD = "Tout ce qui sert le compte rendu et le suivi. Rien de plus.";

export const AROUND_ITEMS = [
  {
    title: "Agenda et rendez-vous",
    body: "Les séances du jour, à déplacer ou à clôturer.",
  },
  {
    title: "Dossiers propriétaires et animaux",
    body: "Créés en deux champs, complétés au fil des séances.",
  },
  {
    title: "Historique de l'animal",
    body: "Les comptes rendus précédents, disponibles pendant la séance.",
  },
  {
    title: "PDF et envoi par e-mail",
    body: "Le document part à votre nom, avec votre mise en page.",
  },
] as const;

/* ── Ce que Biume ne fait pas ──────────────────────────────────── */

export const BOUNDARIES_TITLE = "Ce que Biume ne fait pas.";

export const BOUNDARIES = [
  "Biume ne pose aucun diagnostic et ne propose aucun protocole de traitement.",
  "Biume n'écrit aucune observation qui ne soit pas déjà dans vos notes.",
  "Aucun document ne part sans que vous ayez cliqué sur envoyer.",
  "Biume ne remplace ni votre logiciel de gestion, ni votre facturation.",
  "Vos dossiers vous appartiennent : export complet, à tout moment, sans conditions.",
] as const;

/* ── Tarifs ────────────────────────────────────────────────────── */

export const PRICING_TITLE = "Une formule, deux rythmes.";
export const PRICING_LEAD =
  "Facturé par praticien. Pas par compte rendu, pas par message envoyé.";

export const PRICING_PLAN = {
  monthly: { price: "29,99 €", note: "Sans engagement · résiliable à tout moment" },
  annual: { price: "24,99 €", note: "Facturé annuellement · 299,88 € par an" },
  included: [
    "Compte rendu propriétaire à partir de vos notes",
    "Relecture et validation passage par passage",
    "Export PDF, mis en page pour la lecture mobile",
    "Questionnaire de suivi et rappels de contrôle",
    "Dossiers illimités, export complet à tout moment",
  ],
  cta: "Commencer les 15 jours d'essai",
  ctaNote: "Sans carte bancaire. Rien à résilier si vous ne faites rien.",
} as const;

export const PRICING_DEMO_CARD = {
  title: "Vous préférez qu'on le fasse ensemble ?",
  body: "Trente minutes, votre dernière séance comme exemple, et vous repartez avec un compte rendu prêt à envoyer.",
  cta: "Réserver une démonstration",
} as const;

/* ── Questions ─────────────────────────────────────────────────── */

export const FAQ_TITLE = "Questions.";

export const FAQ = [
  {
    q: "Est-ce que Biume écrit à ma place ?",
    a: "Non. Biume reformule ce que vous avez écrit pour le rendre lisible par le propriétaire. Il n'ajoute aucune observation, aucun constat et aucune recommandation qui ne soit pas dans vos notes. Vous relisez chaque passage avant que le document existe.",
  },
  {
    q: "Que se passe-t-il si la reformulation est inexacte ?",
    a: "Vous la corrigez sur place, passage par passage. Le texte reste éditable jusqu'à l'envoi, et le compte rendu ne quitte jamais votre écran tant que vous ne l'avez pas validé.",
  },
  {
    q: "Faut-il changer ma façon de prendre des notes ?",
    a: "Non, et c'est le point de départ du produit. Abréviations, sigles, syntaxe télégraphique, ordre libre : Biume est fait pour partir de ça. Si vos notes vous suffisent aujourd'hui, elles suffiront à Biume.",
  },
  {
    q: "Biume remplace-t-il mon logiciel de gestion ?",
    a: "Non. Biume s'occupe du compte rendu propriétaire et de ce qui vient après la séance. Votre agenda, votre facturation et votre comptabilité restent où ils sont.",
  },
  {
    q: "Où sont hébergées les données ?",
    a: "En Europe. Vous pouvez exporter l'intégralité de vos dossiers à tout moment depuis les paramètres, et la suppression du compte supprime les données associées.",
  },
  {
    q: "Comment se passe l'essai ?",
    a: "Quinze jours, sans carte bancaire, avec toutes les fonctionnalités. À la fin, vous choisissez de continuer ou non — il n'y a rien à résilier si vous ne faites rien.",
  },
] as const;

/* ── Clôture ───────────────────────────────────────────────────── */

export const CLOSE_TITLE = "Votre prochaine séance peut être la première.";
export const CLOSE_LEAD =
  "Prenez vos notes comme d'habitude. Regardez ce que Biume en fait. Décidez ensuite.";

/* ── Footer ────────────────────────────────────────────────────── */

export const FOOTER_COLUMNS = [
  {
    title: "La page",
    links: [
      { href: "#produit", label: "Le parcours" },
      { href: "#proprietaire", label: "Le propriétaire" },
      { href: "#tarifs", label: "Tarifs" },
      { href: "#questions", label: "Questions" },
    ],
  },
  {
    title: "Le métier",
    links: [
      { href: "/logiciel-osteopathe-animalier", label: "Logiciel ostéopathe animalier" },
      {
        href: "/modele-compte-rendu-osteopathe-animalier",
        label: "Modèle de compte rendu",
      },
      {
        href: "/exemple-compte-rendu-osteopathie-animale",
        label: "Exemple de compte rendu",
      },
      { href: "/suivi-post-seance-animal", label: "Suivi post-séance" },
      { href: "/relance-client-osteopathe-animalier", label: "Relance client" },
    ],
  },
  {
    title: "Comparer",
    links: [
      { href: "/comparatifs", label: "Tous les comparatifs" },
      { href: "/comparatifs/neovoice-vs-biume", label: "Neovoice vs Biume" },
      { href: "/alternatives/kiwiappli", label: "Alternative à Kiwiappli" },
      { href: "/alternatives/animalib", label: "Alternative à Animalib" },
      { href: "/blog", label: "Blog" },
    ],
  },
  {
    title: "Biume",
    links: [
      { href: "/about", label: "À propos" },
      { href: "/tarifs", label: "Tarifs" },
      { href: "/cgu", label: "CGU" },
      { href: "/privacy", label: "Confidentialité" },
    ],
  },
] as const;

export const FOOTER_LINE =
  "Compte rendu et suivi post-séance pour ostéopathes et praticiens animaliers. Données hébergées en Europe.";
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd apps/marketing && bun test __tests__/landing-v5-content.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add apps/marketing/components/landing-v5/content.ts apps/marketing/__tests__/landing-v5-content.test.ts
git commit -m "feat(landing-v5): add single-source content module"
```

---

## Task 3: `motion.tsx` — motion root, `Reveal`, `Parallax`

**Files:**
- Create: `apps/marketing/components/landing-v5/motion.tsx`
- Test: `apps/marketing/__tests__/landing-v5-motion.test.tsx`

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces: `LandingV5MotionRoot({ children }: { children: ReactNode })` — mounts once in `index.tsx` (Task 19), wraps the whole page. `Reveal({ children, className, delay }: { children: ReactNode; className?: string; delay?: number })` — renders `<div data-reveal="" data-delay={delay}>`, delay in ms, default `0`. `Parallax({ factor, className, children }: { factor: number; className?: string; children: ReactNode })` — self-contained scrubbed parallax wrapper, one `ScrollTrigger` per instance (mirrors `components/v2/reveal.tsx`'s `Drift`), consumed by `hero.tsx` (Task 5) and `photo-plate.tsx` (Task 7). `ensureGsapPlugins()` and `EASE` re-exported for later tasks' own `ScrollTrigger` usage (`specimen.tsx`, `follow-up.tsx`, `masthead.tsx`).

- [ ] **Step 1: Write the failing test**

```tsx
// apps/marketing/__tests__/landing-v5-motion.test.tsx
import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import { Reveal } from "../components/landing-v5/motion";

describe("landing-v5 motion", () => {
  test("Reveal renders a data-reveal node with the given delay", () => {
    const html = renderToStaticMarkup(
      <Reveal delay={180} className="test-class">
        <p>hello</p>
      </Reveal>,
    );

    expect(html).toContain('data-reveal=""');
    expect(html).toContain('data-delay="180"');
    expect(html).toContain("test-class");
  });

  test("Reveal defaults delay to 0", () => {
    const html = renderToStaticMarkup(
      <Reveal>
        <p>hello</p>
      </Reveal>,
    );

    expect(html).toContain('data-delay="0"');
  });

  test("keeps a single motion engine, no reduced-motion guard, no raw scroll listener", async () => {
    const source = await Bun.file(
      new URL("../components/landing-v5/motion.tsx", import.meta.url),
    ).text();

    expect(source).toContain('"use client"');
    expect(source).not.toMatch(/from\s+["']motion\/react["']/);
    expect(source).not.toContain("prefers-reduced-motion");
    expect(source).not.toMatch(/window\.addEventListener\(\s*["']scroll/);
    expect(source).toContain('lenis.on("scroll", ScrollTrigger.update)');
    expect(source).toContain("gsap.ticker.add");
    expect(source).toContain("lagSmoothing(0)");
    expect(source).toContain("ScrollTrigger.batch");
    expect(source).toContain("export function LandingV5MotionRoot");
    expect(source).toContain("export function Parallax");
    expect(source).toContain("export function ensureGsapPlugins");
    expect(source).toContain("export const EASE");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd apps/marketing && bun test __tests__/landing-v5-motion.test.tsx`
Expected: FAIL (module not found)

- [ ] **Step 3: Write `motion.tsx`**

```tsx
// apps/marketing/components/landing-v5/motion.tsx
"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { useEffect, useRef, type ReactNode } from "react";

/**
 * Moteur de mouvement de landing-v5, sur le même principe que
 * components/v2/reveal.tsx : un seul moteur (GSAP + ScrollTrigger +
 * Lenis), pas de garde `prefers-reduced-motion` — décision produit
 * explicite du handoff, déjà précédentée sur /. Les sections qui ont
 * besoin de leur propre défilement scrubbé (masthead, specimen,
 * follow-up) ouvrent leur propre ScrollTrigger, comme
 * components/v2/masthead.tsx le fait déjà à côté de V2MotionRoot :
 * ScrollTrigger ne pose qu'un seul écouteur global quel que soit le
 * nombre de `ScrollTrigger.create` dans l'arbre.
 */

let pluginsReady = false;

export function ensureGsapPlugins() {
  if (pluginsReady) return;
  gsap.registerPlugin(useGSAP, ScrollTrigger);
  pluginsReady = true;
}

export const EASE = "expo.out";

/** Hauteur du masthead, retranchée quand une ancre est visée. */
const ANCHOR_OFFSET = -72;

export function LandingV5MotionRoot({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    ensureGsapPlugins();

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.6,
    });

    lenis.on("scroll", ScrollTrigger.update);

    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    const onAnchorClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      const anchor = (event.target as HTMLElement | null)?.closest?.(
        'a[href^="#"]',
      ) as HTMLAnchorElement | null;
      if (!anchor) return;

      const id = anchor.getAttribute("href")?.slice(1);
      const target = id ? document.getElementById(id) : null;
      if (!target) return;

      event.preventDefault();
      lenis.scrollTo(target, { offset: ANCHOR_OFFSET, duration: 1.3 });
      if (target.hasAttribute("tabindex")) {
        target.focus({ preventScroll: true });
      }
    };

    document.addEventListener("click", onAnchorClick);

    return () => {
      document.removeEventListener("click", onAnchorClick);
      gsap.ticker.remove(tick);
      gsap.ticker.lagSmoothing(1000, 33);
      lenis.destroy();
    };
  }, []);

  useGSAP(
    () => {
      ensureGsapPlugins();

      const selector = "[data-reveal]";
      gsap.set(selector, { autoAlpha: 0, y: 20 });

      ScrollTrigger.batch(selector, {
        start: "top 90%",
        once: true,
        onEnter: (batch) => {
          batch.forEach((el) => {
            const delay = Number(el.getAttribute("data-delay") ?? 0) / 1000;
            gsap.to(el, {
              autoAlpha: 1,
              y: 0,
              duration: 0.85,
              ease: EASE,
              delay,
              overwrite: "auto",
            });
          });
        },
      });
    },
    { scope: root },
  );

  return <div ref={root}>{children}</div>;
}

/** Apparition simple, jouée par la volée posée à la racine. */
export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <div data-reveal="" data-delay={delay} className={className}>
      {children}
    </div>
  );
}

/**
 * Parallaxe scrubbée, un `ScrollTrigger` par instance — même principe
 * que `Drift` dans components/v2/reveal.tsx, mais avec le calcul exact
 * du prototype (translation proportionnelle à la distance du centre de
 * l'hôte au centre du viewport) plutôt qu'une interpolation start/end.
 */
export function Parallax({
  factor,
  className,
  children,
}: {
  factor: number;
  className?: string;
  children: ReactNode;
}) {
  const host = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      ensureGsapPlugins();
      const hostNode = host.current;
      const node = hostNode?.firstElementChild as HTMLElement | null;
      if (!hostNode || !node) return;

      const trigger = ScrollTrigger.create({
        trigger: hostNode,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
        onUpdate: () => {
          const rect = hostNode.getBoundingClientRect();
          const vh = window.innerHeight;
          const centre = rect.top + rect.height / 2 - vh / 2;
          gsap.set(node, { y: -centre * factor });
        },
      });

      return () => trigger.kill();
    },
    { scope: host, dependencies: [factor] },
  );

  return (
    <div ref={host} className={className}>
      <div className="h-full">{children}</div>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd apps/marketing && bun test __tests__/landing-v5-motion.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add apps/marketing/components/landing-v5/motion.tsx apps/marketing/__tests__/landing-v5-motion.test.tsx
git commit -m "feat(landing-v5): add motion root, Reveal and Parallax"
```

---

## Task 4: `masthead.tsx`

**Files:**
- Create: `apps/marketing/components/landing-v5/masthead.tsx`
- Test: `apps/marketing/__tests__/landing-v5-masthead.test.tsx`

**Interfaces:**
- Consumes: `NAV_LINKS` from `content.ts` (Task 2), `ensureGsapPlugins` from `motion.tsx` (Task 3), `webAppPath` from `lib/web-app-url.ts`.
- Produces: `LandingV5Masthead()` default export used by `index.tsx` (Task 19). Whole file is `"use client"` — pragmatic simplification vs. the handoff's server/client split, needed because the scrolled-state `ScrollTrigger` and the native-`<details>` mobile menu live in the same file; documented here rather than left implicit.

- [ ] **Step 1: Write the failing test**

```tsx
// apps/marketing/__tests__/landing-v5-masthead.test.tsx
import { afterEach, describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import { LandingV5Masthead } from "../components/landing-v5/masthead";
import { webAppPath } from "../lib/web-app-url";
import { cleanup, fireEvent, render } from "./dom-test-utils";
import { textOnly } from "./landing-test-utils";

afterEach(cleanup);

describe("landing-v5 masthead", () => {
  test("renders the skip link, brand, five nav links and the CTA", () => {
    const html = renderToStaticMarkup(<LandingV5Masthead />);
    const text = textOnly(html);

    expect(html).toContain('href="#contenu"');
    expect(text).toContain("Aller au contenu");
    expect(text).toContain("Biume");
    for (const [href, label] of [
      ["#produit", "Le parcours"],
      ["#suivi", "Le suivi"],
      ["#proprietaire", "Le propriétaire"],
      ["#tarifs", "Tarifs"],
      ["#questions", "Questions"],
    ]) {
      expect(html).toContain(`href="${href}"`);
      expect(text).toContain(label as string);
    }
    expect(html).toContain(`href="${webAppPath("/signup")}"`);
    expect(html).toContain('data-conversion="masthead-signup"');
    expect(html).toContain('data-masthead=""');
    expect(html).toContain('data-scrolled="false"');
  });

  test("keeps every interactive target at least 44px tall", () => {
    const html = renderToStaticMarkup(<LandingV5Masthead />);
    const interactiveClasses = Array.from(
      html.matchAll(/<(?:a|summary|button)\b[^>]*class="([^"]*)"/g),
      (match) => match[1],
    );

    expect(interactiveClasses.length).toBeGreaterThan(0);
    for (const className of interactiveClasses) {
      expect(className).toMatch(/\bmin-h-11\b/);
    }
  });

  test("owns its own scroll trigger, not a raw window listener", async () => {
    const source = await Bun.file(
      new URL("../components/landing-v5/masthead.tsx", import.meta.url),
    ).text();

    expect(source.trimStart()).toMatch(/^"use client";/);
    expect(source).toContain("ScrollTrigger.create");
    expect(source).not.toMatch(/window\.addEventListener\(\s*["']scroll/);
  });

  test("closes the mobile panel when a link is activated", () => {
    const { container } = render(<LandingV5Masthead />);
    const details = container.querySelector("details");
    expect(details).not.toBeNull();
    if (!details) return;

    details.open = true;
    const link = details.querySelector("nav a");
    expect(link).not.toBeNull();
    if (!link) return;

    fireEvent.click(link);
    expect(details.open).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd apps/marketing && bun test __tests__/landing-v5-masthead.test.tsx`
Expected: FAIL (module not found)

- [ ] **Step 3: Write `masthead.tsx`**

```tsx
// apps/marketing/components/landing-v5/masthead.tsx
"use client";

import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import Link from "next/link";
import { useRef, type MouseEvent } from "react";

import { NAV_LINKS } from "./content";
import { webAppPath } from "../../lib/web-app-url";
import { ensureGsapPlugins } from "./motion";

const navLinkClassName =
  "min-h-11 inline-flex items-center text-[0.88rem] text-[color:var(--lv5-ink-soft)] transition-colors hover:text-[color:var(--lv5-ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--lv5-violet)]";

function closeOnLinkActivation(event: MouseEvent<HTMLDetailsElement>) {
  const target = event.target;
  if (target instanceof Element && target.closest("a")) {
    event.currentTarget.removeAttribute("open");
  }
}

export function LandingV5Masthead() {
  const host = useRef<HTMLElement | null>(null);

  useGSAP(() => {
    ensureGsapPlugins();
    const node = host.current;
    if (!node) return;

    node.dataset.scrolled = window.scrollY > 16 ? "true" : "false";

    const trigger = ScrollTrigger.create({
      start: 16,
      onUpdate: (self) => {
        node.dataset.scrolled = self.scroll() > 16 ? "true" : "false";
      },
      onRefresh: (self) => {
        node.dataset.scrolled = self.scroll() > 16 ? "true" : "false";
      },
    });

    return () => trigger.kill();
  });

  return (
    <header
      ref={host}
      data-masthead=""
      data-scrolled="false"
      className="fixed inset-x-0 top-0 z-[60] h-[72px] border-b border-transparent transition-[background-color,border-color,backdrop-filter] duration-[350ms] data-[scrolled=true]:border-[color:var(--lv5-line)] data-[scrolled=true]:bg-[color:var(--lv5-canvas)]/94 data-[scrolled=true]:backdrop-blur-[10px]"
    >
      <a
        href="#contenu"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:min-h-11 focus:rounded-full focus:bg-[color:var(--lv5-violet)] focus:px-4 focus:py-2 focus:text-sm focus:text-white"
      >
        Aller au contenu
      </a>
      <div className="mx-auto flex h-full max-w-[1200px] items-center justify-between gap-5 px-[clamp(18px,4vw,34px)]">
        <Link
          href="/"
          className="min-h-11 flex items-center gap-2 text-[1.28rem] font-semibold tracking-[-0.02em] text-[color:var(--lv5-ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--lv5-violet)]"
        >
          <Image
            src="/brand/biume-logo.svg"
            alt=""
            width={30}
            height={30}
            className="size-[30px] rounded-[8px]"
          />
          Biume<span className="text-[color:var(--lv5-violet)]">.</span>
        </Link>

        <nav
          aria-label="Navigation principale"
          className="hidden min-[900px]:flex min-[900px]:items-center min-[900px]:gap-[clamp(14px,2.4vw,30px)]"
        >
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className={navLinkClassName}>
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2.5">
          <Link
            href={webAppPath("/signup")}
            prefetch={false}
            data-conversion="masthead-signup"
            className="min-h-11 hidden min-[520px]:inline-flex items-center rounded-full bg-[color:var(--lv5-violet)] px-5 text-[0.88rem] font-semibold whitespace-nowrap text-white"
          >
            Essayer gratuitement
          </Link>

          <details
            className="relative min-[900px]:hidden"
            onClick={closeOnLinkActivation}
          >
            <summary
              aria-label="Ouvrir le menu"
              className="min-h-11 flex w-11 cursor-pointer list-none items-center justify-center rounded-[10px] border border-[color:var(--lv5-line)] bg-[color:var(--lv5-surface)]/90 marker:hidden [&::-webkit-details-marker]:hidden"
            >
              <span aria-hidden="true" className="flex flex-col gap-1">
                <span className="block h-[1.5px] w-[17px] rounded-full bg-[color:var(--lv5-ink)]" />
                <span className="block h-[1.5px] w-[17px] rounded-full bg-[color:var(--lv5-ink)]" />
              </span>
            </summary>
            <div className="absolute right-0 top-[calc(100%+1px)] w-screen max-w-[calc(100vw-2*clamp(18px,4vw,34px))] border-t border-[color:var(--lv5-line)] bg-[color:var(--lv5-canvas)]">
              <nav
                aria-label="Navigation mobile"
                className="flex flex-col px-[clamp(18px,4vw,34px)] py-2.5"
              >
                {NAV_LINKS.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="min-h-11 flex items-center border-b border-[color:var(--lv5-line)] text-[1.02rem] font-semibold text-[color:var(--lv5-ink)] last:border-b-0"
                  >
                    {link.label}
                  </a>
                ))}
              </nav>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd apps/marketing && bun test __tests__/landing-v5-masthead.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add apps/marketing/components/landing-v5/masthead.tsx apps/marketing/__tests__/landing-v5-masthead.test.tsx
git commit -m "feat(landing-v5): add masthead with scrolled state and mobile menu"
```

---

## Task 5: `hero.tsx`

**Files:**
- Create: `apps/marketing/components/landing-v5/hero.tsx`
- Test: `apps/marketing/__tests__/landing-v5-hero.test.tsx`

**Interfaces:**
- Consumes: `HERO_PILL`, `HERO_TITLE`, `HERO_LEAD`, `HERO_CTA_PRIMARY`, `HERO_CTA_SECONDARY`, `HERO_CARD`, `TRIAL_NOTE` from `content.ts` (Task 2); `Reveal`, `Parallax` from `motion.tsx` (Task 3); `webAppPath` from `lib/web-app-url.ts`.
- Produces: `LandingV5Hero()`, a server component, default export consumed by `index.tsx` (Task 19).

- [ ] **Step 1: Write the failing test**

```tsx
// apps/marketing/__tests__/landing-v5-hero.test.tsx
import { describe, expect, test } from "bun:test";

import { LandingV5Hero } from "../components/landing-v5/hero";
import { webAppPath } from "../lib/web-app-url";
import { renderWithLandingImageConfig, textOnly } from "./landing-test-utils";

describe("landing-v5 hero", () => {
  test("renders the exact promise, both CTAs and the trial note", () => {
    const html = renderWithLandingImageConfig(<LandingV5Hero />);
    const text = textOnly(html);

    expect(text).toContain("Pour les ostéopathes et praticiens animaliers");
    expect(text).toContain("Vos notes de séance, lisibles par le propriétaire.");
    expect(text).toContain("Biume le met en forme pour le propriétaire.");
    expect(text).toContain("Préparer mon premier compte rendu");
    expect(text).toContain("Voir le parcours");
    expect(text).toContain("15 jours d'essai, sans carte bancaire");
    expect(html).toContain(`href="${webAppPath("/signup")}"`);
    expect(html).toContain('data-conversion="hero-signup"');
    expect(html).toContain('href="#produit"');
  });

  test("renders the product card content and the accessible lateral veil", () => {
    const html = renderWithLandingImageConfig(<LandingV5Hero />);
    const text = textOnly(html);

    expect(text).toContain("Nashira · séance du 12 mars");
    expect(text).toContain("Validé par vous");
    expect(text).toContain("Biume met en forme");
    expect(text).toContain(
      "ainsi qu'une articulation du bas du dos qui bougeait moins bien que la normale.",
    );
    expect(html).toContain("atelier-hero.webp");
    expect(html.match(/linear-gradient/g)?.length).toBeGreaterThanOrEqual(2);
    expect(html.match(/radial-gradient/g)?.length).toBeGreaterThanOrEqual(1);
  });

  test("is a server component with no client directive", async () => {
    const source = await Bun.file(
      new URL("../components/landing-v5/hero.tsx", import.meta.url),
    ).text();

    expect(source).not.toMatch(/^\s*"use client";/m);
    expect(source).toContain("<Parallax");
    expect(source).toContain("<Reveal");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd apps/marketing && bun test __tests__/landing-v5-hero.test.tsx`
Expected: FAIL (module not found)

- [ ] **Step 3: Write `hero.tsx`**

```tsx
// apps/marketing/components/landing-v5/hero.tsx
import Image from "next/image";
import Link from "next/link";

import { HERO_CARD, HERO_CTA_PRIMARY, HERO_CTA_SECONDARY, HERO_LEAD, HERO_PILL, HERO_TITLE, TRIAL_NOTE } from "./content";
import { webAppPath } from "../../lib/web-app-url";
import { Parallax, Reveal } from "./motion";

export function LandingV5Hero() {
  return (
    <section
      aria-labelledby="hero-title"
      className="relative flex min-h-[100svh] items-center overflow-hidden"
    >
      <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
        <Parallax factor={0.28} className="absolute -top-[8%] -bottom-[8%] inset-x-0">
          <div className="relative h-full w-full">
            <Image
              src="/assets/images/landing/atelier-hero.webp"
              alt=""
              fill
              sizes="100vw"
              priority
              className="object-cover object-[64%_50%]"
            />
          </div>
        </Parallax>
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(72% 58% at 18% 78%, rgba(107,90,200,.46) 0%, transparent 62%), radial-gradient(60% 52% at 82% 16%, rgba(46,152,102,.28) 0%, transparent 60%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(180deg, rgba(247,247,244,.72) 0%, rgba(247,247,244,.32) 26%, rgba(247,247,244,.30) 52%, rgba(247,247,244,.86) 84%, #F7F7F4 100%)",
          }}
        />
        {/* Voile latéral requis pour l'accessibilité : sans lui, l'encre
            --lv5-ink de l'accroche passe sous 4.5:1 là où l'écurie sombre
            de la photo traverse la colonne de texte. */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(90deg, rgba(247,247,244,.93) 0%, rgba(247,247,244,.86) 32%, rgba(247,247,244,.5) 54%, rgba(247,247,244,0) 82%)",
          }}
        />
      </div>

      <div className="relative mx-auto w-full max-w-[1200px] px-[clamp(18px,4vw,34px)] py-[120px] pb-[104px]">
        <div className="flex flex-wrap items-center gap-[clamp(30px,4vw,60px)]">
          <div className="min-w-[290px] flex-1 basis-[460px]">
            <Reveal className="inline-flex items-center gap-2 rounded-full border border-[color:var(--lv5-line)] bg-[color:var(--lv5-surface)]/82 px-[14px] py-[7px] pl-3 text-[0.78rem] font-semibold text-[color:var(--lv5-ink)] backdrop-blur-[6px]">
              <span
                aria-hidden="true"
                className="size-[7px] animate-[biume-pulse_2.6s_ease-in-out_infinite] rounded-full bg-[color:var(--lv5-violet)]"
              />
              {HERO_PILL}
            </Reveal>

            <Reveal delay={90}>
              <h1
                id="hero-title"
                className="mt-[22px] max-w-[19ch] text-[clamp(2.7rem,6.2vw,5.4rem)] font-[650] leading-[.94] tracking-[-0.035em] text-[color:var(--lv5-ink)] [text-wrap:balance]"
              >
                {HERO_TITLE}
              </h1>
            </Reveal>

            <Reveal delay={180}>
              <p className="mt-[26px] max-w-[56ch] text-[clamp(1.02rem,1.35vw,1.2rem)] leading-[1.6] text-[color:var(--lv5-ink)] [text-wrap:pretty]">
                {HERO_LEAD}
              </p>
            </Reveal>

            <Reveal delay={270} className="mt-[34px] flex flex-wrap gap-3">
              <Link
                href={webAppPath("/signup")}
                prefetch={false}
                data-conversion="hero-signup"
                className="min-h-11 inline-flex items-center rounded-full bg-[color:var(--lv5-violet)] px-[26px] text-[0.98rem] font-semibold text-white shadow-[var(--lv5-shadow-focus)]"
              >
                {HERO_CTA_PRIMARY}
              </Link>
              <a
                href="#produit"
                className="min-h-11 inline-flex items-center rounded-full border border-[color:var(--lv5-line)] bg-[color:var(--lv5-surface)]/90 px-[26px] text-[0.98rem] font-semibold text-[color:var(--lv5-ink)] backdrop-blur-[6px]"
              >
                {HERO_CTA_SECONDARY}
              </a>
            </Reveal>

            <Reveal delay={340}>
              <p className="mt-5 text-[0.84rem] font-semibold text-[color:var(--lv5-ink)]">
                {TRIAL_NOTE}
              </p>
            </Reveal>
          </div>

          <Reveal
            delay={220}
            className="min-w-[290px] max-w-[520px] flex-1 basis-[380px] rounded-[24px] border border-white/60 bg-[color:var(--lv5-surface)]/72 p-[clamp(16px,1.8vw,22px)] backdrop-blur-[14px] shadow-[var(--lv5-shadow-focus)]"
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <span className="font-[ui-monospace,SFMono-Regular,Menlo,monospace] text-[0.68rem] font-semibold tracking-[0.06em] text-[color:var(--lv5-ink-soft)] uppercase">
                {HERO_CARD.subject}
              </span>
              <span className="rounded-full bg-[color:var(--lv5-green-soft)] px-[10px] py-[5px] text-[0.7rem] font-semibold text-[color:var(--lv5-green-ink)]">
                {HERO_CARD.status}
              </span>
            </div>
            <div className="rounded-[10px] bg-[color:var(--lv5-surface-muted)] px-[14px] py-[13px]">
              <p className="mb-[7px] font-[ui-monospace,SFMono-Regular,Menlo,monospace] text-[0.64rem] font-semibold tracking-[0.08em] text-[color:var(--lv5-ink-soft)] uppercase">
                {HERO_CARD.rawLabel}
              </p>
              <p className="font-[ui-monospace,SFMono-Regular,Menlo,monospace] text-[0.8rem] leading-[1.6] text-[color:var(--lv5-ink-mid)]">
                {HERO_CARD.raw}
              </p>
            </div>
            <div aria-hidden="true" className="flex items-center gap-2.5 px-0.5 py-2.5">
              <span className="h-px flex-1 bg-[color:var(--lv5-line)]" />
              <span className="text-[0.78rem] font-semibold text-[color:var(--lv5-violet)]">
                {HERO_CARD.divider}
              </span>
              <span className="h-px flex-1 bg-[color:var(--lv5-line)]" />
            </div>
            <div className="rounded-xl border border-[color:var(--lv5-line)] bg-[color:var(--lv5-surface)] p-4">
              <p className="mb-2 font-[ui-monospace,SFMono-Regular,Menlo,monospace] text-[0.64rem] font-semibold tracking-[0.08em] text-[color:var(--lv5-ink-soft)] uppercase">
                {HERO_CARD.outLabel}
              </p>
              {HERO_CARD.out.map((paragraph, index) => (
                <p
                  key={paragraph}
                  className={`text-[0.96rem] leading-[1.6] ${index === 0 ? "mb-2.5" : ""}`}
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </Reveal>
        </div>
      </div>

      <div
        aria-hidden="true"
        className="absolute bottom-[26px] left-1/2 flex -translate-x-1/2 animate-[biume-cue_2.8s_ease-in-out_infinite] flex-col items-center gap-[7px] text-[0.66rem] font-semibold tracking-[0.14em] text-[color:var(--lv5-ink-soft)] uppercase"
      >
        <span>Faites défiler</span>
        <span
          className="h-[26px] w-px"
          style={{ backgroundImage: "linear-gradient(180deg,#696970,transparent)" }}
        />
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd apps/marketing && bun test __tests__/landing-v5-hero.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add apps/marketing/components/landing-v5/hero.tsx apps/marketing/__tests__/landing-v5-hero.test.tsx
git commit -m "feat(landing-v5): add hero section"
```

---

## Task 6: `facts.tsx` — « Le constat »

**Files:**
- Create: `apps/marketing/components/landing-v5/facts.tsx`
- Test: `apps/marketing/__tests__/landing-v5-facts.test.tsx`

**Interfaces:**
- Consumes: `FACTS_TITLE`, `FACTS_LEAD`, `FACTS` from `content.ts`; `Reveal` from `motion.tsx`.
- Produces: `LandingV5Facts()`, server component, consumed by `index.tsx` (Task 19).

- [ ] **Step 1: Write the failing test**

```tsx
// apps/marketing/__tests__/landing-v5-facts.test.tsx
import { describe, expect, test } from "bun:test";

import { LandingV5Facts } from "../components/landing-v5/facts";
import { FACTS } from "../components/landing-v5/content";
import { renderWithLandingImageConfig, textOnly } from "./landing-test-utils";

describe("landing-v5 facts", () => {
  test("renders the title and all three numbered facts", () => {
    const html = renderWithLandingImageConfig(<LandingV5Facts />);
    const text = textOnly(html);

    expect(text).toContain("La séance finit dans la voiture.");
    for (const fact of FACTS) {
      expect(text).toContain(fact.n);
      expect(text).toContain(fact.title);
      expect(text).toContain(fact.body);
    }
  });

  test("is a server component", async () => {
    const source = await Bun.file(
      new URL("../components/landing-v5/facts.tsx", import.meta.url),
    ).text();

    expect(source).not.toMatch(/^\s*"use client";/m);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd apps/marketing && bun test __tests__/landing-v5-facts.test.tsx`
Expected: FAIL (module not found)

- [ ] **Step 3: Write `facts.tsx`**

```tsx
// apps/marketing/components/landing-v5/facts.tsx
import { FACTS, FACTS_LEAD, FACTS_TITLE } from "./content";
import { Reveal } from "./motion";

export function LandingV5Facts() {
  return (
    <section
      aria-labelledby="constat-title"
      className="relative px-[clamp(18px,4vw,34px)] py-[clamp(72px,10vw,128px)]"
    >
      <div className="mx-auto max-w-[1200px]">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <Reveal>
            <h2
              id="constat-title"
              className="max-w-[20ch] text-[clamp(2rem,4vw,3.6rem)] font-[650] leading-[1.02] tracking-[-0.03em] text-[color:var(--lv5-ink)]"
            >
              {FACTS_TITLE}
            </h2>
          </Reveal>
          <Reveal delay={80}>
            <p className="max-w-[38ch] text-[1.02rem] leading-[1.65] text-[color:var(--lv5-ink-soft)] [text-wrap:pretty]">
              {FACTS_LEAD}
            </p>
          </Reveal>
        </div>

        <div className="mt-[clamp(38px,5vw,64px)] flex flex-wrap gap-[clamp(18px,2.4vw,30px)]">
          {FACTS.map((fact, index) => (
            <Reveal
              key={fact.n}
              delay={60 + index * 90}
              className="min-w-[250px] flex-1 basis-[260px] rounded-2xl border border-[color:var(--lv5-line)] bg-[color:var(--lv5-surface)] px-6 pt-[26px] pb-7"
            >
              <span className="font-[ui-monospace,SFMono-Regular,Menlo,monospace] text-[0.75rem] font-semibold tracking-[0.02em] text-[color:var(--lv5-violet)]">
                {fact.n}
              </span>
              <h3 className="mt-3.5 mb-2.5 text-[1.3rem] font-semibold leading-[1.2] tracking-[-0.01em] text-[color:var(--lv5-ink)]">
                {fact.title}
              </h3>
              <p className="text-[0.98rem] leading-[1.6] text-[color:var(--lv5-ink-soft)] [text-wrap:pretty]">
                {fact.body}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd apps/marketing && bun test __tests__/landing-v5-facts.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add apps/marketing/components/landing-v5/facts.tsx apps/marketing/__tests__/landing-v5-facts.test.tsx
git commit -m "feat(landing-v5): add facts section"
```

---

## Task 7: `photo-plate.tsx` — reusable photo plate (2 usages)

**Files:**
- Create: `apps/marketing/components/landing-v5/photo-plate.tsx`
- Test: `apps/marketing/__tests__/landing-v5-photo-plate.test.tsx`

**Interfaces:**
- Consumes: `Parallax`, `Reveal` from `motion.tsx`.
- Produces: `PhotoPlate(props: { ariaLabel: string; eyebrow: string; quote: string; attribution: string; src: string; alt: string; objectPosition: string; parallaxFactor: number; tone: "dark" | "light"; heightClass: string })`, server component, used twice by `index.tsx` (Task 19) with `PRACTICE_PLATE`/`OWNER_PLATE` from `content.ts` (Task 2) spread in, plus an explicit `ariaLabel` ("Le geste" / "Le propriétaire" — distinct from the later "Côté propriétaire" section) and `tone`/`heightClass` that are presentation, not copy, so they stay out of `content.ts`.

- [ ] **Step 1: Write the failing test**

```tsx
// apps/marketing/__tests__/landing-v5-photo-plate.test.tsx
import { describe, expect, test } from "bun:test";

import { PhotoPlate } from "../components/landing-v5/photo-plate";
import { PRACTICE_PLATE, OWNER_PLATE } from "../components/landing-v5/content";
import { renderWithLandingImageConfig, textOnly } from "./landing-test-utils";

describe("landing-v5 photo plate", () => {
  test("renders the dark-tone practice plate with light-tone text", () => {
    const html = renderWithLandingImageConfig(
      <PhotoPlate
        ariaLabel="Le geste"
        tone="dark"
        heightClass="min-h-[min(74svh,620px)]"
        {...PRACTICE_PLATE}
      />,
    );
    const text = textOnly(html);

    expect(html).toContain('aria-label="Le geste"');
    expect(text).toContain("Ce que vos notes racontent");
    expect(text).toContain("Vingt minutes de gestes tiennent en huit lignes d'abréviations.");
    expect(html).toContain("atelier-practice.webp");
    expect(html).toContain("rgba(32,32,36,.78)");
  });

  test("renders the light-tone owner plate", () => {
    const html = renderWithLandingImageConfig(
      <PhotoPlate
        ariaLabel="Le propriétaire"
        tone="light"
        heightClass="min-h-[min(70svh,580px)]"
        {...OWNER_PLATE}
      />,
    );
    const text = textOnly(html);

    expect(html).toContain('aria-label="Le propriétaire"');
    expect(text).toContain("Ce que le propriétaire retient");
    expect(html).toContain("atelier-owner.webp");
    expect(html).toContain("rgba(247,247,244,.92)");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd apps/marketing && bun test __tests__/landing-v5-photo-plate.test.tsx`
Expected: FAIL (module not found)

- [ ] **Step 3: Write `photo-plate.tsx`**

```tsx
// apps/marketing/components/landing-v5/photo-plate.tsx
import Image from "next/image";

import { Parallax, Reveal } from "./motion";

export function PhotoPlate({
  ariaLabel,
  eyebrow,
  quote,
  attribution,
  src,
  alt,
  objectPosition,
  parallaxFactor,
  tone,
  heightClass,
}: {
  ariaLabel: string;
  eyebrow: string;
  quote: string;
  attribution: string;
  src: string;
  alt: string;
  objectPosition: string;
  parallaxFactor: number;
  tone: "dark" | "light";
  heightClass: string;
}) {
  const overlay =
    tone === "dark"
      ? "linear-gradient(90deg, rgba(32,32,36,.78) 0%, rgba(32,32,36,.42) 46%, rgba(32,32,36,.08) 100%)"
      : "linear-gradient(90deg, rgba(247,247,244,.92) 0%, rgba(247,247,244,.6) 42%, rgba(247,247,244,.05) 100%)";
  const eyebrowClass =
    tone === "dark" ? "text-[#FDFDFB]/62" : "text-[color:var(--lv5-ink-soft)]";
  const quoteClass = tone === "dark" ? "text-[#FDFDFB]" : "text-[color:var(--lv5-ink)]";
  const attributionClass =
    tone === "dark" ? "text-[#FDFDFB]/72" : "text-[color:var(--lv5-ink-soft)]";

  return (
    <section aria-label={ariaLabel} className={`relative overflow-hidden ${heightClass}`}>
      <Parallax factor={parallaxFactor} className="absolute -top-[10%] -bottom-[10%] inset-x-0">
        <div className="relative h-full w-full">
          <Image
            src={src}
            alt={alt}
            fill
            sizes="100vw"
            className="object-cover"
            style={{ objectPosition }}
          />
        </div>
      </Parallax>
      <div aria-hidden="true" className="absolute inset-0" style={{ backgroundImage: overlay }} />
      <div className="relative mx-auto flex h-full max-w-[1200px] flex-col justify-center gap-3.5 px-[clamp(18px,4vw,34px)]">
        <Reveal>
          <p
            className={`font-[ui-monospace,SFMono-Regular,Menlo,monospace] text-[0.72rem] font-semibold tracking-[0.08em] uppercase ${eyebrowClass}`}
          >
            {eyebrow}
          </p>
        </Reveal>
        <Reveal delay={90}>
          <p
            className={`max-w-[22ch] text-[clamp(1.9rem,3.6vw,3.2rem)] font-[650] leading-[1.04] tracking-[-0.03em] ${quoteClass}`}
          >
            {quote}
          </p>
        </Reveal>
        <Reveal delay={170}>
          <p className={`max-w-[34ch] text-[1rem] leading-[1.6] ${attributionClass}`}>
            {attribution}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd apps/marketing && bun test __tests__/landing-v5-photo-plate.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add apps/marketing/components/landing-v5/photo-plate.tsx apps/marketing/__tests__/landing-v5-photo-plate.test.tsx
git commit -m "feat(landing-v5): add reusable photo plate"
```

---

## Task 8: `specimen.tsx` — « Le relevé » démonstration

**Files:**
- Create: `apps/marketing/components/landing-v5/specimen.tsx`
- Test: `apps/marketing/__tests__/landing-v5-specimen.test.tsx`

**Interfaces:**
- Consumes: `SPECIMEN_EYEBROW`, `SPECIMEN_TITLE`, `SPECIMEN_LEAD`, `SPECIMEN_SUBJECT`, `SPECIMEN_RAIL`, `SPECIMEN_STEPS`, `SPECIMEN_NOTE` from `content.ts`; `ensureGsapPlugins` from `motion.tsx`.
- Produces: `LandingV5Specimen()`, `"use client"`, default export consumed by `index.tsx` (Task 19). Owns its own scrubbed `ScrollTrigger` (trigger = its own `[data-demo-track]` node, `start: "top top"`, `end: "bottom bottom"`, matching the prototype's `progress = -trackTop / (trackHeight - viewportHeight)` exactly) — this is "pilote de la démo" from the handoff's file tree, colocated here rather than in `motion.tsx` because only this component knows its own panel/rail markup.

- [ ] **Step 1: Write the failing test**

```tsx
// apps/marketing/__tests__/landing-v5-specimen.test.tsx
import { describe, expect, test } from "bun:test";

import { LandingV5Specimen } from "../components/landing-v5/specimen";
import { SPECIMEN_STEPS } from "../components/landing-v5/content";
import { renderWithLandingImageConfig, textOnly } from "./landing-test-utils";

describe("landing-v5 specimen", () => {
  test("renders the subject, rail and all four steps' raw/out/body text", () => {
    const html = renderWithLandingImageConfig(<LandingV5Specimen />);
    const text = textOnly(html);

    expect(html).toContain('id="produit"');
    expect(html).toContain('aria-labelledby="demo-title"');
    expect(text).toContain("Nashira · jument selle français · 11 ans");
    for (const label of ["Motif", "Examen", "Traitement", "Suites"]) {
      expect(text).toContain(label);
    }
    for (const step of SPECIMEN_STEPS) {
      expect(text).toContain(step.raw);
      expect(text).toContain(step.heading);
      expect(text).toContain(step.out);
      expect(text).toContain(step.body);
    }
    expect(text).toContain("Séance fictive, écrite pour la démonstration.");
  });

  test("stacks all four panels in the same grid cell and shows only the first by default", () => {
    const html = renderWithLandingImageConfig(<LandingV5Specimen />);

    expect(html.match(/data-panel="[0-3]"/g)).toHaveLength(4);
    expect(html.match(/data-rail-item="[0-3]"/g)).toHaveLength(4);
    expect(html).toContain('data-demo-progress=""');
    expect(html).toMatch(/data-panel="0"[^>]*style="[^"]*display:flex/);
    expect(html).toMatch(/data-panel="1"[^>]*style="[^"]*display:none/);
    expect(html).toMatch(/data-panel="2"[^>]*style="[^"]*display:none/);
    expect(html).toMatch(/data-panel="3"[^>]*style="[^"]*display:none/);
  });

  test("owns its own scrubbed scroll trigger, no window listener, no reduced-motion guard", async () => {
    const source = await Bun.file(
      new URL("../components/landing-v5/specimen.tsx", import.meta.url),
    ).text();

    expect(source.trimStart()).toMatch(/^"use client";/);
    expect(source).toContain("ScrollTrigger.create");
    expect(source).toContain('start: "top top"');
    expect(source).toContain('end: "bottom bottom"');
    expect(source).toContain("scrub: true");
    expect(source).toContain("biume-volet");
    expect(source).not.toContain("prefers-reduced-motion");
    expect(source).not.toMatch(/window\.addEventListener\(\s*["']scroll/);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd apps/marketing && bun test __tests__/landing-v5-specimen.test.tsx`
Expected: FAIL (module not found)

- [ ] **Step 3: Write `specimen.tsx`**

```tsx
// apps/marketing/components/landing-v5/specimen.tsx
"use client";

import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";

import {
  SPECIMEN_EYEBROW,
  SPECIMEN_LEAD,
  SPECIMEN_NOTE,
  SPECIMEN_RAIL,
  SPECIMEN_STEPS,
  SPECIMEN_SUBJECT,
  SPECIMEN_TITLE,
} from "./content";
import { ensureGsapPlugins, Reveal } from "./motion";

export function LandingV5Specimen() {
  const trackRef = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      ensureGsapPlugins();
      const track = trackRef.current;
      if (!track) return;

      const railItems = Array.from(
        track.querySelectorAll<HTMLElement>("[data-rail-item]"),
      );
      const panels = Array.from(track.querySelectorAll<HTMLElement>("[data-panel]"));
      const progressBar = track.querySelector<HTMLElement>("[data-demo-progress]");

      let current = -1;

      const setStep = (step: number) => {
        if (step === current) return;
        current = step;

        panels.forEach((panel) => {
          const index = Number(panel.getAttribute("data-panel"));
          const active = index === step;
          panel.style.display = active ? "flex" : "none";
          if (active) {
            // Reflow forcé : sans lui, réappliquer la même valeur
            // d'animation ne la relance pas.
            panel.style.animation = "none";
            void panel.offsetWidth;
            panel.style.animation =
              "biume-volet 420ms cubic-bezier(0.16,1,0.3,1) both";
          }
        });

        railItems.forEach((item) => {
          const index = Number(item.getAttribute("data-rail-item"));
          const active = index === step;
          item.style.backgroundColor = active ? "rgba(107,90,200,.22)" : "transparent";
          item.style.color = active ? "#FDFDFB" : "rgba(253,253,251,.45)";
          const dot = item.querySelector<HTMLElement>("[data-rail-dot]");
          if (dot) {
            dot.style.transform = active ? "scale(1.5)" : "scale(1)";
            dot.style.opacity = index <= step ? "1" : ".3";
          }
        });
      };

      const trigger = ScrollTrigger.create({
        trigger: track,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        onUpdate: (self) => {
          if (progressBar) {
            progressBar.style.width = `${(self.progress * 100).toFixed(1)}%`;
          }
          setStep(Math.min(3, Math.floor(self.progress * 3.999)));
        },
      });

      setStep(0);

      return () => trigger.kill();
    },
    { scope: trackRef },
  );

  return (
    <section
      id="produit"
      aria-labelledby="demo-title"
      className="relative bg-[color:var(--lv5-anthracite)] text-[#FDFDFB]"
    >
      <div className="mx-auto max-w-[1200px] px-[clamp(18px,4vw,34px)] pt-[clamp(72px,9vw,116px)]">
        <Reveal>
          <p className="font-[ui-monospace,SFMono-Regular,Menlo,monospace] text-[0.75rem] font-semibold tracking-[0.02em] text-[#8E82E8]">
            {SPECIMEN_EYEBROW}
          </p>
        </Reveal>
        <Reveal delay={80}>
          <h2
            id="demo-title"
            className="mt-[18px] max-w-[24ch] text-[clamp(2rem,4vw,3.6rem)] font-[650] leading-[1.02] tracking-[-0.03em]"
          >
            {SPECIMEN_TITLE}
          </h2>
        </Reveal>
        <Reveal delay={150}>
          <p className="mt-5 max-w-[52ch] text-[1.02rem] leading-[1.65] text-[#FDFDFB]/66 [text-wrap:pretty]">
            {SPECIMEN_LEAD}
          </p>
        </Reveal>
      </div>

      <div ref={trackRef} data-demo-track="" className="relative mt-[clamp(32px,4vw,54px)] h-[440vh]">
        <div className="sticky top-0 flex min-h-[100svh] items-center py-[88px] pb-[44px]">
          <div className="mx-auto w-full max-w-[1200px] px-[clamp(18px,4vw,34px)]">
            <div className="flex flex-wrap items-start gap-[clamp(20px,3vw,44px)]">
              <div className="w-full flex-none sm:w-[210px] flex flex-col gap-1">
                <p className="mb-2.5 font-[ui-monospace,SFMono-Regular,Menlo,monospace] text-[0.68rem] tracking-[0.06em] text-[#FDFDFB]/42 uppercase">
                  {SPECIMEN_SUBJECT}
                </p>
                {SPECIMEN_RAIL.map((label, index) => (
                  <div
                    key={label}
                    data-rail-item={index}
                    className="flex items-center gap-[11px] rounded-[10px] px-[13px] py-[11px] transition-[background-color,color] duration-500"
                  >
                    <span
                      data-rail-dot=""
                      className="size-[7px] rounded-full bg-[color:var(--lv5-violet)] transition-transform duration-500"
                    />
                    <span className="text-[0.95rem] font-semibold">{label}</span>
                  </div>
                ))}
                <div className="mt-4 h-0.5 overflow-hidden rounded-full bg-[#FDFDFB]/14">
                  <div
                    data-demo-progress=""
                    className="h-full w-0 bg-[color:var(--lv5-violet)] transition-[width] duration-[250ms] ease-linear"
                  />
                </div>
              </div>

              <div className="grid min-w-[280px] flex-1 basis-[460px] items-start">
                {SPECIMEN_STEPS.map((step, index) => (
                  <div
                    key={step.id}
                    data-panel={index}
                    className="col-start-1 row-start-1 flex flex-wrap gap-[clamp(14px,2vw,26px)]"
                    style={{ display: index === 0 ? "flex" : "none" }}
                  >
                    <div className="min-w-[220px] flex-1 basis-[240px] rounded-2xl border border-[#FDFDFB]/12 bg-[#FDFDFB]/5 p-5">
                      <p className="mb-3 font-[ui-monospace,SFMono-Regular,Menlo,monospace] text-[0.68rem] tracking-[0.08em] text-[#FDFDFB]/44 uppercase">
                        Vos notes
                      </p>
                      <p className="font-[ui-monospace,SFMono-Regular,Menlo,monospace] text-[0.86rem] leading-[1.7] text-[#FDFDFB]/82">
                        {step.raw}
                      </p>
                    </div>
                    <div className="min-w-[240px] flex-1 basis-[260px] rounded-2xl bg-[color:var(--lv5-surface)] p-[22px] text-[color:var(--lv5-ink)] shadow-[var(--lv5-shadow-focus)]">
                      <p className="mb-3 font-[ui-monospace,SFMono-Regular,Menlo,monospace] text-[0.68rem] tracking-[0.08em] text-[color:var(--lv5-ink-soft)] uppercase">
                        Compte rendu propriétaire
                      </p>
                      <h3 className="mb-3 text-[1.16rem] font-semibold tracking-[-0.01em]">
                        {step.heading}
                      </h3>
                      <p className="mb-3.5 text-[1rem] leading-[1.62]">{step.out}</p>
                      <p className="text-[0.9rem] leading-[1.55] text-[color:var(--lv5-ink-soft)]">
                        {step.body}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <p className="mt-[clamp(20px,3vw,34px)] max-w-[60ch] text-[0.8rem] leading-[1.5] text-[#FDFDFB]/44">
              {SPECIMEN_NOTE}
            </p>
          </div>
        </div>
      </div>
      <div className="h-[clamp(56px,7vw,96px)]" />
    </section>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd apps/marketing && bun test __tests__/landing-v5-specimen.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add apps/marketing/components/landing-v5/specimen.tsx apps/marketing/__tests__/landing-v5-specimen.test.tsx
git commit -m "feat(landing-v5): add specimen demo section"
```

---

## Task 9: `control.tsx` — « Le contrôle »

**Files:**
- Create: `apps/marketing/components/landing-v5/control.tsx`
- Test: `apps/marketing/__tests__/landing-v5-control.test.tsx`

**Interfaces:**
- Consumes: `CONTROL_EYEBROW`, `CONTROL_TITLE`, `CONTROL_LEAD`, `CONTROL_INVITE`, `CONTROL_PASSAGES` from `content.ts`; `Reveal` from `motion.tsx`.
- Produces: `LandingV5Control()`, `"use client"`, default export consumed by `index.tsx` (Task 19). Real `useState<boolean[]>`, real `<button>`s — no `ScrollTrigger` here, this is click-driven.

- [ ] **Step 1: Write the failing test**

```tsx
// apps/marketing/__tests__/landing-v5-control.test.tsx
import { afterEach, describe, expect, test } from "bun:test";

import { LandingV5Control } from "../components/landing-v5/control";
import { CONTROL_PASSAGES } from "../components/landing-v5/content";
import { renderWithLandingImageConfig, textOnly } from "./landing-test-utils";
import { cleanup, fireEvent, render, within } from "./dom-test-utils";

afterEach(cleanup);

describe("landing-v5 control", () => {
  test("renders the three passages, all pending by default", () => {
    const html = renderWithLandingImageConfig(<LandingV5Control />);
    const text = textOnly(html);

    expect(html).toContain('id="controle"');
    for (const passage of CONTROL_PASSAGES) {
      expect(text).toContain(passage.label);
      expect(text).toContain(passage.text);
    }
    expect(text).toContain("3 passages attendent votre relecture.");
    expect(html.match(/data-state="attente"/g)).toHaveLength(3);
  });

  test("validates passages one by one and unlocks the send button only when all three are validated", () => {
    const { container } = render(<LandingV5Control />);
    const passages = CONTROL_PASSAGES.map(
      (passage) =>
        container.querySelector<HTMLButtonElement>(
          `[data-control-passage="${passage.id}"]`,
        )!,
    );
    const sendButton = within(container).getByRole("button", {
      name: "Envoyer au propriétaire",
    }) as HTMLButtonElement;

    expect(passages.every((p) => p.tagName === "BUTTON")).toBe(true);
    expect(sendButton.disabled).toBe(true);

    fireEvent.click(passages[0]!);
    expect(passages[0]!.dataset.state).toBe("valide");
    expect(within(container).getByText("2 passages attendent votre relecture.")).not.toBeNull();

    fireEvent.click(passages[1]!);
    fireEvent.click(passages[2]!);
    expect(within(container).getByText("Les trois passages sont validés.")).not.toBeNull();
    expect(sendButton.disabled).toBe(false);

    fireEvent.click(passages[0]!);
    expect(passages[0]!.dataset.state).toBe("attente");
    expect(sendButton.disabled).toBe(true);
    expect(within(container).getByText("1 passage attend votre relecture.")).not.toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd apps/marketing && bun test __tests__/landing-v5-control.test.tsx`
Expected: FAIL (module not found)

- [ ] **Step 3: Write `control.tsx`**

```tsx
// apps/marketing/components/landing-v5/control.tsx
"use client";

import { useState } from "react";

import {
  CONTROL_EYEBROW,
  CONTROL_INVITE,
  CONTROL_LEAD,
  CONTROL_PASSAGES,
  CONTROL_TITLE,
} from "./content";
import { Reveal } from "./motion";

export function LandingV5Control() {
  const [validated, setValidated] = useState<boolean[]>(() =>
    CONTROL_PASSAGES.map(() => false),
  );
  const remaining = validated.filter((value) => !value).length;
  const allValidated = remaining === 0;

  const toggle = (index: number) => {
    setValidated((prev) => prev.map((value, i) => (i === index ? !value : value)));
  };

  return (
    <section
      id="controle"
      aria-labelledby="controle-title"
      className="relative px-[clamp(18px,4vw,34px)] py-[clamp(72px,10vw,128px)]"
    >
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-start gap-[clamp(28px,5vw,72px)]">
        <div className="min-w-[290px] flex-1 basis-[340px] lg:sticky lg:top-[110px]">
          <Reveal>
            <p className="font-[ui-monospace,SFMono-Regular,Menlo,monospace] text-[0.75rem] font-semibold tracking-[0.02em] text-[color:var(--lv5-violet)]">
              {CONTROL_EYEBROW}
            </p>
          </Reveal>
          <Reveal delay={70}>
            <h2
              id="controle-title"
              className="mt-[18px] max-w-[18ch] text-[clamp(2rem,4vw,3.6rem)] font-[650] leading-[1.02] tracking-[-0.03em] text-[color:var(--lv5-ink)]"
            >
              {CONTROL_TITLE}
            </h2>
          </Reveal>
          <Reveal delay={140}>
            <p className="mt-5 max-w-[46ch] text-[1.02rem] leading-[1.65] text-[color:var(--lv5-ink-soft)] [text-wrap:pretty]">
              {CONTROL_LEAD}
            </p>
          </Reveal>
          <Reveal delay={200}>
            <p className="mt-[22px] text-[0.86rem] font-semibold text-[color:var(--lv5-violet)]">
              {CONTROL_INVITE}
            </p>
          </Reveal>
        </div>

        <Reveal className="min-w-[300px] flex-1 basis-[420px] rounded-2xl border border-[color:var(--lv5-line)] bg-[color:var(--lv5-surface)] p-[clamp(18px,2.4vw,28px)]">
          {CONTROL_PASSAGES.map((passage, index) => {
            const isValidated = validated[index];
            return (
              <button
                key={passage.id}
                type="button"
                onClick={() => toggle(index)}
                data-control-passage={passage.id}
                data-state={isValidated ? "valide" : "attente"}
                className={`min-h-11 mt-3 block w-full rounded-[10px] border p-4 text-left transition-[border-color,background-color] duration-[400ms] first:mt-0 ${
                  isValidated
                    ? "border-[color:var(--lv5-green)] bg-[color:var(--lv5-green-soft)]"
                    : "border-[color:var(--lv5-line)] bg-transparent"
                }`}
              >
                <span className="flex items-center justify-between gap-3">
                  <span className="font-[ui-monospace,SFMono-Regular,Menlo,monospace] text-[0.7rem] font-semibold tracking-[0.06em] text-[color:var(--lv5-ink-soft)] uppercase">
                    {passage.label}
                  </span>
                  <span
                    className={`inline-flex shrink-0 rounded-full px-[11px] py-[5px] text-[0.72rem] font-semibold transition-colors duration-[400ms] ${
                      isValidated
                        ? "bg-[color:var(--lv5-surface)] text-[color:var(--lv5-green-ink)]"
                        : "bg-[color:var(--lv5-surface-muted)] text-[color:var(--lv5-ink-soft)]"
                    }`}
                  >
                    {isValidated ? "Validé" : "En attente"}
                  </span>
                </span>
                <span className="mt-[11px] block text-[0.98rem] leading-[1.6] text-[color:var(--lv5-ink)]">
                  {passage.text}
                </span>
              </button>
            );
          })}

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[color:var(--lv5-line)] pt-[18px]">
            <span
              className={`text-[0.84rem] ${
                allValidated ? "text-[color:var(--lv5-green-ink)]" : "text-[color:var(--lv5-ink-soft)]"
              }`}
            >
              {allValidated
                ? "Les trois passages sont validés."
                : `${remaining} ${remaining === 1 ? "passage attend" : "passages attendent"} votre relecture.`}
            </span>
            <button
              type="button"
              disabled={!allValidated}
              className={`min-h-11 inline-flex items-center rounded-full px-[22px] text-[0.92rem] font-semibold transition-[background-color,color,box-shadow] duration-[450ms] ${
                allValidated
                  ? "bg-[color:var(--lv5-violet)] text-white shadow-[var(--lv5-shadow-focus)]"
                  : "cursor-default bg-[color:var(--lv5-surface-muted)] text-[color:var(--lv5-ink-soft)]"
              }`}
            >
              Envoyer au propriétaire
            </button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd apps/marketing && bun test __tests__/landing-v5-control.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add apps/marketing/components/landing-v5/control.tsx apps/marketing/__tests__/landing-v5-control.test.tsx
git commit -m "feat(landing-v5): add interactive control section"
```

---

## Task 10: `follow-up.tsx` — « Le suivi »

**Files:**
- Create: `apps/marketing/components/landing-v5/follow-up.tsx`
- Test: `apps/marketing/__tests__/landing-v5-follow-up.test.tsx`

**Interfaces:**
- Consumes: `FOLLOW_UP_EYEBROW`, `FOLLOW_UP_TITLE`, `FOLLOW_UP` from `content.ts`; `Reveal`, `ensureGsapPlugins` from `motion.tsx`.
- Produces: `LandingV5FollowUp()`, `"use client"`, default export consumed by `index.tsx` (Task 19). Owns its own scrubbed `ScrollTrigger` for the thread fill (the handoff's file tree groups this under `motion.tsx` as "fil du suivi"; it's colocated here instead, same rationale as `specimen.tsx` in Task 8 — only this component knows its own thread markup, and `ScrollTrigger.create` calls across files still share one underlying scroll listener).

- [ ] **Step 1: Write the failing test**

```tsx
// apps/marketing/__tests__/landing-v5-follow-up.test.tsx
import { describe, expect, test } from "bun:test";

import { LandingV5FollowUp } from "../components/landing-v5/follow-up";
import { FOLLOW_UP } from "../components/landing-v5/content";
import { renderWithLandingImageConfig, textOnly } from "./landing-test-utils";

describe("landing-v5 follow-up", () => {
  test("renders the eyebrow, title and all three milestones in order", () => {
    const html = renderWithLandingImageConfig(<LandingV5FollowUp />);
    const text = textOnly(html);

    expect(html).toContain('id="suivi"');
    expect(text).toContain("La séance continue sans que vous y pensiez.");
    const positions = FOLLOW_UP.map((milestone) => {
      expect(text).toContain(milestone.when);
      expect(text).toContain(milestone.title);
      expect(text).toContain(milestone.body);
      return text.indexOf(milestone.title);
    });
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
  });

  test("starts the thread fill at zero height", () => {
    const html = renderWithLandingImageConfig(<LandingV5FollowUp />);

    expect(html).toMatch(/style="[^"]*height:0/);
  });

  test("owns its own scrubbed scroll trigger for the thread, no window listener", async () => {
    const source = await Bun.file(
      new URL("../components/landing-v5/follow-up.tsx", import.meta.url),
    ).text();

    expect(source.trimStart()).toMatch(/^"use client";/);
    expect(source).toContain("ScrollTrigger.create");
    expect(source).toContain("scrub: true");
    expect(source).not.toMatch(/window\.addEventListener\(\s*["']scroll/);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd apps/marketing && bun test __tests__/landing-v5-follow-up.test.tsx`
Expected: FAIL (module not found)

- [ ] **Step 3: Write `follow-up.tsx`**

```tsx
// apps/marketing/components/landing-v5/follow-up.tsx
"use client";

import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";

import { FOLLOW_UP, FOLLOW_UP_EYEBROW, FOLLOW_UP_TITLE } from "./content";
import { ensureGsapPlugins, Reveal } from "./motion";

export function LandingV5FollowUp() {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const fillRef = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      ensureGsapPlugins();
      const host = hostRef.current;
      const fill = fillRef.current;
      if (!host || !fill) return;

      const trigger = ScrollTrigger.create({
        trigger: host,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
        onUpdate: () => {
          const rect = host.getBoundingClientRect();
          const vh = window.innerHeight;
          const progress = Math.max(
            0,
            Math.min(1, (vh * 0.78 - rect.top) / (rect.height * 0.86)),
          );
          fill.style.height = `${(progress * 100).toFixed(1)}%`;
        },
      });

      return () => trigger.kill();
    },
    { scope: hostRef },
  );

  return (
    <section
      id="suivi"
      aria-labelledby="suivi-title"
      className="relative bg-[color:var(--lv5-blue-soft)] px-[clamp(18px,4vw,34px)] py-[clamp(72px,10vw,128px)]"
    >
      <div className="mx-auto max-w-[1200px]">
        <Reveal>
          <p className="font-[ui-monospace,SFMono-Regular,Menlo,monospace] text-[0.75rem] font-semibold tracking-[0.02em] text-[color:var(--lv5-blue)]">
            {FOLLOW_UP_EYEBROW}
          </p>
        </Reveal>
        <Reveal delay={70}>
          <h2
            id="suivi-title"
            className="mt-[18px] max-w-[24ch] text-[clamp(2rem,4vw,3.6rem)] font-[650] leading-[1.02] tracking-[-0.03em] text-[color:var(--lv5-ink)]"
          >
            {FOLLOW_UP_TITLE}
          </h2>
        </Reveal>

        <div
          ref={hostRef}
          className="relative mt-[clamp(38px,5vw,64px)] flex flex-col gap-[clamp(18px,2.4vw,28px)]"
        >
          <div
            aria-hidden="true"
            className="absolute top-3.5 bottom-3.5 left-[19px] w-0.5 overflow-hidden rounded-full bg-[color:var(--lv5-blue)]/24"
          >
            <div
              ref={fillRef}
              style={{ height: "0%" }}
              className="w-full bg-[color:var(--lv5-blue)] transition-[height] duration-[180ms] ease-linear"
            />
          </div>
          {FOLLOW_UP.map((milestone, index) => (
            <Reveal
              key={milestone.when}
              delay={index * 100}
              className="relative flex flex-wrap items-baseline gap-[clamp(16px,2.6vw,34px)] pl-[52px]"
            >
              <span
                aria-hidden="true"
                className="absolute top-1.5 left-3 size-4 rounded-full border-2 border-[color:var(--lv5-blue)] bg-[color:var(--lv5-blue-soft)]"
              />
              <span className="w-[60px] flex-none font-[ui-monospace,SFMono-Regular,Menlo,monospace] text-[0.9rem] font-semibold text-[color:var(--lv5-blue)]">
                {milestone.when}
              </span>
              <div className="min-w-[260px] flex-1 basis-[320px]">
                <h3 className="mb-2 text-[1.32rem] font-semibold tracking-[-0.01em] text-[color:var(--lv5-ink)]">
                  {milestone.title}
                </h3>
                <p className="text-[1rem] leading-[1.6] text-[color:var(--lv5-ink-mid)] [text-wrap:pretty]">
                  {milestone.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd apps/marketing && bun test __tests__/landing-v5-follow-up.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add apps/marketing/components/landing-v5/follow-up.tsx apps/marketing/__tests__/landing-v5-follow-up.test.tsx
git commit -m "feat(landing-v5): add follow-up section with scrubbed thread"
```

---

## Task 11: `owner.tsx` — « Côté propriétaire »

**Files:**
- Create: `apps/marketing/components/landing-v5/owner.tsx`
- Test: `apps/marketing/__tests__/landing-v5-owner.test.tsx`

**Interfaces:**
- Consumes: `OWNER_EYEBROW`, `OWNER_TITLE`, `OWNER_LEAD`, `OWNER_POINTS`, `OWNER_MOCK_LINK`, `OWNER_MOCK_FOLLOWUP` from `content.ts`; `Reveal` from `motion.tsx`.
- Produces: `LandingV5Owner()`, server component, consumed by `index.tsx` (Task 19).

- [ ] **Step 1: Write the failing test**

```tsx
// apps/marketing/__tests__/landing-v5-owner.test.tsx
import { describe, expect, test } from "bun:test";

import { LandingV5Owner } from "../components/landing-v5/owner";
import { OWNER_MOCK_FOLLOWUP, OWNER_MOCK_LINK, OWNER_POINTS } from "../components/landing-v5/content";
import { renderWithLandingImageConfig, textOnly } from "./landing-test-utils";

describe("landing-v5 owner", () => {
  test("renders the title, the three points and both device mocks", () => {
    const html = renderWithLandingImageConfig(<LandingV5Owner />);
    const text = textOnly(html);

    expect(html).toContain('id="proprietaire"');
    expect(text).toContain("Il n'installe rien, il ne crée pas de compte.");
    for (const point of OWNER_POINTS) {
      expect(text).toContain(point);
    }
    expect(text).toContain(OWNER_MOCK_LINK.message);
    expect(text).toContain(OWNER_MOCK_FOLLOWUP.question);
    expect(text).toContain(OWNER_MOCK_FOLLOWUP.answers[OWNER_MOCK_FOLLOWUP.selectedIndex]);
  });

  test("is a server component", async () => {
    const source = await Bun.file(
      new URL("../components/landing-v5/owner.tsx", import.meta.url),
    ).text();

    expect(source).not.toMatch(/^\s*"use client";/m);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd apps/marketing && bun test __tests__/landing-v5-owner.test.tsx`
Expected: FAIL (module not found)

- [ ] **Step 3: Write `owner.tsx`**

```tsx
// apps/marketing/components/landing-v5/owner.tsx
import {
  OWNER_EYEBROW,
  OWNER_LEAD,
  OWNER_MOCK_FOLLOWUP,
  OWNER_MOCK_LINK,
  OWNER_POINTS,
  OWNER_TITLE,
} from "./content";
import { Reveal } from "./motion";

export function LandingV5Owner() {
  return (
    <section
      id="proprietaire"
      aria-labelledby="proprietaire-title"
      className="relative px-[clamp(18px,4vw,34px)] py-[clamp(72px,10vw,128px)]"
    >
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-[clamp(28px,5vw,72px)]">
        <div className="min-w-[290px] flex-1 basis-[400px]">
          <Reveal>
            <p className="font-[ui-monospace,SFMono-Regular,Menlo,monospace] text-[0.75rem] font-semibold tracking-[0.02em] text-[color:var(--lv5-blue)]">
              {OWNER_EYEBROW}
            </p>
          </Reveal>
          <Reveal delay={70}>
            <h2
              id="proprietaire-title"
              className="mt-[18px] max-w-[18ch] text-[clamp(2rem,4vw,3.6rem)] font-[650] leading-[1.02] tracking-[-0.03em] text-[color:var(--lv5-ink)]"
            >
              {OWNER_TITLE}
            </h2>
          </Reveal>
          <Reveal delay={140}>
            <p className="mt-5 max-w-[46ch] text-[1.02rem] leading-[1.65] text-[color:var(--lv5-ink-soft)] [text-wrap:pretty]">
              {OWNER_LEAD}
            </p>
          </Reveal>
          <Reveal delay={200}>
            <ul className="mt-6 flex flex-col gap-[11px] text-[1rem] leading-[1.5]">
              {OWNER_POINTS.map((point) => (
                <li key={point} className="flex gap-[11px]">
                  <span
                    aria-hidden="true"
                    className="mt-[7px] size-[7px] flex-none rounded-full bg-[color:var(--lv5-blue)]"
                  />
                  {point}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <Reveal
          delay={120}
          className="flex min-w-[280px] flex-1 basis-[340px] flex-wrap justify-center gap-[clamp(14px,2vw,20px)]"
        >
          <div className="w-full max-w-[216px] rounded-[26px] border border-[color:var(--lv5-line)] bg-[color:var(--lv5-surface)] px-2.5 pt-3 pb-4 shadow-[var(--lv5-shadow-manipulation)]">
            <div className="mx-auto mb-3 h-1 w-12 rounded-full bg-[color:var(--lv5-line)]" />
            <div className="rounded-[10px] bg-[color:var(--lv5-blue-soft)] p-3">
              <p className="text-[0.7rem] font-semibold text-[color:var(--lv5-blue-ink)]">
                {OWNER_MOCK_LINK.label}
              </p>
              <p className="mt-1.5 text-[0.84rem] leading-[1.45]">{OWNER_MOCK_LINK.message}</p>
            </div>
            <p className="mt-3.5 mb-2 text-[0.7rem] font-semibold text-[color:var(--lv5-ink-soft)]">
              {OWNER_MOCK_LINK.codeLabel}
            </p>
            <div className="flex gap-1.5">
              {OWNER_MOCK_LINK.digits.map((digit, index) => (
                <span
                  key={index}
                  className={`flex h-[34px] flex-1 items-center justify-center rounded-lg border text-[0.9rem] font-semibold ${
                    index === 2
                      ? "border-[color:var(--lv5-violet)]"
                      : digit
                        ? "border-[color:var(--lv5-line)]"
                        : "border-[color:var(--lv5-line)] bg-[color:var(--lv5-canvas)]"
                  }`}
                >
                  {digit}
                </span>
              ))}
            </div>
          </div>

          <div className="w-full max-w-[216px] rounded-[26px] border border-[color:var(--lv5-line)] bg-[color:var(--lv5-surface)] p-4 shadow-[var(--lv5-shadow-manipulation)]">
            <p className="text-[0.7rem] font-semibold text-[color:var(--lv5-ink-soft)]">
              {OWNER_MOCK_FOLLOWUP.label}
            </p>
            <p className="mt-2 mb-3 text-[0.9rem] font-semibold leading-[1.35]">
              {OWNER_MOCK_FOLLOWUP.question}
            </p>
            <div className="flex flex-col gap-[7px]">
              {OWNER_MOCK_FOLLOWUP.answers.map((answer, index) => (
                <span
                  key={answer}
                  className={`rounded-[9px] border px-[11px] py-[9px] text-[0.8rem] ${
                    index === OWNER_MOCK_FOLLOWUP.selectedIndex
                      ? "border-[color:var(--lv5-green)] bg-[color:var(--lv5-green-soft)] font-semibold text-[color:var(--lv5-green-ink)]"
                      : "border-[color:var(--lv5-line)]"
                  }`}
                >
                  {answer}
                </span>
              ))}
            </div>
            <p className="mt-3 text-[0.72rem] leading-[1.45] text-[color:var(--lv5-ink-soft)]">
              {OWNER_MOCK_FOLLOWUP.note}
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd apps/marketing && bun test __tests__/landing-v5-owner.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add apps/marketing/components/landing-v5/owner.tsx apps/marketing/__tests__/landing-v5-owner.test.tsx
git commit -m "feat(landing-v5): add owner section"
```

---

## Task 12: `surfaces.tsx` — mobile + web

**Files:**
- Create: `apps/marketing/components/landing-v5/surfaces.tsx`
- Test: `apps/marketing/__tests__/landing-v5-surfaces.test.tsx`

**Interfaces:**
- Consumes: `SURFACES_TITLE`, `SURFACES_LEAD`, `SURFACES_MOBILE`, `SURFACES_WEB` from `content.ts`; `Reveal` from `motion.tsx`.
- Produces: `LandingV5Surfaces()`, server component, consumed by `index.tsx` (Task 19).

- [ ] **Step 1: Write the failing test**

```tsx
// apps/marketing/__tests__/landing-v5-surfaces.test.tsx
import { describe, expect, test } from "bun:test";

import { LandingV5Surfaces } from "../components/landing-v5/surfaces";
import { SURFACES_MOBILE, SURFACES_WEB } from "../components/landing-v5/content";
import { renderWithLandingImageConfig, textOnly } from "./landing-test-utils";

describe("landing-v5 surfaces", () => {
  test("renders both cards with their chips, mocks and perimeter lists", () => {
    const html = renderWithLandingImageConfig(<LandingV5Surfaces />);
    const text = textOnly(html);

    expect(text).toContain("Le terrain dans la poche, l'atelier au bureau.");
    expect(text).toContain(SURFACES_MOBILE.chip);
    expect(text).toContain(SURFACES_WEB.chip);
    for (const card of SURFACES_MOBILE.cards) {
      expect(text).toContain(card.label);
    }
    for (const point of [...SURFACES_MOBILE.points, ...SURFACES_WEB.points]) {
      expect(text).toContain(point);
    }
  });

  test("is a server component", async () => {
    const source = await Bun.file(
      new URL("../components/landing-v5/surfaces.tsx", import.meta.url),
    ).text();

    expect(source).not.toMatch(/^\s*"use client";/m);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd apps/marketing && bun test __tests__/landing-v5-surfaces.test.tsx`
Expected: FAIL (module not found)

- [ ] **Step 3: Write `surfaces.tsx`**

```tsx
// apps/marketing/components/landing-v5/surfaces.tsx
import { SURFACES_LEAD, SURFACES_MOBILE, SURFACES_TITLE, SURFACES_WEB } from "./content";
import { Reveal } from "./motion";

export function LandingV5Surfaces() {
  return (
    <section
      aria-labelledby="surfaces-title"
      className="relative px-[clamp(18px,4vw,34px)] py-[clamp(72px,10vw,128px)]"
    >
      <div className="mx-auto max-w-[1200px]">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <Reveal>
            <h2
              id="surfaces-title"
              className="max-w-[20ch] text-[clamp(2rem,4vw,3.6rem)] font-[650] leading-[1.02] tracking-[-0.03em] text-[color:var(--lv5-ink)]"
            >
              {SURFACES_TITLE}
            </h2>
          </Reveal>
          <Reveal delay={80}>
            <p className="max-w-[36ch] text-[1.02rem] leading-[1.65] text-[color:var(--lv5-ink-soft)] [text-wrap:pretty]">
              {SURFACES_LEAD}
            </p>
          </Reveal>
        </div>

        <div className="mt-[clamp(38px,5vw,64px)] flex flex-wrap items-stretch gap-[clamp(20px,3vw,40px)]">
          <Reveal className="flex min-w-[280px] flex-1 basis-[300px] flex-col gap-[22px] rounded-[24px] border border-[color:var(--lv5-line)] bg-[color:var(--lv5-surface)] p-[clamp(22px,2.6vw,32px)]">
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-[color:var(--lv5-violet-soft)] px-[11px] py-[5px] text-[0.72rem] font-semibold text-[color:var(--lv5-violet-ink)]">
                {SURFACES_MOBILE.chip}
              </span>
              <span className="text-[0.84rem] text-[color:var(--lv5-ink-soft)]">
                {SURFACES_MOBILE.precision}
              </span>
            </div>
            <div className="mx-auto w-full max-w-[232px] rounded-[26px] border border-[color:var(--lv5-line)] bg-[color:var(--lv5-canvas)] px-2.5 pt-3 pb-4 shadow-[var(--lv5-shadow-manipulation)]">
              <div className="mx-auto mb-3 h-1 w-[52px] rounded-full bg-[color:var(--lv5-line)]" />
              <div className="flex flex-col gap-[9px]">
                {SURFACES_MOBILE.cards.map((card) => (
                  <div
                    key={card.label}
                    className={`rounded-[10px] p-[11px] ${
                      card.tone === "violet"
                        ? "bg-[color:var(--lv5-violet-soft)]"
                        : card.tone === "green"
                          ? "flex items-center justify-between bg-[color:var(--lv5-green-soft)]"
                          : "border border-[color:var(--lv5-line)] bg-[color:var(--lv5-surface)]"
                    }`}
                  >
                    <div>
                      <p
                        className={`text-[0.7rem] font-semibold ${
                          card.tone === "violet"
                            ? "text-[color:var(--lv5-violet-ink)]"
                            : card.tone === "green"
                              ? "text-[color:var(--lv5-green-ink)]"
                              : "text-[color:var(--lv5-ink-soft)]"
                        }`}
                      >
                        {card.label}
                      </p>
                      {card.value ? (
                        <p className="mt-[5px] text-[0.84rem] font-semibold leading-[1.4]">
                          {card.value}
                        </p>
                      ) : null}
                    </div>
                    {card.tone === "green" ? (
                      <span aria-hidden="true" className="size-2 rounded-full bg-[color:var(--lv5-green)]" />
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
            <ul className="flex flex-col gap-[9px] text-[0.96rem] leading-[1.5] text-[color:var(--lv5-ink-mid)]">
              {SURFACES_MOBILE.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </Reveal>

          <Reveal
            delay={120}
            className="flex min-w-[300px] flex-1 basis-[380px] flex-col gap-[22px] rounded-[24px] border border-[color:var(--lv5-line)] bg-[color:var(--lv5-surface)] p-[clamp(22px,2.6vw,32px)]"
          >
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-[color:var(--lv5-blue-soft)] px-[11px] py-[5px] text-[0.72rem] font-semibold text-[color:var(--lv5-blue-ink)]">
                {SURFACES_WEB.chip}
              </span>
              <span className="text-[0.84rem] text-[color:var(--lv5-ink-soft)]">
                {SURFACES_WEB.precision}
              </span>
            </div>
            <div className="overflow-hidden rounded-[14px] border border-[color:var(--lv5-line)] bg-[color:var(--lv5-canvas)] shadow-[var(--lv5-shadow-manipulation)]">
              <div className="flex items-center gap-1.5 border-b border-[color:var(--lv5-line)] px-3 py-2.5">
                <span className="size-[9px] rounded-full bg-[color:var(--lv5-line)]" />
                <span className="size-[9px] rounded-full bg-[color:var(--lv5-line)]" />
                <span className="size-[9px] rounded-full bg-[color:var(--lv5-line)]" />
                <span className="ml-2 text-[0.72rem] text-[color:var(--lv5-ink-soft)]">
                  {SURFACES_WEB.windowTitle}
                </span>
              </div>
              <div className="flex gap-3 p-3.5">
                <div className="flex w-24 flex-none flex-col gap-[7px]">
                  <div className="h-[9px] w-[70%] rounded-[3px] bg-[color:var(--lv5-violet)]" />
                  <div className="h-[9px] rounded-[3px] bg-[color:var(--lv5-line)]" />
                  <div className="h-[9px] w-[80%] rounded-[3px] bg-[color:var(--lv5-line)]" />
                  <div className="h-[9px] w-[60%] rounded-[3px] bg-[color:var(--lv5-line)]" />
                </div>
                <div className="flex flex-1 flex-col gap-2 rounded-lg border border-[color:var(--lv5-line)] bg-[color:var(--lv5-surface)] p-3">
                  <div className="h-2 w-[92%] rounded-[3px] bg-[color:var(--lv5-surface-muted)]" />
                  <div className="h-2 rounded-[3px] bg-[color:var(--lv5-surface-muted)]" />
                  <div className="h-2 w-[78%] rounded-[3px] bg-[color:var(--lv5-surface-muted)]" />
                  <div className="h-2 w-[54%] rounded-[3px] bg-[color:var(--lv5-violet-soft)]" />
                  <div className="h-2 w-[86%] rounded-[3px] bg-[color:var(--lv5-surface-muted)]" />
                  <div className="h-2 w-[42%] rounded-[3px] bg-[color:var(--lv5-green-soft)]" />
                </div>
              </div>
            </div>
            <ul className="flex flex-col gap-[9px] text-[0.96rem] leading-[1.5] text-[color:var(--lv5-ink-mid)]">
              {SURFACES_WEB.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd apps/marketing && bun test __tests__/landing-v5-surfaces.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add apps/marketing/components/landing-v5/surfaces.tsx apps/marketing/__tests__/landing-v5-surfaces.test.tsx
git commit -m "feat(landing-v5): add mobile/web surfaces section"
```

---

## Task 13: `around.tsx` — « Autour du compte rendu »

**Files:**
- Create: `apps/marketing/components/landing-v5/around.tsx`
- Test: `apps/marketing/__tests__/landing-v5-around.test.tsx`

**Interfaces:**
- Consumes: `AROUND_TITLE`, `AROUND_LEAD`, `AROUND_ITEMS` from `content.ts`; `Reveal` from `motion.tsx`.
- Produces: `LandingV5Around()`, server component, consumed by `index.tsx` (Task 19).

- [ ] **Step 1: Write the failing test**

```tsx
// apps/marketing/__tests__/landing-v5-around.test.tsx
import { describe, expect, test } from "bun:test";

import { LandingV5Around } from "../components/landing-v5/around";
import { AROUND_ITEMS } from "../components/landing-v5/content";
import { renderWithLandingImageConfig, textOnly } from "./landing-test-utils";

describe("landing-v5 around", () => {
  test("renders the title and all four cards", () => {
    const html = renderWithLandingImageConfig(<LandingV5Around />);
    const text = textOnly(html);

    expect(text).toContain("Autour du compte rendu, ce qui est déjà là.");
    for (const item of AROUND_ITEMS) {
      expect(text).toContain(item.title);
      expect(text).toContain(item.body);
    }
  });

  test("is a server component", async () => {
    const source = await Bun.file(
      new URL("../components/landing-v5/around.tsx", import.meta.url),
    ).text();

    expect(source).not.toMatch(/^\s*"use client";/m);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd apps/marketing && bun test __tests__/landing-v5-around.test.tsx`
Expected: FAIL (module not found)

- [ ] **Step 3: Write `around.tsx`**

```tsx
// apps/marketing/components/landing-v5/around.tsx
import { AROUND_ITEMS, AROUND_LEAD, AROUND_TITLE } from "./content";
import { Reveal } from "./motion";

export function LandingV5Around() {
  return (
    <section
      aria-labelledby="around-title"
      className="relative px-[clamp(18px,4vw,34px)] pb-[clamp(72px,10vw,120px)]"
    >
      <div className="mx-auto max-w-[1200px] border-t border-[color:var(--lv5-line)] pt-[clamp(30px,4vw,52px)]">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <Reveal>
            <h2
              id="around-title"
              className="text-[clamp(1.5rem,2.4vw,2.1rem)] font-semibold tracking-[-0.02em] text-[color:var(--lv5-ink)]"
            >
              {AROUND_TITLE}
            </h2>
          </Reveal>
          <Reveal delay={70}>
            <p className="max-w-[34ch] text-[0.98rem] leading-[1.6] text-[color:var(--lv5-ink-soft)]">
              {AROUND_LEAD}
            </p>
          </Reveal>
        </div>

        <div className="mt-[clamp(24px,3vw,36px)] flex flex-wrap gap-[clamp(14px,2vw,22px)]">
          {AROUND_ITEMS.map((item, index) => (
            <Reveal
              key={item.title}
              delay={40 + index * 70}
              className="min-w-[200px] flex-1 basis-[210px] rounded-2xl border border-[color:var(--lv5-line)] bg-[color:var(--lv5-surface)] p-5"
            >
              <h3 className="mb-2 text-[1.06rem] font-semibold text-[color:var(--lv5-ink)]">
                {item.title}
              </h3>
              <p className="text-[0.92rem] leading-[1.55] text-[color:var(--lv5-ink-soft)]">
                {item.body}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd apps/marketing && bun test __tests__/landing-v5-around.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add apps/marketing/components/landing-v5/around.tsx apps/marketing/__tests__/landing-v5-around.test.tsx
git commit -m "feat(landing-v5): add around section"
```

---

## Task 14: `boundaries.tsx` — « Ce que Biume ne fait pas »

**Files:**
- Create: `apps/marketing/components/landing-v5/boundaries.tsx`
- Test: `apps/marketing/__tests__/landing-v5-boundaries.test.tsx`

**Interfaces:**
- Consumes: `BOUNDARIES_TITLE`, `BOUNDARIES` from `content.ts`; `Reveal` from `motion.tsx`.
- Produces: `LandingV5Boundaries()`, server component, consumed by `index.tsx` (Task 19).

- [ ] **Step 1: Write the failing test**

```tsx
// apps/marketing/__tests__/landing-v5-boundaries.test.tsx
import { describe, expect, test } from "bun:test";

import { LandingV5Boundaries } from "../components/landing-v5/boundaries";
import { BOUNDARIES } from "../components/landing-v5/content";
import { renderWithLandingImageConfig, textOnly } from "./landing-test-utils";

describe("landing-v5 boundaries", () => {
  test("renders the title and all five boundary lines", () => {
    const html = renderWithLandingImageConfig(<LandingV5Boundaries />);
    const text = textOnly(html);

    expect(text).toContain("Ce que Biume ne fait pas.");
    expect(html.match(/<li/g)).toHaveLength(5);
    for (const line of BOUNDARIES) {
      expect(text).toContain(line);
    }
  });

  test("is a server component", async () => {
    const source = await Bun.file(
      new URL("../components/landing-v5/boundaries.tsx", import.meta.url),
    ).text();

    expect(source).not.toMatch(/^\s*"use client";/m);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd apps/marketing && bun test __tests__/landing-v5-boundaries.test.tsx`
Expected: FAIL (module not found)

- [ ] **Step 3: Write `boundaries.tsx`**

```tsx
// apps/marketing/components/landing-v5/boundaries.tsx
import { BOUNDARIES, BOUNDARIES_TITLE } from "./content";
import { Reveal } from "./motion";

export function LandingV5Boundaries() {
  return (
    <section
      aria-labelledby="limites-title"
      className="relative bg-[color:var(--lv5-surface-muted)] px-[clamp(18px,4vw,34px)] py-[clamp(72px,10vw,128px)]"
    >
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-start gap-[clamp(28px,5vw,72px)]">
        <Reveal className="min-w-[280px] flex-1 basis-[300px]">
          <h2
            id="limites-title"
            className="max-w-[16ch] text-[clamp(2rem,4vw,3.6rem)] font-[650] leading-[1.02] tracking-[-0.03em] text-[color:var(--lv5-ink)]"
          >
            {BOUNDARIES_TITLE}
          </h2>
        </Reveal>
        <Reveal delay={90} className="min-w-[300px] flex-1 basis-[440px]">
          <ul className="flex flex-col">
            {BOUNDARIES.map((line, index) => (
              <li
                key={line}
                className={`border-t border-[color:var(--lv5-line)] py-[18px] text-[1.06rem] leading-[1.55] text-[color:var(--lv5-ink)] [text-wrap:pretty] ${
                  index === BOUNDARIES.length - 1 ? "border-b" : ""
                }`}
              >
                {line}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd apps/marketing && bun test __tests__/landing-v5-boundaries.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add apps/marketing/components/landing-v5/boundaries.tsx apps/marketing/__tests__/landing-v5-boundaries.test.tsx
git commit -m "feat(landing-v5): add boundaries section"
```

---

## Task 15: `pricing.tsx` — « Une formule, deux rythmes »

**Files:**
- Create: `apps/marketing/components/landing-v5/pricing.tsx`
- Test: `apps/marketing/__tests__/landing-v5-pricing.test.tsx`

**Interfaces:**
- Consumes: `DEMO_URL`, `PRICING_DEMO_CARD`, `PRICING_LEAD`, `PRICING_PLAN`, `PRICING_TITLE` from `content.ts`; `Reveal` from `motion.tsx`; `webAppPath` from `lib/web-app-url.ts`.
- Produces: `LandingV5Pricing()`, `"use client"`, default export consumed by `index.tsx` (Task 19). Real `useState<"mois" | "an">`.

- [ ] **Step 1: Write the failing test**

```tsx
// apps/marketing/__tests__/landing-v5-pricing.test.tsx
import { afterEach, describe, expect, test } from "bun:test";

import { LandingV5Pricing } from "../components/landing-v5/pricing";
import { PRICING_PLAN } from "../components/landing-v5/content";
import { webAppPath } from "../lib/web-app-url";
import { renderWithLandingImageConfig, textOnly } from "./landing-test-utils";
import { cleanup, fireEvent, render, within } from "./dom-test-utils";

afterEach(cleanup);

describe("landing-v5 pricing", () => {
  test("renders the monthly price by default with all five inclusions", () => {
    const html = renderWithLandingImageConfig(<LandingV5Pricing />);
    const text = textOnly(html);

    expect(html).toContain('id="tarifs"');
    expect(text).toContain(PRICING_PLAN.monthly.price);
    expect(text).toContain(PRICING_PLAN.monthly.note);
    for (const item of PRICING_PLAN.included) {
      expect(text).toContain(item);
    }
    expect(html).toContain(`href="${webAppPath("/signup")}"`);
    expect(html).toContain('data-conversion="pricing-signup"');
    expect(html).toContain('data-conversion="pricing-demo"');
  });

  test("switches to the annual price and note on click, updating aria-pressed", () => {
    const { container } = render(<LandingV5Pricing />);
    const pricing = within(container);
    const priceBlock = container.querySelector('[data-billing-price]');

    expect(priceBlock?.textContent).toContain(PRICING_PLAN.monthly.price);

    fireEvent.click(pricing.getByRole("button", { name: "Annuel" }));

    expect(priceBlock?.textContent).toContain(PRICING_PLAN.annual.price);
    expect(priceBlock?.textContent).toContain(PRICING_PLAN.annual.note);
    expect(pricing.getByRole("button", { name: "Annuel" }).getAttribute("aria-pressed")).toBe(
      "true",
    );
    expect(pricing.getByRole("button", { name: "Mensuel" }).getAttribute("aria-pressed")).toBe(
      "false",
    );
  });

  test("keeps the billing toggle accessible", async () => {
    const source = await Bun.file(
      new URL("../components/landing-v5/pricing.tsx", import.meta.url),
    ).text();

    expect(source.trimStart()).toMatch(/^"use client";/);
    expect(source).toContain("data-billing-selector");
    expect(source).toContain('aria-live="polite"');
    expect(source).toContain('aria-atomic="true"');
    expect(source).toContain("min-h-11");
    expect(source).toContain("prefetch={false}");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd apps/marketing && bun test __tests__/landing-v5-pricing.test.tsx`
Expected: FAIL (module not found)

- [ ] **Step 3: Write `pricing.tsx`**

```tsx
// apps/marketing/components/landing-v5/pricing.tsx
"use client";

import Link from "next/link";
import { useState } from "react";

import { DEMO_URL, PRICING_DEMO_CARD, PRICING_LEAD, PRICING_PLAN, PRICING_TITLE } from "./content";
import { webAppPath } from "../../lib/web-app-url";
import { Reveal } from "./motion";

type Billing = "mois" | "an";

export function LandingV5Pricing() {
  const [billing, setBilling] = useState<Billing>("mois");
  const plan = billing === "mois" ? PRICING_PLAN.monthly : PRICING_PLAN.annual;

  return (
    <section
      id="tarifs"
      aria-labelledby="tarifs-title"
      className="relative px-[clamp(18px,4vw,34px)] py-[clamp(72px,10vw,128px)]"
    >
      <div className="mx-auto max-w-[1200px]">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <Reveal>
            <h2
              id="tarifs-title"
              className="max-w-[18ch] text-[clamp(2rem,4vw,3.6rem)] font-[650] leading-[1.02] tracking-[-0.03em] text-[color:var(--lv5-ink)]"
            >
              {PRICING_TITLE}
            </h2>
          </Reveal>
          <Reveal delay={80}>
            <p className="max-w-[32ch] text-[1.02rem] leading-[1.65] text-[color:var(--lv5-ink-soft)]">
              {PRICING_LEAD}
            </p>
          </Reveal>
        </div>

        <div className="mt-[clamp(38px,5vw,64px)] flex flex-wrap items-stretch gap-[clamp(20px,3vw,36px)]">
          <Reveal className="flex min-w-[300px] flex-1 basis-[400px] flex-col gap-[22px] rounded-2xl border border-[color:var(--lv5-violet)] bg-[color:var(--lv5-surface)] p-[clamp(24px,3vw,38px)]">
            <div
              data-billing-selector=""
              className="inline-flex w-fit gap-1 self-start rounded-full bg-[color:var(--lv5-surface-muted)] p-1"
            >
              <button
                type="button"
                aria-pressed={billing === "mois"}
                onClick={() => setBilling("mois")}
                className={`min-h-11 rounded-full px-4 text-[0.84rem] font-semibold transition-colors duration-[350ms] ${
                  billing === "mois"
                    ? "bg-[color:var(--lv5-surface)] text-[color:var(--lv5-ink)]"
                    : "text-[color:var(--lv5-ink-soft)]"
                }`}
              >
                Mensuel
              </button>
              <button
                type="button"
                aria-pressed={billing === "an"}
                onClick={() => setBilling("an")}
                className={`min-h-11 rounded-full px-4 text-[0.84rem] font-semibold transition-colors duration-[350ms] ${
                  billing === "an"
                    ? "bg-[color:var(--lv5-surface)] text-[color:var(--lv5-ink)]"
                    : "text-[color:var(--lv5-ink-soft)]"
                }`}
              >
                Annuel
              </button>
            </div>

            <div data-billing-price="" aria-live="polite" aria-atomic="true">
              <p className="flex items-end gap-2">
                <span className="text-[clamp(2.6rem,5vw,4rem)] font-[650] leading-none tracking-[-0.035em] text-[color:var(--lv5-ink)]">
                  {plan.price}
                </span>
                <span className="pb-1.5 text-[1rem] font-medium text-[color:var(--lv5-ink-soft)]">
                  par mois
                </span>
              </p>
              <p className="mt-2.5 font-[ui-monospace,SFMono-Regular,Menlo,monospace] text-[0.75rem] font-semibold tracking-[0.02em] text-[color:var(--lv5-ink-soft)]">
                {plan.note}
              </p>
            </div>

            <ul className="flex flex-col gap-3">
              {PRICING_PLAN.included.map((item) => (
                <li key={item} className="flex gap-[11px] text-[1rem] leading-[1.5]">
                  <span
                    aria-hidden="true"
                    className="mt-[7px] size-[7px] flex-none rounded-full bg-[color:var(--lv5-green)]"
                  />
                  {item}
                </li>
              ))}
            </ul>

            <Link
              href={webAppPath("/signup")}
              prefetch={false}
              data-conversion="pricing-signup"
              className="min-h-11 inline-flex items-center justify-center rounded-full bg-[color:var(--lv5-violet)] px-[26px] text-[0.98rem] font-semibold text-white shadow-[var(--lv5-shadow-focus)]"
            >
              {PRICING_PLAN.cta}
            </Link>
            <p className="text-[0.84rem] text-[color:var(--lv5-ink-soft)]">{PRICING_PLAN.ctaNote}</p>
          </Reveal>

          <Reveal
            delay={120}
            className="flex min-w-[280px] flex-1 basis-[300px] flex-col gap-4 rounded-2xl bg-[color:var(--lv5-violet-soft)] p-[clamp(24px,3vw,38px)]"
          >
            <h3 className="text-[1.4rem] font-semibold tracking-[-0.015em] text-[color:var(--lv5-ink)]">
              {PRICING_DEMO_CARD.title}
            </h3>
            <p className="text-[1rem] leading-[1.6] text-[color:var(--lv5-ink-mid)] [text-wrap:pretty]">
              {PRICING_DEMO_CARD.body}
            </p>
            <a
              href={DEMO_URL}
              target="_blank"
              rel="noopener noreferrer"
              data-conversion="pricing-demo"
              className="min-h-11 inline-flex w-fit items-center rounded-full border border-[color:var(--lv5-line)] bg-[color:var(--lv5-surface)] px-6 text-[0.96rem] font-semibold text-[color:var(--lv5-ink)]"
            >
              {PRICING_DEMO_CARD.cta}
            </a>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd apps/marketing && bun test __tests__/landing-v5-pricing.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add apps/marketing/components/landing-v5/pricing.tsx apps/marketing/__tests__/landing-v5-pricing.test.tsx
git commit -m "feat(landing-v5): add pricing section with billing toggle"
```

---

## Task 16: `faq.tsx` + `faqJsonLd` helper

**Files:**
- Create: `apps/marketing/components/landing-v5/faq.tsx`
- Modify: `apps/marketing/lib/seo.tsx` (add `faqJsonLd`, after `pageBreadcrumbJsonLd`)
- Test: `apps/marketing/__tests__/landing-v5-faq.test.tsx`

**Interfaces:**
- Consumes: `FAQ`, `FAQ_TITLE` from `content.ts`; `Reveal` from `motion.tsx`; `Accordion`, `AccordionItem`, `AccordionTrigger`, `AccordionContent` from `@biume/ui/components/accordion`.
- Produces: `LandingV5Faq()`, server component (no client directive needed — `@base-ui/react` primitives are internally client components), consumed by `index.tsx` (Task 19). `faqJsonLd(items: readonly { q: string; a: string }[])` added to `lib/seo.tsx`, consumed by `app/page.tsx` in Task 19.

- [ ] **Step 1: Write the failing test**

```tsx
// apps/marketing/__tests__/landing-v5-faq.test.tsx
import { afterEach, describe, expect, test } from "bun:test";

import { LandingV5Faq } from "../components/landing-v5/faq";
import { FAQ } from "../components/landing-v5/content";
import { faqJsonLd } from "../lib/seo";
import { renderWithLandingImageConfig, textOnly } from "./landing-test-utils";
import { cleanup, fireEvent, render, within } from "./dom-test-utils";

afterEach(cleanup);

describe("landing-v5 faq", () => {
  test("renders all six questions and answers", () => {
    const html = renderWithLandingImageConfig(<LandingV5Faq />);
    const text = textOnly(html);

    expect(html).toContain('id="questions"');
    for (const item of FAQ) {
      expect(text).toContain(item.q);
      expect(text).toContain(item.a);
    }
  });

  test("opens an item on click, exposing it via aria-expanded", () => {
    const { container } = render(<LandingV5Faq />);
    const trigger = within(container).getByRole("button", { name: FAQ[0]!.q });

    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
  });
});

describe("faqJsonLd", () => {
  test("builds a FAQPage schema with one Question per entry", () => {
    const schema = faqJsonLd(FAQ);

    expect(schema["@type"]).toBe("FAQPage");
    expect(schema.mainEntity).toHaveLength(FAQ.length);
    expect(schema.mainEntity[0]).toEqual({
      "@type": "Question",
      name: FAQ[0]!.q,
      acceptedAnswer: { "@type": "Answer", text: FAQ[0]!.a },
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd apps/marketing && bun test __tests__/landing-v5-faq.test.tsx`
Expected: FAIL (modules not found)

- [ ] **Step 3: Add `faqJsonLd` to `lib/seo.tsx`**

Append after `pageBreadcrumbJsonLd` (end of file):

```ts
export function faqJsonLd(items: readonly { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };
}
```

- [ ] **Step 4: Write `faq.tsx`**

```tsx
// apps/marketing/components/landing-v5/faq.tsx
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@biume/ui/components/accordion";

import { FAQ, FAQ_TITLE } from "./content";
import { Reveal } from "./motion";

export function LandingV5Faq() {
  return (
    <section
      id="questions"
      aria-labelledby="faq-title"
      className="relative px-[clamp(18px,4vw,34px)] py-[clamp(72px,10vw,128px)]"
    >
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-start gap-[clamp(28px,5vw,72px)]">
        <Reveal className="min-w-[260px] max-w-[14ch] flex-1 basis-[280px]">
          <h2
            id="faq-title"
            className="text-[clamp(2rem,4vw,3.6rem)] font-[650] leading-[1.02] tracking-[-0.03em] text-[color:var(--lv5-ink)]"
          >
            {FAQ_TITLE}
          </h2>
        </Reveal>
        <Reveal delay={90} className="min-w-[300px] flex-1 basis-[480px]">
          <Accordion className="border-t border-[color:var(--lv5-line)]">
            {FAQ.map((item) => (
              <AccordionItem key={item.q} value={item.q} className="border-[color:var(--lv5-line)]">
                <AccordionTrigger className="min-h-14 text-[1.08rem] font-semibold leading-[1.35] text-[color:var(--lv5-ink)] **:data-[slot=accordion-trigger-icon]:text-[color:var(--lv5-violet)]">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent>
                  <p className="max-w-[62ch] text-[1rem] leading-[1.65] text-[color:var(--lv5-ink-soft)] [text-wrap:pretty]">
                    {item.a}
                  </p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd apps/marketing && bun test __tests__/landing-v5-faq.test.tsx`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add apps/marketing/components/landing-v5/faq.tsx apps/marketing/lib/seo.tsx apps/marketing/__tests__/landing-v5-faq.test.tsx
git commit -m "feat(landing-v5): add FAQ section with FAQPage JSON-LD"
```

---

## Task 17: `close.tsx` — clôture

**Files:**
- Create: `apps/marketing/components/landing-v5/close.tsx`
- Test: `apps/marketing/__tests__/landing-v5-close.test.tsx`

**Interfaces:**
- Consumes: `CLOSE_LEAD`, `CLOSE_TITLE`, `HERO_CTA_PRIMARY`, `TRIAL_NOTE` from `content.ts`; `Reveal` from `motion.tsx`; `webAppPath` from `lib/web-app-url.ts`.
- Produces: `LandingV5Close()`, server component, consumed by `index.tsx` (Task 19).

- [ ] **Step 1: Write the failing test**

```tsx
// apps/marketing/__tests__/landing-v5-close.test.tsx
import { describe, expect, test } from "bun:test";

import { LandingV5Close } from "../components/landing-v5/close";
import { webAppPath } from "../lib/web-app-url";
import { renderWithLandingImageConfig, textOnly } from "./landing-test-utils";

describe("landing-v5 close", () => {
  test("renders the closing title, lead, CTA and trial note", () => {
    const html = renderWithLandingImageConfig(<LandingV5Close />);
    const text = textOnly(html);

    expect(text).toContain("Votre prochaine séance peut être la première.");
    expect(text).toContain("Prenez vos notes comme d'habitude.");
    expect(text).toContain("Préparer mon premier compte rendu");
    expect(text).toContain("15 jours d'essai, sans carte bancaire");
    expect(html).toContain(`href="${webAppPath("/signup")}"`);
    expect(html).toContain('data-conversion="close-signup"');
  });

  test("is a server component", async () => {
    const source = await Bun.file(
      new URL("../components/landing-v5/close.tsx", import.meta.url),
    ).text();

    expect(source).not.toMatch(/^\s*"use client";/m);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd apps/marketing && bun test __tests__/landing-v5-close.test.tsx`
Expected: FAIL (module not found)

- [ ] **Step 3: Write `close.tsx`**

```tsx
// apps/marketing/components/landing-v5/close.tsx
import Link from "next/link";

import { CLOSE_LEAD, CLOSE_TITLE, HERO_CTA_PRIMARY, TRIAL_NOTE } from "./content";
import { webAppPath } from "../../lib/web-app-url";
import { Reveal } from "./motion";

export function LandingV5Close() {
  return (
    <section
      aria-labelledby="cloture-title"
      className="relative overflow-hidden bg-[color:var(--lv5-anthracite)] px-[clamp(18px,4vw,34px)] py-[clamp(84px,11vw,152px)] text-[#FDFDFB]"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(58% 62% at 22% 84%, rgba(107,90,200,.5) 0%, transparent 66%), radial-gradient(48% 54% at 88% 12%, rgba(93,155,184,.28) 0%, transparent 62%)",
        }}
      />
      <div className="relative mx-auto flex max-w-[1200px] flex-wrap items-end justify-between gap-[clamp(26px,4vw,60px)]">
        <div>
          <Reveal>
            <h2
              id="cloture-title"
              className="max-w-[20ch] text-[clamp(2.2rem,5vw,4.4rem)] font-[650] leading-[.98] tracking-[-0.035em]"
            >
              {CLOSE_TITLE}
            </h2>
          </Reveal>
          <Reveal delay={90}>
            <p className="mt-[22px] max-w-[44ch] text-[1.06rem] leading-[1.6] text-[#FDFDFB]/70 [text-wrap:pretty]">
              {CLOSE_LEAD}
            </p>
          </Reveal>
        </div>
        <Reveal delay={170} className="flex flex-col gap-3">
          <Link
            href={webAppPath("/signup")}
            prefetch={false}
            data-conversion="close-signup"
            className="min-h-11 inline-flex items-center justify-center rounded-full bg-[color:var(--lv5-violet)] px-7 text-[0.98rem] font-semibold text-white"
          >
            {HERO_CTA_PRIMARY}
          </Link>
          <span className="text-[0.84rem] text-[#FDFDFB]/60">{TRIAL_NOTE}</span>
        </Reveal>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd apps/marketing && bun test __tests__/landing-v5-close.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add apps/marketing/components/landing-v5/close.tsx apps/marketing/__tests__/landing-v5-close.test.tsx
git commit -m "feat(landing-v5): add close section"
```

---

## Task 18: `footer.tsx`

**Files:**
- Create: `apps/marketing/components/landing-v5/footer.tsx`
- Test: `apps/marketing/__tests__/landing-v5-footer.test.tsx`

**Interfaces:**
- Consumes: `FOOTER_COLUMNS`, `FOOTER_LINE` from `content.ts`.
- Produces: `LandingV5Footer()`, server component, consumed by `index.tsx` (Task 19).

- [ ] **Step 1: Write the failing test**

```tsx
// apps/marketing/__tests__/landing-v5-footer.test.tsx
import { describe, expect, test } from "bun:test";

import { LandingV5Footer } from "../components/landing-v5/footer";
import { FOOTER_COLUMNS, FOOTER_LINE } from "../components/landing-v5/content";
import { renderWithLandingImageConfig, textOnly } from "./landing-test-utils";

describe("landing-v5 footer", () => {
  test("renders all four columns and every link", () => {
    const html = renderWithLandingImageConfig(<LandingV5Footer />);
    const text = textOnly(html);

    expect(text).toContain("Biume");
    expect(text).toContain(FOOTER_LINE);
    for (const column of FOOTER_COLUMNS) {
      expect(text).toContain(column.title);
      for (const link of column.links) {
        expect(text).toContain(link.label);
        expect(html).toContain(`href="${link.href}"`);
      }
    }
  });

  test("is a server component", async () => {
    const source = await Bun.file(
      new URL("../components/landing-v5/footer.tsx", import.meta.url),
    ).text();

    expect(source).not.toMatch(/^\s*"use client";/m);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd apps/marketing && bun test __tests__/landing-v5-footer.test.tsx`
Expected: FAIL (module not found)

- [ ] **Step 3: Write `footer.tsx`**

```tsx
// apps/marketing/components/landing-v5/footer.tsx
import Image from "next/image";
import Link from "next/link";

import { FOOTER_COLUMNS, FOOTER_LINE } from "./content";

export function LandingV5Footer() {
  return (
    <footer className="border-t border-[#FDFDFB]/10 bg-[color:var(--lv5-anthracite)] px-[clamp(18px,4vw,34px)] py-[clamp(40px,5vw,64px)] text-[#FDFDFB]/60">
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-start gap-7">
        <div className="flex items-center gap-2 text-[1.1rem] font-semibold tracking-[-0.02em] text-[#FDFDFB]">
          <Image
            src="/brand/biume-logo.svg"
            alt=""
            width={26}
            height={26}
            className="size-[26px] rounded-[7px]"
          />
          Biume
        </div>

        <nav
          aria-label="Pied de page"
          className="flex flex-wrap gap-[clamp(24px,4vw,64px)] text-[0.9rem]"
        >
          {FOOTER_COLUMNS.map((column) => (
            <div key={column.title} className="flex min-w-[150px] flex-col gap-2.5">
              <span className="text-[0.72rem] font-semibold tracking-[0.08em] text-[#FDFDFB]/40 uppercase">
                {column.title}
              </span>
              {column.links.map((link) => (
                <Link key={link.href} href={link.href} className="min-h-11 flex items-center text-[#FDFDFB]/62">
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        <p className="basis-full border-t border-[#FDFDFB]/10 pt-[26px] text-[0.8rem]">
          {FOOTER_LINE}
        </p>
      </div>
    </footer>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd apps/marketing && bun test __tests__/landing-v5-footer.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add apps/marketing/components/landing-v5/footer.tsx apps/marketing/__tests__/landing-v5-footer.test.tsx
git commit -m "feat(landing-v5): add footer"
```

---

## Task 19: `index.tsx` assembly + mount at `/`

**Files:**
- Create: `apps/marketing/components/landing-v5/index.tsx`
- Modify: `apps/marketing/app/page.tsx`
- Test: `apps/marketing/__tests__/landing-v5-integration.test.tsx`

**Interfaces:**
- Consumes: every component from Tasks 3–18, `landingV5FontVariables` from `fonts.ts`, `PRACTICE_PLATE`/`OWNER_PLATE`/`FAQ` from `content.ts`, `faqJsonLd`/`JsonLd`/`siteName`/`siteUrl` from `lib/seo.tsx`.
- Produces: `LandingV5()` default export, mounted by `app/page.tsx` in place of `<V2Landing />`.

- [ ] **Step 1: Write the failing test**

```tsx
// apps/marketing/__tests__/landing-v5-integration.test.tsx
import { describe, expect, test } from "bun:test";

import { LandingV5 } from "../components/landing-v5";
import { renderWithLandingImageConfig } from "./landing-test-utils";

describe("landing-v5 integration", () => {
  test("mounts every section in the parcours order with a single h1", () => {
    const html = renderWithLandingImageConfig(<LandingV5 />);

    expect(html).toContain('<main id="contenu" tabindex="-1"');
    expect(html.match(/<h1\b/g)).toHaveLength(1);

    const order = [
      'id="hero-title"',
      'id="constat-title"',
      'id="produit"',
      'aria-label="Le geste"',
      'id="controle"',
      'aria-label="Le propriétaire"',
      'id="suivi"',
      'id="proprietaire"',
      'id="surfaces-title"',
      'id="around-title"',
      'id="limites-title"',
      'id="tarifs"',
      'id="questions"',
      'id="cloture-title"',
    ];
    const positions = order.map((marker) => html.indexOf(marker));

    for (const position of positions) {
      expect(position).toBeGreaterThanOrEqual(0);
    }
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
  });

  test("app/page.tsx mounts LandingV5 with Service and FAQPage JSON-LD", async () => {
    const page = await Bun.file(new URL("../app/page.tsx", import.meta.url)).text();

    expect(page).toContain('import { LandingV5 } from "../components/landing-v5"');
    expect(page).not.toContain("V2Landing");
    expect(page).toContain("faqJsonLd(FAQ)");
    expect(page).toMatch(/<JsonLd[\s\S]*<JsonLd[\s\S]*<LandingV5/);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd apps/marketing && bun test __tests__/landing-v5-integration.test.tsx`
Expected: FAIL (module not found / page.tsx still mounts V2Landing)

- [ ] **Step 3: Write `index.tsx`**

```tsx
// apps/marketing/components/landing-v5/index.tsx
import "./landing-v5.css";

import { LandingV5Around } from "./around";
import { LandingV5Boundaries } from "./boundaries";
import { LandingV5Close } from "./close";
import { LandingV5Control } from "./control";
import { OWNER_PLATE, PRACTICE_PLATE } from "./content";
import { LandingV5Facts } from "./facts";
import { LandingV5Faq } from "./faq";
import { landingV5FontVariables } from "./fonts";
import { LandingV5FollowUp } from "./follow-up";
import { LandingV5Footer } from "./footer";
import { LandingV5Hero } from "./hero";
import { LandingV5Masthead } from "./masthead";
import { LandingV5MotionRoot } from "./motion";
import { LandingV5Owner } from "./owner";
import { PhotoPlate } from "./photo-plate";
import { LandingV5Pricing } from "./pricing";
import { LandingV5Specimen } from "./specimen";
import { LandingV5Surfaces } from "./surfaces";

export function LandingV5() {
  return (
    <LandingV5MotionRoot>
      <div className={`landing-v5 ${landingV5FontVariables} min-h-screen antialiased`}>
        <LandingV5Masthead />
        <main id="contenu" tabIndex={-1}>
          <LandingV5Hero />
          <LandingV5Facts />
          <LandingV5Specimen />
          <PhotoPlate
            ariaLabel="Le geste"
            tone="dark"
            heightClass="min-h-[min(74svh,620px)]"
            {...PRACTICE_PLATE}
          />
          <LandingV5Control />
          <PhotoPlate
            ariaLabel="Le propriétaire"
            tone="light"
            heightClass="min-h-[min(70svh,580px)]"
            {...OWNER_PLATE}
          />
          <LandingV5FollowUp />
          <LandingV5Owner />
          <LandingV5Surfaces />
          <LandingV5Around />
          <LandingV5Boundaries />
          <LandingV5Pricing />
          <LandingV5Faq />
          <LandingV5Close />
        </main>
        <LandingV5Footer />
      </div>
    </LandingV5MotionRoot>
  );
}
```

- [ ] **Step 4: Modify `app/page.tsx`**

```tsx
// apps/marketing/app/page.tsx
import { LandingV5 } from "../components/landing-v5";
import { FAQ } from "../components/landing-v5/content";
import { JsonLd, faqJsonLd, siteName, siteUrl } from "../lib/seo";

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
    <>
      <JsonLd data={serviceSchema} />
      <JsonLd data={faqJsonLd(FAQ)} />
      <LandingV5 />
    </>
  );
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd apps/marketing && bun test __tests__/landing-v5-integration.test.tsx`
Expected: PASS

- [ ] **Step 6: Sanity-check the sitemap is unaffected**

Run: `cd apps/marketing && bun test __tests__/seo.test.tsx`
Expected: sitemap/robots assertions still PASS (they only enumerate routes, not in-page anchors); other assertions in this file are addressed in Task 20.

- [ ] **Step 7: Commit**

```bash
git add apps/marketing/components/landing-v5/index.tsx apps/marketing/app/page.tsx apps/marketing/__tests__/landing-v5-integration.test.tsx
git commit -m "feat(landing-v5): assemble the page and mount it at /"
```

---

## Task 20: Update existing tests that locked V2 as the homepage

Reading the four candidate files against the actual mounted-page swap shows the impact is narrower than the design doc estimated — only fix what's actually broken:

- **`landing-motion.test.tsx`** imports `V2Manifesto`, `V2Atelier`, `V2Control`, `V2Pricing`, `V2Close`, `components/v2/masthead.tsx`, `components/v2/atelier-sequence.ts` **directly from their own paths**, never through `app/page.tsx`. `components/v2` is untouched by this plan and stays mounted at `/v2`. **No change needed** — verified in Step 1 below, not modified.
- **`landing-foundation.test.tsx`** has one test that asserts `app/page.tsx` imports `V2Landing` (now false) and two tests that assert `v2.css`/`components/v2/fonts.ts` content (still true, `components/v2` untouched). Only the first test is removed.
- **`home-landing.test.tsx`** is entirely about `HomePage` (`app/page.tsx`) composition — every one of its first 6 tests needs a landing-v5 equivalent. Its last 2 tests (superseded-UI/Carnet cleanup, Tailwind `@source` scoping) test invariants unrelated to which landing is mounted and stay unchanged.
- **`seo.test.tsx`**'s only `HomePage`-related test ("home schema avoids software app and merchant listing markup") asserts schema shape, not section ids or v2-specific markup — it stays valid unchanged. But its `mock.module("next/font/google", ...)` at the top does **not** stub `Hanken_Grotesk`, and `HomePage` now transitively imports `landing-v5/fonts.ts`, which calls `Hanken_Grotesk(...)` — importing `../app/page` in this file would throw. The mock must gain a `Hanken_Grotesk` stub.

**Files:**
- Modify: `apps/marketing/__tests__/landing-foundation.test.tsx`
- Modify: `apps/marketing/__tests__/home-landing.test.tsx`
- Modify: `apps/marketing/__tests__/seo.test.tsx`
- Verify unchanged: `apps/marketing/__tests__/landing-motion.test.tsx`

- [ ] **Step 1: Confirm `landing-motion.test.tsx` needs no change**

Run: `cd apps/marketing && bun test __tests__/landing-motion.test.tsx`
Expected: PASS, unmodified (it only imports from `components/v2/*` directly).

- [ ] **Step 2: Remove the outdated mounting test from `landing-foundation.test.tsx`**

Edit `apps/marketing/__tests__/landing-foundation.test.tsx`:

Replace:
```tsx
describe("V2 landing foundation", () => {
  test("integrates the V2 composition around the homepage structure", async () => {
    const page = await Bun.file(new URL("../app/page.tsx", import.meta.url)).text();

    expect(page).toContain('import { V2Landing } from "../components/v2/v2-landing"');
    expect(page).toMatch(/<JsonLd[\s\S]*<V2Landing/);
    expect(page).not.toContain("carnet-theme");
  });

  test("keeps the V2 tokens untouched and locks the motion decisions", async () => {
```

With:
```tsx
describe("V2 component foundation", () => {
  test("keeps the V2 tokens untouched and locks the motion decisions", async () => {
```

(The mounting assertion this test performed — `app/page.tsx` importing the current homepage component — is now covered by `landing-v5-integration.test.tsx` from Task 19. The two remaining tests in this file are unchanged: `components/v2` is not touched by this plan.)

- [ ] **Step 3: Run test to verify it still passes**

Run: `cd apps/marketing && bun test __tests__/landing-foundation.test.tsx`
Expected: PASS (2 tests, both about `components/v2`'s own files)

- [ ] **Step 4: Add the missing font stub to `seo.test.tsx`**

Edit `apps/marketing/__tests__/seo.test.tsx`:

Replace:
```tsx
mock.module("next/font/google", () => ({
  Geist: () => ({ variable: "font-geist-sans" }),
  Geist_Mono: () => ({ variable: "font-geist-mono" }),
  Manrope: () => ({ variable: "font-manrope" }),
  Newsreader: () => ({ variable: "font-newsreader" }),
}));
```

With:
```tsx
mock.module("next/font/google", () => ({
  Geist: () => ({ variable: "font-geist-sans" }),
  Geist_Mono: () => ({ variable: "font-geist-mono" }),
  Manrope: () => ({ variable: "font-manrope" }),
  Newsreader: () => ({ variable: "font-newsreader" }),
  Hanken_Grotesk: () => ({ variable: "font-landing-v5-sans" }),
}));
```

- [ ] **Step 5: Run test to verify it still passes**

Run: `cd apps/marketing && bun test __tests__/seo.test.tsx`
Expected: PASS (importing `../app/page` no longer throws; the "home schema" test's assertions were already valid for landing-v5 unchanged)

- [ ] **Step 6: Rewrite `home-landing.test.tsx` for the landing-v5 composition**

Replace the entire file:

```tsx
// apps/marketing/__tests__/home-landing.test.tsx
import { describe, expect, mock, test } from "bun:test";

import {
  CLOSE_TITLE,
  CONTROL_LEAD,
  CONTROL_TITLE,
  FAQ,
  FOLLOW_UP_TITLE,
  HERO_TITLE,
  SPECIMEN_NOTE,
} from "../components/landing-v5/content";
import { webAppPath } from "../lib/web-app-url";
import {
  conversionAnchors,
  renderWithLandingImageConfig,
  textOnly,
} from "./landing-test-utils";

mock.module("next/font/google", () => ({
  Hanken_Grotesk: () => ({ variable: "font-hanken" }),
  Geist: () => ({ variable: "font-v2-sans" }),
  Geist_Mono: () => ({ variable: "font-v2-mono" }),
}));

const { default: HomePage } = await import("../app/page");

function getJsonLdSchemas(html: string) {
  return [
    ...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g),
  ].map(([, json]) => JSON.parse(json ?? "{}") as Record<string, unknown>);
}

describe("Biume homepage (landing-v5)", () => {
  test("uses the landing-v5 composition for the approved homepage story", () => {
    const html = renderWithLandingImageConfig(<HomePage />);
    const markers = ["produit", "controle", "suivi", "proprietaire", "tarifs", "questions"];

    expect(html).toContain('class="landing-v5 ');
    for (const marker of markers) {
      expect(html.match(new RegExp(`id="${marker}"`, "g"))).toHaveLength(1);
    }
  });

  test("renders the complete factual story, prices, FAQ and final conversions", () => {
    const html = renderWithLandingImageConfig(<HomePage />);
    const text = textOnly(html);

    expect(text).toContain(HERO_TITLE);
    expect(text).toContain(SPECIMEN_NOTE);
    expect(text).toContain(CONTROL_TITLE);
    expect(text).toContain(CONTROL_LEAD);
    expect(text).toContain(FOLLOW_UP_TITLE);
    expect(html).toContain("atelier-practice.webp");
    expect(html).toContain("atelier-owner.webp");
    expect(html).toContain("24,99 €");
    expect(html).toContain("29,99 €");
    expect(html.match(/data-slot="accordion-item"/g)).toHaveLength(FAQ.length);
    expect(text).toContain(CLOSE_TITLE);

    const finalSignup = conversionAnchors(html, "close-signup");
    expect(finalSignup).toHaveLength(1);
    expect(finalSignup[0]).toContain(`href="${webAppPath("/signup")}"`);
  });

  test("keeps homepage ids unique and every navigation anchor live", () => {
    const html = renderWithLandingImageConfig(<HomePage />);
    const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]!);
    const navigationTargets = [...html.matchAll(/\shref="#([^"]+)"/g)].map(
      (match) => match[1]!,
    );

    expect(new Set(ids).size).toBe(ids.length);
    for (const target of ["produit", "suivi", "proprietaire", "tarifs", "questions"]) {
      expect(navigationTargets).toContain(target);
    }
    for (const target of new Set(navigationTargets)) {
      expect(ids.filter((id) => id === target)).toHaveLength(1);
    }
  });

  test("puts a keyboard-visible skip link before navigation with a focusable target", () => {
    const html = renderWithLandingImageConfig(<HomePage />);
    const firstAnchor = html.match(/<a\b[^>]*>/)?.[0];
    const skipLinkIndex = html.indexOf('href="#contenu"');
    const navigationIndex = html.indexOf('aria-label="Navigation principale"');
    const mainTarget = html.match(/<main\b[^>]*id="contenu"[^>]*>/)?.[0];

    expect(firstAnchor).toContain('href="#contenu"');
    expect(firstAnchor).toContain("sr-only");
    expect(firstAnchor).toContain("focus:not-sr-only");
    expect(firstAnchor).toContain("focus:bg-[color:var(--lv5-violet)]");
    expect(skipLinkIndex).toBeGreaterThanOrEqual(0);
    expect(navigationIndex).toBeGreaterThan(skipLinkIndex);
    expect(mainTarget).toBeDefined();
    expect(mainTarget).toContain('tabindex="-1"');
  });

  test("never promises an elapsed time and never invents social proof", () => {
    const html = renderWithLandingImageConfig(<HomePage />);
    const normalized = textOnly(html).toLowerCase();

    expect(normalized).not.toMatch(/moins de cinq minutes/);
    expect(normalized).not.toMatch(/témoignage|avis client|utilisateurs actifs/);
    expect(html).not.toContain("carnet-theme");
  });

  test("keeps the unchanged factual Service schema and adds the FAQPage schema", () => {
    const html = renderWithLandingImageConfig(<HomePage />);
    const schemas = getJsonLdSchemas(html);
    const service = schemas.find((schema) => schema["@type"] === "Service");
    const faqPage = schemas.find((schema) => schema["@type"] === "FAQPage");

    expect(service).toEqual({
      "@context": "https://schema.org",
      "@type": "Service",
      name: "Biume",
      url: "https://biume.com",
      description:
        "Logiciel de compte rendu propriétaire et de suivi post-séance pour ostéopathes animaliers.",
      provider: {
        "@type": "Organization",
        name: "Biume",
        url: "https://biume.com",
      },
      areaServed: "FR",
    });
    expect(
      schemas.some((schema) => schema["@type"] === "SoftwareApplication"),
    ).toBe(false);
    expect(faqPage).toBeDefined();
    expect((faqPage?.mainEntity as unknown[] | undefined)?.length).toBe(FAQ.length);
  });

  test("removes the superseded proof and temporary Carnet compatibility layer", async () => {
    const removedComponent = ["product", "proof"].join("-");
    const removedExport = ["Product", "Proof"].join("");
    const [pageSource, css, productProofExists, productProofTestExists] =
      await Promise.all([
        Bun.file(new URL("../app/page.tsx", import.meta.url)).text(),
        Bun.file(new URL("../app/globals.css", import.meta.url)).text(),
        Bun.file(
          new URL(
            `../components/landing/${removedComponent}.tsx`,
            import.meta.url,
          ),
        ).exists(),
        Bun.file(
          new URL(`./${removedComponent}.test.tsx`, import.meta.url),
        ).exists(),
      ]);

    expect(pageSource).not.toContain(removedExport);
    expect(pageSource).not.toContain(removedComponent);
    expect(productProofExists).toBe(false);
    expect(productProofTestExists).toBe(false);
    expect(css).not.toMatch(/--carnet-|\.carnet-action/);
  });

  test("keeps scoped Tailwind discovery and inline route CSS", async () => {
    const [sharedCss, marketingCss, webCss, config] = await Promise.all([
      Bun.file(
        new URL("../../../packages/ui/src/styles/globals.css", import.meta.url),
      ).text(),
      Bun.file(new URL("../app/globals.css", import.meta.url)).text(),
      Bun.file(new URL("../../web/src/styles.css", import.meta.url)).text(),
      Bun.file(new URL("../next.config.ts", import.meta.url)).text(),
    ]);

    expect(sharedCss).toContain('@import "tailwindcss" source(none)');
    expect(marketingCss).toContain('@source "../**/*.{ts,tsx,mdx}"');
    expect(webCss).toContain('@source "./**/*.{ts,tsx}"');
    expect(config).toContain("inlineCss: true");
  });
});
```

- [ ] **Step 7: Run test to verify it passes**

Run: `cd apps/marketing && bun test __tests__/home-landing.test.tsx`
Expected: PASS

- [ ] **Step 8: Commit**

```bash
git add apps/marketing/__tests__/landing-foundation.test.tsx apps/marketing/__tests__/home-landing.test.tsx apps/marketing/__tests__/seo.test.tsx
git commit -m "test: point homepage-locking tests at landing-v5"
```

---

## Task 21: Full verification pass

**Files:** none (verification only).

- [ ] **Step 1: Run the full marketing test suite**

Run: `cd apps/marketing && bun test`
Expected: All tests PASS, including every `landing-v5-*.test.tsx` file from Tasks 1–20 and every pre-existing test file (`landing-motion.test.tsx` unmodified and green, `mobile-menu.test.ts`, `pricing-manifest.test.tsx`, etc. untouched and green).

- [ ] **Step 2: Typecheck**

Run: `cd apps/marketing && bunx tsc --noEmit`
Expected: no errors. Pay particular attention to `photo-plate.tsx`'s spread props (`{...PRACTICE_PLATE}` / `{...OWNER_PLATE}`) matching its prop types exactly, and to `CONTROL_PASSAGES`/`SPECIMEN_STEPS` `as const` tuples flowing correctly into `.map()` callbacks.

- [ ] **Step 3: Lint**

Run: `cd apps/marketing && bun run lint`
Expected: no errors.

- [ ] **Step 4: Production build**

Run: `cd apps/marketing && bun run build`
Expected: build succeeds; `/` prerenders using `LandingV5`; no console warnings about `next/image` `fill` usage missing a positioned parent (watch `hero.tsx` and `photo-plate.tsx` specifically — Task 5/7 already wrap `fill` images in a `relative h-full w-full` div, confirm it survived unchanged).

- [ ] **Step 5: Manual smoke check**

Run: `cd apps/marketing && bun dev`, open `http://localhost:3000/`. Verify against `docs/superpowers/specs/assets/landing-v5-handoff/landing-biume.dc.html` (open that file directly in a browser as the visual reference): masthead scroll transition, hero parallax, demo scrubber (scroll through all 4 steps), control passage validation unlocking the send button, pricing monthly/annual toggle, FAQ accordion open/close, mobile menu at a narrow viewport (< 900px), footer links. Confirm `/v2` still renders unaffected.

- [ ] **Step 6: Final commit (if any fixes were needed in Steps 1–5)**

```bash
git add -A
git commit -m "fix(landing-v5): address verification pass findings"
```

(Skip this step if Steps 1–5 required no changes.)
