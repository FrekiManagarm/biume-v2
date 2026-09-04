import 'package:biume_mobile/core/failure.dart';
import 'package:biume_mobile/core/result.dart';
import 'package:biume_mobile/features/followup/domain/actionable_follow_up_repository.dart';
import 'package:biume_mobile/features/followup/presentation/follow_up_cubit.dart';
import 'package:bloc_test/bloc_test.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';

import 'follow_up_fixture.dart';

class MockActionableFollowUpRepository extends Mock
    implements ActionableFollowUpRepository {}

void main() {
  late MockActionableFollowUpRepository repository;

  setUp(() => repository = MockActionableFollowUpRepository());

  blocTest<FollowUpCubit, FollowUpState>(
    'ne liste que ce qui demande une action',
    setUp: () => when(() => repository.listActionable()).thenAnswer(
      (_) async => Success([
        suivi(id: 'f-1'),
        suivi(id: 'f-2', handled: true),
        suivi(id: 'f-3', reasons: const []),
      ]),
    ),
    build: () => FollowUpCubit(repository),
    act: (cubit) => cubit.load(),
    verify: (cubit) =>
        expect(cubit.state.items.map((f) => f.id), ['f-1']),
  );

  blocTest<FollowUpCubit, FollowUpState>(
    'fait disparaître un suivi une fois traité',
    setUp: () {
      when(() => repository.listActionable()).thenAnswer(
        (_) async => Success([suivi(id: 'f-1'), suivi(id: 'f-2')]),
      );
      when(() => repository.markHandled('f-1')).thenAnswer(
        (_) async => Success(suivi(id: 'f-1', handled: true)),
      );
    },
    build: () => FollowUpCubit(repository),
    act: (cubit) async {
      await cubit.load();
      await cubit.markHandled('f-1');
    },
    verify: (cubit) => expect(cubit.state.items.map((f) => f.id), ['f-2']),
  );

  /// Un suivi qui disparaît sur un échec réseau, c'est un propriétaire oublié.
  /// La liste ne bouge pas tant que le serveur n'a pas confirmé.
  blocTest<FollowUpCubit, FollowUpState>(
    'garde la liste et dit pourquoi quand marquer traité échoue',
    setUp: () {
      when(
        () => repository.listActionable(),
      ).thenAnswer((_) async => Success([suivi(id: 'f-1')]));
      when(
        () => repository.markHandled('f-1'),
      ).thenAnswer((_) async => const Err(NetworkFailure()));
    },
    build: () => FollowUpCubit(repository),
    act: (cubit) async {
      await cubit.load();
      await cubit.markHandled('f-1');
    },
    verify: (cubit) {
      expect(cubit.state.items, hasLength(1));
      expect(cubit.state.message, 'Connexion indisponible.');
    },
  );

  blocTest<FollowUpCubit, FollowUpState>(
    'dit pourquoi la liste est vide quand le chargement échoue',
    setUp: () => when(
      () => repository.listActionable(),
    ).thenAnswer((_) async => const Err(NetworkFailure())),
    build: () => FollowUpCubit(repository),
    act: (cubit) => cubit.load(),
    verify: (cubit) {
      expect(cubit.state.items, isEmpty);
      expect(cubit.state.message, 'Connexion indisponible.');
      expect(cubit.state.busy, isFalse);
    },
  );

  test('retrouve un suivi déjà chargé sans rappeler le serveur', () async {
    when(
      () => repository.listActionable(),
    ).thenAnswer((_) async => Success([suivi(id: 'f-1')]));

    final cubit = FollowUpCubit(repository);
    await cubit.load();

    expect(cubit.byId('f-1')?.id, 'f-1');
    expect(cubit.byId('f-inconnu'), isNull);
    await cubit.close();
  });
}
