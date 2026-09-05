import { internalGet } from "#/lib/http/internal-fetch";
import type { DashboardAgendaDayResult } from "#/functions/dashboard-agenda.function";

export type { DashboardAgendaDayResult };

export function getDashboardAgendaDay(date: string) {
  return internalGet<DashboardAgendaDayResult>(
    "/api/internal/dashboard/agenda",
    { date },
  );
}
