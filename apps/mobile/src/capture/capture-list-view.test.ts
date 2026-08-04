import { captureRetentionMs } from '@biume/contracts/capture';
import {
  buildCaptureListView,
  captureActionsFor,
  captureStatusLabel,
} from './capture-list-view';
import type { LocalCapture } from './local-capture';

const now = new Date('2026-07-19T12:00:00.000Z');

function buildCapture(overrides: Partial<LocalCapture> = {}): LocalCapture {
  return {
    id: 'capture-1',
    appointmentId: null,
    patientId: null,
    encryptedFileUri: 'file:///captures/capture-1.biume',
    durationMs: 120_000,
    mimeType: 'audio/mp4',
    byteSize: 1_048_576,
    sha256: 'a'.repeat(64),
    status: 'queued',
    remoteStatus: null,
    attemptCount: 0,
    nextAttemptAt: null,
    lastErrorCode: null,
    createdAt: now.toISOString(),
    validatedAt: null,
    expiresAt: new Date(now.getTime() + captureRetentionMs).toISOString(),
    updatedAt: now.toISOString(),
    ...overrides,
  };
}

describe('status labels', () => {
  it.each([
    ['queued', 'À envoyer'],
    ['uploading', 'Envoi en cours'],
    ['uploaded', 'Envoyée'],
    ['needs_action', 'Action requise'],
    ['expired', 'Expirée'],
  ] as const)('shows %s as "%s"', (status, label) => {
    expect(captureStatusLabel(buildCapture({ status }))).toBe(label);
  });
});

describe('available actions', () => {
  it('offers reconnection when the session expired', () => {
    expect(
      captureActionsFor(
        buildCapture({ status: 'needs_action', lastErrorCode: 'unauthorized' }),
      ),
    ).toEqual(['reconnect', 'delete']);
  });

  it('offers a new recording when the local audio is gone', () => {
    expect(
      captureActionsFor(
        buildCapture({
          status: 'needs_action',
          lastErrorCode: 'local_file_missing',
        }),
      ),
    ).toEqual(['redo', 'delete']);
  });

  it('never offers a retry on an identity conflict', () => {
    const actions = captureActionsFor(
      buildCapture({ status: 'needs_action', lastErrorCode: 'conflict' }),
    );

    expect(actions).not.toContain('retry');
    expect(actions).toEqual(['redo', 'delete']);
  });

  it('offers a retry after a transient failure', () => {
    expect(
      captureActionsFor(
        buildCapture({ status: 'needs_action', lastErrorCode: 'server_error' }),
      ),
    ).toEqual(['retry', 'delete']);
  });

  it('lets a queued capture be cancelled', () => {
    expect(captureActionsFor(buildCapture({ status: 'queued' }))).toEqual([
      'delete',
    ]);
  });

  it('offers nothing while an upload is in flight', () => {
    expect(captureActionsFor(buildCapture({ status: 'uploading' }))).toEqual(
      [],
    );
  });

  it('keeps a sent capture read-only', () => {
    expect(captureActionsFor(buildCapture({ status: 'uploaded' }))).toEqual([]);
  });

  it('lets an expired capture be cleared', () => {
    expect(captureActionsFor(buildCapture({ status: 'expired' }))).toEqual([
      'delete',
    ]);
  });
});

describe('list view', () => {
  it('hides captures that are not yet validated', () => {
    const view = buildCaptureListView(
      [
        buildCapture({ id: 'recording', status: 'recording' }),
        buildCapture({ id: 'review', status: 'review' }),
        buildCapture({ id: 'queued', status: 'queued' }),
      ],
      now.toISOString(),
    );

    expect(view.map((row) => row.id)).toEqual(['queued']);
  });

  it('hides cancelled captures', () => {
    expect(
      buildCaptureListView(
        [buildCapture({ status: 'cancelled' })],
        now.toISOString(),
      ),
    ).toEqual([]);
  });

  it('shows the newest capture first', () => {
    const view = buildCaptureListView(
      [
        buildCapture({ id: 'older', createdAt: '2026-07-19T08:00:00.000Z' }),
        buildCapture({ id: 'newer', createdAt: '2026-07-19T11:00:00.000Z' }),
      ],
      now.toISOString(),
    );

    expect(view.map((row) => row.id)).toEqual(['newer', 'older']);
  });

  it('counts the hours left before an unsent capture expires', () => {
    const view = buildCaptureListView(
      [
        buildCapture({
          status: 'queued',
          expiresAt: new Date(now.getTime() + 3 * 3_600_000).toISOString(),
        }),
      ],
      now.toISOString(),
    );

    expect(view[0]?.expiresInHours).toBe(3);
  });

  it('stops counting once a capture has been sent', () => {
    const view = buildCaptureListView(
      [buildCapture({ status: 'uploaded' })],
      now.toISOString(),
    );

    expect(view[0]?.expiresInHours).toBeNull();
  });

  it('never carries a patient or animal name into the row', () => {
    const view = buildCaptureListView(
      [buildCapture({ patientId: 'pet-1' })],
      now.toISOString(),
    );

    expect(Object.keys(view[0] ?? {})).toEqual([
      'id',
      'label',
      'status',
      'actions',
      'expiresInHours',
      'createdAt',
      'accessibilityLabel',
    ]);
    expect(JSON.stringify(view)).not.toContain('Nala');
  });
});
