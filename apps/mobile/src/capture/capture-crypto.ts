import { gcm } from '@noble/ciphers/aes.js';

export const captureEnvelopeVersion = 1;

const versionMarker = 'BIUME1';
const markerBytes = new TextEncoder().encode(versionMarker);
const nonceLength = 12;
const keyLength = 32;

export type EncryptCaptureInput = {
  key: Uint8Array;
  nonce: Uint8Array;
  captureId: string;
  plaintext: Uint8Array;
};

export type DecryptCaptureInput = {
  key: Uint8Array;
  captureId: string;
  envelope: Uint8Array;
};

function assertKey(key: Uint8Array) {
  if (key.length !== keyLength) {
    throw new Error('La clé de capture doit faire 256 bits.');
  }
}

/**
 * The capture id is bound as additional authenticated data, so an envelope
 * cannot be moved onto another capture even by someone holding the key.
 */
function additionalData(captureId: string): Uint8Array {
  return new TextEncoder().encode(captureId);
}

/**
 * On-disk layout: `BIUME1` | 12-byte nonce | AES-256-GCM ciphertext and tag.
 * The version marker is explicit so a future format can be introduced without
 * guessing at what an existing file contains.
 */
export function encryptCapture({
  key,
  nonce,
  captureId,
  plaintext,
}: EncryptCaptureInput): Uint8Array {
  assertKey(key);
  if (nonce.length !== nonceLength) {
    throw new Error('Le nonce de capture doit faire 96 bits.');
  }

  const ciphertext = gcm(key, nonce, additionalData(captureId)).encrypt(
    plaintext,
  );

  const envelope = new Uint8Array(
    markerBytes.length + nonce.length + ciphertext.length,
  );
  envelope.set(markerBytes, 0);
  envelope.set(nonce, markerBytes.length);
  envelope.set(ciphertext, markerBytes.length + nonce.length);
  return envelope;
}

export function readEnvelopeVersion(envelope: Uint8Array): number | null {
  const marker = new TextDecoder().decode(envelope.slice(0, markerBytes.length));
  return marker === versionMarker ? captureEnvelopeVersion : null;
}

export function decryptCapture({
  key,
  captureId,
  envelope,
}: DecryptCaptureInput): Uint8Array {
  assertKey(key);

  if (readEnvelopeVersion(envelope) !== captureEnvelopeVersion) {
    throw new Error("Version d'enveloppe de capture inconnue.");
  }

  const nonce = envelope.slice(
    markerBytes.length,
    markerBytes.length + nonceLength,
  );
  const ciphertext = envelope.slice(markerBytes.length + nonceLength);

  return gcm(key, nonce, additionalData(captureId)).decrypt(ciphertext);
}
