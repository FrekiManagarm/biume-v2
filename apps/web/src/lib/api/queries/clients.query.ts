import { queryOptions } from "@tanstack/react-query";

import {
  getAllClients,
  type GetAllClientsParams,
} from "#/lib/api/actions/clients.action";

import { dashboardCacheTimes } from "./query-cache";

export const clientsQueryOptions = (params: GetAllClientsParams = {}) => {
  const normalizedParams = {
    search: params.search ?? "",
    page: params.page ?? 1,
    limit: params.limit ?? 250,
  };

  return queryOptions({
    queryKey: ["clients", "list", normalizedParams] as const,
    queryFn: () => getAllClients(normalizedParams),
    ...dashboardCacheTimes.entity,
  });
};
