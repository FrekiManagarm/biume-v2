import {
  captureResponseSchema,
  completeCaptureRequestSchema,
  createCaptureRequestSchema,
  mobileApiErrorSchema,
  mobileAppointmentsResponseSchema,
  mobileCapturesResponseSchema,
  mobileSessionResponseSchema,
  uploadSessionResponseSchema,
} from "@biume/contracts/capture";
import { createRoute, z } from "@hono/zod-openapi";

const json = <T>(schema: T) => ({ "application/json": { schema } });

/**
 * Le client Dart génère sa gestion d'erreur depuis la spécification : une
 * réponse d'erreur non décrite deviendrait un cas non traité sur le terrain.
 * Chaque route les déclare toutes.
 */
const errorResponses = {
  400: { description: "Requête invalide", content: json(mobileApiErrorSchema) },
  401: { description: "Session expirée", content: json(mobileApiErrorSchema) },
  403: { description: "Accès refusé", content: json(mobileApiErrorSchema) },
  404: { description: "Introuvable", content: json(mobileApiErrorSchema) },
  405: {
    description: "Méthode non supportée",
    content: json(mobileApiErrorSchema),
  },
  409: {
    description: "État incompatible",
    content: json(mobileApiErrorSchema),
  },
  410: { description: "Dictée expirée", content: json(mobileApiErrorSchema) },
  429: { description: "Trop de requêtes", content: json(mobileApiErrorSchema) },
  500: { description: "Erreur interne", content: json(mobileApiErrorSchema) },
  503: {
    description: "Service indisponible",
    content: json(mobileApiErrorSchema),
  },
};

const security = [{ bearerAuth: [] }];

export const captureIdParamsSchema = z.object({
  captureId: z.uuid().openapi({ param: { name: "captureId", in: "path" } }),
});

export const agendaQuerySchema = z
  .object({
    from: z.iso.datetime().optional(),
    to: z.iso.datetime().optional(),
    limit: z.coerce.number().int().positive().optional(),
    cursor: z.string().min(1).optional(),
  })
  .strict();

export const capturesQuerySchema = z
  .object({
    limit: z.coerce.number().int().positive().optional(),
    cursor: z.string().min(1).optional(),
  })
  .strict();

export const sessionRoute = createRoute({
  method: "get",
  path: "/session",
  security,
  summary: "Session et organisation active du praticien",
  responses: {
    200: { description: "Session", content: json(mobileSessionResponseSchema) },
    ...errorResponses,
  },
});

export const appointmentsRoute = createRoute({
  method: "get",
  path: "/appointments",
  security,
  summary: "Rendez-vous sur une fenêtre bornée",
  request: { query: agendaQuerySchema },
  responses: {
    200: {
      description: "Page de rendez-vous",
      content: json(mobileAppointmentsResponseSchema),
    },
    ...errorResponses,
  },
});

export const listCapturesRoute = createRoute({
  method: "get",
  path: "/captures",
  security,
  summary: "Dictées du praticien",
  request: { query: capturesQuerySchema },
  responses: {
    200: {
      description: "Page de dictées",
      content: json(mobileCapturesResponseSchema),
    },
    ...errorResponses,
  },
});

export const createCaptureRoute = createRoute({
  method: "post",
  path: "/captures",
  security,
  summary: "Déclarer une dictée enregistrée sur l'appareil",
  request: { body: { content: json(createCaptureRequestSchema) } },
  responses: {
    201: { description: "Dictée créée", content: json(captureResponseSchema) },
    ...errorResponses,
  },
});

export const uploadSessionRoute = createRoute({
  method: "post",
  path: "/captures/{captureId}/upload-session",
  security,
  summary: "Obtenir une URL signée pour téléverser l'audio",
  request: { params: captureIdParamsSchema },
  responses: {
    200: {
      description: "Session de téléversement",
      content: json(uploadSessionResponseSchema),
    },
    ...errorResponses,
  },
});

export const completeCaptureRoute = createRoute({
  method: "post",
  path: "/captures/{captureId}/complete",
  security,
  summary: "Confirmer que l'audio est bien arrivé",
  request: {
    params: captureIdParamsSchema,
    body: { content: json(completeCaptureRequestSchema) },
  },
  responses: {
    200: {
      description: "Dictée confirmée",
      content: json(captureResponseSchema),
    },
    ...errorResponses,
  },
});

export const cancelCaptureRoute = createRoute({
  method: "delete",
  path: "/captures/{captureId}",
  security,
  summary: "Annuler une dictée et supprimer son audio",
  request: { params: captureIdParamsSchema },
  responses: {
    204: { description: "Dictée annulée" },
    ...errorResponses,
  },
});
