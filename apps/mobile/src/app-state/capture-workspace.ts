import type { MobileAppointment } from '@biume/contracts/capture';
import { useCallback, useEffect, useState } from 'react';
import {
  emptyAgendaCache,
  readAgenda,
  selectPrimaryAppointment,
  selectUpcomingAppointments,
  storeAgenda,
  type AgendaCacheState,
} from '../agenda/agenda-cache';
import {
  buildCaptureListView,
  type CaptureRowView,
} from '../capture/capture-list-view';
import type { CaptureRepository } from '../capture/capture-repository';
import type { MobileApiClient } from '../api/mobile-api-client';

export type CaptureWorkspacePorts = {
  repository: CaptureRepository;
  api: MobileApiClient;
  organizationId: string;
  now(): Date;
};

export type CaptureWorkspace = {
  primary: MobileAppointment | null;
  upcoming: MobileAppointment[];
  rows: CaptureRowView[];
  agendaFresh: boolean;
  reload(): Promise<void>;
};

const upcomingLimit = 5;

/**
 * Reads the two view models the workspace screens need. The agenda is refreshed
 * from the API when reachable and served from cache otherwise, so a failed
 * refresh degrades freshness rather than emptying the screen.
 */
export function useCaptureWorkspace(
  ports: CaptureWorkspacePorts,
): CaptureWorkspace {
  const { repository, api, organizationId, now } = ports;
  const [agenda, setAgenda] = useState<AgendaCacheState>(emptyAgendaCache);
  const [agendaFresh, setAgendaFresh] = useState(false);
  const [rows, setRows] = useState<CaptureRowView[]>([]);

  const reload = useCallback(async () => {
    const current = now();
    setRows(buildCaptureListView(await repository.list(), current.toISOString()));

    const from = new Date(current.getTime() - 24 * 60 * 60 * 1000);
    const to = new Date(current.getTime() + 7 * 24 * 60 * 60 * 1000);

    try {
      const page = await api.listAppointments({
        from: from.toISOString(),
        to: to.toISOString(),
      });
      setAgenda((previous) =>
        storeAgenda(previous, {
          organizationId,
          from: from.toISOString(),
          to: to.toISOString(),
          items: page.items,
          now: current.toISOString(),
        }),
      );
      setAgendaFresh(true);
    } catch {
      // Offline or a failing API leaves the cached agenda in place.
      setAgendaFresh(false);
    }
  }, [api, now, organizationId, repository]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const items = readAgenda(agenda, organizationId);
  const primary = selectPrimaryAppointment(items, now().toISOString());

  return {
    primary,
    upcoming: selectUpcomingAppointments(
      items,
      now().toISOString(),
      upcomingLimit,
      primary?.id,
    ),
    rows,
    agendaFresh,
    reload,
  };
}
