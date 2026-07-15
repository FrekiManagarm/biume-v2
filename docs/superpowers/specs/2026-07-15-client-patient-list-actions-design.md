# Actions des listes clients et patients

## Objectif

Permettre aux utilisateurs de consulter, modifier et supprimer un client ou un patient directement depuis sa ligne dans les listes du tableau de bord, tout en gardant une interface compacte et extensible.

## Décisions validées

- Remplacer l'action isolée actuelle par un menu contextuel `…` à la fin de chaque ligne.
- Proposer les actions `Consulter`, `Modifier` et `Supprimer` dans cet ordre.
- Séparer visuellement `Supprimer` des autres actions et utiliser un traitement destructif rouge.
- Ouvrir la modification dans le même type de `Credenza` que la création, avec les données existantes préremplies.
- Demander une confirmation explicite avant toute suppression.
- Autoriser la suppression en cascade d'un client et de ses patients, avec un avertissement indiquant le nombre de patients concernés.
- Conserver une structure de menu permettant l'ajout d'autres actions plus tard.

## Expérience dans les listes

Chaque cellule `Actions` affiche un bouton icône `Ellipsis` doté d'un libellé accessible propre à la ligne. Le bouton ouvre un menu Shadcn-style aligné à droite afin de rester dans la largeur du tableau.

Le menu contient :

1. `Consulter`, avec une icône `Eye` ;
2. `Modifier`, avec une icône `Pencil` ;
3. un séparateur ;
4. `Supprimer`, avec une icône `Trash2` et un style destructif.

Pour un patient, `Consulter` conserve le comportement actuel et ouvre son dossier. Pour un client, le bouton actuel n'ayant pas encore de comportement, `Consulter` ouvre une `Credenza` en lecture seule présentant ses coordonnées et ses patients rattachés. Aucune nouvelle route de détail n'est introduite.

Le menu est utilisable au clavier, restaure le focus à sa fermeture et présente des libellés explicites aux technologies d'assistance.

## Modification

Les formulaires client et patient sont rendus réutilisables entre création et modification. Leur mode est déterminé par la présence ou non d'une entité existante.

En mode modification :

- le titre, la description et le bouton principal utilisent le vocabulaire de modification ;
- toutes les valeurs disponibles sont préremplies ;
- les mêmes schémas de validation que pour la création sont appliqués ;
- la fermeture sans enregistrement réinitialise le formulaire ;
- une soumission réussie ferme la fenêtre, invalide les requêtes concernées et affiche un toast de succès ;
- une erreur conserve la fenêtre et les valeurs saisies afin de permettre une nouvelle tentative.

La modification d'un patient permet notamment de changer son propriétaire et son espèce à partir des listes déjà chargées par la route.

## Suppression et avertissements

La sélection de `Supprimer` ouvre un `AlertDialog` avant toute mutation.

Pour un client, le dialogue :

- cite le nom du client ;
- affiche le nombre exact de patients rattachés ;
- explique que ces patients, leurs dossiers et leurs données associées seront également supprimés ;
- précise que l'action est irréversible.

Pour un patient, le dialogue cite son nom et explique que son dossier et ses données associées seront définitivement supprimés.

Les actions de confirmation utilisent un libellé sans ambiguïté (`Supprimer le client` ou `Supprimer le patient`). Les boutons du dialogue sont désactivés pendant la mutation. Une réussite ferme le dialogue, actualise les données et affiche un toast. Une erreur laisse le dialogue ouvert et affiche un message permettant de réessayer.

Après une suppression, si la page courante ne contient plus d'élément et qu'une page précédente existe, la navigation revient à la dernière page valide.

## Fonctions serveur et sécurité

Ajouter des fonctions serveur dédiées à la modification et à la suppression des clients et des patients. Chaque fonction :

- valide ses données avec Zod ;
- récupère l'organisation active ;
- limite l'opération à une ligne appartenant à cette organisation ;
- échoue explicitement si l'entité est absente ou inaccessible ;
- met à jour `updatedAt` lors d'une modification ;
- s'appuie sur les contraintes de suppression en cascade existantes pour les données liées.

Une modification de patient vérifie également que le propriétaire choisi appartient à l'organisation active. Les espèces restent issues du référentiel existant.

Les wrappers d'actions client exposent les nouvelles fonctions serveur aux composants sans dupliquer la validation métier.

## Flux de données

1. L'utilisateur ouvre le menu d'une ligne.
2. La route enregistre l'entité sélectionnée pour une modification ou une suppression.
3. Une modification initialise le formulaire avec les valeurs de l'entité et envoie la mutation validée.
4. Une suppression présente d'abord l'avertissement adapté, puis envoie seulement l'identifiant de l'entité après confirmation.
5. Le serveur vérifie l'organisation active et exécute l'opération ciblée.
6. TanStack Query invalide les listes affectées : `clients` pour un client, et `patients` ainsi que `clients` pour un patient ou pour une suppression en cascade.
7. Les compteurs, filtres et tableaux se mettent à jour depuis les nouvelles données.

## États d'erreur et concurrence

- Entité déjà supprimée ou inaccessible : afficher un message clair, fermer l'état obsolète et rafraîchir la liste.
- Échec de modification : conserver les valeurs saisies et permettre une nouvelle soumission.
- Échec de suppression : conserver la confirmation ouverte et permettre une nouvelle tentative.
- Mutation en cours : désactiver les commandes concernées pour éviter les doubles soumissions.
- Changement de propriétaire invalide : refuser l'opération côté serveur même si l'interface détenait une liste devenue obsolète.

## Limites de composants

- Les routes clients et patients conservent la sélection de ligne et l'orchestration des requêtes.
- Un composant de menu d'actions léger peut être partagé si les deux routes gardent des libellés et callbacks explicites.
- La consultation d'un client utilise une `Credenza` locale en lecture seule ; la consultation d'un patient continue d'utiliser `AnimalCredenza`.
- Les formulaires existants sont adaptés en formulaires création/modification plutôt que dupliqués.
- Un dialogue de suppression commun peut recevoir le type d'entité, son nom, le nombre de patients et les callbacks de mutation.
- Les fonctions serveur restent séparées par domaine dans `clients.function.ts` et `patients.function.ts`.

Ces extractions doivent rester ciblées. Aucun remaniement visuel général des listes ni nouvelle route de détail client n'est prévu.

## Stratégie de test

### Fonctions serveur

- les schémas acceptent une modification valide et rejettent les champs invalides ;
- une modification ou suppression ne peut cibler qu'une entité de l'organisation active ;
- le changement de propriétaire d'un patient refuse un client d'une autre organisation ;
- la suppression d'un client utilise la ligne autorisée et laisse les cascades de base s'appliquer ;
- une entité absente produit l'erreur attendue.

### Composants et présentation

- le menu expose `Consulter`, `Modifier` et `Supprimer` dans le bon ordre ;
- `Supprimer` est séparé et annoncé comme action destructive ;
- le formulaire de modification est prérempli avec les valeurs de la ligne ;
- l'avertissement client affiche le nombre de patients et décrit la cascade ;
- l'avertissement patient décrit la suppression définitive du dossier ;
- les invalidations de requêtes et les états de chargement correspondent à chaque mutation.

### Vérification manuelle

- parcourir les menus au clavier dans les deux tableaux ;
- modifier puis supprimer un client sans patient ;
- supprimer un client avec plusieurs patients et vérifier l'avertissement puis l'actualisation des deux listes ;
- modifier puis supprimer un patient ;
- vérifier le comportement sur mobile et sur la dernière ligne d'une page paginée.

## Hors périmètre

- restauration ou corbeille ;
- suppression groupée ;
- historique des modifications ;
- nouvelles actions au-delà de consulter, modifier et supprimer ;
- création d'une nouvelle fiche ou route de détail client.
