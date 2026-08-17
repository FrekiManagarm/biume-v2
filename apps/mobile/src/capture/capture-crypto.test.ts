import {
  captureEnvelopeVersion,
  decryptCapture,
  encryptCapture,
  readEnvelopeVersion,
} from './capture-crypto';

const key = new Uint8Array(32).fill(7);
const nonce = new Uint8Array(12).fill(3);
const captureId = '6f1a6d5e-3f2b-4c1d-9a7e-2b8c4d5e6f70';
const plaintext = new TextEncoder().encode('ceci est une dictee de seance');

describe('capture envelope', () => {
  it('round-trips the audio it was given', () => {
    const envelope = encryptCapture({ key, nonce, captureId, plaintext });

    expect(decryptCapture({ key, captureId, envelope })).toEqual(plaintext);
  });

  it('carries an explicit version marker', () => {
    const envelope = encryptCapture({ key, nonce, captureId, plaintext });

    expect(readEnvelopeVersion(envelope)).toBe(captureEnvelopeVersion);
    expect(new TextDecoder().decode(envelope.slice(0, 6))).toBe('BIUME1');
  });

  it('never leaves the audio readable on disk', () => {
    const envelope = encryptCapture({ key, nonce, captureId, plaintext });
    const asText = new TextDecoder('utf8', { fatal: false }).decode(envelope);

    expect(asText).not.toContain('dictee');
    expect(asText).not.toContain('seance');
  });

  it('refuses a single flipped byte', () => {
    const envelope = encryptCapture({ key, nonce, captureId, plaintext });
    const tampered = Uint8Array.from(envelope);
    const target = tampered.length - 1;
    tampered[target] = tampered[target]! ^ 0x01;

    expect(() => decryptCapture({ key, captureId, envelope: tampered })).toThrow();
  });

  it('refuses a capture id that is not the one it was sealed with', () => {
    const envelope = encryptCapture({ key, nonce, captureId, plaintext });

    expect(() =>
      decryptCapture({
        key,
        captureId: '00000000-0000-4000-8000-000000000000',
        envelope,
      }),
    ).toThrow();
  });

  it('refuses the wrong installation key', () => {
    const envelope = encryptCapture({ key, nonce, captureId, plaintext });

    expect(() =>
      decryptCapture({
        key: new Uint8Array(32).fill(9),
        captureId,
        envelope,
      }),
    ).toThrow();
  });

  it('produces different ciphertext for two nonces', () => {
    const first = encryptCapture({ key, nonce, captureId, plaintext });
    const second = encryptCapture({
      key,
      nonce: new Uint8Array(12).fill(4),
      captureId,
      plaintext,
    });

    expect(Array.from(first)).not.toEqual(Array.from(second));
    expect(decryptCapture({ key, captureId, envelope: second })).toEqual(
      plaintext,
    );
  });

  it('rejects an envelope written by an unknown version', () => {
    const envelope = encryptCapture({ key, nonce, captureId, plaintext });
    const foreign = Uint8Array.from(envelope);
    foreign.set(new TextEncoder().encode('BIUME9'), 0);

    expect(() =>
      decryptCapture({ key, captureId, envelope: foreign }),
    ).toThrow(/version/i);
  });

  it('rejects a key that is not 256 bits', () => {
    expect(() =>
      encryptCapture({
        key: new Uint8Array(16),
        nonce,
        captureId,
        plaintext,
      }),
    ).toThrow();
  });

  it('rejects a nonce that is not 96 bits', () => {
    expect(() =>
      encryptCapture({
        key,
        nonce: new Uint8Array(8),
        captureId,
        plaintext,
      }),
    ).toThrow();
  });
});
