import { queryOptions } from "@tanstack/react-query";

import { getAppointments } from "#/lib/api/actions/appointments.action";

import { dashboardCacheTimes } from "./query-cache";

export const appointmentsQueryOptions = () =>
  queryOptions({
    queryKey: ["appointments", "list"] as const,
    queryFn: () => getAppointments(),
    ...dashboardCacheTimes.live,
  });
