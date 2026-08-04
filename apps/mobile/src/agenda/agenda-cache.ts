import type { MobileAppointment } from '@biume/contracts/capture';

/**
 * Holds one organization's agenda at a time. Switching the active organization
 * replaces the cache wholesale rather than merging, so a practitioner can never
 * be shown appointments belonging to a tenant they left.
 *
 * Only `MobileAppointment` fields are stored — owner contact details and the
 * appointment note never reach the device.
 */
export type AgendaCacheState = {
  organizationId: string | null;
  from: string | null;
  to: string | null;
  items: MobileAppointment[];
  updatedAt: string | null;
};

export function emptyAgendaCache(): AgendaCacheState {
  return {
    organizationId: null,
    from: null,
    to: null,
    items: [],
    updatedAt: null,
  };
}

export function storeAgenda(
  _previous: AgendaCacheState,
  input: {
    organizationId: string;
    from: string;
    to: string;
    items: MobileAppointment[];
    now: string;
  },
): AgendaCacheState {
  const fromMs = new Date(input.from).getTime();
  const toMs = new Date(input.to).getTime();

  return {
    organizationId: input.organizationId,
    from: input.from,
    to: input.to,
    items: input.items.filter((item) => {
      const beginMs = new Date(item.beginAt).getTime();
      return beginMs >= fromMs && beginMs <= toMs;
    }),
    updatedAt: input.now,
  };
}

export function readAgenda(
  state: AgendaCacheState,
  organizationId: string,
): MobileAppointment[] {
  return state.organizationId === organizationId ? state.items : [];
}

const selectableStatuses = new Set<MobileAppointment['status']>([
  'CREATED',
  'CONFIRMED',
  'COMPLETED',
]);

/**
 * The practitioner most often dictates right after finishing a consultation, so
 * the most recently completed appointment is the primary action. Failing that,
 * the appointment closest to now — in either direction — is the best guess.
 */
export function selectPrimaryAppointment(
  items: readonly MobileAppointment[],
  now: string,
): MobileAppointment | null {
  const nowMs = new Date(now).getTime();
  const selectable = items.filter((item) => selectableStatuses.has(item.status));

  const completed = selectable
    .filter(
      (item) =>
        item.status === 'COMPLETED' && new Date(item.beginAt).getTime() <= nowMs,
    )
    .sort(
      (left, right) =>
        new Date(right.beginAt).getTime() - new Date(left.beginAt).getTime(),
    );
  if (completed[0]) return completed[0];

  const nearest = [...selectable].sort(
    (left, right) =>
      Math.abs(new Date(left.beginAt).getTime() - nowMs) -
      Math.abs(new Date(right.beginAt).getTime() - nowMs),
  );
  return nearest[0] ?? null;
}

export function selectUpcomingAppointments(
  items: readonly MobileAppointment[],
  now: string,
  limit: number,
  excludeId?: string,
): MobileAppointment[] {
  const nowMs = new Date(now).getTime();

  return items
    .filter(
      (item) =>
        item.id !== excludeId &&
        selectableStatuses.has(item.status) &&
        new Date(item.beginAt).getTime() >= nowMs,
    )
    .sort(
      (left, right) =>
        new Date(left.beginAt).getTime() - new Date(right.beginAt).getTime(),
    )
    .slice(0, limit);
}
