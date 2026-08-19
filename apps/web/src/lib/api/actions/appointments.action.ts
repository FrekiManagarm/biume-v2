import {
  createAppointment as createAppointmentFn,
  deleteAppointment as deleteAppointmentFn,
  getAppointments as getAppointmentsFn,
  getAppointmentsByPatientId as getAppointmentsByPatientIdFn,
  getAppointmentsWithoutReport as getAppointmentsWithoutReportFn,
  getTodayAppointments as getTodayAppointmentsFn,
  updateAppointment as updateAppointmentFn,
} from "#/functions/appointments.function";

export function getAppointments(range: { fromISO: string; toISO: string }) {
  return getAppointmentsFn({ data: range });
}

export function createAppointment(input: {
  atHome?: boolean;
  beginAt: Date;
  endAt: Date;
  note?: string;
  notifyOwner?: boolean;
  patientId: string;
  withReport?: boolean;
}) {
  return createAppointmentFn({ data: input });
}

/**
 * Modifier un rendez-vous existant.
 *
 * Tous les champs sont optionnels côté serveur : l'agenda s'en sert aussi bien
 * pour enregistrer le dialogue de modification que pour poser le seul statut
 * `CANCELLED` quand le praticien annule la séance. Annuler n'est pas
 * supprimer — le rendez-vous reste dans l'agenda, marqué « Annulé ».
 */
export function updateAppointment(input: {
  appointmentId: string;
  atHome?: boolean;
  beginAt?: Date;
  endAt?: Date;
  note?: string;
  patientId?: string;
  status?: "CREATED" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
}) {
  return updateAppointmentFn({ data: input });
}

/**
 * Supprimer un rendez-vous, définitivement.
 *
 * La fonction serveur supprime au passage le brouillon de compte rendu resté
 * vide qui lui était rattaché, et détache les autres : l'appelant n'a donc
 * rien à orchestrer, seulement à invalider la liste des rendez-vous.
 */
export function deleteAppointment(appointmentId: string) {
  return deleteAppointmentFn({ data: { appointmentId } });
}

export function getAppointmentsByPatientId(patientId: string) {
  return getAppointmentsByPatientIdFn({ data: { patientId } });
}

export function getAppointmentsWithoutReport(daysBack = 30) {
  return getAppointmentsWithoutReportFn({ data: { daysBack } });
}

export function getTodayAppointments() {
  return getTodayAppointmentsFn();
}
