import 'package:flutter/foundation.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';

import 'notification_planner.dart';

/// Le canal Android. Un seul, et son nom dit à quoi il sert : le praticien qui
/// ouvre les réglages système doit comprendre ce qu'il couperait.
const String _channelId = 'biume_actions';
const String _channelName = 'Ce qui demande une action';

/// Les notifications locales, et rien d'autre : aucun SDK push, aucun jeton
/// d'appareil, aucune table serveur. C'est le réveil périodique qui décide de
/// quoi parler, pas un serveur qui pousse.
class LocalNotifications {
  LocalNotifications([FlutterLocalNotificationsPlugin? plugin])
    : _plugin = plugin ?? FlutterLocalNotificationsPlugin();

  final FlutterLocalNotificationsPlugin _plugin;

  Future<void> initialize({required void Function(String route) onOpened}) =>
      _plugin.initialize(
        settings: const InitializationSettings(
          android: AndroidInitializationSettings('@mipmap/ic_launcher'),
          iOS: DarwinInitializationSettings(
            // La permission est demandée après la connexion, pas au premier
            // lancement : on ne réclame rien à quelqu'un qui n'a pas encore
            // vu l'application.
            requestAlertPermission: false,
            requestBadgePermission: false,
            requestSoundPermission: false,
          ),
        ),
        onDidReceiveNotificationResponse: (response) {
          final route = response.payload;
          if (route != null && route.isNotEmpty) onOpened(route);
        },
      );

  /// Demandée après la première session ouverte : le praticien sait alors ce
  /// que Biume lui promet de signaler.
  Future<bool> requestPermission() async {
    if (defaultTargetPlatform == TargetPlatform.android) {
      final android = _plugin
          .resolvePlatformSpecificImplementation<
            AndroidFlutterLocalNotificationsPlugin
          >();
      return await android?.requestNotificationsPermission() ?? false;
    }
    final ios = _plugin
        .resolvePlatformSpecificImplementation<
          IOSFlutterLocalNotificationsPlugin
        >();
    return await ios?.requestPermissions(alert: true, badge: true) ?? false;
  }

  /// L'identifiant vient de la clé de situation : réafficher la même
  /// situation remplace la notification au lieu d'en empiler une seconde.
  Future<void> show(PlannedNotification notification) => _plugin.show(
    id: notification.key.hashCode,
    title: notification.title,
    body: notification.body,
    payload: notification.route,
    notificationDetails: const NotificationDetails(
      android: AndroidNotificationDetails(
        _channelId,
        _channelName,
        importance: Importance.high,
        priority: Priority.high,
      ),
      iOS: DarwinNotificationDetails(),
    ),
  );
}
