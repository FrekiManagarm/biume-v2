import { queryOptions } from "@tanstack/react-query";

import { getOrganizationSettings } from "#/functions/organization.function";

import { dashboardCacheTimes } from "./query-cache";

export const organizationSettingsQueryOptions = () =>
  queryOptions({
    queryKey: ["organizations", "settings"] as const,
    queryFn: getOrganizationSettings,
    ...dashboardCacheTimes.entity,
  });
