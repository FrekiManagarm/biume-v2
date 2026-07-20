# Landings SaaS narratives : Laboratoire et After dark

## Objectif

Étendre les routes expérimentales `/laboratoire` et `/after-dark` pour qu’elles présentent toutes les sections attendues d’une landing SaaS, sans sacrifier leur identité immersive.

Les deux pages racontent le même passage : transformer les observations du praticien en un suivi utile au propriétaire. Elles ne sont pas deux thèmes colorés d’un même template : **Laboratoire** est lumineux, matériel et progressif ; **After dark** est nocturne, cinématographique et plus tendu.

## Architecture de page

Les deux routes comprennent les huit temps suivants, dans le même ordre conceptuel mais avec des compositions distinctes :

1. Navigation, promesse et CTA primaire.
2. Confiance : une preuve vérifiable déjà disponible dans le projet, sans mur de logos inventé.
3. Tension : ce qui se perd entre la séance, le compte rendu et le suivi.
4. Méthode : observer, clarifier, transmettre et suivre.
5. Produit en contexte : une preuve visuelle qui explique une action ou un bénéfice réel.
6. Preuves d’usage : cas d’usage, témoignages validés et comparaison avec le fonctionnement actuel.
7. Information de décision : tarifs existants et FAQ.
8. CTA final qui reformule la promesse sans répéter le hero.

`/laboratoire` s’appuie sur des espaces ouverts, des documents et des passages latéraux. `/after-dark` utilise des séquences plus compactes, des aplats nocturnes et des coupures de rythme. Les deux conservent le même fil narratif, mais aucune section ne doit être une copie strictement identique d’une page à l’autre.

## Composants et données

Les sections communes sont structurées dans des composants locaux aux prototypes, avec une variante `light` ou `night` lorsque leur contenu est identique. Les données éditoriales partagées seront isolées dans une configuration locale afin de limiter la duplication ; chaque route garde la main sur l’ordre visuel, le média et le texte de transition.

Les composants prévus couvrent : la bande de confiance, la section de tension, la séquence de méthode, les démonstrations de produit, les cas d’usage, la comparaison, le bloc tarifs, la FAQ et le CTA final. Les composants existants de rail, trajectoire, documents et CTA magnétique seront réemployés seulement là où ils renforcent le récit.

Les preuves ne doivent pas être fabriquées. Aucun logo client, intégration, chiffre, testimonial ou avis ne sera ajouté sans source réelle dans le dépôt. Si une donnée n’existe pas, la section emploie une formulation factuelle issue des pages marketing existantes ou une preuve de produit concrète.

## Mouvement et interactions

Les animations sont une partie assumée de l’expérience pour tous les visiteurs : révélations au défilement, trajectoires reliant les étapes, rail de mouvement et CTAs magnétiques. Aucune exception automatique basée sur `prefers-reduced-motion` ne sera mise en place pour ces pages.

Le mouvement reste concentré sur les transitions importantes. Les sections de preuve, tarifs et FAQ conservent une lecture nette et des cibles tactiles accessibles. Les liens, boutons et ancres restent utilisables au clavier.

## Limites et gestion des cas absents

Ces pages sont statiques et ne nécessitent aucun appel réseau additionnel. Les images doivent avoir un texte alternatif pertinent et un cadrage responsive. Lorsqu’une source de preuve ou un tarif ne peut pas être confirmé à partir du site existant, l’implémentation doit employer du contenu existant ou omettre la sous-preuve concernée plutôt que d’inventer une information.

## Vérification

- `bun --filter @biume/marketing lint`
- `bun --filter @biume/marketing build`
- Contrôle navigateur des deux routes à des formats desktop et mobile.
- Vérification des ancres, CTAs externes et contrastes des deux thèmes.
