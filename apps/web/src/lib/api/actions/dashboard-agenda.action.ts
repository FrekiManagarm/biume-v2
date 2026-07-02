import {
  getDashboardAgendaDay as getDashboardAgendaDayFn,
  type DashboardAgendaDayResult,
} from "#/functions/dashboard-agenda.function";

export type { DashboardAgendaDayResult };

export function getDashboardAgendaDay(date: string) {
  return getDashboardAgendaDayFn({ data: { date } });
}
