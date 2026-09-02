import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { getDashboardAgendaDay } from "#/functions/dashboard-agenda.function";
import {
  getNewClientsMetric,
  getNewPatientsMetric,
  getRecentActivity,
  getSentReportsMetric,
} from "#/functions/dashboard.function";

const dashboardOverviewSchema = z.object({
  selectedDate: z.string().min(1),
});

/**
 * Les cinq blocs de la vue d'ensemble, en un seul aller-retour.
 *
 * Le `queryFn` appelait les cinq fonctions serveur depuis le navigateur :
 * cinq requêtes HTTP parallèles de ~260 à 370 ms chacune, là où le serveur
 * peut les exécuter côte à côte et ne renvoyer qu'une réponse. En rendu
 * serveur le gain est nul (les appels y sont déjà directs) ; c'est la
 * navigation client vers la vue d'ensemble qui en profite.
 */
export const getDashboardOverviewFn = createServerFn({ method: "GET" })
  .validator(dashboardOverviewSchema)
  .handler(async ({ data }) => {
    const [newClients, newPatients, sentReports, recentActivity, agendaDay] =
      await Promise.all([
        getNewClientsMetric({ data: { days: 90 } }),
        getNewPatientsMetric({ data: { days: 90 } }),
        getSentReportsMetric({ data: { days: 30 } }),
        getRecentActivity({ data: { limit: 5 } }),
        getDashboardAgendaDay({ data: { date: data.selectedDate } }),
      ]);

    return {
      generatedAt: new Date().toISOString(),
      selectedDate: agendaDay.selectedDate,
      appointments: agendaDay.appointments,
      metrics: {
        newClients,
        newPatients,
        sentReports,
      },
      recentActivity,
    };
  });
