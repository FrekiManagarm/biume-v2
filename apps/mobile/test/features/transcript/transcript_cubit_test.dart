import 'dart:async';

import 'package:biume_mobile/core/failure.dart';
import 'package:biume_mobile/core/result.dart';
import 'package:biume_mobile/core/telemetry/journey_events.dart';
import 'package:biume_mobile/core/telemetry/telemetry.dart';
import 'package:biume_mobile/features/capture/domain/capture_store.dart';
import 'package:biume_mobile/features/transcript/domain/transcript.dart';
import 'package:biume_mobile/features/transcript/domain/transcript_repository.dart';
import 'package:biume_mobile/features/transcript/presentation/transcript_cubit.dart';
import 'package:bloc_test/bloc_test.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';

class MockTranscriptRepository extends Mock implements TranscriptRepository {}

class MockCaptureStore extends Mock implements CaptureStore {}

const captureId = 'capture-1';

const prete = Transcript(
  captureId: captureId,
  status: TranscriptStatus.ready,
  text: 'Filou présente une tension lombaire.',
);

const corrigee = Transcript(
  captureId: captureId,
  status: TranscriptStatus.corrected,
  text: 'Texte corrigé',
);

const enCours = Transcript(
  captureId: captureId,
  status: TranscriptStatus.running,
  text: '',
);

void main() {
  late MockTranscriptRepository repository;
  late MockCaptureStore store;

  setUp(() {
    repository = MockTranscriptRepository();
    store = MockCaptureStore();
    registerFallbackValue(DateTime(2026));
    when(() => store.markExtractionRequested(any(), any()))
        .thenAnswer((_) async {});
  });

  blocTest<TranscriptCubit, TranscriptState>(
    'affiche la transcription prête',
    setUp: () {
      when(() => repository.load(any()))
          .thenAnswer((_) async => const Success(prete));
    },
    build: () => TranscriptCubit(repository, store),
    act: (cubit) => cubit.load(captureId),
    expect: () => [const TranscriptLoading(), const TranscriptReady(prete)],
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
    build: () => TranscriptCubit(repository, store),
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
    build: () => TranscriptCubit(repository, store),
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
    build: () => TranscriptCubit(repository, store),
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
    build: () => TranscriptCubit(repository, store),
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
    build: () => TranscriptCubit(repository, store),
    seed: () => const TranscriptPending(),
    act: (cubit) => cubit.correct('rien'),
    expect: () => <TranscriptState>[],
    verify: (_) => verifyNever(() => repository.correct(any(), any())),
  );

  blocTest<TranscriptCubit, TranscriptState>(
    'valide sans correction : pas d\'appel à correct, extraction lancée',
    setUp: () {
      when(() => repository.load(any()))
          .thenAnswer((_) async => Success(prete));
      when(() => repository.extract('capture-1'))
          .thenAnswer((_) async => const Success('report-1'));
    },
    build: () => TranscriptCubit(repository, store),
    act: (cubit) async {
      await cubit.load('capture-1');
      await cubit.validate(text: prete.text, patientId: null);
    },
    verify: (cubit) {
      verifyNever(() => repository.correct(any(), any()));
      verify(() => store.markExtractionRequested('capture-1', any())).called(1);
      expect(cubit.state, const TranscriptValidated('report-1'));
    },
  );

  blocTest<TranscriptCubit, TranscriptState>(
    'corrige puis rattache puis extrait, dans cet ordre',
    setUp: () {
      when(() => repository.load(any()))
          .thenAnswer((_) async => Success(prete));
      when(() => repository.correct('capture-1', 'Texte corrigé'))
          .thenAnswer((_) async => Success(corrigee));
      when(() => repository.attach('capture-1', 'pet-1'))
          .thenAnswer((_) async => const Success(null));
      when(() => repository.extract('capture-1'))
          .thenAnswer((_) async => const Success('report-1'));
    },
    build: () => TranscriptCubit(repository, store),
    act: (cubit) async {
      await cubit.load('capture-1');
      await cubit.validate(text: 'Texte corrigé', patientId: 'pet-1');
    },
    verify: (_) {
      verifyInOrder([
        () => repository.correct('capture-1', 'Texte corrigé'),
        () => repository.attach('capture-1', 'pet-1'),
        () => repository.extract('capture-1'),
      ]);
    },
  );

  blocTest<TranscriptCubit, TranscriptState>(
    'garde la saisie quand l\'extraction échoue',
    setUp: () {
      when(() => repository.load(any()))
          .thenAnswer((_) async => Success(prete));
      when(() => repository.extract(any()))
          .thenAnswer((_) async => const Err(NetworkFailure()));
    },
    build: () => TranscriptCubit(repository, store),
    act: (cubit) async {
      await cubit.load('capture-1');
      await cubit.validate(text: prete.text, patientId: null);
    },
    expect: () => [
      const TranscriptLoading(),
      TranscriptReady(prete),
      TranscriptValidating(prete),
      TranscriptReady(
        prete,
        draft: prete.text,
        message: 'Connexion indisponible.',
      ),
    ],
  );

  blocTest<TranscriptCubit, TranscriptState>(
    'refuse de valider une transcription non prête',
    setUp: () {
      when(() => repository.load(any()))
          .thenAnswer((_) async => Success(enCours));
    },
    build: () => TranscriptCubit(repository, store),
    act: (cubit) async {
      await cubit.load('capture-1');
      await cubit.validate(text: '', patientId: null);
    },
    verify: (_) => verifyNever(() => repository.extract(any())),
  );

  /// L'écran de validation invite lui aussi le praticien à partir. S'il le
  /// fait pendant que `validate` interroge le serveur, `BlocProvider` ferme
  /// le cubit avant que la réponse ne revienne : émettre dessus lèverait un
  /// `StateError` non rattrapé.
  test(
    'validate ne plante pas si le cubit est fermé pendant la requête',
    () async {
      when(() => repository.load(any()))
          .thenAnswer((_) async => Success(prete));
      final completer = Completer<Result<String>>();
      when(() => repository.extract('capture-1'))
          .thenAnswer((_) => completer.future);

      final cubit = TranscriptCubit(repository, store);
      await cubit.load('capture-1');
      final validateFuture = cubit.validate(text: prete.text, patientId: null);

      await cubit.close();
      completer.complete(const Success('report-1'));

      await expectLater(validateFuture, completes);
    },
  );

  /// Les deux moments du parcours portés par ce cubit : la validation de la
  /// transcription puis la demande d'extraction, sous l'identifiant de
  /// capture qui les relie l'un à l'autre et au reste du parcours.
  test(
    "trace la validation puis l'extraction sous l'identifiant de capture",
    () async {
      final evenements = <ProductEvent>[];
      when(() => repository.load(any()))
          .thenAnswer((_) async => Success(prete));
      when(() => repository.extract('capture-1'))
          .thenAnswer((_) async => const Success('report-1'));

      final cubit = TranscriptCubit(
        repository,
        store,
        telemetry: Telemetry(sink: evenements.add),
      );
      await cubit.load('capture-1');
      await cubit.validate(text: prete.text, patientId: null);

      expect(evenements, hasLength(2));
      expect(evenements[0].name, JourneyEvents.transcriptValidated);
      expect(evenements[0].journeyId, captureId);
      expect(evenements[0].properties, {'textChanged': false});
      expect(evenements[1].name, JourneyEvents.extractionRequested);
      expect(evenements[1].journeyId, captureId);
      expect(evenements[1].properties, {'reportId': 'report-1'});
    },
  );

  test(
    'signale un texte modifié quand la correction diffère de la source',
    () async {
      final evenements = <ProductEvent>[];
      when(() => repository.load(any()))
          .thenAnswer((_) async => Success(prete));
      when(() => repository.correct('capture-1', 'Texte corrigé'))
          .thenAnswer((_) async => const Success(corrigee));
      when(() => repository.extract('capture-1'))
          .thenAnswer((_) async => const Success('report-1'));

      final cubit = TranscriptCubit(
        repository,
        store,
        telemetry: Telemetry(sink: evenements.add),
      );
      await cubit.load('capture-1');
      await cubit.validate(text: 'Texte corrigé', patientId: null);

      expect(evenements.first.properties, {'textChanged': true});
    },
  );

  test("n'émet pas d'extraction demandée si l'extraction échoue", () async {
    final evenements = <ProductEvent>[];
    when(() => repository.load(any())).thenAnswer((_) async => Success(prete));
    when(() => repository.extract(any()))
        .thenAnswer((_) async => const Err(NetworkFailure()));

    final cubit = TranscriptCubit(
      repository,
      store,
      telemetry: Telemetry(sink: evenements.add),
    );
    await cubit.load('capture-1');
    await cubit.validate(text: prete.text, patientId: null);

    expect(evenements.map((e) => e.name), [JourneyEvents.transcriptValidated]);
  });
}
