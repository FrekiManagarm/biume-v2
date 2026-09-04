# Matrice de tests manuels — capture mobile

**Statut : non exécutée.** Le protocole ci-dessous est défini mais aucun
scénario n'a encore été joué sur simulateur ni sur appareil. Les tests
automatisés couvrent l'orchestration, la crypto, la persistance et les écrans ;
ils ne couvrent pas les permissions natives, le comportement réel du
microphone, ni les interruptions système.

Ce document doit être rempli avant tout pilote externe.

## Ce qui est déjà vérifié automatiquement

Au 17 août 2026, sans appareil :

| Vérification | Commande | Résultat |
|---|---|---|
| Suite mobile | `bun --filter @biume/mobile test` | 27 suites, 319 tests |
| Persistance PostgreSQL réelle | voir `operations.md` §6 | 6 tests |
| Types | `bun run check-types` | 6 packages |
| Dépendances SDK | `bunx expo install --check` | à jour |
| Bundle iOS | `bunx expo export --platform ios` | OK |
| Bundle Android | `bunx expo export --platform android` | OK |

Un bundle qui se construit prouve que l'application démarre du point de vue du
JavaScript. Il ne prouve rien sur le micro, les permissions, le stockage réel,
ni les interruptions système : ces lignes-là exigent les appareils ci-dessous.

## Comment exécuter

```bash
bun run dev:mobile
```

Renseigner une ligne par scénario et par plateforme, avec la date, la version
d'OS, l'appareil, le type de build, et une preuve (capture d'écran, log, ou
observation datée).

L'arrêt automatique à dix minutes se vérifie avec une horloge raccourcie
injectée dans un build de développement uniquement — jamais dans un build de
production.

## Scénarios

| # | Scénario | Attendu |
|---|----------|---------|
| 1 | Première ouverture, demande de permission micro | La demande système apparaît une seule fois |
| 2 | Permission refusée | Aucune capture créée, action « Ouvrir les réglages » proposée |
| 3 | Démarrage / arrêt manuel | Le fichier chiffré existe, le clair a disparu |
| 4 | Arrêt automatique à 10 min | Arrêt sans action, durée stockée = 600 000 ms |
| 5 | Relecture | L'audio se joue, aucun second fichier en clair sur le disque |
| 6 | Recommencer | Confirmation demandée, fichier chiffré et ligne supprimés |
| 7 | Validation hors ligne (mode avion) | La dictée passe en « À envoyer » sans réseau |
| 8 | Fermeture forcée pendant l'enregistrement | Au redémarrage, la prise est proposée en relecture ou supprimée si illisible |
| 9 | Fermeture forcée pendant l'envoi | La ligne repasse en « À envoyer » sans consommer de tentative |
| 10 | Stockage insuffisant | Refus avant création du fichier temporaire |
| 11 | Appel entrant pendant l'enregistrement | La prise reste récupérable |
| 12 | Verrouillage de l'écran pendant l'enregistrement | La prise reste récupérable |
| 13 | Changer le rattachement en relecture | La dictée part vers le rendez-vous choisi, ou sans rendez-vous |
| 14 | Coupure puis retour du réseau, app au premier plan | L'envoi repart seul, sans action ni tentative décomptée hors ligne |
| 15 | Session expirée, action « Se reconnecter » | Après connexion, les dictées retenues repassent en « À envoyer » |
| 16 | Action « Refaire » sur une dictée bloquée | Ligne et fichier supprimés, enregistrement rouvert sur le même rendez-vous |
| 17 | App laissée ouverte plus de 24 h | Au retour au premier plan, l'audio expiré est supprimé du disque |

## Résultats

| Date | Plateforme | Version OS | Appareil | Build | Scénarios | Résultat | Preuve |
|------|------------|------------|----------|-------|-----------|----------|--------|
| — | iOS | — | — | — | — | non exécuté | — |
| — | Android | — | — | — | — | non exécuté | — |

## Scénario d'envoi interrompu

À exécuter contre l'API web locale et un bucket R2 privé **non production**.
Ne jamais coller d'URL signée ni d'identifiant clinique dans ce document.

1. mettre un rendez-vous en cache ;
2. passer hors ligne ;
3. enregistrer et valider une dictée ;
4. fermer l'application de force, puis la rouvrir ;
5. rétablir le réseau ;
6. interrompre le premier `PUT` ;
7. laisser les déclencheurs de premier plan et de réseau reprendre ;
8. vérifier **une seule** ligne locale `uploaded`, **une seule** ligne en base,
   et **une seule** clé d'objet dans R2.

| Date | Plateforme | Version OS | Appareil | Build | Résultat | Preuve |
|------|------------|------------|----------|-------|----------|--------|
| — | iOS | — | — | — | non exécuté | — |
| — | Android | — | — | — | non exécuté | — |

## Matrice d'acceptation sur appareil physique

**Non exécutée.** L'alpha n'est pas acceptée tant que les deux colonnes de
plateforme ne sont pas signées et datées. Un appareil iOS réel et un appareil
Android réel sont requis ; aucun compte store n'est nécessaire pour cette
vérification locale, mais la distribution iOS externe attend l'inscription
Apple Developer.

La purge des 24 heures se vérifie avec une horloge non production injectée.

| # | Critère | iOS | Android |
|---|---------|-----|---------|
| 1 | Connexion e-mail / mot de passe et organisation active | — | — |
| 2 | Rendez-vous utile et capture libre | — | — |
| 3 | Permission micro refusée puis accordée | — | — |
| 4 | Hors ligne : enregistrer, arrêter, relire, refaire, valider | — | — |
| 5 | Arrêt automatique à dix minutes | — | — |
| 6 | Fermeture forcée après validation, récupération à la réouverture | — | — |
| 7 | Retour réseau, un seul envoi à la fois | — | — |
| 8 | `PUT` interrompu, URL signée renouvelée, reprise du fichier complet | — | — |
| 9 | Session expirée : fichier chiffré conservé, reprise après connexion | — | — |
| 10 | Cinq échecs menant à un « Action requise » visible | — | — |
| 11 | Annulation pendant l'envoi, sans complétion tardive | — | — |
| 12 | Purge locale et R2 à 24 h (horloge injectée) | — | — |
| 13 | Reprises répétées : une seule ligne en base, un seul objet | — | — |
| 14 | Inspection télémétrie : aucune donnée personnelle ni clinique | — | — |

## Parcours signature (lot A)

**Non exécuté.** Le lot A ferme la boucle complète : dictée, transcription,
compte rendu, envoi au propriétaire, suivi. Les sept scénarios ci-dessous
vérifient ce parcours sur téléphone réel, avec une vraie voix. Ils sont
écrits pour quelqu'un qui n'a pas suivi le développement : chaque scénario
dit ce qu'il faut préparer avant de commencer, les gestes à faire, et ce
qu'on doit voir à l'écran. Aucune lecture de code n'est nécessaire.

**Démarrer le serveur et l'application :**

```bash
bun --filter @biume/web dev
```

Puis, dans un autre terminal, depuis `apps/mobile` :

```bash
flutter run --dart-define-from-file=dart_define/local.json
```

**Préparatifs communs, à faire une fois avant de commencer :**

- un compte praticien connecté, avec une organisation active ;
- un rendez-vous programmé **aujourd'hui**, dans l'agenda, pour un animal existant ;
- un animal dont le propriétaire n'a **pas** d'adresse e-mail enregistrée — le garde-fou du scénario 4 ne se déclenche que dans ce cas. Si aucune fiche de test ne convient, en créer une (nom et coordonnées fictifs, jamais ceux d'un client réel) ;
- un second animal dans le même cas (sans e-mail), pour le scénario 6, qui a besoin de sa propre dictée ;
- avoir ouvert l'application **en ligne** juste avant de commencer : le cache des animaux (utilisé hors ligne au scénario 2) ne se remplit qu'à l'ouverture en ligne, jamais à la demande.

Pendant tous les scénarios : les libellés affichés doivent être en français
et décrire un geste ou un état compréhensible (« Dictée en attente d'envoi »,
« Biume transcrit votre dictée »...). Si un nom d'état serveur brut apparaît
à l'écran (`proposed`, `ready`, `to_attach`...), c'est une anomalie à noter,
pas un détail.

**Chronométrage.** Les scénarios 1 à 3 mesurent le temps actif consigné à la
section 9 de `docs/superpowers/specs/2026-09-03-mobile-v1-completion-design.md`.
Démarrer le chronomètre à la fin de la dictée réelle (juste après avoir
arrêté l'enregistrement, avant de valider). L'arrêter dès que les
propositions du compte rendu apparaissent à l'écran, à la fin du scénario 3.
Noter aussi la durée de la dictée elle-même. Les interruptions extérieures
(appel, question d'un collègue, temps de préparer l'appareil) ne comptent
pas : mettre le chronomètre en pause, ou refaire le passage si l'interruption
fausse trop la mesure.

### Scénario 1 — Dictée depuis un rendez-vous du jour

**Préparatifs :** le rendez-vous du jour préparé plus haut ; application en ligne.

**Étapes :**
1. Depuis l'accueil, ouvrir le rendez-vous du jour.
2. Appuyer sur « Dicter » et enregistrer une dictée réelle d'environ une minute (résumé d'une séance, à voix haute).
3. Valider la dictée.
4. Revenir à l'accueil.

**On doit voir :**
- l'élément apparaît dans « À traiter » avec le libellé « Dictée en attente d'envoi » ;
- il disparaît une fois l'envoi terminé (quelques secondes, réseau normal) ;
- il réapparaît avec le libellé « Biume transcrit votre dictée ».

### Scénario 2 — Capture libre hors ligne, rattachement au retour du réseau

**Préparatifs :** mode avion pas encore activé ; l'application a été ouverte en ligne juste avant (cache des animaux rempli).

**Étapes :**
1. Activer le mode avion sur le téléphone.
2. Depuis l'accueil, lancer une capture libre (dicter sans passer par un rendez-vous) et dicter environ une minute.
3. Choisir un animal dans le sélecteur — la liste doit s'afficher depuis le cache, sans réseau.
4. Valider.
5. Vérifier que l'élément reste sur « Dictée en attente d'envoi » tant que le mode avion est actif.
6. Couper le mode avion.

**On doit voir :**
- hors ligne, l'élément affiche « Dictée en attente d'envoi » et ne bouge pas ;
- une fois le réseau revenu, l'élément passe à « Biume transcrit votre dictée », puis à « Transcription à relire ».

### Scénario 3 — Corriger la transcription et lancer l'extraction

**Préparatifs :** un élément en « Transcription à relire », issu du scénario 1 ou 2. Démarrer le chronomètre (voir plus haut) au moment de valider la dictée qui a produit cette transcription, s'il ne l'est pas déjà.

**Étapes :**
1. Ouvrir l'élément « Transcription à relire ».
2. Corriger un mot dans le texte affiché.
3. Appuyer sur « Valider la transcription » — c'est le seul bouton de l'écran.

**On doit voir :**
- l'écran bascule vers le compte rendu, avec un état « Biume prépare le compte rendu » ;
- après quelques instants, les propositions du compte rendu apparaissent, section par section. Arrêter le chronomètre ici et noter la durée.

### Scénario 4 — Finaliser et partager, propriétaire sans e-mail

**Préparatifs :** le compte rendu en propositions du scénario 3, pour l'animal dont le propriétaire n'a pas d'e-mail.

**Étapes :**
1. Confirmer ou écarter chaque proposition jusqu'à ce que tout soit décidé.
2. Vérifier que le statut affiché est « Prêt à envoyer ».
3. Appuyer sur « Finaliser et partager ».
4. Au garde-fou e-mail, choisir « Ajouter son e-mail », saisir une adresse de test, puis « Enregistrer et envoyer ».

**On doit voir :**
- avant tout envoi, l'application signale l'absence d'adresse et propose « Ajouter son e-mail » ou « Finaliser sans envoyer » — jamais d'envoi silencieux ;
- une fois l'adresse ajoutée et l'envoi confirmé, un e-mail arrive à cette adresse, avec un lien vers le compte rendu (`/r/<token>`) ;
- ouvrir ce lien affiche le compte rendu partagé.

### Scénario 5 — Programmer le suivi

**Préparatifs :** suite immédiate du scénario 4.

**Étapes :**
1. Sur l'écran de suivi qui s'affiche après la finalisation, vérifier l'échéance préremplie.
2. Appuyer sur « Programmer le suivi ».
3. Revenir à l'accueil.

**On doit voir :**
- retour à l'accueil sans erreur ;
- l'élément correspondant à ce compte rendu a disparu de « À traiter ».

### Scénario 6 — Finaliser sans envoyer

**Préparatifs :** le second animal sans e-mail, préparé en amont. Il faut refaire une dictée complète (scénarios 1 à 3, en version courte) pour obtenir un nouveau compte rendu en propositions.

**Étapes :**
1. Dicter, valider la transcription, décider chaque proposition jusqu'à « Prêt à envoyer ».
2. Appuyer sur « Finaliser et partager ».
3. Au garde-fou e-mail, choisir cette fois « Finaliser sans envoyer ».
4. Sur l'écran de suivi, appuyer sur « Programmer le suivi ».

**On doit voir :**
- le compte rendu passe à un statut finalisé, sans qu'aucun e-mail ne parte ;
- aucun e-mail n'est reçu pour cette séance ;
- la programmation du suivi réussit quand même — le lien de partage existe même sans envoi.

### Scénario 7 — Fermeture forcée pendant la préparation du compte rendu

**Préparatifs :** une nouvelle dictée courte, prête à être validée (répéter le début du scénario 1 ou 2 jusqu'à « Transcription à relire »).

**Étapes :**
1. Corriger si besoin, puis appuyer sur « Valider la transcription ».
2. Dès que l'état « Biume prépare le compte rendu » s'affiche, fermer complètement l'application (pas une simple mise en arrière-plan — la tuer depuis le gestionnaire de tâches du téléphone).
3. Relancer l'application.

**On doit voir :**
- l'élément est présent dans « À traiter », avec un libellé cohérent avec son état réel (pas d'écran vide, pas d'élément orphelin) ;
- ni la dictée ni la transcription ne sont perdues.

### Build de distribution (TestFlight)

```bash
cd apps/mobile && flutter build ipa --dart-define=BIUME_API_URL=https://biume.app
```

Cette commande exige un compte développeur Apple configuré sur la machine
qui construit l'app (signature et provisionnement). S'il n'est pas
disponible, le dire clairement dans le résultat ci-dessous plutôt que de
consigner un échec technique — ce n'est pas la même chose. Quand la commande
réussit, l'envoi vers TestFlight se fait à la main via Transporter.

### Résultats

| Scénario | Date | Testeur | Plateforme | Appareil | Résultat | Preuve |
|----------|------|---------|------------|----------|----------|--------|
| 1 — Dictée depuis un rendez-vous | — | — | — | — | non exécuté | — |
| 2 — Capture libre hors ligne | — | — | — | — | non exécuté | — |
| 3 — Correction et extraction | — | — | — | — | non exécuté | — |
| 4 — Finaliser et partager, sans e-mail | — | — | — | — | non exécuté | — |
| 5 — Programmer le suivi | — | — | — | — | non exécuté | — |
| 6 — Finaliser sans envoyer | — | — | — | — | non exécuté | — |
| 7 — Fermeture forcée pendant la préparation | — | — | — | — | non exécuté | — |
| Build TestFlight | — | — | — | — | non exécuté | — |

## Agenda et fiches (lot B)

**Non exécuté.** Le lot B ajoute tout ce qui entoure la séance : l'agenda des
huit prochains jours, la prise et le déplacement d'un rendez-vous, la
création d'un nouveau client sur le terrain, et la fiche d'un animal
consultable avant la séance, y compris sans réseau. Les sept scénarios
ci-dessous vérifient ces parcours sur téléphone réel. Comme pour le lot A,
ils sont écrits pour quelqu'un qui n'a pas suivi le développement : chaque
scénario dit ce qu'il faut préparer, les gestes à faire, et ce qu'on doit
voir à l'écran. Aucune lecture de code n'est nécessaire.

**Démarrer le serveur et l'application :**

```bash
bun --filter @biume/web dev
```

Puis, dans un autre terminal, depuis `apps/mobile` :

```bash
flutter run --dart-define-from-file=dart_define/local.json
```

**Préparatifs communs, à faire une fois avant de commencer :**

- un compte praticien connecté, avec une organisation active ;
- un animal ayant déjà eu au moins une séance dans l'agenda (passée ou à
  venir). Noter la durée de cette séance avant de commencer : c'est la durée
  qui doit réapparaître par défaut au scénario 2 ;
- un rendez-vous déjà programmé **demain à 14:30**, pour n'importe quel
  animal — c'est le créneau qui doit provoquer le conflit au scénario 2 ; s'il
  n'y en a pas, en créer un ;
- un animal ayant au moins **un compte rendu déjà finalisé** dans son
  historique, nécessaire au scénario 5 : sans lui, aucune séance passée n'est
  ouvrable et le scénario ne prouve rien. Si aucune fiche de test ne
  convient, en finaliser un via un parcours de dictée (voir le lot A)
  avant de commencer ;
- avoir ouvert l'application **en ligne** juste avant de commencer, et
  laissé le temps à l'agenda et aux fiches de se charger : le cache utilisé
  hors ligne aux scénarios 1, 5 et 6 ne se remplit qu'à l'ouverture en ligne,
  jamais à la demande.

Le scénario 4 traverse le même parcours de dictée et de compte rendu qu'au
lot A : la même remarque sur les libellés français et lisibles s'applique.

### Scénario 1 — Agenda des huit prochains jours, persistance hors ligne

**Préparatifs :** application pas encore ouverte aujourd'hui, ou en tout cas
pas depuis longtemps ; réseau disponible au départ.

**Étapes :**
1. Ouvrir l'application en ligne, sur l'agenda.
2. Compter les jours affichés et vérifier lequel est en tête.
3. Couper le réseau (mode avion).
4. Fermer complètement l'application, puis la relancer.

**On doit voir :**
- en ligne, huit jours affichés, avec aujourd'hui en tête ;
- hors ligne, après relance, les huit mêmes jours sont toujours affichés —
  pas d'écran vide, pas d'erreur réseau bloquante.

### Scénario 2 — Nouvelle séance : durée par défaut et conflit d'horaire

**Préparatifs :** l'animal et sa dernière durée de séance connue, et le
créneau de demain 14:30 déjà occupé, préparés plus haut.

**Étapes :**
1. Depuis l'agenda, appuyer sur « + » puis « Nouvelle séance ».
2. Choisir l'animal dont on connaît la durée de la dernière séance.
3. Vérifier la durée proposée par défaut, sans y toucher.
4. Choisir demain, 14:30 — le créneau déjà occupé.
5. Créer la séance.

**On doit voir :**
- la durée proposée par défaut correspond à la durée de la dernière séance
  de cet animal ;
- une bannière de conflit apparaît, le créneau étant déjà pris ;
- la séance est créée malgré tout — aucun blocage ;
- l'agenda montre la nouvelle séance à demain 14:30.

### Scénario 3 — Déplacer une séance en conflit

**Préparatifs :** suite immédiate du scénario 2 — la séance créée en conflit
est toujours visible, avec sa bannière.

**Étapes :**
1. Depuis sa carte dans l'agenda, ouvrir le déplacement de la séance.
2. Choisir un autre créneau, libre.
3. Confirmer.

**On doit voir :**
- la séance apparaît au nouveau créneau ;
- la bannière de conflit a disparu.

### Scénario 4 — Nouveau client sans adresse électronique, sur le terrain

**Préparatifs :** aucun animal particulier requis à l'avance — ce scénario
crée le client. Prévoir un nom et des coordonnées fictifs, jamais ceux d'un
client réel.

**Étapes :**
1. Depuis l'agenda, appuyer sur « + » puis « Nouveau client ».
2. Renseigner le client puis son animal, sans saisir d'adresse e-mail.
3. Valider la création.
4. Ouvrir le sélecteur d'animal (par exemple pour une nouvelle séance) et
   vérifier que l'animal créé y figure.
5. Lancer une dictée pour cet animal, la valider, puis suivre le parcours
   jusqu'à la finalisation du compte rendu (comme au lot A).

**On doit voir :**
- au moment de ne pas saisir d'e-mail, une mention signale l'absence
  d'adresse, mais on peut poursuivre sans être bloqué ;
- l'animal créé est immédiatement disponible dans le sélecteur ;
- à la finalisation du compte rendu, le garde-fou e-mail du lot A s'affiche
  (« Ajouter son e-mail » / « Finaliser sans envoyer »). C'est le
  comportement attendu, pas une anomalie : le client vient d'être créé sans
  e-mail, le garde-fou le rappelle à ce moment-là.

### Scénario 5 — Fiche animal depuis l'agenda, consultation hors ligne

**Préparatifs :** l'animal avec un compte rendu déjà finalisé, préparé plus
haut ; un rendez-vous pour cet animal visible dans l'agenda ; application
ouverte en ligne juste avant, pour que la fiche soit préchargée.

**Étapes :**
1. Depuis une carte d'agenda pour cet animal, ouvrir la fiche animal.
2. Appuyer sur « Appeler ».
3. Revenir à la fiche, puis ouvrir le compte rendu passé identifié en
   préparatif.
4. Couper le réseau.
5. Rouvrir ce même compte rendu.

**On doit voir :**
- « Appeler » ouvre l'application téléphone, numéro du propriétaire déjà
  rempli ;
- le compte rendu passé s'ouvre en lecture seule : aucun bouton d'action
  visible ;
- hors ligne, ce même compte rendu s'ouvre encore, avec le même contenu.

### Scénario 6 — Sélecteur de date, chargement hors ligne

**Préparatifs :** application ouverte en ligne juste avant. Aucun
préparatif spécifique pour un jour lointain hors ligne — c'est justement ce
qui doit échouer proprement, pas silencieusement.

**Étapes :**
1. Depuis l'agenda, ouvrir le sélecteur de date.
2. Choisir un jour situé dans un mois.
3. Vérifier que la liste des séances de ce jour se charge.
4. Couper le réseau.
5. Choisir un autre jour, éloigné et non consulté à l'étape 2.

**On doit voir :**
- en ligne, le jour choisi dans un mois affiche sa liste de séances (vide ou
  remplie selon les données réelles) ;
- hors ligne, sur un jour non préchargé, un message clair s'affiche — pas un
  écran vide, pas une erreur technique brute.

### Scénario 7 — Nouvelle séance en mode avion

**Préparatifs :** mode avion activable depuis les réglages du téléphone.

**Étapes :**
1. Activer le mode avion.
2. Depuis l'agenda, appuyer sur « + » puis « Nouvelle séance ».

**On doit voir :**
- un message indique qu'il faut dicter dès maintenant, la création étant
  différée hors ligne ;
- un bouton « Dicter » est proposé.

### Build de distribution (TestFlight)

```bash
cd apps/mobile && flutter build ipa --dart-define=BIUME_API_URL=https://biume.app
```

Cette commande exige un compte développeur Apple configuré sur la machine
qui construit l'app (signature et provisionnement). S'il n'est pas
disponible, le dire clairement dans le résultat ci-dessous plutôt que de
consigner un échec technique — ce n'est pas la même chose. Quand la commande
réussit, l'envoi vers TestFlight se fait à la main via Transporter.

### Résultats

| Scénario | Date | Testeur | Plateforme | Appareil | Résultat | Preuve |
|----------|------|---------|------------|----------|----------|--------|
| 1 — Agenda huit jours, hors ligne | — | — | — | — | non exécuté | — |
| 2 — Nouvelle séance, durée et conflit | — | — | — | — | non exécuté | — |
| 3 — Déplacer une séance en conflit | — | — | — | — | non exécuté | — |
| 4 — Nouveau client sans e-mail | — | — | — | — | non exécuté | — |
| 5 — Fiche animal, hors ligne | — | — | — | — | non exécuté | — |
| 6 — Sélecteur de date, hors ligne | — | — | — | — | non exécuté | — |
| 7 — Nouvelle séance en mode avion | — | — | — | — | non exécuté | — |
| Build TestFlight | — | — | — | — | non exécuté | — |
