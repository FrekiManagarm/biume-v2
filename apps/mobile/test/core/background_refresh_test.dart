import 'package:biume_mobile/core/background/background_refresh.dart';
import 'package:biume_mobile/core/database/app_database.dart';
import 'package:biume_mobile/core/failure.dart';
import 'package:biume_mobile/core/notifications/local_notifications.dart';
import 'package:biume_mobile/core/notifications/notification_memory.dart';
import 'package:biume_mobile/core/notifications/notification_planner.dart';
import 'package:biume_mobile/core/result.dart';
import 'package:biume_mobile/core/telemetry/journey_events.dart';
import 'package:biume_mobile/core/telemetry/telemetry.dart';
import 'package:biume_mobile/features/capture/domain/capture_store.dart';
import 'package:biume_mobile/features/capture/domain/sync_engine.dart';
import 'package:biume_mobile/features/followup/domain/actionable_follow_up_repository.dart';
import 'package:biume_mobile/features/followup/domain/follow_up.dart';
import 'package:biume_mobile/features/todo/domain/todo_api.dart';
import 'package:biume_mobile/features/todo/domain/todo_item.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';

import '../features/followup/follow_up_fixture.dart';

class MockSyncEngine extends Mock implements SyncEngine {}

class MockTodoApi extends Mock implements TodoApi {}

class MockActionableFollowUpRepository extends Mock
    implements ActionableFollowUpRepository {}

class MockCaptureStore extends Mock implements CaptureStore {}

class MockNotificationMemory extends Mock implements NotificationMemory {}

class MockLocalNotifications extends Mock implements LocalNotifications {}

const outcomeVide = SyncOutcome(uploaded: 0, retried: 0, stopped: 0, purged: 0);

TodoItem serverItem(TodoKind kind, String captureId, {String? reportId}) =>
    TodoItem(
      kind: kind,
      captureId: captureId,
      reportId: reportId,
      updatedAt: DateTime.utc(2026, 9, 3, 9),
    );

void main() {
  late MockSyncEngine sync;
  late MockTodoApi todo;
  late MockActionableFollowUpRepository followUps;
  late MockCaptureStore store;
  late MockNotificationMemory memory;
  late MockLocalNotifications notifications;
  late Telemetry telemetry;
  late List<ProductEvent> emis;

  setUpAll(() {
    registerFallbackValue(
      const PlannedNotification(key: 'k', title: 't', body: 'b', route: '/'),
    );
  });

  setUp(() {
    sync = MockSyncEngine();
    todo = MockTodoApi();
    followUps = MockActionableFollowUpRepository();
    store = MockCaptureStore();
    memory = MockNotificationMemory();
    notifications = MockLocalNotifications();
    emis = [];
    telemetry = Telemetry(sink: emis.add);

    when(() => sync.runOnce()).thenAnswer((_) async => outcomeVide);
    when(() => store.watchAll()).thenAnswer(
      (_) => Stream.value(const <LocalCapture>[]),
    );
    when(() => memory.keys()).thenAnswer((_) async => <String>{});
    when(() => memory.remember(any())).thenAnswer((_) async {});
    when(() => notifications.show(any())).thenAnswer((_) async {});
  });

  Future<void> cycle({
    bool notify = true,
    bool runSync = true,
    DateTime? now,
  }) => runBackgroundCycle(
    sync: sync,
    todo: todo,
    followUps: followUps,
    store: store,
    memory: memory,
    notifications: notifications,
    telemetry: telemetry,
    now: () => now ?? DateTime.utc(2026, 9, 3, 11),
    notify: notify,
    runSync: runSync,
  );

  test(
    'un cycle relance la file, relit, notifie ce qui est nouveau et s\'en souvient',
    () async {
      when(() => todo.list()).thenAnswer(
        (_) async =>
            Success([serverItem(TodoKind.readyToSend, 'c-1', reportId: 'r-1')]),
      );
      when(() => followUps.listActionable()).thenAnswer(
        (_) async => Success([
          suivi(id: 'f-1', answeredAt: DateTime.utc(2026, 9, 3, 9)),
        ]),
      );
      when(() => memory.keys()).thenAnswer((_) async => {'draft:r-1'});

      await cycle();

      verify(() => sync.runOnce()).called(1);
      final montrees = verify(() => notifications.show(captureAny()))
          .captured
          .cast<PlannedNotification>();
      expect(montrees.map((n) => n.key), ['followup:f-1']);
      verify(() => memory.remember(['followup:f-1'])).called(1);

      final event = emis.single;
      expect(event.name, JourneyEvents.followUpNotified);
      expect(event.journeyId, 'report-1');
      expect(event.properties['delayMs'], 2 * 60 * 60 * 1000);
    },
  );

  test('un cycle sans réseau ne notifie rien et ne lève pas', () async {
    when(() => todo.list()).thenAnswer((_) async => const Err(NetworkFailure()));
    when(
      () => followUps.listActionable(),
    ).thenAnswer((_) async => const Err(NetworkFailure()));

    await expectLater(cycle(), completes);

    verifyNever(() => notifications.show(any()));
    verifyNever(() => memory.remember(any()));
    expect(emis, isEmpty);
  });

  /// Ce que le praticien a déjà sous les yeux ne doit pas le réveiller une
  /// demi-heure plus tard : le premier plan se souvient sans notifier.
  test('au premier plan, se souvient sans rien montrer', () async {
    when(() => todo.list()).thenAnswer(
      (_) async =>
          Success([serverItem(TodoKind.readyToSend, 'c-1', reportId: 'r-1')]),
    );
    when(
      () => followUps.listActionable(),
    ).thenAnswer((_) async => const Success(<FollowUp>[]));

    await cycle(notify: false, runSync: false);

    verifyNever(() => notifications.show(any()));
    // La file est déjà repartie en parallèle du reste du premier plan.
    verifyNever(() => sync.runOnce());
    verify(() => memory.remember(['draft:r-1'])).called(1);
    expect(emis, isEmpty);
  });

  /// Un suivi arrivé sans date de réponse ne doit pas produire un délai
  /// inventé : mieux vaut notifier sans mesure que fausser la mesure qui
  /// décidera, ou non, du chantier push.
  test('notifie un suivi sans date de réponse, sans mesurer de délai', () async {
    when(
      () => todo.list(),
    ).thenAnswer((_) async => const Success(<TodoItem>[]));
    when(() => followUps.listActionable()).thenAnswer(
      (_) async => Success([suivi(id: 'f-1')]),
    );

    await cycle();

    verify(() => notifications.show(any())).called(1);
    expect(emis, isEmpty);
  });

  /// Une notification qui n'a pas pu s'afficher n'est pas une situation
  /// traitée : la retenir en mémoire la ferait disparaître pour toujours.
  test('n\'oublie pas une notification qui n\'a pas pu s\'afficher', () async {
    when(
      () => todo.list(),
    ).thenAnswer((_) async => const Success(<TodoItem>[]));
    when(
      () => followUps.listActionable(),
    ).thenAnswer((_) async => Success([suivi(id: 'f-1')]));
    when(() => notifications.show(any())).thenThrow(Exception('refusé'));

    await expectLater(cycle(), completes);

    verifyNever(() => memory.remember(any()));
  });
}
