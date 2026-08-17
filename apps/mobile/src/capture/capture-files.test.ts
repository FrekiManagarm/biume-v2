import { decryptCapture } from './capture-crypto';
import {
  captureMasterKeyName,
  loadInstallationKey,
  openCaptureAudio,
  sealRecording,
  type CaptureFileAdapters,
} from './capture-files';

const captureId = '6f1a6d5e-3f2b-4c1d-9a7e-2b8c4d5e6f70';
const plaintext = new TextEncoder().encode('dictee de seance');

function createAdapters(
  overrides: Partial<CaptureFileAdapters> = {},
): CaptureFileAdapters & { files: Map<string, Uint8Array>; secrets: Map<string, string> } {
  const files = new Map<string, Uint8Array>();
  const secrets = new Map<string, string>();

  const adapters: CaptureFileAdapters = {
    documentDirectory: 'file:///documents/',
    secureStore: {
      async getItemAsync(key) {
        return secrets.get(key) ?? null;
      },
      async setItemAsync(key, value) {
        secrets.set(key, value);
      },
    },
    fileSystem: {
      async readAsBytes(uri) {
        const bytes = files.get(uri);
        if (!bytes) throw new Error('missing');
        return bytes;
      },
      async writeAsBytes(uri, bytes) {
        files.set(uri, bytes);
      },
      async deleteFile(uri) {
        files.delete(uri);
      },
      async exists(uri) {
        return files.has(uri);
      },
    },
    randomBytes: (length) => new Uint8Array(length).fill(5),
    sha256Hex: async () => 'b'.repeat(64),
    ...overrides,
  };

  return Object.assign(adapters, { files, secrets });
}

describe('installation key', () => {
  it('creates a 256 bit key on first use', async () => {
    const adapters = createAdapters();

    const key = await loadInstallationKey(adapters);

    expect(key.length).toBe(32);
    expect(adapters.secrets.has(captureMasterKeyName)).toBe(true);
  });

  it('reuses the stored key on later launches', async () => {
    const adapters = createAdapters();

    const first = await loadInstallationKey(adapters);
    const second = await loadInstallationKey(adapters);

    expect(Array.from(second)).toEqual(Array.from(first));
  });

  it('stores the key under an explicitly versioned name', () => {
    expect(captureMasterKeyName).toBe('biume.capture.master-key.v1');
  });
});

describe('sealing a recording', () => {
  it('encrypts the audio and removes the plaintext', async () => {
    const adapters = createAdapters();
    adapters.files.set('file:///tmp/recording.m4a', plaintext);

    const sealed = await sealRecording(
      { captureId, plaintextUri: 'file:///tmp/recording.m4a' },
      adapters,
    );

    expect(adapters.files.has('file:///tmp/recording.m4a')).toBe(false);
    expect(adapters.files.has(sealed.encryptedFileUri)).toBe(true);
    expect(sealed.sha256).toBe('b'.repeat(64));
  });

  it('reports the size of the encrypted envelope actually written', async () => {
    const adapters = createAdapters();
    adapters.files.set('file:///tmp/recording.m4a', plaintext);

    const sealed = await sealRecording(
      { captureId, plaintextUri: 'file:///tmp/recording.m4a' },
      adapters,
    );

    expect(sealed.byteSize).toBe(
      adapters.files.get(sealed.encryptedFileUri)!.length,
    );
  });

  it('keeps the plaintext when the encrypted file cannot be written', async () => {
    const adapters = createAdapters({
      fileSystem: {
        async readAsBytes() {
          return plaintext;
        },
        async writeAsBytes() {
          throw new Error('disk full');
        },
        async deleteFile() {
          throw new Error('should not delete');
        },
        async exists() {
          return false;
        },
      },
    });

    await expect(
      sealRecording(
        { captureId, plaintextUri: 'file:///tmp/recording.m4a' },
        adapters,
      ),
    ).rejects.toThrow();
  });

  it('keeps the plaintext when the encrypted file is not readable back', async () => {
    const written: string[] = [];
    const deleted: string[] = [];
    const adapters = createAdapters({
      fileSystem: {
        async readAsBytes(uri) {
          if (uri === 'file:///tmp/recording.m4a') return plaintext;
          throw new Error('unreadable');
        },
        async writeAsBytes(uri) {
          written.push(uri);
        },
        async deleteFile(uri) {
          deleted.push(uri);
        },
        async exists() {
          return true;
        },
      },
    });

    await expect(
      sealRecording(
        { captureId, plaintextUri: 'file:///tmp/recording.m4a' },
        adapters,
      ),
    ).rejects.toThrow();
    expect(deleted).not.toContain('file:///tmp/recording.m4a');
  });
});

describe('opening a capture', () => {
  it('decrypts to memory without writing a second plaintext file', async () => {
    const adapters = createAdapters();
    adapters.files.set('file:///tmp/recording.m4a', plaintext);
    const sealed = await sealRecording(
      { captureId, plaintextUri: 'file:///tmp/recording.m4a' },
      adapters,
    );
    const filesBefore = new Set(adapters.files.keys());

    const audio = await openCaptureAudio(
      { captureId, encryptedFileUri: sealed.encryptedFileUri },
      adapters,
    );

    expect(audio).toEqual(plaintext);
    expect(new Set(adapters.files.keys())).toEqual(filesBefore);
  });

  it('refuses an envelope sealed for another capture', async () => {
    const adapters = createAdapters();
    adapters.files.set('file:///tmp/recording.m4a', plaintext);
    const sealed = await sealRecording(
      { captureId, plaintextUri: 'file:///tmp/recording.m4a' },
      adapters,
    );

    await expect(
      openCaptureAudio(
        {
          captureId: '00000000-0000-4000-8000-000000000000',
          encryptedFileUri: sealed.encryptedFileUri,
        },
        adapters,
      ),
    ).rejects.toThrow();
  });

  it('produces an envelope the crypto module alone can open', async () => {
    const adapters = createAdapters();
    adapters.files.set('file:///tmp/recording.m4a', plaintext);
    const sealed = await sealRecording(
      { captureId, plaintextUri: 'file:///tmp/recording.m4a' },
      adapters,
    );

    const key = await loadInstallationKey(adapters);
    const envelope = adapters.files.get(sealed.encryptedFileUri)!;

    expect(decryptCapture({ key, captureId, envelope })).toEqual(plaintext);
  });
});
