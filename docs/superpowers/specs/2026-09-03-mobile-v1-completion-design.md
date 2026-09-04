# Complétion de l'application mobile V1

**Date :** 3 septembre 2026

**Statut :** design validé (session de grilling du 3 septembre 2026)

**Document produit canonique :** `PRODUCT.md`

**Design parent :** `docs/superpowers/specs/2026-08-21-mobile-flutter-rewrite-design.md` — toutes ses décisions restent en vigueur. Ce document ne les rouvre pas : il les prolonge là où l'application s'arrête aujourd'hui.

**Plans dérivés :** `2026-09-03-mobile-lot-a-parcours-signature.md`, `2026-09-03-mobile-lot-b-agenda-et-fiches.md`, `2026-09-03-mobile-lot-c-boucle-de-retour.md`.

## 1. Résumé

L'application Flutter (`apps/mobile`, ~7 200 lignes Dart) fait aujourd'hui trois choses de bout en bout : se connecter, afficher l'agenda du jour, dicter avec file de synchronisation. **Tout ce qui suit la dictée est en code mort ou absent.** Le praticien qui dicte revient sur l'agenda et ne revoit jamais sa dictée.

Ce document fixe ce qu'il manque pour couvrir la liste V1 mobile du `PRODUCT.md`, en trois lots séquentiels, chacun livrable seul :

- **Lot A — parcours signature** : de la dictée au compte rendu partagé et au suivi programmé.
- **Lot B — agenda et fiches** : rendez-vous à venir, création et déplacement de séance, nouveau client, fiche animal.
- **Lot C — boucle de retour** : suivis à traiter, réveil en arrière-plan, notifications locales.

Le lot A est prioritaire. Les lots B et C viennent juste après et **ne sont pas négociables** : ils sont planifiés maintenant, pas « plus tard ».

## 2. État constaté le 3 septembre 2026

### 2.1 Application Flutter

| Branché de bout en bout | En code mort | Absent |
| --- | --- | --- |
| Connexion, choix d'entreprise | Écran compte rendu (`report/`) : pas de route, pas de dépôt injecté, bouton « Finaliser et partager » vide | RDV à venir |
| Agenda du jour avec cache | Cubit de transcription : pas d'écran, pas de dépôt | Création et déplacement de séance |
| Dictée, chiffrement, file, upload | Modèle de suivi (`followup/`) : ni écran ni route | Nouveau client, fiche animal, historique |
| | `workmanager` et `flutter_local_notifications` déclarés, jamais branchés | Rattachement d'une capture libre |

Les routes existantes sont `/`, `/connexion`, `/entreprise`, `/dicter`. Rien d'autre.

### 2.2 Serveur mobile

Endpoints présents : session, agenda sur fenêtre, captures (création, session d'upload, complétion, annulation, liste), propriétaires et animaux (liste, création), historique d'un animal, déplacement de RDV, transcription (lecture, correction), propositions (lecture, décision par proposition, décision par section, régénération), suivi (programmer, actionnables, marquer traité).

Trois trous, à combler dans le lot A :

1. **Aucun endpoint de finalisation ni de partage.** Le web possède `createReportSharedVersion` et les liens propriétaire (`reportShareLink`), le mobile n'y accède pas.
2. **Aucun rattachement d'une capture libre.** Une capture sans `appointmentId` naît sans `patientId` ni `reportId`, et l'extraction exige un `reportId`. Une capture libre peut être transcrite mais jamais extraite.
3. **Le lien de partage du suivi est pris au hasard.** `mobile-api.ports.ts` fait `select token from reportShareLink limit 1` sans `where` : le suivi peut être rattaché au lien d'un autre rapport, voire d'une autre entreprise.

Autre fait structurant : **l'extraction n'est déclenchée que par l'endpoint de régénération**, et celui-ci ne déclenche rien tant qu'aucune proposition n'existe. Ni la fin de la transcription ni la correction ne la lancent : aujourd'hui, la première extraction est impossible.

Deux bugs Flutter relevés au passage, corrigés dans le lot A : l'identifiant de dictée est généré avec `UniqueKey`, jamais un UUID, donc **le serveur refuse toute déclaration** ; et la synchronisation n'est lancée qu'après un enregistrement, jamais à l'ouverture ni au retour au premier plan.

## 3. Objectifs

- Un praticien peut, depuis son téléphone, dicter, relire et corriger la transcription, valider le compte rendu prérempli, l'envoyer au propriétaire et programmer le suivi, sans passer par le web.
- Il sait à tout moment ce qui attend un geste de sa part, dès l'ouverture de l'application.
- Il peut prendre, déplacer et préparer une séance depuis le terrain, y compris chez un nouveau client.
- Il est prévenu quand un propriétaire demande une action, sans qu'aucune infrastructure push ne soit construite.
- Chaque lot se termine par une application utilisable sur téléphone et un build TestFlight.

## 4. Non-objectifs

Ceux du design parent, section 5, restent valables. S'y ajoutent :

- Modifier le questionnaire de suivi depuis le mobile.
- Une messagerie interne praticien–propriétaire.
- Des listes « Propriétaires » et « Animaux » navigables : la fiche est atteinte par un rendez-vous ou un sélecteur, jamais par un annuaire.
- Une vue calendrier mensuelle.
- L'historique complet d'un animal et la recherche dans les comptes rendus.
- Les notifications push distantes (Firebase, APNs). Elles deviennent un chantier distinct **si et seulement si** le pilote mesure un délai iOS problématique.

## 5. Décisions structurantes

### 5.1 Un seul accueil, sans barre d'onglets

L'accueil empile deux zones : **« À traiter »** en tête, puis **l'agenda**. « Dicter » reste l'action principale, seule en bas de l'écran. Un menu « + » discret donne « Nouvelle séance » et « Nouveau client ». Le compte (changer d'entreprise, se déconnecter) est derrière l'avatar en haut. Tout le reste s'ouvre en profondeur depuis une carte.

Le `PRODUCT.md` dit que l'agenda et les dossiers « servent le parcours du compte rendu, ils ne constituent pas la catégorie principale ». Des onglets en feraient des destinations à aller vérifier. Si la liste « À traiter » devient longue au pilote, on ajoute un filtre, pas un onglet.

### 5.2 « À traiter » est le tableau de bord

La section liste **tout ce qui attend un geste du praticien**, rendez-vous ou capture libre confondus :

| Situation | Libellé | Geste |
| --- | --- | --- |
| Dictée non envoyée (file locale) | « Dictée en attente d'envoi » | Réessayer |
| Capture libre sans animal | « À rattacher à un animal » | Choisir l'animal |
| Transcription en cours | « Biume transcrit votre dictée » | Aucun, état informatif |
| Transcription prête ou corrigée sans extraction | « Transcription à relire » | Ouvrir la transcription |
| Dictée inaudible | « Dictée inaudible » | Réenregistrer |
| Extraction en cours | « Biume prépare le compte rendu » | Aucun |
| Propositions non toutes décidées | « Compte rendu à valider » | Ouvrir le compte rendu |
| Tout décidé, non finalisé | « Prêt à envoyer » | Finaliser |
| Suivi actionnable (lot C) | Motif en français | Traiter |

Un libellé dit le geste ou ce que Biume fait, **jamais un état machine**. Les libellés sont des constantes Dart uniques ; aucun écran ne les réinvente.

La liste est **calculée côté serveur** par un nouvel endpoint `GET /todo`, qui classe chaque capture envoyée des trente derniers jours selon sa transcription, ses propositions et l'état de son rapport. Le mobile y ajoute ses dictées locales non envoyées, et affiche « Biume prépare le compte rendu » pendant deux minutes après « Valider la transcription » (marque locale, le serveur n'a pas à le savoir).

L'application interroge le serveur **tant qu'elle est au premier plan** (à l'ouverture, au retour au premier plan, puis à intervalle court pendant qu'un élément est « en cours »). Le réveil en arrière-plan arrive avec le lot C et réutilise la même lecture.

Les séances passées non finalisées apparaissent ici de toute façon : c'est ce qui rend inutile un accès au passé dans l'agenda.

### 5.3 Capture libre : dicter d'abord, rattacher ensuite

Le praticien peut choisir l'animal **avant** de dicter, mais ce n'est pas obligatoire. L'animal devient obligatoire **au moment de valider la transcription**, parce que c'est là que l'extraction, qui exige un rapport, est lancée.

Le choix se fait dans un sélecteur d'animal qui lit **le cache hors ligne**. Le cache des animaux est **rempli à chaque ouverture de l'application en ligne**, jamais chargé à la demande : sans cela, le sélecteur est vide sur le terrain. Le choix fait hors ligne est mémorisé localement et part avec la dictée à la synchronisation.

Un nouvel endpoint `POST /captures/{captureId}/attach` reçoit `{ patientId }`, crée le brouillon de rapport lié à cet animal (sans rendez-vous) et renvoie la capture mise à jour. Il est **idempotent** : rattacher deux fois le même animal renvoie le même rapport ; rattacher un autre animal après extraction est refusé (`conflict`).

Le seul cas bloqué sans réseau est « nouveau client jamais enregistré », et il l'était déjà par le design parent (7.6). Le praticien dicte quand même, et crée puis rattache quand le réseau revient. Depuis le sélecteur, « Nouveau client » (lot B) crée le propriétaire et l'animal et sélectionne ce dernier.

### 5.4 Valider la transcription lance l'extraction

L'écran de transcription a **un seul bouton** : « Valider la transcription ». Il enregistre la correction s'il y en a une, puis déclenche l'extraction. Un praticien qui n'a rien à corriger lit et tape une fois.

L'extraction n'est **jamais** lancée automatiquement à la fin de la transcription. Le design parent (7.7) a tranché : la transcription est visible et corrigée avant toute interprétation. Une extraction sur un texte non relu produirait des propositions à écarter une à une, et à terme plus personne ne relirait la source.

Côté serveur, le mobile enchaîne `POST /captures/{id}/transcript` (si le texte a changé), `POST /captures/{id}/attach` (si un animal a été choisi) puis `POST /captures/{id}/extract`, endpoint nouveau qui déclenche l'extraction. La régénération existante ne pouvait pas servir : elle ne déclenche rien tant qu'aucune proposition n'existe. Elle est corrigée pour repartir de la capture du rapport. Le bouton est désactivé tant que la transcription n'est pas `ready` ou `corrected`.

Une dictée `inaudible` affiche ce qui s'est passé et propose de réenregistrer depuis le même rendez-vous ; elle n'affiche jamais un champ vide sans explication.

### 5.5 Finaliser et partager : un seul geste

Un nouvel endpoint `POST /reports/{reportId}/finalize` reçoit `{ sendToOwner }` et fait, dans l'ordre, en étapes chacune idempotente (le pilote Neon HTTP n'offre pas de transaction ; rejouer après une coupure ne crée ni seconde version, ni second lien, ni second e-mail) :

1. vérifie que toutes les sections sont décidées (sinon `validation`) ;
2. passe le rapport hors brouillon ;
3. fige une version partagée (réutilise le port `createReportSharedVersion` du web) ;
4. crée ou réutilise le lien propriétaire du rapport (`reportShareLink`), lié à ce rapport et à ce propriétaire ;
5. envoie l'e-mail au propriétaire s'il a une adresse.

Il renvoie `{ reportId, status, sentToOwner }`. Fait constaté : **rien ne crée de ligne `reportShareLink` aujourd'hui**, ni sur le web ni sur le mobile ; cet endpoint est le premier à le faire.

Pour que l'application connaisse le propriétaire avant d'appeler l'endpoint, la réponse de `GET /reports/{reportId}/proposals` est étendue de `status`, `patientName`, `owner { id, name, email }` et `captureId`.

**Garde-fou e-mail.** Si le propriétaire n'a pas d'adresse, l'application le dit **avant** d'appeler l'endpoint et propose deux gestes : « Ajouter son e-mail » (champ unique, met à jour le propriétaire) ou « Finaliser sans envoyer ». Dans ce dernier cas le rapport est finalisé, le lien existe, rien n'est envoyé, et l'e-mail pourra être ajouté sur le web.

Finaliser sans envoyer n'est **pas** un chemin proposé quand l'e-mail existe : pour un rapport simple, finaliser sans envoyer n'a pas de sens sur le terrain.

La correction du lien de partage (section 2.2, point 3) fait partie du même endpoint : le suivi se programme après la finalisation, donc le lien existe et appartient au bon rapport. La programmation du suivi doit lire le lien **par `reportId` et `organizationId`**, et refuser (`conflict`) de programmer un suivi sur un rapport non finalisé.

### 5.6 Suivi proposé par défaut, refusable

Immédiatement après la finalisation, un écran unique propose le suivi :

- échéance préremplie à **J+7** (le plancher métier de trois jours reste appliqué par le serveur) ;
- le questionnaire standard, **en lecture seule** ;
- deux boutons : « Programmer le suivi » et « Pas de suivi pour cette séance ».

Aucune saisie n'est nécessaire dans le cas courant. Le questionnaire n'est pas modifiable depuis le mobile : la personnalisation reste sur le web. L'activation d'un praticien se mesure à trois comptes rendus et un suivi programmé ; le suivi doit être le chemin de moindre effort, pas une contrainte, et pas non plus une obligation qui ferait choisir n'importe quelle date.

Refuser le suivi est un geste explicite, tracé en télémétrie, jamais un abandon silencieux.

### 5.7 Agenda : aujourd'hui et sept jours

L'agenda est **une seule liste** groupée par jour : aujourd'hui en tête, puis les sept jours suivants. Un sélecteur de date donne accès aux jours au-delà, passé compris, mais ceux-ci ne sont pas mis en cache.

Le cache hors ligne couvre la **fenêtre de huit jours**, préchargée à chaque ouverture en ligne, avec les fiches et le dernier compte rendu finalisé des animaux concernés (5.10).

Une séance se lit « Prévu », « Terminé » (dérivé de `endAt`), « Annulé ». Aucune clôture manuelle (design parent, 7.8).

### 5.8 Création de séance minimale

Cinq champs, trois préremplis : animal (sélecteur, cache), jour, heure de début, durée, « à domicile ». La durée par défaut est **celle de la dernière séance du praticien**, sinon une heure. Le brouillon de compte rendu est créé avec le rendez-vous, comme sur le web (`withReport: true`). Ni note, ni « prévenir le propriétaire » : ils appartiennent au dashboard.

Nouvel endpoint `POST /appointments` `{ patientId, beginAt, endAt, atHome }`. Création **en ligne uniquement** ; hors ligne, l'application propose de dicter d'abord.

Le déplacement conserve la durée et ne demande que le nouveau créneau. Sur création comme sur déplacement, `checkAppointmentConflicts` (existant côté web, jamais appelé) est branché et son résultat est renvoyé au mobile comme **avertissement contournable** : « Chevauche la séance de Rex à 14 h. Prendre quand même ? » Le serveur n'interdit pas, il informe.

### 5.9 Nouveau client : propriétaire puis animal

Un seul parcours en deux volets enchaînés : le propriétaire (nom, e-mail, téléphone, ville), puis l'animal (nom, espèce, race, date de naissance). Contrats serveur existants, inchangés. Accessible depuis le sélecteur d'animal et depuis le « + » de l'accueil. Depuis un propriétaire existant, le sélecteur propose « Ajouter un animal à ce propriétaire ».

**L'e-mail est demandé avec insistance, sans bloquer.** Le champ est visible d'emblée avec la mention « Sans e-mail, vous ne pourrez pas lui envoyer le compte rendu depuis l'application ». Le praticien peut passer ; l'application le lui redemandera à la finalisation (5.5).

Un nouvel endpoint `POST /owners/{ownerId}/email` `{ email }` sert le garde-fou de finalisation. Il ne modifie que l'e-mail. (POST et non PATCH : le routeur de fichiers ne monte que GET, POST et DELETE.)

### 5.10 Fiche animal orientée « avant la séance »

Lecture seule. Identité (nom, espèce, race, âge calculé), propriétaire avec appel et e-mail natifs en un tap, dernières séances avec motif et état du compte rendu. Chaque séance passée dont le compte rendu est finalisé **ouvre ce compte rendu en lecture seule** : le même écran de propositions, verrouillé, sans bouton.

Le moment d'usage est la voiture avant la séance : « qu'est-ce que j'ai fait la dernière fois ». Sans l'ouverture du compte rendu, la fiche ne répond pas à cette question.

L'endpoint de lecture des propositions accepte donc un rapport finalisé et le renvoie tel quel ; les endpoints de décision le refusent (`conflict`).

### 5.11 Réveil en arrière-plan, notifications locales, pas de push

`workmanager` (déjà déclaré) enregistre une tâche périodique qui, à chaque réveil accordé par le système :

1. relance la file de dictées en attente ;
2. lit « À traiter » (mêmes lectures qu'au premier plan) ;
3. pose une notification locale pour chaque **nouvel** élément actionnable : suivi actionnable, brouillon en attente, dictée abandonnée après cinq échecs.

« Nouvel » signifie : identifiant jamais notifié, mémorisé dans drift. Une même situation n'est jamais notifiée deux fois ; une réussite n'est jamais notifiée.

**Limite assumée :** iOS accorde les réveils quand il le décide ; le délai peut atteindre plusieurs heures. Une réponse à un questionnaire n'est pas une urgence vétérinaire, le praticien y répond dans la journée. Le pilote mesure le délai réel (télémétrie : heure de l'événement serveur, heure de la notification locale). Si la mesure est mauvaise, le push devient un chantier distinct, avec des chiffres.

**Mesure du délai — implémentée, pas encore relevée.** L'événement `mobile.followup_notified` porte `delayMs` : l'écart entre `answeredAt` côté serveur et l'instant où la notification s'affiche. La requête qui en donne la médiane et le p90, par plateforme, est en section 12 de `docs/mobile/operations.md`.

Le relevé iOS sur **trois réveils réels** — jamais simulés au débogueur — se consigne dans `docs/mobile/manual-test-matrix.md`, section « Délai iOS observé », puis se recopie ici :

| # | Date | Appareil / version iOS | Délai observé |
|---|------|------------------------|---------------|
| 1 | — | — | — |
| 2 | — | — | — |
| 3 | — | — | — |

Tant que ces trois lignes sont vides, **aucun chantier push ne se justifie** : la décision s'appuie sur ce chiffre, pas sur une impression.

### 5.12 Traiter un suivi : lire, contacter, clore

La carte d'un suivi actionnable montre le motif en français, la réponse du propriétaire (échelle, commentaire, demande de recontact), l'animal et le propriétaire. Gestes : « Appeler » et « Écrire » (téléphone et e-mail natifs, hors de l'application), « Prendre un rendez-vous » (ouvre la création de séance avec l'animal prérempli), et « Marquer comme traité ».

**« Traité » est un geste explicite.** Appeler ne clôt pas le suivi : un appel manqué n'est pas un suivi traité. Aucune messagerie interne.

## 6. Contraintes transverses

Celles du design parent, section 6, plus :

- Les nouveaux endpoints entrent dans `openapi.json` avant la première ligne de Dart qui les consomme. Le test de dérive existant les couvre.
- Toute lecture serveur filtre sur `organizationId` en plus de l'identifiant demandé. Le point 3 de la section 2.2 est la raison pour laquelle cette règle est répétée ici.
- Les libellés d'état (5.2) sont uniques dans le code Dart. Un test vérifie qu'aucun écran n'affiche un nom d'état serveur brut.
- Le cache hors ligne reste **en lecture seule**. Les seules écritures locales sont la file de dictées et le choix d'animal d'une capture libre, qui est une propriété de la dictée en file, pas une écriture de fiche.
- Aucun écran ne bloque en attendant le serveur : les états « en cours » sont visibles dans « À traiter » et le praticien peut partir.
- Télémétrie : chaque transition du parcours (dictée sauvée, transcription validée, extraction demandée, compte rendu finalisé, suivi programmé ou refusé, suivi traité) porte l'identifiant de parcours du design parent (7.11). Aucun nom, aucune note, aucune adresse.

## 7. Nouveaux endpoints, récapitulatif

| Lot | Endpoint | Rôle |
| --- | --- | --- |
| A | `POST /captures/{captureId}/attach` | Rattacher une capture libre à un animal, créer le brouillon |
| A | `POST /captures/{captureId}/extract` | Valider la transcription, lancer l'extraction |
| A | `GET /todo` | Ce qui attend un geste, classé côté serveur |
| A | `POST /reports/{reportId}/finalize` | Sortir du brouillon, figer, lier, envoyer |
| A | `POST /owners/{ownerId}/email` | Compléter l'e-mail d'un propriétaire |
| A | (extension) `GET /reports/{reportId}/proposals` | `status`, `patientName`, `owner`, `captureId` |
| A | (correction) `POST /reports/{reportId}/followup` | Lien lu par rapport et entreprise ; refus si brouillon ; bon animal |
| A | (correction) `POST /reports/{reportId}/proposals/regenerate` | Repart de la capture quand aucune proposition n'existe |
| B | `POST /appointments` | Créer une séance, avertissement de conflit dans la réponse |
| B | (extension) `POST /appointments/{id}/move` | Avertissement de conflit dans la réponse |
| B | (extension) `GET /reports/{reportId}/proposals` | Accepte un rapport finalisé |
| C | aucun | |

## 8. Livraison

Trois plans séquentiels, un par lot. Dans chaque lot : contrat et serveur d'abord, puis Flutter, puis vérification sur téléphone et build TestFlight. Les briques partagées (« À traiter », sélecteur d'animal, lecture seule du compte rendu) sont construites dans le premier lot qui en a besoin, en prévoyant l'usage suivant sans le coder.

Le parcours signature complet est **chronométré** à la fin du lot A, sur téléphone, dictée réelle, et le temps actif est consigné dans ce document.

| Lot | Chiffrage | Contenu |
| --- | --- | --- |
| A | 3 à 4 semaines | 5 endpoints, 1 extension, 2 corrections, 2 bugs Flutter ; « À traiter », sélecteur d'animal, transcription, compte rendu branché, finalisation, suivi, accueil unique |
| B | 2 à 3 semaines | 1 endpoint + 2 extensions ; agenda 8 jours, création et déplacement, nouveau client, fiche animal, lecture seule |
| C | 1 à 1,5 semaine | réveil en arrière-plan, notifications locales, suivis à traiter, mesure du délai |

## 9. Temps actif mesuré

Le temps actif compte le parcours du praticien, de la fin de la dictée
réelle jusqu'au compte rendu (brouillon) prêt à relire — les propositions
affichées à l'écran, avant toute décision. Les interruptions extérieures
(appel, question, temps de préparer l'appareil) ne comptent pas. Protocole
détaillé : scénarios 1 à 3 de la section « Parcours signature (lot A) » de
`docs/mobile/manual-test-matrix.md`. Objectif à battre : **cinq minutes**.

| Date | Praticien / testeur | Durée de la dictée | Temps actif (fin de dictée → brouillon prêt à relire) |
| --- | --- | --- | --- |
| — | — | — | — |
