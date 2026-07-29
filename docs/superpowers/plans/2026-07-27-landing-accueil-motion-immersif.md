# Landing d'accueil — motion immersif GSAP — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Faire entrer le manifeste de `/v3` et l'atelier de `/v2` dans la landing de production `/`, recomposés dans sa direction artistique, et hisser tout le mouvement de la page au niveau de ces deux gestes.

**Architecture :** Un seul moteur d'animation (GSAP) et un seul observateur du défilement (ScrollTrigger, alimenté par Lenis) pour tout l'arbre `components/v2`. Chaque section rend son **état final complet** côté serveur ; le mouvement ne fait que le révéler, jamais l'inverse. Les gestes lourds — pinning, Flip — ne se montent qu'au-dessus de 1024px, via `gsap.matchMedia` sur la **largeur** uniquement.

**Tech Stack :** Next.js App Router, React 19, TypeScript, Tailwind v4, GSAP 3.15 (`ScrollTrigger`, `SplitText`, `Flip`, `DrawSVGPlugin`, `@gsap/react`), Lenis 1.3, tests `bun test` + `react-dom/server` + JSDOM.

**Spec :** `docs/superpowers/specs/2026-07-27-landing-accueil-motion-immersif-design.md`

## Global Constraints

- **`app/v2/v2.css` ne doit JAMAIS être modifié.** Il porte le namespace `.v2` posé sur `<body>` par `app/layout.tsx` et sert les 20+ pages SEO via `components/marketing-page.tsx`. Tout style nouveau va dans `components/v2/landing.css`.
- **`prefers-reduced-motion` est écarté**, sur demande explicite et répétée de Mathieu. Aucune garde `(prefers-reduced-motion: ...)` dans `components/v2`, ni en JS ni en CSS. **Ne pas la réintroduire.**
- **Aucun état de départ en CSS.** Les `autoAlpha: 0` et décalages initiaux sont posés par `gsap.set` dans `useGSAP` (qui s'exécute dans un `useLayoutEffect`, donc avant la première peinture). Sans JavaScript, la page doit s'afficher **complète et lisible** — `/` est indexée.
- **Un seul moteur d'animation sous `components/v2`.** Aucun import de `motion` / `motion/react`. Le paquet reste installé pour `/v2`, `/v3`, `/v4`.
- **Un seul observateur du défilement.** Aucun `window.addEventListener("scroll", …)` sous `components/v2`.
- **Rôles de couleur de marque, non négociables :** violet `#6b5ac8` (`--v2-violet-ink`) décide, vert `hsl(148 71% 45%)` (`--v2-green`) confirme. La DA de `/` ne comporte pas de bleu — le rail de l'atelier est donc **violet**, et le sceau final **vert**.
- **Aucune preuve inventée.** Ni témoignage, ni chiffre d'usage, ni logo partenaire, ni pourcentage, ni note sur 5. La seule démonstration autorisée est `REPORT_TRANSFORMATION_DEMO`.
- **Copie interdite :** le mot « automatique » ne doit apparaître qu'une seule fois sur la page, dans « Rien n'est partagé automatiquement ». `__tests__/home-landing.test.tsx` l'assert.
- Découpage `SplitText` par **mots** ou par **lignes**, jamais par caractères.

### État de départ des tests

`bun test` à la racine du dépôt donne aujourd'hui **101 pass / 3 fail**. Les 3 échecs sont **pré-existants et étrangers à ce travail** : `components/prototypes/after-dark-orbit-motion.test.tsx` référence un fichier `after-dark-orbit-motion.tsx` qui n'existe pas. Ne pas les corriger, ne pas les compter comme des régressions. Toute autre défaillance est causée par ce plan.

Les suites qui couvrent `components/landing/*` (`transformation-workshop`, `practitioner-control`, `field-stories`, `landing-hero`, `landing-close`) testent un jeu de composants **hérité, distinct de `components/v2`**. Elles ne doivent pas bouger. Seuls `landing-foundation.test.tsx` et `home-landing.test.tsx` (qui rend `app/page.tsx`) couvrent l'arbre touché.

---

## Structure des fichiers

| Fichier | Responsabilité |
|---|---|
| `components/v2/reveal.tsx` | *réécrit* — `V2MotionRoot` (Lenis + ScrollTrigger + volée d'entrées + ancres), `Reveal`, `HeroReveal`, `HeroItem`, `Drift`, `CutLines` |
| `components/v2/manifesto.tsx` | *nouveau* — `V2Manifesto` : le texte qui se colore au scroll |
| `components/v2/atelier.tsx` | *nouveau* — `V2Atelier` : le balisage de la démonstration, rendu complet au repos |
| `components/v2/atelier-sequence.ts` | *nouveau* — `useAtelierSequence` : la mécanique GSAP (4 temps, Flip, DrawSVG, snap) |
| `components/v2/landing.css` | *nouveau* — styles des deux sections nouvelles + tokens locaux |
| `components/v2/sections.tsx` | *modifié* — `V2Features` retirée, `V2Control` recomposée, sections instrumentées |
| `components/v2/masthead.tsx` | *modifié* — contraction pilotée par ScrollTrigger |
| `components/v2/v2-landing.tsx` | *modifié* — composition et import de `landing.css` |
| `__tests__/landing-foundation.test.tsx` | *modifié* — verrouille les décisions de motion |
| `__tests__/landing-motion.test.tsx` | *nouveau* — verrouille la complétude SSR des sections nouvelles |

La séparation `atelier.tsx` / `atelier-sequence.ts` est le point important : le balisage rend l'état final et ne connaît rien du mouvement, la mécanique va chercher les nœuds par attributs de données. La règle « sans JavaScript la page est complète » devient structurelle au lieu d'être une discipline.

---

## Task 1 : Le socle de motion — Lenis, ancres, fin du reduced-motion

**Files:**
- Modify: `apps/marketing/components/v2/reveal.tsx` (réécriture complète)
- Test: `apps/marketing/__tests__/landing-foundation.test.tsx:12-33` (réécriture du second test)

**Interfaces:**
- Consomme : rien.
- Produit : `V2MotionRoot({ children })`, `Reveal({ children, className })`, `HeroReveal({ children, className })`, `HeroItem({ children, className })`, `Drift({ distance?, className, children })`, `CutLines({ as?, className, children })`. Les tâches suivantes s'appuient sur `Reveal` et `CutLines`, et sur la convention d'attributs `data-reveal` / `data-hero-item`.

- [ ] **Step 1 : Réécrire le test qui verrouille les décisions de motion**

Remplacer intégralement le second test de `apps/marketing/__tests__/landing-foundation.test.tsx` (actuellement `"defines V2 semantic colors, restrained radii and reduced motion"`, lignes 12 à 33) par :

```tsx
  test("keeps the V2 tokens untouched and locks the motion decisions", async () => {
    const [css, motion] = await Promise.all([
      Bun.file(new URL("../app/v2/v2.css", import.meta.url)).text(),
      Bun.file(new URL("../components/v2/reveal.tsx", import.meta.url)).text(),
    ]);

    // La feuille du namespace `.v2` sert aussi les pages SEO : elle ne
    // bouge pas.
    expect(css).toMatch(/--v2-violet-ink:\s*#6b5ac8;/i);
    expect(css).toMatch(/--v2-green:\s*hsl\(148 71% 45%\);/i);
    expect(css).toMatch(/--v2-canvas:\s*#f7f6f2;/i);
    expect(css).toMatch(/border-radius:\s*24px;/);
    expect(css).not.toContain("background-clip: text");
    expect(css).not.toContain("repeating-linear-gradient");

    // `prefers-reduced-motion` est écarté sur demande explicite de
    // Mathieu, deux fois : une première sur /v4, reconduite ici après que
    // la conséquence a été signalée. Le test verrouille la décision ET sa
    // trace écrite, pour qu'une réintroduction distraite échoue.
    expect(motion).not.toContain("prefers-reduced-motion");
    expect(motion).toContain("écarté");

    // Un seul moteur d'animation dans cet arbre.
    expect(motion).not.toMatch(/from\s+["']motion\/react["']/);

    // Un seul observateur du défilement : celui de ScrollTrigger,
    // alimenté par Lenis.
    expect(motion).toContain('lenis.on("scroll", ScrollTrigger.update)');
    expect(motion).toContain("gsap.ticker.add");
    expect(motion).toContain("lagSmoothing(0)");
    expect(motion).not.toMatch(/window\.addEventListener\(\s*["']scroll/);

    // Les états de départ sont posés en JS, jamais en CSS : sans script,
    // la page reste complète. `/` est indexée.
    expect(motion).toContain("gsap.set");
  });
```

- [ ] **Step 2 : Lancer le test et vérifier qu'il échoue**

```bash
cd apps/marketing && bun test __tests__/landing-foundation.test.tsx
```

Attendu : ÉCHEC sur `expect(motion).not.toContain("prefers-reduced-motion")` — le fichier actuel contient encore `MOTION_OK`.

- [ ] **Step 3 : Réécrire `components/v2/reveal.tsx`**

Remplacer intégralement le contenu du fichier par :

```tsx
"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";
import { useEffect, useRef, type ElementType, type ReactNode } from "react";

/**
 * Scope de motion de la landing d'accueil.
 *
 * Un seul moteur par arbre : deux bibliothèques qui écrivent la même
 * propriété transformée sur un même nœud se remplacent l'une l'autre à
 * chaque frame. Tout passe donc par GSAP ici — plus de `motion/react`.
 *
 * `prefers-reduced-motion` est délibérément **écarté** de cette landing,
 * sur demande explicite et répétée, après que la conséquence a été
 * signalée : les personnes sujettes au mal des transports subiront la
 * page en plein mouvement. Ne pas réintroduire la garde sans redemander.
 *
 * Ce qui reste, et qui n'est pas du reduced-motion mais de la
 * robustesse : aucun état de départ n'est posé en CSS. Si le script
 * échoue, la page est complète et lisible — `/` est indexée.
 */

/**
 * `registerPlugin` touche `requestAnimationFrame` dès l'appel. Le faire
 * au chargement du module casserait le rendu serveur, et tout
 * environnement DOM partiel avec lui. L'enregistrement se fait donc à la
 * première exécution d'un effet, qui ne tourne que dans un vrai
 * navigateur. Idempotent, appelé en tête de chaque `useGSAP`.
 */
let pluginsReady = false;

export function ensureGsapPlugins() {
  if (pluginsReady) return;
  gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);
  pluginsReady = true;
}

/** L'ease de la maison : sortie franche, pose longue. */
export const EASE = "power3.out";

/** Au-dessus, les gestes lourds — pinning, Flip. En dessous, le même
 *  récit sans capture du scroll. */
export const WIDE = "(min-width: 1024px)";

/** Hauteur du masthead, retranchée quand une ancre est visée. */
const ANCHOR_OFFSET = -88;

export function V2MotionRoot({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    ensureGsapPlugins();

    // Lenis anime le scroll natif de la fenêtre plutôt que de translater
    // un conteneur : `position: sticky` et le pinning de ScrollTrigger
    // restent intacts. ScrollSmoother ferait l'inverse.
    const lenis = new Lenis({
      duration: 1.1,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      // Le tactile garde son inertie système : la surcharger donne une
      // sensation de latence sur mobile, jamais de douceur.
      touchMultiplier: 1.6,
    });

    // Sans cet accrochage, les deux horloges dérivent et les
    // déclenchements arrivent avec un cran de retard.
    lenis.on("scroll", ScrollTrigger.update);

    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // Les ancres passent par Lenis : un saut natif entrerait en conflit
    // avec l'amortissement et la page tremblerait en fin de course.
    // `scroll-mt-*` ne s'applique pas non plus, d'où l'offset explicite.
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
      // Le lien d'évitement doit déplacer le focus, pas seulement la vue.
      target.focus({ preventScroll: true });
    };

    document.addEventListener("click", onAnchorClick);

    return () => {
      document.removeEventListener("click", onAnchorClick);
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, []);

  useGSAP(
    () => {
      ensureGsapPlugins();

      // Le hero orchestre sa propre ouverture : l'exclure, sinon deux
      // animations écriraient la même opacité sur les mêmes nœuds.
      const selector = "[data-reveal]:not([data-hero-item])";
      gsap.set(selector, { autoAlpha: 0, y: 24 });

      // Une volée rassemble tout ce qui franchit le seuil dans le même
      // intervalle et le libère en cascade. Une entrée isolée n'a pas de
      // rythme ; un groupe en a un.
      ScrollTrigger.batch(selector, {
        start: "top 88%",
        once: true,
        onEnter: (batch) =>
          gsap.to(batch, {
            autoAlpha: 1,
            y: 0,
            duration: 1,
            ease: EASE,
            stagger: { each: 0.08, from: "start" },
            overwrite: "auto",
          }),
      });
    },
    { scope: root },
  );

  return <div ref={root}>{children}</div>;
}

/** Reveal d'entrée simple, joué par la volée posée à la racine. */
export function Reveal({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div data-reveal="" className={className}>
      {children}
    </div>
  );
}

/**
 * Titre découpé par lignes, chaque ligne montant depuis sa propre
 * gouttière au franchissement du seuil.
 *
 * Jamais par caractère : un titre éclaté en lettres casse la sélection
 * du texte et se fait vocaliser lettre à lettre. `autoSplit` refait la
 * coupe quand la police finit de charger ou que la largeur change —
 * sans lui, les lignes se figent sur les métriques de la police de
 * secours.
 */
export function CutLines({
  as: Tag = "div",
  className,
  children,
}: {
  as?: ElementType;
  className?: string;
  children: ReactNode;
}) {
  const host = useRef<HTMLElement | null>(null);

  useGSAP(
    () => {
      ensureGsapPlugins();
      const node = host.current;
      if (!node) return;

      SplitText.create(node, {
        type: "lines",
        mask: "lines",
        autoSplit: true,
        onSplit(self) {
          // L'animation vit dans `onSplit` pour viser les lignes qui
          // viennent d'être créées, et elle est retournée pour que
          // SplitText la rejoue à l'identique après une recoupe.
          return gsap.from(self.lines, {
            yPercent: 110,
            duration: 1.15,
            ease: EASE,
            stagger: 0.08,
            scrollTrigger: { trigger: node, start: "top 86%", once: true },
          });
        },
      });
    },
    { scope: host },
  );

  return (
    <Tag ref={host} className={className}>
      {children}
    </Tag>
  );
}

/**
 * Orchestrateur du hero : le titre découpé par lignes, puis les blocs
 * qui le suivent, sur une timeline unique jouée au chargement.
 */
export function HeroReveal({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const host = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      ensureGsapPlugins();
      const scope = host.current;
      if (!scope) return;

      const title = scope.querySelector<HTMLElement>("h1");
      const titleHolder = title?.closest("[data-hero-item]");

      const items = gsap.utils
        .toArray<HTMLElement>("[data-hero-item]")
        .filter((item) => item !== titleHolder);

      gsap.set(items, { autoAlpha: 0, y: 22 });

      const tl = gsap.timeline();

      if (title) {
        SplitText.create(title, {
          type: "lines",
          mask: "lines",
          autoSplit: true,
          onSplit(self) {
            return tl.from(
              self.lines,
              { yPercent: 112, duration: 1.2, ease: EASE, stagger: 0.085 },
              0.1,
            );
          },
        });
      }

      tl.to(
        items,
        { autoAlpha: 1, y: 0, duration: 0.9, ease: EASE, stagger: 0.09 },
        0.4,
      );
    },
    { scope: host },
  );

  return (
    <div ref={host} className={className}>
      {children}
    </div>
  );
}

/** Item de l'orchestration du hero. */
export function HeroItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div data-hero-item="" className={className}>
      {children}
    </div>
  );
}

/**
 * Dérive lente au scroll : l'élément traverse moins de distance que la
 * page, ce qui lui donne une profondeur propre. C'est le retard du
 * `scrub`, et non l'amplitude, qui produit la douceur.
 */
export function Drift({
  distance = 36,
  className,
  children,
}: {
  distance?: number;
  className?: string;
  children: ReactNode;
}) {
  const host = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      ensureGsapPlugins();
      const node = host.current?.firstElementChild;
      if (!node) return;

      gsap.fromTo(
        node,
        { y: distance },
        {
          y: -distance,
          ease: "none",
          scrollTrigger: {
            trigger: host.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.4,
          },
        },
      );
    },
    { scope: host, dependencies: [distance] },
  );

  return (
    <div ref={host} className={className}>
      <div>{children}</div>
    </div>
  );
}
```

- [ ] **Step 4 : Lancer le test et vérifier qu'il passe**

```bash
cd apps/marketing && bun test __tests__/landing-foundation.test.tsx
```

Attendu : 3 pass.

- [ ] **Step 5 : Vérifier que la page ne régresse pas**

```bash
cd apps/marketing && bun test __tests__/home-landing.test.tsx
```

Attendu : 8 pass. Le balisage n'a pas changé, seul le motion.

- [ ] **Step 6 : Vérifier les types et le lint**

```bash
cd apps/marketing && bun run lint
```

Attendu : aucune erreur. Si `Lenis` n'est pas typé à l'import, ne pas ajouter de `any` — le paquet expose ses types, vérifier l'import par défaut `import Lenis from "lenis"`.

- [ ] **Step 7 : Commit**

```bash
git add apps/marketing/components/v2/reveal.tsx apps/marketing/__tests__/landing-foundation.test.tsx
git commit -m "Socle de motion de l'accueil : Lenis, ancres amorties, fin du reduced-motion

prefers-reduced-motion est écarté sur demande explicite. Le test
verrouille la décision et sa trace écrite. Lenis alimente ScrollTrigger,
qui devient le seul observateur du défilement de la page."
```

---

## Task 2 : Le manifeste

**Files:**
- Create: `apps/marketing/components/v2/manifesto.tsx`
- Create: `apps/marketing/components/v2/landing.css`
- Modify: `apps/marketing/components/v2/v2-landing.tsx`
- Create: `apps/marketing/__tests__/landing-motion.test.tsx`

**Interfaces:**
- Consomme : `ensureGsapPlugins`, `EASE`, `WIDE` de `./reveal`.
- Produit : `V2Manifesto()` — section sans props. Le fichier `landing.css` est importé par `v2-landing.tsx` et par rien d'autre.

- [ ] **Step 1 : Écrire le test qui échoue**

Créer `apps/marketing/__tests__/landing-motion.test.tsx` :

```tsx
import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import { V2Manifesto } from "../components/v2/manifesto";
import { exactZeroOpacity, textOnly } from "./landing-test-utils";

const MANIFESTO_TEXT =
  "Vous notez « restriction thoracique gauche ». Le propriétaire lit « la mobilité du thorax a été travaillée pendant la séance ». Même observation, deux lecteurs. Biume écrit la seconde phrase. Vous gardez la première.";

describe("manifeste de l'accueil", () => {
  test("rend le texte entier avant toute hydratation", () => {
    const html = renderToStaticMarkup(<V2Manifesto />);
    const text = textOnly(html);

    // Le mouvement colore un texte déjà là. Il ne le révèle pas depuis
    // rien : sans script, la promesse reste lisible.
    expect(text).toContain(MANIFESTO_TEXT);
    expect(html).not.toMatch(exactZeroOpacity);
  });

  test("donne un titre au plan du document sans l'imposer à la page", () => {
    const html = renderToStaticMarkup(<V2Manifesto />);

    expect(html).toMatch(/<h2[^>]*class="[^"]*sr-only/);
  });

  test("découpe par mots, jamais par caractères", async () => {
    const source = await Bun.file(
      new URL("../components/v2/manifesto.tsx", import.meta.url),
    ).text();

    expect(source).toContain('type: "words,lines"');
    expect(source).not.toContain("chars");
    expect(source).not.toContain("prefers-reduced-motion");
  });
});
```

- [ ] **Step 2 : Lancer le test et vérifier qu'il échoue**

```bash
cd apps/marketing && bun test __tests__/landing-motion.test.tsx
```

Attendu : ÉCHEC — `Cannot find module '../components/v2/manifesto'`.

- [ ] **Step 3 : Créer `components/v2/landing.css`**

```css
/* ============================================================
   Landing d'accueil — styles propres aux sections animées.
   Chargé par components/v2/v2-landing.tsx uniquement.
   app/v2/v2.css sert les pages SEO et n'est jamais modifié.
   ============================================================ */

.v2-landing {
  /* Encre du manifeste. L'état « pas encore lu » est à 3,2:1 sur le lin :
     sous le seuil du texte courant, au-dessus de celui du grand corps
     (3:1 au-delà de 24px), qui est le régime du manifeste. */
  --v2-unread: var(--v2-ink-faint);

  /* Surlignage du fragment dans la note du praticien. Le violet décide :
     c'est la couleur du passage qui va être transformé. */
  --v2-mark: color-mix(in oklab, var(--v2-violet-ink) 14%, transparent);
}

/* ---------- Manifeste ---------- */

.v2-manifesto {
  font-family: var(--font-sans);
  font-size: clamp(2rem, 4.6vw, 3.9rem);
  font-weight: 500;
  line-height: 1.14;
  letter-spacing: -0.04em;
  color: var(--v2-unread);
}

/* Chaque mot est colorié individuellement par GSAP. La transition CSS
   n'existe pas ici : c'est le scrub qui interpole. */
.v2-manifesto .v2-word {
  color: var(--v2-unread);
}

/* ---------- Atelier ---------- */

.v2-fragment {
  border-radius: 4px;
  padding: 0 2px;
  /* Au repos — sans script — le fragment est en encre pleine, non
     surligné : la note se lit comme une note. */
  background-color: transparent;
}

.v2-flyer {
  position: absolute;
  z-index: 2;
  margin: 0;
  pointer-events: none;
  white-space: nowrap;
  color: var(--v2-violet-ink);
}

.v2-rail-line {
  stroke: var(--v2-line-strong);
  stroke-width: 1;
}

.v2-rail-progress {
  stroke: var(--v2-violet-ink);
  stroke-width: 1.5;
  stroke-linecap: round;
}

.v2-rail-node {
  fill: var(--v2-canvas);
  stroke: var(--v2-line-strong);
  stroke-width: 1.5;
}

.v2-rail-node[data-lit="true"] {
  fill: var(--v2-violet-ink);
  stroke: var(--v2-violet-ink);
}

/* Le sceau confirme : vert de marque. */
.v2-seal {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: var(--v2-green);
}
```

- [ ] **Step 4 : Créer `components/v2/manifesto.tsx`**

```tsx
"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useRef } from "react";

import { WIDE, ensureGsapPlugins } from "./reveal";

/**
 * Le geste signature de la page : le texte passe de l'encre « pas
 * encore lue » à l'encre pleine au fil du scroll. Le lecteur éprouve
 * exactement ce que le produit promet — un propos qui devient clair.
 *
 * Le contenu est la démonstration elle-même, pas une accroche.
 * Direction reprise de /v3, recomposée dans la DA de l'accueil.
 */
const MANIFESTO =
  "Vous notez « restriction thoracique gauche ». Le propriétaire lit « la mobilité du thorax a été travaillée pendant la séance ». Même observation, deux lecteurs. Biume écrit la seconde phrase. Vous gardez la première.";

/** La phrase qui porte l'argument arrive en violet : le violet décide,
 *  et c'est elle qui affirme que le praticien garde ses mots. */
const DECIDING_SENTENCE = "Vous gardez la première.";

export function V2Manifesto() {
  const host = useRef<HTMLDivElement | null>(null);
  const text = useRef<HTMLParagraphElement | null>(null);

  useGSAP(
    () => {
      ensureGsapPlugins();
      const mm = gsap.matchMedia();
      const node = text.current;
      if (!node) return;

      // Découpage par mots (et par lignes, pour que la coupe suive la
      // largeur). Jamais par caractères : le titre serait épelé par les
      // lecteurs d'écran et la sélection de texte cassée.
      SplitText.create(node, {
        type: "words,lines",
        wordsClass: "v2-word",
        autoSplit: true,
        onSplit(self) {
          const deciding = DECIDING_SENTENCE.split(" ").length;
          const words = self.words as HTMLElement[];
          const pivot = words.length - deciding;

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: host.current,
              // Pinné sur écran large, simple scrub en dessous : sur
              // mobile le scroll n'est jamais capturé.
              pin: mm.conditions?.wide ? host.current : false,
              start: mm.conditions?.wide ? "top top" : "top 82%",
              end: mm.conditions?.wide ? "+=180%" : "bottom 45%",
              scrub: 0.6,
            },
          });

          tl.to(words.slice(0, pivot), {
            color: "var(--v2-ink)",
            stagger: 0.4,
            duration: 1,
            ease: "none",
          }).to(
            words.slice(pivot),
            {
              color: "var(--v2-violet-ink)",
              stagger: 0.4,
              duration: 1,
              ease: "none",
            },
            ">-0.2",
          );

          return tl;
        },
      });

      mm.add({ wide: WIDE }, () => undefined);

      return () => mm.revert();
    },
    { scope: host },
  );

  return (
    <section
      aria-labelledby="v2-manifeste-title"
      className="v2-manifeste border-t border-[color:var(--v2-line)]"
    >
      <div
        ref={host}
        className="mx-auto flex min-h-[70svh] max-w-[1200px] items-center px-5 py-28 md:px-8 md:py-36 lg:min-h-[100svh]"
      >
        {/* Le plan du document a besoin d'un titre ; la page, elle, n'a
            besoin que du texte. */}
        <h2 id="v2-manifeste-title" className="sr-only">
          Ce que le propriétaire lit
        </h2>
        <p
          ref={text}
          className="v2-manifesto mx-auto max-w-[22ch] [text-wrap:balance] md:max-w-[26ch]"
        >
          {MANIFESTO}
        </p>
      </div>
    </section>
  );
}
```

**Note pour l'implémenteur :** `mm.conditions` n'est peuplé qu'à l'intérieur d'un `mm.add`. Si l'approche ci-dessus se révèle fragile à l'exécution, remplacer par deux `mm.add` distincts — un pour `WIDE` avec `pin: true`, un pour `"(max-width: 1023px)"` sans pin — chacun créant sa propre timeline dans son propre `SplitText.create`. Le comportement attendu est le même ; c'est la formulation qui change. Vérifier dans le navigateur avant de commiter.

- [ ] **Step 5 : Composer le manifeste dans la page**

Dans `apps/marketing/components/v2/v2-landing.tsx`, ajouter l'import de la feuille et de la section, et insérer `<V2Manifesto />` juste après `<V2Hero />` :

```tsx
import "./landing.css";

import { v2FontVariables } from "./fonts";
import { V2Hero } from "./hero";
import { V2Manifesto } from "./manifesto";
import { V2Masthead } from "./masthead";
import { V2MotionRoot } from "./reveal";
import {
  V2Close,
  V2Control,
  V2FieldStories,
  V2Faq,
  V2Features,
  V2FollowUp,
  V2Footer,
  V2Pricing,
} from "./sections";

export function V2Landing() {
  return (
    <V2MotionRoot>
      <div className={`v2 v2-landing ${v2FontVariables} min-h-screen antialiased`}>
        <V2Masthead />
        <main id="contenu" tabIndex={-1}>
          <V2Hero />
          <V2Manifesto />
          <V2Features />
          <V2Control />
          <V2FollowUp />
          <V2FieldStories />
          <V2Pricing />
          <V2Faq />
          <V2Close />
        </main>
        <V2Footer />
      </div>
    </V2MotionRoot>
  );
}
```

- [ ] **Step 6 : Lancer les tests**

```bash
cd apps/marketing && bun test __tests__/landing-motion.test.tsx __tests__/home-landing.test.tsx
```

Attendu : tout passe. Si `home-landing.test.tsx` échoue sur l'unicité des `id`, vérifier que `v2-manifeste-title` n'entre en collision avec rien.

- [ ] **Step 7 : Commit**

```bash
git add apps/marketing/components/v2/manifesto.tsx apps/marketing/components/v2/landing.css apps/marketing/components/v2/v2-landing.tsx apps/marketing/__tests__/landing-motion.test.tsx
git commit -m "Manifeste de l'accueil : le texte se lit au scroll

Le texte passe de l'encre non lue à l'encre pleine, mot à mot, et la
phrase qui affirme que le praticien garde ses mots arrive en violet.
Pinné au-dessus de 1024px, simple scrub en dessous."
```

---

## Task 3 : L'atelier — le balisage, et la bascule de composition

Cette tâche ne pose aucun mouvement. Elle installe la démonstration dans son **état final complet** et retire `V2Features`. À la fin, la page est cohérente et testable ; le mouvement arrive en Task 4.

**Files:**
- Create: `apps/marketing/components/v2/atelier.tsx`
- Modify: `apps/marketing/components/v2/sections.tsx:78-135` (suppression de `transformationStages` et `V2Features`)
- Modify: `apps/marketing/components/v2/v2-landing.tsx`
- Modify: `apps/marketing/__tests__/landing-motion.test.tsx`

**Interfaces:**
- Consomme : `REPORT_TRANSFORMATION_DEMO` de `../landing/report-transformation-demo`, `Reveal` de `./reveal`.
- Produit : `V2Atelier()` — section sans props, porte `id="produit"`. Balisage stable dont Task 4 dépend :
  - `[data-atelier-root]` sur la grille des deux panneaux
  - `[data-fragment="0|1|2"]` sur chaque fragment de la note
  - `[data-slot="0|1|2"]` sur la cible de vol, dans le champ correspondant
  - `[data-value="0|1|2"]` sur la valeur reformulée
  - `[data-rail-progress]`, `[data-rail-node="0|1|2"]` sur le SVG du rail
  - `[data-seal]` sur le sceau, `[data-owner]` sur le bloc propriétaire, `[data-pending]` sur le bloc d'attente

- [ ] **Step 1 : Écrire les tests qui échouent**

Ajouter à `apps/marketing/__tests__/landing-motion.test.tsx` :

```tsx
import { REPORT_TRANSFORMATION_DEMO } from "../components/landing/report-transformation-demo";
import { V2Atelier } from "../components/v2/atelier";

describe("atelier de l'accueil", () => {
  test("rend la démonstration entière et validée avant toute hydratation", () => {
    const html = renderToStaticMarkup(<V2Atelier />);
    const text = textOnly(html);

    // L'état de repos est l'état final : sans script, la démonstration
    // se lit d'un coup, complète. L'animation ne conditionne jamais la
    // compréhension.
    expect(text).toContain(REPORT_TRANSFORMATION_DEMO.note);
    expect(text).toContain(REPORT_TRANSFORMATION_DEMO.ownerSummary);
    for (const section of REPORT_TRANSFORMATION_DEMO.sections) {
      // Les libellés sont mis en capitales par CSS (`uppercase`), donc le
      // texte du document les porte tels quels. Ne pas asserter sur une
      // version majuscule : elle n'existe qu'à l'écran.
      expect(text).toContain(section.label);
      expect(text).toContain(section.value);
    }
    expect(text).toContain("Validé par vous");
    expect(html).not.toMatch(exactZeroOpacity);
  });

  test("porte l'ancre produit et la mention de démonstration", () => {
    const html = renderToStaticMarkup(<V2Atelier />);

    expect(html).toContain('id="produit"');
    expect(textOnly(html)).toContain(
      "Démonstration à partir d'un exemple de séance.",
    );
  });

  test("expose les accroches que la séquence ira chercher", () => {
    const html = renderToStaticMarkup(<V2Atelier />);

    expect(html.match(/data-fragment="\d"/g)).toHaveLength(3);
    expect(html.match(/data-slot="\d"/g)).toHaveLength(3);
    expect(html.match(/data-value="\d"/g)).toHaveLength(3);
    expect(html.match(/data-rail-node="\d"/g)).toHaveLength(3);
    expect(html).toContain("data-atelier-root");
    expect(html).toContain("data-rail-progress");
    expect(html).toContain("data-seal");
    expect(html).toContain("data-owner");
  });

  test("laisse les décors hors de l'arbre d'accessibilité", () => {
    const html = renderToStaticMarkup(<V2Atelier />);
    // Le rail, ses pastilles et le sceau sont du décor : ils redisent
    // visuellement ce que le texte porte déjà.
    const railHost = html.match(/<div\b[^>]*\sdata-rail="[^"]*"[^>]*>/)?.[0];

    expect(railHost).toBeDefined();
    expect(railHost).toContain('aria-hidden="true"');
  });
});
```

- [ ] **Step 2 : Lancer les tests et vérifier qu'ils échouent**

```bash
cd apps/marketing && bun test __tests__/landing-motion.test.tsx
```

Attendu : ÉCHEC — `Cannot find module '../components/v2/atelier'`.

- [ ] **Step 3 : Créer `components/v2/atelier.tsx`**

```tsx
"use client";

import { useRef } from "react";

import { REPORT_TRANSFORMATION_DEMO } from "../landing/report-transformation-demo";
import { Reveal } from "./reveal";

/**
 * La démonstration : la note du praticien à gauche, le compte rendu
 * propriétaire à droite, un rail entre les deux.
 *
 * Le balisage rend l'**état final complet** et ne connaît rien du
 * mouvement. La séquence (`atelier-sequence.ts`) va chercher les nœuds
 * par attributs de données et les ramène à l'état de départ au montage.
 * Cette séparation est ce qui garantit qu'une page sans JavaScript reste
 * une démonstration lisible — et `/` est indexée.
 */

/**
 * Les trois fragments de la note, chacun rattaché au champ qu'il
 * alimente. Concaténés avec une espace, ils forment exactement
 * `REPORT_TRANSFORMATION_DEMO.note` : c'est la même démonstration que le
 * produit, pas une mise en scène écrite pour la landing.
 */
const FRAGMENTS = [
  "Restriction thoracique gauche.",
  "Mobilité améliorée après travail.",
  "Conseiller du calme pendant 48 h.",
] as const;

const SECTIONS = REPORT_TRANSFORMATION_DEMO.sections;

export function V2Atelier() {
  const root = useRef<HTMLDivElement | null>(null);

  return (
    <section
      id="produit"
      aria-labelledby="v2-atelier-title"
      className="scroll-mt-24 border-t border-[color:var(--v2-line)]"
    >
      <div className="mx-auto max-w-[1200px] px-5 pt-24 md:px-8 md:pt-32">
        <Reveal>
          <p className="v2-eyebrow">Le parcours</p>
          <h2
            id="v2-atelier-title"
            className="v2-display mt-5 max-w-[22ch] text-[clamp(1.9rem,3.6vw,3rem)] font-medium leading-[1.08] tracking-[-0.04em] text-[color:var(--v2-ink)] [text-wrap:balance]"
          >
            Ce que vous notez reste précis. Ce que le propriétaire lit devient
            clair.
          </h2>
          <p className="mt-5 max-w-[56ch] text-[1rem] leading-[1.65] text-[color:var(--v2-ink-soft)] [text-wrap:pretty]">
            Vos observations ne sont ni résumées ni réinterprétées. Elles sont
            rangées, puis reformulées pour quelqu&apos;un qui n&apos;a pas votre
            vocabulaire.
          </p>
        </Reveal>
      </div>

      {/* Piste de défilement. Sur écran large, la séquence la pin et y
          calcule ses quatre temps ; en dessous, elle n'a pas de hauteur
          propre et la démonstration se lit au fil du scroll normal. */}
      <div data-atelier-track className="relative">
        <div data-atelier-stage>
          <div className="mx-auto w-full max-w-[1200px] px-5 py-14 md:px-8 md:py-16">
            <div
              ref={root}
              data-atelier-root
              className="relative grid gap-6 lg:grid-cols-[1fr_88px_1.08fr] lg:items-start lg:gap-0"
            >
              {/* ---------- La note du praticien ---------- */}
              <article className="v2-card p-6 md:p-8">
                <header className="flex items-baseline justify-between gap-4 border-b border-[color:var(--v2-line)] pb-4">
                  <h3 className="text-[1.05rem] font-medium text-[color:var(--v2-ink)]">
                    Vos notes de séance
                  </h3>
                  <p className="v2-mono text-[0.78rem] text-[color:var(--v2-ink-faint)]">
                    14:52
                  </p>
                </header>

                <p className="mt-6 text-[1.05rem] leading-[1.75] text-[color:var(--v2-ink)]">
                  {FRAGMENTS.map((fragment, index) => (
                    <span key={fragment}>
                      <span className="v2-fragment" data-fragment={index}>
                        {fragment}
                      </span>{" "}
                    </span>
                  ))}
                </p>

                <p className="mt-8 border-t border-[color:var(--v2-line)] pt-4 text-[0.85rem] text-[color:var(--v2-ink-faint)]">
                  Vos mots, tels que vous les avez écrits.
                </p>
              </article>

              {/* ---------- Le rail ---------- */}
              <div
                data-rail
                aria-hidden="true"
                className="hidden lg:block lg:self-stretch lg:py-10"
              >
                <svg
                  data-rail-svg
                  viewBox="0 0 88 320"
                  preserveAspectRatio="none"
                  className="h-full w-full"
                >
                  <line
                    className="v2-rail-line"
                    x1="44"
                    y1="0"
                    x2="44"
                    y2="320"
                  />
                  <line
                    data-rail-progress
                    className="v2-rail-progress"
                    x1="44"
                    y1="0"
                    x2="44"
                    y2="320"
                  />
                  {SECTIONS.map((section, index) => (
                    <circle
                      key={section.label}
                      data-rail-node={index}
                      data-lit="true"
                      className="v2-rail-node"
                      cx="44"
                      cy={64 + index * 96}
                      r="4"
                    />
                  ))}
                </svg>
              </div>

              {/* ---------- Le compte rendu propriétaire ---------- */}
              <article className="v2-card p-6 md:p-8">
                <header className="flex items-baseline justify-between gap-4 border-b border-[color:var(--v2-line)] pb-4">
                  <h3 className="text-[1.05rem] font-medium text-[color:var(--v2-ink)]">
                    Compte rendu pour le propriétaire
                  </h3>
                  <p data-seal className="v2-seal">
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 16 16"
                      className="size-3.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path data-seal-check d="m3 8.5 3.2 3.2L13 5" />
                    </svg>
                    Validé par vous
                  </p>
                </header>

                <dl className="mt-6 space-y-5">
                  {SECTIONS.map((section, index) => (
                    <div
                      key={section.label}
                      className="border-l border-[color:var(--v2-line-strong)] pl-4"
                    >
                      <dt className="text-[0.78rem] font-semibold uppercase tracking-[0.08em] text-[color:var(--v2-ink-faint)]">
                        {section.label}
                      </dt>
                      <dd className="relative mt-1.5 text-[1rem] leading-[1.55] text-[color:var(--v2-ink)]">
                        {/* La cible du vol : elle occupe la place du
                            texte, le texte lui-même se révèle après. */}
                        <span
                          data-slot={index}
                          aria-hidden="true"
                          className="absolute left-0 top-0"
                        />
                        <span data-value={index}>{section.value}</span>
                      </dd>
                    </div>
                  ))}
                </dl>

                {/* Hauteur réservée : la bascule attente → document ne
                    déplace rien autour d'elle. */}
                <div className="relative mt-7 min-h-[9.5rem]">
                  <div
                    data-pending
                    aria-hidden="true"
                    className="absolute inset-0 rounded-[10px] bg-[color:var(--v2-bone)] p-5 opacity-0"
                  >
                    <p className="text-[0.78rem] font-semibold uppercase tracking-[0.08em] text-[color:var(--v2-ink-faint)]">
                      Ce que lit le propriétaire
                    </p>
                    <p className="mt-2 text-[0.95rem] leading-[1.6] text-[color:var(--v2-ink-faint)]">
                      Rien pour l&apos;instant. Le document attend votre
                      relecture.
                    </p>
                  </div>
                  <div
                    data-owner
                    className="rounded-[10px] bg-[color:var(--v2-bone)] p-5"
                  >
                    <p className="text-[0.78rem] font-semibold uppercase tracking-[0.08em] text-[color:var(--v2-violet-ink)]">
                      Ce que lit le propriétaire
                    </p>
                    <p className="mt-2 text-[1rem] leading-[1.6] text-[color:var(--v2-ink)]">
                      {REPORT_TRANSFORMATION_DEMO.ownerSummary}
                    </p>
                  </div>
                </div>
              </article>
            </div>

            <p className="mt-8 text-[0.82rem] text-[color:var(--v2-ink-faint)]">
              Démonstration à partir d&apos;un exemple de séance. Aucun envoi
              n&apos;est déclenché sans votre validation.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
```

**Attention au bloc d'attente :** `data-pending` porte `opacity-0` en classe Tailwind. C'est le seul endroit du plan où un état masqué est écrit en CSS, et c'est délibéré — sans script, c'est le bloc *final* qu'on veut voir, pas le bloc d'attente. Le test `exactZeroOpacity` cherche `opacity: 0` en **style inline**, pas la classe utilitaire, donc il passe. Ne pas remplacer par `hidden` : la séquence doit pouvoir le faire apparaître.

- [ ] **Step 4 : Retirer `V2Features` de `sections.tsx`**

Dans `apps/marketing/components/v2/sections.tsx`, supprimer :
- le bloc `/* ---------- Transformation … ---------- */` avec la constante `transformationStages` et la fonction `V2Features` (lignes 78 à 135) ;
- les imports devenus inutiles : `FileSearch`, `FileText`, `Mic` dans l'import `lucide-react`, et `REPORT_TRANSFORMATION_DEMO` **si plus aucun usage ne subsiste dans le fichier**.

L'import `lucide-react` doit se réduire à :

```tsx
import { Check } from "lucide-react";
```

- [ ] **Step 5 : Basculer la composition**

Dans `apps/marketing/components/v2/v2-landing.tsx`, remplacer `<V2Features />` par `<V2Atelier />`, retirer `V2Features` de l'import de `./sections`, et ajouter `import { V2Atelier } from "./atelier";`. Ordre final du `<main>` :

```tsx
<V2Hero />
<V2Manifesto />
<V2Atelier />
<V2Control />
<V2FollowUp />
<V2FieldStories />
<V2Pricing />
<V2Faq />
<V2Close />
```

- [ ] **Step 6 : Lancer les tests**

```bash
cd apps/marketing && bun test __tests__/landing-motion.test.tsx __tests__/home-landing.test.tsx
```

Attendu : tout passe. Points de vigilance si `home-landing.test.tsx` échoue :
- `id="produit"` doit apparaître **exactement une fois** dans la page — vérifier que `SectionShell` de `V2Features` ne le porte plus.
- `REPORT_TRANSFORMATION_DEMO.note` doit être présent dans le texte : les trois fragments concaténés avec l'espace du `{" "}` donnent exactement la note une fois `textOnly` appliqué (il normalise les espaces). Si l'assertion échoue, comparer les deux chaînes caractère par caractère avant de toucher au balisage.

- [ ] **Step 7 : Vérifier le lint**

```bash
cd apps/marketing && bun run lint
```

- [ ] **Step 8 : Commit**

```bash
git add apps/marketing/components/v2/atelier.tsx apps/marketing/components/v2/sections.tsx apps/marketing/components/v2/v2-landing.tsx apps/marketing/__tests__/landing-motion.test.tsx
git commit -m "Atelier de l'accueil : la démonstration remplace les trois cartes

V2Features servait déjà REPORT_TRANSFORMATION_DEMO mot pour mot. L'atelier
reprend l'ancre #produit et rend la démonstration complète au repos : le
mouvement, qui arrive ensuite, ne fera que la révéler."
```

---

## Task 4 : L'atelier — la séquence

**Files:**
- Create: `apps/marketing/components/v2/atelier-sequence.ts`
- Modify: `apps/marketing/components/v2/atelier.tsx` (branchement du hook)
- Modify: `apps/marketing/__tests__/landing-motion.test.tsx`

**Interfaces:**
- Consomme : `ensureGsapPlugins`, `EASE`, `WIDE` de `./reveal` ; les attributs de données produits par Task 3.
- Produit : `useAtelierSequence(rootRef: React.RefObject<HTMLElement | null>, trackRef: React.RefObject<HTMLElement | null>)`.

- [ ] **Step 1 : Écrire le test qui échoue**

Ajouter à `apps/marketing/__tests__/landing-motion.test.tsx` :

```tsx
describe("séquence de l'atelier", () => {
  test("réserve les gestes lourds aux écrans larges et ne rejoue pas à l'envers", async () => {
    const source = await Bun.file(
      new URL("../components/v2/atelier-sequence.ts", import.meta.url),
    ).text();

    // Le pinning et Flip ne se montent qu'au-dessus de 1024px : sur
    // petit écran le scroll n'est jamais capturé.
    expect(source).toContain("WIDE");
    expect(source).toContain("Flip.getState");
    expect(source).toContain("Flip.from");

    // Au scroll inverse, les états sont reposés instantanément. Une
    // animation jouée à l'envers pendant qu'on remonte donne le mal de
    // mer et brouille la lecture.
    expect(source).toContain("direction");

    // Aucune garde reduced-motion, aucun second observateur du scroll.
    expect(source).not.toContain("prefers-reduced-motion");
    expect(source).not.toMatch(/window\.addEventListener\(\s*["']scroll/);
  });

  test("le double en vol reste hors de l'arbre d'accessibilité", async () => {
    const source = await Bun.file(
      new URL("../components/v2/atelier-sequence.ts", import.meta.url),
    ).text();

    // Le texte est déjà lu deux fois dans l'arbre — dans la note et dans
    // le champ. Le double ne doit pas le faire lire une troisième fois.
    expect(source).toContain('setAttribute("aria-hidden", "true")');
  });
});
```

- [ ] **Step 2 : Lancer le test et vérifier qu'il échoue**

```bash
cd apps/marketing && bun test __tests__/landing-motion.test.tsx
```

Attendu : ÉCHEC — `atelier-sequence.ts` n'existe pas.

- [ ] **Step 3 : Créer `components/v2/atelier-sequence.ts`**

```ts
"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { Flip } from "gsap/Flip";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import type { RefObject } from "react";

import { EASE, WIDE, ensureGsapPlugins } from "./reveal";

/**
 * La mécanique de l'atelier : quatre temps, un vol par fragment.
 *
 * Elle ne connaît du balisage que ses attributs de données. Le balisage,
 * lui, ne connaît rien d'elle et rend l'état final : c'est cette
 * séparation qui garantit qu'une page sans JavaScript reste une
 * démonstration lisible.
 *
 * 0 → note complète, compte rendu vide
 * 1-3 → un fragment vole vers son champ
 * 4 → le sceau se trace, le bloc propriétaire se pose
 */
const LAST_BEAT = 4;

let sequencePluginsReady = false;

function ensureSequencePlugins() {
  ensureGsapPlugins();
  if (sequencePluginsReady) return;
  gsap.registerPlugin(Flip, DrawSVGPlugin);
  sequencePluginsReady = true;
}

export function useAtelierSequence(
  rootRef: RefObject<HTMLElement | null>,
  trackRef: RefObject<HTMLElement | null>,
) {
  useGSAP(
    () => {
      ensureSequencePlugins();
      const mm = gsap.matchMedia();

      mm.add(WIDE, () => {
        const root = rootRef.current;
        const track = trackRef.current;
        if (!root || !track) return;

        const q = gsap.utils.selector(root);
        const fragments = q("[data-fragment]") as HTMLElement[];
        const slots = q("[data-slot]") as HTMLElement[];
        const values = q("[data-value]") as HTMLElement[];
        const nodes = q("[data-rail-node]") as SVGCircleElement[];
        const progress = q("[data-rail-progress]")[0] as SVGLineElement;
        const seal = q("[data-seal]")[0] as HTMLElement;
        const sealCheck = q("[data-seal-check]")[0] as SVGPathElement;
        const owner = q("[data-owner]")[0] as HTMLElement;
        const pending = q("[data-pending]")[0] as HTMLElement;

        // Chaque valeur est découpée par mots une fois pour toutes : la
        // révélation se joue ensuite sur des nœuds stables.
        const splits = values.map((value) =>
          SplitText.create(value, { type: "words", wordsClass: "v2-word" }),
        );

        /** Repose l'état d'un temps sans l'animer. Sert au montage et à
         *  toute remontée : rejouer une timeline à l'envers pendant que
         *  le lecteur remonte donne le mal de mer. */
        const settle = (beat: number) => {
          gsap.killTweensOf([
            ...values,
            ...splits.flatMap((split) => split.words),
            ...nodes,
            progress,
            seal,
            owner,
            pending,
            ...fragments,
          ]);
          root.querySelectorAll("[data-flyer]").forEach((node) => node.remove());

          fragments.forEach((fragment, index) => {
            gsap.set(fragment, {
              backgroundColor:
                beat === index + 1 ? "var(--v2-mark)" : "transparent",
              color:
                beat > index ? "var(--v2-ink)" : "var(--v2-ink-soft)",
            });
          });

          splits.forEach((split, index) => {
            gsap.set(split.words, { autoAlpha: beat > index ? 1 : 0 });
          });

          nodes.forEach((node, index) => {
            node.setAttribute("data-lit", beat > index ? "true" : "false");
          });

          gsap.set(progress, {
            drawSVG: `0% ${(Math.min(beat, 3) / 3) * 100}%`,
          });
          gsap.set(sealCheck, { drawSVG: beat === LAST_BEAT ? "100%" : "0%" });
          gsap.set(seal, { autoAlpha: beat === LAST_BEAT ? 1 : 0.25 });
          gsap.set(owner, { autoAlpha: beat === LAST_BEAT ? 1 : 0 });
          gsap.set(pending, { autoAlpha: beat === LAST_BEAT ? 0 : 1 });
        };

        /** Joue le vol d'un fragment vers son champ. */
        const fly = (index: number) => {
          const fragment = fragments[index];
          const slot = slots[index];
          const split = splits[index];
          if (!fragment || !slot || !split) return;

          // Le double naît **dans** le fragment : il est donc exactement
          // à sa place, à son corps de texte, sans aucune mesure
          // manuelle. Flip fera le reste.
          const flyer = document.createElement("span");
          flyer.dataset.flyer = "";
          flyer.className = "v2-flyer";
          flyer.textContent = fragment.textContent ?? "";
          // Le texte est déjà lu deux fois dans l'arbre — dans la note et
          // dans le champ. Le double ne doit pas le faire lire une
          // troisième fois.
          flyer.setAttribute("aria-hidden", "true");
          fragment.appendChild(flyer);

          const state = Flip.getState(flyer);
          slot.appendChild(flyer);

          const tl = gsap.timeline();

          tl.add(
            Flip.from(state, {
              duration: 0.85,
              ease: "power2.inOut",
              scale: true,
              absolute: true,
            }),
          )
            // Flip n'interpole pas de courbe. Sans cet arc, la
            // translation lit comme un glissement, pas comme un passage.
            .to(
              flyer,
              { y: -18, duration: 0.42, ease: "power2.out" },
              0,
            )
            .to(flyer, { y: 0, duration: 0.43, ease: "power2.in" }, 0.42)
            .to(
              nodes[index],
              { attr: { "data-lit": "true" }, duration: 0 },
              0.5,
            )
            .to(
              progress,
              {
                drawSVG: `0% ${((index + 1) / 3) * 100}%`,
                duration: 0.7,
                ease: EASE,
              },
              0.15,
            )
            .to(flyer, { autoAlpha: 0, duration: 0.25 }, 0.8)
            .to(
              split.words,
              {
                autoAlpha: 1,
                duration: 0.5,
                ease: EASE,
                stagger: 0.035,
                onComplete: () => flyer.remove(),
              },
              0.75,
            )
            .to(
              fragment,
              { backgroundColor: "transparent", color: "var(--v2-ink)", duration: 0.4 },
              0.85,
            );

          return tl;
        };

        /** Le dernier temps : le sceau se trace, le document se pose. */
        const validate = () =>
          gsap
            .timeline()
            .to(seal, { autoAlpha: 1, duration: 0.3 })
            .to(sealCheck, { drawSVG: "100%", duration: 0.45, ease: EASE }, 0)
            .to(pending, { autoAlpha: 0, duration: 0.3 }, 0.1)
            .fromTo(
              owner,
              { autoAlpha: 0, y: 10 },
              { autoAlpha: 1, y: 0, duration: 0.6, ease: EASE },
              0.25,
            );

        let current = 0;
        settle(0);

        const trigger = ScrollTrigger.create({
          trigger: track,
          pin: true,
          start: "top top",
          end: `+=${LAST_BEAT * 90}%`,
          // Le snap fait claquer la séquence d'un temps à l'autre au lieu
          // de la laisser baver entre deux états.
          snap: {
            snapTo: 1 / LAST_BEAT,
            duration: { min: 0.15, max: 0.4 },
            ease: "power2.inOut",
          },
          onUpdate: (self) => {
            const next = Math.min(
              LAST_BEAT,
              Math.floor(self.progress * (LAST_BEAT + 0.4)),
            );
            if (next === current) return;

            // En descente on joue le geste, temps par temps. En remontée
            // on repose l'état, sans animation.
            if (self.direction === 1 && next === current + 1) {
              if (next === LAST_BEAT) validate();
              else fly(next - 1);
            } else {
              settle(next);
            }

            current = next;
          },
        });

        return () => {
          trigger.kill();
          splits.forEach((split) => split.revert());
          root.querySelectorAll("[data-flyer]").forEach((node) => node.remove());
          // L'état de repos est l'état final : si la mécanique est
          // démontée — redimensionnement sous 1024px — la démonstration
          // reste complète.
          settle(LAST_BEAT);
        };
      });

      return () => mm.revert();
    },
    { scope: rootRef },
  );
}
```

- [ ] **Step 4 : Brancher le hook dans `atelier.tsx`**

Dans `apps/marketing/components/v2/atelier.tsx` :

```tsx
import { useAtelierSequence } from "./atelier-sequence";
```

Ajouter un second ref et l'appel, puis poser les refs sur les bons nœuds :

```tsx
export function V2Atelier() {
  const root = useRef<HTMLDivElement | null>(null);
  const track = useRef<HTMLDivElement | null>(null);

  useAtelierSequence(root, track);
  // …
}
```

`track` va sur le `<div data-atelier-track>`. La hauteur de piste est donnée par le `end: "+=…"` du ScrollTrigger, pas par une classe : le conteneur reste à sa hauteur naturelle et le pin gère le reste. Sous 1024px, aucun trigger n'est créé, donc aucune hauteur artificielle.

- [ ] **Step 5 : Lancer les tests**

```bash
cd apps/marketing && bun test __tests__/landing-motion.test.tsx __tests__/home-landing.test.tsx
```

Attendu : tout passe. Le rendu serveur n'a pas changé — le hook ne fait rien hors navigateur.

- [ ] **Step 6 : Vérifier dans le navigateur**

```bash
cd apps/marketing && bun run dev
```

Ouvrir `http://localhost:3000` et parcourir la section. Vérifier, dans l'ordre :
1. Le fragment quitte bien la note et arrive **dans** son champ, pas à côté.
2. Le fragment d'origine **reste** dans la note, en encre pleine.
3. Le rail se dessine derrière le vol et la pastille s'allume à l'arrivée.
4. Remonter : les états se reposent sans rejouer les vols à l'envers.
5. Redimensionner sous 1024px pendant la séquence : la démonstration doit se retrouver complète et empilée, sans scroll capturé.
6. Le masthead reste visible pendant tout le pin.

Si le vol atterrit au mauvais endroit, la cause la plus probable est un ancêtre en `overflow: hidden` ou `clip` : **`overflow-x: clip` sur un ancêtre casse `position: sticky` et le pin dans Chromium**, l'élément devenant le scrollport de référence. Retirer la coupure de l'ancêtre et la poser sur la section qui déborde réellement.

- [ ] **Step 7 : Commit**

```bash
git add apps/marketing/components/v2/atelier-sequence.ts apps/marketing/components/v2/atelier.tsx apps/marketing/__tests__/landing-motion.test.tsx
git commit -m "Séquence de l'atelier : le fragment voyage vers son champ

Flip calcule la trajectoire à partir des deux géométries réelles ; le
double naît dans le fragment et s'efface à l'arrivée, la valeur
reformulée se révèle mot à mot, le fragment d'origine reste dans la note.
Au scroll inverse les états sont reposés, jamais rejoués à l'envers."
```

---

## Task 5 : `V2Control` — le panneau de relecture remplace la photo stock

`/assets/images/dashboard-image.jpg` est une photo stock d'un dashboard analytique sans rapport avec Biume. `PRODUCT.md` interdit les preuves qui ne sont pas des démonstrations fidèles du produit ; l'image a déjà été retirée des autres directions pour ce motif.

**Files:**
- Modify: `apps/marketing/components/v2/sections.tsx` (fonction `V2Control`)
- Modify: `apps/marketing/__tests__/landing-motion.test.tsx`

**Interfaces:**
- Consomme : `REPORT_TRANSFORMATION_DEMO`, `Reveal`.
- Produit : rien de nouveau ; `V2Control` garde sa signature.

- [ ] **Step 1 : Écrire le test qui échoue**

Ajouter à `apps/marketing/__tests__/landing-motion.test.tsx` :

```tsx
import { V2Control } from "../components/v2/sections";

describe("contrôle du praticien", () => {
  test("montre le compte rendu relu, jamais une capture générique", () => {
    const html = renderWithLandingImageConfig(<V2Control />);
    const text = textOnly(html);

    // Biume n'a aucune preuve sociale : la crédibilité ne repose que sur
    // des démonstrations fidèles du produit. Une photo stock de
    // dashboard analytique n'en est pas une.
    expect(html).not.toContain("dashboard-image");
    expect(text).toContain("Biume prépare. Vous gardez la main.");
    // Apostrophe courbe (U+2019) : c'est celle du fichier source, et
    // `textOnly` ne normalise pas la ponctuation.
    expect(text).toContain("Rien n’est partagé automatiquement");
    expect(text).toContain(REPORT_TRANSFORMATION_DEMO.sections[0]!.value);
    expect(html).toContain('data-control-panel="true"');
  });
});
```

Ajouter `renderWithLandingImageConfig` à l'import de `./landing-test-utils` en tête de fichier.

- [ ] **Step 2 : Lancer le test et vérifier qu'il échoue**

```bash
cd apps/marketing && bun test __tests__/landing-motion.test.tsx
```

Attendu : ÉCHEC sur `expect(html).not.toContain("dashboard-image")`.

- [ ] **Step 3 : Remplacer le panneau**

Dans `apps/marketing/components/v2/sections.tsx`, remplacer le second enfant de la grille de `V2Control` (le `<Reveal>` qui contient le `<Image src="/assets/images/dashboard-image.jpg" …>`, lignes 181 à 191) par :

```tsx
        <Reveal>
          <div data-control-panel="true" className="v2-panel p-6 md:p-8">
            <header className="flex items-baseline justify-between gap-4 border-b border-[color:var(--v2-line)] pb-4">
              <h3 className="text-[1.05rem] font-medium text-[color:var(--v2-ink)]">
                Relecture du compte rendu
              </h3>
              <p className="v2-mono text-[0.72rem] uppercase tracking-[0.12em] text-[color:var(--v2-ink-faint)]">
                Brouillon
              </p>
            </header>

            <dl className="mt-6 space-y-5">
              {REPORT_TRANSFORMATION_DEMO.sections.map((section) => (
                <div
                  key={section.label}
                  className="border-l border-[color:var(--v2-line-strong)] pl-4"
                >
                  <dt className="text-[0.78rem] font-semibold uppercase tracking-[0.08em] text-[color:var(--v2-ink-faint)]">
                    {section.label}
                  </dt>
                  <dd className="mt-1.5 text-[1rem] leading-[1.55] text-[color:var(--v2-ink)]">
                    {section.value}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="mt-7 flex flex-wrap items-center gap-2.5 border-t border-[color:var(--v2-line)] pt-6">
              <span className="v2-btn v2-btn-primary v2-btn-sm">
                Valider ce passage
              </span>
              <span className="v2-btn v2-btn-secondary v2-btn-sm">
                Reformuler
              </span>
              <p className="ml-auto text-[0.82rem] text-[color:var(--v2-ink-faint)]">
                Aucun envoi tant que vous n&apos;avez pas validé.
              </p>
            </div>
          </div>
        </Reveal>
```

`REPORT_TRANSFORMATION_DEMO` doit être importé dans `sections.tsx` — si Task 3 a retiré l'import, le remettre. Les deux actions sont des `<span>` et non des `<button>` : ce sont des éléments de démonstration, pas des commandes. Un bouton mort dans une landing est un piège au clavier.

Si `Image` de `next/image` n'est plus utilisé nulle part dans `sections.tsx`, retirer l'import — `V2FollowUp` et `V2FieldStories` s'en servent encore, donc il doit rester.

- [ ] **Step 4 : Lancer les tests**

```bash
cd apps/marketing && bun test __tests__/landing-motion.test.tsx __tests__/home-landing.test.tsx
```

Attendu : tout passe. Vérifier en particulier `keeps the homepage free of superseded UI and unsupported claims` : le mot « automatique » ne doit apparaître **qu'une fois** sur la page. La nouvelle copie dit « Aucun envoi tant que vous n'avez pas validé » — elle ne contient pas le mot, c'est voulu.

- [ ] **Step 5 : Commit**

```bash
git add apps/marketing/components/v2/sections.tsx apps/marketing/__tests__/landing-motion.test.tsx
git commit -m "Contrôle : le compte rendu relu remplace la photo stock

dashboard-image.jpg est une capture générique d'un dashboard analytique
sans rapport avec le produit. La crédibilité de Biume ne repose que sur
des démonstrations fidèles."
```

---

## Task 6 : Le reste du mouvement

**Files:**
- Modify: `apps/marketing/components/v2/sections.tsx` (`SectionIntro`, `V2Control`, `V2FollowUp`, `V2FieldStories`, `V2Pricing`)
- Modify: `apps/marketing/components/v2/masthead.tsx`
- Modify: `apps/marketing/__tests__/landing-motion.test.tsx`

**Interfaces:**
- Consomme : `CutLines`, `Drift`, `Reveal` de `./reveal`.
- Produit : rien de nouveau.

- [ ] **Step 1 : Écrire le test qui échoue**

Ajouter à `apps/marketing/__tests__/landing-motion.test.tsx` :

```tsx
describe("mouvement du reste de la page", () => {
  test("le masthead n'ouvre pas son propre écouteur de scroll", async () => {
    const source = await Bun.file(
      new URL("../components/v2/masthead.tsx", import.meta.url),
    ).text();

    // Un seul observateur du défilement sur la page : celui de
    // ScrollTrigger, alimenté par Lenis.
    expect(source).not.toMatch(/window\.addEventListener\(\s*["']scroll/);
    expect(source).toContain("ScrollTrigger");
    expect(source).not.toContain("prefers-reduced-motion");
  });

  test("les CTA ne sont jamais retenus par une entrée animée", async () => {
    const source = await Bun.file(
      new URL("../components/v2/sections.tsx", import.meta.url),
    ).text();

    // Un bouton qui apparaît en retard est un bouton qu'on ne clique
    // pas. Les blocs de conversion ne sont pas enveloppés d'un Reveal.
    const closeBlock = source.slice(source.indexOf("export function V2Close"));
    const ctaIndex = closeBlock.indexOf('data-conversion="close-signup"');
    const revealBefore = closeBlock.lastIndexOf("<Reveal", ctaIndex);
    const revealClosed = closeBlock.lastIndexOf("</Reveal>", ctaIndex);

    expect(ctaIndex).toBeGreaterThan(0);
    expect(revealClosed).toBeGreaterThan(revealBefore);
  });
});
```

- [ ] **Step 2 : Lancer le test et vérifier qu'il échoue**

```bash
cd apps/marketing && bun test __tests__/landing-motion.test.tsx
```

Attendu : ÉCHEC sur le masthead (`window.addEventListener("scroll"` y est encore) et, très probablement, sur les CTA de `V2Close` (le bloc CTA est enveloppé d'un `<Reveal>` aujourd'hui).

- [ ] **Step 3 : Passer le masthead sur ScrollTrigger**

Dans `apps/marketing/components/v2/masthead.tsx`, remplacer le `useState` + `useEffect` + écouteur par un `useGSAP` qui bascule un attribut de données, et faire dépendre les classes de cet attribut plutôt que d'un état React :

```tsx
"use client";

import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";

import { webAppPath } from "../../lib/web-app-url";
import { ensureGsapPlugins } from "./reveal";

const anchorLinks = [
  { href: "#produit", label: "Produit" },
  { href: "#methode", label: "Méthode" },
  { href: "#tarifs", label: "Tarifs" },
  { href: "/blog", label: "Ressources" },
] as const;

export function V2Masthead() {
  const host = useRef<HTMLElement | null>(null);

  useGSAP(() => {
    ensureGsapPlugins();
    const node = host.current;
    if (!node) return;

    // Un seul observateur du défilement sur la page. Le masthead
    // n'ouvre plus le sien : il lit celui de ScrollTrigger.
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
      data-scrolled="false"
      className="group fixed inset-x-0 top-0 z-40 border-b border-transparent transition-[background-color,border-color,backdrop-filter] duration-300 data-[scrolled=true]:border-[color:var(--v2-line)] data-[scrolled=true]:bg-[color:var(--v2-canvas)]/95 data-[scrolled=true]:backdrop-blur-md"
    >
      <a
        href="#contenu"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-[color:var(--v2-espresso)] focus:px-4 focus:py-2 focus:text-sm focus:text-white"
      >
        Aller au contenu
      </a>
      <div className="relative mx-auto flex h-[72px] max-w-[1200px] items-center justify-between px-5 transition-[height] duration-300 group-data-[scrolled=true]:h-14 md:px-8">
        <Link
          href="/"
          className="v2-display flex min-h-11 items-center gap-2 text-[1.3rem] font-semibold tracking-[-0.02em] text-[color:var(--v2-ink)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[color:var(--v2-accent)]"
        >
          <Image
            src="/brand/biume-logo.svg"
            alt=""
            width={32}
            height={32}
            className="size-8"
          />
          Biume<span className="text-[color:var(--v2-accent)]">.</span>
        </Link>

        <nav
          aria-label="Navigation principale"
          className="absolute left-1/2 hidden -translate-x-1/2 md:block"
        >
          <ul className="flex items-center gap-8">
            {anchorLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="v2-link text-[0.88rem] text-[color:var(--v2-ink)] group-data-[scrolled=true]:text-[color:var(--v2-ink-soft)]"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <Link
          href={webAppPath("/signup")}
          prefetch={false}
          data-conversion="masthead-signup"
          className="v2-btn v2-btn-primary v2-btn-sm"
        >
          Essayer gratuitement
        </Link>
      </div>
    </header>
  );
}
```

Deux invariants que `__tests__/home-landing.test.tsx` assert et qu'il ne faut pas casser : le lien d'évitement `#contenu` reste le **premier** élément focusable de la page, et il précède `aria-label="Navigation principale"` dans le document.

La contraction de hauteur est portée par le conteneur interne via `group-data-[scrolled=true]:h-14` — pas par le `<header>`, dont la hauteur doit rester dictée par son contenu.

- [ ] **Step 4 : Instrumenter les sections restantes**

Dans `apps/marketing/components/v2/sections.tsx` :

1. **`SectionIntro`** — remplacer le `<h2>` par un `CutLines` afin que chaque titre de section monte ligne à ligne :

```tsx
      <CutLines
        as="h2"
        className={`v2-display mt-5 max-w-[22ch] text-[clamp(1.9rem,3.6vw,3rem)] font-medium leading-[1.08] tracking-[-0.04em] text-[color:var(--v2-ink)] [text-wrap:balance] ${center ? "mx-auto" : ""}`}
      >
        {title}
      </CutLines>
```

`CutLines` ne prend pas de prop `id`. L'`id` du titre étant utilisé par `aria-labelledby`, le poser sur le `<p>` d'eyebrow n'irait pas : le déplacer sur le conteneur `Reveal` de `SectionIntro` et faire pointer `aria-labelledby` dessus **casserait la sémantique**. Solution : ajouter une prop `id?: string` à `CutLines` dans `reveal.tsx`, transmise au `Tag`. Modifier `reveal.tsx` en conséquence.

2. **`V2FollowUp` et `V2FieldStories`** — envelopper les images d'un `Drift` de faible amplitude pour que les photos traversent moins de distance que le texte :

```tsx
<Drift distance={18}>
  <Image … />
</Drift>
```

Sur `V2FieldStories`, donner deux amplitudes différentes aux deux photos (`18` et `30`) : le décalage existe déjà en statique, il s'anime.

3. **`V2Pricing`** — remplacer le `<Reveal>` unique autour de la carte par des `Reveal` distincts sur le prix, la liste, et le bloc secondaire — **mais pas sur le bloc des CTA**, qui doit rester immobile et immédiatement cliquable.

4. **`V2Close`** — retirer le `<Reveal>` qui enveloppe le bloc des deux CTA (lignes 493 à 516 dans le fichier d'origine), en gardant celui du titre. Le `<div className="mt-10 flex flex-col …">` remonte d'un niveau.

- [ ] **Step 5 : Lancer toute la suite**

```bash
cd apps/marketing && bun test
```

Attendu : tout passe hormis les 3 échecs pré-existants de `after-dark-orbit-motion.test.tsx`.

- [ ] **Step 6 : Vérifier le lint et le build**

```bash
cd apps/marketing && bun run lint && bun run build
```

- [ ] **Step 7 : Commit**

```bash
git add apps/marketing/components/v2/sections.tsx apps/marketing/components/v2/masthead.tsx apps/marketing/components/v2/reveal.tsx apps/marketing/__tests__/landing-motion.test.tsx
git commit -m "Mouvement du reste de la page, et un seul observateur du défilement

Les titres montent ligne à ligne, les photos dérivent, la carte de prix se
compose. Le masthead cesse d'écouter le scroll pour son compte et lit
celui de ScrollTrigger. Aucun CTA n'est retenu par une entrée animée."
```

---

## Task 7 : Vérification complète

**Files:** aucun fichier créé ; corrections ponctuelles si un point échoue.

- [ ] **Step 1 : Suite complète depuis la racine**

```bash
cd /Users/mathieuchambaud/Documents/Perso-Projects/biume-v2 && bun test
```

Attendu : le nombre de `pass` a augmenté, et les seuls `fail` restants sont les **3 échecs pré-existants** de `components/prototypes/after-dark-orbit-motion.test.tsx`. Tout autre échec est une régression de ce plan.

- [ ] **Step 2 : Vérifier que `app/v2/v2.css` n'a pas bougé**

```bash
cd /Users/mathieuchambaud/Documents/Perso-Projects/biume-v2 && git diff --stat main -- apps/marketing/app/v2/v2.css
```

Attendu : **sortie vide**. Ce fichier sert les 20+ pages SEO. S'il apparaît dans le diff, annuler ses modifications et déplacer le style dans `components/v2/landing.css`.

- [ ] **Step 3 : Vérifier qu'aucune garde reduced-motion n'a été réintroduite**

```bash
cd /Users/mathieuchambaud/Documents/Perso-Projects/biume-v2/apps/marketing && grep -rn "prefers-reduced-motion" components/v2/ || echo "OK — aucune garde"
```

Attendu : `OK — aucune garde`.

- [ ] **Step 4 : Vérifier qu'il n'y a qu'un moteur et qu'un observateur**

```bash
cd /Users/mathieuchambaud/Documents/Perso-Projects/biume-v2/apps/marketing && grep -rn "motion/react\|from \"motion\"" components/v2/ ; grep -rn "addEventListener(\"scroll\"\|addEventListener('scroll'" components/v2/ ; echo "— les deux sorties ci-dessus doivent être vides"
```

- [ ] **Step 5 : Traversée manuelle dans le navigateur**

```bash
cd /Users/mathieuchambaud/Documents/Perso-Projects/biume-v2/apps/marketing && bun run dev
```

Sur `http://localhost:3000`, vérifier chaque point :

1. **Molette et trackpad** — traversée complète, du hero au footer, sans à-coup ni décrochage du pin.
2. **Remontée depuis le bas de page** — les deux sections pinnées se reposent proprement, aucun vol rejoué à l'envers.
3. **Clavier seul** — `Tab` depuis le haut : le lien d'évitement arrive en premier, `Entrée` déplace le focus **et** la vue vers `#contenu`. Puis tous les CTA sont atteignables, y compris pendant les séquences pinnées.
4. **Ancres du masthead** — « Produit » amène bien à l'atelier, sans que le titre passe sous le header. « Méthode » et « Tarifs » également.
5. **Redimensionnement pendant une séquence pinnée** — passer de 1400px à 800px de large en plein milieu du pin : la démonstration doit se retrouver complète, empilée, sans hauteur fantôme ni scroll capturé.
6. **Sous 1024px** — aucune section ne pin, le scroll reste au visiteur du début à la fin.
7. **JavaScript désactivé** — la page entière est lisible : manifeste en texte plein, atelier complet et validé, tous les CTA cliquables. C'est le test le plus important, `/` est indexée.

- [ ] **Step 6 : Commit final s'il reste des corrections**

```bash
git add -A apps/marketing
git commit -m "Corrections de la traversée manuelle de la landing"
```

---

## Auto-revue du plan

**Couverture du spec.** § 1 récit → Tasks 2, 3 ; § 1 ancre `#produit` → Task 3 ; § 1 `V2Control` → Task 5 ; § 2 architecture et Lenis → Task 1 ; § 2 reduced-motion écarté → Task 1 ; § 3 manifeste → Task 2 ; § 4 atelier et Flip → Tasks 3, 4 ; § 5 sous 1024px → Tasks 2, 4 (`WIDE`) ; § 6 reste de la page et masthead → Task 6 ; § 7 conversion → Task 6 (CTA hors `Reveal`) et Task 7 ; § 8 accessibilité → Tasks 3, 4, 7 ; § 9 tests → toutes les tâches ; § 10 hors périmètre → Task 7 steps 2-4.

**Deux points laissés ouverts, délibérément.** La formulation `mm.conditions` de Task 2 step 4 et la reprise du balisage interne du masthead en Task 6 step 3 demandent une vérification navigateur : le plan donne le comportement attendu et le critère de réussite, l'implémenteur choisit la formulation qui marche. Ce ne sont pas des placeholders — l'alternative est écrite dans les deux cas.

**Cohérence des noms.** `ensureGsapPlugins`, `EASE`, `WIDE`, `V2MotionRoot`, `Reveal`, `CutLines`, `HeroReveal`, `HeroItem`, `Drift`, `V2Manifesto`, `V2Atelier`, `useAtelierSequence` — mêmes noms de la Task 1 à la Task 7. `CutLines` gagne une prop `id` en Task 6 step 4, signalée à l'endroit où elle devient nécessaire.
