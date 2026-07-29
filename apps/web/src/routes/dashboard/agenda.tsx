import { createFileRoute } from "@tanstack/react-router";

import { AgendaPage } from "#/components/dashboard/agenda/agenda-page";
import { appointmentsQueryOptions } from "#/lib/api/queries/appointments.query";

export const Route = createFileRoute("/dashboard/agenda")({
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
    context.queryClient.ensureQueryData(appointmentsQueryOptions()),
  component: AgendaPage,
});
