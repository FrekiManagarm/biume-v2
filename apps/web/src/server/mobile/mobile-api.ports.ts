import { createHash } from "node:crypto";
import { patientSpeciesSchema } from "@biume/contracts/capture";
import { db } from "@biume/db";
import {
  animals,
  appointments,
  audioCapture,
  pets,
} from "@biume/db/schema/index";
import { and, asc, desc, eq, gt, gte, lte, or, sql } from "drizzle-orm";
import {
  cancelCapture,
  completeCapture,
  createCapture,
  createUploadSession,
  type CaptureServiceDependencies,
} from "./capture.service";
import { createCaptureRepository } from "./capture.repository";
import { getR2AudioObjectStore } from "./r2-audio-object-store.factory";
import type { MobileApiPorts } from "./mobile-api";

/**
 * Object keys must not expose a business identifier. A truncated SHA-256 keeps
 * the key stable and opaque, and is never reversed back to an organization.
 */
export function hashOrganizationId(organizationId: string): string {
  return createHash("sha256")
    .update(organizationId)
    .digest("hex")
    .slice(0, 32);
}

function encodeCursor(beginAt: Date, id: string): string {
  return Buffer.from(`${beginAt.toISOString()}|${id}`).toString("base64url");
}

function decodeCursor(cursor: string): { beginAt: Date; id: string } | null {
  try {
    const [beginAt, id] = Buffer.from(cursor, "base64url")
      .toString("utf8")
      .split("|");
    if (!beginAt || !id) return null;
    const parsed = new Date(beginAt);
    if (Number.isNaN(parsed.getTime())) return null;
    return { beginAt: parsed, id };
  } catch {
    return null;
  }
}

export async function createProductionMobileApiPorts(): Promise<MobileApiPorts> {
  const { auth } = await import("@biume/auth");
  const repository = createCaptureRepository();
  const dependencies: CaptureServiceDependencies = {
    repository,
    objectStore: getR2AudioObjectStore(),
    now: () => new Date(),
    hashOrganizationId,
  };

  return {
    async authenticate(headers) {
      const session = await auth.api.getSession({ headers });
      if (!session) return null;

      const activeOrganizationId = session.session.activeOrganizationId;
      if (!activeOrganizationId) {
        return { userId: session.user.id, organization: null };
      }

      const organization = await auth.api.getFullOrganization({
        headers,
        query: { organizationId: activeOrganizationId },
      });
      if (!organization) {
        return { userId: session.user.id, organization: null };
      }

      return {
        userId: session.user.id,
        organization: { id: organization.id, name: organization.name },
      };
    },

    async listAppointments(actor, query) {
      const cursor = query.cursor ? decodeCursor(query.cursor) : null;

      const rows = await db
        .select({
          id: appointments.id,
          patientId: appointments.patientId,
          patientName: pets.name,
          animalCode: animals.code,
          beginAt: appointments.beginAt,
          endAt: appointments.endAt,
          status: appointments.status,
        })
        .from(appointments)
        .innerJoin(pets, eq(pets.id, appointments.patientId))
        .leftJoin(animals, eq(animals.id, pets.type))
        .where(
          and(
            // Tenancy first: the window and the cursor only narrow rows the
            // organization already owns.
            eq(appointments.organizationId, actor.organizationId),
            gte(appointments.beginAt, query.from),
            lte(appointments.beginAt, query.to),
            cursor
              ? or(
                  gt(appointments.beginAt, cursor.beginAt),
                  and(
                    eq(appointments.beginAt, cursor.beginAt),
                    gt(appointments.id, cursor.id),
                  ),
                )
              : undefined,
          ),
        )
        .orderBy(asc(appointments.beginAt), asc(appointments.id))
        .limit(query.limit + 1);

      const page = rows.slice(0, query.limit);
      const last = page.at(-1);

      return {
        items: page.map((row) => ({
          id: row.id,
          patientId: row.patientId ?? "",
          patientName: row.patientName,
          // An unmapped or missing species falls back to the catalogue's own
          // "OTHER" rather than dropping the appointment from the agenda.
          animalType:
            patientSpeciesSchema.safeParse(row.animalCode).data ?? "OTHER",
          beginAt: row.beginAt.toISOString(),
          endAt: row.endAt.toISOString(),
          status: row.status,
        })),
        nextCursor:
          rows.length > query.limit && last
            ? encodeCursor(last.beginAt, last.id)
            : null,
      };
    },

    async listCaptures(actor, query) {
      const rows = await db
        .select()
        .from(audioCapture)
        .where(
          and(
            eq(audioCapture.organizationId, actor.organizationId),
            eq(audioCapture.practitionerId, actor.practitionerId),
            query.cursor
              ? sql`${audioCapture.createdAt} < ${new Date(query.cursor)}`
              : undefined,
          ),
        )
        .orderBy(desc(audioCapture.createdAt), desc(audioCapture.id))
        .limit(query.limit + 1);

      const page = rows.slice(0, query.limit);
      const last = page.at(-1);

      return {
        items: page.map((row) => ({
          id: row.id,
          organizationId: row.organizationId,
          practitionerId: row.practitionerId,
          appointmentId: row.appointmentId,
          patientId: row.patientId,
          reportId: row.reportId,
          durationMs: row.durationMs,
          mimeType: "audio/mp4" as const,
          byteSize: row.byteSize,
          sha256: row.sha256,
          objectKey: row.objectKey,
          objectEtag: row.objectEtag,
          status: row.status,
          attemptCount: row.attemptCount,
          lastErrorCode:
            row.lastErrorCode as MobileApiPortsCaptureErrorCode | null,
          createdAt: row.createdAt.toISOString(),
          uploadedAt: row.uploadedAt?.toISOString() ?? null,
          expiresAt: row.expiresAt.toISOString(),
          purgedAt: row.purgedAt?.toISOString() ?? null,
        })),
        nextCursor:
          rows.length > query.limit && last
            ? last.createdAt.toISOString()
            : null,
      };
    },

    createCapture: (actor, request) =>
      createCapture(actor, request, dependencies),
    createUploadSession: (actor, captureId) =>
      createUploadSession(actor, captureId, dependencies),
    completeCapture: (actor, captureId, request) =>
      completeCapture(actor, captureId, request, dependencies),
    cancelCapture: (actor, captureId) =>
      cancelCapture(actor, captureId, dependencies),
  };
}

type MobileApiPortsCaptureErrorCode = NonNullable<
  Awaited<ReturnType<MobileApiPorts["listCaptures"]>>["items"][number]["lastErrorCode"]
>;
