import 'package:biume_mobile/core/failure.dart';
import 'package:biume_mobile/core/result.dart';
import 'package:biume_mobile/core/telemetry/journey_events.dart';
import 'package:biume_mobile/core/telemetry/telemetry.dart';
import 'package:biume_mobile/features/followup/domain/follow_up_questionnaire.dart';
import 'package:biume_mobile/features/followup/domain/follow_up_repository.dart';
import 'package:biume_mobile/features/followup/presentation/follow_up_schedule_cubit.dart';
import 'package:bloc_test/bloc_test.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';

class MockFollowUpRepository extends Mock implements FollowUpRepository {}

void main() {
  late MockFollowUpRepository repository;

  setUp(() {
    repository = MockFollowUpRepository();
    registerFallbackValue(DateTime(2026));
  });

  /// Le questionnaire mobile n'est jamais qu'une copie du contrat serveur :
  /// s'il divergeait sur ces identifiants, le serveur ne pourrait plus
  /// décoder les réponses du propriétaire.
  test('les identifiants du questionnaire sont ceux du contrat serveur', () {
    final questions = defaultFollowUpQuestionnaire['questions'] as List;
    final ids = questions
        .cast<Map<String, dynamic>>()
        .map((question) => question['id'] as String)
        .toList();

    expect(ids, ['evolution', 'reaction', 'wantsContact']);
  });

  blocTest<FollowUpScheduleCubit, FollowUpScheduleState>(
    'propose J+7 par défaut',
    build: () => FollowUpScheduleCubit(
      repository,
      reportId: 'report-1',
      now: () => DateTime(2026, 9, 3, 10),
    ),
    verify: (cubit) => expect(cubit.state.dueAt, DateTime(2026, 9, 10, 10)),
  );

  blocTest<FollowUpScheduleCubit, FollowUpScheduleState>(
    'refuse une échéance sous le plancher de trois jours',
    build: () => FollowUpScheduleCubit(
      repository,
      reportId: 'report-1',
      now: () => DateTime(2026, 9, 3, 10),
    ),
    act: (cubit) => cubit.chooseDate(DateTime(2026, 9, 4)),
    verify: (cubit) => expect(cubit.state.dueAt, DateTime(2026, 9, 10, 10)),
  );

  blocTest<FollowUpScheduleCubit, FollowUpScheduleState>(
    'accepte une échéance dans les bornes',
    build: () => FollowUpScheduleCubit(
      repository,
      reportId: 'report-1',
      now: () => DateTime(2026, 9, 3, 10),
    ),
    act: (cubit) => cubit.chooseDate(DateTime(2026, 9, 20)),
    verify: (cubit) => expect(cubit.state.dueAt, DateTime(2026, 9, 20)),
  );

  blocTest<FollowUpScheduleCubit, FollowUpScheduleState>(
    'refuse une échéance au-delà du plafond de quatre-vingt-dix jours',
    build: () => FollowUpScheduleCubit(
      repository,
      reportId: 'report-1',
      now: () => DateTime(2026, 9, 3, 10),
    ),
    act: (cubit) => cubit.chooseDate(DateTime(2027, 1, 1)),
    verify: (cubit) => expect(cubit.state.dueAt, DateTime(2026, 9, 10, 10)),
  );

  blocTest<FollowUpScheduleCubit, FollowUpScheduleState>(
    'programme le suivi et se déclare terminé',
    setUp: () =>
        when(() => repository.schedule('report-1', any()))
            .thenAnswer((_) async => const Success(null)),
    build: () => FollowUpScheduleCubit(
      repository,
      reportId: 'report-1',
      now: () => DateTime(2026, 9, 3, 10),
    ),
    act: (cubit) => cubit.schedule(),
    verify: (cubit) => expect(cubit.state.done, isTrue),
  );

  blocTest<FollowUpScheduleCubit, FollowUpScheduleState>(
    "affiche un message et reste ouvert si le serveur refuse",
    setUp: () => when(() => repository.schedule('report-1', any())).thenAnswer(
      (_) async =>
          const Err(ValidationFailure(message: 'Rapport en brouillon.')),
    ),
    build: () => FollowUpScheduleCubit(
      repository,
      reportId: 'report-1',
      now: () => DateTime(2026, 9, 3, 10),
    ),
    act: (cubit) => cubit.schedule(),
    verify: (cubit) {
      expect(cubit.state.done, isFalse);
      expect(cubit.state.message, 'Rapport en brouillon.');
    },
  );

  blocTest<FollowUpScheduleCubit, FollowUpScheduleState>(
    'refuser est un geste explicite qui termine sans appel réseau',
    build: () => FollowUpScheduleCubit(
      repository,
      reportId: 'report-1',
      now: () => DateTime(2026, 9, 3, 10),
    ),
    act: (cubit) => cubit.decline(),
    verify: (cubit) {
      expect(cubit.state.done, isTrue);
      verifyNever(() => repository.schedule(any(), any()));
    },
  );

  /// Correction faite partout ailleurs pour la même raison : un praticien qui
  /// quitte l'écran pendant une requête ne doit jamais faire planter le
  /// cubit — fermer le cubit avant que la réponse ne revienne ne doit lever
  /// aucune erreur.
  test("n'émet rien après fermeture du cubit", () async {
    when(() => repository.schedule('report-1', any()))
        .thenAnswer((_) async => const Success(null));
    final cubit = FollowUpScheduleCubit(
      repository,
      reportId: 'report-1',
      now: () => DateTime(2026, 9, 3, 10),
    );

    final pending = cubit.schedule();
    await cubit.close();

    await expectLater(pending, completes);
  });

  /// Dernier moment du parcours : programmer le suivi, sous l'identifiant de
  /// capture reçu par la route quand il existe.
  blocTest<FollowUpScheduleCubit, FollowUpScheduleState>(
    'trace la programmation du suivi sous l\'identifiant de capture',
    setUp: () =>
        when(() => repository.schedule('report-1', any()))
            .thenAnswer((_) async => const Success(null)),
    build: () {
      final evenements = <ProductEvent>[];
      addTearDown(() {
        expect(evenements, hasLength(1));
        expect(evenements.single.name, JourneyEvents.followUpScheduled);
        expect(evenements.single.journeyId, 'c-1');
        expect(evenements.single.properties, {'reportId': 'report-1'});
      });
      return FollowUpScheduleCubit(
        repository,
        reportId: 'report-1',
        journeyId: 'c-1',
        now: () => DateTime(2026, 9, 3, 10),
        telemetry: Telemetry(sink: evenements.add),
      );
    },
    act: (cubit) => cubit.schedule(),
  );

  /// Sans identifiant de capture — rapport créé sur le web — le parcours
  /// retombe sur l'identifiant de rapport.
  blocTest<FollowUpScheduleCubit, FollowUpScheduleState>(
    'retombe sur l\'identifiant de rapport sans identifiant de capture',
    setUp: () =>
        when(() => repository.schedule('report-1', any()))
            .thenAnswer((_) async => const Success(null)),
    build: () {
      final evenements = <ProductEvent>[];
      addTearDown(() => expect(evenements.single.journeyId, 'report-1'));
      return FollowUpScheduleCubit(
        repository,
        reportId: 'report-1',
        now: () => DateTime(2026, 9, 3, 10),
        telemetry: Telemetry(sink: evenements.add),
      );
    },
    act: (cubit) => cubit.schedule(),
  );

  /// Le refus est un événement à part entière : un praticien qui refuse
  /// explicitement n'est pas un praticien qui abandonne.
  blocTest<FollowUpScheduleCubit, FollowUpScheduleState>(
    'trace le refus du suivi comme un événement distinct',
    build: () {
      final evenements = <ProductEvent>[];
      addTearDown(() {
        expect(evenements, hasLength(1));
        expect(evenements.single.name, JourneyEvents.followUpDeclined);
        expect(evenements.single.journeyId, 'c-1');
        expect(evenements.single.properties, {'reportId': 'report-1'});
      });
      return FollowUpScheduleCubit(
        repository,
        reportId: 'report-1',
        journeyId: 'c-1',
        now: () => DateTime(2026, 9, 3, 10),
        telemetry: Telemetry(sink: evenements.add),
      );
    },
    act: (cubit) => cubit.decline(),
    verify: (_) => verifyNever(() => repository.schedule(any(), any())),
  );
}
