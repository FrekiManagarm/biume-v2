import type { CaptureRepository } from '../capture/capture-repository';
import type { LocalCapture } from '../capture/local-capture';
import {
  biumeRecordingPreset,
  createRecordingSession,
  type RecordingSessionPorts,
} from './recording-session';

const captureId = '6f1a6d5e-3f2b-4c1d-9a7e-2b8c4d5e6f70';
const now = new Date('2026-07-19T10:00:00.000Z');
const plaintextUri = 'file:///tmp/recording.m4a';

function createRepository() {
  const rows = new Map<string, LocalCapture>();
  const repository: CaptureRepository = {
    insertReview: jest.fn(async (capture: LocalCapture) => {
      rows.set(capture.id, capture);
    }),
    transition: jest.fn(async () => true),
    get: jest.fn(async (id) => rows.get(id) ?? null),
    list: jest.fn(async () => Array.from(rows.values())),
    nextEligible: jest.fn(async () => null),
    markExpired: jest.fn(async () => []),
    remove: jest.fn(async (id) => {
      rows.delete(id);
    }),
  };
  return { repository, rows };
}

function createPorts(
  overrides: Partial<RecordingSessionPorts> = {},
): RecordingSessionPorts & { rows: Map<string, LocalCapture> } {
  const { repository, rows } = createRepository();

  const ports: RecordingSessionPorts = {
    recorder: {
      requestPermission: jest.fn(async () => 'granted' as const),
      start: jest.fn(async () => ({ uri: plaintextUri })),
      stop: jest.fn(async () => ({ uri: plaintextUri, durationMs: 120_000 })),
      cancel: jest.fn(async () => {}),
    },
    storage: { hasRoomForRecording: jest.fn(async () => true) },
    seal: jest.fn(async () => ({
      encryptedFileUri: 'file:///documents/captures/capture-1.biume',
      sha256: 'a'.repeat(64),
      byteSize: 1_048_576,
    })),
    discardPlaintext: jest.fn(async () => {}),
    persistInterruptedSession: jest.fn(async () => {}),
    clearInterruptedSession: jest.fn(async () => {}),
    repository,
    newCaptureId: () => captureId,
    now: () => now,
    ...overrides,
  };

  return Object.assign(ports, { rows });
}

describe('starting a recording', () => {
  it('refuses without the microphone and points at the system settings', async () => {
    const ports = createPorts({
      recorder: {
        requestPermission: jest.fn(async () => 'denied' as const),
        start: jest.fn(async () => ({ uri: plaintextUri })),
        stop: jest.fn(async () => ({ uri: plaintextUri, durationMs: 0 })),
        cancel: jest.fn(async () => {}),
      },
    });
    const session = createRecordingSession(ports);

    const started = await session.start({ appointmentId: null, patientId: null });

    expect(started).toEqual({
      status: 'permission_denied',
      canOpenSettings: true,
    });
    expect(ports.recorder.start).not.toHaveBeenCalled();
    expect(ports.repository.insertReview).not.toHaveBeenCalled();
  });

  it('refuses before creating a file when the device is full', async () => {
    const ports = createPorts({
      storage: { hasRoomForRecording: jest.fn(async () => false) },
    });
    const session = createRecordingSession(ports);

    const started = await session.start({ appointmentId: null, patientId: null });

    expect(started).toEqual({ status: 'insufficient_storage' });
    expect(ports.recorder.start).not.toHaveBeenCalled();
  });

  it('keeps one stable identity and the selected context', async () => {
    const ports = createPorts();
    const session = createRecordingSession(ports);

    const started = await session.start({
      appointmentId: 'appointment-1',
      patientId: 'pet-1',
    });

    expect(started).toEqual({
      status: 'recording',
      captureId,
      startedAt: now.toISOString(),
    });
    expect(session.context()).toEqual({
      captureId,
      appointmentId: 'appointment-1',
      patientId: 'pet-1',
    });
  });

  it('accepts a free capture with no context', async () => {
    const ports = createPorts();
    const session = createRecordingSession(ports);

    await session.start({ appointmentId: null, patientId: null });

    expect(session.context()).toEqual({
      captureId,
      appointmentId: null,
      patientId: null,
    });
  });

  it('remembers enough to recover after an interruption', async () => {
    const ports = createPorts();
    const session = createRecordingSession(ports);

    await session.start({ appointmentId: 'appointment-1', patientId: 'pet-1' });

    expect(ports.persistInterruptedSession).toHaveBeenCalledWith({
      captureId,
      appointmentId: 'appointment-1',
      patientId: 'pet-1',
      plaintextUri,
      startedAt: now.toISOString(),
    });
  });
});

describe('stopping a recording', () => {
  it('encrypts before deleting the plaintext and before showing review', async () => {
    const order: string[] = [];
    const ports = createPorts({
      seal: jest.fn(async () => {
        order.push('seal');
        return {
          encryptedFileUri: 'file:///documents/captures/capture-1.biume',
          sha256: 'a'.repeat(64),
          byteSize: 1_048_576,
        };
      }),
      discardPlaintext: jest.fn(async () => {
        order.push('discard');
      }),
    });
    ports.repository.insertReview = jest.fn(async () => {
      order.push('persist');
    });
    const session = createRecordingSession(ports);
    await session.start({ appointmentId: null, patientId: null });

    const stopped = await session.stop();

    expect(stopped.status).toBe('review');
    expect(order).toEqual(['seal', 'discard', 'persist']);
  });

  it('persists the encrypted file, never a plaintext path', async () => {
    const ports = createPorts();
    const session = createRecordingSession(ports);
    await session.start({ appointmentId: null, patientId: null });

    await session.stop();

    const persisted = ports.rows.get(captureId);
    expect(persisted?.encryptedFileUri).toBe(
      'file:///documents/captures/capture-1.biume',
    );
    expect(JSON.stringify(persisted)).not.toContain('/tmp/');
    expect(persisted?.status).toBe('review');
  });

  it('stops once however many times it is asked', async () => {
    const ports = createPorts();
    const session = createRecordingSession(ports);
    await session.start({ appointmentId: null, patientId: null });

    const [first, second, third] = await Promise.all([
      session.stop(),
      session.stop(),
      session.stop(),
    ]);

    expect(ports.recorder.stop).toHaveBeenCalledTimes(1);
    expect(first).toEqual(second);
    expect(second).toEqual(third);
  });

  it('stops automatically at exactly ten minutes', async () => {
    const ports = createPorts({
      recorder: {
        requestPermission: jest.fn(async () => 'granted' as const),
        start: jest.fn(async () => ({ uri: plaintextUri })),
        stop: jest.fn(async () => ({ uri: plaintextUri, durationMs: 600_000 })),
        cancel: jest.fn(async () => {}),
      },
    });
    const session = createRecordingSession(ports);
    await session.start({ appointmentId: null, patientId: null });

    expect(session.shouldAutoStop(599_999)).toBe(false);
    expect(session.shouldAutoStop(600_000)).toBe(true);

    const stopped = await session.stop();
    expect(stopped.status).toBe('review');
    expect(ports.rows.get(captureId)?.durationMs).toBe(600_000);
  });

  it('keeps the plaintext recoverable when encryption fails, and queues nothing', async () => {
    const ports = createPorts({
      seal: jest.fn(async () => {
        throw new Error('encryption failed');
      }),
    });
    const session = createRecordingSession(ports);
    await session.start({ appointmentId: null, patientId: null });

    const stopped = await session.stop();

    expect(stopped).toEqual({ status: 'encryption_failed' });
    expect(ports.discardPlaintext).not.toHaveBeenCalled();
    expect(ports.repository.insertReview).not.toHaveBeenCalled();
    expect(ports.clearInterruptedSession).not.toHaveBeenCalled();
  });

  it('clears the interrupted-session marker once review is persisted', async () => {
    const ports = createPorts();
    const session = createRecordingSession(ports);
    await session.start({ appointmentId: null, patientId: null });

    await session.stop();

    expect(ports.clearInterruptedSession).toHaveBeenCalled();
  });
});

describe('cancelling a recording', () => {
  it('deletes the temporary file and leaves no row behind', async () => {
    const ports = createPorts();
    const session = createRecordingSession(ports);
    await session.start({ appointmentId: null, patientId: null });

    await session.cancel();

    expect(ports.recorder.cancel).toHaveBeenCalled();
    expect(ports.discardPlaintext).toHaveBeenCalledWith(plaintextUri);
    expect(ports.repository.insertReview).not.toHaveBeenCalled();
    expect(ports.clearInterruptedSession).toHaveBeenCalled();
  });
});

describe('recording capabilities', () => {
  it('offers no pause and no resume', () => {
    const session = createRecordingSession(createPorts());

    expect(Object.keys(session).sort()).toEqual([
      'cancel',
      'context',
      'shouldAutoStop',
      'start',
      'stop',
    ]);
  });

  it('records mono AAC-LC in an M4A container at 64 kbit/s', () => {
    expect(biumeRecordingPreset).toEqual({
      extension: '.m4a',
      sampleRate: 44_100,
      numberOfChannels: 1,
      bitRate: 64_000,
      android: { outputFormat: 'mpeg4', audioEncoder: 'aac' },
      ios: { outputFormat: 'mpeg4aac', audioQuality: 'medium' },
    });
  });
});

describe('telemetry', () => {
  it('reports a dictation that started', async () => {
    const emit = jest.fn();
    const ports = createPorts({ telemetry: { emit } });

    await createRecordingSession(ports).start({
      appointmentId: 'appointment-1',
      patientId: null,
    });

    expect(emit).toHaveBeenCalledWith('capture_started', {
      captureId,
      journeyType: 'appointment',
    });
  });

  it('reports a dictation that reached review with its measurements', async () => {
    const emit = jest.fn();
    const ports = createPorts({ telemetry: { emit } });
    const session = createRecordingSession(ports);

    await session.start({ appointmentId: null, patientId: null });
    await session.stop();

    expect(emit).toHaveBeenCalledWith('capture_completed', {
      captureId,
      journeyType: 'free_capture',
      durationMs: 120_000,
      byteSize: 1_048_576,
    });
  });

  it('reports nothing when the recording never started', async () => {
    const emit = jest.fn();
    const ports = createPorts({
      telemetry: { emit },
      recorder: {
        requestPermission: jest.fn(async () => 'denied' as const),
        start: jest.fn(async () => ({ uri: plaintextUri })),
        stop: jest.fn(async () => ({ uri: plaintextUri, durationMs: 0 })),
        cancel: jest.fn(async () => {}),
      },
    });

    await createRecordingSession(ports).start({
      appointmentId: null,
      patientId: null,
    });

    expect(emit).not.toHaveBeenCalled();
  });

  it('reports nothing when sealing failed', async () => {
    const emit = jest.fn();
    const ports = createPorts({
      telemetry: { emit },
      seal: jest.fn(async () => {
        throw new Error('no key');
      }),
    });
    const session = createRecordingSession(ports);

    await session.start({ appointmentId: null, patientId: null });
    emit.mockClear();
    await session.stop();

    expect(emit).not.toHaveBeenCalled();
  });
});
