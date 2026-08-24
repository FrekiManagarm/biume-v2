import 'package:biume_mobile/core/failure.dart';
import 'package:biume_mobile/core/result.dart';
import 'package:biume_mobile/features/auth/domain/auth_repository.dart';
import 'package:biume_mobile/features/auth/domain/session.dart';
import 'package:biume_mobile/features/auth/presentation/auth_cubit.dart';
import 'package:bloc_test/bloc_test.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';

class MockAuthRepository extends Mock implements AuthRepository {}

const cabinet = Company(id: 'org-1', name: 'Cabinet Biume');
const avecEntreprise = PractitionerSession(userId: 'user-1', company: cabinet);
const sansEntreprise = PractitionerSession(userId: 'user-1', company: null);

void main() {
  late MockAuthRepository repository;

  setUp(() => repository = MockAuthRepository());

  blocTest<AuthCubit, AuthState>(
    'passe authentifié quand une entreprise est déjà active',
    setUp: () {
      when(() => repository.restoreSession())
          .thenAnswer((_) async => avecEntreprise);
    },
    build: () => AuthCubit(repository),
    act: (cubit) => cubit.start(),
    expect: () => [
      const AuthChecking(),
      const AuthAuthenticated(avecEntreprise),
    ],
  );

  /// Une session valide sans entreprise active n'est pas une session
  /// utilisable : toute lecture de données de patient l'exige.
  blocTest<AuthCubit, AuthState>(
    "demande de choisir une entreprise quand aucune n'est active",
    setUp: () {
      when(() => repository.restoreSession())
          .thenAnswer((_) async => sansEntreprise);
    },
    build: () => AuthCubit(repository),
    act: (cubit) => cubit.start(),
    expect: () => [
      const AuthChecking(),
      const AuthNeedsCompany(sansEntreprise),
    ],
  );

  blocTest<AuthCubit, AuthState>(
    'reste déconnecté quand rien n\'est rangé dans le trousseau',
    setUp: () {
      when(() => repository.restoreSession()).thenAnswer((_) async => null);
    },
    build: () => AuthCubit(repository),
    act: (cubit) => cubit.start(),
    expect: () => [const AuthChecking(), const AuthUnauthenticated()],
  );

  blocTest<AuthCubit, AuthState>(
    'reste déconnecté sur identifiants refusés, sans détail technique',
    setUp: () {
      when(() => repository.signIn(
            email: any(named: 'email'),
            password: any(named: 'password'),
          )).thenAnswer((_) async => const Err(AuthFailure()));
    },
    build: () => AuthCubit(repository),
    act: (cubit) => cubit.signIn(email: 'a@b.test', password: 'x'),
    expect: () => [
      const AuthChecking(),
      const AuthUnauthenticated(message: 'Session expirée, reconnectez-vous.'),
    ],
  );

  /// Le jeton est la seule chose qui protège des données de santé sur un
  /// téléphone qui peut être perdu.
  blocTest<AuthCubit, AuthState>(
    'efface le jeton du trousseau à la déconnexion',
    setUp: () {
      when(() => repository.signOut()).thenAnswer((_) async {});
    },
    build: () => AuthCubit(repository),
    act: (cubit) => cubit.signOut(),
    expect: () => [const AuthUnauthenticated()],
    verify: (_) => verify(() => repository.signOut()).called(1),
  );

  blocTest<AuthCubit, AuthState>(
    'passe authentifié après avoir choisi une entreprise',
    setUp: () {
      when(() => repository.setActiveCompany(any()))
          .thenAnswer((_) async => const Success(avecEntreprise));
    },
    build: () => AuthCubit(repository),
    act: (cubit) => cubit.chooseCompany('org-1'),
    expect: () => [
      const AuthChecking(),
      const AuthAuthenticated(avecEntreprise),
    ],
  );

  blocTest<AuthCubit, AuthState>(
    'signale une coupure réseau sans perdre la session en cours',
    seed: () => const AuthNeedsCompany(sansEntreprise),
    setUp: () {
      when(() => repository.setActiveCompany(any()))
          .thenAnswer((_) async => const Err(NetworkFailure()));
    },
    build: () => AuthCubit(repository),
    act: (cubit) => cubit.chooseCompany('org-1'),
    expect: () => [
      const AuthChecking(),
      const AuthNeedsCompany(sansEntreprise, message: 'Connexion indisponible.'),
    ],
  );
}
