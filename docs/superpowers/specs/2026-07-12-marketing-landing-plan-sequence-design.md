# Landing Biume cinématographique — Le plan-séquence

- Date : 12 juillet 2026
- Statut : conception approuvée, en attente de revue du document
- Branche : `codex/marketing-cinematic-plan-sequence`
- Périmètre : `apps/marketing`, page d'accueil uniquement

## 1. Décision

La variante expérimentale de la landing Biume adopte la direction **Le plan-séquence**.

Elle conserve le fond commercial et factuel de la landing `Le carnet vivant` actuellement sur `main`, mais réinvente entièrement sa mise en scène. La page doit ressembler à un court documentaire continu plutôt qu'à une succession de sections SaaS.

La signature mémorable est une progression sans rupture visible :

1. le geste réel du praticien ;
2. la trace laissée pendant la séance ;
3. la transformation de cette trace en document ;
4. la décision du praticien ;
5. la suite proposée au propriétaire.

Cette expérimentation reste isolée. La landing actuelle sur `main` n'est pas modifiée tant que la variante n'est pas explicitement retenue.

## 2. Objectif et public

### Public principal

Le visiteur principal est un ostéopathe animalier indépendant en France. Il travaille souvent en mobilité, prépare ses comptes rendus après ses séances et cherche une manière plus claire de transmettre ses observations aux propriétaires.

### Objectifs

1. Créer une émotion et une qualité perçue plus fortes sans rendre la proposition abstraite.
2. Faire comprendre le métier, le résultat et le contrôle praticien dès le premier écran.
3. Transformer le passage du geste au document en récit continu.
4. Conserver une conversion directe vers l'essai gratuit.
5. Préserver les contenus factuels, les prix, le SEO, l'accessibilité et le rendu sans JavaScript.

### Contrat commercial inchangé

- CTA principal : `Essayer gratuitement`.
- Essai : 15 jours sans carte bancaire.
- Prix annuel : 24,99 € par mois avec facturation annuelle.
- Prix mensuel : 29,99 € par mois.
- Le praticien relit, corrige, finalise et choisit lui-même quand partager.
- Aucune note, aucun témoignage, aucune économie, aucun gain de temps et aucun résultat clinique non documenté ne sont ajoutés.

## 3. Direction artistique

### 3.1 Intention

La page évoque un documentaire de terrain contemporain : sensible, précis et calme. Elle ne doit pas ressembler à une bande-annonce spectaculaire, une landing d'intelligence artificielle ou un portfolio photographique détaché du produit.

Les principes sont :

- photographie documentaire dominante ;
- cadrages asymétriques ;
- mouvements longs et peu nombreux ;
- transitions par fondu, recadrage et changement de lumière ;
- typographie éditoriale utilisée comme titrage de film ;
- représentation du produit fidèle et lisible ;
- absence de décoration gratuite.

### 3.2 Palette Biume

Les responsabilités colorimétriques restent identiques à la landing actuelle.

| Rôle | Couleur | Usage |
| --- | --- | --- |
| Toile claire | `#f7f7f4` | Scènes de décision et épilogue |
| Surface document | `#fdfdfb` | Compte rendu et sorties produit |
| Encre | `#1d1d21` | Titres et texte principal |
| Anthracite | `#202024` | Transformation et raccords sombres |
| Violet Biume | `#6b5ac8` | CTA et progression active |
| Bleu Biume | `#5d9bb8` | Information et structuration |
| Vert Biume | `#2e9866` | Finalisation et succès uniquement |

La photographie conserve une colorimétrie naturelle légèrement chaude. Un voile sombre local garantit la lisibilité des textes sans masquer le visage, les mains ou l'animal.

Aucun gradient de titre, halo néon, glassmorphism global ou noir pur n'est autorisé.

### 3.3 Typographie

- La typographie principale reste une pile système haut de gamme afin de ne pas réintroduire de police bloquante.
- La pile éditoriale native `Iowan Old Style`, `Baskerville`, `Times New Roman`, serif reste réservée à quelques mots de titrage.
- La pile monospace reste réservée aux scènes, étapes, prix et statuts.
- Les interfaces produit n'utilisent jamais de serif.
- Le titre du hero reste contrôlé et composé sur trois à quatre lignes au maximum selon la largeur.

### 3.4 Matière

- Grain fixe très léger sur la page, jamais attaché à un conteneur qui défile.
- Ombres larges et teintées uniquement sur les objets réellement élevés.
- Bordures fines sur le document et les outils.
- Rayons asymétriques réservés aux photographies et surfaces produit.
- Aucun empilement de cartes décoratives.

## 4. Narration en cinq scènes

La page conserve exactement cinq sections principales entre le header et le footer.

### Scène 1 — Le geste

Le hero devient un plan photographique presque plein écran.

Contenu inchangé :

- catégorie : `Le compte rendu propriétaire des ostéopathes animaliers` ;
- titre : `Vos observations, dans des mots qui restent.` ;
- texte : `Biume structure vos notes et prépare un compte rendu clair pour le propriétaire. Vous relisez, corrigez et choisissez quand le partager.` ;
- CTA primaire : `Essayer gratuitement` ;
- CTA secondaire : `Voir un exemple de compte rendu` ;
- réassurance : `15 jours d'essai`, `Sans carte bancaire`, `Partagé par vous`.

Desktop :

- la photographie cheval occupe presque tout le viewport ;
- la copie est ancrée dans le tiers inférieur gauche ;
- un dégradé sombre purement fonctionnel garantit le contraste ;
- le header commence transparent et devient une surface claire opaque après la première scène ;
- les CTA restent visibles sans défilement.

Mobile :

- source mobile dérivée de la photographie existante, recadrée verticalement pour protéger le visage, les mains et le texte ;
- copie limitée à une zone sûre qui ne recouvre ni le visage ni les mains ;
- CTA primaire visible avant la ligne de flottaison ;
- taille transférée de l'image mobile ciblée inférieure ou égale à 24 Ko.

Mouvement :

- entrée progressive de la catégorie, du titre, du texte et des CTA ;
- échelle photographique maximale de `1.03` vers `1` ;
- durée comprise entre 600 et 900 ms ;
- aucune boucle et aucun mouvement permanent.

### Scène 2 — La trace

La photographie se raccorde progressivement à la séquence anthracite. Le visiteur ne rencontre pas une nouvelle carte : il a la sensation que la scène réelle se prolonge dans le document.

Le titre reste :

> Une note devient un document que le propriétaire peut comprendre.

Le récit conserve les quatre états factuels :

1. `Noter` ;
2. `Structurer` ;
3. `Adapter le langage` ;
4. `Finaliser`.

Desktop :

- document clair ancré à droite ;
- étapes lisibles à gauche ;
- raccord visuel lent entre photographie, observation et document ;
- une seule couche document visible à la fois ;
- progression active violette, information bleue et finalisation verte.

Mobile, réduction des animations et sans JavaScript :

- séquence verticale normale ;
- quatre étapes visibles dans l'ordre ;
- document final visible ;
- aucun contenu dépendant du scroll ou masqué avec une opacité nulle.

Les papiers flottants, lignes diagonales traversant le texte et chevauchements entre plusieurs documents restent interdits.

### Scène 3 — Le document

La page revient progressivement à la lumière. Le produit est présenté dans un plan calme et large.

Le contenu actuel reste inchangé :

- éditeur de compte rendu ;
- PDF professionnel ;
- relance de rendez-vous ;
- phrase `Pas une promesse abstraite. Les outils réellement disponibles.`.

La composition privilégie une seule grande surface éditeur, suivie des deux sorties fonctionnelles. Les éléments apparaissent dans l'ordre de lecture comme si le document venait d'être développé, sans faux dashboard et sans promesse supplémentaire.

### Scène 4 — Le choix

La scène regroupe l'interlude `Biume prépare. Vous décidez.` et le tarif.

Le rythme devient volontairement plus calme :

- fond clair ;
- grande respiration typographique ;
- prix fonctionnel en monospace ;
- sélecteur annuel ou mensuel inchangé ;
- liste des fonctionnalités factuelles inchangée ;
- CTA `Essayer gratuitement` dominant.

La tarification ne doit pas ressembler à une carte SaaS générique imbriquée dans d'autres cartes.

### Scène 5 — La suite

La FAQ et le CTA final deviennent un épilogue.

- Les cinq objections restent dans des éléments `details` natifs.
- Les liens légaux conservent une cible minimale de 44 px.
- La photographie propriétaire et praticienne introduit la phrase finale.
- Le seul CTA de l'épilogue reste `Essayer gratuitement`.
- Le footer conserve les liens produit, SEO, légaux et la démonstration.

## 5. Chorégraphie

### 5.1 Règles générales

- Aucun scroll hijacking.
- Aucun défilement horizontal imposé.
- Aucun autoplay vidéo ou audio.
- Aucun curseur personnalisé.
- Aucune animation décorative perpétuelle.
- Seuls `transform` et `opacity` peuvent être animés.
- Les textes essentiels ne commencent jamais à `opacity: 0` dans le HTML ou dans les fallbacks.
- La page reste navigable au clavier pendant toute la chorégraphie.

### 5.2 Header

Le header possède deux états :

1. transparent et lisible sur la photographie ;
2. clair, opaque et bordé après la sortie du hero.

La transition est réversible, sans réduction de taille importante et désactivée lorsque l'utilisateur demande moins d'animations.

### 5.3 Raccords

Les raccords entre scènes utilisent :

- variation progressive de lumière ;
- translation verticale limitée ;
- léger recadrage photographique ;
- révélation de lignes ou légendes ;
- fondu entre la photographie et la surface document.

Ils n'utilisent jamais de flash, glitch, particules ou rotation 3D.

## 6. Architecture technique

### 6.1 Rendu serveur

`apps/marketing/app/page.tsx` reste un Server Component.

Les éléments suivants sont rendus côté serveur :

- tous les titres et paragraphes ;
- tous les CTA et leurs destinations ;
- les cinq sections principales ;
- les quatre étapes de transformation ;
- l'éditeur, le PDF et la relance ;
- les deux tarifs ;
- les cinq réponses FAQ ;
- les données structurées SEO.

### 6.2 Îlots interactifs

La variante peut utiliser `motion`, déjà installé dans `apps/marketing`, dans un îlot client microscopique dédié au hero et à son raccord.

Composants prévus :

- `cinematic-hero-media.tsx` : photographie et transformation liée au scroll ;
- `cinematic-scene-controller.tsx` : observation des scènes et mise à jour d'attributs `data-*` ;
- `report-transformation-story.tsx` : conservation du récit actuel, avec adaptation de la mise en scène ;
- `pricing-selector.tsx` : interaction tarifaire existante inchangée.

Le contenu statique ne doit pas être déplacé dans un grand Client Component.

### 6.3 Progression et fallback

Le contrôleur utilise `IntersectionObserver` pour déterminer la scène active et expose uniquement des attributs comme `data-cinematic-scene` ou des variables CSS bornées.

Si JavaScript ou `IntersectionObserver` n'est pas disponible :

- toutes les sections restent affichées ;
- le header utilise directement sa surface claire ;
- la photographie reste statique ;
- le document final reste visible ;
- aucun espace vide réservé à une animation ne subsiste.

### 6.4 Images

- `next/image` reste obligatoire.
- Chaque photographie possède un ratio réservé.
- Le hero utilise `getImageProps` avec un élément `picture` et deux sources d'art direction mobile et desktop.
- Le navigateur ne télécharge que la source correspondant au viewport ; l'image LCP utilise `fetchPriority="high"` sans précharger une source masquée.
- Les images sous la ligne de flottaison restent paresseuses.
- Aucun asset distant n'est ajouté.

### 6.5 Données et erreurs

La landing ne déclenche aucun chargement de données applicatives. Les contenus de démonstration restent statiques et typés.

Les seuls états interactifs sont :

- progression du récit ;
- sélecteur de facturation ;
- ouverture native de la FAQ et du menu mobile.

Le fallback statique constitue le traitement d'erreur des fonctionnalités d'amélioration progressive.

## 7. Responsive et accessibilité

### Desktop

- Composition asymétrique à partir de `lg`.
- Hauteur totale du `main` inférieure ou égale à 7 viewports à 1440 x 1000.
- Aucun espace vide supérieur à 180 px.
- Aucun contenu horizontalement coupé.

### Tablette

- Photographie toujours présente.
- Titre et CTA lisibles sans chevauchement.
- Cibles interactives d'au moins 44 px.
- Document et étapes peuvent rester en deux colonnes uniquement si la largeur utile le permet.

### Mobile

- Une seule colonne avant 768 px.
- Hauteur totale du `main` inférieure ou égale à 8 viewports à 390 x 844.
- CTA primaire visible dans le premier viewport.
- Aucun scroll horizontal.
- Photographie optimisée et texte placé dans une zone sûre.

### Accessibilité

- Contraste WCAG AA pour tous les textes et contrôles.
- Ordre DOM identique à l'ordre de lecture.
- Focus visible sur chaque action.
- Navigation complète au clavier.
- `prefers-reduced-motion` supprime les transitions cinématographiques.
- Aucun contenu sémantique essentiel masqué par `opacity: 0` ou `visibility: hidden`.
- Les duplications visuelles du document restent `aria-hidden`.

## 8. Conversion

La cinématographie ne doit jamais retarder la compréhension ou l'action.

- Le CTA primaire est visible dans le header et le hero.
- Le CTA secondaire conduit directement à la preuve produit.
- Le tarif et les conditions d'essai apparaissent avant la FAQ.
- Le CTA final clôt le récit sans action concurrente.
- Tous les liens d'inscription utilisent `webAppPath("/signup")` avec `prefetch={false}`.
- La démonstration Cal.com reste uniquement dans le footer.

## 9. Performance

Objectifs sur le build de production local :

- Lighthouse mobile performance supérieur ou égal à 95 ;
- Lighthouse accessibilité égal à 100 ;
- Lighthouse SEO égal à 100 ;
- LCP mobile inférieur à 2,5 secondes ;
- CLS inférieur à 0,1 ;
- TBT inférieur à 100 ms ;
- aucune erreur console ;
- aucun chargement de police web bloquante.

Le budget JavaScript supplémentaire de la variante cinématographique est limité à 20 Ko gzip sur la page d'accueil. Tout dépassement exige la suppression ou la simplification d'un effet.

## 10. Tests et vérification

### Tests automatisés

- Maintenir tous les tests marketing existants.
- Ajouter des tests de contrat pour les cinq scènes et leur ordre.
- Vérifier que les contenus factuels et destinations de conversion restent inchangés.
- Vérifier que les îlots client restent limités aux améliorations interactives.
- Vérifier les fallbacks sans mouvement et sans JavaScript dans le markup et la CSS.
- Vérifier qu'aucune affirmation interdite n'est introduite.

### Build et qualité

- `bun test` dans `apps/marketing`.
- `bun run lint` dans `apps/marketing`.
- `bun run check-types` à la racine.
- `bun run build` dans `apps/marketing`.
- `git diff --check`.

### QA navigateur

- Desktop 1440 x 1000.
- Tablette 834 x 1112.
- Mobile 390 x 844.
- Mode réduction des animations.
- JavaScript désactivé.
- Navigation clavier.
- Vérification du hero, des raccords, du récit produit, du sélecteur de prix, de la FAQ et des CTA.
- Captures avant et après chaque raccord majeur.
- Lighthouse mobile et desktop.

## 11. Hors périmètre

- Pages SEO, blog et pages légales, sauf composants partagés indispensables.
- Modification des prix ou de l'offre.
- Synchronisation Autumn.
- Nouvelle collecte de retours propriétaire.
- Témoignages, logos clients ou chiffres de preuve.
- Vidéo, son, WebGL, Three.js, GSAP ou nouveau moteur de scroll.
- Réécriture du produit `apps/web`.

## 12. Critères d'acceptation

La variante est prête à être comparée à la landing actuelle lorsque :

1. les cinq scènes forment un récit continu et reconnaissable ;
2. le hero possède une présence documentaire nettement plus forte ;
3. le passage du geste au document est la signature de la page ;
4. le contenu commercial et factuel est inchangé ;
5. la conversion reste visible et directe ;
6. les fallbacks statiques conservent tout le contenu ;
7. les objectifs responsive, accessibilité, SEO et performance sont atteints ;
8. la branche peut être lancée et comparée sans modifier `main`.
