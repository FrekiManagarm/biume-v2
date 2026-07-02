# Dashboard Overview Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the agenda-only `/dashboard` home with an activity overview for independent animal professionals.

**Architecture:** Keep appointment/report workflow logic in pure TypeScript helpers, aggregate dashboard data through TanStack Query, and render `/dashboard` with focused React components. Reuse the existing day-agenda model where possible so `/dashboard` and `/dashboard/agenda` stay consistent without copying report-status logic.

**Tech Stack:** Bun workspace, TanStack Start, TanStack Router, TanStack Query, React, TypeScript, Drizzle-backed server functions, Tailwind CSS v4, Shadcn-style UI, lucide-react, Vitest.

---

## File Structure

- Modify `apps/web/src/lib/dashboard/day-agenda.ts`
  - Add small fields needed by overview priorities: optional report id on actions when available, appointment duration label, and primary action target metadata.

- Modify `apps/web/src/lib/dashboard/day-agenda.test.ts`
  - Cover the extra metadata without changing existing behavior.

- Create `apps/web/src/lib/dashboard/dashboard-overview.ts`
  - Pure model builder for summary strip, priority groups, agenda preview, and recent activity rows.
  - No React dependency.

- Create `apps/web/src/lib/dashboard/dashboard-overview.test.ts`
  - Vitest coverage for summary counts, next appointment selection, priority ordering, and empty states.

- Modify `apps/web/src/lib/api/queries/dashboard.query.ts`
  - Build one overview query using today's agenda data plus existing lightweight activity metrics.

- Create `apps/web/src/components/dashboard/overview/dashboard-overview-view.tsx`
  - Page-level overview layout.

- Create `apps/web/src/components/dashboard/overview/dashboard-summary-strip.tsx`
  - Compact top signal strip.

- Create `apps/web/src/components/dashboard/overview/dashboard-agenda-preview.tsx`
  - Today's agenda preview with link to full agenda.

- Create `apps/web/src/components/dashboard/overview/dashboard-priorities-panel.tsx`
  - "À traiter" panel grouped by actionable work.

- Create `apps/web/src/components/dashboard/overview/dashboard-recent-activity.tsx`
  - Secondary activity movement section.

- Modify `apps/web/src/routes/dashboard/index.tsx`
  - Render the new overview instead of the agenda-only page.

- Modify `apps/web/src/lib/menu-list.tsx`
  - Rename the root dashboard menu item to "Vue d'ensemble" and add/keep "Agenda" as a separate route.

- Do not manually edit `apps/web/src/routeTree.gen.ts`.

---

### Task 1: Add Overview Metadata to Day Agenda Model

**Files:**
- Modify: `apps/web/src/lib/dashboard/day-agenda.ts`
- Modify: `apps/web/src/lib/dashboard/day-agenda.test.ts`

- [ ] **Step 1: Write failing tests for report target metadata and duration**

Add these tests to `apps/web/src/lib/dashboard/day-agenda.test.ts` inside `describe("buildDayAgendaModel", ...)`:

```ts
test("exposes duration and report target metadata for overview actions", () => {
  const model = buildDayAgendaModel({
    now: new Date("2026-07-01T12:00:00.000Z"),
    selectedDate: new Date("2026-07-01T00:00:00.000Z"),
    appointments: [
      appointment({
        id: "draft-appointment",
        beginAt: new Date("2026-07-01T13:30:00.000Z"),
        endAt: new Date("2026-07-01T14:15:00.000Z"),
        status: "COMPLETED",
        reports: [
          {
            id: "draft-report",
            status: "draft",
            updatedAt: new Date("2026-07-01T11:00:00.000Z"),
          },
        ],
      }),
    ],
  });

  expect(model.appointments[0]?.durationLabel).toBe("45 min");
  expect(model.appointments[0]?.primaryAction).toMatchObject({
    kind: "finalize_report",
    label: "Finaliser",
    reportId: "draft-report",
    appointmentId: "draft-appointment",
  });
  expect(model.todo.afterSession[0]?.action).toMatchObject({
    reportId: "draft-report",
    appointmentId: "draft-appointment",
  });
});
```

- [ ] **Step 2: Run the focused tests and verify they fail**

Run:

```bash
bun --filter @biume/web test apps/web/src/lib/dashboard/day-agenda.test.ts
```

Expected: FAIL because `durationLabel`, `reportId`, and `appointmentId` are not on the model/action types.

- [ ] **Step 3: Extend action and appointment types**

In `apps/web/src/lib/dashboard/day-agenda.ts`, update the type definitions:

```ts
export type AgendaPrimaryAction = {
  kind: AgendaActionKind;
  label: string;
  appointmentId?: string;
  reportId?: string;
};

export type DayAgendaAppointment = AgendaAppointmentInput & {
  beginAt: Date;
  endAt: Date;
  durationLabel: string;
  reportStatus: AgendaReportStatus;
  primaryAction: AgendaPrimaryAction;
};
```

- [ ] **Step 4: Add helper functions for latest report id and duration**

In `apps/web/src/lib/dashboard/day-agenda.ts`, add:

```ts
function getAgendaPrimaryActionTarget(
  appointmentId: string,
  reports: AgendaReportInput[],
) {
  const latestReport = getLatestAgendaReport(reports);

  return {
    appointmentId,
    reportId: latestReport?.id,
  };
}

function formatDurationLabel(beginAt: Date, endAt: Date) {
  const durationMinutes = Math.max(
    0,
    Math.round((endAt.getTime() - beginAt.getTime()) / 60000),
  );

  if (durationMinutes < 60) return `${durationMinutes} min`;

  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;

  return minutes === 0 ? `${hours} h` : `${hours} h ${minutes}`;
}
```

- [ ] **Step 5: Attach metadata while building appointments**

In `buildDayAgendaModel`, replace the current `primaryAction` assignment inside `.map(...)` with:

```ts
const reports = appointment.reports ?? [];
const reportStatus = deriveAgendaReportStatus(reports, appointment.status);
const primaryAction = {
  ...getAgendaPrimaryAction(reportStatus, appointment.status),
  ...getAgendaPrimaryActionTarget(appointment.id, reports),
};

return {
  ...appointment,
  beginAt,
  endAt,
  durationLabel: formatDurationLabel(beginAt, endAt),
  reports,
  reportStatus,
  primaryAction,
};
```

- [ ] **Step 6: Run the focused tests and verify they pass**

Run:

```bash
bun --filter @biume/web test apps/web/src/lib/dashboard/day-agenda.test.ts
```

Expected: PASS.

- [ ] **Step 7: Commit Task 1**

Run:

```bash
git add apps/web/src/lib/dashboard/day-agenda.ts apps/web/src/lib/dashboard/day-agenda.test.ts
git commit -m "feat: enrich day agenda action metadata"
```

---

### Task 2: Add Pure Dashboard Overview Model

**Files:**
- Create: `apps/web/src/lib/dashboard/dashboard-overview.ts`
- Create: `apps/web/src/lib/dashboard/dashboard-overview.test.ts`

- [ ] **Step 1: Write the failing overview model tests**

Create `apps/web/src/lib/dashboard/dashboard-overview.test.ts`:

```ts
import { describe, expect, test } from "vitest";

import type { AgendaAppointmentInput } from "./day-agenda";
import { buildDashboardOverviewModel } from "./dashboard-overview";

function appointment(
  overrides: Partial<AgendaAppointmentInput> = {},
): AgendaAppointmentInput {
  return {
    id: "appointment-1",
    beginAt: new Date("2026-07-02T09:00:00.000Z"),
    endAt: new Date("2026-07-02T10:00:00.000Z"),
    status: "CONFIRMED",
    atHome: true,
    note: "Séance de suivi locomoteur",
    reports: [],
    patient: {
      id: "animal-1",
      name: "Naska",
      breed: "Border Collie",
      animal: { name: "Chien", code: "dog" },
      owner: { id: "owner-1", name: "Malo Garnier" },
    },
    ...overrides,
  };
}

describe("buildDashboardOverviewModel", () => {
  test("builds top summary, next appointment, priorities and recent activity", () => {
    const model = buildDashboardOverviewModel({
      selectedDate: new Date("2026-07-02T00:00:00.000Z"),
      now: new Date("2026-07-02T08:30:00.000Z"),
      appointments: [
        appointment({
          id: "sent",
          beginAt: new Date("2026-07-02T07:00:00.000Z"),
          endAt: new Date("2026-07-02T08:00:00.000Z"),
          status: "COMPLETED",
          reports: [{ id: "report-sent", status: "sent", updatedAt: null }],
        }),
        appointment({
          id: "next",
          beginAt: new Date("2026-07-02T09:00:00.000Z"),
          endAt: new Date("2026-07-02T10:00:00.000Z"),
          status: "CONFIRMED",
        }),
        appointment({
          id: "draft",
          beginAt: new Date("2026-07-02T11:30:00.000Z"),
          endAt: new Date("2026-07-02T12:30:00.000Z"),
          status: "COMPLETED",
          reports: [{ id: "report-draft", status: "draft", updatedAt: null }],
        }),
      ],
      metrics: {
        newAnimals: 4,
        newOwners: 2,
        sentReports: 7,
      },
      recentActivity: [
        {
          id: "activity-1",
          title: "Compte rendu envoyé",
          description: "Naska",
          timestamp: "Il y a 2h",
        },
      ],
    });

    expect(model.heroLabel).toBe("Vue d'ensemble");
    expect(model.nextAppointment?.id).toBe("next");
    expect(model.summary.map((item) => [item.id, item.value])).toEqual([
      ["next", "09:00"],
      ["appointments", "3"],
      ["reports", "1"],
      ["followUps", "0"],
    ]);
    expect(model.priorities.map((item) => item.appointmentId)).toEqual([
      "next",
      "draft",
    ]);
    expect(model.recentActivity[0]).toMatchObject({
      id: "activity-1",
      title: "Compte rendu envoyé",
    });
    expect(model.activitySignals.map((item) => [item.label, item.value])).toEqual([
      ["Animaux ajoutés", "4"],
      ["Propriétaires ajoutés", "2"],
      ["Comptes rendus envoyés", "7"],
    ]);
  });

  test("returns calm empty states when the day has no appointments or priorities", () => {
    const model = buildDashboardOverviewModel({
      selectedDate: new Date("2026-07-02T00:00:00.000Z"),
      now: new Date("2026-07-02T08:30:00.000Z"),
      appointments: [],
      metrics: {
        newAnimals: 0,
        newOwners: 0,
        sentReports: 0,
      },
      recentActivity: [],
    });

    expect(model.nextAppointment).toBeNull();
    expect(model.priorities).toEqual([]);
    expect(model.emptyStates).toEqual({
      agenda: "Aucune séance prévue aujourd'hui.",
      priorities: "Rien d'urgent à traiter.",
      recentActivity: "Aucune activité récente à afficher.",
    });
  });
});
```

- [ ] **Step 2: Run the overview tests and verify they fail**

Run:

```bash
bun --filter @biume/web test apps/web/src/lib/dashboard/dashboard-overview.test.ts
```

Expected: FAIL because `dashboard-overview.ts` does not exist.

- [ ] **Step 3: Implement the overview model**

Create `apps/web/src/lib/dashboard/dashboard-overview.ts`:

```ts
import {
  buildDayAgendaModel,
  type AgendaAppointmentInput,
  type AgendaTodoItem,
  type DayAgendaAppointment,
} from "./day-agenda";

type RecentActivityInput = {
  id: string;
  title: string;
  description: string;
  timestamp: string;
};

type ActivityMetricsInput = {
  newAnimals: number;
  newOwners: number;
  sentReports: number;
};

export type DashboardSummaryItem = {
  id: "next" | "appointments" | "reports" | "followUps";
  label: string;
  value: string;
  detail: string;
  tone: "neutral" | "warning" | "success";
};

export type DashboardPriorityItem = {
  id: string;
  appointmentId: string;
  reportId?: string;
  title: string;
  description: string;
  timeLabel: string;
  actionLabel: string;
  tone: "neutral" | "warning" | "success";
};

export type DashboardActivitySignal = {
  label: string;
  value: string;
  detail: string;
};

export type DashboardOverviewModel = {
  heroLabel: "Vue d'ensemble";
  selectedDate: Date;
  nextAppointment: DayAgendaAppointment | null;
  agenda: DayAgendaAppointment[];
  summary: DashboardSummaryItem[];
  priorities: DashboardPriorityItem[];
  recentActivity: RecentActivityInput[];
  activitySignals: DashboardActivitySignal[];
  emptyStates: {
    agenda: string;
    priorities: string;
    recentActivity: string;
  };
};

export type DashboardOverviewInput = {
  selectedDate: Date;
  now: Date;
  appointments: AgendaAppointmentInput[];
  metrics: ActivityMetricsInput;
  recentActivity: RecentActivityInput[];
};

export function buildDashboardOverviewModel({
  appointments,
  metrics,
  now,
  recentActivity,
  selectedDate,
}: DashboardOverviewInput): DashboardOverviewModel {
  const dayAgenda = buildDayAgendaModel({
    appointments,
    now,
    selectedDate,
  });
  const nextAppointment =
    dayAgenda.appointments.find(
      (appointment) =>
        appointment.status !== "CANCELLED" &&
        appointment.endAt.getTime() >= now.getTime(),
    ) ?? null;
  const reportTodoCount = dayAgenda.todo.afterSession.length;
  const priorities = [
    ...dayAgenda.todo.beforeSession.map((item) =>
      toPriorityItem(item, "neutral"),
    ),
    ...dayAgenda.todo.afterSession.map((item) =>
      toPriorityItem(
        item,
        item.action.kind === "send_report" ? "success" : "warning",
      ),
    ),
  ];

  return {
    heroLabel: "Vue d'ensemble",
    selectedDate,
    nextAppointment,
    agenda: dayAgenda.appointments,
    summary: [
      {
        id: "next",
        label: "Prochaine séance",
        value: nextAppointment ? formatTime(nextAppointment.beginAt) : "-",
        detail: nextAppointment
          ? getAppointmentAnimalLabel(nextAppointment)
          : "Aucune séance à venir aujourd'hui",
        tone: "neutral",
      },
      {
        id: "appointments",
        label: "Séances aujourd'hui",
        value: String(dayAgenda.summary.appointmentCount),
        detail: `${dayAgenda.summary.beforeSessionCount} préparation${dayAgenda.summary.beforeSessionCount > 1 ? "s" : ""}`,
        tone: "neutral",
      },
      {
        id: "reports",
        label: "Comptes rendus",
        value: String(reportTodoCount),
        detail: "À créer, finaliser ou envoyer",
        tone: reportTodoCount > 0 ? "warning" : "success",
      },
      {
        id: "followUps",
        label: "Suivis",
        value: "0",
        detail: "Module dédié à venir",
        tone: "neutral",
      },
    ],
    priorities,
    recentActivity,
    activitySignals: [
      {
        label: "Animaux ajoutés",
        value: String(metrics.newAnimals),
        detail: "90 derniers jours",
      },
      {
        label: "Propriétaires ajoutés",
        value: String(metrics.newOwners),
        detail: "90 derniers jours",
      },
      {
        label: "Comptes rendus envoyés",
        value: String(metrics.sentReports),
        detail: "30 derniers jours",
      },
    ],
    emptyStates: {
      agenda: "Aucune séance prévue aujourd'hui.",
      priorities: "Rien d'urgent à traiter.",
      recentActivity: "Aucune activité récente à afficher.",
    },
  };
}

function toPriorityItem(
  item: AgendaTodoItem,
  tone: DashboardPriorityItem["tone"],
): DashboardPriorityItem {
  return {
    id: item.id,
    appointmentId: item.appointmentId,
    reportId: item.action.reportId,
    title: `${item.action.label} · ${item.animalName}`,
    description: item.ownerName,
    timeLabel: item.timeLabel,
    actionLabel: item.action.label,
    tone,
  };
}

function getAppointmentAnimalLabel(appointment: DayAgendaAppointment) {
  return appointment.patient?.name ?? "Animal non renseigné";
}

function formatTime(value: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}
```

- [ ] **Step 4: Run the overview tests and verify they pass**

Run:

```bash
bun --filter @biume/web test apps/web/src/lib/dashboard/dashboard-overview.test.ts
```

Expected: PASS.

- [ ] **Step 5: Run both dashboard helper test files**

Run:

```bash
bun --filter @biume/web test apps/web/src/lib/dashboard/day-agenda.test.ts apps/web/src/lib/dashboard/dashboard-overview.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit Task 2**

Run:

```bash
git add apps/web/src/lib/dashboard/dashboard-overview.ts apps/web/src/lib/dashboard/dashboard-overview.test.ts
git commit -m "feat: add dashboard overview model"
```

---

### Task 3: Aggregate Overview Data in the Dashboard Query

**Files:**
- Modify: `apps/web/src/lib/api/queries/dashboard.query.ts`

- [ ] **Step 1: Update dashboard query imports**

In `apps/web/src/lib/api/queries/dashboard.query.ts`, remove `getTodayAppointments` if it is only used by this file and add:

```ts
import { getDashboardAgendaDay } from "#/lib/api/actions/dashboard-agenda.action";
```

- [ ] **Step 2: Add local date helper**

In `apps/web/src/lib/api/queries/dashboard.query.ts`, add this helper below the imports:

```ts
function toDateSearch(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
```

- [ ] **Step 3: Replace today appointment fetching with agenda-day fetching**

In `dashboardOverviewQueryOptions`, replace the query body with:

```ts
queryFn: async () => {
  const today = toDateSearch(new Date());
  const [
    organization,
    newClients,
    newPatients,
    sentReports,
    draftReports,
    species,
    recentActivity,
    recentReports,
    agendaDay,
  ] = await Promise.all([
    getCurrentOrganization(),
    getNewClientsMetric(90),
    getNewPatientsMetric(90),
    getSentReportsMetric(30),
    getDraftReportsMetric(30),
    getClienteleBySpecies(),
    getRecentActivity(5),
    getRecentReports(5),
    getDashboardAgendaDay(today),
  ]);

  return {
    organization,
    selectedDate: agendaDay.selectedDate,
    appointments: agendaDay.appointments,
    metrics: {
      newClients,
      newPatients,
      sentReports,
      draftReports,
    },
    species,
    recentActivity,
    recentReports,
  };
},
```

- [ ] **Step 4: Run type checking for the web app**

Run:

```bash
bun run check-types
```

Expected: PASS or existing unrelated failures documented before continuing.

- [ ] **Step 5: Commit Task 3**

Run:

```bash
git add apps/web/src/lib/api/queries/dashboard.query.ts
git commit -m "feat: aggregate dashboard overview data"
```

---

### Task 4: Build Overview UI Components

**Files:**
- Create: `apps/web/src/components/dashboard/overview/dashboard-summary-strip.tsx`
- Create: `apps/web/src/components/dashboard/overview/dashboard-agenda-preview.tsx`
- Create: `apps/web/src/components/dashboard/overview/dashboard-priorities-panel.tsx`
- Create: `apps/web/src/components/dashboard/overview/dashboard-recent-activity.tsx`
- Create: `apps/web/src/components/dashboard/overview/dashboard-overview-view.tsx`

- [ ] **Step 1: Create the summary strip component**

Create `apps/web/src/components/dashboard/overview/dashboard-summary-strip.tsx`:

```tsx
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  FileText,
  type LucideIcon,
} from "lucide-react";

import { cn } from "#/lib/utils";
import type { DashboardSummaryItem } from "#/lib/dashboard/dashboard-overview";

type DashboardSummaryStripProps = {
  items: DashboardSummaryItem[];
};

const iconById = {
  next: CalendarDays,
  appointments: CalendarDays,
  reports: FileText,
  followUps: CheckCircle2,
} satisfies Record<DashboardSummaryItem["id"], LucideIcon>;

export function DashboardSummaryStrip({ items }: DashboardSummaryStripProps) {
  return (
    <section className="grid gap-2 md:grid-cols-4">
      {items.map((item) => {
        const Icon = iconById[item.id];

        return (
          <article
            key={item.id}
            className={cn(
              "min-w-0 rounded-lg border bg-card px-4 py-3",
              item.tone === "warning"
                ? "border-amber-200 bg-amber-50/60 text-amber-950"
                : "border-border text-foreground",
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-muted-foreground">
                  {item.label}
                </p>
                <p className="mt-1 font-mono text-2xl font-semibold leading-none">
                  {item.value}
                </p>
              </div>
              {item.tone === "warning" ? (
                <AlertCircle className="size-4 shrink-0 text-amber-700" />
              ) : (
                <Icon className="size-4 shrink-0 text-muted-foreground" />
              )}
            </div>
            <p className="mt-2 truncate text-xs text-muted-foreground">
              {item.detail}
            </p>
          </article>
        );
      })}
    </section>
  );
}
```

- [ ] **Step 2: Create the agenda preview component**

Create `apps/web/src/components/dashboard/overview/dashboard-agenda-preview.tsx`:

```tsx
import { Link } from "@tanstack/react-router";
import { ArrowRight, Clock, MapPin, PawPrint } from "lucide-react";

import { Button } from "#/components/ui/button";
import type { DayAgendaAppointment } from "#/lib/dashboard/day-agenda";

type DashboardAgendaPreviewProps = {
  appointments: DayAgendaAppointment[];
  emptyLabel: string;
};

export function DashboardAgendaPreview({
  appointments,
  emptyLabel,
}: DashboardAgendaPreviewProps) {
  return (
    <section className="min-w-0 rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold">Agenda du jour</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Séances et actions immédiates.
          </p>
        </div>
        <Button size="sm" variant="outline" render={<Link to="/dashboard/agenda" />}>
          Ouvrir
          <ArrowRight className="size-4" data-icon="inline-end" />
        </Button>
      </div>

      {appointments.length === 0 ? (
        <div className="px-4 py-10 text-center text-sm text-muted-foreground">
          {emptyLabel}
        </div>
      ) : (
        <div className="divide-y divide-border">
          {appointments.slice(0, 6).map((appointment) => (
            <article
              key={appointment.id}
              className="grid gap-3 px-4 py-3 md:grid-cols-[5.5rem_minmax(0,1fr)_auto] md:items-center"
            >
              <div className="font-mono text-sm font-semibold">
                {formatTime(appointment.beginAt)}
              </div>
              <div className="min-w-0">
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <h3 className="truncate text-sm font-semibold">
                    {appointment.patient?.name ?? "Animal non renseigné"}
                  </h3>
                  <span className="rounded-md border border-border px-2 py-0.5 text-xs text-muted-foreground">
                    {appointment.primaryAction.label}
                  </span>
                </div>
                <p className="mt-1 flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span className="inline-flex min-w-0 items-center gap-1.5">
                    <PawPrint className="size-3.5 shrink-0" />
                    <span className="truncate">
                      {appointment.patient?.owner?.name ?? "Propriétaire inconnu"}
                    </span>
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="size-3.5 shrink-0" />
                    {appointment.durationLabel}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="size-3.5 shrink-0" />
                    {appointment.atHome ? "À domicile" : "Lieu fixe"}
                  </span>
                </p>
              </div>
              <Button size="sm" variant="outline">
                {appointment.primaryAction.label}
              </Button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function formatTime(value: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}
```

- [ ] **Step 3: Create the priorities panel component**

Create `apps/web/src/components/dashboard/overview/dashboard-priorities-panel.tsx`:

```tsx
import { CheckCircle2, FileText, ListChecks } from "lucide-react";

import { Button } from "#/components/ui/button";
import { cn } from "#/lib/utils";
import type { DashboardPriorityItem } from "#/lib/dashboard/dashboard-overview";

type DashboardPrioritiesPanelProps = {
  emptyLabel: string;
  priorities: DashboardPriorityItem[];
};

export function DashboardPrioritiesPanel({
  emptyLabel,
  priorities,
}: DashboardPrioritiesPanelProps) {
  return (
    <aside className="rounded-lg border border-border bg-card">
      <div className="border-b border-border px-4 py-3">
        <p className="text-xs font-medium text-muted-foreground">Priorités</p>
        <h2 className="mt-0.5 text-sm font-semibold">À traiter</h2>
      </div>

      {priorities.length === 0 ? (
        <div className="px-4 py-8 text-sm text-muted-foreground">
          {emptyLabel}
        </div>
      ) : (
        <div className="grid gap-2 p-3">
          {priorities.slice(0, 8).map((priority) => (
            <article
              key={priority.id}
              className={cn(
                "grid grid-cols-[auto_1fr] gap-3 rounded-lg border px-3 py-3",
                priority.tone === "warning"
                  ? "border-amber-200 bg-amber-50/60"
                  : priority.tone === "success"
                    ? "border-emerald-200 bg-emerald-50/60"
                    : "border-border bg-background",
              )}
            >
              <div className="flex size-9 items-center justify-center rounded-md border border-border bg-card">
                {priority.tone === "success" ? (
                  <CheckCircle2 className="size-4 text-emerald-700" />
                ) : priority.tone === "warning" ? (
                  <FileText className="size-4 text-amber-700" />
                ) : (
                  <ListChecks className="size-4 text-muted-foreground" />
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{priority.title}</p>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {priority.timeLabel} · {priority.description}
                </p>
                <Button className="mt-2 h-8" size="sm" variant="outline">
                  {priority.actionLabel}
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}
    </aside>
  );
}
```

- [ ] **Step 4: Create the recent activity component**

Create `apps/web/src/components/dashboard/overview/dashboard-recent-activity.tsx`:

```tsx
import type {
  DashboardActivitySignal,
} from "#/lib/dashboard/dashboard-overview";

type RecentActivityItem = {
  id: string;
  title: string;
  description: string;
  timestamp: string;
};

type DashboardRecentActivityProps = {
  activitySignals: DashboardActivitySignal[];
  emptyLabel: string;
  recentActivity: RecentActivityItem[];
};

export function DashboardRecentActivity({
  activitySignals,
  emptyLabel,
  recentActivity,
}: DashboardRecentActivityProps) {
  return (
    <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="rounded-lg border border-border bg-card">
        <div className="border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold">Activité récente</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Ce qui a bougé récemment.
          </p>
        </div>
        {recentActivity.length === 0 ? (
          <div className="px-4 py-8 text-sm text-muted-foreground">
            {emptyLabel}
          </div>
        ) : (
          <div className="divide-y divide-border">
            {recentActivity.map((item) => (
              <article key={item.id} className="px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{item.title}</p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {item.timestamp}
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <h2 className="text-sm font-semibold">Repères d'activité</h2>
        <div className="mt-4 grid gap-3">
          {activitySignals.map((signal) => (
            <div
              key={signal.label}
              className="flex items-center justify-between gap-4 border-b border-border pb-3 last:border-0 last:pb-0"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{signal.label}</p>
                <p className="text-xs text-muted-foreground">{signal.detail}</p>
              </div>
              <span className="font-mono text-lg font-semibold">
                {signal.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Create the overview page component**

Create `apps/web/src/components/dashboard/overview/dashboard-overview-view.tsx`:

```tsx
import type { AgendaAppointmentInput } from "#/lib/dashboard/day-agenda";
import {
  buildDashboardOverviewModel,
  type DashboardOverviewModel,
} from "#/lib/dashboard/dashboard-overview";

import { DashboardAgendaPreview } from "./dashboard-agenda-preview";
import { DashboardPrioritiesPanel } from "./dashboard-priorities-panel";
import { DashboardRecentActivity } from "./dashboard-recent-activity";
import { DashboardSummaryStrip } from "./dashboard-summary-strip";

type DashboardOverviewViewProps = {
  appointments: AgendaAppointmentInput[];
  metrics: {
    newAnimals: number;
    newOwners: number;
    sentReports: number;
  };
  recentActivity: Array<{
    id: string;
    title: string;
    description: string;
    timestamp: string;
  }>;
  selectedDate: Date;
};

export function DashboardOverviewView({
  appointments,
  metrics,
  recentActivity,
  selectedDate,
}: DashboardOverviewViewProps) {
  const model = buildDashboardOverviewModel({
    appointments,
    metrics,
    now: new Date(),
    recentActivity,
    selectedDate,
  });

  return <DashboardOverviewContent model={model} />;
}

function DashboardOverviewContent({ model }: { model: DashboardOverviewModel }) {
  return (
    <div className="grid gap-5 pb-8">
      <header className="grid gap-2 border-b border-border pb-5 pt-2">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
          Activité
        </p>
        <div className="grid gap-2 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
              {model.heroLabel}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Aujourd'hui, vos séances, les comptes rendus à terminer et les
              suivis utiles au même endroit.
            </p>
          </div>
          <p className="font-mono text-sm text-muted-foreground">
            {formatLongDate(model.selectedDate)}
          </p>
        </div>
      </header>

      <DashboardSummaryStrip items={model.summary} />

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <DashboardAgendaPreview
          appointments={model.agenda}
          emptyLabel={model.emptyStates.agenda}
        />
        <DashboardPrioritiesPanel
          emptyLabel={model.emptyStates.priorities}
          priorities={model.priorities}
        />
      </section>

      <DashboardRecentActivity
        activitySignals={model.activitySignals}
        emptyLabel={model.emptyStates.recentActivity}
        recentActivity={model.recentActivity}
      />
    </div>
  );
}

function formatLongDate(date: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  }).format(date);
}
```

- [ ] **Step 6: Run TypeScript on the web app**

Run:

```bash
bun run check-types
```

Expected: PASS or existing unrelated failures documented before continuing.

- [ ] **Step 7: Commit Task 4**

Run:

```bash
git add apps/web/src/components/dashboard/overview
git commit -m "feat: add dashboard overview components"
```

---

### Task 5: Wire `/dashboard` to the Overview

**Files:**
- Modify: `apps/web/src/routes/dashboard/index.tsx`

- [ ] **Step 1: Replace the agenda-only route imports**

In `apps/web/src/routes/dashboard/index.tsx`, replace current imports with:

```tsx
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "#/components/ui/alert";
import { DashboardOverviewView } from "#/components/dashboard/overview/dashboard-overview-view";
import { dashboardOverviewQueryOptions } from "#/lib/api/queries/dashboard.query";
import { Skeleton } from "#/components/ui/skeleton";
```

- [ ] **Step 2: Replace the route definition and component**

Replace the current file body with:

```tsx
export const Route = createFileRoute("/dashboard/")({
  head: () => ({
    meta: [
      { title: "Vue d'ensemble | Biume" },
      {
        name: "description",
        content:
          "Suivez vos séances du jour, comptes rendus à traiter et activité récente dans Biume.",
      },
    ],
  }),
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(dashboardOverviewQueryOptions()),
  pendingComponent: DashboardOverviewPending,
  errorComponent: DashboardOverviewError,
  component: DashboardIndexPage,
});

function DashboardIndexPage() {
  const { data } = useSuspenseQuery(dashboardOverviewQueryOptions());

  return (
    <DashboardOverviewView
      appointments={data.appointments}
      metrics={{
        newAnimals: data.metrics.newPatients.value,
        newOwners: data.metrics.newClients.value,
        sentReports: data.metrics.sentReports.value,
      }}
      recentActivity={data.recentActivity}
      selectedDate={new Date(`${data.selectedDate}T00:00:00`)}
    />
  );
}

function DashboardOverviewPending() {
  return (
    <div className="grid gap-5 pb-8">
      <header className="grid gap-2 border-b border-border pb-5 pt-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-full max-w-xl" />
      </header>

      <section className="grid gap-2 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-24 rounded-lg" />
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <Skeleton className="h-[28rem] rounded-lg" />
        <Skeleton className="h-[28rem] rounded-lg" />
      </section>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <Skeleton className="h-64 rounded-lg" />
        <Skeleton className="h-64 rounded-lg" />
      </section>
    </div>
  );
}

function DashboardOverviewError() {
  return (
    <div className="grid gap-5 pb-8">
      <header className="border-b border-border pb-5 pt-2">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
          Activité
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
          Vue d'ensemble
        </h1>
      </header>

      <Alert variant="destructive">
        <AlertTitle>Impossible de charger la vue d'ensemble</AlertTitle>
        <AlertDescription>
          Les données de votre activité ne sont pas disponibles pour le moment.
          Rechargez la page ou réessayez dans quelques instants.
        </AlertDescription>
      </Alert>
    </div>
  );
}
```

- [ ] **Step 3: Run route generation**

Run:

```bash
bun --filter @biume/web generate-routes
```

Expected: route generation completes. It may update `apps/web/src/routeTree.gen.ts`.

- [ ] **Step 4: Run focused tests**

Run:

```bash
bun --filter @biume/web test apps/web/src/lib/dashboard/day-agenda.test.ts apps/web/src/lib/dashboard/dashboard-overview.test.ts
```

Expected: PASS.

- [ ] **Step 5: Run web type checking**

Run:

```bash
bun run check-types
```

Expected: PASS or existing unrelated failures documented before continuing.

- [ ] **Step 6: Commit Task 5**

Run:

```bash
git add apps/web/src/routes/dashboard/index.tsx apps/web/src/routeTree.gen.ts
git commit -m "feat: make dashboard an activity overview"
```

---

### Task 6: Update Sidebar Labels

**Files:**
- Modify: `apps/web/src/lib/menu-list.tsx`

- [ ] **Step 1: Update sidebar imports**

In `apps/web/src/lib/menu-list.tsx`, include both `LayoutDashboard` and `CalendarDays`:

```ts
import {
  CalendarDays,
  Contact2,
  LayoutDashboard,
  type LucideIcon,
  NotepadText,
  PawPrint,
  Settings,
} from "lucide-react";
```

- [ ] **Step 2: Update menu items**

In `proMenuList`, make the root item "Vue d'ensemble" and add agenda under the main group:

```ts
export function proMenuList(pathname: string): Group[] {
  return [
    {
      groupLabel: "",
      menus: [
        {
          href: `/dashboard`,
          label: "Vue d'ensemble",
          active: pathname === `/dashboard`,
          icon: LayoutDashboard,
        },
        {
          href: `/dashboard/agenda`,
          label: "Agenda",
          active: pathname === `/dashboard/agenda`,
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

- [ ] **Step 3: Run web type checking**

Run:

```bash
bun run check-types
```

Expected: PASS or existing unrelated failures documented before continuing.

- [ ] **Step 4: Commit Task 6**

Run:

```bash
git add apps/web/src/lib/menu-list.tsx
git commit -m "feat: clarify dashboard navigation labels"
```

---

### Task 7: Browser Verification and Polish

**Files:**
- Modify only files from Tasks 1-6 if issues are found.

- [ ] **Step 1: Start the web dev server**

Run:

```bash
bun run dev:web
```

Expected: Vite/TanStack Start starts and prints a local URL, usually `http://localhost:3000` or `http://localhost:5173`.

- [ ] **Step 2: Open `/dashboard` with an authenticated test session**

Use the existing local login/session flow. If there is no valid local session, sign in through the app using the developer account available in the environment. Do not create or commit credentials.

Expected: `/dashboard` renders "Vue d'ensemble" and no longer renders the agenda-only page title.

- [ ] **Step 3: Verify desktop layout**

At a desktop viewport around `1440x900`, check:

- summary strip is compact and does not look like marketing cards
- agenda is the dominant left area
- "À traiter" is visible on the right
- recent activity is secondary below
- no text overlaps or overflows
- sidebar has "Vue d'ensemble" and "Agenda" as separate entries

- [ ] **Step 4: Verify mobile layout**

At a mobile viewport around `390x844`, check:

- summary items stack cleanly
- agenda preview appears before priorities
- buttons remain tappable and text stays inside containers
- there is no horizontal scrolling

- [ ] **Step 5: Run final automated verification**

Run:

```bash
bun --filter @biume/web test apps/web/src/lib/dashboard/day-agenda.test.ts apps/web/src/lib/dashboard/dashboard-overview.test.ts
bun run check-types
```

Expected: PASS or existing unrelated failures documented before continuing.

- [ ] **Step 6: Commit any polish fixes**

Only if files changed during verification:

```bash
git add apps/web/src/lib/dashboard apps/web/src/components/dashboard/overview apps/web/src/routes/dashboard/index.tsx apps/web/src/lib/menu-list.tsx apps/web/src/routeTree.gen.ts
git commit -m "fix: polish dashboard overview"
```

---

## Self-Review

Spec coverage:

- Activity overview instead of agenda-only: Task 5.
- Top summary: Task 4 summary strip.
- Agenda remains central: Task 4 agenda preview.
- "À traiter" prioritization surface: Task 2 model and Task 4 priorities panel.
- Recent activity and lightweight activity signals: Task 2 model and Task 4 recent activity.
- Independent professional vocabulary and no cabinet framing: Task 4 copy and Task 6 labels.
- Existing data reuse: Task 3.
- Loading/empty/error: empty states are covered in Task 2 and Task 4; route-level pending/error components are covered in Task 5.
- No broad schema refactor: all tasks use existing server functions and query wrappers.

Placeholder scan:

- No `TBD` or unfinished placeholders are present.
- Deferred follow-ups are explicit as a count of `0` with "Module dédié à venir" until a real module exists.

Type consistency:

- `DashboardOverviewView` consumes `appointments`, `metrics`, `recentActivity`, and `selectedDate`.
- `dashboardOverviewQueryOptions` returns `appointments`, `metrics`, `recentActivity`, and `selectedDate`.
- `DashboardPriorityItem` fields match the UI component props.
