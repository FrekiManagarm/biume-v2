# Refonte complète de la landing Biume — L’atelier de précision

Date : 17 juillet 2026  
Statut : direction validée par le propriétaire du produit

## Résumé

La page d’accueil marketing de Biume est reconstruite intégralement. La nouvelle direction, nommée **L’atelier de précision**, présente Biume comme un instrument professionnel qui prolonge le regard du praticien après la séance.

La landing combine environ 70 % de démonstration produit et 30 % de photographie documentaire. Elle doit être moderne et immersive, sans adopter les réflexes visuels d’une landing SaaS générique, d’un univers vétérinaire clinique ou d’une marque enfantine pour animaux.

La refonte couvre le header, le héros, la narration produit, le contrôle du praticien, le suivi après séance, les scènes photographiques, la tarification, la FAQ, le CTA final, le footer, les textes, les mouvements et le responsive. Les composants et médias actuels ne constituent pas une contrainte de composition et peuvent rester inutilisés après la refonte.

## Contexte produit

Biume s’adresse en priorité aux ostéopathes animaliers indépendants. Il transforme leurs notes professionnelles en un compte rendu compréhensible par le propriétaire, tout en laissant chaque modification, validation et partage sous le contrôle du praticien.

La conversion principale est l’inscription à l’essai gratuit de 15 jours sans carte bancaire. La conversion secondaire est la demande de démonstration gratuite.

La landing ne dispose actuellement d’aucun témoignage, chiffre d’usage, logo partenaire ou cas client validé. La crédibilité doit donc reposer sur des démonstrations produit fidèles et des affirmations vérifiables.

## Objectifs

- Faire comprendre en moins de dix secondes que Biume conserve le regard métier du praticien jusqu’au propriétaire.
- Donner une impression dominante de maîtrise professionnelle, enrichie par la chaleur du vivant.
- Montrer le produit en action dès le premier écran.
- Rendre visible la transformation `notes professionnelles → version propriétaire → validation → suivi`.
- Faire du contrôle du praticien une preuve centrale, pas une simple promesse textuelle.
- Donner à la page une présence immersive grâce à la composition, aux changements de rythme et au mouvement utile.
- Préparer la tarification à recevoir plusieurs offres ultérieurement sans reconstruire la section.
- Atteindre WCAG 2.2 AA et conserver une expérience complète avec réduction des mouvements.

## Hors périmètre

- Modifier le produit TanStack Start ou son fonctionnement métier.
- Ajouter des témoignages, statistiques, logos ou résultats non validés.
- Ajouter une nouvelle formule tarifaire qui n’existe pas encore.
- Modifier les prix ou les conditions actuels.
- Repenser les pages SEO, le blog ou les pages légales au-delà des liens nécessaires depuis la landing.
- Supprimer les anciens médias du dépôt ; ils peuvent simplement ne plus être référencés.

## Direction créative

### Scène physique

Une ostéopathe animalière termine une séance dans une lumière naturelle calme. Elle reste concentrée sur ses observations et veut restituer un document clair sans perdre sa précision ni déléguer ses décisions.

Cette scène impose une surface principale claire, une présence photographique documentaire et une interface produit nette. La page ne doit être ni sombre par réflexe technologique, ni pastel par réflexe animalier.

### Voix visuelle

Trois qualificatifs pilotent la direction : **précise, tactile, vivante**.

- **Précise** : alignements nets, états produit explicites, hiérarchie lisible et texte concret.
- **Tactile** : superpositions courtes, objets qui paraissent manipulables et mouvements qui expliquent une transformation.
- **Vivante** : photographie de terrain, rythme variable et couleur utilisée avec intention.

### Principe mémorable

L’interface Biume est mise en scène comme un instrument posé dans le réel. La photographie et le produit ne sont pas deux blocs juxtaposés : ils se chevauchent et racontent le même geste professionnel.

## Système visuel

### Couleurs

Les rôles sémantiques existants sont conservés :

- Violet de décision `#6B5AC8` : CTA, choix actifs, édition et contrôle.
- Bleu de liaison `#5D9BB8` : passage entre les notes, le compte rendu et le suivi.
- Vert de validation `#2E9866` : uniquement pour un état réellement confirmé ou terminé.
- Toile `#F7F7F4`, surface `#FDFDFB`, encre `#1D1D21`, anthracite `#202024`.

La stratégie est **engagée** : le violet porte plusieurs moments complets de la page, notamment le contrôle et la tarification. Le bleu relie. Le vert ne décore jamais.

### Typographie

Hanken Grotesk reste la voix marketing principale afin de préserver la continuité de marque déjà documentée. Les grandes accroches utilisent un poids fort, un interlettrage compris entre `-0.03em` et `-0.04em`, et une taille maximale de `6rem`.

Les titres sont équilibrés avec `text-wrap: balance`. Les paragraphes marketing sont limités à environ 65–70 caractères par ligne et utilisent `text-wrap: pretty`.

La monospace est réservée aux informations fonctionnelles comme un tarif, une date ou une progression. Elle n’est pas utilisée comme costume technique.

### Formes et profondeur

- Rayon maximal de 16 px pour les surfaces produit et les conteneurs ordinaires.
- Rayon maximal de 24 px pour les médias photographiques dominants.
- Pilules réservées aux boutons, sélecteurs et statuts compacts.
- Une surface utilise soit une bordure, soit une ombre courte qui explique son élévation.
- Pas de glassmorphism décoratif, de texte en dégradé, de grille de fond, de rayures ou de glow.

## Architecture narrative complète

### 1. Header

Le header est compact et reste lisible au-dessus des différentes séquences. Il comprend :

- Logo Biume.
- Liens vers Produit, Méthode, Tarifs et Ressources.
- Connexion.
- CTA principal « Essayer gratuitement ».
- Accès secondaire à la démonstration sur desktop.

Sur mobile, le menu utilise un panneau qui échappe aux conteneurs rognants, conserve des cibles de 44 px minimum et offre une navigation clavier complète.

### 2. Héros — Le regard métier

Le héros adopte une composition asymétrique :

- Promesse principale à gauche : « Votre regard métier, jusqu’au propriétaire. »
- Paragraphe expliquant que Biume transforme les notes, puis laisse le praticien relire, adapter et partager.
- CTA principal « Préparer mon premier compte rendu » menant à l’inscription.
- CTA secondaire « Voir le parcours » menant à la démonstration produit.
- Réassurances « 15 jours gratuits » et « Sans carte bancaire ».
- Nouvelle photographie documentaire à droite.
- Fenêtre produit superposée montrant « Notes professionnelles » et « Version propriétaire », avec le statut violet « À relire ».

Le premier écran doit rester compréhensible sans animation. Sur mobile, le texte passe en premier, suivi de la photographie et de l’interface superposées sans débordement horizontal.

### 3. Transformation sticky — De la note au document

Une séquence sticky raconte trois états réels :

1. Notes de séance.
2. Reformulation proposée.
3. Compte rendu à valider.

Le texte narratif évolue tandis que l’objet produit reste le point de repère. Le bleu matérialise les passages entre états. Le violet signale les choix et les éléments à relire. Aucun état n’est caché par défaut : la version statique montre les trois étapes dans un ordre clair.

Sur mobile, la séquence sticky devient une pile verticale simple pour éviter un défilement contraignant et conserver une lecture naturelle.

### 4. Contrôle du praticien — Biume prépare, vous décidez

Cette section utilise un aplat violet complet. Elle ne présente plus une liste abstraite d’actions.

Une interface d’édition démontre :

- Le texte professionnel source.
- La proposition destinée au propriétaire.
- La possibilité de modifier ou reformuler.
- La validation explicite d’un passage.
- L’absence de partage automatique.

L’interaction marketing permet de sélectionner un passage, d’afficher sa reformulation et de valider localement la proposition. Elle ne déclenche aucune action serveur et ne donne jamais l’impression qu’un document réel est sauvegardé.

### 5. Continuité du suivi

Une séquence anthracite crée un changement de rythme et montre un parcours réellement ordonné :

1. Compte rendu finalisé.
2. Suivi préparé.
3. Rappel confirmé.

Le vert n’apparaît que sur la dernière étape, réellement terminée. Le mouvement souligne la progression horizontale sur desktop. Sur mobile, les étapes sont verticales.

### 6. Retour au terrain

Deux nouvelles photographies documentaires reconnectent l’outil aux situations réelles :

- Geste du praticien pendant ou juste après la séance.
- Échange avec le propriétaire autour de la restitution.

Cette section ne contient aucun faux témoignage. Un court texte explique que Biume est conçu autour du déroulé réel de la pratique, pas autour d’un écran isolé.

### 7. Tarification — Manifeste transparent et extensible

La section validée fusionne la présence visuelle du manifeste tarifaire et la transparence d’un relevé, sans carte blanche ni métaphore littérale de facture.

Structure actuelle :

- Aplat violet sur toute la section.
- Titre « Tout le parcours. Un seul abonnement. »
- Choix annuel ou mensuel.
- Prix principal et détail de facturation.
- CTA d’essai gratuit.
- Relevé clair des fonctionnalités incluses.
- Réassurances sur l’essai sans carte et l’arrêt depuis les paramètres.

L’implémentation est pilotée par une structure de données :

- Une collection d’offres.
- Pour chaque offre : identifiant, nom, prix annuel, prix mensuel, détail de facturation, liste des éléments inclus et CTA.
- Lorsque la collection contient une seule offre, aucun onglet de formule n’apparaît.
- Lorsque la collection contient plusieurs offres, la section affiche un sélecteur de formules au-dessus du même relevé sans modifier son architecture générale.
- Le choix annuel ou mensuel reste distinct du choix d’une formule.

Les valeurs actuelles restent :

- Annuel : 24,99 € par mois, soit 299,88 € facturés une fois par an.
- Mensuel : 29,99 € par mois.
- Essai gratuit de 15 jours sans carte bancaire.

### 8. FAQ et conclusion

La FAQ répond aux objections vérifiables : périmètre du logiciel, contrôle des textes, document reçu par le propriétaire, confidentialité et arrêt de l’abonnement.

À côté ou à la suite de la FAQ, un CTA final bleu invite à préparer le prochain compte rendu. Cette conclusion ne répète pas mot pour mot le héros et conserve les deux chemins de conversion : essai gratuit et démonstration.

### 9. Footer

Le footer anthracite comprend le logo, les liens légaux, les ressources, la connexion et les informations de navigation utiles. Il est redessiné pour appartenir à la landing sans déplacer les contenus légaux existants.

## Médias à produire

Les médias actuels ne sont pas réutilisés comme direction finale. Trois nouvelles images cohérentes doivent être produites :

1. Héros : ostéopathe animalière avec un animal calme, geste précis, environnement réel, lumière naturelle, espace négatif adapté à une composition asymétrique.
2. Terrain : détail du geste professionnel, sans cadrage clinique ni image spectaculaire de soin.
3. Restitution : praticienne et propriétaire échangeant après la séance, présence animale naturelle et non mise en scène comme une publicité grand public.

Les trois images doivent partager le même traitement photographique, des couleurs contenues et une lumière crédible. Les visages, mains et anatomies animales doivent être vérifiés visuellement avant intégration. Aucun texte n’est généré dans les images.

Les démonstrations produit sont construites en React et CSS à partir de structures fidèles au produit, pas générées sous forme de captures raster figées.

## Mouvement et interactions

Le niveau de mouvement est fluide et immersif, sans scroll hijacking.

- Héros : entrée orchestrée du texte, de la photographie et de la fenêtre produit.
- Transformation : changement d’état lié au défilement avec `motion/react`, sans écouteur `scroll` manuel.
- Contrôle : micro-interactions de sélection, édition simulée et validation.
- Suivi : progression séquentielle courte.
- Boutons : déplacement vertical maximal de 2 px au survol et réduction à `0.98` à l’activation.
- Aucun mouvement ne modifie `top`, `left`, `width` ou `height` en continu.
- Toute animation possède une alternative sous `prefers-reduced-motion: reduce`.
- Le contenu reste visible et compréhensible avant le déclenchement de toute animation.

## Responsive

- Largeur maximale de contenu : environ 1440 px.
- Marges mobiles : 16 px ; tablettes : 24 px ; desktop : 32 px ou plus selon la séquence.
- Les compositions asymétriques passent en colonne unique sous 768 px.
- Aucun titre ne dépasse son conteneur entre 320 px et 1440 px.
- Le héros conserve une hauteur pilotée par son contenu avec un `min-height` adapté à chaque breakpoint, jamais `h-screen`.
- Les séquences sticky deviennent statiques sur mobile lorsque le maintien du sticky nuit à la lecture.
- Les cibles interactives mesurent au moins 44 × 44 px.
- Les éléments superposés conservent un ordre de lecture DOM logique.

## Accessibilité

- Structure sémantique avec un seul `h1` et des titres hiérarchisés.
- Lien d’évitement visible au focus.
- Navigation clavier complète du header, des sélecteurs tarifaires, des interactions de démonstration et de la FAQ.
- Focus visible violet avec contraste suffisant.
- Texte courant à au moins 4,5:1 et grand texte à au moins 3:1.
- Photographies avec textes alternatifs utiles et contextualisés.
- Éléments décoratifs masqués aux technologies d’assistance.
- FAQ utilisable sans JavaScript grâce à `details` et `summary` ou à un composant équivalent accessible.
- Réduction des mouvements respectée sans perte de contenu.

## Architecture de composants

La page reste composée depuis `apps/marketing/app/page.tsx`, mais les composants de landing sont remplacés par une architecture neuve et focalisée :

- `landing-shell` : thème, police et cadre global.
- `landing-header` : navigation desktop et mobile.
- `landing-hero` : promesse, CTA, média et preuve produit.
- `transformation-workshop` : séquence sticky et états produit.
- `practitioner-control` : démonstration interactive du contrôle.
- `follow-up-continuity` : timeline après séance.
- `field-stories` : photographie et retour au terrain.
- `pricing-manifest` : offres pilotées par données et choix de facturation.
- `landing-faq` : objections et liens de confiance.
- `landing-close` : CTA final.
- `footer` : navigation de fin de page.

Les composants animés ou interactifs sont des feuilles client isolées. Les sections statiques restent des composants serveur.

Les anciens composants peuvent rester dans le dépôt tant qu’ils sont encore référencés ailleurs. Les fichiers devenus entièrement inutilisés après migration pourront être retirés dans une étape dédiée uniquement si leur absence de référence est confirmée.

## Contenu et SEO

- Conserver les données structurées Service déjà présentes.
- Préserver l’ancrage principal sur les ostéopathes animaliers.
- Utiliser un langage concret et éviter les promesses d’intelligence artificielle génériques.
- Conserver les liens vers l’inscription, la démonstration, le blog, la confidentialité et les CGU.
- Ne pas inventer de bénéfice chiffré.
- Les changements de formulation doivent rester cohérents avec la promesse : « De vos notes au propriétaire, sans perdre votre regard métier. »

## Vérification

### Tests automatisés

- Adapter les tests de structure et de contenu de la landing au nouveau récit.
- Conserver les tests sur les CTA, les prix, les liens, les données structurées et le menu mobile.
- Ajouter un test pour le rendu d’une offre unique sans sélecteur de formules.
- Ajouter un test pour le rendu de plusieurs offres afin de garantir l’extensibilité tarifaire.
- Ajouter des assertions sur les classes ou variantes de réduction des mouvements pour chaque composant animé.
- Exécuter les tests marketing concernés, le lint du package et le build ou contrôle TypeScript le plus ciblé disponible.

### Vérification visuelle

- Inspecter la page aux largeurs 320, 390, 768, 1024, 1280 et 1440 px.
- Vérifier le héros sans débordement et l’ordre de lecture mobile.
- Vérifier la séquence sticky et sa version statique mobile.
- Vérifier le menu clavier, la FAQ, les sélecteurs tarifaires et les CTA.
- Vérifier les contrastes sur les aplats violet, bleu et anthracite.
- Vérifier le rendu sous `prefers-reduced-motion`.
- Inspecter les nouvelles images pour les défauts anatomiques et la cohérence de direction photographique.

## Critères d’acceptation

- La landing entière, du header au footer, utilise la nouvelle direction L’atelier de précision.
- Aucun composant visible de l’ancienne composition n’est conservé par défaut.
- Le produit est visible dès le premier écran.
- La transformation des notes et le contrôle du praticien sont démontrés, pas seulement décrits.
- Les photographies finales sont nouvelles et cohérentes entre elles.
- Le prix annuel et mensuel reste exact.
- La tarification fonctionne avec une seule offre et possède une voie testée pour plusieurs offres.
- Aucun témoignage, chiffre ou logo non validé n’est ajouté.
- La page fonctionne au clavier, respecte les contrastes AA et reste complète avec réduction des mouvements.
- Aucun débordement horizontal n’apparaît sur les largeurs mobiles ciblées.
- Les tests marketing ciblés, le lint et la vérification de build retenue passent réellement avant livraison.
