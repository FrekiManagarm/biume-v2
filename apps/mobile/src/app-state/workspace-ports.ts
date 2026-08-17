import * as SQLite from 'expo-sqlite';
import { useEffect, useMemo, useState } from 'react';
import { createMobileApiClient } from '../api/mobile-api-client';
import { getSessionCookie } from '../auth/auth-session';
import { runCaptureAction } from '../capture/capture-actions';
import type { CaptureAction } from '../capture/capture-list-view';
import type { CaptureRepository } from '../capture/capture-repository';
import { openCaptureAudio, sealRecording } from '../capture/capture-files';
import { createExpoCaptureFileAdapters } from '../capture/expo-capture-files';
import type { CaptureFileAdapters } from '../capture/capture-files';
import { purgeExpiredLocalCaptures } from '../capture/local-purge';
import type { RecoveryPorts } from '../capture/recovery';
import { createSqliteCaptureRepository } from '../capture/sqlite-capture-repository';
import { createInterruptedSessionStore } from '../recording/interrupted-session-store';
import { buildRecoveredCapture } from '../recording/recovered-capture';
import { createExpoNetworkAdapter } from '../sync/expo-network';
import { createNetworkMonitor } from '../sync/network-monitor';
import {
  createSyncCoordinator,
  type SyncTrigger,
} from '../sync/sync-coordinator';
import { createSyncEngine } from '../sync/sync-engine';
import { createUploadClient } from '../sync/upload-client';
import { captureTelemetry } from '../telemetry/telemetry-sink';
import type { CaptureWorkspacePorts } from './capture-workspace';
import { runStartupMaintenance } from './startup-maintenance';

const databaseName = 'biume-captures.db';

export type CaptureNavigation = {
  openSignIn(): void;
  restartRecording(context: {
    appointmentId: string | null;
    patientId: string | null;
  }): void;
};

export type WorkspacePorts = CaptureWorkspacePorts & {
  runCaptureAction(
    captureId: string,
    action: CaptureAction,
    navigation: CaptureNavigation,
  ): Promise<void>;
  requestSync(trigger: SyncTrigger): Promise<void>;
};

let adaptersInstance: CaptureFileAdapters | undefined;

/** Lazy: creating the adapters touches the file system. */
export function captureFileAdapters(): CaptureFileAdapters {
  adaptersInstance ??= createExpoCaptureFileAdapters();
  return adaptersInstance;
}

export function interruptedSessionStore() {
  const adapters = captureFileAdapters();
  return createInterruptedSessionStore({
    fileSystem: adapters.fileSystem,
    documentDirectory: adapters.documentDirectory,
  });
}

let repositoryPromise: Promise<CaptureRepository> | undefined;

export function openRepository(): Promise<CaptureRepository> {
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
 * One monitor for the whole app: the sync engine reads it synchronously and the
 * root layout subscribes to it for the restoration trigger.
 */
export const networkMonitor = createNetworkMonitor(createExpoNetworkAdapter());

/**
 * One engine and one coordinator per installation, not per screen. Two screens
 * building their own would each hold their own mutex, and the "one upload at a
 * time" rule would only be enforced by the database.
 */
let coordinatorInstance:
  | ReturnType<typeof createSyncCoordinator>
  | undefined;

function coordinator() {
  coordinatorInstance ??= createSyncCoordinator({
    engine: createSyncEngine({
      repository: {
        // Resolved lazily so a screen mounted before the database is open does
        // not need a second, inert repository implementation.
        insertReview: async (capture) =>
          (await openRepository()).insertReview(capture),
        transition: async (id, from, patch) =>
          (await openRepository()).transition(id, from, patch),
        get: async (id) => (await openRepository()).get(id),
        list: async () => (await openRepository()).list(),
        nextEligible: async (now) => (await openRepository()).nextEligible(now),
        markExpired: async (now) => (await openRepository()).markExpired(now),
        remove: async (id) => (await openRepository()).remove(id),
      },
      api,
      uploader,
      openAudio: (capture) =>
        openCaptureAudio(
          { captureId: capture.id, encryptedFileUri: capture.encryptedFileUri },
          captureFileAdapters(),
        ),
      isOnline: () => networkMonitor.isOnline(),
      now: () => new Date(),
      random: () => Math.random(),
      telemetry: captureTelemetry,
    }),
  });
  return coordinatorInstance;
}

export function requestSync(trigger: SyncTrigger): Promise<void> {
  return coordinator().request(trigger);
}

function recoveryPorts(adapters: CaptureFileAdapters): RecoveryPorts {
  const sessions = interruptedSessionStore();

  return {
    async listTemporaryRecordings() {
      const session = await sessions.read();
      return session
        ? [{ captureId: session.captureId, uri: session.plaintextUri }]
        : [];
    },

    async temporaryRecordingSize(recording) {
      try {
        return (await adapters.fileSystem.readAsBytes(recording.uri)).length;
      } catch {
        return null;
      }
    },

    async sealTemporaryRecording(recording) {
      const session = await sessions.read();
      if (!session || session.captureId !== recording.captureId) {
        throw new Error('interrupted session no longer known');
      }

      const sealed = await sealRecording(
        { captureId: recording.captureId, plaintextUri: recording.uri },
        adapters,
      );
      await sessions.clear();

      return {
        capture: buildRecoveredCapture({ session, sealed, now: new Date() }),
      };
    },

    async discardTemporaryRecording(recording) {
      await adapters.fileSystem.deleteFile(recording.uri).catch(() => undefined);
      await sessions.clear();
    },

    encryptedFileExists: (capture) =>
      adapters.fileSystem.exists(capture.encryptedFileUri),

    now: () => new Date(),
  };
}

/**
 * Applies the 24-hour retention on its own, without the rest of the startup
 * sequence. An app left open across the window would otherwise keep expired
 * audio on disk until the next cold launch.
 */
export async function sweepRetention(): Promise<void> {
  const adapters = captureFileAdapters();

  try {
    await purgeExpiredLocalCaptures({
      repository: await openRepository(),
      deleteFile: (uri) => adapters.fileSystem.deleteFile(uri),
      now: () => new Date(),
    });
  } catch {
    // The next foreground, or the next launch, tries again.
  }
}

/**
 * Runs before routing: opens the database, recovers whatever a crash left
 * behind, and enforces the 24-hour retention on device.
 */
export async function bootstrapWorkspace(): Promise<void> {
  const adapters = captureFileAdapters();
  const repository = await openRepository();

  await runStartupMaintenance({
    repository,
    recovery: recoveryPorts(adapters),
    deleteFile: (uri) => adapters.fileSystem.deleteFile(uri),
    now: () => new Date(),
  });
}

/**
 * Composes the ports the workspace screens depend on. Screens receive view
 * models and actions; none of them opens a database, signs a request, or
 * touches a file.
 */
export function useWorkspacePorts(organizationId: string): WorkspacePorts {
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

  return useMemo<WorkspacePorts>(() => {
    const resolvedRepository = repository ?? pendingRepository;

    return {
      repository: resolvedRepository,
      api,
      organizationId,
      now: () => new Date(),

      requestSync: (trigger) => requestSync(trigger),

      async runCaptureAction(captureId, action, navigation) {
        const adapters = captureFileAdapters();

        await runCaptureAction(captureId, action, {
          repository: repository ?? (await openRepository()),
          api,
          deleteFile: (uri) => adapters.fileSystem.deleteFile(uri),
          requestSync: () => requestSync('validation'),
          openSignIn: navigation.openSignIn,
          restartRecording: navigation.restartRecording,
          now: () => new Date(),
        });
      },
    };
  }, [organizationId, repository]);
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
