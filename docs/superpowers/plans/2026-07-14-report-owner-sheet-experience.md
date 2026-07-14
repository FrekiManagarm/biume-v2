# Report Owner Sheet Experience Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a report workspace that preserves professional terminology and anatomical calibration while providing an on-demand, persistent, guided owner-facing preparation flow in a single right-side sheet.

**Architecture:** Keep professional report data as the source of truth and store owner-facing versions in a separate `reportOwnerContent` table keyed by stable report-item IDs. A pure domain layer derives source fingerprints, readiness states, queue order, and owner-document fallbacks; the editor then feeds one mutually exclusive sheet controller for preview or guided preparation.

**Tech Stack:** Bun workspaces, TypeScript, React 19, TanStack Start/Router/Query, Drizzle ORM/PostgreSQL, Tailwind CSS v4, Shadcn-style Sheet components, Vercel AI SDK, Vitest, Testing Library, React PDF.

## Global Constraints

- Work only in an isolated worktree and never edit `main` directly.
- Use Bun commands and the existing workspace dependencies; add no styling, animation, state-management, or AI dependency.
- Keep the professional labels exactly `Observations`, `Anatomie`, `Recommandations`, and `Notes additionnelles`.
- Use the current Biume `primary` purple token (`hsl(251 73% 72%)`) for active navigation, progress, focus, and preparation actions.
- Use green only for ready, validated, or complete states; use amber only for missing or stale owner preparation.
- Owner-facing generation is on demand and never overwrites professional text.
- Missing or stale owner text warns but never blocks report finalization.
- Preview and preparation use one mutually exclusive right-side sheet slot: 32rem on desktop and full viewport on mobile.
- Preserve SVG `viewBox="0 0 500 380"`, `preserveAspectRatio="xMidYMid meet"`, image/SVG overlay ratio, laterality mapping, database paths, view boxes, and transforms.
- Do not edit `apps/web/src/routeTree.gen.ts` manually.

## File Structure

### New files

- `apps/web/src/components/dashboard/pages/reports-module/owner-content.ts`: pure owner-source normalization, fingerprints, status, queue, and fallback helpers.
- `apps/web/src/components/dashboard/pages/reports-module/owner-content.test.ts`: domain behavior tests.
- `packages/db/src/schema/advancedReport/reportOwnerContent.ts`: owner-content table, enum, relations, and types.
- `packages/db/src/schema/advancedReport/reportOwnerContent.test.ts`: schema configuration test.
- `packages/db/src/migrations/0000_report_owner_content.sql`: Drizzle-generated migration.
- `packages/db/src/migrations/meta/_journal.json`: Drizzle migration journal.
- `packages/db/src/migrations/meta/0000_snapshot.json`: Drizzle schema snapshot.
- `apps/web/src/components/dashboard/pages/reports-module/reports.persistence.ts`: stable child-row IDs and removed-owner-source calculation.
- `apps/web/src/components/dashboard/pages/reports-module/reports.persistence.test.ts`: persistence mapping tests.
- `apps/web/src/functions/report-owner-content.function.ts`: authorized owner-content upsert server function.
- `apps/web/src/lib/api/actions/report-owner-content.action.ts`: client wrapper for the server function.
- `apps/web/src/components/dashboard/pages/reports-module/owner-content.persistence.ts`: pure validation of a requested owner-content upsert against persisted report sources.
- `apps/web/src/components/dashboard/pages/reports-module/owner-content.persistence.test.ts`: upsert preparation tests.
- `apps/web/src/components/dashboard/pages/reports-module/owner-report-view-model.ts`: shared owner preview/PDF projection.
- `apps/web/src/components/dashboard/pages/reports-module/owner-report-view-model.test.ts`: owner document priority tests.
- `apps/web/src/components/dashboard/pages/reports-module/components/ReportPanelController.tsx`: single preview/preparation sheet controller.
- `apps/web/src/components/dashboard/pages/reports-module/components/ReportPanelController.test.tsx`: mutual-exclusion tests.
- `apps/web/src/components/dashboard/pages/reports-module/components/OwnerPreparationSheet.tsx`: guided preparation queue.
- `apps/web/src/components/dashboard/pages/reports-module/components/OwnerPreparationSheet.test.tsx`: generation, validation, skip, retry, and close tests.
- `apps/web/src/components/dashboard/pages/reports-module/components/ReportWorkspaceHeader.tsx`: report context and report-level actions.
- `apps/web/src/components/dashboard/pages/reports-module/components/OwnerPreparationWarningDialog.tsx`: non-blocking finalization warning.
- `apps/web/src/components/dashboard/pages/reports-module/components/OwnerPreparationWarningDialog.test.tsx`: finalization choice tests.
- `apps/web/src/components/dashboard/pages/reports-module/components/anatomy-invariants.test.ts`: protected anatomy source assertions.

### Modified files

- `packages/db/src/schema/index.ts`: export owner-content schema.
- `packages/db/src/schema/advancedReport/advancedReport.ts`: expose owner-content relation and type.
- `apps/web/src/functions/reports.function.ts`: return owner content, preserve child IDs, and remove deleted-item owner rows.
- `apps/web/src/lib/api/queries/reports.query.ts`: retain report-detail query behavior with expanded report data.
- `apps/web/src/components/dashboard/pages/reports-module/reports-editor.tsx`: integrate normalized sources, the single sheet state, new layout, and finalization warnings.
- `apps/web/src/components/dashboard/pages/reports-module/reports-editor.helpers.ts`: return save success and invalidate owner-aware report detail.
- `apps/web/src/components/dashboard/pages/reports-module/reports-editor.helpers.test.ts`: save/query helper expectations.
- `apps/web/src/components/dashboard/pages/reports-module/components/ReportSidebarNavigation.tsx`: exact labels, statuses, counts, and guided-queue trigger.
- `apps/web/src/components/dashboard/pages/reports-module/components/ReportSidebarNavigation.test.tsx`: professional labels and semantic states.
- `apps/web/src/components/dashboard/pages/reports-module/components/ReportPreview.tsx`: render the owner document body inside a sheet and show editor-only fallback metadata.
- `apps/web/src/components/dashboard/pages/reports-module/components/ReportPreview.test.tsx`: owner text priority and sheet semantics.
- `apps/web/src/components/dashboard/pages/reports-module/components/ReportPDF.helpers.ts`: build the owner-facing PDF model from resolved owner content.
- `apps/web/src/components/dashboard/pages/reports-module/components/ReportPDF.helpers.test.ts`: PDF priority and fallback tests.
- `apps/web/src/components/dashboard/pages/reports-module/components/ReportPDF.tsx`: render resolved owner-facing content.
- `apps/web/src/components/dashboard/pages/reports-module/reports-details.tsx`: pass owner content into PDF generation.
- `apps/web/src/components/dashboard/pages/reports-module/components/AddObservationsDialog.tsx`: remove owner wording from professional-note insertion.
- `apps/web/src/components/dashboard/pages/reports-module/components/AddAnatomicalIssueDialog.tsx`: remove owner wording from professional-note insertion.
- `apps/web/src/routes/dashboard/settings.tsx`: describe owner preparation as on demand rather than automatic.

### Deleted file

- `apps/web/src/components/ai/VulgarisationPanel.tsx`: remove the old generic drawer after both report dialogs stop importing it; guided preparation replaces this report integration.

---

### Task 1: Owner-content domain model

**Files:**
- Create: `apps/web/src/components/dashboard/pages/reports-module/owner-content.ts`
- Create: `apps/web/src/components/dashboard/pages/reports-module/owner-content.test.ts`

**Interfaces:**
- Consumes: current editor `Observation`, `AnatomicalIssue`, and recommendation shapes.
- Produces: `OwnerSourceKind`, `OwnerContentRecord`, `OwnerSourceItem`, `buildOwnerSourceItems`, `deriveOwnerContentStatus`, `buildOwnerPreparationQueue`, and `resolveOwnerText`.

- [ ] **Step 1: Write failing tests for normalization, fingerprints, status, queue order, and fallback**

```ts
import { describe, expect, test } from "vitest";
import {
  buildOwnerPreparationQueue,
  buildOwnerSourceItems,
  deriveOwnerContentStatus,
  resolveOwnerText,
} from "./owner-content";

const input = {
  reportId: "report_01",
  consultationReason: "Boiterie après effort",
  observations: [
    {
      id: "obs_01",
      region: "Épaule",
      severity: 2,
      notes: "Restriction gléno-humérale",
      type: "dynamic" as const,
      laterality: "left" as const,
    },
  ],
  anatomicalIssues: [
    {
      id: "issue_01",
      type: "dysfunction" as const,
      region: "Cervicales",
      severity: 3,
      notes: "Tension C1-C2",
      laterality: "bilateral" as const,
    },
  ],
  recommendations: [{ id: "rec_01", content: "Repos relatif 48 h" }],
  notes: "Surveiller le confort",
};

describe("owner content", () => {
  test("builds stable sources in professional navigation order", () => {
    const sources = buildOwnerSourceItems(input);
    expect(sources.map((source) => source.key)).toEqual([
      "consultationReason:consultationReason",
      "observation:obs_01",
      "anatomicalIssue:issue_01",
      "recommendation:rec_01",
      "notes:notes",
    ]);
    expect(sources[2]?.fingerprint).toBe(
      buildOwnerSourceItems(input)[2]?.fingerprint,
    );
  });

  test("marks matching text ready and changed source stale", () => {
    const [source] = buildOwnerSourceItems(input);
    const record = {
      id: "owner_01",
      reportId: input.reportId,
      sourceKind: source.sourceKind,
      sourceId: source.sourceId,
      ownerText: "Gêne après une activité soutenue.",
      sourceFingerprint: source.fingerprint,
    };
    expect(deriveOwnerContentStatus(source, record)).toBe("ready");
    expect(
      deriveOwnerContentStatus(
        { ...source, fingerprint: "changed" },
        record,
      ),
    ).toBe("stale");
    expect(deriveOwnerContentStatus(source, undefined)).toBe("missing");
  });

  test("queues stale before missing and excludes ready sources", () => {
    const sources = buildOwnerSourceItems(input);
    const records = [
      {
        id: "owner_ready",
        reportId: input.reportId,
        sourceKind: sources[0]!.sourceKind,
        sourceId: sources[0]!.sourceId,
        ownerText: "Motif clair",
        sourceFingerprint: sources[0]!.fingerprint,
      },
      {
        id: "owner_stale",
        reportId: input.reportId,
        sourceKind: sources[2]!.sourceKind,
        sourceId: sources[2]!.sourceId,
        ownerText: "Ancienne formulation",
        sourceFingerprint: "old",
      },
    ];
    expect(
      buildOwnerPreparationQueue(sources, records).map((item) => item.key),
    ).toEqual([
      "anatomicalIssue:issue_01",
      "observation:obs_01",
      "recommendation:rec_01",
      "notes:notes",
    ]);
  });

  test("uses saved owner text before professional fallback", () => {
    const [source] = buildOwnerSourceItems(input);
    expect(resolveOwnerText(source, undefined)).toEqual({
      text: "Boiterie après effort",
      status: "missing",
      usedFallback: true,
    });
  });
});
```

- [ ] **Step 2: Run the domain test and verify the missing module failure**

Run: `bun --filter @biume/web test -- owner-content.test.ts`

Expected: FAIL because `./owner-content` does not exist.

- [ ] **Step 3: Implement the pure domain module**

```ts
import type { AnatomicalIssue, Observation } from "./types";

export type ReportSectionId =
  | "clinical"
  | "anatomical"
  | "recommendations"
  | "notes";
export type OwnerSourceKind =
  | "consultationReason"
  | "observation"
  | "anatomicalIssue"
  | "recommendation"
  | "notes";
export type OwnerContentStatus = "missing" | "stale" | "ready";

export type OwnerContentRecord = {
  id: string;
  reportId: string;
  sourceKind: OwnerSourceKind;
  sourceId: string;
  ownerText: string;
  sourceFingerprint: string;
  createdAt?: Date | string | null;
  updatedAt?: Date | string | null;
};

export type OwnerSourceItem = {
  key: string;
  sourceKind: OwnerSourceKind;
  sourceId: string;
  section: ReportSectionId;
  professionalText: string;
  context: string;
  fingerprint: string;
  order: number;
};

type BuildOwnerSourceItemsInput = {
  reportId: string;
  consultationReason: string;
  observations: Observation[];
  anatomicalIssues: AnatomicalIssue[];
  recommendations: Array<{ id: string; content: string }>;
  notes: string;
};

function fingerprint(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

function createSource(
  sourceKind: OwnerSourceKind,
  sourceId: string,
  section: ReportSectionId,
  professionalText: string,
  context: string,
  order: number,
): OwnerSourceItem | null {
  const text = professionalText.trim();
  if (!text) return null;
  return {
    key: `${sourceKind}:${sourceId}`,
    sourceKind,
    sourceId,
    section,
    professionalText: text,
    context,
    fingerprint: fingerprint(
      JSON.stringify({ sourceKind, sourceId, professionalText: text, context }),
    ),
    order,
  };
}

export function buildOwnerSourceItems(
  input: BuildOwnerSourceItemsInput,
): OwnerSourceItem[] {
  const sources: Array<OwnerSourceItem | null> = [];
  let order = 0;
  sources.push(
    createSource(
      "consultationReason",
      "consultationReason",
      "clinical",
      input.consultationReason,
      "Motif de consultation",
      order++,
    ),
  );
  for (const observation of input.observations) {
    sources.push(
      createSource(
        "observation",
        observation.id,
        "clinical",
        observation.notes || observation.region,
        JSON.stringify({
          region: observation.region,
          laterality: observation.laterality,
          severity: observation.severity,
          type: observation.type,
        }),
        order++,
      ),
    );
  }
  for (const issue of input.anatomicalIssues) {
    sources.push(
      createSource(
        "anatomicalIssue",
        issue.id,
        "anatomical",
        issue.notes || issue.region,
        JSON.stringify({
          region: issue.region,
          laterality: issue.laterality,
          severity: issue.severity,
          type: issue.type,
        }),
        order++,
      ),
    );
  }
  for (const recommendation of input.recommendations) {
    sources.push(
      createSource(
        "recommendation",
        recommendation.id,
        "recommendations",
        recommendation.content,
        "Recommandation",
        order++,
      ),
    );
  }
  sources.push(
    createSource("notes", "notes", "notes", input.notes, "Notes", order),
  );
  return sources.filter((source): source is OwnerSourceItem => source !== null);
}

function recordFor(
  source: OwnerSourceItem,
  records: OwnerContentRecord[],
) {
  return records.find(
    (record) =>
      record.sourceKind === source.sourceKind &&
      record.sourceId === source.sourceId,
  );
}

export function deriveOwnerContentStatus(
  source: OwnerSourceItem,
  record?: OwnerContentRecord,
): OwnerContentStatus {
  if (!record) return "missing";
  return record.sourceFingerprint === source.fingerprint ? "ready" : "stale";
}

export function buildOwnerPreparationQueue(
  sources: OwnerSourceItem[],
  records: OwnerContentRecord[],
) {
  const priority: Record<OwnerContentStatus, number> = {
    stale: 0,
    missing: 1,
    ready: 2,
  };
  return sources
    .map((source) => ({
      ...source,
      status: deriveOwnerContentStatus(source, recordFor(source, records)),
    }))
    .filter((source) => source.status !== "ready")
    .sort(
      (left, right) =>
        priority[left.status] - priority[right.status] ||
        left.order - right.order,
    );
}

export function resolveOwnerText(
  source: OwnerSourceItem,
  record?: OwnerContentRecord,
) {
  if (!record) {
    return {
      text: source.professionalText,
      status: "missing" as const,
      usedFallback: true,
    };
  }
  return {
    text: record.ownerText,
    status: deriveOwnerContentStatus(source, record),
    usedFallback: false,
  };
}
```

- [ ] **Step 4: Run the domain test and verify it passes**

Run: `bun --filter @biume/web test -- owner-content.test.ts`

Expected: PASS with 4 tests.

- [ ] **Step 5: Commit the domain model**

```bash
git add apps/web/src/components/dashboard/pages/reports-module/owner-content.ts apps/web/src/components/dashboard/pages/reports-module/owner-content.test.ts
git commit -m "feat(reports): add owner content domain model"
```

### Task 2: Owner-content database schema and migration

**Files:**
- Create: `packages/db/src/schema/advancedReport/reportOwnerContent.ts`
- Create: `packages/db/src/schema/advancedReport/reportOwnerContent.test.ts`
- Create: `packages/db/src/migrations/0000_report_owner_content.sql`
- Create: `packages/db/src/migrations/meta/_journal.json`
- Create: `packages/db/src/migrations/meta/0000_snapshot.json`
- Modify: `packages/db/src/schema/advancedReport/advancedReport.ts`
- Modify: `packages/db/src/schema/index.ts`

**Interfaces:**
- Consumes: `advancedReport.id`.
- Produces: `reportOwnerContent`, `reportOwnerContentSourceKind`, `ReportOwnerContent`, and `advancedReport.ownerContents`.

- [ ] **Step 1: Write the failing schema configuration test**

```ts
import { getTableConfig } from "drizzle-orm/pg-core";
import { describe, expect, test } from "vitest";
import { reportOwnerContent } from "./reportOwnerContent";

describe("reportOwnerContent", () => {
  test("has the required columns and unique source key", () => {
    const config = getTableConfig(reportOwnerContent);
    expect(config.name).toBe("report_owner_content");
    expect(config.columns.map((column) => column.name)).toEqual(
      expect.arrayContaining([
        "id",
        "report_id",
        "source_kind",
        "source_id",
        "owner_text",
        "source_fingerprint",
        "created_at",
        "updated_at",
      ]),
    );
    expect(config.indexes.some((index) => index.config.unique)).toBe(true);
  });
});
```

- [ ] **Step 2: Run the database test and verify the missing module failure**

Run: `bun --filter @biume/db test -- reportOwnerContent.test.ts`

Expected: FAIL because `./reportOwnerContent` does not exist.

- [ ] **Step 3: Add the schema, relation, and exports**

```ts
import { relations } from "drizzle-orm";
import {
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { advancedReport } from "./advancedReport";

export const reportOwnerContentSourceKind = pgEnum(
  "report_owner_content_source_kind",
  [
    "consultationReason",
    "observation",
    "anatomicalIssue",
    "recommendation",
    "notes",
  ],
);

export const reportOwnerContent = pgTable(
  "report_owner_content",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    reportId: text("report_id")
      .notNull()
      .references(() => advancedReport.id, { onDelete: "cascade" }),
    sourceKind: reportOwnerContentSourceKind("source_kind").notNull(),
    sourceId: text("source_id").notNull(),
    ownerText: text("owner_text").notNull(),
    sourceFingerprint: text("source_fingerprint").notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("report_owner_content_source_unique").on(
      table.reportId,
      table.sourceKind,
      table.sourceId,
    ),
  ],
);

export const reportOwnerContentRelations = relations(
  reportOwnerContent,
  ({ one }) => ({
    report: one(advancedReport, {
      fields: [reportOwnerContent.reportId],
      references: [advancedReport.id],
    }),
  }),
);

export type ReportOwnerContent = typeof reportOwnerContent.$inferSelect;
export type NewReportOwnerContent = typeof reportOwnerContent.$inferInsert;
```

In `advancedReportRelations`, add `ownerContents: many(reportOwnerContent)`, add `ReportOwnerContent[]` to `AdvancedReport`, and export the new module from `packages/db/src/schema/index.ts`.

- [ ] **Step 4: Generate the named migration**

Run: `bun --filter @biume/db db:generate --name report_owner_content`

Expected: creates `packages/db/src/migrations/0000_report_owner_content.sql`, `packages/db/src/migrations/meta/_journal.json`, and `packages/db/src/migrations/meta/0000_snapshot.json`. The SQL contains the enum, table, foreign key, and unique index, with no destructive statement for existing report or anatomy tables.

- [ ] **Step 5: Run schema tests and workspace type checks**

Run: `bun --filter @biume/db test -- reportOwnerContent.test.ts && bun run check-types`

Expected: PASS; no TypeScript error.

- [ ] **Step 6: Commit the schema and migration**

```bash
git add packages/db/src/schema packages/db/src/migrations
git commit -m "feat(db): store report owner content"
```

### Task 3: Stable report-item persistence

**Files:**
- Create: `apps/web/src/components/dashboard/pages/reports-module/reports.persistence.ts`
- Create: `apps/web/src/components/dashboard/pages/reports-module/reports.persistence.test.ts`
- Modify: `apps/web/src/functions/reports.function.ts`

**Interfaces:**
- Consumes: validated report observations, anatomical issues, recommendations, and existing child IDs.
- Produces: `buildReportChildRows` and `getRemovedOwnerSources`; persisted child rows keep the client-provided ID.

- [ ] **Step 1: Write failing tests for stable IDs and deleted-source cleanup**

```ts
import { describe, expect, test } from "vitest";
import {
  buildReportChildRows,
  getRemovedOwnerSources,
} from "./reports.persistence";

describe("report child persistence", () => {
  test("reuses every validated client item id", () => {
    const rows = buildReportChildRows({
      reportId: "report_01",
      observations: [
        {
          id: "obs_01",
          region: "part_01",
          severity: 2,
          notes: "Observation",
          type: "dynamic",
          laterality: "left",
        },
      ],
      anatomicalIssues: [
        {
          id: "issue_01",
          type: "dysfunction",
          region: "part_02",
          severity: 3,
          notes: "Dysfonction",
          laterality: "bilateral",
        },
      ],
      recommendations: [{ id: "rec_01", content: "Repos" }],
      resolveAnatomicalPartId: (item) => item.region,
    });
    expect(rows.observations[0]?.id).toBe("obs_01");
    expect(rows.anatomicalIssues[0]?.id).toBe("issue_01");
    expect(rows.recommendations[0]?.id).toBe("rec_01");
  });

  test("returns only owner sources removed from the professional report", () => {
    expect(
      getRemovedOwnerSources(
        [
          { sourceKind: "observation", sourceId: "obs_keep" },
          { sourceKind: "observation", sourceId: "obs_delete" },
          { sourceKind: "recommendation", sourceId: "rec_delete" },
        ],
        {
          observation: ["obs_keep"],
          anatomicalIssue: [],
          recommendation: [],
        },
      ),
    ).toEqual([
      { sourceKind: "observation", sourceId: "obs_delete" },
      { sourceKind: "recommendation", sourceId: "rec_delete" },
    ]);
  });
});
```

- [ ] **Step 2: Run the persistence test and verify the missing module failure**

Run: `bun --filter @biume/web test -- reports.persistence.test.ts`

Expected: FAIL because `./reports.persistence` does not exist.

- [ ] **Step 3: Implement the pure row and cleanup helpers**

```ts
import type { OwnerSourceKind } from "./owner-content";
import type { AnatomicalIssue, Observation } from "./types";

type Recommendation = { id: string; content: string };
type AnatomicalItem = Pick<Observation, "region"> | Pick<AnatomicalIssue, "region">;

export function buildReportChildRows({
  reportId,
  observations,
  anatomicalIssues,
  recommendations,
  resolveAnatomicalPartId,
}: {
  reportId: string;
  observations: Observation[];
  anatomicalIssues: AnatomicalIssue[];
  recommendations: Recommendation[];
  resolveAnatomicalPartId: (item: AnatomicalItem) => string;
}) {
  return {
    observations: observations.map((observation) => ({
      id: observation.id,
      type: "observation" as const,
      advancedReportId: reportId,
      notes: observation.notes,
      anatomicalPartId: resolveAnatomicalPartId(observation),
      laterality: observation.laterality,
      severity: observation.severity,
      observationType: observation.type,
    })),
    anatomicalIssues: anatomicalIssues.map((issue) => ({
      id: issue.id,
      type: issue.type,
      advancedReportId: reportId,
      notes: issue.notes,
      anatomicalPartId: resolveAnatomicalPartId(issue),
      laterality: issue.laterality,
      severity: issue.severity,
      observationType: "none" as const,
    })),
    recommendations: recommendations.map((recommendation) => ({
      id: recommendation.id,
      advancedReportId: reportId,
      recommendation: recommendation.content,
    })),
  };
}

type OwnerSourceRef = {
  sourceKind: OwnerSourceKind;
  sourceId: string;
};

export function getRemovedOwnerSources(
  existing: OwnerSourceRef[],
  next: Record<"observation" | "anatomicalIssue" | "recommendation", string[]>,
) {
  return existing.filter((source) => {
    if (source.sourceKind === "observation") {
      return !next.observation.includes(source.sourceId);
    }
    if (source.sourceKind === "anatomicalIssue") {
      return !next.anatomicalIssue.includes(source.sourceId);
    }
    if (source.sourceKind === "recommendation") {
      return !next.recommendation.includes(source.sourceId);
    }
    return false;
  });
}
```

- [ ] **Step 4: Replace random child IDs and remove deleted owner sources in `updateReport`**

Use `buildReportChildRows` for all three insert collections. Before deleting report children, read existing `reportOwnerContent` rows for the report, compute `getRemovedOwnerSources`, and delete each returned `(reportId, sourceKind, sourceId)` row with an `and(...)` predicate. Keep scalar `consultationReason` and `notes` owner rows untouched.

```ts
const childRows = buildReportChildRows({
  reportId: updatedReport.id,
  observations,
  anatomicalIssues,
  recommendations,
  resolveAnatomicalPartId,
});

const removedSources = getRemovedOwnerSources(existingOwnerSources, {
  observation: observations.map((item) => item.id),
  anatomicalIssue: anatomicalIssues.map((item) => item.id),
  recommendation: recommendations.map((item) => item.id),
});

for (const source of removedSources) {
  await db
    .delete(reportOwnerContent)
    .where(
      and(
        eq(reportOwnerContent.reportId, updatedReport.id),
        eq(reportOwnerContent.sourceKind, source.sourceKind),
        eq(reportOwnerContent.sourceId, source.sourceId),
      ),
    );
}
```

- [ ] **Step 5: Run persistence and existing editor-helper tests**

Run: `bun --filter @biume/web test -- reports.persistence.test.ts reports-editor.helpers.test.ts`

Expected: PASS; no report child receives a new UUID during update.

- [ ] **Step 6: Commit stable persistence**

```bash
git add apps/web/src/components/dashboard/pages/reports-module/reports.persistence.ts apps/web/src/components/dashboard/pages/reports-module/reports.persistence.test.ts apps/web/src/functions/reports.function.ts
git commit -m "fix(reports): preserve report item identities"
```

### Task 4: Authorized owner-content upsert

**Files:**
- Create: `apps/web/src/components/dashboard/pages/reports-module/owner-content.persistence.ts`
- Create: `apps/web/src/components/dashboard/pages/reports-module/owner-content.persistence.test.ts`
- Create: `apps/web/src/functions/report-owner-content.function.ts`
- Create: `apps/web/src/lib/api/actions/report-owner-content.action.ts`
- Modify: `apps/web/src/functions/reports.function.ts`
- Modify: `apps/web/src/lib/api/queries/reports.query.ts`

**Interfaces:**
- Consumes: `buildOwnerSourceItems`, active-organization report access, and `{ reportId, sourceKind, sourceId, ownerText }`.
- Produces: `prepareOwnerContentUpsert`, `upsertReportOwnerContent`, and report-detail data containing `ownerContents`.

- [ ] **Step 1: Write failing tests for server-side source validation and fingerprint selection**

```ts
import { describe, expect, test } from "vitest";
import { prepareOwnerContentUpsert } from "./owner-content.persistence";

const source = {
  key: "observation:obs_01",
  sourceKind: "observation" as const,
  sourceId: "obs_01",
  section: "clinical" as const,
  professionalText: "Restriction gléno-humérale",
  context: "Épaule gauche",
  fingerprint: "abc12345",
  order: 0,
};

describe("prepareOwnerContentUpsert", () => {
  test("uses the persisted source fingerprint and trims owner text", () => {
    expect(
      prepareOwnerContentUpsert({
        reportId: "report_01",
        sourceKind: "observation",
        sourceId: "obs_01",
        ownerText: "  Mobilité réduite de l’épaule.  ",
        sources: [source],
      }),
    ).toMatchObject({
      reportId: "report_01",
      sourceKind: "observation",
      sourceId: "obs_01",
      ownerText: "Mobilité réduite de l’épaule.",
      sourceFingerprint: "abc12345",
    });
  });

  test("rejects an unknown or empty source", () => {
    expect(() =>
      prepareOwnerContentUpsert({
        reportId: "report_01",
        sourceKind: "observation",
        sourceId: "missing",
        ownerText: "Texte",
        sources: [source],
      }),
    ).toThrow("Source de rapport introuvable");
    expect(() =>
      prepareOwnerContentUpsert({
        reportId: "report_01",
        sourceKind: "observation",
        sourceId: "obs_01",
        ownerText: "   ",
        sources: [source],
      }),
    ).toThrow("La version propriétaire est vide");
  });
});
```

- [ ] **Step 2: Run the persistence validation test and verify failure**

Run: `bun --filter @biume/web test -- owner-content.persistence.test.ts`

Expected: FAIL because `prepareOwnerContentUpsert` does not exist.

- [ ] **Step 3: Implement `prepareOwnerContentUpsert`**

```ts
import {
  buildOwnerSourceItems,
  type OwnerSourceItem,
  type OwnerSourceKind,
} from "./owner-content";

export function prepareOwnerContentUpsert({
  reportId,
  sourceKind,
  sourceId,
  ownerText,
  sources,
}: {
  reportId: string;
  sourceKind: OwnerSourceKind;
  sourceId: string;
  ownerText: string;
  sources: OwnerSourceItem[];
}) {
  const source = sources.find(
    (item) => item.sourceKind === sourceKind && item.sourceId === sourceId,
  );
  if (!source) throw new Error("Source de rapport introuvable");
  const normalizedOwnerText = ownerText.trim();
  if (!normalizedOwnerText) {
    throw new Error("La version propriétaire est vide");
  }
  return {
    reportId,
    sourceKind,
    sourceId,
    ownerText: normalizedOwnerText,
    sourceFingerprint: source.fingerprint,
    updatedAt: new Date(),
  };
}

export type PersistedOwnerReport = {
  id: string;
  consultationReason: string | null;
  notes: string | null;
  anatomicalIssues: Array<{
    id: string;
    type: "observation" | "dysfunction" | "anatomicalSuspicion";
    observationType: "static" | "dynamic" | "diagnosticExclusion" | "none" | null;
    notes: string | null;
    laterality: "left" | "right" | "bilateral";
    severity: number;
    anatomicalPart: { name: string } | null;
  }>;
  recommendations: Array<{
    id: string;
    recommendation: string;
  }>;
};

export function buildPersistedOwnerSources(report: PersistedOwnerReport) {
  return buildOwnerSourceItems({
    reportId: report.id,
    consultationReason: report.consultationReason ?? "",
    observations: report.anatomicalIssues
      .filter((item) => item.type === "observation")
      .map((item) => ({
        id: item.id,
        region: item.anatomicalPart?.name ?? "Zone non précisée",
        severity: item.severity,
        notes: item.notes ?? "",
        type: item.observationType ?? "none",
        laterality: item.laterality,
      })),
    anatomicalIssues: report.anatomicalIssues
      .filter((item) => item.type !== "observation")
      .map((item) => ({
        id: item.id,
        type: item.type as "dysfunction" | "anatomicalSuspicion",
        region: item.anatomicalPart?.name ?? "Zone non précisée",
        severity: item.severity,
        notes: item.notes ?? "",
        laterality: item.laterality,
      })),
    recommendations: report.recommendations.map((item) => ({
      id: item.id,
      content: item.recommendation,
    })),
    notes: report.notes ?? "",
  });
}
```

- [ ] **Step 4: Add the authorized server function and client wrapper**

The POST validator accepts only the report/source identity and owner text. The handler must load the report with patient-independent report fields, anatomical issues with parts, recommendations, and `createdBy`; reject a missing or foreign-organization report; rebuild persisted sources; call `prepareOwnerContentUpsert`; and upsert on the three-column unique key.

```ts
async function loadOwnedReport(reportId: string, organizationId: string) {
  return db.query.advancedReport.findFirst({
    where: and(
      eq(advancedReport.id, reportId),
      eq(advancedReport.createdBy, organizationId),
    ),
    with: {
      anatomicalIssues: { with: { anatomicalPart: true } },
      recommendations: true,
    },
  });
}

export const upsertReportOwnerContent = createServerFn({ method: "POST" })
  .validator(
    z.object({
      reportId: z.string().min(1),
      sourceKind: z.enum([
        "consultationReason",
        "observation",
        "anatomicalIssue",
        "recommendation",
        "notes",
      ]),
      sourceId: z.string().min(1),
      ownerText: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    const organization = await getCurrentOrganization();
    if (!organization) throw new Error("Organization not found");
    const report = await loadOwnedReport(data.reportId, organization.id);
    if (!report) throw new Error("Report not found or unauthorized");
    const values = prepareOwnerContentUpsert({
      ...data,
      sources: buildPersistedOwnerSources(report),
    });
    const [saved] = await db
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
      .returning();
    return { success: true as const, data: saved };
  });
```

The client wrapper calls the server function with `{ data }`. Expand `getReportById` with `ownerContents: true`; no new query key is needed because report detail remains `['reports', 'detail', reportId]`.

- [ ] **Step 5: Run persistence tests and type checks**

Run: `bun --filter @biume/web test -- owner-content.persistence.test.ts owner-content.test.ts && bun run check-types`

Expected: PASS; foreign-organization access remains guarded by the report query predicate.

- [ ] **Step 6: Commit the owner-content API**

```bash
git add apps/web/src/components/dashboard/pages/reports-module/owner-content.persistence.ts apps/web/src/components/dashboard/pages/reports-module/owner-content.persistence.test.ts apps/web/src/functions/report-owner-content.function.ts apps/web/src/functions/reports.function.ts apps/web/src/lib/api/actions/report-owner-content.action.ts apps/web/src/lib/api/queries/reports.query.ts
git commit -m "feat(reports): persist owner-facing versions"
```

### Task 5: Shared owner-document view model and PDF export

**Files:**
- Create: `apps/web/src/components/dashboard/pages/reports-module/owner-report-view-model.ts`
- Create: `apps/web/src/components/dashboard/pages/reports-module/owner-report-view-model.test.ts`
- Modify: `apps/web/src/components/dashboard/pages/reports-module/components/ReportPDF.helpers.ts`
- Modify: `apps/web/src/components/dashboard/pages/reports-module/components/ReportPDF.helpers.test.ts`
- Modify: `apps/web/src/components/dashboard/pages/reports-module/components/ReportPDF.tsx`
- Modify: `apps/web/src/components/dashboard/pages/reports-module/reports-details.tsx`

**Interfaces:**
- Consumes: `OwnerSourceItem[]`, `OwnerContentRecord[]`, and professional report data.
- Produces: `buildOwnerReportViewModel` and one resolved document model shared by preview and PDF.

- [ ] **Step 1: Write failing priority tests for the owner document**

```ts
import { describe, expect, test } from "vitest";
import { buildOwnerSourceItems } from "./owner-content";
import { buildOwnerReportViewModel } from "./owner-report-view-model";

describe("buildOwnerReportViewModel", () => {
  test("uses owner text, preserves stale text, and falls back when missing", () => {
    const sources = buildOwnerSourceItems({
      reportId: "report_01",
      consultationReason: "Boiterie après effort",
      observations: [
        {
          id: "obs_01",
          region: "Épaule",
          severity: 2,
          notes: "Restriction technique",
          type: "dynamic",
          laterality: "left",
        },
      ],
      anatomicalIssues: [],
      recommendations: [{ id: "rec_01", content: "Repos 48 h" }],
      notes: "Surveillance",
    });
    const model = buildOwnerReportViewModel(sources, [
      {
        id: "owner_reason",
        reportId: "report_01",
        sourceKind: "consultationReason",
        sourceId: "consultationReason",
        ownerText: "Gêne après une activité soutenue.",
        sourceFingerprint: sources[0]!.fingerprint,
      },
      {
        id: "owner_obs",
        reportId: "report_01",
        sourceKind: "observation",
        sourceId: "obs_01",
        ownerText: "L’épaule gauche bouge moins librement.",
        sourceFingerprint: "old",
      },
    ]);
    expect(model.byKey["consultationReason:consultationReason"]).toMatchObject({
      text: "Gêne après une activité soutenue.",
      status: "ready",
      usedFallback: false,
    });
    expect(model.byKey["observation:obs_01"]?.status).toBe("stale");
    expect(model.byKey["recommendation:rec_01"]).toMatchObject({
      text: "Repos 48 h",
      status: "missing",
      usedFallback: true,
    });
  });
});
```

- [ ] **Step 2: Run the view-model test and verify the missing module failure**

Run: `bun --filter @biume/web test -- owner-report-view-model.test.ts`

Expected: FAIL because `./owner-report-view-model` does not exist.

- [ ] **Step 3: Implement the shared projection**

```ts
import {
  deriveOwnerContentStatus,
  resolveOwnerText,
  type OwnerContentRecord,
  type OwnerSourceItem,
} from "./owner-content";

export function buildOwnerReportViewModel(
  sources: OwnerSourceItem[],
  records: OwnerContentRecord[],
) {
  const byKey = Object.fromEntries(
    sources.map((source) => {
      const record = records.find(
        (item) =>
          item.sourceKind === source.sourceKind &&
          item.sourceId === source.sourceId,
      );
      return [
        source.key,
        {
          ...resolveOwnerText(source, record),
          key: source.key,
          sourceKind: source.sourceKind,
          sourceId: source.sourceId,
          section: source.section,
          professionalText: source.professionalText,
          status: deriveOwnerContentStatus(source, record),
        },
      ];
    }),
  );
  return {
    byKey,
    sections: {
      clinical: sources.filter((source) => source.section === "clinical"),
      anatomical: sources.filter((source) => source.section === "anatomical"),
      recommendations: sources.filter(
        (source) => source.section === "recommendations",
      ),
      notes: sources.filter((source) => source.section === "notes"),
    },
  };
}
```

- [ ] **Step 4: Make the PDF helper consume the same resolved content**

Extend `ReportPdfIssue` with `observationType?: string | null` and `ReportPdfReport` with `ownerContents?: OwnerContentRecord[] | null`. Build sources from report-level text, observation issues, anatomical issues, and recommendations, then map resolved text into the PDF view model.

```ts
const ownerSources = buildOwnerSourceItems({
  reportId: report.id,
  consultationReason: report.consultationReason ?? "",
  observations: observations.map((item) => ({
    id: item.id ?? "",
    region: item.anatomicalPart?.name ?? "Zone non précisée",
    severity: item.severity ?? 2,
    notes: item.notes ?? "",
    type:
      item.observationType === "static" ||
      item.observationType === "dynamic" ||
      item.observationType === "diagnosticExclusion"
        ? item.observationType
        : "none",
    laterality:
      item.laterality === "left" ||
      item.laterality === "right" ||
      item.laterality === "bilateral"
        ? item.laterality
        : "bilateral",
  })),
  anatomicalIssues: [...dysfunctions, ...suspicions].map((item) => ({
    id: item.id ?? "",
    type:
      item.type === "anatomicalSuspicion"
        ? "anatomicalSuspicion"
        : "dysfunction",
    region: item.anatomicalPart?.name ?? "Zone non précisée",
    severity: item.severity ?? 2,
    notes: item.notes ?? "",
    laterality:
      item.laterality === "left" ||
      item.laterality === "right" ||
      item.laterality === "bilateral"
        ? item.laterality
        : "bilateral",
  })),
  recommendations: recommendations.map((item) => ({
    id: item.id ?? "",
    content: item.recommendation ?? item.description ?? "",
  })),
  notes: report.notes ?? "",
});
const ownerView = buildOwnerReportViewModel(
  ownerSources,
  report.ownerContents ?? [],
);
```

Return resolved consultation reason, notes, issue text, and recommendation text from `buildReportPdfViewModel`. `ReportPDF.tsx` renders those resolved fields and never prints editor-only `missing` or `stale` labels.

- [ ] **Step 5: Extend PDF tests with ready and fallback content**

```ts
test("prefers current owner text and falls back to professional text", () => {
  const report = {
    id: "report_owner_pdf",
    title: "Compte rendu",
    createdAt: new Date("2026-07-14T09:00:00Z"),
    consultationReason: "Motif technique",
    notes: "Note professionnelle",
    anatomicalIssues: [],
    recommendations: [],
    ownerContents: [
      {
        id: "owner_notes",
        reportId: "report_owner_pdf",
        sourceKind: "notes" as const,
        sourceId: "notes",
        ownerText: "Note claire pour le propriétaire",
        sourceFingerprint: buildOwnerSourceItems({
          reportId: "report_owner_pdf",
          consultationReason: "Motif technique",
          observations: [],
          anatomicalIssues: [],
          recommendations: [],
          notes: "Note professionnelle",
        })[1]!.fingerprint,
      },
    ],
  };
  const model = buildReportPdfViewModel(report);
  expect(model.consultationReason).toBe("Motif technique");
  expect(model.practitionerNotes).toBe("Note claire pour le propriétaire");
});
```

- [ ] **Step 6: Run owner-view and PDF tests**

Run: `bun --filter @biume/web test -- owner-report-view-model.test.ts ReportPDF.helpers.test.ts`

Expected: PASS, including the existing PDF render test.

- [ ] **Step 7: Commit the shared owner document projection**

```bash
git add apps/web/src/components/dashboard/pages/reports-module/owner-report-view-model.ts apps/web/src/components/dashboard/pages/reports-module/owner-report-view-model.test.ts apps/web/src/components/dashboard/pages/reports-module/components/ReportPDF.helpers.ts apps/web/src/components/dashboard/pages/reports-module/components/ReportPDF.helpers.test.ts apps/web/src/components/dashboard/pages/reports-module/components/ReportPDF.tsx apps/web/src/components/dashboard/pages/reports-module/reports-details.tsx
git commit -m "feat(reports): export resolved owner content"
```

### Task 6: Single panel controller and owner preview sheet

**Files:**
- Create: `apps/web/src/components/dashboard/pages/reports-module/components/ReportPanelController.tsx`
- Create: `apps/web/src/components/dashboard/pages/reports-module/components/ReportPanelController.test.tsx`
- Create: `apps/web/src/components/dashboard/pages/reports-module/components/OwnerPreparationSheet.tsx`
- Modify: `apps/web/src/components/dashboard/pages/reports-module/components/ReportPreview.tsx`
- Modify: `apps/web/src/components/dashboard/pages/reports-module/components/ReportPreview.test.tsx`

**Interfaces:**
- Consumes: `ReportPanelState`, the shared owner view model, report context, and callbacks.
- Produces: `ReportPanelController`, `OwnerReportPreviewSheet`, and one accessible 32rem sheet slot.

- [ ] **Step 1: Write failing mutual-exclusion and preview semantics tests**

```tsx
// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { ReportPanelController } from "./ReportPanelController";

const commonProps = {
  onClose: vi.fn(),
  preview: {
    title: "Compte rendu",
    patientName: "Nox",
    entries: [],
  },
  preparation: {
    reportId: "report_01",
    queue: [],
    records: [],
    onSave: vi.fn(),
  },
};

describe("ReportPanelController", () => {
  test("renders only the owner preview for owner-preview state", () => {
    render(
      <ReportPanelController
        {...commonProps}
        state={{ type: "owner-preview" }}
      />,
    );
    expect(
      screen.getByRole("heading", { name: "Aperçu propriétaire" }),
    ).not.toBeNull();
    expect(screen.queryByText("Préparation guidée")).toBeNull();
  });

  test("renders no dialog when the panel is closed", () => {
    render(
      <ReportPanelController {...commonProps} state={{ type: "closed" }} />,
    );
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
```

In `ReportPreview.test.tsx`, add assertions that the sheet has an accessible title, renders `À actualiser` for stale content, and renders `Texte professionnel utilisé` for fallback content.

- [ ] **Step 2: Run controller and preview tests and verify failure**

Run: `bun --filter @biume/web test -- ReportPanelController.test.tsx ReportPreview.test.tsx`

Expected: FAIL because `ReportPanelController` and the new preview props do not exist.

- [ ] **Step 3: Create the accessible preparation-sheet boundary**

Create the minimal sheet boundary needed by the controller; Task 7 adds the queue interaction inside it.

```tsx
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import type { OwnerContentRecord, OwnerSourceItem } from "../owner-content";

export type OwnerPreparationSaveInput = {
  reportId: string;
  sourceKind: OwnerSourceItem["sourceKind"];
  sourceId: string;
  ownerText: string;
};

export function OwnerPreparationSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportId: string;
  queue: Array<OwnerSourceItem & { status: "missing" | "stale" }>;
  records: OwnerContentRecord[];
  initialSourceKey?: string;
  onSave: (input: OwnerPreparationSaveInput) => Promise<unknown>;
  onViewPreview?: () => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-screen max-w-none p-0 sm:w-[32rem] sm:max-w-[32rem]"
      >
        <SheetHeader className="border-b border-border px-5 py-4 text-left">
          <SheetTitle>Préparation guidée</SheetTitle>
          <SheetDescription>
            Préparez une version claire sans modifier le texte professionnel.
          </SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
}
```

- [ ] **Step 4: Implement the discriminated controller**

```tsx
import type { ComponentProps } from "react";

export type ReportPanelState =
  | { type: "closed" }
  | { type: "owner-preview" }
  | { type: "owner-preparation"; sourceKey?: string };

type ReportPanelControllerProps = {
  state: ReportPanelState;
  onClose: () => void;
  preview: Omit<
    ComponentProps<typeof OwnerReportPreviewSheet>,
    "open" | "onOpenChange"
  >;
  preparation: Omit<
    ComponentProps<typeof OwnerPreparationSheet>,
    "open" | "onOpenChange" | "initialSourceKey"
  >;
};

export function ReportPanelController({
  state,
  onClose,
  preview,
  preparation,
}: ReportPanelControllerProps) {
  if (state.type === "closed") return null;
  if (state.type === "owner-preview") {
    return (
      <OwnerReportPreviewSheet
        open
        onOpenChange={(open) => {
          if (!open) onClose();
        }}
        {...preview}
      />
    );
  }
  return (
    <OwnerPreparationSheet
      open
      initialSourceKey={state.sourceKey}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      {...preparation}
    />
  );
}
```

This branch structure is the only place that chooses which report sheet renders.

- [ ] **Step 5: Convert the preview wrapper to a right-side Sheet**

Keep the existing owner-document body, but replace its dialog wrapper with:

```tsx
export type OwnerPreviewEntry = {
  key: string;
  label: string;
  text: string;
  status: "missing" | "stale" | "ready";
  usedFallback: boolean;
};

export type OwnerReportPreviewSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  patientName?: string;
  entries: OwnerPreviewEntry[];
  onStartPreparation?: () => void;
  onJumpToSection?: (section: ReportSectionId) => void;
};

function OwnerReportPreviewDocument({
  entries,
}: {
  entries: OwnerPreviewEntry[];
}) {
  return (
    <div className="space-y-5 px-5 py-6">
      {entries.map((entry) => (
        <section key={entry.key} className="border-t border-border pt-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-foreground">
              {entry.label}
            </h3>
            {entry.status === "stale" ? (
              <Badge variant="outline" className="border-amber-200 text-amber-800">
                À actualiser
              </Badge>
            ) : entry.usedFallback ? (
              <Badge variant="outline" className="border-amber-200 text-amber-800">
                Texte professionnel utilisé
              </Badge>
            ) : null}
          </div>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {entry.text}
          </p>
        </section>
      ))}
    </div>
  );
}

export function OwnerReportPreviewSheet({
  open,
  onOpenChange,
  title,
  patientName,
  entries,
}: OwnerReportPreviewSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-screen max-w-none overflow-y-auto p-0 sm:w-[32rem] sm:max-w-[32rem]"
      >
        <SheetHeader className="border-b border-border px-5 py-4 text-left">
          <SheetTitle>Aperçu propriétaire</SheetTitle>
          <SheetDescription>
            {patientName ? `${title} · ${patientName}` : title}
          </SheetDescription>
        </SheetHeader>
        <OwnerReportPreviewDocument entries={entries} />
      </SheetContent>
    </Sheet>
  );
}
```

Render amber editor-only badges beside stale and fallback entries. Keep those badges outside the shared text passed to PDF.

- [ ] **Step 6: Run controller and preview tests**

Run: `bun --filter @biume/web test -- ReportPanelController.test.tsx ReportPreview.test.tsx`

Expected: PASS; only one report sheet is present for every panel state.

- [ ] **Step 7: Commit the single preview sheet**

```bash
git add apps/web/src/components/dashboard/pages/reports-module/components/ReportPanelController.tsx apps/web/src/components/dashboard/pages/reports-module/components/ReportPanelController.test.tsx apps/web/src/components/dashboard/pages/reports-module/components/OwnerPreparationSheet.tsx apps/web/src/components/dashboard/pages/reports-module/components/ReportPreview.tsx apps/web/src/components/dashboard/pages/reports-module/components/ReportPreview.test.tsx
git commit -m "feat(reports): move owner preview into a sheet"
```

### Task 7: Guided owner preparation sheet

**Files:**
- Modify: `apps/web/src/components/dashboard/pages/reports-module/components/OwnerPreparationSheet.tsx`
- Create: `apps/web/src/components/dashboard/pages/reports-module/components/OwnerPreparationSheet.test.tsx`
- Modify: `apps/web/src/hooks/useVulgarisationAgent.ts`
- Modify: `apps/web/src/server/ai/vulgarisation.ts`
- Modify: `apps/web/src/components/dashboard/pages/reports-module/components/AddObservationsDialog.tsx`
- Modify: `apps/web/src/components/dashboard/pages/reports-module/components/AddAnatomicalIssueDialog.tsx`
- Modify: `apps/web/src/routes/dashboard/settings.tsx`
- Delete: `apps/web/src/components/ai/VulgarisationPanel.tsx`

**Interfaces:**
- Consumes: `OwnerSourceItem[]`, `OwnerContentRecord[]`, `upsertReportOwnerContent`, and the existing `/api/vulgarisation` stream.
- Produces: a guided queue with generation, manual editing, validation, skip, retry, unsaved-close confirmation, and completion state.

- [ ] **Step 1: Write failing guided-flow component tests**

Mock `useVulgarisationAgent` so tests do not call the network.

```tsx
// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { OwnerPreparationSheet } from "./OwnerPreparationSheet";

const sendMessage = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));
const agentState = vi.hoisted(() => ({
  messages: [],
  isLoading: false,
  error: null as Error | null,
  sendMessage,
  reset: vi.fn(),
}));

vi.mock("@/hooks/useVulgarisationAgent", () => ({
  useVulgarisationAgent: () => agentState,
}));

const first = {
  key: "observation:obs_01",
  sourceKind: "observation" as const,
  sourceId: "obs_01",
  section: "clinical" as const,
  professionalText: "Restriction gléno-humérale",
  context: "Épaule gauche",
  fingerprint: "one",
  order: 0,
  status: "missing" as const,
};
const second = {
  key: "notes:notes",
  sourceKind: "notes" as const,
  sourceId: "notes",
  section: "notes" as const,
  professionalText: "Surveillance",
  context: "Notes",
  fingerprint: "two",
  order: 1,
  status: "missing" as const,
};

describe("OwnerPreparationSheet", () => {
  beforeEach(() => {
    agentState.error = null;
    sendMessage.mockClear();
  });

  test("validates an editable proposal and advances", async () => {
    const onSave = vi.fn().mockResolvedValue({ success: true });
    render(
      <OwnerPreparationSheet
        open
        onOpenChange={vi.fn()}
        reportId="report_01"
        queue={[first, second]}
        records={[]}
        onSave={onSave}
      />,
    );
    fireEvent.change(screen.getByLabelText("Version propriétaire"), {
      target: { value: "L’épaule gauche manque de mobilité." },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Valider et continuer" }),
    );
    await waitFor(() => expect(onSave).toHaveBeenCalledOnce());
    expect(screen.getByText("2 sur 2")).not.toBeNull();
  });

  test("keeps the proposal visible when saving fails", async () => {
    render(
      <OwnerPreparationSheet
        open
        onOpenChange={vi.fn()}
        reportId="report_01"
        queue={[first]}
        records={[]}
        onSave={vi.fn().mockRejectedValue(new Error("save failed"))}
      />,
    );
    fireEvent.change(screen.getByLabelText("Version propriétaire"), {
      target: { value: "Texte à conserver" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Valider et continuer" }),
    );
    expect(await screen.findByText("Enregistrement impossible")).not.toBeNull();
    expect(screen.getByDisplayValue("Texte à conserver")).not.toBeNull();
  });

  test("generates on demand and passes the focused source context", () => {
    render(
      <OwnerPreparationSheet
        open
        onOpenChange={vi.fn()}
        reportId="report_01"
        queue={[first]}
        records={[]}
        onSave={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Générer" }));
    expect(sendMessage).toHaveBeenCalledWith(
      "Restriction gléno-humérale",
      {
        reportId: "report_01",
        sourceKind: "observation",
        sourceContext: "Épaule gauche",
      },
    );
  });

  test("offers retry after generation failure", () => {
    agentState.error = new Error("generation failed");
    render(
      <OwnerPreparationSheet
        open
        onOpenChange={vi.fn()}
        reportId="report_01"
        queue={[first]}
        records={[]}
        onSave={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Réessayer" }));
    expect(sendMessage).toHaveBeenCalledOnce();
    expect(
      screen.getByLabelText("Version propriétaire").hasAttribute("disabled"),
    ).toBe(false);
  });

  test("skips without saving and confirms before closing an edited draft", () => {
    const onSave = vi.fn();
    render(
      <OwnerPreparationSheet
        open
        onOpenChange={vi.fn()}
        reportId="report_01"
        queue={[first, second]}
        records={[]}
        onSave={onSave}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Passer" }));
    expect(screen.getByText("2 sur 2")).not.toBeNull();
    expect(onSave).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText("Version propriétaire"), {
      target: { value: "Brouillon non enregistré" },
    });
    fireEvent.keyDown(document, { key: "Escape" });
    expect(
      screen.getByRole("button", { name: "Fermer sans enregistrer" }),
    ).not.toBeNull();
  });
});
```

- [ ] **Step 2: Run the preparation test and verify failure**

Run: `bun --filter @biume/web test -- OwnerPreparationSheet.test.tsx`

Expected: FAIL because the sheet does not yet render queue progress, the editable owner field, or validation controls.

- [ ] **Step 3: Extend the vulgarisation request with structured source context**

Add optional validated fields without breaking the existing panel:

```ts
const vulgarisationRequestSchema = z.object({
  messages: z.array(z.custom<UIMessage>()),
  reportId: z.string().optional(),
  sourceKind: z
    .enum([
      "consultationReason",
      "observation",
      "anatomicalIssue",
      "recommendation",
      "notes",
    ])
    .optional(),
  sourceContext: z.string().max(2_000).optional(),
});
```

Append source kind and context to the existing safety instructions, explicitly retaining “do not invent facts or diagnoses.” Extend `useVulgarisationAgent.sendMessage` to accept one options object containing `reportId`, `sourceKind`, and `sourceContext`.

- [ ] **Step 4: Implement focused queue state and save behavior**

```tsx
const [index, setIndex] = useState(() => {
  if (!initialSourceKey) return 0;
  const requested = queue.findIndex((item) => item.key === initialSourceKey);
  return requested >= 0 ? requested : 0;
});
const active = queue[index];
const existing = active
  ? records.find(
      (record) =>
        record.sourceKind === active.sourceKind &&
        record.sourceId === active.sourceId,
    )
  : undefined;
const [draft, setDraft] = useState(existing?.ownerText ?? "");
const [saveError, setSaveError] = useState<string | null>(null);

useEffect(() => {
  setDraft(existing?.ownerText ?? "");
  setSaveError(null);
}, [active?.key, existing?.ownerText]);

async function validateAndContinue() {
  if (!active || !draft.trim()) return;
  setSaveError(null);
  try {
    await onSave({
      reportId,
      sourceKind: active.sourceKind,
      sourceId: active.sourceId,
      ownerText: draft,
    });
    if (index < queue.length - 1) setIndex(index + 1);
    else setIndex(queue.length);
  } catch {
    setSaveError("Enregistrement impossible");
  }
}
```

The component renders the source read-only, an editable `Version propriétaire` textarea, `Générer` or `Régénérer`, `Valider et continuer`, and `Passer`. Copy the latest completed assistant text into `draft` without auto-saving it. When `index === queue.length`, render a concise success state and `Voir l’aperçu propriétaire`. A generation error renders `Réessayer` and leaves manual editing enabled.

- [ ] **Step 5: Add unsaved-close protection**

Track `draft !== existing?.ownerText` and intercept `onOpenChange(false)`. Show an existing Shadcn AlertDialog with `Continuer la préparation` and `Fermer sans enregistrer`. Already saved items stay persisted.

```tsx
const [confirmClose, setConfirmClose] = useState(false);
const hasUnsavedOwnerDraft = draft !== (existing?.ownerText ?? "");

function requestOpenChange(nextOpen: boolean) {
  if (!nextOpen && hasUnsavedOwnerDraft) {
    setConfirmClose(true);
    return;
  }
  onOpenChange(nextOpen);
}

<AlertDialog open={confirmClose} onOpenChange={setConfirmClose}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Fermer sans enregistrer ?</AlertDialogTitle>
      <AlertDialogDescription>
        La version propriétaire en cours de modification sera perdue.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Continuer la préparation</AlertDialogCancel>
      <AlertDialogAction
        onClick={() => {
          setConfirmClose(false);
          onOpenChange(false);
        }}
      >
        Fermer sans enregistrer
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

Pass `requestOpenChange` to the Sheet instead of the raw callback.

- [ ] **Step 6: Remove the competing professional-note vulgarisation drawers**

Remove `VulgarisationPanel` imports, state, triggers, and rendering from `AddObservationsDialog.tsx` and `AddAnatomicalIssueDialog.tsx`. This prevents owner wording from being inserted back into professional notes. Delete the now-unused generic panel after `rg -n "VulgarisationPanel" apps/web/src` returns only its own declaration. In settings, replace “vulgarisation automatique” with “préparation à la demande des versions destinées aux propriétaires.”

```tsx
<p className="mt-2 text-sm leading-6 text-slate-600">
  Activez la préparation à la demande des versions destinées aux
  propriétaires lorsque votre plan le permet.
</p>
```

Run `rg -n "VulgarisationPanel" apps/web/src` after removing both dialog integrations, then delete `apps/web/src/components/ai/VulgarisationPanel.tsx` only when the command returns that declaration as the sole remaining match.

- [ ] **Step 7: Run preparation and AI server tests**

Run: `bun --filter @biume/web test -- OwnerPreparationSheet.test.tsx && bun run check-types`

Expected: PASS; generation errors and save errors stay local to the sheet.

- [ ] **Step 8: Commit guided preparation**

```bash
git add apps/web/src/components/dashboard/pages/reports-module/components/OwnerPreparationSheet.tsx apps/web/src/components/dashboard/pages/reports-module/components/OwnerPreparationSheet.test.tsx apps/web/src/components/dashboard/pages/reports-module/components/AddObservationsDialog.tsx apps/web/src/components/dashboard/pages/reports-module/components/AddAnatomicalIssueDialog.tsx apps/web/src/hooks/useVulgarisationAgent.ts apps/web/src/server/ai/vulgarisation.ts apps/web/src/routes/dashboard/settings.tsx apps/web/src/components/ai/VulgarisationPanel.tsx
git commit -m "feat(reports): add guided owner preparation"
```

### Task 8: Navigation, workspace integration, and non-blocking finalization

**Files:**
- Create: `apps/web/src/components/dashboard/pages/reports-module/components/ReportWorkspaceHeader.tsx`
- Create: `apps/web/src/components/dashboard/pages/reports-module/components/OwnerPreparationWarningDialog.tsx`
- Create: `apps/web/src/components/dashboard/pages/reports-module/components/OwnerPreparationWarningDialog.test.tsx`
- Modify: `apps/web/src/components/dashboard/pages/reports-module/components/ReportSidebarNavigation.tsx`
- Modify: `apps/web/src/components/dashboard/pages/reports-module/components/ReportSidebarNavigation.test.tsx`
- Modify: `apps/web/src/components/dashboard/pages/reports-module/reports-editor.tsx`
- Modify: `apps/web/src/components/dashboard/pages/reports-module/reports-editor.helpers.ts`
- Modify: `apps/web/src/components/dashboard/pages/reports-module/reports-editor.helpers.test.ts`

**Interfaces:**
- Consumes: owner sources, records, derived statuses, `ReportPanelState`, current editor state, save mutation, and current finalization flow.
- Produces: 18rem purple navigation, full-width active workspace, one panel controller, responsive section selector, and warning-only finalization.

- [ ] **Step 1: Update sidebar tests before implementation**

Use four tabs in `defaultProps` and assert exact labels plus semantics:

```tsx
test("keeps professional jargon and exposes owner preparation states", () => {
  render(
    <ReportSidebarNavigation
      {...defaultProps}
      tabs={[
        { id: "clinical", label: "Observations", count: 2 },
        { id: "anatomical", label: "Anatomie", count: 1 },
        { id: "recommendations", label: "Recommandations", count: 1 },
        { id: "notes", label: "Notes additionnelles", count: 1 },
      ]}
      ownerStatuses={{
        clinical: "stale",
        anatomical: "ready",
        recommendations: "missing",
        notes: "ready",
      }}
      pendingOwnerCount={2}
      onPrepareOwnerContent={vi.fn()}
    />,
  );
  expect(screen.getByText("Observations")).not.toBeNull();
  expect(screen.getByText("Anatomie")).not.toBeNull();
  expect(screen.getByText("Recommandations")).not.toBeNull();
  expect(screen.getByText("Notes additionnelles")).not.toBeNull();
  expect(screen.getByText("2 contenus à préparer")).not.toBeNull();
  expect(screen.getAllByText("Prêt")).toHaveLength(2);
  expect(screen.getByText("À actualiser")).not.toBeNull();
  expect(screen.getByText("À préparer")).not.toBeNull();
});
```

- [ ] **Step 2: Write the failing finalization-warning tests**

```tsx
// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { OwnerPreparationWarningDialog } from "./OwnerPreparationWarningDialog";

describe("OwnerPreparationWarningDialog", () => {
  test("offers preparation without blocking explicit finalization", () => {
    const onPrepare = vi.fn();
    const onFinalize = vi.fn();
    render(
      <OwnerPreparationWarningDialog
        open
        missingCount={2}
        staleCount={1}
        onOpenChange={vi.fn()}
        onPrepare={onPrepare}
        onFinalize={onFinalize}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Préparer maintenant" }));
    expect(onPrepare).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole("button", { name: "Finaliser quand même" }));
    expect(onFinalize).toHaveBeenCalledOnce();
  });
});
```

- [ ] **Step 3: Run sidebar and warning tests and verify failure**

Run: `bun --filter @biume/web test -- ReportSidebarNavigation.test.tsx OwnerPreparationWarningDialog.test.tsx`

Expected: FAIL because the new props and warning component do not exist.

- [ ] **Step 4: Redesign the sidebar and extract the workspace header**

Move report title, patient summary, appointment details, preview, save, and finalization actions to `ReportWorkspaceHeader`. Make the expanded sidebar `w-72` and the collapsed rail `w-[72px]`. Use `bg-primary`, `text-primary-foreground`, `ring-primary`, and token-based neutral surfaces; do not hardcode a competing accent.

The sidebar receives a flat `tabs` list, professional completion, owner status, pending count, and preparation callback. Render green `Prêt`, amber `À préparer`/`À actualiser`, and a bottom purple queue action. Keep direct navigation and collapse behavior.

```tsx
type ReportWorkspaceHeaderProps = {
  title: string;
  onTitleChange: (title: string) => void;
  patientSummary: string;
  appointment?: { beginAt: Date; endAt: Date };
  onPreview: () => void;
  onSave: () => void;
  onFinalize: () => void;
  isSaving: boolean;
};

function getReportDesktopGridClassName(isSidebarCollapsed: boolean) {
  return cn(
    "grid h-full w-full gap-5 p-4 transition-[grid-template-columns] duration-200",
    isSidebarCollapsed
      ? "grid-cols-[72px_minmax(0,1fr)]"
      : "grid-cols-[18rem_minmax(0,1fr)]",
  );
}
```

Use `getReportDesktopGridClassName(isSidebarCollapsed)` on the existing desktop shell, render `ReportWorkspaceHeader` as the first row of the existing main element, and keep the current four active-tab bodies unchanged in its second row.

- [ ] **Step 5: Implement the finalization warning dialog**

```tsx
export function OwnerPreparationWarningDialog({
  open,
  missingCount,
  staleCount,
  onOpenChange,
  onPrepare,
  onFinalize,
}: {
  open: boolean;
  missingCount: number;
  staleCount: number;
  onOpenChange: (open: boolean) => void;
  onPrepare: () => void;
  onFinalize: () => void;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Préparation propriétaire incomplète</AlertDialogTitle>
          <AlertDialogDescription>
            {missingCount} contenu(s) à préparer et {staleCount} à actualiser.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button variant="outline" onClick={onPrepare}>
            Préparer maintenant
          </Button>
          <Button onClick={onFinalize}>Finaliser quand même</Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

- [ ] **Step 6: Integrate derived owner state and the single panel into the editor**

Replace `showPreview` and `isLivePreviewOpen` with one state:

```tsx
type ReportData = InferSelectModel<typeof advancedReport> & {
  patient?: Pet;
  anatomicalIssues?: AnatomicalIssueSchema[];
  recommendations?: AdvancedReportRecommendations[];
  ownerContents?: OwnerContentRecord[];
  appointment?: Appointment | null;
};

const [panelState, setPanelState] = useState<ReportPanelState>({
  type: "closed",
});
const [ownerContents, setOwnerContents] = useState<OwnerContentRecord[]>(
  initialData.ownerContents ?? [],
);
const ownerSources = useMemo(
  () =>
    buildOwnerSourceItems({
      reportId,
      consultationReason,
      observations,
      anatomicalIssues,
      recommendations,
      notes,
    }),
  [
    reportId,
    consultationReason,
    observations,
    anatomicalIssues,
    recommendations,
    notes,
  ],
);
const ownerQueue = useMemo(
  () => buildOwnerPreparationQueue(ownerSources, ownerContents),
  [ownerSources, ownerContents],
);
const ownerDocument = useMemo(
  () => buildOwnerReportViewModel(ownerSources, ownerContents),
  [ownerSources, ownerContents],
);
const ownerPreviewEntries = ownerSources.map((source) => {
  const resolved = ownerDocument.byKey[source.key]!;
  const labels: Record<OwnerSourceKind, string> = {
    consultationReason: "Motif de consultation",
    observation: "Observation",
    anatomicalIssue: "Point anatomique",
    recommendation: "Recommandation",
    notes: "Note additionnelle",
  };
  return {
    key: source.key,
    label: labels[source.sourceKind],
    text: resolved.text,
    status: resolved.status,
    usedFallback: resolved.usedFallback,
  };
});
```

Before opening preparation from changed professional content, call the existing draft save and continue only when it returns success. Change `handleUpdateReport` to return `Promise<boolean>` and preserve current toasts. On owner save success, replace the matching record in local state and invalidate `['reports', 'detail', reportId]`.

The desktop grid is `18rem minmax(0,1fr)` or `72px minmax(0,1fr)` and never reserves a permanent preview column. Keep `AnatomicalEvaluationTab` mounted in the full central workspace when active. On mobile, render a compact section selector with the same four labels and make the report sheet full-screen.

- [ ] **Step 7: Wire non-blocking finalization**

If the queue is empty, continue the existing reminder/finalization flow. If owner items are missing or stale, open `OwnerPreparationWarningDialog`. `Préparer maintenant` opens `{ type: "owner-preparation" }`; `Finaliser quand même` calls the existing finalization action unchanged.

```tsx
const missingOwnerCount = ownerQueue.filter(
  (item) => item.status === "missing",
).length;
const staleOwnerCount = ownerQueue.filter(
  (item) => item.status === "stale",
).length;

function handleFinalizeRequest() {
  if (missingOwnerCount === 0 && staleOwnerCount === 0) {
    handleOpenReminderDialog();
    return;
  }
  setIsOwnerWarningOpen(true);
}

<OwnerPreparationWarningDialog
  open={isOwnerWarningOpen}
  missingCount={missingOwnerCount}
  staleCount={staleOwnerCount}
  onOpenChange={setIsOwnerWarningOpen}
  onPrepare={() => {
    setIsOwnerWarningOpen(false);
    setPanelState({ type: "owner-preparation" });
  }}
  onFinalize={() => {
    setIsOwnerWarningOpen(false);
    handleOpenReminderDialog();
  }}
/>
```

- [ ] **Step 8: Run navigation, finalization, panel, and editor helper tests**

Run: `bun --filter @biume/web test -- ReportSidebarNavigation.test.tsx OwnerPreparationWarningDialog.test.tsx ReportPanelController.test.tsx reports-editor.helpers.test.ts`

Expected: PASS; no live preview column or nested report sheets remain.

- [ ] **Step 9: Commit the integrated report workspace**

```bash
git add apps/web/src/components/dashboard/pages/reports-module/components/ReportWorkspaceHeader.tsx apps/web/src/components/dashboard/pages/reports-module/components/OwnerPreparationWarningDialog.tsx apps/web/src/components/dashboard/pages/reports-module/components/OwnerPreparationWarningDialog.test.tsx apps/web/src/components/dashboard/pages/reports-module/components/ReportSidebarNavigation.tsx apps/web/src/components/dashboard/pages/reports-module/components/ReportSidebarNavigation.test.tsx apps/web/src/components/dashboard/pages/reports-module/reports-editor.tsx apps/web/src/components/dashboard/pages/reports-module/reports-editor.helpers.ts apps/web/src/components/dashboard/pages/reports-module/reports-editor.helpers.test.ts
git commit -m "feat(reports): integrate owner preparation workspace"
```

### Task 9: Anatomy guard, responsive verification, and final quality pass

**Files:**
- Create: `apps/web/src/components/dashboard/pages/reports-module/components/anatomy-invariants.test.ts`
- Modify only if a failing behavioral test requires it: report-owner components created in Tasks 5-8.

**Interfaces:**
- Consumes: the completed report workspace.
- Produces: executable anatomy invariants and evidence that the complete slice builds and behaves correctly.

- [ ] **Step 1: Write the anatomy source invariant test before any layout polish**

```ts
import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";

const evaluationSource = readFileSync(
  new URL("./tabs/AnatomicalEvaluationTab.tsx", import.meta.url),
  "utf8",
);
const visualizationSource = readFileSync(
  new URL("./AnatomicalVisualization.tsx", import.meta.url),
  "utf8",
);
const overlaySource = readFileSync(
  new URL("./AnatomicalImageWithOverlay.tsx", import.meta.url),
  "utf8",
);

describe("anatomy rendering invariants", () => {
  test("keeps the calibrated coordinate system in both renderers", () => {
    expect(evaluationSource).toContain('viewBox="0 0 500 380"');
    expect(visualizationSource).toContain('viewBox="0 0 500 380"');
    expect(evaluationSource).toContain(
      'preserveAspectRatio="xMidYMid meet"',
    );
    expect(visualizationSource).toContain(
      'preserveAspectRatio="xMidYMid meet"',
    );
  });

  test("keeps image and overlay in the same positioned wrapper", () => {
    expect(overlaySource).toContain("max-w-5xl mx-auto relative");
    expect(overlaySource).toContain("object-contain w-full h-auto");
    expect(evaluationSource).toContain(
      "absolute top-0 left-0 w-full h-full pointer-events-none",
    );
  });
});
```

- [ ] **Step 2: Run the focused report suite**

Run: `bun --filter @biume/web test -- owner-content.test.ts owner-content.persistence.test.ts owner-report-view-model.test.ts reports.persistence.test.ts ReportSidebarNavigation.test.tsx ReportPanelController.test.tsx ReportPreview.test.tsx OwnerPreparationSheet.test.tsx OwnerPreparationWarningDialog.test.tsx ReportPDF.helpers.test.ts anatomy-invariants.test.ts`

Expected: PASS with no snapshot update that changes anatomy markup.

- [ ] **Step 3: Run database tests, workspace type checks, and the web build**

Run: `bun --filter @biume/db test && bun run check-types && bun --filter @biume/web build`

Expected: all commands exit 0. If the build exposes an unrelated pre-existing failure, record its exact command and output separately; do not suppress or bypass it.

- [ ] **Step 4: Start the web app and verify the desktop workflow**

Run: `bun run dev:web`

Expected manual checks at the report edit route:

- expanded navigation is 18rem and uses the Biume purple active state;
- the four labels match professional jargon exactly;
- patient/date/title appear in the workspace header, not duplicated in navigation;
- anatomy uses the full central workspace and all stored zones align in left and right views;
- no permanent owner preview column is visible;
- preview and preparation each occupy the same 32rem right-side sheet slot;
- opening one report sheet closes the other;
- guided validation advances through stale items before missing items;
- generation failure preserves existing and edited owner text;
- owner preview and PDF prefer owner text and fall back to professional text;
- finalization warns but `Finaliser quand même` remains available.

- [ ] **Step 5: Verify responsive and accessibility behavior**

At 390px, 768px, 1024px, and 1440px viewport widths, verify:

- no horizontal page overflow;
- section labels remain reachable;
- report sheets fill the viewport below the desktop breakpoint;
- Escape closes the active sheet when no unsaved owner draft exists;
- closing an edited owner draft asks for confirmation;
- focus returns to the invoking control;
- every icon-only control has an accessible name;
- focus rings use the primary token;
- reduced-motion mode removes nonessential queue transitions.

- [ ] **Step 6: Confirm anatomy data files are untouched**

Run: `git diff main -- packages/db/src/schema/anatomicalPart.ts apps/web/src/components/dashboard/pages/reports-module/data`

Expected: no output.

- [ ] **Step 7: Commit the final verification guard**

```bash
git add apps/web/src/components/dashboard/pages/reports-module/components/anatomy-invariants.test.ts
git commit -m "test(reports): protect anatomy and owner workflow"
```

- [ ] **Step 8: Review the final branch before PR creation**

Run: `git status --short --branch && git log --oneline main..HEAD && git diff --stat main...HEAD`

Expected: clean worktree; focused commits for domain, schema, stable IDs, persistence API, owner document, preview sheet, preparation sheet, workspace integration, and anatomy verification.
