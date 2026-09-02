import 'package:biume_mobile/features/capture/domain/audio_recorder.dart';
import 'package:biume_mobile/features/capture/presentation/recording_bloc.dart';
import 'package:bloc_test/bloc_test.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';

class MockAudioRecorder extends Mock implements AudioRecorder {}

class MockCaptureFiles extends Mock implements CaptureFiles {}

void main() {
  late MockAudioRecorder recorder;
  late MockCaptureFiles files;

  final debut = DateTime.utc(2026, 8, 24, 10);

  setUp(() {
    recorder = MockAudioRecorder();
    files = MockCaptureFiles();

    when(() => recorder.hasPermission()).thenAnswer((_) async => true);
    when(() => recorder.start(any())).thenAnswer((_) async {});
    when(() => recorder.stop()).thenAnswer((_) async => '/tmp/capture.m4a');
    when(() => recorder.cancel()).thenAnswer((_) async {});
    when(() => recorder.dispose()).thenAnswer((_) async {});
    when(() => recorder.isRecording()).thenAnswer((_) async => true);
    when(() => files.pathFor(any())).thenAnswer((_) async => '/tmp/capture.m4a');
    when(() => files.sizeOf(any())).thenAnswer((_) async => 1048576);
    when(() => files.sha256Of(any())).thenAnswer((_) async => 'a' * 64);
    when(() => files.encryptInPlace(any(), any()))
        .thenAnswer((_) async => '/tmp/capture.m4a.enc');
    when(() => files.delete(any())).thenAnswer((_) async {});
  });

  RecordingBloc build({
    Future<void> Function(RecordedCapture)? onSaved,
    DateTime? now,
  }) => RecordingBloc(
    recorder: recorder,
    files: files,
    onSaved: onSaved ?? (_) async {},
    now: () => now ?? debut,
    newId: () => 'capture-1',
  );

  blocTest<RecordingBloc, RecordingState>(
    'démarre un enregistrement quand le micro est autorisé',
    build: build,
    act: (bloc) => bloc.add(const RecordingStarted(appointmentId: null)),
    expect: () => [
      const RecordingPreparing(),
      isA<RecordingInProgress>(),
    ],
  );

  /// Un refus de micro n'est pas une panne : l'écran doit le dire et proposer
  /// d'ouvrir les réglages, pas afficher une erreur technique.
  blocTest<RecordingBloc, RecordingState>(
    'refuse de démarrer sans permission, en le disant',
    setUp: () {
      when(() => recorder.hasPermission()).thenAnswer((_) async => false);
    },
    build: build,
    act: (bloc) => bloc.add(const RecordingStarted(appointmentId: null)),
    expect: () => [
      const RecordingPreparing(),
      const RecordingPermissionDenied(),
    ],
    verify: (_) => verifyNever(() => recorder.start(any())),
  );

  blocTest<RecordingBloc, RecordingState>(
    "passe en relecture à l'arrêt, sans mettre en file",
    build: build,
    act: (bloc) async {
      bloc.add(const RecordingStarted(appointmentId: null));
      await Future<void>.delayed(Duration.zero);
      bloc.add(const RecordingStopped());
    },
    skip: 2,
    expect: () => [isA<RecordingReview>()],
  );

  /// Valider une dictée est un acte délibéré. Rien ne doit mettre en file un
  /// audio que le praticien n'a jamais réécouté et accepté.
  blocTest<RecordingBloc, RecordingState>(
    "n'enregistre la dictée que sur validation explicite",
    build: () {
      var sauvegardes = 0;
      final bloc = build(onSaved: (_) async => sauvegardes++);
      return bloc;
    },
    act: (bloc) async {
      bloc.add(const RecordingStarted(appointmentId: null));
      await Future<void>.delayed(Duration.zero);
      bloc.add(const RecordingStopped());
      await Future<void>.delayed(Duration.zero);
    },
    verify: (_) {
      verifyNever(() => files.encryptInPlace(any(), any()));
    },
  );

  blocTest<RecordingBloc, RecordingState>(
    'chiffre puis met en file quand le praticien valide',
    build: build,
    act: (bloc) async {
      bloc.add(const RecordingStarted(appointmentId: null));
      await Future<void>.delayed(Duration.zero);
      bloc.add(const RecordingStopped());
      await Future<void>.delayed(Duration.zero);
      bloc.add(const RecordingAccepted());
      await Future<void>.delayed(Duration.zero);
    },
    verify: (_) {
      verify(() => files.encryptInPlace(any(), 'capture-1')).called(1);
    },
  );

  /// Une dictée abandonnée ne doit laisser aucun octet sur l'appareil : c'est
  /// de la donnée de santé sur un téléphone qui peut être perdu.
  blocTest<RecordingBloc, RecordingState>(
    "supprime le fichier quand le praticien jette la dictée",
    build: build,
    act: (bloc) async {
      bloc.add(const RecordingStarted(appointmentId: null));
      await Future<void>.delayed(Duration.zero);
      bloc.add(const RecordingStopped());
      await Future<void>.delayed(Duration.zero);
      bloc.add(const RecordingDiscarded());
      await Future<void>.delayed(Duration.zero);
    },
    verify: (_) {
      verify(() => files.delete(any())).called(1);
    },
  );

  /// L'appel entrant : le système suspend l'enregistrement. La dictée déjà
  /// captée doit rester récupérable, jamais disparaître.
  blocTest<RecordingBloc, RecordingState>(
    'conserve la dictée quand une interruption survient',
    build: build,
    act: (bloc) async {
      bloc.add(const RecordingStarted(appointmentId: null));
      await Future<void>.delayed(Duration.zero);
      bloc.add(const RecordingInterrupted());
      await Future<void>.delayed(Duration.zero);
    },
    skip: 2,
    expect: () => [isA<RecordingReview>()],
    verify: (_) {
      verifyNever(() => files.delete(any()));
    },
  );

  blocTest<RecordingBloc, RecordingState>(
    'arrête tout seul à la durée maximale',
    build: () => build(),
    act: (bloc) async {
      bloc.add(const RecordingStarted(appointmentId: null));
      await Future<void>.delayed(Duration.zero);
      bloc.add(const RecordingTicked(Duration(minutes: 10)));
      await Future<void>.delayed(Duration.zero);
    },
    skip: 2,
    expect: () => [isA<RecordingReview>()],
  );

  blocTest<RecordingBloc, RecordingState>(
    "ne s'arrête pas avant la durée maximale",
    build: () => build(),
    act: (bloc) async {
      bloc.add(const RecordingStarted(appointmentId: null));
      await Future<void>.delayed(Duration.zero);
      bloc.add(const RecordingTicked(Duration(minutes: 9, seconds: 59)));
      await Future<void>.delayed(Duration.zero);
    },
    skip: 2,
    expect: () => [isA<RecordingInProgress>()],
  );
}
