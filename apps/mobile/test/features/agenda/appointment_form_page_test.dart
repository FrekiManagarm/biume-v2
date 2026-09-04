import 'package:biume_mobile/features/agenda/domain/appointment_write_repository.dart';
import 'package:biume_mobile/features/agenda/presentation/appointment_form_screen.dart';
import 'package:biume_mobile/features/records/domain/patient.dart';
import 'package:biume_mobile/features/records/domain/patient_repository.dart';
import 'package:biume_mobile/injection_container.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'package:mocktail/mocktail.dart';

class MockPatientRepository extends Mock implements PatientRepository {}

class MockAppointmentWriteRepository extends Mock
    implements AppointmentWriteRepository {}

const filou = Patient(
  id: 'pet-1',
  ownerId: 'owner-1',
  ownerName: 'Camille Roux',
  name: 'Filou',
  species: 'DOG',
);

/// Verrouille le contrat de `/seances/nouvelle?animal=<id>` : câblé par une
/// tâche précédente (le préremplissage résout l'identifiant contre le cache
/// local dans `AppointmentFormPage`), mais jamais exercé faute d'appelant
/// réel. Cette tâche en devient le premier — la route ne doit plus jamais
/// casser sans qu'un test ne le voie.
void main() {
  late MockPatientRepository patients;
  late MockAppointmentWriteRepository writes;

  setUpAll(() => initializeDateFormatting('fr_FR'));

  setUp(() {
    patients = MockPatientRepository();
    writes = MockAppointmentWriteRepository();

    when(() => patients.watchAll()).thenAnswer((_) => Stream.value([filou]));
    when(
      () => writes.defaultDuration(),
    ).thenAnswer((_) async => const Duration(hours: 1));

    getIt
      ..registerLazySingleton<PatientRepository>(() => patients)
      ..registerLazySingleton<AppointmentWriteRepository>(() => writes);
  });

  tearDown(() async {
    await getIt.reset();
  });

  Future<void> monter(WidgetTester tester) async {
    final router = GoRouter(
      initialLocation: '/',
      routes: [
        GoRoute(
          path: '/',
          builder: (context, _) => Scaffold(
            body: ElevatedButton(
              onPressed: () =>
                  context.push('/seances/nouvelle?animal=pet-1'),
              child: const Text('ouvrir'),
            ),
          ),
        ),
        GoRoute(
          path: '/seances/nouvelle',
          builder: (_, state) => AppointmentFormPage(
            patientId: state.uri.queryParameters['animal'],
          ),
        ),
        GoRoute(
          path: '/animaux/choisir',
          builder: (_, _) => const SizedBox.shrink(),
        ),
      ],
    );

    await tester.pumpWidget(MaterialApp.router(routerConfig: router));
    await tester.tap(find.text('ouvrir'));
    await tester.pumpAndSettle();
  }

  testWidgets(
    'la route reçoit l\'identifiant et l\'écran affiche le bon animal',
    (tester) async {
      await monter(tester);

      expect(find.text('Filou'), findsOneWidget);
      expect(find.text('Chien · Camille Roux'), findsOneWidget);
    },
  );
}
