# Intégration continue et détection de conflits d'horaires — Plan d'implémentation

> **Pour les agents d'exécution :** SOUS-COMPÉTENCE REQUISE : utiliser `superpowers:subagent-driven-development` (recommandé) ou `superpowers:executing-plans` pour exécuter ce plan tâche par tâche. Les étapes utilisent la syntaxe à cases (`- [ ]`) pour le suivi.

**Objectif :** Doter le dépôt d'une intégration continue, et brancher la détection de conflits d'horaires qui existe côté serveur sans être appelée nulle part.

**Architecture :** La logique de chevauchement est extraite du SQL vers une fonction pure testable, la requête serveur cesse de compter les rendez-vous annulés comme des conflits, et les deux dialogues d'agenda avertissent le praticien avant l'enregistrement. Une action GitHub unique fait tourner les vérifications de types et les tests du dépôt.

**Pile technique :** Bun 1.3.11, TanStack Start, Drizzle ORM, Vitest, GitHub Actions.

**Spécification :** `docs/superpowers/specs/2026-08-21-mobile-flutter-rewrite-design.md`

## Contraintes globales

- Gestionnaire de paquets : Bun uniquement. Jamais `npm`, `yarn` ni `pnpm`. Aucun autre fichier de verrouillage.
- Langue de l'interface : français. Vocabulaire métier, jamais technique — les utilisateurs sont des ostéopathes animaliers non-techniciens.
- Une action évidente par écran ; rien d'important caché derrière un clic.
- Écrire sur les jetons de `packages/ui/src/styles/product.css`. Violet d'action `#6a52d6`, vert d'état validé `#047857`. Aucune couleur codée en dur.
- Ne jamais modifier `apps/web/src/routeTree.gen.ts` à la main.
- Les tests Postgres sont facultatifs et conditionnés par une variable d'environnement, selon le motif de `report-update.persistence.postgres.test.ts`. La logique testable doit être pure.
- `CREATED` et `CONFIRMED` s'affichent tous deux « Prévu ».

---

## Structure des fichiers

| Fichier | Responsabilité |
| --- | --- |
| `apps/web/src/lib/dashboard/appointment-conflicts.ts` (créer) | Prédicat de chevauchement pur et formulation du message lu par le praticien |
| `apps/web/src/lib/dashboard/appointment-conflicts.test.ts` (créer) | Tests du prédicat et du message |
| `apps/web/src/functions/appointments.function.ts` (modifier) | Exclure les rendez-vous annulés de la détection |
| `apps/web/src/components/dashboard/agenda/appointment-form-fields.tsx` (modifier) | Champs date/horaires contrôlés, et avertissement de chevauchement sous les horaires |
| `apps/web/src/components/dashboard/agenda/appointment-form-fields.test.tsx` (créer) | Tests de l'avertissement rendu |
| `apps/web/src/components/dashboard/agenda/new-appointment-dialog.tsx` (modifier) | Transmettre l'agenda existant |
| `apps/web/src/components/dashboard/agenda/edit-appointment-dialog.tsx` (modifier) | Transmettre l'agenda existant et s'exclure de la détection |
| `apps/web/src/components/dashboard/agenda/agenda-page.tsx` (modifier) | Fournir les rendez-vous déjà chargés aux deux dialogues |
| `.github/workflows/ci.yml` (créer) | Vérification de types et tests sur chaque PR |

---

### Tâche 1 : Prédicat de chevauchement pur

Aujourd'hui la règle de chevauchement n'existe que sous forme de conditions Drizzle imbriquées dans `checkAppointmentConflicts`. Elle n'est donc testable qu'avec une base réelle, et le mobile ne pourra pas la réutiliser. On l'extrait.

**Fichiers :**
- Créer : `apps/web/src/lib/dashboard/appointment-conflicts.ts`
- Test : `apps/web/src/lib/dashboard/appointment-conflicts.test.ts`

**Interfaces :**
- Consomme : rien.
- Produit :
  - `type ConflictCandidate = { id: string; beginAt: Date | string; endAt: Date | string; status: AgendaAppointmentStatus; patientName: string | null }`
  - `function overlaps(a: { beginAt: Date; endAt: Date }, b: { beginAt: Date; endAt: Date }): boolean`
  - `function findAppointmentConflicts(input: { beginAt: Date; endAt: Date; excludeAppointmentId?: string; candidates: ConflictCandidate[] }): ConflictCandidate[]`
  - `function conflictWarning(conflicts: ConflictCandidate[]): string | null`

- [ ] **Étape 1 : Écrire les tests qui échouent**

```ts
import { describe, expect, it } from "vitest";

import {
  conflictWarning,
  findAppointmentConflicts,
  overlaps,
  type ConflictCandidate,
} from "./appointment-conflicts";

const at = (hour: number, minute = 0) =>
  new Date(2026, 7, 21, hour, minute, 0, 0);

const candidate = (
  overrides: Partial<ConflictCandidate> = {},
): ConflictCandidate => ({
  id: "rdv-1",
  beginAt: at(10),
  endAt: at(11),
  status: "CONFIRMED",
  patientName: "Filou",
  ...overrides,
});

describe("overlaps", () => {
  it("reconnaît un chevauchement partiel par la fin", () => {
    expect(
      overlaps({ beginAt: at(9), endAt: at(10, 30) }, { beginAt: at(10), endAt: at(11) }),
    ).toBe(true);
  });

  it("reconnaît un créneau entièrement contenu", () => {
    expect(
      overlaps({ beginAt: at(10, 15), endAt: at(10, 45) }, { beginAt: at(10), endAt: at(11) }),
    ).toBe(true);
  });

  /**
   * Deux séances qui se touchent ne se chevauchent pas : un praticien qui
   * enchaîne un rendez-vous à 11h après un rendez-vous qui finit à 11h ne fait
   * rien d'anormal, et l'avertir serait du bruit.
   */
  it("ne signale pas deux créneaux qui se touchent", () => {
    expect(
      overlaps({ beginAt: at(11), endAt: at(12) }, { beginAt: at(10), endAt: at(11) }),
    ).toBe(false);
  });

  it("ne signale pas deux créneaux disjoints", () => {
    expect(
      overlaps({ beginAt: at(14), endAt: at(15) }, { beginAt: at(10), endAt: at(11) }),
    ).toBe(false);
  });
});

describe("findAppointmentConflicts", () => {
  it("ignore une séance annulée", () => {
    const conflicts = findAppointmentConflicts({
      beginAt: at(10, 30),
      endAt: at(11, 30),
      candidates: [candidate({ status: "CANCELLED" })],
    });

    expect(conflicts).toEqual([]);
  });

  it("ignore le rendez-vous en cours de modification", () => {
    const conflicts = findAppointmentConflicts({
      beginAt: at(10, 30),
      endAt: at(11, 30),
      excludeAppointmentId: "rdv-1",
      candidates: [candidate()],
    });

    expect(conflicts).toEqual([]);
  });

  it("accepte des dates transmises en chaîne ISO", () => {
    const conflicts = findAppointmentConflicts({
      beginAt: at(10, 30),
      endAt: at(11, 30),
      candidates: [
        candidate({
          beginAt: at(10).toISOString(),
          endAt: at(11).toISOString(),
        }),
      ],
    });

    expect(conflicts).toHaveLength(1);
  });

  it("retourne les conflits du plus tôt au plus tard", () => {
    const conflicts = findAppointmentConflicts({
      beginAt: at(9),
      endAt: at(13),
      candidates: [
        candidate({ id: "tard", beginAt: at(12), endAt: at(12, 30) }),
        candidate({ id: "tot", beginAt: at(9, 30), endAt: at(10) }),
      ],
    });

    expect(conflicts.map((conflict) => conflict.id)).toEqual(["tot", "tard"]);
  });
});

describe("conflictWarning", () => {
  it("ne dit rien quand il n'y a pas de conflit", () => {
    expect(conflictWarning([])).toBeNull();
  });

  it("nomme l'animal quand un seul créneau se chevauche", () => {
    expect(conflictWarning([candidate()])).toBe(
      "Ce créneau chevauche la séance de Filou à 10:00.",
    );
  });

  it("reste lisible quand l'animal n'a pas de nom", () => {
    expect(conflictWarning([candidate({ patientName: null })])).toBe(
      "Ce créneau chevauche une séance à 10:00.",
    );
  });

  it("compte les créneaux quand il y en a plusieurs", () => {
    expect(
      conflictWarning([candidate(), candidate({ id: "rdv-2", beginAt: at(12) })]),
    ).toBe("Ce créneau chevauche 2 séances déjà prévues.");
  });
});
```

- [ ] **Étape 2 : Lancer les tests et vérifier qu'ils échouent**

Commande : `bun --filter @biume/web test -- appointment-conflicts`

Attendu : ÉCHEC, avec une erreur de résolution du module `./appointment-conflicts`.

- [ ] **Étape 3 : Écrire l'implémentation minimale**

```ts
import type { AgendaAppointmentStatus } from "./day-agenda";

export type ConflictCandidate = {
  id: string;
  beginAt: Date | string;
  endAt: Date | string;
  status: AgendaAppointmentStatus;
  patientName: string | null;
};

type Slot = { beginAt: Date; endAt: Date };

/**
 * Bornes ouvertes : deux séances qui se touchent ne se chevauchent pas.
 * Enchaîner un rendez-vous sur la fin du précédent est le fonctionnement
 * normal d'une tournée, pas une erreur à signaler.
 */
export function overlaps(a: Slot, b: Slot): boolean {
  return a.beginAt.getTime() < b.endAt.getTime() &&
    b.beginAt.getTime() < a.endAt.getTime();
}

export function findAppointmentConflicts({
  beginAt,
  endAt,
  excludeAppointmentId,
  candidates,
}: {
  beginAt: Date;
  endAt: Date;
  excludeAppointmentId?: string;
  candidates: ConflictCandidate[];
}): ConflictCandidate[] {
  return candidates
    .filter((candidate) => candidate.status !== "CANCELLED")
    .filter((candidate) => candidate.id !== excludeAppointmentId)
    .filter((candidate) =>
      overlaps(
        { beginAt, endAt },
        {
          beginAt: new Date(candidate.beginAt),
          endAt: new Date(candidate.endAt),
        },
      ),
    )
    .sort(
      (left, right) =>
        new Date(left.beginAt).getTime() - new Date(right.beginAt).getTime(),
    );
}

function timeLabel(value: Date | string): string {
  return new Date(value).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Le message dit ce que le praticien doit décider, pas ce que le système a
 * calculé. Au-delà d'un conflit, nommer chaque animal allongerait la phrase
 * sans l'aider : le nombre suffit à lui faire ouvrir son agenda.
 */
export function conflictWarning(conflicts: ConflictCandidate[]): string | null {
  if (conflicts.length === 0) return null;

  if (conflicts.length === 1) {
    const [conflict] = conflicts;
    const when = timeLabel(conflict.beginAt);

    return conflict.patientName
      ? `Ce créneau chevauche la séance de ${conflict.patientName} à ${when}.`
      : `Ce créneau chevauche une séance à ${when}.`;
  }

  return `Ce créneau chevauche ${conflicts.length} séances déjà prévues.`;
}
```

- [ ] **Étape 4 : Lancer les tests et vérifier qu'ils passent**

Commande : `bun --filter @biume/web test -- appointment-conflicts`

Attendu : SUCCÈS, 11 tests.

- [ ] **Étape 5 : Valider**

```bash
rtk git add apps/web/src/lib/dashboard/appointment-conflicts.ts apps/web/src/lib/dashboard/appointment-conflicts.test.ts
rtk git commit -m "feat(web): extraire la regle de chevauchement des rendez-vous"
```

---

### Tâche 2 : La détection serveur cesse de compter les séances annulées

`checkAppointmentConflicts` interroge la base sans filtrer sur le statut. Un rendez-vous annulé y ressort donc comme un conflit, ce qui rendrait l'avertissement faux dès sa première utilisation.

**Fichiers :**
- Modifier : `apps/web/src/functions/appointments.function.ts:136-175`

**Interfaces :**
- Consomme : `findAppointmentConflicts` de la tâche 1 n'est **pas** utilisé ici — la requête reste en SQL pour ne pas charger tout l'agenda en mémoire. Le prédicat pur sert l'interface et le futur client mobile.
- Produit : `checkAppointmentConflicts` ne retourne plus jamais de rendez-vous dont le statut vaut `CANCELLED`.

- [ ] **Étape 1 : Lire la fonction existante**

Ouvrir `apps/web/src/functions/appointments.function.ts` aux lignes 136 à 175 et repérer le `where: and(...)` de `db.query.appointments.findMany`.

- [ ] **Étape 2 : Ajouter l'exclusion des annulations**

Dans le `and(...)`, juste après la condition `eq(appointments.organizationId, organization.id)`, insérer :

```ts
        // Une séance annulée libère son créneau : la compter comme un conflit
        // empêcherait le praticien de réutiliser une heure qu'il vient de
        // libérer lui-même.
        ne(appointments.status, "CANCELLED"),
```

`ne` est déjà importé dans ce fichier — il sert à exclure `data.excludeAppointmentId`.

- [ ] **Étape 3 : Vérifier les types**

Commande : `bun --filter @biume/web check-types`

Attendu : SUCCÈS, aucune erreur.

- [ ] **Étape 4 : Valider**

```bash
rtk git add apps/web/src/functions/appointments.function.ts
rtk git commit -m "fix(web): ne plus compter une seance annulee comme un conflit"
```

---

### Tâche 3 : Avertissement de chevauchement dans les champs partagés

Les deux dialogues partagent `AppointmentFormFields`, qui rend la date et les horaires en champs **non contrôlés** (`defaultValue`, lecture par `FormData` à la soumission). Un avertissement vivant exige de connaître les valeurs pendant la saisie : le composant prend donc la main sur son propre état, tout en conservant ses attributs `name` pour que `FormData` continue de fonctionner à l'identique dans les deux dialogues.

L'avertissement est placé là parce que c'est là qu'il se lit : sous les horaires qui le déclenchent, pas au bas du formulaire.

Il **n'empêche pas** l'enregistrement. Un ostéopathe qui superpose volontairement deux séances sait ce qu'il fait ; le produit l'informe, il ne le corrige pas.

**Fichiers :**
- Modifier : `apps/web/src/components/dashboard/agenda/appointment-form-fields.tsx`
- Test : `apps/web/src/components/dashboard/agenda/appointment-form-fields.test.tsx` (créer)

**Interfaces :**
- Consomme : `conflictWarning`, `findAppointmentConflicts`, `type ConflictCandidate` de la tâche 1 ; `toneSoftClassName` de `#/components/dashboard/kit/tone`.
- Produit : `AppointmentFormFieldsProps` gagne deux propriétés facultatives — `existingAppointments?: ConflictCandidate[]` (défaut `[]`) et `excludeAppointmentId?: string`. Les exports `formatDateInput`, `formatTimeInput` et `buildLocalDate` sont inchangés.

- [ ] **Étape 1 : Écrire les tests qui échouent**

Créer `apps/web/src/components/dashboard/agenda/appointment-form-fields.test.tsx` :

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AppointmentFormFields } from "./appointment-form-fields";

const day = new Date(2026, 7, 21);

const existing = [
  {
    id: "rdv-1",
    beginAt: new Date(2026, 7, 21, 9, 30),
    endAt: new Date(2026, 7, 21, 10, 30),
    status: "CONFIRMED" as const,
    patientName: "Filou",
  },
];

describe("AppointmentFormFields", () => {
  it("ne signale rien quand aucun rendez-vous n'existe", () => {
    render(
      <AppointmentFormFields
        defaultDate={day}
        defaultStartTime="09:00"
        defaultEndTime="10:00"
      />,
    );

    expect(screen.queryByRole("status")).toBeNull();
  });

  it("signale le chevauchement des horaires par défaut", () => {
    render(
      <AppointmentFormFields
        defaultDate={day}
        defaultStartTime="09:00"
        defaultEndTime="10:00"
        existingAppointments={existing}
      />,
    );

    expect(screen.getByRole("status").textContent).toBe(
      "Ce créneau chevauche la séance de Filou à 09:30.",
    );
  });

  it("ne se signale pas lui-même quand on déplace un rendez-vous", () => {
    render(
      <AppointmentFormFields
        defaultDate={day}
        defaultStartTime="09:30"
        defaultEndTime="10:30"
        existingAppointments={existing}
        excludeAppointmentId="rdv-1"
      />,
    );

    expect(screen.queryByRole("status")).toBeNull();
  });

  it("conserve le nom des champs pour la soumission par FormData", () => {
    render(
      <AppointmentFormFields
        defaultDate={day}
        defaultStartTime="09:00"
        defaultEndTime="10:00"
      />,
    );

    expect(screen.getByLabelText("Date").getAttribute("name")).toBe("date");
    expect(screen.getByLabelText("Début").getAttribute("name")).toBe("startTime");
    expect(screen.getByLabelText("Fin").getAttribute("name")).toBe("endTime");
  });
});
```

- [ ] **Étape 2 : Lancer les tests et vérifier qu'ils échouent**

Commande : `bun --filter @biume/web test -- appointment-form-fields`

Attendu : ÉCHEC. Les trois premiers tests échouent parce que `existingAppointments` n'existe pas et qu'aucun élément `role="status"` n'est rendu. Le quatrième doit passer dès maintenant : il protège le comportement existant.

- [ ] **Étape 3 : Contrôler les champs et rendre l'avertissement**

Dans `appointment-form-fields.tsx`, ajouter les imports :

```tsx
import { useState } from "react";

import { toneSoftClassName } from "#/components/dashboard/kit/tone";
import {
  conflictWarning,
  findAppointmentConflicts,
  type ConflictCandidate,
} from "#/lib/dashboard/appointment-conflicts";
```

Étendre le type des propriétés :

```tsx
  defaultAtHome?: boolean;
  /** L'agenda déjà chargé, pour signaler un chevauchement pendant la saisie. */
  existingAppointments?: ConflictCandidate[];
  /** Le rendez-vous en cours de déplacement, qui ne se chevauche pas lui-même. */
  excludeAppointmentId?: string;
```

Remplacer le corps du composant. Les champs deviennent contrôlés mais gardent leurs `name`, donc la lecture par `FormData` dans les deux dialogues n'est pas touchée :

```tsx
export function AppointmentFormFields({
  idPrefix = "appointment",
  defaultDate,
  defaultStartTime,
  defaultEndTime,
  defaultAtHome = false,
  existingAppointments = [],
  excludeAppointmentId,
}: AppointmentFormFieldsProps) {
  const [date, setDate] = useState(() => formatDateInput(defaultDate));
  const [startTime, setStartTime] = useState(defaultStartTime);
  const [endTime, setEndTime] = useState(defaultEndTime);

  const warning = conflictWarning(
    findAppointmentConflicts({
      beginAt: buildLocalDate(date, startTime),
      endAt: buildLocalDate(date, endTime),
      excludeAppointmentId,
      candidates: existingAppointments,
    }),
  );
```

Dans le JSX, remplacer chacun des trois `defaultValue` par un couple `value`/`onChange` :

```tsx
            value={date}
            onChange={(event) => setDate(event.target.value)}
```

```tsx
              value={startTime}
              onChange={(event) => setStartTime(event.target.value)}
```

```tsx
              value={endTime}
              onChange={(event) => setEndTime(event.target.value)}
```

Puis, juste après la `<div className="grid gap-4 sm:grid-cols-3">` fermante et avant le bloc « Rendez-vous à domicile », insérer :

```tsx
      {warning ? (
        <p
          role="status"
          className={`rounded-xl border px-4 py-3 text-sm ${toneSoftClassName("attention")}`}
        >
          {warning}
        </p>
      ) : null}
```

Le ton `attention` est celui du système de design pour ce cas : il dit au praticien qu'on attend un arbitrage de sa part, sans annoncer une erreur.

- [ ] **Étape 4 : Lancer les tests et vérifier qu'ils passent**

Commande : `bun --filter @biume/web test -- appointment-form-fields`

Attendu : SUCCÈS, 4 tests.

- [ ] **Étape 5 : Valider**

```bash
rtk git add apps/web/src/components/dashboard/agenda/appointment-form-fields.tsx apps/web/src/components/dashboard/agenda/appointment-form-fields.test.tsx
rtk git commit -m "feat(web): signaler un chevauchement pendant la saisie d'un creneau"
```

---

### Tâche 4 : Alimenter les deux dialogues avec l'agenda existant

Le composant sait avertir ; encore faut-il lui donner les rendez-vous. Les deux dialogues sont rendus par `agenda-page.tsx`, qui détient déjà la liste chargée.

**Fichiers :**
- Modifier : `apps/web/src/components/dashboard/agenda/new-appointment-dialog.tsx`
- Modifier : `apps/web/src/components/dashboard/agenda/edit-appointment-dialog.tsx`
- Modifier : `apps/web/src/components/dashboard/agenda/agenda-page.tsx`

**Interfaces :**
- Consomme : `AppointmentFormFields` étendu en tâche 3 ; `type ConflictCandidate` de la tâche 1.
- Produit : les deux dialogues acceptent `existingAppointments: ConflictCandidate[]`. Le dialogue d'édition transmet en plus `excludeAppointmentId={appointment.id}`.

- [ ] **Étape 1 : Étendre le dialogue de création**

Dans `new-appointment-dialog.tsx`, importer le type puis ajouter la propriété :

```tsx
import type { ConflictCandidate } from "#/lib/dashboard/appointment-conflicts";
```

```tsx
  existingAppointments: ConflictCandidate[];
```

Et la transmettre à l'appel existant, ligne 119 :

```tsx
            <AppointmentFormFields
              defaultDate={selectedDate}
              defaultStartTime="09:00"
              defaultEndTime="10:00"
              existingAppointments={existingAppointments}
            />
```

- [ ] **Étape 2 : Étendre le dialogue de modification**

Dans `edit-appointment-dialog.tsx`, même import et même propriété, puis à l'appel existant ligne 110, ajouter les deux lignes :

```tsx
                existingAppointments={existingAppointments}
                excludeAppointmentId={appointment.id}
```

- [ ] **Étape 3 : Fournir la liste depuis la page d'agenda**

Dans `agenda-page.tsx`, passer aux deux dialogues :

```tsx
existingAppointments={appointments.map((appointment) => ({
  id: appointment.id,
  beginAt: appointment.beginAt,
  endAt: appointment.endAt,
  status: appointment.status,
  patientName: appointment.patient?.name ?? null,
}))}
```

- [ ] **Étape 4 : Vérifier les types et l'ensemble des tests**

Commandes :

```bash
bun --filter @biume/web check-types
bun --filter @biume/web test
```

Attendu : SUCCÈS pour les deux. Si `check-types` signale que `existingAppointments` manque à un appel de dialogue, c'est un appel oublié — le corriger plutôt que rendre la propriété facultative : un dialogue sans agenda n'avertirait jamais, silencieusement.

- [ ] **Étape 5 : Vérifier dans l'application**

Commande : `bun run dev:web`

Créer un rendez-vous sur un créneau déjà occupé et vérifier que l'avertissement nomme l'animal. Ouvrir la modification de ce même rendez-vous sans changer les horaires et vérifier qu'aucun avertissement n'apparaît.

- [ ] **Étape 6 : Valider**

```bash
rtk git add apps/web/src/components/dashboard/agenda/
rtk git commit -m "feat(web): alimenter les dialogues d'agenda avec les rendez-vous existants"
```

---

### Tâche 5 : Intégration continue

Le dépôt n'a aucune CI. Rien ne fait tourner les tests du web ni ceux des paquets. Tout le garde-fou contre la dérive de schéma prévu par la spécification en dépend.

**Fichiers :**
- Créer : `.github/workflows/ci.yml`

**Interfaces :**
- Consomme : les scripts racine `check-types` et les scripts `test` de chaque paquet.
- Produit : un workflow nommé `ci` avec un job `verify`, sur lequel les plans suivants ajouteront `flutter analyze`, `flutter test` et la conformité à `openapi.json`.

- [ ] **Étape 1 : Écrire le workflow**

```yaml
name: ci

on:
  pull_request:
  push:
    branches: [main]

concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true

jobs:
  verify:
    name: Types et tests
    runs-on: ubuntu-latest
    timeout-minutes: 20

    steps:
      - uses: actions/checkout@v4

      - uses: oven-sh/setup-bun@v2
        with:
          bun-version: 1.3.11

      - name: Installer les dépendances
        run: bun install --frozen-lockfile

      - name: Vérifier les types
        run: bun run check-types

      - name: Tests du web
        run: bun --filter @biume/web test

      - name: Tests des contrats partagés
        run: bun --filter @biume/contracts test
```

- [ ] **Étape 2 : Vérifier que les commandes passent localement**

Commandes :

```bash
bun run check-types
bun --filter @biume/web test
bun --filter @biume/contracts test
```

Attendu : SUCCÈS pour les trois. `packages/contracts` expose déjà `"test": "vitest run"` — vérifié le 21 août 2026, rien à ajouter.

- [ ] **Étape 3 : Valider**

```bash
rtk git add .github/workflows/ci.yml
rtk git commit -m "ci: verifier les types et les tests sur chaque pull request"
```

- [ ] **Étape 4 : Vérifier que la CI passe réellement**

Pousser la branche et ouvrir une pull request. Consulter le résultat :

```bash
rtk gh pr checks
```

Attendu : le job `verify` réussit. Ne pas clore ce plan sur un job rouge ni sur un job jamais déclenché.

---

## Critères d'acceptation du plan

- Créer un rendez-vous sur un créneau déjà occupé affiche un avertissement nommant l'animal concerné, sans empêcher l'enregistrement.
- Déplacer un rendez-vous sur son propre créneau n'affiche aucun avertissement.
- Un rendez-vous annulé ne produit jamais d'avertissement.
- Deux séances qui se touchent ne produisent aucun avertissement.
- La pull request fait tourner `bun run check-types` et les tests du web et des contrats, et le job est vert.
