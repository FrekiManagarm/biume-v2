import {
  followUpMaxDelayDays,
  followUpMinDelayDays,
  type AlertReason,
  type FollowUpStatus,
} from "@biume/contracts/followup";

const dayMs = 24 * 60 * 60 * 1000;

/**
 * Le plancher de trois jours est métier, pas technique : un questionnaire
 * envoyé le lendemain ne mesure rien, le corps n'a pas eu le temps de répondre
 * au travail de la séance.
 */
export function validateDueDate(
  dueAt: Date,
  now: Date,
): "ok" | "too_soon" | "too_far" | "past" {
  const delta = dueAt.getTime() - now.getTime();

  if (delta <= 0) return "past";
  if (delta < followUpMinDelayDays * dayMs) return "too_soon";
  if (delta > followUpMaxDelayDays * dayMs) return "too_far";
  return "ok";
}

/**
 * Ce qui mérite d'interrompre un praticien : une réponse arrivée, qui a
 * déclenché une règle explicite, et qu'il n'a pas encore traitée. Rien d'autre.
 */
export function isActionable(followUp: {
  status: FollowUpStatus;
  alertReasons: readonly AlertReason[];
  handledAt: Date | string | null;
}): boolean {
  return (
    followUp.status === "answered" &&
    followUp.alertReasons.length > 0 &&
    followUp.handledAt === null
  );
}

const alertSentences: Record<AlertReason, string> = {
  declared_worsening: "Le propriétaire signale que son animal va moins bien.",
  reported_reaction: "Le propriétaire a observé une réaction après la séance.",
  contact_requested: "Le propriétaire souhaite être recontacté.",
};

export function summarizeAlert(reasons: readonly AlertReason[]): string {
  return reasons.map((reason) => alertSentences[reason]).join(" ");
}
