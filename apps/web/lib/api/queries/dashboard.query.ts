import { queryOptions } from "@tanstack/react-query";

import { internalGet } from "#/lib/http/internal-fetch";
// Importé depuis le serveur plutôt que redéclaré ici : une seconde
// déclaration structurellement identique aurait recréé exactement la
// divergence que `buildDashboardOverview` a été extraite pour éviter (tâche
// 6) — rien ne les aurait tenues synchronisées si l'une changeait sans
// l'autre.
//
// `generatedAt` reste typé `Date`, pas `string`, bien que ce module consomme
// une réponse JSON : le route handler émet `overview.generatedAt.toISOString()`
// (forme exacte que produit `Date.prototype.toJSON()`), et `reviveDates`
// (lib/http/internal-fetch.ts) la reconvertit systématiquement en `Date`
// avant que ce type ne soit lu. Déclarer `string` ici mentirait sur ce que
// reçoit réellement l'appelant.
import type { DashboardOverview } from "#/server/dashboard/overview";

export function getDashboardOverviewDate(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export const dashboardOverviewQueryOptions = (selectedDate: string) =>
  queryOptions({
    queryKey: ["dashboard", "overview", selectedDate] as const,
    queryFn: () =>
      internalGet<DashboardOverview>("/api/internal/dashboard/overview", {
        date: selectedDate,
      }),
  });
