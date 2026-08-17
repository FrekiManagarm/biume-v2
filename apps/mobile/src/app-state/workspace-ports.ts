import * as SQLite from 'expo-sqlite';
import { useEffect, useMemo, useState } from 'react';
import { createMobileApiClient } from '../api/mobile-api-client';
import { getSessionCookie } from '../auth/auth-session';
import { openCaptureAudio } from '../capture/capture-files';
import type { CaptureAction } from '../capture/capture-list-view';
import type { CaptureRepository } from '../capture/capture-repository';
import { createExpoCaptureFileAdapters } from '../capture/expo-capture-files';
import type { LocalCaptureErrorCode } from '../capture/local-capture';
import { createSqliteCaptureRepository } from '../capture/sqlite-capture-repository';
import { createSyncCoordinator } from '../sync/sync-coordinator';
import { createSyncEngine } from '../sync/sync-engine';
import { createUploadClient } from '../sync/upload-client';
import type { CaptureWorkspacePorts } from './capture-workspace';

const databaseName = 'biume-captures.db';

export type WorkspacePorts = CaptureWorkspacePorts & {
  runCaptureAction(captureId: string, action: CaptureAction): Promise<void>;
  requestSync(trigger: 'validation' | 'foreground' | 'network'): Promise<void>;
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

const uploader = createUploadClient({ fetch: globalThis.fetch });

/**
 * Codes a retry can actually resolve. Everything else needs the practitioner to
 * do something first — sign in again, or record the dictation anew.
 */
const retryableCodes = new Set<LocalCaptureErrorCode>([
  'network',
  'rate_limited',
  'server_error',
  'storage_unavailable',
  'object_incomplete',
  'upload_url_expired',
  'unknown',
]);

/**
 * Composes the ports the workspace screens depend on. Screens receive view
 * models and actions; none of them opens a database, signs a request, or
 * touches a file.
 */
export function useWorkspacePorts(organizationId = ''): WorkspacePorts {
  const [repository, setRepository] = useState<CaptureRepository | null>(null);
  const adapters = useMemo(() => createExpoCaptureFileAdapters(), []);

  useEffect(() => {
    let cancelled = false;
    void openRepository().then((resolved) => {
      if (!cancelled) setRepository(resolved);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return useMemo<WorkspacePorts>(() => {
    const resolvedRepository = repository ?? pendingRepository;

    const coordinator = createSyncCoordinator({
      engine: createSyncEngine({
        repository: resolvedRepository,
        api,
        uploader,
        openAudio: (capture) =>
          openCaptureAudio(
            {
              captureId: capture.id,
              encryptedFileUri: capture.encryptedFileUri,
            },
            adapters,
          ),
        isOnline: () => true,
        now: () => new Date(),
        random: () => Math.random(),
      }),
    });

    return {
      repository: resolvedRepository,
      api,
      organizationId,
      now: () => new Date(),

      requestSync: (trigger) => coordinator.request(trigger),

      async runCaptureAction(captureId, action) {
        const resolved = repository ?? (await openRepository());
        const capture = await resolved.get(captureId);
        if (!capture) return;
        const at = new Date().toISOString();

        if (action === 'retry') {
          // Only recoverable codes go back to the queue. The attempt counter is
          // deliberately kept, so the automatic threshold still reflects what
          // this capture has already cost.
          const code = capture.lastErrorCode;
          if (code !== null && !retryableCodes.has(code)) return;
          await resolved.transition(captureId, ['needs_action'], {
            status: 'queued',
            nextAttemptAt: null,
            updatedAt: at,
          });
          await coordinator.request('validation');
          return;
        }

        if (action === 'delete') {
          // Cancel locally first: once that is durably recorded the capture can
          // never be resurrected, whatever happens to the server call or the
          // file deletion below.
          const cancelled = await resolved.transition(
            captureId,
            ['queued', 'needs_action', 'expired', 'uploaded'],
            { status: 'cancelled', updatedAt: at },
          );
          if (!cancelled) return;

          // A failed server cancellation stays a pending cleanup; it must not
          // bring the capture back into the list.
          await api.cancelCapture(captureId).catch(() => undefined);
          await adapters.fileSystem
            .deleteFile(capture.encryptedFileUri)
            .catch(() => undefined);
        }
      },
    };
  }, [adapters, organizationId, repository]);
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
