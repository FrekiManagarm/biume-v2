import 'package:flutter/widgets.dart';
import 'package:workmanager/workmanager.dart';

import '../../features/capture/domain/capture_store.dart';
import '../../features/capture/domain/sync_engine.dart';
import '../../features/followup/domain/actionable_follow_up_repository.dart';
import '../../features/followup/domain/follow_up.dart';
import '../../features/todo/domain/todo_api.dart';
import '../../features/todo/domain/todo_item.dart';
import '../../features/todo/presentation/todo_cubit.dart';
import '../../injection_container.dart';
import '../notifications/local_notifications.dart';
import '../notifications/notification_memory.dart';
import '../notifications/notification_planner.dart';
import '../result.dart';
import '../telemetry/journey_events.dart';
import '../telemetry/telemetry.dart';

/// Le même identifiant que `BGTaskSchedulerPermittedIdentifiers` dans
/// `Info.plist` : iOS refuse de programmer une tâche qu'il n'y trouve pas.
const String backgroundTaskId = 'com.biume.mobile.refresh';

/// Un tour de boucle : la file repart, on relit ce qui attend un geste, et on
/// ne dérange que pour ce qui est nouveau.
///
/// N'écrit rien d'autre que la mémoire des notifications. Ne lève jamais : un
/// réveil qui plante est un réveil que le système finit par ne plus accorder.
///
/// [runSync] et [notify] à `false` au premier plan : le praticien a la liste sous les yeux,
/// on retient qu'il l'a vue pour ne pas le réveiller une demi-heure plus tard
/// avec ce qu'il vient de lire.
Future<void> runBackgroundCycle({
  required SyncEngine sync,
  required TodoApi todo,
  required ActionableFollowUpRepository followUps,
  required CaptureStore store,
  required NotificationMemory memory,
  required LocalNotifications notifications,
  required Telemetry telemetry,
  required DateTime Function() now,
  bool notify = true,
  bool runSync = true,
}) async {
  try {
    // Au premier plan, la file est déjà repartie en parallèle du reste : la
    // relancer ici ne ferait que relire la base pour rien.
    if (runSync) await sync.runOnce();

    final remoteFuture = todo.list();
    final followUpsFuture = followUps.listActionable();
    final remote = switch (await remoteFuture) {
      Success(:final value) => value,
      // Un échec de lecture n'est pas une liste vide : on ne notifie
      // simplement rien de ce côté ce tour-ci.
      Err() => const <TodoItem>[],
    };
    final actionable = switch (await followUpsFuture) {
      Success(:final value) =>
        value.where((follow) => follow.isActionable).toList(),
      Err() => const <FollowUp>[],
    };

    final items = composeTodo(
      local: await store.watchAll().first,
      followUps: actionable,
      remote: remote,
      now: now(),
    );

    final planned = planNotifications(
      todo: items,
      alreadyNotified: await memory.keys(),
    );
    if (planned.isEmpty) return;

    if (notify) {
      for (final notification in planned) {
        await notifications.show(notification);
        _traceIfFollowUp(notification, actionable, telemetry, now);
      }
    }

    // Après l'affichage : une notification qui n'a pas pu s'afficher n'est
    // pas une situation traitée, et l'oublier ici la ferait disparaître pour
    // toujours.
    await memory.remember(planned.map((n) => n.key));
  } catch (_) {
    // Un réveil en arrière-plan qui lève est un réveil que le système finit
    // par ne plus accorder. Le prochain tour reprendra le même travail.
  }
}

/// Le délai réel entre la réponse du propriétaire, côté serveur, et le moment
/// où le praticien l'apprend. C'est ce chiffre — et rien d'autre — qui dira si
/// le chantier push vaut d'être ouvert.
void _traceIfFollowUp(
  PlannedNotification notification,
  List<FollowUp> actionable,
  Telemetry telemetry,
  DateTime Function() now,
) {
  if (!notification.key.startsWith('followup:')) return;
  final id = notification.key.substring('followup:'.length);
  for (final follow in actionable) {
    if (follow.id != id) continue;
    final answeredAt = follow.answeredAt;
    // Sans date de réponse, pas de mesure : un délai inventé fausserait
    // exactement la décision qu'il doit éclairer.
    if (answeredAt == null) return;
    telemetry.emit(
      ProductEvent(
        name: JourneyEvents.followUpNotified,
        journeyId: follow.reportId,
        properties: {
          'delayMs': now().difference(answeredAt).inMilliseconds,
        },
      ),
    );
    return;
  }
}

/// Toutes les quinze minutes, réseau exigé. Android tient à peu près ce
/// rythme ; iOS accorde ce qu'il veut, quand il veut — c'est assumé, et c'est
/// précisément ce que la télémétrie du délai mesure.
Future<void> registerBackgroundRefresh() => Workmanager().registerPeriodicTask(
  backgroundTaskId,
  backgroundTaskId,
  frequency: const Duration(minutes: 15),
  constraints: Constraints(networkType: NetworkType.connected),
  existingWorkPolicy: ExistingPeriodicWorkPolicy.keep,
);

@pragma('vm:entry-point')
void backgroundDispatcher() {
  Workmanager().executeTask((task, _) async {
    // Isolat séparé : rien du premier plan n'est disponible, on reconstruit.
    WidgetsFlutterBinding.ensureInitialized();
    await configureDependencies();
    final notifications = LocalNotifications();
    // Aucune navigation possible depuis cet isolat : le toucher sur la
    // notification sera traité par le premier plan, au démarrage.
    await notifications.initialize(onOpened: (_) {});
    await runBackgroundCycle(
      sync: getIt(),
      todo: getIt(),
      followUps: getIt(),
      store: getIt(),
      memory: getIt(),
      notifications: notifications,
      telemetry: getIt(),
      now: DateTime.now,
    );
    return true;
  });
}
