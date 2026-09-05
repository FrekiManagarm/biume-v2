import { internalGet } from "#/lib/http/internal-fetch";
import type { AppointmentWindowInput } from "#/functions/appointments.function";

import {
  createAppointment as createAppointmentFn,
  deleteAppointment as deleteAppointmentFn,
  updateAppointment as updateAppointmentFn,
} from "./appointments.mutations";

// `getTodayAppointments` et `getAppointmentsWithoutReport` n'ont aucun
// appelant dans le dépôt (ni requête, ni composant, ni code serveur) : elles
// restent de simples fonctions exportées par `appointments.function.ts`,
// sans surface publique ici. Leur donner une entrée dans ce fichier — même
// via `appointments.mutations.ts` — leur donnerait un identifiant de Server
// Action appelable depuis le réseau pour du code mort, ce que le brief
// voulait justement éviter en leur refusant un endpoint REST.

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
