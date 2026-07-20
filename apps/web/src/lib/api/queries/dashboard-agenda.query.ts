import { queryOptions } from "@tanstack/react-query";

import { getDashboardAgendaDay } from "#/lib/api/actions/dashboard-agenda.action";

import { dashboardCacheTimes } from "./query-cache";

export const dashboardAgendaDayQueryOptions = (date: string) =>
  queryOptions({
    queryKey: ["dashboard", "agenda-day", date] as const,
    queryFn: () => getDashboardAgendaDay(date),
    ...dashboardCacheTimes.live,
  });
