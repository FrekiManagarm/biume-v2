import { createFileRoute } from "@tanstack/react-router";

import { AgendaPage } from "#/components/dashboard/agenda/agenda-page";
import {
  appointmentsQueryOptions,
  defaultAppointmentWindow,
} from "#/lib/api/queries/appointments.query";

export const Route = createFileRoute("/dashboard/agenda")({
  // La grille mensuelle (7 colonnes) tronque ses libellés de rendez-vous
  // sous le canvas de lecture max-w-7xl : la page s'en affranchit elle-même.
  head: () => ({
    meta: [
      { title: "Agenda | Biume" },
      {
        name: "description",
        content: "Coordonnez les rendez-vous et consultations de votre espace.",
      },
    ],
  }),
  ssr: true,
  // Calculée une seule fois ici, puis transmise au chargeur et au composant :
  // les deux consomment la même fenêtre, donc la même clé de requête, et le
  // cache alimenté par le SSR est bien celui que le composant relit au
  // montage plutôt qu'une fenêtre recalculée à la milliseconde près.
  loaderDeps: () => defaultAppointmentWindow(),
  loader: ({ context, deps }) =>
    context.queryClient.ensureQueryData(appointmentsQueryOptions(deps)),
  component: AgendaRoute,
});

function AgendaRoute() {
  const appointmentWindow = Route.useLoaderDeps();

  return <AgendaPage appointmentWindow={appointmentWindow} />;
}
