# Refonte de la landing Biume

Date : 2026-07-11

Statut : conception validée, prête pour le plan d'implémentation après revue du document.

## Objectif

Refondre la page d'accueil de `apps/marketing` pour améliorer la qualité perçue et la conversion, tout en conservant l'identité violet et vert de Biume.

La nouvelle landing doit présenter Biume comme un outil de suivi post-séance centré sur la relation entre le praticien, l'animal et le propriétaire. Elle ne doit pas être perçue comme une landing générique de produit IA.

L'action principale reste le démarrage de l'essai gratuit. La réservation d'une démonstration reste une action secondaire.

## Design read

Landing SaaS verticale pour des ostéopathes animaliers indépendants et de petites structures, avec un langage éditorial contemporain, chaleureux et très produit.

- `DESIGN_VARIANCE` : 7 sur 10
- `MOTION_INTENSITY` : 5 sur 10
- `VISUAL_DENSITY` : 4 sur 10
- Mode : redesign complet de la page d'accueil, avec préservation de la marque, des routes, du SEO et des destinations de conversion.
- Fondation : Next.js, React et Tailwind CSS v4 déjà présents dans `apps/marketing`.
- Direction retenue : « L'atelier du suivi ».

## Constats de l'audit

La landing actuelle utilise plusieurs codes visuels qui affaiblissent le positionnement humain de Biume :

- promesse centrée sur l'IA et les diagnostics ;
- titre en dégradé violet et vert ;
- grilles techniques, scan lumineux et animations perpétuelles ;
- squelettes animaliers comme élément principal du hero ;
- badges, micro-labels mono et cartes flottantes en grand nombre ;
- répétition de grandes cartes contenant d'autres cartes ;
- preuve `4.9/5` non documentée ;
- hiérarchie mobile longue avant l'apparition du visuel.

La refonte retire ces éléments ou leur attribue un rôle strictement fonctionnel.

## Recherche et références

Les références ont été étudiées en desktop et en mobile.

- Beside : référence principale pour le hero asymétrique, la copie directe et le récit par flux métier.
- Billow : référence pour la force d'une idée visuelle unique et la progression narrative.
- Framer : référence pour la hiérarchie nette et la démonstration du produit sans décor superflu.
- Linear et Resend : références pour la retenue, la profondeur maîtrisée et la crédibilité des surfaces produit.
- xAI : référence de radicalité typographique, sans reprendre son ton froid ou son positionnement IA.

Les enseignements retenus sont :

- une seule signature visuelle forte par écran ;
- une promesse compréhensible avant le détail fonctionnel ;
- une expérience mobile pensée dès le départ ;
- des textes courts et concrets ;
- des animations qui expliquent une hiérarchie ou une progression ;
- des visuels crédibles et contextualisés.

## Positionnement et message

### Promesse principale

Le suivi post-séance des ostéopathes animaliers.

### Hero

Titre :

> Chaque séance mérite une suite.

Sous-titre :

> Biume transforme vos observations en un suivi clair que les propriétaires comprennent, gardent et utilisent.

CTA principal :

> Essayer gratuitement

CTA secondaire :

> Voir le parcours

Le CTA principal utilise la même formulation dans le header, le hero, la section prix et le CTA final.

## Architecture de page

### 1. Header

Header compact, non flottant sur desktop, avec une hauteur maximale de 72 pixels.

Navigation conservée :

- Produit
- Compte rendu
- Blog
- Tarifs
- Connexion
- Essayer gratuitement

En mobile, le logo et le CTA restent visibles. Les liens secondaires passent dans un menu accessible.

### 2. Hero

Composition asymétrique :

- colonne gauche pour la catégorie, la promesse, le sous-titre et les CTA ;
- colonne droite pour une photographie documentaire verticale ;
- un petit élément de suivi réel ou illustratif, « Retour reçu à J+7 », superposé au visuel sans imiter un faux dashboard.

Le hero tient dans le premier viewport desktop. En mobile, le CTA principal reste visible avant le visuel.

### 3. Réassurance factuelle

Une bande simple sous le hero présente uniquement des faits vérifiables :

- 15 jours d'essai ;
- sans carte bancaire ;
- contenus validés par le praticien.

Aucune note, aucun logo client et aucun chiffre de performance ne sont inventés.

### 4. Problème

Titre :

> La séance ne s'arrête pas au rendez-vous.

Cette section explique que le propriétaire doit encore comprendre les observations, savoir quoi surveiller et reconnaître le bon moment pour reprendre contact.

La composition utilise une grande phrase de contexte et une photographie de geste manuel. Elle ne reprend pas la mise en page du hero.

### 5. Parcours

Titre :

> Un fil clair, du rendez-vous au prochain échange.

Quatre étapes sans numérotation décorative :

- Observer : le praticien note l'essentiel pendant ou après la séance.
- Valider : Biume structure, puis le praticien relit avant l'envoi.
- Suivre : le propriétaire répond simplement à J+7.
- Revoir : l'évolution reste lisible dans le temps.

Desktop : parcours horizontal lisible en une fois.

Mobile : défilement horizontal `scroll-snap`, avec la carte suivante partiellement visible pour suggérer la continuité.

### 6. Résultat produit

Titre :

> Le propriétaire comprend. Vous gardez le fil.

La section montre les sorties du produit :

- résumé propriétaire ;
- points observés et conseils transmis ;
- retour J+7 ;
- timeline de l'animal ;
- prochaine étape.

Le visuel représente un résultat lisible plutôt qu'un faux dashboard complexe. Si une capture réelle du produit peut être obtenue pendant l'implémentation, elle devient prioritaire.

### 7. Contrôle du praticien

Titre :

> Biume prépare. Vous décidez.

Texte :

> Vous relisez, corrigez et validez chaque message avant l'envoi. Biume n'établit aucun diagnostic et ne parle jamais à votre place.

Cette section répond directement à l'objection sur l'automatisation et l'IA. Elle utilise un fond violet très pâle dans le thème clair et son équivalent sombre dans le thème foncé.

### 8. Prix

Titre :

> Un abonnement simple. Une seule offre.

Offre actuelle conservée :

- 29,99 € par mois en facturation mensuelle ;
- 24,99 € par mois en facturation annuelle ;
- essai de 15 jours sans carte bancaire.

La section ne contient pas de carte imbriquée. Le prix, le sélecteur et les éléments inclus partagent une seule surface.

Les fonctionnalités sont regroupées pour éviter une longue liste :

- suivi propriétaire : résumés, timeline, J+7 et J+30 ;
- pratique quotidienne : patients, clients, documents et support pendant l'essai.

### 9. FAQ

Questions prévues :

- Est-ce que Biume remplace mon logiciel de gestion ?
- Est-ce que l'IA écrit à ma place ?
- Puis-je modifier un résumé avant de l'envoyer ?
- Comment mes données sont-elles protégées ?
- Puis-je résilier à tout moment ?

La FAQ utilise des éléments natifs `details` et `summary` enrichis visuellement, sans dépendance JavaScript.

### 10. CTA final

Titre :

> Donnez une suite claire à chaque séance.

Texte :

> Essayez Biume pendant 15 jours, sans carte bancaire.

CTA :

> Essayer gratuitement

Une photographie documentaire différente du hero ferme la page.

### 11. Footer

Le footer conserve les liens produit, SEO et légaux actuels. Sa hiérarchie est simplifiée pour améliorer la lecture sans retirer de route.

## Système visuel

### Typographie

- Manrope pour les titres et le corps.
- Geist Mono conservé uniquement pour les valeurs tarifaires ou métadonnées fonctionnelles.
- Les titres utilisent la graisse, la taille et l'espacement pour créer le contraste.
- Aucun mélange sans justification entre serif et sans serif.
- Aucun texte en dégradé.

### Palette

Thème clair principal :

- papier froid : `#F5F5F3` ;
- encre : `#18171A` ;
- violet d'action : `#6B5AC8` ;
- vert de validation : `#198754`.

Le violet sert aux CTA, aux liens actifs et aux moments clés. Le vert confirme un contenu validé, envoyé ou reçu. Le vert n'est pas utilisé comme second CTA concurrent.

Le logo conserve son dégradé violet, bleu et vert existant.

Le thème sombre est dérivé des mêmes rôles sémantiques et respecte la préférence système. Aucun changement de thème n'a lieu au milieu de la page.

### Formes

- boutons : rayon complet ;
- cartes : rayon de 16 pixels ;
- champs et contrôles : rayon de 10 pixels ;
- grands médias : rayon de 20 pixels.

Les ombres sont rares, légèrement teintées de violet et réservées aux éléments qui ont une vraie élévation.

### Photographie

Trois images originales sont nécessaires :

1. Hero : geste d'une praticienne sur un cheval, lumière naturelle, environnement français crédible.
2. Section centrale : travail manuel avec un chien, cadrage proche sur les mains et l'animal.
3. CTA final : moment calme entre praticien, propriétaire et animal.

Les images doivent paraître documentaires :

- pas d'animal posé face caméra ;
- pas d'ordinateur placé artificiellement près de l'animal ;
- pas de blouse vétérinaire si le geste décrit l'ostéopathie animale ;
- pas de codes visuels futuristes ;
- pas de texte ou d'interface généré dans l'image ;
- anatomie humaine et animale plausible.

Ces images ne sont jamais présentées comme des témoignages ou des clients réels.

## Motion

Le mouvement a une intensité de 5 sur 10.

Animations prévues :

- entrée du titre, du sous-titre et des CTA au chargement ;
- révélation par masque de la photographie du hero ;
- apparition progressive des quatre étapes du parcours ;
- transition courte des statuts « validé », « envoyé » et « retour reçu » ;
- feedback tactile des boutons au clic.

Contraintes :

- CSS natif en priorité ;
- uniquement `transform`, `opacity` et `clip-path` quand il est accéléré correctement ;
- aucune boucle de scroll personnalisée ;
- aucune écoute directe de `window.scroll` ;
- aucune animation infinie ;
- aucune parallax ;
- aucune grille, scan-line ou halo animé ;
- désactivation avec `prefers-reduced-motion`.

GSAP et Motion ne sont pas nécessaires pour ce périmètre.

## Composants et responsabilités

La page d'accueil reste assemblée dans `apps/marketing/app/page.tsx`, avec des composants spécifiques proches de l'application marketing.

Composants prévus :

- `Header` : navigation desktop et menu mobile ;
- `LandingHero` : promesse, CTA et visuel prioritaire ;
- `ProofStrip` : faits vérifiables ;
- `ProblemSection` : tension métier et photographie ;
- `FollowUpJourney` : parcours en quatre étapes ;
- `ProductOutcome` : résultat visible pour le propriétaire ;
- `PractitionerControl` : validation et limites du produit ;
- `PricingSection` : sélecteur annuel ou mensuel et CTA ;
- `LandingFaq` : accordéon natif ;
- `FinalCta` : dernière invitation ;
- `LandingFooter` : navigation secondaire et mentions légales.

Les composants statiques restent des Server Components. `PricingSection` est le seul composant client nécessaire, sauf si le menu mobile existant impose une petite île interactive distincte.

## Flux et interactions

- Le CTA principal utilise `webAppPath("/signup")` et garde `prefetch={false}`.
- Le lien de démonstration conserve l'URL Cal.com existante et s'ouvre dans un nouvel onglet avec les attributs de sécurité actuels.
- Le sélecteur tarifaire gère uniquement un état local `annual | monthly`.
- Aucune requête réseau n'est nécessaire pour rendre la landing.
- La FAQ ne dépend pas de données distantes.
- Les images réservent leur espace pour éviter les changements de mise en page.

## États et erreurs

La page est principalement statique et n'a pas d'état de chargement applicatif.

- En cas de réduction de mouvement, tous les contenus sont visibles immédiatement.
- En cas d'échec d'une image, le conteneur conserve sa taille et son fond neutre.
- Si JavaScript est désactivé, le contenu, les CTA, la FAQ et le tarif annuel par défaut restent utilisables.
- Les liens externes ont un libellé compréhensible sans dépendre d'une icône.
- Le menu mobile expose son état ouvert ou fermé avec `aria-expanded`.

## Responsive

### Desktop, 1024 pixels et plus

- largeur maximale de contenu : 1280 pixels ;
- hero en deux colonnes asymétriques ;
- navigation sur une seule ligne ;
- parcours visible en quatre colonnes ;
- prix et fonctionnalités présentés sur une surface horizontale.

### Tablette, 768 à 1023 pixels

- hero en deux colonnes plus équilibrées ou empilé si le titre manque d'espace ;
- navigation secondaire réduite ;
- parcours en deux colonnes ;
- images avec ratios réservés.

### Mobile, moins de 768 pixels

- structure en une colonne ;
- marges horizontales de 16 pixels ;
- CTA principal pleine largeur ;
- CTA visible avant l'image du hero ;
- parcours en scroll horizontal avec `scroll-snap` ;
- prix et sélecteur sans défilement horizontal ;
- footer regroupé en accordéons ou colonnes empilées selon la longueur finale.

## Accessibilité

- contraste WCAG AA pour les textes et CTA ;
- cible AAA pour le texte principal ;
- focus visible sur tous les éléments interactifs ;
- taille tactile minimale de 44 pixels ;
- ordre DOM identique à l'ordre visuel ;
- textes alternatifs fonctionnels et non décoratifs ;
- navigation clavier du menu, du prix et de la FAQ ;
- respect de la préférence de mouvement réduit ;
- aucun contenu critique transmis uniquement par la couleur.

## Performance

Objectifs :

- LCP inférieur à 2,5 secondes ;
- INP inférieur à 200 millisecondes ;
- CLS inférieur à 0,1.

Mesures prévues :

- image du hero optimisée avec `next/image` et priorité ;
- images secondaires chargées à la demande ;
- formats WebP ou AVIF produits par Next.js ;
- tailles explicites ou `fill` avec ratio réservé ;
- animations CSS sans bibliothèque supplémentaire ;
- aucun filtre de bruit sur les conteneurs qui défilent ;
- DOM contenu et absence de wrappers décoratifs inutiles.

## SEO et compatibilité

- conserver le titre, la description, le canonical et le JSON-LD existants, sauf ajustement rédactionnel cohérent avec le nouveau hero ;
- conserver les routes et les destinations de navigation ;
- ne pas modifier `apps/web` ;
- ne pas modifier les pages SEO secondaires dans cette refonte ;
- préserver les termes « logiciel de compte rendu pour ostéopathe animalier », « suivi post-séance » et « résumé propriétaire » dans les zones pertinentes ;
- mettre à jour les tests qui dépendent du texte ou de la structure de l'ancienne landing.

## Vérification

Commandes minimales :

- `bun test apps/marketing/__tests__` ;
- `bun --filter @biume/marketing lint` ;
- `bun run check-types` pour la vérification transversale ;
- `bun --filter @biume/marketing build`.

Vérification visuelle :

- desktop 1440 × 1000 ;
- tablette 834 × 1112 ;
- mobile 390 × 844 ;
- thème clair et thème sombre ;
- préférence de mouvement réduit ;
- focus clavier ;
- contrôle des débordements horizontaux ;
- contrôle du hero dans le premier viewport ;
- Lighthouse sur la page d'accueil locale.

## Hors périmètre

- refonte des pages SEO secondaires ;
- modification du produit dans `apps/web` ;
- ajout d'un outil d'analytics ;
- création de faux témoignages, faux logos ou fausses métriques ;
- modification des routes ;
- changement du logo ;
- ajout de GSAP, Motion ou d'une autre bibliothèque d'animation ;
- nouvelle offre tarifaire ou modification du prix.

## Critères d'acceptation

La refonte est acceptée quand :

- le hero ne mentionne pas l'IA comme promesse principale ;
- le produit est compris comme un outil de suivi post-séance contrôlé par le praticien ;
- la page utilise le violet pour l'action et le vert pour la validation ;
- aucune fausse preuve n'est affichée ;
- les trois visuels documentaires sont cohérents et optimisés ;
- le hero, le parcours, le résultat produit, le contrôle humain, le prix et la FAQ sont présents ;
- le CTA « Essayer gratuitement » est cohérent sur toute la page ;
- la page fonctionne en clair, en sombre et avec mouvement réduit ;
- les vérifications de type, de lint, de build et de rendu visuel sont concluantes ;
- aucune modification hors périmètre n'est incluse.
