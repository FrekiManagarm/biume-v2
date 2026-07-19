# Report Domain Foundation Implementation Plan

**Execution branch:** `codex/report-domain-foundation`

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the canonical, persistent report foundation that both the existing web editor and the future mobile application can use, including explicit section decisions, frictionless first-report creation, revisioning, and immutable owner-facing shared versions.

**Architecture:** Add a UI- and database-independent `@biume/contracts` package for report schemas and pure rules, then make the Drizzle schema and TanStack Start server functions consume those contracts. Keep the existing advanced report as the single report model; extend it with section-state rows and revisions instead of creating a second mobile format. Deliver this as a web-testable vertical slice before starting audio capture, mobile, OTP, or follow-up work.

**Tech Stack:** Bun workspaces, TypeScript, Zod 4, Drizzle ORM/PostgreSQL, TanStack Start server functions, React, TanStack Query, Vitest, Testing Library, Tailwind CSS v4, existing Shadcn-style components.

## Global Constraints

- The canonical product source is `PRODUCT.md`; the approved technical design is `docs/superpowers/specs/2026-07-18-product-proposition-alignment-design.md`.
- Biume remains specialized in report creation and post-session follow-up for independent animal osteopaths; this plan must not add generic CRM scope.
- Mobile and web must manipulate the same report and the same data model; do not create a separate mobile report type.
- The canonical professional sections are `clinical`, `anatomical`, `recommendations`, and `notes`.
- Persisted section states are exactly `empty`, `proposed`, `needs_confirmation`, `confirmed`, and `not_applicable`.
- A report may be finalized only when all four professional sections are `confirmed` or `not_applicable`.
- Biume must never share content without explicit practitioner validation and must never infer missing clinical information.
- The quick-create minimum is owner name, optional owner email, and animal name; detailed animal fields remain completable later.
- A shared report version is immutable; editing the report increments its revision and a later share creates a new version.
- Organization isolation is mandatory for every read and mutation.
- Use Bun commands and existing workspace patterns; do not add npm, Yarn, pnpm, Express, a second ORM, or a new state-management library.
- This plan does not implement Expo, audio capture, transcription, AI extraction, OTP, e-mail delivery, questionnaires, scheduled jobs, or mobile notifications.
- Preserve unrelated worktree changes, especially `apps/web/src/components/dashboard/pages/reports-module/data/cat/dataCat.ts`.

---

## File Map

### New files

- `packages/contracts/package.json` — workspace package boundary and test/typecheck scripts.
- `packages/contracts/tsconfig.json` — shared TypeScript configuration.
- `packages/contracts/src/index.ts` — public exports only.
- `packages/contracts/src/report.ts` — report schemas, section states, finalization rule, quick-create input, and owner snapshot contract.
- `packages/contracts/src/report.test.ts` — pure contract and business-rule tests.
- `packages/contracts/src/product-events.ts` — stable analytics event names and payload schemas required by later vertical slices.
- `packages/contracts/src/product-events.test.ts` — analytics contract tests.
- `packages/db/src/schema/advancedReport/reportSectionState.ts` — one persisted decision per report section.
- `packages/db/src/schema/advancedReport/reportSharedVersion.ts` — immutable owner-facing report snapshots.
- `packages/db/src/migrations/0002_report_domain_foundation.sql` — Drizzle-generated schema migration plus the explicit four-section data backfill.
- `packages/db/src/migrations/meta/0002_snapshot.json` — Drizzle-generated snapshot.
- `packages/db/src/schema/report-domain.test.ts` — schema-level assertions that do not require a live database.
- `apps/web/src/functions/report-domain.ts` — pure row/snapshot builders used by server functions.
- `apps/web/src/functions/report-domain.test.ts` — pure server-domain tests.
- `apps/web/src/functions/report-owner-content.function.test.ts` — tenant and revision wiring for owner-facing edits.
- `apps/web/src/components/dashboard/pages/reports-module/components/SectionDecisionControl.tsx` — explicit confirm/non-applicable control.
- `apps/web/src/components/dashboard/pages/reports-module/components/SectionDecisionControl.test.tsx` — control behavior and accessible copy.

### Modified files

- `packages/db/package.json` — depend on `@biume/contracts`.
- `packages/db/drizzle.config.ts` — exclude colocated `*.test.ts` files from schema discovery.
- `packages/db/src/schema/index.ts` — export both new tables.
- `packages/db/src/schema/advancedReport/advancedReport.ts` — add `revision` and relations.
- `packages/db/src/schema/pets.ts` — make profile-only animal fields nullable.
- `packages/db/scripts/baseline-existing.ts` — allow the known baseline followed by any journaled generated migrations.
- `packages/db/scripts/baseline-existing.test.ts` — cover the journal validation rule.
- `packages/db/MIGRATIONS.md` — document the generalized baseline workflow.
- `apps/web/package.json` — depend on `@biume/contracts`.
- `apps/web/src/lib/utils/schemas.ts` — re-export canonical report schemas instead of duplicating them.
- `apps/web/src/components/dashboard/pages/reports-module/owner-content.ts` — re-export the canonical section identifier while retaining owner-content-only types.
- `apps/web/src/functions/reports.function.ts` — persist section decisions, enforce finalization, increment revisions, quick-create records, and create shared versions.
- `apps/web/src/functions/report-owner-content.function.ts` — increment the canonical revision atomically with owner-facing content edits.
- `apps/web/src/components/dashboard/pages/reports-module/reports-editor.helpers.ts` — use canonical section-state types and derive suggested states without overwriting explicit decisions.
- `apps/web/src/components/dashboard/pages/reports-module/reports-editor.helpers.test.ts` — test canonical state derivation and payload creation.
- `apps/web/src/components/dashboard/pages/reports-module/reports-editor.tsx` — load, edit, save, and display persisted section decisions.
- `apps/web/src/components/dashboard/pages/reports-module/components/InitializationDialog.tsx` — add the inline first-report path while retaining selection of existing animals.
- `apps/web/src/components/dashboard/pages/reports-module/components/InitializationDialog.helpers.ts` — validate the two creation modes.
- `apps/web/src/components/dashboard/pages/reports-module/components/InitializationDialog.helpers.test.ts` — test existing-animal and quick-create modes.
- `apps/web/src/components/dashboard/pages/reports-module/components/ReportSidebarNavigation.tsx` — render canonical professional states.
- `apps/web/src/components/dashboard/pages/reports-module/components/ReportSidebarNavigation.test.tsx` — cover confirmed and non-applicable labels.

## Task 1: Create the shared report contracts

**Files:**

- Create: `packages/contracts/package.json`
- Create: `packages/contracts/tsconfig.json`
- Create: `packages/contracts/src/index.ts`
- Create: `packages/contracts/src/report.ts`
- Create: `packages/contracts/src/report.test.ts`
- Create: `packages/contracts/src/product-events.ts`
- Create: `packages/contracts/src/product-events.test.ts`
- Modify: `apps/web/package.json`
- Modify: `apps/web/src/lib/utils/schemas.ts`
- Modify: `apps/web/src/components/dashboard/pages/reports-module/owner-content.ts`

**Interfaces:**

- Consumes: Zod from the root catalog and the existing report field shapes currently declared in `apps/web/src/lib/utils/schemas.ts`.
- Produces: `ReportSectionId`, `ReportSectionState`, `ReportSectionStates`, `reportSchema`, `createReportSchema`, `quickReportSchema`, `ownerReportSnapshotSchema`, `canFinalizeReport`, `createInitialReportSectionStates`, `ProductEventName`, and `productEventSchema`.

- [ ] **Step 1: Write failing contract tests**

Create `packages/contracts/src/report.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
  canFinalizeReport,
  createInitialReportSectionStates,
  ownerReportSnapshotSchema,
  quickReportSchema,
  reportSchema,
} from "./report";

describe("report contracts", () => {
  it("requires every section to be explicitly resolved before finalization", () => {
    expect(
      canFinalizeReport({
        clinical: "confirmed",
        anatomical: "not_applicable",
        recommendations: "confirmed",
        notes: "confirmed",
      }),
    ).toBe(true);
    expect(
      canFinalizeReport({
        clinical: "confirmed",
        anatomical: "empty",
        recommendations: "confirmed",
        notes: "confirmed",
      }),
    ).toBe(false);
  });

  it("starts every new report with empty persisted decisions", () => {
    expect(createInitialReportSectionStates()).toEqual({
      clinical: "empty",
      anatomical: "empty",
      recommendations: "empty",
      notes: "empty",
    });
  });

  it("accepts the minimum quick-create identity", () => {
    expect(
      quickReportSchema.parse({ ownerName: "Camille", animalName: "Nox" }),
    ).toMatchObject({
      ownerName: "Camille",
      animalName: "Nox",
      title: "Nouveau rapport",
      consultationReason: "",
    });
  });

  it("rejects duplicate anatomical and recommendation identifiers", () => {
    const base = {
      title: "Séance de Nox",
      observations: [],
      anatomicalIssues: [],
      recommendations: [],
      sectionStates: createInitialReportSectionStates(),
    };
    const duplicate = {
      ...base,
      recommendations: [
        { id: "same", content: "Repos" },
        { id: "same", content: "Hydratation" },
      ],
    };
    expect(reportSchema.safeParse(duplicate).success).toBe(false);
  });

  it("requires a self-contained immutable owner snapshot", () => {
    expect(
      ownerReportSnapshotSchema.parse({
        reportId: "report-1",
        reportRevision: 3,
        title: "Séance de Nox",
        animal: { id: "pet-1", name: "Nox" },
        owner: { id: "owner-1", name: "Camille" },
        consultationReason: "Mobilité",
        clinical: ["Raideur observée"],
        anatomical: [],
        recommendations: ["Repos 24 h"],
        notes: "",
        createdAt: "2026-07-18T10:00:00.000Z",
      }).reportRevision,
    ).toBe(3);
  });
});
```

Create `packages/contracts/src/product-events.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { productEventSchema } from "./product-events";

describe("product event contracts", () => {
  it("accepts a report creation event without personal data", () => {
    expect(
      productEventSchema.parse({
        name: "report_created",
        properties: {
          reportId: "report-1",
          source: "web_quick_create",
        },
      }),
    ).toEqual({
      name: "report_created",
      properties: {
        reportId: "report-1",
        source: "web_quick_create",
      },
    });
  });

  it("rejects unknown event names", () => {
    expect(
      productEventSchema.safeParse({ name: "owner_name_captured", properties: {} })
        .success,
    ).toBe(false);
  });

  it("rejects personal or clinical free-text properties", () => {
    expect(
      productEventSchema.safeParse({
        name: "report_created",
        properties: {
          reportId: "report-1",
          source: "web_quick_create",
          ownerEmail: "camille@example.com",
        },
      }).success,
    ).toBe(false);
  });
});
```

- [ ] **Step 2: Scaffold the package and verify that the tests fail**

Create `packages/contracts/package.json`:

```json
{
  "name": "@biume/contracts",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/index.ts",
    "./report": "./src/report.ts",
    "./product-events": "./src/product-events.ts"
  },
  "scripts": {
    "check-types": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "zod": "catalog:"
  },
  "devDependencies": {
    "@biume/config": "workspace:*",
    "typescript": "catalog:",
    "vitest": "^2.1.9"
  }
}
```

Create `packages/contracts/tsconfig.json`:

```json
{
  "extends": "@biume/config/tsconfig.base.json"
}
```

Run: `bun install && bun --filter @biume/contracts test`

Expected: FAIL because `./report` and `./product-events` do not exist.

- [ ] **Step 3: Implement the canonical report contract**

Create `packages/contracts/src/report.ts`:

```ts
import { z } from "zod";

export const reportSectionIds = [
  "clinical",
  "anatomical",
  "recommendations",
  "notes",
] as const;
export const reportSectionIdSchema = z.enum(reportSectionIds);
export type ReportSectionId = z.infer<typeof reportSectionIdSchema>;

export const reportSectionStateSchema = z.enum([
  "empty",
  "proposed",
  "needs_confirmation",
  "confirmed",
  "not_applicable",
]);
export type ReportSectionState = z.infer<typeof reportSectionStateSchema>;

export const reportSectionStatesSchema = z.object({
  clinical: reportSectionStateSchema,
  anatomical: reportSectionStateSchema,
  recommendations: reportSectionStateSchema,
  notes: reportSectionStateSchema,
});
export type ReportSectionStates = z.infer<typeof reportSectionStatesSchema>;

export function createInitialReportSectionStates(): ReportSectionStates {
  return {
    clinical: "empty",
    anatomical: "empty",
    recommendations: "empty",
    notes: "empty",
  };
}

export function canFinalizeReport(states: ReportSectionStates) {
  return Object.values(states).every(
    (state) => state === "confirmed" || state === "not_applicable",
  );
}

export const reportStatusSchema = z.enum(["draft", "finalized", "sent"]);

export const anatomicalEntrySchema = z.object({
  id: z.string().min(1),
  region: z.string(),
  severity: z.number().min(1).max(5),
  notes: z.string(),
  laterality: z.enum(["left", "right", "bilateral"]),
  anatomicalPart: z
    .object({
      id: z.string(),
      name: z.string(),
      zone: z.string(),
      animalType: z.string(),
    })
    .optional(),
});

export const observationSchema = anatomicalEntrySchema.extend({
  type: z.enum(["static", "dynamic", "diagnosticExclusion", "none"]),
  dysfunctionType: z.string().optional(),
  interventionZone: z.string().optional(),
});

export const anatomicalIssueEntrySchema = anatomicalEntrySchema.extend({
  type: z.enum(["dysfunction", "anatomicalSuspicion"]),
  interventionZone: z.string().optional(),
});

export const recommendationSchema = z.object({
  id: z.string().min(1),
  content: z.string(),
});

const reportSchemaBase = z.object({
  title: z.string().min(1, "Le titre est requis"),
  petId: z.string().optional(),
  appointmentId: z.string().optional(),
  consultationReason: z.string().optional().default(""),
  notes: z.string().optional().default(""),
  status: reportStatusSchema.optional().default("draft"),
  observations: z.array(observationSchema).optional().default([]),
  anatomicalIssues: z.array(anatomicalIssueEntrySchema).optional().default([]),
  recommendations: z.array(recommendationSchema).optional().default([]),
  sectionStates: reportSectionStatesSchema
    .optional()
    .default(createInitialReportSectionStates),
});

export const reportSchema = reportSchemaBase.superRefine((report, context) => {
  const anatomicalIds = [
    ...report.observations.map((item) => item.id),
    ...report.anatomicalIssues.map((item) => item.id),
  ];
  if (new Set(anatomicalIds).size !== anatomicalIds.length) {
    context.addIssue({
      code: "custom",
      message: "Les identifiants anatomiques doivent être uniques",
      path: ["anatomicalIssues"],
    });
  }
  const recommendationIds = report.recommendations.map((item) => item.id);
  if (new Set(recommendationIds).size !== recommendationIds.length) {
    context.addIssue({
      code: "custom",
      message: "Les identifiants de recommandation doivent être uniques",
      path: ["recommendations"],
    });
  }
  if (report.status !== "draft" && !canFinalizeReport(report.sectionStates)) {
    context.addIssue({
      code: "custom",
      message: "Chaque section doit être confirmée ou non applicable",
      path: ["sectionStates"],
    });
  }
});

export const createReportSchema = z.object({
  title: z.string().optional(),
  petId: z.string().min(1),
  appointmentId: z.string().optional(),
  consultationReason: z.string().optional(),
  notes: z.string().optional(),
  status: z.literal("draft").optional().default("draft"),
});

export const quickReportSchema = z.object({
  ownerName: z.string().trim().min(1, "Le nom du propriétaire est requis"),
  ownerEmail: z.union([z.literal(""), z.string().email()]).optional(),
  animalName: z.string().trim().min(1, "Le nom de l’animal est requis"),
  title: z.string().trim().min(1).default("Nouveau rapport"),
  consultationReason: z.string().trim().default(""),
});

export const ownerReportSnapshotSchema = z.object({
  reportId: z.string().min(1),
  reportRevision: z.number().int().positive(),
  title: z.string(),
  animal: z.object({ id: z.string(), name: z.string() }),
  owner: z.object({ id: z.string(), name: z.string().nullable() }),
  consultationReason: z.string(),
  clinical: z.array(z.string()),
  anatomical: z.array(z.string()),
  recommendations: z.array(z.string()),
  notes: z.string(),
  createdAt: z.string().datetime(),
});
export type OwnerReportSnapshot = z.infer<typeof ownerReportSnapshotSchema>;
```

- [ ] **Step 4: Implement the analytics contract without personal data**

Create `packages/contracts/src/product-events.ts`:

```ts
import { z } from "zod";

export const productEventNameSchema = z.enum([
  "capture_started",
  "capture_completed",
  "capture_queued_offline",
  "capture_uploaded",
  "transcript_ready",
  "transcript_approved",
  "report_proposal_ready",
  "report_ready_for_review",
  "report_created",
  "report_section_resolved",
  "report_finalized",
  "report_shared",
  "followup_scheduled",
  "followup_sent",
  "owner_response_submitted",
  "followup_action_acknowledged",
  "followup_action_resolved",
]);
export type ProductEventName = z.infer<typeof productEventNameSchema>;

const sourceSchema = z.enum(["web_existing_patient", "web_quick_create"]);
const reportSectionSchema = z.enum([
  "clinical",
  "anatomical",
  "recommendations",
  "notes",
]);

const safePropertiesSchema = z
  .object({
    reportId: z.string().optional(),
    captureId: z.string().optional(),
    followupId: z.string().optional(),
    durationMs: z.number().int().nonnegative().optional(),
    sectionCount: z.number().int().nonnegative().optional(),
    acceptedCount: z.number().int().nonnegative().optional(),
    modifiedCount: z.number().int().nonnegative().optional(),
    rejectedCount: z.number().int().nonnegative().optional(),
    online: z.boolean().optional(),
    journeyType: z.enum(["appointment", "free_capture"]).optional(),
    errorCategory: z
      .enum([
        "permission_denied",
        "network",
        "storage",
        "upload",
        "transcription",
        "extraction",
        "authorization",
        "validation",
        "delivery",
        "unknown",
      ])
      .optional(),
    source: sourceSchema.optional(),
    section: reportSectionSchema.optional(),
    state: z.enum(["confirmed", "not_applicable"]).optional(),
    reportRevision: z.number().int().positive().optional(),
  })
  .strict();

export const productEventSchema = z.object({
  name: productEventNameSchema,
  properties: safePropertiesSchema,
});
export type ProductEvent = z.infer<typeof productEventSchema>;
```

Create `packages/contracts/src/index.ts`:

```ts
export * from "./product-events";
export * from "./report";
```

- [ ] **Step 5: Run the package tests and typecheck**

Run: `bun --filter @biume/contracts test && bun --filter @biume/contracts check-types`

Expected: both commands exit 0; Vitest reports 8 passing tests.

- [ ] **Step 6: Wire web consumers to the canonical schemas**

Add `"@biume/contracts": "workspace:*"` to `apps/web/package.json` dependencies. In `apps/web/src/lib/utils/schemas.ts`, remove the local `createReportSchema`, `reportSchemaBase`, and `reportSchema` declarations and replace them with:

```ts
export {
  createReportSchema,
  quickReportSchema,
  reportSchema,
} from "@biume/contracts/report";
```

Keep `anatomicalIssueSchema`, `contactSchema`, `clientSchema`, and their exported types in that file. Then run `bun install` so `bun.lock` records the workspace dependency.

In `apps/web/src/components/dashboard/pages/reports-module/owner-content.ts`, replace the local `ReportSectionId` union with:

```ts
import type { ReportSectionId } from "@biume/contracts/report";
export type { ReportSectionId } from "@biume/contracts/report";
```

This keeps current downstream imports working while making the contracts package the only definition.

Run: `bun --filter @biume/contracts test && bunx tsc --noEmit -p apps/web/tsconfig.json`

Expected: contract tests pass. The web typecheck may still report only the repository’s pre-existing errors in `apps/web/src/components/ui/date-picker.tsx` and `apps/web/src/polyfills/*`; it must not add an error in `schemas.ts`, `reports.function.ts`, or `@biume/contracts`.

- [ ] **Step 7: Commit the shared contracts**

```bash
git add packages/contracts apps/web/package.json apps/web/src/lib/utils/schemas.ts \
  apps/web/src/components/dashboard/pages/reports-module/owner-content.ts bun.lock
git commit -m "feat(reports): add canonical report contracts"
```

## Task 2: Persist report decisions, revisions, and shared snapshots

**Files:**

- Create: `packages/db/src/schema/advancedReport/reportSectionState.ts`
- Create: `packages/db/src/schema/advancedReport/reportSharedVersion.ts`
- Create: `packages/db/src/schema/report-domain.test.ts`
- Create: `packages/db/scripts/baseline-existing.test.ts`
- Modify: `packages/db/package.json`
- Modify: `packages/db/drizzle.config.ts`
- Modify: `packages/db/src/schema/advancedReport/advancedReport.ts`
- Modify: `packages/db/src/schema/pets.ts`
- Modify: `packages/db/src/schema/index.ts`
- Modify: `packages/db/scripts/baseline-existing.ts`
- Modify: `packages/db/MIGRATIONS.md`
- Generate: `packages/db/src/migrations/0002_report_domain_foundation.sql`
- Generate: `packages/db/src/migrations/meta/0002_snapshot.json`
- Modify: `packages/db/src/migrations/meta/_journal.json`

**Interfaces:**

- Consumes: `ReportSectionId`, `ReportSectionState`, and `OwnerReportSnapshot` from `@biume/contracts/report`; `advancedReport` and `organization` Drizzle tables.
- Produces: `reportSectionState`, `reportSharedVersion`, `advancedReport.revision`, nullable profile-only pet fields, and generated migration `0002_report_domain_foundation`.

Before the first Drizzle generation, change `packages/db/drizzle.config.ts` from the schema directory to an explicit extglob that excludes colocated tests:

```ts
schema: "./src/schema/**/!(*.test).ts",
```

Verify this configuration by checking that `drizzle-kit generate` imports the schema modules without importing Vitest and actually creates the expected migration files; do not treat Bun's wrapper exit code alone as success.

- [ ] **Step 1: Write failing schema-shape tests**

Create `packages/db/src/schema/report-domain.test.ts`:

```ts
import { getTableColumns, getTableName } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { advancedReport } from "./advancedReport/advancedReport";
import { reportSectionState } from "./advancedReport/reportSectionState";
import { reportSharedVersion } from "./advancedReport/reportSharedVersion";
import { pets } from "./pets";

describe("report domain schema", () => {
  it("persists a report revision", () => {
    expect(getTableColumns(advancedReport).revision.notNull).toBe(true);
    expect(getTableColumns(advancedReport).revision.default).toBe(1);
  });

  it("stores section decisions separately from report content", () => {
    expect(getTableName(reportSectionState)).toBe("report_section_state");
    expect(Object.keys(getTableColumns(reportSectionState))).toEqual([
      "reportId",
      "section",
      "state",
      "updatedAt",
    ]);
  });

  it("stores an immutable snapshot against one report revision", () => {
    expect(getTableName(reportSharedVersion)).toBe("report_shared_version");
    expect(getTableColumns(reportSharedVersion).snapshot.notNull).toBe(true);
    expect(getTableColumns(reportSharedVersion).reportRevision.notNull).toBe(true);
  });

  it("allows a quick-created animal to omit profile details", () => {
    const columns = getTableColumns(pets);
    expect(columns.weight.notNull).toBe(false);
    expect(columns.height.notNull).toBe(false);
    expect(columns.breed.notNull).toBe(false);
    expect(columns.birthDate.notNull).toBe(false);
    expect(columns.gender.notNull).toBe(false);
  });
});
```

Add `"@biume/contracts": "workspace:*"` to `packages/db/package.json`, then run `bun install && bun --filter @biume/db test -- report-domain.test.ts`.

Expected: FAIL because the two table modules and `advancedReport.revision` do not exist.

- [ ] **Step 2: Add the section-state table**

Create `packages/db/src/schema/advancedReport/reportSectionState.ts`:

```ts
import type {
  ReportSectionId,
  ReportSectionState,
} from "@biume/contracts/report";
import { relations } from "drizzle-orm";
import { pgEnum, pgTable, primaryKey, text, timestamp } from "drizzle-orm/pg-core";
import { advancedReport } from "./advancedReport";

export const reportSection = pgEnum("report_section", [
  "clinical",
  "anatomical",
  "recommendations",
  "notes",
]);

export const reportSectionDecision = pgEnum("report_section_decision", [
  "empty",
  "proposed",
  "needs_confirmation",
  "confirmed",
  "not_applicable",
]);

export const reportSectionState = pgTable(
  "report_section_state",
  {
    reportId: text("report_id")
      .notNull()
      .references(() => advancedReport.id, { onDelete: "cascade" }),
    section: reportSection("section").$type<ReportSectionId>().notNull(),
    state: reportSectionDecision("state").$type<ReportSectionState>().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" })
      .notNull()
      .defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.reportId, table.section] })],
);

export const reportSectionStateRelations = relations(
  reportSectionState,
  ({ one }) => ({
    report: one(advancedReport, {
      fields: [reportSectionState.reportId],
      references: [advancedReport.id],
    }),
  }),
);

export type PersistedReportSectionState =
  typeof reportSectionState.$inferSelect;
```

- [ ] **Step 3: Add the immutable shared-version table**

Create `packages/db/src/schema/advancedReport/reportSharedVersion.ts`:

```ts
import type { OwnerReportSnapshot } from "@biume/contracts/report";
import { relations } from "drizzle-orm";
import {
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { organization } from "../organization";
import { advancedReport } from "./advancedReport";

export const reportSharedVersion = pgTable(
  "report_shared_version",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    reportId: text("report_id")
      .notNull()
      .references(() => advancedReport.id, { onDelete: "cascade" }),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    reportRevision: integer("report_revision").notNull(),
    snapshot: jsonb("snapshot").$type<OwnerReportSnapshot>().notNull(),
    createdAt: timestamp("created_at", { mode: "date" })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("report_shared_version_revision_unique").on(
      table.reportId,
      table.reportRevision,
    ),
  ],
);

export const reportSharedVersionRelations = relations(
  reportSharedVersion,
  ({ one }) => ({
    report: one(advancedReport, {
      fields: [reportSharedVersion.reportId],
      references: [advancedReport.id],
    }),
    organization: one(organization, {
      fields: [reportSharedVersion.organizationId],
      references: [organization.id],
    }),
  }),
);

export type ReportSharedVersion = typeof reportSharedVersion.$inferSelect;
```

- [ ] **Step 4: Extend the canonical report and relax only profile-only pet fields**

In `packages/db/src/schema/advancedReport/advancedReport.ts`:

1. Import `integer` from `drizzle-orm/pg-core`.
2. Import `reportSectionState` and `reportSharedVersion`.
3. Add this column after `status`:

```ts
revision: integer("revision").notNull().default(1),
```

4. Add these relations inside the existing `many` relation map:

```ts
sectionStates: many(reportSectionState),
sharedVersions: many(reportSharedVersion),
```

5. Add both arrays to `AdvancedReport`:

```ts
sectionStates: PersistedReportSectionState[];
sharedVersions: ReportSharedVersion[];
```

In `packages/db/src/schema/pets.ts`, change exactly these five fields:

```ts
weight: integer("weight"),
height: integer("height"),
breed: text("breed"),
gender: petGender("gender"),
birthDate: timestamp("birthDate", { mode: "date" }),
```

Do not change `name`; it remains required. Keep `ownerId`, `type`, and `organizationId` nullable as they already are.

In `packages/db/src/schema/index.ts`, add:

```ts
export * from "./advancedReport/reportSectionState";
export * from "./advancedReport/reportSharedVersion";
```

- [ ] **Step 5: Run schema tests before generating SQL**

Run: `bun --filter @biume/db test -- report-domain.test.ts`

Expected: PASS with 4 tests.

- [ ] **Step 6: Generate and inspect the migration**

Run: `bun --filter @biume/db db:generate --name=report_domain_foundation`

Expected: Drizzle creates `packages/db/src/migrations/0002_report_domain_foundation.sql`, `packages/db/src/migrations/meta/0002_snapshot.json`, and appends one `0002_report_domain_foundation` entry to `_journal.json`.

Inspect with:

```bash
rg -n 'revision|report_section_state|report_shared_version|DROP NOT NULL' packages/db/src/migrations/0002_report_domain_foundation.sql
```

Expected: the SQL adds `advancedReport.revision` with default 1; creates the two enums and two tables; adds the report/revision unique index; drops `NOT NULL` from `pets.weight`, `pets.height`, `pets.breed`, `pets.gender`, and `pets.birthDate`; and drops the misleading `Male` default from `pets.gender`. It must not drop or recreate `advancedReport`, `pets`, `clients`, or existing report child tables.

Append this data-only backfill after the generated table and foreign-key statements so every existing report receives four explicit rows:

```sql
INSERT INTO "report_section_state" ("report_id", "section", "state")
SELECT
  report."id",
  section.value::"report_section",
  'empty'::"report_section_decision"
FROM "advancedReport" AS report
CROSS JOIN (
  VALUES ('clinical'), ('anatomical'), ('recommendations'), ('notes')
) AS section(value)
ON CONFLICT DO NOTHING;
```

Run the `rg` inspection again and confirm the backfill occurs after `report_section_state` exists. Do not regenerate after adding this data statement; later schema generations use `0002_snapshot.json`, while this statement remains migration-only.

- [ ] **Step 7: Generalize baseline migration validation with tests**

Create `packages/db/scripts/baseline-existing.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { validateMigrationJournal } from "./baseline-existing";

describe("validateMigrationJournal", () => {
  it("accepts baseline, owner content, and later generated migrations", () => {
    expect(
      validateMigrationJournal({
        entries: [
          { idx: 0, when: 1, tag: "0000_baseline" },
          { idx: 1, when: 2, tag: "0001_report_owner_content" },
          { idx: 2, when: 3, tag: "0002_report_domain_foundation" },
        ],
      }).map((entry) => entry.tag),
    ).toEqual([
      "0000_baseline",
      "0001_report_owner_content",
      "0002_report_domain_foundation",
    ]);
  });

  it("rejects a changed baseline prefix", () => {
    expect(() =>
      validateMigrationJournal({
        entries: [
          { idx: 0, when: 1, tag: "0000_other" },
          { idx: 1, when: 2, tag: "0001_report_owner_content" },
        ],
      }),
    ).toThrow("Expected migration history to start with");
  });

  it("rejects non-increasing timestamps", () => {
    expect(() =>
      validateMigrationJournal({
        entries: [
          { idx: 0, when: 2, tag: "0000_baseline" },
          { idx: 1, when: 2, tag: "0001_report_owner_content" },
        ],
      }),
    ).toThrow("timestamps are missing or out of order");
  });
});
```

In `packages/db/scripts/baseline-existing.ts`, export `JournalEntry` and replace `validateJournal` with:

```ts
export function validateMigrationJournal(journal: Journal) {
  const [baseline, ownerContent, ...later] = journal.entries;
  if (
    baseline?.tag !== "0000_baseline" ||
    ownerContent?.tag !== "0001_report_owner_content"
  ) {
    throw new Error(
      "Expected migration history to start with 0000_baseline and 0001_report_owner_content.",
    );
  }
  const entries = [baseline, ownerContent, ...later];
  for (let index = 1; index < entries.length; index += 1) {
    if (entries[index - 1]!.when >= entries[index]!.when) {
      throw new Error("Migration journal timestamps are missing or out of order.");
    }
  }
  return entries;
}
```

Replace the hard-coded four-file load and two-entry hash map with:

```ts
const journal = (await Bun.file(journalPath).json()) as Journal;
const entries = validateMigrationJournal(journal);
const [baselineSnapshot, migrationSql] = await Promise.all([
  Bun.file(baselineSnapshotPath).json() as Promise<BaselineSnapshot>,
  Promise.all(
    entries.map(async (entry) => ({
      entry,
      sql: await Bun.file(`${migrationsFolder}/${entry.tag}.sql`).text(),
    })),
  ),
]);
const knownMigrations = new Map(
  migrationSql.map(({ entry, sql }) => [entry.when, migrationHash(sql)]),
);
const [baseline, ownerContent] = entries;
```

Rename `featureTableExists`, `featureEnumExists`, and `featureRecorded` to `ownerContentTableExists`, `ownerContentEnumExists`, and `ownerContentRecorded`. Keep the existing three integrity checks for the `0001` table, enum, and history row, using `ownerContent.when` in place of `feature.when`.

Delete the early-return block that currently returns whenever `0001` is recorded. After history validation, derive all pending entries:

```ts
const recordedTimestamps = new Set(
  history.map((row) => Number(row.created_at)),
);
const pendingEntries = entries.filter(
  (entry) => !recordedTimestamps.has(entry.when),
);
```

Replace the `checkOnly` message and return with:

```ts
if (checkOnly) {
  console.log(
    pendingEntries.length === 0
      ? "All journaled migrations are already recorded."
      : `${pendingEntries.length} migration(s) are ready to apply: ${pendingEntries
          .map((entry) => entry.tag)
          .join(", ")}.`,
  );
  return;
}
```

When inserting the baseline history row, use `migrationSql[0]!.sql` for `baselineHash` and `baseline.when` for its timestamp. Keep `migrate(db, { migrationsFolder })` unchanged so Drizzle applies every migration after the recorded baseline. Replace the final single-feature verification with:

```ts
const finalTimestamps = new Set(
  finalHistory.map((row) => Number(row.created_at)),
);
const missingEntries = entries.filter(
  (entry) => !finalTimestamps.has(entry.when),
);
if (!ownerTable?.name || missingEntries.length > 0) {
  throw new Error(
    `Migration finished with missing history: ${missingEntries
      .map((entry) => entry.tag)
      .join(", ") || "owner-content table"}.`,
  );
}
console.log(
  `Reconciled the baseline and verified ${entries.length} journaled migrations.`,
);
```

Finally guard CLI execution so importing the validator from Vitest does not run `main()`:

```ts
if (import.meta.main) {
  await main();
}
```

Run: `bun --filter @biume/db test -- baseline-existing.test.ts report-domain.test.ts`

Expected: PASS with 7 tests.

- [ ] **Step 8: Update migration documentation and verify generated state**

In `packages/db/MIGRATIONS.md`, state that:

```md
`db:baseline-existing` requires the immutable prefix `0000_baseline` then
`0001_report_owner_content`, validates every journaled migration hash, records
the baseline only for a compatible pre-existing schema, and lets Drizzle apply
all later generated migrations in journal order. New schema changes must be
created with `bun --filter @biume/db db:generate --name=<snake_case_name>`.
```

Run:

```bash
bun --filter @biume/contracts check-types
bun --filter @biume/db test
git diff --check
```

Expected: contract typecheck passes, all DB tests pass, and `git diff --check` prints nothing.

- [ ] **Step 9: Commit the persistence foundation**

```bash
git add packages/db packages/contracts/package.json bun.lock
git commit -m "feat(reports): persist report decisions and revisions"
```

## Task 3: Make section decisions part of the web report workflow

**Files:**

- Create: `apps/web/src/functions/report-domain.ts`
- Create: `apps/web/src/functions/report-domain.test.ts`
- Create: `apps/web/src/components/dashboard/pages/reports-module/components/SectionDecisionControl.tsx`
- Create: `apps/web/src/components/dashboard/pages/reports-module/components/SectionDecisionControl.test.tsx`
- Modify: `apps/web/src/functions/reports.function.ts`
- Modify: `apps/web/src/components/dashboard/pages/reports-module/reports-editor.helpers.ts`
- Modify: `apps/web/src/components/dashboard/pages/reports-module/reports-editor.helpers.test.ts`
- Modify: `apps/web/src/components/dashboard/pages/reports-module/reports-editor.tsx`
- Modify: `apps/web/src/components/dashboard/pages/reports-module/components/ReportSidebarNavigation.tsx`
- Modify: `apps/web/src/components/dashboard/pages/reports-module/components/ReportSidebarNavigation.test.tsx`

**Interfaces:**

- Consumes: `ReportSectionStates`, `reportSectionIds`, `canFinalizeReport`, and `reportSchema`; Drizzle `reportSectionState`; existing `updateReport` and report editor save flow.
- Produces: `buildReportSectionStateRows(reportId, states)`, `normalizeReportSectionStates(rows)`, update payload field `sectionStates`, persisted decisions on every save, revision increment, and an explicit `SectionDecisionControl`.

- [ ] **Step 1: Write failing tests for persistence builders and editor payloads**

Create `apps/web/src/functions/report-domain.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
  buildReportSectionStateRows,
  normalizeReportSectionStates,
} from "./report-domain";

describe("report section persistence", () => {
  it("builds one row for every canonical section", () => {
    expect(
      buildReportSectionStateRows("report-1", {
        clinical: "confirmed",
        anatomical: "not_applicable",
        recommendations: "needs_confirmation",
        notes: "empty",
      }),
    ).toEqual([
      { reportId: "report-1", section: "clinical", state: "confirmed" },
      {
        reportId: "report-1",
        section: "anatomical",
        state: "not_applicable",
      },
      {
        reportId: "report-1",
        section: "recommendations",
        state: "needs_confirmation",
      },
      { reportId: "report-1", section: "notes", state: "empty" },
    ]);
  });

  it("fills missing legacy rows with empty decisions", () => {
    expect(
      normalizeReportSectionStates([
        { section: "clinical", state: "confirmed" },
      ]),
    ).toEqual({
      clinical: "confirmed",
      anatomical: "empty",
      recommendations: "empty",
      notes: "empty",
    });
  });
});
```

Extend `apps/web/src/components/dashboard/pages/reports-module/reports-editor.helpers.test.ts` by passing:

```ts
sectionStates: {
  clinical: "confirmed",
  anatomical: "not_applicable",
  recommendations: "confirmed",
  notes: "confirmed",
},
```

to the existing `buildReportUpdatePayload` test and asserting that the same object is present in the returned payload. Add this test:

```ts
test("does not replace an explicit section decision when deriving content status", () => {
  expect(
    getEffectiveSectionState({
      persisted: "not_applicable",
      hasContent: true,
    }),
  ).toBe("not_applicable");
  expect(
    getEffectiveSectionState({ persisted: "empty", hasContent: true }),
  ).toBe("needs_confirmation");
});
```

Run:

```bash
bun --filter @biume/web test -- src/functions/report-domain.test.ts src/components/dashboard/pages/reports-module/reports-editor.helpers.test.ts
```

Expected: FAIL because the new module, payload field, and `getEffectiveSectionState` do not exist.

- [ ] **Step 2: Implement the pure persistence and decision helpers**

Create `apps/web/src/functions/report-domain.ts`:

```ts
import {
  createInitialReportSectionStates,
  reportSectionIds,
  type ReportSectionId,
  type ReportSectionState,
  type ReportSectionStates,
} from "@biume/contracts/report";

export function buildReportSectionStateRows(
  reportId: string,
  states: ReportSectionStates,
) {
  return reportSectionIds.map((section) => ({
    reportId,
    section,
    state: states[section],
  }));
}

export function normalizeReportSectionStates(
  rows: readonly {
    section: ReportSectionId;
    state: ReportSectionState;
  }[],
): ReportSectionStates {
  const states = createInitialReportSectionStates();
  for (const row of rows) states[row.section] = row.state;
  return states;
}
```

In `reports-editor.helpers.ts`, import `ReportSectionState` and `ReportSectionStates`. Replace `ProfessionalSectionStatus` with `ReportSectionState`, add `sectionStates` to `BuildReportUpdatePayloadInput` and `ReportDraftState`, and return it from `buildReportUpdatePayload`. Add:

```ts
export function getEffectiveSectionState({
  persisted,
  hasContent,
}: {
  persisted: ReportSectionState;
  hasContent: boolean;
}): ReportSectionState {
  if (persisted !== "empty") return persisted;
  return hasContent ? "needs_confirmation" : "empty";
}
```

Keep `deriveProfessionalSectionStatus` for content completeness, but change its return values to canonical UI suggestions: `empty` or `needs_confirmation`. Any non-empty section returns `needs_confirmation` until the practitioner explicitly confirms it; no content-derived function may return `confirmed` or `not_applicable`.

Run the command from Step 1.

Expected: PASS for `report-domain.test.ts` and `reports-editor.helpers.test.ts`.

- [ ] **Step 3: Persist section rows and increment the report revision atomically**

In `apps/web/src/functions/reports.function.ts`:

1. Import `reportSectionState` and `sql`.
2. Import `buildReportSectionStateRows` and `normalizeReportSectionStates`.
3. Add `sectionStates: true` to the `getReportById` relation query.
4. Normalize the returned relation before sending it to the editor:

```ts
return {
  success: true,
  data: {
    ...report,
    sectionStates: normalizeReportSectionStates(report.sectionStates),
  },
};
```

5. Destructure `sectionStates` inside `updateReport`.
6. Change the report update set to increment the revision on every successful professional-content save:

```ts
.set({
  title,
  consultationReason,
  patientId,
  appointmentId: resolvedAppointmentId,
  notes,
  updatedAt: new Date(),
  status: status || "draft",
  revision: sql`${advancedReport.revision} + 1`,
})
```

7. Add this upsert to `mutationQueries` immediately after the report update:

```ts
db
  .insert(reportSectionState)
  .values(buildReportSectionStateRows(ownedReport.id, sectionStates))
  .onConflictDoUpdate({
    target: [reportSectionState.reportId, reportSectionState.section],
    set: {
      state: sql`excluded.state`,
      updatedAt: new Date(),
    },
  }),
```

The Zod `reportSchema` already rejects `finalized` or `sent` when any state is unresolved. Do not add a second divergent finalization rule in the handler.

8. Make existing-animal report creation persist the same four initial rows. Inside the current `createReportWithTenantIsolation` callback, replace the returning insert with:

```ts
const reportId = crypto.randomUUID();
await db.batch([
  db.insert(advancedReport).values({
    id: reportId,
    title: title || "Nouveau rapport",
    consultationReason,
    patientId,
    appointmentId: appointmentId || null,
    notes,
    status: "draft",
    createdBy: organization.id,
    createdAt: new Date(),
  }),
  db
    .insert(reportSectionState)
    .values(
      buildReportSectionStateRows(
        reportId,
        createInitialReportSectionStates(),
      ),
    ),
] as const);
return { success: true as const, status: "draft" as const, reportId };
```

Import `createInitialReportSectionStates` from `@biume/contracts/report` and remove `status` from the `createReport` handler destructuring. The validator only permits draft creation, so do not accept a client-supplied finalized status.

- [ ] **Step 4: Test the explicit decision control**

Create `SectionDecisionControl.test.tsx`:

```tsx
// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SectionDecisionControl } from "./SectionDecisionControl";

describe("SectionDecisionControl", () => {
  it("lets the practitioner confirm a section", () => {
    const onChange = vi.fn();
    render(
      <SectionDecisionControl state="needs_confirmation" onChange={onChange} />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Confirmer la section" }));
    expect(onChange).toHaveBeenCalledWith("confirmed");
  });

  it("requires an explicit click to mark a section non applicable", () => {
    const onChange = vi.fn();
    render(<SectionDecisionControl state="empty" onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Marquer non applicable" }));
    expect(onChange).toHaveBeenCalledWith("not_applicable");
  });
});
```

Run: `bun --filter @biume/web test -- SectionDecisionControl.test.tsx`

Expected: FAIL because `SectionDecisionControl.tsx` does not exist.

- [ ] **Step 5: Implement the explicit decision control**

Create `SectionDecisionControl.tsx`:

```tsx
import type { ReportSectionState } from "@biume/contracts/report";
import { CheckIcon, CircleSlash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SectionDecisionControl({
  state,
  onChange,
}: {
  state: ReportSectionState;
  onChange: (state: "confirmed" | "not_applicable") => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2" aria-label="Décision de section">
      <Button
        type="button"
        size="sm"
        variant={state === "confirmed" ? "default" : "outline"}
        onClick={() => onChange("confirmed")}
      >
        <CheckIcon className="size-4" />
        Confirmer la section
      </Button>
      <Button
        type="button"
        size="sm"
        variant={state === "not_applicable" ? "secondary" : "ghost"}
        onClick={() => onChange("not_applicable")}
      >
        <CircleSlash2Icon className="size-4" />
        Marquer non applicable
      </Button>
    </div>
  );
}
```

Run: `bun --filter @biume/web test -- SectionDecisionControl.test.tsx`

Expected: PASS with 2 tests.

- [ ] **Step 6: Wire persisted decisions into the editor**

In `reports-editor.tsx`, initialize state only after the report query has resolved:

```ts
const [sectionStates, setSectionStates] = useState<ReportSectionStates>(
  createInitialReportSectionStates,
);

useEffect(() => {
  if (reportData?.success && reportData.data) {
    setSectionStates(reportData.data.sectionStates);
  }
}, [reportData]);
```

Include `sectionStates` in the object passed to `getReportDraftRevision` and in every `buildReportUpdatePayload` call. Add this handler:

```ts
const resolveSection = (
  section: ReportSectionId,
  state: "confirmed" | "not_applicable",
) => {
  setSectionStates((current) => ({ ...current, [section]: state }));
};
```

At the bottom of each existing professional section panel, render:

```tsx
<SectionDecisionControl
  state={sectionStates[activeTab as ReportSectionId]}
  onChange={(state) => resolveSection(activeTab as ReportSectionId, state)}
/>
```

Render it only for `clinical`, `anatomical`, `recommendations`, and `notes`, never for owner-preparation tabs. When content changes after a section was confirmed, set that section to `needs_confirmation`; when the state is `not_applicable`, editing content first changes it to `needs_confirmation`. Use one handler for this rule:

```ts
const markSectionEdited = (section: ReportSectionId) => {
  setSectionStates((current) => ({
    ...current,
    [section]: "needs_confirmation",
  }));
};
```

Call `markSectionEdited` from the existing on-change/add/remove handlers for the matching section. Do not call it during initial query hydration.

- [ ] **Step 7: Render canonical states in the sidebar and block premature finalization**

In `ReportSidebarNavigation.tsx`, type `professionalStatus` as `ReportSectionState` and use this exact label map:

```ts
const professionalStateLabel: Record<ReportSectionState, string> = {
  empty: "À renseigner",
  proposed: "Proposé",
  needs_confirmation: "À confirmer",
  confirmed: "Confirmé",
  not_applicable: "Non applicable",
};
```

Add tests to `ReportSidebarNavigation.test.tsx` that render one `confirmed` section and one `not_applicable` section and assert the visible labels `Confirmé` and `Non applicable`.

Before the existing finalize mutation is called in `reports-editor.tsx`, guard with:

```ts
if (!canFinalizeReport(sectionStates)) {
  toast.error("Confirmez ou marquez non applicable chaque section du rapport.");
  return;
}
```

The server-side Zod rule remains authoritative; this client guard only provides immediate feedback.

- [ ] **Step 8: Run focused workflow tests and inspect type regressions**

Run:

```bash
bun --filter @biume/web test -- \
  src/functions/report-domain.test.ts \
  src/components/dashboard/pages/reports-module/reports-editor.helpers.test.ts \
  src/components/dashboard/pages/reports-module/components/SectionDecisionControl.test.tsx \
  src/components/dashboard/pages/reports-module/components/ReportSidebarNavigation.test.tsx
bunx tsc --noEmit -p apps/web/tsconfig.json
git diff --check
```

Expected: all four focused test files pass. TypeScript may show only the known `date-picker.tsx` and `polyfills/*` errors; there must be no new error in report-domain, reports.function, reports-editor, the sidebar, or the decision control. `git diff --check` prints nothing.

- [ ] **Step 9: Commit the persistent decision workflow**

```bash
git add apps/web/src/functions/report-domain.ts \
  apps/web/src/functions/report-domain.test.ts \
  apps/web/src/functions/reports.function.ts \
  apps/web/src/components/dashboard/pages/reports-module
git commit -m "feat(reports): require explicit section decisions"
```

## Task 4: Add the minimum-friction first-report creation path

**Files:**

- Modify: `apps/web/src/functions/report-domain.ts`
- Modify: `apps/web/src/functions/report-domain.test.ts`
- Modify: `apps/web/src/functions/reports.function.ts`
- Modify: `apps/web/src/functions/report-owner-content.function.ts`
- Create: `apps/web/src/functions/report-owner-content.function.test.ts`
- Modify: `apps/web/src/lib/api/actions/reports.action.ts`
- Modify: `apps/web/src/components/dashboard/pages/reports-module/components/InitializationDialog.helpers.ts`
- Modify: `apps/web/src/components/dashboard/pages/reports-module/components/InitializationDialog.helpers.test.ts`
- Modify: `apps/web/src/components/dashboard/pages/reports-module/components/InitializationDialog.tsx`

**Interfaces:**

- Consumes: `quickReportSchema`, `createInitialReportSectionStates`, `clients`, `pets`, `advancedReport`, `reportSectionState`, existing `db.batch`, organization session, and report editor route.
- Produces: `buildQuickReportRows`, `createQuickReport` server function/action, two validated initialization modes, and an atomic owner/animal/report creation path.

- [ ] **Step 1: Write failing deterministic row-builder tests**

Append to `apps/web/src/functions/report-domain.test.ts`:

```ts
import { buildQuickReportRows } from "./report-domain";

it("builds owner, animal, report, and four decisions from minimum input", () => {
  const rows = buildQuickReportRows({
    organizationId: "org-1",
    input: {
      ownerName: " Camille ",
      ownerEmail: "camille@example.com",
      animalName: " Nox ",
      title: "Nouveau rapport",
      consultationReason: "",
    },
    ids: { ownerId: "owner-1", animalId: "pet-1", reportId: "report-1" },
    now: new Date("2026-07-18T10:00:00.000Z"),
  });

  expect(rows.owner).toMatchObject({
    id: "owner-1",
    organizationId: "org-1",
    name: "Camille",
    email: "camille@example.com",
  });
  expect(rows.animal).toMatchObject({
    id: "pet-1",
    organizationId: "org-1",
    ownerId: "owner-1",
    name: "Nox",
  });
  expect(rows.report).toMatchObject({
    id: "report-1",
    createdBy: "org-1",
    patientId: "pet-1",
    status: "draft",
  });
  expect(rows.sectionStates).toHaveLength(4);
});

it("stores an omitted quick-create email as null", () => {
  const rows = buildQuickReportRows({
    organizationId: "org-1",
    input: {
      ownerName: "Camille",
      animalName: "Nox",
      title: "Nouveau rapport",
      consultationReason: "",
    },
    ids: { ownerId: "owner-1", animalId: "pet-1", reportId: "report-1" },
    now: new Date("2026-07-18T10:00:00.000Z"),
  });
  expect(rows.owner.email).toBeNull();
});
```

Run: `bun --filter @biume/web test -- src/functions/report-domain.test.ts`

Expected: FAIL because `buildQuickReportRows` is not exported.

- [ ] **Step 2: Implement the deterministic quick-create builder**

Append to `apps/web/src/functions/report-domain.ts`:

```ts
import type { z } from "zod";
import {
  createInitialReportSectionStates,
  quickReportSchema,
} from "@biume/contracts/report";

type QuickReportInput = z.infer<typeof quickReportSchema>;

export function buildQuickReportRows({
  organizationId,
  input,
  ids,
  now,
}: {
  organizationId: string;
  input: QuickReportInput;
  ids: { ownerId: string; animalId: string; reportId: string };
  now: Date;
}) {
  const owner = {
    id: ids.ownerId,
    organizationId,
    name: input.ownerName.trim(),
    email: input.ownerEmail?.trim() || null,
    createdAt: now,
  };
  const animal = {
    id: ids.animalId,
    organizationId,
    ownerId: ids.ownerId,
    name: input.animalName.trim(),
    createdAt: now,
  };
  const report = {
    id: ids.reportId,
    createdBy: organizationId,
    patientId: ids.animalId,
    title: input.title,
    consultationReason: input.consultationReason,
    status: "draft" as const,
    createdAt: now,
  };
  return {
    owner,
    animal,
    report,
    sectionStates: buildReportSectionStateRows(
      ids.reportId,
      createInitialReportSectionStates(),
    ),
  };
}
```

Merge the added imports with the existing `@biume/contracts/report` import so the file has one contract import. Run the Step 1 command.

Expected: PASS with 4 tests in `report-domain.test.ts`.

- [ ] **Step 3: Write failing validation tests for the two initialization modes**

Replace `InitializationDialog.helpers.test.ts` with:

```ts
import { describe, expect, it } from "vitest";
import { canSubmitReportDraft } from "./InitializationDialog.helpers";

const idle = {
  isLoadingPets: false,
  isLoadingPet: false,
  isCreatingReport: false,
};

describe("canSubmitReportDraft", () => {
  it("allows an existing animal with a consultation reason", () => {
    expect(
      canSubmitReportDraft({
        ...idle,
        mode: "existing",
        selectedPetId: "pet-1",
        consultationReason: "Suivi locomoteur",
        ownerName: "",
        animalName: "",
      }),
    ).toBe(true);
  });

  it("allows quick creation with only owner and animal names", () => {
    expect(
      canSubmitReportDraft({
        ...idle,
        mode: "quick",
        selectedPetId: null,
        consultationReason: "",
        ownerName: "Camille",
        animalName: "Nox",
      }),
    ).toBe(true);
  });

  it("rejects quick creation when either required name is blank", () => {
    expect(
      canSubmitReportDraft({
        ...idle,
        mode: "quick",
        selectedPetId: null,
        consultationReason: "",
        ownerName: "Camille",
        animalName: " ",
      }),
    ).toBe(false);
  });
});
```

Run: `bun --filter @biume/web test -- InitializationDialog.helpers.test.ts`

Expected: FAIL because the helper does not accept `mode`, `ownerName`, or `animalName`.

- [ ] **Step 4: Implement mode-aware validation**

Replace `InitializationDialog.helpers.ts` with:

```ts
export type ReportCreationMode = "existing" | "quick";

type CanSubmitReportDraftInput = {
  mode: ReportCreationMode;
  selectedPetId: string | null;
  consultationReason: string;
  ownerName: string;
  animalName: string;
  isLoadingPets: boolean;
  isLoadingPet: boolean;
  isCreatingReport: boolean;
};

export function canSubmitReportDraft(input: CanSubmitReportDraftInput) {
  if (input.isLoadingPets || input.isLoadingPet || input.isCreatingReport) {
    return false;
  }
  if (input.mode === "quick") {
    return Boolean(input.ownerName.trim() && input.animalName.trim());
  }
  return Boolean(input.selectedPetId && input.consultationReason.trim());
}
```

Run the Step 3 command.

Expected: PASS with 3 tests.

- [ ] **Step 5: Add an atomic tenant-scoped quick-create server function**

In `apps/web/src/functions/reports.function.ts`, import `quickReportSchema`, `clients`, `reportSectionState`, and `buildQuickReportRows`. Add immediately after `createReport`:

```ts
export const createQuickReport = createServerFn({ method: "POST" })
  .validator(quickReportSchema)
  .handler(async ({ data }) => {
    const organization = await getCurrentOrganization();
    if (!organization) throw new Error("Organization not found");

    const rows = buildQuickReportRows({
      organizationId: organization.id,
      input: data,
      ids: {
        ownerId: crypto.randomUUID(),
        animalId: crypto.randomUUID(),
        reportId: crypto.randomUUID(),
      },
      now: new Date(),
    });

    await db.batch([
      db.insert(clients).values(rows.owner),
      db.insert(pets).values(rows.animal),
      db.insert(advancedReport).values(rows.report),
      db.insert(reportSectionState).values(rows.sectionStates),
    ] as const);

    return {
      success: true as const,
      status: "draft" as const,
      reportId: rows.report.id,
    };
  });
```

Every inserted row receives the authenticated organization ID from the server; never accept an organization ID in `quickReportSchema`.

In `apps/web/src/lib/api/actions/reports.action.ts`, import `createQuickReport as createQuickReportFn`, import the `quickReportSchema` type, and export:

```ts
export function createQuickReport(report: z.infer<typeof quickReportSchema>) {
  return createQuickReportFn({ data: report });
}
```

Extend `tenant-creation-wiring.test.ts` with a source-level regression test that slices `createQuickReport` to `getReportById` and asserts it contains `organization.id`, `db.batch`, `clients`, `pets`, `advancedReport`, and `reportSectionState`.

- [ ] **Step 6: Add the inline quick-create form to the existing dialog**

In `InitializationDialog.tsx`:

1. Import `createQuickReport` and `ReportCreationMode`.
2. Add state:

```ts
const [mode, setMode] = useState<ReportCreationMode>("existing");
const [ownerName, setOwnerName] = useState("");
const [ownerEmail, setOwnerEmail] = useState("");
const [animalName, setAnimalName] = useState("");
```

3. Replace the mutation setup with two explicit mutations:

```ts
const existingReportMutation = useMutation({ mutationFn: createReport });
const quickReportMutation = useMutation({ mutationFn: createQuickReport });
const isCreatingReport =
  existingReportMutation.isPending || quickReportMutation.isPending;
```

Pass `mode`, `ownerName`, `animalName`, and the derived `isCreatingReport` into `canSubmitReportDraft` together with its existing fields.

4. Above the form, render two existing Button components as an accessible mode selector:

```tsx
<div className="grid grid-cols-2 gap-2" aria-label="Mode de création">
  <Button
    type="button"
    variant={mode === "existing" ? "secondary" : "outline"}
    onClick={() => setMode("existing")}
  >
    Animal existant
  </Button>
  <Button
    type="button"
    variant={mode === "quick" ? "secondary" : "outline"}
    onClick={() => setMode("quick")}
  >
    Nouveau dossier rapide
  </Button>
</div>
```

5. Render the current animal and appointment selectors only when `mode === "existing"`. When `mode === "quick"`, render:

```tsx
<FieldGroup label="Propriétaire" htmlFor="quick-owner-name">
  <Input
    id="quick-owner-name"
    value={ownerName}
    onChange={(event) => setOwnerName(event.target.value)}
    placeholder="Nom du propriétaire"
  />
</FieldGroup>
<FieldGroup label="E-mail (optionnel)" htmlFor="quick-owner-email">
  <Input
    id="quick-owner-email"
    type="email"
    value={ownerEmail}
    onChange={(event) => setOwnerEmail(event.target.value)}
    placeholder="proprietaire@exemple.fr"
  />
</FieldGroup>
<FieldGroup label="Animal" htmlFor="quick-animal-name">
  <Input
    id="quick-animal-name"
    value={animalName}
    onChange={(event) => setAnimalName(event.target.value)}
    placeholder="Nom de l’animal"
  />
</FieldGroup>
```

6. Keep title and consultation reason in both modes, but label the reason `Motif de la séance (optionnel)` in quick mode.
7. Replace `onComplete` with:

```ts
const onComplete = async () => {
  if (!canCreate) return;
  try {
    const result =
      mode === "quick"
        ? await quickReportMutation.mutateAsync({
            ownerName,
            ownerEmail,
            animalName,
            title: title.trim() || "Nouveau rapport",
            consultationReason: consultationReason.trim(),
          })
        : await existingReportMutation.mutateAsync({
            title: title.trim() || "Nouveau rapport",
            petId: selectedPetId!,
            appointmentId: selectedAppointmentId ?? undefined,
            consultationReason: consultationReason.trim(),
            status: "draft",
          });
    if (result.success) {
      toast.success("Rapport créé avec succès");
      navigate({
        to: "/dashboard/reports/$id/edit",
        params: { id: result.reportId },
      });
    }
  } catch (error) {
    console.error(error);
    toast.error("Erreur lors de la création du rapport");
  }
};
```

Remove navigation from the old mutation’s `onSuccess`. The single success branch above prevents double navigation and keeps failure handling identical.

- [ ] **Step 7: Verify quick creation and existing-animal creation**

Run:

```bash
bun --filter @biume/web test -- \
  src/functions/report-domain.test.ts \
  src/functions/tenant-creation-wiring.test.ts \
  src/components/dashboard/pages/reports-module/components/InitializationDialog.helpers.test.ts
bunx tsc --noEmit -p apps/web/tsconfig.json
git diff --check
```

Expected: all focused tests pass; the web typecheck adds no report-related errors beyond the known repository errors; `git diff --check` prints nothing.

Start the app with `bun run dev:web`, open the reports page, and verify manually:

1. `Nouveau dossier rapide` accepts only owner name and animal name.
2. The optional e-mail can be blank.
3. Submission opens one report whose animal and owner are visible.
4. All four sidebar sections initially show `À renseigner`.
5. `Animal existant` still requires an animal and consultation reason.
6. Double-clicking submit does not create two records because the button becomes disabled while pending.

- [ ] **Step 8: Commit the first-report path**

```bash
git add apps/web/src/functions apps/web/src/lib/api/actions/reports.action.ts \
  apps/web/src/components/dashboard/pages/reports-module/components/InitializationDialog.tsx \
  apps/web/src/components/dashboard/pages/reports-module/components/InitializationDialog.helpers.ts \
  apps/web/src/components/dashboard/pages/reports-module/components/InitializationDialog.helpers.test.ts
git commit -m "feat(reports): add quick first-report creation"
```

## Task 5: Create immutable owner-facing report versions

**Files:**

- Modify: `apps/web/src/functions/report-domain.ts`
- Modify: `apps/web/src/functions/report-domain.test.ts`
- Modify: `apps/web/src/functions/reports.function.ts`
- Modify: `apps/web/src/lib/api/actions/reports.action.ts`
- Modify: `apps/web/src/functions/tenant-creation-wiring.test.ts`

**Interfaces:**

- Consumes: `OwnerReportSnapshot`, `ownerReportSnapshotSchema`, `canFinalizeReport`, normalized section states, finalized canonical report data, and `reportSharedVersion`.
- Produces: `buildOwnerReportSnapshot(input)`, revisioned owner-content mutations, tenant-scoped `createReportSharedVersion`, and idempotence for `(reportId, reportRevision)`.

- [ ] **Step 1: Write failing snapshot-builder tests**

Append to `apps/web/src/functions/report-domain.test.ts`:

```ts
import { buildOwnerReportSnapshot } from "./report-domain";

it("builds a self-contained owner snapshot at an exact revision", () => {
  expect(
    buildOwnerReportSnapshot({
      reportId: "report-1",
      reportRevision: 2,
      title: "Séance de Nox",
      animal: { id: "pet-1", name: "Nox" },
      owner: { id: "owner-1", name: "Camille" },
      consultationReason: "Mobilité réduite",
      clinical: ["Raideur au démarrage"],
      anatomical: ["Tension cervicale"],
      recommendations: ["Repos pendant 24 heures"],
      notes: "Surveiller la récupération",
      createdAt: new Date("2026-07-18T10:00:00.000Z"),
    }),
  ).toEqual({
    reportId: "report-1",
    reportRevision: 2,
    title: "Séance de Nox",
    animal: { id: "pet-1", name: "Nox" },
    owner: { id: "owner-1", name: "Camille" },
    consultationReason: "Mobilité réduite",
    clinical: ["Raideur au démarrage"],
    anatomical: ["Tension cervicale"],
    recommendations: ["Repos pendant 24 heures"],
    notes: "Surveiller la récupération",
    createdAt: "2026-07-18T10:00:00.000Z",
  });
});

it("rejects a non-positive revision", () => {
  expect(() =>
    buildOwnerReportSnapshot({
      reportId: "report-1",
      reportRevision: 0,
      title: "Rapport",
      animal: { id: "pet-1", name: "Nox" },
      owner: { id: "owner-1", name: "Camille" },
      consultationReason: "",
      clinical: [],
      anatomical: [],
      recommendations: [],
      notes: "",
      createdAt: new Date("2026-07-18T10:00:00.000Z"),
    }),
  ).toThrow();
});
```

Run: `bun --filter @biume/web test -- src/functions/report-domain.test.ts`

Expected: FAIL because `buildOwnerReportSnapshot` is not exported.

- [ ] **Step 2: Implement the immutable snapshot builder**

Append to `apps/web/src/functions/report-domain.ts`:

```ts
import {
  ownerReportSnapshotSchema,
  type OwnerReportSnapshot,
} from "@biume/contracts/report";

type OwnerReportSnapshotInput = Omit<OwnerReportSnapshot, "createdAt"> & {
  createdAt: Date;
};

export function buildOwnerReportSnapshot(
  input: OwnerReportSnapshotInput,
): OwnerReportSnapshot {
  return ownerReportSnapshotSchema.parse({
    ...input,
    clinical: [...input.clinical],
    anatomical: [...input.anatomical],
    recommendations: [...input.recommendations],
    createdAt: input.createdAt.toISOString(),
  });
}
```

Merge this import with the existing contract import. Run the Step 1 command.

Expected: PASS for all 6 tests in `report-domain.test.ts`.

- [ ] **Step 3: Add source-to-owner-text resolution tests**

Add this pure helper and test before writing the server function. Test in `report-domain.test.ts`:

```ts
import { resolveOwnerFacingText } from "./report-domain";

it("uses practitioner-approved owner text and otherwise keeps validated source text", () => {
  const records = [
    {
      sourceKind: "recommendation" as const,
      sourceId: "rec-1",
      ownerText: "Laissez Nox se reposer pendant 24 heures.",
    },
  ];
  expect(
    resolveOwnerFacingText(records, "recommendation", "rec-1", "Repos 24 h"),
  ).toBe("Laissez Nox se reposer pendant 24 heures.");
  expect(
    resolveOwnerFacingText(records, "notes", "notes", "Surveiller"),
  ).toBe("Surveiller");
});
```

Implement in `report-domain.ts`:

```ts
type OwnerTextRecord = {
  sourceKind:
    | "consultationReason"
    | "observation"
    | "anatomicalIssue"
    | "recommendation"
    | "notes";
  sourceId: string;
  ownerText: string;
};

export function resolveOwnerFacingText(
  records: readonly OwnerTextRecord[],
  sourceKind: OwnerTextRecord["sourceKind"],
  sourceId: string,
  fallback: string,
) {
  return (
    records.find(
      (record) =>
        record.sourceKind === sourceKind && record.sourceId === sourceId,
    )?.ownerText ?? fallback
  ).trim();
}
```

Run: `bun --filter @biume/web test -- src/functions/report-domain.test.ts`

Expected: PASS with 7 tests.

- [ ] **Step 4: Increment the report revision with every owner-facing edit**

Create `apps/web/src/functions/report-owner-content.function.test.ts`:

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("owner-content mutation wiring", () => {
  it("updates owner content and the tenant-owned report revision in one batch", () => {
    const source = readFileSync(
      new URL("./report-owner-content.function.ts", import.meta.url),
      "utf8",
    );
    expect(source).toContain("db.batch");
    expect(source).toContain("revision: sql`${advancedReport.revision} + 1`");
    expect(source).toContain("eq(advancedReport.createdBy, organization.id)");
    expect(source).toContain(".insert(reportOwnerContent)");
  });
});
```

Run: `bun --filter @biume/web test -- src/functions/report-owner-content.function.test.ts`

Expected: FAIL because the current owner-content mutation performs only one insert/upsert and does not increment the report revision.

In `report-owner-content.function.ts`, import `sql` alongside `and` and `eq`. Replace the single awaited upsert with:

```ts
const [savedRows] = await db.batch([
  db
    .insert(reportOwnerContent)
    .values({ id: crypto.randomUUID(), ...values })
    .onConflictDoUpdate({
      target: [
        reportOwnerContent.reportId,
        reportOwnerContent.sourceKind,
        reportOwnerContent.sourceId,
      ],
      set: {
        ownerText: values.ownerText,
        sourceFingerprint: values.sourceFingerprint,
        updatedAt: values.updatedAt,
      },
    })
    .returning(),
  db
    .update(advancedReport)
    .set({
      revision: sql`${advancedReport.revision} + 1`,
      updatedAt: values.updatedAt,
    })
    .where(
      and(
        eq(advancedReport.id, data.reportId),
        eq(advancedReport.createdBy, organization.id),
      ),
    ),
] as const);
const saved = savedRows[0];
if (!saved) throw new Error("Impossible d’enregistrer la version propriétaire");
```

Keep the existing `return { success: true as const, data: saved }`. Run the test again.

Expected: PASS with 1 test.

- [ ] **Step 5: Implement tenant-scoped, idempotent shared-version creation**

In `apps/web/src/functions/reports.function.ts`, import `canFinalizeReport`, `buildOwnerReportSnapshot`, `resolveOwnerFacingText`, and `reportSharedVersion`. Add:

```ts
export const createReportSharedVersion = createServerFn({ method: "POST" })
  .validator(z.object({ reportId: z.string().min(1) }))
  .handler(async ({ data }) => {
    const organization = await getCurrentOrganization();
    if (!organization) throw new Error("Organization not found");

    const report = await db.query.advancedReport.findFirst({
      where: and(
        eq(advancedReport.id, data.reportId),
        eq(advancedReport.createdBy, organization.id),
      ),
      with: {
        patient: { with: { owner: true } },
        anatomicalIssues: { with: { anatomicalPart: true } },
        recommendations: true,
        ownerContents: true,
        sectionStates: true,
      },
    });
    if (!report?.patient?.owner) {
      throw new Error("Rapport, animal ou propriétaire introuvable");
    }

    const sectionStates = normalizeReportSectionStates(report.sectionStates);
    if (report.status === "draft" || !canFinalizeReport(sectionStates)) {
      throw new Error("Le rapport doit être finalisé avant son partage");
    }

    const existing = await db.query.reportSharedVersion.findFirst({
      where: and(
        eq(reportSharedVersion.reportId, report.id),
        eq(reportSharedVersion.organizationId, organization.id),
        eq(reportSharedVersion.reportRevision, report.revision),
      ),
    });
    if (existing) return { success: true as const, data: existing };

    const observations = report.anatomicalIssues.filter(
      (item) => item.type === "observation",
    );
    const issues = report.anatomicalIssues.filter((item) =>
      ["dysfunction", "anatomicalSuspicion"].includes(item.type),
    );
    const itemText = (item: {
      id: string;
      notes: string | null;
      anatomicalPart?: { name: string } | null;
    }) => item.notes?.trim() || item.anatomicalPart?.name.trim() || "";

    const snapshot = buildOwnerReportSnapshot({
      reportId: report.id,
      reportRevision: report.revision,
      title: report.title,
      animal: { id: report.patient.id, name: report.patient.name },
      owner: { id: report.patient.owner.id, name: report.patient.owner.name },
      consultationReason: resolveOwnerFacingText(
        report.ownerContents,
        "consultationReason",
        "consultationReason",
        report.consultationReason,
      ),
      clinical: observations
        .map((item) =>
          resolveOwnerFacingText(
            report.ownerContents,
            "observation",
            item.id,
            itemText(item),
          ),
        )
        .filter(Boolean),
      anatomical: issues
        .map((item) =>
          resolveOwnerFacingText(
            report.ownerContents,
            "anatomicalIssue",
            item.id,
            itemText(item),
          ),
        )
        .filter(Boolean),
      recommendations: report.recommendations
        .map((item) =>
          resolveOwnerFacingText(
            report.ownerContents,
            "recommendation",
            item.id,
            item.recommendation,
          ),
        )
        .filter(Boolean),
      notes: resolveOwnerFacingText(
        report.ownerContents,
        "notes",
        "notes",
        report.notes ?? "",
      ),
      createdAt: new Date(),
    });

    const [created] = await db
      .insert(reportSharedVersion)
      .values({
        reportId: report.id,
        organizationId: organization.id,
        reportRevision: report.revision,
        snapshot,
      })
      .onConflictDoNothing({
        target: [
          reportSharedVersion.reportId,
          reportSharedVersion.reportRevision,
        ],
      })
      .returning();

    const persisted =
      created ??
      (await db.query.reportSharedVersion.findFirst({
        where: and(
          eq(reportSharedVersion.reportId, report.id),
          eq(reportSharedVersion.organizationId, organization.id),
          eq(reportSharedVersion.reportRevision, report.revision),
        ),
      }));
    if (!persisted) throw new Error("Impossible de créer la version partagée");
    return { success: true as const, data: persisted };
  });
```

The conflict fallback makes concurrent retries idempotent. Never update a `reportSharedVersion` row after insertion.

In `reports.action.ts`, import the server function and export:

```ts
export function createReportSharedVersion(reportId: string) {
  return createReportSharedVersionFn({ data: { reportId } });
}
```

- [ ] **Step 6: Add tenant-isolation and immutability wiring regressions**

Append to `tenant-creation-wiring.test.ts`:

```ts
test("shared versions are scoped, revision-bound, and never updated", () => {
  const source = readFileSync(
    new URL("./reports.function.ts", import.meta.url),
    "utf8",
  );
  const sharedSource = source.slice(
    source.indexOf("export const createReportSharedVersion"),
    source.indexOf("export const getAnatomicalParts"),
  );
  expect(sharedSource).toContain("eq(advancedReport.createdBy, organization.id)");
  expect(sharedSource).toContain("reportSharedVersion.reportRevision");
  expect(sharedSource).toContain("onConflictDoNothing");
  expect(sharedSource).not.toContain(".update(reportSharedVersion)");
});
```

Run:

```bash
bun --filter @biume/web test -- \
  src/functions/report-domain.test.ts \
  src/functions/tenant-creation-wiring.test.ts
```

Expected: both test files pass.

- [ ] **Step 7: Verify that edits create a new shareable revision**

Run the app with `bun run dev:web` against a disposable local/development database after applying `bun --filter @biume/db db:migrate`. Create a quick report, resolve all sections, finalize it, and invoke `createReportSharedVersion` once from the existing action layer or a temporary browser console call through the running UI. Verify with Drizzle Studio (`bun --filter @biume/db dev`):

1. The first row has `reportRevision = 1` or the report’s current positive revision.
2. Calling the action again does not add a row.
3. Editing and saving the report increments `advancedReport.revision`.
4. Editing one owner-facing text increments `advancedReport.revision` again.
5. Re-finalizing and creating a shared version adds one row for the new revision.
6. The first row’s JSON snapshot remains byte-for-byte unchanged.

Remove any temporary invocation code before committing. Do not apply this migration to production as part of this plan execution.

- [ ] **Step 8: Run the complete foundation verification**

Run:

```bash
bun --filter @biume/contracts test
bun --filter @biume/contracts check-types
bun --filter @biume/db test
bun --filter @biume/web test -- \
  src/functions/report-domain.test.ts \
  src/functions/report-owner-content.function.test.ts \
  src/functions/tenant-creation-wiring.test.ts \
  src/components/dashboard/pages/reports-module/reports-editor.helpers.test.ts \
  src/components/dashboard/pages/reports-module/components/InitializationDialog.helpers.test.ts \
  src/components/dashboard/pages/reports-module/components/SectionDecisionControl.test.tsx \
  src/components/dashboard/pages/reports-module/components/ReportSidebarNavigation.test.tsx
bun run check-types
bunx tsc --noEmit -p apps/web/tsconfig.json
git diff --check
```

Expected:

- Contract, DB, and focused web tests pass.
- `bun run check-types` exits 0 for workspace packages that declare that script.
- The direct web typecheck may still exit 2 only for the pre-existing `date-picker.tsx` and `polyfills/*` errors; no changed report-domain file may appear in its output.
- `git diff --check` prints nothing.
- `git status --short` contains no generated build output and still preserves the unrelated user change in `dataCat.ts`.

- [ ] **Step 9: Commit immutable shared versions**

```bash
git add apps/web/src/functions/report-domain.ts \
  apps/web/src/functions/report-domain.test.ts \
  apps/web/src/functions/report-owner-content.function.ts \
  apps/web/src/functions/report-owner-content.function.test.ts \
  apps/web/src/functions/reports.function.ts \
  apps/web/src/functions/tenant-creation-wiring.test.ts \
  apps/web/src/lib/api/actions/reports.action.ts
git commit -m "feat(reports): create immutable shared versions"
```

## Completion Criteria

The foundation is complete only when all of the following are true:

- `@biume/contracts` is the sole source of the canonical report schema and section-state types.
- A report has one persisted decision for each of the four canonical sections.
- Neither client nor server allows finalization while a section remains unresolved.
- Editing validated professional content marks the relevant section for confirmation and increments the report revision on save.
- A practitioner can create their first report using owner name and animal name without completing the animal profile.
- Existing-animal report creation still works and remains tenant isolated.
- A shared report version is self-contained, organization scoped, revision bound, idempotent, and never updated.
- The generated migration contains only the intended additive tables/column and five pet nullability changes.
- All new tests pass and no new TypeScript error is introduced.
- Expo/mobile, capture, transcription, AI extraction, OTP, delivery, questionnaire, and follow-up remain outside this implementation.

## Follow-on Plans

After this plan is implemented and reviewed, write separate implementation plans in this order:

1. `mobile-capture-and-sync` — Expo shell, Better Auth session, local capture identity, encrypted persistent audio, SQLite queue, idempotent upload.
2. `transcription-and-report-proposal` — transcription validation, versioned extraction, source spans, proposal decisions, audio purge.
3. `mobile-report-finalization` — simple report review, explicit section decisions, creation of a shared version, and handoff to the advanced web editor.
4. `owner-access-and-report-delivery` — opaque links, e-mail OTP, 30-day sessions, revocation, e-mail delivery, and portal rendering of `reportSharedVersion`.
5. `post-session-follow-up` — scheduled questionnaire, responses, action rules, practitioner notifications.
6. `surface-alignment-and-product-metrics` — marketing, onboarding, transactional e-mails, active-time instrumentation, correction metrics, activation, pilot dashboards, and the public-claim gate.
