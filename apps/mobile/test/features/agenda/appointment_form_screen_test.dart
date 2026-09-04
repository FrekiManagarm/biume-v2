import 'package:biume_mobile/core/failure.dart';
import 'package:biume_mobile/core/result.dart';
import 'package:biume_mobile/features/agenda/domain/appointment.dart';
import 'package:biume_mobile/features/agenda/domain/appointment_write_repository.dart';
import 'package:biume_mobile/features/agenda/presentation/appointment_form_cubit.dart';
import 'package:biume_mobile/features/agenda/presentation/appointment_form_screen.dart';
import 'package:biume_mobile/features/records/domain/patient.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';
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
  endAt: endAt ?? DateTime(2026, 9, 5, 10),
  status: 'CONFIRMED',
);

/// Un routeur minimal, avec un accueil sous la séance : `context.pop()`, à la
/// fin du parcours, doit trouver quelque chose à quitter — exactement comme
/// une navigation réelle depuis l'accueil ou une carte d'agenda.
Future<void> ouvrirLEcran(
  WidgetTester tester,
  MockAppointmentWriteRepository repository, {
  Appointment? existing,
  Patient? initialPatient,
  VoidCallback? onDicter,
  VoidCallback? onForegroundRefresh,
}) async {
  final cible = existing == null
      ? '/seances/nouvelle'
      : '/seances/${existing.id}/deplacer';

  final router = GoRouter(
    initialLocation: '/',
    routes: [
      GoRoute(
        path: '/',
        builder: (context, _) {
          return Scaffold(
            body: ElevatedButton(
              onPressed: () => context.push(cible),
              child: const Text('ouvrir'),
            ),
          );
        },
      ),
      GoRoute(
        path: '/dicter',
        builder: (_, _) {
          onDicter?.call();
          return const SizedBox.shrink();
        },
      ),
      GoRoute(
        path: '/animaux/choisir',
        builder: (context, _) => Scaffold(
          body: ListTile(
            title: const Text('Filou'),
            onTap: () => context.pop(filou),
          ),
        ),
      ),
      GoRoute(
        path: existing == null ? '/seances/nouvelle' : '/seances/:id/deplacer',
        builder: (_, _) => BlocProvider(
          create: (_) => AppointmentFormCubit(
            repository,
            existing: existing,
            initialPatient: initialPatient,
            now: () => DateTime(2026, 9, 3, 9),
          )..start(),
          child: AppointmentFormScreen(
            onForegroundRefresh: () async {
              onForegroundRefresh?.call();
            },
          ),
        ),
      ),
    ],
  );

  await tester.pumpWidget(MaterialApp.router(routerConfig: router));
  await tester.pump();
  await tester.tap(find.text('ouvrir'));
  await tester.pumpAndSettle();
}

void main() {
  late MockAppointmentWriteRepository repository;

  setUpAll(() => initializeDateFormatting('fr_FR'));

  setUp(() {
    repository = MockAppointmentWriteRepository();
    when(
      () => repository.defaultDuration(),
    ).thenAnswer((_) async => const Duration(hours: 1));
    registerFallbackValue(DateTime(2026));
  });

  testWidgets('création : affiche les cinq champs, animal non choisi', (
    tester,
  ) async {
    await ouvrirLEcran(tester, repository);

    expect(find.text('Nouvelle séance'), findsOneWidget);
    expect(find.text('Choisir un animal'), findsOneWidget);
    expect(find.text('Jour'), findsOneWidget);
    expect(find.text('Heure'), findsOneWidget);
    expect(find.text('Durée'), findsOneWidget);
    expect(find.widgetWithText(SwitchListTile, 'À domicile'), findsOneWidget);
    expect(
      find.widgetWithText(FilledButton, 'Prendre la séance'),
      findsOneWidget,
    );
  });

  testWidgets(
    'déplacement : masque animal, durée et lieu, conserve le libellé',
    (tester) async {
      await ouvrirLEcran(
        tester,
        repository,
        existing: rdv(
          beginAt: DateTime(2026, 9, 5, 9),
          endAt: DateTime(2026, 9, 5, 10, 30),
        ),
      );

      expect(find.text('Déplacer la séance'), findsNWidgets(2));
      expect(find.text('Choisir un animal'), findsNothing);
      expect(find.text('Durée'), findsNothing);
      expect(find.byType(SwitchListTile), findsNothing);
      expect(find.text('Jour'), findsOneWidget);
      expect(find.text('Heure'), findsOneWidget);
    },
  );

  testWidgets('soumettre sans animal choisi affiche le message, sans appel', (
    tester,
  ) async {
    await ouvrirLEcran(tester, repository);

    await tester.tap(find.widgetWithText(FilledButton, 'Prendre la séance'));
    await tester.pump();

    expect(find.text('Choisissez un animal.'), findsOneWidget);
    verifyNever(
      () => repository.create(
        patientId: any(named: 'patientId'),
        beginAt: any(named: 'beginAt'),
        endAt: any(named: 'endAt'),
        atHome: any(named: 'atHome'),
      ),
    );
  });

  testWidgets('choisir un animal renseigne le champ « Animal »', (
    tester,
  ) async {
    await ouvrirLEcran(tester, repository);

    await tester.tap(find.text('Choisir un animal'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Filou'));
    await tester.pumpAndSettle();

    expect(find.text('Filou'), findsOneWidget);
    expect(find.text('Chien · Camille Roux'), findsOneWidget);
  });

  testWidgets(
    'création réussie avec conflit : bannière après écriture puis Terminé',
    (tester) async {
      when(
        () => repository.create(
          patientId: 'pet-1',
          beginAt: any(named: 'beginAt'),
          endAt: any(named: 'endAt'),
          atHome: any(named: 'atHome'),
        ),
      ).thenAnswer(
        (_) async => Success(
          AppointmentWriteOutcome(
            appointmentId: 'a-1',
            reportId: 'r-1',
            conflicts: [
              AppointmentConflict(
                appointmentId: 'a-2',
                beginAt: DateTime(2026, 9, 3, 14),
                patientName: 'Rex',
              ),
            ],
          ),
        ),
      );
      await ouvrirLEcran(tester, repository, initialPatient: filou);

      // Aucun conflit n'est visible avant l'écriture.
      expect(find.textContaining('Chevauche'), findsNothing);

      await tester.tap(find.widgetWithText(FilledButton, 'Prendre la séance'));
      await tester.pumpAndSettle();

      expect(find.text('La séance est prise.'), findsOneWidget);
      expect(
        find.text('Chevauche la séance de Rex à 14:00.'),
        findsOneWidget,
      );
      expect(find.text('La séance est prise quand même.'), findsOneWidget);

      await tester.tap(find.widgetWithText(FilledButton, 'Terminé'));
      await tester.pumpAndSettle();

      expect(find.widgetWithText(ElevatedButton, 'ouvrir'), findsOneWidget);
    },
  );

  testWidgets(
    'hors ligne : le message franc et le geste de repli « Dicter »',
    (tester) async {
      when(
        () => repository.create(
          patientId: 'pet-1',
          beginAt: any(named: 'beginAt'),
          endAt: any(named: 'endAt'),
          atHome: any(named: 'atHome'),
        ),
      ).thenAnswer((_) async => const Err(NetworkFailure()));
      var dicterAtteint = false;

      await ouvrirLEcran(
        tester,
        repository,
        initialPatient: filou,
        onDicter: () => dicterAtteint = true,
      );

      await tester.tap(find.widgetWithText(FilledButton, 'Prendre la séance'));
      await tester.pumpAndSettle();

      expect(find.text(appointmentOfflineCreateMessage), findsOneWidget);
      final dicterButton = find.widgetWithText(OutlinedButton, 'Dicter');
      expect(dicterButton, findsOneWidget);

      await tester.tap(dicterButton);
      await tester.pumpAndSettle();

      expect(dicterAtteint, isTrue);
    },
  );

  testWidgets('déplacement réussi appelle move et affiche la confirmation', (
    tester,
  ) async {
    when(
      () => repository.move(
        'appointment-1',
        beginAt: any(named: 'beginAt'),
        endAt: any(named: 'endAt'),
      ),
    ).thenAnswer(
      (_) async =>
          const Success(AppointmentWriteOutcome(appointmentId: 'appointment-1', conflicts: [])),
    );

    await ouvrirLEcran(tester, repository, existing: rdv());

    await tester.tap(find.widgetWithText(FilledButton, 'Déplacer la séance'));
    await tester.pumpAndSettle();

    expect(find.text('La séance est déplacée.'), findsOneWidget);
    verify(
      () => repository.move(
        'appointment-1',
        beginAt: any(named: 'beginAt'),
        endAt: any(named: 'endAt'),
      ),
    ).called(1);
  });
}
