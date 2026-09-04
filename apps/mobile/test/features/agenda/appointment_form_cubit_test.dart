import 'dart:async';

import 'package:biume_mobile/core/failure.dart';
import 'package:biume_mobile/core/result.dart';
import 'package:biume_mobile/features/agenda/domain/appointment.dart';
import 'package:biume_mobile/features/agenda/domain/appointment_write_repository.dart';
import 'package:biume_mobile/features/agenda/presentation/appointment_form_cubit.dart';
import 'package:biume_mobile/features/records/domain/patient.dart';
import 'package:bloc_test/bloc_test.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'package:mocktail/mocktail.dart';

class MockAppointmentWriteRepository extends Mock
    implements AppointmentWriteRepository {}

const filou = Patient(
  id: 'pet-1',
  ownerId: 'owner-1',
  ownerName: 'Camille Roux',
  name: 'Filou',
  species: 'DOG',
);

AppointmentConflict conflit(String patientName, DateTime beginAt) =>
    AppointmentConflict(
      appointmentId: 'a-2',
      beginAt: beginAt,
      patientName: patientName,
    );

Appointment rdv({
  String id = 'appointment-1',
  DateTime? beginAt,
  DateTime? endAt,
}) => Appointment(
  id: id,
  patientId: 'pet-1',
  patientName: 'Filou',
  species: 'DOG',
  beginAt: beginAt ?? DateTime(2026, 9, 5, 9),
  endAt: endAt ?? DateTime(2026, 9, 5, 10, 30),
  status: 'CONFIRMED',
);

void main() {
  late MockAppointmentWriteRepository repository;

  // `AppointmentConflict.sentence` formate avec `DateFormat.Hm('fr_FR')`, que
  // seul `main()` initialise en production.
  setUpAll(() => initializeDateFormatting('fr_FR'));

  setUp(() {
    repository = MockAppointmentWriteRepository();
    registerFallbackValue(DateTime(2026));
  });

  blocTest<AppointmentFormCubit, AppointmentFormState>(
    'prend la durée de la dernière séance par défaut',
    setUp: () => when(
      () => repository.defaultDuration(),
    ).thenAnswer((_) async => const Duration(minutes: 45)),
    build: () =>
        AppointmentFormCubit(repository, now: () => DateTime(2026, 9, 3, 9)),
    act: (cubit) => cubit.start(),
    verify: (cubit) => expect(cubit.state.duration, const Duration(minutes: 45)),
  );

  blocTest<AppointmentFormCubit, AppointmentFormState>(
    'crée la séance et remonte les conflits sans échouer',
    setUp: () {
      when(
        () => repository.defaultDuration(),
      ).thenAnswer((_) async => const Duration(hours: 1));
      when(
        () => repository.create(
          patientId: 'pet-1',
          beginAt: any(named: 'beginAt'),
          endAt: any(named: 'endAt'),
          atHome: true,
        ),
      ).thenAnswer(
        (_) async => Success(
          AppointmentWriteOutcome(
            appointmentId: 'a-1',
            reportId: 'r-1',
            conflicts: [conflit('Rex', DateTime(2026, 9, 4, 14))],
          ),
        ),
      );
    },
    build: () => AppointmentFormCubit(
      repository,
      initialPatient: filou,
      now: () => DateTime(2026, 9, 3, 9),
    ),
    act: (cubit) async {
      await cubit.start();
      cubit.chooseDay(DateTime(2026, 9, 4));
      cubit.chooseStart(const TimeOfDay(hour: 14, minute: 30));
      cubit.toggleAtHome(true);
      await cubit.submit();
    },
    verify: (cubit) {
      expect(
        cubit.state.saved!.conflicts.single.sentence,
        'Chevauche la séance de Rex à 14:00.',
      );
    },
  );

  blocTest<AppointmentFormCubit, AppointmentFormState>(
    'refuse de soumettre sans animal',
    setUp: () => when(
      () => repository.defaultDuration(),
    ).thenAnswer((_) async => const Duration(hours: 1)),
    build: () =>
        AppointmentFormCubit(repository, now: () => DateTime(2026, 9, 3, 9)),
    act: (cubit) async {
      await cubit.start();
      await cubit.submit();
    },
    verify: (cubit) {
      expect(cubit.state.message, 'Choisissez un animal.');
      verifyNever(
        () => repository.create(
          patientId: any(named: 'patientId'),
          beginAt: any(named: 'beginAt'),
          endAt: any(named: 'endAt'),
          atHome: any(named: 'atHome'),
        ),
      );
    },
  );

  blocTest<AppointmentFormCubit, AppointmentFormState>(
    "dit hors ligne sans échouer, avec le geste de repli",
    setUp: () {
      when(
        () => repository.defaultDuration(),
      ).thenAnswer((_) async => const Duration(hours: 1));
      when(
        () => repository.create(
          patientId: any(named: 'patientId'),
          beginAt: any(named: 'beginAt'),
          endAt: any(named: 'endAt'),
          atHome: any(named: 'atHome'),
        ),
      ).thenAnswer((_) async => const Err(NetworkFailure()));
    },
    build: () => AppointmentFormCubit(
      repository,
      initialPatient: filou,
      now: () => DateTime(2026, 9, 3, 9),
    ),
    act: (cubit) async {
      await cubit.start();
      await cubit.submit();
    },
    verify: (cubit) {
      expect(cubit.state.offline, isTrue);
      expect(cubit.state.message, appointmentOfflineCreateMessage);
      expect(cubit.state.saved, isNull);
      expect(cubit.state.busy, isFalse);
    },
  );

  group('déplacement', () {
    blocTest<AppointmentFormCubit, AppointmentFormState>(
      'préremplit le jour, l\'heure et la durée depuis la séance existante, '
      'sans appeler defaultDuration',
      build: () => AppointmentFormCubit(
        repository,
        existing: rdv(
          beginAt: DateTime(2026, 9, 5, 9),
          endAt: DateTime(2026, 9, 5, 10, 30),
        ),
        now: () => DateTime(2026, 9, 3, 9),
      ),
      act: (cubit) => cubit.start(),
      verify: (cubit) {
        expect(cubit.state.day, DateTime(2026, 9, 5));
        expect(cubit.state.start, const TimeOfDay(hour: 9, minute: 0));
        expect(cubit.state.duration, const Duration(hours: 1, minutes: 30));
        verifyNever(() => repository.defaultDuration());
      },
    );

    blocTest<AppointmentFormCubit, AppointmentFormState>(
      'ignore les tentatives de changer la durée ou le lieu',
      build: () => AppointmentFormCubit(
        repository,
        existing: rdv(),
        now: () => DateTime(2026, 9, 3, 9),
      ),
      act: (cubit) {
        cubit.chooseDuration(const Duration(minutes: 30));
        cubit.toggleAtHome(true);
      },
      expect: () => <AppointmentFormState>[],
    );

    blocTest<AppointmentFormCubit, AppointmentFormState>(
      'déplace la séance sans exiger d\'animal, en conservant la durée',
      setUp: () => when(
        () => repository.move(
          'appointment-1',
          beginAt: DateTime(2026, 9, 6, 11),
          endAt: DateTime(2026, 9, 6, 12, 30),
        ),
      ).thenAnswer(
        (_) async => const Success(
          AppointmentWriteOutcome(appointmentId: 'appointment-1', conflicts: []),
        ),
      ),
      build: () => AppointmentFormCubit(
        repository,
        existing: rdv(
          beginAt: DateTime(2026, 9, 5, 9),
          endAt: DateTime(2026, 9, 5, 10, 30),
        ),
        now: () => DateTime(2026, 9, 3, 9),
      ),
      act: (cubit) async {
        cubit.chooseDay(DateTime(2026, 9, 6));
        cubit.chooseStart(const TimeOfDay(hour: 11, minute: 0));
        await cubit.submit();
      },
      verify: (cubit) {
        expect(cubit.state.saved!.conflicts, isEmpty);
        verifyNever(
          () => repository.create(
            patientId: any(named: 'patientId'),
            beginAt: any(named: 'beginAt'),
            endAt: any(named: 'endAt'),
            atHome: any(named: 'atHome'),
          ),
        );
      },
    );

    blocTest<AppointmentFormCubit, AppointmentFormState>(
      'dit hors ligne avec le message de déplacement',
      setUp: () => when(
        () => repository.move(
          any(),
          beginAt: any(named: 'beginAt'),
          endAt: any(named: 'endAt'),
        ),
      ).thenAnswer((_) async => const Err(NetworkFailure())),
      build: () => AppointmentFormCubit(
        repository,
        existing: rdv(),
        now: () => DateTime(2026, 9, 3, 9),
      ),
      act: (cubit) => cubit.submit(),
      verify: (cubit) {
        expect(cubit.state.offline, isTrue);
        expect(cubit.state.message, appointmentOfflineMoveMessage);
      },
    );
  });

  test("n'émet plus si la réponse arrive pendant que close() attend", () async {
    final completer = Completer<Result<AppointmentWriteOutcome>>();
    when(
      () => repository.create(
        patientId: any(named: 'patientId'),
        beginAt: any(named: 'beginAt'),
        endAt: any(named: 'endAt'),
        atHome: any(named: 'atHome'),
      ),
    ).thenAnswer((_) => completer.future);

    final cubit = AppointmentFormCubit(
      repository,
      initialPatient: filou,
      now: () => DateTime(2026, 9, 3, 9),
    );
    final states = <AppointmentFormState>[];
    final subscription = cubit.stream.listen(states.add);

    final submitFuture = cubit.submit();
    // Laisse `submit()` poser `busy: true` et démarrer sa requête, qui reste
    // délibérément en vol.
    await Future<void>.delayed(Duration.zero);
    final avantFermeture = List<AppointmentFormState>.of(states);

    final closeFuture = cubit.close();
    completer.complete(
      const Success(
        AppointmentWriteOutcome(appointmentId: 'a-1', conflicts: []),
      ),
    );
    await closeFuture;
    await submitFuture;
    await Future<void>.delayed(Duration.zero);

    expect(states, avantFermeture);
    await subscription.cancel();
  });
}
