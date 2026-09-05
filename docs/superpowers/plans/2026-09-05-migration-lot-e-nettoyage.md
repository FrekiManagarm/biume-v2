# Migration `apps/web` vers Next.js — Lot E : le nettoyage

> **Pour les agents :** SOUS-COMPÉTENCE REQUISE : `superpowers:subagent-driven-development`.

**Objectif :** retirer TanStack Start du dépôt. À l'issue de ce lot, plus une ligne, plus une dépendance, plus une instruction ne parle du framework qu'on quitte.

**Spec :** `docs/superpowers/specs/2026-09-05-migration-web-nextjs-design.md` (§ 14)

**Lots précédents :** A, B, C fusionnés dans `main` ; D achevé (les huit pages sont servies).

## Contraintes globales

- **Aucune URL ne change**, aucune page ne cesse de fonctionner.
- **Ligne de base : `686 passed | 12 skipped`.** Ce compte peut **baisser** dans ce lot — c'est le seul où c'est permis, et seulement parce que des tests couvrent du code supprimé. Toute baisse doit être **justifiée test par test** dans le rapport.
- **`check-types` en code 0** à la fin de chaque tâche, **hors erreurs préexistantes** dans `components/dashboard/pages/reports-module/` : une session parallèle y refond le PDF. Ne touche à rien sous ce dossier, et ne compte pas ses erreurs contre toi.
- **Bun uniquement.** `bun remove --cwd=apps/web <paquet>`.
- Le travail se fait **directement sur `main`**, sur instruction de l'humain.

## L'inventaire à supprimer

Établi par le § 14 de la spec et vérifié au lot D.

**Fichiers**
- `apps/web/routes/` — toute l'arborescence TanStack
- `apps/web/router.tsx`, `apps/web/routeTree.gen.ts`
- `apps/web/polyfills/`
- `apps/web/integrations/tanstack-query/` — plus aucun consommateur une fois `routes/` parti
- `apps/web/legacy-vite-modules.d.ts` — la déclaration `*.css?url` ne servait qu'au shell TanStack

**Dépendances de `apps/web`**
- `@tanstack/react-start`, `@tanstack/react-router`, `@tanstack/react-router-ssr-query`, `@tanstack/router-plugin`, `@tanstack/router-cli`, `@tanstack/react-router-devtools`, `@tanstack/devtools-vite`, `@tanstack/react-devtools`, `@tanstack/devtools-event-client`, `@tanstack/eslint-config`
- Les sept paquets morts : `@tanstack/ai`, `ai-anthropic`, `ai-client`, `ai-gemini`, `ai-ollama`, `ai-openai`, `ai-react` — **déclarés et jamais importés** depuis le début
- `vite`, `vitest` **reste** (il fait tourner les tests)

**Conservés, à ne pas toucher :** `@tanstack/react-query`, `@tanstack/react-form`, `@tanstack/react-table`, `@tanstack/react-store`, `@tanstack/match-sorter-utils` — tous agnostiques du framework.

**Configuration**
- `turbo.json` : `NITRO_PRESET`, `VITE_POSTHOG_HOST`, `VITE_POSTHOG_KEY` — inertes depuis le lot A
- `apps/web/package.json` : toute version `latest` restante

**Documentation**
- `AGENTS.md` — il décrit encore TanStack Start comme le framework du produit, et le § « User Preferences » le donne comme préférence du propriétaire
- `README.md:31`

---

### Tâche 1 : supprimer le code

**L'ordre compte.** Retire les fichiers d'abord, les dépendances ensuite : `check-types` te dira exactement ce qui dépendait encore de quoi.

- [ ] **Étape 1 : mesurer avant**

```bash
bun --filter @biume/web test 2>&1 | grep -E "Test Files|Tests  "
find apps/web/routes -type f | wc -l
```

Note ces chiffres : ils justifient la baisse du compte de tests.

- [ ] **Étape 2 : supprimer les fichiers**

`git rm -r` sur l'inventaire ci-dessus. **Un dossier à la fois, `check-types` après chacun** : les erreurs pointent alors ce que tu viens de retirer.

Si un fichier d'`app/`, `components/`, `lib/`, `server/` ou `hooks/` dépend encore de ce que tu supprimes, **arrête-toi et remonte-le-moi** — ce serait une dépendance que le lot D aurait dû couper.

- [ ] **Étape 3 : les tests qui disparaissent**

Certains tests couvrent le code supprimé. Pour **chacun**, dis dans ton rapport : son nom, ce qu'il couvrait, et pourquoi sa disparition est sans perte. Un test qui couvrait un comportement encore vivant doit être **porté**, pas supprimé.

- [ ] **Étape 4 : retirer les dépendances**

```bash
bun remove --cwd=apps/web <paquets>
```

Puis `bun install` et vérifie que `bun.lock` est cohérent.

- [ ] **Étape 5 : vérifier**

`check-types` en code 0 (hors `reports-module`), les tests verts, `bun --filter @biume/web build` en code 0.

Et **au navigateur** : les huit pages répondent toujours. C'est la vérification qui compte — supprimer du code mort ne doit rien changer.

- [ ] **Étape 6 : commiter**

---

### Tâche 2 : la configuration et la documentation

- [ ] **Étape 1 : `turbo.json`**

Retire `NITRO_PRESET`, `VITE_POSTHOG_HOST`, `VITE_POSTHOG_KEY`. Vérifie qu'aucun fichier ne les lit.

- [ ] **Étape 2 : les versions `latest`**

`apps/web/package.json` ne doit plus en contenir. Fige chacune sur la version réellement installée, lue dans `bun.lock`.

- [ ] **Étape 3 : réécrire `AGENTS.md`**

C'est le livrable le plus durable du lot : **ce fichier est lu par tous les agents qui travailleront sur ce dépôt.** Il dit aujourd'hui que le produit tourne sur TanStack Start, que les routes vont dans `apps/web/src/routes`, et que le propriétaire préfère TanStack pour le frontend. Les trois sont faux.

Il doit dire, à la place, ce que quatre lots ont établi :
- `apps/web` est une application Next 16 en App Router ; les pages vont dans `apps/web/app/`
- le motif à trois fichiers par ressource : `*.function.ts` (pur, `server-only`), `*.mutations.ts` (`"use server"`), `*.action.ts` (contrat public, imports en position de type)
- une lecture serveur importe la fonction, jamais l'enveloppe — celle-ci fait un `fetch` sur URL relative
- les mutations renvoient `{ success, error }` et ne lèvent pas ; **et un échec de transport rejette quand même**, donc toute mutation appelée sans `await` a besoin d'une garde
- chaque page du dashboard appelle `requireActiveBilling()` — un layout Next n'est pas ré-exécuté en navigation cliente
- `cache()` de React ne mémoïse que dans un Server Component, et compare les objets **par référence**

Écris-le pour quelqu'un qui arrive, pas comme un журнал de migration.

- [ ] **Étape 4 : `README.md`**

- [ ] **Étape 5 : vérifier et commiter**

---

### Tâche 3 : solder les constats différés

Les revues des quatre lots ont laissé des constats mineurs, tous consignés. Traite-les ou justifie leur report.

- Les ~100 constats ESLint sur du code jamais linté : `routes/` en portait 52, qui disparaissent avec lui. **Remesure**, et traite ce qui reste si c'est raisonnable. Sinon, dis le compte exact et pourquoi.
- `components.json` : le champ `rsc` est à `false` alors que l'application est en RSC depuis le lot C.
- Deux formes de succès coexistent dans les Server Actions : `{ success: true, data }` et `{ success: true, ...champs }` (`report-reminder.action.ts`). Converge.
- Le mock mort de `server-only` dans deux fichiers de test, s'il n'est plus nécessaire.
- `app/api/internal/dashboard/overview/route.ts` : vérifie s'il a encore un consommateur maintenant que la page d'accueil lit en direct. S'il n'en a plus, décide de son sort.

- [ ] **Étape 1 : recenser et trier**
- [ ] **Étape 2 : traiter**
- [ ] **Étape 3 : vérifier et commiter**

---

## Fin du lot E

Plus rien dans le dépôt ne parle de TanStack Start. La migration est terminée.
