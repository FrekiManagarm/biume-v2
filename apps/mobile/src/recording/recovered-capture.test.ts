import {
  captureMaxDurationMs,
  captureRetentionMs,
} from '@biume/contracts/capture';
import { buildRecoveredCapture } from './recovered-capture';
import type { InterruptedSession } from './recording-session';

const now = new Date('2026-07-19T10:30:00.000Z');

const session: InterruptedSession = {
  captureId: '6f1a6d5e-3f2b-4c1d-9a7e-2b8c4d5e6f70',
  appointmentId: 'appointment-1',
  patientId: 'patient-1',
  plaintextUri: 'file:///tmp/recording-1.m4a',
  startedAt: '2026-07-19T10:00:00.000Z',
};

const sealed = {
  encryptedFileUri: 'file:///documents/captures/capture-1.biume',
  sha256: 'a'.repeat(64),
  byteSize: 480_000,
};

describe('rebuilding a capture a crash interrupted', () => {
  it('keeps the identity and the context of the interrupted take', () => {
    const capture = buildRecoveredCapture({ session, sealed, now });

    expect(capture.id).toBe(session.captureId);
    expect(capture.appointmentId).toBe('appointment-1');
    expect(capture.patientId).toBe('patient-1');
    expect(capture.encryptedFileUri).toBe(sealed.encryptedFileUri);
    expect(capture.sha256).toBe(sealed.sha256);
  });

  it('lands in review so the practitioner decides its fate', () => {
    const capture = buildRecoveredCapture({ session, sealed, now });

    expect(capture.status).toBe('review');
    expect(capture.validatedAt).toBeNull();
    expect(capture.attemptCount).toBe(0);
  });

  it('dates retention from when the recording started', () => {
    const capture = buildRecoveredCapture({ session, sealed, now });

    expect(capture.createdAt).toBe(session.startedAt);
    expect(capture.expiresAt).toBe(
      new Date(
        new Date(session.startedAt).getTime() + captureRetentionMs,
      ).toISOString(),
    );
  });

  it('estimates the duration from the encoded size', () => {
    // 64 kbit/s constant bitrate: 480 000 bytes is 60 seconds of audio.
    expect(buildRecoveredCapture({ session, sealed, now }).durationMs).toBe(
      60_000,
    );
  });

  it('never estimates past the ten-minute ceiling', () => {
    const capture = buildRecoveredCapture({
      session,
      sealed: { ...sealed, byteSize: 16 * 1024 * 1024 },
      now,
    });

    expect(capture.durationMs).toBe(captureMaxDurationMs);
  });

  it('never estimates a duration the server would reject', () => {
    // The contract requires a strictly positive duration, so even a sliver of
    // audio has to round up rather than to zero.
    expect(
      buildRecoveredCapture({ session, sealed: { ...sealed, byteSize: 4 }, now })
        .durationMs,
    ).toBeGreaterThan(0);
  });
});
