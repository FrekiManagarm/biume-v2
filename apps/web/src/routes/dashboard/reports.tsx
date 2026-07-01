import { createFileRoute, useNavigate } from "@tanstack/react-router";

import ReportsPageClient from "#/components/dashboard/pages/reports/client";
import { getAllReports } from "#/lib/api/actions/reports.action";

type ReportsSearch = {
  search?: string;
  status?: string;
  page?: number;
};

export const Route = createFileRoute("/dashboard/reports")({
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
  loader: ({ deps }) => getAllReports(deps),
  component: RouteComponent,
});

function RouteComponent() {
  const reports = Route.useLoaderData();
  const search = Route.useSearch();
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
