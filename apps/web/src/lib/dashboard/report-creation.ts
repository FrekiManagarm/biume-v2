import { buildSessionReportTitle } from "#/functions/appointment-report.service";
import type { DayAgendaAppointment } from "#/lib/dashboard/day-agenda";

/**
 * Construit l'entrée de `createReport` pour le bouton « Créer le compte
 * rendu » d'une carte de rendez-vous, dans `agenda-page.tsx`.
 *
 * Renvoie `null` quand le rendez-vous n'a pas de patient rattaché (garde déjà
 * en place avant ce fix) — sinon le titre suit la même convention que le
 * compte rendu créé automatiquement à la prise de rendez-vous
 * (`buildSessionReportTitle`, tâche 6) : sans ça, ce bouton retombait sur le
 * "Nouveau rapport" générique du serveur, une convention différente pour la
 * même fonctionnalité.
 *
 * Isolée dans son propre module (plutôt que dans `agenda-page.tsx`) pour
 * rester testable sans tirer la chaîne d'imports serveur (`db`, `env`, ...)
 * que `agenda-page.tsx` charge via ses actions.
 */
export function buildReportCreationInput(
  appointment: Pick<DayAgendaAppointment, "id" | "beginAt" | "patient">,
): {
  petId: string;
  appointmentId: string;
  status: "draft";
  title: string;
} | null {
  const petId = appointment.patient?.id;
  if (!petId) return null;

  return {
    petId,
    appointmentId: appointment.id,
    status: "draft",
    title: buildSessionReportTitle(
      appointment.patient?.name ?? null,
      appointment.beginAt,
    ),
  };
}
