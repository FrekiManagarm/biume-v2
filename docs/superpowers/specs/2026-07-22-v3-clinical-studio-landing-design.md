# Landing V3 — Clinical Studio

## Intention

Créer une variante de landing autonome à l’URL `/v3`, destinée aux ostéopathes animaliers indépendants. Elle conserve le périmètre produit actuel : capturer des observations de séance, préparer un compte rendu pour le propriétaire, relire, adapter et valider l’envoi.

Cette variante ne s’appuie ni sur `DESIGN.md` ni sur `PRODUCT.md`. Elle ne modifie pas les routes produit, les parcours d’inscription, ni les promesses fonctionnelles.

## Direction créative

**Clinical Studio** associe une mise en page éditoriale à des fragments d’interface clinique. La palette est volontairement restreinte : papier chaud, encre presque noire, vert acide comme signal d’action et gris technique. La typographie combine un caractère éditorial expressif pour les titres et une sans-serif compacte et nette pour le produit.

L’effet mémorable est la métaphore du scan : la page dévoile et met au point les éléments de travail du praticien. Les transitions sont volontaires et visibles ; aucune variante `prefers-reduced-motion` ne sera ajoutée, conformément à la décision validée.

## Structure de page

1. **Navigation compacte** — marque, ancres de section, connexion, CTA d’inscription.
2. **Hero / manifesto** — promesse orientée métier, CTA principal et aperçu d’une séance à relire. Une ligne lumineuse traverse l’aperçu lors de son entrée.
3. **Parcours horizontal** — trois panneaux : note de terrain, préparation par Biume, validation humaine. Desktop : défilement horizontal guidé ; mobile : pile verticale sans perte de contenu.
4. **Démonstration produit** — écran de travail dense avec signal vocal, texte source et compte rendu propriétaire. Les zones se synchronisent au survol ou à la progression dans la section.
5. **Preuve de contrôle** — manifeste court et modules qui rendent visible la validation par le praticien.
6. **Tarification et conversion** — prix, essai, bénéfices essentiels et CTA final.
7. **Pied de page** — navigation secondaire et liens existants.

## Composants et responsabilités

- `V3Landing` orchestre les sections sans logique serveur.
- `V3Header` expose les liens de navigation et les CTAs vers les routes existantes.
- `ClinicalHero` gère uniquement le contenu d’entrée et l’aperçu UI.
- `CareJourney` présente les trois étapes, avec une structure utilisable au clavier.
- `ProductWorkbench` représente la transformation note → compte rendu avec contenu démonstratif statique.
- `ControlProof`, `PricingPanel` et `V3Footer` restent des sections indépendantes, faciles à réordonner ou à tester.

Les composants réutilisables restent dans `apps/marketing/components/v3/`. Les styles propres à la variante restent dans `apps/marketing/app/v3/v3.css`, sous un préfixe V3 afin de ne pas affecter le reste du site.

## Interaction et animation

- Entrée du hero : révélation masquée de la typographie, puis mise en place différée des panneaux produit.
- Aperçu produit : une ligne de scan et un curseur de lecture créent la sensation d’inspection.
- Parcours : progression pilotée par le scroll, avec cartes qui s’alignent et s’éclairent successivement.
- Modules UI : micro-transitions sur couleur, bordure et ombre au survol, sans déplacement qui ferait bouger la mise en page.
- Les animations ne dépendent pas de JavaScript pour préserver un premier affichage stable ; elles utilisent CSS et des attributs de données lorsque nécessaire.

## Intégration et données

La landing emploie les routes et URLs déjà présentes : inscription, connexion et prise de rendez-vous. Elle ne crée aucune API, aucun nouvel état persistant et aucune donnée utilisateur. Les aperçus de séance restent explicitement démonstratifs.

## Critères de validation

- La route `/v3` compile dans Next.js et garde ses métadonnées `noindex`.
- Le contenu et le périmètre métier sont conservés.
- Aucune importation de `DESIGN.md` ou `PRODUCT.md`, directe ou indirecte, n’est ajoutée.
- Les liens d’inscription et de connexion pointent vers les destinations existantes.
- Les interactions clavier restent disponibles pour les liens et CTAs.
- Aucun emoji n’est utilisé comme icône ; les icônes sont issues de Lucide.
- La page reste lisible à 375 px, 768 px, 1024 px et 1440 px, sans défilement horizontal parasite.

## Vérification prévue

Après implémentation : contrôle TypeScript du package marketing, build ou vérification ciblée Next.js selon les scripts existants, puis inspection locale de `/v3` aux quatre largeurs de référence.
