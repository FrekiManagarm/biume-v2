import { queryOptions } from "@tanstack/react-query";

import { getAppointments } from "#/lib/api/actions/appointments.action";

export const appointmentsQueryOptions = () =>
  queryOptions({
    queryKey: ["appointments", "list"] as const,
    queryFn: () => getAppointments(),
  });
