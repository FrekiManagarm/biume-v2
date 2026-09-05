import type { AgendaAppointmentStatus } from "./day-agenda";

/**
 * L'état d'une séance tel que le praticien le comprend.
 *
 * La base distingue CREATED et CONFIRMED. Pour un ostéopathe qui saisit
 * lui-même ses rendez-vous, cette nuance n'existe pas : il l'a créé, donc il
 * est prévu. Les deux se lisent « Prévu ».
 */
export type SessionState = "scheduled" | "done" | "cancelled";

export type DeriveSessionStateInput = {
  status: AgendaAppointmentStatus;
  endAt: Date;
  now: Date;
};

/**
 * Une séance devient terminée toute seule quand son heure de fin est passée.
 *
 * Aucune interface ne fait aujourd'hui passer un rendez-vous à COMPLETED, donc
 * s'appuyer sur ce statut revenait à ne jamais proposer le compte rendu. Et
 * demander au praticien de cliquer « séance terminée » serait un geste de plus
 * à retenir, qu'il oublierait.
 */
export function deriveSessionState({
  endAt,
  now,
  status,
}: DeriveSessionStateInput): SessionState {
  if (status === "CANCELLED") return "cancelled";
  if (status === "COMPLETED") return "done";

  return endAt.getTime() <= now.getTime() ? "done" : "scheduled";
}

export function sessionStateLabel(state: SessionState): string {
  if (state === "done") return "Terminé";
  if (state === "cancelled") return "Annulé";

  return "Prévu";
}
