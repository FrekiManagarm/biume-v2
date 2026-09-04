import {
  attachCaptureRequestSchema,
  captureResponseSchema,
  completeCaptureRequestSchema,
  createCaptureRequestSchema,
  extractCaptureResponseSchema,
  mobileApiErrorSchema,
  mobileAppointmentsResponseSchema,
  mobileCapturesResponseSchema,
  mobileSessionResponseSchema,
  uploadSessionResponseSchema,
} from "@biume/contracts/capture";
import {
  appointmentWriteResponseSchema,
  createAppointmentRequestSchema,
  createMobileOwnerRequestSchema,
  createMobilePatientRequestSchema,
  mobileOwnerSchema,
  mobileOwnersResponseSchema,
  mobilePatientSchema,
  mobilePatientHistoryResponseSchema,
  mobilePatientsResponseSchema,
  moveAppointmentRequestSchema,
  updateOwnerEmailRequestSchema,
} from "@biume/contracts/mobile-records";
import {
  correctTranscriptRequestSchema,
  transcriptSchema,
} from "@biume/contracts/transcript";
import {
  decideProposalRequestSchema,
  decideSectionRequestSchema,
  finalizeReportRequestSchema,
  finalizeReportResponseSchema,
  reportProposalsResponseSchema,
} from "@biume/contracts/proposal";
import { reportSectionIds } from "@biume/contracts/report";
import {
  actionableFollowUpsResponseSchema,
  followUpSchema,
  scheduleFollowUpRequestSchema,
} from "@biume/contracts/followup";
import { todoResponseSchema } from "@biume/contracts/mobile-todo";
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

export const createAppointmentRoute = createRoute({
  method: "post",
  path: "/appointments",
  security,
  summary: "Créer une séance depuis le terrain, avec avertissement de conflit",
  request: { body: { content: json(createAppointmentRequestSchema) } },
  responses: {
    201: { description: "Séance créée", content: json(appointmentWriteResponseSchema) },
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

export const attachCaptureRoute = createRoute({
  method: "post",
  path: "/captures/{captureId}/attach",
  security,
  summary: "Rattacher une capture libre à un animal et créer son brouillon",
  request: {
    params: captureIdParamsSchema,
    body: { content: json(attachCaptureRequestSchema) },
  },
  responses: {
    200: { description: "Capture rattachée", content: json(captureResponseSchema) },
    ...errorResponses,
  },
});

export const recordsQuerySchema = z
  .object({
    limit: z.coerce.number().int().positive().optional(),
    cursor: z.string().min(1).optional(),
    search: z.string().trim().min(1).optional(),
  })
  .strict();

export const patientsQuerySchema = recordsQuerySchema.extend({
  ownerId: z.string().min(1).optional(),
});

export const patientIdParamsSchema = z.object({
  patientId: z
    .string()
    .min(1)
    .openapi({ param: { name: "patientId", in: "path" } }),
});

export const ownersRoute = createRoute({
  method: "get",
  path: "/owners",
  security,
  summary: "Propriétaires du cabinet",
  request: { query: recordsQuerySchema },
  responses: {
    200: {
      description: "Page de propriétaires",
      content: json(mobileOwnersResponseSchema),
    },
    ...errorResponses,
  },
});

export const patientsRoute = createRoute({
  method: "get",
  path: "/patients",
  security,
  summary: "Animaux suivis par le cabinet",
  request: { query: patientsQuerySchema },
  responses: {
    200: {
      description: "Page d'animaux",
      content: json(mobilePatientsResponseSchema),
    },
    ...errorResponses,
  },
});

export const patientHistoryRoute = createRoute({
  method: "get",
  path: "/patients/{patientId}/history",
  security,
  summary: "Séances récentes d'un animal et état de leur compte rendu",
  request: { params: patientIdParamsSchema, query: recordsQuerySchema },
  responses: {
    200: {
      description: "Historique",
      content: json(mobilePatientHistoryResponseSchema),
    },
    ...errorResponses,
  },
});

export const createOwnerRoute = createRoute({
  method: "post",
  path: "/owners",
  security,
  summary: "Créer un propriétaire depuis le terrain",
  request: { body: { content: json(createMobileOwnerRequestSchema) } },
  responses: {
    201: { description: "Propriétaire créé", content: json(mobileOwnerSchema) },
    ...errorResponses,
  },
});

export const createPatientRoute = createRoute({
  method: "post",
  path: "/patients",
  security,
  summary: "Créer un animal rattaché à un propriétaire",
  request: { body: { content: json(createMobilePatientRequestSchema) } },
  responses: {
    201: { description: "Animal créé", content: json(mobilePatientSchema) },
    ...errorResponses,
  },
});

export const ownerIdParamsSchema = z.object({
  ownerId: z.string().min(1).openapi({ param: { name: "ownerId", in: "path" } }),
});

export const updateOwnerEmailRoute = createRoute({
  method: "post",
  path: "/owners/{ownerId}/email",
  security,
  summary: "Compléter l'e-mail d'un propriétaire",
  request: {
    params: ownerIdParamsSchema,
    body: { content: json(updateOwnerEmailRequestSchema) },
  },
  responses: {
    200: { description: "Propriétaire mis à jour", content: json(mobileOwnerSchema) },
    ...errorResponses,
  },
});

export const appointmentIdParamsSchema = z.object({
  appointmentId: z
    .string()
    .min(1)
    .openapi({ param: { name: "appointmentId", in: "path" } }),
});

export const moveAppointmentRoute = createRoute({
  method: "post",
  path: "/appointments/{appointmentId}/move",
  security,
  summary: "Déplacer une séance, en signalant les chevauchements",
  request: {
    params: appointmentIdParamsSchema,
    body: { content: json(moveAppointmentRequestSchema) },
  },
  responses: {
    200: {
      description: "Séance déplacée",
      content: json(appointmentWriteResponseSchema),
    },
    ...errorResponses,
  },
});

export const getTranscriptRoute = createRoute({
  method: "get",
  path: "/captures/{captureId}/transcript",
  security,
  summary: "Transcription d'une dictée",
  request: { params: captureIdParamsSchema },
  responses: {
    200: { description: "Transcription", content: json(transcriptSchema) },
    ...errorResponses,
  },
});

export const correctTranscriptRoute = createRoute({
  method: "post",
  path: "/captures/{captureId}/transcript",
  security,
  summary: "Enregistrer la correction du praticien",
  request: {
    params: captureIdParamsSchema,
    body: { content: json(correctTranscriptRequestSchema) },
  },
  responses: {
    200: {
      description: "Transcription corrigée",
      content: json(transcriptSchema),
    },
    ...errorResponses,
  },
});

export const extractCaptureRoute = createRoute({
  method: "post",
  path: "/captures/{captureId}/extract",
  security,
  summary: "Valider la transcription et lancer l'extraction du compte rendu",
  request: { params: captureIdParamsSchema },
  responses: {
    200: { description: "Extraction lancée", content: json(extractCaptureResponseSchema) },
    ...errorResponses,
  },
});

export const reportIdParamsSchema = z.object({
  reportId: z
    .string()
    .min(1)
    .openapi({ param: { name: "reportId", in: "path" } }),
});

export const proposalParamsSchema = reportIdParamsSchema.extend({
  proposalId: z
    .string()
    .min(1)
    .openapi({ param: { name: "proposalId", in: "path" } }),
});

/**
 * La section est validée contre l'énumération partagée : une section inventée
 * produit un 400, jamais une écriture silencieuse.
 */
export const sectionParamsSchema = reportIdParamsSchema.extend({
  // Reconstruite avec le `z` de zod-openapi, seul à porter `.openapi()`, mais
  // depuis la constante partagée : la source de vérité reste unique.
  section: z.enum(reportSectionIds).openapi({
    param: { name: "section", in: "path" },
  }),
});

export const reportProposalsRoute = createRoute({
  method: "get",
  path: "/reports/{reportId}/proposals",
  security,
  summary: "Propositions d'un rapport et transcription qui les justifie",
  request: { params: reportIdParamsSchema },
  responses: {
    200: {
      description: "Propositions",
      content: json(reportProposalsResponseSchema),
    },
    ...errorResponses,
  },
});

export const decideProposalRoute = createRoute({
  method: "post",
  path: "/reports/{reportId}/proposals/{proposalId}/decision",
  security,
  summary: "Confirmer ou écarter une proposition",
  request: {
    params: proposalParamsSchema,
    body: { content: json(decideProposalRequestSchema) },
  },
  responses: {
    200: {
      description: "Propositions à jour",
      content: json(reportProposalsResponseSchema),
    },
    ...errorResponses,
  },
});

export const decideSectionRoute = createRoute({
  method: "post",
  path: "/reports/{reportId}/sections/{section}/decision",
  security,
  summary: "Décider d'une section entière",
  request: {
    params: sectionParamsSchema,
    body: { content: json(decideSectionRequestSchema) },
  },
  responses: {
    200: {
      description: "Propositions à jour",
      content: json(reportProposalsResponseSchema),
    },
    ...errorResponses,
  },
});

export const regenerateProposalsRoute = createRoute({
  method: "post",
  path: "/reports/{reportId}/proposals/regenerate",
  security,
  summary: "Régénérer les propositions encore à vérifier",
  request: { params: reportIdParamsSchema },
  responses: {
    200: {
      description: "Propositions à jour",
      content: json(reportProposalsResponseSchema),
    },
    ...errorResponses,
  },
});

export const finalizeReportRoute = createRoute({
  method: "post",
  path: "/reports/{reportId}/finalize",
  security,
  summary: "Finaliser le compte rendu, le figer et l'envoyer au propriétaire",
  request: {
    params: reportIdParamsSchema,
    body: { content: json(finalizeReportRequestSchema) },
  },
  responses: {
    200: { description: "Rapport finalisé", content: json(finalizeReportResponseSchema) },
    ...errorResponses,
  },
});

export const followUpIdParamsSchema = z.object({
  followUpId: z
    .string()
    .min(1)
    .openapi({ param: { name: "followUpId", in: "path" } }),
});

export const scheduleFollowUpRoute = createRoute({
  method: "post",
  path: "/reports/{reportId}/followup",
  security,
  summary: "Programmer le questionnaire de suivi du propriétaire",
  request: {
    params: reportIdParamsSchema,
    body: { content: json(scheduleFollowUpRequestSchema) },
  },
  responses: {
    201: { description: "Suivi programmé", content: json(followUpSchema) },
    ...errorResponses,
  },
});

export const actionableFollowUpsRoute = createRoute({
  method: "get",
  path: "/followups/actionable",
  security,
  summary: "Suivis dont la réponse demande une action",
  request: { query: recordsQuerySchema },
  responses: {
    200: {
      description: "Suivis actionnables",
      content: json(actionableFollowUpsResponseSchema),
    },
    ...errorResponses,
  },
});

export const markFollowUpHandledRoute = createRoute({
  method: "post",
  path: "/followups/{followUpId}/handled",
  security,
  summary: "Marquer un suivi comme traité",
  request: { params: followUpIdParamsSchema },
  responses: {
    200: { description: "Suivi traité", content: json(followUpSchema) },
    ...errorResponses,
  },
});

export const todoRoute = createRoute({
  method: "get",
  path: "/todo",
  security,
  summary: "Tout ce qui attend un geste du praticien",
  responses: {
    200: { description: "Éléments à traiter", content: json(todoResponseSchema) },
    ...errorResponses,
  },
});
