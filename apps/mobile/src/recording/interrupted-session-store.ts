import type { CaptureFileSystemAdapter } from '../capture/capture-files';
import type { InterruptedSession } from './recording-session';

export function interruptedSessionUri(documentDirectory: string): string {
  return `${documentDirectory}captures/interrupted-session.json`;
}

export type InterruptedSessionStore = {
  save(session: InterruptedSession): Promise<void>;
  read(): Promise<InterruptedSession | null>;
  clear(): Promise<void>;
};

/**
 * Percent-escaping keeps the payload inside the byte range the file adapter
 * moves around, whatever ends up in an identifier.
 */
function encode(value: string): Uint8Array {
  const escaped = encodeURIComponent(value);
  const bytes = new Uint8Array(escaped.length);
  for (let index = 0; index < escaped.length; index += 1) {
    bytes[index] = escaped.charCodeAt(index);
  }
  return bytes;
}

function decode(bytes: Uint8Array): string {
  let escaped = '';
  for (const byte of bytes) escaped += String.fromCharCode(byte);
  return decodeURIComponent(escaped);
}

function parseSession(payload: unknown): InterruptedSession | null {
  if (typeof payload !== 'object' || payload === null) return null;
  const candidate = payload as Record<string, unknown>;

  if (
    typeof candidate.captureId !== 'string' ||
    typeof candidate.plaintextUri !== 'string' ||
    typeof candidate.startedAt !== 'string' ||
    !(candidate.appointmentId === null ||
      typeof candidate.appointmentId === 'string') ||
    !(candidate.patientId === null || typeof candidate.patientId === 'string')
  ) {
    return null;
  }

  return {
    captureId: candidate.captureId,
    appointmentId: candidate.appointmentId,
    patientId: candidate.patientId,
    plaintextUri: candidate.plaintextUri,
    startedAt: candidate.startedAt,
  };
}

/**
 * Remembers, on disk, that a recording is in flight.
 *
 * Without this the temporary take left by a crash is unreachable: recovery
 * would have a file it cannot attribute to any capture, appointment, or start
 * time. It carries no audio and no clinical field — only what is needed to
 * offer the take back at the next launch.
 */
export function createInterruptedSessionStore(ports: {
  fileSystem: CaptureFileSystemAdapter;
  documentDirectory: string;
}): InterruptedSessionStore {
  const uri = interruptedSessionUri(ports.documentDirectory);

  async function clear(): Promise<void> {
    await ports.fileSystem.deleteFile(uri).catch(() => undefined);
  }

  return {
    async save(session) {
      await ports.fileSystem.writeAsBytes(uri, encode(JSON.stringify(session)));
    },

    async read() {
      if (!(await ports.fileSystem.exists(uri))) return null;

      let session: InterruptedSession | null = null;
      try {
        session = parseSession(
          JSON.parse(decode(await ports.fileSystem.readAsBytes(uri))),
        );
      } catch {
        session = null;
      }

      // A payload that cannot be turned back into a session is dead weight;
      // keeping it would only make every future launch fail the same way.
      if (!session) await clear();
      return session;
    },

    clear,
  };
}
