import { createHash } from "node:crypto";
import { patientSpeciesSchema } from "@biume/contracts/capture";
import { db } from "@biume/db";
import {
  advancedReport,
  animals,
  appointments,
  audioCapture,
  clients,
  pets,
} from "@biume/db/schema/index";
import { and, asc, desc, eq, gt, gte, ilike, lte, or, sql } from "drizzle-orm";
import {
  cancelCapture,
  completeCapture,
  createCapture,
  createUploadSession,
  type CaptureServiceDependencies,
} from "./capture.service";
import { MobileRequestError } from "./mobile-api.errors";
import { findAppointmentConflicts } from "#/lib/dashboard/appointment-conflicts";
import { createCaptureRepository } from "./capture.repository";
import { getR2AudioObjectStore } from "./r2-audio-object-store.factory";
import {
  toHistoryEntry,
  toMobileOwner,
  toMobilePatient,
} from "./records.repository";
import type { MobileApiPorts } from "./mobile-api";

/** Curseur d'identifiant simple, pour les listes triées par identifiant. */
function encodeIdCursor(id: string): string {
  return Buffer.from(id).toString("base64url");
}

function decodeIdCursor(cursor: string): string | null {
  try {
    const id = Buffer.from(cursor, "base64url").toString("utf8");
    return id.length > 0 ? id : null;
  } catch {
    return null;
  }
}

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
    async onCaptureUploaded(captureId) {
      const { tasks } = await import("@trigger.dev/sdk/v3");
      const { transcribeCaptureTaskId } = await import(
        "#/trigger/transcribe-capture.trigger"
      );
      await tasks.trigger(transcribeCaptureTaskId, { captureId });
    },
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

    async listOwners(actor, query) {
      const cursor = query.cursor ? decodeIdCursor(query.cursor) : null;

      const rows = await db
        .select({
          id: clients.id,
          name: clients.name,
          email: clients.email,
          phone: clients.phone,
          city: clients.city,
          patientCount: sql<number>`count(${pets.id})::int`,
        })
        .from(clients)
        .leftJoin(pets, eq(pets.ownerId, clients.id))
        .where(
          and(
            // La frontière de locataire est portée par l'acteur, jamais par la
            // requête du client.
            eq(clients.organizationId, actor.organizationId),
            query.search ? ilike(clients.name, `%${query.search}%`) : undefined,
            cursor ? gt(clients.id, cursor) : undefined,
          ),
        )
        .groupBy(clients.id)
        .orderBy(asc(clients.id))
        // Une ligne de plus que demandé : sa présence dit qu'il reste une page,
        // sans second appel de comptage.
        .limit(query.limit + 1);

      const page = rows.slice(0, query.limit);
      const last = page.at(-1);

      return {
        items: page.map(toMobileOwner),
        nextCursor:
          rows.length > query.limit && last ? encodeIdCursor(last.id) : null,
      };
    },

    async listPatients(actor, query) {
      const cursor = query.cursor ? decodeIdCursor(query.cursor) : null;

      const rows = await db
        .select({
          id: pets.id,
          ownerId: pets.ownerId,
          ownerName: clients.name,
          name: pets.name,
          speciesCode: animals.code,
          breed: pets.breed,
          birthDate: pets.birthDate,
          lastAppointmentAt: sql<Date | null>`max(${appointments.beginAt})`,
        })
        .from(pets)
        .innerJoin(clients, eq(clients.id, pets.ownerId))
        .leftJoin(animals, eq(animals.id, pets.type))
        .leftJoin(appointments, eq(appointments.patientId, pets.id))
        .where(
          and(
            eq(pets.organizationId, actor.organizationId),
            query.ownerId ? eq(pets.ownerId, query.ownerId) : undefined,
            query.search ? ilike(pets.name, `%${query.search}%`) : undefined,
            cursor ? gt(pets.id, cursor) : undefined,
          ),
        )
        .groupBy(pets.id, clients.name, animals.code)
        .orderBy(asc(pets.id))
        .limit(query.limit + 1);

      const page = rows.slice(0, query.limit);
      const last = page.at(-1);

      return {
        items: page.map((row) =>
          toMobilePatient({
            ...row,
            ownerId: row.ownerId ?? "",
            lastAppointmentAt: row.lastAppointmentAt
              ? new Date(row.lastAppointmentAt)
              : null,
          }),
        ),
        nextCursor:
          rows.length > query.limit && last ? encodeIdCursor(last.id) : null,
      };
    },

    async getPatientHistory(actor, patientId, query) {
      const cursor = query.cursor ? decodeCursor(query.cursor) : null;

      const rows = await db
        .select({
          appointmentId: appointments.id,
          beginAt: appointments.beginAt,
          reportId: advancedReport.id,
          reportStatus: advancedReport.status,
          consultationReason: advancedReport.consultationReason,
        })
        .from(appointments)
        .innerJoin(pets, eq(pets.id, appointments.patientId))
        .leftJoin(advancedReport, eq(advancedReport.appointmentId, appointments.id))
        .where(
          and(
            // Le locataire est filtré sur l'animal comme sur le rendez-vous :
            // un identifiant deviné ne doit rien livrer.
            eq(appointments.organizationId, actor.organizationId),
            eq(pets.organizationId, actor.organizationId),
            eq(appointments.patientId, patientId),
            cursor
              ? or(
                  lte(appointments.beginAt, cursor.beginAt),
                  and(
                    eq(appointments.beginAt, cursor.beginAt),
                    gt(appointments.id, cursor.id),
                  ),
                )
              : undefined,
          ),
        )
        .orderBy(desc(appointments.beginAt), asc(appointments.id))
        .limit(query.limit + 1);

      const page = rows.slice(0, query.limit);
      const last = page.at(-1);

      return {
        items: page.map(toHistoryEntry),
        nextCursor:
          rows.length > query.limit && last
            ? encodeCursor(last.beginAt, last.appointmentId)
            : null,
      };
    },

    async moveAppointment(actor, appointmentId, slot) {
      const beginAt = new Date(slot.beginAt);
      const endAt = new Date(slot.endAt);

      const [target] = await db
        .select({ id: appointments.id })
        .from(appointments)
        .where(
          and(
            eq(appointments.id, appointmentId),
            eq(appointments.organizationId, actor.organizationId),
          ),
        )
        .limit(1);

      if (!target) throw new MobileRequestError("not_found");

      // La fenêtre de lecture est bornée à la journée concernée : détecter un
      // chevauchement ne justifie jamais de charger tout l'agenda.
      const dayStart = new Date(beginAt);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(beginAt);
      dayEnd.setHours(23, 59, 59, 999);

      const candidates = await db
        .select({
          id: appointments.id,
          beginAt: appointments.beginAt,
          endAt: appointments.endAt,
          status: appointments.status,
          patientName: pets.name,
        })
        .from(appointments)
        .leftJoin(pets, eq(appointments.patientId, pets.id))
        .where(
          and(
            eq(appointments.organizationId, actor.organizationId),
            gte(appointments.beginAt, dayStart),
            lte(appointments.beginAt, dayEnd),
          ),
        );

      await db
        .update(appointments)
        .set({ beginAt, endAt, updatedAt: new Date() })
        .where(
          and(
            eq(appointments.id, appointmentId),
            eq(appointments.organizationId, actor.organizationId),
          ),
        );

      // Le même prédicat que le web : les deux surfaces signalent exactement
      // les mêmes chevauchements, par construction.
      const conflicts = findAppointmentConflicts({
        beginAt,
        endAt,
        excludeAppointmentId: appointmentId,
        candidates,
      });

      return {
        appointmentId,
        beginAt: beginAt.toISOString(),
        endAt: endAt.toISOString(),
        conflicts: conflicts.map((conflict) => ({
          appointmentId: conflict.id,
          beginAt: new Date(conflict.beginAt).toISOString(),
          patientName: conflict.patientName,
        })),
      };
    },

    async createOwner(actor, request) {
      const [created] = await db
        .insert(clients)
        .values({
          name: request.name,
          email: request.email ?? null,
          phone: request.phone ?? null,
          city: request.city ?? null,
          organizationId: actor.organizationId,
        })
        .returning({
          id: clients.id,
          name: clients.name,
          email: clients.email,
          phone: clients.phone,
          city: clients.city,
        });

      if (!created) throw new MobileRequestError("server_error", { retryable: true });

      return toMobileOwner({ ...created, patientCount: 0 });
    },

    async createPatient(actor, request) {
      // Le propriétaire est vérifié avant l'insertion : sans ce contrôle, un
      // identifiant deviné rattacherait un animal au dossier d'un autre
      // cabinet.
      const [owner] = await db
        .select({ id: clients.id, name: clients.name })
        .from(clients)
        .where(
          and(
            eq(clients.id, request.ownerId),
            eq(clients.organizationId, actor.organizationId),
          ),
        )
        .limit(1);

      if (!owner) throw new MobileRequestError("not_found");

      const [species] = await db
        .select({ id: animals.id })
        .from(animals)
        .where(eq(animals.code, request.species))
        .limit(1);

      const [created] = await db
        .insert(pets)
        .values({
          name: request.name,
          ownerId: owner.id,
          organizationId: actor.organizationId,
          type: species?.id ?? null,
          breed: request.breed ?? null,
          birthDate: request.birthDate ? new Date(request.birthDate) : null,
        })
        .returning({
          id: pets.id,
          name: pets.name,
          breed: pets.breed,
          birthDate: pets.birthDate,
        });

      if (!created) throw new MobileRequestError("server_error", { retryable: true });

      return toMobilePatient({
        id: created.id,
        ownerId: owner.id,
        ownerName: owner.name,
        name: created.name,
        speciesCode: request.species,
        breed: created.breed,
        birthDate: created.birthDate,
        lastAppointmentAt: null,
      });
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
