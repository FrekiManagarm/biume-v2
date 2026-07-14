# Report Owner Sheet Experience Design

## Goal

Make report authoring the primary Biume product moment: professionals keep their familiar clinical vocabulary and workflow, while an on-demand guided flow turns the technical report into a clear owner-facing document without double entry.

The experience must feel fast, calm, and satisfying to complete. It must not change the anatomical coordinate system or any stored anatomical shape.

## Validated Product Decisions

- Keep the four professional navigation labels exactly as used during report writing:
  - `Observations`
  - `Anatomie`
  - `Recommandations`
  - `Notes additionnelles`
- Keep a redesigned left navigation on desktop.
- Use the existing Biume purple as the primary accent for navigation, progress, and actions.
- Reserve green for content that is ready or validated and amber for content that needs preparation or refresh.
- Remove the permanent owner-preview column from the editor.
- Open the owner preview on demand in a right-side sheet.
- Use the same right-side sheet slot for guided owner-text preparation. Preview and preparation are mutually exclusive and never nested.
- Generate owner-facing wording only when the professional requests it.
- Preserve professional text and owner-facing text as separate, persistent content.
- Treat missing or stale owner text as guidance, never as a finalization blocker.
- Keep the anatomy rendering ratio, view box, paths, and transforms unchanged.

## Information Architecture

### Desktop shell

The report editor uses three structural areas:

1. A narrow left navigation for the professional writing journey.
2. A main workspace dedicated to the active section.
3. One temporary right-side sheet for either owner preview or guided preparation.

The expanded navigation is 18rem wide, reduced from the current 20rem sidebar. Its collapsed width remains 72px. The main workspace takes all remaining width when no sheet is open.

Patient identity, appointment date, report title, save, preview, and finalization actions belong in the main header. They must not be repeated in the navigation.

### Mobile and tablet

Below the desktop breakpoint, the persistent sidebar becomes a compact section selector with progress and access to the complete section list. The professional labels remain unchanged. Owner preview and guided preparation become full-screen sheets.

### Active workspace

Each professional section owns the central workspace. Cards are used only for repeated report items or framed tools, not as wrappers around every layout region.

For `Anatomie`, the central area contains the anatomical silhouette and the zones list together. The owner-facing `Points observés` content appears only inside the temporary owner sheet, removing the permanent side-by-side duplication.

## Left Navigation

The navigation communicates a connected writing journey while preserving direct, non-linear access to every section.

Each entry includes:

- its exact professional label;
- its icon;
- an optional item count;
- a restrained status indicator;
- a clear purple active state.

Section status is derived from professional report content:

- `empty`: no meaningful content yet;
- `in-progress`: content exists but the section is not considered complete;
- `complete`: the professional section meets its completion rule.

Owner-preparation status is presented as a secondary signal:

- amber `À préparer` when owner text is missing;
- amber `À actualiser` when professional text changed after owner preparation;
- green `Prêt` when every applicable item in the section has current owner text.

The bottom of the expanded navigation contains a guided-queue action showing the number of owner-facing items still to prepare. It opens the preparation sheet on the first missing or stale item.

Navigation progress is helpful, not coercive. The professional may open sections in any order and finalize with owner-preparation warnings.

## Single Sheet Controller

The editor owns one discriminated panel state:

```ts
type ReportPanelState =
  | { type: "closed" }
  | { type: "owner-preview" }
  | { type: "owner-preparation"; sourceKey?: string };
```

This makes preview and preparation mutually exclusive by construction. Opening one replaces the other in the same right-side slot. The sheet targets 30-35rem on desktop, with 32rem as the default, and fills the viewport on mobile.

The sheet uses the shared Shadcn-style drawer or sheet primitives already present in the app. It traps focus, closes with Escape, restores focus to its trigger, and exposes an accessible title and description.

If the professional edited an owner-facing draft without saving it, closing or switching the sheet asks for confirmation. Already validated owner text is never lost.

## Owner Preview Sheet

The preview sheet assembles the document intended for the owner. It is a reading surface, not a second editing column.

For each applicable source item, rendering priority is:

1. current owner-facing text;
2. stale owner-facing text, visibly marked `À actualiser` in the editor preview;
3. professional source text as a clearly indicated fallback.

Fallback and staleness labels are editor-only metadata. They do not appear in the exported owner document.

The sheet includes section anchors for quick scanning and actions to:

- start or resume guided preparation;
- jump to the corresponding professional section;
- continue to the existing export/finalization flow.

It must not duplicate a permanently visible preview region in the workspace.

## Guided Owner-Text Preparation

Preparation is on demand and follows a guided queue.

Applicable source items are:

- consultation reason and observation notes;
- anatomical issue notes and their relevant structured context;
- recommendations;
- additional notes.

Empty source text does not enter the queue. The queue prioritizes stale items, then missing items, following the professional navigation order.

For the focused item, the sheet shows:

- section and queue position;
- the professional source in a read-only block;
- the generated or previously saved owner-facing text in an editable field;
- `Générer` or `Régénérer`;
- `Valider et continuer`;
- `Passer` without data loss.

Generation reuses the existing `/api/vulgarisation` capability and its medical-veterinary safety instructions. The request includes only the active source, its report context, and useful structured attributes. It must never invent diagnoses, treatment claims, or facts absent from the professional source.

Generation never overwrites professional text. Accepting an owner version persists it immediately and advances to the next pending item. The final item transitions to a concise completion state with direct access to owner preview. Lightweight check and progress transitions may use transform and opacity only.

## Persistence Model

Owner-facing content is normalized separately from professional report content.

Add a report-owned table named `reportOwnerContent` with:

- `id`;
- `reportId`, cascading when the report is deleted;
- `sourceKind`: consultation reason, observation, anatomical issue, recommendation, or notes;
- `sourceId`: the stable report-item identifier, or a canonical scalar key for report-level fields;
- `ownerText`;
- `sourceFingerprint`;
- `createdAt` and `updatedAt`;
- a unique constraint on `(reportId, sourceKind, sourceId)`.

The fingerprint is computed server-side from a canonical representation of the professional source used for generation. For anatomical items, that representation includes the displayed region, laterality, severity, type, and notes. A fingerprint mismatch means `stale`; no owner record means `missing`; a match means `ready`.

Observations, anatomical issues, and recommendations already carry client-side IDs. Report persistence must reuse those validated IDs instead of replacing them with new UUIDs on every save. This targeted change is required for stable owner-content association. When a professional item is deleted, its associated owner-content row is removed during the same authorized report-persistence operation.

All owner-content reads and writes must verify that the report belongs to the active organization.

## Data Flow

1. The editor loads professional report data and associated owner-content records.
2. A presentation helper builds normalized source items and derives `missing`, `stale`, or `ready` by comparing fingerprints.
3. Navigation counts, preview fallbacks, and the guided queue consume that same derived model so status cannot diverge between surfaces.
4. The professional requests generation for one source item.
5. The server validates access and streams an owner-facing proposal through the existing vulgarisation endpoint.
6. The professional edits and validates the proposal.
7. An upsert stores the owner text and current server-computed fingerprint.
8. TanStack Query updates or invalidates the report-detail owner-content query.
9. The queue advances and the preview immediately reflects the validated text.
10. A later professional edit changes the derived fingerprint and displays `À actualiser` without deleting the previous owner text.

The owner-content mutation is independent from the AI stream. A failed generation cannot damage saved content, and a failed save keeps the editable proposal in the sheet for retry.

## Finalization

Finalization remains possible when owner text is missing or stale.

When warnings exist, the finalization confirmation summarizes them and offers:

- `Préparer maintenant`, opening the guided queue;
- `Finaliser quand même`, continuing the existing finalization flow.

Professional completeness rules remain separate from owner-preparation status. The UI must not imply that AI-generated wording is medically validated until the professional explicitly accepts it.

## Failure and Recovery States

- Generation failure: keep the source, previous owner version, and current editor draft; show a local error and `Réessayer`.
- Owner-content save failure: keep the edited proposal locally and do not advance the queue until retry succeeds or the user explicitly skips.
- Report save failure: keep the existing unsaved-change behavior and do not discard owner content already persisted.
- Stale owner text: retain it, label it `À actualiser`, and allow comparison with the current professional source.
- Missing AI configuration or unavailable entitlement: keep manual owner-text editing available where product permissions allow it, explain why generation is unavailable, and never block the report.
- Sheet close with an unsaved owner draft: request confirmation.
- Preview fallback: clearly identify the professional fallback in the editor only.

Loading and error states stay inside the active sheet. They must not block navigation, report editing, or anatomical interaction.

## Visual Language and Interaction Quality

- Use the current Biume `primary` purple token (`hsl(251 73% 72%)`) for active navigation, primary progress, focus, and preparation actions.
- Use green only for `Prêt`, successful validation, and completed professional sections.
- Use amber for `À préparer` and `À actualiser`.
- Keep surfaces predominantly neutral and operational.
- Prefer one main action per sheet state.
- Use Lucide icons and existing shared components.
- Provide visible hover, pressed, loading, and focus states.
- Keep motion short and functional; animate only transform and opacity for queue advancement and validation feedback.
- Respect reduced-motion preferences.

The satisfying quality comes from momentum: a clear pending count, immediate validation feedback, automatic movement to the next useful item, and a finished owner-ready preview without double entry. It must not become gamification or visual noise.

## Anatomical Rendering Invariant

The anatomy feature is a protected subsystem for this redesign.

The implementation must preserve:

- SVG `viewBox="0 0 500 380"`;
- the existing image/SVG overlay relationship and aspect ratio;
- `preserveAspectRatio="xMidYMid meet"` behavior where currently used;
- all database-backed paths, view boxes, and transforms;
- side/laterality mapping;
- image intrinsic ratio and overlay positioning logic.

Layout changes may resize or reposition the outer workspace only. They must not introduce independent dimensions for the image and SVG, alter the internal coordinate system, normalize paths, or rewrite anatomical database data.

## Component Boundaries

Keep the route component focused and split report behavior into bounded units:

- `ReportSidebarNavigation`: professional navigation, progress, counts, and preparation summary trigger.
- `ReportWorkspaceHeader`: patient/appointment context and report-level actions.
- `ReportPanelController`: the single mutually exclusive sheet state.
- `OwnerReportPreviewSheet`: owner document reading surface and fallback indicators.
- `OwnerPreparationSheet`: guided queue, generation, editing, validation, and retry states.
- owner-content helpers: normalized source construction, canonical fingerprints, statuses, and queue ordering.
- owner-content server functions: authorized list and upsert operations.

Reuse the existing `OwnerReportPreview` document body inside `OwnerReportPreviewSheet`. Replace the generic `VulgarisationPanel` report integration with `OwnerPreparationSheet` while retaining the existing vulgarisation hook and endpoint. Extend the report editor helpers with source normalization, status derivation, and queue ordering. Avoid unrelated report-module refactors.

## Testing Strategy

### Unit tests

- fingerprint stability for equivalent canonical source data;
- `missing`, `stale`, and `ready` derivation;
- queue filtering and ordering;
- preview selection priority: current owner text, stale owner text, professional fallback;
- stable item-ID preservation in the report update payload and persistence mapping;
- finalization warning derivation.

### Component tests

- navigation labels remain exact and status indicators are accessible;
- only one report sheet can be open at a time;
- generation, edit, validation, next-item, skip, and retry behavior;
- unsaved owner-draft close confirmation;
- preview fallback and staleness metadata;
- mobile full-screen sheet rendering and close behavior.

### Anatomy regression tests

- assert the `0 0 500 380` view box;
- assert the image and overlay remain in the same positioning wrapper;
- assert no anatomical path or transform data changes as part of this feature;
- visually compare left and right anatomy views at representative desktop and mobile widths.

### Verification commands

Use the smallest commands that cover each implementation slice, followed by:

- `bun --filter @biume/web test` for report helpers and components;
- `bun run check-types` from the workspace root;
- `bun --filter @biume/web build` for the web application;
- route generation only if route files change.

Manual verification covers the four professional sections, collapsed and expanded navigation, preview sheet, guided preparation sheet, finalization warnings, mobile behavior, and anatomical alignment.

## Scope Boundaries

This slice includes the report editor navigation, single-sheet architecture, persistent owner-facing versions, guided on-demand preparation, preview fallback behavior, and required persistence changes.

It does not include:

- automatic background generation;
- blocking finalization on AI completion;
- changes to anatomical paths or database calibration;
- a new global AI assistant experience;
- unrelated report-list or marketing-page redesigns;
- new animation or styling libraries.

## Success Criteria

The design succeeds when a professional can:

1. write with the expected professional jargon and navigate directly between familiar sections;
2. keep the anatomical workflow visually aligned with all existing stored regions;
3. open owner preparation only when useful;
4. validate a sequence of clear owner-facing formulations without double entry;
5. return later and immediately see what is ready or stale;
6. inspect the final owner document without sacrificing permanent workspace width;
7. finalize even when owner preparation is incomplete.
