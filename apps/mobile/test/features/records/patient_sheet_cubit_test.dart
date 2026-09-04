import 'package:biume_mobile/core/failure.dart';
import 'package:biume_mobile/core/result.dart';
import 'package:biume_mobile/features/records/domain/owner_repository.dart';
import 'package:biume_mobile/features/records/domain/patient.dart';
import 'package:biume_mobile/features/records/domain/patient_history.dart';
import 'package:biume_mobile/features/records/domain/patient_repository.dart';
import 'package:biume_mobile/features/records/presentation/patient_sheet_cubit.dart';
import 'package:biume_mobile/features/report/domain/proposal.dart';
import 'package:bloc_test/bloc_test.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';

class MockPatientRepository extends Mock implements PatientRepository {}

class MockOwnerRepository extends Mock implements OwnerRepository {}

const filou = Patient(
  id: 'pet-1',
  ownerId: 'owner-1',
  ownerName: 'Camille Roux',
  name: 'Filou',
  species: 'DOG',
  breed: 'Berger',
);

const camille = Owner(
  id: 'owner-1',
  name: 'Camille Roux',
  email: 'camille@example.org',
  phone: '0600000000',
  city: 'Lyon',
);

PatientHistoryEntry entree({
  String appointmentId = 'appt-1',
  DateTime? beginAt,
  String? reportId = 'report-1',
  ReportStatus? reportStatus = ReportStatus.finalized,
  String consultationReason = 'Suivi lombaire',
}) => PatientHistoryEntry(
  appointmentId: appointmentId,
  beginAt: beginAt ?? DateTime(2026, 8, 20),
  reportId: reportId,
  reportStatus: reportStatus,
  consultationReason: consultationReason,
);

void main() {
  late MockPatientRepository patients;
  late MockOwnerRepository owners;

  setUp(() {
    patients = MockPatientRepository();
    owners = MockOwnerRepository();
    // Par défaut, rien n'a été préchargé : c'est le cas de chaque test qui
    // ne seed pas explicitement de cache. Sans ce défaut, tout appel non
    // préparé à `cachedHistory` lèverait une `MissingStubError`.
    when(() => patients.cachedHistory(any())).thenAnswer((_) async => const []);
    when(() => patients.cachedReportIds(any()))
        .thenAnswer((_) async => const <String>{});
  });

  blocTest<PatientSheetCubit, PatientSheetState>(
    "affiche la fiche depuis le cache puis l'historique du serveur",
    setUp: () {
      when(() => patients.byId('pet-1')).thenAnswer((_) async => filou);
      when(() => owners.byId('owner-1')).thenAnswer((_) async => camille);
      when(() => patients.history('pet-1')).thenAnswer(
        (_) async => Success([entree(reportStatus: ReportStatus.sent)]),
      );
    },
    build: () => PatientSheetCubit(patients, owners, now: () => DateTime(2026, 9, 3)),
    act: (cubit) => cubit.load('pet-1'),
    expect: () => [
      isA<PatientSheetLoaded>().having(
        (s) => s.sheet.history,
        'historique',
        isEmpty,
      ),
      isA<PatientSheetLoaded>().having(
        (s) => s.sheet.history,
        'historique',
        hasLength(1),
      ),
    ],
  );

  blocTest<PatientSheetCubit, PatientSheetState>(
    "calcule l'âge en années révolues",
    setUp: () {
      when(() => patients.byId('pet-1')).thenAnswer(
        (_) async => filou.copyWith(birthDate: DateTime(2020, 10, 1)),
      );
      when(() => owners.byId('owner-1')).thenAnswer((_) async => camille);
      when(() => patients.history('pet-1')).thenAnswer((_) async => const Success([]));
    },
    build: () => PatientSheetCubit(patients, owners, now: () => DateTime(2026, 9, 3)),
    act: (cubit) => cubit.load('pet-1'),
    verify: (cubit) =>
        expect((cubit.state as PatientSheetLoaded).sheet.ageYears, 5),
  );

  blocTest<PatientSheetCubit, PatientSheetState>(
    "se tait sur l'âge sans date de naissance connue",
    setUp: () {
      when(() => patients.byId('pet-1')).thenAnswer((_) async => filou);
      when(() => owners.byId('owner-1')).thenAnswer((_) async => camille);
      when(() => patients.history('pet-1')).thenAnswer((_) async => const Success([]));
    },
    build: () => PatientSheetCubit(patients, owners, now: () => DateTime(2026, 9, 3)),
    act: (cubit) => cubit.load('pet-1'),
    verify: (cubit) =>
        expect((cubit.state as PatientSheetLoaded).sheet.ageYears, isNull),
  );

  blocTest<PatientSheetCubit, PatientSheetState>(
    "l'anniversaire du jour même compte déjà comme atteint",
    setUp: () {
      when(() => patients.byId('pet-1')).thenAnswer(
        (_) async => filou.copyWith(birthDate: DateTime(2020, 9, 3)),
      );
      when(() => owners.byId('owner-1')).thenAnswer((_) async => camille);
      when(() => patients.history('pet-1')).thenAnswer((_) async => const Success([]));
    },
    build: () => PatientSheetCubit(patients, owners, now: () => DateTime(2026, 9, 3)),
    act: (cubit) => cubit.load('pet-1'),
    verify: (cubit) =>
        expect((cubit.state as PatientSheetLoaded).sheet.ageYears, 6),
  );

  blocTest<PatientSheetCubit, PatientSheetState>(
    "garde la fiche du cache et pose un message hors ligne quand l'historique échoue",
    setUp: () {
      when(() => patients.byId('pet-1')).thenAnswer((_) async => filou);
      when(() => owners.byId('owner-1')).thenAnswer((_) async => camille);
      when(() => patients.history('pet-1'))
          .thenAnswer((_) async => const Err(NetworkFailure()));
    },
    build: () => PatientSheetCubit(patients, owners, now: () => DateTime(2026, 9, 3)),
    act: (cubit) => cubit.load('pet-1'),
    expect: () => [
      isA<PatientSheetLoaded>().having(
        (s) => s.sheet.history,
        'historique',
        isEmpty,
      ),
      isA<PatientSheetLoaded>()
          .having((s) => s.sheet.patient.name, 'animal', 'Filou')
          .having(
            (s) => s.offlineMessage,
            'message hors ligne',
            'Connexion indisponible.',
          ),
    ],
  );

  /// Le parcours réel visé par la fonctionnalité : le praticien devant son
  /// écurie, sans réseau, doit encore pouvoir voir « ce qu'il a fait la
  /// dernière fois » — et ouvrir le compte rendu qui va avec. L'historique
  /// affiché doit venir de `cachedHistory`, préchargé par
  /// `refreshSheetsFor`, jamais rester vide sous prétexte que le réseau a
  /// manqué.
  blocTest<PatientSheetCubit, PatientSheetState>(
    "affiche l'historique préchargé et dit qu'il peut dater quand le réseau manque",
    setUp: () {
      when(() => patients.byId('pet-1')).thenAnswer((_) async => filou);
      when(() => owners.byId('owner-1')).thenAnswer((_) async => camille);
      when(() => patients.cachedHistory('pet-1')).thenAnswer(
        (_) async => [entree(reportStatus: ReportStatus.finalized)],
      );
      when(() => patients.history('pet-1'))
          .thenAnswer((_) async => const Err(NetworkFailure()));
    },
    build: () => PatientSheetCubit(patients, owners, now: () => DateTime(2026, 9, 3)),
    act: (cubit) => cubit.load('pet-1'),
    expect: () => [
      // Dès le premier affichage — avant même que le réseau ait répondu —
      // l'historique préchargé est déjà là.
      isA<PatientSheetLoaded>().having(
        (s) => s.sheet.history,
        'historique',
        hasLength(1),
      ),
      isA<PatientSheetLoaded>()
          .having((s) => s.sheet.history, 'historique', hasLength(1))
          .having(
            (s) => s.sheet.history.single.reportId,
            'compte rendu de la séance',
            'report-1',
          )
          .having(
            (s) => s.offlineMessage,
            'message hors ligne',
            isNotNull,
          ),
    ],
  );

  blocTest<PatientSheetCubit, PatientSheetState>(
    "dit la fiche introuvable quand l'animal n'a jamais été mis en cache",
    setUp: () {
      when(() => patients.byId('pet-1')).thenAnswer((_) async => null);
    },
    build: () => PatientSheetCubit(patients, owners, now: () => DateTime(2026, 9, 3)),
    act: (cubit) => cubit.load('pet-1'),
    expect: () => [isA<PatientSheetUnavailable>()],
    verify: (_) {
      verifyNever(() => owners.byId(any()));
      verifyNever(() => patients.history(any()));
    },
  );

  blocTest<PatientSheetCubit, PatientSheetState>(
    "dit la fiche introuvable quand le propriétaire n'a jamais été mis en cache",
    setUp: () {
      when(() => patients.byId('pet-1')).thenAnswer((_) async => filou);
      when(() => owners.byId('owner-1')).thenAnswer((_) async => null);
    },
    build: () => PatientSheetCubit(patients, owners, now: () => DateTime(2026, 9, 3)),
    act: (cubit) => cubit.load('pet-1'),
    expect: () => [isA<PatientSheetUnavailable>()],
  );

  /// Le message était faux dès que le réseau était là : une fiche tout juste
  /// créée n'est pas encore en cache, et « connectez-vous une fois au réseau »
  /// envoyait le praticien chercher une panne qui n'existe pas.
  test("le message d'indisponibilité ne diagnostique jamais le réseau", () {
    expect(
      patientSheetUnavailableMessage.toLowerCase(),
      isNot(contains('réseau')),
    );
    expect(
      patientSheetUnavailableMessage.toLowerCase(),
      isNot(contains('connect')),
    );
  });

  test('load ne plante pas si le cubit est fermé pendant la requête', () async {
    when(() => patients.byId('pet-1')).thenAnswer((_) async {
      await Future<void>.delayed(const Duration(milliseconds: 20));
      return filou;
    });
    when(() => owners.byId('owner-1')).thenAnswer((_) async => camille);
    when(() => patients.history('pet-1')).thenAnswer((_) async => const Success([]));

    final cubit = PatientSheetCubit(patients, owners);
    final loadFuture = cubit.load('pet-1');

    await cubit.close();

    await expectLater(loadFuture, completes);
  });

  /// Le préchargement ne range qu'un seul compte rendu par animal, le plus
  /// récent. Hors ligne, promettre l'ouverture de tous les autres — un
  /// chevron sur chaque séance finalisée — mène droit à un écran d'erreur,
  /// précisément dans le scénario pour lequel le cache existe.
  group('ce qui s\'ouvre réellement', () {
    final ancienne = entree(
      appointmentId: 'appt-1',
      beginAt: DateTime(2026, 6, 1),
      reportId: 'report-1',
    );
    final recente = entree(
      appointmentId: 'appt-2',
      beginAt: DateTime(2026, 8, 20),
      reportId: 'report-2',
    );

    blocTest<PatientSheetCubit, PatientSheetState>(
      'hors ligne, seul le compte rendu en cache est annoncé ouvrable',
      setUp: () {
        when(() => patients.byId('pet-1')).thenAnswer((_) async => filou);
        when(() => owners.byId('owner-1')).thenAnswer((_) async => camille);
        when(() => patients.cachedHistory('pet-1'))
            .thenAnswer((_) async => [recente, ancienne]);
        when(() => patients.cachedReportIds('pet-1'))
            .thenAnswer((_) async => const {'report-2'});
        when(() => patients.history('pet-1'))
            .thenAnswer((_) async => const Err(NetworkFailure()));
      },
      build: () =>
          PatientSheetCubit(patients, owners, now: () => DateTime(2026, 9, 3)),
      act: (cubit) => cubit.load('pet-1'),
      verify: (cubit) {
        final state = cubit.state as PatientSheetLoaded;
        expect(state.openableReportIds, {'report-2'});
      },
    );

    blocTest<PatientSheetCubit, PatientSheetState>(
      'en ligne, tout ce qui est finalisé est ouvrable',
      setUp: () {
        when(() => patients.byId('pet-1')).thenAnswer((_) async => filou);
        when(() => owners.byId('owner-1')).thenAnswer((_) async => camille);
        when(() => patients.cachedReportIds('pet-1'))
            .thenAnswer((_) async => const {'report-2'});
        when(() => patients.history('pet-1')).thenAnswer(
          (_) async => Success([recente, ancienne]),
        );
      },
      build: () =>
          PatientSheetCubit(patients, owners, now: () => DateTime(2026, 9, 3)),
      act: (cubit) => cubit.load('pet-1'),
      verify: (cubit) {
        final state = cubit.state as PatientSheetLoaded;
        expect(state.openableReportIds, {'report-1', 'report-2'});
      },
    );
  });
}
