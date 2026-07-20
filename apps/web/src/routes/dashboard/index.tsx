import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { Alert, AlertDescription, AlertTitle } from "#/components/ui/alert";
import { DashboardOverviewView } from "#/components/dashboard/overview/dashboard-overview-view";
import {
  dashboardOverviewQueryOptions,
  getDashboardOverviewDate,
} from "#/lib/api/queries/dashboard.query";
import { Skeleton } from "#/components/ui/skeleton";

export const Route = createFileRoute("/dashboard/")({
  head: () => ({
    meta: [
      { title: "Vue d'ensemble | Biume" },
      {
        name: "description",
        content:
          "Suivez vos séances du jour, comptes rendus à traiter et activité récente dans Biume.",
      },
    ],
  }),
  loaderDeps: () => ({
    selectedDate: getDashboardOverviewDate(),
  }),
  loader: ({ context, deps }) =>
    context.queryClient.ensureQueryData(
      dashboardOverviewQueryOptions(deps.selectedDate),
    ),
  pendingComponent: DashboardOverviewPending,
  errorComponent: DashboardOverviewError,
  component: DashboardIndexPage,
});

function DashboardIndexPage() {
  const { selectedDate } = Route.useLoaderDeps();
  const { data } = useSuspenseQuery(
    dashboardOverviewQueryOptions(selectedDate),
  );

  return (
    <DashboardOverviewView
      appointments={data.appointments}
      metrics={{
        newAnimals: data.metrics.newPatients.value,
        newOwners: data.metrics.newClients.value,
        sentReports: data.metrics.sentReports.value,
      }}
      recentActivity={data.recentActivity}
      now={new Date(data.generatedAt)}
      selectedDate={new Date(`${data.selectedDate}T00:00:00`)}
    />
  );
}

function DashboardOverviewPending() {
  return (
    <div className="grid gap-5 pb-8">
      <section className="grid gap-2 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-24 rounded-lg" />
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <Skeleton className="h-[28rem] rounded-lg" />
        <Skeleton className="h-[28rem] rounded-lg" />
      </section>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <Skeleton className="h-64 rounded-lg" />
        <Skeleton className="h-64 rounded-lg" />
      </section>
    </div>
  );
}

function DashboardOverviewError() {
  return (
    <div className="grid gap-5 pb-8">
      <Alert variant="destructive">
        <AlertTitle>Impossible de charger la vue d'ensemble</AlertTitle>
        <AlertDescription>
          Les données de votre activité ne sont pas disponibles pour le moment.
          Rechargez la page ou réessayez dans quelques instants.
        </AlertDescription>
      </Alert>
    </div>
  );
}
