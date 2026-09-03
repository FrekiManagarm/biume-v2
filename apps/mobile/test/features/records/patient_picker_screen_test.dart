import 'package:biume_mobile/features/records/domain/patient.dart';
import 'package:biume_mobile/features/records/domain/patient_repository.dart';
import 'package:biume_mobile/features/records/presentation/patient_picker_cubit.dart';
import 'package:biume_mobile/features/records/presentation/patient_picker_screen.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';
import 'package:mocktail/mocktail.dart';

class MockPatientRepository extends Mock implements PatientRepository {}

const filou = Patient(
  id: 'patient-1',
  ownerId: 'owner-1',
  ownerName: 'Camille Roux',
  name: 'Filou',
  species: 'DOG',
);

const rex = Patient(
  id: 'patient-2',
  ownerId: 'owner-2',
  ownerName: 'Jean Martin',
  name: 'Rex',
  species: 'CAT',
);

/// Capture le résultat du push pour l'appelant, sans bloquer le test sur son
/// achèvement : l'écran choisi le renvoie plus tard, via `context.pop`.
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
            resultat = await context.push<Patient>('/animaux/choisir');
          },
          child: const Text('ouvrir'),
        ),
      ),
    );
  }
}

/// Construit l'application, ouvre le sélecteur et laisse le cache se
/// propager. Le test appelant garde la main pour interagir avec l'écran.
Future<void> ouvrirLeSelecteur(
  WidgetTester tester,
  MockPatientRepository repository,
) async {
  final router = GoRouter(
    initialLocation: '/',
    routes: [
      GoRoute(path: '/', builder: (_, _) => const _Appelant()),
      GoRoute(
        path: '/animaux/choisir',
        builder: (context, state) => BlocProvider(
          create: (_) => PatientPickerCubit(repository)..start(),
          child: const PatientPickerScreen(),
        ),
      ),
    ],
  );

  await tester.pumpWidget(MaterialApp.router(routerConfig: router));
  await tester.tap(find.text('ouvrir'));
  await tester.pumpAndSettle();
  // Laisse le flux du cache livrer sa première valeur.
  await tester.pump();
  await tester.pump();
}

void main() {
  late MockPatientRepository repository;

  setUp(() {
    repository = MockPatientRepository();
  });

  testWidgets('taper « rex » dans le champ ne laisse qu\'une ligne', (
    tester,
  ) async {
    when(() => repository.watchAll())
        .thenAnswer((_) => Stream.value([filou, rex]));

    await ouvrirLeSelecteur(tester, repository);

    expect(find.text('Filou'), findsOneWidget);
    expect(find.text('Rex'), findsOneWidget);

    await tester.enterText(find.byType(TextField), 'rex');
    await tester.pump();

    expect(find.text('Filou'), findsNothing);
    expect(find.text('Rex'), findsOneWidget);
  });

  testWidgets('taper la ligne renvoie l\'animal choisi à l\'appelant', (
    tester,
  ) async {
    when(() => repository.watchAll())
        .thenAnswer((_) => Stream.value([filou, rex]));

    await ouvrirLeSelecteur(tester, repository);

    await tester.tap(find.text('Rex'));
    await tester.pumpAndSettle();

    final appelant = tester.state<_AppelantState>(find.byType(_Appelant));
    expect(appelant.resultat, equals(rex));
  });

  testWidgets(
    'dit de se connecter une fois au réseau quand le cache est vide',
    (tester) async {
      when(() => repository.watchAll())
          .thenAnswer((_) => Stream.value(const []));

      await ouvrirLeSelecteur(tester, repository);

      expect(
        find.textContaining('Connectez-vous une fois au réseau'),
        findsOneWidget,
      );
    },
  );
}
