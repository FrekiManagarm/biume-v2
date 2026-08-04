# Mobile Capture and Synchronization Implementation Plan

> **For Codex:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` for inline execution or `superpowers:subagent-driven-development` for delegated execution. Complete tasks in order and stop at every verification gate.

**Goal:** Ship an iOS and Android alpha that lets an authenticated practitioner record a ten-minute dictation offline, encrypt it locally, and synchronize exactly one corresponding audio object to private Cloudflare R2.

**Architecture:** Add an Expo SDK 57 application under `apps/mobile`, pure capture contracts under `packages/contracts`, an additive capture table under `packages/db`, and a versioned HTTP boundary under `apps/web/src/routes/api/mobile/v1/$.ts`. The mobile owns recording, local encryption, SQLite queueing, and retries. The web backend owns identity, tenant resolution, object keys, signed uploads, confirmation, and expiry. The slice ends at `uploaded`; transcription and AI extraction remain outside this plan.

**Tech Stack:** Bun workspace, Expo SDK 57, React Native, Expo Router, Better Auth Expo, Expo Audio, Expo SQLite, Expo SecureStore, Expo FileSystem, Expo Network, `@noble/ciphers`, Zod, TanStack Start, Drizzle/PostgreSQL, AWS S3 client against Cloudflare R2, Trigger.dev, Vitest, Jest Expo, React Native Testing Library.

---

## Non-negotiable delivery rules

- Preserve the user's existing change in `apps/web/src/components/dashboard/pages/reports-module/data/cat/dataCat.ts` in the primary checkout. All work happens in `.worktrees/mobile-capture-sync` on `codex/mobile-capture-sync`.
- Use Bun for installs, scripts, and workspace commands. Do not add another lockfile.
- Target iOS and Android from the same Expo application.
- Pin the Expo application to SDK 57 and its compatible React/React Native versions inside `apps/mobile`; do not change the root React catalog to make mobile fit.
- Run `bunx expo install --check` and `bun why react react-native` after every native dependency batch. There must be one compatible React Native runtime in the mobile dependency graph.
- Capture AAC-LC mono in M4A at 64 kbit/s, stop automatically at 600,000 ms, and reject anything over 16 MiB server-side.
- Keep signed `PUT` URLs valid for 10 minutes, upload one capture at a time, move to `needs_action` after five consecutive failures, and expire audio after 24 hours.
- Never accept an organization identifier from the mobile. Resolve `practitionerId` and `organizationId` from the Better Auth session on every API operation.
- Keep the R2 bucket private. Do not add captures to UploadThing, expose R2 credentials, add public read URLs, multipart upload, or pause/resume recording.
- Encrypt local files with AES-256-GCM using a per-installation 256-bit key, a unique 96-bit nonce, and the capture UUID as AAD. Delete plaintext immediately after encryption.
- Do not add transcription, AI extraction, report editing, native Google login, or owner sharing.
- Telemetry may contain technical IDs, platform, app version, timing, size, state, and normalized error codes. It must reject personal, animal, clinical, signed-URL, and audio data.

## Delivery sequence and commits

Each task below produces one reviewable commit. Do not combine tasks to hide a failing gate. Before committing, run the task's focused tests and inspect `git diff --check` and `git status --short`.

### Task 1: Scaffold the Expo mobile workspace and prove toolchain compatibility

**Files:**

- Create: `apps/mobile/**` from the Expo SDK 57 default template
- Create: `apps/mobile/app.config.ts`
- Create: `apps/mobile/eas.json`
- Create: `apps/mobile/jest.config.cjs`
- Create: `apps/mobile/jest.setup.ts`
- Create: `apps/mobile/src/smoke.test.ts`
- Modify: `apps/mobile/package.json`
- Modify: `apps/mobile/tsconfig.json`
- Modify: `package.json`
- Modify: `turbo.json`
- Modify: `bun.lock` through Bun only

**Step 1: Create the SDK 57 app from the repository root**

```bash
bunx create-expo-app@latest apps/mobile --template default@sdk-57
```

Expected: Expo creates an app that is detected by the existing `apps/*` workspace. Remove only template demo screens and assets that are not referenced by the final shell; keep Expo-generated native configuration intact.

**Step 2: Install the platform and test dependencies with Expo-aware resolution**

Run these from `apps/mobile`. Bun 1.2.x does not support `bun --cwd <dir> x`, so invoke `bunx` inside the package directory rather than from the repository root.

```bash
bunx expo install expo-audio expo-crypto expo-file-system expo-network expo-secure-store expo-sqlite expo-background-task expo-task-manager
bun add @better-auth/expo@1.6.9 better-auth@1.6.9 '@biume/contracts@workspace:*' zod@^4.1.13 @noble/ciphers
bun add --dev jest@^29.7.0 jest-expo @testing-library/react-native @types/jest@^29.5.14
```

Expected: `bun.lock` changes once, no npm or pnpm lockfile appears, and Expo resolves compatible SDK 57 native packages. `expo install` will report that `expo-sqlite` and `expo-background-task` need plugin entries it cannot add to a dynamic config; add them by hand in Step 4.

**Step 3: Declare the mobile package and root commands**

Use this script surface in `apps/mobile/package.json`:

```json
{
  "name": "@biume/mobile",
  "private": true,
  "main": "expo-router/entry",
  "scripts": {
    "dev": "expo start",
    "ios": "expo run:ios",
    "android": "expo run:android",
    "test": "jest --runInBand",
    "test:watch": "jest --watch",
    "check-types": "tsc --noEmit"
  }
}
```

Add these root scripts to `package.json`:

```json
{
  "dev:mobile": "turbo -F @biume/mobile dev",
  "ios:mobile": "bun --filter @biume/mobile ios",
  "android:mobile": "bun --filter @biume/mobile android",
  "test:mobile": "bun --filter @biume/mobile test"
}
```

Add Expo public configuration to the `dev` environment in `turbo.json`:

```json
{
  "env": [
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
    "OPENAI_API_KEY",
    "EXPO_PUBLIC_API_URL"
  ]
}
```

**Step 4: Configure application identity and builds**

`apps/mobile/app.config.ts` must export one configuration with:

```ts
export default {
  expo: {
    name: "Biume",
    slug: "biume",
    scheme: "biume",
    version: "0.1.0",
    orientation: "portrait",
    ios: {
      bundleIdentifier: "com.biume.mobile",
      supportsTablet: false,
      infoPlist: {
        NSMicrophoneUsageDescription:
          "Biume utilise le microphone pour enregistrer votre dictée de séance.",
      },
    },
    android: {
      package: "com.biume.mobile",
      permissions: ["RECORD_AUDIO"],
    },
    plugins: [
      "expo-router",
      "expo-secure-store",
      [
        "expo-audio",
        {
          microphonePermission:
            "Biume utilise le microphone pour enregistrer votre dictée de séance.",
        },
      ],
    ],
    experiments: { typedRoutes: true },
  },
};
```

`apps/mobile/eas.json` must define `development`, `internal`, and `production`; `internal` uses `distribution: "internal"` and Android `buildType: "apk"`.

**Step 5: Add a failing smoke test before replacing the template shell**

```ts
import { mobileRuntime } from "./runtime";

describe("mobile runtime", () => {
  it("targets the capture alpha", () => {
    expect(mobileRuntime).toEqual({
      maxDurationMs: 600_000,
      maxBytes: 16 * 1024 * 1024,
      maxAutomaticFailures: 5,
      retentionMs: 24 * 60 * 60 * 1000,
    });
  });
});
```

Run:

```bash
bun --filter @biume/mobile test -- src/smoke.test.ts
```

Expected: FAIL because `src/runtime.ts` does not exist.

**Step 6: Add the minimal runtime constants**

Create `apps/mobile/src/runtime.ts`:

```ts
export const mobileRuntime = {
  maxDurationMs: 600_000,
  maxBytes: 16 * 1024 * 1024,
  maxAutomaticFailures: 5,
  retentionMs: 24 * 60 * 60 * 1000,
} as const;
```

Configure `jest-expo` in `jest.config.cjs`, keep `jest.setup.ts` as the single global setup file, and exclude `.worktrees` from Expo/Metro watch roots if the generated configuration needs an explicit Metro file.

**Toolchain constraints verified while executing this task. Do not relitigate them in later tasks:**

- Pin `jest` to `^29.7.0`. `jest-expo@57` depends on the Jest 29 packages (`@jest/globals`, `babel-jest`, `jest-snapshot`, `jest-environment-jsdom` at `^29.2.1`). Installing Jest 30 mixes runtimes and every suite fails to run with `this._moduleMocker.clearMocksOnScope is not a function`.
- `@testing-library/react-native` v14 removed the `extend-expect` entry point. Its matchers register automatically when a test file imports the library, so `jest.setup.ts` needs no import for them.
- `@testing-library/react-native` v14 made `render` **asynchronous**. Every component test in Tasks 7, 8, and 9 must `await render(...)` and then query through `screen`; the v13 style of destructuring queries from the `render` return value no longer works.
- Pin `@better-auth/expo` to the same `1.6.9` as `better-auth`. Later `@better-auth/expo` releases declare a peer on a newer `better-auth` than the root catalog provides.
- Add `"expo/types"` to `compilerOptions.types` in `apps/mobile/tsconfig.json`. `expo-env.d.ts` supplies the `*.css` module declaration needed by `src/constants/theme.ts`, but it is generated and git-ignored, so `check-types` fails in a clean checkout without the explicit reference.
- `expo-sqlite` and `expo-background-task` must be listed in the `plugins` array of `app.config.ts`; `expo install` reports this and cannot write it to a dynamic config itself.
- No `metro.config.js` is required. Expo SDK 57's default Metro config resolves this Bun workspace on its own, confirmed by a successful `expo export --platform ios`.
- `expo-doctor` reports one expected failure: `react` and `react-dom` resolve to `19.2.3` under `apps/mobile` and `19.2.7` at the repository root. That is the direct result of the rule forbidding a root catalog change, and `react-native` still resolves to exactly one runtime. Do not "fix" it by touching the catalog.

**Step 7: Verify SDK and Better Auth compatibility before continuing**

```bash
bun --filter @biume/mobile test -- src/smoke.test.ts
bun --filter @biume/mobile check-types
bun --cwd apps/mobile x expo install --check
bun why react react-native
bun run check-types
```

Expected: smoke test and type checks pass; Expo reports no incompatible packages; the mobile app resolves SDK 57's React Native and does not force a root catalog downgrade. If `@better-auth/expo` reports a peer incompatibility, resolve to the newest official package version supporting SDK 57 and rerun this entire gate before Task 2.

**Step 8: Commit**

```bash
git add package.json turbo.json bun.lock apps/mobile
git commit -m "feat(mobile): scaffold Expo capture app"
```

### Task 2: Define canonical capture, agenda, API-error, and telemetry contracts

**Files:**

- Create: `packages/contracts/src/capture.ts`
- Create: `packages/contracts/src/capture.test.ts`
- Modify: `packages/contracts/src/index.ts`
- Modify: `packages/contracts/package.json`
- Modify: `packages/contracts/src/product-events.ts`
- Modify: `packages/contracts/src/product-events.test.ts`

**Step 1: Write failing contract tests**

Cover these exact cases in `capture.test.ts`:

```ts
expect(createCaptureRequestSchema.safeParse(validCapture).success).toBe(true);
expect(createCaptureRequestSchema.safeParse({ ...validCapture, durationMs: 600_001 }).success).toBe(false);
expect(createCaptureRequestSchema.safeParse({ ...validCapture, byteSize: 16 * 1024 * 1024 + 1 }).success).toBe(false);
expect(createCaptureRequestSchema.safeParse({ ...validCapture, organizationId: "attacker-org" }).success).toBe(false);
expect(canTransitionServerCapture("pending_upload", "uploaded")).toBe(true);
expect(canTransitionServerCapture("cancelled", "uploaded")).toBe(false);
expect(mobileApiErrorSchema.safeParse({ code: "network", message: "x", ownerEmail: "x@y.fr" }).success).toBe(false);
```

Extend `product-events.test.ts` to prove capture events accept `platform`, `appVersion`, `byteSize`, `durationMs`, `journeyType`, and normalized errors while rejecting `patientName`, `appointmentNote`, `signedUrl`, and free text.

Run:

```bash
bun --filter @biume/contracts test -- src/capture.test.ts src/product-events.test.ts
```

Expected: FAIL because capture exports and mobile-safe telemetry properties do not exist.

**Step 2: Implement the pure schemas and transition table**

`capture.ts` must export these canonical constants and schemas:

```ts
export const captureMimeType = "audio/mp4" as const;
export const captureMaxDurationMs = 600_000;
export const captureMaxBytes = 16 * 1024 * 1024;
export const captureUploadUrlTtlSeconds = 600;
export const captureRetentionMs = 24 * 60 * 60 * 1000;

export const serverCaptureStatuses = [
  "pending_upload",
  "uploading",
  "uploaded",
  "retryable_failure",
  "cancelled",
  "expired",
] as const;

export const localCaptureStatuses = [
  "recording",
  "review",
  "queued",
  "uploading",
  "uploaded",
  "needs_action",
  "cancelled",
  "expired",
] as const;
```

Define strict Zod schemas and inferred types for:

- `CreateCaptureRequest`: UUID `id`, nullable `appointmentId`, `durationMs`, literal `audio/mp4`, bounded `byteSize`, lowercase 64-character `sha256`, ISO `createdAt`.
- `CaptureResponse`: client metadata plus server-owned `organizationId`, `practitionerId`, nullable `patientId` and `reportId`, opaque `objectKey`, server status/timestamps, attempt count, and nullable error code.
- `UploadSessionResponse`: literal `PUT`, signed URL, exact required headers, ISO expiry.
- `CompleteCaptureRequest`: non-empty ETag.
- `MobileSessionResponse`: user ID, active organization summary or `null`, and `canUploadCaptures`.
- `MobileAppointment`: appointment ID, patient ID/name, animal type, begin/end timestamps, and appointment status; omit owner contact data and notes.
- `MobileAppointmentsResponse`: bounded items, nullable cursor.
- `MobileCapturesResponse`: items and nullable cursor.
- `MobileApiError`: normalized code, safe localized message, retryable boolean, optional ISO retry time; `.strict()`.

Implement `canTransitionServerCapture(from, to)` with an explicit record:

```ts
const allowedServerTransitions = {
  pending_upload: ["uploading", "cancelled", "expired"],
  uploading: ["uploaded", "retryable_failure", "cancelled", "expired"],
  retryable_failure: ["uploading", "cancelled", "expired"],
  uploaded: ["expired"],
  cancelled: [],
  expired: [],
} as const;
```

Export `./capture` from `packages/contracts/package.json` and `src/index.ts`.

Update product-event sources with `mobile_appointment` and `mobile_free_capture`; add only the safe properties enumerated by the tests.

**Step 3: Verify contracts**

```bash
bun --filter @biume/contracts test
bun --filter @biume/contracts check-types
```

Expected: all contract tests pass and package types compile without framework imports.

**Step 4: Commit**

```bash
git add packages/contracts
git commit -m "feat(contracts): define mobile capture protocol"
```

### Task 3: Persist tenant-scoped capture state with an additive migration

**Files:**

- Create: `packages/db/src/schema/audioCapture.ts`
- Create: `packages/db/src/schema/audio-capture.test.ts`
- Modify: `packages/db/src/schema/index.ts`
- Create: `packages/db/src/migrations/0004_*.sql` through Drizzle generation
- Modify: `packages/db/src/migrations/meta/_journal.json` through Drizzle generation
- Create: `packages/db/src/migrations/meta/0004_snapshot.json` through Drizzle generation

**Step 1: Write failing schema-shape tests**

Test that:

- the table name is `audio_capture`;
- `id` is the client UUID primary key;
- `organizationId`, `practitionerId`, `durationMs`, `mimeType`, `byteSize`, `sha256`, `objectKey`, `status`, `attemptCount`, `createdAt`, and `expiresAt` are non-null;
- appointment, patient, and report foreign keys use `onDelete: "set null"`;
- organization and practitioner use `onDelete: "cascade"`;
- `objectKey` has a unique index;
- `(organizationId, createdAt, id)` and `(status, expiresAt)` have named indexes;
- the enum values equal `serverCaptureStatuses` from contracts.

Run:

```bash
bun --filter @biume/db test -- src/schema/audio-capture.test.ts
```

Expected: FAIL because the schema does not exist.

**Step 2: Add the Drizzle schema**

Implement `audioCapture` with these columns:

```ts
{
  id: uuid("id").primaryKey(),
  organizationId: text("organization_id").notNull(),
  practitionerId: text("practitioner_id").notNull(),
  appointmentId: text("appointment_id"),
  patientId: text("patient_id"),
  reportId: text("report_id"),
  durationMs: integer("duration_ms").notNull(),
  mimeType: text("mime_type").notNull(),
  byteSize: integer("byte_size").notNull(),
  sha256: text("sha256").notNull(),
  objectKey: text("object_key").notNull(),
  objectEtag: text("object_etag"),
  status: audioCaptureStatus("status").notNull().default("pending_upload"),
  attemptCount: integer("attempt_count").notNull().default(0),
  lastErrorCode: text("last_error_code"),
  createdAt: timestamp("created_at", { mode: "date" }).notNull(),
  uploadedAt: timestamp("uploaded_at", { mode: "date" }),
  expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
  purgedAt: timestamp("purged_at", { mode: "date" }),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
}
```

Use database checks for positive duration and size, the ten-minute duration ceiling, the 16 MiB size ceiling, SHA-256 shape, and `audio/mp4`. Export relations and inferred select/insert types. Export the schema from `packages/db/src/schema/index.ts`.

**Step 3: Generate and inspect the migration**

```bash
bun run db:generate
```

Expected: one `0004_*.sql`, one snapshot, and one journal entry. Inspect the SQL and confirm it only creates the enum, table, checks, indexes, and foreign keys. It must not drop or rewrite lot-1 tables.

**Step 4: Verify schema and migration metadata**

```bash
bun --filter @biume/db test
bun run check-types
git diff -- packages/db/src/migrations
```

Expected: all database tests pass and migration `0004` is additive.

**Step 5: Commit**

```bash
git add packages/db
git commit -m "feat(db): persist mobile audio captures"
```

### Task 4: Implement the capture domain service and private R2 adapter

**Files:**

- Create: `apps/web/src/server/mobile/audio-object-store.ts`
- Create: `apps/web/src/server/mobile/r2-audio-object-store.ts`
- Create: `apps/web/src/server/mobile/r2-audio-object-store.test.ts`
- Create: `apps/web/src/server/mobile/capture.repository.ts`
- Create: `apps/web/src/server/mobile/capture.service.ts`
- Create: `apps/web/src/server/mobile/capture.service.test.ts`
- Modify: `apps/web/package.json`
- Modify: `packages/env/src/server.ts`
- Modify: `apps/web/.env.example`
- Modify: `turbo.json`
- Modify: `bun.lock` through Bun only

**Step 1: Write failing service tests around ports**

Define fakes for a repository, clock, object-key hasher, and object store. Tests must prove:

1. identical `(id, sha256, durationMs, byteSize, mimeType, appointmentId)` returns the existing capture;
2. the same ID with different metadata throws `capture_identity_conflict`;
3. appointment lookup is scoped by the session organization and fills patient/report only from that row;
4. free capture accepts no appointment;
5. object keys follow `captures/<organization-hash>/<capture-id>/audio.m4a` and never include raw organization IDs;
6. upload-session renewal keeps the capture and object key unchanged;
7. confirmation calls `HEAD` and checks key, ETag, content type, byte size, and SHA metadata before `uploaded`;
8. missing or mismatched objects remain recoverable and never become `uploaded`;
9. cancelled and expired captures reject completion;
10. cancellation and purge are idempotent and tenant-scoped.

Run:

```bash
bun --filter @biume/web test -- src/server/mobile/capture.service.test.ts
```

Expected: FAIL because the service and ports do not exist.

**Step 2: Define the storage port and domain dependencies**

`audio-object-store.ts` must expose:

```ts
export type ExpectedAudioObject = {
  key: string;
  contentType: "audio/mp4";
  byteSize: number;
  sha256: string;
};

export interface AudioObjectStore {
  createPutUrl(input: ExpectedAudioObject & { expiresInSeconds: 600 }): Promise<{
    url: string;
    headers: Record<string, string>;
    expiresAt: Date;
  }>;
  head(key: string): Promise<{
    etag: string;
    contentType: string | undefined;
    byteSize: number | undefined;
    metadata: Record<string, string>;
  } | null>;
  delete(key: string): Promise<void>;
}
```

The service constructor receives explicit ports:

```ts
type CaptureServiceDependencies = {
  repository: CaptureRepository;
  objectStore: AudioObjectStore;
  now: () => Date;
  hashOrganizationId: (organizationId: string) => string;
};
```

Keep session context separate from request input:

```ts
type CaptureActor = {
  practitionerId: string;
  organizationId: string;
};
```

**Step 3: Implement the Drizzle repository and domain service**

Every repository query that reads, updates, cancels, or purges one capture must include both `id` and `organizationId`. Creation uses the client UUID and handles a primary-key race by rereading and comparing the canonical fingerprint. Confirmation updates with a status predicate so a late completion cannot revive `cancelled` or `expired`.

Define normalized domain errors as codes from `MobileApiError`; do not throw raw database or S3 error messages across the HTTP boundary.

**Step 4: Add R2 dependencies and typed environment variables**

```bash
bun add --cwd apps/web @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

Add required server variables:

```ts
R2_ACCOUNT_ID: z.string().min(1),
R2_ACCESS_KEY_ID: z.string().min(1),
R2_SECRET_ACCESS_KEY: z.string().min(1),
R2_AUDIO_BUCKET: z.string().min(1),
MOBILE_TRUSTED_ORIGINS: z.string().default("biume://"),
```

Document empty examples in `apps/web/.env.example` and add all five names to the `build` and relevant `dev` env arrays in `turbo.json`.

**Step 5: Implement and test the R2 adapter**

Create the S3 client with endpoint `https://${accountId}.r2.cloudflarestorage.com`, region `auto`, and explicit credentials. `createPutUrl` must create only `PutObjectCommand` with:

```ts
{
  Bucket: bucket,
  Key: expected.key,
  ContentType: "audio/mp4",
  ContentLength: expected.byteSize,
  Metadata: { sha256: expected.sha256 },
}
```

Sign with `expiresIn: 600`. The adapter tests mock `S3Client.send` and the presigner to assert command type, bucket, key, metadata, TTL, no ACL, and no public read URL. Test `HeadObjectCommand` normalization and idempotent `DeleteObjectCommand`.

Run:

```bash
bun --filter @biume/web test -- src/server/mobile/capture.service.test.ts src/server/mobile/r2-audio-object-store.test.ts
bun run check-types
```

Expected: service and adapter tests pass.

**Step 6: Commit**

```bash
git add apps/web/src/server/mobile apps/web/package.json apps/web/.env.example packages/env/src/server.ts turbo.json bun.lock
git commit -m "feat(web): add capture service and R2 storage"
```

### Task 5: Expose authenticated `/api/mobile/v1` session, agenda, and capture endpoints

**Files:**

- Create: `apps/web/src/server/mobile/mobile-api.ts`
- Create: `apps/web/src/server/mobile/mobile-api.test.ts`
- Create: `apps/web/src/routes/api/mobile/v1/$.ts`
- Modify: `packages/auth/src/index.ts`
- Create or modify generated: `apps/web/src/routeTree.gen.ts` using the route generator only
- Create: `apps/web/src/server/mobile/capture.persistence.postgres.test.ts`

**Step 1: Write failing request-level tests**

Build `Request` objects and inject fake auth, service, and agenda ports. Cover every route and method:

```text
GET    /api/mobile/v1/session
GET    /api/mobile/v1/appointments?from=<iso>&to=<iso>&limit=20&cursor=<value>
GET    /api/mobile/v1/captures?limit=20&cursor=<value>
POST   /api/mobile/v1/captures
POST   /api/mobile/v1/captures/:id/upload-session
POST   /api/mobile/v1/captures/:id/complete
DELETE /api/mobile/v1/captures/:id
```

Assert:

- unauthenticated requests return 401;
- missing active organization returns 409 `active_organization_required`;
- a body containing `organizationId` fails strict validation;
- appointments are bounded to a maximum 31-day window and 50 rows;
- agenda rows exclude owner contact details and appointment notes;
- another organization's appointment/capture returns 404;
- malformed JSON and unknown paths/methods produce normalized 400/404/405 responses;
- all success and error bodies validate against shared contracts;
- the dispatcher never returns raw exception text.

Run:

```bash
bun --filter @biume/web test -- src/server/mobile/mobile-api.test.ts
```

Expected: FAIL because the handler does not exist.

**Step 2: Implement one narrow catch-all route and an injected dispatcher**

The route file only imports the server handler lazily and forwards all supported methods:

```ts
import { createFileRoute } from "@tanstack/react-router";

async function handle(request: Request) {
  const { handleMobileApiRequest } = await import("#/server/mobile/mobile-api");
  return handleMobileApiRequest(request);
}

export const Route = createFileRoute("/api/mobile/v1/$")({
  server: {
    handlers: {
      GET: ({ request }) => handle(request),
      POST: ({ request }) => handle(request),
      DELETE: ({ request }) => handle(request),
    },
  },
});
```

`mobile-api.ts` must:

1. call `auth.api.getSession({ headers: request.headers })`;
2. construct `CaptureActor` only from `session.user.id` and `session.session.activeOrganizationId`;
3. parse URL/method against an explicit route table;
4. validate inputs before invoking services;
5. validate serialized outputs;
6. map domain errors to stable status/code pairs;
7. apply `Cache-Control: no-store` and JSON content type.

The agenda query joins appointments to pets and animal type, always filters `appointments.organizationId`, applies cursor ordering `(beginAt, id)`, and selects only the fields in `MobileAppointment`.

**Step 3: Configure native Better Auth origins narrowly**

Parse `MOBILE_TRUSTED_ORIGINS` as a comma-separated allowlist, trim entries, and combine it with `env.CORS_ORIGIN`:

```ts
trustedOrigins: [
  env.CORS_ORIGIN,
  ...env.MOBILE_TRUSTED_ORIGINS.split(",").map((origin) => origin.trim()),
],
```

Tests must reject wildcard origins and verify production can be configured with `biume://` while development lists explicit Expo origins.

**Step 4: Generate routes and verify the HTTP boundary**

```bash
bun --filter @biume/web generate-routes
bun --filter @biume/web test -- src/server/mobile/mobile-api.test.ts src/server/mobile/capture.service.test.ts
bun run check-types
```

Expected: the generated tree includes `/api/mobile/v1/$`, request-level tests pass, and types compile.

**Step 5: Add an opt-in PostgreSQL concurrency and isolation test**

Follow the existing `REPORT_UPDATE_TEST_DATABASE_URL` pattern with `MOBILE_CAPTURE_TEST_DATABASE_URL`. Inside one rolled-back transaction prove:

- two identical creates leave one row and return the same identity;
- a different hash for the same ID conflicts;
- tenant B cannot read, complete, cancel, or purge tenant A's capture;
- a completion racing cancellation cannot move `cancelled` to `uploaded`;
- expiry selection does not include another tenant's non-expired row.

Run:

```bash
MOBILE_CAPTURE_TEST_DATABASE_URL="$DATABASE_URL" bun --filter @biume/web test -- src/server/mobile/capture.persistence.postgres.test.ts
```

Expected: PASS against a migrated disposable PostgreSQL/Neon branch. Without the environment variable, the test is explicitly skipped and the unit suite still passes.

**Step 6: Commit**

```bash
git add apps/web/src/server/mobile apps/web/src/routes/api/mobile packages/auth/src/index.ts apps/web/src/routeTree.gen.ts
git commit -m "feat(api): expose authenticated mobile capture API"
```

### Task 6: Build the encrypted SQLite capture repository and API/auth clients

**Files:**

- Create: `apps/mobile/src/auth/auth-client.ts`
- Create: `apps/mobile/src/auth/auth-session.ts`
- Create: `apps/mobile/src/api/mobile-api-client.ts`
- Create: `apps/mobile/src/api/mobile-api-client.test.ts`
- Create: `apps/mobile/src/capture/local-capture.ts`
- Create: `apps/mobile/src/capture/local-capture.test.ts`
- Create: `apps/mobile/src/capture/capture-repository.ts`
- Create: `apps/mobile/src/capture/sqlite-capture-repository.ts`
- Create: `apps/mobile/src/capture/sqlite-capture-repository.test.ts`
- Create: `apps/mobile/src/capture/capture-crypto.ts`
- Create: `apps/mobile/src/capture/capture-crypto.test.ts`
- Create: `apps/mobile/src/capture/capture-files.ts`
- Create: `apps/mobile/src/capture/recovery.ts`
- Create: `apps/mobile/src/capture/recovery.test.ts`

**Step 1: Write failing pure-domain and crypto tests**

Test the local transition matrix, oldest-first eligibility, five-failure threshold, exponential backoff with deterministic jitter, 24-hour expiry, and the invariant that only `review` can become `queued`.

Crypto tests must use a fixed 32-byte key, 12-byte nonce, capture UUID AAD, and known plaintext to assert:

- round-trip success;
- a changed byte fails authentication;
- the wrong capture ID fails authentication;
- two distinct nonces produce different ciphertext;
- the persisted envelope starts with an explicit `BIUME1` version marker and contains no plaintext.

Run:

```bash
bun --filter @biume/mobile test -- src/capture/local-capture.test.ts src/capture/capture-crypto.test.ts
```

Expected: FAIL because the domain and crypto modules do not exist.

**Step 2: Implement local types and state transitions**

The persisted row must include:

```ts
type LocalCapture = {
  id: string;
  appointmentId: string | null;
  patientId: string | null;
  encryptedFileUri: string;
  durationMs: number;
  mimeType: "audio/mp4";
  byteSize: number;
  sha256: string;
  status: LocalCaptureStatus;
  remoteStatus: ServerCaptureStatus | null;
  attemptCount: number;
  nextAttemptAt: string | null;
  lastErrorCode: MobileApiError["code"] | null;
  createdAt: string;
  validatedAt: string | null;
  expiresAt: string;
  updatedAt: string;
};
```

Expose transitions through functions, not direct screen writes. Illegal transitions throw a typed local invariant error.

**Step 3: Implement key management and versioned AES-256-GCM files**

- Generate the 32-byte installation key once with `expo-crypto` random bytes.
- Store it under `biume.capture.master-key.v1` in SecureStore.
- Use `@noble/ciphers/aes` GCM with a fresh 12-byte nonce.
- Bind `captureId` as UTF-8 AAD.
- Write encrypted bytes to the app document directory using `expo-file-system`.
- Compute SHA-256 over the plaintext audio before deleting it; this is the identity sent to the server.
- Delete the temporary plaintext only after the encrypted file is durably closed and readable.
- Decrypt to memory for playback/upload; never create a second persistent plaintext file.

Keep Expo modules behind injected adapters so unit tests run without a simulator.

**Step 4: Implement the SQLite repository with versioned migrations**

Create a `mobile_schema_migrations` table and migration 1 for `local_captures` plus an index on `(status, next_attempt_at, created_at)`. Repository methods execute in transactions and expose:

```ts
interface CaptureRepository {
  insertReview(capture: LocalCapture): Promise<void>;
  transition(id: string, from: LocalCaptureStatus[], patch: CapturePatch): Promise<boolean>;
  get(id: string): Promise<LocalCapture | null>;
  list(): Promise<LocalCapture[]>;
  nextEligible(now: string): Promise<LocalCapture | null>;
  markExpired(now: string): Promise<LocalCapture[]>;
  remove(id: string): Promise<void>;
}
```

The compare-and-set transition prevents two synchronizers from owning one row.

**Step 5: Implement Better Auth and validated API clients**

Create the official Expo Better Auth client with `expoClient`, scheme `biume`, API base URL from `EXPO_PUBLIC_API_URL`, and SecureStore-backed cookie persistence. Expose email/password sign-in, sign-out, session refresh, and active-organization selection.

The API client:

- attaches Better Auth cookies using the official client integration;
- has a timeout and maps transport failures to normalized local codes;
- parses every response with shared contracts;
- never logs bodies, cookies, signed URLs, or headers;
- treats 401 as `session_expired`, 409 identity conflict as non-retryable, 429/5xx as retryable.

Tests use fake fetch responses for success, invalid JSON, contract mismatch, timeout, 401, 409, 429, and 5xx.

**Step 6: Implement crash recovery**

On app startup, inspect recording temp files:

- recover a non-empty decodable file into `review` after encryption;
- delete zero-byte or unreadable temp files;
- reset stale local `uploading` rows to `queued` without incrementing failure count;
- keep encrypted files whose session has expired;
- mark rows missing their encrypted file as `needs_action` with `local_file_missing`.

Write these cases first in `recovery.test.ts`, run them red, then implement the recovery coordinator and run green.

**Step 7: Verify the mobile data layer**

```bash
bun --filter @biume/mobile test -- src/api src/capture
bun --filter @biume/mobile check-types
bun --cwd apps/mobile x expo install --check
```

Expected: pure/domain tests pass with Expo adapters mocked, and native dependency versions remain compatible.

**Step 8: Commit**

```bash
git add apps/mobile bun.lock
git commit -m "feat(mobile): add encrypted capture persistence"
```

### Task 7: Implement authentication, organization selection, home, and capture list UI

**Files:**

- Create: `apps/mobile/app/_layout.tsx`
- Create: `apps/mobile/app/index.tsx`
- Create: `apps/mobile/app/(auth)/sign-in.tsx`
- Create: `apps/mobile/app/(auth)/select-organization.tsx`
- Create: `apps/mobile/app/(app)/_layout.tsx`
- Create: `apps/mobile/app/(app)/index.tsx`
- Create: `apps/mobile/app/(app)/captures.tsx`
- Create: `apps/mobile/src/agenda/agenda-cache.ts`
- Create: `apps/mobile/src/agenda/agenda-cache.test.ts`
- Create: `apps/mobile/src/components/**`
- Create: `apps/mobile/src/screens/sign-in-screen.tsx`
- Create: `apps/mobile/src/screens/home-screen.tsx`
- Create: `apps/mobile/src/screens/capture-list-screen.tsx`
- Create: `apps/mobile/src/screens/*.test.tsx`

**Step 1: Write failing screen tests for the approved journeys**

Using React Native Testing Library, prove:

- unauthenticated users see email/password login only;
- cached local data remains visible offline but sync actions state that reconnection is required;
- authenticated users without an active organization see selection before agenda;
- home chooses the most recent completed appointment as the primary action, otherwise the nearest relevant appointment;
- upcoming appointments are compact and the permanent `Dictée libre` action is present;
- capture list maps states exactly to `À envoyer`, `Envoi en cours`, `Envoyée`, `Action requise`, and `Expirée`;
- action-required rows expose only retry, reconnect, redo, or delete according to error code;
- screen readers receive labels and state announcements and every control is keyboard/switch-access reachable.

Run:

```bash
bun --filter @biume/mobile test -- src/screens
```

Expected: FAIL because the screens do not exist.

**Step 2: Implement the route guards and data shell**

The root layout initializes SQLite, crash recovery, session restoration, and the sync coordinator before routing. Route decisions are explicit:

```text
no session                    -> /(auth)/sign-in
session without organization -> /(auth)/select-organization
ready session                 -> /(app)
```

Do not put synchronization logic in route components. Screens consume view models and invoke domain actions.

**Step 3: Implement bounded agenda caching and home selection**

Cache only fields in `MobileAppointment`, keyed by active organization and bounded to the API window. Clear another organization's cached agenda when the active organization changes. Do not cache owner contact details or appointment notes.

**Step 4: Implement the capture list**

Order active/recoverable captures newest first and retain uploaded/expired metadata for technical audit. Show expiration time for unsent captures. Require confirmation before delete or redo. Announcing a status change must not expose patient/animal names in system logs.

**Step 5: Verify UI shell**

```bash
bun --filter @biume/mobile test -- src/agenda src/screens
bun --filter @biume/mobile check-types
```

Expected: tests pass, navigation is type-safe, and no screen owns file, crypto, or upload mechanics.

**Step 6: Commit**

```bash
git add apps/mobile
git commit -m "feat(mobile): add authenticated capture workspace"
```

### Task 8: Implement recording, immediate encryption, playback, redo, and validation

**Files:**

- Create: `apps/mobile/app/(app)/record.tsx`
- Create: `apps/mobile/src/recording/audio-recorder.ts`
- Create: `apps/mobile/src/recording/expo-audio-recorder.ts`
- Create: `apps/mobile/src/recording/recording-session.ts`
- Create: `apps/mobile/src/recording/recording-session.test.ts`
- Create: `apps/mobile/src/recording/storage-guard.ts`
- Create: `apps/mobile/src/screens/record-screen.tsx`
- Create: `apps/mobile/src/screens/review-screen.tsx`
- Create: `apps/mobile/src/screens/record-screen.test.tsx`
- Create: `apps/mobile/src/screens/review-screen.test.tsx`

**Step 1: Write failing recording-session tests against a fake recorder**

Cover:

- microphone permission denied creates no capture and exposes a settings action;
- insufficient free space refuses start before creating a temp file;
- recording uses one stable UUID and the selected nullable appointment context;
- stop at exactly 600,000 ms is automatic and idempotent;
- user stop is available and pause/resume is absent;
- cancel deletes the temp file and creates no queue row;
- interruption persists enough session metadata for startup recovery;
- stop encrypts before deleting plaintext and before showing review;
- encryption failure preserves recoverable plaintext but never queues it;
- resulting format is `audio/mp4`, mono AAC-LC, 64 kbit/s.

Run:

```bash
bun --filter @biume/mobile test -- src/recording/recording-session.test.ts
```

Expected: FAIL because recording orchestration does not exist.

**Step 2: Implement the recorder port and Expo adapter**

The adapter exposes permission, start, stop, status, playback, and cleanup operations. Configure Expo Audio with a custom recording preset equivalent to:

```ts
{
  extension: ".m4a",
  sampleRate: 44_100,
  numberOfChannels: 1,
  bitRate: 64_000,
  android: { outputFormat: "mpeg4", audioEncoder: "aac" },
  ios: { outputFormat: "mpeg4aac", audioQuality: "medium" },
}
```

Confirm the exact SDK 57 enum/property names against installed TypeScript declarations during implementation. Keep the canonical format values above unchanged.

**Step 3: Implement the recording state machine**

Use a monotonic elapsed timer for UI and the recorder's native duration for the final value. A single `stopOnce` promise handles manual stop, timer stop, and interruption. On successful stop:

1. validate duration and file size;
2. compute plaintext SHA-256;
3. encrypt with capture UUID AAD;
4. fsync/close and reread the encrypted envelope header;
5. delete plaintext;
6. persist `review` in SQLite;
7. navigate to review.

**Step 4: Implement record and review screens**

Record screen displays context, microphone state, elapsed/remaining time, network state, Stop, and Cancel. Review decrypts audio to memory, supports playback, and exposes only:

- `Recommencer`: confirmation, delete encrypted file and row, return to record with same context;
- `Valider la dictée`: atomic `review -> queued`, then return to capture list/home.

Validation never calls the server and must work in airplane mode.

**Step 5: Verify the recording slice**

```bash
bun --filter @biume/mobile test -- src/recording src/screens/record-screen.test.tsx src/screens/review-screen.test.tsx
bun --filter @biume/mobile check-types
bun --cwd apps/mobile x expo install --check
```

Expected: all orchestration and screen tests pass; no pause action exists; no plaintext URI is persisted in SQLite.

**Step 6: Manual simulator/device gate**

```bash
bun run dev:mobile
```

Verify on one iOS simulator/device and one Android emulator/device: permission request, start/stop, automatic ten-minute stop using a shortened development-only injected clock in a non-production test build, playback, redo, offline validation, and force-close recovery. Record results in `docs/mobile/manual-test-matrix.md` with date, platform, OS, device, build, and pass/fail evidence.

**Step 7: Commit**

```bash
git add apps/mobile docs/mobile/manual-test-matrix.md
git commit -m "feat(mobile): record and review encrypted dictations"
```

### Task 9: Implement reliable foreground-first synchronization and retries

**Files:**

- Create: `apps/mobile/src/sync/sync-engine.ts`
- Create: `apps/mobile/src/sync/sync-engine.test.ts`
- Create: `apps/mobile/src/sync/sync-coordinator.ts`
- Create: `apps/mobile/src/sync/sync-coordinator.test.ts`
- Create: `apps/mobile/src/sync/upload-client.ts`
- Create: `apps/mobile/src/sync/upload-client.test.ts`
- Create: `apps/mobile/src/sync/background-sync.ts`
- Modify: `apps/mobile/app/_layout.tsx`
- Modify: `apps/mobile/src/screens/capture-list-screen.tsx`

**Step 1: Write failing deterministic sync-engine tests**

For an injected repository, API, uploader, network, clock, and random source, prove:

1. offline keeps `queued` and does not increment attempts;
2. only the oldest eligible capture is claimed;
3. a second engine cannot claim a local `uploading` row;
4. create, upload-session, PUT, and complete use the same capture ID and object identity;
5. decryption feeds bytes directly to HTTPS without a plaintext file;
6. a successful ETag is sent to completion and state becomes `uploaded` only after server confirmation;
7. an expired signed URL is renewed and the full file is retried;
8. 429/5xx/network interruption apply exponential backoff with jitter capped at 15 minutes;
9. the fifth counted failure becomes `needs_action`;
10. 401 becomes `needs_action/session_expired` without deleting the file;
11. identity conflict and local missing file are non-retryable;
12. cancellation during PUT cannot later complete the capture;
13. app restart resets stale ownership and resumes the same row;
14. no run starts more than one upload.

Run:

```bash
bun --filter @biume/mobile test -- src/sync/sync-engine.test.ts
```

Expected: FAIL because sync code does not exist.

**Step 2: Implement direct PUT and exact signed headers**

`upload-client.ts` accepts only the signed URL and exact server-returned headers plus decrypted bytes. It performs one `PUT`, captures the response ETag case-insensitively, and never follows a redirect to a different origin. It must not print URL, headers, or body.

**Step 3: Implement the single-owner sync loop**

Use a process mutex plus SQLite compare-and-set. For one eligible row:

```text
queued/retryable
  -> claim uploading
  -> POST capture idempotently
  -> POST upload-session
  -> decrypt in memory
  -> PUT complete file
  -> POST complete with ETag
  -> persist uploaded
```

On any error, release ownership through an explicit state transition. Never leave a promise rejection as the state mechanism.

**Step 4: Trigger sync from reliable lifecycle events**

The coordinator requests a run after validation, network restoration, app foreground, and application launch. Debounce multiple requests into one pending rerun. Register Expo BackgroundTask/TaskManager as best effort only; foreground events remain sufficient for correctness.

**Step 5: Wire retry/reconnect/delete actions**

- Retry resets `needs_action` to `queued` only for recoverable codes.
- Reconnect opens sign-in, then returns retained captures to `queued` after a valid session.
- Delete first transitions local state to cancelled, calls server DELETE when possible, then removes the encrypted file after cancellation is durably recorded.
- A failed server cancellation remains a queued cleanup operation; it does not resurrect the capture UI.

**Step 6: Verify sync behavior**

```bash
bun --filter @biume/mobile test -- src/sync src/capture
bun --filter @biume/mobile check-types
```

Expected: all retry, locking, auth, and restart cases pass deterministically with fake time.

**Step 7: Run the interrupted-upload device scenario**

Use the local web API and a private non-production R2 bucket. On iOS and Android:

1. cache an appointment;
2. go offline;
3. record and validate;
4. force-close and reopen;
5. restore network;
6. interrupt the first PUT;
7. let foreground/network triggers resume;
8. verify one local `uploaded` row, one database row, and one R2 object key.

Append evidence to `docs/mobile/manual-test-matrix.md`. Never paste a signed URL or clinical identifier into the document.

**Step 8: Commit**

```bash
git add apps/mobile docs/mobile/manual-test-matrix.md
git commit -m "feat(mobile): synchronize captures with resumable retries"
```

### Task 10: Add expiry purge, safe telemetry, operational documentation, and final gates

**Files:**

- Create: `apps/web/src/server/mobile/capture-purge.ts`
- Create: `apps/web/src/server/mobile/capture-purge.test.ts`
- Create: `apps/web/src/trigger/capture-purge.trigger.ts`
- Create: `apps/web/src/trigger/capture-purge.trigger.test.ts`
- Create: `apps/mobile/src/telemetry/capture-events.ts`
- Create: `apps/mobile/src/telemetry/capture-events.test.ts`
- Create: `apps/mobile/src/capture/local-purge.ts`
- Create: `apps/mobile/src/capture/local-purge.test.ts`
- Create: `docs/mobile/operations.md`
- Modify: `docs/mobile/manual-test-matrix.md`

**Step 1: Write failing local and remote purge tests**

Server tests prove that the purge service:

- selects only non-purged captures whose `expiresAt <= now`;
- marks eligible rows `expired` before object deletion;
- deletes the expected R2 key idempotently;
- then sets `purgedAt` and neutralizes `objectKey` so metadata cannot locate audio;
- retries an object-store deletion failure without losing the key;
- refuses a late completion after expiry/cancellation;
- processes bounded batches and cannot cross tenant/capture identities.

Mobile tests prove that expiry deletes the encrypted file, marks metadata `expired`, does not delete younger captures, and tolerates an already-missing file.

Run:

```bash
bun --filter @biume/web test -- src/server/mobile/capture-purge.test.ts
bun --filter @biume/mobile test -- src/capture/local-purge.test.ts
```

Expected: FAIL because purge services do not exist.

**Step 2: Implement bounded purge services and Trigger task**

The Trigger task invokes batches of at most 100 until no eligible capture remains, with an execution-time guard. Use a stable task ID `mobile-capture-purge`. Schedule it at least hourly through the existing Trigger deployment configuration. The domain service remains independently unit-testable; the Trigger file is only orchestration.

**Step 3: Add schema-validated safe telemetry**

All mobile capture events must pass `productEventSchema` before emission. The event wrapper accepts no arbitrary property record. Write tests that attempt to include `email`, `patientName`, `animalName`, `appointmentNote`, `signedUrl`, `cookie`, and audio bytes and prove validation rejects them.

Emit only lifecycle events required by the product measurement plan: capture started/completed/queued/uploaded and normalized failure transitions. Do not emit decrypted content or request bodies.

**Step 4: Write operational setup documentation**

`docs/mobile/operations.md` must contain executable checklists for:

- R2 private bucket creation;
- scoped S3 token with object read/write/delete only for the audio bucket;
- bucket CORS allowing signed `PUT`, required headers, and ETag exposure without public reads;
- five typed R2/auth environment values and EAS `EXPO_PUBLIC_API_URL` profiles;
- explicit Better Auth development and production origins;
- applying migration `0004` before web/mobile deployment;
- Trigger deployment and purge verification;
- Apple Developer and Google Play Console enrollment;
- EAS internal Android APK, TestFlight, and Play Internal Testing release steps;
- incident checks for stuck upload, rising retry rate, purge lag, and local recovery;
- confirmation that logs contain no PII, clinical text, signed URLs, or audio.

Do not include live credentials or production URLs.

**Step 5: Run the complete automated verification matrix**

```bash
bun install --frozen-lockfile
bun --filter @biume/contracts test
bun --filter @biume/db test
bun --filter @biume/web test -- src/server/mobile
bun --filter @biume/mobile test
bun run check-types
bun --cwd apps/mobile x expo install --check
bun --filter @biume/web generate-routes
git diff --check
git status --short
```

Expected:

- all focused contract, database, web-mobile, and mobile tests pass;
- all workspace type checks pass;
- Expo dependency check reports no mismatch;
- a second route generation produces no diff;
- only files in this plan are modified;
- no npm, Yarn, or pnpm lockfile exists.

If the full unfiltered web suite reports a failure that already exists on `origin/main`, reproduce it in the clean baseline and document the exact command/output separately. Do not classify a new mobile failure as baseline noise.

**Step 6: Complete the physical-device acceptance matrix**

On one real iOS device and one real Android device, sign and date every row in `docs/mobile/manual-test-matrix.md`:

- email/password login and active organization;
- useful appointment and free capture;
- permission denied and granted;
- offline record, stop, review, playback, redo, validate;
- automatic ten-minute stop;
- force-close after validation and recovery after reopen;
- network restoration and one-at-a-time upload;
- interrupted PUT, signed URL renewal, and successful full-file retry;
- expired session with retained encrypted file and successful retry after login;
- five failures leading to visible `Action requise`;
- cancel during upload without late completion;
- 24-hour local and R2 purge using an injected non-production clock;
- exactly one database row and one object for repeated retries;
- telemetry inspection with no personal or clinical data.

The alpha is not accepted until both platform columns pass. Store accounts are not required for local device verification, but external iOS distribution waits for Apple Developer enrollment.

**Step 7: Commit**

```bash
git add apps/web/src/server/mobile apps/web/src/trigger apps/mobile/src docs/mobile
git commit -m "feat(mobile): enforce capture retention and release gates"
```

## Final acceptance checkpoint

Before opening the pull request, compare the result line by line with `docs/superpowers/specs/2026-07-19-mobile-capture-sync-design.md` and confirm:

- the slice ends at server-confirmed `uploaded`;
- no transcription or report proposal code was added;
- offline validation survives app termination;
- idempotency is enforced locally and server-side;
- every server mutation is tenant-scoped;
- R2 is private and uploads are direct signed `PUT`s;
- plaintext does not persist after encryption;
- all terminal errors remain visible and actionable;
- local and remote audio expire in 24 hours;
- iOS and Android device evidence exists.

Then run:

```bash
git log --oneline origin/main..HEAD
git diff --stat origin/main...HEAD
git diff --check origin/main...HEAD
```

Expected: ten coherent implementation commits in addition to the two planning commits, a scoped diff, and no whitespace errors.
