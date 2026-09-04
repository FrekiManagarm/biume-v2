import 'dart:async';

import 'package:biume_mobile/core/database/app_database.dart';
import 'package:biume_mobile/core/failure.dart';
import 'package:biume_mobile/core/result.dart';
import 'package:biume_mobile/features/capture/domain/capture_store.dart';
import 'package:biume_mobile/features/capture/domain/sync_decision.dart';
import 'package:biume_mobile/features/followup/domain/actionable_follow_up_repository.dart';
import 'package:biume_mobile/features/followup/domain/follow_up.dart';
import 'package:biume_mobile/features/todo/domain/todo_api.dart';
import 'package:biume_mobile/features/todo/domain/todo_item.dart';
import 'package:biume_mobile/features/todo/presentation/todo_cubit.dart';
import 'package:bloc_test/bloc_test.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';

import '../followup/follow_up_fixture.dart';

/// Une file dont les tests contrôlent le contenu à la main, sans base réelle.
/// `emitAll` rejoue systématiquement la dernière liste à qui s'abonne après
/// coup : c'est ce que `TodoCubit.start()` attend, appelé après `setUp`.
class FakeCaptureStore implements CaptureStore {
  List<LocalCapture> _current = const [];
  final _controller = StreamController<List<LocalCapture>>.broadcast();

  void emitAll(List<LocalCapture> rows) {
    _current = rows;
    _controller.add(rows);
  }

  @override
  Stream<List<LocalCapture>> watchAll() async* {
    yield _current;
    yield* _controller.stream;
  }

  @override
  Future<void> create({
    required String id,
    required String? appointmentId,
    required int durationMs,
    required int byteSize,
    required String sha256,
    required String filePath,
    required DateTime createdAt,
    required DateTime expiresAt,
    String? patientId,
  }) => throw UnimplementedError();

  final transitions =
      <
        ({
          String id,
          LocalCaptureStatus to,
          int? attemptCount,
          String? errorCode,
        })
      >[];

  @override
  Future<bool> transition(
    String id,
    LocalCaptureStatus to, {
    int? attemptCount,
    String? errorCode,
    DateTime? nextAttemptAt,
  }) async {
    transitions.add((
      id: id,
      to: to,
      attemptCount: attemptCount,
      errorCode: errorCode,
    ));
    return true;
  }

  @override
  Future<List<SyncCandidate>> pending() => throw UnimplementedError();

  @override
  Future<void> attachPatient(String id, String patientId) =>
      throw UnimplementedError();

  @override
  Future<void> markExtractionRequested(String id, DateTime at) =>
      throw UnimplementedError();

  @override
  Future<LocalCapture?> byId(String id) => throw UnimplementedError();

  @override
  Future<String?> filePathOf(String id) => throw UnimplementedError();
}

class MockTodoApi extends Mock implements TodoApi {}

class MockActionableFollowUpRepository extends Mock
    implements ActionableFollowUpRepository {}

LocalCapture localQueued(
  String id, {
  String? appointmentId,
  DateTime? createdAt,
}) => LocalCapture(
  id: id,
  appointmentId: appointmentId,
  status: LocalCaptureStatus.queued,
  durationMs: 12000,
  byteSize: 400000,
  sha256: 'sha-$id',
  attemptCount: 0,
  createdAt: createdAt ?? DateTime(2026, 9, 3, 9),
  expiresAt: DateTime(2026, 9, 4, 9),
);

LocalCapture localUploaded(
  String id, {
  DateTime? extractionRequestedAt,
  DateTime? createdAt,
}) => LocalCapture(
  id: id,
  status: LocalCaptureStatus.uploaded,
  durationMs: 12000,
  byteSize: 400000,
  sha256: 'sha-$id',
  attemptCount: 0,
  createdAt: createdAt ?? DateTime(2026, 9, 3, 9),
  expiresAt: DateTime(2026, 9, 4, 9),
  extractionRequestedAt: extractionRequestedAt,
);

TodoItem serverItem(TodoKind kind, String captureId, {String? reportId}) =>
    TodoItem(
      kind: kind,
      captureId: captureId,
      reportId: reportId,
      updatedAt: DateTime(2026, 9, 3, 9),
    );

void main() {
  late FakeCaptureStore store;
  late MockTodoApi api;
  late MockActionableFollowUpRepository followUps;

  setUp(() {
    store = FakeCaptureStore();
    api = MockTodoApi();
    followUps = MockActionableFollowUpRepository();
    when(
      () => followUps.listActionable(),
    ).thenAnswer((_) async => const Success(<FollowUp>[]));
  });

  blocTest<TodoCubit, TodoState>(
    'place les dictées locales non envoyées avant les éléments du serveur',
    setUp: () {
      store.emitAll([localQueued('c-local')]);
      when(() => api.list()).thenAnswer(
        (_) async => Success([serverItem(TodoKind.reportToValidate, 'c-srv')]),
      );
    },
    build: () => TodoCubit(store, api, followUps: followUps, pollInterval: Duration.zero),
    act: (cubit) => cubit.start(),
    verify: (cubit) =>
        expect(cubit.state.items.map((i) => i.captureId), ['c-local', 'c-srv']),
  );

  /// Un suivi est plus urgent qu'un brouillon — un propriétaire attend — mais
  /// moins qu'une dictée jamais partie, seule chose que le praticien peut
  /// débloquer sans réseau.
  blocTest<TodoCubit, TodoState>(
    'place les suivis actionnables après les dictées locales et avant le reste',
    setUp: () {
      store.emitAll([localQueued('c-local')]);
      when(() => api.list()).thenAnswer(
        (_) async => Success([serverItem(TodoKind.reportToValidate, 'c-srv')]),
      );
      when(
        () => followUps.listActionable(),
      ).thenAnswer((_) async => Success([suivi(id: 'f-1')]));
    },
    build: () => TodoCubit(
      store,
      api,
      followUps: followUps,
      pollInterval: Duration.zero,
    ),
    act: (cubit) => cubit.start(),
    verify: (cubit) => expect(cubit.state.items.map((i) => i.kind), [
      TodoKind.pendingUpload,
      TodoKind.followUp,
      TodoKind.reportToValidate,
    ]),
  );

  /// Le serveur qui ne répond pas sur les suivis ne doit pas vider « À
  /// traiter » : le reste de la liste vaut mieux qu'une page blanche.
  blocTest<TodoCubit, TodoState>(
    'garde le reste de la liste quand les suivis ne se chargent pas',
    setUp: () {
      when(() => api.list()).thenAnswer(
        (_) async => Success([serverItem(TodoKind.reportToValidate, 'c-srv')]),
      );
      when(
        () => followUps.listActionable(),
      ).thenAnswer((_) async => const Err(NetworkFailure()));
    },
    build: () => TodoCubit(
      store,
      api,
      followUps: followUps,
      pollInterval: Duration.zero,
    ),
    act: (cubit) => cubit.start(),
    verify: (cubit) =>
        expect(cubit.state.items.single.kind, TodoKind.reportToValidate),
  );

  blocTest<TodoCubit, TodoState>(
    'affiche « Biume prépare le compte rendu » juste après la validation',
    setUp: () {
      store.emitAll([
        localUploaded(
          'c-1',
          extractionRequestedAt: DateTime(2026, 9, 3, 10, 0),
        ),
      ]);
      when(() => api.list()).thenAnswer(
        (_) async => Success([serverItem(TodoKind.transcriptToReview, 'c-1')]),
      );
    },
    build: () => TodoCubit(
      store,
      api,
      followUps: followUps,
      pollInterval: Duration.zero,
      now: () => DateTime(2026, 9, 3, 10, 1),
    ),
    act: (cubit) => cubit.start(),
    verify: (cubit) =>
        expect(cubit.state.items.single.kind, TodoKind.preparing),
  );

  blocTest<TodoCubit, TodoState>(
    'la marque locale disparaît une fois la fenêtre passée',
    setUp: () {
      store.emitAll([
        localUploaded(
          'c-1',
          extractionRequestedAt: DateTime(2026, 9, 3, 10, 0),
        ),
      ]);
      when(() => api.list()).thenAnswer(
        (_) async => Success([serverItem(TodoKind.transcriptToReview, 'c-1')]),
      );
    },
    build: () => TodoCubit(
      store,
      api,
      followUps: followUps,
      pollInterval: Duration.zero,
      now: () => DateTime(2026, 9, 3, 10, 5),
    ),
    act: (cubit) => cubit.start(),
    verify: (cubit) =>
        expect(cubit.state.items.single.kind, TodoKind.transcriptToReview),
  );

  blocTest<TodoCubit, TodoState>(
    'garde la liste et dit hors ligne quand le serveur ne répond pas',
    setUp: () {
      store.emitAll([localQueued('c-local')]);
      when(() => api.list())
          .thenAnswer((_) async => const Err(NetworkFailure()));
    },
    build: () => TodoCubit(store, api, followUps: followUps, pollInterval: Duration.zero),
    act: (cubit) => cubit.start(),
    verify: (cubit) {
      expect(cubit.state.items, hasLength(1));
      expect(cubit.state.offlineMessage, 'Connexion indisponible.');
    },
  );

  /// Le praticien appuie sur « Envoi impossible, appuyez pour réessayer » :
  /// la dictée doit réellement repartir en file. Sans cette transition, le
  /// moteur de synchronisation ne la reprend jamais — il ne lit que `queued`
  /// et `uploading` — et le geste est inerte.
  test('remet en file une dictée abandonnée, compteur remis à zéro', () async {
    when(() => api.list()).thenAnswer((_) async => const Success(<TodoItem>[]));
    final cubit = TodoCubit(store, api, followUps: followUps, pollInterval: Duration.zero);

    await cubit.retryUpload('c-1');

    expect(store.transitions, [
      (
        id: 'c-1',
        to: LocalCaptureStatus.queued,
        attemptCount: 0,
        errorCode: null,
      ),
    ]);
    await cubit.close();
  });

  test("n'émet plus après la fermeture du cubit", () async {
    store.emitAll([localQueued('c-local')]);
    when(() => api.list()).thenAnswer((_) async => const Success(<TodoItem>[]));

    final cubit = TodoCubit(store, api, followUps: followUps, pollInterval: Duration.zero);
    final states = <TodoState>[];
    final subscription = cubit.stream.listen(states.add);

    cubit.start();
    await Future<void>.delayed(Duration.zero);
    await cubit.close();
    final avantFermeture = states.length;

    // Une émission tardive de la file locale, après fermeture, ne doit rien
    // faire planter ni produire d'état supplémentaire.
    expect(
      () => store.emitAll([localQueued('c-local'), localQueued('c-local-2')]),
      returnsNormally,
    );
    await Future<void>.delayed(Duration.zero);

    expect(states.length, avantFermeture);
    await subscription.cancel();
  });

  /// Le cas ci-dessus ne prouve rien à lui seul : un tour complet de boucle
  /// d'événements avant `close()` laisse toujours le `refresh()` initial déjà
  /// terminé. Ici, la requête reste délibérément en vol — pilotée par un
  /// `Completer` — jusqu'à ce que `close()` ait déjà commencé (posé son
  /// drapeau, annulé le minuteur, et soit en train d'attendre l'annulation de
  /// l'abonnement). C'est exactement la fenêtre que `isClosed` seul ne
  /// couvre pas, puisqu'il ne devient vrai qu'à l'exécution de
  /// `super.close()`, en tout dernier.
  test("n'émet plus si la requête en vol répond pendant que close() attend "
      "l'annulation de l'abonnement", () async {
    store.emitAll([localQueued('c-local')]);
    final completer = Completer<Result<List<TodoItem>>>();
    when(() => api.list()).thenAnswer((_) => completer.future);

    final cubit = TodoCubit(store, api, followUps: followUps, pollInterval: Duration.zero);
    final states = <TodoState>[];
    final subscription = cubit.stream.listen(states.add);

    cubit.start();
    // La file locale a eu le temps de se publier ; le `refresh()` a
    // démarré sa requête, mais elle n'a pas encore répondu — elle reste en
    // vol.
    await Future<void>.delayed(Duration.zero);
    final apresFileLocale = List<TodoState>.of(states);

    // `close()` démarre : elle pose son drapeau, annule le minuteur, puis
    // suspend sur `await _subscription?.cancel()`. C'est cette attente que
    // la réponse va traverser, avant que `super.close()` — et donc
    // `isClosed` — n'ait eu lieu.
    final closeFuture = cubit.close();
    // Un contenu différent de ce qui est déjà publié : si l'émission
    // tardive passe la garde, `Cubit.emit` ne peut pas la confondre avec
    // un doublon et l'avaler silencieusement — elle doit apparaître comme
    // un état de plus, ou faire planter `emit` si le cubit est déjà
    // réellement fermé à ce moment-là. Les deux font rougir ce test.
    completer.complete(
      Success([serverItem(TodoKind.reportToValidate, 'c-srv')]),
    );
    await closeFuture;

    // Laisse la continuation de `refresh()`, si elle a échappé au drapeau,
    // le temps de s'exécuter et d'émettre.
    await Future<void>.delayed(Duration.zero);

    expect(states, apresFileLocale);
    await subscription.cancel();
  });
}
