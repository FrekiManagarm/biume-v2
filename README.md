# Biume

> Dictez votre séance. Biume prépare le compte rendu et le suivi. Vous validez chaque étape.

Biume aide les ostéopathes animaliers indépendants à transformer une courte dictée de séance en un compte rendu complet, prêt à relire en quelques minutes. Le praticien valide chaque étape, partage le rapport et programme automatiquement le suivi du propriétaire.

Ce n'est **pas** un logiciel de gestion généraliste. L'agenda, les dossiers propriétaires et animaux servent le parcours du compte rendu — ils ne constituent pas la catégorie du produit. La proposition complète est dans [`PRODUCT.md`](./PRODUCT.md), qui fait autorité sur toute décision produit.

---

## Le parcours signature

1. Le praticien ouvre un rendez-vous du jour ou lance une capture libre.
2. Il dicte un résumé court de la séance — **sans réseau si nécessaire**.
3. La dictée est conservée chiffrée sur l'appareil et mise en file de synchronisation.
4. Le serveur produit une transcription fidèle que le praticien peut corriger.
5. L'extraction remplit les sections du rapport **sans jamais inventer** ce qui manque.
6. Chaque proposition reste traçable jusqu'au passage de transcription qui la justifie.
7. Le praticien confirme, corrige ou marque les sections sans objet.
8. Il partage le rapport, et programme un questionnaire de suivi.
9. Biume l'envoie à l'échéance et ne signale que les réponses qui demandent une action.

Deux principes gouvernent le code : **Biume prépare, le praticien décide**, et **aucun travail humain n'est écrasé sans qu'il l'ait demandé**.

---

## Structure

```
apps/
  web/         Application produit — TanStack Start, React, Tailwind v4
  marketing/   Site vitrine — Next.js
  mobile/      Compagnon de terrain — Flutter, clean architecture
packages/
  contracts/   Schémas Zod partagés — source de vérité des contrats
  db/          Schéma Drizzle et migrations
  auth/        Better Auth : organisations, rôles, jeton porteur
  env/         Variables d'environnement typées et validées
  ui/          Composants partagés et jetons de design
  transactional/  Courriels React Email
  config/      Configuration TypeScript partagée
docs/superpowers/
  specs/       Documents de conception
  plans/       Plans d'implémentation
```

### Deux surfaces d'API, deux natures

L'application web parle à son serveur par **server functions TanStack** — du RPC couplé au client React, inconsommable depuis Dart.

Le mobile a donc sa propre surface : **`/api/mobile/v1`**, une application Hono décrite par [`apps/web/openapi.json`](./apps/web/openapi.json). Ce fichier est le contrat que le client Flutter consomme, et un test échoue si le code s'en écarte sans le régénérer.

Une troisième surface, **`/api/owner/v1`**, sert l'espace propriétaire. C'est la seule partie non authentifiée du produit, et elle mène à des données de santé : chaque décision y est prise pour un attaquant.

### Où vivent les sources de vérité

| Sujet | Fait autorité |
|---|---|
| Décisions produit | `PRODUCT.md` |
| Schémas de requête et de réponse | `packages/contracts` |
| Contrat consommé par le mobile | `apps/web/openapi.json` (généré) |
| Couleurs et rayons | `packages/ui/src/styles/product.css` |
| Règles de capture et de synchronisation | `docs/superpowers/specs/2026-08-21-mobile-flutter-rewrite-design.md`, section 8 |

Chacune est protégée par un test qui échoue en cas de dérive. La palette existe en deux exemplaires — `product.css` et `apps/mobile/lib/config/app_palette.dart` — et le contrat aussi : schémas Zod côté serveur, modèles Dart écrits à la main côté mobile. Rien dans le code ne relie ces copies ; seule la machine peut voir qu'elles divergent.

---

## Prérequis

| | Version | Pourquoi cette version |
|---|---|---|
| [Bun](https://bun.sh) | **1.3.11** | Épinglée par `packageManager`. Une version antérieure réécrit `bun.lock` dans un format que la CI refuse. |
| [Flutter](https://flutter.dev) | 3.47+ (stable) | Uniquement pour `apps/mobile`. |
| PostgreSQL | — | Une base [Neon](https://neon.new) suffit. |

Vérifier :

```bash
bun --version      # doit afficher 1.3.11
flutter --version
```

---

## Démarrage

```bash
bun install
cp apps/web/.env.example apps/web/.env
```

Renseigner `apps/web/.env`. **Dix-neuf variables sont strictement requises** — dix-sept côté serveur, deux côté client. `packages/env` les valide au chargement du module, et une seule manquante fait échouer le démarrage avec « Invalid environment variables ». Seules `MOBILE_TRUSTED_ORIGINS` (valeur par défaut) et `VITE_POSTHOG_FEEDBACK_SURVEY_ID` (facultative) peuvent rester vides.

Puis appliquer les migrations :

```bash
bun run db:migrate
```

> **Trois migrations attendent d'être appliquées** : `0006` (transcription), `0007` (propositions d'extraction) et `0008` (accès propriétaire et suivi). Le code les suppose présentes ; rien ne fonctionne avant.

Lancer :

```bash
bun run dev:web         # produit    → http://localhost:3001
bun run dev:marketing   # vitrine    → http://localhost:3000
bun run dev:mobile      # Flutter
```

Pour l'aperçu des courriels : `bun --filter @biume/emails dev` → `http://localhost:3002`.

Le mobile a besoin de savoir où joindre le serveur :

```bash
cd apps/mobile
flutter run --dart-define=BIUME_API_URL=http://localhost:3001
```

---

## Commandes

### Vérification

```bash
bun run check-types                       # types de tous les paquets JS
bun --filter @biume/web test              # tests du web
bun --filter @biume/contracts test        # tests des contrats
bun --filter @biume/auth test             # tests d'authentification
bun run test:mobile                       # flutter test
bun --filter @biume/mobile check-types    # flutter analyze
```

L'intégration continue lance exactement ces commandes sur chaque pull request, en deux jobs : l'un pour les paquets JS, l'autre pour Flutter — qui a sa propre chaîne d'outils.

### Base de données

```bash
bun run db:generate   # produire une migration depuis le schéma
bun run db:migrate    # appliquer
bun run db:studio     # explorer
```

**Toujours inspecter le SQL généré avant de l'appliquer.** Une migration doit créer ; si elle supprime ou modifie une table existante, c'est un signal d'arrêt. Cette relecture a déjà attrapé une contrainte `CHECK` sortie avec un paramètre lié (`<= $1`) au lieu de sa valeur, qui aurait échoué à l'application.

### Contrat mobile

```bash
bun --filter @biume/web emit-openapi   # régénérer openapi.json
```

À faire après **tout** ajout ou modification d'endpoint mobile, sinon la CI échoue.

### Compatibilité du format de capture

```bash
bun run apps/web/scripts/verify-envelope.ts
```

Vérifie que l'enveloppe chiffrée produite par le code Dart est déchiffrable par celui du serveur. Un aller-retour dans un seul langage ne prouve rien : il passerait aussi bien avec le tag GCM placé avant le chiffré, et le serveur ne saurait alors jamais relire une dictée.

---

## Conventions

- **Bun partout.** Pas de `npm`, `yarn` ni `pnpm`, et aucun autre fichier de verrouillage.
- **Français** dans l'interface et les messages. Vocabulaire métier, jamais technique : les utilisateurs sont des ostéopathes animaliers non-techniciens. On dit « entreprise », pas « organisation » ; « À vérifier », pas `proposed`.
- **Le mobile valide, il n'édite pas.** La seule saisie de texte libre de l'application mobile est la correction de transcription — le praticien corrige la source, pas le dérivé.
- **Rien de sensible dans les journaux.** Ni URL signée, ni nom de client, ni contenu de note, ni audio ne doit atteindre un journal, une exception ou un événement d'analytique. La télémétrie filtre par liste blanche : un champ oublié ne part pas.
- **Le locataire vient de la session.** Un `organizationId` envoyé par un client est une charge rejetée, jamais un champ ignoré. Toute lecture filtre dessus en plus de l'identifiant demandé.

Les conventions détaillées pour les agents sont dans [`AGENTS.md`](./AGENTS.md).

---

## État actuel

Ce que le dépôt contient déjà :

- dossiers propriétaires et animaux, agenda, rapport structuré, génération PDF, partage par courriel ;
- surface API mobile complète — 18 endpoints décrits par OpenAPI, authentification par jeton porteur ;
- pipeline de transcription et d'extraction avec traçabilité vers la dictée ;
- accès propriétaire par lien et code à usage unique, questionnaire de suivi, alertes sur règles explicites ;
- application Flutter : socle, thème, chiffrement des captures, base locale, authentification, agenda hors ligne, validation de compte rendu.

Ce qui n'a **jamais été exercé en conditions réelles** :

- les trois migrations en attente ;
- l'authentification par jeton porteur contre un serveur qui tourne ;
- les appels aux modèles de transcription et d'extraction ;
- l'envoi des courriels de suivi ;
- l'enregistrement audio, la synchronisation en tâche de fond et le parcours complet sur un téléphone.

Deux mesures manquent, et ce sont celles qui décident de la valeur du produit : la **qualité de transcription** sur du vocabulaire ostéopathique français, et le **nombre de propositions ancrées qui disent plus que la dictée**. Ces dernières passent tous les garde-fous automatiques et ne sont arrêtées que par le praticien.

---

## Documentation

- [`PRODUCT.md`](./PRODUCT.md) — proposition produit, périmètre du MVP, métriques
- [`AGENTS.md`](./AGENTS.md) — conventions de développement
- [`docs/superpowers/specs/`](./docs/superpowers/specs/) — documents de conception
- [`docs/superpowers/plans/`](./docs/superpowers/plans/) — plans d'implémentation
