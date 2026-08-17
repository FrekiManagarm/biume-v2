# Exploitation — capture mobile

Checklists exécutables pour mettre la tranche de capture en service.

Aucun identifiant réel ni URL de production ne figure dans ce document, et
aucun ne doit y être ajouté.

## 1. Bucket R2 privé

- [ ] Créer un bucket dédié à l'audio de capture, séparé de tout autre usage.
- [ ] Vérifier qu'aucun accès public en lecture n'est activé.
- [ ] Vérifier qu'aucun domaine public n'est attaché au bucket.
- [ ] Ne pas activer le listing public des objets.

## 2. Token S3 restreint

- [ ] Créer un token limité **au seul bucket audio**.
- [ ] Permissions : lecture, écriture et suppression d'objets uniquement.
- [ ] Ne pas accorder la création ou la suppression de bucket.
- [ ] Ne pas accorder l'accès aux autres buckets du compte.
- [ ] Stocker le secret dans le gestionnaire de secrets, jamais dans le dépôt.

## 3. CORS du bucket

Le mobile envoie un `PUT` signé directement au bucket. La configuration doit :

- [ ] autoriser la méthode `PUT` ;
- [ ] autoriser les en-têtes `content-type`, `content-length` et
      `x-amz-meta-sha256` ;
- [ ] exposer l'en-tête `ETag` — sans lui le serveur ne peut pas confirmer
      l'objet et chaque envoi est traité comme incomplet ;
- [ ] n'autoriser aucune méthode de lecture (`GET`, `HEAD`) depuis un
      navigateur ;
- [ ] restreindre les origines au schéma de l'application et aux origines de
      développement Expo déclarées, jamais `*`.

## 4. Variables d'environnement

Cinq valeurs typées, validées au démarrage par `packages/env` :

| Variable | Rôle |
|----------|------|
| `R2_ACCOUNT_ID` | Compte Cloudflare hébergeant le bucket |
| `R2_ACCESS_KEY_ID` | Identifiant du token restreint |
| `R2_SECRET_ACCESS_KEY` | Secret du token restreint |
| `R2_AUDIO_BUCKET` | Nom du bucket audio privé |
| `MOBILE_TRUSTED_ORIGINS` | Origines mobiles séparées par des virgules |

- [ ] Renseigner les cinq valeurs dans l'environnement web (local et
      déploiement) — sans elles, toute requête échoue au runtime.
- [ ] Définir `EXPO_PUBLIC_API_URL` par profil EAS : l'API locale en
      développement, l'API déployée en interne et en production.

## 5. Origines Better Auth

`MOBILE_TRUSTED_ORIGINS` est une liste explicite. Les wildcards sont **rejetés
au démarrage** : un wildcard laisserait n'importe quelle origine piloter une
session authentifiée.

- [ ] Production : `biume://`
- [ ] Développement : `biume://` plus les origines Expo réelles de la machine,
      par exemple `exp://<ip-locale>:8081` et `http://localhost:8081`
- [ ] Vérifier qu'aucune origine de développement ne subsiste en production.

## 6. Base de données

- [ ] Appliquer la migration `0004_mobile_audio_capture` **avant** de déployer
      le web ou de distribuer le mobile.

```bash
bun --filter @biume/db db:migrate
```

- [ ] Vérifier la présence de la table `audio_capture`, de son index unique sur
      `object_key` et de ses contraintes `CHECK`.

### Test de persistance contre un vrai PostgreSQL

Ce test est désactivé tant que `MOBILE_CAPTURE_TEST_DATABASE_URL` n'est pas
défini. Il prouve l'idempotence, le conflit d'empreinte, l'isolation entre
organisations, le refus d'une complétion après annulation, et la sélection des
expirations. **Ne jamais le pointer vers une base de production.**

```bash
# 1. base jetable
docker run -d --name biume-capture-test \
  -e POSTGRES_PASSWORD=test -e POSTGRES_DB=biume_test \
  -p 55433:5432 postgres:16

# 2. schéma, dans l'ordre du journal
for f in packages/db/src/migrations/0*.sql; do
  docker exec -i biume-capture-test \
    psql -q -U postgres -d biume_test -v ON_ERROR_STOP=1 < "$f"
done

# 3. le test (les autres variables ne servent qu'à satisfaire packages/env)
DB="postgresql://postgres:test@127.0.0.1:55433/biume_test"
MOBILE_CAPTURE_TEST_DATABASE_URL="$DB" DATABASE_URL="$DB" NODE_ENV=test \
BETTER_AUTH_SECRET=test BETTER_AUTH_URL=http://localhost:3000 \
CORS_ORIGIN=http://localhost:3000 AUTUMN_SECRET_KEY=test OPENAI_API_KEY=test \
RESEND_API_KEY=test APP_URL=http://localhost:3000 ENCRYPTION_KEY=test \
GOOGLE_CLIENT_ID=test GOOGLE_CLIENT_SECRET=test UPLOADTHING_TOKEN=test \
R2_ACCOUNT_ID=test R2_ACCESS_KEY_ID=test R2_SECRET_ACCESS_KEY=test \
R2_AUDIO_BUCKET=test \
  bun --filter @biume/web test -- src/server/mobile/capture.persistence.postgres.test.ts

# 4. nettoyage
docker rm -f biume-capture-test
```

- [x] Exécuté le 17 août 2026 : 6 tests passés contre PostgreSQL 16.

## 7. Purge à expiration

- [ ] Déployer les tâches Trigger.
- [ ] Vérifier que `mobile-capture-purge` est planifiée au moins toutes les
      heures.
- [ ] Après un cycle, vérifier sur une capture de test qu'elle porte un
      `purged_at`, que son `object_key` est neutralisé en `purged:<id>`, et
      qu'aucun objet ne subsiste dans le bucket.

## 8. Comptes de distribution

- [ ] Ouvrir le compte Apple Developer.
- [ ] Ouvrir le compte Google Play Console.
- [ ] Fixer les identifiants d'application définitifs (`com.biume.mobile`).
- [ ] Déclarer le schéma de deep link `biume` sur les deux plateformes.

La vérification locale sur appareil ne nécessite aucun compte store. La
distribution iOS externe attend l'inscription Apple Developer.

## 9. Publication

- [ ] Android interne : build EAS profil `internal`, APK, distribution interne.
- [ ] iOS : build EAS profil `production`, envoi vers TestFlight.
- [ ] Android : envoi vers Google Play Internal Testing.
- [ ] Enregistrer les deux appareils pilotes.
- [ ] Compléter `docs/mobile/manual-test-matrix.md` avant tout pilote externe.

## 10. Incidents

**Un envoi reste bloqué**
- [ ] Vérifier l'état local de la capture (`À envoyer`, `Envoi en cours`,
      `Action requise`).
- [ ] Vérifier le statut serveur : une ligne restée `uploading` signale un
      `PUT` interrompu ; le prochain passage au premier plan la reprend.
- [ ] Vérifier que le bucket accepte toujours les `PUT` signés.

**Le taux de reprise augmente**
- [ ] Vérifier la disponibilité de R2 et les limites de débit.
- [ ] Vérifier que l'horloge serveur n'a pas dérivé : une URL signée dure dix
      minutes.
- [ ] Vérifier la répartition des codes d'erreur normalisés — un pic de
      `object_incomplete` pointe vers le CORS ou l'exposition de l'`ETag`.

**La purge prend du retard**
- [ ] Vérifier l'exécution de la tâche Trigger.
- [ ] Compter les lignes avec `expires_at` dépassé et `purged_at` nul.
- [ ] Une exécution est bornée à 50 lots de 100 ; un retard important demande
      plusieurs cycles.

**Récupération locale**
- [ ] Une capture en `Action requise` avec `local_file_missing` ne peut pas
      être réessayée : seul un nouvel enregistrement la remplace.
- [ ] Une session expirée conserve le fichier chiffré ; la reconnexion suffit.

## 11. Confidentialité des journaux

À vérifier avant toute mise en service :

- [ ] Aucun nom, e-mail ou identifiant de propriétaire.
- [ ] Aucun nom d'animal ni note de rendez-vous.
- [ ] Aucune URL signée, aucun en-tête d'autorisation, aucun cookie.
- [ ] Aucun octet audio, aucune transcription.
- [ ] La télémétrie ne contient que : identifiant technique de capture, source,
      plateforme, version applicative, durée, taille, transitions d'état et
      codes d'erreur normalisés.

Le contrat d'événements rejette toute propriété hors de cette liste, et le
champ de version est contraint à un triplet numérique pour qu'il ne devienne
pas un canal de texte libre.
