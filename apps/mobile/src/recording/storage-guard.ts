import type { StorageGuardPort } from './audio-recorder';
import { captureMaxBytes } from '@biume/contracts/capture';

/**
 * A recording is refused before a file exists rather than failing halfway
 * through, which would leave an unusable partial take on disk.
 *
 * The margin covers the plaintext take and its encrypted envelope living side
 * by side for the moment between sealing and deleting the plaintext.
 */
export const recordingFreeSpaceMarginBytes = captureMaxBytes * 3;

export function createStorageGuard(
  freeSpaceBytes: () => Promise<number>,
): StorageGuardPort {
  return {
    async hasRoomForRecording() {
      return (await freeSpaceBytes()) >= recordingFreeSpaceMarginBytes;
    },
  };
}
