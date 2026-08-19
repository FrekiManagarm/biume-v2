import { queryOptions } from "@tanstack/react-query";

import { getAppointments } from "#/lib/api/actions/appointments.action";

export type AppointmentWindow = { fromISO: string; toISO: string };

/**
 * Préfixe partagé par toutes les fenêtres. `invalidateQueries` doit cibler ce
 * préfixe plutôt qu'une clé complète : la fenêtre par défaut dépend de la date
 * du jour, donc la clé exacte calculée à l'écriture d'un rendez-vous n'est pas
 * forcément celle sous laquelle la liste a été mise en cache.
 */
export const appointmentsQueryKeyPrefix = ["appointments", "list"] as const;

/**
 * Fenêtre par défaut : deux mois en arrière pour rattraper les comptes rendus
 * en retard, six mois en avant pour la planification. Charger tout l'historique
 * était tenable tant que la relation `reports` n'était pas jointe.
 *
 * Bornée à la journée (et non à la milliseconde) : la fenêtre alimente la clé
 * de requête react-query. Appelée depuis le rendu, `new Date()` produit sinon
 * une valeur différente à chaque appel — clé différente à chaque rendu, donc
 * jamais de cache hit, un `useSuspenseQuery` qui boucle, un prefetch SSR
 * perdu, et une invalidation qui ne retrouve jamais la clé qu'elle vise.
 * Deux appels le même jour doivent produire exactement la même fenêtre.
 */
export function defaultAppointmentWindow(now = new Date()): AppointmentWindow {
  const from = startOfLocalDay(now);
  from.setMonth(from.getMonth() - 2);
  const to = startOfLocalDay(now);
  to.setMonth(to.getMonth() + 6);

  return { fromISO: from.toISOString(), toISO: to.toISOString() };
}

function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export const appointmentsQueryOptions = (range: AppointmentWindow) =>
  queryOptions({
    queryKey: [
      ...appointmentsQueryKeyPrefix,
      range.fromISO,
      range.toISO,
    ] as const,
    queryFn: () => getAppointments(range),
  });
