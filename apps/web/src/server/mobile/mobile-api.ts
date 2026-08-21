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
  type MobileAppointmentsResponse,
  type MobileCapturesResponse,
  type UploadSessionResponse,
} from "@biume/contracts/capture";
import { OpenAPIHono } from "@hono/zod-openapi";
import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";
import { CaptureServiceError, type CaptureActor } from "./capture.service";
import { buildMobileApiError } from "./mobile-api.errors";
import {
  agendaQuerySchema,
  appointmentsRoute,
  cancelCaptureRoute,
  completeCaptureRoute,
  createCaptureRoute,
  listCapturesRoute,
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

  methodNotAllowed("/appointments");
  methodNotAllowed("/captures");
  methodNotAllowed("/captures/:captureId");
  methodNotAllowed("/captures/:captureId/upload-session");
  methodNotAllowed("/captures/:captureId/complete");

  app.notFound((c) => fail(c, "not_found"));

  app.onError((error, c) => {
    // Hono lève une `HTTPException(400)` sur un corps que `JSON.parse` refuse.
    // C'est une requête invalide, pas une panne du serveur : le client doit
    // pouvoir arrêter sa boucle sans réessayer.
    if (error instanceof HTTPException && error.status === 400) {
      return fail(c, "validation");
    }
    if (error instanceof CaptureServiceError) {
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
