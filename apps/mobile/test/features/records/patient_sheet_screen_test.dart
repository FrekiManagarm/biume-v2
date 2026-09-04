import 'package:biume_mobile/config/app_palette.dart';
import 'package:biume_mobile/config/app_theme.dart';
import 'package:biume_mobile/core/result.dart';
import 'package:biume_mobile/features/records/domain/owner_repository.dart';
import 'package:biume_mobile/features/records/domain/patient.dart';
import 'package:biume_mobile/features/records/domain/patient_history.dart';
import 'package:biume_mobile/features/records/domain/patient_repository.dart';
import 'package:biume_mobile/features/records/presentation/patient_sheet_cubit.dart';
import 'package:biume_mobile/features/records/presentation/patient_sheet_screen.dart';
import 'package:biume_mobile/features/report/domain/proposal.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'package:mocktail/mocktail.dart';

class MockPatientRepository extends Mock implements PatientRepository {}

class MockOwnerRepository extends Mock implements OwnerRepository {}

const filou = Patient(
  id: 'pet-1',
  ownerId: 'owner-1',
  ownerName: 'Camille Roux',
  name: 'Filou',
  species: 'DOG',
  breed: 'Berger',
);

PatientHistoryEntry entree({
  String appointmentId = 'appt-1',
  DateTime? beginAt,
  String? reportId = 'report-1',
  ReportStatus? reportStatus = ReportStatus.finalized,
  String consultationReason = 'Suivi lombaire',
}) => PatientHistoryEntry(
  appointmentId: appointmentId,
  beginAt: beginAt ?? DateTime(2026, 8, 20),
  reportId: reportId,
  reportStatus: reportStatus,
  consultationReason: consultationReason,
);

void main() {
  setUpAll(() => initializeDateFormatting('fr_FR'));

  late MockPatientRepository patients;
  late MockOwnerRepository owners;

  setUp(() {
    patients = MockPatientRepository();
    owners = MockOwnerRepository();
    when(() => patients.byId('pet-1')).thenAnswer((_) async => filou);
    when(() => patients.history('pet-1')).thenAnswer((_) async => const Success([]));
  });

  /// Construit un routeur minimal autour de l'écran de fiche : les cartes de
  /// séance et le bouton du bas y naviguent réellement, vers des écrans
  /// doublés qui rapportent la route reçue.
  Future<void> monter(WidgetTester tester) async {
    final router = GoRouter(
      initialLocation: '/animaux/pet-1',
      routes: [
        GoRoute(
          path: '/animaux/:patientId',
          builder: (_, state) => BlocProvider(
            create: (_) =>
                PatientSheetCubit(patients, owners)
                  ..load(state.pathParameters['patientId']!),
            child: const PatientSheetScreen(),
          ),
        ),
        GoRoute(
          path: '/comptes-rendus/:reportId',
          builder: (_, state) => Text(
            'compte-rendu-${state.pathParameters['reportId']}'
            '-${state.uri.queryParameters['source']}',
          ),
        ),
        GoRoute(
          path: '/seances/nouvelle',
          builder: (_, state) =>
              Text('nouvelle-seance-${state.uri.queryParameters['animal']}'),
        ),
      ],
    );

    await tester.pumpWidget(
      MaterialApp.router(
        theme: buildAppTheme(AppPalette.light, Brightness.light),
        routerConfig: router,
      ),
    );
    await tester.pump();
    await tester.pump();
  }

  testWidgets(
    "affiche le nom, l'espèce, la race et l'âge dès le cache",
    (tester) async {
      when(() => patients.byId('pet-1')).thenAnswer(
        (_) async => filou.copyWith(birthDate: DateTime(2020, 10, 1)),
      );
      when(() => owners.byId('owner-1')).thenAnswer(
        (_) async => const Owner(id: 'owner-1', name: 'Camille Roux'),
      );

      await tester.binding.setSurfaceSize(const Size(400, 1200));
      final cubit = PatientSheetCubit(
        patients,
        owners,
        now: () => DateTime(2026, 9, 3),
      );
      await tester.pumpWidget(
        MaterialApp(
          theme: buildAppTheme(AppPalette.light, Brightness.light),
          home: BlocProvider.value(
            value: cubit..load('pet-1'),
            child: const PatientSheetScreen(),
          ),
        ),
      );
      await tester.pump();
      await tester.pump();

      expect(find.text('Filou'), findsOneWidget);
      expect(find.textContaining('Chien'), findsOneWidget);
      expect(find.textContaining('Berger'), findsOneWidget);
      expect(find.textContaining('5 ans'), findsOneWidget);
      await tester.binding.setSurfaceSize(null);
    },
  );

  testWidgets("n'affiche aucun champ de saisie de texte libre", (tester) async {
    when(() => owners.byId('owner-1')).thenAnswer(
      (_) async => const Owner(id: 'owner-1', name: 'Camille Roux'),
    );

    await monter(tester);

    expect(find.byType(TextField), findsNothing);
    expect(find.byType(TextFormField), findsNothing);
  });

  group('carte propriétaire', () {
    testWidgets(
      'les boutons Appeler et Écrire sont désactivés sans numéro ni e-mail',
      (tester) async {
        when(() => owners.byId('owner-1')).thenAnswer(
          (_) async => const Owner(id: 'owner-1', name: 'Camille Roux'),
        );

        await monter(tester);

        final appeler = tester.widget<OutlinedButton>(
          find.ancestor(
            of: find.text('Appeler'),
            matching: find.byType(OutlinedButton),
          ),
        );
        final ecrire = tester.widget<OutlinedButton>(
          find.ancestor(
            of: find.text('Écrire'),
            matching: find.byType(OutlinedButton),
          ),
        );

        expect(appeler.onPressed, isNull);
        expect(ecrire.onPressed, isNull);
      },
    );

    testWidgets(
      'les boutons Appeler et Écrire sont actifs quand le propriétaire a un numéro et un e-mail',
      (tester) async {
        when(() => owners.byId('owner-1')).thenAnswer(
          (_) async => const Owner(
            id: 'owner-1',
            name: 'Camille Roux',
            phone: '0600000000',
            email: 'camille@example.org',
            city: 'Lyon',
          ),
        );

        await monter(tester);

        final appeler = tester.widget<OutlinedButton>(
          find.ancestor(
            of: find.text('Appeler'),
            matching: find.byType(OutlinedButton),
          ),
        );
        final ecrire = tester.widget<OutlinedButton>(
          find.ancestor(
            of: find.text('Écrire'),
            matching: find.byType(OutlinedButton),
          ),
        );

        expect(appeler.onPressed, isNotNull);
        expect(ecrire.onPressed, isNotNull);
        expect(find.text('Lyon'), findsOneWidget);
      },
    );
  });

  group('dernières séances', () {
    testWidgets(
      'une séance avec compte rendu envoyé ou finalisé a un chevron et ouvre le compte rendu',
      (tester) async {
        when(() => owners.byId('owner-1')).thenAnswer(
          (_) async => const Owner(id: 'owner-1', name: 'Camille Roux'),
        );
        when(() => patients.history('pet-1')).thenAnswer(
          (_) async => Success([entree(reportStatus: ReportStatus.sent)]),
        );

        await monter(tester);

        expect(find.byIcon(Icons.chevron_right), findsOneWidget);
        expect(find.text('Suivi lombaire'), findsOneWidget);

        await tester.tap(find.byType(ListTile).first);
        await tester.pumpAndSettle();

        expect(find.text('compte-rendu-report-1-fiche'), findsOneWidget);
      },
    );

    testWidgets(
      "une séance sans compte rendu finalisé n'a pas de chevron et ne s'ouvre pas",
      (tester) async {
        when(() => owners.byId('owner-1')).thenAnswer(
          (_) async => const Owner(id: 'owner-1', name: 'Camille Roux'),
        );
        when(() => patients.history('pet-1')).thenAnswer(
          (_) async => Success([entree(reportStatus: ReportStatus.draft)]),
        );

        await monter(tester);

        expect(find.byIcon(Icons.chevron_right), findsNothing);

        final tile = tester.widget<ListTile>(find.byType(ListTile).first);
        expect(tile.onTap, isNull);
      },
    );

    testWidgets('un motif vide affiche « Sans motif »', (tester) async {
      when(() => owners.byId('owner-1')).thenAnswer(
        (_) async => const Owner(id: 'owner-1', name: 'Camille Roux'),
      );
      when(() => patients.history('pet-1')).thenAnswer(
        (_) async => Success([entree(consultationReason: '')]),
      );

      await monter(tester);

      expect(find.text('Sans motif'), findsOneWidget);
    });
  });

  testWidgets(
    '« Prendre une séance » ouvre la création préremplie pour cet animal',
    (tester) async {
      when(() => owners.byId('owner-1')).thenAnswer(
        (_) async => const Owner(id: 'owner-1', name: 'Camille Roux'),
      );

      await monter(tester);

      await tester.tap(find.widgetWithText(FilledButton, 'Prendre une séance'));
      await tester.pumpAndSettle();

      expect(find.text('nouvelle-seance-pet-1'), findsOneWidget);
    },
  );

  testWidgets(
    "dit la fiche introuvable quand l'animal n'a jamais été mis en cache",
    (tester) async {
      when(() => patients.byId('pet-1')).thenAnswer((_) async => null);

      await monter(tester);

      expect(find.textContaining('Connectez-vous une fois au réseau'), findsOneWidget);
    },
  );
}
