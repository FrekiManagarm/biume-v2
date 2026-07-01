import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { DayAgendaView } from "#/components/dashboard/day-agenda/day-agenda-view";
import { dashboardAgendaDayQueryOptions } from "#/lib/api/queries/dashboard-agenda.query";

type DashboardSearch = {
  date?: string;
};

export const Route = createFileRoute("/dashboard/")({
  head: () => ({
    meta: [
      { title: "Agenda du jour | Biume" },
      {
        name: "description",
        content:
          "Préparez les séances du jour et finalisez les comptes rendus propriétaires dans Biume.",
      },
    ],
  }),
  validateSearch: (search: Record<string, unknown>): DashboardSearch => ({
    date: typeof search.date === "string" ? search.date : undefined,
  }),
  loaderDeps: ({ search }) => ({
    date: normalizeDateSearch(search.date),
  }),
  loader: ({ context, deps }) =>
    context.queryClient.ensureQueryData(
      dashboardAgendaDayQueryOptions(deps.date),
    ),
  component: DashboardIndexPage,
});

function DashboardIndexPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/dashboard/" });
  const selectedDateString = normalizeDateSearch(search.date);
  const { data } = useSuspenseQuery(
    dashboardAgendaDayQueryOptions(selectedDateString),
  );

  function updateSelectedDate(nextDate: Date) {
    navigate({
      search: {
        date: toDateSearch(nextDate),
      },
    });
  }

  return (
    <DayAgendaView
      appointments={data.appointments}
      selectedDate={new Date(`${data.selectedDate}T00:00:00`)}
      onDateChange={updateSelectedDate}
    />
  );
}

function normalizeDateSearch(value: string | undefined) {
  if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  return toDateSearch(new Date());
}

function toDateSearch(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
