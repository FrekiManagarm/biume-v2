import { createHash } from "node:crypto";
import { patientSpeciesSchema } from "@biume/contracts/capture";
import { db } from "@biume/db";
import {
  advancedReport,
  animals,
  appointments,
  audioCapture,
  captureTranscript,
  clients,
  followUp,
  followUpAlert,
  reportShareLink,
  pets,
  reportProposal,
  reportSectionState,
} from "@biume/db/schema/index";
import {
  and,
  asc,
  desc,
  eq,
  gt,
  gte,
  ilike,
  isNull,
  lte,
  or,
  sql,
} from "drizzle-orm";
import {
  cancelCapture,
  completeCapture,
  createCapture,
  createUploadSession,
  toCaptureResponse,
  type CaptureActor,
  type CaptureServiceDependencies,
} from "./capture.service";
import { MobileRequestError } from "./mobile-api.errors";
import { createTranscriptRepository } from "#/server/transcription/transcript.repository";
import { buildReportSectionStateRows } from "#/functions/report-domain";
import { createInitialReportSectionStates } from "@biume/contracts/report";
import type { Transcript } from "@biume/contracts/transcript";
import type {
  Proposal,
  ReportProposalsResponse,
} from "@biume/contracts/proposal";
import type { ReportSectionId } from "@biume/contracts/report";
import {
  defaultFollowUpQuestionnaire,
  type AlertReason,
  type FollowUp,
} from "@biume/contracts/followup";
import { validateDueDate } from "#/server/followup/followup.service";
import { deriveSectionStates } from "#/server/extraction/extraction.service";
import { createProposalRepository } from "#/server/extraction/proposal.repository";
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

/**
 * La jointure sur `audioCapture` porte le filtre de locataire : sans elle, un
 * identifiant de capture deviné livrerait la transcription d'un autre cabinet,
 * c'est-à-dire des données de santé.
 */
async function readTranscript(
  actor: CaptureActor,
  captureId: string,
): Promise<Transcript | null> {
  const [row] = await db
    .select({
      captureId: captureTranscript.captureId,
      status: captureTranscript.status,
      text: captureTranscript.text,
      language: captureTranscript.language,
      provider: captureTranscript.provider,
      correctedAt: captureTranscript.correctedAt,
      createdAt: captureTranscript.createdAt,
      updatedAt: captureTranscript.updatedAt,
    })
    .from(captureTranscript)
    .innerJoin(audioCapture, eq(audioCapture.id, captureTranscript.captureId))
    .where(
      and(
        eq(captureTranscript.captureId, captureId),
        eq(audioCapture.organizationId, actor.organizationId),
      ),
    )
    .limit(1);

  if (!row) return null;

  return {
    captureId: row.captureId,
    status: row.status,
    text: row.text,
    language: row.language,
    // Une transcription jamais exécutée n'a pas de fournisseur ; le contrat en
    // exige un, et « aucun » est l'information juste.
    provider: row.provider.length > 0 ? row.provider : "aucun",
    correctedAt: row.correctedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}


function toProposal(row: typeof reportProposal.$inferSelect): Proposal {
  return {
    id: row.id,
    reportId: row.reportId,
    section: row.section as Proposal["section"],
    kind: row.kind as Proposal["kind"],
    text: row.text,
    state: row.state as Proposal["state"],
    anchor: {
      start: row.anchorStart,
      end: row.anchorEnd,
      quote: row.anchorQuote,
    },
    decidedAt: row.decidedAt?.toISOString() ?? null,
  };
}

/**
 * Un rapport contient des données de santé : le filtre de locataire est
 * vérifié avant toute lecture de proposition, et un identifiant deviné ne
 * livre rien.
 */
async function readReportProposals(
  actor: CaptureActor,
  reportId: string,
): Promise<ReportProposalsResponse | null> {
  const [report] = await db
    .select({
      id: advancedReport.id,
      status: advancedReport.status,
      patientName: pets.name,
      ownerId: clients.id,
      ownerName: clients.name,
      ownerEmail: clients.email,
    })
    .from(advancedReport)
    .leftJoin(pets, eq(pets.id, advancedReport.patientId))
    .leftJoin(clients, eq(clients.id, pets.ownerId))
    .where(
      and(
        eq(advancedReport.id, reportId),
        eq(advancedReport.createdBy, actor.organizationId),
      ),
    )
    .limit(1);

  if (!report) return null;

  const rows = await db
    .select()
    .from(reportProposal)
    .where(eq(reportProposal.reportId, reportId))
    .orderBy(asc(reportProposal.createdAt));

  const items = rows.map(toProposal);

  // La transcription voyage avec les propositions pour que le mobile puisse
  // surligner la source sans second appel.
  const captureId = rows.find((row) => row.captureId !== null)?.captureId;
  const [transcript] = captureId
    ? await db
        .select({ text: captureTranscript.text })
        .from(captureTranscript)
        .where(eq(captureTranscript.captureId, captureId))
        .limit(1)
    : [];

  return {
    reportId,
    status: report.status,
    patientName: report.patientName ?? "Animal sans nom",
    owner: {
      id: report.ownerId ?? "",
      name: report.ownerName ?? "Propriétaire sans nom",
      email: report.ownerEmail ?? null,
    },
    captureId: captureId ?? null,
    transcript: transcript?.text ?? "",
    items,
    sections: deriveSectionStates(items),
  };
}

/**
 * Les états de section sont déduits des propositions après chaque décision,
 * jamais posés à la main : deux sources de vérité finiraient par se
 * contredire.
 */
async function syncAndReread(
  actor: CaptureActor,
  reportId: string,
): Promise<ReportProposalsResponse> {
  const refreshed = await readReportProposals(actor, reportId);
  if (!refreshed) throw new MobileRequestError("not_found");

  await createProposalRepository().syncSectionStates(
    reportId,
    refreshed.sections as never,
  );

  return refreshed;
}


async function readFollowUp(
  actor: CaptureActor,
  followUpId: string,
): Promise<FollowUp | null> {
  const [row] = await db
    .select({
      id: followUp.id,
      reportId: followUp.reportId,
      status: followUp.status,
      answer: followUp.answer,
      dueAt: followUp.dueAt,
      answeredAt: followUp.answeredAt,
      handledAt: followUp.handledAt,
      patientName: pets.name,
      ownerName: clients.name,
    })
    .from(followUp)
    .leftJoin(reportShareLink, eq(reportShareLink.token, followUp.shareToken))
    .leftJoin(clients, eq(clients.id, reportShareLink.ownerId))
    .leftJoin(pets, eq(pets.ownerId, clients.id))
    .where(
      and(
        eq(followUp.id, followUpId),
        // Le locataire est porté par la colonne du suivi lui-même : un
        // identifiant deviné ne livre rien.
        eq(followUp.organizationId, actor.organizationId),
      ),
    )
    .limit(1);

  if (!row) return null;

  const alerts = await db
    .select({ reason: followUpAlert.reason })
    .from(followUpAlert)
    .where(eq(followUpAlert.followUpId, row.id));

  return {
    id: row.id,
    reportId: row.reportId,
    patientName: row.patientName ?? "Animal sans nom",
    ownerName: row.ownerName ?? "Propriétaire sans nom",
    status: row.status,
    dueAt: row.dueAt.toISOString(),
    answeredAt: row.answeredAt?.toISOString() ?? null,
    answer: row.answer ?? null,
    alertReasons: alerts.map((alert) => alert.reason as AlertReason),
    handledAt: row.handledAt?.toISOString() ?? null,
  };
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

    async scheduleFollowUp(actor, reportId, request) {
      const [report] = await db
        .select({ id: advancedReport.id })
        .from(advancedReport)
        .where(
          and(
            eq(advancedReport.id, reportId),
            eq(advancedReport.createdBy, actor.organizationId),
          ),
        )
        .limit(1);

      if (!report) throw new MobileRequestError("not_found");

      // Le plancher métier est appliqué ici, pas seulement dans l'interface.
      if (validateDueDate(new Date(request.dueAt), new Date()) !== "ok") {
        throw new MobileRequestError("validation");
      }

      const [link] = await db
        .select({ token: reportShareLink.token })
        .from(reportShareLink)
        .limit(1);

      const id = crypto.randomUUID();
      await db.insert(followUp).values({
        id,
        reportId,
        organizationId: actor.organizationId,
        shareToken: link?.token ?? null,
        questionnaire: request.questionnaire ?? defaultFollowUpQuestionnaire,
        dueAt: new Date(request.dueAt),
      });

      const created = await readFollowUp(actor, id);
      if (!created) throw new MobileRequestError("server_error", { retryable: true });

      return created;
    },

    async listActionableFollowUps(actor, query) {
      // Le filtre est en SQL : « arrivé, alerté, non traité » ne doit jamais
      // être calculé après une lecture non bornée.
      const rows = await db
        .selectDistinct({ id: followUp.id, dueAt: followUp.dueAt })
        .from(followUp)
        .innerJoin(followUpAlert, eq(followUpAlert.followUpId, followUp.id))
        .where(
          and(
            eq(followUp.organizationId, actor.organizationId),
            eq(followUp.status, "answered"),
            isNull(followUp.handledAt),
          ),
        )
        .orderBy(desc(followUp.dueAt))
        .limit(query.limit + 1);

      const page = rows.slice(0, query.limit);
      const items = (
        await Promise.all(page.map((row) => readFollowUp(actor, row.id)))
      ).filter((item): item is FollowUp => item !== null);

      return { items, nextCursor: null };
    },

    async markFollowUpHandled(actor, followUpId) {
      const now = new Date();
      const [updated] = await db
        .update(followUp)
        .set({ handledAt: now, updatedAt: now })
        .where(
          and(
            eq(followUp.id, followUpId),
            eq(followUp.organizationId, actor.organizationId),
          ),
        )
        .returning({ id: followUp.id });

      if (!updated) throw new MobileRequestError("not_found");

      const handled = await readFollowUp(actor, followUpId);
      if (!handled) throw new MobileRequestError("not_found");

      return handled;
    },

    async getReportProposals(actor, reportId) {
      return readReportProposals(actor, reportId);
    },

    async decideProposal(actor, reportId, proposalId, request) {
      const current = await readReportProposals(actor, reportId);
      if (!current) throw new MobileRequestError("not_found");

      const decided = await createProposalRepository().decide(
        reportId,
        proposalId,
        request.state,
      );
      if (!decided) throw new MobileRequestError("conflict");

      return syncAndReread(actor, reportId);
    },

    async decideSection(actor, reportId, section, request) {
      const current = await readReportProposals(actor, reportId);
      if (!current) throw new MobileRequestError("not_found");

      await createProposalRepository().decideSection(
        reportId,
        section as ReportSectionId,
        request.state,
      );

      return syncAndReread(actor, reportId);
    },

    async regenerateProposals(actor, reportId) {
      const current = await readReportProposals(actor, reportId);
      if (!current) throw new MobileRequestError("not_found");

      const captureId = await db
        .select({ id: reportProposal.captureId })
        .from(reportProposal)
        .where(eq(reportProposal.reportId, reportId))
        .limit(1);

      const source = captureId[0]?.id;
      if (source) {
        const { tasks } = await import("@trigger.dev/sdk/v3");
        const { extractReportTaskId } = await import(
          "#/trigger/extract-report.trigger"
        );
        await tasks.trigger(extractReportTaskId, { reportId, captureId: source });
      }

      return current;
    },

    async getTranscript(actor, captureId) {
      return readTranscript(actor, captureId);
    },

    async correctTranscript(actor, captureId, request) {
      const existing = await readTranscript(actor, captureId);
      if (!existing) throw new MobileRequestError("not_found");

      const corrected = await createTranscriptRepository().correct(
        captureId,
        request.text,
      );
      if (!corrected) throw new MobileRequestError("conflict");

      const refreshed = await readTranscript(actor, captureId);
      if (!refreshed) throw new MobileRequestError("not_found");

      return refreshed;
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

    async attachCapture(actor, captureId, request) {
      const scope = { id: captureId, organizationId: actor.organizationId };
      const capture = await repository.findCapture(scope);
      if (!capture) throw new MobileRequestError("not_found");

      // Idempotent sur le même animal ; contradictoire sur un autre. Une
      // extraction déjà faite s'appuie sur ce rapport : on ne le déplace pas.
      if (capture.reportId) {
        if (capture.patientId === request.patientId) {
          return toCaptureResponse(capture);
        }
        throw new MobileRequestError("conflict");
      }

      const [patient] = await db
        .select({ id: pets.id })
        .from(pets)
        .where(
          and(
            eq(pets.id, request.patientId),
            eq(pets.organizationId, actor.organizationId),
          ),
        )
        .limit(1);
      if (!patient) throw new MobileRequestError("not_found");

      const now = new Date();
      const reportId = crypto.randomUUID();
      const title = `Séance du ${new Intl.DateTimeFormat("fr-FR", {
        dateStyle: "long",
        timeZone: "Europe/Paris",
      }).format(capture.createdAt)}`;

      // Un seul batch : un rapport sans ses états de section ne pourrait
      // jamais être finalisé, et ne serait jamais revendiqué par une capture.
      await db.batch([
        db.insert(advancedReport).values({
          id: reportId,
          title,
          consultationReason: "",
          patientId: patient.id,
          appointmentId: null,
          notes: "",
          status: "draft",
          createdBy: actor.organizationId,
          createdAt: now,
        }),
        db
          .insert(reportSectionState)
          .values(
            buildReportSectionStateRows(reportId, createInitialReportSectionStates()),
          ),
      ] as const);

      // Le prédicat `isNull(reportId)` fait office de verrou : deux
      // rattachements concurrents ne produisent qu'un rapport vivant.
      const [claimed] = await db
        .update(audioCapture)
        .set({ patientId: patient.id, reportId, updatedAt: now })
        .where(
          and(
            eq(audioCapture.id, captureId),
            eq(audioCapture.organizationId, actor.organizationId),
            isNull(audioCapture.reportId),
          ),
        )
        .returning({ id: audioCapture.id });

      if (!claimed) {
        await db.delete(advancedReport).where(eq(advancedReport.id, reportId));
        const current = await repository.findCapture(scope);
        if (!current) throw new MobileRequestError("not_found");
        if (current.patientId !== request.patientId) {
          throw new MobileRequestError("conflict");
        }
        return toCaptureResponse(current);
      }

      const refreshed = await repository.findCapture(scope);
      if (!refreshed) throw new MobileRequestError("not_found");
      return toCaptureResponse(refreshed);
    },
  };
}

type MobileApiPortsCaptureErrorCode = NonNullable<
  Awaited<ReturnType<MobileApiPorts["listCaptures"]>>["items"][number]["lastErrorCode"]
>;
