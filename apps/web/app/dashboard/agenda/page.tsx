import type { Metadata } from "next";
import { QueryClient, HydrationBoundary, dehydrate } from "@tanstack/react-query";

import { AgendaPage } from "#/components/dashboard/agenda/agenda-page";
import { requireActiveBilling } from "#/lib/dashboard-billing-guard";
import { getAppointments } from "#/functions/appointments.function";
import { getAllPatients } from "#/functions/patients.function";
import {
  appointmentsQueryOptions,
  defaultAppointmentWindow,
} from "#/lib/api/queries/appointments.query";
import { patientsQueryOptions } from "#/lib/api/queries/patients.query";

export const metadata: Metadata = {
  title: "Agenda | Biume",
  description: "Coordonnez les rendez-vous et consultations de votre espace.",
};

/**
 * `AgendaPage` (composant client) lit `appointmentsQueryOptions` et
 * `patientsQueryOptions` via `useSuspenseQuery` — code recopié tel quel du
 * lot TanStack, non modifié ici. Sous TanStack Start, ces deux requêtes
 * étaient résolues côté serveur sans aucun affichage de chargement, grâce à
 * `setupRouterSsrQueryIntegration` (voir `router.tsx`) : ce plugin dés/hydrate
 * automatiquement TOUTE requête react-query touchée pendant le rendu d'une
 * route, pas seulement celle explicitement préchargée par `loader`.
 *
 * Next n'offre pas d'équivalent : rien ne dés/hydrate automatiquement une
 * requête client. Sans geste explicite ici, le composant client suspendrait
 * côté serveur (React SSR une Client Component par défaut) — et sa requête
 * passerait par l'enveloppe de `lib/api/actions/*.action.ts`, qui fait un
 * `fetch` sur URL relative : cela lèverait pendant le rendu serveur (voir
 * règle 2 des règles héritées). Ce fichier reproduit donc à la main ce que le
 * plugin TanStack faisait automatiquement : un `QueryClient` de requête,
 * préchargé via la lecture serveur (`#/functions/*`, jamais l'enveloppe
 * `lib/api/actions/*`), puis `dehydrate`/`HydrationBoundary` pour que le
 * `useSuspenseQuery` du composant client retrouve une donnée déjà en cache
 * plutôt que de suspendre. Les clés de requête (`queryKey`) sont réutilisées
 * telles quelles depuis `appointmentsQueryOptions`/`patientsQueryOptions`
 * pour que le cache hydraté soit celui que le composant relit au montage.
 *
 * `patientsQueryOptions()` est appelée sans argument par `AgendaPage`, donc
 * toujours avec les mêmes valeurs par défaut ; on les reproduit ici pour la
 * lecture serveur — `limit: 250` (et non le défaut interne de la fonction
 * serveur, 10) est la valeur que l'enveloppe client impose déjà normalement.
 */
export default async function Page() {
  await requireActiveBilling();

  const appointmentWindow = defaultAppointmentWindow();
  const patientsDefaultParams = { search: "", page: 1, limit: 250 };

  const queryClient = new QueryClient();

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: appointmentsQueryOptions(appointmentWindow).queryKey,
      queryFn: () => getAppointments(appointmentWindow),
    }),
    queryClient.prefetchQuery({
      queryKey: patientsQueryOptions().queryKey,
      queryFn: () => getAllPatients(patientsDefaultParams),
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AgendaPage appointmentWindow={appointmentWindow} />
    </HydrationBoundary>
  );
}
