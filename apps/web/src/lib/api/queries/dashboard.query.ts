import { queryOptions } from "@tanstack/react-query";

import { getCurrentOrganization } from "#/lib/api/actions/auth.action";
import { getTodayAppointments } from "#/lib/api/actions/appointments.action";
import {
  getClienteleBySpecies,
  getDraftReportsMetric,
  getNewClientsMetric,
  getNewPatientsMetric,
  getRecentActivity,
  getRecentReports,
  getSentReportsMetric,
} from "#/lib/api/actions/dashboard.action";

export const dashboardOverviewQueryOptions = () =>
  queryOptions({
    queryKey: ["dashboard", "overview"] as const,
    queryFn: async () => {
      const [
        organization,
        newClients,
        newPatients,
        sentReports,
        draftReports,
        species,
        recentActivity,
        recentReports,
        todayAppointments,
      ] = await Promise.all([
        getCurrentOrganization(),
        getNewClientsMetric(90),
        getNewPatientsMetric(90),
        getSentReportsMetric(30),
        getDraftReportsMetric(30),
        getClienteleBySpecies(),
        getRecentActivity(5),
        getRecentReports(5),
        getTodayAppointments(),
      ]);

      return {
        organization,
        metrics: {
          newClients,
          newPatients,
          sentReports,
          draftReports,
        },
        species,
        recentActivity,
        recentReports,
        todayAppointments,
      };
    },
  });
