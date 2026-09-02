import { queryOptions } from "@tanstack/react-query";

import { getDashboardAgendaDay } from "#/lib/api/actions/dashboard-agenda.action";
import {
  getNewClientsMetric,
  getNewPatientsMetric,
  getRecentActivity,
  getSentReportsMetric,
} from "#/lib/api/actions/dashboard.action";

export function getDashboardOverviewDate(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export const dashboardOverviewQueryOptions = (selectedDate: string) =>
  queryOptions({
    queryKey: ["dashboard", "overview", selectedDate] as const,
    queryFn: async () => {
      const [
        newClients,
        newPatients,
        sentReports,
        recentActivity,
        agendaDay,
      ] = await Promise.all([
        getNewClientsMetric(90),
        getNewPatientsMetric(90),
        getSentReportsMetric(30),
        getRecentActivity(5),
        getDashboardAgendaDay(selectedDate),
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
    },
  });
