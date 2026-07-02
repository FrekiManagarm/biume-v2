# Dashboard Agenda Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current metric-led `/dashboard` home with an agenda-dominant day workspace for animal practitioners.

**Architecture:** Keep the change scoped to the web app. Put appointment workflow/status logic in a testable helper, fetch one day of appointments plus linked reports through a dedicated server function/query, and render the day agenda through focused dashboard components.

**Tech Stack:** Bun workspace, TanStack Start, TanStack Router, TanStack Query, React, TypeScript, Drizzle ORM, Tailwind CSS v4, Shadcn-style UI, lucide-react, Vitest.

## Global Constraints

- Default to Bun commands.
- Do not manually edit `apps/web/src/routeTree.gen.ts`.
- Use existing app aliases such as `#/*`.
- Use Tailwind CSS v4 and existing Shadcn-style UI.
- Use `lucide-react` icons for common UI actions.
- Keep dashboard language animal-specific: Owners, Animals, Reports, Follow-ups.
- Keep `/dashboard` as the day agenda default route.
- Keep existing routes where practical.
- Do not add public online booking, advanced week view, business analytics, deep data model refactors, or recurrence rules in this plan.
- Do not overwrite unrelated worktree changes.

---

## File Structure

- Create `apps/web/src/lib/dashboard/day-agenda.ts`
  - Owns appointment/report workflow derivation, primary action selection, and "to do today" grouping.
  - Pure TypeScript with no React dependency.

- Create `apps/web/src/lib/dashboard/day-agenda.test.ts`
  - Vitest coverage for report status, action selection, sorting, and before/after session grouping.

- Create `apps/web/src/functions/dashboard-agenda.function.ts`
  - Server function for fetching appointments for a selected date, including patient, owner, animal, organization, and linked reports.

- Create `apps/web/src/lib/api/actions/dashboard-agenda.action.ts`
  - Client-facing wrapper for the server function.

- Create `apps/web/src/lib/api/queries/dashboard-agenda.query.ts`
  - TanStack Query options for the selected dashboard day.

- Create `apps/web/src/components/dashboard/day-agenda/day-agenda-view.tsx`
  - Main day agenda layout.

- Create `apps/web/src/components/dashboard/day-agenda/day-agenda-card.tsx`
  - Single appointment card with animal-first content and contextual action.

- Create `apps/web/src/components/dashboard/day-agenda/day-agenda-todo.tsx`
  - "To do today" side panel.

- Modify `apps/web/src/routes/dashboard/index.tsx`
  - Replace existing dashboard metrics/activity/species composition with the new day agenda route component.

- Modify `apps/web/src/lib/menu-list.tsx`
  - Rename sidebar labels and make Agenda the primary dashboard entry.

---

### Task 1: Add Pure Day Agenda Workflow Helpers

**Files:**
- Create: `apps/web/src/lib/dashboard/day-agenda.ts`
- Create: `apps/web/src/lib/dashboard/day-agenda.test.ts`

**Interfaces:**
- Produces:
  - `type AgendaReportStatus`
  - `type AgendaActionKind`
  - `type AgendaTodoGroup`
  - `function deriveAgendaReportStatus(reports: AgendaReportInput[], appointmentStatus: AgendaAppointmentStatus): AgendaReportStatus`
  - `function getAgendaPrimaryAction(status: AgendaReportStatus, appointmentStatus: AgendaAppointmentStatus): AgendaPrimaryAction`
  - `function buildDayAgendaModel(input: BuildDayAgendaInput): DayAgendaModel`
- Consumes: plain appointment/report objects from Task 2 and UI components from Task 3.

- [ ] **Step 1: Write the failing helper tests**

Create `apps/web/src/lib/dashboard/day-agenda.test.ts`:

```ts
import { describe, expect, test } from "vitest";

import {
  buildDayAgendaModel,
  deriveAgendaReportStatus,
  getAgendaPrimaryAction,
  type AgendaAppointmentInput,
} from "./day-agenda";

function appointment(
  overrides: Partial<AgendaAppointmentInput> = {},
): AgendaAppointmentInput {
  return {
    id: "appointment-1",
    beginAt: new Date("2026-07-01T09:00:00.000Z"),
    endAt: new Date("2026-07-01T10:00:00.000Z"),
    status: "CONFIRMED",
    reports: [],
    patient: {
      id: "animal-1",
      name: "Oslo",
      breed: "Berger australien",
      animal: { name: "Chien", code: "dog" },
      owner: { id: "owner-1", name: "Camille Martin" },
    },
    ...overrides,
  };
}

describe("deriveAgendaReportStatus", () => {
  test("returns none before a completed session when no report exists", () => {
    expect(deriveAgendaReportStatus([], "CONFIRMED")).toBe("none");
  });

  test("returns to_create after a completed session when no report exists", () => {
    expect(deriveAgendaReportStatus([], "COMPLETED")).toBe("to_create");
  });

  test("returns draft for a draft report", () => {
    expect(
      deriveAgendaReportStatus(
        [{ id: "report-1", status: "draft", updatedAt: null }],
        "COMPLETED",
      ),
    ).toBe("draft");
  });

  test("returns ready_to_send for a finalized report", () => {
    expect(
      deriveAgendaReportStatus(
        [{ id: "report-1", status: "finalized", updatedAt: null }],
        "COMPLETED",
      ),
    ).toBe("ready_to_send");
  });

  test("returns sent for a sent report", () => {
    expect(
      deriveAgendaReportStatus(
        [{ id: "report-1", status: "sent", updatedAt: null }],
        "COMPLETED",
      ),
    ).toBe("sent");
  });
});

describe("getAgendaPrimaryAction", () => {
  test("uses Prepare before a report exists on a future/current session", () => {
    expect(getAgendaPrimaryAction("none", "CONFIRMED")).toMatchObject({
      kind: "prepare",
      label: "Préparer",
    });
  });

  test("uses Create report after completed session without report", () => {
    expect(getAgendaPrimaryAction("to_create", "COMPLETED")).toMatchObject({
      kind: "create_report",
      label: "Créer le compte rendu",
    });
  });

  test("uses Finalize for draft reports", () => {
    expect(getAgendaPrimaryAction("draft", "COMPLETED")).toMatchObject({
      kind: "finalize_report",
      label: "Finaliser",
    });
  });

  test("uses Send for finalized reports", () => {
    expect(getAgendaPrimaryAction("ready_to_send", "COMPLETED")).toMatchObject({
      kind: "send_report",
      label: "Envoyer",
    });
  });
});

describe("buildDayAgendaModel", () => {
  test("sorts appointments and separates before and after session actions", () => {
    const model = buildDayAgendaModel({
      now: new Date("2026-07-01T10:15:00.000Z"),
      selectedDate: new Date("2026-07-01T00:00:00.000Z"),
      appointments: [
        appointment({
          id: "late",
          beginAt: new Date("2026-07-01T17:00:00.000Z"),
          endAt: new Date("2026-07-01T18:00:00.000Z"),
          status: "COMPLETED",
          reports: [{ id: "report-2", status: "draft", updatedAt: null }],
        }),
        appointment({
          id: "next",
          beginAt: new Date("2026-07-01T10:30:00.000Z"),
          endAt: new Date("2026-07-01T11:30:00.000Z"),
          status: "CONFIRMED",
        }),
        appointment({
          id: "done",
          beginAt: new Date("2026-07-01T09:00:00.000Z"),
          endAt: new Date("2026-07-01T10:00:00.000Z"),
          status: "COMPLETED",
        }),
      ],
    });

    expect(model.appointments.map((item) => item.id)).toEqual([
      "done",
      "next",
      "late",
    ]);
    expect(model.todo.beforeSession.map((item) => item.appointmentId)).toEqual([
      "next",
    ]);
    expect(model.todo.afterSession.map((item) => item.appointmentId)).toEqual([
      "done",
      "late",
    ]);
    expect(model.summary).toEqual({
      appointmentCount: 3,
      beforeSessionCount: 1,
      afterSessionCount: 2,
    });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run:

```bash
bun --filter @biume/web test src/lib/dashboard/day-agenda.test.ts
```

Expected: FAIL because `apps/web/src/lib/dashboard/day-agenda.ts` does not exist.

- [ ] **Step 3: Implement the helper**

Create `apps/web/src/lib/dashboard/day-agenda.ts`:

```ts
export type AgendaAppointmentStatus =
  | "CREATED"
  | "CONFIRMED"
  | "CANCELLED"
  | "COMPLETED";

export type AgendaDbReportStatus = "draft" | "finalized" | "sent";

export type AgendaReportStatus =
  | "none"
  | "to_create"
  | "draft"
  | "ready_to_send"
  | "sent";

export type AgendaActionKind =
  | "prepare"
  | "create_report"
  | "finalize_report"
  | "send_report"
  | "view_report";

export type AgendaReportInput = {
  id: string;
  status: AgendaDbReportStatus;
  updatedAt: Date | string | null;
};

export type AgendaAnimalInput = {
  name: string | null;
  code?: string | null;
};

export type AgendaOwnerInput = {
  id: string;
  name: string | null;
};

export type AgendaPatientInput = {
  id: string;
  name: string | null;
  breed?: string | null;
  animal?: AgendaAnimalInput | null;
  owner?: AgendaOwnerInput | null;
};

export type AgendaAppointmentInput = {
  id: string;
  beginAt: Date | string;
  endAt: Date | string;
  status: AgendaAppointmentStatus;
  atHome?: boolean | null;
  note?: string | null;
  reports?: AgendaReportInput[];
  patient?: AgendaPatientInput | null;
};

export type AgendaPrimaryAction = {
  kind: AgendaActionKind;
  label: string;
};

export type DayAgendaAppointment = AgendaAppointmentInput & {
  beginAt: Date;
  endAt: Date;
  reportStatus: AgendaReportStatus;
  primaryAction: AgendaPrimaryAction;
};

export type AgendaTodoItem = {
  id: string;
  appointmentId: string;
  action: AgendaPrimaryAction;
  animalName: string;
  ownerName: string;
  timeLabel: string;
};

export type AgendaTodoGroup = {
  beforeSession: AgendaTodoItem[];
  afterSession: AgendaTodoItem[];
};

export type DayAgendaModel = {
  appointments: DayAgendaAppointment[];
  todo: AgendaTodoGroup;
  summary: {
    appointmentCount: number;
    beforeSessionCount: number;
    afterSessionCount: number;
  };
};

export type BuildDayAgendaInput = {
  appointments: AgendaAppointmentInput[];
  now: Date;
  selectedDate: Date;
};

export function deriveAgendaReportStatus(
  reports: AgendaReportInput[] = [],
  appointmentStatus: AgendaAppointmentStatus,
): AgendaReportStatus {
  if (reports.some((report) => report.status === "sent")) return "sent";
  if (reports.some((report) => report.status === "finalized")) {
    return "ready_to_send";
  }
  if (reports.some((report) => report.status === "draft")) return "draft";
  return appointmentStatus === "COMPLETED" ? "to_create" : "none";
}

export function getAgendaPrimaryAction(
  status: AgendaReportStatus,
  appointmentStatus: AgendaAppointmentStatus,
): AgendaPrimaryAction {
  if (status === "sent") return { kind: "view_report", label: "Voir le CR" };
  if (status === "ready_to_send") {
    return { kind: "send_report", label: "Envoyer" };
  }
  if (status === "draft") return { kind: "finalize_report", label: "Finaliser" };
  if (status === "to_create") {
    return { kind: "create_report", label: "Créer le compte rendu" };
  }
  if (appointmentStatus === "CANCELLED") {
    return { kind: "view_report", label: "Voir" };
  }
  return { kind: "prepare", label: "Préparer" };
}

export function buildDayAgendaModel({
  appointments,
  now,
}: BuildDayAgendaInput): DayAgendaModel {
  const normalizedAppointments = appointments
    .map((appointment): DayAgendaAppointment => {
      const beginAt = new Date(appointment.beginAt);
      const endAt = new Date(appointment.endAt);
      const reportStatus = deriveAgendaReportStatus(
        appointment.reports ?? [],
        appointment.status,
      );

      return {
        ...appointment,
        beginAt,
        endAt,
        reports: appointment.reports ?? [],
        reportStatus,
        primaryAction: getAgendaPrimaryAction(reportStatus, appointment.status),
      };
    })
    .sort((a, b) => a.beginAt.getTime() - b.beginAt.getTime());

  const todo: AgendaTodoGroup = {
    beforeSession: [],
    afterSession: [],
  };

  for (const appointment of normalizedAppointments) {
    if (appointment.status === "CANCELLED") continue;

    const item: AgendaTodoItem = {
      id: `${appointment.id}-${appointment.primaryAction.kind}`,
      appointmentId: appointment.id,
      action: appointment.primaryAction,
      animalName: appointment.patient?.name ?? "Animal non renseigné",
      ownerName: appointment.patient?.owner?.name ?? "Propriétaire inconnu",
      timeLabel: formatAgendaTime(appointment.beginAt),
    };

    if (
      appointment.primaryAction.kind === "prepare" &&
      appointment.beginAt.getTime() >= now.getTime()
    ) {
      todo.beforeSession.push(item);
    }

    if (
      appointment.primaryAction.kind === "create_report" ||
      appointment.primaryAction.kind === "finalize_report" ||
      appointment.primaryAction.kind === "send_report"
    ) {
      todo.afterSession.push(item);
    }
  }

  return {
    appointments: normalizedAppointments,
    todo,
    summary: {
      appointmentCount: normalizedAppointments.length,
      beforeSessionCount: todo.beforeSession.length,
      afterSessionCount: todo.afterSession.length,
    },
  };
}

function formatAgendaTime(value: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}
```

- [ ] **Step 4: Run helper tests**

Run:

```bash
bun --filter @biume/web test src/lib/dashboard/day-agenda.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/lib/dashboard/day-agenda.ts apps/web/src/lib/dashboard/day-agenda.test.ts
git commit -m "test: add dashboard agenda workflow helpers"
```

---

### Task 2: Add Day Agenda Server Query

**Files:**
- Create: `apps/web/src/functions/dashboard-agenda.function.ts`
- Create: `apps/web/src/lib/api/actions/dashboard-agenda.action.ts`
- Create: `apps/web/src/lib/api/queries/dashboard-agenda.query.ts`

**Interfaces:**
- Consumes:
  - `AgendaAppointmentInput` from `#/lib/dashboard/day-agenda`
- Produces:
  - `getDashboardAgendaDay({ date: string })`
  - `dashboardAgendaDayQueryOptions(date: string)`

- [ ] **Step 1: Create the server function**

Create `apps/web/src/functions/dashboard-agenda.function.ts`:

```ts
import { and, eq, gte, lte } from "drizzle-orm";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { db } from "@biume/db";
import { appointments } from "@biume/db/schema/index";
import { getCurrentOrganization } from "#/functions/auth.function";
import type { AgendaAppointmentInput } from "#/lib/dashboard/day-agenda";

const dashboardAgendaDaySchema = z.object({
  date: z.string().date(),
});

export type DashboardAgendaDayResult = {
  selectedDate: string;
  appointments: AgendaAppointmentInput[];
};

export const getDashboardAgendaDay = createServerFn({ method: "GET" })
  .validator(dashboardAgendaDaySchema)
  .handler(async ({ data }): Promise<DashboardAgendaDayResult> => {
    const organization = await getCurrentOrganization();
    if (!organization) throw new Error("Organization not found");

    const dayStart = startOfLocalDay(data.date);
    const dayEnd = endOfLocalDay(data.date);

    const rows = await db.query.appointments.findMany({
      where: and(
        eq(appointments.organizationId, organization.id),
        gte(appointments.beginAt, dayStart),
        lte(appointments.beginAt, dayEnd),
      ),
      orderBy: (appointments, { asc }) => [asc(appointments.beginAt)],
      with: {
        patient: {
          columns: {
            id: true,
            name: true,
            breed: true,
          },
          with: {
            owner: {
              columns: {
                id: true,
                name: true,
              },
            },
            animal: {
              columns: {
                code: true,
                name: true,
              },
            },
          },
        },
        reports: {
          columns: {
            id: true,
            status: true,
            updatedAt: true,
          },
        },
      },
    });

    return {
      selectedDate: data.date,
      appointments: rows.map((row) => ({
        id: row.id,
        beginAt: row.beginAt,
        endAt: row.endAt,
        status: row.status,
        atHome: row.atHome,
        note: row.note,
        reports: row.reports.map((report) => ({
          id: report.id,
          status: report.status,
          updatedAt: report.updatedAt,
        })),
        patient: row.patient
          ? {
              id: row.patient.id,
              name: row.patient.name,
              breed: row.patient.breed,
              animal: row.patient.animal
                ? {
                    code: row.patient.animal.code,
                    name: row.patient.animal.name,
                  }
                : null,
              owner: row.patient.owner
                ? {
                    id: row.patient.owner.id,
                    name: row.patient.owner.name,
                  }
                : null,
            }
          : null,
      })),
    };
  });

function startOfLocalDay(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day, 0, 0, 0, 0);
}

function endOfLocalDay(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day, 23, 59, 59, 999);
}
```

- [ ] **Step 2: Add the action wrapper**

Create `apps/web/src/lib/api/actions/dashboard-agenda.action.ts`:

```ts
import {
  getDashboardAgendaDay as getDashboardAgendaDayFn,
  type DashboardAgendaDayResult,
} from "#/functions/dashboard-agenda.function";

export type { DashboardAgendaDayResult };

export function getDashboardAgendaDay(date: string) {
  return getDashboardAgendaDayFn({ data: { date } });
}
```

- [ ] **Step 3: Add the TanStack Query options**

Create `apps/web/src/lib/api/queries/dashboard-agenda.query.ts`:

```ts
import { queryOptions } from "@tanstack/react-query";

import { getDashboardAgendaDay } from "#/lib/api/actions/dashboard-agenda.action";

export const dashboardAgendaDayQueryOptions = (date: string) =>
  queryOptions({
    queryKey: ["dashboard", "agenda-day", date] as const,
    queryFn: () => getDashboardAgendaDay(date),
  });
```

- [ ] **Step 4: Run typecheck for the server/query additions**

Run:

```bash
bun run check-types
```

Expected: PASS. If it fails because unrelated existing worktree changes already break typecheck, record the unrelated errors and run:

```bash
bun --filter @biume/web test src/lib/dashboard/day-agenda.test.ts
```

Expected: PASS for the helper tests from Task 1.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/functions/dashboard-agenda.function.ts apps/web/src/lib/api/actions/dashboard-agenda.action.ts apps/web/src/lib/api/queries/dashboard-agenda.query.ts
git commit -m "feat: add dashboard agenda day query"
```

---

### Task 3: Build Day Agenda UI Components

**Files:**
- Create: `apps/web/src/components/dashboard/day-agenda/day-agenda-card.tsx`
- Create: `apps/web/src/components/dashboard/day-agenda/day-agenda-todo.tsx`
- Create: `apps/web/src/components/dashboard/day-agenda/day-agenda-view.tsx`

**Interfaces:**
- Consumes:
  - `DayAgendaModel`
  - `DayAgendaAppointment`
  - `AgendaTodoGroup`
  - `buildDayAgendaModel`
- Produces:
  - `<DayAgendaView />` for `apps/web/src/routes/dashboard/index.tsx`

- [ ] **Step 1: Create the appointment card component**

Create `apps/web/src/components/dashboard/day-agenda/day-agenda-card.tsx`:

```tsx
import {
  CheckCircle2,
  Clock,
  FileText,
  Home,
  MapPin,
  PawPrint,
  Send,
} from "lucide-react";

import { Button } from "#/components/ui/button";
import { cn } from "#/lib/utils";
import type {
  AgendaReportStatus,
  DayAgendaAppointment,
} from "#/lib/dashboard/day-agenda";

type DayAgendaCardProps = {
  appointment: DayAgendaAppointment;
};

const reportStatusConfig: Record<
  AgendaReportStatus,
  { label: string; className: string }
> = {
  none: {
    label: "À préparer",
    className: "border-slate-200 bg-white text-slate-600",
  },
  to_create: {
    label: "Compte rendu à créer",
    className: "border-blue-200 bg-blue-50 text-blue-800",
  },
  draft: {
    label: "Brouillon",
    className: "border-amber-200 bg-amber-50 text-amber-800",
  },
  ready_to_send: {
    label: "Prêt à envoyer",
    className: "border-emerald-200 bg-emerald-50 text-emerald-800",
  },
  sent: {
    label: "Envoyé",
    className: "border-slate-200 bg-slate-50 text-slate-600",
  },
};

export function DayAgendaCard({ appointment }: DayAgendaCardProps) {
  const animalName = appointment.patient?.name ?? "Animal non renseigné";
  const species = appointment.patient?.animal?.name ?? "Espèce inconnue";
  const breed = appointment.patient?.breed;
  const ownerName = appointment.patient?.owner?.name ?? "Propriétaire inconnu";
  const reportStatus = reportStatusConfig[appointment.reportStatus];

  return (
    <article
      className={cn(
        "grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_18px_50px_-44px_rgba(15,23,42,0.45)] md:grid-cols-[minmax(0,1fr)_auto]",
        appointment.reportStatus === "ready_to_send" &&
          "border-emerald-200 bg-emerald-50/40",
      )}
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600">
            <Clock className="size-3.5" />
            {formatTime(appointment.beginAt)} - {formatTime(appointment.endAt)}
          </span>
          <span
            className={cn(
              "inline-flex rounded-lg border px-2.5 py-1 text-xs font-semibold",
              reportStatus.className,
            )}
          >
            {reportStatus.label}
          </span>
        </div>

        <h3 className="mt-3 truncate text-base font-semibold tracking-tight text-slate-950">
          {animalName}
        </h3>
        <p className="mt-1 truncate text-sm text-slate-600">{ownerName}</p>

        <div className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
          <span className="flex min-w-0 items-center gap-2">
            <PawPrint className="size-4 shrink-0 text-slate-400" />
            <span className="truncate">{breed ? `${species} · ${breed}` : species}</span>
          </span>
          <span className="flex min-w-0 items-center gap-2">
            {appointment.atHome ? (
              <Home className="size-4 shrink-0 text-slate-400" />
            ) : (
              <MapPin className="size-4 shrink-0 text-slate-400" />
            )}
            <span className="truncate">
              {appointment.atHome ? "À domicile" : "Cabinet"}
            </span>
          </span>
        </div>

        {appointment.note ? (
          <p className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-sm leading-6 text-slate-600">
            {appointment.note}
          </p>
        ) : null}
      </div>

      <div className="flex items-center justify-start md:justify-end">
        <Button className="h-10 w-full md:w-auto">
          {appointment.primaryAction.label}
          {appointment.primaryAction.kind === "send_report" ? (
            <Send className="size-4" data-icon="inline-end" />
          ) : appointment.primaryAction.kind === "view_report" ? (
            <CheckCircle2 className="size-4" data-icon="inline-end" />
          ) : (
            <FileText className="size-4" data-icon="inline-end" />
          )}
        </Button>
      </div>
    </article>
  );
}

function formatTime(value: Date | string) {
  return new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
```

- [ ] **Step 2: Create the To Do Today panel**

Create `apps/web/src/components/dashboard/day-agenda/day-agenda-todo.tsx`:

```tsx
import { CheckCircle2, ClipboardList, FileText } from "lucide-react";

import type { AgendaTodoGroup, AgendaTodoItem } from "#/lib/dashboard/day-agenda";

type DayAgendaTodoProps = {
  todo: AgendaTodoGroup;
};

export function DayAgendaTodo({ todo }: DayAgendaTodoProps) {
  return (
    <aside className="grid gap-5 self-start rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_24px_70px_-46px_rgba(15,23,42,0.45)]">
      <div>
        <p className="text-sm font-medium text-emerald-700">
          À faire aujourd'hui
        </p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
          Actions utiles.
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Préparer les prochaines séances, finaliser et envoyer les comptes
          rendus du jour.
        </p>
      </div>

      <TodoSection
        emptyLabel="Aucune préparation en attente."
        icon="prepare"
        items={todo.beforeSession}
        title="Avant séance"
      />
      <TodoSection
        emptyLabel="Aucun compte rendu à traiter."
        icon="report"
        items={todo.afterSession}
        title="Après séance"
      />
    </aside>
  );
}

function TodoSection({
  emptyLabel,
  icon,
  items,
  title,
}: {
  emptyLabel: string;
  icon: "prepare" | "report";
  items: AgendaTodoItem[];
  title: string;
}) {
  return (
    <section className="border-t border-slate-200 pt-5">
      <h3 className="text-sm font-semibold text-slate-950">{title}</h3>
      <div className="mt-3 grid gap-2">
        {items.length > 0 ? (
          items.map((item) => (
            <TodoItem key={item.id} icon={icon} item={item} />
          ))
        ) : (
          <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-4 text-sm text-slate-500">
            {emptyLabel}
          </p>
        )}
      </div>
    </section>
  );
}

function TodoItem({
  icon,
  item,
}: {
  icon: "prepare" | "report";
  item: AgendaTodoItem;
}) {
  return (
    <div className="grid grid-cols-[auto_1fr] gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
      <div className="flex size-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600">
        {icon === "prepare" ? (
          <ClipboardList className="size-4" />
        ) : item.action.kind === "send_report" ? (
          <CheckCircle2 className="size-4" />
        ) : (
          <FileText className="size-4" />
        )}
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-slate-950">
          {item.action.label} · {item.animalName}
        </p>
        <p className="mt-0.5 truncate text-xs text-slate-500">
          {item.timeLabel} · {item.ownerName}
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create the composed day agenda view**

Create `apps/web/src/components/dashboard/day-agenda/day-agenda-view.tsx`:

```tsx
import { CalendarDays, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "#/components/ui/button";
import {
  buildDayAgendaModel,
  type AgendaAppointmentInput,
} from "#/lib/dashboard/day-agenda";
import { cn } from "#/lib/utils";
import { DayAgendaCard } from "./day-agenda-card";
import { DayAgendaTodo } from "./day-agenda-todo";

type DayAgendaViewProps = {
  appointments: AgendaAppointmentInput[];
  selectedDate: Date;
  onDateChange: (date: Date) => void;
};

export function DayAgendaView({
  appointments,
  onDateChange,
  selectedDate,
}: DayAgendaViewProps) {
  const [mobileTab, setMobileTab] = useState<"agenda" | "todo">("agenda");
  const model = useMemo(
    () =>
      buildDayAgendaModel({
        appointments,
        now: new Date(),
        selectedDate,
      }),
    [appointments, selectedDate],
  );
  const weekDays = useMemo(() => buildWeekDays(selectedDate), [selectedDate]);

  return (
    <div className="grid w-full gap-5 pb-8 text-slate-950">
      <header className="grid gap-5 border-b border-slate-200 pb-6 pt-2 lg:grid-cols-[1fr_auto] lg:items-end">
        <div className="min-w-0">
          <div className="mb-4 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.45)]">
            <CalendarDays className="size-3.5 text-emerald-700" />
            Agenda du jour
          </div>
          <h1 className="text-3xl font-semibold leading-none tracking-tight text-slate-950 md:text-5xl">
            {formatLongDate(selectedDate)}.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600 md:text-base">
            {model.summary.appointmentCount} séance
            {model.summary.appointmentCount > 1 ? "s" : ""} ·{" "}
            {model.summary.beforeSessionCount} préparation
            {model.summary.beforeSessionCount > 1 ? "s" : ""} ·{" "}
            {model.summary.afterSessionCount} compte rendu
            {model.summary.afterSessionCount > 1 ? "s" : ""} à traiter
          </p>
        </div>

        <div className="flex flex-wrap gap-2 lg:justify-end">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => onDateChange(addDays(selectedDate, -1))}
          >
            <ChevronLeft className="size-4" />
            <span className="sr-only">Jour précédent</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => onDateChange(startOfDay(new Date()))}
          >
            Aujourd'hui
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => onDateChange(addDays(selectedDate, 1))}
          >
            <ChevronRight className="size-4" />
            <span className="sr-only">Jour suivant</span>
          </Button>
          <Button type="button" variant="outline">
            Semaine
          </Button>
          <Button type="button">
            Nouveau rendez-vous
            <Plus className="size-4" data-icon="inline-end" />
          </Button>
        </div>
      </header>

      <section className="grid grid-cols-7 gap-2">
        {weekDays.map((day) => {
          const isSelected = isSameDay(day, selectedDate);
          return (
            <button
              key={day.toISOString()}
              type="button"
              onClick={() => onDateChange(day)}
              className={cn(
                "rounded-xl border border-slate-200 bg-white px-2 py-3 text-center text-sm font-semibold text-slate-600 transition hover:bg-slate-50",
                isSelected && "border-emerald-300 bg-emerald-50 text-emerald-900",
              )}
            >
              <span className="block text-xs font-medium uppercase text-slate-500">
                {formatWeekday(day)}
              </span>
              <span className="mt-1 block text-lg text-slate-950">
                {day.getDate()}
              </span>
            </button>
          );
        })}
      </section>

      <div className="grid grid-cols-2 gap-2 rounded-xl border border-slate-200 bg-white p-1 md:hidden">
        <button
          type="button"
          onClick={() => setMobileTab("agenda")}
          className={cn(
            "rounded-lg px-3 py-2 text-sm font-semibold text-slate-600",
            mobileTab === "agenda" && "bg-slate-950 text-white",
          )}
        >
          Agenda
        </button>
        <button
          type="button"
          onClick={() => setMobileTab("todo")}
          className={cn(
            "rounded-lg px-3 py-2 text-sm font-semibold text-slate-600",
            mobileTab === "todo" && "bg-slate-950 text-white",
          )}
        >
          À faire
        </button>
      </div>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <div className={cn("grid gap-3", mobileTab !== "agenda" && "hidden md:grid")}>
          {model.appointments.length > 0 ? (
            model.appointments.map((appointment) => (
              <DayAgendaCard key={appointment.id} appointment={appointment} />
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
              <CalendarDays className="mx-auto size-7 text-slate-400" />
              <h2 className="mt-4 text-base font-semibold text-slate-950">
                Aucun rendez-vous ce jour
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
                Les séances planifiées apparaîtront ici avec leurs actions de
                préparation et de compte rendu.
              </p>
            </div>
          )}
        </div>

        <div className={cn(mobileTab !== "todo" && "hidden md:block")}>
          <DayAgendaTodo todo={model.todo} />
        </div>
      </section>
    </div>
  );
}

function buildWeekDays(date: Date) {
  const start = addDays(startOfDay(date), -((date.getDay() + 6) % 7));
  return Array.from({ length: 7 }, (_, index) => addDays(start, index));
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return startOfDay(next);
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatLongDate(date: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  }).format(date);
}

function formatWeekday(date: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "short",
  }).format(date);
}
```

- [ ] **Step 4: Run helper tests and typecheck**

Run:

```bash
bun --filter @biume/web test src/lib/dashboard/day-agenda.test.ts
bun run check-types
```

Expected: helper test PASS. Typecheck PASS unless unrelated existing worktree changes already fail.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/components/dashboard/day-agenda/day-agenda-card.tsx apps/web/src/components/dashboard/day-agenda/day-agenda-todo.tsx apps/web/src/components/dashboard/day-agenda/day-agenda-view.tsx
git commit -m "feat: add dashboard day agenda components"
```

---

### Task 4: Replace `/dashboard` With the Day Agenda View

**Files:**
- Modify: `apps/web/src/routes/dashboard/index.tsx`

**Interfaces:**
- Consumes:
  - `dashboardAgendaDayQueryOptions(date: string)`
  - `DayAgendaView`
- Produces:
  - `/dashboard` renders the agenda day view by default.

- [ ] **Step 1: Replace the route component**

Replace `apps/web/src/routes/dashboard/index.tsx` with:

```tsx
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { DayAgendaView } from "#/components/dashboard/day-agenda/day-agenda-view";
import { dashboardAgendaDayQueryOptions } from "#/lib/api/queries/dashboard-agenda.query";

type DashboardSearch = {
  date?: string;
};

export const Route = createFileRoute("/dashboard/")({
  head: () => ({
    meta: [
      { title: "Agenda du jour | Biume" },
      {
        name: "description",
        content:
          "Préparez les séances du jour et finalisez les comptes rendus propriétaires dans Biume.",
      },
    ],
  }),
  validateSearch: (search: Record<string, unknown>): DashboardSearch => ({
    date: typeof search.date === "string" ? search.date : undefined,
  }),
  loaderDeps: ({ search }) => ({
    date: normalizeDateSearch(search.date),
  }),
  loader: ({ context, deps }) =>
    context.queryClient.ensureQueryData(
      dashboardAgendaDayQueryOptions(deps.date),
    ),
  component: DashboardIndexPage,
});

function DashboardIndexPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/dashboard" });
  const selectedDateString = normalizeDateSearch(search.date);
  const { data } = useSuspenseQuery(
    dashboardAgendaDayQueryOptions(selectedDateString),
  );

  function updateSelectedDate(nextDate: Date) {
    navigate({
      search: {
        date: toDateSearch(nextDate),
      },
    });
  }

  return (
    <DayAgendaView
      appointments={data.appointments}
      selectedDate={new Date(`${data.selectedDate}T00:00:00`)}
      onDateChange={updateSelectedDate}
    />
  );
}

function normalizeDateSearch(value: string | undefined) {
  if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  return toDateSearch(new Date());
}

function toDateSearch(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
```

- [ ] **Step 2: Run route typecheck**

Run:

```bash
bun run check-types
```

Expected: PASS unless unrelated existing worktree changes already fail.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/routes/dashboard/index.tsx
git commit -m "feat: make dashboard an agenda day workspace"
```

---

### Task 5: Rename Sidebar Labels for Animal Practitioner Language

**Files:**
- Modify: `apps/web/src/lib/menu-list.tsx`

**Interfaces:**
- Consumes: existing routes.
- Produces: sidebar labels `Agenda`, `Animaux`, `Propriétaires`, `Comptes rendus`, `Paramètres`.

- [ ] **Step 1: Update menu labels and grouping**

In `apps/web/src/lib/menu-list.tsx`, replace the returned menu list with:

```tsx
export function proMenuList(pathname: string): Group[] {
  return [
    {
      groupLabel: "",
      menus: [
        {
          href: `/dashboard`,
          label: "Agenda",
          active: pathname === `/dashboard`,
          icon: CalendarDays,
        },
      ],
    },
    {
      groupLabel: "Dossiers",
      menus: [
        {
          href: `/dashboard/patients`,
          label: "Animaux",
          active: pathname === `/dashboard/patients`,
          icon: PawPrint,
        },
        {
          href: `/dashboard/clients`,
          label: "Propriétaires",
          active: pathname === `/dashboard/clients`,
          icon: Contact2,
        },
      ],
    },
    {
      groupLabel: "Suivi",
      menus: [
        {
          href: `/dashboard/reports`,
          label: "Comptes rendus",
          active: pathname.startsWith(`/dashboard/reports`),
          icon: NotepadText,
        },
      ],
    },
    {
      groupLabel: "Autre",
      menus: [
        {
          href: `/dashboard/settings`,
          label: "Paramètres",
          active: pathname.startsWith(`/dashboard/settings`),
          icon: Settings,
        },
      ],
    },
  ];
}
```

Also remove the `LayoutGrid` import if it becomes unused. Keep `CalendarDays` imported.

- [ ] **Step 2: Run typecheck**

Run:

```bash
bun run check-types
```

Expected: PASS unless unrelated existing worktree changes already fail.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/lib/menu-list.tsx
git commit -m "feat: update dashboard navigation language"
```

---

### Task 6: Verify the Dashboard Experience

**Files:**
- No planned source changes unless verification reveals a defect from Tasks 1-5.

**Interfaces:**
- Consumes: completed implementation from Tasks 1-5.
- Produces: verified day agenda flow.

- [ ] **Step 1: Run focused tests**

Run:

```bash
bun --filter @biume/web test src/lib/dashboard/day-agenda.test.ts
```

Expected: PASS.

- [ ] **Step 2: Run app typecheck**

Run:

```bash
bun run check-types
```

Expected: PASS. If it fails on unrelated dirty-worktree errors, record exact failing files and do not change unrelated code.

- [ ] **Step 3: Start the web dev server**

Run:

```bash
bun run dev:web
```

Expected: Vite/TanStack Start server starts on the configured web port. If port `3001` is occupied, stop the conflicting process only if it belongs to this project; otherwise use the existing running server for verification.

- [ ] **Step 4: Inspect `/dashboard` manually**

Open the app at the local dev URL and verify:

- `/dashboard` shows the day agenda as the primary screen.
- The week strip changes the selected day.
- Previous/next day controls update the `date` search param.
- Appointment cards show animal name, owner, species/breed, location, report status, and primary action.
- Mobile width shows `Agenda` and `À faire` segmented tabs.
- Sidebar labels read `Agenda`, `Animaux`, `Propriétaires`, `Comptes rendus`, `Paramètres`.

- [ ] **Step 5: Final commit if verification fixes were needed**

If verification required small fixes, commit only those files:

```bash
git add <fixed-files>
git commit -m "fix: polish dashboard agenda workflow"
```

If no fixes were needed, do not create an empty commit.

---

## Self-Review

Spec coverage:

- Agenda day view on `/dashboard`: Task 4.
- Agenda dominant layout: Task 3 and Task 4.
- To do today panel grouped before/after session: Task 1 and Task 3.
- Appointment card status and contextual action: Task 1 and Task 3.
- Animal-specific language and sidebar labels: Task 5.
- No online booking, advanced week view, analytics, model refactor, recurrence rules: enforced in Global Constraints and task scope.

Placeholder scan:

- No `TBD`, `TODO`, or "implement later" placeholders are present. The `??` tokens in this plan are TypeScript nullish coalescing operators inside concrete code.

Type consistency:

- `AgendaAppointmentInput`, `DayAgendaAppointment`, and `AgendaTodoGroup` are produced in Task 1 and consumed by Tasks 2 and 3.
- `dashboardAgendaDayQueryOptions(date: string)` is produced in Task 2 and consumed by Task 4.
- `DayAgendaView` is produced in Task 3 and consumed by Task 4.
