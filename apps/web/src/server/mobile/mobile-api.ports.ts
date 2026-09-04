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
  reportSharedVersion,
} from "@biume/db/schema/index";
import {
  and,
  asc,
  count,
  desc,
  eq,
  gt,
  gte,
  ilike,
  inArray,
  isNotNull,
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
import { assertReportDecidable } from "./report-decision.service";
import { buildSessionReportTitle } from "#/functions/appointment-report.service";
import { createTranscriptRepository } from "#/server/transcription/transcript.repository";
import {
  buildReportSectionStateRows,
  normalizeReportSectionStates,
} from "#/functions/report-domain";
import { createInitialReportSectionStates } from "@biume/contracts/report";
import { classifyTodo, todoCaptureStatuses } from "./todo.service";
import { todoPageSize } from "@biume/contracts/mobile-todo";
import type { Transcript, TranscriptStatus } from "@biume/contracts/transcript";
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
import { createImmutableReportSharedVersion } from "#/functions/report-shared-version.service";
import { reportSharedVersionPorts } from "#/server/report/report-shared-version.ports";
import { generateShareToken } from "#/server/owner/owner-access.service";
import {
  finalizeReport,
  type FinalizeReportPorts,
} from "./finalize-report.service";
import { sendNewReportEmail } from "./report-email";
import { deriveSectionStates } from "#/server/extraction/extraction.service";
import { createProposalRepository } from "#/server/extraction/proposal.repository";
import { findAppointmentConflicts } from "#/lib/dashboard/appointment-conflicts";
import { dayBounds } from "./appointment-write.service";
import {
  createCaptureRepository,
  type CaptureDatabase,
} from "./capture.repository";
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


/**
 * Déclenche l'extraction du compte rendu. Partagée entre la validation de la
 * transcription et la régénération : les deux chemins lancent exactement la
 * même tâche, jamais une variante dupliquée.
 */
async function triggerExtraction(reportId: string, captureId: string) {
  const { tasks } = await import("@trigger.dev/sdk/v3");
  const { extractReportTaskId } = await import(
    "#/trigger/extract-report.trigger"
  );
  await tasks.trigger(extractReportTaskId, { reportId, captureId });
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


/**
 * Le jeton d'un suivi doit être celui du rapport demandé, et de personne
 * d'autre. La jointure passe par `reportSharedVersion`, qui porte à la fois le
 * rapport et son locataire : un lien d'une autre organisation n'est pas
 * seulement improbable, il est hors de portée de la requête.
 */
export async function findReportShareToken(
  database: CaptureDatabase,
  scope: { organizationId: string; reportId: string },
): Promise<string | null> {
  const [link] = await database
    .select({ token: reportShareLink.token })
    .from(reportShareLink)
    .innerJoin(
      reportSharedVersion,
      eq(reportSharedVersion.id, reportShareLink.sharedVersionId),
    )
    .where(
      and(
        eq(reportSharedVersion.reportId, scope.reportId),
        eq(reportSharedVersion.organizationId, scope.organizationId),
        isNull(reportShareLink.revokedAt),
      ),
    )
    .orderBy(desc(reportShareLink.createdAt))
    .limit(1);
  return link?.token ?? null;
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
    // Le nom de l'animal vient du rapport suivi, pas de « n'importe quel
    // animal du propriétaire » : la jointure précédente en tirait un au hasard.
    .innerJoin(advancedReport, eq(advancedReport.id, followUp.reportId))
    .leftJoin(pets, eq(pets.id, advancedReport.patientId))
    .leftJoin(clients, eq(clients.id, pets.ownerId))
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

/**
 * Le même prédicat que le web (`findAppointmentConflicts`) : les deux
 * surfaces signalent exactement les mêmes chevauchements, par construction.
 * La fenêtre de lecture est bornée à la journée concernée : détecter un
 * chevauchement ne justifie jamais de charger tout l'agenda.
 */
async function conflictsOn(
  actor: CaptureActor,
  beginAt: Date,
  endAt: Date,
  excludeAppointmentId?: string,
) {
  const { dayStart, dayEnd } = dayBounds(beginAt);

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

  return findAppointmentConflicts({
    beginAt,
    endAt,
    excludeAppointmentId,
    candidates,
  });
}

/** Le brouillon lié à la séance, s'il en existe un. */
async function linkedReportId(reportScope: {
  organizationId: string;
  appointmentId: string;
}): Promise<string | null> {
  const [report] = await db
    .select({ id: advancedReport.id })
    .from(advancedReport)
    .where(
      and(
        eq(advancedReport.appointmentId, reportScope.appointmentId),
        eq(advancedReport.createdBy, reportScope.organizationId),
      ),
    )
    .limit(1);

  return report?.id ?? null;
}

export async function createProductionMobileApiPorts(
  overrides: { sendReportEmail?: FinalizeReportPorts["sendEmail"] } = {},
): Promise<MobileApiPorts> {
  const sendReportEmail = overrides.sendReportEmail ?? sendNewReportEmail;
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

  const ports: MobileApiPorts = {
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
        .select({ id: advancedReport.id, status: advancedReport.status })
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

      // Un suivi porte un lien vers le compte rendu : sans rapport finalisé,
      // le propriétaire recevrait un questionnaire sur un document qu'il n'a
      // jamais reçu.
      if (report.status === "draft") throw new MobileRequestError("conflict");
      const shareToken = await findReportShareToken(db, {
        organizationId: actor.organizationId,
        reportId,
      });
      if (!shareToken) throw new MobileRequestError("conflict");

      const id = crypto.randomUUID();
      await db.insert(followUp).values({
        id,
        reportId,
        organizationId: actor.organizationId,
        shareToken,
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

    async listTodo(actor) {
      // Trente jours : une dictée plus ancienne non traitée est un cas de
      // support, pas une ligne de liste.
      const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      const rows = await db
        .select({
          captureId: audioCapture.id,
          reportId: audioCapture.reportId,
          appointmentId: audioCapture.appointmentId,
          patientId: audioCapture.patientId,
          captureStatus: audioCapture.status,
          updatedAt: audioCapture.updatedAt,
          patientName: pets.name,
          transcriptStatus: captureTranscript.status,
          reportStatus: advancedReport.status,
        })
        .from(audioCapture)
        .leftJoin(captureTranscript, eq(captureTranscript.captureId, audioCapture.id))
        .leftJoin(advancedReport, eq(advancedReport.id, audioCapture.reportId))
        .leftJoin(pets, eq(pets.id, audioCapture.patientId))
        .where(
          and(
            eq(audioCapture.organizationId, actor.organizationId),
            // `expired` est retenu comme `uploaded` : la purge de l'audio,
            // au bout de 24 h, ne doit pas retirer de la liste une dictée
            // dont le travail n'est pas terminé. `uploadedAt` non nul écarte
            // les captures expirées avant même d'être arrivées : elles n'ont
            // ni transcription ni rapport, et occuperaient une place dans la
            // page au détriment d'une dictée réelle.
            inArray(audioCapture.status, [...todoCaptureStatuses]),
            isNotNull(audioCapture.uploadedAt),
            gte(audioCapture.createdAt, since),
          ),
        )
        .orderBy(desc(audioCapture.createdAt))
        .limit(todoPageSize);

      const reportIds = rows
        .map((row) => row.reportId)
        .filter((id): id is string => id !== null);

      const proposalCounts = reportIds.length
        ? await db
            .select({ reportId: reportProposal.reportId, total: count() })
            .from(reportProposal)
            .where(inArray(reportProposal.reportId, reportIds))
            .groupBy(reportProposal.reportId)
        : [];
      const stateRows = reportIds.length
        ? await db
            .select({
              reportId: reportSectionState.reportId,
              section: reportSectionState.section,
              state: reportSectionState.state,
            })
            .from(reportSectionState)
            .where(inArray(reportSectionState.reportId, reportIds))
        : [];

      const countByReport = new Map(proposalCounts.map((row) => [row.reportId, Number(row.total)]));
      const statesByReport = new Map<string, typeof stateRows>();
      for (const row of stateRows) {
        statesByReport.set(row.reportId, [...(statesByReport.get(row.reportId) ?? []), row]);
      }

      const items = rows.flatMap((row) => {
        const states = row.reportId ? statesByReport.get(row.reportId) : undefined;
        const kind = classifyTodo({
          reportId: row.reportId,
          reportStatus: row.reportStatus,
          transcriptStatus: row.transcriptStatus as TranscriptStatus | null,
          proposalCount: row.reportId ? (countByReport.get(row.reportId) ?? 0) : 0,
          sectionStates: states ? normalizeReportSectionStates(states) : null,
          audioExpired: row.captureStatus === "expired",
          hasPatient: row.patientId !== null,
        });
        if (!kind) return [];
        return [
          {
            kind,
            captureId: row.captureId,
            reportId: row.reportId,
            appointmentId: row.appointmentId,
            patientName: row.patientName ?? null,
            updatedAt: row.updatedAt.toISOString(),
          },
        ];
      });

      return { items };
    },

    async getReportProposals(actor, reportId) {
      return readReportProposals(actor, reportId);
    },

    async decideProposal(actor, reportId, proposalId, request) {
      const current = await readReportProposals(actor, reportId);
      if (!current) throw new MobileRequestError("not_found");
      // La lecture accepte un rapport finalisé, la décision jamais : un
      // compte rendu envoyé au propriétaire ne bouge plus (5.10).
      assertReportDecidable(current.status);

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
      // Sans cette garde, décider une section entière sur un rapport
      // finalisé répondait 200 sans rien changer : un silence qui se lit
      // comme un succès.
      assertReportDecidable(current.status);

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
      // Même classe de mutation que les deux décisions : régénérer réécrit le
      // contenu clinique. Un compte rendu parti chez le propriétaire ne bouge
      // plus (5.10).
      assertReportDecidable(current.status);

      // Sans proposition existante, la source est la capture du rapport, pas
      // une proposition : la toute première extraction n'en a encore laissé
      // aucune.
      const [fromProposal] = await db
        .select({ id: reportProposal.captureId })
        .from(reportProposal)
        .where(eq(reportProposal.reportId, reportId))
        .limit(1);
      const [fromCapture] = await db
        .select({ id: audioCapture.id })
        .from(audioCapture)
        .where(
          and(
            eq(audioCapture.reportId, reportId),
            eq(audioCapture.organizationId, actor.organizationId),
          ),
        )
        .orderBy(desc(audioCapture.createdAt))
        .limit(1);

      const source = fromProposal?.id ?? fromCapture?.id;
      if (source) await triggerExtraction(reportId, source);
      return current;
    },

    async finalizeReport(actor, reportId, request) {
      return finalizeReport(
        { organizationId: actor.organizationId, reportId, sendToOwner: request.sendToOwner, now: new Date() },
        {
          async loadReport(scope) {
            const row = await db.query.advancedReport.findFirst({
              where: and(
                eq(advancedReport.id, scope.reportId),
                eq(advancedReport.createdBy, scope.organizationId),
              ),
              with: { patient: { with: { owner: true } }, sectionStates: true },
            });
            if (!row) return null;
            return {
              id: row.id,
              status: row.status,
              sectionStates: row.sectionStates.map((s) => ({ section: s.section, state: s.state })),
              patient: row.patient
                ? {
                    name: row.patient.name,
                    owner: row.patient.owner
                      ? { id: row.patient.owner.id, name: row.patient.owner.name, email: row.patient.owner.email }
                      : null,
                  }
                : null,
            };
          },
          async markStatus(scope, status, at) {
            await db
              .update(advancedReport)
              .set({ status, updatedAt: at })
              .where(
                and(
                  eq(advancedReport.id, scope.reportId),
                  eq(advancedReport.createdBy, scope.organizationId),
                ),
              );
          },
          async createSharedVersion(scope, at) {
            const version = await createImmutableReportSharedVersion(
              { organizationId: scope.organizationId, reportId: scope.reportId, createdAt: at },
              reportSharedVersionPorts,
            );
            return { id: version.id };
          },
          async findActiveLink({ sharedVersionId, ownerId }) {
            const [link] = await db
              .select({ token: reportShareLink.token })
              .from(reportShareLink)
              .where(
                and(
                  eq(reportShareLink.sharedVersionId, sharedVersionId),
                  eq(reportShareLink.ownerId, ownerId),
                  isNull(reportShareLink.revokedAt),
                ),
              )
              .limit(1);
            return link ?? null;
          },
          async insertLink(link) {
            await db.insert(reportShareLink).values(link);
          },
          generateToken: generateShareToken,
          sendEmail: sendReportEmail,
        },
      );
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

      await db
        .update(appointments)
        .set({ beginAt, endAt, updatedAt: new Date() })
        .where(
          and(
            eq(appointments.id, appointmentId),
            eq(appointments.organizationId, actor.organizationId),
          ),
        );

      const [conflicts, reportId] = await Promise.all([
        conflictsOn(actor, beginAt, endAt, appointmentId),
        linkedReportId({ organizationId: actor.organizationId, appointmentId }),
      ]);

      return {
        appointmentId,
        reportId,
        beginAt: beginAt.toISOString(),
        endAt: endAt.toISOString(),
        conflicts: conflicts.map((conflict) => ({
          appointmentId: conflict.id,
          beginAt: new Date(conflict.beginAt).toISOString(),
          patientName: conflict.patientName,
        })),
      };
    },

    /**
     * L'ostéopathe animalier en tournée prend une séance entre deux portes.
     * Le brouillon naît avec elle, comme sur le web : c'est lui que la
     * dictée du rendez-vous alimentera. Un chevauchement n'empêche jamais
     * l'écriture — il est signalé après coup, au praticien de trancher.
     */
    async createAppointment(actor, request) {
      const beginAt = new Date(request.beginAt);
      const endAt = new Date(request.endAt);

      const [patient] = await db
        .select({ id: pets.id, name: pets.name })
        .from(pets)
        .where(
          and(
            eq(pets.id, request.patientId),
            eq(pets.organizationId, actor.organizationId),
          ),
        )
        .limit(1);
      if (!patient) throw new MobileRequestError("not_found");

      const appointmentId = crypto.randomUUID();
      const reportId = crypto.randomUUID();
      const now = new Date();

      await db.batch([
        db.insert(appointments).values({
          id: appointmentId,
          organizationId: actor.organizationId,
          patientId: patient.id,
          beginAt,
          endAt,
          atHome: request.atHome,
          status: "CREATED",
          createdAt: now,
          updatedAt: now,
        }),
        db.insert(advancedReport).values({
          id: reportId,
          // Le helper partagé du web, jamais une copie de son format : les
          // deux moitiés du produit écrivent dans la même liste, chez le
          // même praticien.
          title: buildSessionReportTitle(patient.name, beginAt),
          consultationReason: "",
          patientId: patient.id,
          appointmentId,
          notes: "",
          status: "draft",
          createdBy: actor.organizationId,
          createdAt: now,
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

      const conflicts = await conflictsOn(actor, beginAt, endAt, appointmentId);

      return {
        appointmentId,
        reportId,
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

    async updateOwnerEmail(actor, ownerId, request) {
      const [updated] = await db
        .update(clients)
        .set({ email: request.email })
        .where(
          and(eq(clients.id, ownerId), eq(clients.organizationId, actor.organizationId)),
        )
        .returning({
          id: clients.id,
          name: clients.name,
          email: clients.email,
          phone: clients.phone,
          city: clients.city,
        });
      if (!updated) throw new MobileRequestError("not_found");

      const [counted] = await db
        .select({ patientCount: count() })
        .from(pets)
        .where(eq(pets.ownerId, ownerId));

      return toMobileOwner({ ...updated, patientCount: counted?.patientCount ?? 0 });
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
        .select({ id: pets.id, name: pets.name })
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
      // Même helper partagé que la création de séance : un brouillon né d'une
      // dictée libre atterrit dans la même liste que les autres.
      const title = buildSessionReportTitle(patient.name, capture.createdAt);

      // Un seul batch : un rapport sans ses états de section ne pourrait
      // jamais être finalisé, et ne serait jamais revendiqué par une capture.
      await db.batch([
        db.insert(advancedReport).values({
          id: reportId,
          title,
          consultationReason: "",
          patientId: patient.id,
          // Jamais le rendez-vous de la capture. Rien n'empêche deux dictées
          // sur la même séance — une tournée hors ligne où l'on dicte deux
          // fois avant de synchroniser — et aucun index unique ne garde cette
          // colonne : deux brouillons porteraient le même rendez-vous.
          // L'historique de l'animal joint les rapports sur le rendez-vous et
          // afficherait la séance deux fois, et `findAppointmentContext` en
          // choisirait un au hasard.
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

    async extractCapture(actor, captureId) {
      const capture = await repository.findCapture({
        id: captureId,
        organizationId: actor.organizationId,
      });
      if (!capture) throw new MobileRequestError("not_found");

      // Contrôlé avant toute écriture : une transcription en attente, échouée
      // ou inaudible n'extrait rien, et le brouillon créé juste avant serait
      // un rapport vide abandonné. Le bouton unique du mobile n'atteint pas
      // ce chemin, l'API si.
      const transcript = await readTranscript(actor, captureId);
      if (
        !transcript ||
        (transcript.status !== "ready" && transcript.status !== "corrected")
      ) {
        throw new MobileRequestError("conflict");
      }

      // Sans rapport, l'extraction n'a nulle part où écrire. Quand l'animal
      // est déjà connu — une capture née d'un rendez-vous créé sans rapport —
      // il n'y a personne à qui le demander : le brouillon se crée ici, sur
      // cet animal-là. Ne rien faire laisserait le praticien devant un écran
      // dont le seul bouton échoue.
      let reportId = capture.reportId;
      if (!reportId && capture.patientId) {
        const attached = await ports.attachCapture(actor, captureId, {
          patientId: capture.patientId,
        });
        reportId = attached.reportId;
      }
      if (!reportId) throw new MobileRequestError("conflict");

      await triggerExtraction(reportId, captureId);
      return { captureId, reportId };
    },
  };

  return ports;
}

type MobileApiPortsCaptureErrorCode = NonNullable<
  Awaited<ReturnType<MobileApiPorts["listCaptures"]>>["items"][number]["lastErrorCode"]
>;
