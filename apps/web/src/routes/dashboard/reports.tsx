import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

import ReportsPageClient from "#/components/dashboard/pages/reports/client";
import { reportsQueryOptions } from "#/lib/api/queries/reports.query";

type ReportsSearch = {
  search?: string;
  status?: string;
  page?: number;
};

export const Route = createFileRoute("/dashboard/reports")({
  head: () => ({
    meta: [
      { title: "Rapports | Biume" },
      {
        name: "description",
        content: "Consultez, filtrez et suivez les rapports veterinaires.",
      },
    ],
  }),
  validateSearch: (search: Record<string, unknown>): ReportsSearch => ({
    search: typeof search.search === "string" ? search.search : "",
    status: typeof search.status === "string" ? search.status : "tous",
    page:
      typeof search.page === "number"
        ? search.page
        : Number(search.page ?? 1) || 1,
  }),
  loaderDeps: ({ search }) => ({
    search: search.search ?? "",
    status: search.status ?? "tous",
  }),
  loader: ({ context, deps }) =>
    context.queryClient.ensureQueryData(reportsQueryOptions(deps)),
  component: RouteComponent,
});

function RouteComponent() {
  const search = Route.useSearch();
  const { data: reports } = useSuspenseQuery(
    reportsQueryOptions({
      search: search.search ?? "",
      status: search.status ?? "tous",
    }),
  );
  const navigate = useNavigate({ from: "/dashboard/reports" });

  return (
    <ReportsPageClient
      reports={reports}
      searchQuery={search.search ?? ""}
      statusFilter={search.status ?? "tous"}
      currentPage={search.page ?? 1}
      onSearchChange={(value) =>
        navigate({
          search: (previous) => ({ ...previous, search: value, page: 1 }),
        })
      }
      onStatusChange={(value) =>
        navigate({
          search: (previous) => ({ ...previous, status: value, page: 1 }),
        })
      }
      onPageChange={(page) =>
        navigate({
          search: (previous) => ({ ...previous, page }),
        })
      }
    />
  );
}
