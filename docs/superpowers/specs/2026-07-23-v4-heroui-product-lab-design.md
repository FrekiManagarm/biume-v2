# Landing V4 — HeroUI Product Lab

## Intention

Créer une variante A/B autonome à l’URL `/v4`. Elle teste une landing plus
opérationnelle et interactive que V3 : une praticienne doit pouvoir reconnaître
dans les premières secondes un espace qui l’aide à passer de sa note de séance à
un compte rendu relu et validé.

La V4 ne modifie ni `/v3`, ni les autres landings, ni les routes produit. Le
périmètre métier reste identique : notes de séance, préparation du compte rendu,
relecture, validation et partage à la décision de la praticienne.

## Hypothèse A/B

V3 teste une présentation éditoriale Visitors-first, centrée sur une démonstration
statique. V4 testera une proposition distincte : **un produit tangible et guidé**.
Elle emploiera HeroUI v3 pour ses primitives interactives, afin de rendre visibles
les choix et étapes du travail sans simuler un produit connecté.

Le succès visuel attendu est une différence immédiatement lisible avec V3 : hero
asymétrique, console de séance à droite et composants d’interface actifs mais
retenus.

## Direction créative

**HeroUI Product Lab** est une direction claire et minérale, et non une variation
de Visitors : fond zinc clair, surfaces blanches, texte charbon et un accent vert
Biume réservé aux actions, états sélectionnés et signaux de progression. La
lavande et la bande bleu → lavande de V3 ne sont pas réutilisées.

- **Composition :** desktop en split-screen, texte et CTA à gauche ; console de
  séance interactive à droite. La mise en page redevient une colonne stricte sous
  768 px.
- **Typographie :** sans-serif unique, compacte et technique ; aucun titre sérif
  ni texte en dégradé.
- **Surfaces :** grands rayons HeroUI, bordures fines et ombres de diffusion très
  légères, uniquement pour hiérarchiser la console et les blocs de conversion.
- **Densité :** claire et quotidienne ; les données sont regroupées par traits et
  espaces avant d’employer des cartes.
- **Mouvement :** retours tactiles au clic, transitions de tab et marqueur de
  préparation discret. Les animations se limitent à `transform` et `opacity`,
  sans écouteurs de scroll. Aucun override `prefers-reduced-motion` n’est ajouté,
  conformément à la décision déjà validée pour ces variantes.

## Structure de page

1. **Navigation compacte** — marque, ancres, connexion et inscription ; elle
   reprend les destinations existantes.
2. **Hero produit asymétrique** — promesse, réassurance et deux CTA à gauche ;
   apercu HeroUI de la séance à droite.
3. **Console de séance** — onglets `Note`, `Préparation` et `Validation` ; chaque
   état montre une étape du même parcours, jamais une donnée clinique nouvelle.
4. **Preuves de contrôle** — grille asymétrique de deux grands blocs et un bloc
   secondaire : source de la note, version propriétaire, décision d’envoi.
5. **Tarif et objections** — offre existante, puis réponses existantes dans un
   accordéon HeroUI.
6. **Conversion finale et footer** — même promesse métier, liens réels et
   destinations préservées.

## Composants et responsabilités

### Rendu serveur

- `app/v4/page.tsx` porte les métadonnées `noindex` et rend `V4Landing`.
- `V4Landing`, `V4Header`, `V4Hero`, `V4ProofGrid`, `V4Pricing`, `V4Faq` et
  `V4Footer` sont statiques et gardent les libellés ainsi que les URL réelles.
- Les styles de la variante sont préfixés V4 pour éviter toute fuite vers les
  autres routes marketing.

### Île client unique

- `V4SessionConsole` est un composant `'use client'` isolé.
- Il utilise les `Tabs` HeroUI pour sélectionner une des trois étapes et un
  `Modal` HeroUI pour ouvrir l’aperçu non éditable du compte rendu propriétaire.
- L’état est local, commence sur `Note` et ne persiste rien. La fermeture du
  modal restaure le focus au contrôle déclencheur.
- Les trois contenus de tab sont écrits côté serveur dans le bundle ; aucune
  requête, donnée utilisateur, chargement réseau ou faux état d’erreur n’est
  introduit.

## Intégration HeroUI

La V4 utilisera HeroUI v3, pas la génération v2. Elle requiert uniquement
`@heroui/react` pour le comportement accessible de ses primitives ;
`@heroui/styles` n’est ni déclaré comme dépendance directe ni importé. Toute l’apparence est définie dans
la feuille de styles locale de route V4 `app/v4/v4.css`, avec des sélecteurs
préfixés `.v4`, y compris les overrides locaux des classes BEM générées par
HeroUI. Cette isolation évite toute fuite vers les routes marketing existantes
ou V3. HeroUI v3 ne nécessite pas de provider global ni Framer Motion.

Les primitives sont limitées à : `Button`, `Chip`, `Tabs`, `Modal`, `Card` et
`Accordion`. Elles sont personnalisées avec les tokens V4 : l’objectif est de
tester une interface HeroUI crédible, non son thème de démonstration.

## Accessibilité et interactions

- Tous les CTA conservent un nom accessible, une cible réelle et une zone tactile
  d’au moins 44 px.
- Les tabs et le modal suivent les comportements clavier et focus de HeroUI.
- Les éléments de démonstration non actionnables sont clairement annoncés comme
  aperçus ; aucune action d’envoi ou validation n’est simulée.
- Aucun emoji ne sert d’icône. Les icônes ajoutées proviennent de la dépendance
  autorisée par le projet ou de primitives SVG sobres.

## Contrats de conversion et contenu

- Les liens d’inscription, de connexion et de démo réemploient les helpers et
  destinations de V3.
- Les attributs `data-conversion` existent au minimum sur le CTA hero et le CTA
  tarif, afin de garder les comparaisons possibles.
- Le prix, la facturation annuelle, les inclusions et les promesses métier
  approuvées restent inchangés.
- La V4 n’ajoute aucune promesse de diagnostic, de guérison, de résultat clinique
  ou d’automatisation sans validation humaine.

## Critères de validation

- `/v4` compile, reste privée des moteurs et ne modifie pas `/v3`.
- Seul `@heroui/react` est déclaré comme dépendance directe de
  `@biume/marketing` ; aucun style HeroUI global n’est chargé et les overrides
  V4 restent préfixés `.v4`.
- Le changement d’onglet et l’ouverture/fermeture du modal sont testés au
  clavier ; les liens de conversion sont testés en rendu serveur.
- La variante reste sans défilement horizontal à 375 px, 768 px, 1024 px et
  1440 px.
- L’inspection visuelle confirme une direction split-screen minérale, distincte
  de Visitors et de V3.
- La vérification ciblée comprend tests marketing, lint et build du package
  marketing.

## Hors périmètre

- Aucune modification des routes produit, de l’authentification, des API, de la
  base de données ou du contenu public existant.
- Aucun remplacement de la V3, de sa feuille de styles ou de ses tests.
- Aucune bibliothèque de mouvement supplémentaire et aucune animation de scroll.
