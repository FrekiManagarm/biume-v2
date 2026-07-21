# After dark : l’orbite du suivi

## Objectif

Transformer `/after-dark` en landing SaaS nocturne et cinétique : le scroll doit faire ressentir la continuité entre séance, document et suivi, sans ajouter de mouvement décoratif ou de preuves inventées.

## Référence verrouillée

La recherche s’appuie sur les références locales Refero de motion, visual workflow, craft details et anti-AI-slop ; le MCP Refero n’est pas configuré dans cet environnement. La direction primaire est **L’orbite du suivi**.

- Conserver : photo hero réelle comme média dominant, fond nuit vert profond, cuivre `#ef9b70` réservé aux points actifs et CTAs, sans-serif dense, sections asymétriques.
- Emprunter : mouvement qui explique continuité et hiérarchie, trajectoire qui se dessine, documents qui se recomposent, changements de tempo au fil du scroll.
- Rejeter : grille de cartes identiques, gradients décoratifs, wall de logos ou chiffres non vérifiés, retour aux accents violet/bleu/vert et aux pilules du `DESIGN.md`.
- Media : conserver les deux images runtime After dark ; ne pas les remplacer par des abstractions CSS.

## Séquences

1. **Hero d’approche** : la photo hero ralentit et se rapproche légèrement pendant la première sortie de viewport ; le texte reste fixe assez longtemps pour établir la promesse.
2. **Orbital rail** : le rail existant devient l’entrée de la trajectoire cuivre, avec des repères qui progressent en même temps que le scroll.
3. **Méthode en orbite** : les quatre étapes sont révélées par un point de trajectoire et un déplacement latéral court, au lieu d’apparaître comme une liste statique.
4. **Document stack** : les documents restent en scène sur desktop ; leur position et leur profondeur changent avec le passage de l’étape produit aux cas d’usage.
5. **Cas d’usage relayés** : les lignes de cas se croisent dans une séquence verticale ; une seule étape est au premier plan à la fois.
6. **Information calme** : comparaison, tarifs et FAQ gardent une animation réduite à des apparitions courtes pour rendre la décision lisible.
7. **Sortie magnétique** : le CTA final conserve le champ magnétique et gagne un rappel de la trajectoire, sans nouvelle couleur ni particules.

## Architecture

Les nouveaux comportements vivent dans des composants client isolés sous `apps/marketing/components/prototypes`, alimentés par des enfants/valeurs statiques depuis les composants serveur existants. Chaque feuille interactive utilise `motion/react`, déjà présent dans le package marketing ; aucun nouvel outil d’animation n’est ajouté.

Les animations sont pilotées par `useScroll`, `useTransform`, `useSpring`, `whileInView` et `layout` dans des arbres client cohérents. Elles n’animent que `transform`, `opacity`, les chemins SVG et les propriétés Motion compatibles. Aucun écouteur de scroll manuel, animation de dimension, curseur personnalisé ou boucle qui déclenche des rerenders parent n’est autorisé.

Le choix explicite du prototype reste un mouvement complet pour tous les visiteurs : aucune branche `prefers-reduced-motion` n’est introduite.

## Données et limites

Les textes, prix, essai, FAQ et CTAs restent issus du contrat SaaS existant. Les mouvements n’ajoutent pas de nouveaux chiffres, intégrations, témoignages ou promesses. Les ancres actuelles restent stables : `#preuve`, `#methode`, `#produit`, `#cas`, `#comparatif`, `#tarifs`, `#faq`.

Le desktop peut employer une composition asymétrique, sticky et superposée. Sous `md`, chaque séquence revient à une colonne avec des amplitudes plus courtes, sans overflow horizontal ni texte masqué.

## Vérification

- Tests Bun pour les ancres, l’export After dark seul et l’absence de branche de réduction de mouvement.
- Lint et build marketing, avec `/after-dark` présent et `/laboratoire` absent.
- QA navigateur à `1280×720` et `390×844` : hero, trajectoire, documents, cas, tarifs, FAQ, CTAs, overflow et lisibilité.
- Comparaison visuelle avec le verrou : média dominant, cuivre réservé à l’action/trajectoire, sections asymétriques et absence de dérive vers une grille SaaS générique.
