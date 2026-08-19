# Agenda actionnable et compte rendu de séance — plan d'implémentation

> **Pour les agents d'exécution :** SOUS-COMPÉTENCE REQUISE — utiliser
> `superpowers:subagent-driven-development` (recommandé) ou
> `superpowers:executing-plans` pour dérouler ce plan tâche par tâche. Les
> étapes utilisent la syntaxe case à cocher (`- [ ]`) pour le suivi.

**Goal:** Rendre chaque rendez-vous de l'agenda actionnable, et créer le compte
rendu de la séance en même temps que le rendez-vous, sans qu'un ostéopathe
non-technicien ait à comprendre le mot « brouillon ».

**Architecture:** La logique d'état vit dans des fonctions pures testables —
`packages/contracts` pour la règle « compte rendu vide », partagée avec le
mobile, et `apps/web/src/lib/dashboard` pour l'état de séance et l'action
proposée. Les fonctions serveur délèguent à des services à ports injectés,
suivant `quick-report.service.ts`. La page Agenda est reconstruite sur le kit
livré au lot 1 et consomme `buildDayAgendaModel`, aujourd'hui débranché.

**Tech Stack:** Bun, TanStack Start, TanStack Router, TanStack Query, React 19,
Tailwind CSS v4, Drizzle ORM / PostgreSQL, Zod, Vitest, Testing Library.

**Spec:** `docs/superpowers/specs/2026-08-17-refonte-dashboard-design.md`

## Portée

Ce plan couvre le **lot 2** uniquement. Les lots 3 (vue d'ensemble et page
Comptes rendus) et 4 (Animaux, Propriétaires, éditeur, Paramètres) feront
l'objet de plans distincts, écrits après validation de celui-ci. Chaque lot doit
produire un logiciel qui fonctionne et se teste seul.

Le lot 1 est livré : branche `feat/dashboard-design-system`, commit `8dd9c3c`.
Ce plan part de cette branche.

## Contraintes globales

- **Utilisateurs non-techniciens.** Vocabulaire métier, jamais technique. Une
  action évidente par écran, à un emplacement stable. Aucune action derrière un
  survol. Aucun état à déduire.
- **Violet = l'action qui fait avancer, vert = l'état atteint.** Un vert sur un
  bouton d'action est un défaut à rejeter en revue.
- **Aucune couleur codée en dur.** Toute page passe par les tokens et par
  `apps/web/src/components/dashboard/kit`. Aucun `slate-*`, `emerald-*`,
  `sky-*` ou `amber-*` ne doit subsister dans les fichiers touchés.
- **Langage visuel de référence : `select-organization.tsx`.** Le dashboard, son
  layout et ses pages subsidiaires en reprennent le canvas, la liste groupée
  (une surface, des lignes séparées par un filet), les pavés d'icônes, les
  intitulés de section et les interactions. Les pages d'entrée gardent seules le
  hero en split et le titre display.
- **« Entreprise », jamais « organisation »** dans tout texte lu par un
  praticien. Les routes, la table `organization`, les identifiants HTML et les
  noms de symboles restent inchangés.
- **Ne pas modifier `packages/ui/src/styles/globals.css`** — `apps/marketing`
  en hérite.
- **Ne pas éditer `apps/web/src/routeTree.gen.ts` à la main.** Regénérer avec
  `bun --filter @biume/web generate-routes`.
- **Définition normative de « compte rendu vide » :** `consultationReason` vide
  **et** `notes` vide **et** zéro `anatomicalIssue` **et** zéro
  `advancedReportRecommendations`.
- Commandes de vérification : `cd apps/web && bunx vitest run` (référence
  actuelle : **318 passent, 0 échec**), `cd apps/web && bunx tsc --noEmit`
  (référence : **5 erreurs pré-existantes** dans `src/components/ui/date-picker.tsx`
  et `src/polyfills/` — ne pas en ajouter), `bun run --filter @biume/web build`.

---

## Structure des fichiers

**Créés**

| Fichier | Responsabilité |
| --- | --- |
| `apps/web/src/lib/dashboard/session-state.ts` | Dérive « prévue / terminée / annulée » de `endAt` et du statut, et fournit les libellés praticien |
| `apps/web/src/lib/dashboard/session-state.test.ts` | Tests de la dérivation, dont la bascule exacte à `endAt` |
| `apps/web/src/functions/appointment-report.service.ts` | Création du brouillon de séance et détachement à la suppression, en ports injectés |
| `apps/web/src/functions/appointment-report.service.test.ts` | Tests du service, sans base de données |
| `apps/web/src/components/dashboard/agenda/appointment-card.tsx` | Une carte de rendez-vous : état en clair, action principale, menu `⋯` |
| `apps/web/src/components/dashboard/agenda/appointment-card.test.tsx` | Vérifie que l'action et l'état affichés suivent le tableau de la spec |
| `apps/web/src/components/dashboard/agenda/appointment-actions-menu.tsx` | Menu `⋯` : modifier, annuler, supprimer |
| `apps/web/src/components/dashboard/agenda/edit-appointment-dialog.tsx` | Dialogue de modification d'un rendez-vous |
| `packages/db/src/migrations/0005_detach_report_from_appointment.sql` | Généré par drizzle-kit |
| `apps/web/src/components/dashboard/kit/grouped-list.tsx` | La liste groupée de `select-organization` : une surface, des lignes séparées par un filet |
| `apps/web/src/components/dashboard/kit/grouped-list.test.tsx` | Vérifie la sélection d'une ligne et l'état désactivé |
| `apps/web/src/components/dashboard/kit/icon-tile.tsx` | Le pavé d'icône de la référence, en deux tailles |
| `apps/web/src/components/dashboard/kit/section-intro.tsx` | Intitulé coloré, titre, actions alignées à droite |

**Modifiés**

| Fichier | Changement |
| --- | --- |
| `packages/contracts/src/report.ts` | Ajout de `isReportEmpty` et de son type d'entrée |
| `packages/contracts/src/report.test.ts` | Tests de `isReportEmpty` |
| `packages/db/src/schema/advancedReport/advancedReport.ts:47` | `onDelete: "cascade"` → `"set null"` |
| `apps/web/src/lib/dashboard/day-agenda.ts` | Nouveau modèle d'état et d'action |
| `apps/web/src/lib/dashboard/day-agenda.test.ts` | Mise à jour sur le nouveau modèle |
| `apps/web/src/lib/dashboard/dashboard-overview.ts` | Adaptation aux nouveaux `AgendaActionKind` |
| `apps/web/src/lib/dashboard/dashboard-overview.test.ts` | Idem |
| `apps/web/src/components/dashboard/overview/dashboard-priorities-panel.tsx` | Adaptation des `kind`, et l'action de création devient cliquable |
| `apps/web/src/functions/appointments.function.ts` | `getAppointments` borné et chargeant les comptes rendus ; `createAppointment` et `deleteAppointment` branchés sur le service |
| `apps/web/src/functions/reports.function.ts` | `loadAllReportRows` exclut les brouillons vides |
| `apps/web/src/lib/api/actions/appointments.action.ts` | Signatures des nouvelles options |
| `apps/web/src/lib/api/queries/appointments.query.ts` | Fenêtre de dates dans la clé de requête |
| `apps/web/src/components/dashboard/agenda/new-appointment-dialog.tsx` | Case « Préparer le compte rendu », passage sur le kit |
| `apps/web/src/components/dashboard/agenda/agenda-page.tsx` | Reconstruction sur le kit et sur `buildDayAgendaModel` |

---

### Task 1 : Règle « compte rendu vide »

Cette règle décide si un compte rendu apparaît dans la liste. Elle vit dans
`packages/contracts` parce que le mobile devra l'appliquer à l'identique.

**Files:**
- Modify: `packages/contracts/src/report.ts`
- Test: `packages/contracts/src/report.test.ts`

**Interfaces:**
- Consomme : rien.
- Produit : `type ReportContentSummary = { consultationReason: string; notes: string | null; anatomicalIssueCount: number; recommendationCount: number }` et
  `isReportEmpty(report: ReportContentSummary): boolean`. Utilisés par les tâches 3, 6, 7 et 8.

- [ ] **Étape 1 : écrire les tests qui échouent**

Ajouter à la fin de `packages/contracts/src/report.test.ts` :

```ts
describe("isReportEmpty", () => {
  const empty: ReportContentSummary = {
    consultationReason: "",
    notes: null,
    anatomicalIssueCount: 0,
    recommendationCount: 0,
  };

  test("un compte rendu sans aucune saisie est vide", () => {
    expect(isReportEmpty(empty)).toBe(true);
  });

  test("des espaces seuls ne comptent pas comme une saisie", () => {
    expect(
      isReportEmpty({ ...empty, consultationReason: "   ", notes: "\n " }),
    ).toBe(true);
  });

  test("un motif de consultation rend le compte rendu non vide", () => {
    expect(isReportEmpty({ ...empty, consultationReason: "Boiterie" })).toBe(
      false,
    );
  });

  test("une note rend le compte rendu non vide", () => {
    expect(isReportEmpty({ ...empty, notes: "Revoir dans 3 semaines" })).toBe(
      false,
    );
  });

  test("une zone anatomique rend le compte rendu non vide", () => {
    expect(isReportEmpty({ ...empty, anatomicalIssueCount: 1 })).toBe(false);
  });

  test("une recommandation rend le compte rendu non vide", () => {
    expect(isReportEmpty({ ...empty, recommendationCount: 1 })).toBe(false);
  });
});
```

Ajouter `isReportEmpty` et `type ReportContentSummary` à l'import existant en
tête de `report.test.ts`.

Le test sur les espaces fige une décision : un praticien qui ouvre un compte
rendu, tape une espace et referme n'a rien écrit. Sans `trim()`, ce compte rendu
apparaîtrait dans la liste et le praticien ne comprendrait pas pourquoi.

- [ ] **Étape 2 : lancer les tests pour vérifier qu'ils échouent**

```bash
cd packages/contracts && bunx vitest run src/report.test.ts
```

Attendu : ÉCHEC, `isReportEmpty is not a function` ou erreur de résolution
d'import.

- [ ] **Étape 3 : implémenter**

Ajouter dans `packages/contracts/src/report.ts`, après `reportStatusSchema` :

```ts
export type ReportContentSummary = {
  consultationReason: string;
  notes: string | null;
  anatomicalIssueCount: number;
  recommendationCount: number;
};

/**
 * Un compte rendu créé en même temps que son rendez-vous n'a encore rien
 * dedans. Il ne doit pas encombrer la liste des comptes rendus tant que le
 * praticien n'a rien écrit : il vit sur son rendez-vous dans l'agenda.
 *
 * Le titre est exclu : il est généré automatiquement à la création et ne
 * témoigne d'aucune saisie.
 */
export function isReportEmpty(report: ReportContentSummary): boolean {
  return (
    report.consultationReason.trim().length === 0 &&
    (report.notes ?? "").trim().length === 0 &&
    report.anatomicalIssueCount === 0 &&
    report.recommendationCount === 0
  );
}
```

- [ ] **Étape 4 : lancer les tests pour vérifier qu'ils passent**

```bash
cd packages/contracts && bunx vitest run src/report.test.ts
```

Attendu : SUCCÈS, 6 tests supplémentaires verts.

- [ ] **Étape 5 : commit**

```bash
git add packages/contracts/src/report.ts packages/contracts/src/report.test.ts
git commit -m "feat(contracts): definir quand un compte rendu est encore vide"
```

---

### Task 2 : État de séance dérivé de l'heure de fin

Aujourd'hui rien ne fait passer un rendez-vous à `COMPLETED`, donc l'action
« Créer le compte rendu » ne se déclenche jamais. On dérive l'état de l'heure
plutôt que d'attendre un geste du praticien.

**Files:**
- Create: `apps/web/src/lib/dashboard/session-state.ts`
- Test: `apps/web/src/lib/dashboard/session-state.test.ts`

**Interfaces:**
- Consomme : rien.
- Produit : `type SessionState = "scheduled" | "done" | "cancelled"`,
  `deriveSessionState(input: { status: AgendaAppointmentStatus; endAt: Date; now: Date }): SessionState`,
  `sessionStateLabel(state: SessionState): string`. Utilisés par les tâches 3 et 10.

- [ ] **Étape 1 : écrire les tests qui échouent**

Créer `apps/web/src/lib/dashboard/session-state.test.ts` :

```ts
import { describe, expect, test } from "vitest";

import { deriveSessionState, sessionStateLabel } from "./session-state";

const now = new Date("2026-08-17T14:00:00.000Z");

describe("deriveSessionState", () => {
  test("une séance annulée le reste, même passée", () => {
    expect(
      deriveSessionState({
        status: "CANCELLED",
        endAt: new Date("2026-08-17T10:00:00.000Z"),
        now,
      }),
    ).toBe("cancelled");
  });

  test("une séance dont l'heure de fin est passée est terminée", () => {
    expect(
      deriveSessionState({
        status: "CREATED",
        endAt: new Date("2026-08-17T13:59:59.000Z"),
        now,
      }),
    ).toBe("done");
  });

  test("une séance qui se termine exactement maintenant est terminée", () => {
    expect(
      deriveSessionState({ status: "CONFIRMED", endAt: now, now }),
    ).toBe("done");
  });

  test("une séance à venir est prévue", () => {
    expect(
      deriveSessionState({
        status: "CREATED",
        endAt: new Date("2026-08-17T15:00:00.000Z"),
        now,
      }),
    ).toBe("scheduled");
  });

  test("un statut COMPLETED explicite prime sur l'heure", () => {
    expect(
      deriveSessionState({
        status: "COMPLETED",
        endAt: new Date("2026-08-17T15:00:00.000Z"),
        now,
      }),
    ).toBe("done");
  });
});

describe("sessionStateLabel", () => {
  test("CREATED et CONFIRMED se lisent tous deux « Prévu »", () => {
    expect(sessionStateLabel("scheduled")).toBe("Prévu");
  });

  test("les libellés sont en français métier", () => {
    expect(sessionStateLabel("done")).toBe("Terminé");
    expect(sessionStateLabel("cancelled")).toBe("Annulé");
  });
});
```

- [ ] **Étape 2 : lancer les tests pour vérifier qu'ils échouent**

```bash
cd apps/web && bunx vitest run src/lib/dashboard/session-state.test.ts
```

Attendu : ÉCHEC, `Failed to resolve import "./session-state"`.

- [ ] **Étape 3 : implémenter**

Créer `apps/web/src/lib/dashboard/session-state.ts` :

```ts
import type { AgendaAppointmentStatus } from "./day-agenda";

/**
 * L'état d'une séance tel que le praticien le comprend.
 *
 * La base distingue CREATED et CONFIRMED. Pour un ostéopathe qui saisit
 * lui-même ses rendez-vous, cette nuance n'existe pas : il l'a créé, donc il
 * est prévu. Les deux se lisent « Prévu ».
 */
export type SessionState = "scheduled" | "done" | "cancelled";

export type DeriveSessionStateInput = {
  status: AgendaAppointmentStatus;
  endAt: Date;
  now: Date;
};

/**
 * Une séance devient terminée toute seule quand son heure de fin est passée.
 *
 * Aucune interface ne fait aujourd'hui passer un rendez-vous à COMPLETED, donc
 * s'appuyer sur ce statut revenait à ne jamais proposer le compte rendu. Et
 * demander au praticien de cliquer « séance terminée » serait un geste de plus
 * à retenir, qu'il oublierait.
 */
export function deriveSessionState({
  endAt,
  now,
  status,
}: DeriveSessionStateInput): SessionState {
  if (status === "CANCELLED") return "cancelled";
  if (status === "COMPLETED") return "done";

  return endAt.getTime() <= now.getTime() ? "done" : "scheduled";
}

export function sessionStateLabel(state: SessionState): string {
  if (state === "done") return "Terminé";
  if (state === "cancelled") return "Annulé";

  return "Prévu";
}
```

- [ ] **Étape 4 : lancer les tests pour vérifier qu'ils passent**

```bash
cd apps/web && bunx vitest run src/lib/dashboard/session-state.test.ts
```

Attendu : SUCCÈS, 7 tests verts.

- [ ] **Étape 5 : commit**

```bash
git add apps/web/src/lib/dashboard/session-state.ts apps/web/src/lib/dashboard/session-state.test.ts
git commit -m "feat(web): deriver l'etat d'une seance de son heure de fin"
```

---

### Task 3 : Modèle d'action de l'agenda

Réécrit `day-agenda.ts` sur le tableau de la spec. Avec la création
automatique du brouillon (tâche 6), presque tous les rendez-vous auront un
compte rendu dès leur création : proposer « Finaliser » sur une séance qui n'a
pas encore eu lieu serait absurde. L'action dépend donc du couple
(état de séance, état du compte rendu).

**Files:**
- Modify: `apps/web/src/lib/dashboard/day-agenda.ts`
- Modify: `apps/web/src/lib/dashboard/dashboard-overview.ts`
- Modify: `apps/web/src/components/dashboard/overview/dashboard-priorities-panel.tsx`
- Test: `apps/web/src/lib/dashboard/day-agenda.test.ts`
- Test: `apps/web/src/lib/dashboard/dashboard-overview.test.ts`

**Interfaces:**
- Consomme : `isReportEmpty`, `ReportContentSummary` (tâche 1) ;
  `SessionState`, `deriveSessionState` (tâche 2).
- Produit :
  `type AgendaReportState = "absent" | "empty" | "started" | "finalized" | "sent"`,
  `type AgendaActionKind = "cancelled" | "upcoming" | "prepare_report" | "create_report" | "fill_report" | "continue_report" | "send_report" | "view_report"`,
  `deriveAgendaReportState(reports: AgendaReportInput[]): AgendaReportState`,
  `getAgendaPrimaryAction(sessionState: SessionState, reportState: AgendaReportState): { kind: AgendaActionKind; label: string }`.
  `AgendaReportInput` gagne `consultationReason: string`, `notes: string | null`,
  `anatomicalIssueCount: number`, `recommendationCount: number`.
  Utilisés par les tâches 5, 10 et 12.

- [ ] **Étape 1 : écrire les tests qui échouent**

Remplacer les blocs `describe("deriveAgendaReportStatus")` et
`describe("getAgendaPrimaryAction")` de
`apps/web/src/lib/dashboard/day-agenda.test.ts` par :

```ts
function report(
  overrides: Partial<AgendaReportInput> = {},
): AgendaReportInput {
  return {
    id: "report-1",
    status: "draft",
    updatedAt: null,
    consultationReason: "",
    notes: null,
    anatomicalIssueCount: 0,
    recommendationCount: 0,
    ...overrides,
  };
}

describe("deriveAgendaReportState", () => {
  test("aucun compte rendu", () => {
    expect(deriveAgendaReportState([])).toBe("absent");
  });

  test("un brouillon sans aucune saisie est vide", () => {
    expect(deriveAgendaReportState([report()])).toBe("empty");
  });

  test("un brouillon avec un motif est commencé", () => {
    expect(
      deriveAgendaReportState([report({ consultationReason: "Boiterie" })]),
    ).toBe("started");
  });

  test("un compte rendu finalisé", () => {
    expect(deriveAgendaReportState([report({ status: "finalized" })])).toBe(
      "finalized",
    );
  });

  test("un compte rendu envoyé", () => {
    expect(deriveAgendaReportState([report({ status: "sent" })])).toBe("sent");
  });

  test("le compte rendu le plus récent l'emporte", () => {
    expect(
      deriveAgendaReportState([
        report({
          id: "ancien",
          status: "draft",
          updatedAt: new Date("2026-08-01T10:00:00.000Z"),
        }),
        report({
          id: "recent",
          status: "sent",
          updatedAt: new Date("2026-08-10T10:00:00.000Z"),
        }),
      ]),
    ).toBe("sent");
  });
});

describe("getAgendaPrimaryAction", () => {
  test("une séance annulée ne propose aucune action", () => {
    expect(getAgendaPrimaryAction("cancelled", "started")).toEqual({
      kind: "cancelled",
      label: "Annulé",
    });
  });

  test("avant la séance, sans compte rendu, on propose de le préparer", () => {
    expect(getAgendaPrimaryAction("scheduled", "absent")).toEqual({
      kind: "prepare_report",
      label: "Préparer le compte rendu",
    });
  });

  test("avant la séance, un brouillon vide n'appelle aucune action", () => {
    expect(getAgendaPrimaryAction("scheduled", "empty")).toEqual({
      kind: "upcoming",
      label: "Séance à venir",
    });
  });

  test("avant la séance, un brouillon commencé se continue", () => {
    expect(getAgendaPrimaryAction("scheduled", "started")).toEqual({
      kind: "continue_report",
      label: "Continuer le compte rendu",
    });
  });

  test("après la séance, sans compte rendu, on le crée", () => {
    expect(getAgendaPrimaryAction("done", "absent")).toEqual({
      kind: "create_report",
      label: "Créer le compte rendu",
    });
  });

  test("après la séance, un brouillon vide est à remplir", () => {
    expect(getAgendaPrimaryAction("done", "empty")).toEqual({
      kind: "fill_report",
      label: "Remplir le compte rendu",
    });
  });

  test("après la séance, un compte rendu finalisé est à envoyer", () => {
    expect(getAgendaPrimaryAction("done", "finalized")).toEqual({
      kind: "send_report",
      label: "Envoyer au propriétaire",
    });
  });

  test("un compte rendu envoyé se consulte", () => {
    expect(getAgendaPrimaryAction("done", "sent")).toEqual({
      kind: "view_report",
      label: "Voir le compte rendu",
    });
  });
});
```

Mettre à jour l'import en tête du fichier :

```ts
import {
  buildDayAgendaModel,
  deriveAgendaReportState,
  getAgendaPrimaryAction,
  type AgendaAppointmentInput,
  type AgendaReportInput,
} from "./day-agenda";
```

- [ ] **Étape 2 : lancer les tests pour vérifier qu'ils échouent**

```bash
cd apps/web && bunx vitest run src/lib/dashboard/day-agenda.test.ts
```

Attendu : ÉCHEC, `deriveAgendaReportState is not a function`.

- [ ] **Étape 3 : implémenter**

Dans `apps/web/src/lib/dashboard/day-agenda.ts` :

Remplacer `AgendaReportStatus` et `AgendaActionKind` par :

```ts
export type AgendaReportState =
  | "absent"
  | "empty"
  | "started"
  | "finalized"
  | "sent";

export type AgendaActionKind =
  | "cancelled"
  | "upcoming"
  | "prepare_report"
  | "create_report"
  | "fill_report"
  | "continue_report"
  | "send_report"
  | "view_report";
```

Étendre `AgendaReportInput` :

```ts
export type AgendaReportInput = {
  id: string;
  status: AgendaDbReportStatus;
  updatedAt: Date | string | null;
  consultationReason: string;
  notes: string | null;
  anatomicalIssueCount: number;
  recommendationCount: number;
};
```

Remplacer `deriveAgendaReportStatus` par :

```ts
export function deriveAgendaReportState(
  reports: AgendaReportInput[] = [],
): AgendaReportState {
  const latestReport = getLatestAgendaReport(reports);

  if (!latestReport) return "absent";
  if (latestReport.status === "sent") return "sent";
  if (latestReport.status === "finalized") return "finalized";

  return isReportEmpty(latestReport) ? "empty" : "started";
}
```

Remplacer `getAgendaPrimaryAction` par :

```ts
/**
 * Le couple (état de séance, état du compte rendu) détermine l'unique action
 * proposée. Le libellé est celui que lit le praticien : il dit le geste, pas
 * l'état interne du système.
 */
export function getAgendaPrimaryAction(
  sessionState: SessionState,
  reportState: AgendaReportState,
): { kind: AgendaActionKind; label: string } {
  if (sessionState === "cancelled") {
    return { kind: "cancelled", label: "Annulé" };
  }

  if (reportState === "sent") {
    return { kind: "view_report", label: "Voir le compte rendu" };
  }

  if (reportState === "finalized") {
    return sessionState === "done"
      ? { kind: "send_report", label: "Envoyer au propriétaire" }
      : { kind: "view_report", label: "Voir le compte rendu" };
  }

  if (reportState === "started") {
    return { kind: "continue_report", label: "Continuer le compte rendu" };
  }

  if (sessionState === "done") {
    return reportState === "absent"
      ? { kind: "create_report", label: "Créer le compte rendu" }
      : { kind: "fill_report", label: "Remplir le compte rendu" };
  }

  return reportState === "absent"
    ? { kind: "prepare_report", label: "Préparer le compte rendu" }
    : { kind: "upcoming", label: "Séance à venir" };
}
```

Ajouter en tête du fichier :

```ts
import { isReportEmpty } from "@biume/contracts/report";

import { deriveSessionState, type SessionState } from "./session-state";
```

Dans `buildDayAgendaModel`, remplacer le calcul par :

```ts
      const sessionState = deriveSessionState({
        status: appointment.status,
        endAt,
        now,
      });
      const reportState = deriveAgendaReportState(reports);
      const primaryAction = {
        ...getAgendaPrimaryAction(sessionState, reportState),
        ...getAgendaPrimaryActionTarget(appointment.id, reports),
      };
```

et renvoyer `sessionState` et `reportState` dans l'objet, en remplaçant le champ
`reportStatus` de `DayAgendaAppointment` par :

```ts
  sessionState: SessionState;
  reportState: AgendaReportState;
```

Remplacer la constitution de `todo` par :

```ts
  for (const appointment of normalizedAppointments) {
    if (appointment.sessionState === "cancelled") continue;

    const item: AgendaTodoItem = {
      id: `${appointment.id}-${appointment.primaryAction.kind}`,
      appointmentId: appointment.id,
      action: appointment.primaryAction,
      animalName: appointment.patient?.name ?? "Animal non renseigné",
      ownerName: appointment.patient?.owner?.name ?? "Propriétaire inconnu",
      timeLabel: formatAgendaTime(appointment.beginAt),
    };

    if (appointment.primaryAction.kind === "prepare_report") {
      todo.beforeSession.push(item);
    }

    if (
      appointment.primaryAction.kind === "create_report" ||
      appointment.primaryAction.kind === "fill_report" ||
      appointment.primaryAction.kind === "continue_report" ||
      appointment.primaryAction.kind === "send_report"
    ) {
      todo.afterSession.push(item);
    }
  }
```

Dans `dashboard-overview.ts`, remplacer la condition de ton :

```ts
    ...dayAgenda.todo.afterSession.map((item) =>
      toPriorityItem(
        item,
        item.action.kind === "send_report" ? "success" : "warning",
      ),
    ),
```

par la même expression — le `kind` `send_report` est conservé, aucun changement
n'est requis ici. Vérifier néanmoins qu'aucune autre référence à
`"finalize_report"` ou `"prepare"` ne subsiste :

```bash
cd apps/web && grep -rn "finalize_report\|\"prepare\"\|reportStatus" src/
```

Chaque occurrence trouvée doit être migrée vers les nouveaux noms.

Dans `dashboard-priorities-panel.tsx`, remplacer `PriorityAction` par une
version où **toute** action mène quelque part — c'est le défaut signalé dans la
spec, où « Créer le compte rendu » s'affichait en texte gris non cliquable :

```tsx
function PriorityAction({ priority }: { priority: DashboardPriorityItem }) {
  if (priority.actionKind === "cancelled" || priority.actionKind === "upcoming") {
    return null;
  }

  const to =
    priority.actionKind === "view_report" && priority.reportId
      ? "/dashboard/reports/$id"
      : "/dashboard/reports/$id/edit";

  if (priority.reportId) {
    return (
      <Button
        render={
          <Link to={to} params={{ id: priority.reportId }}>
            {priority.actionLabel}
          </Link>
        }
        size="sm"
        variant="outline"
        className="mt-3 h-8 w-full px-2 text-xs sm:w-auto"
      />
    );
  }

  return (
    <Button
      render={
        <Link
          to="/dashboard/agenda"
          search={{ appointmentId: priority.appointmentId }}
        >
          {priority.actionLabel}
        </Link>
      }
      size="sm"
      variant="outline"
      className="mt-3 h-8 w-full px-2 text-xs sm:w-auto"
    />
  );
}
```

Remplacer aussi `toneClassName` par le module de tons du kit :

```tsx
import { toneSoftClassName } from "#/components/dashboard/kit";
```

et supprimer la constante locale `toneClassName`, en mappant les tons du modèle
(`neutral` / `success` / `warning`) vers `Tone` (`neutral` / `done` / `attention`).

- [ ] **Étape 4 : lancer les tests pour vérifier qu'ils passent**

```bash
cd apps/web && bunx vitest run src/lib/dashboard/ src/components/dashboard/overview/
```

Attendu : SUCCÈS. Puis la suite complète :

```bash
cd apps/web && bunx vitest run
```

Attendu : 0 échec.

- [ ] **Étape 5 : commit**

```bash
git add apps/web/src/lib/dashboard apps/web/src/components/dashboard/overview/dashboard-priorities-panel.tsx
git commit -m "feat(web): proposer une action selon l'etat de la seance et du compte rendu"
```

---

### Task 4 : Migration — détacher le compte rendu au lieu de le supprimer

**Files:**
- Modify: `packages/db/src/schema/advancedReport/advancedReport.ts:47`
- Create: `packages/db/src/migrations/0005_detach_report_from_appointment.sql` (généré)

- [ ] **Étape 1 : modifier le schéma**

Dans `packages/db/src/schema/advancedReport/advancedReport.ts`, remplacer :

```ts
    appointmentId: text("appointmentId").references(() => appointments.id, {
      onDelete: "cascade",
    }),
```

par :

```ts
    /**
     * Un compte rendu survit à son rendez-vous. En cascade, nettoyer son agenda
     * détruisait l'historique médical de l'animal — y compris un compte rendu
     * finalisé et déjà envoyé au propriétaire.
     */
    appointmentId: text("appointmentId").references(() => appointments.id, {
      onDelete: "set null",
    }),
```

- [ ] **Étape 2 : générer la migration**

```bash
bun run db:generate
```

Attendu : création de `packages/db/src/migrations/0005_*.sql` contenant un
`ALTER TABLE "advancedReport" DROP CONSTRAINT` suivi d'un `ADD CONSTRAINT ... ON DELETE set null`.
Renommer le fichier en `0005_detach_report_from_appointment.sql` et
répercuter le nom dans `packages/db/src/migrations/meta/_journal.json`.

- [ ] **Étape 3 : vérifier le contenu de la migration**

```bash
cat packages/db/src/migrations/0005_detach_report_from_appointment.sql
```

Attendu : la contrainte visée est bien `advancedReport_appointmentId_appointments_id_fk`
et l'action est `ON DELETE set null`. Aucune autre table ne doit apparaître.

- [ ] **Étape 4 : lancer les tests de compatibilité de schéma**

```bash
bun --filter @biume/db test
```

Attendu : SUCCÈS.

- [ ] **Étape 5 : commit**

```bash
git add packages/db/src/schema/advancedReport/advancedReport.ts packages/db/src/migrations
git commit -m "fix(db): ne plus supprimer un compte rendu avec son rendez-vous"
```

---

### Task 5 : `getAppointments` charge les comptes rendus sur une fenêtre bornée

La page Agenda ne peut pas connaître l'état d'un compte rendu : la requête ne
charge pas la relation. On la charge, en bornant la fenêtre pour ne pas ramener
tout l'historique.

**Files:**
- Modify: `apps/web/src/functions/appointments.function.ts:50-83`
- Modify: `apps/web/src/lib/api/actions/appointments.action.ts`
- Modify: `apps/web/src/lib/api/queries/appointments.query.ts`

**Interfaces:**
- Consomme : `AgendaReportInput` (tâche 3).
- Produit : `getAppointments({ data: { fromISO: string; toISO: string } })` renvoyant
  chaque rendez-vous avec `reports: AgendaReportInput[]`.
  `appointmentsQueryOptions(range: { fromISO: string; toISO: string })`.
  Utilisés par la tâche 12.

- [ ] **Étape 1 : remplacer la fonction serveur**

Dans `apps/web/src/functions/appointments.function.ts`, ajouter le schéma près
des autres :

```ts
const appointmentWindowSchema = z.object({
  fromISO: z.string(),
  toISO: z.string(),
});
```

Remplacer `getAppointments` par :

```ts
export const getAppointments = createServerFn({ method: "GET" })
  .validator(appointmentWindowSchema)
  .handler(async ({ data }) => {
    const organization = await getCurrentOrganization();
    if (!organization) throw new Error("Organization not found");

    const results = await db.query.appointments.findMany({
      where: and(
        eq(appointments.organizationId, organization.id),
        gte(appointments.beginAt, new Date(data.fromISO)),
        lte(appointments.beginAt, new Date(data.toISO)),
      ),
      with: {
        patient: {
          with: {
            owner: {
              columns: {
                id: true,
                name: true,
                email: true,
                image: true,
                phone: true,
              },
            },
            animal: { columns: { code: true, name: true } },
          },
        },
        organization: true,
        // Assez pour appliquer `isReportEmpty` sans ramener le contenu :
        // seuls les identifiants des lignes filles sont comptés.
        reports: {
          columns: {
            id: true,
            status: true,
            updatedAt: true,
            consultationReason: true,
            notes: true,
          },
          with: {
            anatomicalIssues: { columns: { id: true } },
            recommendations: { columns: { id: true } },
          },
        },
      },
    });

    return results.map((appointment) => ({
      ...appointment,
      reports: appointment.reports.map((report) => ({
        id: report.id,
        status: report.status,
        updatedAt: report.updatedAt,
        consultationReason: report.consultationReason,
        notes: report.notes,
        anatomicalIssueCount: report.anatomicalIssues.length,
        recommendationCount: report.recommendations.length,
      })),
    }));
  });
```

Supprimer le `as Appointment[]` et l'import `type Appointment` s'il devient
inutilisé.

- [ ] **Étape 2 : adapter l'action et la requête**

`apps/web/src/lib/api/actions/appointments.action.ts` :

```ts
export function getAppointments(range: { fromISO: string; toISO: string }) {
  return getAppointmentsFn({ data: range });
}
```

`apps/web/src/lib/api/queries/appointments.query.ts` :

```ts
import { queryOptions } from "@tanstack/react-query";

import { getAppointments } from "#/lib/api/actions/appointments.action";

export type AppointmentWindow = { fromISO: string; toISO: string };

/**
 * Fenêtre par défaut : deux mois en arrière pour rattraper les comptes rendus
 * en retard, six mois en avant pour la planification. Charger tout l'historique
 * était tenable tant que la relation `reports` n'était pas jointe.
 */
export function defaultAppointmentWindow(now = new Date()): AppointmentWindow {
  const from = new Date(now);
  from.setMonth(from.getMonth() - 2);
  const to = new Date(now);
  to.setMonth(to.getMonth() + 6);

  return { fromISO: from.toISOString(), toISO: to.toISOString() };
}

export const appointmentsQueryOptions = (range: AppointmentWindow) =>
  queryOptions({
    queryKey: ["appointments", "list", range.fromISO, range.toISO] as const,
    queryFn: () => getAppointments(range),
  });
```

- [ ] **Étape 3 : corriger les appelants**

```bash
cd apps/web && grep -rn "appointmentsQueryOptions" src/
```

Chaque appel sans argument doit recevoir `defaultAppointmentWindow()`. Les
appelants connus sont `src/routes/dashboard/agenda.tsx` et
`src/components/dashboard/agenda/agenda-page.tsx`.

- [ ] **Étape 4 : vérifier**

```bash
cd apps/web && bunx tsc --noEmit && bunx vitest run
```

Attendu : 5 erreurs TypeScript pré-existantes, pas une de plus. 0 test en échec.

- [ ] **Étape 5 : commit**

```bash
git add apps/web/src/functions/appointments.function.ts apps/web/src/lib/api
git commit -m "feat(web): charger l'etat des comptes rendus dans l'agenda"
```

---

### Task 6 : `createAppointment` crée le brouillon de séance

**Files:**
- Create: `apps/web/src/functions/appointment-report.service.ts`
- Test: `apps/web/src/functions/appointment-report.service.test.ts`
- Modify: `apps/web/src/functions/appointments.function.ts:138-171`
- Modify: `apps/web/src/lib/api/actions/appointments.action.ts`

**Interfaces:**
- Consomme : rien des tâches précédentes.
- Produit :
  `createSessionReport(ports: CreateSessionReportPorts, input: CreateSessionReportInput): Promise<{ reportId: string } | null>`
  avec
  `type CreateSessionReportInput = { appointmentId: string; patientId: string; animalName: string | null; beginAt: Date; note: string | null; withReport: boolean }`
  et
  `type CreateSessionReportPorts = { insertReport: (values: { appointmentId: string; patientId: string; title: string; consultationReason: string }) => Promise<string> }`.
  `createAppointment` accepte `withReport?: boolean`. Utilisés par la tâche 9.

- [ ] **Étape 1 : écrire les tests qui échouent**

Créer `apps/web/src/functions/appointment-report.service.test.ts` :

```ts
import { describe, expect, test, vi } from "vitest";

import {
  buildSessionReportTitle,
  createSessionReport,
} from "./appointment-report.service";

const input = {
  appointmentId: "appointment-1",
  patientId: "animal-1",
  animalName: "Oslo",
  beginAt: new Date("2026-08-17T09:00:00.000Z"),
  note: null,
  withReport: true,
};

describe("buildSessionReportTitle", () => {
  test("nomme le compte rendu par l'animal et la date de séance", () => {
    expect(buildSessionReportTitle("Oslo", input.beginAt)).toBe(
      "Séance Oslo — 17/08/2026",
    );
  });

  test("reste lisible quand l'animal n'a pas de nom", () => {
    expect(buildSessionReportTitle(null, input.beginAt)).toBe(
      "Séance — 17/08/2026",
    );
  });
});

describe("createSessionReport", () => {
  test("ne crée rien quand la case n'est pas cochée", async () => {
    const insertReport = vi.fn();

    const result = await createSessionReport(
      { insertReport },
      { ...input, withReport: false },
    );

    expect(result).toBeNull();
    expect(insertReport).not.toHaveBeenCalled();
  });

  test("crée un brouillon rattaché au rendez-vous et à l'animal", async () => {
    const insertReport = vi.fn().mockResolvedValue("report-1");

    const result = await createSessionReport({ insertReport }, input);

    expect(result).toEqual({ reportId: "report-1" });
    expect(insertReport).toHaveBeenCalledWith({
      appointmentId: "appointment-1",
      patientId: "animal-1",
      title: "Séance Oslo — 17/08/2026",
      consultationReason: "",
    });
  });

  test("la note du rendez-vous ne préremplit pas le motif de consultation", async () => {
    const insertReport = vi.fn().mockResolvedValue("report-1");

    await createSessionReport(
      { insertReport },
      { ...input, note: "Portail au fond de la cour" },
    );

    expect(insertReport).toHaveBeenCalledWith(
      expect.objectContaining({ consultationReason: "" }),
    );
  });
});
```

Le troisième test fige une décision : la note d'un rendez-vous est logistique
(accès, horaire), pas clinique. La recopier dans le motif de consultation
remplirait le compte rendu d'un contenu que le praticien n'a pas dicté, et
`isReportEmpty` le compterait à tort comme commencé.

- [ ] **Étape 2 : lancer les tests pour vérifier qu'ils échouent**

```bash
cd apps/web && bunx vitest run src/functions/appointment-report.service.test.ts
```

Attendu : ÉCHEC, `Failed to resolve import "./appointment-report.service"`.

- [ ] **Étape 3 : implémenter le service**

Créer `apps/web/src/functions/appointment-report.service.ts` :

```ts
export type CreateSessionReportInput = {
  appointmentId: string;
  patientId: string;
  animalName: string | null;
  beginAt: Date;
  note: string | null;
  withReport: boolean;
};

export type CreateSessionReportPorts = {
  insertReport: (values: {
    appointmentId: string;
    patientId: string;
    title: string;
    consultationReason: string;
  }) => Promise<string>;
};

export function buildSessionReportTitle(
  animalName: string | null,
  beginAt: Date,
): string {
  const date = new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(beginAt);

  return animalName ? `Séance ${animalName} — ${date}` : `Séance — ${date}`;
}

/**
 * Crée le compte rendu en même temps que le rendez-vous.
 *
 * Le motif de consultation reste vide volontairement : la note d'un rendez-vous
 * est logistique, pas clinique. La recopier remplirait le compte rendu d'un
 * contenu que le praticien n'a pas dicté, et le ferait sortir de l'état « vide »
 * qui le garde hors de la liste des comptes rendus.
 */
export async function createSessionReport(
  ports: CreateSessionReportPorts,
  input: CreateSessionReportInput,
): Promise<{ reportId: string } | null> {
  if (!input.withReport) return null;

  const reportId = await ports.insertReport({
    appointmentId: input.appointmentId,
    patientId: input.patientId,
    title: buildSessionReportTitle(input.animalName, input.beginAt),
    consultationReason: "",
  });

  return { reportId };
}
```

- [ ] **Étape 4 : lancer les tests pour vérifier qu'ils passent**

```bash
cd apps/web && bunx vitest run src/functions/appointment-report.service.test.ts
```

Attendu : SUCCÈS, 5 tests verts.

- [ ] **Étape 5 : brancher sur `createAppointment`**

Dans `apps/web/src/functions/appointments.function.ts`, étendre le schéma :

```ts
const createAppointmentSchema = z.object({
  patientId: z.string(),
  beginAt: z.coerce.date(),
  endAt: z.coerce.date(),
  atHome: z.boolean().optional(),
  note: z.string().optional(),
  notifyOwner: z.boolean().optional(),
  withReport: z.boolean().optional().default(true),
});
```

Après `createAppointmentWithPatientIsolation`, dans `insertAppointment`, une
fois `newAppointment` obtenu :

```ts
        const animal = await db.query.pets.findFirst({
          where: eq(pets.id, data.patientId),
          columns: { name: true },
        });

        await createSessionReport(
          {
            insertReport: async (values) => {
              const reportId = crypto.randomUUID();
              await db.batch([
                db.insert(advancedReport).values({
                  id: reportId,
                  title: values.title,
                  consultationReason: values.consultationReason,
                  patientId: values.patientId,
                  appointmentId: values.appointmentId,
                  notes: "",
                  status: "draft",
                  createdBy: organization.id,
                  createdAt: new Date(),
                }),
                db.insert(reportSectionState).values(
                  buildReportSectionStateRows(
                    reportId,
                    createInitialReportSectionStates(),
                  ),
                ),
              ]);

              return reportId;
            },
          },
          {
            appointmentId: newAppointment.id,
            patientId: data.patientId,
            animalName: animal?.name ?? null,
            beginAt: data.beginAt,
            note: data.note ?? null,
            withReport: data.withReport,
          },
        );

        return newAppointment;
```

Ajouter les imports nécessaires en tête du fichier :

```ts
import { advancedReport, reportSectionState } from "@biume/db/schema/index";
import { createInitialReportSectionStates } from "@biume/contracts/report";

import { buildReportSectionStateRows } from "./report-domain";
import { createSessionReport } from "./appointment-report.service";
```

Adapter l'action :

```ts
export function createAppointment(input: {
  patientId: string;
  beginAt: Date;
  endAt: Date;
  atHome?: boolean;
  note?: string;
  withReport?: boolean;
}) {
  return createAppointmentFn({ data: input });
}
```

- [ ] **Étape 6 : vérifier**

```bash
cd apps/web && bunx tsc --noEmit && bunx vitest run
```

Attendu : 5 erreurs pré-existantes, 0 test en échec.

- [ ] **Étape 7 : commit**

```bash
git add apps/web/src/functions/appointment-report.service.ts apps/web/src/functions/appointment-report.service.test.ts apps/web/src/functions/appointments.function.ts apps/web/src/lib/api/actions/appointments.action.ts
git commit -m "feat(web): creer le compte rendu avec le rendez-vous"
```

---

### Task 7 : Suppression d'un rendez-vous — supprimer le vide, détacher le rempli

**Files:**
- Modify: `apps/web/src/functions/appointment-report.service.ts`
- Modify: `apps/web/src/functions/appointment-report.service.test.ts`
- Modify: `apps/web/src/functions/appointments.function.ts:228-250`

**Interfaces:**
- Consomme : `isReportEmpty`, `ReportContentSummary` (tâche 1).
- Produit :
  `resolveReportsOnAppointmentDeletion(reports: Array<ReportContentSummary & { id: string }>): { deleteIds: string[]; detachIds: string[] }`.

- [ ] **Étape 1 : écrire les tests qui échouent**

Ajouter à `appointment-report.service.test.ts` :

```ts
describe("resolveReportsOnAppointmentDeletion", () => {
  const emptyReport = {
    id: "vide",
    consultationReason: "",
    notes: null,
    anatomicalIssueCount: 0,
    recommendationCount: 0,
  };
  const startedReport = {
    id: "rempli",
    consultationReason: "Boiterie postérieur droit",
    notes: null,
    anatomicalIssueCount: 2,
    recommendationCount: 1,
  };

  test("un brouillon vide part avec le rendez-vous", () => {
    expect(resolveReportsOnAppointmentDeletion([emptyReport])).toEqual({
      deleteIds: ["vide"],
      detachIds: [],
    });
  });

  test("un compte rendu rempli survit, détaché", () => {
    expect(resolveReportsOnAppointmentDeletion([startedReport])).toEqual({
      deleteIds: [],
      detachIds: ["rempli"],
    });
  });

  test("les deux cas cohabitent sur un même rendez-vous", () => {
    expect(
      resolveReportsOnAppointmentDeletion([emptyReport, startedReport]),
    ).toEqual({ deleteIds: ["vide"], detachIds: ["rempli"] });
  });

  test("aucun compte rendu, rien à faire", () => {
    expect(resolveReportsOnAppointmentDeletion([])).toEqual({
      deleteIds: [],
      detachIds: [],
    });
  });
});
```

Ajouter `resolveReportsOnAppointmentDeletion` à l'import du fichier de test.

- [ ] **Étape 2 : lancer les tests pour vérifier qu'ils échouent**

```bash
cd apps/web && bunx vitest run src/functions/appointment-report.service.test.ts
```

Attendu : ÉCHEC, `resolveReportsOnAppointmentDeletion is not a function`.

- [ ] **Étape 3 : implémenter**

Ajouter à `apps/web/src/functions/appointment-report.service.ts` :

```ts
import { isReportEmpty, type ReportContentSummary } from "@biume/contracts/report";

/**
 * Supprimer un rendez-vous ne doit jamais détruire un compte rendu que le
 * praticien a commencé — il peut avoir été finalisé et envoyé au propriétaire.
 * Seule la coquille encore vide, créée automatiquement avec le rendez-vous,
 * part avec lui.
 */
export function resolveReportsOnAppointmentDeletion(
  reports: Array<ReportContentSummary & { id: string }>,
): { deleteIds: string[]; detachIds: string[] } {
  const deleteIds: string[] = [];
  const detachIds: string[] = [];

  for (const report of reports) {
    if (isReportEmpty(report)) {
      deleteIds.push(report.id);
    } else {
      detachIds.push(report.id);
    }
  }

  return { deleteIds, detachIds };
}
```

- [ ] **Étape 4 : lancer les tests pour vérifier qu'ils passent**

```bash
cd apps/web && bunx vitest run src/functions/appointment-report.service.test.ts
```

Attendu : SUCCÈS, 9 tests verts au total dans le fichier.

- [ ] **Étape 5 : brancher sur `deleteAppointment`**

Remplacer le corps du `try` de `deleteAppointment` dans
`apps/web/src/functions/appointments.function.ts` :

```ts
      const organization = await getCurrentOrganization();
      if (!organization) throw new Error("Organization not found");

      const linkedReports = await db.query.advancedReport.findMany({
        where: and(
          eq(advancedReport.appointmentId, data.appointmentId),
          eq(advancedReport.createdBy, organization.id),
        ),
        columns: {
          id: true,
          consultationReason: true,
          notes: true,
        },
        with: {
          anatomicalIssues: { columns: { id: true } },
          recommendations: { columns: { id: true } },
        },
      });

      const { deleteIds } = resolveReportsOnAppointmentDeletion(
        linkedReports.map((report) => ({
          id: report.id,
          consultationReason: report.consultationReason,
          notes: report.notes,
          anatomicalIssueCount: report.anatomicalIssues.length,
          recommendationCount: report.recommendations.length,
        })),
      );

      // Les comptes rendus non vides sont détachés par la contrainte
      // `ON DELETE set null` posée à la tâche 4.
      if (deleteIds.length > 0) {
        await db
          .delete(advancedReport)
          .where(inArray(advancedReport.id, deleteIds));
      }

      const [deletedAppointment] = await db
        .delete(appointments)
        .where(
          and(
            eq(appointments.id, data.appointmentId),
            eq(appointments.organizationId, organization.id),
          ),
        )
        .returning();

      return deletedAppointment;
```

Ajouter `inArray` à l'import `drizzle-orm` et
`resolveReportsOnAppointmentDeletion` à l'import du service.

- [ ] **Étape 6 : vérifier**

```bash
cd apps/web && bunx tsc --noEmit && bunx vitest run
```

Attendu : 5 erreurs pré-existantes, 0 test en échec.

- [ ] **Étape 7 : commit**

```bash
git add apps/web/src/functions
git commit -m "feat(web): preserver un compte rendu commence a la suppression du rendez-vous"
```

---

### Task 8 : Masquer les brouillons vides de la page Comptes rendus

**Files:**
- Modify: `apps/web/src/functions/reports.function.ts` (fonction `loadAllReportRows`)

- [ ] **Étape 1 : filtrer les lignes**

`loadAllReportRows` charge déjà les relations `anatomicalIssues` et
`recommendations` : le filtre est gratuit et se fait en mémoire. Après le
`db.query.advancedReport.findMany(...)`, remplacer le `return` par :

```ts
  const rows = await db.query.advancedReport.findMany({ /* inchangé */ });

  /**
   * Un compte rendu créé automatiquement avec son rendez-vous n'a encore rien
   * dedans. Il vit sur son rendez-vous dans l'agenda et n'entre dans cette
   * liste que lorsque le praticien y a écrit quelque chose — sinon la liste se
   * remplirait d'une coquille par séance planifiée.
   */
  return rows.filter(
    (row) =>
      !isReportEmpty({
        consultationReason: row.consultationReason,
        notes: row.notes,
        anatomicalIssueCount: row.anatomicalIssues.length,
        recommendationCount: row.recommendations.length,
      }),
  );
```

Ajouter à l'import de `@biume/contracts/report` : `isReportEmpty`.

- [ ] **Étape 2 : vérifier qu'aucun test ne régresse**

```bash
cd apps/web && bunx vitest run && bunx tsc --noEmit
```

Attendu : 0 test en échec, 5 erreurs pré-existantes.

- [ ] **Étape 3 : commit**

```bash
git add apps/web/src/functions/reports.function.ts
git commit -m "feat(web): garder les comptes rendus vides hors de la liste"
```

---

### Task 9 : Case « Préparer le compte rendu » dans le dialogue de création

**Files:**
- Modify: `apps/web/src/components/dashboard/agenda/new-appointment-dialog.tsx`

**Interfaces:**
- Consomme : `createAppointment` avec `withReport` (tâche 6).
- Produit : `onCreateAppointment` reçoit `withReport: boolean`.

- [ ] **Étape 1 : ajouter le champ**

Étendre le type de la prop :

```ts
  onCreateAppointment: (input: {
    atHome: boolean;
    beginAt: Date;
    endAt: Date;
    note?: string;
    patientId: string;
    withReport: boolean;
  }) => Promise<unknown> | unknown;
```

Dans `handleSubmit`, la case étant cochée par défaut, lire son état :

```ts
      withReport: formData.get("withReport") === "on",
```

Insérer le bloc juste avant le champ Note, en réutilisant la structure du bloc
« Rendez-vous à domicile » existant, mais sur les tokens :

```tsx
            <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-muted px-4 py-3">
              <div className="min-w-0">
                <Label
                  htmlFor="appointment-with-report"
                  className="flex items-center gap-2"
                >
                  <NotepadText className="size-4 text-muted-foreground" />
                  Préparer le compte rendu de cette séance
                </Label>
                <p className="mt-1 text-xs text-muted-foreground">
                  Il vous attendra sur ce rendez-vous après la séance.
                </p>
              </div>
              <Switch
                id="appointment-with-report"
                name="withReport"
                defaultChecked
              />
            </div>
```

Ajouter `NotepadText` à l'import `lucide-react`.

- [ ] **Étape 2 : migrer le reste du dialogue sur les tokens**

Remplacer dans ce fichier toutes les couleurs codées en dur :
`text-slate-950` → `text-foreground`, `text-slate-500` / `text-slate-400` →
`text-muted-foreground`, `border-slate-200` → `border-border`, `bg-slate-50` →
`bg-muted`, et le pavé d'icône `border-emerald-200 bg-emerald-50 text-emerald-800`
→ `border-primary-border bg-primary-surface text-primary` — le violet, parce que
créer un rendez-vous est une action, pas un état.

Vérifier :

```bash
cd apps/web && grep -nE "slate-|emerald-|sky-|amber-" src/components/dashboard/agenda/new-appointment-dialog.tsx
```

Attendu : aucun résultat.

- [ ] **Étape 3 : vérifier**

```bash
cd apps/web && bunx tsc --noEmit
```

Attendu : 5 erreurs pré-existantes. Le type de `onCreateAppointment` ayant
changé, `agenda-page.tsx` signalera une erreur — elle est résolue à la tâche 12.
Si l'erreur bloque, passer `withReport` dans l'appel existant dès maintenant.

- [ ] **Étape 4 : commit**

```bash
git add apps/web/src/components/dashboard/agenda/new-appointment-dialog.tsx
git commit -m "feat(web): proposer de preparer le compte rendu a la creation du rendez-vous"
```

---

### Task 10 : Carte de rendez-vous actionnable

**Files:**
- Create: `apps/web/src/components/dashboard/agenda/appointment-card.tsx`
- Test: `apps/web/src/components/dashboard/agenda/appointment-card.test.tsx`

**Interfaces:**
- Consomme : `DayAgendaAppointment`, `AgendaActionKind` (tâche 3) ;
  `sessionStateLabel` (tâche 2) ; `ListRow`, `StatusPill`, `Tone` (kit, lot 1).
- Produit : `AppointmentCard` avec les props
  `{ appointment: DayAgendaAppointment; onPrimaryAction: (appointment: DayAgendaAppointment) => void; actions?: ReactNode }`.
  Utilisé par la tâche 12.

- [ ] **Étape 1 : écrire les tests qui échouent**

Créer `apps/web/src/components/dashboard/agenda/appointment-card.test.tsx` :

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import { buildDayAgendaModel } from "#/lib/dashboard/day-agenda";

import { AppointmentCard } from "./appointment-card";

const now = new Date("2026-08-17T14:00:00.000Z");

function cardFor(overrides: {
  endAt: Date;
  status?: "CREATED" | "CANCELLED";
  reports?: [];
}) {
  const model = buildDayAgendaModel({
    now,
    selectedDate: now,
    appointments: [
      {
        id: "appointment-1",
        beginAt: new Date("2026-08-17T09:00:00.000Z"),
        endAt: overrides.endAt,
        status: overrides.status ?? "CREATED",
        reports: overrides.reports ?? [],
        patient: {
          id: "animal-1",
          name: "Oslo",
          animal: { name: "Chien", code: "dog" },
          owner: { id: "owner-1", name: "Camille Martin" },
        },
      },
    ],
  });

  return model.appointments[0]!;
}

describe("AppointmentCard", () => {
  test("une séance passée sans compte rendu propose de le créer", () => {
    render(
      <AppointmentCard
        appointment={cardFor({ endAt: new Date("2026-08-17T10:00:00.000Z") })}
        onPrimaryAction={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("button", { name: "Créer le compte rendu" }),
    ).toBeTruthy();
    expect(screen.getByText("Terminé")).toBeTruthy();
  });

  test("une séance à venir se lit « Prévu » et ne propose pas de bouton", () => {
    render(
      <AppointmentCard
        appointment={cardFor({ endAt: new Date("2026-08-17T18:00:00.000Z") })}
        onPrimaryAction={vi.fn()}
      />,
    );

    expect(screen.getByText("Prévu")).toBeTruthy();
    expect(
      screen.queryByRole("button", { name: /compte rendu/i }),
    ).toBeNull();
  });

  test("une séance annulée n'expose aucune action", () => {
    render(
      <AppointmentCard
        appointment={cardFor({
          endAt: new Date("2026-08-17T10:00:00.000Z"),
          status: "CANCELLED",
        })}
        onPrimaryAction={vi.fn()}
      />,
    );

    expect(screen.getByText("Annulé")).toBeTruthy();
    expect(screen.queryByRole("button")).toBeNull();
  });

  test("le nom de l'animal et du propriétaire sont lisibles", () => {
    render(
      <AppointmentCard
        appointment={cardFor({ endAt: new Date("2026-08-17T10:00:00.000Z") })}
        onPrimaryAction={vi.fn()}
      />,
    );

    expect(screen.getByText("Oslo")).toBeTruthy();
    expect(screen.getByText(/Camille Martin/)).toBeTruthy();
  });
});
```

Remarque : le second cas produit `prepare_report` si le rendez-vous n'a aucun
compte rendu. Avec la case cochée par défaut, un rendez-vous réel en aura un —
mais un rendez-vous créé sans compte rendu doit pouvoir en obtenir un. Le test
vérifie donc l'absence de bouton **contenant « compte rendu »** uniquement dans
le cas `upcoming` ; adapter le `reports` du cas à un brouillon vide si le
comportement observé diffère, en gardant l'intention : avant la séance, rien ne
presse.

- [ ] **Étape 2 : lancer les tests pour vérifier qu'ils échouent**

```bash
cd apps/web && bunx vitest run src/components/dashboard/agenda/appointment-card.test.tsx
```

Attendu : ÉCHEC, `Failed to resolve import "./appointment-card"`.

- [ ] **Étape 3 : implémenter**

Créer `apps/web/src/components/dashboard/agenda/appointment-card.tsx` :

```tsx
import { Home, MapPin, PawPrint } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "#/components/ui/button";
import { StatusPill, type Tone } from "#/components/dashboard/kit";
import type { DayAgendaAppointment } from "#/lib/dashboard/day-agenda";
import { sessionStateLabel } from "#/lib/dashboard/session-state";

type AppointmentCardProps = {
  appointment: DayAgendaAppointment;
  onPrimaryAction: (appointment: DayAgendaAppointment) => void;
  actions?: ReactNode;
};

const sessionTone: Record<DayAgendaAppointment["sessionState"], Tone> = {
  scheduled: "neutral",
  done: "done",
  cancelled: "problem",
};

/**
 * Un rendez-vous et ce qu'il attend du praticien.
 *
 * L'état et l'action sont posés à même la carte, jamais derrière un clic : les
 * ostéopathes n'exploreront pas l'interface pour découvrir qu'un compte rendu
 * les attend.
 */
export function AppointmentCard({
  actions,
  appointment,
  onPrimaryAction,
}: AppointmentCardProps) {
  const { primaryAction } = appointment;
  const showPrimaryAction =
    primaryAction.kind !== "cancelled" && primaryAction.kind !== "upcoming";

  return (
    <article className="rounded-card border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted-foreground">
            {formatTime(appointment.beginAt)} – {formatTime(appointment.endAt)}
            <span className="ml-2">· {appointment.durationLabel}</span>
          </p>
          <h3 className="mt-1 truncate text-base font-semibold tracking-tight text-foreground">
            {appointment.patient?.name ?? "Animal non renseigné"}
          </h3>
          <p className="mt-0.5 truncate text-sm text-muted-foreground">
            {appointment.patient?.owner?.name ?? "Propriétaire inconnu"}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <StatusPill tone={sessionTone[appointment.sessionState]}>
            {sessionStateLabel(appointment.sessionState)}
          </StatusPill>
          {actions}
        </div>
      </div>

      <div className="mt-3 grid gap-1.5 text-sm text-ink-muted">
        <span className="flex items-center gap-2">
          <PawPrint className="size-3.5 text-muted-foreground" aria-hidden />
          {appointment.patient?.animal?.name ?? "Espèce non renseignée"}
        </span>
        <span className="flex items-center gap-2">
          {appointment.atHome ? (
            <Home className="size-3.5 text-muted-foreground" aria-hidden />
          ) : (
            <MapPin className="size-3.5 text-muted-foreground" aria-hidden />
          )}
          {appointment.atHome ? "À domicile" : "Au cabinet"}
        </span>
        {appointment.note ? (
          <p className="mt-1 rounded-lg bg-muted px-3 py-2 text-sm leading-6">
            {appointment.note}
          </p>
        ) : null}
      </div>

      {showPrimaryAction ? (
        <Button
          className="mt-4 w-full sm:w-auto"
          onClick={() => onPrimaryAction(appointment)}
        >
          {primaryAction.label}
        </Button>
      ) : (
        <p className="mt-4 text-sm text-muted-foreground">
          {primaryAction.label}
        </p>
      )}
    </article>
  );
}

function formatTime(value: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}
```

- [ ] **Étape 4 : lancer les tests pour vérifier qu'ils passent**

```bash
cd apps/web && bunx vitest run src/components/dashboard/agenda/appointment-card.test.tsx
```

Attendu : SUCCÈS, 4 tests verts.

- [ ] **Étape 5 : commit**

```bash
git add apps/web/src/components/dashboard/agenda/appointment-card.tsx apps/web/src/components/dashboard/agenda/appointment-card.test.tsx
git commit -m "feat(web): rendre chaque rendez-vous actionnable"
```

---

### Task 11 : Menu d'actions et dialogue de modification

**Files:**
- Create: `apps/web/src/components/dashboard/agenda/appointment-actions-menu.tsx`
- Create: `apps/web/src/components/dashboard/agenda/edit-appointment-dialog.tsx`

**Interfaces:**
- Consomme : `updateAppointment`, `deleteAppointment`
  (`apps/web/src/lib/api/actions/appointments.action.ts`, déjà exposées).
- Produit : `AppointmentActionsMenu` avec
  `{ onEdit: () => void; onCancel: () => void; onDelete: () => void; disabled?: boolean }`
  et `EditAppointmentDialog` avec
  `{ appointment: DayAgendaAppointment | null; open: boolean; onOpenChange: (open: boolean) => void; onSubmit: (input: { appointmentId: string; beginAt: Date; endAt: Date; atHome: boolean; note?: string }) => Promise<unknown>; isSubmitting: boolean }`.
  Utilisés par la tâche 12.

- [ ] **Étape 1 : écrire le menu**

Créer `apps/web/src/components/dashboard/agenda/appointment-actions-menu.tsx` :

```tsx
import { CalendarX2, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import { Button } from "#/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@biume/ui/components/dropdown-menu";

type AppointmentActionsMenuProps = {
  onEdit: () => void;
  onCancel: () => void;
  onDelete: () => void;
  disabled?: boolean;
};

/**
 * Les gestes secondaires d'un rendez-vous.
 *
 * Ils sont regroupés ici, et seulement eux : ce qui compte — l'état de la
 * séance et l'action attendue — reste visible sur la carte. Un menu est
 * acceptable pour modifier ou supprimer, pas pour « remplir le compte rendu ».
 */
export function AppointmentActionsMenu({
  disabled,
  onCancel,
  onDelete,
  onEdit,
}: AppointmentActionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="sm" disabled={disabled}>
            <MoreHorizontal className="size-4" />
            <span className="sr-only">Actions du rendez-vous</span>
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onEdit}>
          <Pencil className="size-4" />
          Modifier
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onCancel}>
          <CalendarX2 className="size-4" />
          Annuler la séance
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={onDelete}>
          <Trash2 className="size-4" />
          Supprimer
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

Vérifier la signature réelle de `DropdownMenuItem` et de `DropdownMenuTrigger`
dans `packages/ui/src/components/dropdown-menu.tsx` avant d'écrire — ce dépôt
utilise Base UI et la prop `render`, pas `asChild`.

- [ ] **Étape 2 : écrire le dialogue de modification**

Créer `apps/web/src/components/dashboard/agenda/edit-appointment-dialog.tsx` en
reprenant la structure de `new-appointment-dialog.tsx` (mêmes champs date,
début, fin, à domicile, note), sans le sélecteur d'animal ni la case du compte
rendu, avec pour titre « Modifier le rendez-vous » et pour bouton
« Enregistrer ». Les valeurs par défaut viennent de la prop `appointment`.
Aucune couleur codée en dur.

- [ ] **Étape 3 : vérifier**

```bash
cd apps/web && bunx tsc --noEmit && bunx vitest run
```

Attendu : 5 erreurs pré-existantes hors tâche 12, 0 test en échec.

- [ ] **Étape 4 : commit**

```bash
git add apps/web/src/components/dashboard/agenda
git commit -m "feat(web): pouvoir modifier, annuler et supprimer un rendez-vous"
```

---

### Task 12 : Page Agenda reconstruite

Dernière tâche : elle assemble tout et supprime le calendrier maison au profit
du modèle de domaine.

**Files:**
- Modify: `apps/web/src/components/dashboard/agenda/agenda-page.tsx`
- Modify: `apps/web/src/routes/dashboard/agenda.tsx`

- [ ] **Étape 1 : réécrire la page**

Remplacer intégralement `agenda-page.tsx`. Contraintes :

- Utiliser `PageHeader`, `Panel`, `PanelHeader`, `EmptyState` du kit ; supprimer
  les fonctions locales `Panel`, `MetricCard` et `StatusPill`.
- Supprimer les trois `MetricCard` en tête de page : « Journée », « À venir » et
  « Terminés » n'entraînent aucune décision, et la spec réserve la carte de
  métrique aux chiffres qui en déclenchent une.
- Charger via `appointmentsQueryOptions(defaultAppointmentWindow())`.
- Construire le modèle du jour avec `buildDayAgendaModel({ appointments, now: new Date(), selectedDate })`.
- Rendre chaque rendez-vous de la journée avec `AppointmentCard`, en passant un
  `AppointmentActionsMenu` dans la prop `actions`.
- `onPrimaryAction` : si `primaryAction.reportId` existe, naviguer vers
  `/dashboard/reports/$id/edit` (ou `/dashboard/reports/$id` pour `view_report`) ;
  sinon appeler `createReport({ petId, appointmentId, status: "draft" })` puis
  naviguer vers le brouillon créé.
- Conserver la grille mensuelle et les fonctions de date en bas de fichier, mais
  migrer ses couleurs : `bg-white` → `bg-card`, `bg-slate-50` → `bg-muted`,
  `text-slate-400` → `text-muted-foreground`, la sélection
  `bg-emerald-50 ring-emerald-500` → `bg-primary-surface ring-primary`, et le
  jour courant `bg-slate-950 text-white` → `bg-primary text-primary-foreground`.
- Le panneau « À venir » liste les prochains rendez-vous avec `GroupedList` et
  `GroupedListRow` (tâche 13), pas une carte par ligne.
- Les en-têtes de section utilisent `SectionIntro`, et la page `PageHeader` avec
  son `eyebrow`.

**Ordre d'exécution :** la tâche 13 doit être terminée avant celle-ci, puisque
la page consomme `GroupedList`, `SectionIntro` et `IconTile`.

- [ ] **Étape 2 : adapter la route**

Dans `apps/web/src/routes/dashboard/agenda.tsx` :

```ts
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(
      appointmentsQueryOptions(defaultAppointmentWindow()),
    ),
```

- [ ] **Étape 3 : vérifier l'absence de couleur codée en dur**

```bash
cd apps/web && grep -rnE "slate-|emerald-|sky-|amber-" src/components/dashboard/agenda/ src/routes/dashboard/agenda.tsx
```

Attendu : aucun résultat.

- [ ] **Étape 4 : vérifier**

```bash
cd apps/web && bunx tsc --noEmit && bunx vitest run
cd /Users/mathieuchambaud/Documents/projects/biume-v2 && bun run --filter @biume/web build
```

Attendu : 5 erreurs TypeScript pré-existantes et pas une de plus, 0 test en
échec, build vert.

- [ ] **Étape 5 : vérification manuelle**

```bash
bun run dev:web
```

Parcours à dérouler, dans cet ordre :

1. Créer un rendez-vous dans le passé avec la case cochée → il apparaît
   « Terminé » avec « Remplir le compte rendu ».
2. Ouvrir la page Comptes rendus → le brouillon vide **n'y est pas**.
3. Cliquer « Remplir le compte rendu », saisir un motif, revenir → la page
   Comptes rendus le liste maintenant.
4. Créer un rendez-vous dans le futur → il apparaît « Prévu », sans bouton.
5. Créer un rendez-vous avec la case décochée, séance passée → « Créer le
   compte rendu ».
6. Supprimer un rendez-vous dont le compte rendu est vide → le compte rendu
   disparaît aussi.
7. Supprimer un rendez-vous dont le compte rendu contient un motif → le compte
   rendu reste dans la liste.

- [ ] **Étape 6 : commit**

```bash
git add apps/web/src/components/dashboard/agenda/agenda-page.tsx apps/web/src/routes/dashboard/agenda.tsx
git commit -m "feat(web): reconstruire l'agenda sur le kit et le modele de seance"
```

---

### Task 13 : Porter le langage de `select-organization` dans le kit

`select-organization.tsx` est le meilleur travail de design du dépôt, et le
système mobile s'en réclame déjà explicitement. Mais il n'existe que là, sous
forme de classes recopiées. Cette tâche l'extrait pour que chaque page suivante
en hérite au lieu de le réinventer.

Elle passe **avant** la tâche 12 dans l'ordre d'exécution réel, puisque la page
Agenda doit consommer ces primitives. Elle est numérotée 13 pour ne pas
renuméroter un plan déjà relu.

**Files:**
- Create: `apps/web/src/components/dashboard/kit/icon-tile.tsx`
- Create: `apps/web/src/components/dashboard/kit/grouped-list.tsx`
- Create: `apps/web/src/components/dashboard/kit/section-intro.tsx`
- Test: `apps/web/src/components/dashboard/kit/grouped-list.test.tsx`
- Modify: `apps/web/src/components/dashboard/kit/page-header.tsx`
- Modify: `apps/web/src/components/dashboard/kit/index.ts`

**Interfaces:**
- Consomme : `Tone`, `toneSoftClassName` (kit, lot 1).
- Produit : `IconTile`, `GroupedList`, `GroupedListRow`, `SectionIntro`, et
  `PageHeader` gagne une prop `eyebrow?: string`. Utilisés par les tâches 12, 14
  et 15, et par les lots 3 et 4.

- [ ] **Étape 1 : écrire les tests qui échouent**

Créer `apps/web/src/components/dashboard/kit/grouped-list.test.tsx` :

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Building2 } from "lucide-react";
import { describe, expect, test, vi } from "vitest";

import { GroupedList, GroupedListRow } from "./grouped-list";

describe("GroupedListRow", () => {
  test("une ligne sélectionnable est un bouton nommé par son titre", async () => {
    const onSelect = vi.fn();
    render(
      <GroupedList>
        <GroupedListRow
          icon={Building2}
          title="Cabinet du Vieux Chêne"
          meta="cabinet-vieux-chene.biume"
          onSelect={onSelect}
        />
      </GroupedList>,
    );

    const row = screen.getByRole("button", { name: /Cabinet du Vieux Chêne/ });
    await userEvent.click(row);

    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  test("une ligne désactivée n'appelle pas onSelect", async () => {
    const onSelect = vi.fn();
    render(
      <GroupedList>
        <GroupedListRow
          icon={Building2}
          title="Cabinet du Vieux Chêne"
          onSelect={onSelect}
          disabled
        />
      </GroupedList>,
    );

    await userEvent.click(
      screen.getByRole("button", { name: /Cabinet du Vieux Chêne/ }),
    );

    expect(onSelect).not.toHaveBeenCalled();
  });

  test("une ligne sans onSelect n'est pas un bouton", () => {
    render(
      <GroupedList>
        <GroupedListRow icon={Building2} title="Cabinet du Vieux Chêne" />
      </GroupedList>,
    );

    expect(screen.queryByRole("button")).toBeNull();
    expect(screen.getByText("Cabinet du Vieux Chêne")).toBeTruthy();
  });
});
```

Vérifier que `@testing-library/user-event` est disponible :

```bash
cd apps/web && grep -n "user-event" package.json
```

S'il est absent, utiliser `fireEvent.click` de `@testing-library/react` plutôt
que d'ajouter une dépendance — le lot 1 a montré qu'un `bun add` re-résout le
graphe entier.

- [ ] **Étape 2 : lancer les tests pour vérifier qu'ils échouent**

```bash
cd apps/web && bunx vitest run src/components/dashboard/kit/grouped-list.test.tsx
```

Attendu : ÉCHEC, `Failed to resolve import "./grouped-list"`.

- [ ] **Étape 3 : implémenter le pavé d'icône**

Créer `apps/web/src/components/dashboard/kit/icon-tile.tsx` :

```tsx
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "#/lib/utils";

import { toneSoftClassName, type Tone } from "./tone";

type IconTileProps = {
  icon?: LucideIcon;
  tone?: Tone;
  size?: "sm" | "md";
  /** Un logo ou une image, à la place de l'icône. */
  children?: ReactNode;
  className?: string;
};

/**
 * Le carré qui identifie une ligne ou une carte.
 *
 * Repris de `select-organization`, où il porte le logo d'une entreprise ou son
 * initiale par défaut. Sa taille est fixe : c'est ce qui aligne verticalement
 * toutes les lignes d'une liste, quelle que soit la longueur de leur contenu.
 */
export function IconTile({
  children,
  className,
  icon: Icon,
  size = "md",
  tone = "neutral",
}: IconTileProps) {
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden border transition duration-300",
        size === "md" ? "size-12 rounded-xl" : "size-9 rounded-lg",
        toneSoftClassName(tone),
        className,
      )}
    >
      {children ?? (Icon ? <IconTileGlyph icon={Icon} size={size} /> : null)}
    </span>
  );
}

function IconTileGlyph({ icon: Icon, size }: { icon: LucideIcon; size: "sm" | "md" }) {
  return <Icon className={size === "md" ? "size-5" : "size-4"} aria-hidden />;
}
```

- [ ] **Étape 4 : implémenter la liste groupée**

Créer `apps/web/src/components/dashboard/kit/grouped-list.tsx` :

```tsx
import { ArrowRight, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "#/lib/utils";

import { IconTile } from "./icon-tile";
import type { Tone } from "./tone";

type GroupedListProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Une liste d'éléments de même nature.
 *
 * Motif structurant de `select-organization` : **une seule** surface, dont les
 * lignes sont séparées par un filet. Empiler une carte par élément fabrique un
 * bruit visuel qui fait perdre la colonne de lecture, et `AGENTS.md` réserve la
 * carte aux éléments répétés encadrés, pas à chaque ligne.
 */
export function GroupedList({ children, className }: GroupedListProps) {
  return (
    <div
      className={cn(
        "divide-y divide-border overflow-hidden rounded-card border border-border bg-card",
        className,
      )}
    >
      {children}
    </div>
  );
}

type GroupedListRowProps = {
  icon?: LucideIcon;
  iconTone?: Tone;
  /** Un logo, à la place de l'icône. */
  iconContent?: ReactNode;
  title: string;
  meta?: string;
  badge?: ReactNode;
  /** Remplace l'affordance de droite : un bouton, un menu, un état. */
  trailing?: ReactNode;
  onSelect?: () => void;
  disabled?: boolean;
};

export function GroupedListRow({
  badge,
  disabled,
  icon,
  iconContent,
  iconTone = "neutral",
  meta,
  onSelect,
  title,
  trailing,
}: GroupedListRowProps) {
  const content = (
    <>
      <IconTile icon={icon} tone={iconTone}>
        {iconContent}
      </IconTile>

      <span className="min-w-0">
        <span className="flex items-center gap-2">
          <span className="truncate text-sm font-semibold text-foreground sm:text-base">
            {title}
          </span>
          {badge}
        </span>
        {meta ? (
          <span className="mt-1 block truncate text-sm text-muted-foreground">
            {meta}
          </span>
        ) : null}
      </span>

      {trailing ?? (onSelect ? <GroupedListAffordance /> : <span />)}
    </>
  );

  const layout =
    "grid w-full grid-cols-[auto_1fr_auto] items-center gap-4 px-4 py-4 text-left sm:px-5";

  if (!onSelect) {
    return <div className={layout}>{content}</div>;
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onSelect}
      className={cn(
        layout,
        "group transition duration-300 ease-out hover:bg-muted active:scale-[0.99]",
        "disabled:cursor-not-allowed disabled:opacity-70 disabled:active:scale-100",
      )}
    >
      {content}
    </button>
  );
}

function GroupedListAffordance() {
  return (
    <span className="flex size-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition duration-300 group-hover:-translate-y-px group-hover:text-foreground">
      <ArrowRight className="size-4" aria-hidden />
    </span>
  );
}
```

- [ ] **Étape 5 : implémenter l'intitulé de section et l'eyebrow**

Créer `apps/web/src/components/dashboard/kit/section-intro.tsx` :

```tsx
import type { ReactNode } from "react";

type SectionIntroProps = {
  /** Intitulé court au-dessus du titre. Nomme la nature de ce qui suit. */
  eyebrow: string;
  title: string;
  actions?: ReactNode;
};

/**
 * L'en-tête d'une section, repris de `select-organization`.
 *
 * L'intitulé coloré porte la catégorie, le titre porte la question à laquelle
 * la section répond. Cette paire donne au praticien un repère de lecture
 * constant d'une page à l'autre.
 */
export function SectionIntro({ actions, eyebrow, title }: SectionIntroProps) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <p className="text-sm font-medium text-primary">{eyebrow}</p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight text-foreground">
          {title}
        </h2>
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>
      ) : null}
    </div>
  );
}
```

Dans `page-header.tsx`, ajouter la prop `eyebrow` :

```tsx
type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
};
```

et la rendre avant le `h1` :

```tsx
        {eyebrow ? (
          <p className="text-sm font-medium text-primary">{eyebrow}</p>
        ) : null}
```

Exporter le tout depuis `kit/index.ts` :

```ts
export { GroupedList, GroupedListRow } from "./grouped-list";
export { IconTile } from "./icon-tile";
export { SectionIntro } from "./section-intro";
```

- [ ] **Étape 6 : lancer les tests pour vérifier qu'ils passent**

```bash
cd apps/web && bunx vitest run src/components/dashboard/kit/
```

Attendu : SUCCÈS, 3 tests verts.

- [ ] **Étape 7 : commit**

```bash
git add apps/web/src/components/dashboard/kit
git commit -m "feat(web): porter le langage de select-organization dans le kit"
```

---

### Task 14 : Pages d'entreprise sur les tokens, et le mot « entreprise »

**Files:**
- Modify: `apps/web/src/routes/select-organization.tsx`
- Modify: `apps/web/src/routes/create-organization.tsx`
- Modify: `apps/web/src/routes/dashboard/settings.tsx`
- Modify: `apps/web/src/components/dashboard/layout/dashboard-page-banner.tsx`
- Modify: `apps/web/src/components/dashboard/dialogs/account-switch-dialog.tsx`

**Interfaces:**
- Consomme : `GroupedList`, `GroupedListRow`, `IconTile`, `SectionIntro`,
  `EmptyState`, `StatusPill` (tâches 13 et lot 1).
- Produit : rien de nouveau.

- [ ] **Étape 1 : renommer le vocabulaire visible**

Relever l'inventaire exact avant de toucher quoi que ce soit :

```bash
cd apps/web && grep -rn -i "organisation" src/routes src/components
```

Attendu : 26 occurrences sur 5 fichiers. Remplacer **uniquement les chaînes
lues par un praticien**, en accordant le genre — « une organisation » devient
« une entreprise », « l'organisation active » devient « l'entreprise active ».
Traductions à appliquer :

| Avant | Après |
| --- | --- |
| Choisir une organisation | Choisir une entreprise |
| Organisations disponibles | Entreprises disponibles |
| Aucune organisation rattachée | Aucune entreprise rattachée |
| Créer une organisation | Créer une entreprise |
| Créer ma première organisation | Créer ma première entreprise |
| Chaque organisation possède… | Chaque entreprise possède… |
| Impossible d'ouvrir cette organisation… | Impossible d'ouvrir cette entreprise… |

Ne **pas** toucher : le chemin `/select-organization`, le chemin
`/create-organization`, les `id` HTML `organization-name` / `organization-slug` /
`organization-logo`, la clé `organizationLogoUploader`, ni aucun nom de symbole.

Vérifier qu'il n'en reste aucune :

```bash
cd apps/web && grep -rn -i "organisation" src/routes src/components
```

Attendu : aucun résultat.

- [ ] **Étape 2 : porter `select-organization` sur les tokens et le kit**

Remplacer la liste d'entreprises — aujourd'hui un `div` en `divide-y` avec les
classes recopiées à la main — par `GroupedList` / `GroupedListRow`, en passant
le logo dans `iconContent`, le badge « Active » dans `badge` (un `StatusPill`
de ton `done`, puisque c'est un état), et l'indicateur de chargement dans
`trailing`. Remplacer le bloc vide par `EmptyState`.

Migrer les couleurs restantes : `bg-[#f9fafb]` → `bg-background`,
`text-slate-950` → `text-foreground`, `text-slate-600` → `text-ink-muted`,
`text-slate-500` → `text-muted-foreground`, `border-slate-200` → `border-border`,
`bg-white` → `bg-card`, `bg-slate-50` → `bg-muted`. Le bloc d'erreur passe sur
`border-destructive-border bg-destructive-surface text-destructive`. Le badge
« Session sécurisée » garde son vert via le ton `done`.

Supprimer les ombres `shadow-[0_24px_70px_-40px_rgba(15,23,42,0.5)]` : la spec
pose qu'une surface est tenue par sa bordure.

**Conserver** le split `md:grid-cols-[0.8fr_1.2fr]`, le titre en `md:text-6xl`,
les `active:scale-[0.98]` et le `animationDelay` échelonné — c'est une page
d'entrée, elle garde son hero.

- [ ] **Étape 3 : porter `create-organization` de la même façon**

Même traitement. Le formulaire passe sur les tokens ; la structure en deux
colonnes et l'échelle typographique sont conservées.

- [ ] **Étape 4 : vérifier**

```bash
cd apps/web && grep -rnE "slate-|emerald-|sky-|amber-|#f9fafb" src/routes/select-organization.tsx src/routes/create-organization.tsx
```

Attendu : aucun résultat.

```bash
cd apps/web && bunx tsc --noEmit && bunx vitest run
```

Attendu : 5 erreurs pré-existantes, 0 test en échec.

- [ ] **Étape 5 : vérification manuelle**

```bash
bun run dev:web
```

Se déconnecter, se reconnecter : la page de choix doit afficher « Entreprises
disponibles », la ligne active doit porter un badge vert, et le bouton principal
doit être violet. Aucun mot « organisation » ne doit rester à l'écran.

- [ ] **Étape 6 : commit**

```bash
git add apps/web/src/routes/select-organization.tsx apps/web/src/routes/create-organization.tsx apps/web/src/routes/dashboard/settings.tsx apps/web/src/components/dashboard/layout/dashboard-page-banner.tsx apps/web/src/components/dashboard/dialogs/account-switch-dialog.tsx
git commit -m "feat(web): dire entreprise et porter les pages d'entree sur le kit"
```

---

### Task 15 : Layout du dashboard sur le canvas de référence

Le shell est ce que le praticien voit sur **toutes** les pages. Tant qu'il ne
suit pas la référence, chaque page migrée reste posée sur un fond qui ne lui
correspond pas.

**Files:**
- Modify: `apps/web/src/routes/dashboard.tsx:96-119`
- Modify: `apps/web/src/components/dashboard/layout/dashboard-header.tsx`
- Modify: `apps/web/src/components/dashboard/layout/dashboard-page-banner.tsx`

- [ ] **Étape 1 : poser le canvas**

Dans `apps/web/src/routes/dashboard.tsx`, la zone de contenu doit porter
explicitement le canvas et une largeur de lecture bornée, comme la référence
borne la sienne à `max-w-7xl` :

```tsx
          <div
            className={cn(
              "min-h-0 w-full flex-1 bg-background",
              isAssistantRoute
                ? "mb-0 flex flex-col overflow-hidden p-4"
                : "mb-4 overflow-y-auto p-4 sm:p-6",
            )}
          >
            <div className="mx-auto w-full max-w-7xl">
              <DashboardPageBanner />
              <Outlet />
            </div>
          </div>
```

- [ ] **Étape 2 : aligner l'en-tête**

Dans `dashboard-header.tsx`, remplacer le bouton de bascule
`className="h-10 w-10 rounded-xl border-border transition-all duration-300 hover:shadow-md p-0 m-0 bg-sidebar"`
par une expression sur tokens sans ombre :

```tsx
          className="size-10 rounded-lg border-border bg-card p-0 transition duration-300 hover:bg-muted active:scale-[0.98]"
```

Poser une bordure basse sur l'en-tête pour qu'il se détache du canvas :

```tsx
    <div className="flex h-16 flex-row items-center justify-between border-b border-border bg-card px-4">
```

- [ ] **Étape 3 : vérifier**

```bash
cd apps/web && grep -rnE "slate-|emerald-|sky-|amber-" src/routes/dashboard.tsx src/components/dashboard/layout/
```

Attendu : aucun résultat.

```bash
cd apps/web && bunx tsc --noEmit && bunx vitest run
bun run --filter @biume/web build
```

Attendu : 5 erreurs pré-existantes, 0 test en échec, build vert.

- [ ] **Étape 4 : commit**

```bash
git add apps/web/src/routes/dashboard.tsx apps/web/src/components/dashboard/layout
git commit -m "feat(web): poser le canvas de reference sur le shell du dashboard"
```

---

## Auto-revue

**Couverture de la spec.** Contrainte non-technicienne : tâches 3, 9, 10, 14
(libellés métier, action visible, « entreprise »). Système de design : tâches 9,
10, 12, 13, 14, 15 (aucune couleur en dur). Langage visuel de référence : tâches
13 (extraction), 12 et 14 (application), 15 (shell). Vocabulaire : tâche 14.
Création du brouillon : tâches 6 et 9. Visibilité d'un brouillon vide : tâches 1
et 8. Cycle de vie : tâches 4 et 7. Statut de séance : tâche 2. Tableau des
actions : tâche 3. Actions visibles sur la carte : tâches 10 et 11. Structure à
deux pages et module de rapport : **hors de ce plan**, couverts par les lots 3
et 4.

**Ordre d'exécution réel.** Les numéros suivent l'ordre de rédaction, pas
l'ordre de déroulé. Exécuter : 1, 2, 3, 4, 5, 6, 7, 8, 9, **13**, 10, 11, 12,
**14**, **15**. La tâche 13 précède les tâches 10 et 12 parce qu'elles
consomment ses primitives ; les tâches 14 et 15 closent le lot en propageant le
langage aux pages d'entrée et au shell.

**Points laissés ouverts, à trancher à l'exécution.**

1. Tâche 10, second test : le cas « séance à venir » dépend de la présence d'un
   brouillon vide. Le plan donne l'intention (avant la séance, rien ne presse) et
   demande d'ajuster la fixture si le comportement observé diffère.
2. Tâche 11, étape 2 : le dialogue de modification est décrit, pas écrit en
   entier — il duplique `new-appointment-dialog.tsx` moins deux champs. Si sa
   rédaction fait apparaître plus de divergences que prévu, extraire un
   `AppointmentFormFields` partagé plutôt que de dupliquer.
3. Tâche 14 : le renommage touche `routes/dashboard/settings.tsx`, page dont la
   refonte relève du lot 4. On y change **le vocabulaire uniquement** ; son
   alignement visuel attend son lot.
4. Tâche 15 : le `max-w-7xl` posé sur la zone de contenu peut serrer des pages
   déjà larges — la grille mensuelle de l'agenda et le tableau des comptes
   rendus sont à revérifier en vérification manuelle sur un grand écran.
5. Tâche 5 : la fenêtre −2 / +6 mois est un choix par défaut. Si un praticien
   consulte un mois hors fenêtre dans le calendrier, les rendez-vous
   n'apparaîtront pas. À corriger en indexant la fenêtre sur le mois affiché si
   le cas se présente en vérification manuelle.
