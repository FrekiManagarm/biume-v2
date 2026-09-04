import Flutter
import UIKit
import workmanager_apple

/// Le même identifiant que `backgroundTaskId` dans
/// `lib/core/background/background_refresh.dart` et que l'unique entrée de
/// `BGTaskSchedulerPermittedIdentifiers` dans `Info.plist`.
private let backgroundRefreshTaskId = "com.biume.mobile.refresh"

@main
@objc class AppDelegate: FlutterAppDelegate, FlutterImplicitEngineDelegate {
  override func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
  ) -> Bool {
    // `BGTaskScheduler` lève une exception Objective-C — que le `do/catch`
    // Swift du plugin ne rattrape pas, d'où l'arrêt brutal du processus — si
    // on lui soumet une tâche dont l'identifiant n'a pas reçu son gestionnaire
    // avant la fin de ce lancement. L'application adopte `UIScene`, donc les
    // plugins Flutter ne sont enregistrés qu'à la connexion de la scène, trop
    // tard : c'est ici, et nulle part ailleurs, que l'identifiant doit être
    // déclaré.
    WorkmanagerPlugin.registerPeriodicTask(withIdentifier: backgroundRefreshTaskId)
    return super.application(application, didFinishLaunchingWithOptions: launchOptions)
  }

  func didInitializeImplicitFlutterEngine(_ engineBridge: FlutterImplicitEngineBridge) {
    GeneratedPluginRegistrant.register(with: engineBridge.pluginRegistry)
  }
}
