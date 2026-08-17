import type { CaptureRepository } from '../capture/capture-repository';
import { purgeExpiredLocalCaptures } from '../capture/local-purge';
import { recoverCaptureState, type RecoveryPorts } from '../capture/recovery';

export type StartupMaintenancePorts = {
  repository: CaptureRepository;
  recovery: RecoveryPorts;
  deleteFile(uri: string): Promise<void>;
  now(): Date;
};

/**
 * Everything the queue needs done before a screen reads it.
 *
 * Recovery comes first so a take rescued from a crash exists as a row before
 * retention is applied to it. Neither step is allowed to fail the launch: this
 * runs ahead of routing, so an exception here would put a signed-in
 * practitioner back on the sign-in screen because of a database hiccup.
 */
export async function runStartupMaintenance(
  ports: StartupMaintenancePorts,
): Promise<void> {
  try {
    await recoverCaptureState(ports.repository, ports.recovery);
  } catch {
    // A recovery that could not run leaves the queue as it was on disk, which
    // is still a consistent state. Retention below matters more.
  }

  try {
    await purgeExpiredLocalCaptures({
      repository: ports.repository,
      deleteFile: ports.deleteFile,
      now: ports.now,
    });
  } catch {
    // The next launch, or the next sweep, tries again.
  }
}
