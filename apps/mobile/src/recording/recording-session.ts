import { captureMaxDurationMs } from '@biume/contracts/capture';
import type { CaptureRepository } from '../capture/capture-repository';
import type { SealedRecording } from '../capture/capture-files';
import { localExpiresAt, type LocalCapture } from '../capture/local-capture';
import type { CaptureTelemetry } from '../telemetry/capture-events';
import type { AudioRecorderPort, StorageGuardPort } from './audio-recorder';

/**
 * Mono AAC-LC in an M4A container at 64 kbit/s. Ten minutes of speech fits well
 * under the 16 MiB the server accepts, which is what lets a failed upload be
 * retried whole instead of needing a multipart protocol.
 */
export const biumeRecordingPreset = {
  extension: '.m4a',
  sampleRate: 44_100,
  numberOfChannels: 1,
  bitRate: 64_000,
  android: { outputFormat: 'mpeg4', audioEncoder: 'aac' },
  ios: { outputFormat: 'mpeg4aac', audioQuality: 'medium' },
} as const;

export type InterruptedSession = {
  captureId: string;
  appointmentId: string | null;
  patientId: string | null;
  plaintextUri: string;
  startedAt: string;
};

export type RecordingSessionPorts = {
  recorder: AudioRecorderPort;
  storage: StorageGuardPort;
  seal(input: {
    captureId: string;
    plaintextUri: string;
  }): Promise<SealedRecording>;
  discardPlaintext(uri: string): Promise<void>;
  persistInterruptedSession(session: InterruptedSession): Promise<void>;
  clearInterruptedSession(): Promise<void>;
  repository: CaptureRepository;
  newCaptureId(): string;
  now(): Date;
  /** Optional: telemetry never gates a recording. */
  telemetry?: CaptureTelemetry;
};

export type StartOutcome =
  | { status: 'recording'; captureId: string; startedAt: string }
  | { status: 'permission_denied'; canOpenSettings: true }
  | { status: 'insufficient_storage' };

export type StopOutcome =
  | { status: 'review'; capture: LocalCapture }
  | { status: 'encryption_failed' }
  | { status: 'not_recording' };

export type RecordingContext = {
  captureId: string;
  appointmentId: string | null;
  patientId: string | null;
};

export type RecordingSession = {
  start(input: {
    appointmentId: string | null;
    patientId: string | null;
  }): Promise<StartOutcome>;
  stop(): Promise<StopOutcome>;
  cancel(): Promise<void>;
  context(): RecordingContext | null;
  shouldAutoStop(elapsedMs: number): boolean;
};

function journeyTypeOf(
  appointmentId: string | null,
): 'appointment' | 'free_capture' {
  return appointmentId === null ? 'free_capture' : 'appointment';
}

export function createRecordingSession(
  ports: RecordingSessionPorts,
): RecordingSession {
  let active: (InterruptedSession & { context: RecordingContext }) | null = null;
  /** One promise for manual stop, timer stop, and interruption alike. */
  let stopOnce: Promise<StopOutcome> | null = null;

  async function runStop(): Promise<StopOutcome> {
    if (!active) return { status: 'not_recording' };
    const current = active;

    const finished = await ports.recorder.stop();

    let sealed: SealedRecording;
    try {
      sealed = await ports.seal({
        captureId: current.captureId,
        plaintextUri: finished.uri,
      });
    } catch {
      // The take is still on disk and still recoverable at next launch. It must
      // not be queued, and the plaintext must not be deleted.
      return { status: 'encryption_failed' };
    }

    await ports.discardPlaintext(finished.uri);

    const createdAt = current.startedAt;
    const capture: LocalCapture = {
      id: current.captureId,
      appointmentId: current.context.appointmentId,
      patientId: current.context.patientId,
      encryptedFileUri: sealed.encryptedFileUri,
      durationMs: Math.min(finished.durationMs, captureMaxDurationMs),
      mimeType: 'audio/mp4',
      byteSize: sealed.byteSize,
      sha256: sealed.sha256,
      status: 'review',
      remoteStatus: null,
      attemptCount: 0,
      nextAttemptAt: null,
      lastErrorCode: null,
      createdAt,
      validatedAt: null,
      expiresAt: localExpiresAt(createdAt),
      updatedAt: ports.now().toISOString(),
    };

    await ports.repository.insertReview(capture);
    await ports.clearInterruptedSession();
    active = null;

    ports.telemetry?.emit('capture_completed', {
      captureId: capture.id,
      journeyType: journeyTypeOf(capture.appointmentId),
      durationMs: capture.durationMs,
      byteSize: capture.byteSize,
    });

    return { status: 'review', capture };
  }

  return {
    async start(input) {
      if ((await ports.recorder.requestPermission()) !== 'granted') {
        return { status: 'permission_denied', canOpenSettings: true };
      }
      // Checked before the recorder creates anything, so a full device never
      // produces a partial take.
      if (!(await ports.storage.hasRoomForRecording())) {
        return { status: 'insufficient_storage' };
      }

      const captureId = ports.newCaptureId();
      const startedAt = ports.now().toISOString();
      const { uri } = await ports.recorder.start();

      const context: RecordingContext = {
        captureId,
        appointmentId: input.appointmentId,
        patientId: input.patientId,
      };
      active = { ...context, plaintextUri: uri, startedAt, context };
      stopOnce = null;

      await ports.persistInterruptedSession({
        captureId,
        appointmentId: input.appointmentId,
        patientId: input.patientId,
        plaintextUri: uri,
        startedAt,
      });

      ports.telemetry?.emit('capture_started', {
        captureId,
        journeyType: journeyTypeOf(input.appointmentId),
      });

      return { status: 'recording', captureId, startedAt };
    },

    stop() {
      stopOnce ??= runStop();
      return stopOnce;
    },

    async cancel() {
      if (!active) return;
      const { plaintextUri } = active;
      active = null;
      stopOnce = null;
      await ports.recorder.cancel();
      await ports.discardPlaintext(plaintextUri);
      await ports.clearInterruptedSession();
    },

    context() {
      return active?.context ?? null;
    },

    shouldAutoStop(elapsedMs) {
      return elapsedMs >= captureMaxDurationMs;
    },
  };
}
