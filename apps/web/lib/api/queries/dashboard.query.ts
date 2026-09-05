import { queryOptions } from "@tanstack/react-query";

import { internalGet } from "#/lib/http/internal-fetch";
import type { AgendaAppointmentInput } from "#/lib/dashboard/day-agenda";
import type {
  MetricResult,
  RecentActivityItem,
} from "#/functions/dashboard.function";

export function getDashboardOverviewDate(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

// Forme exacte de ce que le `queryFn` renvoyait quand il composait ses cinq
// lectures depuis le navigateur : la préserver à l'identique évite de
// toucher les composants qui consomment `dashboardOverviewQueryOptions`.
//
// `generatedAt` est typé `Date`, pas `string` (revue finale du lot B) : le
// route handler émet `new Date().toISOString()`, forme exacte que produit
// `Date.prototype.toJSON()`, et `reviveDates` (lib/http/internal-fetch.ts)
// la reconvertit systématiquement en `Date` avant que ce type ne soit lu.
// Déclarer `string` ici mentirait sur ce que reçoit réellement l'appelant.
type DashboardOverview = {
  generatedAt: Date;
  selectedDate: string;
  appointments: AgendaAppointmentInput[];
  metrics: {
    newClients: MetricResult;
    newPatients: MetricResult;
    sentReports: MetricResult;
  };
  recentActivity: RecentActivityItem[];
};

export const dashboardOverviewQueryOptions = (selectedDate: string) =>
  queryOptions({
    queryKey: ["dashboard", "overview", selectedDate] as const,
    queryFn: () =>
      internalGet<DashboardOverview>("/api/internal/dashboard/overview", {
        date: selectedDate,
      }),
  });
