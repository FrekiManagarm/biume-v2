import { Paths } from 'expo-file-system';

/**
 * Free space on the volume the document directory lives on.
 *
 * Returns `Infinity` when the platform will not answer: refusing to record on a
 * failed reading would block a dictation over a diagnostic that never worked,
 * and the recorder still fails loudly if the disk really is full.
 */
export async function deviceFreeSpaceBytes(): Promise<number> {
  try {
    return Paths.availableDiskSpace;
  } catch {
    return Number.POSITIVE_INFINITY;
  }
}
