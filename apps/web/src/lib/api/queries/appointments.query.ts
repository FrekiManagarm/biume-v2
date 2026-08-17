import { queryOptions } from "@tanstack/react-query";

import { getAppointments } from "#/lib/api/actions/appointments.action";

export type AppointmentWindow = { fromISO: string; toISO: string };

/**
 * Fenêtre par défaut : deux mois en arrière pour rattraper les comptes rendus
 * en retard, six mois en avant pour la planification. Charger tout l'historique
 * était tenable tant que la relation `reports` n'était pas jointe.
 */
export function defaultAppointmentWindow(now = new Date()): AppointmentWindow {
  const from = new Date(now);
  from.setMonth(from.getMonth() - 2);
  const to = new Date(now);
  to.setMonth(to.getMonth() + 6);

  return { fromISO: from.toISOString(), toISO: to.toISOString() };
}

export const appointmentsQueryOptions = (range: AppointmentWindow) =>
  queryOptions({
    queryKey: ["appointments", "list", range.fromISO, range.toISO] as const,
    queryFn: () => getAppointments(range),
  });
