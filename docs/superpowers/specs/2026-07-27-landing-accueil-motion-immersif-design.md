# Landing d'accueil — motion immersif GSAP

Date : 2026-07-27
Portée : `apps/marketing`, route `/` (production, indexée)

## Intention

Faire entrer deux sections éprouvées sur les directions parallèles dans la
landing de production, et hisser tout le mouvement de la page au niveau de
ces deux gestes.

- Le **manifeste** vient de `/v3` (`components/landing-v3/manifesto.tsx`) :
  un texte pleine page qui passe de l'encre « pas encore lue » à l'encre
  pleine au fil du scroll.
- L'**atelier** vient de `/v2` (`components/landing-v2/atelier.tsx`) : la
  note du praticien et le compte rendu propriétaire, côte à côte, reliés
  par un rail, transformés en quatre temps.

La direction artistique de `/` ne change pas : lin chaud `#f7f6f2`, encre
aubergine `#211129`, Geist, zéro ombre portée — l'élévation est un ring
inset hairline —, un seul moment de couleur au hero. Les deux sections
importées sont recomposées dans cette DA, pas transplantées avec la leur.

La landing doit convertir. Chaque décision de mouvement ci-dessous est
prise sous cette contrainte, et la section 7 liste ce qui la protège.

## 1. Le récit et ce qu'il déplace

```
hero            Votre regard métier, jusqu'au propriétaire.
MANIFESTE       la promesse, éprouvée en la lisant          ← nouveau
ATELIER         la preuve, démontrée pièce par pièce        ← nouveau, id="produit"
contrôle        Biume prépare. Vous gardez la main.
méthode         Le compte rendu ouvre la suite.
terrain         les deux photos
tarifs          24,99 € — CTA
FAQ             les objections
close           CTA final
```

`V2Features` — les trois cartes « Notes de séance / Reformulation proposée /
Compte rendu à valider » — est **supprimée**. Elle sert déjà
`REPORT_TRANSFORMATION_DEMO` mot pour mot ; la conserver ferait raconter
trois fois la même démonstration avant le prix.

Le manifeste affirme la transformation, l'atelier la prouve. Dans cet ordre
l'atelier n'a plus à s'expliquer : le visiteur y arrive en sachant ce
qu'il regarde.

**Conséquence sur la navigation.** L'ancre `#produit` du masthead pointe
aujourd'hui sur `V2Features`. Elle passe sur l'atelier, qui porte désormais
`id="produit"`. Le libellé du lien de navigation reste « Produit ».

**Conséquence sur `V2Control`.** La section affiche
`/assets/images/dashboard-image.jpg`, une photo stock d'un dashboard
analytique sans rapport avec Biume. `PRODUCT.md` interdit les preuves qui
ne sont pas des démonstrations fidèles du produit, et cette image a déjà
été retirée des autres directions pour ce motif. Elle est remplacée par un
panneau de relecture composé dans la DA : le compte rendu, ses champs, et
l'action de validation — la même matière que l'atelier, à un autre moment
du parcours.

## 2. Architecture du mouvement

Un seul moteur d'animation par arbre. Deux bibliothèques qui écrivent la
même propriété transformée sur un même nœud se remplacent l'une l'autre à
chaque frame : tout passe par GSAP. `motion` reste installé pour `/v2`,
`/v3` et `/v4` mais n'est jamais importé sous `components/v2`.

```
components/v2/
  reveal.tsx      réécrit  → V2MotionRoot : Lenis + ScrollTrigger + orchestration
  manifesto.tsx   nouveau  → le texte qui se lit
  atelier.tsx     nouveau  → la démonstration en quatre temps
  landing.css     nouveau  → styles propres aux deux sections
  sections.tsx    modifié  → V2Features retirée, sections instrumentées
  masthead.tsx    modifié  → contraction pilotée par ScrollTrigger
  v2-landing.tsx  modifié  → composition et import de landing.css
app/v2/v2.css     INTOUCHÉ
```

`app/v2/v2.css` porte le namespace `.v2`, qui est posé sur `<body>` par
`app/layout.tsx` et sert aussi les vingt et quelques pages SEO via
`components/marketing-page.tsx`. Aucune modification n'y est apportée. Les
styles nouveaux vivent dans `components/v2/landing.css`, importé par
`v2-landing.tsx`, donc chargé uniquement là où la landing est rendue.

**Le scroll amorti est Lenis, pas ScrollSmoother.** Lenis anime le scroll
natif de la fenêtre : `position: sticky` et le pinning de ScrollTrigger
restent intacts. Les deux horloges sont accrochées l'une à l'autre dans
`V2MotionRoot` :

```
lenis.on("scroll", ScrollTrigger.update)
gsap.ticker.add((t) => lenis.raf(t * 1000))
gsap.ticker.lagSmoothing(0)
```

Sans cet accrochage, ScrollTrigger et Lenis dérivent et les positions
déclenchées arrivent en retard d'une frame ou deux.

**Les ancres passent par Lenis.** `#produit`, `#methode`, `#tarifs`,
`#questions` et le lien d'évitement `#contenu` sont interceptés et confiés
à `lenis.scrollTo(cible, { offset: -88 })`. Sans cela ils sautent sec au
milieu d'un défilement amorti, et `scroll-mt-24` ne s'applique pas.

**Enregistrement des plugins.** `gsap.registerPlugin` touche
`requestAnimationFrame` dès l'appel : le faire au chargement du module
casse le rendu serveur. L'enregistrement se fait à la première exécution
d'un effet, de façon idempotente, comme aujourd'hui dans `reveal.tsx`.
Plugins utilisés : `ScrollTrigger`, `SplitText`, `Flip`, `DrawSVGPlugin`,
`useGSAP`.

### `prefers-reduced-motion` est écarté

Décision explicite de Mathieu, prise une première fois sur `/v4` le
2026-07-27 et reconduite ici après que la conséquence a été signalée : les
personnes sujettes au mal des transports subiront la page en plein
mouvement. `gsap.matchMedia` n'est plus utilisé pour la préférence de
mouvement, et aucune règle `@media (prefers-reduced-motion: reduce)` n'est
ajoutée. **Ne pas réintroduire la garde sans redemander.**

Deux garde-fous subsistent, qui ne sont pas du reduced-motion mais de la
robustesse :

1. **Aucun état de départ n'est posé en CSS.** Les `autoAlpha: 0` et les
   décalages initiaux sont écrits par `gsap.set` au montage. Si le
   JavaScript échoue ou n'est pas exécuté, la page s'affiche complète et
   lisible. `/` est indexée : un contenu masqué par CSS en attente d'un
   script est un contenu perdu.
2. **`gsap.matchMedia` reste employé pour la largeur.** Le pinning et Flip
   ne se montent qu'au-dessus de 1024px, pour l'atelier comme pour le
   manifeste. En dessous, la même matière est racontée sans capture de
   scroll (§ 5).

## 3. Le manifeste

Section pinnée sur environ 250vh au-dessus de 1024px, plein cadre, sans
autre élément. Sous 1024px elle ne pin pas (§ 5).

Le texte est celui de `/v3`, inchangé :

> Vous notez « restriction thoracique gauche ». Le propriétaire lit « la
> mobilité du thorax a été travaillée pendant la séance ». Même
> observation, deux lecteurs. Biume écrit la seconde phrase. Vous gardez
> la première.

Découpage **par mot** via SplitText (`type: "words,lines"`, `autoSplit`
pour recouper après le chargement de la police et au redimensionnement).
Jamais par caractère : un lecteur d'écran épellerait le titre et la
sélection de texte serait cassée.

Chaque mot passe de l'encre non lue à l'encre pleine, en cascade pilotée
au `scrub` sur la durée du pin.

| état | couleur | contraste sur `#f7f6f2` |
|---|---|---|
| pas encore lu | `--v2-ink-faint` `#8d8790` | 3,2:1 |
| lu | `--v2-ink` `#211129` | 8,9:1 |
| dernière phrase, lue | `--v2-violet-ink` `#6b5ac8` | 4,9:1 |

L'état « pas encore lu » à 3,2:1 est en dessous du seuil de 4,5:1 pour du
texte courant, mais le manifeste est composé au corps du display : au-delà
de 24px, le seuil applicable est 3:1. C'est le même calibrage que sur
`/v3`, où l'état non lu avait été remonté de 1,85:1 à 3,06:1 pour cette
raison.

La dernière phrase — « Vous gardez la première. », celle qui porte
l'argument — arrive en violet de marque. Le violet décide : c'est son
rôle sémantique dans les quatre directions, il est à sa place sur la
phrase qui affirme que le praticien garde ses mots.

Le titre `h2` du plan du document reste en `sr-only` : la page n'a besoin
que du texte, le document a besoin d'un titre.

## 4. L'atelier — le fragment voyage

Section pinnée, quatre temps, `snap` sur chaque temps : la séquence clique
d'un état à l'autre au lieu de baver entre deux positions.

```
temps 0   note complète, compte rendu vide, « Rien pour l'instant »
temps 1   [Restriction thoracique gauche]     → ZONE OBSERVÉE · Thorax gauche
temps 2   [Mobilité améliorée après travail]  → ÉVOLUTION
temps 3   [Conseiller du calme pendant 48 h]  → CONSEIL
temps 4   le sceau « Validé par vous » se trace, le bloc propriétaire se pose
```

Les trois fragments et les trois champs viennent de
`REPORT_TRANSFORMATION_DEMO` — la même démonstration que le produit, pas
une mise en scène écrite pour la landing.

### Le vol

À chaque temps :

1. Un **double** du fragment naît comme enfant du fragment d'origine : il
   est donc exactement à sa place, à son corps de texte, sans mesure
   manuelle.
2. `Flip.getState(double)` enregistre sa géométrie.
3. Le double est déplacé dans le DOM jusqu'à l'emplacement de son champ.
4. `Flip.from(state, …)` anime la différence — position, échelle, corps de
   texte. La trajectoire est calculée par Flip, elle n'est pas scriptée.
5. À l'arrivée le double s'efface et la valeur reformulée se révèle mot à
   mot.

Un léger arc est ajouté en animant le `y` du conteneur du double sur la
même timeline : Flip n'interpole pas de courbe, et une translation
strictement rectiligne lit comme un glissement, pas comme un passage.

**Le fragment d'origine reste dans la note**, et passe du surlignage à
l'encre pleine. C'est le fond de l'argument : rien n'a été consommé, la
note du praticien est intacte. Le rail se dessine derrière le vol
(`DrawSVGPlugin`) et sa pastille s'allume à l'arrivée.

### Le pilotage

Flip est un mécanisme d'état, il ne se scrube pas. Un seul ScrollTrigger
pin la section et calcule l'index du temps à partir de sa progression ;
chaque changement d'index déclenche la timeline du temps correspondant,
qui se joue à sa propre vitesse.

**Au scroll inverse, les états sont reposés instantanément, sans vol.**
Une animation jouée à l'envers pendant qu'on remonte donne le mal de mer
et brouille la lecture. Le retour arrière est une remise à l'état, pas une
marche arrière.

### Les pièges déjà payés

Deux règles héritées de `/v4`, à ne pas repayer :

1. **`overflow-x: clip` sur un ancêtre casse `position: sticky`** dans
   Chromium — l'élément devient le scrollport de référence des descendants
   collants. Aucune coupure horizontale globale ; chaque section qui
   déborde porte la sienne.
2. **Un bloc collant aussi haut que l'écran se décroche trop tôt.** Le
   panneau se centre par son `top`, pas par un `min-height: 100dvh` plus
   `justify-center`.

## 5. Sous 1024px

Ni pin, ni Flip, ni capture de scroll.

```
┌─ Vos notes de séance ─┐
│ [fragment]            │  s'allume au passage
└───────────────────────┘
          │                rail vertical qui se remplit
          ●
┌─ Compte rendu ────────┐
│ ZONE OBSERVÉE         │  se remplit
└───────────────────────┘
```

Les fragments s'allument et les champs se remplissent au scroll natif, au
franchissement de seuils. Même récit, même ordre, aucun calcul de `100dvh`
à la merci de la barre d'URL d'iOS. Le scroll capturé sur petit écran est
le premier motif d'abandon.

Le manifeste garde son scrub mot à mot sur mobile, mais sans pin : le
texte défile normalement et se colore à mesure qu'il traverse l'écran. Le
geste survit, le scroll reste au visiteur.

## 6. Le reste de la page

| section | geste |
|---|---|
| hero | trois plans à vitesses distinctes (photo, lavis, texte), titre par lignes masquées — l'existant, étendu |
| contrôle | titre par lignes, liste de garanties en cascade coche par coche |
| méthode | la photo dérive à contre-sens du texte |
| terrain | les deux photos à des vitesses différentes ; le décalage existe déjà en statique, il s'anime |
| tarifs | la carte se compose : prix, puis inclus ligne à ligne, puis CTA |
| close | rien ne bouge autour du CTA |
| masthead | contraction à 56px pilotée par ScrollTrigger, en remplacement du `useState` et de l'écouteur `scroll` actuels |

Le masthead cesse d'écouter le scroll pour son propre compte : un seul
observateur du défilement sur la page, celui de ScrollTrigger.

## 7. Ce qui protège la conversion

- **Les trois CTA restent**, aux mêmes endroits, avec leurs attributs
  `data-conversion` (`hero-signup`, `pricing-signup`, `pricing-demo`,
  `close-signup`, `close-demo`, `masthead-signup`) — ils sont la mesure.
- **Aucun CTA n'est animé à l'entrée du viewport.** Un bouton qui apparaît
  en retard est un bouton qu'on ne clique pas.
- **`masthead-signup` est visible en permanence**, y compris pendant les
  séquences pinnées : à aucun moment le visiteur n'est sans porte de
  sortie vers l'inscription.
- Le pinning ajoute environ six écrans de défilement avant les tarifs.
  Compensé par la suppression de `V2Features` et par le `snap`, qui rend
  la traversée rapide quand on scrolle vite.
- **Aucune preuve inventée.** Biume n'a ni témoignage, ni chiffre d'usage,
  ni logo partenaire, ni cas client validé. La démonstration reste
  `REPORT_TRANSFORMATION_DEMO` et la mention « Démonstration à partir d'un
  exemple de séance. Aucun envoi n'est déclenché sans votre validation. »
  reste sous l'atelier.

## 8. Accessibilité et robustesse

- Contenu intégralement présent dans le HTML rendu par le serveur ; le
  mouvement ne fait que le révéler. Sans JavaScript, la page est complète.
- Découpage SplitText par mots et par lignes, jamais par caractères.
- Le double du fragment en vol porte `aria-hidden="true"` : le texte est
  déjà lu deux fois dans l'arbre, il ne doit pas l'être une troisième.
- Les rails, pastilles et sceaux sont `aria-hidden="true"`.
- L'ordre de tabulation n'est pas modifié par les sections pinnées.
- Les contrastes sont calibrés sur le lin `#f7f6f2`, plan le plus clair de
  la page.
- Le lien d'évitement `#contenu` fonctionne avec Lenis.

## 9. Tests

`apps/marketing/__tests__/landing-foundation.test.tsx` **échouera en
l'état** : il vérifie aujourd'hui que le fichier de motion contient
`(prefers-reduced-motion: no-preference)`. Il est réécrit pour verrouiller
la décision inverse.

Assertions après reprise :

- `components/v2/reveal.tsx` ne contient **aucune** garde
  `prefers-reduced-motion`, et porte le commentaire qui explique pourquoi
  — le test exige la trace de la décision, pas seulement son effet.
- Aucun import de `motion/react` sous `components/v2`.
- `V2Features` n'existe plus dans `sections.tsx` et n'est plus composée
  dans `v2-landing.tsx`.
- L'atelier porte `id="produit"` ; l'ancre du masthead a donc toujours sa
  cible.
- `app/v2/v2.css` conserve ses tokens (`--v2-violet-ink`, `--v2-green`,
  `--v2-canvas`, rayon 24px) — le fichier des pages SEO n'a pas bougé.
- `landing.css` est importé par `v2-landing.tsx` et par rien d'autre.
- Lenis est accroché à ScrollTrigger dans `reveal.tsx`.

Vérification manuelle avant de considérer le travail fini : traversée
complète au clavier, traversée à la molette et au trackpad, remontée
depuis le bas de page, redimensionnement pendant une séquence pinnée,
passage sous 1024px, et chargement avec JavaScript désactivé.

Commandes : `bun test` depuis `apps/marketing`, `bun run lint`,
`bun run build`.

## 10. Hors périmètre

- `/v2`, `/v3`, `/v4` ne sont pas touchées.
- `app/v2/v2.css` n'est pas modifié.
- Les pages SEO et `components/marketing-page.tsx` ne sont pas touchées.
- Le paquet `motion` n'est pas désinstallé : les autres directions s'en
  servent encore.
- Aucun contenu rédactionnel n'est réécrit, hors les libellés du nouveau
  panneau de `V2Control`.
