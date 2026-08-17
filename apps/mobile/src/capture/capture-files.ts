import { decryptCapture, encryptCapture } from './capture-crypto';

export const captureMasterKeyName = 'biume.capture.master-key.v1';

const keyLength = 32;
const nonceLength = 12;

export type SecureStoreAdapter = {
  getItemAsync(key: string): Promise<string | null>;
  setItemAsync(key: string, value: string): Promise<void>;
};

export type CaptureFileSystemAdapter = {
  readAsBytes(uri: string): Promise<Uint8Array>;
  writeAsBytes(uri: string, bytes: Uint8Array): Promise<void>;
  deleteFile(uri: string): Promise<void>;
  exists(uri: string): Promise<boolean>;
};

/**
 * Every Expo module the capture pipeline touches sits behind one of these, so
 * the pipeline can be exercised without a simulator.
 */
export type CaptureFileAdapters = {
  documentDirectory: string;
  secureStore: SecureStoreAdapter;
  fileSystem: CaptureFileSystemAdapter;
  randomBytes(length: number): Uint8Array;
  sha256Hex(bytes: Uint8Array): Promise<string>;
};

function toBase64(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return globalThis.btoa(binary);
}

function fromBase64(value: string): Uint8Array {
  const binary = globalThis.atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

/**
 * One 256-bit key per installation, created on first use and never leaving the
 * system keystore. Losing it makes every local envelope unreadable, which is
 * the intended outcome of an uninstall.
 */
export async function loadInstallationKey(
  adapters: CaptureFileAdapters,
): Promise<Uint8Array> {
  const stored = await adapters.secureStore.getItemAsync(captureMasterKeyName);
  if (stored) {
    const key = fromBase64(stored);
    if (key.length === keyLength) return key;
  }

  const created = adapters.randomBytes(keyLength);
  await adapters.secureStore.setItemAsync(
    captureMasterKeyName,
    toBase64(created),
  );
  return created;
}

export function encryptedCaptureUri(
  documentDirectory: string,
  captureId: string,
): string {
  return `${documentDirectory}captures/${captureId}.biume`;
}

export type SealedRecording = {
  encryptedFileUri: string;
  sha256: string;
  byteSize: number;
};

/**
 * Seals a finished recording.
 *
 * The plaintext is deleted only after the envelope has been written *and* read
 * back successfully. An interrupted seal therefore leaves the original audio in
 * place, which recovery can still salvage; the opposite order would destroy a
 * dictation on a full disk.
 */
export async function sealRecording(
  input: { captureId: string; plaintextUri: string },
  adapters: CaptureFileAdapters,
): Promise<SealedRecording> {
  const plaintext = await adapters.fileSystem.readAsBytes(input.plaintextUri);
  const sha256 = await adapters.sha256Hex(plaintext);

  const key = await loadInstallationKey(adapters);
  const envelope = encryptCapture({
    key,
    nonce: adapters.randomBytes(nonceLength),
    captureId: input.captureId,
    plaintext,
  });

  const encryptedFileUri = encryptedCaptureUri(
    adapters.documentDirectory,
    input.captureId,
  );
  await adapters.fileSystem.writeAsBytes(encryptedFileUri, envelope);

  const readBack = await adapters.fileSystem.readAsBytes(encryptedFileUri);
  decryptCapture({ key, captureId: input.captureId, envelope: readBack });

  await adapters.fileSystem.deleteFile(input.plaintextUri);

  return { encryptedFileUri, sha256, byteSize: readBack.length };
}

/**
 * Decrypts to memory for playback or upload. No second plaintext file is ever
 * created on disk.
 */
export async function openCaptureAudio(
  input: { captureId: string; encryptedFileUri: string },
  adapters: CaptureFileAdapters,
): Promise<Uint8Array> {
  const key = await loadInstallationKey(adapters);
  const envelope = await adapters.fileSystem.readAsBytes(
    input.encryptedFileUri,
  );
  return decryptCapture({ key, captureId: input.captureId, envelope });
}
