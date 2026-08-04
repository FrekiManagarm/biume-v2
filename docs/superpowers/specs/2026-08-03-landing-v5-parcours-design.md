# Landing v5 — « Le parcours »

Date : 2026-08-03
Portée : `apps/marketing`, route `/` (production, indexée)

## Intention

Remplacer `<V2Landing />` (mounté par `app/page.tsx`) par une nouvelle
landing, `<LandingV5 />`, construite à partir d'un handoff de design
externe haute-fidélité. Le handoff complet (README, deux prototypes HTML,
assets) est copié dans ce repo sous
`docs/superpowers/specs/assets/landing-v5-handoff/` pour ne pas dépendre
de `~/Downloads` :

- `README.md` — spec exhaustive : tokens, structure de fichiers proposée,
  comportement section par section, gestion d'état, accessibilité.
- `landing-biume.dc.html` — le prototype haute-fidélité complet, avec le
  JavaScript de référence pour chaque interaction (scroll, démo, contrôle,
  tarifs, FAQ).
- `landing-structures.dc.html` — wireframes des structures explorées,
  utile pour comprendre l'ordre retenu.

**Ce document ne répète pas le handoff.** Il fixe les décisions
techniques que le handoff laisse ouvertes (quel moteur d'animation, quel
menu mobile, quel composant FAQ, quoi faire des tests existants) en les
confrontant aux conventions déjà en place dans `apps/marketing`. Pour la
couleur, la typo, le texte exact d'une section ou le calcul d'une
animation, se référer au handoff — il fait foi et doit être recréé au
pixel, hors des ajustements listés en §6.

Deux règles produit non négociables, redites ici parce qu'un bug dessus
casserait la conformité produit, pas juste le pixel : la promesse « en
moins de cinq minutes » n'apparaît nulle part, et aucune preuve sociale
(témoignage, compteur, logo) n'est ajoutée nulle part sur la page.

## 1. État actuel du repo (pourquoi ce n'est pas une reprise de landing-v4)

`apps/marketing/components/` contient déjà plusieurs arbres de landing :

- **`v2/`** — l'arbre actuellement monté par `app/page.tsx`. Moteur
  GSAP + ScrollTrigger + Lenis unique (`V2MotionRoot` dans `reveal.tsx`),
  sans accommodation `prefers-reduced-motion` (décision produit déjà
  actée et testée). Reste mounté à `/v2` après la bascule.
- **`landing/`** — un arbre complet (header, hero, pricing, FAQ, close,
  practitioner-control, follow-up, transformation-workshop, mobile-menu)
  **orphelin** : aucune route en production ne l'importe. Testé, mais
  avec un moteur différent (`motion/react` + `IntersectionObserver` +
  garde `prefers-reduced-motion`) — l'inverse de la convention retenue
  pour `v2`. Utile comme référence de patterns (menu mobile natif,
  interaction contrôle/validation), pas comme code à réutiliser.
- **`landing-v2/`, `landing-v3/`, `landing-v4/`** — prototypes antérieurs,
  chacun mounté par sa propre route (`app/v2`, `app/v3`, `app/v4`), non
  testés au niveau page d'accueil. `landing-v4/content.ts` est la source
  du texte cité par le handoff (le handoff le dit explicitement), mais le
  copy exact du handoff diverge par endroits (ex. le H1 du hero n'est pas
  formulé pareil) — **ne pas copier `landing-v4/content.ts` tel quel**.

Décision validée avec l'utilisateur : `landing-v5` est écrit **depuis le
handoff**, sans reprendre le code de `landing-v4` ni de `landing/`. Ces
arbres restent en l'état (aucune suppression dans ce chantier) ; seul
`app/page.tsx` change de cible.

## 2. Arborescence

Reprend la structure proposée par le handoff (§ « Structure proposée dans
le repo »), sans changement :

```
apps/marketing/
  app/page.tsx                  → monte <LandingV5 /> au lieu de <V2Landing />
  components/landing-v5/
    index.tsx                   → assemblage des sections, import de landing-v5.css
    landing-v5.css               → variables de thème + keyframes
    fonts.ts                    → Hanken Grotesk via next/font
    content.ts                  → source unique du texte (écrit depuis le handoff)
    motion.tsx                  → 'use client' : moteur unique (voir §3)
    masthead.tsx                → 'use client' pour le menu mobile uniquement
    hero.tsx
    facts.tsx
    specimen.tsx                 → 'use client' (démo sticky, pilotée par motion.tsx)
    photo-plate.tsx
    control.tsx                  → 'use client'
    owner.tsx
    follow-up.tsx
    surfaces.tsx
    around.tsx
    boundaries.tsx
    pricing.tsx                  → 'use client'
    faq.tsx
    close.tsx
    footer.tsx
  lib/seo.tsx                    → + helper FAQPage JSON-LD (nouveau, voir §5)
```

## 3. Moteur de mouvement

Le handoff demande un unique observateur de scroll pilotant masthead,
reveals, parallaxe, démo et fil du suivi — c'est exactement le principe
déjà en place dans `components/v2/reveal.tsx` (`V2MotionRoot` : Lenis +
`gsap.ticker` + un seul `ScrollTrigger.batch` pour les reveals,
`masthead.tsx` qui lit `ScrollTrigger` plutôt que d'ouvrir son propre
listener). C'est ce principe qui est repris, pas le fichier : `v2` reste
mounté à `/v2` et son `V2MotionRoot` est taillé pour ses propres
composants (SplitText sur son hero, etc.) — `landing-v5` a besoin d'un
root distinct pour ses propres effets (rail/volets de la démo, barre de
progression, fil du suivi, passages du contrôle, bascule tarifs).

`landing-v5/motion.tsx` implémente donc son propre root client
(`LandingV5MotionRoot`), sur le même principe qu'en `v2` :

- Un Lenis + un `gsap.ticker`, un seul listener `scroll`/`resize` au
  total sur l'arbre.
- Un `ScrollTrigger.batch("[data-reveal]", { start: "top 90%", once: true })`
  pour toutes les apparitions, délais lus depuis `data-delay`.
- Un `ScrollTrigger` dédié pour l'état `data-scrolled` du masthead (pas
  de listener manuel), sur le modèle de `v2/masthead.tsx`.
- Un `ScrollTrigger` scrubbé par plan photo pour la parallaxe (facteurs
  0.28 / 0.2 / 0.18, cf. handoff §Interactions).
- Un `ScrollTrigger` scrubbé sur la piste `[data-demo-track]` (440vh) qui
  calcule la progression bornée 0–1, met à jour la barre et déclenche
  `setStep` uniquement au changement de palier (`Math.floor(p * 3.999)`,
  borné à 3) — reprend le calcul exact du prototype, pas un
  réagencement.
- Un `ScrollTrigger` scrubbé sur le bloc du fil du suivi, même logique de
  progression bornée que le prototype.

Comme en `v2`, **pas de garde `prefers-reduced-motion`** sur cette page :
c'est une décision produit explicite du handoff, cohérente avec le seul
autre précédent du repo (`v2`).

Le contrôle (validation des passages) et la bascule tarifs sont de
l'état React local (`useState`), pas du DOM impératif comme dans le
prototype — ce sont de vrais boutons avec gestion clavier, cf. §
Accessibilité du handoff.

## 4. Menu mobile

`v2/masthead.tsx` n'a pas de menu mobile (nav simplement masquée sous
`md`). Le pattern que demande le handoff — burger 44×44, panneau plein
largeur natif, `aria-expanded` synchronisé — existe déjà, testé, dans
l'arbre orphelin `components/landing/landing-header.tsx` +
`mobile-menu.tsx` : un header server-rendered, un îlot client minimal à
base de `<details>` pour l'ouverture/fermeture, la fermeture au clic sur
un lien gérée par un handler délégué plutôt que par état React par lien.
`landing-v5/masthead.tsx` adapte ce pattern (pas ce code) au contenu et
aux styles du handoff.

## 5. FAQ

Le handoff utilise `<details>/<summary>` dans le prototype mais demande
explicitement d'utiliser `Accordion` de `packages/ui` en production (le
contexte React de cet accordéon ne survivait pas au moteur du prototype).
`Accordion`/`AccordionItem`/`AccordionTrigger`/`AccordionContent` existent
déjà (`@biume/ui/components/accordion`, base-ui, animation d'ouverture
pilotée en CSS via `data-open`/`data-closed`) — `landing-v5/faq.tsx` en
est le premier consommateur dans le repo. Le chevron et l'ouverture/
fermeture viennent du composant, pas d'un JS maison.

`lib/seo.tsx` n'a aujourd'hui aucun helper `FAQPage`. Un helper
`faqJsonLd(items)` est ajouté, sur le modèle de `pageBreadcrumbJsonLd` +
`<JsonLd>`, et rendu dans `app/page.tsx` à côté du schéma `Service`
existant.

## 6. Contenu

`landing-v5/content.ts` est écrit depuis le texte exact du prototype
(`landing-biume.dc.html`) et du README, pas copié depuis
`landing-v4/content.ts` — les deux divergent par endroits (voir §1).
Mêmes exports que le pattern `landing-v4/content.ts` (un objet ou
constante par section : `DEMO_URL`, `TRIAL_NOTE`, `HERO_*`,
`SPECIMEN_*`, `FACTS`, `CONTROL_PASSAGES`, `FOLLOW_UP`, `BOUNDARIES`,
`PLAN_INCLUDED`, `FAQ`), pour que les futurs tests de contenu s'y
accrochent de la même façon que `landing-content.test.ts` le fait déjà
pour `report-transformation-demo.ts`.

## 7. Bascule et impact sur les tests existants

`app/page.tsx` passe de `<V2Landing />` à `<LandingV5 />` en fin de
chantier (`v2` n'est pas supprimé, reste accessible à `/v2`). Décision
validée avec l'utilisateur : les tests qui verrouillent aujourd'hui
`V2Landing` comme page d'accueil sont **réécrits** pour verrouiller
`LandingV5` à la place, plutôt que laissés rouges ou supprimés :

- `landing-foundation.test.tsx` — verrouille aujourd'hui que
  `app/page.tsx` importe `V2Landing`, les tokens `v2.css`, le chargement
  des polices via `components/v2/fonts.ts`. Réécrit pour verrouiller
  `LandingV5`, `landing-v5.css`, `landing-v5/fonts.ts` (Hanken Grotesk).
- `landing-motion.test.tsx` — verrouille le comportement moteur de `v2`
  (rail de démo, un seul observateur, pas de garde reduced-motion).
  Réécrit pour les mêmes invariants sur `landing-v5/motion.tsx`.
- `home-landing.test.tsx` — verrouille la composition complète de la
  page d'accueil (ids de section, histoire factuelle, prix, FAQ, CTA de
  clôture, absence de preuve sociale). Réécrit avec les ids et le texte
  de `landing-v5` (`produit`, `controle`, `suivi`, `proprietaire`,
  `tarifs`, `questions` — cf. handoff, différent du jeu d'ids de `v2`).
- `seo.test.tsx` — les assertions sur le schéma JSON-LD de la page
  d'accueil (`Service`, absence de `SoftwareApplication`) sont adaptées
  si nécessaire ; le nouveau schéma `FAQPage` (§5) y gagne sa propre
  assertion.

En plus de ces réécritures, `landing-v5` reçoit sa propre couverture par
section (contenu verrouillé, interactions clavier/clic pour le contrôle
et les tarifs, structure du menu mobile), sur le modèle des tests déjà
écrits pour l'arbre orphelin `landing/` (`practitioner-control.test.tsx`,
`pricing-manifest.test.tsx`, `mobile-menu.test.ts`) — mêmes intentions de
test, adaptées aux composants de `landing-v5`.

`app/sitemap.ts` n'a pas connaissance des ancres de section (`#produit`,
etc.), seulement des routes — aucun changement attendu là, à vérifier en
fin de chantier comme le demande le handoff.

## 8. Hors scope

- Aucun nouvel asset : les trois photos et le logo sont déjà dans
  `apps/marketing/public` (vérifié).
- Aucune suppression de `landing-v4/`, `landing/`, `landing-v2/`,
  `landing-v3/` ni de leurs routes/tests propres.
- Aucun changement de tarif, de copy produit ou de règle de conformité
  au-delà de ce que fixe déjà le handoff.
