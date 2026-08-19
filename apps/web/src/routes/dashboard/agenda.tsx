import { createFileRoute } from "@tanstack/react-router";

import { AgendaPage } from "#/components/dashboard/agenda/agenda-page";
import {
  appointmentsQueryOptions,
  defaultAppointmentWindow,
} from "#/lib/api/queries/appointments.query";

export const Route = createFileRoute("/dashboard/agenda")({
  // La grille mensuelle (7 colonnes) tronque ses libellés de rendez-vous
  // sous le canvas de lecture max-w-7xl : la page s'en affranchit elle-même.
  staticData: { wideContent: true },
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
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(
      appointmentsQueryOptions(defaultAppointmentWindow()),
    ),
  component: AgendaPage,
});
