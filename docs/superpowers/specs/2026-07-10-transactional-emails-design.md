# Refonte des emails transactionnels Biume

## Objectif

Refondre `packages/transactional/emails` afin que tous les emails reprennent la grammaire visuelle du produit Biume, tout en restant sobres, compatibles avec les principaux clients email et adaptés à leur contexte transactionnel.

La direction validée est chaleureuse et éditoriale : la lavande Biume structure la marque et les actions principales, le vert Biume signale uniquement les succès et confirmations, et le logo officiel est une signature discrète.

## Système visuel

- Utiliser le logo Biume officiel dans l'en-tête, affiché à 56 px de large.
- Utiliser `#8E82E8` comme lavande de marque pour les en-têtes et CTA principaux.
- Utiliser `#2BDC8F` exclusivement pour les confirmations, succès et états rassurants.
- Utiliser `#3A3A3A` comme encre pour les textes et les actions sensibles ; utiliser `#F3F0FC` comme surface d'information lavande.
- Garder un fond neutre clair, une carte blanche à coins modérés, une bordure douce et un pied de page compact.
- Employer une hiérarchie stricte : contexte, titre, contenu, détail utile, action, assistance et mentions de marque.

## Architecture

`EmailLayout` devient le seul cadre de document. Il contient les balises email, le preheader, le fond, l'en-tête avec logo, la surface de contenu et le pied de page. Il n'impose pas de titre ni de CTA afin de convenir à chaque type d'email.

Un module de primitives réutilisables accompagne le layout : bouton principal, bouton sensible, bloc d'information lavande, bloc de succès vert, carte de détail, séparateur et ligne d'assistance. Ces primitives reposent sur des styles inline sûrs pour les clients email ; les templates ne portent plus leurs propres palettes ou règles de mise en page.

L'URL du logo doit être publique et stable. Les images ne doivent pas dépendre de liens Imgur ou d'un chemin local au runtime.

## Déclinaisons

Les seize templates existants sont conservés et migrés sans modifier leurs données d'entrée ni les liens métiers.

- **Engagement** : accueil, démarrage et suivi d'essai, changement d'abonnement. En-tête lavande, CTA principal lavande et encadrés éditoriaux.
- **Utilitaire** : rendez-vous, rappels de rapport, nouveau rapport client et reçu. Contenu dense, cartes de détail et confirmations vertes lorsque le contexte l'exige.
- **Sécurité / accès** : invitation d'organisation, réinitialisation de mot de passe et demande d'accès au dossier médical. En-tête encre, CTA sombre et explication explicite de la durée ou de la portée de l'action.
- **Support** : email de contact. Traitement éditorial compact, détails de l'expéditeur facilement scannables et lien de réponse clair.

Chaque template adopte des textes français cohérents avec l'application quand le contenu est actuellement en anglais, à l'exception de contenus transmis par un appelant.

## Compatibilité et accessibilité

- Conserver une largeur de contenu autour de 600 px, avec une mise en page fluide sur mobile.
- Privilégier tables/composants React Email et styles inline ; ne pas dépendre de Tailwind, `flex`, gradients CSS, SVG inline ou effets hover pour rendre une information essentielle.
- Fournir un texte alternatif au logo et des libellés d'action explicites.
- Garder les URLs de secours sous les CTA lorsqu'une action ne peut pas être accomplie autrement.

## Vérification

- Ajouter des tests de rendu ciblés avant chaque nouvelle primitive ou changement de comportement : vérification du logo, des couleurs de rôle, du texte de prévisualisation et des liens critiques.
- Vérifier que chaque test échoue avant l'implémentation correspondante, puis passe après correction.
- Rendre au moins un template par famille pour contrôler le HTML généré et l'affichage responsive.
- Exécuter la vérification de types du package transactionnel et les tests ajoutés, en plus de la vérification du rendu.

## Hors périmètre

- Aucun changement aux déclencheurs, aux payloads des emails, aux règles d'envoi ou aux données de facturation.
- Aucun changement de marque global hors de `packages/transactional`.
