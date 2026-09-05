import {
  getNewClientsMetric,
  getNewPatientsMetric,
  getRecentActivity,
  getSentReportsMetric,
} from "#/functions/dashboard.function";
import { getDashboardAgendaDay } from "#/functions/dashboard-agenda.function";
import { toInternalRouteErrorResponse } from "#/lib/http/internal-route";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const selectedDate =
    new URL(request.url).searchParams.get("date") ?? new Date().toISOString().slice(0, 10);

  try {
    // Cinq lectures en parallèle, mais côté serveur : le navigateur les
    // lançait une par une sur le réseau, ici elles partagent la même requête
    // HTTP. Le gain est réel — un aller-retour réseau au lieu de cinq — mais
    // ce n'est PAS une session résolue une seule fois : `cache()` de React
    // ne mémoïse que dans une portée de Server Component, qu'un route
    // handler n'installe pas. Les cinq appels ci-dessous relisent donc
    // chacun la session (cinq lectures, pas une). Voir spec § 13, risque 7.
    const [newClients, newPatients, sentReports, recentActivity, agendaDay] =
      await Promise.all([
        getNewClientsMetric(90),
        getNewPatientsMetric(90),
        getSentReportsMetric(30),
        getRecentActivity(5),
        getDashboardAgendaDay(selectedDate),
      ]);

    return Response.json({
      generatedAt: new Date().toISOString(),
      selectedDate: agendaDay.selectedDate,
      appointments: agendaDay.appointments,
      metrics: { newClients, newPatients, sentReports },
      recentActivity,
    });
  } catch (error) {
    return toInternalRouteErrorResponse(error);
  }
}
