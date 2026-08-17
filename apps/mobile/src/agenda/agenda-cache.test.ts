import type { MobileAppointment } from '@biume/contracts/capture';
import {
  emptyAgendaCache,
  readAgenda,
  selectPrimaryAppointment,
  selectUpcomingAppointments,
  storeAgenda,
} from './agenda-cache';

const now = new Date('2026-07-19T12:00:00.000Z');
const from = '2026-07-18T00:00:00.000Z';
const to = '2026-07-26T00:00:00.000Z';

function appointment(
  overrides: Partial<MobileAppointment> & { id: string },
): MobileAppointment {
  return {
    patientId: 'pet-1',
    patientName: 'Nala',
    animalType: 'DOG',
    beginAt: '2026-07-19T09:00:00.000Z',
    endAt: '2026-07-19T09:45:00.000Z',
    status: 'COMPLETED',
    ...overrides,
  };
}

describe('agenda cache', () => {
  it('starts empty', () => {
    expect(readAgenda(emptyAgendaCache(), 'org-1')).toEqual([]);
  });

  it('returns what the active organization stored', () => {
    const cache = storeAgenda(emptyAgendaCache(), {
      organizationId: 'org-1',
      from,
      to,
      items: [appointment({ id: 'a1' })],
      now: now.toISOString(),
    });

    expect(readAgenda(cache, 'org-1').map((item) => item.id)).toEqual(['a1']);
  });

  it('never serves one organization the agenda of another', () => {
    const cache = storeAgenda(emptyAgendaCache(), {
      organizationId: 'org-1',
      from,
      to,
      items: [appointment({ id: 'a1' })],
      now: now.toISOString(),
    });

    expect(readAgenda(cache, 'org-2')).toEqual([]);
  });

  it('drops the previous organization cache when the active one changes', () => {
    const first = storeAgenda(emptyAgendaCache(), {
      organizationId: 'org-1',
      from,
      to,
      items: [appointment({ id: 'a1' })],
      now: now.toISOString(),
    });
    const second = storeAgenda(first, {
      organizationId: 'org-2',
      from,
      to,
      items: [appointment({ id: 'a2' })],
      now: now.toISOString(),
    });

    expect(readAgenda(second, 'org-1')).toEqual([]);
    expect(readAgenda(second, 'org-2').map((item) => item.id)).toEqual(['a2']);
  });

  it('keeps only appointments inside the requested window', () => {
    const cache = storeAgenda(emptyAgendaCache(), {
      organizationId: 'org-1',
      from,
      to,
      items: [
        appointment({ id: 'inside' }),
        appointment({ id: 'before', beginAt: '2026-07-01T09:00:00.000Z' }),
        appointment({ id: 'after', beginAt: '2026-08-01T09:00:00.000Z' }),
      ],
      now: now.toISOString(),
    });

    expect(readAgenda(cache, 'org-1').map((item) => item.id)).toEqual([
      'inside',
    ]);
  });
});

describe('home selection', () => {
  it('offers the most recent completed appointment first', () => {
    const items = [
      appointment({ id: 'older', beginAt: '2026-07-19T08:00:00.000Z' }),
      appointment({ id: 'recent', beginAt: '2026-07-19T11:00:00.000Z' }),
      appointment({
        id: 'upcoming',
        beginAt: '2026-07-19T14:00:00.000Z',
        status: 'CONFIRMED',
      }),
    ];

    expect(selectPrimaryAppointment(items, now.toISOString())?.id).toBe(
      'recent',
    );
  });

  it('falls back to the nearest appointment when none is completed', () => {
    const items = [
      appointment({
        id: 'far',
        beginAt: '2026-07-25T09:00:00.000Z',
        status: 'CONFIRMED',
      }),
      appointment({
        id: 'near',
        beginAt: '2026-07-19T14:00:00.000Z',
        status: 'CONFIRMED',
      }),
    ];

    expect(selectPrimaryAppointment(items, now.toISOString())?.id).toBe('near');
  });

  it('never proposes a cancelled appointment', () => {
    const items = [
      appointment({ id: 'cancelled', status: 'CANCELLED' }),
    ];

    expect(selectPrimaryAppointment(items, now.toISOString())).toBeNull();
  });

  it('has nothing to offer on an empty agenda', () => {
    expect(selectPrimaryAppointment([], now.toISOString())).toBeNull();
  });
});

describe('upcoming list', () => {
  it('lists the next appointments in chronological order', () => {
    const items = [
      appointment({
        id: 'later',
        beginAt: '2026-07-20T09:00:00.000Z',
        status: 'CONFIRMED',
      }),
      appointment({
        id: 'sooner',
        beginAt: '2026-07-19T15:00:00.000Z',
        status: 'CONFIRMED',
      }),
      appointment({ id: 'past', beginAt: '2026-07-19T08:00:00.000Z' }),
    ];

    expect(
      selectUpcomingAppointments(items, now.toISOString(), 5).map(
        (item) => item.id,
      ),
    ).toEqual(['sooner', 'later']);
  });

  it('stays compact', () => {
    const items = Array.from({ length: 10 }, (_unused, index) =>
      appointment({
        id: `a${index}`,
        beginAt: new Date(now.getTime() + (index + 1) * 3_600_000).toISOString(),
        status: 'CONFIRMED',
      }),
    );

    expect(selectUpcomingAppointments(items, now.toISOString(), 3)).toHaveLength(
      3,
    );
  });

  it('excludes the appointment already offered as the primary action', () => {
    const items = [
      appointment({
        id: 'primary',
        beginAt: '2026-07-19T14:00:00.000Z',
        status: 'CONFIRMED',
      }),
      appointment({
        id: 'next',
        beginAt: '2026-07-19T16:00:00.000Z',
        status: 'CONFIRMED',
      }),
    ];
    const primary = selectPrimaryAppointment(items, now.toISOString());

    expect(
      selectUpcomingAppointments(items, now.toISOString(), 5, primary?.id).map(
        (item) => item.id,
      ),
    ).toEqual(['next']);
  });
});
