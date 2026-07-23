# V4 HeroUI Glass Refresh — Design

## Objectif

Faire de la route privée `/v4` une variante A/B nettement plus proche de la
direction visuelle HeroUI : un univers produit sombre, lumineux et stratifié,
sans faire dériver la landing V3 ni importer la feuille de styles globale
HeroUI.

## Direction visuelle validée

La direction retenue est **Product glass** : un fond bleu nuit profond avec des
halos turquoise et bleu diffus, sur lequel l’interface semble flotter. Le
contraste reste suffisant pour un usage professionnel et le vert Biume demeure
l’unique accent d’action.

Les surfaces HeroUI importantes sont des panneaux de verre : fond translucide,
flou d’arrière-plan, bordure claire interne et ombre diffuse teintée. Il ne
s’agit pas de transformer chaque élément en carte ; les surfaces élevées
expriment une hiérarchie ou une interaction.

## Composition

- **Header** : barre transparente et flottante, légèrement floutée, avec
  séparateur et actions compactes.
- **Hero** : composition asymétrique. La promesse est à gauche et la console
  de séance HeroUI, élevée au-dessus d’un halo, est à droite.
- **Console** : conserve les onglets et la prévisualisation de compte rendu.
  Ses zones de contenu, puce d’état et modal adoptent les mêmes couches de
  verre, avec une lecture prioritaire du contenu.
- **Parcours** : grille asymétrique existante conservée mais rendue comme un
  ensemble de surfaces translucides de densités différentes.
- **Prix et FAQ** : panneaux de verre sobres, espacés, avec l’offre comme
  point de contraste clair. L’accordéon conserve les primitives HeroUI et ses
  propriétés d’accessibilité.
- **Conclusion et footer** : fermeture plus immersive, avec contraste sombre
  lisible et CTA distinct.

## Technique et isolation

- Les changements sont limités à la route `/v4`, ses composants et sa feuille
  `v4.css`. V3 ne change pas.
- Les primitives restent importées depuis la racine de `@heroui/react`.
  Aucun import direct de `@heroui/styles`, de `framer-motion`, ni nouvelle
  dépendance ne sont ajoutés.
- Le shell reste un Server Component. La console conserve son îlot client
  minimal pour les onglets et la modale.
- Les styles sont isolés aux classes `v4-*`. Les tokens nécessaires au portail
  de modale restent sur la classe de portail V4 afin de ne pas dépendre de
  l’héritage de `.v4`.
- Les effets de profondeur et les micro-interactions reposent sur CSS
  (`opacity`, `transform`, `backdrop-filter`, transitions) ; aucune animation
  ne doit modifier la mise en page ni ajouter de règle
  `prefers-reduced-motion` dans V4.

## Responsive et accessibilité

- À partir de 768 px, le hero conserve sa lecture gauche/droite et la console
  peut se chevaucher légèrement avec le décor.
- Sous 768 px, les couches deviennent une colonne stricte sans débordement
  horizontal ; la barre de navigation peut s’enrouler de manière lisible.
- Le contraste des textes, focus rings, cibles tactiles de 44 px, structure de
  titres, onglets, accordéon et modal sont conservés.
- Les changements sont couverts par les contrats V4 existants, complétés pour
  vérifier les tokens glass, l’isolation de portée et les surfaces de portail.

## Vérification

1. Tests ciblés V4 et suite marketing complète.
2. Lint et build de `apps/marketing`.
3. QA visuelle à 375, 768, 1024 et 1440 px, dont l’ouverture de la modale.
