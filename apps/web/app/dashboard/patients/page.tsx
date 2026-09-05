import type { Metadata } from "next";
import { Suspense } from "react";
import { QueryClient, HydrationBoundary, dehydrate } from "@tanstack/react-query";

import { requireActiveBilling } from "#/lib/dashboard-billing-guard";
import { getAllAnimals, getAllPatients } from "#/functions/patients.function";
import { getAllClients } from "#/functions/clients.function";
import { clientsQueryOptions } from "#/lib/api/queries/clients.query";
import {
  animalsQueryOptions,
  patientsQueryOptions,
} from "#/lib/api/queries/patients.query";

import { PatientsView } from "./patients-view";

export const metadata: Metadata = {
  title: "Patients | Biume",
  description: "Consultez et suivez les patients animaux de votre espace.",
};

/**
 * `validateSearch` (TanStack) s'appliquait à `searchParams` au niveau de la
 * route et alimentait à la fois le `loader` (préchargement) et le composant
 * (`Route.useSearch()`). Reproduit ici pour la même normalisation — appelée
 * une seconde fois côté client dans `patients-view.tsx` via
 * `useSearchParams()` (voir sa JSDoc) : Next n'offre pas de canal pour
 * partager une valeur déjà validée entre un Server Component et son enfant
 * client autrement que par prop, et cette page n'en passe pas ici (voir plus
 * bas pourquoi).
 */
function readPatientsSearch(raw: Record<string, string | string[] | undefined>) {
  const rawSearch = raw.search;
  const rawType = raw.type;

  return {
    search: typeof rawSearch === "string" ? rawSearch : "",
    type: typeof rawType === "string" ? rawType : "tous",
  };
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireActiveBilling();

  // `loaderDeps` (TanStack) ne portait que `search`/`type` : `page` tranche
  // une liste déjà chargée côté client (voir `patients-view.tsx`), la
  // lecture serveur ci-dessous n'en a donc pas besoin non plus.
  const { search, type } = readPatientsSearch(await searchParams);

  const queryClient = new QueryClient();

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: patientsQueryOptions({ search, type, limit: 250 }).queryKey,
      queryFn: () => getAllPatients({ search, type, limit: 250 }),
    }),
    queryClient.prefetchQuery({
      queryKey: clientsQueryOptions({ limit: 250 }).queryKey,
      queryFn: () => getAllClients({ limit: 250 }),
    }),
    queryClient.prefetchQuery({
      queryKey: animalsQueryOptions().queryKey,
      queryFn: () => getAllAnimals(),
    }),
  ]);

  return (
    <Suspense fallback={null}>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <PatientsView />
      </HydrationBoundary>
    </Suspense>
  );
}
