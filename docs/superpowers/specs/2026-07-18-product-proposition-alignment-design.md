# Alignement de Biume avec sa proposition produit

**Date :** 18 juillet 2026

**Statut :** design validé

**Document produit canonique :** `PRODUCT.md`

## 1. Résumé

Biume doit évoluer d’une application web perçue comme un outil de gestion généraliste vers un produit spécialisé dans le compte rendu et le suivi post-séance pour les ostéopathes animaliers indépendants.

Le parcours cible commence sur le terrain. Le praticien dicte un résumé de sa séance depuis une application mobile native. Biume transcrit cette dictée, propose une structure de rapport traçable, laisse le praticien confirmer chaque étape, puis permet de partager le compte rendu et de programmer un suivi propriétaire.

Le travail est réalisé par un développeur seul. La première version pilote doit être disponible en 8 à 12 semaines. Il n’existe aucune donnée de production imposant une compatibilité descendante complexe.

Le programme est livré en deux vagues :

1. valider la boucle dictée, transcription, rapport et partage ;
2. ajouter l’accès propriétaire par OTP, le questionnaire et les alertes de suivi.

## 2. Objectifs

- Faire de la dictée mobile l’entrée principale du compte rendu.
- Obtenir un brouillon structuré prêt à relire en quelques minutes.
- Conserver toutes les étapes métier du rapport sans imposer de saisie inutile.
- Permettre la finalisation mobile des rapports simples.
- Conserver l’édition anatomique et les corrections avancées sur le web.
- Donner au propriétaire un accès mobile sécurisé sans création de compte.
- Transformer la relance existante en boucle de suivi mesurable.
- Instrumenter le temps, la qualité, l’activation et le traitement des réponses.
- Aligner les textes produit, marketing et transactionnels sur ce positionnement.

## 3. Non-objectifs

- Reproduire tout le dashboard web dans l’application mobile.
- Reconcevoir la facturation, les imports ou l’administration.
- Construire un CRM mobile complet.
- Ajouter le SMS pendant le pilote.
- Mettre l’intelligence artificielle au centre du message marketing.
- Automatiser un diagnostic ou une décision clinique.
- Lancer publiquement avant la validation des seuils définis dans `PRODUCT.md`.
- Préserver une compatibilité avec des données de production inexistantes.

## 4. Contexte existant

### 4.1 Capacités réutilisables

Le dépôt contient déjà :

- un monorepo Bun et Turbo ;
- l’application produit TanStack Start dans `apps/web` ;
- le site marketing Next.js dans `apps/marketing` ;
- Better Auth et le modèle d’organisation ;
- les propriétaires, animaux et rendez-vous ;
- un rapport avancé composé d’observations, d’anatomie, de recommandations et de notes ;
- une préparation assistée de la version propriétaire ;
- la génération PDF et l’envoi par e-mail ;
- Trigger.dev pour les tâches programmées ;
- une tarification unique et un essai de 15 jours ;
- des variables d’environnement PostHog.

### 4.2 Écarts principaux

Le produit ne contient pas encore :

- d’application mobile native ;
- de capture audio hors ligne ;
- de transcription vérifiable ;
- d’extraction globale d’une dictée vers les sections du rapport ;
- de traçabilité entre proposition et transcription ;
- de portail propriétaire sans compte ;
- de questionnaire post-séance ;
- de traitement des réponses demandant une action ;
- d’instrumentation end-to-end du parcours cible.

Les textes ne sont pas tous cohérents. Certaines pages spécialisent Biume sur le compte rendu, tandis que des métadonnées, e-mails et écrans le présentent encore comme une plateforme de gestion générale.

## 5. Approches évaluées

### 5.1 Tranches verticales pilotables — retenue

Le domaine du rapport est simplifié juste assez pour supporter le mobile. La boucle dictée vers rapport est ensuite livrée et testée avant le portail propriétaire.

Cette approche maximise l’apprentissage, limite le travail non validé et reste compatible avec un développeur seul.

### 5.2 Fondation complète avant expérimentation — écartée

Cette approche nettoierait l’intégralité du modèle, de l’authentification et de l’instrumentation avant la première dictée réelle. Elle améliorerait la cohérence technique, mais retarderait la validation du risque principal.

### 5.3 MVP complet en une livraison — écartée

Cette approche regrouperait mobile, OTP, questionnaire, notifications et métriques avant tout pilote. Son périmètre est incompatible avec la capacité et l’horizon retenus.

## 6. Découpage de livraison

### Semaine 1 — Fondations produit

- établir le modèle de rapport canonique ;
- définir les états du parcours ;
- extraire les contrats partagés ;
- permettre la création rapide propriétaire et animal ;
- définir les événements analytics ;
- corriger les contradictions de positionnement qui touchent le parcours pilote.

### Semaines 2 à 5 — Boucle mobile

- authentification praticien ;
- accueil contextuel ;
- agenda utile ;
- capture en ligne et hors ligne ;
- file de synchronisation ;
- transcription ;
- validation de la transcription ;
- extraction structurée ;
- vérification du rapport ;
- finalisation des cas simples.

### Semaine 6 — Alpha fermée

Deux praticiens testent le parcours sur le système mobile prioritaire. La priorité est l’absence de perte, de duplication et d’erreur silencieuse.

### Semaines 7 et 8 — Pilote vague 1

Cinq praticiens testent la boucle dictée, rapport et partage. Biume mesure le temps actif, la quantité de corrections et les erreurs factuelles.

### Semaines 9 à 11 — Boucle propriétaire

- version immuable du rapport partagé ;
- accès par OTP e-mail ;
- portail propriétaire ;
- questionnaire programmé ;
- réponse structurée et commentaire ;
- règles d’action ;
- notifications praticien.

### Semaine 12 — Pilote vague 2

Les mêmes praticiens testent le suivi propriétaire. Les résultats déterminent un lancement public ou un nouveau cycle privé.

## 7. Architecture

### 7.1 Applications et packages

```text
apps/
  marketing/     acquisition et positionnement
  mobile/        application Expo et React Native
  web/           produit web, API et portail propriétaire

packages/
  auth/          authentification praticien existante
  contracts/     contrats métier partagés sans dépendance d’interface ou de DB
  db/            schéma et accès aux données distantes
  env/           environnement typé
  transactional/ e-mails
  ui/            composants web partagés
```

`packages/contracts` contient des schémas Zod, des types et des règles pures. Il n’importe ni React, ni TanStack, ni Drizzle. Les composants web et natifs restent séparés.

### 7.2 Backend

`apps/web` reste le backend du produit. Les server functions existantes peuvent continuer à servir l’interface web. Le mobile consomme des endpoints HTTP versionnés, construits au-dessus des mêmes services métier.

L’API mobile ne doit pas appeler ou répliquer directement les fonctions de présentation du web. Elle expose les opérations nécessaires au parcours :

- rendez-vous utiles ;
- création rapide propriétaire et animal ;
- création et statut d’une capture ;
- autorisation et confirmation de transfert ;
- récupération et validation d’une transcription ;
- récupération et application d’une proposition ;
- finalisation et partage d’un rapport simple ;
- consultation et traitement des réponses de suivi.

### 7.3 Authentification praticien

Better Auth reste la source d’authentification. L’application Expo utilise l’intégration mobile officielle et stocke sa session dans le stockage sécurisé du système. Les endpoints réutilisent l’organisation active et les contrôles d’isolation déjà présents.

### 7.4 Traitements asynchrones

Trigger.dev orchestre :

- la transcription ;
- l’extraction structurée ;
- la purge différée des audios ;
- l’envoi des questionnaires ;
- les notifications liées aux réponses.

Chaque tâche reçoit une clé d’idempotence stable. Une reprise ne doit ni dupliquer un rapport, ni envoyer deux messages.

## 8. Modèle métier

### 8.1 Rapport canonique

Le mobile et le web manipulent le même rapport. Les sections canoniques restent :

- observations cliniques et motif ;
- éléments anatomiques ;
- recommandations ;
- notes additionnelles.

Chaque section professionnelle possède un état :

- `empty` ;
- `proposed` ;
- `needs_confirmation` ;
- `confirmed` ;
- `not_applicable`.

La finalisation est permise lorsque chaque section est `confirmed` ou `not_applicable`.

### 8.2 Capture

Une capture est distincte du rapport et possède :

- un identifiant généré sur le mobile ;
- l’organisation et le praticien ;
- un rendez-vous facultatif ;
- un propriétaire et un animal facultatifs avant rattachement ;
- un chemin ou identifiant d’audio temporaire ;
- les métadonnées de durée et de format ;
- son état de synchronisation et de traitement ;
- une transcription versionnée ;
- les informations de suppression de l’audio.

États de capture :

```text
recording
  -> queued
  -> uploading
  -> transcribing
  -> transcript_ready
  -> extracting
  -> proposal_ready
```

États alternatifs :

- `needs_action` ;
- `retryable_failure` ;
- `cancelled` ;
- `expired`.

### 8.3 Proposition

Une proposition ne modifie pas directement le rapport. Chaque élément proposé contient :

- la section cible ;
- le contenu proposé ;
- les passages sources ;
- l’état `grounded`, `needs_confirmation` ou `missing` ;
- la décision du praticien ;
- la version de transcription utilisée.

Les scores de confiance numériques ne sont pas exposés dans l’interface.

### 8.4 Version partagée

Le partage crée une version immuable du rapport. Une modification ultérieure crée une nouvelle version et n’altère pas silencieusement le document déjà transmis.

Le questionnaire et les réponses référencent la version partagée correspondante.

### 8.5 Suivi

Un suivi contient :

- la version de rapport ;
- la date programmée ;
- le modèle validé et ses éventuelles modifications ;
- l’état d’envoi ;
- la réponse structurée ;
- le commentaire libre ;
- l’état de traitement par le praticien.

États de réponse :

```text
received
  -> no_action_required
  -> needs_action
  -> acknowledged
  -> resolved
```

## 9. Flux mobile

### 9.1 Accueil — option validée

L’accueil utilise une disposition hybride contextuelle :

- le dernier rendez-vous terminé ou le rendez-vous pertinent devient l’action principale ;
- le bouton lance directement la dictée rattachée à ce contexte ;
- la capture libre reste disponible en permanence ;
- les rendez-vous à venir restent visibles sans occuper tout l’écran.

Si l’agenda est obsolète, le praticien peut changer le rattachement avant le traitement.

### 9.2 Capture hors ligne

Le mobile crée d’abord une capture locale avec son identifiant stable. L’audio est stocké dans un emplacement persistant, pas dans un cache susceptible d’être purgé. Les métadonnées et opérations en attente sont enregistrées dans SQLite.

À la fin de l’enregistrement, l’application chiffre le fichier audio avec une clé propre à l’installation conservée dans le stockage sécurisé du système, puis supprime la copie temporaire non chiffrée. Les données locales contenant une transcription ou un contenu clinique utilisent également un stockage chiffré. Les préférences et états non sensibles peuvent rester dans la base SQLite ordinaire.

Le transfert reprend lorsque le réseau revient. Le mobile garde l’audio tant que le serveur n’a pas confirmé la transcription et que le praticien ne l’a pas validée. La purge de sécurité intervient au plus tard après 24 heures, conformément à la politique produit.

### 9.3 Vérification — option validée

Le parcours est séquentiel :

1. vérifier et corriger la transcription ;
2. lancer la structuration ;
3. vérifier les sections du rapport ;
4. appliquer, modifier ou rejeter les propositions ;
5. finaliser ou poursuivre sur le web.

La transcription et l’interprétation restent deux validations distinctes pendant le pilote. Une optimisation « rapport d’abord » n’est envisagée qu’après validation de la qualité.

### 9.4 Rapport simple et avancé

Le mobile permet de traiter les sections canoniques, les états non applicables et les corrections textuelles courtes. Il ne reproduit pas l’éditeur anatomique détaillé.

Le bouton « poursuivre sur le web » ouvre le même rapport, sans conversion ni duplication.

## 10. Portail propriétaire

### 10.1 Canal pilote

Le pilote utilise uniquement l’e-mail. Le SMS est hors périmètre.

### 10.2 Accès

1. Le propriétaire reçoit un lien opaque sans donnée personnelle.
2. Il saisit l’e-mail associé à son dossier.
3. Biume répond de manière identique, que l’adresse soit reconnue ou non.
4. Si elle est valide, Biume envoie un OTP valable dix minutes.
5. Les tentatives et renvois sont limités.
6. Une validation correcte crée une session de 30 jours sur l’appareil.
7. Le praticien peut révoquer l’accès.

### 10.3 Questionnaire

Le questionnaire initial demande :

1. l’évolution de l’état de l’animal ;
2. les réactions ou changements particuliers ;
3. le souhait d’être recontacté.

Le praticien peut modifier le texte avant de programmer l’envoi. Biume envoie ensuite automatiquement le questionnaire à l’échéance validée.

### 10.4 Règles d’action

Une réponse demande une action si :

- le propriétaire déclare une dégradation ;
- il déclare une réaction importante ;
- il demande explicitement un contact.

L’analyse du commentaire libre peut proposer un signal supplémentaire, mais elle doit en expliquer la cause et ne produit pas de diagnostic.

## 11. Gestion des erreurs

### 11.1 Principes

- Une erreur ne détruit jamais l’audio ou une version validée.
- Chaque étape asynchrone peut être relancée séparément.
- Les reprises utilisent le même identifiant et la même clé d’idempotence.
- Les états affichés décrivent l’action possible, pas seulement l’échec technique.
- Les opérations irréversibles demandent une confirmation et sont auditables.

### 11.2 Scénarios mobiles

- Permission microphone refusée : expliquer le besoin et proposer la saisie texte.
- Perte réseau pendant l’enregistrement : continuer localement.
- Perte réseau pendant le transfert : reprendre sans nouvel objet serveur.
- Fermeture de l’application : restaurer la capture depuis SQLite.
- Espace insuffisant : empêcher un nouvel enregistrement sans supprimer silencieusement les captures existantes.
- Échec de transcription : permettre un nouveau traitement ou une saisie manuelle.
- Échec d’extraction : conserver la transcription validée et relancer uniquement l’extraction.
- Mauvais rattachement : permettre le changement avant application au rapport.

### 11.3 Scénarios propriétaire

- OTP expiré : proposer un renvoi soumis aux limites.
- Adresse non reconnue : réponse générique, sans fuite d’existence du dossier.
- Accès révoqué : afficher un état neutre et inviter à contacter le praticien.
- Envoi programmé rejoué : clé d’idempotence empêchant un second e-mail.

## 12. Instrumentation

Événements principaux :

- `capture_started` ;
- `capture_completed` ;
- `capture_queued_offline` ;
- `capture_uploaded` ;
- `transcript_ready` ;
- `transcript_approved` ;
- `report_proposal_ready` ;
- `report_ready_for_review` ;
- `report_finalized` ;
- `report_shared` ;
- `followup_scheduled` ;
- `followup_sent` ;
- `owner_response_submitted` ;
- `followup_action_acknowledged` ;
- `followup_action_resolved`.

Propriétés autorisées :

- durées ;
- nombre de sections ;
- nombre de propositions acceptées, modifiées ou rejetées ;
- état en ligne ou hors ligne ;
- type générique de parcours ;
- catégorie d’erreur non sensible ;
- identifiants techniques pseudonymisés.

Sont interdits dans l’analytics :

- l’audio ;
- la transcription ;
- le contenu du rapport ;
- les noms, e-mails et numéros ;
- les commentaires propriétaires ;
- toute donnée clinique libre.

## 13. Mise en conformité des surfaces existantes

### 13.1 Documentation

- utiliser `PRODUCT.md` comme source canonique ;
- limiter `apps/marketing/PRODUCT.md` aux décisions de conversion et de marque du site ;
- éviter les duplications de proposition susceptibles de diverger.

### 13.2 Marketing et métadonnées

- nommer les ostéopathes animaliers ;
- vendre le compte rendu et le suivi ;
- employer « en quelques minutes » avant validation ;
- montrer la dictée et la transformation réelle ;
- garder l’IA dans l’explication du mécanisme ;
- retirer les formulations de gestion complète lorsqu’elles apparaissent comme promesse principale.

### 13.3 Produit et e-mails

- réorienter l’onboarding vers le premier rapport ;
- permettre la création propriétaire et animal en contexte ;
- adapter les e-mails d’essai à l’objectif de trois rapports et un suivi ;
- remplacer les promesses de centralisation générale par le parcours spécialisé ;
- conserver les fonctions existantes sans les mettre au premier plan.

## 14. Stratégie de tests

### 14.1 Tests unitaires

- schémas et règles de contrat ;
- transitions des états ;
- règles de complétude du rapport ;
- extraction des sources ;
- règles de signalement ;
- expiration et révocation des accès ;
- politique de purge audio.

### 14.2 Tests d’intégration

- isolation des organisations sur chaque mutation ;
- reprise idempotente du transfert ;
- absence de duplication de capture et de rapport ;
- séparation proposition et contenu validé ;
- immuabilité d’une version partagée ;
- envoi unique du questionnaire ;
- accès du propriétaire uniquement à la version autorisée ;
- notification uniquement pour les réponses demandant une action.

### 14.3 Tests sur appareils

- enregistrement et permissions sur iOS et Android ;
- mode avion ;
- fermeture et redémarrage ;
- faible espace disque ;
- changement de réseau ;
- reprise du transfert ;
- navigation vers le web avancé.

Le pilote peut valider un système en priorité si les cinq praticiens utilisent le même, mais la base de code reste multiplateforme.

### 14.4 Évaluation IA

Un jeu de dictées anonymisées et versionnées sert d’évaluation reproductible. Chaque cas vérifie :

- les omissions ;
- les mauvais rattachements ;
- les déformations ;
- les inventions ;
- la validité des passages sources.

## 15. Critères de passage

### Alpha

- aucune capture perdue dans les scénarios d’interruption ;
- aucune capture ou rapport dupliqué ;
- aucune proposition appliquée sans validation ;
- isolation d’organisation vérifiée ;
- purge audio vérifiée.

### Pilote vague 1

- temps actif médian inférieur à cinq minutes ;
- au moins 80 % des rapports exacts et complets avec corrections mineures ;
- aucune information clinique inventée ;
- au moins trois rapports réels par praticien pour franchir le seuil d’activation ;
- au moins six rapports réels par praticien, soit 30 au total, avant de conclure sur la promesse de temps et de qualité.

### Pilote vague 2

- questionnaire envoyé une seule fois ;
- accès propriétaire correctement isolé ;
- réponses à action visibles et traitables ;
- mesure du taux de réponse et du taux de traitement.

### Lancement public

Le lancement public reste conditionné aux seuils définis dans `PRODUCT.md`.

## 16. Décomposition en plans d’implémentation

Cette spec est une carte maîtresse. Elle ne doit pas produire un unique plan d’implémentation monolithique.

Les plans sont créés et exécutés dans cet ordre :

1. **Fondation du domaine rapport** — contrats partagés, états, services, création rapide, version partagée et événements.
2. **Capture et synchronisation mobile** — application Expo, authentification, agenda utile, SQLite, audio et file hors ligne.
3. **Transcription et proposition** — traitements asynchrones, validation séquentielle, traçabilité et application au rapport.
4. **Finalisation mobile** — rapport simple, partage et passage vers le web avancé.
5. **Portail propriétaire** — OTP e-mail, session, version partagée et révocation.
6. **Suivi post-séance** — questionnaire, planification, réponses, règles d’action et notifications.
7. **Alignement des surfaces** — marketing, onboarding, e-mails et instrumentation complète.

Le prochain plan doit couvrir uniquement le premier chantier. Chaque chantier suivant reçoit sa propre spec détaillée si des décisions locales restent ouvertes.
