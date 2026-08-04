import * as SQLite from 'expo-sqlite';
import { useEffect, useMemo, useState } from 'react';
import { createMobileApiClient } from '../api/mobile-api-client';
import { getSessionCookie } from '../auth/auth-session';
import type { CaptureAction } from '../capture/capture-list-view';
import type { CaptureRepository } from '../capture/capture-repository';
import { createSqliteCaptureRepository } from '../capture/sqlite-capture-repository';
import type { CaptureWorkspacePorts } from './capture-workspace';

const databaseName = 'biume-captures.db';

export type WorkspacePorts = CaptureWorkspacePorts & {
  runCaptureAction(captureId: string, action: CaptureAction): Promise<void>;
};

let repositoryPromise: Promise<CaptureRepository> | undefined;

function openRepository(): Promise<CaptureRepository> {
  repositoryPromise ??= SQLite.openDatabaseAsync(databaseName).then(
    (database) => createSqliteCaptureRepository(database),
  );
  return repositoryPromise;
}

const api = createMobileApiClient({
  baseUrl: process.env.EXPO_PUBLIC_API_URL ?? '',
  fetch: globalThis.fetch,
  getCookie: getSessionCookie,
});

/**
 * Composes the ports the workspace screens depend on. Screens receive view
 * models and actions; none of them opens a database, signs a request, or
 * touches a file.
 */
export function useWorkspacePorts(organizationId = ''): WorkspacePorts {
  const [repository, setRepository] = useState<CaptureRepository | null>(null);

  useEffect(() => {
    let cancelled = false;
    void openRepository().then((resolved) => {
      if (!cancelled) setRepository(resolved);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return useMemo<WorkspacePorts>(
    () => ({
      repository: repository ?? pendingRepository,
      api,
      organizationId,
      now: () => new Date(),
      async runCaptureAction(captureId, action) {
        const resolved = repository ?? (await openRepository());

        if (action === 'retry') {
          // Returning to the queue resets the backoff window; the attempt
          // counter is deliberately kept so the automatic threshold still
          // reflects how much this capture has already cost.
          await resolved.transition(captureId, ['needs_action'], {
            status: 'queued',
            nextAttemptAt: null,
            updatedAt: new Date().toISOString(),
          });
          return;
        }

        if (action === 'delete') {
          const capture = await resolved.get(captureId);
          if (capture) {
            await resolved.transition(
              captureId,
              ['queued', 'needs_action', 'expired', 'uploaded'],
              { status: 'cancelled', updatedAt: new Date().toISOString() },
            );
            // The remote purge is best effort here; the expiry sweep is the
            // guarantee that nothing outlives its window.
            await api.cancelCapture(captureId).catch(() => undefined);
          }
        }
      },
    }),
    [organizationId, repository],
  );
}

/**
 * Used only between mount and the first successful database open. Every method
 * is inert rather than throwing, so a screen rendered during boot shows an
 * empty workspace instead of crashing.
 */
const pendingRepository: CaptureRepository = {
  async insertReview() {},
  async transition() {
    return false;
  },
  async get() {
    return null;
  },
  async list() {
    return [];
  },
  async nextEligible() {
    return null;
  },
  async markExpired() {
    return [];
  },
  async remove() {},
};
