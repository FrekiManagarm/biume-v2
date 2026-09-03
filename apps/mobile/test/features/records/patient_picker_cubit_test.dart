import 'package:biume_mobile/features/records/domain/patient.dart';
import 'package:biume_mobile/features/records/domain/patient_repository.dart';
import 'package:biume_mobile/features/records/presentation/patient_picker_cubit.dart';
import 'package:bloc_test/bloc_test.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';

class MockPatientRepository extends Mock implements PatientRepository {}

const filou = Patient(
  id: 'patient-1',
  ownerId: 'owner-1',
  ownerName: 'Camille Roux',
  name: 'Filou',
  species: 'DOG',
);

const rex = Patient(
  id: 'patient-2',
  ownerId: 'owner-2',
  ownerName: 'Jean Martin',
  name: 'Rex',
  species: 'CAT',
);

const leo = Patient(
  id: 'patient-3',
  ownerId: 'owner-3',
  ownerName: 'Sophie Dupont',
  name: 'Léo',
  species: 'RABBIT',
);

const noisette = Patient(
  id: 'patient-4',
  ownerId: 'owner-4',
  ownerName: 'Marc Lecœur',
  name: 'Noisette',
  species: 'CAT',
);

void main() {
  late MockPatientRepository repository;

  setUp(() {
    repository = MockPatientRepository();
  });

  blocTest<PatientPickerCubit, PatientPickerState>(
    'filtre sur le nom de l\'animal et du propriétaire, sans casse ni accent',
    setUp: () {
      when(() => repository.watchAll())
          .thenAnswer((_) => Stream.value([filou, rex]));
    },
    build: () => PatientPickerCubit(repository)..start(),
    act: (cubit) async {
      // Laisse le premier événement du cache arriver avant de chercher :
      // sans ce répit, la recherche court-circuite l'émission initiale du
      // flux (même comportement en production, où le cache met un instant
      // à répondre).
      await Future<void>.delayed(Duration.zero);
      cubit.search('rou');
    },
    expect: () => [
      isA<PatientPickerState>().having((s) => s.visible.length, 'tous', 2),
      isA<PatientPickerState>().having(
        (s) => s.visible.map((p) => p.name),
        'filtré',
        ['Filou'],
      ),
    ],
  );

  blocTest<PatientPickerCubit, PatientPickerState>(
    'trouve « Léo » en tapant « leo », sans accent',
    setUp: () {
      when(() => repository.watchAll())
          .thenAnswer((_) => Stream.value([filou, rex, leo]));
    },
    build: () => PatientPickerCubit(repository)..start(),
    act: (cubit) => cubit.search('leo'),
    skip: 1,
    expect: () => [
      isA<PatientPickerState>().having(
        (s) => s.visible.map((p) => p.name),
        'filtré',
        ['Léo'],
      ),
    ],
  );

  blocTest<PatientPickerCubit, PatientPickerState>(
    'trouve « Lecœur » en tapant « lecoeur », œ se repliant sur deux lettres',
    setUp: () {
      when(() => repository.watchAll())
          .thenAnswer((_) => Stream.value([filou, rex, noisette]));
    },
    build: () => PatientPickerCubit(repository)..start(),
    act: (cubit) => cubit.search('lecoeur'),
    skip: 1,
    expect: () => [
      isA<PatientPickerState>().having(
        (s) => s.visible.map((p) => p.name),
        'filtré',
        ['Noisette'],
      ),
    ],
  );

  blocTest<PatientPickerCubit, PatientPickerState>(
    'affiche une liste vide quand le cache local est vide',
    setUp: () {
      when(() => repository.watchAll())
          .thenAnswer((_) => Stream.value(const []));
    },
    build: () => PatientPickerCubit(repository)..start(),
    expect: () => [
      isA<PatientPickerState>().having((s) => s.all, 'tous', isEmpty),
    ],
  );

  test('annule son abonnement au flux à la fermeture', () async {
    when(() => repository.watchAll())
        .thenAnswer((_) => Stream.value([filou]));
    final cubit = PatientPickerCubit(repository)..start();
    await Future<void>.delayed(Duration.zero);
    await cubit.close();
    expect(cubit.isClosed, isTrue);
  });
}
