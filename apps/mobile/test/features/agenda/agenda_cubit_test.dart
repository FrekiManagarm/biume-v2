import 'dart:async';

import 'package:biume_mobile/core/failure.dart';
import 'package:biume_mobile/core/result.dart';
import 'package:biume_mobile/features/agenda/domain/agenda_repository.dart';
import 'package:biume_mobile/features/agenda/domain/appointment.dart';
import 'package:biume_mobile/features/agenda/presentation/agenda_cubit.dart';
import 'package:bloc_test/bloc_test.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';

class MockAgendaRepository extends Mock implements AgendaRepository {}

final jour = DateTime.utc(2026, 8, 21);

final seance = Appointment(
  id: 'appointment-1',
  patientId: 'pet-1',
  patientName: 'Filou',
  species: 'DOG',
  beginAt: DateTime.utc(2026, 8, 21, 9),
  endAt: DateTime.utc(2026, 8, 21, 10),
  status: 'CONFIRMED',
);

void main() {
  late MockAgendaRepository repository;

  setUp(() {
    repository = MockAgendaRepository();
    registerFallbackValue(jour);
  });

  blocTest<AgendaCubit, AgendaState>(
    'affiche le cache dès son arrivée',
    setUp: () {
      when(() => repository.watchDay(any()))
          .thenAnswer((_) => Stream.value([seance]));
      when(() => repository.refresh(any()))
          .thenAnswer((_) async => const Success(null));
    },
    build: () => AgendaCubit(repository),
    act: (cubit) => cubit.load(jour),
    expect: () => [
      const AgendaLoading(),
      AgendaLoaded(day: jour, appointments: [seance]),
    ],
  );

  /// Un praticien dans une écurie sans réseau doit savoir chez qui il va.
  /// Perdre l'agenda parce que la requête a échoué serait la pire panne
  /// possible pour ce produit.
  blocTest<AgendaCubit, AgendaState>(
    'garde le cache quand le rafraîchissement échoue, et le dit',
    setUp: () {
      when(() => repository.watchDay(any()))
          .thenAnswer((_) => Stream.value([seance]));
      when(() => repository.refresh(any()))
          .thenAnswer((_) async => const Err(NetworkFailure()));
    },
    build: () => AgendaCubit(repository),
    act: (cubit) => cubit.load(jour),
    expect: () => [
      const AgendaLoading(),
      AgendaLoaded(day: jour, appointments: [seance]),
      AgendaLoaded(
        day: jour,
        appointments: [seance],
        offlineMessage: 'Connexion indisponible.',
      ),
    ],
  );

  blocTest<AgendaCubit, AgendaState>(
    "dit qu'il n'y a pas de séance plutôt que d'afficher un vide",
    setUp: () {
      when(() => repository.watchDay(any()))
          .thenAnswer((_) => Stream.value(const <Appointment>[]));
      when(() => repository.refresh(any()))
          .thenAnswer((_) async => const Success(null));
    },
    build: () => AgendaCubit(repository),
    act: (cubit) => cubit.load(jour),
    expect: () => [
      const AgendaLoading(),
      AgendaLoaded(day: jour, appointments: const []),
    ],
    verify: (cubit) {
      final state = cubit.state as AgendaLoaded;
      expect(state.isEmpty, isTrue);
    },
  );

  blocTest<AgendaCubit, AgendaState>(
    'change de jour sans garder les séances du précédent',
    setUp: () {
      when(() => repository.watchDay(jour))
          .thenAnswer((_) => Stream.value([seance]));
      when(() => repository.watchDay(DateTime.utc(2026, 8, 22)))
          .thenAnswer((_) => Stream.value(const <Appointment>[]));
      when(() => repository.refresh(any()))
          .thenAnswer((_) async => const Success(null));
    },
    build: () => AgendaCubit(repository),
    act: (cubit) async {
      await cubit.load(jour);
      await cubit.load(DateTime.utc(2026, 8, 22));
    },
    skip: 2,
    expect: () => [
      const AgendaLoading(),
      AgendaLoaded(day: DateTime.utc(2026, 8, 22), appointments: const []),
    ],
  );
}
