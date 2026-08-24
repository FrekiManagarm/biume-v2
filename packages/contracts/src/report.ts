import { z } from "zod";

export const ownerSourceKinds = [
  "consultationReason",
  "observation",
  "anatomicalIssue",
  "recommendation",
  "notes",
] as const;
export const ownerSourceKindSchema = z.enum(ownerSourceKinds);
export type OwnerSourceKind = z.infer<typeof ownerSourceKindSchema>;

export const reportSectionIds = [
  "clinical",
  "anatomical",
  "recommendations",
  "notes",
] as const;
export const reportSectionIdSchema = z.enum(reportSectionIds);
export type ReportSectionId = z.infer<typeof reportSectionIdSchema>;

export const reportSectionStateValues = [
  "empty",
  "proposed",
  "needs_confirmation",
  "confirmed",
  "not_applicable",
] as const;
export const resolvedReportSectionStateValues = [
  "confirmed",
  "not_applicable",
] as const;
export const reportSectionStateSchema = z.enum(reportSectionStateValues);
export type ReportSectionState = z.infer<typeof reportSectionStateSchema>;

export const reportSectionStatesSchema = z.object({
  clinical: reportSectionStateSchema,
  anatomical: reportSectionStateSchema,
  recommendations: reportSectionStateSchema,
  notes: reportSectionStateSchema,
});
export type ReportSectionStates = z.infer<typeof reportSectionStatesSchema>;

export function createInitialReportSectionStates(): ReportSectionStates {
  return {
    clinical: "empty",
    anatomical: "empty",
    recommendations: "empty",
    notes: "empty",
  };
}

export function canFinalizeReport(states: ReportSectionStates) {
  return Object.values(states).every(
    (state) =>
      resolvedReportSectionStateValues.some((resolved) => resolved === state),
  );
}

export const reportStatuses = ["draft", "finalized", "sent"] as const;
export const reportStatusSchema = z.enum(reportStatuses);
export type ReportStatus = z.infer<typeof reportStatusSchema>;

export type ReportContentSummary = {
  consultationReason: string;
  notes: string | null;
  anatomicalIssueCount: number;
  recommendationCount: number;
};

/**
 * Un compte rendu créé en même temps que son rendez-vous n'a encore rien
 * dedans. Il ne doit pas encombrer la liste des comptes rendus tant que le
 * praticien n'a rien écrit : il vit sur son rendez-vous dans l'agenda.
 *
 * Le titre est exclu : il est généré automatiquement à la création et ne
 * témoigne d'aucune saisie.
 */
export function isReportEmpty(report: ReportContentSummary): boolean {
  return (
    report.consultationReason.trim().length === 0 &&
    (report.notes ?? "").trim().length === 0 &&
    report.anatomicalIssueCount === 0 &&
    report.recommendationCount === 0
  );
}

export const lateralityValues = ["left", "right", "bilateral"] as const;
export const observationTypeValues = [
  "dynamic",
  "static",
  "diagnosticExclusion",
  "none",
] as const;
export const anatomicalIssueTypes = [
  "dysfunction",
  "anatomicalSuspicion",
] as const;
export const persistedAnatomicalIssueTypes = [
  ...anatomicalIssueTypes,
  "observation",
] as const;
export const animalTypes = ["DOG", "CAT", "HORSE"] as const;
export const anatomicalZones = [
  "articulation",
  "fascias",
  "organes",
  "muscles",
] as const;

export const anatomicalEntrySchema = z.object({
  id: z.string().min(1),
  region: z.string(),
  severity: z.number().min(1).max(5),
  notes: z.string(),
  laterality: z.enum(lateralityValues),
  anatomicalPart: z
    .object({
      id: z.string(),
      name: z.string(),
      zone: z.string(),
      animalType: z.string(),
    })
    .optional(),
});

export const observationSchema = anatomicalEntrySchema.extend({
  type: z.enum(observationTypeValues),
  dysfunctionType: z.string().optional(),
  interventionZone: z.string().optional(),
});

export const anatomicalIssueEntrySchema = anatomicalEntrySchema.extend({
  type: z.enum(anatomicalIssueTypes),
  interventionZone: z.string().optional(),
});

export const recommendationSchema = z.object({
  id: z.string().min(1),
  content: z.string(),
});

const reportSchemaBase = z.object({
  title: z.string().min(1, "Le titre est requis"),
  petId: z.string().optional(),
  appointmentId: z.string().optional(),
  consultationReason: z.string().optional().default(""),
  notes: z.string().optional().default(""),
  status: reportStatusSchema.optional().default("draft"),
  observations: z.array(observationSchema).optional().default([]),
  anatomicalIssues: z.array(anatomicalIssueEntrySchema).optional().default([]),
  recommendations: z.array(recommendationSchema).optional().default([]),
  sectionStates: reportSectionStatesSchema
    .optional()
    .default(createInitialReportSectionStates),
});

export const reportSchema = reportSchemaBase.superRefine((report, context) => {
  const anatomicalIds = [
    ...report.observations.map((item) => item.id),
    ...report.anatomicalIssues.map((item) => item.id),
  ];
  if (new Set(anatomicalIds).size !== anatomicalIds.length) {
    context.addIssue({
      code: "custom",
      message: "Les identifiants anatomiques doivent être uniques",
      path: ["anatomicalIssues"],
    });
  }
  const recommendationIds = report.recommendations.map((item) => item.id);
  if (new Set(recommendationIds).size !== recommendationIds.length) {
    context.addIssue({
      code: "custom",
      message: "Les identifiants de recommandation doivent être uniques",
      path: ["recommendations"],
    });
  }
  if (report.status !== "draft" && !canFinalizeReport(report.sectionStates)) {
    context.addIssue({
      code: "custom",
      message: "Chaque section doit être confirmée ou non applicable",
      path: ["sectionStates"],
    });
  }
});

export const createReportSchema = z.object({
  title: z.string().optional(),
  petId: z.string().min(1),
  appointmentId: z.string().optional(),
  consultationReason: z.string().optional(),
  notes: z.string().optional(),
  status: z.literal("draft").optional().default("draft"),
});

export const quickReportSchema = z.object({
  clientRequestId: z.uuid(),
  ownerName: z.string().trim().min(1, "Le nom du propriétaire est requis"),
  ownerEmail: z
    .string()
    .trim()
    .pipe(z.union([z.literal(""), z.string().email()]))
    .optional(),
  animalName: z.string().trim().min(1, "Le nom de l’animal est requis"),
  title: z.string().trim().min(1).default("Nouveau rapport"),
  consultationReason: z.string().trim().default(""),
});

export const ownerReportSnapshotSchema = z.object({
  reportId: z.string().min(1),
  reportRevision: z.number().int().positive(),
  title: z.string(),
  animal: z.object({ id: z.string(), name: z.string() }),
  owner: z.object({ id: z.string(), name: z.string().nullable() }),
  consultationReason: z.string(),
  clinical: z.array(z.string()),
  anatomical: z.array(z.string()),
  recommendations: z.array(z.string()),
  notes: z.string(),
  createdAt: z.string().datetime(),
});
export type OwnerReportSnapshot = z.infer<typeof ownerReportSnapshotSchema>;
