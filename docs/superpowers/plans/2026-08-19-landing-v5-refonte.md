# Refonte de la landing marketing (nouveau design "SaaS moderne") — plan d'implémentation

> **Pour les agents d'exécution :** SOUS-COMPÉTENCE REQUISE — utiliser
> `superpowers:subagent-driven-development` (recommandé) ou
> `superpowers:executing-plans` pour dérouler ce plan tâche par tâche. Les
> étapes utilisent la syntaxe case à cocher (`- [ ]`) pour le suivi.

**Goal:** Remplacer la landing marketing actuelle (`components/landing-v5`,
la structure « Le parcours » : scroll sticky, plans photo, section contrôle
jouable) par la nouvelle direction « SaaS moderne » du handoff de design :
hero centré avec mockup produit, bandeau de contextes de pratique, bento,
onglets, blocs de fonctions, arc de téléphones, tarifs, FAQ, clôture.

**Architecture:** Tout le texte vit dans un `content.ts` unique
(`components/landing-v5/content.ts`), consommé par des composants serveur
purement présentationnels. Deux nouveaux composants transverses
(`components/frames/phone-frame.tsx`, `browser-frame.tsx`) fournissent les
cadres d'appareils, réutilisés par plusieurs sections. Un seul moteur de
mouvement (`components/landing-v5/motion.tsx`, GSAP + ScrollTrigger + Lenis)
gère les apparitions au scroll et le masthead, sur le même principe déjà en
place dans `components/v2/reveal.tsx` et l'ancien `landing-v5/motion.tsx`.
`app/page.tsx` continue de monter `<LandingV5 />` — le changement est interne
au dossier, aucune route ne bouge.

**Tech Stack:** Next.js App Router, React 19 (composants serveur par défaut,
`"use client"` seulement où l'état ou GSAP l'exigent), Tailwind CSS
(classes arbitraires pour reprendre les valeurs exactes du design), GSAP
3.15 + `@gsap/react` 2.1 + ScrollTrigger + Lenis (déjà des dépendances de
`apps/marketing`), `packages/ui` (`Tabs`, `Accordion`), `next/font/google`
(Hanken Grotesk), `next/image`, Bun test runner (`bun:test`,
`react-dom/server` pour le rendu statique dans les tests).

**Spec:** `/Users/mathieuchambaud/Downloads/design_handoff_landing/README.md`
(à lire en entier — il documente les 15 sections, les tokens exacts, les
interactions et l'accessibilité). Références visuelles à ouvrir dans un
navigateur, à ne jamais copier telles quelles (styles inline propres à
l'outil de design) : `Landing Biume.dc.html`, `PhoneFrame.dc.html`,
`SafariFrame.dc.html` (le même dossier). Elles montrent la forme exacte de
chaque section ; ce plan donne les valeurs et la structure, pas chaque pixel
de JSX — ouvrez le fichier `.dc.html` correspondant à la section en cours
avant de l'écrire.

## Décisions prises avant ce plan (déjà tranchées, ne pas rouvrir)

- **Le dossier `components/landing-v5/` est réutilisé tel quel** — pas de
  `landing-v6`, pas de route d'archive `/v5`. Décision explicite de Mathieu :
  « écraser la landing page actuelle, pas la v5, on s'en fout de la v5 » —
  l'ancienne structure « Le parcours » (et ses ~20 tests dédiés
  `landing-v5-*.test.tsx`) est supprimée dans la Tâche 1, pas archivée.
- **Total annuel : 299,88 €, pas 299,90 €** comme le supposait le handoff.
  Vérifié dans le code existant : `landing-v5/content.ts`
  (`PRICING_PLAN.annual.note`) et `components/landing/pricing-manifest.tsx`
  (testé par `pricing-manifest.test.tsx`) utilisent déjà tous deux
  « 299,88 € », qui est aussi le produit exact de 24,99 € × 12. Aucune
  confirmation à redemander.
- **Colonnes SEO du footer : déjà dans le code**, pas besoin d'aller les
  chercher dans un handoff archivé introuvable
  (`design_handoff_landing_parcours/` n'existe pas sur ce poste). Elles
  vivent dans l'actuel `landing-v5/content.ts` (`FOOTER_COLUMNS`), toutes
  déjà présentes dans `app/sitemap.ts`. Ce plan les réorganise en trois
  colonnes (Produit · Métiers · Société) au lieu des quatre actuelles.
- **Bandeau « métiers » du hero : recentré sur les contextes de pratique de
  l'ostéopathie animalière**, pas sur d'autres professions. `PRODUCT.md`
  ligne 43 est explicite : « Le marketing nomme explicitement les
  ostéopathes animaliers [...] ils ne doivent pas diluer le message
  initial. » Un bandeau listant vétérinaires/comportementalistes/etc.
  contredirait cette règle. Décision (validée par Mathieu, qui a renvoyé la
  question) : lister des **contextes de pratique** de l'ostéopathie
  animalière elle-même — équin, canin, félin, sportif, rural, NAC — pas
  d'autres métiers. Le surtitre du handoff (« Conçu avec les métiers du
  soin animalier ») est changé en conséquence (voir Tâche 3, `TRADES_LEAD`).

## Global Constraints

- **Jamais la promesse « en moins de cinq minutes »** — la page dit « en
  quelques minutes, à la fin de la séance » ou une formulation équivalente.
  Cette promesse chiffrée est réservée à un contexte testé (voir
  `PRODUCT.md` ligne 60-62) et n'apparaît nulle part sur cette landing.
- **Aucune preuve sociale** : pas de témoignage, pas de compteur
  d'utilisateurs, pas de logo client. La démonstration produit (le
  mockup du hero, les onglets du compte rendu) est la seule preuve,
  étiquetée « séance fictive » là où le handoff le demande.
- **Sémantique couleur non négociable : le violet décide, le bleu relie, le
  vert confirme.** Un vert sur un élément d'action serait un défaut à
  rejeter en revue. Aucune couleur hors de la liste `DESIGN.md` /
  ci-dessous.
- **Pas de variante `prefers-reduced-motion`** sur cette page — décision
  produit explicite, déjà en vigueur sur `/` et documentée dans l'ancien
  `landing-v5/motion.tsx`. Ne pas l'introduire.
- **Les éléments interactifs simulés doivent être de vrais éléments
  sémantiques** : `<button>` avec gestion clavier pour les onglets (via
  `Tabs` de `packages/ui`), `<Accordion>` de `packages/ui` pour la FAQ, pas
  de `<span role="button">`.
- **Le responsive du masthead et de l'arc mobile passe par des breakpoints
  Tailwind, jamais par du JS.**
- **CTA d'essai** : `webAppPath("/signup")` (`lib/web-app-url.ts`), avec les
  attributs `data-conversion="..."` sur chaque ancre de conversion
  (`header-signup`, `hero-signup`, `pricing-signup`, `close-signup`) — ce
  sont les points d'ancrage que les tests de conversion cherchent
  (`conversionAnchors(html, "...")` dans `__tests__/landing-test-utils.tsx`).
- **CTA de démonstration** : `DEMO_URL = "https://cal.com/mathieu-chambaud-biume"`.
- **Vérification à chaque tâche** : `cd apps/marketing && bun test <fichier
  de test de la tâche>` puis, à la fin du plan, `bun test` complet. Baseline
  actuelle (avant ce plan) : tous les tests de `apps/marketing/__tests__/`
  passent, y compris les ~20 `landing-v5-*.test.tsx` et `home-landing.test.tsx`
  qui seront supprimés/réécrits par ce plan — leur disparition/changement est
  **attendue**, ce n'est pas une régression. Tous les autres fichiers de
  `__tests__/` (ceux qui touchent `components/landing/`, `app/tarifs`,
  `app/comparatifs`, etc. — non listés dans la Structure des fichiers
  ci-dessous) doivent rester verts sans modification.
- **Ne jamais modifier `packages/ui/src/styles/globals.css`** ni
  `apps/marketing/app/globals.css` au-delà de ce que ce plan demande
  explicitement (rien n'est prévu ici).
- **Design tokens — reprise stricte, aucune couleur nouvelle :**

  | Rôle | Hex |
  | --- | --- |
  | Violet de décision | `#6B5AC8` |
  | Violet doux | `#EEEBFB` |
  | Violet profond | `#4E3FA3` |
  | Violet clair (sur anthracite) | `#8E82E8` |
  | Bleu de liaison | `#5D9BB8` |
  | Bleu doux | `#E8F1F5` |
  | Bleu profond | `#3d738c` |
  | Vert de validation | `#2E9866` |
  | Vert profond | `#21734D` |
  | Vert doux | `#E7F3ED` |
  | Canvas | `#F7F7F4` |
  | Surface nette | `#FDFDFB` |
  | Surface de travail | `#ECECE7` |
  | Bordure de cadre | `#E5E4DE` |
  | Ink | `#1D1D21` |
  | Encre secondaire | `#696970` |
  | Encre intermédiaire | `#4a4a52` |
  | Encre tertiaire | `#8a8a92` / `#a3a39c` |
  | Trait discret | `#DEDED7` |
  | Anthracite | `#202024` |

  Sur anthracite : `#FDFDFB` à `1`, puis `rgba(253,253,251,X)` aux niveaux
  `.82 / .72 / .68 / .66 / .62 / .55 / .44 / .4`.

---

## Structure des fichiers

**Supprimés (Tâche 1)**

| Fichier | Raison |
| --- | --- |
| `apps/marketing/components/landing-v5/{around,boundaries,close,control,facts,faq,follow-up,footer,hero,masthead,motion,owner,photo-plate,pricing,specimen,surfaces}.tsx` | Implémentent « Le parcours », remplacé |
| `apps/marketing/components/landing-v5/content.ts` | Remplacé par un contenu couvrant les nouvelles sections |
| `apps/marketing/components/landing-v5/landing-v5.css` | Remplacé |
| `apps/marketing/components/landing-v5/index.tsx` | Remplacé |
| `apps/marketing/__tests__/landing-v5-{around,boundaries,close,content,control,facts,faq,follow-up,footer,foundation,hero,integration,masthead,motion,owner,photo-plate,pricing,specimen,surfaces}.test.tsx` | Testent des composants supprimés |

**Conservés sans modification**

| Fichier | Rôle |
| --- | --- |
| `apps/marketing/components/landing-v5/fonts.ts` | Chargement Hanken Grotesk, générique — réutilisé tel quel |
| `apps/marketing/app/page.tsx` | Monte déjà `<LandingV5 />` et importe déjà `FAQ` de `./content` — aucun changement de route |

**Créés**

| Fichier | Responsabilité |
| --- | --- |
| `apps/marketing/components/frames/phone-frame.tsx` | Cadre iPhone (SVG + écran mis à l'échelle) |
| `apps/marketing/components/frames/browser-frame.tsx` | Chrome de navigateur (SVG + écran mis à l'échelle) |
| `apps/marketing/components/landing-v5/content.ts` | Toute la copie — source unique |
| `apps/marketing/components/landing-v5/landing-v5.css` | Variables de thème, keyframes, fond quadrillé |
| `apps/marketing/components/landing-v5/motion.tsx` | Moteur GSAP + ScrollTrigger + Lenis, `Reveal` |
| `apps/marketing/components/landing-v5/masthead.tsx` | Barre fixe + menu mobile natif (`<details>`) |
| `apps/marketing/components/landing-v5/hero.tsx` | Section 1 : hero |
| `apps/marketing/components/landing-v5/trades-marquee.tsx` | Section 2 : bandeau de contextes de pratique |
| `apps/marketing/components/landing-v5/facts.tsx` | Section 3 : le constat |
| `apps/marketing/components/landing-v5/bento.tsx` | Section 4 : la solution |
| `apps/marketing/components/landing-v5/report-tabs.tsx` | Section 5 : le compte rendu (onglets) |
| `apps/marketing/components/landing-v5/features.tsx` | Section 6 : trois blocs de fonctions |
| `apps/marketing/components/landing-v5/mobile-arc.tsx` | Section 7 : arc de téléphones + périmètre |
| `apps/marketing/components/landing-v5/owner.tsx` | Section 8 : côté propriétaire |
| `apps/marketing/components/landing-v5/follow-up.tsx` | Section 9 : le suivi |
| `apps/marketing/components/landing-v5/boundaries.tsx` | Section 10 : ce que Biume ne fait pas |
| `apps/marketing/components/landing-v5/pricing.tsx` | Section 11 : tarifs |
| `apps/marketing/components/landing-v5/faq.tsx` | Section 12 : FAQ |
| `apps/marketing/components/landing-v5/close.tsx` | Section 13 : clôture |
| `apps/marketing/components/landing-v5/footer.tsx` | Pied de page |
| `apps/marketing/components/landing-v5/index.tsx` | Assemblage `<LandingV5 />` |
| `apps/marketing/__tests__/frame-scaling.test.tsx` | Teste la brique de calcul d'échelle des cadres |
| `apps/marketing/__tests__/landing-v5-content.test.ts` | Teste `content.ts` (recréé, contenu différent) |
| `apps/marketing/__tests__/landing-v5-masthead.test.tsx` | Teste le masthead et son menu mobile |
| `apps/marketing/__tests__/landing-v5-report-tabs.test.tsx` | Teste les onglets accessibles |
| `apps/marketing/__tests__/landing-v5-pricing.test.tsx` | Teste la bascule mensuel/annuel |
| `apps/marketing/__tests__/landing-v5-faq.test.tsx` | Teste l'accordéon FAQ |

**Modifié**

| Fichier | Changement |
| --- | --- |
| `apps/marketing/__tests__/home-landing.test.tsx` | Réécrit pour les nouveaux marqueurs de section et le nouveau contenu |

---

### Task 1 : Supprimer l'ancienne implémentation « Le parcours »

**Files:**
- Delete: `apps/marketing/components/landing-v5/around.tsx`
- Delete: `apps/marketing/components/landing-v5/boundaries.tsx`
- Delete: `apps/marketing/components/landing-v5/close.tsx`
- Delete: `apps/marketing/components/landing-v5/content.ts`
- Delete: `apps/marketing/components/landing-v5/control.tsx`
- Delete: `apps/marketing/components/landing-v5/facts.tsx`
- Delete: `apps/marketing/components/landing-v5/faq.tsx`
- Delete: `apps/marketing/components/landing-v5/follow-up.tsx`
- Delete: `apps/marketing/components/landing-v5/footer.tsx`
- Delete: `apps/marketing/components/landing-v5/hero.tsx`
- Delete: `apps/marketing/components/landing-v5/index.tsx`
- Delete: `apps/marketing/components/landing-v5/landing-v5.css`
- Delete: `apps/marketing/components/landing-v5/masthead.tsx`
- Delete: `apps/marketing/components/landing-v5/motion.tsx`
- Delete: `apps/marketing/components/landing-v5/owner.tsx`
- Delete: `apps/marketing/components/landing-v5/photo-plate.tsx`
- Delete: `apps/marketing/components/landing-v5/pricing.tsx`
- Delete: `apps/marketing/components/landing-v5/specimen.tsx`
- Delete: `apps/marketing/components/landing-v5/surfaces.tsx`
- Delete: `apps/marketing/__tests__/landing-v5-around.test.tsx`
- Delete: `apps/marketing/__tests__/landing-v5-boundaries.test.tsx`
- Delete: `apps/marketing/__tests__/landing-v5-close.test.tsx`
- Delete: `apps/marketing/__tests__/landing-v5-content.test.ts`
- Delete: `apps/marketing/__tests__/landing-v5-control.test.tsx`
- Delete: `apps/marketing/__tests__/landing-v5-facts.test.tsx`
- Delete: `apps/marketing/__tests__/landing-v5-faq.test.tsx`
- Delete: `apps/marketing/__tests__/landing-v5-follow-up.test.tsx`
- Delete: `apps/marketing/__tests__/landing-v5-footer.test.tsx`
- Delete: `apps/marketing/__tests__/landing-v5-foundation.test.tsx`
- Delete: `apps/marketing/__tests__/landing-v5-hero.test.tsx`
- Delete: `apps/marketing/__tests__/landing-v5-integration.test.tsx`
- Delete: `apps/marketing/__tests__/landing-v5-masthead.test.tsx`
- Delete: `apps/marketing/__tests__/landing-v5-motion.test.tsx`
- Delete: `apps/marketing/__tests__/landing-v5-owner.test.tsx`
- Delete: `apps/marketing/__tests__/landing-v5-photo-plate.test.tsx`
- Delete: `apps/marketing/__tests__/landing-v5-pricing.test.tsx`
- Delete: `apps/marketing/__tests__/landing-v5-specimen.test.tsx`
- Delete: `apps/marketing/__tests__/landing-v5-surfaces.test.tsx`
- Keep untouched: `apps/marketing/components/landing-v5/fonts.ts`
- Keep untouched: `apps/marketing/app/page.tsx`

**Interfaces:**
- Consomme : rien.
- Produit : un dossier `components/landing-v5/` vide sauf `fonts.ts`, prêt
  pour la Tâche 3 et suivantes. `app/page.tsx` continue de référencer
  `../components/landing-v5` et `../components/landing-v5/content` — ces
  imports seront à nouveau satisfaits une fois la Tâche 3 (content.ts) et la
  Tâche 21 (index.tsx) faites. **Entre la Tâche 1 et la Tâche 21, `bun run
  build`/`bun dev` sur `apps/marketing` échoueront** — c'est attendu, ce
  plan n'exige pas un `app/page.tsx` fonctionnel avant la fin ; ne lancez le
  build complet qu'à la Tâche 21.

- [ ] **Étape 1 : confirmer la liste avant suppression**

```bash
cd apps/marketing
git rm components/landing-v5/around.tsx components/landing-v5/boundaries.tsx \
  components/landing-v5/close.tsx components/landing-v5/content.ts \
  components/landing-v5/control.tsx components/landing-v5/facts.tsx \
  components/landing-v5/faq.tsx components/landing-v5/follow-up.tsx \
  components/landing-v5/footer.tsx components/landing-v5/hero.tsx \
  components/landing-v5/index.tsx components/landing-v5/landing-v5.css \
  components/landing-v5/masthead.tsx components/landing-v5/motion.tsx \
  components/landing-v5/owner.tsx components/landing-v5/photo-plate.tsx \
  components/landing-v5/pricing.tsx components/landing-v5/specimen.tsx \
  components/landing-v5/surfaces.tsx
git rm __tests__/landing-v5-around.test.tsx __tests__/landing-v5-boundaries.test.tsx \
  __tests__/landing-v5-close.test.tsx __tests__/landing-v5-content.test.ts \
  __tests__/landing-v5-control.test.tsx __tests__/landing-v5-facts.test.tsx \
  __tests__/landing-v5-faq.test.tsx __tests__/landing-v5-follow-up.test.tsx \
  __tests__/landing-v5-footer.test.tsx __tests__/landing-v5-foundation.test.tsx \
  __tests__/landing-v5-hero.test.tsx __tests__/landing-v5-integration.test.tsx \
  __tests__/landing-v5-masthead.test.tsx __tests__/landing-v5-motion.test.tsx \
  __tests__/landing-v5-owner.test.tsx __tests__/landing-v5-photo-plate.test.tsx \
  __tests__/landing-v5-pricing.test.tsx __tests__/landing-v5-specimen.test.tsx \
  __tests__/landing-v5-surfaces.test.tsx
ls components/landing-v5/
```

Attendu : seul `fonts.ts` reste dans `components/landing-v5/`.

- [ ] **Étape 2 : vérifier qu'aucune autre référence ne casse silencieusement**

```bash
cd apps/marketing
grep -rn "landing-v5/around\|landing-v5/boundaries\|landing-v5/close\|landing-v5/control\|landing-v5/facts\|landing-v5/faq\|landing-v5/follow-up\|landing-v5/footer\|landing-v5/hero\|landing-v5/masthead\|landing-v5/motion\|landing-v5/owner\|landing-v5/photo-plate\|landing-v5/pricing\|landing-v5/specimen\|landing-v5/surfaces" --include="*.tsx" --include="*.ts" app components lib | grep -v "^components/landing-v5/"
```

Attendu : aucun résultat en dehors des fichiers qu'on vient de supprimer
(donc rien du tout, puisqu'ils sont supprimés). Si une route ou un composant
hors de `landing-v5/` apparaît, arrêtez-vous et signalez-le au contrôleur
avant de continuer — cela voudrait dire qu'un autre morceau du site dépend
de l'ancienne structure.

- [ ] **Étape 3 : commit**

```bash
git add -A
git commit -m "chore(marketing): retirer l'ancienne landing-v5 'Le parcours'"
```

---

### Task 2 : Cadres d'appareils — `PhoneFrame` et `BrowserFrame`

Brique la plus technique du plan. Reprend la structure de la bibliothèque
open-source MagicUI (`magicuidesign/magicui`, `apps/www/registry/magicui/iphone.tsx`
et `safari.tsx`, licence MIT), recolorée aux tokens Biume.

**Files:**
- Create: `apps/marketing/components/frames/phone-frame.tsx`
- Create: `apps/marketing/components/frames/browser-frame.tsx`
- Test: `apps/marketing/__tests__/frame-scaling.test.tsx`

**Interfaces:**
- Consomme : rien.
- Produit :
  `export function computeFrameScale(input: { containerWidth: number; screenWidthRatio: number; contentWidth: number }): number`
  (fonction pure, exportée par `phone-frame.tsx`, réutilisée par
  `browser-frame.tsx` — mettez-la dans un module partagé si vous préférez,
  mais gardez un seul nom d'export) ;
  `export function PhoneFrame({ children, className }: { children: ReactNode; className?: string })` ;
  `export function BrowserFrame({ children, className, urlLabel }: { children: ReactNode; className?: string; urlLabel?: string })`.
  Utilisés par les tâches 7, 12, 13.

- [ ] **Étape 1 : écrire le test de la fonction de calcul d'échelle**

Créer `apps/marketing/__tests__/frame-scaling.test.tsx` :

```tsx
import { describe, expect, test } from "bun:test";

import { computeFrameScale } from "../components/frames/phone-frame";

describe("computeFrameScale", () => {
  test("scales fixed-width content down to fit a smaller screen", () => {
    // Cadre de 200px de large, écran = 89.954% du cadre, contenu dessiné à 216px.
    const scale = computeFrameScale({
      containerWidth: 200,
      screenWidthRatio: 0.89954,
      contentWidth: 216,
    });
    // largeur d'écran réelle = 200 * 0.89954 = 179.908
    // scale = 179.908 / 216
    expect(scale).toBeCloseTo(179.908 / 216, 5);
  });

  test("scales fixed-width content up for a larger frame", () => {
    const scale = computeFrameScale({
      containerWidth: 1200,
      screenWidthRatio: 0.99751,
      contentWidth: 1120,
    });
    expect(scale).toBeCloseTo((1200 * 0.99751) / 1120, 5);
  });

  test("returns 0 for a zero-width container instead of dividing into NaN", () => {
    const scale = computeFrameScale({
      containerWidth: 0,
      screenWidthRatio: 0.9,
      contentWidth: 216,
    });
    expect(scale).toBe(0);
  });
});
```

- [ ] **Étape 2 : lancer le test pour vérifier qu'il échoue**

```bash
cd apps/marketing && bun test __tests__/frame-scaling.test.tsx
```

Attendu : ÉCHEC, `Cannot find module '../components/frames/phone-frame'` ou
`computeFrameScale is not a function`.

- [ ] **Étape 3 : implémenter `phone-frame.tsx`**

Créer `apps/marketing/components/frames/phone-frame.tsx` :

```tsx
"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Calcule le facteur d'échelle d'un contenu dessiné à largeur fixe pour
 * qu'il remplisse exactement la zone d'écran d'un cadre d'appareil, quelle
 * que soit la taille réelle du cadre à l'écran.
 *
 * `containerWidth` doit venir de `offsetWidth` (largeur de mise en page),
 * jamais de `getBoundingClientRect().width` : les cadres inclinés (arc
 * mobile, tâche 13) ont un rect visuel différent de leur largeur de mise
 * en page à cause du `transform: rotate(...)`, ce qui fausserait le calcul.
 */
export function computeFrameScale({
  containerWidth,
  screenWidthRatio,
  contentWidth,
}: {
  containerWidth: number;
  screenWidthRatio: number;
  contentWidth: number;
}): number {
  if (containerWidth <= 0 || contentWidth <= 0) return 0;
  return (containerWidth * screenWidthRatio) / contentWidth;
}

const PHONE_CONTENT_WIDTH = 216;
const PHONE_SCREEN = {
  left: 4.908,
  top: 2.183,
  width: 89.954,
  height: 95.635,
  radiusX: 14.32,
  radiusY: 6.61,
};

export function PhoneFrame({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(0);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const measure = () => {
      setScale(
        computeFrameScale({
          containerWidth: node.offsetWidth,
          screenWidthRatio: PHONE_SCREEN.width / 100,
          contentWidth: PHONE_CONTENT_WIDTH,
        }),
      );
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    window.addEventListener("resize", measure);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative aspect-[433/882] ${className ?? ""}`}
    >
      <div
        aria-hidden="true"
        className="absolute overflow-hidden bg-[color:var(--lv5-anthracite)]"
        style={{
          left: `${PHONE_SCREEN.left}%`,
          top: `${PHONE_SCREEN.top}%`,
          width: `${PHONE_SCREEN.width}%`,
          height: `${PHONE_SCREEN.height}%`,
          borderRadius: `${PHONE_SCREEN.radiusX}% / ${PHONE_SCREEN.radiusY}%`,
        }}
      >
        <div
          style={{
            width: `${PHONE_CONTENT_WIDTH}px`,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
          {children}
        </div>
      </div>
      <PhoneBezel />
    </div>
  );
}

function PhoneBezel() {
  return (
    <svg
      viewBox="0 0 433 882"
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden="true"
    >
      <defs>
        <mask id="phone-screen-mask">
          <rect width="433" height="882" fill="white" />
          <rect
            x={(PHONE_SCREEN.left / 100) * 433}
            y={(PHONE_SCREEN.top / 100) * 882}
            width={(PHONE_SCREEN.width / 100) * 433}
            height={(PHONE_SCREEN.height / 100) * 882}
            rx={(PHONE_SCREEN.radiusX / 100) * 433}
            ry={(PHONE_SCREEN.radiusY / 100) * 882}
            fill="black"
          />
        </mask>
      </defs>
      <rect
        width="433"
        height="882"
        rx="64"
        fill="#1D1D21"
        mask="url(#phone-screen-mask)"
      />
      <rect
        width="433"
        height="882"
        rx="64"
        fill="none"
        stroke="#DEDED7"
        strokeWidth="2"
      />
      {/* Dynamic island */}
      <rect x="152" y="28" width="130" height="34" rx="17" fill="#1D1D21" />
      {/* Boutons latéraux */}
      <rect x="-2" y="180" width="4" height="60" rx="2" fill="#DEDED7" />
      <rect x="-2" y="260" width="4" height="90" rx="2" fill="#DEDED7" />
      <rect x="431" y="220" width="4" height="110" rx="2" fill="#DEDED7" />
    </svg>
  );
}
```

- [ ] **Étape 4 : implémenter `browser-frame.tsx`**

Créer `apps/marketing/components/frames/browser-frame.tsx` :

```tsx
"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

import { computeFrameScale } from "./phone-frame";

const BROWSER_CONTENT_WIDTH = 1120;
const BROWSER_SCREEN = {
  left: 0.083,
  top: 6.906,
  width: 99.751,
  height: 92.961,
};

export function BrowserFrame({
  children,
  className,
  urlLabel = "app.biume.com",
}: {
  children: ReactNode;
  className?: string;
  urlLabel?: string;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(0);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const measure = () => {
      setScale(
        computeFrameScale({
          containerWidth: node.offsetWidth,
          screenWidthRatio: BROWSER_SCREEN.width / 100,
          contentWidth: BROWSER_CONTENT_WIDTH,
        }),
      );
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    window.addEventListener("resize", measure);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative aspect-[1203/753] ${className ?? ""}`}
    >
      <div
        aria-hidden="true"
        className="absolute overflow-hidden bg-[color:var(--lv5-surface)]"
        style={{
          left: `${BROWSER_SCREEN.left}%`,
          top: `${BROWSER_SCREEN.top}%`,
          width: `${BROWSER_SCREEN.width}%`,
          height: `${BROWSER_SCREEN.height}%`,
          borderRadius: "0 0 11px 11px",
        }}
      >
        <div
          style={{
            width: `${BROWSER_CONTENT_WIDTH}px`,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
          {children}
        </div>
      </div>
      <BrowserBezel urlLabel={urlLabel} />
    </div>
  );
}

function BrowserBezel({ urlLabel }: { urlLabel: string }) {
  return (
    <svg
      viewBox="0 0 1203 753"
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden="true"
    >
      <rect width="1203" height="753" rx="14" fill="#F0EFEA" stroke="#DEDED7" strokeWidth="1.5" />
      <circle cx="30" cy="27" r="6" fill="#DEDED7" />
      <circle cx="52" cy="27" r="6" fill="#DEDED7" />
      <circle cx="74" cy="27" r="6" fill="#DEDED7" />
      <rect x="420" y="14" width="360" height="26" rx="13" fill="#F0EFEA" stroke="#DEDED7" />
      <text x="600" y="31" textAnchor="middle" fontSize="12" fill="#8a8a92">
        {urlLabel}
      </text>
    </svg>
  );
}
```

- [ ] **Étape 5 : lancer le test pour vérifier qu'il passe**

```bash
cd apps/marketing && bun test __tests__/frame-scaling.test.tsx
```

Attendu : SUCCÈS, 3 tests verts.

- [ ] **Étape 6 : vérifier les types**

```bash
cd apps/marketing && bunx tsc --noEmit
```

Attendu : pas de nouvelle erreur imputable à `components/frames/` (le
build complet échouera encore à cause de `landing-v5/index.tsx` manquant —
ignorez ces erreurs-là jusqu'à la Tâche 21, comme prévu par la Tâche 1).

- [ ] **Étape 7 : commit**

```bash
git add apps/marketing/components/frames apps/marketing/__tests__/frame-scaling.test.tsx
git commit -m "feat(marketing): cadres d'appareils PhoneFrame et BrowserFrame"
```

---

### Task 3 : `content.ts` — source unique de la copie

**Files:**
- Create: `apps/marketing/components/landing-v5/content.ts`
- Test: `apps/marketing/__tests__/landing-v5-content.test.ts`

**Interfaces:**
- Consomme : rien.
- Produit : tous les exports listés ci-dessous. `FAQ` doit garder exactement
  la forme `{ q: string; a: string }[]` (consommée par `faqJsonLd` dans
  `app/page.tsx`, déjà câblé, ne pas renommer). Utilisé par toutes les
  tâches 4-13 et 21.

- [ ] **Étape 1 : écrire le test qui échoue**

Créer `apps/marketing/__tests__/landing-v5-content.test.ts` :

```ts
import { describe, expect, test } from "bun:test";

import {
  BOUNDARIES,
  DEMO_URL,
  FAQ,
  FOOTER_COLUMNS,
  HERO_TITLE_LINE_1,
  HERO_TITLE_LINE_2,
  NAV_LINKS,
  PRICING_PLAN,
  SPECIMEN_STEPS,
  TRADES,
} from "../components/landing-v5/content";

describe("landing-v5 content", () => {
  test("never promises an elapsed time", () => {
    const serialized = JSON.stringify({
      HERO_TITLE_LINE_1,
      HERO_TITLE_LINE_2,
      BOUNDARIES,
      FAQ,
    }).toLowerCase();
    expect(serialized).not.toMatch(/moins de cinq minutes/);
  });

  test("never invents social proof", () => {
    const serialized = JSON.stringify({ FAQ, BOUNDARIES }).toLowerCase();
    expect(serialized).not.toMatch(/témoignage|avis client|utilisateurs actifs/);
  });

  test("keeps the trades banner scoped to animal-osteopathy practice contexts, not other professions", () => {
    const forbiddenProfessions = ["vétérinaire", "comportementaliste", "toiletteur", "dentiste"];
    const serialized = TRADES.items.join(" ").toLowerCase();
    for (const forbidden of forbiddenProfessions) {
      expect(serialized).not.toContain(forbidden);
    }
  });

  test("annual pricing total is the exact product of the monthly-equivalent price", () => {
    expect(PRICING_PLAN.annual.note).toContain("299,88");
    expect(PRICING_PLAN.annual.price).toBe("24,99 €");
  });

  test("has exactly 4 report tabs and 6 FAQ entries, matching the spec", () => {
    expect(SPECIMEN_STEPS).toHaveLength(4);
    expect(FAQ).toHaveLength(6);
  });

  test("has 5 nav links and demo/trial constants", () => {
    expect(NAV_LINKS).toHaveLength(5);
    expect(DEMO_URL).toBe("https://cal.com/mathieu-chambaud-biume");
  });

  test("footer has exactly 3 SEO columns (Produit, Métiers, Société)", () => {
    expect(FOOTER_COLUMNS).toHaveLength(3);
    expect(FOOTER_COLUMNS.map((c) => c.title)).toEqual([
      "Produit",
      "Métiers",
      "Société",
    ]);
  });
});
```

- [ ] **Étape 2 : lancer le test pour vérifier qu'il échoue**

```bash
cd apps/marketing && bun test __tests__/landing-v5-content.test.ts
```

Attendu : ÉCHEC, `Cannot find module '../components/landing-v5/content'`.

- [ ] **Étape 3 : implémenter**

Créer `apps/marketing/components/landing-v5/content.ts` :

```ts
/**
 * Source unique du texte de landing-v5. Aucune preuve inventée : pas de
 * témoignage, pas de compteur d'utilisateurs, pas de logo partenaire. La
 * seule démonstration autorisée est le produit lui-même, étiquetée comme
 * telle. La promesse chiffrée "en moins de cinq minutes" n'apparaît nulle
 * part (réservée à un contexte testé, cf. PRODUCT.md).
 *
 * Le bandeau de contextes de pratique (TRADES) reste centré sur
 * l'ostéopathie animalière elle-même (équin, canin, félin...) et ne nomme
 * jamais d'autre profession — PRODUCT.md : "Le marketing nomme
 * explicitement les ostéopathes animaliers [...] ils ne doivent pas diluer
 * le message initial."
 */

export const DEMO_URL = "https://cal.com/mathieu-chambaud-biume";
export const TRIAL_NOTE =
  "15 jours d'essai · sans carte bancaire · résiliable à tout moment";

export const NAV_LINKS = [
  { href: "#compte-rendu", label: "Compte rendu" },
  { href: "#fonctions", label: "Fonctions" },
  { href: "#mobile", label: "Mobile" },
  { href: "#tarifs", label: "Tarifs" },
  { href: "#questions", label: "Questions" },
] as const;

/* ── Hero ──────────────────────────────────────────────────────── */

export const HERO_PILL_BADGE = "Nouveau";
export const HERO_PILL_TEXT = "Le compte rendu propriétaire, écrit depuis vos notes";

export const HERO_TITLE_LINE_1 = "Vos notes de séance,";
export const HERO_TITLE_LINE_2 = "un compte rendu prêt à envoyer.";

export const HERO_LEAD =
  "Vous notez comme vous avez toujours noté : abrégé, technique, rapide. Biume met en forme pour le propriétaire. Vous relisez passage par passage, et rien ne part avant votre validation.";

export const HERO_CTA_PRIMARY = "Commencer l'essai gratuit";
export const HERO_CTA_SECONDARY = "Voir un compte rendu";

export const HERO_MOCK = {
  subject: "Nashira · jument, 11 ans",
  subtitle: "Séance du 12 mars · à finaliser",
  sendLabel: "Envoyer au propriétaire",
  nav: [
    { label: "Agenda" },
    { label: "Comptes rendus", active: true, badge: "1" },
    { label: "Dossiers" },
    { label: "Suivi" },
    { label: "Réglages" },
  ],
  rawLabel: "Vos notes",
  raw: "palp : tension chaîne thoraco-lombaire G>D, restriction D14-L1 · suites : repos actif 48 h, revoir J+21",
  outLabel: "Compte rendu propriétaire",
  outStatus: "Validé",
  out: [
    "J'ai trouvé une zone de tension le long du dos, plus marquée à gauche, ainsi qu'une articulation du bas du dos qui bougeait moins bien que la normale.",
    "Pendant 48 heures, laissez-la bouger librement au pré, sans travail monté. Je la revois dans trois semaines.",
  ],
  statusBarLeft: "4 sections relues",
  statusBarRight: "Prêt à envoyer",
} as const;

export const HERO_PHONE_MOCK = {
  label: "Espace propriétaire",
  linkLabel: "Lien sécurisé",
  question: "Comment va Nashira depuis la séance ?",
  followUpLabel: "Suivi · J+2",
  cta: "Répondre",
} as const;

/* ── Bandeau de contextes de pratique ─────────────────────────── */

export const TRADES = {
  lead: "Pensé pour tous les contextes de l'ostéopathie animalière",
  items: [
    "Équin",
    "Canin",
    "Félin",
    "Sportif",
    "Rural",
    "NAC",
    "Itinérant",
    "Cabinet fixe",
  ],
} as const;

/* ── Le constat ────────────────────────────────────────────────── */

export const FACTS_EYEBROW = "Le constat";
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

/* ── La solution (bento) ──────────────────────────────────────── */

export const BENTO_EYEBROW = "La solution";
export const BENTO_TITLE = "Un seul geste de plus : valider.";

export const BENTO_NOTES_TO_DOC = {
  title: "Vos notes deviennent un document lisible",
  rawLabel: "Vos notes",
  raw: "mot : raideur post-transport, refus incurvation D",
  outLabel: "Compte rendu",
  out: "Nashira semblait gênée depuis son dernier transport, avec une difficulté à s'incurver du côté droit.",
} as const;

export const BENTO_VALIDATION = {
  title: "Vous validez passage par passage",
  rows: [
    { label: "Motif de la séance", tone: "green" },
    { label: "Examen", tone: "green" },
    { label: "Suites de séance", tone: "violet" },
  ],
} as const;

export const BENTO_OWNER = {
  title: "Le propriétaire lit sur son téléphone",
  card: "Lien sécurisé",
} as const;

export const BENTO_FOLLOW_UP = {
  title: "Le suivi se déclenche tout seul",
  rows: [
    { when: "J+0", label: "Compte rendu envoyé" },
    { when: "J+2", label: "Question de suivi programmée" },
    { when: "J+21", label: "Contrôle rappelé" },
  ],
} as const;

/* ── Le compte rendu (onglets) ────────────────────────────────── */

export const TABS_EYEBROW = "Le compte rendu";
export const TABS_TITLE = "Le même relevé, écrit deux fois.";
export const TABS_LEAD =
  "À gauche, vos notes. À droite, ce que le propriétaire reçoit. Passez d'un temps de la séance à l'autre.";
export const TABS_SUBJECT = "Nashira · jument selle français · 11 ans";
export const TABS_NOTE =
  "Séance fictive, écrite pour la démonstration. Aucun dossier réel n'est utilisé sur cette page.";

export const SPECIMEN_STEPS = [
  {
    id: "motif",
    label: "Motif",
    heading: "Ce que vous notez en arrivant.",
    raw: "mot : raideur post-transport, refus incurvation D, prop. signale gêne dep. 3 sem",
    out: "Vous m'avez appelé parce que Nashira semblait gênée depuis environ trois semaines, en particulier depuis son dernier transport. À l'examen, elle avait effectivement du mal à s'incurver du côté droit.",
  },
  {
    id: "examen",
    label: "Examen",
    heading: "Le vocabulaire technique est traduit, pas effacé.",
    raw: "palp : tension chaîne thoraco-lombaire G>D, restriction D14-L1, sacro-iliaque D sensible",
    out: "J'ai trouvé une zone de tension le long du dos, plus marquée à gauche, ainsi qu'une articulation du bas du dos et le bassin droit qui bougeaient moins bien que la normale.",
  },
  {
    id: "traitement",
    label: "Traitement",
    heading: "Ce que vous avez fait, dit en clair.",
    raw: "ttt : tech. myotensives chaîne dorsale, mobilisation SI D, relâchement diaphragme",
    out: "J'ai travaillé en douceur sur les muscles du dos, remis en mouvement le bassin droit, puis relâché le diaphragme qui participait à la raideur.",
  },
  {
    id: "suites",
    label: "Suites",
    heading: "Les consignes deviennent des dates.",
    raw: "suites : repos actif 48 h, pas de cercle 5 j, revoir J+21",
    out: "Pendant 48 heures, laissez-la bouger librement au pré, sans travail monté. Évitez le travail en cercle pendant cinq jours. Je la revois dans trois semaines.",
  },
] as const;

/* ── Fonctions (3 blocs) ──────────────────────────────────────── */

export const FEATURES_EYEBROW = "Fonctions";
export const FEATURES_TITLE = "Le geste ne change pas, ce qui suit oui.";

export const FEATURES = [
  {
    n: "01",
    title: "Vous notez comme d'habitude",
    body: "Abréviations, sigles, syntaxe télégraphique, ordre libre : Biume part de vos notes telles qu'elles sont.",
    link: "En savoir plus sur la prise de notes",
    phoneLabel: "Vos notes",
    phoneRaw: "mot : raideur post-transport, refus incurvation D",
    phoneCta: "Générer le compte rendu",
  },
  {
    n: "02",
    title: "Vous relisez passage par passage",
    body: "Chaque passage est relu séparément et reste modifiable jusqu'à l'envoi. Rien ne part sans votre validation.",
    link: "En savoir plus sur la relecture",
    phoneStates: ["Motif — Validé", "Examen — Validé", "Suites — À relire"],
    phoneExtract:
      "Vous m'avez appelé parce que Nashira semblait gênée depuis environ trois semaines.",
    phoneActions: ["Corriger", "Valider"],
  },
  {
    n: "03",
    title: "Vous envoyez, le suivi démarre",
    body: "Une fois validé, le document part au propriétaire. Le questionnaire de suivi et le rappel de contrôle se programment tout seuls.",
    link: "En savoir plus sur le suivi",
    phoneStatus: "Envoyé · 14:02",
    phoneFollowUp: "Questionnaire programmé · J+2",
    phoneControl: "Contrôle du 4 avril",
  },
] as const;

/* ── Mobile (arc de téléphones) ───────────────────────────────── */

export const MOBILE_EYEBROW = "Sur le terrain";
export const MOBILE_TITLE = "Le cabinet tient dans une poche.";
export const MOBILE_LEAD =
  "Les rendez-vous du jour, la séance à clôturer, le compte rendu prêt à envoyer — tout tient sur l'écran que vous avez déjà en main.";

export const MOBILE_SCREENS = [
  { label: "Agenda du jour" },
  { label: "Vos notes" },
  { label: "Compte rendu prêt à envoyer" },
  { label: "Suivi · J+2" },
  { label: "Historique" },
] as const;

export const MOBILE_PERIMETER = [
  {
    title: "Agenda et rendez-vous",
    body: "Les séances du jour, à déplacer ou à clôturer.",
  },
  {
    title: "Dossiers en deux champs",
    body: "Un propriétaire et un animal créés en deux champs, complétés au fil des séances.",
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

export const PRICING_EYEBROW = "Tarifs";
export const PRICING_TITLE = "Une formule, deux rythmes.";
export const PRICING_LEAD =
  "Facturé par praticien. Pas par compte rendu, pas par message envoyé.";

export const PRICING_PLAN = {
  monthly: { price: "29,99 €", note: "Sans engagement · résiliable à tout moment" },
  annual: {
    price: "24,99 €",
    note: "Facturé 299,88 € par an · deux mois offerts",
  },
  badge: "Le plus choisi",
  included: [
    "Compte rendu propriétaire à partir de vos notes",
    "Relecture et validation passage par passage",
    "Export PDF, mis en page pour la lecture mobile",
    "Questionnaire de suivi et rappels de contrôle",
    "Dossiers illimités, export complet à tout moment",
  ],
  cta: TRIAL_NOTE,
  ctaLabel: "Commencer l'essai gratuit",
} as const;

export const PRICING_DEMO_CARD = {
  title: "Accompagné · Sur rendez-vous",
  body: "Trente minutes, votre dernière séance comme exemple, et vous repartez avec un compte rendu prêt à envoyer.",
  cta: "Réserver une démonstration",
} as const;

/* ── Questions ─────────────────────────────────────────────────── */

export const FAQ_TITLE = "Questions.";
export const FAQ_CONTACT = "D'autres questions ? Écrivez-nous, on répond vite.";

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
export const CLOSE_CTA_PRIMARY = "Commencer l'essai gratuit";
export const CLOSE_CTA_SECONDARY = "Réserver une démonstration";

/* ── Footer ────────────────────────────────────────────────────── */

export const FOOTER_COLUMNS = [
  {
    title: "Produit",
    links: [
      { href: "#compte-rendu", label: "Le compte rendu" },
      { href: "#fonctions", label: "Fonctions" },
      { href: "#mobile", label: "Mobile" },
      { href: "#tarifs", label: "Tarifs" },
      { href: "#questions", label: "Questions" },
    ],
  },
  {
    title: "Métiers",
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
      { href: "/comparatifs", label: "Tous les comparatifs" },
      { href: "/blog", label: "Blog" },
    ],
  },
  {
    title: "Société",
    links: [
      { href: "/about", label: "À propos" },
      { href: "/cgu", label: "CGU" },
      { href: "/privacy", label: "Confidentialité" },
    ],
  },
] as const;

export const FOOTER_LINE = "© 2026 Biume · Données hébergées en Europe";
```

- [ ] **Étape 4 : lancer le test pour vérifier qu'il passe**

```bash
cd apps/marketing && bun test __tests__/landing-v5-content.test.ts
```

Attendu : SUCCÈS, 7 tests verts.

- [ ] **Étape 5 : commit**

```bash
git add apps/marketing/components/landing-v5/content.ts apps/marketing/__tests__/landing-v5-content.test.ts
git commit -m "feat(marketing): contenu de la nouvelle landing-v5"
```

---

### Task 4 : `landing-v5.css` — tokens de thème et keyframes

**Files:**
- Create: `apps/marketing/components/landing-v5/landing-v5.css`

**Interfaces:**
- Consomme : rien.
- Produit : la classe `.landing-v5` et ses variables `--lv5-*`, plus les
  keyframes `biume-marquee` et `biume-float`, et l'utilitaire de fond
  quadrillé `.lv5-grid-bg` (clair) / `.lv5-grid-bg-dark` (sombre). Utilisé
  par toutes les tâches 6-20.

- [ ] **Étape 1 : implémenter**

Créer `apps/marketing/components/landing-v5/landing-v5.css` :

```css
/* apps/marketing/components/landing-v5/landing-v5.css
   Scope de thème de la nouvelle landing "SaaS moderne". Chargé par
   components/landing-v5/index.tsx uniquement. */

.landing-v5 {
  --lv5-violet: #6B5AC8;
  --lv5-violet-soft: #EEEBFB;
  --lv5-violet-ink: #4E3FA3;
  --lv5-violet-light: #8E82E8;
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
  --lv5-ink-tertiary: #8a8a92;
  --lv5-line: #DEDED7;
  --lv5-frame-border: #E5E4DE;
  --lv5-anthracite: #202024;

  --lv5-radius-control: 11px;
  --lv5-radius-card: 17px;
  --lv5-radius-major: 22px;
  --lv5-radius-block: 26px;

  --lv5-shadow-cta: 0 10px 24px rgba(107, 90, 200, .26);
  --lv5-shadow-hover: 0 14px 30px rgba(29, 29, 33, .09);

  --lv5-font-sans: var(--font-landing-v5-sans), ui-sans-serif, system-ui, sans-serif;
  --lv5-font-mono: ui-monospace, SFMono-Regular, Menlo, monospace;

  background: var(--lv5-canvas);
  color: var(--lv5-ink);
  font-family: var(--lv5-font-sans);
}

/* Fond quadrillé clair : hero, onglets (base), tarifs. */
.lv5-grid-bg {
  background-image:
    linear-gradient(rgba(29, 29, 33, .055) 1px, transparent 1px),
    linear-gradient(90deg, rgba(29, 29, 33, .055) 1px, transparent 1px);
  background-size: 56px 56px;
  -webkit-mask-image: radial-gradient(60% 50% at 50% 0%, black, transparent 75%);
  mask-image: radial-gradient(60% 50% at 50% 0%, black, transparent 75%);
}

/* Fond quadrillé sombre : onglets du compte rendu, clôture. */
.lv5-grid-bg-dark {
  background-image:
    linear-gradient(rgba(253, 253, 251, .05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(253, 253, 251, .05) 1px, transparent 1px);
  background-size: 56px 56px;
  -webkit-mask-image: radial-gradient(60% 50% at 50% 0%, black, transparent 75%);
  mask-image: radial-gradient(60% 50% at 50% 0%, black, transparent 75%);
}

@keyframes biume-marquee {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}

@keyframes biume-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
```

- [ ] **Étape 2 : vérifier que le fichier est syntaxiquement valide**

```bash
cd apps/marketing && bunx tsc --noEmit 2>&1 | grep -i "landing-v5.css" || echo "aucune erreur liée au CSS"
```

Attendu : `aucune erreur liée au CSS` (TypeScript ne compile pas le CSS,
cette étape sert surtout à confirmer qu'aucun import cassé ne le référence
encore à ce stade — normal puisque `index.tsx` n'existe pas avant la
Tâche 21).

- [ ] **Étape 3 : commit**

```bash
git add apps/marketing/components/landing-v5/landing-v5.css
git commit -m "feat(marketing): tokens de theme et fond quadrille de la nouvelle landing-v5"
```

---

### Task 5 : `motion.tsx` — moteur GSAP + ScrollTrigger + Lenis

Reprend directement le principe de l'ancien `landing-v5/motion.tsx` (supprimé
à la Tâche 1) et de `components/v2/reveal.tsx` : un seul moteur de scroll
pour toute la page, sans garde `prefers-reduced-motion` (décision produit).

**Files:**
- Create: `apps/marketing/components/landing-v5/motion.tsx`

**Interfaces:**
- Consomme : rien.
- Produit :
  `export function ensureGsapPlugins(): void`,
  `export const EASE: string`,
  `export function LandingV5MotionRoot({ children }: { children: ReactNode })`,
  `export function Reveal({ children, className, delay }: { children: ReactNode; className?: string; delay?: number })`.
  Utilisés par toutes les tâches 6-20.

- [ ] **Étape 1 : implémenter**

Créer `apps/marketing/components/landing-v5/motion.tsx` — reprendre
exactement le fichier ci-dessous (c'est le même moteur que l'ancien
`landing-v5/motion.tsx`, sans le composant `Parallax` — inutile ici,
la nouvelle direction n'utilise aucune photographie) :

```tsx
"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { useEffect, useRef, type ReactNode } from "react";

/**
 * Moteur de mouvement de landing-v5 : un seul moteur (GSAP + ScrollTrigger
 * + Lenis), sans garde de mouvement réduit — décision produit explicite du
 * handoff. Les sections qui ont besoin de leur propre défilement scrubbé
 * ouvrent leur propre ScrollTrigger (ex. masthead) : ScrollTrigger ne pose
 * qu'un seul écouteur global quel que soit le nombre de
 * `ScrollTrigger.create` dans l'arbre.
 */

let pluginsReady = false;

export function ensureGsapPlugins() {
  if (pluginsReady) return;
  gsap.registerPlugin(useGSAP, ScrollTrigger);
  pluginsReady = true;
}

export const EASE = "expo.out";

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
        start: "top 94%",
        once: true,
        onEnter: (batch) => {
          batch.forEach((el) => {
            const delay = Number(el.getAttribute("data-delay") ?? 0) / 1000;
            gsap.to(el, {
              autoAlpha: 1,
              y: 0,
              duration: 0.8,
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
```

- [ ] **Étape 2 : vérifier les types**

```bash
cd apps/marketing && bunx tsc --noEmit 2>&1 | grep "landing-v5/motion" || echo "pas d'erreur dans motion.tsx"
```

Attendu : `pas d'erreur dans motion.tsx`.

- [ ] **Étape 3 : commit**

```bash
git add apps/marketing/components/landing-v5/motion.tsx
git commit -m "feat(marketing): moteur de mouvement de la nouvelle landing-v5"
```

---

### Task 6 : `masthead.tsx` — barre fixe et menu mobile natif

**Files:**
- Create: `apps/marketing/components/landing-v5/masthead.tsx`
- Test: `apps/marketing/__tests__/landing-v5-masthead.test.tsx`

**Interfaces:**
- Consomme : `NAV_LINKS`, `HERO_CTA_PRIMARY` (tâche 3) ; `ensureGsapPlugins`
  (tâche 5) ; `webAppPath` (`lib/web-app-url.ts`, déjà dans le repo).
- Produit : `export function LandingV5Masthead()`. Utilisé par la tâche 21.

Le menu mobile utilise `<details>`/`<summary>` natifs (pas de state React),
sur le même principe que `components/landing/mobile-menu.tsx` déjà dans le
repo (vérifié : `header-source` ne contient pas `"use client"`, le menu se
ferme via `removeAttribute("open")` au clic sur un lien). La bascule
pilule/burger se fait par une classe Tailwind `max-[980px]:hidden` /
`min-[980px]:hidden`, pas par du JS.

- [ ] **Étape 1 : écrire le test qui échoue**

Créer `apps/marketing/__tests__/landing-v5-masthead.test.tsx` :

```tsx
import { describe, expect, test } from "bun:test";

import { LandingV5Masthead } from "../components/landing-v5/masthead";
import { NAV_LINKS } from "../components/landing-v5/content";
import { renderWithLandingImageConfig, textOnly } from "./landing-test-utils";

describe("LandingV5Masthead", () => {
  test("renders every nav link once, all with real hrefs", () => {
    const html = renderWithLandingImageConfig(<LandingV5Masthead />);
    for (const link of NAV_LINKS) {
      expect(html.match(new RegExp(`href="${link.href}"`, "g"))).toHaveLength(1);
      expect(textOnly(html)).toContain(link.label);
    }
  });

  test("uses a native details/summary for the mobile menu, no client state", async () => {
    const source = await Bun.file(
      new URL("../components/landing-v5/masthead.tsx", import.meta.url),
    ).text();

    expect(source).toContain("<details");
    expect(source).toContain("<summary");
    // Le composant tout entier peut être 'use client' pour le ScrollTrigger
    // du fond du masthead, mais le menu mobile lui-même ne doit dépendre
    // d'aucun useState : c'est le natif <details> qui porte l'état ouvert/fermé.
    expect(source).not.toContain("useState");
  });

  test("keeps the responsive switch in Tailwind breakpoints, not JS", async () => {
    const source = await Bun.file(
      new URL("../components/landing-v5/masthead.tsx", import.meta.url),
    ).text();

    expect(source).toMatch(/max-\[980px\]|min-\[980px\]/);
    expect(source).not.toContain("window.innerWidth");
    expect(source).not.toContain("matchMedia");
  });

  test("has an accessible mobile nav landmark distinct from the desktop one", () => {
    const html = renderWithLandingImageConfig(<LandingV5Masthead />);
    expect(html).toContain('aria-label="Navigation principale"');
    expect(html).toContain('aria-label="Navigation mobile"');
  });
});
```

- [ ] **Étape 2 : lancer le test pour vérifier qu'il échoue**

```bash
cd apps/marketing && bun test __tests__/landing-v5-masthead.test.tsx
```

Attendu : ÉCHEC, `Cannot find module '../components/landing-v5/masthead'`.

- [ ] **Étape 3 : implémenter**

Créer `apps/marketing/components/landing-v5/masthead.tsx`. Structure
attendue (adaptez la mise en forme visuelle au design du README section
« Masthead », mais respectez cette structure sémantique et ces classes de
comportement) :

```tsx
"use client";

import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import Link from "next/link";
import { useRef, type MouseEvent } from "react";

import { HERO_CTA_PRIMARY, NAV_LINKS } from "./content";
import { webAppPath } from "../../lib/web-app-url";
import { ensureGsapPlugins } from "./motion";

function closeOnLinkActivation(event: MouseEvent<HTMLDetailsElement>) {
  if (event.target instanceof Element && event.target.closest("a")) {
    event.currentTarget.removeAttribute("open");
  }
}

export function LandingV5Masthead() {
  const host = useRef<HTMLElement | null>(null);

  useGSAP(() => {
    ensureGsapPlugins();
    const node = host.current;
    if (!node) return;

    node.dataset.scrolled = window.scrollY > 24 ? "true" : "false";

    const trigger = ScrollTrigger.create({
      start: 24,
      onUpdate: (self) => {
        node.dataset.scrolled = self.scroll() > 24 ? "true" : "false";
      },
      onRefresh: (self) => {
        node.dataset.scrolled = self.scroll() > 24 ? "true" : "false";
      },
    });

    return () => trigger.kill();
  });

  return (
    <header
      ref={host}
      data-scrolled="false"
      className="fixed inset-x-0 top-0 z-[60] h-[68px] border-b border-transparent transition-[background-color,border-color,backdrop-filter] duration-[350ms] data-[scrolled=true]:border-[color:var(--lv5-line)] data-[scrolled=true]:bg-[rgba(247,247,244,.82)] data-[scrolled=true]:backdrop-blur-[12px]"
    >
      <a
        href="#contenu"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:min-h-11 focus:rounded-full focus:bg-[color:var(--lv5-violet)] focus:px-4 focus:py-2 focus:text-sm focus:text-white"
      >
        Aller au contenu
      </a>
      <div className="mx-auto flex h-full max-w-[1200px] items-center justify-between gap-5 px-[clamp(18px,4vw,34px)]">
        <Link href="/" className="flex items-center gap-2 text-[1.05rem] font-semibold tracking-[-0.02em] text-[color:var(--lv5-ink)]">
          <Image src="/brand/biume-logo.svg" alt="" width={28} height={28} className="size-7 rounded-lg" />
          Biume
        </Link>

        <nav
          aria-label="Navigation principale"
          className="max-[980px]:hidden flex items-center gap-1 rounded-full border border-[color:var(--lv5-line)] bg-[rgba(253,253,251,.7)] p-1"
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="flex h-[34px] items-center rounded-full px-4 text-[0.88rem] text-[color:var(--lv5-ink-soft)] transition-colors hover:bg-[#F0EFEA] hover:text-[color:var(--lv5-ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--lv5-violet)]"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href={webAppPath("/signup")}
            data-conversion="header-signup"
            className="max-[520px]:hidden inline-flex h-10 items-center rounded-full bg-[color:var(--lv5-violet)] px-5 text-[0.86rem] font-semibold text-white shadow-[var(--lv5-shadow-cta)] transition-opacity hover:opacity-92 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--lv5-violet)]"
          >
            {HERO_CTA_PRIMARY}
          </a>

          <details
            className="min-[980px]:hidden relative"
            onClick={closeOnLinkActivation}
          >
            <summary
              className="flex size-11 items-center justify-center rounded-full border border-[color:var(--lv5-line)] text-[color:var(--lv5-ink)] [&::-webkit-details-marker]:hidden"
              aria-label="Ouvrir le menu"
            >
              <span aria-hidden="true">☰</span>
            </summary>
            <nav
              aria-label="Navigation mobile"
              className="absolute right-0 top-[calc(100%+0.75rem)] w-[min(88vw,320px)] rounded-2xl border border-[color:var(--lv5-line)] bg-[color:var(--lv5-surface)] p-2 shadow-[var(--lv5-shadow-hover)]"
            >
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="flex min-h-12 items-center border-b border-[color:var(--lv5-line)] px-3 text-[0.95rem] text-[color:var(--lv5-ink)] last:border-b-0"
                >
                  {link.label}
                </a>
              ))}
              <a
                href={webAppPath("/signup")}
                data-conversion="header-signup"
                className="mt-2 flex min-h-12 items-center justify-center rounded-full bg-[color:var(--lv5-violet)] px-4 text-[0.9rem] font-semibold text-white"
              >
                {HERO_CTA_PRIMARY}
              </a>
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}
```

Ouvrez `Landing Biume.dc.html` (section masthead) pour comparer le rendu
visuel avant de continuer — ce squelette fixe la sémantique et le
comportement, pas chaque valeur d'espacement.

- [ ] **Étape 4 : lancer le test pour vérifier qu'il passe**

```bash
cd apps/marketing && bun test __tests__/landing-v5-masthead.test.tsx
```

Attendu : SUCCÈS, 4 tests verts.

- [ ] **Étape 5 : commit**

```bash
git add apps/marketing/components/landing-v5/masthead.tsx apps/marketing/__tests__/landing-v5-masthead.test.tsx
git commit -m "feat(marketing): masthead de la nouvelle landing-v5"
```

---

### Task 7 : Hero

**Files:**
- Create: `apps/marketing/components/landing-v5/hero.tsx`

**Interfaces:**
- Consomme : `HERO_PILL_BADGE`, `HERO_PILL_TEXT`, `HERO_TITLE_LINE_1`,
  `HERO_TITLE_LINE_2`, `HERO_LEAD`, `HERO_CTA_PRIMARY`, `HERO_CTA_SECONDARY`,
  `HERO_MOCK`, `HERO_PHONE_MOCK`, `TRIAL_NOTE` (tâche 3) ; `BrowserFrame`,
  `PhoneFrame` (tâche 2) ; `Reveal` (tâche 5) ; `webAppPath`.
- Produit : `export function LandingV5Hero()`. Consommé par la tâche 21.

- [ ] **Étape 1 : implémenter**

Créer `apps/marketing/components/landing-v5/hero.tsx`. Ouvrez d'abord
`Landing Biume.dc.html` (section hero) et `SafariFrame.dc.html` pour le
détail exact du mockup produit. Respectez cette structure :

- `<section id="hero" aria-labelledby="hero-title" className="lv5-grid-bg relative overflow-hidden pt-[calc(68px+clamp(44px,6vw,80px))] pb-[clamp(52px,7vw,96px)]">`
  avec un halo `radial-gradient(64% 44% at 50% 0%, rgba(107,90,200,.16), transparent 72%)`
  posé en `aria-hidden` derrière le contenu.
- Contenu centré, `max-width` autour de `760px` pour le texte : pill
  d'annonce (`HERO_PILL_BADGE` dans un badge violet plein `bg-[color:var(--lv5-violet)] text-white rounded-full px-2.5 py-0.5 text-xs font-semibold` + `HERO_PILL_TEXT` + une flèche `→`), `<h1 id="hero-title">` avec
  `HERO_TITLE_LINE_1` en `text-[color:var(--lv5-ink)]` et
  `HERO_TITLE_LINE_2` en `text-[color:var(--lv5-violet)]`, taille
  `clamp(2.7rem,6.6vw,5.2rem)` / poids `650` / `line-height:.96` /
  `letter-spacing:-.045em` / `text-wrap:balance`.
- `HERO_LEAD` en `<p>`, `clamp(1rem,1.3vw,1.14rem)` / `line-height:1.6` /
  `max-width:54ch` / `color:var(--lv5-ink-soft)`.
- Deux CTA : `<a href={webAppPath("/signup")} data-conversion="hero-signup">`
  avec `HERO_CTA_PRIMARY` en bouton violet plein 52px ; `<a href="#compte-rendu">`
  avec `HERO_CTA_SECONDARY` en bouton surface (bordure `--lv5-line`, fond
  `--lv5-surface`).
- `TRIAL_NOTE` en petit texte `--lv5-ink-tertiary` sous les CTA.
- Le mockup produit : `<BrowserFrame urlLabel="app.biume.com/seances/nashira">`
  dans un cadre externe `padding:8px; background:rgba(253,253,251,.6);
  border:1px solid var(--lv5-frame-border); border-radius:24px;
  filter:drop-shadow(0 26px 56px rgba(29,29,33,.18))`, contenant à
  l'intérieur (dessiné à 1120px de large, avant mise à l'échelle par
  `BrowserFrame`) : une barre latérale de 172px listant `HERO_MOCK.nav`
  (l'item `active` porte un badge `HERO_MOCK.nav[i].badge` violet et un
  fond `--lv5-violet-soft`), un en-tête avec `HERO_MOCK.subject` +
  `HERO_MOCK.subtitle` + un bouton `HERO_MOCK.sendLabel`, un corps en deux
  panneaux (`HERO_MOCK.rawLabel`/`HERO_MOCK.raw` en police mono sur fond
  anthracite à gauche ; `HERO_MOCK.outLabel` avec une puce verte
  `HERO_MOCK.outStatus` et `HERO_MOCK.out.map(...)` à droite, sur
  `--lv5-surface`), une barre de statut basse avec `HERO_MOCK.statusBarLeft`
  et `HERO_MOCK.statusBarRight`.
- Le téléphone flottant : `<PhoneFrame>` positionné en absolu en bas à
  droite du cadre externe (`className="absolute -bottom-10 -right-6 w-[180px] max-[640px]:hidden animate-[biume-float_6s_ease-in-out_infinite]"`),
  contenant `HERO_PHONE_MOCK.label`, `HERO_PHONE_MOCK.linkLabel`,
  `HERO_PHONE_MOCK.followUpLabel` + `HERO_PHONE_MOCK.question`, un bouton
  `HERO_PHONE_MOCK.cta`.
- Fondu bas : `<div aria-hidden className="absolute inset-x-0 bottom-0 h-[150px]" style={{ background: "linear-gradient(to bottom, transparent, var(--lv5-canvas) 74%)" }} />`.
- Enveloppez le bloc mockup entier dans `<Reveal delay={200}>`.

L'écran du mockup est décoratif : enveloppez le `<BrowserFrame>` et le
`<PhoneFrame>` dans un conteneur `aria-hidden="true"` (le contenu simulé
n'est lu par aucun lecteur d'écran, conformément au README section
Accessibilité).

- [ ] **Étape 2 : vérifier les types**

```bash
cd apps/marketing && bunx tsc --noEmit 2>&1 | grep "landing-v5/hero" || echo "pas d'erreur dans hero.tsx"
```

- [ ] **Étape 3 : commit**

```bash
git add apps/marketing/components/landing-v5/hero.tsx
git commit -m "feat(marketing): section hero de la nouvelle landing-v5"
```

---

### Task 8 : Bandeau de contextes de pratique (marquee)

**Files:**
- Create: `apps/marketing/components/landing-v5/trades-marquee.tsx`

**Interfaces:**
- Consomme : `TRADES` (tâche 3).
- Produit : `export function LandingV5TradesMarquee()`. Consommé par la
  tâche 21.

- [ ] **Étape 1 : implémenter**

Créer `apps/marketing/components/landing-v5/trades-marquee.tsx` :

```tsx
import { TRADES } from "./content";

export function LandingV5TradesMarquee() {
  const doubled = [...TRADES.items, ...TRADES.items];

  return (
    <section aria-label={TRADES.lead} className="overflow-hidden py-[clamp(28px,4vw,44px)]">
      <p className="mb-4 text-center text-[0.85rem] text-[color:var(--lv5-ink-soft)]">
        {TRADES.lead}
      </p>
      <div
        aria-hidden="true"
        className="relative"
        style={{
          maskImage: "linear-gradient(90deg, transparent, black 14%, black 86%, transparent)",
          WebkitMaskImage:
            "linear-gradient(90deg, transparent, black 14%, black 86%, transparent)",
        }}
      >
        <div
          className="flex w-max gap-10 whitespace-nowrap"
          style={{ animation: "biume-marquee 36s linear infinite" }}
        >
          {doubled.map((item, index) => (
            <span
              key={`${item}-${index}`}
              className="flex items-center gap-10 text-[clamp(1.05rem,1.5vw,1.3rem)] font-semibold text-[#75757c]"
            >
              {item}
              <span aria-hidden="true">·</span>
            </span>
          ))}
        </div>
      </div>
      {/* Contenu réel pour les technologies d'assistance : la version animée est aria-hidden. */}
      <p className="sr-only">{TRADES.items.join(", ")}</p>
    </section>
  );
}
```

- [ ] **Étape 2 : vérifier les types**

```bash
cd apps/marketing && bunx tsc --noEmit 2>&1 | grep "trades-marquee" || echo "pas d'erreur"
```

- [ ] **Étape 3 : commit**

```bash
git add apps/marketing/components/landing-v5/trades-marquee.tsx
git commit -m "feat(marketing): bandeau de contextes de pratique"
```

---

### Task 9 : Le constat

**Files:**
- Create: `apps/marketing/components/landing-v5/facts.tsx`

**Interfaces:**
- Consomme : `FACTS_EYEBROW`, `FACTS_TITLE`, `FACTS_LEAD`, `FACTS`
  (tâche 3) ; `Reveal` (tâche 5).
- Produit : `export function LandingV5Facts()`. Consommé par la tâche 21.

- [ ] **Étape 1 : implémenter**

Créer `apps/marketing/components/landing-v5/facts.tsx` :

- `<section id="constat" aria-labelledby="facts-title" className="border-x-0 py-[clamp(52px,7vw,96px)] px-[clamp(18px,4vw,34px)]">`,
  contenu centré `max-width:1180px`, encadré par deux filets pointillés
  verticaux `border-x border-dashed border-[#E0DFD8]` sur un conteneur
  interne avec du padding horizontal.
- Pastille `FACTS_EYEBROW` (`text-[0.76rem] font-semibold uppercase
  tracking-[.06em] text-[color:var(--lv5-violet)]`), `<h2 id="facts-title">`
  avec `FACTS_TITLE` (`clamp(2rem,4.2vw,3.5rem)` / `650` / `1.02` /
  `-.04em`), `FACTS_LEAD` en dessous.
- Grille de 3 cartes (`grid-cols-1 md:grid-cols-3 gap-[clamp(16px,2.2vw,24px)]`),
  chaque carte = `<Reveal delay={i * 80}>` enveloppant un `<article>` avec
  un carré `size-8 rounded-lg bg-[color:var(--lv5-violet-soft)]
  text-[color:var(--lv5-violet-ink)]` affichant `fact.n`, un `<h3>` avec
  `fact.title`, un `<p>` avec `fact.body`, et `hover:shadow-[var(--lv5-shadow-hover)]
  transition-shadow` sur la carte.

- [ ] **Étape 2 : vérifier les types**

```bash
cd apps/marketing && bunx tsc --noEmit 2>&1 | grep "landing-v5/facts" || echo "pas d'erreur"
```

- [ ] **Étape 3 : commit**

```bash
git add apps/marketing/components/landing-v5/facts.tsx
git commit -m "feat(marketing): section le constat"
```

---

### Task 10 : La solution (bento)

**Files:**
- Create: `apps/marketing/components/landing-v5/bento.tsx`

**Interfaces:**
- Consomme : `BENTO_EYEBROW`, `BENTO_TITLE`, `BENTO_NOTES_TO_DOC`,
  `BENTO_VALIDATION`, `BENTO_OWNER`, `BENTO_FOLLOW_UP` (tâche 3) ; `Reveal`
  (tâche 5).
- Produit : `export function LandingV5Bento()`. Consommé par la tâche 21.

- [ ] **Étape 1 : implémenter**

Créer `apps/marketing/components/landing-v5/bento.tsx` avec une grille
`grid-cols-1 sm:grid-cols-2 gap-[clamp(16px,2.2vw,24px)]` de 4 tuiles,
toutes `rounded-[var(--lv5-radius-major)] border border-[color:var(--lv5-line)] p-[clamp(22px,4vw,32px)]` :

1. **Tuile large et claire**, `sm:col-span-2`, fond `--lv5-surface` :
   `BENTO_NOTES_TO_DOC.title` en `<h3>`, puis une démonstration verticale —
   `BENTO_NOTES_TO_DOC.rawLabel`/`raw` en police mono sur pastille
   anthracite, une flèche violette `↓`, `BENTO_NOTES_TO_DOC.outLabel`/`out`
   dans une carte bordée `--lv5-line`.
2. **Tuile simple**, fond `--lv5-surface` : `BENTO_VALIDATION.title`, puis
   `BENTO_VALIDATION.rows.map(...)` — chaque ligne avec une puce ronde
   colorée selon `row.tone` (`"green"` → `--lv5-green`, `"violet"` →
   `--lv5-violet`) et `row.label`.
3. **Tuile simple**, fond `--lv5-surface` : `BENTO_OWNER.title`, puis une
   carte bleue `bg-[color:var(--lv5-blue-soft)] text-[color:var(--lv5-blue-ink)]
   rounded-lg px-3 py-2 text-sm` affichant `BENTO_OWNER.card`.
4. **Tuile large et anthracite**, `sm:col-span-2`, fond
   `bg-[color:var(--lv5-anthracite)] text-[rgba(253,253,251,.82)]` :
   `BENTO_FOLLOW_UP.title` en blanc plein, puis
   `BENTO_FOLLOW_UP.rows.map(...)` — chaque ligne avec `row.when` en pilule
   mono `bg-[rgba(253,253,251,.08)]` et `row.label`.

Enveloppez chaque tuile dans `<Reveal delay={i * 60}>`. Le titre de section
(`BENTO_EYEBROW` + `<h2 id="bento-title">{BENTO_TITLE}</h2>`) précède la
grille, dans un `<section id="solution" aria-labelledby="bento-title">`.

- [ ] **Étape 2 : vérifier les types**

```bash
cd apps/marketing && bunx tsc --noEmit 2>&1 | grep "landing-v5/bento" || echo "pas d'erreur"
```

- [ ] **Étape 3 : commit**

```bash
git add apps/marketing/components/landing-v5/bento.tsx
git commit -m "feat(marketing): section la solution (bento)"
```

---

### Task 11 : Le compte rendu (onglets accessibles)

**Files:**
- Create: `apps/marketing/components/landing-v5/report-tabs.tsx`
- Test: `apps/marketing/__tests__/landing-v5-report-tabs.test.tsx`

**Interfaces:**
- Consomme : `TABS_EYEBROW`, `TABS_TITLE`, `TABS_LEAD`, `TABS_SUBJECT`,
  `TABS_NOTE`, `SPECIMEN_STEPS` (tâche 3) ; `Tabs`, `TabsList`,
  `TabsTrigger`, `TabsContent` de `packages/ui/src/components/tabs.tsx`
  (déjà dans le repo, import via `@biume/ui/components/tabs` ou le chemin
  relatif déjà utilisé ailleurs dans `apps/marketing` — vérifiez la
  convention d'import réelle dans un autre fichier `apps/marketing` qui
  importe déjà de `packages/ui` avant d'écrire l'import) ; `Reveal`
  (tâche 5).
- Produit : `export function LandingV5ReportTabs()`. Consommé par la
  tâche 21.

- [ ] **Étape 1 : écrire le test qui échoue**

Créer `apps/marketing/__tests__/landing-v5-report-tabs.test.tsx` :

```tsx
import { describe, expect, test } from "bun:test";

import { LandingV5ReportTabs } from "../components/landing-v5/report-tabs";
import { SPECIMEN_STEPS, TABS_NOTE } from "../components/landing-v5/content";
import { renderWithLandingImageConfig, textOnly } from "./landing-test-utils";

describe("LandingV5ReportTabs", () => {
  test("renders a real tablist with one tab per step, no simulated span roles", () => {
    const html = renderWithLandingImageConfig(<LandingV5ReportTabs />);

    expect(html).toContain('role="tablist"');
    expect(html.match(/role="tab"/g)).toHaveLength(SPECIMEN_STEPS.length);
    expect(html).not.toMatch(/<span[^>]*role="tab"/);
  });

  test("shows the first step's raw and rewritten text by default, and the demo disclaimer", () => {
    const html = renderWithLandingImageConfig(<LandingV5ReportTabs />);
    const text = textOnly(html);

    expect(text).toContain(SPECIMEN_STEPS[0]!.raw);
    expect(text).toContain(SPECIMEN_STEPS[0]!.out);
    expect(text).toContain(TABS_NOTE);
  });

  test("labels every tab with its step label", () => {
    const html = renderWithLandingImageConfig(<LandingV5ReportTabs />);
    const text = textOnly(html);

    for (const step of SPECIMEN_STEPS) {
      expect(text).toContain(step.label);
    }
  });
});
```

- [ ] **Étape 2 : lancer le test pour vérifier qu'il échoue**

```bash
cd apps/marketing && bun test __tests__/landing-v5-report-tabs.test.tsx
```

Attendu : ÉCHEC, `Cannot find module '../components/landing-v5/report-tabs'`.

- [ ] **Étape 3 : implémenter**

D'abord, ouvrez `packages/ui/src/components/tabs.tsx` pour lire la
signature exacte de `Tabs`/`TabsList`/`TabsTrigger`/`TabsContent` (props
`defaultValue`/`value` sur `Tabs`, `value` sur `TabsTrigger`/`TabsContent`)
et confirmez que `TabsList role="tablist"` et `TabsTrigger role="tab"` sont
bien posés par le composant lui-même (c'est ce que le test vérifie
indirectement). Puis créez
`apps/marketing/components/landing-v5/report-tabs.tsx` :

```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@biume/ui/components/tabs";

import { SPECIMEN_STEPS, TABS_EYEBROW, TABS_LEAD, TABS_NOTE, TABS_SUBJECT, TABS_TITLE } from "./content";
import { Reveal } from "./motion";

export function LandingV5ReportTabs() {
  return (
    <section
      id="compte-rendu"
      aria-labelledby="tabs-title"
      className="lv5-grid-bg-dark bg-[color:var(--lv5-anthracite)] py-[clamp(52px,7vw,96px)] px-[clamp(18px,4vw,34px)] text-[rgba(253,253,251,.82)]"
    >
      <div className="mx-auto max-w-[1180px]">
        <p className="text-[0.76rem] font-semibold uppercase tracking-[.06em] text-[color:var(--lv5-violet-light)]">
          {TABS_EYEBROW}
        </p>
        <h2 id="tabs-title" className="mt-2 text-[clamp(2rem,4.2vw,3.5rem)] font-[650] leading-[1.02] tracking-[-0.04em] text-[color:var(--lv5-surface)]">
          {TABS_TITLE}
        </h2>
        <p className="mt-4 max-w-[54ch] text-[rgba(253,253,251,.66)]">{TABS_LEAD}</p>

        <Reveal delay={120}>
          <Tabs defaultValue={SPECIMEN_STEPS[0]!.id} className="mt-10">
            <TabsList aria-label={TABS_TITLE} className="flex flex-wrap gap-2 bg-transparent p-0">
              {SPECIMEN_STEPS.map((step) => (
                <TabsTrigger
                  key={step.id}
                  value={step.id}
                  className="min-h-11 rounded-full px-5 text-sm font-semibold text-[rgba(253,253,251,.62)] data-[state=active]:bg-[color:var(--lv5-violet)] data-[state=active]:text-white data-[state=inactive]:bg-[rgba(253,253,251,.08)]"
                >
                  {step.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {SPECIMEN_STEPS.map((step) => (
              <TabsContent key={step.id} value={step.id} className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-[var(--lv5-radius-card)] bg-[rgba(253,253,251,.05)] p-5">
                  <p className="text-xs uppercase tracking-[.06em] text-[rgba(253,253,251,.44)]">
                    {TABS_SUBJECT}
                  </p>
                  <p className="mt-3 font-[var(--lv5-font-mono)] text-[0.84rem] text-[rgba(253,253,251,.72)]">
                    {step.raw}
                  </p>
                </div>
                <div className="rounded-[var(--lv5-radius-card)] bg-[color:var(--lv5-surface)] p-5 text-[color:var(--lv5-ink)]">
                  <p className="text-xs font-[var(--lv5-font-mono)] uppercase tracking-[.06em] text-[color:var(--lv5-ink-tertiary)]">
                    Compte rendu propriétaire
                  </p>
                  <h3 className="mt-2 text-[1.2rem] font-semibold tracking-[-0.015em]">
                    {step.heading}
                  </h3>
                  <p className="mt-2 text-[0.95rem] leading-[1.6] text-[color:var(--lv5-ink-mid)]">
                    {step.out}
                  </p>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </Reveal>

        <p className="mt-6 text-xs text-[rgba(253,253,251,.4)]">{TABS_NOTE}</p>
      </div>
    </section>
  );
}
```

Si l'import `@biume/ui/components/tabs` ne résout pas (vérifiez avec
`bunx tsc --noEmit` après cette étape), cherchez la convention réelle avec
`grep -rn "from \"@biume/ui/components\|from \"../../../../packages/ui" apps/marketing/components` et corrigez le chemin d'import en conséquence — ne devinez pas, l'étape suivante vous dira immédiatement si c'est cassé.

- [ ] **Étape 4 : lancer le test pour vérifier qu'il passe**

```bash
cd apps/marketing && bun test __tests__/landing-v5-report-tabs.test.tsx
```

Attendu : SUCCÈS, 3 tests verts.

- [ ] **Étape 5 : commit**

```bash
git add apps/marketing/components/landing-v5/report-tabs.tsx apps/marketing/__tests__/landing-v5-report-tabs.test.tsx
git commit -m "feat(marketing): section compte rendu en onglets accessibles"
```

---

### Task 12 : Fonctions (3 blocs alternés)

**Files:**
- Create: `apps/marketing/components/landing-v5/features.tsx`

**Interfaces:**
- Consomme : `FEATURES_EYEBROW`, `FEATURES_TITLE`, `FEATURES` (tâche 3) ;
  `PhoneFrame` (tâche 2) ; `Reveal` (tâche 5).
- Produit : `export function LandingV5Features()`. Consommé par la tâche 21.

- [ ] **Étape 1 : implémenter**

Créer `apps/marketing/components/landing-v5/features.tsx` :
`<section id="fonctions" aria-labelledby="features-title">`, titre de
section, puis `FEATURES.map((feature, i) => ...)` — chaque bloc est un
`<article>` `rounded-[var(--lv5-radius-block)] border border-[color:var(--lv5-line)]
bg-[color:var(--lv5-surface)] p-[clamp(22px,4vw,32px)]` en `flex flex-wrap
md:flex-nowrap` (le 2ᵉ bloc, `i === 1`, en `md:flex-row-reverse` pour
alterner texte/téléphone), avec :

- Côté texte : carré numéroté `feature.n` (`bg-[color:var(--lv5-violet-soft)]
  text-[color:var(--lv5-violet-ink)]`), `<h3>{feature.title}</h3>`
  (`clamp(1.5rem,2.4vw,2.1rem)` / `650` / `1.1` / `-.03em`),
  `<p>{feature.body}</p>`, lien `<a href="#compte-rendu">{feature.link} →</a>`.
- Côté téléphone : `<PhoneFrame className="w-[220px]">`, contenu
  `aria-hidden`, différent par bloc :
  - Bloc 1 : `feature.phoneLabel`/`phoneRaw` en mono, bouton
    `feature.phoneCta`.
  - Bloc 2 : `feature.phoneStates.map(...)` (chaque état avec une puce
    verte si `"Validé"` dans le texte, violette sinon), `feature.phoneExtract`,
    deux boutons `feature.phoneActions`.
  - Bloc 3 : `feature.phoneStatus`, `feature.phoneFollowUp`,
    `feature.phoneControl`.

Enveloppez chaque bloc dans `<Reveal delay={i * 100}>`.

- [ ] **Étape 2 : vérifier les types**

```bash
cd apps/marketing && bunx tsc --noEmit 2>&1 | grep "landing-v5/features" || echo "pas d'erreur"
```

- [ ] **Étape 3 : commit**

```bash
git add apps/marketing/components/landing-v5/features.tsx
git commit -m "feat(marketing): section fonctions (3 blocs alternes)"
```

---

### Task 13 : Mobile (arc de téléphones)

**Files:**
- Create: `apps/marketing/components/landing-v5/mobile-arc.tsx`

**Interfaces:**
- Consomme : `MOBILE_EYEBROW`, `MOBILE_TITLE`, `MOBILE_LEAD`,
  `MOBILE_SCREENS`, `MOBILE_PERIMETER` (tâche 3) ; `PhoneFrame` (tâche 2) ;
  `Reveal` (tâche 5).
- Produit : `export function LandingV5MobileArc()`. Consommé par la
  tâche 21.

**Rappel critique de la tâche 2** : `PhoneFrame` mesure `offsetWidth`, pas
`getBoundingClientRect().width` — c'est justement pour que les cadres
inclinés de cette section (transform `rotate(...)`) calculent correctement
leur échelle. Ne posez la rotation que sur le conteneur externe du
`PhoneFrame`, jamais à l'intérieur de son arbre de mesure.

- [ ] **Étape 1 : implémenter**

Créer `apps/marketing/components/landing-v5/mobile-arc.tsx` :
`<section id="mobile" aria-labelledby="mobile-title"
className="bg-[color:var(--lv5-surface-muted)] py-[clamp(52px,7vw,96px)] px-[clamp(18px,4vw,34px)]">`,
titre de section (`MOBILE_EYEBROW`/`MOBILE_TITLE`/`MOBILE_LEAD`), puis un
conteneur `flex items-end justify-center` avec 5 `<PhoneFrame>`
correspondant à `MOBILE_SCREENS`, chacun dans un `<div>` portant :

- rotation : `-8deg / -4deg / 0deg / 4deg / 8deg` (index 0 à 4) ;
- translation verticale : `18px / 6px / 0px / 6px / 18px` ;
- largeur : `200px / 216px / 244px / 216px / 200px` ;
- `z-index: 2` sur le téléphone central (index 2), `1` sur les autres ;
- marges négatives horizontales pour le chevauchement (`-ml-8` ou
  équivalent en style inline si le calcul dépend de la largeur — utilisez
  `marginLeft: index === 0 ? 0 : "-32px"` en style inline plutôt qu'une
  classe Tailwind fixe, pour garder le contrôle exact du chevauchement) ;
- responsive Tailwind, **pas de JS** : les deux téléphones extérieurs
  (index 0 et 4) portent `hidden min-[900px]:block`, les deux intermédiaires
  (index 1 et 3) portent `hidden min-[700px]:block`. Le central (index 2)
  n'a pas de classe de visibilité.

Chaque écran de téléphone est `aria-hidden`, contenu = `screen.label` en
gros dans le cadre.

Sous l'arc, une grille de 4 cartes `MOBILE_PERIMETER.map(...)`
(`grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4`), chaque carte
`rounded-[var(--lv5-radius-card)] border border-[color:var(--lv5-line)]
bg-[color:var(--lv5-surface)] p-5` avec `item.title` en `<h3>` et
`item.body` en `<p>`.

- [ ] **Étape 2 : vérifier les types**

```bash
cd apps/marketing && bunx tsc --noEmit 2>&1 | grep "mobile-arc" || echo "pas d'erreur"
```

- [ ] **Étape 3 : commit**

```bash
git add apps/marketing/components/landing-v5/mobile-arc.tsx
git commit -m "feat(marketing): section mobile (arc de telephones)"
```

---

### Task 14 : Côté propriétaire

**Files:**
- Create: `apps/marketing/components/landing-v5/owner.tsx`

**Interfaces:**
- Consomme : `OWNER_EYEBROW`, `OWNER_TITLE`, `OWNER_LEAD`, `OWNER_POINTS`,
  `OWNER_MOCK_LINK`, `OWNER_MOCK_FOLLOWUP` (tâche 3) ; `PhoneFrame`
  (tâche 2) ; `Reveal` (tâche 5).
- Produit : `export function LandingV5Owner()`. Consommé par la tâche 21.

- [ ] **Étape 1 : implémenter**

Créer `apps/marketing/components/landing-v5/owner.tsx` :
`<section id="proprietaire" aria-labelledby="owner-title">` en deux
colonnes (`grid-cols-1 md:grid-cols-2 gap-[clamp(28px,5vw,68px)]`). Colonne
gauche : pastille bleue (`OWNER_EYEBROW`, `text-[color:var(--lv5-blue-ink)]`
sur `bg-[color:var(--lv5-blue-soft)]`), `<h2 id="owner-title">{OWNER_TITLE}</h2>`,
`<p>{OWNER_LEAD}</p>`, liste `OWNER_POINTS.map(...)` avec puces bleues.
Colonne droite : deux `<PhoneFrame>` côte à côte (`flex gap-4`) —

- Premier : `OWNER_MOCK_LINK.label`, `OWNER_MOCK_LINK.message`,
  `OWNER_MOCK_LINK.codeLabel`, puis 4 cases (`OWNER_MOCK_LINK.digits.map(...)`)
  dont la case à l'index `2` porte `border-[color:var(--lv5-violet)]
  border-2`, et un bouton bleu plein.
- Second : `OWNER_MOCK_FOLLOWUP.label`, `OWNER_MOCK_FOLLOWUP.question`,
  `OWNER_MOCK_FOLLOWUP.answers.map(...)` (la réponse à
  `OWNER_MOCK_FOLLOWUP.selectedIndex` porte un fond vert
  `--lv5-green-soft` et une coche), `OWNER_MOCK_FOLLOWUP.note` en petit
  texte.

Les deux `PhoneFrame` sont `aria-hidden`. Enveloppez la colonne droite dans
`<Reveal delay={150}>`.

- [ ] **Étape 2 : vérifier les types**

```bash
cd apps/marketing && bunx tsc --noEmit 2>&1 | grep "landing-v5/owner" || echo "pas d'erreur"
```

- [ ] **Étape 3 : commit**

```bash
git add apps/marketing/components/landing-v5/owner.tsx
git commit -m "feat(marketing): section cote proprietaire"
```

---

### Task 15 : Le suivi

**Files:**
- Create: `apps/marketing/components/landing-v5/follow-up.tsx`

**Interfaces:**
- Consomme : `FOLLOW_UP_EYEBROW`, `FOLLOW_UP_TITLE`, `FOLLOW_UP` (tâche 3) ;
  `Reveal` (tâche 5).
- Produit : `export function LandingV5FollowUp()`. Consommé par la
  tâche 21.

- [ ] **Étape 1 : implémenter**

Créer `apps/marketing/components/landing-v5/follow-up.tsx` :
`<section id="suivi" aria-labelledby="follow-up-title"
className="bg-[color:var(--lv5-blue-soft)] py-[clamp(52px,7vw,96px)] px-[clamp(18px,4vw,34px)]">`,
pastille bleue `FOLLOW_UP_EYEBROW`, `<h2 id="follow-up-title">{FOLLOW_UP_TITLE}</h2>`,
puis `grid-cols-1 md:grid-cols-3 gap-[clamp(16px,2.2vw,24px)]` de cartes —
chaque `<Reveal delay={i * 80}>` enveloppant un `<article
className="rounded-[var(--lv5-radius-card)] bg-[color:var(--lv5-surface)] p-5">`
avec un repère mono `step.when` dans une pilule
`bg-[color:var(--lv5-blue-soft)] text-[color:var(--lv5-blue-ink)] font-[var(--lv5-font-mono)]`,
`<h3>{step.title}</h3>`, `<p>{step.body}</p>`.

- [ ] **Étape 2 : vérifier les types**

```bash
cd apps/marketing && bunx tsc --noEmit 2>&1 | grep "follow-up" || echo "pas d'erreur"
```

- [ ] **Étape 3 : commit**

```bash
git add apps/marketing/components/landing-v5/follow-up.tsx
git commit -m "feat(marketing): section le suivi"
```

---

### Task 16 : Ce que Biume ne fait pas

**Files:**
- Create: `apps/marketing/components/landing-v5/boundaries.tsx`

**Interfaces:**
- Consomme : `BOUNDARIES_TITLE`, `BOUNDARIES` (tâche 3) ; `Reveal`
  (tâche 5).
- Produit : `export function LandingV5Boundaries()`. Consommé par la
  tâche 21.

- [ ] **Étape 1 : implémenter**

Créer `apps/marketing/components/landing-v5/boundaries.tsx` :
`<section id="limites" aria-labelledby="boundaries-title">` en deux
colonnes (`grid-cols-1 md:grid-cols-[minmax(0,16ch)_1fr] gap-8`). Gauche :
`<h2 id="boundaries-title">{BOUNDARIES_TITLE}</h2>` (`max-width:16ch`).
Droite : `BOUNDARIES.map((line, i) => ...)`, chaque ligne dans un `<p
className="border-b border-[color:var(--lv5-line)] py-4 last:border-b-0">`,
enveloppée dans `<Reveal delay={i * 50}>`.

- [ ] **Étape 2 : vérifier les types**

```bash
cd apps/marketing && bunx tsc --noEmit 2>&1 | grep "landing-v5/boundaries" || echo "pas d'erreur"
```

- [ ] **Étape 3 : commit**

```bash
git add apps/marketing/components/landing-v5/boundaries.tsx
git commit -m "feat(marketing): section ce que biume ne fait pas"
```

---

### Task 17 : Tarifs (bascule mensuel/annuel)

**Files:**
- Create: `apps/marketing/components/landing-v5/pricing.tsx`
- Test: `apps/marketing/__tests__/landing-v5-pricing.test.tsx`

**Interfaces:**
- Consomme : `PRICING_EYEBROW`, `PRICING_TITLE`, `PRICING_LEAD`,
  `PRICING_PLAN`, `PRICING_DEMO_CARD`, `DEMO_URL` (tâche 3) ; `webAppPath` ;
  `Reveal` (tâche 5).
- Produit : `export function LandingV5Pricing()`. Consommé par la tâche 21.

- [ ] **Étape 1 : écrire le test qui échoue**

Créer `apps/marketing/__tests__/landing-v5-pricing.test.tsx` :

```tsx
import { afterEach, describe, expect, test } from "bun:test";

import { LandingV5Pricing } from "../components/landing-v5/pricing";
import { DEMO_URL, PRICING_PLAN } from "../components/landing-v5/content";
import { webAppPath } from "../../lib/web-app-url";
import { cleanup, fireEvent, render } from "./dom-test-utils";

afterEach(cleanup);

describe("LandingV5Pricing", () => {
  test("shows the monthly price by default and switches to annual on click", () => {
    const { container, getByRole } = render(<LandingV5Pricing />);

    expect(container.textContent).toContain(PRICING_PLAN.monthly.price);
    expect(container.textContent).not.toContain(PRICING_PLAN.annual.note);

    fireEvent.click(getByRole("button", { name: /Annuel/ }));

    expect(container.textContent).toContain(PRICING_PLAN.annual.price);
    expect(container.textContent).toContain(PRICING_PLAN.annual.note);
  });

  test("keeps the exact annual total of 299,88 euros, never 299,90", () => {
    const { container, getByRole } = render(<LandingV5Pricing />);
    fireEvent.click(getByRole("button", { name: /Annuel/ }));

    expect(container.textContent).toContain("299,88");
    expect(container.textContent).not.toContain("299,90");
  });

  test("signup CTA points to webAppPath('/signup') with the pricing-signup conversion marker", () => {
    const { getByRole } = render(<LandingV5Pricing />);
    const link = getByRole("link", { name: PRICING_PLAN.ctaLabel });

    expect(link.getAttribute("href")).toBe(webAppPath("/signup"));
    expect(link.getAttribute("data-conversion")).toBe("pricing-signup");
  });

  test("secondary card links to the demo booking URL", () => {
    const { getByRole } = render(<LandingV5Pricing />);
    const link = getByRole("link", { name: PRICING_DEMO_LABEL() });

    expect(link.getAttribute("href")).toBe(DEMO_URL);
  });
});

function PRICING_DEMO_LABEL() {
  // Importé séparément pour éviter un import inutilisé si le contenu change de forme.
  return require("../components/landing-v5/content").PRICING_DEMO_CARD.cta as string;
}
```

- [ ] **Étape 2 : lancer le test pour vérifier qu'il échoue**

```bash
cd apps/marketing && bun test __tests__/landing-v5-pricing.test.tsx
```

Attendu : ÉCHEC, `Cannot find module '../components/landing-v5/pricing'`.

- [ ] **Étape 3 : implémenter**

Créer `apps/marketing/components/landing-v5/pricing.tsx` :

```tsx
"use client";

import { useState } from "react";

import {
  DEMO_URL,
  PRICING_DEMO_CARD,
  PRICING_EYEBROW,
  PRICING_LEAD,
  PRICING_PLAN,
  PRICING_TITLE,
} from "./content";
import { webAppPath } from "../../lib/web-app-url";
import { Reveal } from "./motion";

export function LandingV5Pricing() {
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");
  const plan = PRICING_PLAN[billing];

  return (
    <section
      id="tarifs"
      aria-labelledby="pricing-title"
      className="bg-[color:var(--lv5-surface-muted)] py-[clamp(52px,7vw,96px)] px-[clamp(18px,4vw,34px)]"
    >
      <div className="mx-auto max-w-[1180px] text-center">
        <p className="text-[0.76rem] font-semibold uppercase tracking-[.06em] text-[color:var(--lv5-violet)]">
          {PRICING_EYEBROW}
        </p>
        <h2 id="pricing-title" className="mt-2 text-[clamp(2rem,4.2vw,3.5rem)] font-[650] leading-[1.02] tracking-[-0.04em]">
          {PRICING_TITLE}
        </h2>
        <p className="mx-auto mt-4 max-w-[54ch] text-[color:var(--lv5-ink-soft)]">
          {PRICING_LEAD}
        </p>

        <div
          role="group"
          aria-label="Rythme de facturation"
          className="mx-auto mt-8 inline-flex rounded-full border border-[color:var(--lv5-line)] bg-[color:var(--lv5-surface)] p-1"
        >
          <button
            type="button"
            aria-pressed={billing === "monthly"}
            onClick={() => setBilling("monthly")}
            className="min-h-11 rounded-full px-5 text-sm font-semibold aria-pressed:bg-[color:var(--lv5-violet)] aria-pressed:text-white"
          >
            Mensuel
          </button>
          <button
            type="button"
            aria-pressed={billing === "annual"}
            onClick={() => setBilling("annual")}
            className="min-h-11 rounded-full px-5 text-sm font-semibold aria-pressed:bg-[color:var(--lv5-violet)] aria-pressed:text-white"
          >
            Annuel
            <span className="ml-1.5 rounded-full bg-[color:var(--lv5-green-soft)] px-1.5 py-0.5 text-[0.68rem] text-[color:var(--lv5-green-ink)]">
              −2 mois
            </span>
          </button>
        </div>

        <div className="mx-auto mt-10 grid max-w-[820px] gap-6 text-left md:grid-cols-2">
          <Reveal>
            <article className="relative rounded-[24px] border-2 border-[color:var(--lv5-violet)] bg-[color:var(--lv5-surface)] p-[clamp(22px,4vw,32px)]">
              <span className="absolute -top-3 left-6 rounded-full bg-[color:var(--lv5-violet)] px-3 py-1 text-xs font-semibold text-white">
                {PRICING_PLAN.badge}
              </span>
              <p className="text-[clamp(2.6rem,5vw,3.8rem)] font-[650] leading-none tracking-[-0.04em]">
                {plan.price}
                <span className="ml-1 text-base font-normal text-[color:var(--lv5-ink-soft)]">
                  par mois
                </span>
              </p>
              <p className="mt-2 text-sm text-[color:var(--lv5-ink-soft)]">{plan.note}</p>
              <ul className="mt-6 divide-y divide-[color:var(--lv5-line)]">
                {PRICING_PLAN.included.map((item) => (
                  <li key={item} className="flex items-start gap-2 py-2.5 text-sm">
                    <span aria-hidden="true" className="mt-0.5 text-[color:var(--lv5-green)]">
                      ✓
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <a
                href={webAppPath("/signup")}
                data-conversion="pricing-signup"
                className="mt-6 flex min-h-13 items-center justify-center rounded-full bg-[color:var(--lv5-violet)] px-6 text-sm font-semibold text-white shadow-[var(--lv5-shadow-cta)]"
              >
                {PRICING_PLAN.ctaLabel}
              </a>
              <p className="mt-3 text-center text-xs text-[color:var(--lv5-ink-tertiary)]">
                {PRICING_PLAN.cta}
              </p>
            </article>
          </Reveal>

          <Reveal delay={80}>
            <article className="flex h-full flex-col justify-between rounded-[24px] bg-[color:var(--lv5-anthracite)] p-[clamp(22px,4vw,32px)] text-[rgba(253,253,251,.82)]">
              <div>
                <h3 className="text-[1.2rem] font-semibold text-[color:var(--lv5-surface)]">
                  {PRICING_DEMO_CARD.title}
                </h3>
                <p className="mt-3 text-sm">{PRICING_DEMO_CARD.body}</p>
              </div>
              <a
                href={DEMO_URL}
                className="mt-6 flex min-h-13 items-center justify-center rounded-full bg-[color:var(--lv5-surface)] px-6 text-sm font-semibold text-[color:var(--lv5-ink)]"
              >
                {PRICING_DEMO_CARD.cta}
              </a>
            </article>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Étape 4 : lancer le test pour vérifier qu'il passe**

```bash
cd apps/marketing && bun test __tests__/landing-v5-pricing.test.tsx
```

Attendu : SUCCÈS, 4 tests verts.

- [ ] **Étape 5 : commit**

```bash
git add apps/marketing/components/landing-v5/pricing.tsx apps/marketing/__tests__/landing-v5-pricing.test.tsx
git commit -m "feat(marketing): section tarifs avec bascule mensuel/annuel"
```

---

### Task 18 : FAQ (accordéon accessible)

**Files:**
- Create: `apps/marketing/components/landing-v5/faq.tsx`
- Test: `apps/marketing/__tests__/landing-v5-faq.test.tsx`

**Interfaces:**
- Consomme : `FAQ_TITLE`, `FAQ`, `FAQ_CONTACT` (tâche 3) ; `Accordion`,
  `AccordionItem`, `AccordionTrigger`, `AccordionContent` de
  `packages/ui/src/components/accordion.tsx`.
- Produit : `export function LandingV5Faq()`. Consommé par la tâche 21.

- [ ] **Étape 1 : écrire le test qui échoue**

Créer `apps/marketing/__tests__/landing-v5-faq.test.tsx` :

```tsx
import { describe, expect, test } from "bun:test";

import { LandingV5Faq } from "../components/landing-v5/faq";
import { FAQ } from "../components/landing-v5/content";
import { renderWithLandingImageConfig, textOnly } from "./landing-test-utils";

describe("LandingV5Faq", () => {
  test("renders every question once, inside its own accordion item", () => {
    const html = renderWithLandingImageConfig(<LandingV5Faq />);

    expect(html.match(/data-slot="accordion-item"/g)).toHaveLength(FAQ.length);
    for (const entry of FAQ) {
      expect(textOnly(html)).toContain(entry.q);
    }
  });

  test("uses the shared Accordion component, not native <details>", async () => {
    const source = await Bun.file(
      new URL("../components/landing-v5/faq.tsx", import.meta.url),
    ).text();

    expect(source).toContain('from "@biume/ui/components/accordion"');
    expect(source).not.toContain("<details");
  });
});
```

- [ ] **Étape 2 : lancer le test pour vérifier qu'il échoue**

```bash
cd apps/marketing && bun test __tests__/landing-v5-faq.test.tsx
```

Attendu : ÉCHEC, `Cannot find module '../components/landing-v5/faq'`.

- [ ] **Étape 3 : implémenter**

D'abord, ouvrez `packages/ui/src/components/accordion.tsx` pour confirmer
que `AccordionItem` pose bien `data-slot="accordion-item"` (c'est ce que le
test vérifie) et lisez la prop attendue par `AccordionTrigger`/`AccordionContent`
pour le texte. Puis créez `apps/marketing/components/landing-v5/faq.tsx` :

```tsx
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@biume/ui/components/accordion";

import { FAQ, FAQ_CONTACT, FAQ_TITLE } from "./content";

export function LandingV5Faq() {
  return (
    <section id="questions" aria-labelledby="faq-title" className="py-[clamp(52px,7vw,96px)] px-[clamp(18px,4vw,34px)]">
      <div className="mx-auto max-w-[900px]">
        <h2 id="faq-title" className="text-center text-[clamp(2rem,4.2vw,3.5rem)] font-[650] leading-[1.02] tracking-[-0.04em]">
          {FAQ_TITLE}
        </h2>

        <Accordion type="single" collapsible className="mt-10 flex flex-col gap-3">
          {FAQ.map((entry, index) => (
            <AccordionItem
              key={entry.q}
              value={`faq-${index}`}
              className="rounded-[16px] border border-[color:var(--lv5-line)] bg-[color:var(--lv5-surface)] px-5"
            >
              <AccordionTrigger className="min-h-14 text-left text-[0.98rem] font-semibold">
                {entry.q}
              </AccordionTrigger>
              <AccordionContent className="pb-5 text-sm leading-[1.6] text-[color:var(--lv5-ink-soft)]">
                {entry.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <p className="mt-8 text-center text-sm text-[color:var(--lv5-ink-soft)]">{FAQ_CONTACT}</p>
      </div>
    </section>
  );
}
```

- [ ] **Étape 4 : lancer le test pour vérifier qu'il passe**

```bash
cd apps/marketing && bun test __tests__/landing-v5-faq.test.tsx
```

Attendu : SUCCÈS, 2 tests verts.

- [ ] **Étape 5 : commit**

```bash
git add apps/marketing/components/landing-v5/faq.tsx apps/marketing/__tests__/landing-v5-faq.test.tsx
git commit -m "feat(marketing): section FAQ en accordeon accessible"
```

---

### Task 19 : Clôture

**Files:**
- Create: `apps/marketing/components/landing-v5/close.tsx`

**Interfaces:**
- Consomme : `CLOSE_TITLE`, `CLOSE_LEAD`, `CLOSE_CTA_PRIMARY`,
  `CLOSE_CTA_SECONDARY`, `DEMO_URL`, `TRIAL_NOTE` (tâche 3) ; `webAppPath`.
- Produit : `export function LandingV5Close()`. Consommé par la tâche 21.

- [ ] **Étape 1 : implémenter**

Créer `apps/marketing/components/landing-v5/close.tsx` :
`<section id="cloture" aria-labelledby="close-title"
className="lv5-grid-bg-dark relative overflow-hidden bg-[color:var(--lv5-anthracite)] py-[clamp(68px,9vw,132px)] px-[clamp(18px,4vw,34px)] text-center text-[color:var(--lv5-surface)]">`
avec deux radiaux en `aria-hidden` (`rgba(107,90,200,.45)` en bas à gauche,
`rgba(93,155,184,.26)` en haut à droite). Contenu centré : `<h2
id="close-title">{CLOSE_TITLE}</h2>` (`clamp(2.2rem,5vw,4.2rem)` / `650` /
`.98` / `-.045em`), `<p>{CLOSE_LEAD}</p>`, deux CTA — `<a
href={webAppPath("/signup")} data-conversion="close-signup">{CLOSE_CTA_PRIMARY}</a>`
en violet plein, `<a href={DEMO_URL}>{CLOSE_CTA_SECONDARY}</a>` en bouton
bordé transparent — puis `TRIAL_NOTE` en petit texte.

- [ ] **Étape 2 : vérifier les types**

```bash
cd apps/marketing && bunx tsc --noEmit 2>&1 | grep "landing-v5/close" || echo "pas d'erreur"
```

- [ ] **Étape 3 : commit**

```bash
git add apps/marketing/components/landing-v5/close.tsx
git commit -m "feat(marketing): section cloture"
```

---

### Task 20 : Footer

**Files:**
- Create: `apps/marketing/components/landing-v5/footer.tsx`

**Interfaces:**
- Consomme : `FOOTER_COLUMNS`, `FOOTER_LINE` (tâche 3).
- Produit : `export function LandingV5Footer()`. Consommé par la tâche 21.

- [ ] **Étape 1 : implémenter**

Créer `apps/marketing/components/landing-v5/footer.tsx` (même structure que
l'ancien footer supprimé à la Tâche 1, avec les nouvelles colonnes à 3
entrées) :

```tsx
import Image from "next/image";
import Link from "next/link";

import { FOOTER_COLUMNS, FOOTER_LINE } from "./content";

export function LandingV5Footer() {
  return (
    <footer className="border-t border-[rgba(253,253,251,.1)] bg-[color:var(--lv5-anthracite)] px-[clamp(18px,4vw,34px)] py-[clamp(40px,5vw,64px)] text-[rgba(253,253,251,.62)]">
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-start gap-10">
        <div className="flex items-center gap-2 text-[1.1rem] font-semibold tracking-[-0.02em] text-[color:var(--lv5-surface)]">
          <Image
            src="/brand/biume-logo.svg"
            alt=""
            width={26}
            height={26}
            className="size-[26px] rounded-[7px]"
          />
          Biume
        </div>

        <nav aria-label="Pied de page" className="flex flex-wrap gap-[clamp(24px,4vw,64px)] text-[0.9rem]">
          {FOOTER_COLUMNS.map((column) => (
            <div key={column.title} className="flex min-w-[150px] flex-col gap-2.5">
              <span className="text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-[rgba(253,253,251,.4)]">
                {column.title}
              </span>
              {column.links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex min-h-11 items-center text-[rgba(253,253,251,.62)]"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        <p className="basis-full border-t border-[rgba(253,253,251,.1)] pt-[26px] text-[0.8rem]">
          {FOOTER_LINE}
        </p>
      </div>
    </footer>
  );
}
```

- [ ] **Étape 2 : vérifier les types**

```bash
cd apps/marketing && bunx tsc --noEmit 2>&1 | grep "landing-v5/footer" || echo "pas d'erreur"
```

- [ ] **Étape 3 : commit**

```bash
git add apps/marketing/components/landing-v5/footer.tsx
git commit -m "feat(marketing): footer avec les 3 colonnes SEO"
```

---

### Task 21 : Assemblage final, branchement de la page, réécriture des tests d'accueil

Dernière tâche : elle assemble toutes les sections, confirme que
`app/page.tsx` fonctionne (il pointe déjà vers `landing-v5`, aucune
modification de route n'est nécessaire), et réécrit
`__tests__/home-landing.test.tsx` pour les nouveaux marqueurs.

**Files:**
- Create: `apps/marketing/components/landing-v5/index.tsx`
- Modify: `apps/marketing/__tests__/home-landing.test.tsx`

**Interfaces:**
- Consomme : tous les composants des tâches 4-20.
- Produit : `export function LandingV5()`, monté par `app/page.tsx`
  (inchangé).

- [ ] **Étape 1 : assembler `index.tsx`**

Créer `apps/marketing/components/landing-v5/index.tsx` :

```tsx
import "./landing-v5.css";

import { LandingV5Bento } from "./bento";
import { LandingV5Boundaries } from "./boundaries";
import { LandingV5Close } from "./close";
import { LandingV5Facts } from "./facts";
import { LandingV5Faq } from "./faq";
import { landingV5FontVariables } from "./fonts";
import { LandingV5Features } from "./features";
import { LandingV5FollowUp } from "./follow-up";
import { LandingV5Footer } from "./footer";
import { LandingV5Hero } from "./hero";
import { LandingV5Masthead } from "./masthead";
import { LandingV5MobileArc } from "./mobile-arc";
import { LandingV5MotionRoot } from "./motion";
import { LandingV5Owner } from "./owner";
import { LandingV5Pricing } from "./pricing";
import { LandingV5ReportTabs } from "./report-tabs";
import { LandingV5TradesMarquee } from "./trades-marquee";

export function LandingV5() {
  return (
    <LandingV5MotionRoot>
      <div className={`landing-v5 ${landingV5FontVariables} min-h-screen antialiased`}>
        <LandingV5Masthead />
        <main id="contenu" tabIndex={-1}>
          <LandingV5Hero />
          <LandingV5TradesMarquee />
          <LandingV5Facts />
          <LandingV5Bento />
          <LandingV5ReportTabs />
          <LandingV5Features />
          <LandingV5MobileArc />
          <LandingV5Owner />
          <LandingV5FollowUp />
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

- [ ] **Étape 2 : vérifier que `app/page.tsx` n'a besoin d'aucun changement**

```bash
cd apps/marketing && cat app/page.tsx
```

Attendu : il importe déjà `{ LandingV5 }` de `"../components/landing-v5"`
et `{ FAQ }` de `"../components/landing-v5/content"`, et rend
`<LandingV5 />` avec les schémas JSON-LD `Service` + `faqJsonLd(FAQ)`. Ces
deux imports sont maintenant satisfaits par les fichiers créés dans ce
plan — **aucune modification de `app/page.tsx` n'est nécessaire**. Si un
export a un nom différent de celui utilisé dans `page.tsx`, corrigez le nom
dans `index.tsx`/`content.ts` pour matcher `page.tsx`, ne touchez pas
`page.tsx`.

- [ ] **Étape 3 : build pour confirmer que tout se résout**

```bash
cd apps/marketing && bunx tsc --noEmit
```

Attendu : aucune erreur dans `components/landing-v5/`, `components/frames/`,
ou `app/page.tsx`. Des erreurs préexistantes ailleurs dans
`apps/marketing` (hors de ce plan) peuvent subsister — comparez avec l'état
d'avant ce plan (`git stash` puis `bunx tsc --noEmit` puis `git stash pop`)
si un doute existe sur ce qui est préexistant.

- [ ] **Étape 4 : réécrire `home-landing.test.tsx`**

Remplacer entièrement `apps/marketing/__tests__/home-landing.test.tsx` par :

```tsx
// apps/marketing/__tests__/home-landing.test.tsx
import { describe, expect, mock, test } from "bun:test";

import {
  CLOSE_TITLE,
  FAQ,
  HERO_TITLE_LINE_1,
  HERO_TITLE_LINE_2,
  TABS_NOTE,
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

describe("Biume homepage (landing-v5, SaaS moderne)", () => {
  test("uses the new landing-v5 composition for the approved homepage story", () => {
    const html = renderWithLandingImageConfig(<HomePage />);
    const markers = [
      "compte-rendu",
      "fonctions",
      "mobile",
      "proprietaire",
      "suivi",
      "limites",
      "tarifs",
      "questions",
    ];

    expect(html).toContain('class="landing-v5 ');
    for (const marker of markers) {
      expect(html.match(new RegExp(`id="${marker}"`, "g"))).toHaveLength(1);
    }
  });

  test("renders the hero title, the report demo disclaimer, prices and FAQ", () => {
    const html = renderWithLandingImageConfig(<HomePage />);
    const text = textOnly(html);

    expect(text).toContain(HERO_TITLE_LINE_1);
    expect(text).toContain(HERO_TITLE_LINE_2);
    expect(text).toContain(TABS_NOTE);
    expect(text).toContain("29,99 €");
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
    for (const target of ["compte-rendu", "fonctions", "mobile", "tarifs", "questions"]) {
      expect(navigationTargets).toContain(target);
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
    expect(faqPage).toBeDefined();
    expect((faqPage?.mainEntity as unknown[] | undefined)?.length).toBe(FAQ.length);
  });

  test("removes the retired 'Le parcours' markers entirely", () => {
    const html = renderWithLandingImageConfig(<HomePage />);

    expect(html).not.toContain("atelier-practice.webp");
    expect(html).not.toContain("atelier-owner.webp");
    expect(html).not.toMatch(/id="controle"/);
  });
});
```

- [ ] **Étape 5 : lancer les tests de la landing**

```bash
cd apps/marketing && bun test __tests__/home-landing.test.tsx __tests__/landing-v5-content.test.ts __tests__/landing-v5-masthead.test.tsx __tests__/landing-v5-report-tabs.test.tsx __tests__/landing-v5-pricing.test.tsx __tests__/landing-v5-faq.test.tsx __tests__/frame-scaling.test.tsx
```

Attendu : SUCCÈS sur tous les fichiers.

- [ ] **Étape 6 : lancer la suite complète du package marketing**

```bash
cd apps/marketing && bun test
```

Attendu : 0 échec. Les fichiers `landing-v5-*.test.tsx` de l'ancienne
structure ont disparu (Tâche 1), c'est attendu. Tout le reste
(`components/landing/*`, les pages SEO, `seo.test.tsx`,
`pricing-manifest.test.tsx`, `mobile-menu.test.ts`, `landing-hero.test.tsx`,
`landing-content.test.ts`) doit rester vert sans avoir été modifié — ce
sont des composants distincts (`components/landing/`), pas touchés par ce
plan.

- [ ] **Étape 7 : build complet**

```bash
cd apps/marketing && bun run build
```

Attendu : build réussi.

- [ ] **Étape 8 : vérification manuelle**

```bash
cd apps/marketing && bun dev
```

Ouvrir `http://localhost:3000` (ou le port affiché) et dérouler, dans cet
ordre, en comparant à `Landing Biume.dc.html` ouvert dans un onglet à côté :

1. Le hero affiche le mockup produit dans un cadre de navigateur net, sans
   rognage, à toutes les largeurs de fenêtre (redimensionner la fenêtre et
   vérifier que `PhoneFrame`/`BrowserFrame` restent nets).
2. Le bandeau de contextes de pratique défile en continu, sans à-coup.
3. Cliquer un onglet du compte rendu (section « Le compte rendu ») bascule
   le panneau sans recharger la page, navigable au clavier (Tab puis
   flèches).
4. La bascule Mensuel/Annuel de la section Tarifs change le prix affiché et
   affiche « 299,88 € » en mode annuel.
5. Ouvrir puis fermer une entrée de FAQ au clavier (Tab, Entrée).
6. Réduire la fenêtre sous 980px : le masthead bascule sur le burger ; sous
   900px puis 700px : les téléphones latéraux de l'arc mobile disparaissent
   par paire.
7. Cliquer le CTA principal du hero et de la clôture : ils mènent vers
   `app.biume.com/signup` (ou `localhost:3001/signup` en dev).
8. Vérifier qu'aucun vert n'apparaît sur un bouton d'action (seulement sur
   des puces d'état validé) et qu'aucune couleur hors de la liste de tokens
   n'apparaît (inspecter quelques éléments au hasard).

- [ ] **Étape 9 : commit**

```bash
git add apps/marketing/components/landing-v5/index.tsx apps/marketing/__tests__/home-landing.test.tsx
git commit -m "feat(marketing): assembler et brancher la nouvelle landing-v5"
```

---

## Auto-revue

**Couverture de la spec.** Masthead + hero + mockups : tâches 2, 6, 7.
Bandeau de contextes de pratique (recadré pour respecter PRODUCT.md) :
tâche 8. Constat, bento, onglets, fonctions, mobile, propriétaire, suivi,
limites, tarifs, FAQ, clôture, footer : tâches 9-20. Assemblage et tests
d'accueil : tâche 21. Contrainte non-technicienne (vocabulaire métier,
action visible) : reprise du contenu existant déjà validé (FAQ, BOUNDARIES,
FOLLOW_UP), pas de nouveau jargon introduit. Système de design (tokens,
zéro couleur nouvelle) : contrôlé par les valeurs exactes recopiées dans
chaque tâche et par `landing-v5-content.test.ts`. Accessibilité (vrais
`<button>`/`Tabs`/`Accordion`, ARIA, focus) : tâches 11 et 18 avec tests
dédiés, reste des sections avec `aria-labelledby` explicite par consigne.

**Points laissés ouverts, à trancher à l'exécution.**

1. Tâche 3 (`TRADES.items`) : la liste des contextes de pratique
   (Équin/Canin/Félin/Sportif/Rural/NAC/Itinérant/Cabinet fixe) est une
   proposition raisonnable mais non validée mot pour mot par Mathieu — il a
   explicitement renvoyé la décision de fond (garder le principe d'un
   bandeau centré sur l'ostéopathie animalière) sans valider la liste
   précise. Si elle ne convient pas à l'exécution ou en revue, l'ajuster
   librement du moment qu'aucun terme ne nomme une autre profession.
2. Tâche 11 (chemin d'import `packages/ui`) : le plan suppose
   `@biume/ui/components/tabs` et `@biume/ui/components/accordion` comme
   convention d'import — à vérifier contre un import déjà existant ailleurs
   dans `apps/marketing` avant d'écrire le premier import, et à corriger
   sans bloquer si la convention réelle diffère.
3. Tâches 7, 12, 13, 14 : les mockups d'appareils sont spécifiés par leur
   contenu et leur structure, pas par un JSX complet pixel-parfait — ouvrir
   `Landing Biume.dc.html` (référence complète) avant d'écrire chaque
   section reste la seule façon de valider l'espacement et la composition
   visuelle exacts.
