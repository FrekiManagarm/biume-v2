export const defaultAppointmentDurationMs = 60 * 60 * 1000;

/** La durée de la dernière séance du praticien : ce qu'il fait d'habitude. */
export function defaultDurationMs(
  last: { beginAt: Date; endAt: Date } | null,
): number {
  if (!last) return defaultAppointmentDurationMs;
  const duration = last.endAt.getTime() - last.beginAt.getTime();
  return duration > 0 ? duration : defaultAppointmentDurationMs;
}

export function dayBounds(at: Date): { dayStart: Date; dayEnd: Date } {
  const dayStart = new Date(at);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(at);
  dayEnd.setHours(23, 59, 59, 999);
  return { dayStart, dayEnd };
}
