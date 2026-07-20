import { queryOptions } from "@tanstack/react-query";

import { getOrganizations } from "#/functions/auth.function";
import { getSidebarDefaultOpen } from "#/functions/sidebar.function";

import { dashboardCacheTimes } from "./query-cache";

export const organizationsQueryOptions = () =>
  queryOptions({
    queryKey: ["organizations"],
    queryFn: () => getOrganizations(),
    ...dashboardCacheTimes.layout,
  });

export const sidebarDefaultOpenQueryOptions = () =>
  queryOptions({
    queryKey: ["sidebar-default-open"],
    queryFn: () => getSidebarDefaultOpen(),
    ...dashboardCacheTimes.layout,
  });
