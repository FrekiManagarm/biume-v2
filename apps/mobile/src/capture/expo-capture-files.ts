import * as Crypto from 'expo-crypto';
import { Directory, File, Paths } from 'expo-file-system';
import * as SecureStore from 'expo-secure-store';
import type { CaptureFileAdapters } from './capture-files';

/**
 * Binds the capture pipeline to the Expo modules. Everything above this file
 * depends on `CaptureFileAdapters`, never on Expo directly.
 */
export function createExpoCaptureFileAdapters(): CaptureFileAdapters {
  const captures = new Directory(Paths.document, 'captures');
  if (!captures.exists) captures.create({ intermediates: true });

  return {
    documentDirectory: `${Paths.document.uri}`,
    secureStore: {
      getItemAsync: (key) => SecureStore.getItemAsync(key),
      setItemAsync: (key, value) => SecureStore.setItemAsync(key, value),
    },
    fileSystem: {
      async readAsBytes(uri) {
        return new File(uri).bytes();
      },
      async writeAsBytes(uri, bytes) {
        const file = new File(uri);
        if (!file.exists) file.create({ intermediates: true });
        file.write(bytes);
      },
      async deleteFile(uri) {
        const file = new File(uri);
        if (file.exists) file.delete();
      },
      async exists(uri) {
        return new File(uri).exists;
      },
    },
    randomBytes: (length) => Crypto.getRandomBytes(length),
    async sha256Hex(bytes) {
      return Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        String.fromCharCode(...bytes),
        { encoding: Crypto.CryptoEncoding.HEX },
      );
    },
  };
}
