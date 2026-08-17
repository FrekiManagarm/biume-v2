import { randomUUID } from "node:crypto";

import { captureRetentionMs } from "@biume/contracts/capture";
import { audioCapture } from "@biume/db/schema/index";
import { and, eq, lte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

// `./capture.repository` pulls in `@biume/db`, which validates the whole server
// environment on import. It is loaded inside `beforeAll` so this file stays
// importable — and skippable — without a configured environment.
import {
  CaptureServiceError,
  cancelCapture,
  completeCapture,
  createCapture,
  createUploadSession,
  type CaptureActor,
  type CaptureServiceDependencies,
} from "./capture.service";

const databaseUrl = process.env.MOBILE_CAPTURE_TEST_DATABASE_URL;
const describePostgres = databaseUrl ? describe : describe.skip;

describePostgres("mobile capture persistence against PostgreSQL", () => {
  const client = new Client({ connectionString: databaseUrl });
  const suffix = randomUUID();
  const tenantA = `org-a-${suffix}`;
  const tenantB = `org-b-${suffix}`;
  const practitionerA = `user-a-${suffix}`;
  const practitionerB = `user-b-${suffix}`;

  const actorA: CaptureActor = {
    practitionerId: practitionerA,
    organizationId: tenantA,
  };
  const actorB: CaptureActor = {
    practitionerId: practitionerB,
    organizationId: tenantB,
  };

  const now = new Date("2026-07-19T10:00:00.000Z");
  let dependencies: CaptureServiceDependencies;

  const storedObjects = new Map<string, { etag: string; byteSize: number }>();

  function request(id: string, overrides: Record<string, unknown> = {}) {
    return {
      id,
      appointmentId: null,
      durationMs: 120_000,
      mimeType: "audio/mp4" as const,
      byteSize: 1_048_576,
      sha256: "a".repeat(64),
      createdAt: "2026-07-19T09:59:00.000Z",
      ...overrides,
    } as Parameters<typeof createCapture>[1];
  }

  beforeAll(async () => {
    await client.connect();
    await client.query("BEGIN");

    for (const [organizationId, name] of [
      [tenantA, "Tenant A"],
      [tenantB, "Tenant B"],
    ]) {
      await client.query(
        'INSERT INTO "organizations" ("id", "name") VALUES ($1, $2)',
        [organizationId, name],
      );
    }
    for (const [userId, email] of [
      [practitionerA, `a-${suffix}@biume.test`],
      [practitionerB, `b-${suffix}@biume.test`],
    ]) {
      await client.query(
        `INSERT INTO "users"
           ("id", "name", "email", "email_verified", "created_at", "updated_at")
         VALUES ($1, $2, $3, false, now(), now())`,
        [userId, "Praticien", email],
      );
    }

    const { createCaptureRepository } = await import("./capture.repository");
    const database = drizzle(client);
    dependencies = {
      repository: createCaptureRepository(database),
      objectStore: {
        createPutUrl: async (input) => {
          storedObjects.set(input.key, {
            etag: '"etag-1"',
            byteSize: input.byteSize,
          });
          return {
            url: "https://storage.example.com/signed",
            headers: {},
            expiresAt: new Date(now.getTime() + 600_000),
          };
        },
        head: async (key) => {
          const stored = storedObjects.get(key);
          if (!stored) return null;
          return {
            etag: stored.etag,
            contentType: "audio/mp4",
            byteSize: stored.byteSize,
            metadata: { sha256: "a".repeat(64) },
          };
        },
        delete: async (key) => {
          storedObjects.delete(key);
        },
      },
      now: () => now,
      hashOrganizationId: (organizationId) =>
        organizationId === tenantA ? "hash-a" : "hash-b",
    };
  });

  afterAll(async () => {
    await client.query("ROLLBACK");
    await client.end();
  });

  it("leaves one row when the same recording is created twice", async () => {
    const id = randomUUID();

    const first = await createCapture(actorA, request(id), dependencies);
    const second = await createCapture(actorA, request(id), dependencies);

    expect(second.id).toBe(first.id);
    expect(second.objectKey).toBe(first.objectKey);

    const rows = await client.query(
      'SELECT COUNT(*)::int AS count FROM "audio_capture" WHERE "id" = $1',
      [id],
    );
    expect(rows.rows[0].count).toBe(1);
  });

  it("conflicts when the same identifier carries different audio", async () => {
    const id = randomUUID();
    await createCapture(actorA, request(id), dependencies);

    await expect(
      createCapture(
        actorA,
        request(id, { sha256: "b".repeat(64) }),
        dependencies,
      ),
    ).rejects.toBeInstanceOf(CaptureServiceError);
  });

  it("hides tenant A's capture from tenant B on every operation", async () => {
    const id = randomUUID();
    await createCapture(actorA, request(id), dependencies);

    await expect(
      createUploadSession(actorB, id, dependencies),
    ).rejects.toMatchObject({ code: "not_found" });
    await expect(
      completeCapture(actorB, id, { etag: '"etag-1"' }, dependencies),
    ).rejects.toMatchObject({ code: "not_found" });
    await expect(cancelCapture(actorB, id, dependencies)).rejects.toMatchObject({
      code: "not_found",
    });

    const rows = await client.query(
      'SELECT "status" FROM "audio_capture" WHERE "id" = $1',
      [id],
    );
    expect(rows.rows[0].status).toBe("pending_upload");
  });

  it("never lets a late completion revive a cancelled capture", async () => {
    const id = randomUUID();
    await createCapture(actorA, request(id), dependencies);
    await createUploadSession(actorA, id, dependencies);
    await cancelCapture(actorA, id, dependencies);

    await expect(
      completeCapture(actorA, id, { etag: '"etag-1"' }, dependencies),
    ).rejects.toMatchObject({ code: "conflict" });

    const rows = await client.query(
      'SELECT "status" FROM "audio_capture" WHERE "id" = $1',
      [id],
    );
    expect(rows.rows[0].status).toBe("cancelled");
  });

  it("confirms a capture end to end", async () => {
    const id = randomUUID();
    await createCapture(actorA, request(id), dependencies);
    await createUploadSession(actorA, id, dependencies);

    const confirmed = await completeCapture(
      actorA,
      id,
      { etag: '"etag-1"' },
      dependencies,
    );

    expect(confirmed.status).toBe("uploaded");
  });

  it("selects only the expired rows of the sweeping tenant", async () => {
    const database = drizzle(client);
    const expiredId = randomUUID();
    const freshId = randomUUID();

    await createCapture(actorA, request(expiredId), dependencies);
    await createCapture(actorB, request(freshId), dependencies);
    await client.query(
      'UPDATE "audio_capture" SET "expires_at" = $2 WHERE "id" = $1',
      [expiredId, new Date(now.getTime() - 1000)],
    );

    const sweepAt = new Date(now.getTime() + captureRetentionMs);
    const expired = await database
      .select({ id: audioCapture.id })
      .from(audioCapture)
      .where(
        and(
          eq(audioCapture.organizationId, tenantA),
          lte(audioCapture.expiresAt, sweepAt),
        ),
      );

    expect(expired.map((row) => row.id)).toContain(expiredId);
    expect(expired.map((row) => row.id)).not.toContain(freshId);
  });
});
