# Landing V3 — Visitors-first Blueprint

## Intention

Créer une variante de landing autonome à l’URL `/v3`, destinée aux ostéopathes animaliers indépendants. Elle conserve le périmètre produit actuel : capturer des observations de séance, préparer un compte rendu pour le propriétaire, relire, adapter et valider l’envoi.

Cette variante ne s’appuie ni sur `DESIGN.md` ni sur `PRODUCT.md`. Elle ne modifie pas les routes produit, les parcours d’inscription, ni les promesses fonctionnelles.

## Direction créative

**Visitors-first Blueprint** remplace la direction Clinical Studio. La référence principale est [Visitors](https://visitors.now/) : un canvas blanc, une grille d’ingénierie très plate, une typographie sans-serif géométrique serrée, des bordures structurelles d’un pixel et une lavande réservée aux moments de conversion. La page conserve le produit Biume et son audience ; elle ne reprend ni le contenu analytics ni les éléments de marque de Visitors.

La référence secondaire est [Plausible](https://plausible.io/) pour la retenue d’un SaaS de confiance et une démonstration produit lisible. Le principe de composition reste : message centré, CTAs très nets, puis une grande surface produit qui démontre le travail réel. Aucune variante `prefers-reduced-motion` ne sera ajoutée, conformément à la décision validée.

### Reference lock

- **Préserver :** canvas `#ffffff`, carbone `#181925`, traits `#e8e8e8`, contrôles entièrement pill, espacement généreux, typographie sans-serif compacte, panneau produit flottant dans une bande bleu → lavande.
- **Emprunter seulement :** la navigation-pilule et le passage hero → grand produit de Visitors ; la lisibilité calme de la démo de Plausible.
- **Règles de rôle :** `#918df6` est réservé aux CTAs et à la bande héro ; vert, ambre, rose et bleu servent seulement aux données ou catégories Biume ; pas de lavande dans le texte courant ou les bordures.
- **Média :** interfaces Biume construites comme données et comptes rendus, jamais comme un faux dashboard analytics ; aucune photo lifestyle.
- **Rejeter :** papier chaud, vert acide, titres sérif, panneaux sombres, ombres fortes, et toute transposition de libellés, logos ou données Visitors.

### Decision ledger

| Décision | Source | Règle | Raison |
| --- | --- | --- | --- |
| Fond blanc + traits Fog | Visitors | surfaces plates et bordures 1 px | Crée une précision technique sans alourdir le produit |
| Sans-serif géométrique unique | Visitors | titres serrés, même famille pour l’UI | Rend le parcours Biume plus net et opérationnel |
| CTA lavande | Visitors | conversion uniquement | Rend l’action visible sans recolorer l’interface |
| Bande bleu → lavande | Visitors | atmosphère derrière la démo seulement | Met la preuve produit au centre sans créer un gradient SaaS générique |
| Démo calme et lisible | Plausible | UI comme preuve, pas décoration | Préserve la confiance nécessaire à la pratique |

## Structure de page

1. **Navigation pill flottante** — marque, ancres, connexion et inscription dans un seul contrôle blanc bordé.
2. **Hero centré** — chip de contexte, promesse orientée métier, stack de CTAs et phrase de réassurance.
3. **Bande héro produit** — dégradé bleu → lavande réservé à cette section, contenant une grande démo Biume en surface blanche.
4. **Parcours en trois étapes** — note, préparation, validation présentées comme modules à données, stack vertical mobile et rail horizontal desktop.
5. **Démonstration Biume** — tableau de travail avec signal vocal, texte source et version propriétaire, traité comme la preuve produit centrale.
6. **Contrôle, tarification et conversion** — panneaux blancs fins, métriques ou signaux de statut seulement quand ils portent du sens.
7. **Pied de page minimal** — navigation secondaire et liens existants.

## Composants et responsabilités

- `V3Landing` orchestre les sections sans logique serveur.
- `V3Header` expose les liens de navigation et les CTAs vers les routes existantes.
- `ClinicalHero` gère uniquement le contenu d’entrée et l’aperçu UI.
- `CareJourney` présente les trois étapes, avec une structure utilisable au clavier.
- `ProductWorkbench` représente la transformation note → compte rendu avec contenu démonstratif statique.
- `ControlProof`, `PricingPanel` et `V3Footer` restent des sections indépendantes, faciles à réordonner ou à tester.

Les composants réutilisables restent dans `apps/marketing/components/v3/`. Les styles propres à la variante restent dans `apps/marketing/app/v3/v3.css`, sous un préfixe V3 afin de ne pas affecter le reste du site.

## Interaction et animation

- Entrée du hero : une courte révélation typographique et la montée de la démo.
- Bande produit : gradient atmosphérique derrière une surface Biume blanche ; aucune couleur de gradient dans les boutons ou cartes.
- Parcours : progression horizontale desktop, pile mobile ; accentuation par bordure, couleur et ombre subtile uniquement.
- Modules UI : transitions courtes sur couleur, trait et ombre, sans déplacement de mise en page.
- Les animations restent CSS afin de préserver le rendu serveur et un premier affichage stable.

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
- Le rendu visuel est comparé à la reference lock Visitors-first avant livraison ; toute dérive P1 ou P2 est corrigée.

## Vérification prévue

Après implémentation : contrôle TypeScript du package marketing, build ou vérification ciblée Next.js selon les scripts existants, puis inspection locale de `/v3` aux quatre largeurs de référence.
