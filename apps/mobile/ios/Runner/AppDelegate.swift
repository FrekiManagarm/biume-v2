import Flutter
import UIKit
import workmanager_apple

@main
@objc class AppDelegate: FlutterAppDelegate, FlutterImplicitEngineDelegate {
  /// Le même identifiant que `backgroundTaskId` côté Dart et que
  /// `BGTaskSchedulerPermittedIdentifiers` dans `Info.plist`.
  private static let backgroundRefreshIdentifier = "com.biume.mobile.refresh"

  override func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
  ) -> Bool {
    // BGTaskScheduler exige que le gestionnaire de la tâche soit enregistré
    // avant la fin du lancement. Avec le cycle de vie UIScene, les plugins ne
    // sont branchés qu'à la connexion de la scène : workmanager n'a plus la
    // main assez tôt pour le faire lui-même. Sans cet appel, le `submit()`
    // déclenché par `registerBackgroundRefresh()` lève une exception
    // Objective-C non rattrapable et le processus est abattu.
    WorkmanagerPlugin.registerPeriodicTask(
      withIdentifier: Self.backgroundRefreshIdentifier,
      earliestBeginInSeconds: NSNumber(value: 15 * 60)
    )
    return super.application(application, didFinishLaunchingWithOptions: launchOptions)
  }

  func didInitializeImplicitFlutterEngine(_ engineBridge: FlutterImplicitEngineBridge) {
    GeneratedPluginRegistrant.register(with: engineBridge.pluginRegistry)
  }
}
