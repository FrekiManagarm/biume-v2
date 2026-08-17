# Capture et synchronisation mobile

**Date :** 19 juillet 2026

**Statut :** design validé

**Branche :** `codex/mobile-capture-sync`

**Document produit canonique :** `PRODUCT.md`

**Design parent :** `docs/superpowers/specs/2026-07-18-product-proposition-alignment-design.md`

## 1. Résumé

Cette tranche crée la première application mobile Biume pour iOS et Android avec Expo et React Native. Elle permet à un praticien authentifié de choisir un rendez-vous ou une capture libre, d'enregistrer une dictée de dix minutes maximum, de la conserver de façon chiffrée sur l'appareil et de la synchroniser de manière fiable vers un stockage objet privé.

La tranche s'arrête lorsque l'audio est confirmé dans le stockage serveur. Elle ne transcrit pas encore l'enregistrement et ne crée aucune proposition de rapport. Cette limite isole le premier risque du parcours mobile : ne jamais perdre, dupliquer ou rattacher incorrectement une dictée lorsque le réseau ou l'application est interrompu.

Le développement commence avant la création des comptes de distribution Apple et Google. Les comptes sont ouverts en parallèle afin de distribuer ensuite l'alpha par TestFlight et Google Play Internal Testing.

## 2. Objectifs

- Fournir une seule application Expo ciblant iOS et Android.
- Réutiliser Better Auth, les organisations, les rendez-vous et les contrats partagés existants.
- Permettre une capture rattachée à un rendez-vous ou une capture libre.
- Enregistrer au format audio compressé avec une limite stricte de dix minutes.
- Fonctionner hors ligne dès le début de l'enregistrement.
- Persister la file de synchronisation entre les fermetures et redémarrages.
- Chiffrer le fichier audio local au repos.
- Transférer directement l'audio vers un stockage objet privé sans le faire transiter par les fonctions applicatives TanStack.
- Garantir l'idempotence par une identité stable générée sur le mobile.
- Exposer chaque échec comme un état visible et récupérable.
- Purger les fichiers selon la politique produit des 24 heures.

## 3. Non-objectifs

- Transcrire l'audio.
- Extraire ou proposer du contenu de rapport.
- Modifier ou finaliser un rapport depuis le mobile.
- Reproduire l'éditeur anatomique web.
- Partager un rapport ou implémenter l'accès propriétaire par OTP.
- Ajouter les questionnaires, rappels ou notifications de suivi.
- Garantir un transfert continu lorsque le système suspend l'application en arrière-plan.
- Construire une file générique de fichiers ou remplacer les uploads documentaires existants.
- Ajouter la pause et la reprise à l'intérieur d'un même enregistrement.
- Introduire un upload multipart pendant l'alpha.

## 4. Décisions structurantes

### 4.1 Plateformes et distribution

`apps/mobile` utilise Expo et React Native pour produire les versions iOS et Android à partir du même code. Le développement et l'automatisation des tests ne dépendent pas des comptes stores.

Pendant le développement :

- les simulateurs iOS et Android couvrent les flux fonctionnels ;
- les appareils personnels couvrent les permissions, l'audio, le stockage et les interruptions réelles ;
- Android peut recevoir un APK de distribution interne ;
- TestFlight et la distribution iOS aux praticiens attendent l'inscription Apple Developer.

Les comptes Apple Developer et Google Play Console sont créés en parallèle. Le premier pilote externe ne commence pas tant que les deux plateformes ne peuvent pas être distribuées aux praticiens.

### 4.2 Tranche verticale

Le lot mobile complet est séparé en trois sous-projets :

1. authentification, rendez-vous, capture et synchronisation ;
2. transcription et correction ;
3. extraction structurée et validation du rapport.

Le présent document couvre uniquement le premier sous-projet. Cette séparation permet de prouver la fiabilité du transport avant d'ajouter un fournisseur de transcription ou un modèle d'extraction.

### 4.3 Stockage audio

Le premier adaptateur utilise Cloudflare R2 derrière une interface S3-compatible. Le bucket est privé. Le serveur génère des URLs `PUT` signées de courte durée pour une clé d'objet déterminée côté serveur. Le mobile ne reçoit aucune clé de compte, aucun droit de liste et aucune URL publique durable.

Le domaine dépend d'un port `AudioObjectStore`, pas directement de R2. Un autre stockage S3-compatible pourra remplacer l'adaptateur sans modifier les contrats de capture ni l'application mobile.

UploadThing reste réservé aux usages web déjà présents. Il n'est pas étendu aux captures, car cette tranche exige une rétention temporaire, une identité d'objet stable et une file hors ligne contrôlée par Biume.

### 4.4 Reprise du transfert

Une tentative interrompue renvoie le fichier complet. Avec dix minutes d'audio compressé au maximum, cette stratégie est acceptable pour l'alpha et évite le coût opérationnel d'un protocole multipart.

La reprise signifie :

- conserver la capture et son fichier chiffré ;
- renouveler l'autorisation signée si nécessaire ;
- recommencer le `PUT` avec la même clé d'objet ;
- confirmer le même `captureId` sans créer une deuxième capture.

Le multipart ne sera ajouté que si les mesures du pilote montrent que la taille ou la fréquence des reprises le justifie.

### 4.5 Constantes de l'alpha

- durée maximale : 10 minutes ;
- encodage cible : AAC-LC mono dans un conteneur M4A, 64 kbit/s ;
- taille maximale acceptée par le serveur : 16 Mio ;
- durée d'une URL signée : 10 minutes ;
- uploads simultanés par installation : 1 ;
- échecs consécutifs avant `needs_action` : 5 ;
- conservation audio maximale sans choix ultérieur : 24 heures.

## 5. Architecture

```text
apps/mobile
  -> Better Auth Expo
  -> API HTTP /api/mobile/v1 dans apps/web
  -> URL PUT signée
  -> bucket R2 privé

apps/web
  -> services métier de capture
  -> packages/contracts
  -> packages/db / PostgreSQL
  -> adaptateur AudioObjectStore / R2

Trigger.dev
  -> purge des captures et objets expirés
```

### 5.1 Application mobile

`apps/mobile` possède cinq responsabilités :

- authentifier le praticien ;
- afficher le contexte utile de rendez-vous ;
- enregistrer et relire l'audio ;
- chiffrer le fichier et persister son état local ;
- synchroniser les captures lorsque les conditions le permettent.

Les écrans ne contiennent pas la logique de synchronisation. Un service de capture contrôle l'enregistreur et un service de synchronisation consomme une file locale explicite.

### 5.2 Contrats partagés

`packages/contracts` reçoit des schémas Zod et des types purs pour :

- l'identité et les métadonnées d'une capture ;
- la création idempotente ;
- la demande et le renouvellement d'une autorisation d'upload ;
- la confirmation de transfert ;
- les états serveur et les erreurs normalisées ;
- les réponses de l'agenda utile au mobile.

Le package n'importe ni Expo, ni React, ni TanStack, ni Drizzle, ni un SDK de stockage.

### 5.3 Backend

`apps/web` reste le backend du produit. Des routes HTTP versionnées sous `/api/mobile/v1` utilisent des services métier partagés plutôt que les fonctions de présentation du dashboard.

Chaque endpoint :

- résout la session Better Auth à partir des cookies natifs ;
- détermine l'organisation active côté serveur ;
- applique l'isolation organisationnelle avant toute lecture ou mutation ;
- valide l'entrée et la sortie avec `packages/contracts` ;
- retourne une erreur structurée sans contenu clinique.

### 5.4 Authentification

L'intégration officielle `@better-auth/expo` stocke la session et les cookies dans `expo-secure-store`. L'application transmet le cookie aux endpoints Biume selon l'intégration native documentée par Better Auth.

Le serveur ne fait pas confiance à un `organizationId` fourni par le mobile. Il utilise exclusivement l'organisation active de la session. Si aucune organisation n'est active, l'application affiche une sélection d'organisation avant l'agenda ou la capture.

Les origines de développement Expo et le schéma de deep link de production sont déclarés explicitement dans `trustedOrigins`. Aucun wildcard de développement n'est conservé en production.

### 5.5 Stockage local

SQLite conserve uniquement les métadonnées et la file de travail :

- contexte de rendez-vous ;
- chemin du fichier chiffré ;
- empreinte, taille, format et durée ;
- état local et état serveur connu ;
- nombre de tentatives, prochaine tentative et erreur normalisée ;
- dates de création, validation et expiration.

Une clé maître aléatoire de 256 bits propre à l'installation et les données de session restent dans le stockage sécurisé du système. Chaque fichier utilise AES-256-GCM avec un nonce unique et le `captureId` comme donnée authentifiée. Le format chiffré porte une version explicite afin de permettre une future rotation. Le fichier audio est chiffré avant de quitter l'état d'enregistrement. La copie temporaire non chiffrée est ensuite supprimée.

Lors du transfert, le mobile déchiffre le contenu en mémoire vers la requête HTTPS et ne recrée pas de fichier persistant en clair.

## 6. Modèle de données

### 6.1 États locaux

Les états propres à l'application mobile sont :

```text
recording
  -> review
  -> queued
  -> uploading
  -> uploaded
```

Sorties alternatives :

- `needs_action` ;
- `cancelled` ;
- `expired`.

Un état local peut être reconstruit à partir de SQLite et du dernier état serveur. Il n'est jamais déduit uniquement de la présence d'un fichier.

### 6.2 États serveur

Les états persistés sur le serveur sont :

```text
pending_upload
  -> uploading
  -> uploaded
  -> expired
```

Sorties alternatives :

- `retryable_failure` ;
- `cancelled`.

Cette tranche n'ajoute pas encore les états de transcription. Une migration ultérieure étendra la machine sans réinterpréter les états existants.

### 6.3 Capture distante

Une capture distante contient au minimum :

- `id`, UUID généré sur le mobile ;
- `organizationId` et `practitionerId` résolus côté serveur ;
- `appointmentId`, `patientId` et `reportId` facultatifs ;
- `durationMs`, limité à dix minutes ;
- `mimeType`, `byteSize` et `sha256` ;
- `objectKey` imposée par le serveur ;
- `objectEtag` après confirmation ;
- `status`, `attemptCount` et `lastErrorCode` ;
- `createdAt`, `uploadedAt`, `expiresAt` et `purgedAt`.

La clé unique primaire est l'identifiant de capture. Toutes les lectures vérifient également l'organisation. Une nouvelle requête avec le même identifiant et la même empreinte retourne la capture existante. Le même identifiant avec une empreinte ou des métadonnées incompatibles produit un conflit explicite.

## 7. API mobile v1

L'API initiale expose :

- `GET /api/mobile/v1/session` — session, organisation active et capacités utiles ;
- `GET /api/mobile/v1/appointments` — rendez-vous pertinents dans une fenêtre bornée ;
- `GET /api/mobile/v1/captures` — captures du praticien et états distants ;
- `POST /api/mobile/v1/captures` — création ou récupération idempotente ;
- `POST /api/mobile/v1/captures/:id/upload-session` — création ou renouvellement d'une URL signée ;
- `POST /api/mobile/v1/captures/:id/complete` — confirmation et vérification de l'objet ;
- `DELETE /api/mobile/v1/captures/:id` — annulation idempotente et demande de purge.

La fenêtre des rendez-vous est bornée et paginable. Elle favorise le dernier rendez-vous terminé et les rendez-vous proches, sans exposer l'ensemble du dossier client.

### 7.1 Autorisation d'upload

L'API construit une clé opaque sous un préfixe contrôlé, par exemple :

```text
captures/<organization-hash>/<capture-id>/audio.m4a
```

Le hash d'organisation évite d'exposer un identifiant métier dans la clé. L'URL signée :

- cible une seule opération `PUT` ;
- expire après dix minutes ;
- lie le type de contenu et les métadonnées attendues ;
- ne donne aucun accès en lecture ou en liste.

### 7.2 Confirmation

Le mobile renvoie l'ETag reçu après le `PUT`. Le serveur effectue un `HEAD` sur l'objet et vérifie :

- la clé attendue ;
- la présence de l'objet ;
- le type de contenu ;
- la taille attendue ;
- l'ETag ;
- la métadonnée d'empreinte liée à la requête signée.

Le SHA-256 sert à l'identité idempotente de la capture. L'intégrité du transport repose sur HTTPS, la signature de la requête et le contrôle natif du stockage. Aucun téléchargement complet de l'audio ne traverse l'API TanStack pendant cette tranche.

## 8. Parcours d'interface

### 8.1 Connexion

Le praticien utilise son compte Biume existant. La première version expose uniquement la connexion e-mail et mot de passe. La connexion Google native est hors de cette tranche.

Une session mise en cache permet d'afficher les données locales hors ligne. Une synchronisation distante exige toujours une session serveur valide.

### 8.2 Accueil

L'accueil présente :

1. le dernier rendez-vous terminé ou le rendez-vous le plus pertinent comme action principale ;
2. les prochains rendez-vous dans une liste compacte ;
3. une action permanente « Dictée libre ».

Le praticien peut modifier le rattachement avant de valider la dictée. La capture libre reste valide sans rendez-vous, animal ou rapport.

### 8.3 Enregistrement

L'écran affiche :

- le contexte sélectionné ;
- l'état du microphone ;
- la durée ;
- l'état réseau ;
- les actions arrêter ou annuler.

L'arrêt est automatique à dix minutes. La pause et la reprise ne sont pas proposées.

### 8.4 Relecture

À l'arrêt, l'application chiffre immédiatement le fichier, supprime la copie temporaire non chiffrée, puis ouvre la relecture. La lecture déchiffre le flux en mémoire. Le praticien choisit ensuite :

- « Recommencer », qui supprime la capture courante après confirmation ;
- « Valider la dictée », qui ajoute le fichier déjà chiffré à la file.

La validation fonctionne hors ligne et ne dépend pas de la disponibilité du serveur.

### 8.5 Liste des dictées

La liste affiche des libellés orientés action :

- À envoyer ;
- Envoi en cours ;
- Envoyée ;
- Action requise ;
- Expirée.

Chaque erreur propose uniquement les actions possibles : réessayer, se reconnecter, refaire l'enregistrement ou supprimer.

## 9. Synchronisation et reprise

Le synchroniseur s'exécute :

- après validation d'une capture ;
- au retour du réseau ;
- au retour de l'application au premier plan ;
- au lancement de l'application ;
- en arrière-plan lorsque le système l'autorise.

Le fonctionnement ne dépend jamais de l'exécution en arrière-plan. Une suspension iOS ou Android laisse la capture dans un état reprenable.

Pour chaque capture éligible :

1. vérifier la session ;
2. créer ou relire la capture distante ;
3. obtenir ou renouveler l'URL signée ;
4. envoyer le fichier vers la même clé ;
5. confirmer l'objet ;
6. enregistrer l'état distant `uploaded` dans SQLite.

Une seule opération de synchronisation peut posséder le verrou local d'une capture et une installation n'exécute qu'un upload à la fois. La file traite d'abord les captures validées les plus anciennes. Le serveur reste idempotent même si deux exécutions ou deux appareils présentent le même identifiant.

## 10. Erreurs et récupération

- **Réseau absent :** conserver `queued`, sans compter une tentative serveur.
- **URL expirée :** renouveler l'autorisation puis recommencer le `PUT`.
- **Erreur 429 ou 5xx :** backoff exponentiel avec jitter, plafond de quinze minutes et maximum de cinq échecs consécutifs avant intervention manuelle.
- **Session expirée :** passer en `needs_action`, demander la reconnexion et conserver le fichier.
- **Conflit d'identité :** bloquer la capture et ne jamais écraser l'objet existant.
- **Objet incomplet :** refuser la confirmation et renouveler l'upload.
- **Permission microphone refusée :** expliquer le réglage système nécessaire sans créer de capture.
- **Stockage local insuffisant :** refuser le démarrage avant de produire un fichier incomplet.
- **Arrêt forcé pendant l'enregistrement :** détecter le fichier temporaire au redémarrage et proposer sa récupération lorsqu'il est exploitable, sinon sa suppression.
- **Échecs répétés :** afficher `Action requise` après le seuil de retries automatiques.
- **Annulation :** supprimer localement et demander une purge serveur idempotente. Une confirmation arrivant après l'annulation est refusée et toute écriture objet tardive est purgée.

Aucune erreur réseau ou d'authentification ne supprime une capture valide. La seule suppression automatique temporelle suit la politique d'expiration définie ci-dessous.

## 11. Rétention et confidentialité

Le fichier audio local et l'objet distant reçoivent un `expiresAt` fixé à 24 heures après la création. L'interface rend cette expiration visible pour les captures non traitées.

À expiration :

- le synchroniseur supprime le fichier local et marque la capture `expired` ;
- Trigger.dev supprime l'objet distant et renseigne `purgedAt` ;
- la ligne de métadonnées minimale est conservée pour l'audit technique, avec `objectKey` neutralisée et sans chemin exploitable vers un audio.

La tranche ne propose pas d'extension de conservation. Une conservation au-delà de 24 heures sera conçue uniquement si le pilote la justifie et exigera une action explicite du praticien.

Les journaux et événements produit peuvent inclure :

- identifiant technique de capture ;
- source rendez-vous ou libre ;
- plateforme et version applicative ;
- durée, taille et temps de synchronisation ;
- transitions d'état et codes d'erreur normalisés.

Ils ne contiennent jamais de nom, e-mail, nom d'animal, note, transcription, URL signée ou contenu audio.

## 12. Tests

### 12.1 Contrats

- validation des métadonnées et de la limite de dix minutes ;
- transitions d'état autorisées et interdites ;
- idempotence d'une création identique ;
- conflit pour une même identité avec une empreinte différente ;
- erreurs normalisées sans données sensibles.

### 12.2 Services backend

- isolation par organisation sur chaque opération ;
- clé d'objet imposée par le serveur ;
- URL signée bornée à un objet et une opération ;
- renouvellement sans nouvelle capture ;
- confirmation après `HEAD` cohérent ;
- refus d'un objet absent, incohérent ou appartenant à une autre capture ;
- annulation et purge idempotentes ;
- reprise après erreurs concurrentes.

### 12.3 Persistance

- migration additive depuis l'état fusionné du lot 1 ;
- contrainte d'identité et d'organisation ;
- transitions concurrentes ;
- purge sans supprimer une capture d'une autre organisation ;
- test PostgreSQL réel du retry et du conflit d'empreinte.

### 12.4 Mobile

- permissions microphone ;
- arrêt automatique à dix minutes ;
- relecture, recommencement et validation ;
- chiffrement avant mise en file ;
- restauration SQLite après fermeture ;
- verrou local empêchant deux uploads actifs ;
- reconnexion sans perte ;
- session expirée sans suppression ;
- renouvellement d'URL ;
- purge locale à l'expiration ;
- aucune donnée personnelle dans la télémétrie.

### 12.5 Parcours sur appareils

Le même scénario est vérifié sur iOS et Android :

1. ouvrir l'application avec un rendez-vous mis en cache ;
2. couper le réseau ;
3. enregistrer et valider une dictée ;
4. fermer de force l'application ;
5. la rouvrir ;
6. rétablir le réseau ;
7. interrompre une tentative d'upload ;
8. laisser la synchronisation reprendre ;
9. vérifier une unique capture `uploaded` côté serveur.

Des variantes couvrent la capture libre, la reconnexion, l'URL expirée, l'objet incohérent, l'annulation et l'expiration.

## 13. Critères d'acceptation

La tranche est acceptée lorsque :

- le projet mobile démarre sur iOS et Android depuis le monorepo Bun ;
- un praticien existant peut s'authentifier et utiliser son organisation active ;
- l'accueil affiche le contexte de rendez-vous utile et la capture libre ;
- une dictée peut commencer et être validée sans réseau ;
- une fermeture forcée ne perd ni le fichier ni son contexte ;
- la reconnexion synchronise automatiquement la même capture ;
- plusieurs retries ne créent ni seconde ligne ni seconde clé d'objet ;
- le serveur confirme la taille, le type, l'ETag et les métadonnées attendues ;
- toute capture termine en `uploaded` ou dans un état récupérable visible ;
- les purges locale et distante respectent la limite de 24 heures ;
- les scénarios critiques passent sur un appareil iOS et un appareil Android ;
- aucune donnée personnelle ou clinique n'apparaît dans la télémétrie technique.

## 14. Préparation opérationnelle

Avant l'alpha externe :

- créer le compte Apple Developer ;
- créer le compte Google Play Console ;
- configurer les identifiants d'application définitifs ;
- configurer le schéma de deep link et les origines Better Auth ;
- créer le bucket R2 privé, son token limité et sa politique CORS ;
- configurer les secrets typés dans `packages/env` ;
- préparer TestFlight et Google Play Internal Testing ;
- enregistrer les deux appareils pilotes et exécuter la matrice de tests réelle.

## 15. Références

- [Better Auth — intégration Expo](https://better-auth.com/docs/integrations/expo)
- [Cloudflare R2 — URLs signées](https://developers.cloudflare.com/r2/api/s3/presigned-urls/)
- [Expo — distribution interne](https://docs.expo.dev/build/internal-distribution/)
- [Apple Developer — comparaison des adhésions](https://developer.apple.com/support/compare-memberships/)
- [Google Play — tests internes](https://support.google.com/googleplay/android-developer/answer/9845334?hl=en)
