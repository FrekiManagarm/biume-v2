# Refonte ciblée de la landing Biume — Dossier vivant

- Date : 13 juillet 2026
- Statut : design approuvé, en attente de revue de la spécification
- Périmètre : `apps/marketing`

## 1. Décision

La landing conserve son ambiance éditoriale « carnet vivant », mais remplace les trois compositions signalées comme faibles par une narration plus graphique et plus courte :

1. un hero « dossier vivant » qui relie visuellement la note, le compte rendu et le suivi ;
2. une transformation sombre et compacte qui montre la note source, l'organisation par Biume et la proposition propriétaire ;
3. la suppression de la preuve produit séparée, dont le faux éditeur, le PDF et la relance rendaient le message redondant et difficile à comprendre.

Le fil principal devient :

> Les notes du praticien deviennent un compte rendu compréhensible, toujours relu et partagé par le praticien.

Cette spécification amende `2026-07-12-marketing-landing-carnet-vivant-design.md` uniquement pour le hero, la transformation immersive, la preuve produit et leurs animations. Les sections prix, FAQ, CTA final, header et footer conservent leur comportement actuel sauf ajustement d'ancre rendu nécessaire par la suppression d'une section.

## 2. Problèmes corrigés

### Hero actuel

- La surface produit ressemble à une carte indépendante posée sur la photographie.
- La relation entre la note du praticien, le compte rendu et la suite du parcours n'est pas visible.
- Le violet et le vert du logo sont trop discrets.

### Transformation actuelle

- La liste `Noter / Structurer / Adapter le langage / Finaliser` ressemble à une documentation.
- Le même contenu est répété dans les étapes et dans le document sticky.
- La hauteur de la séquence produit une lecture longue pour une idée simple.

### Preuve produit actuelle

- Le faux éditeur, le PDF et la relance mélangent plusieurs bénéfices.
- La section ne répond pas clairement à une question distincte de la transformation précédente.
- La composition utilise des cartes produit génériques et trop de texte.

## 3. Direction visuelle

### 3.1 Concept

La direction retenue est **Dossier vivant** : une note courte traverse une structure graphique et devient un document clair. Le langage reste éditorial, asymétrique et professionnel. Les surfaces représentent des objets utiles — note et document — plutôt que des cartes décoratives.

La page conserve :

- le canvas clair `#f7f7f4` ;
- l'anthracite `#202024` pour l'unique respiration sombre ;
- la photographie cheval existante ;
- Geist pour le produit et Newsreader pour les contrastes éditoriaux ;
- le grain et les lignes de construction déjà présents, à faible opacité.

### 3.2 Couleurs Biume

Les couleurs visibles dans le logo deviennent le fil du parcours :

| Couleur | Valeur | Rôle |
| --- | --- | --- |
| Violet du logo | `#8e82e8` | note source, entrée du parcours, repère actif |
| Bleu du logo | `#62a8c8` | transition et structuration |
| Vert du logo | `#28c978` | document prêt à relire et aboutissement |

Le dégradé violet → bleu → vert est limité aux petits éléments de liaison : ligne de progression, marque Biume et rail graphique. Il n'est pas utilisé comme fond de section, grand titre, halo ou ombre.

Lorsque du texte blanc doit être posé sur un CTA violet, une variante plus sombre et contrastée peut être utilisée. Les trois teintes exactes du logo restent néanmoins visibles dans les éléments graphiques des deux sections refondues.

## 4. Hero — comprendre le parcours

### 4.1 Contenu

- Catégorie : `Le lien après la séance`
- Titre : `Vos observations restent précises. Le propriétaire, lui, comprend.`
- Texte : `Biume part de vos mots, structure un compte rendu clair, puis vous aide à garder le fil après la séance. Vous relisez et décidez de chaque envoi.`
- CTA primaire : `Essayer gratuitement`
- CTA secondaire : `Voir le parcours`
- Réassurance : `15 jours d'essai`, `Sans carte bancaire`, `Rien ne part sans vous`

### 4.2 Composition desktop

Le hero reste asymétrique : contenu à gauche, composition photographique et produit à droite.

La partie droite contient :

1. la photographie de la praticienne et du cheval, recadrée dans une forme organique asymétrique ;
2. une note technique anthracite placée sur le bord supérieur gauche de la photographie ;
3. un document propriétaire clair placé au premier plan en bas à droite ;
4. un rail vertical fin reprenant le dégradé du logo ;
5. un mini-repère `Séance / PDF / Suivi` qui exprime la continuité sans ajouter de paragraphe.

La note et le document illustrent une transformation. Ils ne doivent pas laisser croire que Biume conserve deux versions concurrentes dans le même champ produit.

Le libellé vertical testé dans la maquette est explicitement exclu : il entrait en collision avec la carte et répétait le mini-repère.

### 4.3 Mobile

- Le contenu devient une colonne unique sous 768 px.
- La photographie reste visible, puis la note et le document se superposent dans un cadre à hauteur contrôlée.
- Aucun élément ne sort du viewport à 390 px.
- Le mini-repère peut passer sous le document ou être masqué si sa largeur ne permet pas une lecture correcte.

## 5. Transformation sombre — voir ce que Biume fait

### 5.1 Contenu

- Catégorie : `De vos notes au propriétaire`
- Titre : `Le même fond. Une forme enfin lisible.`
- Introduction : `Vous notez librement. Biume organise. Vous relisez.`

Le visuel utilise un seul exemple :

- note source : `Mobilité réduite à gauche · thorax. Amélioration pendant la séance.` ;
- repères structurés : `Thorax`, `Gauche`, `Évolution` ;
- proposition propriétaire : `Une tension plus présente a été observée du côté gauche, au niveau du thorax. La mobilité s'est améliorée au cours de la séance.`

La section se termine par trois verbes, sans descriptions supplémentaires :

1. `Vous notez`
2. `Biume organise`
3. `Vous décidez`

### 5.2 Composition desktop

La section est une composition horizontale sur fond anthracite :

- carte note compacte à gauche, marquée en violet ;
- connecteur Biume au centre avec la ligne violet → bleu → vert et les trois repères structurés ;
- document propriétaire clair à droite, marqué en vert et accompagné du statut `Prêt à relire`.

Les cartes utilisent leur hauteur naturelle. Aucune `min-height` ne doit être appliquée aux cartes note ou document. Après le dernier contenu, l'espace intérieur ne doit pas dépasser le padding vertical normal du composant.

La section n'est plus une longue séquence sticky. Elle doit être compréhensible dans un seul viewport desktop et ne doit pas répéter l'exemple dans une liste parallèle.

### 5.3 Mobile

- Les trois éléments s'empilent : note, connecteur vertical, document.
- La ligne de progression devient verticale.
- Les repères structurés passent à la ligne sans créer de défilement horizontal.
- Les cartes restent ajustées à leur contenu.

## 6. Suppression de la preuve produit séparée

`ProductProof` n'est plus rendu dans `apps/marketing/app/page.tsx`.

Les éléments suivants disparaissent de la page d'accueil :

- le faux éditeur à quatre rubriques ;
- les cartes `PDF professionnel` et `Relance de rendez-vous` ;
- le titre `Pas une promesse abstraite. Les outils réellement disponibles.`

Cette suppression ne retire aucune fonctionnalité du produit. Elle retire une explication redondante de la landing. Les pages SEO dédiées peuvent continuer à expliquer l'export PDF et les relances avec leur contenu actuel.

L'ancre `#comment-ca-marche` doit pointer vers la transformation sombre ou être remplacée par une ancre équivalente afin qu'aucun lien de navigation ne devienne mort.

## 7. Animation

### 7.1 Intensité

L'intensité est 6 sur 10 : un mouvement orchestré par section, sans animation décorative permanente.

### 7.2 Hero

- Le texte entre en cascade courte.
- La photographie est visible dès la première frame et passe légèrement de `scale(1.02)` à `scale(1)`.
- La note et le document arrivent ensuite avec un décalage court et une sensation de ressort amorti.
- Les boutons montent de 2 px au survol et passent à `scale(0.98)` à l'activation.

### 7.3 Transformation

À la première entrée de la section dans le viewport :

1. la note apparaît par translation verticale courte et fondu ;
2. la ligne violet → bleu → vert se dessine par `scaleX` ;
3. les trois repères structurés apparaissent en cascade ;
4. le document final glisse en place et le statut vert devient visible.

La séquence est courte et ne se rejoue pas en boucle. Seuls `transform` et `opacity` sont animés. Aucun changement de largeur, hauteur, `top` ou `left` n'est animé.

### 7.4 Réduction du mouvement

Avec `prefers-reduced-motion: reduce`, tous les contenus sont visibles immédiatement dans leur état final. Aucun sens ou statut ne dépend du mouvement.

## 8. Architecture d'implémentation

### `LandingHero`

- Reste un composant rendu côté serveur.
- Conserve la source de contenu `adaptedProposal` fournie par `REPORT_TRANSFORMATION_DEMO`.
- Utilise des animations CSS pour éviter de convertir tout le hero en composant client.

### `ReportTransformationStory`

- Garde sa frontière client actuelle uniquement pour déclencher la séquence à l'entrée dans le viewport.
- Est simplifié en trois unités internes : note, connecteur, document.
- Réutilise `REPORT_TRANSFORMATION_DEMO` comme source unique de l'observation et de la proposition adaptée.
- N'utilise pas de mise à jour React continue pendant l'animation.

### `ProductProof`

- N'est plus importé ni rendu par la page d'accueil.
- Son fichier peut rester temporairement dans le dépôt s'il est utile à d'autres tests ou travaux ; aucune suppression n'est requise pour livrer la refonte.

### Données et états

Les deux sections utilisent uniquement des données statiques rendues avec la page. Elles n'introduisent ni requête réseau, ni formulaire, ni état asynchrone. Aucun nouvel état de chargement, vide ou erreur n'est donc requis.

## 9. Accessibilité et performance

- Les textes fonctionnels restent du vrai texte HTML.
- Les éléments purement décoratifs sont `aria-hidden`.
- La photographie conserve un texte alternatif centré sur la praticienne et le cheval.
- Le contraste des libellés violet et vert est vérifié sur leurs surfaces respectives.
- Les animations ne provoquent aucun décalage de mise en page.
- Le grain reste un calque fixe sans événements pointeur.
- Aucun nouveau package n'est ajouté ; `motion` est déjà disponible mais n'est pas nécessaire au hero.

## 10. Vérification et critères d'acceptation

### Tests automatisés

- Mettre à jour les tests du hero avec le nouveau contenu.
- Mettre à jour les tests de transformation avec les trois états `Vous notez`, `Biume organise`, `Vous décidez`.
- Mettre à jour les tests de page pour confirmer que `ProductProof` n'est plus rendu.
- Vérifier que les liens vers `#comment-ca-marche` ciblent une ancre existante.
- Exécuter les tests ciblés de `apps/marketing`, puis le contrôle TypeScript ou le build marketing adapté aux changements.

### Vérification visuelle

- Desktop à 1440 × 1000 et mobile à 390 × 844.
- Aucun défilement horizontal.
- Aucun espace intérieur artificiel sous le texte des cartes.
- La transformation entière est lisible dans un viewport desktop courant.
- Le violet `#8e82e8` et le vert `#28c978` sont visibles dans le hero et la transformation.
- Le hero ne masque ni le visage, ni les mains, ni la zone de travail de la praticienne.
- La page reste complète et compréhensible sans animation.

## 11. Hors périmètre

- Refonte du prix, de la FAQ, du CTA final, du footer ou des pages SEO.
- Ajout d'une nouvelle fonctionnalité produit.
- Ajout d'une timeline propriétaire, d'un questionnaire automatique ou d'un retour client non présent dans le produit.
- Nouveau package d'animation ou d'icônes.
- Refonte globale du design system.
