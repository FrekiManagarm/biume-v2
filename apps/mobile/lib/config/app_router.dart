import 'dart:async';

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../features/agenda/domain/appointment.dart';
import '../features/agenda/presentation/appointment_form_screen.dart';
import '../features/auth/presentation/auth_cubit.dart';
import '../features/auth/presentation/choose_company_screen.dart';
import '../features/auth/presentation/sign_in_screen.dart';
import '../features/capture/presentation/recording_page.dart';
import '../features/followup/presentation/follow_up_schedule_page.dart';
import '../features/home/presentation/home_screen.dart';
import '../features/records/presentation/new_client_screen.dart';
import '../features/records/presentation/patient_picker_screen.dart';
import '../features/report/presentation/report_screen.dart';
import '../features/transcript/presentation/transcript_page.dart';

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
        AuthAuthenticated() => switch (path) {
          '/connexion' => '/',
          // Une navigation volontaire vers `/entreprise` (le menu du compte,
          // via `context.push('/entreprise', extra: 'volontaire')`) doit
          // passer : seule une arrivée directe sur cette route sans ce
          // marqueur est renvoyée à l'accueil.
          '/entreprise' => state.extra == 'volontaire' ? null : '/',
          _ => null,
        },
      };
    },
    routes: [
      GoRoute(path: '/', builder: (_, _) => const HomeScreen()),
      GoRoute(path: '/connexion', builder: (_, _) => const SignInScreen()),
      GoRoute(
        path: '/entreprise',
        builder: (_, _) => const ChooseCompanyScreen(),
      ),
      GoRoute(
        path: '/dicter',
        builder: (_, state) =>
            RecordingPage(appointmentId: state.uri.queryParameters['rdv']),
      ),
      GoRoute(
        path: '/animaux/choisir',
        builder: (_, _) => const PatientPickerPage(),
      ),
      GoRoute(
        path: '/clients/nouveau',
        builder: (_, state) => NewClientPage(
          existingOwnerId: state.uri.queryParameters['proprietaire'],
        ),
      ),
      GoRoute(
        path: '/seances/nouvelle',
        builder: (_, state) => AppointmentFormPage(
          patientId: state.uri.queryParameters['animal'],
        ),
      ),
      GoRoute(
        path: '/seances/:appointmentId/deplacer',
        builder: (_, state) {
          final appointment = state.extra as Appointment?;
          if (appointment == null) {
            // Arrivée sans la séance à déplacer — un lien direct malformé,
            // jamais produit par la navigation interne de l'application.
            return const Scaffold(
              body: Center(child: Text('Séance introuvable.')),
            );
          }
          return AppointmentFormPage(existing: appointment);
        },
      ),
      GoRoute(
        path: '/dictees/:captureId/transcription',
        builder: (_, state) => TranscriptPage(
          captureId: state.pathParameters['captureId']!,
          needsPatient: state.uri.queryParameters['rattacher'] == '1',
          appointmentId: state.uri.queryParameters['rdv'],
        ),
      ),
      GoRoute(
        path: '/comptes-rendus/:reportId',
        builder: (_, state) =>
            ReportPage(reportId: state.pathParameters['reportId']!),
      ),
      GoRoute(
        path: '/comptes-rendus/:reportId/suivi',
        builder: (_, state) => FollowUpSchedulePage(
          reportId: state.pathParameters['reportId']!,
          captureId: state.uri.queryParameters['capture'],
        ),
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
