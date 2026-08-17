import {
  captureResponseSchema,
  completeCaptureRequestSchema,
  createCaptureRequestSchema,
  mobileAppointmentsPageSize,
  mobileAppointmentsResponseSchema,
  mobileCapturesResponseSchema,
  mobileSessionResponseSchema,
  uploadSessionResponseSchema,
  type CaptureErrorCode,
  type CaptureResponse,
  type MobileApiError,
  type MobileAppointmentsResponse,
  type MobileCapturesResponse,
  type UploadSessionResponse,
} from "@biume/contracts/capture";
import { z } from "zod";
import { CaptureServiceError, type CaptureActor } from "./capture.service";

export const mobileAgendaMaxWindowMs = 31 * 24 * 60 * 60 * 1000;
export const mobileAgendaMaxLimit = mobileAppointmentsPageSize;
export const mobileAgendaDefaultLimit = 20;

const apiBasePath = "/api/mobile/v1";

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
};

/**
 * Messages are deliberately generic and localized. Nothing derived from an
 * exception, a database, or a storage provider ever reaches the client.
 */
const errorMessages: Record<CaptureErrorCode, string> = {
  validation: "Requête invalide.",
  unauthorized: "Session expirée, reconnectez-vous.",
  active_organization_required: "Sélectionnez une organisation.",
  forbidden: "Accès refusé.",
  method_not_allowed: "Méthode non supportée.",
  not_found: "Ressource introuvable.",
  conflict: "Cette dictée est dans un état incompatible.",
  rate_limited: "Trop de requêtes, réessayez plus tard.",
  server_error: "Une erreur interne est survenue.",
  storage_unavailable: "Stockage indisponible, réessayez plus tard.",
  object_incomplete: "L'audio envoyé est incomplet, relancez l'envoi.",
  expired: "Cette dictée a expiré.",
  network: "Connexion indisponible.",
  unknown: "Une erreur est survenue.",
};

const errorStatuses: Record<CaptureErrorCode, number> = {
  validation: 400,
  unauthorized: 401,
  active_organization_required: 409,
  forbidden: 403,
  method_not_allowed: 405,
  not_found: 404,
  conflict: 409,
  rate_limited: 429,
  server_error: 500,
  storage_unavailable: 503,
  object_incomplete: 409,
  expired: 410,
  network: 503,
  unknown: 500,
};

const retryableByDefault = new Set<CaptureErrorCode>([
  "rate_limited",
  "server_error",
  "storage_unavailable",
  "object_incomplete",
  "network",
]);

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

function emptyResponse(status: number): Response {
  return new Response(null, {
    status,
    headers: { "cache-control": "no-store" },
  });
}

function errorResponse(
  code: CaptureErrorCode,
  options: { retryable?: boolean } = {},
): Response {
  const body: MobileApiError = {
    code,
    message: errorMessages[code],
    retryable: options.retryable ?? retryableByDefault.has(code),
  };
  return jsonResponse(errorStatuses[code], body);
}

/**
 * Serialized output is validated against the shared contract before it leaves
 * the process. A port that returns more than the contract allows produces an
 * internal error instead of leaking the extra fields.
 */
function validatedResponse<T>(
  status: number,
  schema: z.ZodType<T>,
  payload: unknown,
): Response {
  const result = schema.safeParse(payload);
  if (!result.success) return errorResponse("server_error");
  return jsonResponse(status, result.data);
}

async function readJsonBody(request: Request): Promise<unknown | symbol> {
  const invalid = Symbol.for("mobile.invalid_json");
  const raw = await request.text();
  if (raw.length === 0) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return invalid;
  }
}

const invalidJson = Symbol.for("mobile.invalid_json");

const agendaQuerySchema = z
  .object({
    from: z.iso.datetime().optional(),
    to: z.iso.datetime().optional(),
    limit: z.coerce.number().int().positive().optional(),
    cursor: z.string().min(1).optional(),
  })
  .strict();

const capturesQuerySchema = z
  .object({
    limit: z.coerce.number().int().positive().optional(),
    cursor: z.string().min(1).optional(),
  })
  .strict();

const captureIdSchema = z.uuid();

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

type RouteMatch =
  | { kind: "session" }
  | { kind: "appointments" }
  | { kind: "captures" }
  | { kind: "capture"; captureId: string }
  | { kind: "capture-upload-session"; captureId: string }
  | { kind: "capture-complete"; captureId: string }
  | { kind: "not-found" }
  | { kind: "invalid-capture-id" };

function matchRoute(pathname: string): RouteMatch {
  const suffix = pathname.slice(apiBasePath.length).replace(/^\/+|\/+$/g, "");
  const segments = suffix.length === 0 ? [] : suffix.split("/");

  if (segments.length === 1 && segments[0] === "session") {
    return { kind: "session" };
  }
  if (segments.length === 1 && segments[0] === "appointments") {
    return { kind: "appointments" };
  }
  if (segments.length === 1 && segments[0] === "captures") {
    return { kind: "captures" };
  }
  if (segments[0] === "captures" && segments.length >= 2) {
    const captureId = captureIdSchema.safeParse(segments[1]);
    if (!captureId.success) return { kind: "invalid-capture-id" };
    if (segments.length === 2) {
      return { kind: "capture", captureId: captureId.data };
    }
    if (segments.length === 3 && segments[2] === "upload-session") {
      return { kind: "capture-upload-session", captureId: captureId.data };
    }
    if (segments.length === 3 && segments[2] === "complete") {
      return { kind: "capture-complete", captureId: captureId.data };
    }
  }
  return { kind: "not-found" };
}

const allowedMethods: Record<Exclude<RouteMatch["kind"], "not-found" | "invalid-capture-id">, string[]> =
  {
    session: ["GET"],
    appointments: ["GET"],
    captures: ["GET", "POST"],
    capture: ["DELETE"],
    "capture-upload-session": ["POST"],
    "capture-complete": ["POST"],
  };

export function createMobileApiHandler(
  ports: MobileApiPorts,
  options: { now?: () => Date } = {},
) {
  const now = options.now ?? (() => new Date());

  return async function handle(request: Request): Promise<Response> {
    try {
      const url = new URL(request.url);
      const route = matchRoute(url.pathname);

      if (route.kind === "invalid-capture-id") {
        return errorResponse("validation");
      }
      if (route.kind === "not-found") return errorResponse("not_found");
      if (!allowedMethods[route.kind].includes(request.method)) {
        return errorResponse("method_not_allowed");
      }

      const session = await ports.authenticate(request.headers);
      if (!session) return errorResponse("unauthorized");

      if (route.kind === "session") {
        return validatedResponse(200, mobileSessionResponseSchema, {
          userId: session.userId,
          organization: session.organization,
          canUploadCaptures: session.organization !== null,
        });
      }

      // Every remaining route writes or reads tenant data, so an active
      // organization is a precondition rather than an optional detail.
      if (!session.organization) {
        return errorResponse("active_organization_required");
      }
      const actor: CaptureActor = {
        practitionerId: session.userId,
        organizationId: session.organization.id,
      };

      switch (route.kind) {
        case "appointments": {
          const query = parseAgendaQuery(url, now());
          if ("error" in query) return errorResponse("validation");
          const page = await ports.listAppointments(actor, query);
          return validatedResponse(
            200,
            mobileAppointmentsResponseSchema,
            page,
          );
        }

        case "captures": {
          if (request.method === "GET") {
            const parsed = capturesQuerySchema.safeParse(
              Object.fromEntries(url.searchParams),
            );
            if (!parsed.success) return errorResponse("validation");
            const page = await ports.listCaptures(actor, {
              limit: Math.min(
                parsed.data.limit ?? mobileAgendaDefaultLimit,
                mobileAgendaMaxLimit,
              ),
              cursor: parsed.data.cursor ?? null,
            });
            return validatedResponse(200, mobileCapturesResponseSchema, page);
          }

          const body = await readJsonBody(request);
          if (body === invalidJson) return errorResponse("validation");
          const parsed = createCaptureRequestSchema.safeParse(body);
          if (!parsed.success) return errorResponse("validation");
          const created = await ports.createCapture(actor, parsed.data);
          return validatedResponse(201, captureResponseSchema, created);
        }

        case "capture-upload-session": {
          const session = await ports.createUploadSession(
            actor,
            route.captureId,
          );
          return validatedResponse(200, uploadSessionResponseSchema, session);
        }

        case "capture-complete": {
          const body = await readJsonBody(request);
          if (body === invalidJson) return errorResponse("validation");
          const parsed = completeCaptureRequestSchema.safeParse(body);
          if (!parsed.success) return errorResponse("validation");
          const confirmed = await ports.completeCapture(
            actor,
            route.captureId,
            parsed.data,
          );
          return validatedResponse(200, captureResponseSchema, confirmed);
        }

        case "capture": {
          await ports.cancelCapture(actor, route.captureId);
          return emptyResponse(204);
        }
      }
    } catch (error) {
      if (error instanceof CaptureServiceError) {
        return errorResponse(error.code, { retryable: error.retryable });
      }
      // Anything else is an implementation detail. It is logged upstream, never
      // serialized to the client.
      return errorResponse("server_error");
    }
  };
}

export async function handleMobileApiRequest(
  request: Request,
): Promise<Response> {
  const { createProductionMobileApiPorts } = await import("./mobile-api.ports");
  return createMobileApiHandler(await createProductionMobileApiPorts())(
    request,
  );
}
