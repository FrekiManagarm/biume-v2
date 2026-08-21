import { z } from "zod";

export const followUpMinDelayDays = 3;
export const followUpMaxDelayDays = 90;
export const followUpReactionMaxCharacters = 1000;

export const evolutionValues = ["better", "same", "worse"] as const;
export const evolutionSchema = z.enum(evolutionValues);
export type Evolution = z.infer<typeof evolutionSchema>;

export const followUpAnswerSchema = z
  .object({
    evolution: evolutionSchema,
    reaction: z.string().max(followUpReactionMaxCharacters),
    wantsContact: z.boolean(),
  })
  .strict();
export type FollowUpAnswer = z.infer<typeof followUpAnswerSchema>;

export const followUpQuestionSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("scale"),
    id: z.literal("evolution"),
    label: z.string().min(1),
    options: z
      .array(z.object({ value: evolutionSchema, label: z.string().min(1) }))
      .length(3),
  }),
  z.object({
    kind: z.literal("text"),
    id: z.literal("reaction"),
    label: z.string().min(1),
  }),
  z.object({
    kind: z.literal("boolean"),
    id: z.literal("wantsContact"),
    label: z.string().min(1),
  }),
]);

export const followUpQuestionnaireSchema = z
  .object({
    questions: z.array(followUpQuestionSchema).length(3),
  })
  .strict();
export type FollowUpQuestionnaire = z.infer<typeof followUpQuestionnaireSchema>;

/**
 * Standardisé mais modifiable. Le propriétaire n'est pas un professionnel : les
 * libellés disent ce qu'il observe, jamais ce que le praticien en déduira.
 */
export const defaultFollowUpQuestionnaire: FollowUpQuestionnaire = {
  questions: [
    {
      kind: "scale",
      id: "evolution",
      label: "Comment va votre animal depuis la séance ?",
      options: [
        { value: "better", label: "Mieux" },
        { value: "same", label: "Pareil" },
        { value: "worse", label: "Moins bien" },
      ],
    },
    {
      kind: "text",
      id: "reaction",
      label: "Avez-vous remarqué une réaction ou un changement particulier ?",
    },
    {
      kind: "boolean",
      id: "wantsContact",
      label: "Souhaitez-vous être recontacté ?",
    },
  ],
};

export const alertReasons = [
  "declared_worsening",
  "reported_reaction",
  "contact_requested",
] as const;
export const alertReasonSchema = z.enum(alertReasons);
export type AlertReason = z.infer<typeof alertReasonSchema>;

/**
 * Trois règles explicites, et elles seules. Le praticien doit pouvoir prédire
 * ce qui va le déranger : une alerte imprévisible finit ignorée, et une alerte
 * ignorée ne protège personne.
 *
 * « Pareil » n'est pas une dégradation : alerter dessus noierait les vraies
 * alertes.
 */
export function evaluateAlertRules(answer: FollowUpAnswer): AlertReason[] {
  const reasons: AlertReason[] = [];

  if (answer.evolution === "worse") reasons.push("declared_worsening");
  if (answer.reaction.trim().length > 0) reasons.push("reported_reaction");
  if (answer.wantsContact) reasons.push("contact_requested");

  return reasons;
}

export const followUpStatuses = [
  "scheduled",
  "sent",
  "answered",
  "cancelled",
] as const;
export const followUpStatusSchema = z.enum(followUpStatuses);
export type FollowUpStatus = z.infer<typeof followUpStatusSchema>;

/**
 * `answered` est terminal : une réponse de propriétaire est une donnée reçue,
 * et rien ne doit pouvoir la défaire.
 */
const allowedTransitions = {
  scheduled: ["sent", "cancelled"],
  sent: ["answered", "cancelled"],
  answered: [],
  cancelled: [],
} as const satisfies Record<FollowUpStatus, readonly FollowUpStatus[]>;

export function canTransitionFollowUp(
  from: FollowUpStatus,
  to: FollowUpStatus,
): boolean {
  return allowedTransitions[from].some((allowed) => allowed === to);
}

const isoDateTimeSchema = z.iso.datetime();

export const scheduleFollowUpRequestSchema = z
  .object({
    dueAt: isoDateTimeSchema,
    questionnaire: followUpQuestionnaireSchema,
  })
  .strict();
export type ScheduleFollowUpRequest = z.infer<
  typeof scheduleFollowUpRequestSchema
>;

export const followUpSchema = z
  .object({
    id: z.string().min(1),
    reportId: z.string().min(1),
    patientName: z.string().min(1),
    ownerName: z.string().min(1),
    status: followUpStatusSchema,
    dueAt: isoDateTimeSchema,
    answeredAt: isoDateTimeSchema.nullable(),
    answer: followUpAnswerSchema.nullable(),
    alertReasons: z.array(alertReasonSchema),
    handledAt: isoDateTimeSchema.nullable(),
  })
  .strict();
export type FollowUp = z.infer<typeof followUpSchema>;

export const actionableFollowUpsResponseSchema = z
  .object({
    items: z.array(followUpSchema).max(50),
    nextCursor: z.string().min(1).nullable(),
  })
  .strict();
export type ActionableFollowUpsResponse = z.infer<
  typeof actionableFollowUpsResponseSchema
>;
