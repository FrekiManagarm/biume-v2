import 'package:biume_mobile/core/result.dart';
import 'package:biume_mobile/features/agenda/domain/agenda_repository.dart';
import 'package:biume_mobile/features/auth/domain/auth_repository.dart';
import 'package:biume_mobile/features/auth/presentation/auth_cubit.dart';
import 'package:biume_mobile/features/capture/domain/capture_store.dart';
import 'package:biume_mobile/features/home/presentation/home_screen.dart';
import 'package:biume_mobile/features/todo/domain/todo_api.dart';
import 'package:biume_mobile/features/todo/domain/todo_item.dart';
import 'package:biume_mobile/injection_container.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';
import 'package:mocktail/mocktail.dart';

class MockCaptureStore extends Mock implements CaptureStore {}

class MockTodoApi extends Mock implements TodoApi {}

class MockAgendaRepository extends Mock implements AgendaRepository {}

class MockAuthRepository extends Mock implements AuthRepository {}

/// Construit l'application autour de `HomeScreen`, avec un routeur minimal et
/// les dépendances de `getIt` doublées — c'est l'écran d'accueil réel, pas une
/// reconstruction, qui va chercher ses cubits dans le conteneur.
Future<void> monter(WidgetTester tester) async {
  final store = MockCaptureStore();
  final todoApi = MockTodoApi();
  final agendaRepository = MockAgendaRepository();
  final authRepository = MockAuthRepository();

  when(() => store.watchAll()).thenAnswer((_) => const Stream.empty());
  when(
    () => todoApi.list(),
  ).thenAnswer((_) async => const Success(<TodoItem>[]));
  when(
    () => agendaRepository.watchDay(any()),
  ).thenAnswer((_) => Stream.value(const []));
  when(
    () => agendaRepository.refresh(any()),
  ).thenAnswer((_) async => const Success(null));
  when(() => authRepository.signOut()).thenAnswer((_) async {});

  getIt
    ..registerLazySingleton<CaptureStore>(() => store)
    ..registerLazySingleton<TodoApi>(() => todoApi)
    ..registerLazySingleton<AgendaRepository>(() => agendaRepository);

  final router = GoRouter(
    initialLocation: '/',
    routes: [
      GoRoute(path: '/', builder: (_, _) => const HomeScreen()),
      GoRoute(path: '/entreprise', builder: (_, _) => const SizedBox.shrink()),
      GoRoute(path: '/dicter', builder: (_, _) => const SizedBox.shrink()),
    ],
  );

  await tester.pumpWidget(
    BlocProvider(
      create: (_) => AuthCubit(authRepository),
      child: MaterialApp.router(routerConfig: router),
    ),
  );
  await tester.pump();
  await tester.pump();
}

void main() {
  setUp(() {
    registerFallbackValue(DateTime(2026, 9, 3));
  });

  tearDown(() async {
    await getIt.reset();
  });

  testWidgets(
    'empile À traiter puis l\'agenda, avec Dicter seul en bas',
    (tester) async {
      await monter(tester);

      expect(find.text('À traiter'), findsOneWidget);
      expect(find.text('Vos séances'), findsOneWidget);
      expect(find.widgetWithText(FloatingActionButton, 'Dicter'), findsOneWidget);
      expect(find.byType(BottomNavigationBar), findsNothing);
    },
  );

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
}
