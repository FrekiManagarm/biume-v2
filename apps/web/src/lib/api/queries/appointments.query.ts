import { queryOptions } from "@tanstack/react-query";

import { getAppointments } from "#/lib/api/actions/appointments.action";
import {
  defaultAppointmentWindow,
  type AppointmentWindow,
} from "#/lib/dashboard/appointment-window";

export { defaultAppointmentWindow, type AppointmentWindow };

export const appointmentsQueryOptions = (range: AppointmentWindow) =>
  queryOptions({
    queryKey: ["appointments", "list", range.fromISO, range.toISO] as const,
    queryFn: () => getAppointments(range),
  });
