# Handoff : nouvelle landing page Biume (structure « Le parcours »)

## Overview

Nouvelle page d'accueil marketing pour Biume — produit de compte rendu propriétaire et de suivi post-séance pour ostéopathes et praticiens animaliers.

La page raconte une séance dans l'ordre où elle se vit : promesse → constat → démonstration du compte rendu → contrôle du praticien → propriétaire → suivi → surfaces mobile/web → limites → tarifs → questions → clôture. Objectifs, dans cet ordre de priorité : démarrage de l'essai 15 jours, réservation d'une démonstration, référencement (liens vers les pages SEO existantes).

Destination : `apps/marketing` (Next.js App Router). Elle remplace, à terme, `components/v2` monté par `app/page.tsx`.

## About the Design Files

Les fichiers de ce bundle sont des **références de design réalisées en HTML** — des prototypes qui montrent l'apparence et le comportement visés, **pas du code de production à copier tel quel**.

Le travail consiste à **recréer ces designs dans l'environnement existant de `apps/marketing`** : Next.js App Router, React 19, Tailwind, `next/font`, `next/image`, GSAP (`@gsap/react` + `ScrollTrigger`), variables CSS de thème dans un fichier `landing-*.css` importé par le composant racine. Les styles du prototype sont écrits en inline pour des raisons propres à l'outil de design ; **en production, utilisez les classes Tailwind et les variables CSS comme le font déjà `components/v2` et `components/landing-v4`.**

## Fidelity

**High-fidelity.** Couleurs, typographie, échelles d'espacement, rayons, ombres et copie sont définitifs et repris de `apps/marketing/DESIGN.md`. La copie provient de `components/landing-v4/content.ts` et de `PRODUCT.md`. À recréer au pixel.

Deux règles produit à ne pas casser :
- La promesse chiffrée « en moins de cinq minutes » **n'apparaît nulle part** (interdite par `PRODUCT.md` avant validation terrain). La page dit ce que fait le produit, pas combien de temps il fait gagner.
- Aucune preuve sociale : pas de témoignage, pas de compteur d'utilisateurs, pas de logo client. La démonstration produit est la seule preuve, et elle est étiquetée « séance fictive ».
- La règle `prefers-reduced-motion` de `DESIGN.md` **ne s'applique pas ici** (décision produit prise pour cette page).

## Structure proposée dans le repo

```
apps/marketing/
  app/page.tsx                        → monte <LandingV5 /> à la place de <V2Landing />
  components/landing-v5/
    index.tsx                         → assemblage des sections
    landing-v5.css                    → variables de thème + keyframes
    fonts.ts                          → Hanken Grotesk via next/font
    motion.tsx                        → 'use client' : reveals, parallaxe, pilote de la démo, fil du suivi
    masthead.tsx                      → 'use client' (menu mobile)
    hero.tsx
    facts.tsx                         → « Le constat »
    specimen.tsx                      → « Le relevé » (démo sticky) — 'use client'
    photo-plate.tsx                   → plan photo réutilisable (2 usages)
    control.tsx                       → 'use client' (validation des passages)
    owner.tsx                         → « Côté propriétaire »
    follow-up.tsx                     → « Le suivi »
    surfaces.tsx                      → mobile + web
    around.tsx                        → « Autour du compte rendu »
    boundaries.tsx                    → « Ce que Biume ne fait pas »
    pricing.tsx                       → 'use client' (bascule mensuel/annuel)
    faq.tsx
    close.tsx
    footer.tsx
```

Réutilisez `lib/web-app-url.ts` (`webAppPath("/signup")`) pour tous les CTA d'essai et conservez les attributs `data-conversion="..."` comme dans `components/v2/hero.tsx` et `masthead.tsx`. La démonstration accompagnée pointe vers `https://cal.com/mathieu-chambaud-biume` (constante `DEMO_URL` de `landing-v4/content.ts`).

## Design Tokens

Reprise stricte de `apps/marketing/DESIGN.md`. Aucune couleur nouvelle.

### Couleurs

| Rôle | Hex | Usage dans la page |
| --- | --- | --- |
| Violet de décision | `#6B5AC8` | CTA primaires, volet actif de la démo, chiffres 01/02/03, chevrons FAQ, dot du pill |
| Violet de décision doux | `#EEEBFB` | chip « Mobile », carte démonstration accompagnée, surlignage de sélection |
| Violet profond (texte sur violet doux) | `#4E3FA3` | texte des chips violettes, hover des liens |
| Bleu de liaison | `#5D9BB8` | section suivi (fil, pastilles, éyebrow), section propriétaire |
| Bleu de liaison doux | `#E8F1F5` | fond de la section suivi, chip « Web », carte lien sécurisé |
| Bleu profond (texte) | `#3d738c` | texte des chips bleues |
| Vert de validation | `#2E9866` | états validés uniquement (bordure, pastilles de la liste tarifs) |
| Vert de validation profond | `#21734D` | texte sur vert doux |
| Vert de validation doux | `#E7F3ED` | fond d'état confirmé (« Validé par vous », « Envoyé · 14:02 ») |
| Blanc atelier (canvas) | `#F7F7F4` | fond de page |
| Surface nette | `#FDFDFB` | cartes, documents, panneau du compte rendu |
| Surface de travail | `#ECECE7` | notes brutes, champs inactifs, bascule tarifs, section limites |
| Anthracite précis (ink) | `#1D1D21` | texte principal |
| Encre secondaire | `#696970` | explications, métadonnées |
| Encre intermédiaire | `#4a4a52` | listes de la section suivi et des surfaces |
| Trait discret | `#DEDED7` | bordures, séparateurs |
| Anthracite profond | `#202024` | section démonstration, clôture, footer |

Sur fond anthracite, les niveaux de texte sont `#FDFDFB`, `rgba(253,253,251,.72)`, `.66`, `.62`, `.44`, `.4`.

Rappel sémantique : **le violet décide, le bleu relie, le vert confirme.** Le vert est interdit pour une promesse ou une décoration.

### Typographie

Hanken Grotesk (via `next/font/google`, `variable: "--font-hanken"`), pile de secours `ui-sans-serif, system-ui, sans-serif`. Monospace système pour les valeurs fonctionnelles uniquement (`ui-monospace, SFMono-Regular, Menlo, monospace`).

| Style | Valeurs |
| --- | --- |
| H1 hero | `clamp(2.7rem, 6.2vw, 5.4rem)` / 650 / line-height .94 / letter-spacing -.035em / `text-wrap:balance` / max-width 19ch |
| H2 section | `clamp(2rem, 4vw, 3.6rem)` / 650 / 1.02 / -.03em |
| H2 clôture | `clamp(2.2rem, 5vw, 4.4rem)` / 650 / .98 / -.035em |
| H2 « Autour du compte rendu » | `clamp(1.5rem, 2.4vw, 2.1rem)` / 600 / -.02em |
| H3 carte | 1.3rem / 600 / 1.2 / -.01em |
| H3 suivi | 1.32rem / 600 / -.01em |
| Accroche hero | `clamp(1.02rem, 1.35vw, 1.2rem)` / 400 / 1.6 / max 56ch |
| Corps | .98–1.06rem / 400 / 1.55–1.65 / `text-wrap:pretty` |
| Fonctionnel (mono) | .68–.9rem / 600 / letter-spacing .02–.08em, souvent `text-transform:uppercase` |
| Prix | `clamp(2.6rem, 5vw, 4rem)` / 650 / 1 / -.035em |

Interlettrage négatif : jamais au-delà de `-.04em`.

### Espacement, rayons, ombres

- Padding vertical de section : `clamp(72px, 10vw, 128px)`. Clôture : `clamp(84px, 11vw, 152px)`.
- Padding horizontal partout : `clamp(18px, 4vw, 34px)`, conteneur `max-width: 1200px`, centré.
- Gouttières : cartes `clamp(18px, 2.4vw, 30px)`, colonnes de section `clamp(28px, 5vw, 72px)`.
- Rayons : contrôle 10px, surface 16px, média/carte majeure 24px (26px pour les mocks de téléphone), pilule 9999px.
- Ombres : manipulation légère `0 4px 8px rgba(29,29,33,.14)` (mocks produit) ; focus produit `0 6px 8px rgba(107,90,200,.16)` (CTA primaire, panneau du compte rendu). Jamais bordure décorative + grande ombre douce sur la même surface.
- Boutons : hauteur 48px (42px dans le masthead), padding `0 26px`, pilule. Cibles tactiles ≥ 44px, liens du menu mobile 48px.

## Screens / Views

Une seule page. Sections dans l'ordre du DOM.

### 1. Masthead (fixe)

- Fixe en haut, `z-index:60`, hauteur 72px, `max-width:1200px`.
- Au repos : fond transparent, bordure basse transparente. Au-delà de 16px de défilement : `background: rgba(247,247,244,.94)`, `border-bottom: 1px solid #DEDED7`, `backdrop-filter: blur(10px)`, transition 350ms. En production, lire le défilement via un unique `ScrollTrigger` comme le fait déjà `components/v2/masthead.tsx` (`data-scrolled`), pas un listener dédié.
- Gauche : logo `public/brand/biume-logo.svg` 30×30, rayon 8px, puis « Biume » 1.28rem/600/-.02em avec un point violet.
- Centre : liens `Le parcours` (#produit), `Le suivi` (#suivi), `Le propriétaire` (#proprietaire), `Tarifs` (#tarifs), `Questions` (#questions) — .88rem, `#696970`, hover `#1D1D21`, focus violet visible.
- Droite : CTA pilule violette 42px « Essayer gratuitement » → `webAppPath("/signup")`.
- Un lien d'évitement « Aller au contenu » visible au focus, comme dans `components/v2/masthead.tsx`.
- **Responsive** : sous 900px la nav centrale disparaît et un bouton burger 44×44 (rayon 10px, bordure `#DEDED7`, deux barres de 17×1.5px) s'affiche ; il ouvre un panneau pleine largeur sous le masthead (fond `#F7F7F4`, bordure haute `#DEDED7`, liens 48px séparés par `#DEDED7`, fermeture au clic sur un lien, `aria-expanded` tenu à jour). Sous 520px, le CTA du masthead est masqué. En production, faites-le avec des breakpoints Tailwind (`hidden md:flex`) plutôt qu'en JS, et assurez-vous que le panneau échappe aux conteneurs susceptibles de le rogner (cf. `__tests__/mobile-menu.test.ts`).

### 2. Hero

- `min-height: 100svh`, deux colonnes en `flex-wrap` : texte `flex:1 1 460px` (min 290px), carte produit `flex:1 1 380px` (min 290px, max 520px), gouttière `clamp(30px,4vw,60px)`. Padding `120px … 104px`.
- Fond, quatre couches empilées :
  1. `public/assets/images/landing/atelier-hero.webp` en `object-fit:cover`, `object-position:64% 50%`, dans un conteneur `inset:-8% 0` translaté en parallaxe (facteur 0.28).
  2. Lavis de marque : `radial-gradient(72% 58% at 18% 78%, rgba(107,90,200,.46) 0%, transparent 62%), radial-gradient(60% 52% at 82% 16%, rgba(46,152,102,.28) 0%, transparent 60%)`.
  3. Voile vertical : `linear-gradient(180deg, rgba(247,247,244,.72) 0%, rgba(247,247,244,.32) 26%, rgba(247,247,244,.30) 52%, rgba(247,247,244,.86) 84%, #F7F7F4 100%)`.
  4. **Voile latéral (nécessaire pour l'accessibilité)** : `linear-gradient(90deg, rgba(247,247,244,.93) 0%, rgba(247,247,244,.86) 32%, rgba(247,247,244,.5) 54%, rgba(247,247,244,0) 82%)`. Sans lui, l'encre `#1D1D21` de l'accroche passe sous 4.5:1 là où l'encadrement sombre de l'écurie traverse la colonne de texte.
- Colonne texte : pill « Pour les ostéopathes et praticiens animaliers » (fond `rgba(253,253,251,.82)`, bordure `#DEDED7`, `backdrop-filter: blur(6px)`, dot violet 7px en pulsation 2.6s) → H1 « Vos notes de séance, lisibles par le propriétaire. » → accroche (texte exact dans `HERO_LEAD` de `landing-v4/content.ts`) → CTA violet « Préparer mon premier compte rendu » + CTA secondaire « Voir le parcours » (#produit) → note « 15 jours d'essai, sans carte bancaire ».
- Colonne carte produit : surface `rgba(253,253,251,.72)` + `backdrop-filter: blur(14px)`, bordure `rgba(255,255,255,.6)`, rayon 24px, ombre focus produit. Contenu : en-tête « Nashira · séance du 12 mars » + chip verte « Validé par vous » ; bloc `#ECECE7` avec les notes brutes en mono ; séparateur « Biume met en forme » en violet entre deux traits ; bloc `#FDFDFB` bordé avec deux phrases du compte rendu propriétaire.
- Indice de défilement centré en bas : « Faites défiler » (.66rem, 600, letter-spacing .14em, majuscules) + trait dégradé 26px, animation verticale 2.8s.

### 3. Le constat

Titre « La séance finit dans la voiture. » (max 20ch) + accroche à droite. Trois cartes `flex:1 1 260px`, surface nette, bordure `#DEDED7`, rayon 16px, padding `26px 24px 28px` : numéro mono violet, H3, corps. Textes = `FACTS` de `landing-v4/content.ts`, titres adaptés (« Le compte rendu se rédige le soir. », « Vos notes ne sont pas faites pour être lues. », « Les reformuler prend le temps d'une séance. »).

### 4. Le relevé — démonstration (section signature)

- Section sur fond `#202024`. En-tête : éyebrow mono `#8E82E8` « Le relevé · démonstration », H2 « Le même relevé, écrit deux fois. », accroche.
- Piste de défilement de `440vh` contenant un étage `position:sticky; top:0; min-height:100svh; padding:88px 0 44px`, centré verticalement. **Ne pas fixer `height:100svh` avec `overflow:hidden`** : la mention légale et les volets les plus hauts en sortent.
- Rail gauche (210px) : sujet « Nashira · jument · 11 ans » en mono, puis quatre entrées `Motif / Examen / Traitement / Suites`, chacune avec une pastille violette 7px. Entrée active : fond `rgba(107,90,200,.22)`, rayon 10px, texte `#FDFDFB` ; inactives `rgba(253,253,251,.45)`. Pastille : `scale(1.5)` sur l'active, opacité 1 pour les étapes déjà passées, .3 pour les suivantes. Sous le rail, une barre de progression 2px (`rgba(253,253,251,.14)` / remplissage `#6B5AC8`) liée à l'avancement du défilement.
- Zone des volets : conteneur `display:grid` et **les quatre volets empilés dans la même cellule (`grid-area: 1/1`)**, de sorte que la hauteur du conteneur suive le volet le plus haut. N'utilisez pas `position:absolute` : les volets sortent du flux et chevauchent la mention légale.
- Chaque volet = deux cartes en `flex-wrap` : à gauche les notes brutes (fond `rgba(253,253,251,.05)`, bordure `rgba(253,253,251,.12)`, texte mono `rgba(253,253,251,.82)`) ; à droite le compte rendu (surface `#FDFDFB`, texte `#1D1D21`, ombre focus produit) avec label mono, H3, le texte propriétaire, puis une glose en `#696970`.
- Contenus des quatre volets : `SPECIMEN_STEPS` de `landing-v4/content.ts` (champs `raw`, `heading`, `out`, `body`), sujet `SPECIMEN_SUBJECT`, mention `SPECIMEN_NOTE` (« Séance fictive… ») en bas, `rgba(253,253,251,.44)`.
- **Bascule des volets** : affichage exclusif (`display:none` sur les inactifs) + animation d'entrée `biume-volet` (`opacity 0→1`, `translateY(14px)→0`, 420ms, `cubic-bezier(.16,1,.3,1)`), relancée à chaque changement. Un fondu croisé par transition CSS a été essayé et **abandonné** : selon le navigateur, la transition restait bloquée et la zone apparaissait vide en cours de défilement. Le volet actif doit être opaque au repos, sans dépendre d'une transition.

### 5. Plan photo « Ce que vos notes racontent »

Hauteur `min(74svh, 620px)`, `atelier-practice.webp` en parallaxe (0.2), `object-position:38% 42%`, voile latéral `linear-gradient(90deg, rgba(32,32,36,.78), rgba(32,32,36,.42) 46%, rgba(32,32,36,.08))`. Texte à gauche : éyebrow mono, phrase `clamp(1.9rem,3.6vw,3.2rem)`/650 en `#FDFDFB`, attribution `rgba(253,253,251,.72)`. Textes : bloc `PhotoPlate` de `landing-v4/index.tsx`.

### 6. Le contrôle (interactif)

- Deux colonnes : à gauche, colonne `position:sticky; top:110px` — éyebrow violet « Le contrôle », H2 « Rien ne part avant que vous l'ayez validé. », explication, invitation « Essayez : validez les trois passages. » en violet.
- À droite, une surface nette bordée rayon 16px contenant trois passages (`CONTROL_PASSAGES`), chacun : label mono, chip d'état à droite, texte du passage. État « En attente » = chip `#ECECE7`/`#696970`, bordure `#DEDED7`. État validé = chip `#FDFDFB`/`#21734D` libellée « Validé », bordure `#2E9866`, fond `#E7F3ED`. Transitions 400ms.
- Pied de carte séparé par `1px solid #DEDED7` : compteur à gauche (« 3 passages attendent votre relecture. » → « Les trois passages sont validés. », qui passe en `#21734D`) et bouton « Envoyer au propriétaire » à droite, **verrouillé** (`#ECECE7`/`#696970`) jusqu'à validation des trois passages, puis violet avec ombre focus produit.
- Chaque passage est cliquable (et re-cliquable pour dévalider), `role="button"`, `tabIndex=0` — en production, un vrai `<button>`. Ajoutez le clavier (Entrée/Espace).

### 7. Plan photo « Ce que le propriétaire retient »

Même mécanique, `atelier-owner.webp`, `object-position:50% 34%`, voile clair `linear-gradient(90deg, rgba(247,247,244,.92), rgba(247,247,244,.6) 42%, rgba(247,247,244,.05))`, texte en encre sombre. Hauteur `min(70svh, 580px)`.

### 8. Le suivi

- Fond `#E8F1F5`. Éyebrow bleu, H2 « La séance continue sans que vous y pensiez. »
- Trois jalons `J+0 / J+2 / J+21` (`FOLLOW_UP`, le J+2 étendu au questionnaire de suivi décrit dans `PRODUCT.md`), chacun : pastille 16px (fond `#E8F1F5`, bordure `2px solid #5D9BB8`) sur le fil, repère mono bleu 60px, H3, corps `#4a4a52`.
- **Fil bleu** : trait vertical 2px à `left:19px`, fond `rgba(93,155,184,.24)`, rempli par un enfant `#5D9BB8` dont la hauteur suit la progression du bloc dans la fenêtre (0 → 100 % entre l'entrée et la sortie, transition 180ms linéaire).

### 9. Côté propriétaire

- Deux colonnes. Gauche : éyebrow bleu « Côté propriétaire », H2 « Il n'installe rien, il ne crée pas de compte. », explication (lien sécurisé, code à usage unique au premier accès sur un nouvel appareil, session 30 jours — cf. `PRODUCT.md`), puis trois puces bleues (lecture du compte rendu, questionnaire en trois questions, demande explicite de recontact).
- Droite : deux mocks côte à côte, chacun `width:min(216px,100%)`, rayon 26px, bordure `#DEDED7`, surface nette, ombre manipulation légère.
  1. Mock « lien sécurisé » : encoche 48×4, carte `#E8F1F5` (« Lien sécurisé » / « Le compte rendu de Nashira est disponible. »), label « Code reçu par SMS », quatre cases 34px dont la 3ᵉ bordée violet et la 4ᵉ vide.
  2. Mock « Suivi · J+2 » : question « Comment va Nashira depuis la séance ? », trois réponses dont la 2ᵉ sélectionnée en vert (`#E7F3ED` / `#2E9866` / texte `#21734D`), puis la note « Seules les réponses qui demandent une action vous sont signalées. »

### 10. Surfaces mobile + web

Titre « Le terrain dans la poche, l'atelier au bureau. » + accroche. Deux cartes `border-radius:24px`, surface nette, bordure `#DEDED7`, padding `clamp(22px,2.6vw,32px)` :
- **Mobile** : chip violette « Mobile » + précision « Sur place, entre deux rendez-vous ». Mock de téléphone 232px : encoche, carte « 10:30 · Nashira / Séance terminée », carte violette « Brouillon prêt / 4 sections préremplies, 1 à vérifier », carte verte « Envoyé · 14:02 » avec pastille. Puis trois lignes de périmètre (rendez-vous du jour, création propriétaire/animal, validation des cas simples) — issues de la répartition mobile de `PRODUCT.md`.
- **Web** : chip bleue « Web » + « Au calme, pour les cas complexes ». Mock de fenêtre (barre à trois pastilles `#DEDED7`, titre « Compte rendu · Nashira »), navigation gauche 96px (première barre violette) et corps de document en barres `#ECECE7`, une barre violette (passage en cours) et une verte (validé). Puis trois lignes (anatomie détaillée, mise en page/prévisualisation, historique et administration).

### 11. Autour du compte rendu

Bande sobre séparée par `1px solid #DEDED7`, H2 secondaire « Autour du compte rendu, ce qui est déjà là. » + « Tout ce qui sert le compte rendu et le suivi. Rien de plus. » Quatre cartes `flex:1 1 210px` (surface nette, bordure, rayon 16px, padding 20px) : Agenda et rendez-vous · Dossiers propriétaires et animaux · Historique de l'animal · PDF et envoi par e-mail. Cette section existe pour répondre à « je ne vois pas ce que le produit fait » sans repositionner Biume en logiciel de gestion.

### 12. Ce que Biume ne fait pas

Fond `#ECECE7`. H2 à gauche (max 16ch), liste à droite : cinq lignes `BOUNDARIES`, padding vertical 18px, séparées par `1px solid #DEDED7` (haut sur chaque item, bas sur le dernier), 1.06rem/1.55.

### 13. Tarifs

- H2 « Une formule, deux rythmes. » + « Facturé par praticien. Pas par compte rendu, pas par message envoyé. »
- Carte principale `flex:1 1 400px`, surface nette, **bordure violette 1px**, rayon 16px : bascule pilule (fond `#ECECE7`, onglet actif `#FDFDFB`) `Mensuel` / `Annuel` ; prix `29,99 €` / `24,99 €` avec suffixe « par mois » ; note sous le prix « Sans engagement · résiliable à tout moment » / « Facturé annuellement · 299,88 € par an » ; cinq inclusions (`PLAN_INCLUDED`) à pastilles vertes ; CTA violet « Commencer les 15 jours d'essai » ; note « Sans carte bancaire. Rien à résilier si vous ne faites rien. »
- Carte secondaire `#EEEBFB` : « Vous préférez qu'on le fasse ensemble ? », explication 30 minutes, bouton surface nette « Réserver une démonstration » → `DEMO_URL`.
- Les valeurs viennent de `PRODUCT.md` (29,99 €/mois, 24,99 €/mois facturé annuellement, essai 15 jours sans carte). Faites-les venir d'une source unique côté code — cf. `__tests__/pricing-manifest.test.tsx`.

### 14. Questions

H2 « Questions. » à gauche, liste à droite. Six entrées `FAQ` de `landing-v4/content.ts`, en **`<details>/<summary>` natifs** : séparateurs `1px solid #DEDED7` (haut sur chaque item, bas sur le dernier), summary `min-height:56px`, 1.08rem/600, chevron 11px en équerre violette (bordures droite + bas) pivotant de 45° à 225° en 300ms, réponse 1rem/1.65 en `#696970`, max 62ch.

> Note d'implémentation : l'accordéon du design system `@biume/ui` a été essayé et abandonné dans le prototype — le contexte React ne traversait pas les montages du prototype. **Dans `apps/marketing`, utilisez le composant `Accordion` de `packages/ui`**, qui fonctionnera normalement ; conservez alors son propre indicateur d'état. Les `<details>` ne sont qu'une solution de repli propre au prototype. Pensez au JSON-LD `FAQPage` (voir `lib/seo.tsx` et `__tests__/seo.test.tsx`).

### 15. Clôture

Fond `#202024`, deux radiaux (`rgba(107,90,200,.5)` en bas à gauche, `rgba(93,155,184,.28)` en haut à droite). H2 « Votre prochaine séance peut être la première. », accroche, CTA violet + note d'essai, alignés en bas à droite.

### 16. Footer

Fond `#202024`, bordure haute `rgba(253,253,251,.1)`. Logo + wordmark, puis **quatre colonnes de liens** (labels mono en majuscules, `rgba(253,253,251,.4)`, liens `rgba(253,253,251,.62)`) :
- **La page** : #produit, #proprietaire, #tarifs, #questions.
- **Le métier** : `/logiciel-osteopathe-animalier`, `/modele-compte-rendu-osteopathe-animalier`, `/exemple-compte-rendu-osteopathie-animale`, `/suivi-post-seance-animal`, `/relance-client-osteopathe-animalier`.
- **Comparer** : `/comparatifs`, `/comparatifs/neovoice-vs-biume`, `/alternatives/kiwiappli`, `/alternatives/animalib`, `/blog`.
- **Biume** : `/about`, `/tarifs`, `/cgu`, `/privacy`.
Ligne de bas de page pleine largeur, séparée : « Compte rendu et suivi post-séance pour ostéopathes et praticiens animaliers. Données hébergées en Europe. »

Toutes ces routes existent déjà dans `apps/marketing/app`. Vérifiez `app/sitemap.ts` après intégration.

## Interactions & Behavior

| Élément | Comportement |
| --- | --- |
| Apparitions | Tout élément marqué « reveal » passe de `opacity:0; translateY(20px)` à l'état normal en 850ms `cubic-bezier(.16,1,.3,1)`, déclenché quand son haut franchit 90 % de la hauteur de fenêtre ; décalages en cascade de 40 à 340ms. En production : GSAP `ScrollTrigger` comme `components/v2/reveal.tsx`. |
| Parallaxe | Trois plans photo translatés selon leur position dans la fenêtre : hero 0.28, plan « geste » 0.2, plan « propriétaire » 0.18 (`translate3d(0, -centre × facteur, 0)`, conteneur en `inset:-8%/-10%` pour éviter les bords). |
| Démo | Progression = `(-trackTop) / (trackHeight - viewportHeight)`, bornée 0–1 ; étape = `min(3, floor(p × 3.999))`. Met à jour le rail, la barre de progression et le volet affiché. |
| Fil du suivi | Hauteur du remplissage = progression du bloc dans la fenêtre, bornée 0–1. |
| Passages | Clic → bascule validé / en attente ; recalcule le compteur et l'état du bouton d'envoi. |
| Tarifs | Clic sur un onglet → prix et note remplacés, onglet actif déplacé. Transition 350ms. |
| FAQ | Ouverture / fermeture au clic et au clavier, chevron pivoté. |
| Menu mobile | Burger → panneau ; clic sur un lien → fermeture ; `aria-expanded` synchronisé. |
| Défilement d'ancre | `scroll-behavior: smooth` sur `html`. Prévoir un décalage pour le masthead fixe (72px). |
| Un seul écouteur | Le prototype regroupe masthead, reveals, parallaxe, démo et fil dans une seule boucle `requestAnimationFrame` sur `scroll`/`resize`. Conservez ce principe (un observateur unique) : c'est déjà la règle dans `components/v2/masthead.tsx`. |

Animations à déclarer en keyframes : `biume-cue` (indice de défilement, 2.8s), `biume-pulse` (dot du pill, 2.6s), `biume-volet` (entrée de volet, 420ms).

## State Management

Aucune donnée distante. État local :

- `scrolled: boolean` — masthead.
- `menuOpen: boolean` — menu mobile.
- `demoStep: 0 | 1 | 2 | 3` + `demoProgress: number` — démonstration.
- `threadProgress: number` — fil du suivi.
- `validated: [boolean, boolean, boolean]` — passages ; dérivés : nombre restant, bouton d'envoi actif.
- `plan: "mois" | "an"` — tarifs.
- FAQ : état natif de `<details>`, ou état contrôlé si vous passez par `Accordion`.

Tout le contenu est statique : gardez-le dans un `content.ts` unique comme `landing-v4/content.ts`, pour que les tests de contenu (`__tests__/landing-content.test.ts`, `landing-hero.test.tsx`, `pricing-manifest.test.tsx`) puissent s'y accrocher.

## Assets

Tous déjà présents dans le repo, aucun asset nouveau :

| Fichier | Usage |
| --- | --- |
| `apps/marketing/public/brand/biume-logo.svg` | masthead, footer |
| `apps/marketing/public/assets/images/landing/atelier-hero.webp` | fond du hero |
| `apps/marketing/public/assets/images/landing/atelier-practice.webp` | plan photo « Ce que vos notes racontent » |
| `apps/marketing/public/assets/images/landing/atelier-owner.webp` | plan photo « Ce que le propriétaire retient » |

Servez-les via `next/image` (`fill`, `sizes="100vw"`, `priority` sur le hero uniquement). Aucune icône dessinée : les seuls signes graphiques sont des pastilles, des traits et une équerre CSS.

Textes de remplacement d'images : voir les `alt` du prototype, repris de `landing-v4/index.tsx`.

## Accessibilité

- Contraste AA vérifié ; le voile latéral du hero est requis pour cela.
- Un `<h1>` unique, sections avec `aria-labelledby`, `<main id="contenu" tabIndex={-1}>`, lien d'évitement.
- Cibles ≥ 44px, focus visible violet 2px avec décalage 2px.
- Les éléments interactifs simulés dans le prototype (`role="button"` sur les passages et les onglets tarifs) doivent devenir de vrais `<button>`.
- Pas de variante `prefers-reduced-motion` (décision produit pour cette page).

## Files

- `Landing Biume.dc.html` — la landing haute fidélité complète (référence principale ; s'ouvre dans un navigateur).
- `Landing Structures.dc.html` — les wireframes des quatre structures explorées et des trois mécaniques de démonstration. Utile pour comprendre pourquoi cet ordre de sections a été retenu (« Le parcours »).
- `assets/` — copie des trois photos et du logo utilisés, aux mêmes noms que dans le repo.

Références dans le repo, à lire avant d'implémenter : `apps/marketing/DESIGN.md`, `PRODUCT.md`, `apps/marketing/components/landing-v4/content.ts` (copie), `apps/marketing/components/v2/reveal.tsx` (moteur d'animation existant), `apps/marketing/components/v2/masthead.tsx`, `apps/marketing/lib/web-app-url.ts`, `apps/marketing/lib/seo.tsx`.
