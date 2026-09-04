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

final aujourdhui = DateTime(2026, 9, 3);
final demain = DateTime(2026, 9, 4);

Appointment rdv(DateTime beginAt, {String id = 'appointment-1'}) => Appointment(
  id: id,
  patientId: 'pet-1',
  patientName: 'Filou',
  species: 'DOG',
  beginAt: beginAt,
  endAt: beginAt.add(const Duration(hours: 1)),
  status: 'CONFIRMED',
);

void main() {
  late MockAgendaRepository repository;

  setUp(() {
    repository = MockAgendaRepository();
    registerFallbackValue(aujourdhui);
  });

  blocTest<AgendaCubit, AgendaState>(
    'groupe huit jours, aujourd\'hui en tête, jours vides compris',
    setUp: () {
      when(() => repository.watchWindow(any(), any())).thenAnswer(
        (_) => Stream.value([rdv(DateTime(2026, 9, 5, 10))]),
      );
      when(() => repository.refreshWindow(any(), any()))
          .thenAnswer((_) async => const Success(null));
    },
    build: () => AgendaCubit(repository, now: () => DateTime(2026, 9, 3, 8)),
    act: (cubit) => cubit.load(aujourdhui),
    verify: (cubit) {
      final state = cubit.state as AgendaLoaded;
      expect(state.days, hasLength(8));
      expect(state.days.first.day, aujourdhui);
      expect(state.days[2].day, DateTime(2026, 9, 5));
      expect(state.days[2].appointments, hasLength(1));
      // Les jours sans séance restent dans la liste : c'est une information
      // pour un praticien qui organise sa tournée, pas un vide à masquer.
      expect(state.days[1].appointments, isEmpty);
    },
  );

  /// Un praticien dans une écurie sans réseau doit savoir chez qui il va.
  /// Perdre l'agenda parce que la requête a échoué serait la pire panne
  /// possible pour ce produit.
  blocTest<AgendaCubit, AgendaState>(
    'garde le cache quand le rafraîchissement échoue, et le dit',
    setUp: () {
      when(() => repository.watchWindow(any(), any()))
          .thenAnswer((_) => Stream.value([rdv(aujourdhui)]));
      when(() => repository.refreshWindow(any(), any()))
          .thenAnswer((_) async => const Err(NetworkFailure()));
    },
    build: () => AgendaCubit(repository, now: () => DateTime(2026, 9, 3, 8)),
    act: (cubit) => cubit.load(aujourdhui),
    verify: (cubit) {
      final state = cubit.state as AgendaLoaded;
      expect(state.offlineMessage, 'Connexion indisponible.');
      // Le cache déjà publié reste affiché : ce message dit « ces données
      // peuvent dater », jamais « il n'y a rien ».
      expect(state.days.first.appointments, hasLength(1));
    },
  );

  blocTest<AgendaCubit, AgendaState>(
    'change de fenêtre sans garder les séances de la précédente',
    setUp: () {
      when(() => repository.watchWindow(any(), any())).thenAnswer((invocation) {
        final from = invocation.positionalArguments[0] as DateTime;
        return from == DateTime.utc(2026, 9, 3)
            ? Stream.value([rdv(aujourdhui)])
            : Stream.value(const <Appointment>[]);
      });
      when(() => repository.refreshWindow(any(), any()))
          .thenAnswer((_) async => const Success(null));
    },
    build: () => AgendaCubit(repository, now: () => DateTime(2026, 9, 3, 8)),
    act: (cubit) async {
      await cubit.load(aujourdhui);
      await cubit.load(demain);
    },
    verify: (cubit) {
      final state = cubit.state as AgendaLoaded;
      expect(state.days.first.day, demain);
      expect(state.days.every((day) => day.appointments.isEmpty), isTrue);
    },
  );

  blocTest<AgendaCubit, AgendaState>(
    'un jour dans la fenêtre est lu depuis les jours déjà groupés',
    setUp: () {
      when(() => repository.watchWindow(any(), any())).thenAnswer(
        (_) => Stream.value([rdv(DateTime(2026, 9, 5, 10))]),
      );
      when(() => repository.refreshWindow(any(), any()))
          .thenAnswer((_) async => const Success(null));
    },
    build: () => AgendaCubit(repository, now: () => DateTime(2026, 9, 3, 8)),
    act: (cubit) async {
      await cubit.load(aujourdhui);
      await cubit.showDay(DateTime(2026, 9, 5));
    },
    verify: (cubit) {
      final state = cubit.state as AgendaDayLoaded;
      expect(state.day, DateTime(2026, 9, 5));
      expect(state.appointments, hasLength(1));
      verifyNever(() => repository.fetchDay(any()));
    },
  );

  blocTest<AgendaCubit, AgendaState>(
    'un jour hors fenêtre est lu sans cache et dit hors ligne s\'il échoue',
    setUp: () {
      when(() => repository.fetchDay(any()))
          .thenAnswer((_) async => const Err(NetworkFailure()));
    },
    build: () => AgendaCubit(repository, now: () => DateTime(2026, 9, 3, 8)),
    act: (cubit) => cubit.showDay(DateTime(2026, 10, 1)),
    verify: (cubit) {
      expect((cubit.state as AgendaDayUnavailable).message, 'Connexion indisponible.');
      verifyNever(() => repository.watchWindow(any(), any()));
    },
  );

  blocTest<AgendaCubit, AgendaState>(
    'un jour hors fenêtre réussi affiche ses séances sans passer par le cache',
    setUp: () {
      when(() => repository.fetchDay(any())).thenAnswer(
        (_) async => Success<List<Appointment>>([rdv(DateTime(2026, 10, 1))]),
      );
    },
    build: () => AgendaCubit(repository, now: () => DateTime(2026, 9, 3, 8)),
    act: (cubit) => cubit.showDay(DateTime(2026, 10, 1)),
    verify: (cubit) {
      final state = cubit.state as AgendaDayLoaded;
      expect(state.day, DateTime(2026, 10, 1));
      expect(state.appointments, hasLength(1));
    },
  );

  /// Ce lot fait de l'agenda le cubit de l'écran d'accueil, et ajoute les deux
  /// gestes qui le démontent en pleine requête : changer d'entreprise et se
  /// déconnecter. `close()` attend l'annulation de l'abonnement avant
  /// `super.close()`, donc `isClosed` est encore faux pendant cette attente :
  /// une réponse qui arrive là passerait la garde et émettrait sur un cubit
  /// en train de se fermer.
  test("n'émet plus si le rafraîchissement répond pendant que close() attend "
      "l'annulation de l'abonnement", () async {
    final completer = Completer<Result<void>>();
    when(() => repository.watchWindow(any(), any()))
        .thenAnswer((_) => Stream.value([rdv(aujourdhui)]));
    when(() => repository.refreshWindow(any(), any()))
        .thenAnswer((_) => completer.future);

    final cubit = AgendaCubit(repository);
    final states = <AgendaState>[];
    final subscription = cubit.stream.listen(states.add);

    unawaited(cubit.load(aujourdhui));
    // Le cache s'est publié ; la requête réseau, elle, reste en vol.
    await Future<void>.delayed(Duration.zero);
    final apresCache = List<AgendaState>.of(states);

    final closeFuture = cubit.close();
    // Un échec : c'est le seul chemin où `load` émet après la requête.
    completer.complete(const Err(NetworkFailure()));
    await closeFuture;
    await Future<void>.delayed(Duration.zero);

    expect(states, apresCache);
    await subscription.cancel();
  });

  /// Même garde pour `showDay` : un praticien qui change d'entreprise ou se
  /// déconnecte pendant qu'un jour hors fenêtre est en vol ne doit jamais
  /// voir ce jour s'afficher sur un cubit fermé.
  test("n'émet plus si fetchDay répond après close()", () async {
    final completer = Completer<Result<List<Appointment>>>();
    when(() => repository.fetchDay(any())).thenAnswer((_) => completer.future);

    final cubit = AgendaCubit(repository, now: () => DateTime(2026, 9, 3, 8));
    final states = <AgendaState>[];
    final subscription = cubit.stream.listen(states.add);

    unawaited(cubit.showDay(DateTime(2026, 10, 1)));
    await Future<void>.delayed(Duration.zero);

    final closeFuture = cubit.close();
    completer.complete(Success([rdv(DateTime(2026, 10, 1))]));
    await closeFuture;
    await Future<void>.delayed(Duration.zero);

    expect(states, isEmpty);
    await subscription.cancel();
  });
}
