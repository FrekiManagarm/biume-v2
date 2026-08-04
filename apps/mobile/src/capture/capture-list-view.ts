import type { LocalCapture, LocalCaptureErrorCode } from './local-capture';

export type CaptureAction = 'retry' | 'reconnect' | 'redo' | 'delete';

export type CaptureRowView = {
  id: string;
  label: string;
  status: LocalCapture['status'];
  actions: CaptureAction[];
  expiresInHours: number | null;
  createdAt: string;
  accessibilityLabel: string;
};

const statusLabels: Partial<Record<LocalCapture['status'], string>> = {
  queued: 'À envoyer',
  uploading: 'Envoi en cours',
  uploaded: 'Envoyée',
  needs_action: 'Action requise',
  expired: 'Expirée',
};

export function captureStatusLabel(capture: LocalCapture): string {
  return statusLabels[capture.status] ?? 'À envoyer';
}

/**
 * Conditions a retry cannot resolve. Offering one would only burn attempts and
 * leave the practitioner watching a queue that never drains.
 */
const unretryableCodes = new Set<LocalCaptureErrorCode>([
  'conflict',
  'validation',
  'forbidden',
  'expired',
  'local_file_missing',
  'local_storage_full',
]);

export function captureActionsFor(capture: LocalCapture): CaptureAction[] {
  switch (capture.status) {
    case 'uploading':
    case 'uploaded':
      return [];
    case 'expired':
      return ['delete'];
    case 'needs_action': {
      const code = capture.lastErrorCode;
      if (code === 'unauthorized' || code === 'active_organization_required') {
        return ['reconnect', 'delete'];
      }
      if (code && unretryableCodes.has(code)) return ['redo', 'delete'];
      return ['retry', 'delete'];
    }
    default:
      return ['delete'];
  }
}

const listedStatuses = new Set<LocalCapture['status']>([
  'queued',
  'uploading',
  'uploaded',
  'needs_action',
  'expired',
]);

/**
 * The row carries a label and a status, never a patient or animal name. Status
 * announcements reach the accessibility layer and the system log, so nothing
 * identifying may travel with them.
 */
export function buildCaptureListView(
  captures: readonly LocalCapture[],
  now: string,
): CaptureRowView[] {
  const nowMs = new Date(now).getTime();

  return captures
    .filter((capture) => listedStatuses.has(capture.status))
    .sort(
      (left, right) =>
        new Date(right.createdAt).getTime() -
        new Date(left.createdAt).getTime(),
    )
    .map((capture) => {
      const label = captureStatusLabel(capture);
      const stillWaiting =
        capture.status === 'queued' ||
        capture.status === 'uploading' ||
        capture.status === 'needs_action';

      return {
        id: capture.id,
        label,
        status: capture.status,
        actions: captureActionsFor(capture),
        expiresInHours: stillWaiting
          ? Math.max(
              0,
              Math.floor(
                (new Date(capture.expiresAt).getTime() - nowMs) / 3_600_000,
              ),
            )
          : null,
        createdAt: capture.createdAt,
        accessibilityLabel: `Dictée ${label}`,
      };
    });
}
