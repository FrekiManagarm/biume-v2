import 'package:flutter/foundation.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../core/result.dart';
import '../domain/auth_repository.dart';
import '../domain/session.dart';

@immutable
sealed class AuthState {
  const AuthState();
}

class AuthInitial extends AuthState {
  const AuthInitial();

  @override
  bool operator ==(Object other) => other is AuthInitial;

  @override
  int get hashCode => 0;
}

class AuthChecking extends AuthState {
  const AuthChecking();

  @override
  bool operator ==(Object other) => other is AuthChecking;

  @override
  int get hashCode => 1;
}

class AuthUnauthenticated extends AuthState {
  const AuthUnauthenticated({this.message});

  /// Ce que le praticien lit. Vient toujours du domaine, jamais du transport.
  final String? message;

  @override
  bool operator ==(Object other) =>
      other is AuthUnauthenticated && other.message == message;

  @override
  int get hashCode => Object.hash(2, message);
}

/// Session valide mais inutilisable tant qu'aucune entreprise n'est choisie :
/// toute lecture de données de patient l'exige.
class AuthNeedsCompany extends AuthState {
  const AuthNeedsCompany(this.session, {this.message});

  final PractitionerSession session;
  final String? message;

  @override
  bool operator ==(Object other) =>
      other is AuthNeedsCompany &&
      other.session == session &&
      other.message == message;

  @override
  int get hashCode => Object.hash(3, session, message);
}

class AuthAuthenticated extends AuthState {
  const AuthAuthenticated(this.session);

  final PractitionerSession session;

  @override
  bool operator ==(Object other) =>
      other is AuthAuthenticated && other.session == session;

  @override
  int get hashCode => Object.hash(4, session);
}

/// Un Cubit et non un Bloc : « vérifier, connecter, choisir, déconnecter » n'a
/// pas de transitions concurrentes. Le Bloc est réservé à l'enregistrement et
/// à la synchronisation, où elles existent réellement.
class AuthCubit extends Cubit<AuthState> {
  AuthCubit(this._repository, {required this.clearReadCache})
    : super(const AuthInitial());

  final AuthRepository _repository;

  /// Vide le cache de lecture — animaux, propriétaires, agenda. Exigé, jamais
  /// facultatif : un appelant qui l'oublierait laisserait les clients d'un
  /// cabinet visibles dans un autre.
  final Future<void> Function() clearReadCache;

  Future<void> start() async {
    emit(const AuthChecking());

    final session = await _repository.restoreSession();
    if (session == null) {
      emit(const AuthUnauthenticated());
      return;
    }

    _emitForSession(session);
  }

  Future<void> signIn({required String email, required String password}) async {
    emit(const AuthChecking());

    final result = await _repository.signIn(email: email, password: password);
    switch (result) {
      case Success(:final value):
        _emitForSession(value);
      case Err(:final failure):
        emit(AuthUnauthenticated(message: failure.message));
    }
  }

  Future<void> chooseCompany(String companyId) async {
    final previous = state;
    emit(const AuthChecking());

    final result = await _repository.setActiveCompany(companyId);
    switch (result) {
      case Success(:final value):
        // Le cache de lecture appartient à l'entreprise qu'on vient de
        // quitter. Le garder afficherait ses clients dans le sélecteur
        // d'animal de la suivante, et hors ligne aucun rafraîchissement ne
        // viendrait jamais le corriger. La file de dictées, elle, n'est pas
        // touchée : elle porte du travail que le praticien ne peut pas
        // refaire, et survit au changement.
        await clearReadCache();
        _emitForSession(value);
      case Err(:final failure):
        // La session en cours n'est pas perdue : le praticien réessaie sans
        // avoir à se reconnecter.
        emit(
          previous is AuthNeedsCompany
              ? AuthNeedsCompany(previous.session, message: failure.message)
              : AuthUnauthenticated(message: failure.message),
        );
    }
  }

  Future<void> signOut() async {
    await _repository.signOut();
    // Même raison qu'au changement d'entreprise : l'appareil ne garde aucune
    // donnée de clients lisible une fois la session fermée.
    await clearReadCache();
    emit(const AuthUnauthenticated());
  }

  void _emitForSession(PractitionerSession session) {
    emit(
      session.canWork ? AuthAuthenticated(session) : AuthNeedsCompany(session),
    );
  }
}
