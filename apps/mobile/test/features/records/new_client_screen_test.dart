import 'package:biume_mobile/core/failure.dart';
import 'package:biume_mobile/core/result.dart';
import 'package:biume_mobile/features/records/domain/owner_repository.dart';
import 'package:biume_mobile/features/records/domain/patient.dart';
import 'package:biume_mobile/features/records/domain/patient_repository.dart';
import 'package:biume_mobile/features/records/presentation/new_client_cubit.dart';
import 'package:biume_mobile/features/records/presentation/new_client_screen.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';
import 'package:mocktail/mocktail.dart';

class MockOwnerRepository extends Mock implements OwnerRepository {}

class MockPatientRepository extends Mock implements PatientRepository {}

const camille = Owner(id: 'owner-1', name: 'Camille Roux');

const filou = Patient(
  id: 'pet-1',
  ownerId: 'owner-1',
  ownerName: 'Camille Roux',
  name: 'Filou',
  species: 'DOG',
);

/// Capture le résultat du push pour l'appelant, sans bloquer le test sur son
/// achèvement : l'écran le renvoie plus tard, via `context.pop`.
class _Appelant extends StatefulWidget {
  const _Appelant();

  @override
  State<_Appelant> createState() => _AppelantState();
}

class _AppelantState extends State<_Appelant> {
  Patient? resultat;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: ElevatedButton(
          onPressed: () async {
            resultat = await context.push<Patient>('/clients/nouveau');
          },
          child: const Text('ouvrir'),
        ),
      ),
    );
  }
}

Future<void> ouvrirLEcran(
  WidgetTester tester,
  MockOwnerRepository owners,
  MockPatientRepository patients, {
  String? existingOwnerId,
}) async {
  final router = GoRouter(
    initialLocation: '/',
    routes: [
      GoRoute(path: '/', builder: (_, _) => const _Appelant()),
      GoRoute(
        path: '/dicter',
        builder: (_, _) => const Scaffold(body: Text('dicter')),
      ),
      GoRoute(
        path: '/clients/nouveau',
        builder: (_, _) => BlocProvider(
          create: (_) => NewClientCubit(
            owners,
            patients,
            existingOwnerId: existingOwnerId,
          ),
          child: const NewClientScreen(),
        ),
      ),
    ],
  );

  await tester.pumpWidget(MaterialApp.router(routerConfig: router));
  await tester.tap(find.text('ouvrir'));
  await tester.pumpAndSettle();
}

void main() {
  late MockOwnerRepository owners;
  late MockPatientRepository patients;

  setUp(() {
    owners = MockOwnerRepository();
    patients = MockPatientRepository();
  });

  testWidgets(
    'le volet propriétaire montre le champ e-mail et sa mention insistante',
    (tester) async {
      await ouvrirLEcran(tester, owners, patients);

      expect(find.text('Nom'), findsOneWidget);
      expect(find.widgetWithText(TextField, 'E-mail'), findsOneWidget);
      expect(
        find.textContaining(
          'Sans e-mail, vous ne pourrez pas lui envoyer le compte rendu',
        ),
        findsOneWidget,
      );
      expect(find.widgetWithText(FilledButton, 'Continuer'), findsOneWidget);
    },
  );

  testWidgets('on peut passer au volet animal sans e-mail', (tester) async {
    when(
      () => owners.create(
        name: 'Camille Roux',
        email: null,
        phone: null,
        city: null,
      ),
    ).thenAnswer((_) async => const Success(camille));

    await ouvrirLEcran(tester, owners, patients);

    await tester.enterText(find.widgetWithText(TextField, 'Nom'), 'Camille Roux');
    await tester.tap(find.widgetWithText(FilledButton, 'Continuer'));
    await tester.pumpAndSettle();

    verify(
      () => owners.create(
        name: 'Camille Roux',
        email: null,
        phone: null,
        city: null,
      ),
    ).called(1);
    expect(find.widgetWithText(FilledButton, 'Créer'), findsOneWidget);
  });

  testWidgets('le volet animal offre les sept espèces', (tester) async {
    when(
      () => owners.create(
        name: 'Camille Roux',
        email: null,
        phone: null,
        city: null,
      ),
    ).thenAnswer((_) async => const Success(camille));

    await ouvrirLEcran(tester, owners, patients);

    await tester.enterText(find.widgetWithText(TextField, 'Nom'), 'Camille Roux');
    await tester.tap(find.widgetWithText(FilledButton, 'Continuer'));
    await tester.pumpAndSettle();

    await tester.tap(find.byType(DropdownButtonFormField<String>));
    await tester.pumpAndSettle();

    for (final label in speciesLabels.values) {
      expect(find.text(label), findsWidgets);
    }
  });

  testWidgets(
    'un nom vide n\'envoie rien et affiche le message',
    (tester) async {
      await ouvrirLEcran(tester, owners, patients);

      await tester.tap(find.widgetWithText(FilledButton, 'Continuer'));
      await tester.pump();

      expect(find.text('Le nom est obligatoire.'), findsOneWidget);
      verifyNever(
        () => owners.create(
          name: any(named: 'name'),
          email: any(named: 'email'),
          phone: any(named: 'phone'),
          city: any(named: 'city'),
        ),
      );
    },
  );

  testWidgets(
    'crée le propriétaire puis l\'animal et renvoie l\'animal créé',
    (tester) async {
      when(
        () => owners.create(
          name: 'Camille Roux',
          email: null,
          phone: null,
          city: null,
        ),
      ).thenAnswer((_) async => const Success(camille));
      when(
        () => owners.createPatient(
          ownerId: 'owner-1',
          name: 'Filou',
          species: 'DOG',
          breed: null,
          birthDate: null,
        ),
      ).thenAnswer((_) async => const Success(filou));
      when(() => patients.refresh()).thenAnswer((_) async => const Success(null));

      await ouvrirLEcran(tester, owners, patients);

      await tester.enterText(
        find.widgetWithText(TextField, 'Nom'),
        'Camille Roux',
      );
      await tester.tap(find.widgetWithText(FilledButton, 'Continuer'));
      await tester.pumpAndSettle();

      await tester.enterText(find.widgetWithText(TextField, 'Nom'), 'Filou');
      await tester.tap(find.widgetWithText(FilledButton, 'Créer'));
      await tester.pumpAndSettle();

      verify(() => patients.refresh()).called(1);

      final appelant = tester.state<_AppelantState>(find.byType(_Appelant));
      expect(appelant.resultat, equals(filou));
    },
  );

  testWidgets(
    'avec un propriétaire déjà fourni, le volet animal s\'affiche directement',
    (tester) async {
      await ouvrirLEcran(
        tester,
        owners,
        patients,
        existingOwnerId: 'owner-1',
      );

      expect(find.widgetWithText(FilledButton, 'Créer'), findsOneWidget);
      expect(find.widgetWithText(FilledButton, 'Continuer'), findsNothing);
    },
  );

  testWidgets(
    'hors ligne : le message franc et le geste de repli « Dicter »',
    (tester) async {
      when(
        () => owners.create(
          name: 'Camille Roux',
          email: null,
          phone: null,
          city: null,
        ),
      ).thenAnswer((_) async => const Err(NetworkFailure()));

      await ouvrirLEcran(tester, owners, patients);

      await tester.enterText(
        find.widgetWithText(TextField, 'Nom'),
        'Camille Roux',
      );
      await tester.tap(find.widgetWithText(FilledButton, 'Continuer'));
      await tester.pumpAndSettle();

      expect(find.text(newClientOfflineMessage), findsOneWidget);
      final dicterButton = find.widgetWithText(OutlinedButton, 'Dicter');
      expect(dicterButton, findsOneWidget);

      await tester.tap(dicterButton);
      await tester.pumpAndSettle();

      expect(find.text('dicter'), findsOneWidget);
    },
  );
}
