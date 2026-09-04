import 'package:biume_mobile/core/result.dart';
import 'package:biume_mobile/features/agenda/domain/agenda_repository.dart';
import 'package:biume_mobile/features/agenda/domain/appointment.dart';
import 'package:biume_mobile/features/auth/domain/auth_repository.dart';
import 'package:biume_mobile/features/auth/domain/session.dart';
import 'package:biume_mobile/features/auth/presentation/auth_cubit.dart';
import 'package:biume_mobile/features/auth/presentation/choose_company_screen.dart';
import 'package:biume_mobile/features/capture/domain/capture_store.dart';
import 'package:biume_mobile/features/home/presentation/home_screen.dart';
import 'package:biume_mobile/features/todo/domain/todo_api.dart';
import 'package:biume_mobile/features/todo/domain/todo_item.dart';
import 'package:biume_mobile/injection_container.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'package:mocktail/mocktail.dart';

class MockCaptureStore extends Mock implements CaptureStore {}

class MockTodoApi extends Mock implements TodoApi {}

class MockAgendaRepository extends Mock implements AgendaRepository {}

class MockAuthRepository extends Mock implements AuthRepository {}

void main() {
  late MockCaptureStore store;
  late MockTodoApi todoApi;
  late MockAgendaRepository agendaRepository;
  late MockAuthRepository authRepository;

  // `AgendaBody` formate les en-têtes de jour avec `DateFormat('fr_FR')`,
  // que seul `main()` initialise en production. Les tests widgets ne passent
  // pas par `main()` : sans cet appel, chaque en-tête de jour plante.
  setUpAll(() => initializeDateFormatting('fr_FR'));

  setUp(() {
    store = MockCaptureStore();
    todoApi = MockTodoApi();
    agendaRepository = MockAgendaRepository();
    authRepository = MockAuthRepository();

    registerFallbackValue(DateTime(2026, 9, 3));

    when(() => store.watchAll()).thenAnswer((_) => const Stream.empty());
    when(() => todoApi.list())
        .thenAnswer((_) async => const Success(<TodoItem>[]));
    when(() => agendaRepository.watchWindow(any(), any()))
        .thenAnswer((_) => Stream.value(const []));
    when(() => agendaRepository.refreshWindow(any(), any()))
        .thenAnswer((_) async => const Success(null));
    when(() => authRepository.signOut()).thenAnswer((_) async {});

    getIt
      ..registerLazySingleton<CaptureStore>(() => store)
      ..registerLazySingleton<TodoApi>(() => todoApi)
      ..registerLazySingleton<AgendaRepository>(() => agendaRepository)
      // `ChooseCompanyScreen` va chercher son dépôt directement dans le
      // conteneur (comme le fait le vrai routeur) : il faut donc l'y
      // enregistrer pour le test d'aller-retour, même quand les deux autres
      // tests ne le sollicitent jamais.
      ..registerLazySingleton<AuthRepository>(() => authRepository);
  });

  tearDown(() async {
    await getIt.reset();
  });

  /// Construit l'application autour de `HomeScreen`, avec un routeur minimal
  /// et les dépendances de `getIt` doublées — c'est l'écran d'accueil réel,
  /// pas une reconstruction, qui va chercher ses cubits dans le conteneur.
  /// `/entreprise` pointe vers le vrai `ChooseCompanyScreen`, pas une
  /// doublure : c'est lui qui doit ramener à l'accueil une fois le choix
  /// fait, pas la garde du routeur (absente ici, volontairement — le retour
  /// ne doit rien lui devoir).
  Future<void> monter(WidgetTester tester) async {
    final router = GoRouter(
      initialLocation: '/',
      routes: [
        GoRoute(path: '/', builder: (_, _) => const HomeScreen()),
        GoRoute(
          path: '/entreprise',
          builder: (_, _) => const ChooseCompanyScreen(),
        ),
        GoRoute(path: '/dicter', builder: (_, _) => const SizedBox.shrink()),
        GoRoute(
          path: '/seances/nouvelle',
          builder: (_, _) => const Text('nouvelle-seance'),
        ),
        GoRoute(
          path: '/clients/nouveau',
          builder: (_, _) => const Text('nouveau-client'),
        ),
        GoRoute(
          path: '/seances/:appointmentId/deplacer',
          builder: (_, state) {
            final appointment = state.extra as Appointment?;
            return Text('deplacer-${appointment?.id}');
          },
        ),
      ],
    );

    await tester.pumpWidget(
      BlocProvider(
        create: (_) => AuthCubit(authRepository, clearReadCache: () async {}),
        child: MaterialApp.router(routerConfig: router),
      ),
    );
    await tester.pump();
    await tester.pump();
  }

  testWidgets('empile À traiter puis l\'agenda, avec Dicter seul en bas', (
    tester,
  ) async {
    await monter(tester);

    expect(find.text('À traiter'), findsOneWidget);
    expect(find.text('Vos séances'), findsOneWidget);
    expect(find.widgetWithText(FloatingActionButton, 'Dicter'), findsOneWidget);
    expect(find.byType(BottomNavigationBar), findsNothing);
  });

  testWidgets(
    'le menu du compte propose de changer d\'entreprise et de se déconnecter',
    (tester) async {
      await monter(tester);

      await tester.tap(find.byTooltip('Compte'));
      await tester.pumpAndSettle();

      expect(find.text("Changer d'entreprise"), findsOneWidget);
      expect(find.text('Se déconnecter'), findsOneWidget);
    },
  );

  testWidgets(
    "changer d'entreprise ramène à l'accueil une fois le choix fait",
    (tester) async {
      const autreCabinet = Company(id: 'org-2', name: 'Autre cabinet');
      when(() => authRepository.listCompanies())
          .thenAnswer((_) async => const Success([autreCabinet]));
      when(() => authRepository.setActiveCompany('org-2')).thenAnswer(
        (_) async => const Success(
          PractitionerSession(userId: 'user-1', company: autreCabinet),
        ),
      );

      await monter(tester);

      await tester.tap(find.byTooltip('Compte'));
      await tester.pumpAndSettle();
      await tester.tap(find.text("Changer d'entreprise"));
      // Pas de `pumpAndSettle` : l'indicateur de chargement du `FutureBuilder`
      // tourne indéfiniment tant qu'on n'a pas laissé sa `Future` se résoudre
      // par quelques passes explicites.
      await tester.pump();
      await tester.pump();
      await tester.pump();

      expect(find.text('Votre entreprise'), findsOneWidget);
      expect(find.text('Autre cabinet'), findsOneWidget);

      await tester.tap(find.text('Autre cabinet'));
      await tester.pump();
      await tester.pump();
      await tester.pump();

      // De retour à l'accueil : ni bloqué sur « Votre entreprise », ni sur un
      // écran intermédiaire.
      expect(find.text('Votre entreprise'), findsNothing);
      expect(find.text('À traiter'), findsOneWidget);
      expect(find.text('Vos séances'), findsOneWidget);
    },
  );

  testWidgets('le menu « + » propose « Nouvelle séance » et y navigue', (
    tester,
  ) async {
    await monter(tester);

    await tester.tap(find.byTooltip('Ajouter'));
    await tester.pumpAndSettle();
    expect(find.text('Nouvelle séance'), findsOneWidget);

    await tester.tap(find.text('Nouvelle séance'));
    await tester.pumpAndSettle();

    expect(find.text('nouvelle-seance'), findsOneWidget);
  });

  testWidgets('le menu « + » propose aussi « Nouveau client » et y navigue', (
    tester,
  ) async {
    await monter(tester);

    await tester.tap(find.byTooltip('Ajouter'));
    await tester.pumpAndSettle();
    expect(find.text('Nouveau client'), findsOneWidget);

    await tester.tap(find.text('Nouveau client'));
    await tester.pumpAndSettle();

    expect(find.text('nouveau-client'), findsOneWidget);
  });

  testWidgets(
    'une carte de séance propose de la déplacer, avec la séance en extra',
    (tester) async {
      final appointment = Appointment(
        id: 'appointment-1',
        patientId: 'pet-1',
        patientName: 'Filou',
        species: 'DOG',
        beginAt: DateTime.now().add(const Duration(hours: 2)),
        endAt: DateTime.now().add(const Duration(hours: 3)),
        status: 'CONFIRMED',
      );
      when(() => agendaRepository.watchWindow(any(), any()))
          .thenAnswer((_) => Stream.value([appointment]));

      await monter(tester);
      await tester.pump();

      await tester.tap(find.byTooltip('Options'));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Déplacer'));
      await tester.pumpAndSettle();

      expect(find.text('deplacer-appointment-1'), findsOneWidget);
    },
  );
}
