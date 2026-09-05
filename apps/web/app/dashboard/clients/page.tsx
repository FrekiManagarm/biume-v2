import type { Metadata } from "next";
import { Suspense } from "react";
import { QueryClient, HydrationBoundary, dehydrate } from "@tanstack/react-query";

import { requireActiveBilling } from "#/lib/dashboard-billing-guard";
import { getAllClients } from "#/functions/clients.function";
import { clientsQueryOptions } from "#/lib/api/queries/clients.query";

import { ClientsView } from "./clients-view";

export const metadata: Metadata = {
  title: "Clients | Biume",
  description: "Consultez et suivez les clients de votre espace Biume.",
};

/**
 * `validateSearch` (TanStack) s'appliquait à `searchParams` au niveau de la
 * route et alimentait à la fois le `loader` (préchargement) et le composant
 * (`Route.useSearch()`). Reproduit ici pour la même normalisation — appelée
 * une seconde fois côté client dans `clients-view.tsx` via `useSearchParams()`
 * (voir sa JSDoc) : Next n'offre pas de canal pour partager une valeur déjà
 * validée entre un Server Component et son enfant client autrement que par
 * prop, et cette page n'en passe pas ici (voir plus bas pourquoi).
 */
function readClientsSearch(raw: Record<string, string | string[] | undefined>) {
  const rawSearch = raw.search;

  return {
    search: typeof rawSearch === "string" ? rawSearch : "",
  };
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireActiveBilling();

  // `loaderDeps` (TanStack) ne portait que `search` : `status` et `page`
  // tranchent une liste déjà chargée côté client (voir `clients-view.tsx`),
  // la lecture serveur ci-dessous n'en a donc pas besoin non plus.
  const { search } = readClientsSearch(await searchParams);

  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: clientsQueryOptions({ search, limit: 250 }).queryKey,
    queryFn: () => getAllClients({ search, limit: 250 }),
  });

  return (
    <Suspense fallback={null}>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <ClientsView />
      </HydrationBoundary>
    </Suspense>
  );
}
