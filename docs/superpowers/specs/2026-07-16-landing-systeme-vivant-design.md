# Landing Biume — « Le système vivant »

Date : 16 juillet 2026  
Statut : conception validée  
Branche : `codex/landing-systeme-vivant`

## Objectif

Refondre entièrement la page d’accueil marketing de Biume pour présenter le produit comme le système qui réduit la charge administrative quotidienne des ostéopathes animaliers, sans sacrifier la précision clinique, la clarté pour le propriétaire ni la continuité du suivi.

La conversion principale est le démarrage de l’essai gratuit de 15 jours. La réservation d’une démonstration reste disponible comme parcours secondaire.

## Direction créative

La direction retenue est « Le système vivant » : une landing chaleureuse, tactile et mémorable inspirée du rythme de [Clay](https://www.clay.com), sans reprendre sa marque, ses illustrations ni sa composition à l’identique.

Les éléments de langage visuel empruntés à Clay sont :

- une navigation flottante sur une grande scène signature ;
- une palette fortement identifiable ;
- une alternance de scènes visuelles et de preuves produit ;
- un hero en deux temps, illustration puis promesse ;
- des transitions fluides et un mouvement continu discret.

L’univers propre à Biume raconte le parcours « séance → notes → compte rendu → suivi ». La scène signature associe une praticienne, un animal, des documents et une trajectoire visuelle qui matérialise la circulation de l’information.

## Ton et système visuel

- Ton : confiant, concret, chaleureux et précis.
- Fond principal : ivoire Biume `--carnet-canvas` (`#f7f7f4`).
- Surface claire : `--carnet-surface` (`#fdfdfb`).
- Couleur dominante et couleur des actions : violet Biume `--carnet-violet` (`#6b5ac8`).
- Couleur de transition et de circulation : bleu Biume `--carnet-blue` (`#5d9bb8`).
- Couleur des états positifs et du suivi : vert Biume `--carnet-green` (`#2e9866`).
- Texte et sections sombres : anthracite Biume `--carnet-anthracite` (`#202024`), jamais noir pur.
- Typographie : Geist Sans et Geist Mono déjà disponibles dans le projet. Aucun nouvel import de police.
- Formes : grands rayons organiques, trajectoires courbes, surfaces tactiles et bordures fines.
- Ombres : diffuses et teintées selon la surface, sans halo extérieur.
- Iconographie : le logo existant et des primitives graphiques simples. Aucun nouvel ensemble d’icônes n’est requis.

Le violet reste la couleur d’action principale. Le bleu et le vert ne deviennent pas des accents concurrents : ils servent respectivement la circulation de l’information et les états de validation ou de suivi. Les trois couleurs peuvent se retrouver ensemble dans la scène signature et les détails du logo, avec une saturation maîtrisée.

Le design évite les gradients de texte, les halos violets ou bleus, les cartes génériques, les rangées de trois fonctionnalités identiques et l’esthétique néon associée aux landing pages IA.

## Hero

Le hero utilise une hauteur minimale stable et ne dépend jamais de `h-screen`.

### Composition desktop

1. Navigation flottante sur fond ivoire : logo, Produit, Comment ça marche, Tarifs, Ressources, Connexion, Réserver une démo, Essayer 15 jours.
2. Scène visuelle plein cadre représentant le flux Biume autour d’une séance animale.
3. Panneau anthracite ou violet Biume en partie basse avec une grille asymétrique : promesse à gauche, explication et actions à droite.
4. Rail de réassurance sous les actions.

### Contenu principal

- Surtitre : « Votre journée, mieux orchestrée ».
- Titre : « Moins d’administratif. Plus de temps pour soigner. »
- Description : « Biume transforme vos notes en comptes rendus précis et clairs, puis garde le fil du suivi propriétaire. »
- Action principale : « Essayer gratuitement » vers l’inscription.
- Action secondaire : « Réserver une démo » vers `https://cal.com/mathieu-chambaud-biume`.
- Réassurance : « 15 jours d’essai », « Sans carte bancaire », « Rien ne part sans vous ».

### Mobile

La scène visuelle est raccourcie, les contenus passent en une colonne et seul le CTA d’essai est affiché directement dans le panneau principal. La démonstration reste disponible dans le menu mobile. Le hero ne provoque aucun débordement horizontal.

## Architecture narrative

### 1. Promesse

Le hero installe la valeur principale : récupérer du temps de soin sans perdre la qualité du travail transmis.

### 2. Réassurance immédiate

Un rail linéaire expose les trois conditions de l’essai : 15 jours, aucune carte bancaire et validation obligatoire avant envoi. Aucun chiffre client non vérifié n’est inventé.

### 3. Le temps retrouvé

Une journée de cabinet est représentée comme un parcours continu : séance, notes, compte rendu, partage et suivi. Cette section explique où Biume supprime les ressaisies et les oublis.

Le contenu doit rester honnête : il décrit un flux simplifié sans promettre un volume d’heures économisées qui ne serait pas documenté.

### 4. Précis pour vous, clair pour le propriétaire

La démonstration existante `REPORT_TRANSFORMATION_DEMO` reste la source de vérité. La section montre une observation clinique brute, sa structuration et la proposition lisible par le propriétaire.

Le visiteur peut déclencher ou rejouer la transformation. Le contenu important reste visible et compréhensible sans JavaScript.

### 5. Le suivi ne repose plus sur votre mémoire

Une composition en messages et échéances montre le compte rendu prêt à relire, le retour propriétaire et la relance programmée. Le texte précise que le praticien décide de l’échéance et conserve la validation finale.

### 6. Biume prépare, vous décidez

Une section courte, visuellement calme, traite le contrôle : aucune communication ne part sans validation du praticien. Elle sert de respiration avant le prix.

### 7. Une offre, deux rythmes

Le sélecteur mensuel/annuel et les données de `billingOptions` sont conservés. L’offre reste unique et la liste des fonctionnalités est concise.

Le CTA renvoie vers l’inscription. Le style du panneau tarifaire suit la palette Biume — ivoire, violet dominant et vert de validation — sans reprendre la carte générique actuelle.

### 8. FAQ et clôture

La FAQ traite les objections existantes. Le dernier appel à l’action est exclusivement consacré à l’essai de 15 jours afin de ne pas diluer la conversion. La réservation d’une démonstration reste accessible dans le header, le menu mobile, à proximité de la FAQ et dans le footer partagé.

## Architecture des composants

`apps/marketing/app/page.tsx` reste un composant serveur qui assemble des sections ciblées sous `apps/marketing/components/landing`.

Les unités prévues sont :

- `landing-header.tsx` : navigation desktop et mobile ;
- `landing-hero.tsx` : contenu statique du hero et composition de la scène ;
- un composant client microscopique pour le mouvement de la scène du hero ;
- une section « journée de cabinet » ;
- `report-transformation-story.tsx` adapté pour la démonstration interactive ;
- une section de suivi client ;
- une section de contrôle et de confiance ;
- `pricing-decision.tsx` et `pricing-selector.tsx` adaptés au nouveau langage visuel ;
- `landing-faq.tsx` et `final-cta.tsx` adaptés à la clôture ;
- le footer partagé existant.

Les fichiers peuvent être renommés lors de l’implémentation si cela améliore clairement leur responsabilité, mais les limites restent les mêmes : contenu statique côté serveur, interactions isolées côté client.

## Données et liens

La page n’ajoute aucune API ni récupération distante.

- Inscription et connexion utilisent `webAppPath`.
- La démonstration utilise `https://cal.com/mathieu-chambaud-biume`.
- Le contenu de transformation utilise `REPORT_TRANSFORMATION_DEMO`.
- Le tarif utilise `billingOptions`.
- Les ressources pointent vers le blog existant.

L’absence de données distantes élimine les états de chargement et d’erreur réseau. Les liens et contrôles conservent des états de focus, hover et active explicites.

## Mouvement et interactions

La dépendance `motion` déjà installée est utilisée uniquement dans de petits composants client.

- La scène du hero contient un mouvement continu discret des documents, de la trajectoire et de quelques objets.
- La navigation se compacte légèrement au défilement.
- Les sections apparaissent avec une révélation séquencée lorsqu’elles entrent dans le viewport.
- La transformation du compte rendu peut être déclenchée et rejouée.
- Le sélecteur de facturation conserve son comportement existant.

Toutes les animations utilisent uniquement `transform` et `opacity`. Elles s’arrêtent ou sont remplacées par un état statique avec `prefers-reduced-motion: reduce`. Les mouvements continus sont isolés et mémorisés pour ne pas provoquer de rendu de toute la page.

Le mouvement automatique est réduit sur mobile. Aucun écouteur manuel de scroll n’est ajouté ; les primitives de `motion` ou `IntersectionObserver` sont utilisées avec nettoyage systématique.

## Responsive et accessibilité

- Conteneur maximal cohérent avec le site, jusqu’à environ 1400 px.
- Grilles asymétriques à partir de `md` ou `lg`, colonne unique en dessous de `md`.
- Cibles interactives d’au moins 44 px.
- Navigation mobile au clavier, libellés accessibles et focus visibles.
- Titres hiérarchisés, un seul `h1` et des sections identifiables.
- Images décoratives ignorées par les technologies d’assistance ; visuels informatifs avec texte alternatif précis.
- Contrastes conformes à WCAG AA pour le texte et les contrôles.
- Pas de défilement horizontal, de contenu masqué ni de texte critique dépendant de l’animation.

## Performance

- Assets du hero locaux et optimisés avec `next/image` lorsqu’ils sont rasterisés.
- Image principale prioritaire ; médias sous la ligne de flottaison chargés paresseusement.
- Aucun filtre de bruit appliqué à un conteneur défilant.
- Animations accélérées matériellement et limitées en nombre.
- Aucun nouveau package.
- Aucun script tiers de démonstration embarqué ; le CTA ouvre la page Cal.com dédiée.

## Vérification

Les tests existants doivent être adaptés sans supprimer les garanties métier.

Les vérifications prévues sont :

1. tests de contenu du hero et des réassurances ;
2. tests de destination des CTA d’inscription, connexion et démonstration ;
3. tests de la transformation et de son contenu de référence ;
4. tests du sélecteur de prix ;
5. test garantissant que le CTA final ne concurrence pas l’essai avec une démonstration ;
6. tests de structure de la page et des ancres ;
7. tests du comportement avec mouvement réduit ;
8. lint de l’application marketing ;
9. build de l’application marketing ;
10. inspection visuelle desktop et mobile dans un navigateur réel ;
11. audit final avec les Web Interface Guidelines à jour.

## Hors périmètre

- Refonte des pages SEO, du blog ou de l’application produit.
- Modification du prix ou des conditions de l’essai.
- Nouveau système de réservation de démonstration.
- Nouveaux témoignages, logos clients ou métriques non vérifiés.
- Nouvelle charte globale pour les autres applications du monorepo.

## Critères d’acceptation

- La nouvelle page est disponible sur la branche `codex/landing-systeme-vivant`.
- Le hero communique le gain de temps, la précision du compte rendu et la clarté propriétaire au-dessus de la ligne de flottaison.
- L’essai de 15 jours est l’action dominante sur toute la page.
- La démonstration reste accessible sans concurrencer le dernier CTA.
- Les huit temps narratifs sont présents et cohérents.
- Le design évoque le rythme et la mémorabilité de Clay tout en restant distinctement Biume.
- La page est utilisable au clavier, respecte le mouvement réduit et fonctionne sans débordement sur mobile.
- Les tests ciblés, le lint et le build marketing réussissent.
- L’inspection visuelle ne révèle pas de rupture majeure aux largeurs mobile et desktop.
