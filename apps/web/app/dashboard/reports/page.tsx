import type { Metadata } from "next";
import { Suspense } from "react";
import { QueryClient, HydrationBoundary, dehydrate } from "@tanstack/react-query";

import { requireActiveBilling } from "#/lib/dashboard-billing-guard";
import { getAllReports } from "#/functions/reports.function";
import { reportsQueryOptions } from "#/lib/api/queries/reports.query";

import { ReportsView } from "./reports-view";

export const metadata: Metadata = {
  title: "Rapports | Biume",
  description: "Consultez, filtrez et suivez les rapports veterinaires.",
};

/**
 * `validateSearch` (TanStack) s'appliquait à `searchParams` au niveau de la
 * route et alimentait à la fois le `loader` (préchargement) et le composant
 * (`Route.useSearch()`). Reproduit ici pour la même normalisation — appelée
 * une seconde fois côté client dans `reports-view.tsx` via `useSearchParams()`
 * (voir sa JSDoc) : Next n'offre pas de canal pour partager une valeur déjà
 * validée entre un Server Component et son enfant client autrement que par
 * prop, et cette page n'en passe pas ici (voir plus bas pourquoi).
 */
function readReportsSearch(raw: Record<string, string | string[] | undefined>) {
  const rawSearch = raw.search;
  const rawStatus = raw.status;

  return {
    search: typeof rawSearch === "string" ? rawSearch : "",
    status: typeof rawStatus === "string" ? rawStatus : "tous",
  };
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireActiveBilling();

  // `page` n'entre pas dans `loaderDeps` sous TanStack (seuls `search` et
  // `status` façonnent la requête ; la pagination tranche une liste déjà
  // chargée côté client) : la lecture serveur ci-dessous n'en a donc pas
  // besoin non plus.
  const { search, status } = readReportsSearch(await searchParams);

  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: reportsQueryOptions({ search, status }).queryKey,
    queryFn: () => getAllReports({ search, status }),
  });

  return (
    <Suspense fallback={null}>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <ReportsView />
      </HydrationBoundary>
    </Suspense>
  );
}
