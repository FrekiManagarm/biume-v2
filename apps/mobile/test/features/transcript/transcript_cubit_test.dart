import 'package:biume_mobile/core/failure.dart';
import 'package:biume_mobile/core/result.dart';
import 'package:biume_mobile/features/transcript/domain/transcript.dart';
import 'package:biume_mobile/features/transcript/domain/transcript_repository.dart';
import 'package:biume_mobile/features/transcript/presentation/transcript_cubit.dart';
import 'package:bloc_test/bloc_test.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';

class MockTranscriptRepository extends Mock implements TranscriptRepository {}

const captureId = '6f1a6d5e-3f2b-4c1d-9a7e-2b8c4d5e6f70';

const prete = Transcript(
  captureId: captureId,
  status: TranscriptStatus.ready,
  text: 'Tension lombaire à droite.',
);

void main() {
  late MockTranscriptRepository repository;

  setUp(() => repository = MockTranscriptRepository());

  blocTest<TranscriptCubit, TranscriptState>(
    'affiche la transcription prête',
    setUp: () {
      when(() => repository.load(any()))
          .thenAnswer((_) async => const Success(prete));
    },
    build: () => TranscriptCubit(repository),
    act: (cubit) => cubit.load(captureId),
    expect: () => [
      const TranscriptLoading(),
      const TranscriptReady(prete),
    ],
  );

  blocTest<TranscriptCubit, TranscriptState>(
    'attend pendant que la transcription est en cours',
    setUp: () {
      when(() => repository.load(any())).thenAnswer(
        (_) async => const Success(
          Transcript(
            captureId: captureId,
            status: TranscriptStatus.running,
            text: '',
          ),
        ),
      );
    },
    build: () => TranscriptCubit(repository),
    act: (cubit) => cubit.load(captureId),
    expect: () => [const TranscriptLoading(), const TranscriptPending()],
  );

  /// Une dictée inaudible dit ce qui s'est passé et propose de réenregistrer.
  /// Elle ne montre jamais un texte vide sans explication.
  blocTest<TranscriptCubit, TranscriptState>(
    'explique une dictée inaudible',
    setUp: () {
      when(() => repository.load(any())).thenAnswer(
        (_) async => const Success(
          Transcript(
            captureId: captureId,
            status: TranscriptStatus.inaudible,
            text: '',
          ),
        ),
      );
    },
    build: () => TranscriptCubit(repository),
    act: (cubit) => cubit.load(captureId),
    expect: () => [const TranscriptLoading(), const TranscriptInaudible()],
  );

  blocTest<TranscriptCubit, TranscriptState>(
    "enregistre la correction et passe à l'état corrigé",
    setUp: () {
      when(() => repository.correct(any(), any())).thenAnswer(
        (_) async => const Success(
          Transcript(
            captureId: captureId,
            status: TranscriptStatus.corrected,
            text: 'Tension lombaire droite.',
          ),
        ),
      );
    },
    build: () => TranscriptCubit(repository),
    seed: () => const TranscriptReady(prete),
    act: (cubit) => cubit.correct('Tension lombaire droite.'),
    expect: () => [
      const TranscriptSaving(prete),
      const TranscriptReady(
        Transcript(
          captureId: captureId,
          status: TranscriptStatus.corrected,
          text: 'Tension lombaire droite.',
        ),
      ),
    ],
  );

  /// Perdre la saisie du praticien parce que le réseau a lâché serait
  /// inacceptable : c'est du texte qu'il vient de taper à une main.
  blocTest<TranscriptCubit, TranscriptState>(
    "garde la saisie locale quand l'enregistrement échoue",
    setUp: () {
      when(() => repository.correct(any(), any()))
          .thenAnswer((_) async => const Err(NetworkFailure()));
    },
    build: () => TranscriptCubit(repository),
    seed: () => const TranscriptReady(prete),
    act: (cubit) => cubit.correct('Texte corrigé du praticien.'),
    expect: () => [
      const TranscriptSaving(prete),
      const TranscriptReady(
        prete,
        draft: 'Texte corrigé du praticien.',
        message: 'Connexion indisponible.',
      ),
    ],
  );

  blocTest<TranscriptCubit, TranscriptState>(
    "n'enregistre pas une correction sur une transcription non prête",
    build: () => TranscriptCubit(repository),
    seed: () => const TranscriptPending(),
    act: (cubit) => cubit.correct('rien'),
    expect: () => <TranscriptState>[],
    verify: (_) => verifyNever(() => repository.correct(any(), any())),
  );
}
