import { queryOptions } from "@tanstack/react-query";

import { getCurrentOrganization } from "#/lib/api/actions/auth.action";
import { getDashboardAgendaDay } from "#/lib/api/actions/dashboard-agenda.action";
import {
  getClienteleBySpecies,
  getDraftReportsMetric,
  getNewClientsMetric,
  getNewPatientsMetric,
  getRecentActivity,
  getRecentReports,
  getSentReportsMetric,
} from "#/lib/api/actions/dashboard.action";

function toDateSearch(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export const dashboardOverviewQueryOptions = () =>
  queryOptions({
    queryKey: ["dashboard", "overview"] as const,
    queryFn: async () => {
      const today = toDateSearch(new Date());
      const [
        organization,
        newClients,
        newPatients,
        sentReports,
        draftReports,
        species,
        recentActivity,
        recentReports,
        agendaDay,
      ] = await Promise.all([
        getCurrentOrganization(),
        getNewClientsMetric(90),
        getNewPatientsMetric(90),
        getSentReportsMetric(30),
        getDraftReportsMetric(30),
        getClienteleBySpecies(),
        getRecentActivity(5),
        getRecentReports(5),
        getDashboardAgendaDay(today),
      ]);

      return {
        organization,
        selectedDate: agendaDay.selectedDate,
        appointments: agendaDay.appointments,
        metrics: {
          newClients,
          newPatients,
          sentReports,
          draftReports,
        },
        species,
        recentActivity,
        recentReports,
      };
    },
  });
