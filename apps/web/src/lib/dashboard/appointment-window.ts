import { addMonths, endOfDay, startOfDay, subMonths } from "date-fns";

export type AppointmentWindow = { fromISO: string; toISO: string };

/**
 * Fenêtre par défaut : deux mois en arrière pour rattraper les comptes rendus
 * en retard, six mois en avant pour la planification. Charger tout l'historique
 * était tenable tant que la relation `reports` n'était pas jointe.
 *
 * Bornée au jour (`startOfDay`/`endOfDay`) : TanStack Router construit la clé
 * de chaque match à partir de `JSON.stringify(loaderDeps)`, donc deux appels
 * dans la même journée (un au survol du lien via `defaultPreload: "intent"`,
 * l'autre au clic) doivent produire des bornes identiques à la milliseconde
 * près, sous peine de recharger deux fois la même fenêtre logique. Même
 * convention que `getDashboardOverviewDate` (`#/lib/api/queries/dashboard.query`).
 *
 * `subMonths`/`addMonths` (date-fns) plutôt que `setMonth` : `setMonth` ne
 * clampe pas le débordement de jour (le 31 août moins deux mois roule
 * silencieusement sur le 1er juillet au lieu du 30 juin).
 *
 * Isolée dans son propre module (plutôt que dans
 * `#/lib/api/queries/appointments.query`) pour rester testable sans tirer la
 * chaîne d'imports serveur (`db`, `env`, ...) que ce fichier de requêtes
 * charge via `getAppointments`.
 */
export function defaultAppointmentWindow(now = new Date()): AppointmentWindow {
  const from = startOfDay(subMonths(now, 2));
  const to = endOfDay(addMonths(now, 6));

  return { fromISO: from.toISOString(), toISO: to.toISOString() };
}
