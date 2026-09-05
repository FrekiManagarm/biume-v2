import { randomUUID } from "node:crypto";

import { captureRetentionMs } from "@biume/contracts/capture";
import type { OwnerReportSnapshot } from "@biume/contracts/report";
import {
  advancedReport,
  audioCapture,
  clients,
  reportShareLink,
  reportSharedVersion,
} from "@biume/db/schema/index";
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
import type { CaptureDatabase } from "./capture.repository";

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
        getBytes: async (key) => (storedObjects.has(key) ? new Uint8Array() : null),
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

// `./mobile-api.ports` pulls in `@biume/db` and every mobile port (R2, e-mail,
// extraction…), which validate the whole server environment on import. It is
// loaded inside `beforeAll` so this file stays importable — and skippable —
// without a configured environment.
describePostgres("jeton de partage d'un rapport", () => {
  const client = new Client({ connectionString: databaseUrl });
  const suffix = randomUUID();
  const organizationId = `org-share-${suffix}`;
  const otherOrganizationId = `org-share-other-${suffix}`;
  const ownerId = `owner-share-${suffix}`;
  const otherOwnerId = `owner-share-other-${suffix}`;
  const reportOneId = `report-share-one-${suffix}`;
  const reportTwoId = `report-share-two-${suffix}`;
  const otherReportId = `report-share-other-${suffix}`;

  let database: CaptureDatabase;
  let findReportShareToken: (
    typeof import("./mobile-api.ports")
  )["findReportShareToken"];

  function snapshot(reportId: string, reportRevision: number): OwnerReportSnapshot {
    return {
      reportId,
      reportRevision,
      title: "Consultation",
      animal: { id: "animal-1", name: "Nala" },
      owner: { id: "owner-1", name: "Camille" },
      consultationReason: "Contrôle annuel",
      clinical: [],
      anatomical: [],
      recommendations: [],
      notes: "",
      createdAt: "2026-07-19T09:00:00.000Z",
    };
  }

  /**
   * Chaque appel pose une nouvelle version immuable du rapport (une révision
   * distincte, comme le ferait une vraie finalisation répétée) et le lien de
   * partage qui la porte.
   */
  async function shareReport(
    reportId: string,
    organizationIdForVersion: string,
    ownerIdForLink: string,
    token: string,
    reportRevision: number,
    options: { createdAt: Date; revokedAt?: Date },
  ) {
    const [version] = await database
      .insert(reportSharedVersion)
      .values({
        reportId,
        organizationId: organizationIdForVersion,
        reportRevision,
        snapshot: snapshot(reportId, reportRevision),
      })
      .returning({ id: reportSharedVersion.id });

    await database.insert(reportShareLink).values({
      token,
      sharedVersionId: version.id,
      ownerId: ownerIdForLink,
      createdAt: options.createdAt,
      revokedAt: options.revokedAt ?? null,
    });
  }

  const now = new Date("2026-07-19T10:00:00.000Z");

  beforeAll(async () => {
    await client.connect();
    await client.query("BEGIN");

    ({ findReportShareToken } = await import("./mobile-api.ports"));
    database = drizzle(client);

    for (const [id, name] of [
      [organizationId, "Cabinet A"],
      [otherOrganizationId, "Cabinet B"],
    ]) {
      await client.query(
        'INSERT INTO "organizations" ("id", "name") VALUES ($1, $2)',
        [id, name],
      );
    }

    await database.insert(clients).values([
      { id: ownerId, organizationId },
      { id: otherOwnerId, organizationId: otherOrganizationId },
    ]);

    await database.insert(advancedReport).values([
      { id: reportOneId, createdBy: organizationId, title: "Consultation" },
      { id: reportTwoId, createdBy: organizationId, title: "Consultation" },
      { id: otherReportId, createdBy: otherOrganizationId, title: "Consultation" },
    ]);

    // Un rapport avec trois versions/liens : une ancienne, une récente, et
    // une plus récente encore mais révoquée. Le jeton attendu est celui de la
    // version récente non révoquée.
    await shareReport(reportOneId, organizationId, ownerId, "token-one-old", 1, {
      createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
    });
    await shareReport(reportOneId, organizationId, ownerId, "token-one-current", 2, {
      createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000),
    });
    await shareReport(reportOneId, organizationId, ownerId, "token-one-revoked", 3, {
      createdAt: now,
      revokedAt: now,
    });

    // Un second rapport de la même organisation, avec son propre lien : la
    // fonction ne doit jamais renvoyer le jeton d'un autre rapport.
    await shareReport(reportTwoId, organizationId, ownerId, "token-two", 1, {
      createdAt: now,
    });

    // Un rapport d'une autre organisation, avec son propre lien actif.
    await shareReport(otherReportId, otherOrganizationId, otherOwnerId, "token-other", 1, {
      createdAt: now,
    });
  });

  afterAll(async () => {
    await client.query("ROLLBACK");
    await client.end();
  });

  it("renvoie le jeton le plus récent non révoqué du rapport demandé", async () => {
    await expect(
      findReportShareToken(database, { organizationId, reportId: reportOneId }),
    ).resolves.toBe("token-one-current");
  });

  it("distingue les jetons de deux rapports de la même organisation", async () => {
    await expect(
      findReportShareToken(database, { organizationId, reportId: reportTwoId }),
    ).resolves.toBe("token-two");
  });

  it("ne renvoie jamais le jeton d'un rapport d'une autre organisation", async () => {
    await expect(
      findReportShareToken(database, {
        organizationId,
        reportId: otherReportId,
      }),
    ).resolves.toBeNull();
  });

  it("renvoie le jeton d'un rapport à son organisation propriétaire", async () => {
    await expect(
      findReportShareToken(database, {
        organizationId: otherOrganizationId,
        reportId: otherReportId,
      }),
    ).resolves.toBe("token-other");
  });

  it("renvoie null pour un rapport inexistant", async () => {
    await expect(
      findReportShareToken(database, {
        organizationId,
        reportId: "report-share-unknown",
      }),
    ).resolves.toBeNull();
  });
});
