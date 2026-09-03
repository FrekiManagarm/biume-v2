import 'dart:async';

import 'package:biume_mobile/core/database/app_database.dart';
import 'package:biume_mobile/core/failure.dart';
import 'package:biume_mobile/core/result.dart';
import 'package:biume_mobile/features/capture/domain/capture_store.dart';
import 'package:biume_mobile/features/capture/domain/sync_decision.dart';
import 'package:biume_mobile/features/todo/domain/todo_api.dart';
import 'package:biume_mobile/features/todo/domain/todo_item.dart';
import 'package:biume_mobile/features/todo/presentation/todo_cubit.dart';
import 'package:bloc_test/bloc_test.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';

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

  @override
  Future<bool> transition(
    String id,
    LocalCaptureStatus to, {
    int? attemptCount,
    String? errorCode,
    DateTime? nextAttemptAt,
  }) => throw UnimplementedError();

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

  setUp(() {
    store = FakeCaptureStore();
    api = MockTodoApi();
  });

  blocTest<TodoCubit, TodoState>(
    'place les dictées locales non envoyées avant les éléments du serveur',
    setUp: () {
      store.emitAll([localQueued('c-local')]);
      when(() => api.list()).thenAnswer(
        (_) async => Success([serverItem(TodoKind.reportToValidate, 'c-srv')]),
      );
    },
    build: () => TodoCubit(store, api, pollInterval: Duration.zero),
    act: (cubit) => cubit.start(),
    verify: (cubit) => expect(
      cubit.state.items.map((i) => i.captureId),
      ['c-local', 'c-srv'],
    ),
  );

  blocTest<TodoCubit, TodoState>(
    'affiche « Biume prépare le compte rendu » juste après la validation',
    setUp: () {
      store.emitAll([
        localUploaded('c-1', extractionRequestedAt: DateTime(2026, 9, 3, 10, 0)),
      ]);
      when(() => api.list()).thenAnswer(
        (_) async => Success([serverItem(TodoKind.transcriptToReview, 'c-1')]),
      );
    },
    build: () => TodoCubit(
      store,
      api,
      pollInterval: Duration.zero,
      now: () => DateTime(2026, 9, 3, 10, 1),
    ),
    act: (cubit) => cubit.start(),
    verify: (cubit) => expect(cubit.state.items.single.kind, TodoKind.preparing),
  );

  blocTest<TodoCubit, TodoState>(
    'la marque locale disparaît une fois la fenêtre passée',
    setUp: () {
      store.emitAll([
        localUploaded('c-1', extractionRequestedAt: DateTime(2026, 9, 3, 10, 0)),
      ]);
      when(() => api.list()).thenAnswer(
        (_) async => Success([serverItem(TodoKind.transcriptToReview, 'c-1')]),
      );
    },
    build: () => TodoCubit(
      store,
      api,
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
      when(() => api.list()).thenAnswer((_) async => const Err(NetworkFailure()));
    },
    build: () => TodoCubit(store, api, pollInterval: Duration.zero),
    act: (cubit) => cubit.start(),
    verify: (cubit) {
      expect(cubit.state.items, hasLength(1));
      expect(cubit.state.offlineMessage, 'Connexion indisponible.');
    },
  );

  test("n'émet plus après la fermeture du cubit", () async {
    store.emitAll([localQueued('c-local')]);
    when(() => api.list()).thenAnswer((_) async => const Success(<TodoItem>[]));

    final cubit = TodoCubit(store, api, pollInterval: Duration.zero);
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
}
