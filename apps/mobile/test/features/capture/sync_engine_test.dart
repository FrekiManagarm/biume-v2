import 'package:biume_mobile/core/database/app_database.dart';
import 'package:biume_mobile/core/failure.dart';
import 'package:biume_mobile/core/result.dart';
import 'package:biume_mobile/features/capture/domain/audio_recorder.dart';
import 'package:biume_mobile/features/capture/domain/capture_store.dart';
import 'package:biume_mobile/features/capture/domain/sync_decision.dart';
import 'package:biume_mobile/features/capture/domain/sync_engine.dart';
import 'package:biume_mobile/features/capture/domain/upload_client.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';

class MockStore extends Mock implements CaptureStore {}

class MockApi extends Mock implements CaptureApi {}

class MockFiles extends Mock implements CaptureFiles {}

final maintenant = DateTime.utc(2026, 8, 24, 10);

final session = UploadSession(
  url: 'https://bucket.example/signed?X-Amz-Signature=zzz',
  headers: const {'content-type': 'audio/mp4'},
  expiresAt: maintenant.add(const Duration(minutes: 10)),
);

SyncCandidate candidat({
  LocalCaptureStatus status = LocalCaptureStatus.queued,
  int attemptCount = 0,
  DateTime? expiresAt,
}) => SyncCandidate(
  id: 'capture-1',
  status: status,
  attemptCount: attemptCount,
  nextAttemptAt: null,
  expiresAt: expiresAt ?? maintenant.add(const Duration(hours: 12)),
);

void main() {
  late MockStore store;
  late MockApi api;
  late MockFiles files;
  late List<String> journal;

  SyncEngine build({bool online = true}) => SyncEngine(
    store: store,
    api: api,
    files: files,
    isOnline: () async => online,
    now: () => maintenant,
    random: () => 1.0,
    log: journal.add,
  );

  setUp(() {
    store = MockStore();
    api = MockApi();
    files = MockFiles();
    journal = [];

    registerFallbackValue(LocalCaptureStatus.queued);
    registerFallbackValue(session);

    when(() => store.pending()).thenAnswer((_) async => [candidat()]);
    when(
      () => store.transition(
        any(),
        any(),
        attemptCount: any(named: 'attemptCount'),
        errorCode: any(named: 'errorCode'),
        nextAttemptAt: any(named: 'nextAttemptAt'),
      ),
    ).thenAnswer((_) async => true);
    when(() => store.filePathOf(any()))
        .thenAnswer((_) async => '/tmp/capture.m4a.enc');
    when(() => store.byId(any())).thenAnswer(
      (_) async => LocalCapture(
        id: 'capture-1',
        appointmentId: null,
        status: LocalCaptureStatus.queued,
        durationMs: 120000,
        byteSize: 1048576,
        sha256: 'a' * 64,
        filePath: '/tmp/capture.m4a.enc',
        attemptCount: 0,
        lastErrorCode: null,
        nextAttemptAt: null,
        createdAt: maintenant,
        expiresAt: maintenant.add(const Duration(hours: 24)),
      ),
    );
    when(() => files.readDecrypted(any(), any()))
        .thenAnswer((_) async => [1, 2, 3]);
    when(() => files.delete(any())).thenAnswer((_) async {});
    when(
      () => api.declare(
        id: any(named: 'id'),
        appointmentId: any(named: 'appointmentId'),
        durationMs: any(named: 'durationMs'),
        byteSize: any(named: 'byteSize'),
        sha256: any(named: 'sha256'),
        createdAt: any(named: 'createdAt'),
      ),
    ).thenAnswer((_) async => const Success(null));
    when(() => api.requestUpload(any()))
        .thenAnswer((_) async => Success(session));
    when(() => api.putBytes(any(), any()))
        .thenAnswer((_) async => const Success('"etag-1"'));
    when(() => api.complete(any(), any()))
        .thenAnswer((_) async => const Success(null));
  });

  test('téléverse et confirme une dictée en file', () async {
    final resultat = await build().runOnce();

    expect(resultat.uploaded, 1);
    verify(() => api.putBytes(any(), any())).called(1);
    verify(() => api.complete('capture-1', '"etag-1"')).called(1);
  });

  /// Le chiffrement est local. Envoyer les octets chiffrés rendrait l'audio
  /// illisible côté serveur et casserait tout le parcours produit.
  test("déchiffre avant d'envoyer", () async {
    await build().runOnce();

    verify(() => files.readDecrypted('/tmp/capture.m4a.enc', 'capture-1'))
        .called(1);
  });

  test('ne fait rien hors ligne, sans consommer de tentative', () async {
    final resultat = await build(online: false).runOnce();

    expect(resultat.uploaded, 0);
    verifyNever(() => api.requestUpload(any()));
    verifyNever(
      () => store.transition(
        any(),
        LocalCaptureStatus.needsAction,
        attemptCount: any(named: 'attemptCount'),
        errorCode: any(named: 'errorCode'),
        nextAttemptAt: any(named: 'nextAttemptAt'),
      ),
    );
  });

  test('réessaie après un échec transitoire, avec temporisation', () async {
    when(() => api.requestUpload(any()))
        .thenAnswer((_) async => const Err(NetworkFailure()));

    await build().runOnce();

    final capture = verify(
      () => store.transition(
        'capture-1',
        captureAny(),
        attemptCount: captureAny(named: 'attemptCount'),
        errorCode: any(named: 'errorCode'),
        nextAttemptAt: captureAny(named: 'nextAttemptAt'),
      ),
    ).captured;

    // La première transition est `uploading` ; c'est la dernière qui dit la
    // suite donnée à l'échec.
    final derniere = capture.sublist(capture.length - 3);
    expect(derniere[0], LocalCaptureStatus.queued);
    expect(derniere[1], 1);
    expect(derniere[2], isNotNull);
  });

  /// Ces échecs ne seront jamais résolus par une nouvelle tentative : ils
  /// arrêtent la boucle immédiatement et ne consomment aucune tentative.
  test("s'arrête net sur un refus d'authentification", () async {
    when(() => api.requestUpload(any()))
        .thenAnswer((_) async => const Err(AuthFailure()));

    await build().runOnce();

    final capture = verify(
      () => store.transition(
        'capture-1',
        captureAny(),
        attemptCount: captureAny(named: 'attemptCount'),
        errorCode: any(named: 'errorCode'),
        nextAttemptAt: any(named: 'nextAttemptAt'),
      ),
    ).captured;

    final derniere = capture.sublist(capture.length - 2);
    expect(derniere[0], LocalCaptureStatus.needsAction);
    expect(derniere[1], 0);
  });

  test('passe en needs_action après cinq échecs', () async {
    when(() => store.pending())
        .thenAnswer((_) async => [candidat(attemptCount: 4)]);
    when(() => api.requestUpload(any()))
        .thenAnswer((_) async => const Err(ServerFailure()));

    await build().runOnce();

    final capture = verify(
      () => store.transition(
        'capture-1',
        captureAny(),
        attemptCount: captureAny(named: 'attemptCount'),
        errorCode: any(named: 'errorCode'),
        nextAttemptAt: any(named: 'nextAttemptAt'),
      ),
    ).captured;

    final derniere = capture.sublist(capture.length - 2);
    expect(derniere[0], LocalCaptureStatus.needsAction);
    expect(derniere[1], 5);
  });

  /// La rétention prime sur tout : une dictée expirée ne part plus, et ses
  /// octets quittent l'appareil.
  test('purge une dictée expirée plutôt que de la téléverser', () async {
    when(() => store.pending()).thenAnswer(
      (_) async => [
        candidat(expiresAt: maintenant.subtract(const Duration(minutes: 1))),
      ],
    );

    final resultat = await build().runOnce();

    expect(resultat.purged, 1);
    verifyNever(() => api.requestUpload(any()));
    verify(() => files.delete('/tmp/capture.m4a.enc')).called(1);
  });

  /// Une URL signée dans un journal survivrait à la purge des vingt-quatre
  /// heures et donnerait accès à l'audio.
  test("ne journalise jamais l'url signée", () async {
    when(() => api.putBytes(any(), any()))
        .thenAnswer((_) async => const Err(ServerFailure()));

    await build().runOnce();

    final tout = journal.join(' ');
    expect(tout, isNot(contains('http')));
    expect(tout, isNot(contains('Signature')));
  });

  test('est idempotent : redéclarer ne duplique pas', () async {
    when(() => store.pending())
        .thenAnswer((_) async => [candidat(attemptCount: 2)]);

    await build().runOnce();

    // La déclaration porte l'identifiant produit par l'appareil : le serveur
    // reconnaît une dictée déjà connue au lieu d'en créer une seconde.
    verify(
      () => api.declare(
        id: 'capture-1',
        appointmentId: any(named: 'appointmentId'),
        durationMs: any(named: 'durationMs'),
        byteSize: any(named: 'byteSize'),
        sha256: any(named: 'sha256'),
        createdAt: any(named: 'createdAt'),
      ),
    ).called(1);
  });
}
