# Matrice de tests manuels — capture mobile

**Statut : non exécutée.** Le protocole ci-dessous est défini mais aucun
scénario n'a encore été joué sur simulateur ni sur appareil. Les tests
automatisés couvrent l'orchestration, la crypto, la persistance et les écrans ;
ils ne couvrent pas les permissions natives, le comportement réel du
microphone, ni les interruptions système.

Ce document doit être rempli avant tout pilote externe.

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

## Résultats

| Date | Plateforme | Version OS | Appareil | Build | Scénarios | Résultat | Preuve |
|------|------------|------------|----------|-------|-----------|----------|--------|
| — | iOS | — | — | — | — | non exécuté | — |
| — | Android | — | — | — | — | non exécuté | — |
