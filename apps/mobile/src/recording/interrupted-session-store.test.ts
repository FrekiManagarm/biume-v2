import type { CaptureFileSystemAdapter } from '../capture/capture-files';
import {
  createInterruptedSessionStore,
  interruptedSessionUri,
} from './interrupted-session-store';
import type { InterruptedSession } from './recording-session';

const documentDirectory = 'file:///documents/';

const session: InterruptedSession = {
  captureId: '6f1a6d5e-3f2b-4c1d-9a7e-2b8c4d5e6f70',
  appointmentId: 'appointment-1',
  patientId: null,
  plaintextUri: 'file:///tmp/recording-1.m4a',
  startedAt: '2026-07-19T10:00:00.000Z',
};

function createFileSystem(initial: Record<string, Uint8Array> = {}) {
  const files = new Map(Object.entries(initial));

  const fileSystem: CaptureFileSystemAdapter = {
    readAsBytes: jest.fn(async (uri: string) => {
      const bytes = files.get(uri);
      if (!bytes) throw new Error(`missing: ${uri}`);
      return bytes;
    }),
    writeAsBytes: jest.fn(async (uri: string, bytes: Uint8Array) => {
      files.set(uri, bytes);
    }),
    deleteFile: jest.fn(async (uri: string) => {
      files.delete(uri);
    }),
    exists: jest.fn(async (uri: string) => files.has(uri)),
  };

  return { fileSystem, files };
}

function encode(value: string): Uint8Array {
  const escaped = encodeURIComponent(value);
  const bytes = new Uint8Array(escaped.length);
  for (let index = 0; index < escaped.length; index += 1) {
    bytes[index] = escaped.charCodeAt(index);
  }
  return bytes;
}

describe('persisting an in-flight recording', () => {
  it('round-trips the session a crash would otherwise lose', async () => {
    const { fileSystem } = createFileSystem();
    const store = createInterruptedSessionStore({
      fileSystem,
      documentDirectory,
    });

    await store.save(session);

    expect(await store.read()).toEqual(session);
  });

  it('reports nothing when no recording was in flight', async () => {
    const { fileSystem } = createFileSystem();
    const store = createInterruptedSessionStore({
      fileSystem,
      documentDirectory,
    });

    expect(await store.read()).toBeNull();
  });

  it('forgets the session once the recording is finished', async () => {
    const { fileSystem, files } = createFileSystem();
    const store = createInterruptedSessionStore({
      fileSystem,
      documentDirectory,
    });

    await store.save(session);
    await store.clear();

    expect(files.size).toBe(0);
    expect(await store.read()).toBeNull();
  });

  it('clears a session that was never saved without failing', async () => {
    const { fileSystem } = createFileSystem();
    const store = createInterruptedSessionStore({
      fileSystem,
      documentDirectory,
    });

    await expect(store.clear()).resolves.toBeUndefined();
  });
});

describe('unusable payloads', () => {
  it('reports nothing when the stored payload is not readable', async () => {
    const { fileSystem } = createFileSystem({
      [interruptedSessionUri(documentDirectory)]: encode('{not json'),
    });
    const store = createInterruptedSessionStore({
      fileSystem,
      documentDirectory,
    });

    expect(await store.read()).toBeNull();
  });

  it('reports nothing when the stored payload is not a session', async () => {
    const { fileSystem } = createFileSystem({
      [interruptedSessionUri(documentDirectory)]: encode(
        JSON.stringify({ captureId: 'only-an-id' }),
      ),
    });
    const store = createInterruptedSessionStore({
      fileSystem,
      documentDirectory,
    });

    expect(await store.read()).toBeNull();
  });

  it('discards a payload it could not understand', async () => {
    const { fileSystem, files } = createFileSystem({
      [interruptedSessionUri(documentDirectory)]: encode('{not json'),
    });
    const store = createInterruptedSessionStore({
      fileSystem,
      documentDirectory,
    });

    await store.read();

    // Left in place it would be re-read, and fail, at every single launch.
    expect(files.size).toBe(0);
  });
});
