# Refonte de la landing Biume - Le carnet vivant

- Date : 12 juillet 2026
- Statut : design approuvé
- Périmètre principal : `apps/marketing`
- Périmètre secondaire approuvé : cohérence de l'essai gratuit dans `apps/web`

## 1. Décision

La page d'accueil de Biume doit vendre une proposition spécialisée : le compte rendu propriétaire et le suivi post-séance pour les ostéopathes animaliers.

La direction retenue est **Le carnet vivant**. Elle associe :

- une composition éditoriale asymétrique ;
- une photographie documentaire dominante ;
- une démonstration fidèle du passage d'une observation technique à un compte rendu compréhensible ;
- une matière visuelle discrète, sans revenir aux cartes SaaS génériques ;
- une chorégraphie de scroll concentrée sur une seule séquence produit ;
- une conversion directe vers l'essai gratuit.

Ce document remplace, pour la page d'accueil uniquement :

- `2026-07-11-marketing-landing-redesign-design.md` ;
- `2026-07-11-marketing-landing-kinetic-enhancement-design.md`.

Les pages SEO, éditoriales et légales conservent leur structure actuelle, sauf pour les composants partagés explicitement mentionnés dans ce document.

## 2. Public et positionnement

### Public principal

Le visiteur principal est un ostéopathe animalier indépendant en France, souvent mobile, qui prépare ses comptes rendus, gère la relation avec les propriétaires et manque de temps administratif après les séances.

Le praticien achète le produit. Le propriétaire de l'animal bénéficie du document produit.

### Promesse

> Biume structure les observations du praticien et prépare un compte rendu clair pour le propriétaire. Le praticien relit, corrige et déclenche lui-même le partage.

### Ce que la landing ne doit pas vendre

- un logiciel de gestion tout-en-un ;
- un assistant autonome qui diagnostique ou communique à la place du praticien ;
- une timeline de réponses propriétaire qui n'existe pas encore ;
- une collecte automatique de retours propriétaire à J+7 ou J+30, qui n'est pas disponible dans le produit ;
- des résultats, gains de temps, avis ou chiffres non documentés.

## 3. Objectifs

1. Faire comprendre le métier, le résultat et le contrôle praticien dès le premier écran.
2. Montrer une preuve produit fidèle dès le deuxième écran.
3. Réduire fortement la longueur et les espaces improductifs de la landing actuelle.
4. Faire de la transformation du compte rendu la signature mémorable de Biume.
5. Garder `Essayer gratuitement` comme intention principale, visible dans le hero et dans le header mobile.
6. Rendre vraie la promesse d'un essai de 15 jours sans carte bancaire.
7. Maintenir SEO, accessibilité, performance et contenu sans JavaScript.

## 4. Principes visuels

### 4.1 Direction artistique

La landing utilise un fond clair neutre et une seule respiration anthracite pour la séquence immersive. Elle ne suit pas automatiquement le thème sombre du système. Cette décision maintient une direction artistique stable et évite deux versions visuelles divergentes.

La page doit évoquer un carnet professionnel contemporain, pas une interface papier littérale. La matière provient de :

- lignes de construction discrètes ;
- grain fixe et très léger ;
- photographie crédible et peu filtrée ;
- surfaces produit intégrées à leur contexte ;
- angles différenciés mais cohérents ;
- ombres de diffusion teintées par la surface.

Les deux papiers flottants reliés par une ligne, présentés dans la première maquette, sont explicitement rejetés. La note et la version propriétaire appartiennent à une seule surface produit structurée.

### 4.2 Palette fonctionnelle

La palette Biume n'est pas utilisée comme un dégradé décoratif global. Chaque couleur a une responsabilité.

| Rôle | Couleur | Usage |
| --- | --- | --- |
| Fond principal | `#f7f7f4` | Canvas de la landing |
| Surface élevée | `#fdfdfb` | Document et éléments fonctionnels |
| Encre | `#1d1d21` | Titres et texte principal |
| Texte secondaire | `#696970` | Paragraphes et aide |
| Anthracite | `#202024` | Unique séquence immersive |
| Violet Biume | `#6b5ac8` | CTA, sélection, progression active |
| Bleu Biume | `#5d9bb8` | Information et transformation |
| Vert Biume | `#2e9866` | Finalisation et succès uniquement |

Le dégradé historique `#8e82e8 -> #62a8c8 -> #28c978` reste réservé :

- au logo ;
- à un soulignement éditorial ponctuel ;
- à la fin de la ligne de progression du document.

Il ne doit pas être utilisé sur un grand titre, un fond, une ombre ou un bouton.

### 4.3 Typographie

- Geist reste la typographie principale pour le contenu et toute représentation du produit.
- Geist Mono reste réservé aux prix, étapes, statuts et libellés fonctionnels.
- Newsreader est ajouté uniquement pour certains mots éditoriaux mis en contraste dans les grands titres.
- Aucun texte de l'interface produit n'utilise de serif.
- Le hero conserve une taille contrôlée et une composition asymétrique. La hiérarchie ne repose pas uniquement sur une taille excessive.

### 4.4 Formes et surfaces

- Les sections ne sont pas enfermées dans des cartes.
- Les bordures, changements de fond et espaces négatifs organisent la page.
- Les cartes sont réservées aux véritables objets élevés : document, éditeur, sortie PDF.
- Les grands rayons sont asymétriques mais restent limités aux photos et documents principaux.
- Aucun halo néon, contour lumineux, gradient de texte ou glassmorphism décoratif n'est autorisé.

## 5. Structure de la page

La page est organisée en cinq moments. Le produit apparaît avant toute longue explication éditoriale.

Contraintes de rythme mesurables :

- cinq sections principales exactement entre le header et le footer ;
- hauteur du `main` inférieure ou égale à 6,2 hauteurs de viewport à 1440 x 1000 ;
- hauteur du `main` inférieure ou égale à 8 hauteurs de viewport à 390 x 844 ;
- aucun espacement vertical vide supérieur à 160 px sur desktop ou 96 px sur mobile ;
- aucune répétition des anciens espacements `28vh` entre cartes ou `22vh` en fin de parcours.

### 5.1 Header et hero - Comprendre

Le header est dédié à la page d'accueil et n'altère pas le header des pages SEO.

Desktop :

- logo Biume à gauche ;
- `Le produit`, `Comment ça marche`, `Tarifs` et `Ressources` au centre ;
- `Connexion` et `Essayer gratuitement` à droite.

Mobile :

- logo à gauche ;
- CTA compact `Essayer` directement visible à droite ;
- la navigation secondaire reste accessible dans un menu natif.

Contenu approuvé du hero :

- catégorie : `Le compte rendu propriétaire des ostéopathes animaliers` ;
- titre : `Vos observations, dans des mots qui restent.` ;
- texte : `Biume structure vos notes et prépare un compte rendu clair pour le propriétaire. Vous relisez, corrigez et choisissez quand le partager.` ;
- CTA primaire : `Essayer gratuitement` ;
- CTA secondaire : `Voir un exemple de compte rendu` ;
- réassurance : `15 jours d'essai`, `Sans carte bancaire`, `Partagé par vous`.

Le visuel associe la photo cheval existante et une seule surface produit intégrée. Cette surface montre un seul champ de texte à la fois. Son état initial contient la note technique ; son état final contient la proposition adaptée. Elle ne suggère jamais que les deux versions sont conservées simultanément dans le produit.

La capture statique du hero montre l'état final :

- libellé `Proposition adaptée` ;
- texte adapté ;
- aide `Vous pouvez encore modifier ce texte` ;
- action explicite de partage par le praticien.

La surface est rattachée à la photo. Elle ne croise jamais le titre, le visage, les mains ou la zone de travail du praticien.

### 5.2 Transformation immersive - Voir le produit

Cette section est la seule grande séquence de scroll. Elle utilise un fond anthracite et un document clair ancré à droite.

Le récit comporte quatre états :

1. `Noter` - la note technique entre dans le document.
2. `Structurer` - les informations prennent une forme cohérente.
3. `Adapter le langage` - la version propriétaire apparaît et reste modifiable.
4. `Finaliser` - le praticien relit le texte, choisit de finaliser le rapport puis utilise une action explicite pour télécharger ou partager le PDF.

Le titre de section est :

> Une note devient un document que le propriétaire peut comprendre.

Le document doit ressembler à une représentation fidèle du produit, pas à un faux dashboard. Les contenus de démonstration sont statiques, factuels et rendus côté serveur. Les états `note technique` et `proposition adaptée` se succèdent dans le même champ ; ils ne sont jamais affichés comme deux valeurs persistées côte à côte.

### 5.3 Preuve produit - Vérifier

Cette section montre uniquement les capacités présentes dans le dépôt :

- éditeur de compte rendu structuré ;
- observations, anatomie, recommandations et notes ;
- adaptation du langage technique ;
- prévisualisation et finalisation ;
- export PDF professionnel ;
- relance de rendez-vous à une échéance choisie.

Les sorties montrées sont précisément :

- `Compte-rendu-seance.pdf` avec le libellé `PDF professionnel` ;
- `Relance de rendez-vous` avec le détail `Échéance choisie par le praticien : dans 30 jours`.

La relance est présentée comme un message de reprise de rendez-vous planifié, jamais comme un questionnaire ou une réponse propriétaire.

La composition utilise un éditeur principal et deux sorties plus petites. Les titres restent en dehors des surfaces lorsque cela améliore la lecture.

Le texte d'introduction doit exprimer :

> Pas une promesse abstraite. Les outils réellement disponibles.

Les mentions suivantes sont interdites sur la page d'accueil tant que le produit ou une preuve ne les confirme pas :

- réponse propriétaire centralisée ;
- timeline de suivi propriétaire ;
- questionnaire automatique de retour propriétaire à J+7 ;
- support complet des comptes rendus pour les chats ;
- temps économisé ;
- adoption, note, témoignage ou logo client ;
- conformité ou hébergement affirmés sans documentation à jour.

### 5.4 Contrôle et prix - Décider

La section assemble la confiance praticien et le prix sans carte SaaS imbriquée.

Message principal :

> Biume prépare. Vous décidez.

Texte de contrôle :

> Biume ne partage rien automatiquement. Vous relisez, corrigez et déclenchez vous-même le partage.

Le prix annuel est affiché par défaut :

- `24,99 € par mois, facturé annuellement` ;
- `299,88 € facturés une fois par an`.

Le contrôle mensuel permet d'afficher :

- `29,99 € par mois` ;
- `Facturation mensuelle, résiliable en fin de période`.

Le sélecteur conserve `aria-pressed` et le changement de prix utilise une région `aria-live`.

La phrase d'essai devient :

> 15 jours pour tester l'ensemble du parcours, sans carte bancaire.

### 5.5 FAQ et CTA final - Lever les derniers freins

La FAQ reste fondée sur des éléments `details` et `summary` natifs.

Elle traite cinq objections :

1. Biume remplace-t-il un logiciel de gestion ?
2. Biume écrit-il à la place du praticien ?
3. Chaque texte peut-il être modifié avant le partage ?
4. Que reçoit le propriétaire ?
5. Comment arrêter l'abonnement ?

Réponses approuvées :

1. `Non. Biume se concentre sur le compte rendu propriétaire et le suivi post-séance. Il complète votre organisation actuelle.`
2. `Biume prépare une proposition à partir de vos notes. Lorsque vous l'appliquez, elle remplace le texte du champ courant et reste entièrement modifiable.`
3. `Oui. Vous pouvez modifier chaque champ avant de déclencher vous-même le téléchargement ou l'envoi.`
4. `Le propriétaire reçoit le PDF professionnel joint à l'email que vous choisissez d'envoyer.`
5. `Vous pouvez demander l'annulation depuis les paramètres de facturation. Elle prend effet à la fin de la période en cours.`

Les sujets de confidentialité renvoient vers `/privacy`. Les conditions contractuelles renvoient vers `/cgu`. Aucune réponse ne doit affirmer un niveau de conformité, un lieu d'hébergement ou une pratique de sous-traitance non documentés dans ces pages.

Le CTA final utilise la photo praticien, propriétaire et animal existante.

- catégorie : `Votre prochain compte rendu` ;
- titre : `La séance est terminée. Le suivi peut commencer.` ;
- texte : `Créez votre espace et préparez un premier document.` ;
- CTA : `Essayer gratuitement`.

Le lien de démonstration Cal.com reste accessible dans la navigation ou le footer, mais ne concurrence pas le CTA principal dans ce dernier écran.

## 6. Motion

### 6.1 Intensité

L'intensité retenue est 6 sur 10 : visible et mémorable, mais concentrée sur le récit produit.

La transformation du compte rendu est l'unique séquence narrative animée et sticky. L'entrée du hero, la variation du header, le changement de prix et les états hover ou active sont des micro-interactions de feedback. Ils ne créent ni nouvelle séquence narrative, ni section épinglée, ni mouvement perpétuel.

### 6.2 Hero

- Le contenu textuel entre en cascade sur environ 720 ms.
- La photographie est visible dès la première frame et ne démarre jamais à `opacity: 0`.
- Un léger passage de `scale(1.02)` à `scale(1)` est autorisé sur la photo.
- Les CTA reçoivent un retour tactile : élévation de 2 px au survol et compression à `scale(0.98)` à l'activation.

### 6.3 Transformation au scroll

- La séquence s'étend sur environ 1,6 hauteur de viewport sur desktop.
- Le document reste sticky pendant que les quatre états s'activent.
- `useScroll` et `useTransform` pilotent la progression hors du cycle de rendu React.
- Seuls `transform` et `opacity` sont animés.
- Le composant ne met pas à jour un `useState` à chaque frame.
- Les contenus remplacés conservent la même surface pour éviter tout saut de mise en page.

### 6.4 Mobile et reduced motion

Sous 768 px :

- le sticky disparaît ;
- les quatre états sont présentés dans une séquence verticale ;
- le CTA du header reste visible ;
- aucune carte ne chevauche la photographie ou un autre texte.

Avec `prefers-reduced-motion: reduce` :

- la séquence devient statique ;
- tous les états restent lisibles ;
- aucune opacité initiale ne masque le contenu ;
- les interactions conservent leur focus et leur sens.

### 6.5 Interdictions

- aucune animation perpétuelle décorative ;
- aucun curseur personnalisé ;
- aucun bouton magnétique ;
- aucun scroll horizontal forcé ;
- aucun parallax plein écran ;
- aucun listener `scroll` manuel ;
- aucun mélange de Motion avec GSAP ou Three.js.

## 7. Architecture des composants

### 7.1 Composition serveur

`apps/marketing/app/page.tsx` reste un Server Component et assemble :

- `LandingHeader` ;
- `LandingHero` ;
- `ReportTransformationStory` ;
- `ProductProof` ;
- `PricingDecision` ;
- `LandingFaq` ;
- `FinalCta` ;
- le footer partagé.

Les composants statiques restent des Server Components. Ils contiennent tout le texte utile au référencement et à la compréhension sans hydratation.

### 7.2 Îlots clients

Trois responsabilités seulement nécessitent un Client Component :

1. `HeaderMotion` - variation discrète de la surface du header au scroll.
2. `ReportTransformationStory` - progression sticky et états du document.
3. `PricingSelector` - choix annuel ou mensuel et annonce du prix.

Chaque îlot utilise `LazyMotion` avec `domAnimation`. Aucun état global n'est ajouté.

### 7.3 Organisation des fichiers

Les composants propres à la landing sont regroupés sous `apps/marketing/components/landing`.

Les anciens composants homepage à la racine peuvent être supprimés uniquement après vérification qu'aucune autre route ne les importe. Le header partagé des pages SEO ne doit pas être remplacé par le header expérientiel de la homepage.

`MotionReveal` et l'actuel `JourneyStory` sont supprimés lorsqu'ils ne sont plus référencés. La nouvelle page ne doit pas reproduire le comportement qui rend le contenu visible côté serveur puis le masque après hydratation.

### 7.4 Périmètre de fichiers attendu

Fichiers ou zones à modifier :

- `apps/marketing/app/page.tsx` ;
- la couche landing de `apps/marketing/app/globals.css` ;
- les composants homepage actuels sous `apps/marketing/components` ;
- `apps/marketing/lib/web-app-url.ts` ;
- `apps/marketing/__tests__/home-landing.test.tsx` ;
- les tests de liens et pages partagées affectés par le nouveau header ;
- `apps/web/autumn.config.ts` ;
- un test web ciblé sur la politique d'essai ;
- `turbo.json` pour `NEXT_PUBLIC_WEB_APP_URL`.

Fichiers ou zones à créer sous `apps/marketing/components/landing` :

- header homepage et son enveloppe motion ;
- hero ;
- transformation du compte rendu ;
- preuve produit ;
- décision et prix ;
- FAQ homepage ;
- CTA final.

Le plan d'implémentation décidera les noms exacts sans introduire une abstraction générique utilisée par une seule section.

## 8. Données et contenu de démonstration

La landing n'effectue aucune requête réseau pour rendre la démonstration produit.

Les contenus de l'exemple sont définis dans des constantes typées côté serveur et transmis à l'îlot de transformation. Le même contenu est rendu dans la version statique et la version animée.

Le modèle de démonstration contient :

- une observation technique affichée dans le premier état ;
- une proposition adaptée qui remplace visuellement l'observation dans l'état suivant ;
- un statut de finalisation ;
- un nom de fichier PDF ;
- quatre étapes de progression.

Il n'utilise aucune donnée client réelle et n'affiche aucun résultat médical ou diagnostic.

Contenu exact de la démonstration :

- observation : `Mobilité réduite à gauche et tension modérée observée au niveau thoracique. La mobilité s'est améliorée pendant la séance.` ;
- proposition adaptée : `Une tension plus présente a été observée du côté gauche, au niveau du thorax. La mobilité s'est améliorée au cours de la séance.` ;
- aide : `Cette proposition remplace le texte du champ lorsque vous choisissez de l'appliquer. Elle reste modifiable.` ;
- fichier : `Compte-rendu-seance.pdf` ;
- état final : `Finalisé par vous`.

Le texte final décrit uniquement ce qui a été observé pendant la séance. Il ne formule aucun diagnostic, pronostic ou conseil médical.

## 9. Conversion et intégrité des liens

### 9.1 Essai sans carte

La décision produit validée est un essai de 15 jours sans carte bancaire.

Dans `apps/web/autumn.config.ts`, les plans mensuel et annuel doivent avoir :

```ts
freeTrial: { durationLength: 15, durationType: "day", cardRequired: false }
```

Cette modification est nécessaire avant d'afficher la promesse sur la nouvelle landing.

La modification locale ne suffit pas à rendre la promesse vraie en production. Le déploiement doit inclure :

1. vérification locale avec `bunx atmn preview` depuis `apps/web` ;
2. synchronisation sandbox avec `bunx atmn push` ;
3. vérification d'un nouveau parcours d'essai sans redirection vers Stripe Checkout ;
4. synchronisation production avec `bunx atmn push -p` après autorisation explicite de modifier la configuration de facturation externe ;
5. vérification end-to-end sur un nouveau compte de production avant publication de la mention `Sans carte bancaire`.

La landing ne doit pas être déployée avec cette mention tant que les étapes 4 et 5 ne sont pas validées.

Référence opérationnelle : [Autumn CLI - push and pull](https://docs.useautumn.com/cli/getting-started#push-and-pull).

### 9.2 URL de l'application

`webAppPath` ne doit jamais produire une URL localhost en production.

Comportement requis :

- utiliser `NEXT_PUBLIC_WEB_APP_URL` lorsqu'elle est définie ;
- utiliser `https://app.biume.com` comme repli de production ;
- utiliser `http://localhost:3001` uniquement en développement et en test local.

`NEXT_PUBLIC_WEB_APP_URL` doit être ajouté aux variables de build déclarées dans `turbo.json` afin d'éviter un cache de build avec une mauvaise destination.

Tous les CTA `Essayer gratuitement` pointent vers `webAppPath("/signup")` avec `prefetch={false}`.

### 9.3 Liens secondaires

- `Voir un exemple de compte rendu` pointe vers l'ancre de transformation produit.
- La démonstration pointe vers `https://cal.com/mathieu-chambaud-biume`.
- Le lien footer `/contact`, qui retourne actuellement une 404, est supprimé. La démonstration Cal.com reste le moyen de contact visible.

### 9.4 Instrumentation future

Aucun fournisseur analytics n'est installé dans l'application marketing. La refonte n'en ajoute pas.

Les liens de conversion reçoivent des attributs stables comme `data-conversion="hero-signup"`, `data-conversion="pricing-signup"` et `data-conversion="final-signup"`. Ils permettent une instrumentation ultérieure sans modifier la structure visuelle.

## 10. États, erreurs et amélioration progressive

La page n'a pas d'état de chargement applicatif, car son contenu est statique.

Garanties :

- les espaces d'image sont réservés avant le chargement ;
- un échec d'image ne masque aucun CTA ni texte ;
- un échec de Motion laisse tout le contenu visible ;
- sans JavaScript, la transformation est une séquence verticale complète ;
- la FAQ conserve son comportement natif ;
- le prix annuel est présent dans le HTML initial ;
- une variable d'environnement manquante en production utilise le domaine applicatif sûr ;
- tous les liens externes ont une destination vérifiée.

## 11. SEO, accessibilité et performance

### SEO

- conserver les métadonnées, le canonical, Open Graph et le JSON-LD `Service` ;
- conserver la page en français et une hiérarchie de titres valide ;
- ne pas convertir le schéma en offre marchande ou `SoftwareApplication` sans nouvelle décision SEO ;
- rendre tout le contenu principal côté serveur.

### Accessibilité

- contraste AA minimum ;
- zones interactives d'au moins 44 px ;
- focus visible indépendant du hover ;
- ordre DOM identique à l'ordre de lecture ;
- navigation clavier du menu, du prix et de la FAQ ;
- texte alternatif descriptif pour les photographies ;
- images et illustrations produit décoratives masquées aux technologies d'assistance lorsque leur information existe déjà en texte.

### Performance

- image hero avec `priority`, `fetchPriority="high"`, espace réservé et qualité 65 ;
- `next/font` pour Geist, Geist Mono et Newsreader ;
- aucun nouveau moteur d'animation ;
- aucun filtre animé sur un conteneur scrollant ;
- grain appliqué à une couche fixe non interactive ;
- chargement de Motion limité aux trois îlots clients.

## 12. Vérification

### Tests automatisés

Mettre à jour ou créer des contrats pour :

- le contenu exact du hero ;
- les CTA et leurs destinations ;
- l'absence de localhost en production ;
- l'essai de 15 jours sans carte sur les deux plans ;
- les quatre états de transformation présents dans le HTML initial ;
- les capacités produit autorisées ;
- l'absence des promesses interdites ;
- la présence de cinq `details` natifs ;
- le prix annuel et le prix mensuel ;
- les attributs `data-conversion` ;
- l'absence de contenu initialement invisible ;
- l'absence de listener de scroll manuel et d'animation infinie.

Commandes de vérification prévues :

```bash
bun test apps/marketing/__tests__
bun --filter @biume/web test
bun --filter @biume/marketing lint
bun run check-types
bun --filter @biume/marketing build
```

Ajouter le test ciblé approprié pour `apps/web/autumn.config.ts` si aucun contrat ne couvre la politique d'essai.

### Vérification navigateur

Vérifier au minimum :

- 1440 x 1000 desktop ;
- 834 x 1112 tablette ;
- 390 x 844 mobile ;
- JavaScript désactivé ;
- réduction de mouvement ;
- navigation clavier ;
- menu mobile ;
- sélecteur de prix ;
- FAQ ;
- aucun débordement horizontal ;
- aucune disparition de contenu après hydratation ;
- aucun CTA vers localhost ;
- aucune erreur console.

Mesurer également `main.getBoundingClientRect().height / window.innerHeight` aux tailles desktop et mobile prévues afin de vérifier les limites de longueur définies en section 5.

### Cibles Lighthouse

- Performance : au moins 95 ;
- Accessibilité : 100 ;
- SEO : 100 ;
- LCP : moins de 2,5 secondes ;
- CLS : moins de 0,1.

## 13. Hors périmètre

- refonte de l'application TanStack ;
- changement du tunnel d'inscription en dehors de la politique de carte ;
- ajout d'un fournisseur analytics ;
- nouvelles pages SEO ;
- ajout de témoignages ou logos sans preuve réelle ;
- nouvelle photographie générée ;
- suppression globale d'anciens assets sans audit d'usage ;
- modification de la politique de confidentialité ;
- création d'une route `/contact`.

## 14. Critères d'acceptation

- La page est immédiatement identifiable comme Biume grâce à sa palette fonctionnelle et à sa transformation de document.
- Le hero approuvé est reproduit sans les cartes flottantes rejetées.
- Le produit est montré dès le deuxième écran.
- La page respecte les limites de 6,2 hauteurs de viewport sur desktop et 8 hauteurs sur mobile, footer exclu.
- Une seule séquence de scroll porte l'immersion.
- Les capacités montrées existent réellement dans le produit.
- Le violet sert l'action, le bleu l'information et le vert la finalisation.
- Le CTA signup reste visible sur mobile.
- L'essai est réellement de 15 jours sans carte bancaire.
- Aucun lien de production ne pointe vers localhost ou une route inexistante.
- Le contenu reste complet sans JavaScript et avec réduction de mouvement.
- SEO, accessibilité, build, tests et performances respectent les seuils définis.
