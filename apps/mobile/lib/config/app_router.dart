import 'dart:async';

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../features/agenda/presentation/agenda_screen.dart';
import '../features/auth/presentation/auth_cubit.dart';
import '../features/auth/presentation/choose_company_screen.dart';
import '../features/auth/presentation/sign_in_screen.dart';

/// La garde d'authentification est une redirection branchée sur le flux du
/// cubit — une dizaine de lignes, là où un routeur impératif demanderait des
/// vérifications dispersées dans chaque écran.
GoRouter buildAppRouter(AuthCubit auth) {
  return GoRouter(
    initialLocation: '/',
    refreshListenable: _CubitListenable(auth.stream),
    redirect: (context, state) {
      final path = state.matchedLocation;

      return switch (auth.state) {
        AuthInitial() || AuthChecking() => null,
        AuthUnauthenticated() => path == '/connexion' ? null : '/connexion',
        AuthNeedsCompany() => path == '/entreprise' ? null : '/entreprise',
        AuthAuthenticated() =>
          path == '/connexion' || path == '/entreprise' ? '/' : null,
      };
    },
    routes: [
      GoRoute(path: '/', builder: (_, _) => const AgendaScreen()),
      GoRoute(path: '/connexion', builder: (_, _) => const SignInScreen()),
      GoRoute(
        path: '/entreprise',
        builder: (_, _) => const ChooseCompanyScreen(),
      ),
    ],
  );
}

class _CubitListenable extends ChangeNotifier {
  _CubitListenable(Stream<AuthState> stream) {
    _subscription = stream.listen((_) => notifyListeners());
  }

  late final StreamSubscription<AuthState> _subscription;

  @override
  void dispose() {
    _subscription.cancel();
    super.dispose();
  }
}
