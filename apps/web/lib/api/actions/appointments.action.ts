import { internalGet } from "#/lib/http/internal-fetch";
import type { AppointmentWindowInput } from "#/functions/appointments.function";

import {
  createAppointment as createAppointmentFn,
  deleteAppointment as deleteAppointmentFn,
  getAppointmentsWithoutReport as getAppointmentsWithoutReportFn,
  updateAppointment as updateAppointmentFn,
} from "./appointments.mutations";

// Les mutations sont des Server Actions ; les réexporter d'ici garde le
// contrat que les composants consomment déjà.
export { getTodayAppointments } from "./appointments.mutations";

// Règle à respecter dans ce fichier : tout import venant de `*.function.ts`
// y reste en position de type (`import type`, ou `typeof import(...)`
// ci-dessous). C'est ce qui garde `db`, `next/headers` et le reste des
// dépendances serveur de la fonction pure hors du bundle client — un import
// de valeur romprait cette propriété sans qu'aucun test ne le signale.
type AppointmentListItem = Awaited<
  ReturnType<typeof import("#/functions/appointments.function").getAppointments>
>[number];

type AppointmentDetail = Awaited<
  ReturnType<
    typeof import("#/functions/appointments.function").getAppointmentsByPatientId
  >
>[number];

export function getAppointments(range: AppointmentWindowInput) {
  return internalGet<AppointmentListItem[]>("/api/internal/appointments", range);
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
  return createAppointmentFn(input);
}

export function updateAppointment(input: {
  appointmentId: string;
  patientId?: string;
  beginAt?: Date;
  endAt?: Date;
  atHome?: boolean;
  note?: string;
  status?: "CREATED" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
}) {
  return updateAppointmentFn(input);
}

export function deleteAppointment(appointmentId: string) {
  return deleteAppointmentFn({ appointmentId });
}

export function getAppointmentsByPatientId(patientId: string) {
  return internalGet<AppointmentDetail[]>(
    `/api/internal/patients/${encodeURIComponent(patientId)}/appointments`,
  );
}

export function getAppointmentsWithoutReport(daysBack = 30) {
  return getAppointmentsWithoutReportFn({ daysBack });
}
