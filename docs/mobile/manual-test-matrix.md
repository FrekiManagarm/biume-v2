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
