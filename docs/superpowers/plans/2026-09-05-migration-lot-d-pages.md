# Migration `apps/web` vers Next.js — Lot D : les pages du dashboard

> **Pour les agents :** SOUS-COMPÉTENCE REQUISE : utiliser `superpowers:subagent-driven-development`. Les étapes utilisent la syntaxe case à cocher (`- [ ]`).

**Objectif :** servir les huit pages du dashboard. À l'issue de ce lot, l'application est complète — et `@react-pdf/renderer` a quitté le bundle du navigateur.

**Architecture :** chaque page suit le gabarit établi au lot C — `page.tsx` est un Server Component qui appelle `requireActiveBilling()`, lit ses `searchParams` et sa donnée, puis rend une vue cliente. Les corps interactifs sont **extraits**, pas réécrits.

**Pile technique :** Next 16.2.9, React 19.2.7, TanStack Query (conservé), `@react-pdf/renderer` côté serveur uniquement, Vitest 4, Bun 1.3.11.

**Spec :** `docs/superpowers/specs/2026-09-05-migration-web-nextjs-design.md` (tranches 5 et 6 du § 10, et le § 9 pour le PDF)

**Lots précédents :** A `9f9fe778..52f2f9ab`, B `756e85e7..e0abea0e`, C `622f2813..de6812f0`.

## Contraintes globales

- **Aucune URL ne change.** Le § 7 de la spec fait foi.
- **`/api/mobile/v1` et `/api/owner/v1` ne bougent pas.**
- **Aucun changement visuel.** Ce lot déplace du câblage. Une différence d'apparence est un bug de migration.
- **Ligne de base : `662 passed | 12 skipped (674)`.** Ce compte ne baisse jamais.
- **`check-types` en code 0** à la fin de chaque tâche. `routes/` compile jusqu'au lot E.
- **Bun uniquement.** `bun --filter @biume/web <script>` ; `bun add --cwd=apps/web` pour les dépendances.
- `lint` sort en code non nul (constats préexistants). Ce n'est pas un point de contrôle.

## Les huit règles héritées, qui lient ce lot

1. **Chaque page appelle `requireActiveBilling()`** en première instruction. Un layout Next n'est pas ré-exécuté en navigation cliente ; les pages, si. **Un test échoue si une page naît sans cette garde** (`lib/dashboard-billing-guard-pages.test.ts`) — il est votre filet, pas votre ennemi.
2. **Une lecture serveur importe la fonction depuis `#/functions/*` ou `#/server/*`**, jamais une enveloppe de `lib/api/actions/` : celle-ci fait un `fetch` sur URL relative et lèverait dans un Server Component.
3. **Dans un `*.action.ts`, tout import vers `*.function.ts` est en position de type.** Ces fichiers sont consommés par des composants clients ; un import de valeur ferait entrer Drizzle dans le bundle du navigateur, sans qu'aucun test ne le signale.
4. **Une page ne peut pas à la fois exporter `metadata` et porter `"use client"`.** D'où le gabarit `page.tsx` / `*-view.tsx`.
5. **`toActionResult` ne dispense pas d'une garde de transport.** Il capture les erreurs applicatives ; un échec réseau **rejette toujours**. Tout appel de mutation dans un handler non-`await`é doit avoir son `try/catch`, sans quoi le rejet devient une *unhandled rejection* silencieuse et l'interface reste bloquée sur un état de chargement.
6. **`z.input`, pas `z.infer`, pour tout schéma portant un `.default(...)`.**
7. **Une construction peut changer de nature en traversant les frameworks** — inerte qui devient porteuse, porteuse qui devient inerte, ou attachée à une route qui devient attachée à un sous-arbre. Le § 13 de la spec porte les instances connues.
8. **Le corps de chaque composant est recopié tel quel.** Aucune reformulation, aucun renommage, aucune amélioration au passage : dans un diff de 4 000 lignes, une amélioration est indistinguable d'une erreur.

## Les correspondances d'API, à appliquer mécaniquement

Sept modules sont encore couplés à TanStack Router et planteront dès qu'ils seront montés — ils lisent un contexte `<RouterProvider>` qui n'existe pas.

| TanStack | Next |
| --- | --- |
| `useLocation()` | `usePathname()` de `next/navigation` |
| `useNavigate()` ; `navigate({ to })` | `useRouter()` ; `router.push(...)` |
| `<Link to="/x">` | `<Link href="/x">` de `next/link` |
| `useParams()` | `useParams()` de `next/navigation` — **change de forme**, rend `Record<string, string \| string[]>` |
| `Route.useSearch()` | `useSearchParams()` côté client, `searchParams` côté page |
| `validateSearch` | le schéma Zod appliqué à `searchParams` dans la page |
| `head: () => ({ meta })` | `export const metadata` |

**`useParams` est la seule qui change de forme.** Une conversion négligente y produit un `undefined` silencieux. Vérifiez ce que le code fait de la valeur avant de caster — un segment dynamique simple ne peut pas rendre de tableau, un catch-all si.

**`useSearchParams()` impose un `<Suspense>`** autour du composant qui l'appelle, sans quoi `next build` échoue.

## L'état de départ

| Page | URL | Lignes | Forme |
| --- | --- | --- | --- |
| `agenda.tsx` | `/dashboard/agenda` | 37 | délègue |
| `reports.tsx` | `/dashboard/reports` | 77 | délègue |
| `reports_.$id.tsx` | `/dashboard/reports/:id` | 45 | délègue |
| `assistant.tsx` | `/dashboard/assistant` | 22 | délègue |
| `dashboard_.reports_.$id_.edit.tsx` | `/dashboard/reports/:id/edit` | 109 | délègue, **hors du shell** |
| `clients.tsx` | `/dashboard/clients` | 1 156 | corps inline |
| `patients.tsx` | `/dashboard/patients` | 1 248 | corps inline |
| `settings.tsx` | `/dashboard/settings` | 1 192 | corps inline |

Quatre déclarent un `validateSearch` : clients, patients, reports, settings.

## Structure des fichiers

| Fichier | Responsabilité | Tâche |
| --- | --- | --- |
| `app/dashboard/{loading,error}.tsx` | **recadrés** : ils gouvernent tout le sous-arbre | 1 |
| `app/dashboard/{agenda,reports,assistant}/page.tsx` | les trois pages fines | 2 |
| `app/dashboard/{clients,patients}/page.tsx` + vues | les deux grosses pages CRUD | 3 |
| `app/dashboard/settings/page.tsx` + vue | réglages, plus le repointage vers les mutations | 4 |
| `app/dashboard/reports/[id]/page.tsx` | détail d'un compte rendu | 5 |
| `app/(fullscreen)/dashboard/reports/[id]/edit/page.tsx` | édition, **hors du shell dashboard** | 5 |
| `app/api/reports/[id]/pdf/route.ts` | **le PDF serveur** | 6 |

---

### Tâche 1 : recadrer ce qui a changé de portée

**Pourquoi d'abord.** Les sept pages suivantes hériteront de ces fichiers. Les corriger après, c'est les corriger sept fois.

TanStack laissait un fichier posséder une URL **et** ses enfants. Next scinde en `layout` (sous-arbre) et `page` (feuille). Trois artefacts du lot C sont du mauvais côté :

| Artefact | Portée d'origine | Portée actuelle | Conséquence |
| --- | --- | --- | --- |
| `app/dashboard/loading.tsx` | la page d'accueil seule | tout `/dashboard/*` | les sept pages afficheront le squelette de la vue d'ensemble |
| `app/dashboard/error.tsx` | la page d'accueil seule | tout `/dashboard/*` | **« Impossible de charger la vue d'ensemble »** sur une erreur de la page clients |
| `wideContent` | déclaré par `agenda.tsx` et `reports.tsx` | supprimé, largeur inconditionnelle | ces deux pages seront bornées à `max-w-7xl` — **un changement visuel**, que le § 11.3 interdit |

**Fichiers :**
- Modifier : `app/dashboard/error.tsx` — message générique, plus « vue d'ensemble »
- Créer : `app/dashboard/(overview)/…` **ou** déplacer les états spécifiques au plus près de la page d'accueil — à vous de choisir la forme, le brief exige seulement que le message d'erreur d'une page ne mente pas
- Rétablir le mécanisme de largeur, sous une forme adaptée à Next

**Sur la largeur.** Sous TanStack, la page déclarait `staticData: { wideContent: true }` et le shell le lisait par `useMatches()`. Next n'a pas d'équivalent. La forme naturelle est que **la page contrôle sa propre largeur** : le layout cesse d'imposer `max-w-7xl`, et chaque page l'applique — ou pas. Vérifiez alors que les pages déjà servies ne changent pas d'apparence.

**C'est un compromis d'architecture : si vous voyez mieux, remontez-le.**

- [ ] **Étape 1 : recenser avant de coder**

Pour chaque mécanisme de `routes/dashboard.tsx` et `routes/dashboard/index.tsx`, écrivez dans votre rapport : sa portée d'origine, sa portée d'arrivée, et si elles diffèrent. Les trois du tableau sont connus ; **cherchez-en d'autres** — `head()`, `pendingComponent`, `errorComponent`, `staticData`, et tout ce que le fichier parent portait pour ses enfants.

C'est le livrable le plus utile de cette tâche : il vaut mieux qu'une correction.

- [ ] **Étape 2 : corriger le message d'erreur**

`app/dashboard/error.tsx` doit dire quelque chose de vrai pour n'importe quelle page du sous-arbre. Si la page d'accueil mérite un message spécifique, donnez-lui son propre `error.tsx` au bon niveau.

- [ ] **Étape 3 : rétablir la largeur**

Puis vérifiez au navigateur que `/dashboard` n'a pas changé d'apparence.

- [ ] **Étape 4 : vérifier et commiter**

```bash
bun --filter @biume/web check-types
bun --filter @biume/web test 2>&1 | tail -5
```

Attendu : `check-types` en code 0, au moins `662 passed | 12 skipped`.

---

### Tâche 2 : les trois pages qui délèguent

`agenda` (37 lignes), `reports` (77) et `assistant` (22) sont fines : elles montent un composant. Le travail est dans les composants, dont trois sont encore couplés à TanStack Router.

**Fichiers :**
- Créer : `app/dashboard/{agenda,reports,assistant}/page.tsx` et leurs vues si nécessaire
- Modifier : `components/dashboard/agenda/agenda-page.tsx`, `components/dashboard/pages/reports/components/reports-empty.tsx` — conversion mécanique
- Modifier : `hooks/useAppContext.ts` — il importe `useLocation`/`useParams` de TanStack

**`reports` déclare un `validateSearch`** : son schéma s'applique à `searchParams` dans la page.

**`assistant` est la page dont le layout gèle le drapeau** — le lot C a corrigé `isAssistantRoute` pour qu'il soit calculé côté client. Vérifiez au navigateur que la mise en page plein écran s'applique bien, en arrivant par un clic depuis la sidebar **et** par un chargement direct.

- [ ] **Étape 1 : convertir les trois modules couplés**

Correspondance mécanique, tableau en tête de plan. Aucune classe, aucun libellé, aucune structure JSX ne bouge.

- [ ] **Étape 2 : écrire les trois pages**

Gabarit du lot C : `requireActiveBilling()` en première instruction, `metadata` portée depuis le `head()`, puis la vue.

- [ ] **Étape 3 : vérifier au navigateur**

Les trois URL, et pour `assistant` les deux chemins d'arrivée.

- [ ] **Étape 4 : vérifier et commiter**

---

### Tâche 3 : clients et patients

Deux pages de 1 156 et 1 248 lignes, de même forme : liste, recherche, filtres, pagination, et des dialogues de création, édition, suppression. Elles déclarent toutes deux un `validateSearch`.

**Fichiers :**
- Créer : `app/dashboard/{clients,patients}/page.tsx` et `{clients,patients}-view.tsx`

**Le motif hybride s'exerce ici pour la première fois sur une liste.** La page lit la première page de données côté serveur et la passe en `initialData` à la vue, qui garde TanStack Query pour la recherche et la pagination. `lib/api/queries/{clients,patients}.query.ts` **ne change pas**.

**Trois points de vigilance :**

- **Les mutations sont appelées depuis des handlers non-`await`és.** Règle 5 : chacune doit avoir sa garde de transport, sans quoi un échec réseau laisse un dialogue ouvert sur un spinner.
- **`useSearchParams()` impose un `<Suspense>`.** Structurez la page avec la frontière dès l'écriture.
- **Les dates arrivent en `Date` sur le chemin serveur et sont revivifiées sur le chemin client.** Les deux doivent produire la même forme.

- [ ] **Étape 1 : écrire le test qui échoue**

Un test de page par ressource, vérifiant que `requireActiveBilling` est appelée et que la donnée initiale est passée à la vue. Le test de garde global (`lib/dashboard-billing-guard-pages.test.ts`) couvre déjà la présence de l'appel ; celui-ci couvre le câblage.

- [ ] **Étape 2 : extraire les corps interactifs**

Vers `{clients,patients}-view.tsx`. **Extraire, pas réécrire.**

- [ ] **Étape 3 : écrire les pages**

- [ ] **Étape 4 : vérifier au navigateur**

Recherche, filtres, pagination, retour arrière du navigateur, et une création, une édition, une suppression sur chaque ressource.

- [ ] **Étape 5 : vérifier et commiter**

---

### Tâche 4 : les réglages

1 192 lignes, un `validateSearch`, et **la seule page dont le lot C a explicitement préparé la conversion**.

**Fichiers :**
- Créer : `app/dashboard/settings/page.tsx` et `settings-view.tsx`
- Modifier : les imports repointés (voir ci-dessous)

**L'obligation que le lot C a consignée.** `routes/dashboard/settings.tsx:34,38,39` importe `getSession`, `updateOrganization` et `updateUserNotifications` depuis `#/functions/*` — les fonctions **brutes**. La vue cliente **ne pourra pas** : ces fichiers portent `import "server-only"` et tirent Drizzle.

- `getSession` est une lecture : elle remonte dans `page.tsx` (Server Component), qui passe la session à la vue en props.
- `updateOrganization` et `updateUserNotifications` sont des mutations : la vue les importe depuis `organization.mutations` et `user.mutations`.
- **Et c'est à ce moment-là que le déballage devient obligatoire** : ces modules passent par `toActionResult`, donc ils résolvent avec `{ success, error }` au lieu de lever. Les deux appels sont aujourd'hui suivis d'un `toast.success` — **sans déballage, un échec afficherait « Entreprise mise à jour. »**

**C'est le site d'appel le plus visible du chantier.** Nommez-le dans votre rapport.

**Attention aussi à la garde de facturation.** `/dashboard/settings` est la **seule page exemptée** : c'est là qu'un praticien sans abonnement est redirigé. `requireActiveBilling()` lit l'en-tête et gère l'exemption elle-même — appelez-la comme les autres, ne l'omettez pas. Et **vérifiez au navigateur qu'un compte sans abonnement peut ouvrir cette page**, sinon la redirection boucle.

- [ ] **Étape 1 : écrire le test qui échoue**
- [ ] **Étape 2 : remonter la lecture, repointer les mutations, déballer**
- [ ] **Étape 3 : extraire la vue et écrire la page**
- [ ] **Étape 4 : vérifier au navigateur, dont le cas sans abonnement**
- [ ] **Étape 5 : vérifier et commiter**

---

### Tâche 5 : les comptes rendus, liste et édition

Trois URL : le détail (`reports_.$id.tsx`, 45 lignes), l'édition (`dashboard_.reports_.$id_.edit.tsx`, 109 lignes), et les composants lourds derrière.

**Fichiers :**
- Créer : `app/dashboard/reports/[id]/page.tsx`
- Créer : `app/(fullscreen)/dashboard/reports/[id]/edit/page.tsx`
- Modifier : `reports-details.tsx`, `reports-editor.tsx`, `InitializationDialog.tsx`, `reports-table.tsx` — conversion mécanique

**L'édition échappe au shell du dashboard.** Sous TanStack, le suffixe `_` de `dashboard_.reports_.$id_.edit` l'en sortait ; en Next, c'est un route group `(fullscreen)/`. Elle porte **déjà sa propre garde** aujourd'hui (`beforeLoad`) : elle la garde, et appelle `requireActiveBilling()` comme les autres.

**Ne portez pas encore le PDF.** `PDFDownloadLink` reste tel quel dans cette tâche : la tâche 6 s'en occupe, et mélanger les deux rendrait le diff illisible.

- [ ] **Étape 1 : convertir les quatre composants**
- [ ] **Étape 2 : écrire les deux pages**
- [ ] **Étape 3 : vérifier au navigateur** — ouvrir un compte rendu, l'éditer, revenir
- [ ] **Étape 4 : vérifier et commiter**

---

### Tâche 6 : le PDF côté serveur

**C'est le point de départ de tout ce chantier.** La page détail d'un compte rendu ralentit à chaque interaction parce que `PDFDownloadLink` est monté dans son arbre de rendu : l'élément JSX et son objet `report` sont reconstruits à chaque rendu, `PDFDownloadLink` compare l'identité de sa prop, voit une nouvelle référence, et relance son moteur de mise en page **sur le thread principal**. Chaque ouverture de dialogue, chaque frappe recalcule un PDF complet.

En prime, `@react-pdf` et `fontkit` pèsent **11,4 Mo** dans le bundle de cette page.

**Le chemin serveur existe déjà** : `lib/api/actions/email.action.ts:4` importe `renderToBuffer` et produit le même PDF pour l'envoi par email. Le code est écrit, testé, et tourne en production.

**Fichiers :**
- Créer : `app/api/reports/[id]/pdf/route.ts` et son test
- Modifier : `components/dashboard/pages/reports-module/reports-details.tsx`, `components/dashboard/pages/reports/components/reports-table.tsx`

- [ ] **Étape 1 : écrire le test qui échoue**

Le handler doit : garder l'organisation, charger le compte rendu, rendre le PDF, et répondre avec `Content-Type: application/pdf`. Un compte rendu d'une autre entreprise doit répondre 404, pas 200 — **c'est l'assertion qui compte**, un PDF est un document médical.

- [ ] **Étape 2 : écrire le handler**

Il appelle `renderToBuffer(<ReportPDF …/>)` — le même code que `email.action.ts`. Attention à `serverExternalPackages` : `@react-pdf/renderer` y est déjà déclaré depuis le lot A.

**Un piège consigné au § 9 de la spec :** `ReportPDF.tsx` résout ses images par `new URL("../../../../../public/...", import.meta.url)`. Une fois tiré dans un route handler, `import.meta.url` désignera un chunk sous `.next/server/` et `apps/web/public` ne sera pas tracé dans le bundle de la fonction. `serverExternalPackages` ne couvre pas ce cas : `ReportPDF.tsx` est du code applicatif, donc bundlé. **Lisez depuis `process.cwd()` ou embarquez les images**, et vérifiez que le PDF produit contient bien ses illustrations.

- [ ] **Étape 3 : retirer `PDFDownloadLink` des deux composants**

Les boutons redeviennent des liens vers le handler. **Aucun changement visuel** : même libellé, même icône, même position.

- [ ] **Étape 4 : prouver le gain**

```bash
bun --filter @biume/web build 2>&1 | grep -A 20 "Route (app)"
```

Comparez la taille du bundle de `/dashboard/reports/[id]` avant et après. **`@react-pdf/renderer` ne doit plus y figurer**, et `grep -rn "@react-pdf" components/` ne doit plus remonter que du code serveur.

Puis, au navigateur : ouvrez un compte rendu, **interagissez** — ouvrez un dialogue, tapez dans un champ — et vérifiez que l'interface ne rame plus. Téléchargez le PDF et **ouvrez-le** : il doit être identique à celui d'avant, illustrations comprises.

- [ ] **Étape 5 : vérifier et commiter**

---

## Fin du lot D

État atteint : les huit pages sont servies, l'application est complète, et `@react-pdf/renderer` a quitté le bundle du navigateur.

**Suite :** le lot E supprime `routes/`, `router.tsx`, `routeTree.gen.ts`, les dépendances TanStack Start et Router, les sept paquets `@tanstack/ai*` morts, et réécrit `AGENTS.md`. Son plan est écrit à la fin du lot D.
