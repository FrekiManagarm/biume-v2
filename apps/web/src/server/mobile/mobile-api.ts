import {
  captureResponseSchema,
  completeCaptureRequestSchema,
  createCaptureRequestSchema,
  extractCaptureResponseSchema,
  mobileAppointmentsPageSize,
  mobileAppointmentsResponseSchema,
  mobileCapturesResponseSchema,
  mobileSessionResponseSchema,
  uploadSessionResponseSchema,
  type AttachCaptureRequest,
  type CaptureErrorCode,
  type CaptureResponse,
  type ExtractCaptureResponse,
  type MobileAppointmentsResponse,
  type MobileCapturesResponse,
  type UploadSessionResponse,
} from "@biume/contracts/capture";
import {
  transcriptSchema,
  type CorrectTranscriptRequest,
  type Transcript,
} from "@biume/contracts/transcript";
import {
  reportProposalsResponseSchema,
  type DecideProposalRequest,
  type DecideSectionRequest,
  type ReportProposalsResponse,
} from "@biume/contracts/proposal";
import type { ReportSectionId } from "@biume/contracts/report";
import {
  actionableFollowUpsResponseSchema,
  followUpSchema,
  type ActionableFollowUpsResponse,
  type FollowUp,
  type ScheduleFollowUpRequest,
} from "@biume/contracts/followup";
import { OpenAPIHono } from "@hono/zod-openapi";
import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";
import { CaptureServiceError, type CaptureActor } from "./capture.service";
import { buildMobileApiError, MobileRequestError } from "./mobile-api.errors";
import {
  mobileOwnersResponseSchema,
  mobilePatientHistoryResponseSchema,
  mobilePatientsResponseSchema,
  mobileOwnerSchema,
  mobilePatientSchema,
  mobileRecordsPageSize,
  type CreateMobileOwnerRequest,
  type CreateMobilePatientRequest,
  type MobileOwner,
  type MobileOwnersResponse,
  moveAppointmentResponseSchema,
  type MobilePatient,
  type MobilePatientHistoryResponse,
  type MobilePatientsResponse,
  type MoveAppointmentRequest,
  type MoveAppointmentResponse,
} from "@biume/contracts/mobile-records";
import {
  agendaQuerySchema,
  appointmentsRoute,
  attachCaptureRoute,
  cancelCaptureRoute,
  completeCaptureRoute,
  createCaptureRoute,
  listCapturesRoute,
  correctTranscriptRoute,
  createOwnerRoute,
  actionableFollowUpsRoute,
  decideProposalRoute,
  decideSectionRoute,
  extractCaptureRoute,
  markFollowUpHandledRoute,
  scheduleFollowUpRoute,
  regenerateProposalsRoute,
  reportProposalsRoute,
  createPatientRoute,
  getTranscriptRoute,
  moveAppointmentRoute,
  ownersRoute,
  patientHistoryRoute,
  patientsRoute,
  sessionRoute,
  uploadSessionRoute,
} from "./mobile-api.routes";

export const mobileAgendaMaxWindowMs = 31 * 24 * 60 * 60 * 1000;
export const mobileAgendaMaxLimit = mobileAppointmentsPageSize;
export const mobileAgendaDefaultLimit = 20;

export type MobileSessionContext = {
  userId: string;
  organization: { id: string; name: string } | null;
};

export type MobileAgendaQuery = {
  from: Date;
  to: Date;
  limit: number;
  cursor: string | null;
};

export type MobileCapturesQuery = {
  limit: number;
  cursor: string | null;
};

export type MobileApiPorts = {
  authenticate(headers: Headers): Promise<MobileSessionContext | null>;
  listAppointments(
    actor: CaptureActor,
    query: MobileAgendaQuery,
  ): Promise<MobileAppointmentsResponse>;
  listCaptures(
    actor: CaptureActor,
    query: MobileCapturesQuery,
  ): Promise<MobileCapturesResponse>;
  createCapture(
    actor: CaptureActor,
    request: z.infer<typeof createCaptureRequestSchema>,
  ): Promise<CaptureResponse>;
  createUploadSession(
    actor: CaptureActor,
    captureId: string,
  ): Promise<UploadSessionResponse>;
  completeCapture(
    actor: CaptureActor,
    captureId: string,
    request: z.infer<typeof completeCaptureRequestSchema>,
  ): Promise<CaptureResponse>;
  cancelCapture(actor: CaptureActor, captureId: string): Promise<void>;
  attachCapture(
    actor: CaptureActor,
    captureId: string,
    request: AttachCaptureRequest,
  ): Promise<CaptureResponse>;
  extractCapture(
    actor: CaptureActor,
    captureId: string,
  ): Promise<ExtractCaptureResponse>;
  listOwners(
    actor: CaptureActor,
    query: { limit: number; cursor: string | null; search: string | null },
  ): Promise<MobileOwnersResponse>;
  listPatients(
    actor: CaptureActor,
    query: {
      limit: number;
      cursor: string | null;
      search: string | null;
      ownerId: string | null;
    },
  ): Promise<MobilePatientsResponse>;
  getPatientHistory(
    actor: CaptureActor,
    patientId: string,
    query: { limit: number; cursor: string | null },
  ): Promise<MobilePatientHistoryResponse>;
  createOwner(
    actor: CaptureActor,
    request: CreateMobileOwnerRequest,
  ): Promise<MobileOwner>;
  createPatient(
    actor: CaptureActor,
    request: CreateMobilePatientRequest,
  ): Promise<MobilePatient>;
  moveAppointment(
    actor: CaptureActor,
    appointmentId: string,
    slot: MoveAppointmentRequest,
  ): Promise<MoveAppointmentResponse>;
  getTranscript(
    actor: CaptureActor,
    captureId: string,
  ): Promise<Transcript | null>;
  correctTranscript(
    actor: CaptureActor,
    captureId: string,
    request: CorrectTranscriptRequest,
  ): Promise<Transcript>;
  getReportProposals(
    actor: CaptureActor,
    reportId: string,
  ): Promise<ReportProposalsResponse | null>;
  decideProposal(
    actor: CaptureActor,
    reportId: string,
    proposalId: string,
    request: DecideProposalRequest,
  ): Promise<ReportProposalsResponse>;
  decideSection(
    actor: CaptureActor,
    reportId: string,
    section: ReportSectionId,
    request: DecideSectionRequest,
  ): Promise<ReportProposalsResponse>;
  regenerateProposals(
    actor: CaptureActor,
    reportId: string,
  ): Promise<ReportProposalsResponse>;
  scheduleFollowUp(
    actor: CaptureActor,
    reportId: string,
    request: ScheduleFollowUpRequest,
  ): Promise<FollowUp>;
  listActionableFollowUps(
    actor: CaptureActor,
    query: { limit: number; cursor: string | null },
  ): Promise<ActionableFollowUpsResponse>;
  markFollowUpHandled(
    actor: CaptureActor,
    followUpId: string,
  ): Promise<FollowUp>;
};

function parseAgendaQuery(
  url: URL,
  now: Date,
): MobileAgendaQuery | { error: "validation" } {
  const parsed = agendaQuerySchema.safeParse(
    Object.fromEntries(url.searchParams),
  );
  if (!parsed.success) return { error: "validation" };

  const from = parsed.data.from
    ? new Date(parsed.data.from)
    : new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const to = parsed.data.to
    ? new Date(parsed.data.to)
    : new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  if (to.getTime() < from.getTime()) return { error: "validation" };
  if (to.getTime() - from.getTime() > mobileAgendaMaxWindowMs) {
    return { error: "validation" };
  }

  return {
    from,
    to,
    // Clamped rather than rejected: a client asking for more simply gets the
    // bounded page, and the database is never asked for an unbounded read.
    limit: Math.min(parsed.data.limit ?? mobileAgendaDefaultLimit, mobileAgendaMaxLimit),
    cursor: parsed.data.cursor ?? null,
  };
}

const noStore = { "cache-control": "no-store" };

/**
 * Annotée `Response` plutôt que laissée inférer : `app.openapi()` contraint le
 * retour du gestionnaire au seul schéma de succès déclaré, si bien qu'un
 * chemin d'erreur casserait l'inférence. La garantie qui compte reste la
 * validation contre le contrat partagé, faite à l'exécution.
 */
function fail(c: Context, code: CaptureErrorCode, retryable?: boolean) {
  const { status, body } = buildMobileApiError(
    code,
    retryable === undefined ? {} : { retryable },
  );
  return c.json(body, status as 400, noStore);
}

/**
 * La sortie est validée contre le contrat partagé avant de quitter le
 * processus. Un port qui renvoie plus que le contrat n'autorise produit une
 * erreur interne plutôt que de laisser fuir les champs supplémentaires.
 */
function validated<T, Status extends 200 | 201>(
  c: Context,
  // Générique sur le statut : une signature `200 | 201` produirait une union
  // dont la branche 201 n'est déclarée par aucune route de lecture, et
  // `app.openapi()` la refuserait.
  status: Status,
  schema: z.ZodType<T>,
  payload: unknown,
) {
  const result = schema.safeParse(payload);
  if (!result.success) return fail(c, "server_error");
  return c.json(result.data, status, noStore);
}

type Variables = {
  session: MobileSessionContext;
  actor: CaptureActor;
};

export function createMobileApiApp(
  ports: MobileApiPorts,
  options: { now?: () => Date } = {},
) {
  const now = options.now ?? (() => new Date());

  const app = new OpenAPIHono<{ Variables: Variables }>({
    // Une charge que Zod rejette est une requête invalide, pas une erreur
    // interne : le client doit recevoir le contrat d'erreur habituel.
    defaultHook: (result, c) => {
      if (!result.success) return fail(c, "validation");
    },
  }).basePath("/api/mobile/v1");

  app.openAPIRegistry.registerComponent("securitySchemes", "bearerAuth", {
    type: "http",
    scheme: "bearer",
  });

  app.use("*", async (c, next) => {
    const session = await ports.authenticate(c.req.raw.headers);
    if (!session) return fail(c, "unauthorized");
    c.set("session", session);
    await next();
  });

  /**
   * Hono répond 404 sur un chemin connu servi par une autre méthode, là où le
   * contrat annonce 405. Ces relais sont enregistrés après la route légitime :
   * l'appariement suit l'ordre de déclaration, donc la bonne méthode gagne.
   */
  const methodNotAllowed = (path: string) =>
    app.all(path, (c) => fail(c, "method_not_allowed"));

  app.openapi(sessionRoute, (c) => {
    const session = c.get("session");
    return validated(c, 200, mobileSessionResponseSchema, {
      userId: session.userId,
      organization: session.organization,
      canUploadCaptures: session.organization !== null,
    });
  });

  methodNotAllowed("/session");

  // Toute route au-delà de `/session` lit ou écrit des données de locataire :
  // l'organisation active est une précondition, pas un détail facultatif.
  app.use("*", async (c, next) => {
    const session = c.get("session");
    if (!session.organization) return fail(c, "active_organization_required");
    c.set("actor", {
      practitionerId: session.userId,
      organizationId: session.organization.id,
    });
    await next();
  });

  app.openapi(appointmentsRoute, async (c) => {
    const query = parseAgendaQuery(new URL(c.req.url), now());
    if ("error" in query) return fail(c, "validation");
    const page = await ports.listAppointments(c.get("actor"), query);
    return validated(c, 200, mobileAppointmentsResponseSchema, page);
  });

  // Une limite non bornée transformerait un cabinet chargé en lecture massive.
  // Elle est ramenée à la borne, jamais refusée.
  const boundLimit = (limit: number | undefined) =>
    Math.min(limit ?? mobileAgendaDefaultLimit, mobileRecordsPageSize);

  app.openapi(ownersRoute, async (c) => {
    const { limit, cursor, search } = c.req.valid("query");
    const page = await ports.listOwners(c.get("actor"), {
      limit: boundLimit(limit),
      cursor: cursor ?? null,
      search: search ?? null,
    });
    return validated(c, 200, mobileOwnersResponseSchema, page);
  });

  app.openapi(patientsRoute, async (c) => {
    const { limit, cursor, search, ownerId } = c.req.valid("query");
    const page = await ports.listPatients(c.get("actor"), {
      limit: boundLimit(limit),
      cursor: cursor ?? null,
      search: search ?? null,
      ownerId: ownerId ?? null,
    });
    return validated(c, 200, mobilePatientsResponseSchema, page);
  });

  app.openapi(patientHistoryRoute, async (c) => {
    const { limit, cursor } = c.req.valid("query");
    const page = await ports.getPatientHistory(
      c.get("actor"),
      c.req.valid("param").patientId,
      { limit: boundLimit(limit), cursor: cursor ?? null },
    );
    return validated(c, 200, mobilePatientHistoryResponseSchema, page);
  });

  app.openapi(scheduleFollowUpRoute, async (c) => {
    const scheduled = await ports.scheduleFollowUp(
      c.get("actor"),
      c.req.valid("param").reportId,
      c.req.valid("json"),
    );
    return validated(c, 201, followUpSchema, scheduled);
  });

  app.openapi(actionableFollowUpsRoute, async (c) => {
    const { limit, cursor } = c.req.valid("query");
    const page = await ports.listActionableFollowUps(c.get("actor"), {
      limit: boundLimit(limit),
      cursor: cursor ?? null,
    });
    return validated(c, 200, actionableFollowUpsResponseSchema, page);
  });

  app.openapi(markFollowUpHandledRoute, async (c) => {
    const handled = await ports.markFollowUpHandled(
      c.get("actor"),
      c.req.valid("param").followUpId,
    );
    return validated(c, 200, followUpSchema, handled);
  });

  app.openapi(reportProposalsRoute, async (c) => {
    const found = await ports.getReportProposals(
      c.get("actor"),
      c.req.valid("param").reportId,
    );
    if (!found) return fail(c, "not_found");
    return validated(c, 200, reportProposalsResponseSchema, found);
  });

  // Déclarée avant la route à paramètre : `regenerate` ne doit jamais être lu
  // comme un identifiant de proposition.
  app.openapi(regenerateProposalsRoute, async (c) => {
    const refreshed = await ports.regenerateProposals(
      c.get("actor"),
      c.req.valid("param").reportId,
    );
    return validated(c, 200, reportProposalsResponseSchema, refreshed);
  });

  app.openapi(decideProposalRoute, async (c) => {
    const { reportId, proposalId } = c.req.valid("param");
    const refreshed = await ports.decideProposal(
      c.get("actor"),
      reportId,
      proposalId,
      c.req.valid("json"),
    );
    return validated(c, 200, reportProposalsResponseSchema, refreshed);
  });

  app.openapi(decideSectionRoute, async (c) => {
    const { reportId, section } = c.req.valid("param");
    const refreshed = await ports.decideSection(
      c.get("actor"),
      reportId,
      section,
      c.req.valid("json"),
    );
    return validated(c, 200, reportProposalsResponseSchema, refreshed);
  });

  app.openapi(getTranscriptRoute, async (c) => {
    const found = await ports.getTranscript(
      c.get("actor"),
      c.req.valid("param").captureId,
    );
    if (!found) return fail(c, "not_found");
    return validated(c, 200, transcriptSchema, found);
  });

  app.openapi(correctTranscriptRoute, async (c) => {
    const corrected = await ports.correctTranscript(
      c.get("actor"),
      c.req.valid("param").captureId,
      c.req.valid("json"),
    );
    return validated(c, 200, transcriptSchema, corrected);
  });

  app.openapi(extractCaptureRoute, async (c) => {
    const started = await ports.extractCapture(
      c.get("actor"),
      c.req.valid("param").captureId,
    );
    return validated(c, 200, extractCaptureResponseSchema, started);
  });

  app.openapi(moveAppointmentRoute, async (c) => {
    const result = await ports.moveAppointment(
      c.get("actor"),
      c.req.valid("param").appointmentId,
      c.req.valid("json"),
    );
    return validated(c, 200, moveAppointmentResponseSchema, result);
  });

  app.openapi(createOwnerRoute, async (c) => {
    const created = await ports.createOwner(c.get("actor"), c.req.valid("json"));
    return validated(c, 201, mobileOwnerSchema, created);
  });

  app.openapi(createPatientRoute, async (c) => {
    const created = await ports.createPatient(
      c.get("actor"),
      c.req.valid("json"),
    );
    return validated(c, 201, mobilePatientSchema, created);
  });

  app.openapi(listCapturesRoute, async (c) => {
    const { limit, cursor } = c.req.valid("query");
    const page = await ports.listCaptures(c.get("actor"), {
      limit: Math.min(limit ?? mobileAgendaDefaultLimit, mobileAgendaMaxLimit),
      cursor: cursor ?? null,
    });
    return validated(c, 200, mobileCapturesResponseSchema, page);
  });

  app.openapi(createCaptureRoute, async (c) => {
    const created = await ports.createCapture(
      c.get("actor"),
      c.req.valid("json"),
    );
    return validated(c, 201, captureResponseSchema, created);
  });

  app.openapi(uploadSessionRoute, async (c) => {
    const uploadSession = await ports.createUploadSession(
      c.get("actor"),
      c.req.valid("param").captureId,
    );
    return validated(c, 200, uploadSessionResponseSchema, uploadSession);
  });

  app.openapi(completeCaptureRoute, async (c) => {
    const confirmed = await ports.completeCapture(
      c.get("actor"),
      c.req.valid("param").captureId,
      c.req.valid("json"),
    );
    return validated(c, 200, captureResponseSchema, confirmed);
  });

  app.openapi(cancelCaptureRoute, async (c) => {
    await ports.cancelCapture(c.get("actor"), c.req.valid("param").captureId);
    return c.body(null, 204, noStore);
  });

  app.openapi(attachCaptureRoute, async (c) => {
    const attached = await ports.attachCapture(
      c.get("actor"),
      c.req.valid("param").captureId,
      c.req.valid("json"),
    );
    return validated(c, 200, captureResponseSchema, attached);
  });

  methodNotAllowed("/appointments");
  methodNotAllowed("/captures");
  methodNotAllowed("/captures/:captureId");
  methodNotAllowed("/captures/:captureId/upload-session");
  methodNotAllowed("/captures/:captureId/complete");
  methodNotAllowed("/captures/:captureId/attach");
  methodNotAllowed("/owners");
  methodNotAllowed("/patients");
  methodNotAllowed("/patients/:patientId/history");
  methodNotAllowed("/appointments/:appointmentId/move");
  methodNotAllowed("/captures/:captureId/transcript");
  methodNotAllowed("/captures/:captureId/extract");
  methodNotAllowed("/reports/:reportId/proposals");
  methodNotAllowed("/reports/:reportId/proposals/:proposalId/decision");
  methodNotAllowed("/reports/:reportId/sections/:section/decision");
  methodNotAllowed("/reports/:reportId/followup");
  methodNotAllowed("/followups/actionable");
  methodNotAllowed("/followups/:followUpId/handled");

  app.notFound((c) => fail(c, "not_found"));

  app.onError((error, c) => {
    // Hono lève une `HTTPException(400)` sur un corps que `JSON.parse` refuse.
    // C'est une requête invalide, pas une panne du serveur : le client doit
    // pouvoir arrêter sa boucle sans réessayer.
    if (error instanceof HTTPException && error.status === 400) {
      return fail(c, "validation");
    }
    if (
      error instanceof CaptureServiceError ||
      error instanceof MobileRequestError
    ) {
      return fail(c, error.code, error.retryable);
    }
    // Tout le reste est un détail d'implémentation : journalisé en amont,
    // jamais sérialisé vers le client.
    return fail(c, "server_error");
  });

  return app;
}

export function createMobileApiHandler(
  ports: MobileApiPorts,
  options: { now?: () => Date } = {},
) {
  const app = createMobileApiApp(ports, options);
  // `app.fetch` peut répondre de façon synchrone ; la signature publique reste
  // une promesse, inchangée pour les vingt-six tests existants.
  return async (request: Request): Promise<Response> => app.fetch(request);
}

export async function handleMobileApiRequest(
  request: Request,
): Promise<Response> {
  const { createProductionMobileApiPorts } = await import("./mobile-api.ports");
  return createMobileApiHandler(await createProductionMobileApiPorts())(request);
}
