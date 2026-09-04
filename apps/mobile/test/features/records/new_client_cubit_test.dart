import 'package:bloc_test/bloc_test.dart';
import 'package:biume_mobile/core/failure.dart';
import 'package:biume_mobile/core/result.dart';
import 'package:biume_mobile/features/records/domain/owner_repository.dart';
import 'package:biume_mobile/features/records/domain/patient.dart';
import 'package:biume_mobile/features/records/domain/patient_repository.dart';
import 'package:biume_mobile/features/records/presentation/new_client_cubit.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';

class MockOwnerRepository extends Mock implements OwnerRepository {}

class MockPatientRepository extends Mock implements PatientRepository {}

const camille = Owner(id: 'owner-1', name: 'Camille Roux');

const filou = Patient(
  id: 'pet-1',
  ownerId: 'owner-1',
  ownerName: 'Camille Roux',
  name: 'Filou',
  species: 'DOG',
);

void main() {
  late MockOwnerRepository owners;
  late MockPatientRepository patients;

  setUp(() {
    owners = MockOwnerRepository();
    patients = MockPatientRepository();
  });

  blocTest<NewClientCubit, NewClientState>(
    'crée le propriétaire puis l\'animal, et rafraîchit le cache',
    setUp: () {
      when(
        () => owners.create(
          name: 'Camille Roux',
          email: null,
          phone: null,
          city: null,
        ),
      ).thenAnswer((_) async => const Success(camille));
      when(
        () => owners.createPatient(
          ownerId: 'owner-1',
          name: 'Filou',
          species: 'DOG',
          breed: null,
          birthDate: null,
        ),
      ).thenAnswer((_) async => const Success(filou));
      when(() => patients.refresh()).thenAnswer((_) async => const Success(null));
    },
    build: () => NewClientCubit(owners, patients),
    act: (cubit) async {
      await cubit.submitOwner(name: 'Camille Roux');
      await cubit.submitPatient(name: 'Filou', species: 'DOG');
    },
    verify: (cubit) {
      expect(cubit.state.step, NewClientStep.done);
      expect(cubit.state.patient, filou);
      verify(() => patients.refresh()).called(1);
    },
  );

  blocTest<NewClientCubit, NewClientState>(
    'saute le volet propriétaire quand il existe déjà',
    build: () => NewClientCubit(owners, patients, existingOwnerId: 'owner-1'),
    verify: (cubit) => expect(cubit.state.step, NewClientStep.patient),
  );

  blocTest<NewClientCubit, NewClientState>(
    'un propriétaire déjà fourni suffit à créer l\'animal',
    setUp: () {
      when(
        () => owners.createPatient(
          ownerId: 'owner-1',
          name: 'Filou',
          species: 'DOG',
          breed: null,
          birthDate: null,
        ),
      ).thenAnswer((_) async => const Success(filou));
      when(() => patients.refresh()).thenAnswer((_) async => const Success(null));
    },
    build: () => NewClientCubit(owners, patients, existingOwnerId: 'owner-1'),
    act: (cubit) => cubit.submitPatient(name: 'Filou', species: 'DOG'),
    verify: (cubit) {
      expect(cubit.state.step, NewClientStep.done);
      expect(cubit.state.patient, filou);
      verifyNever(
        () => owners.create(
          name: any(named: 'name'),
          email: any(named: 'email'),
          phone: any(named: 'phone'),
          city: any(named: 'city'),
        ),
      );
    },
  );

  blocTest<NewClientCubit, NewClientState>(
    'un nom vide ne part jamais',
    build: () => NewClientCubit(owners, patients),
    act: (cubit) => cubit.submitOwner(name: '   '),
    verify: (cubit) {
      expect(cubit.state.message, 'Le nom est obligatoire.');
      verifyNever(
        () => owners.create(
          name: any(named: 'name'),
          email: any(named: 'email'),
          phone: any(named: 'phone'),
          city: any(named: 'city'),
        ),
      );
    },
  );

  blocTest<NewClientCubit, NewClientState>(
    'un nom d\'animal vide ne part jamais non plus',
    build: () => NewClientCubit(owners, patients, existingOwnerId: 'owner-1'),
    act: (cubit) => cubit.submitPatient(name: '  ', species: 'DOG'),
    verify: (cubit) {
      expect(cubit.state.message, 'Le nom est obligatoire.');
      verifyNever(
        () => owners.createPatient(
          ownerId: any(named: 'ownerId'),
          name: any(named: 'name'),
          species: any(named: 'species'),
          breed: any(named: 'breed'),
          birthDate: any(named: 'birthDate'),
        ),
      );
    },
  );

  blocTest<NewClientCubit, NewClientState>(
    'des champs vides côté propriétaire ne partent pas comme chaînes vides',
    setUp: () {
      when(
        () => owners.create(
          name: 'Camille Roux',
          email: null,
          phone: null,
          city: null,
        ),
      ).thenAnswer((_) async => const Success(camille));
    },
    build: () => NewClientCubit(owners, patients),
    act: (cubit) =>
        cubit.submitOwner(name: 'Camille Roux', email: '   ', phone: '', city: null),
    verify: (cubit) {
      expect(cubit.state.step, NewClientStep.patient);
      verify(
        () => owners.create(
          name: 'Camille Roux',
          email: null,
          phone: null,
          city: null,
        ),
      ).called(1);
    },
  );

  blocTest<NewClientCubit, NewClientState>(
    'hors ligne, le message dit quoi faire plutôt que la panne brute',
    setUp: () {
      when(
        () => owners.create(
          name: 'Camille Roux',
          email: null,
          phone: null,
          city: null,
        ),
      ).thenAnswer((_) async => const Err(NetworkFailure()));
    },
    build: () => NewClientCubit(owners, patients),
    act: (cubit) => cubit.submitOwner(name: 'Camille Roux'),
    verify: (cubit) {
      expect(cubit.state.message, newClientOfflineMessage);
      expect(cubit.state.step, NewClientStep.owner);
    },
  );

  blocTest<NewClientCubit, NewClientState>(
    'un échec métier affiche le message du serveur, pas le message hors ligne',
    setUp: () {
      when(
        () => owners.create(
          name: 'Camille Roux',
          email: null,
          phone: null,
          city: null,
        ),
      ).thenAnswer(
        (_) async => const Err(ValidationFailure(message: 'Nom déjà utilisé.')),
      );
    },
    build: () => NewClientCubit(owners, patients),
    act: (cubit) => cubit.submitOwner(name: 'Camille Roux'),
    verify: (cubit) {
      expect(cubit.state.message, 'Nom déjà utilisé.');
    },
  );
}
