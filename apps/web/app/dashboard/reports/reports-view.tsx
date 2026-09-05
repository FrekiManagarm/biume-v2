"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";

import ReportsPageClient from "#/components/dashboard/pages/reports/client";
import { reportsQueryOptions } from "#/lib/api/queries/reports.query";

type ReportsSearch = {
  search?: string;
  status?: string;
  page?: number;
};

/**
 * `Route.useSearch()` (TanStack) rendait un objet déjà validé par
 * `validateSearch`, partagé entre le loader et le composant. Next ne
 * partage pas cette valeur entre le Server Component (`page.tsx`, qui
 * applique la même normalisation pour son propre préchargement) et ce
 * composant client : `useSearchParams()` en est l'équivalent client (table
 * de correspondance), et cette fonction rejoue la normalisation de
 * `validateSearch` sur ce qu'il rend.
 */
function readSearch(searchParams: URLSearchParams): ReportsSearch {
  const rawSearch = searchParams.get("search");
  const rawStatus = searchParams.get("status");
  const rawPage = searchParams.get("page");

  return {
    search: rawSearch ?? "",
    status: rawStatus ?? "tous",
    page: rawPage !== null ? Number(rawPage) || 1 : 1,
  };
}

export function ReportsView() {
  const searchParams = useSearchParams();
  const search = readSearch(searchParams);
  const { data: reports } = useSuspenseQuery(
    reportsQueryOptions({
      search: search.search ?? "",
      status: search.status ?? "tous",
    }),
  );
  const router = useRouter();

  // `navigate({ search: (previous) => ({ ...previous, ... }) })` (TanStack)
  // n'a pas d'équivalent direct : `useRouter().push` prend une URL déjà
  // construite. `previous` ici est le `search` lu ci-dessus (déjà "les
  // searchParams actuels"), donc l'appelant garde exactement la même forme
  // (une fonction de mise à jour reçue `previous` en argument).
  function navigateWithSearch(
    update: (previous: ReportsSearch) => ReportsSearch,
  ) {
    const next = update(search);
    const params = new URLSearchParams();
    if (next.search) params.set("search", next.search);
    if (next.status) params.set("status", next.status);
    if (next.page) params.set("page", String(next.page));
    router.push(`/dashboard/reports?${params.toString()}`);
  }

  return (
    <ReportsPageClient
      reports={reports}
      searchQuery={search.search ?? ""}
      statusFilter={search.status ?? "tous"}
      currentPage={search.page ?? 1}
      onSearchChange={(value) =>
        navigateWithSearch((previous) => ({
          ...previous,
          search: value,
          page: 1,
        }))
      }
      onStatusChange={(value) =>
        navigateWithSearch((previous) => ({
          ...previous,
          status: value,
          page: 1,
        }))
      }
      onPageChange={(page) =>
        navigateWithSearch((previous) => ({ ...previous, page }))
      }
    />
  );
}
