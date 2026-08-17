import { MobileApiClientError } from '../api/mobile-api-client';
import type { MobileApiClient } from '../api/mobile-api-client';
import { UploadError } from './upload-error';
import type { CaptureRepository } from '../capture/capture-repository';
import type {
  LocalCapture,
  LocalCaptureErrorCode,
} from '../capture/local-capture';
import { registerUploadFailure } from '../capture/local-capture';
import { errorCategoryFor } from '../telemetry/capture-events';
import type { CaptureTelemetry } from '../telemetry/capture-events';
import type { UploadClient } from './upload-client';

export type SyncEnginePorts = {
  repository: CaptureRepository;
  api: MobileApiClient;
  uploader: UploadClient;
  openAudio(capture: LocalCapture): Promise<Uint8Array>;
  isOnline(): boolean;
  now(): Date;
  random(): number;
  /** Optional: telemetry never gates a transfer. */
  telemetry?: CaptureTelemetry;
};

function journeyTypeOf(capture: LocalCapture): 'appointment' | 'free_capture' {
  return capture.appointmentId === null ? 'free_capture' : 'appointment';
}

export type SyncOutcome =
  | { status: 'idle' }
  | { status: 'offline' }
  | { status: 'uploaded'; captureId: string }
  | { status: 'deferred'; captureId: string; code: LocalCaptureErrorCode }
  | { status: 'needs_action'; captureId: string; code: LocalCaptureErrorCode };

/** Raised when the local audio cannot be read; never a transport failure. */
class LocalAudioMissingError extends Error {}

function codeFor(error: unknown): LocalCaptureErrorCode {
  if (error instanceof LocalAudioMissingError) return 'local_file_missing';
  if (error instanceof UploadError) return error.code;
  if (error instanceof MobileApiClientError) return error.code;
  return 'unknown';
}

export function createSyncEngine(ports: SyncEnginePorts) {
  /**
   * Process-level mutex. SQLite's compare-and-set already stops two owners from
   * claiming one row; this stops one process from starting a second upload
   * while the first is still in flight.
   */
  let running: Promise<SyncOutcome> | null = null;

  async function releaseWithFailure(
    capture: LocalCapture,
    code: LocalCaptureErrorCode,
  ): Promise<SyncOutcome> {
    // Ownership is always released through an explicit transition, never by
    // letting a rejected promise stand in for state.
    const failed = registerUploadFailure(
      capture,
      code,
      ports.now(),
      ports.random,
    );

    await ports.repository.transition(capture.id, ['uploading'], {
      status: failed.status,
      attemptCount: failed.attemptCount,
      nextAttemptAt: failed.nextAttemptAt,
      lastErrorCode: code,
      updatedAt: failed.updatedAt,
    });

    ports.telemetry?.emit('capture_queued_offline', {
      captureId: capture.id,
      journeyType: journeyTypeOf(capture),
      errorCategory: errorCategoryFor(code),
    });

    return failed.status === 'needs_action'
      ? { status: 'needs_action', captureId: capture.id, code }
      : { status: 'deferred', captureId: capture.id, code };
  }

  async function runOne(): Promise<SyncOutcome> {
    // Being offline is not a failure: the capture keeps its place and its
    // attempt count.
    if (!ports.isOnline()) return { status: 'offline' };

    const eligible = await ports.repository.nextEligible(
      ports.now().toISOString(),
    );
    if (!eligible) return { status: 'idle' };

    const claimed = await ports.repository.transition(
      eligible.id,
      ['queued'],
      { status: 'uploading', updatedAt: ports.now().toISOString() },
    );
    if (!claimed) return { status: 'idle' };

    const capture = eligible;

    try {
      await ports.api.createCapture({
        id: capture.id,
        appointmentId: capture.appointmentId,
        durationMs: capture.durationMs,
        mimeType: capture.mimeType,
        byteSize: capture.byteSize,
        sha256: capture.sha256,
        createdAt: capture.createdAt,
      });

      const session = await ports.api.createUploadSession(capture.id);

      let bytes: Uint8Array;
      try {
        bytes = await ports.openAudio(capture);
      } catch {
        throw new LocalAudioMissingError();
      }

      const { etag } = await ports.uploader.put({
        url: session.url,
        headers: session.headers,
        bytes,
      });

      // The row may have been cancelled while the bytes were in flight.
      // Confirming here would resurrect a capture the practitioner discarded.
      const current = await ports.repository.get(capture.id);
      if (!current || current.status !== 'uploading') {
        return { status: 'idle' };
      }

      await ports.api.completeCapture(capture.id, { etag });

      const at = ports.now().toISOString();
      await ports.repository.transition(capture.id, ['uploading'], {
        status: 'uploaded',
        remoteStatus: 'uploaded',
        lastErrorCode: null,
        nextAttemptAt: null,
        updatedAt: at,
      });

      ports.telemetry?.emit('capture_uploaded', {
        captureId: capture.id,
        journeyType: journeyTypeOf(capture),
        durationMs: capture.durationMs,
        byteSize: capture.byteSize,
      });

      return { status: 'uploaded', captureId: capture.id };
    } catch (error) {
      return releaseWithFailure(capture, codeFor(error));
    }
  }

  return {
    runOnce(): Promise<SyncOutcome> {
      if (running) return Promise.resolve({ status: 'idle' as const });
      running = runOne().finally(() => {
        running = null;
      });
      return running;
    },
  };
}

export type SyncEngine = ReturnType<typeof createSyncEngine>;
