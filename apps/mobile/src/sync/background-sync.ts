import * as BackgroundTask from 'expo-background-task';
import * as TaskManager from 'expo-task-manager';

export const backgroundSyncTaskName = 'biume.capture.sync';

/**
 * Best effort only.
 *
 * iOS and Android decide if and when this runs, so nothing about correctness
 * may depend on it. The foreground triggers — launch, validation, network
 * restoration, and returning to the foreground — are what actually drain the
 * queue; this task merely gives the system a chance to help.
 */
export function registerBackgroundSync(run: () => Promise<void>): void {
  if (!TaskManager.isTaskDefined(backgroundSyncTaskName)) {
    TaskManager.defineTask(backgroundSyncTaskName, async () => {
      try {
        await run();
        return BackgroundTask.BackgroundTaskResult.Success;
      } catch {
        return BackgroundTask.BackgroundTaskResult.Failed;
      }
    });
  }

  void BackgroundTask.registerTaskAsync(backgroundSyncTaskName, {
    minimumInterval: 15,
  }).catch(() => {
    // A device that refuses background work still synchronizes in foreground.
  });
}
