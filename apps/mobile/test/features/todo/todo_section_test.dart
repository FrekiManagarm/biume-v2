import 'package:biume_mobile/core/failure.dart';
import 'package:biume_mobile/core/result.dart';
import 'package:biume_mobile/features/capture/domain/capture_store.dart';
import 'package:biume_mobile/features/todo/domain/todo_api.dart';
import 'package:biume_mobile/features/todo/domain/todo_item.dart';
import 'package:biume_mobile/features/todo/presentation/todo_cubit.dart';
import 'package:biume_mobile/features/todo/presentation/todo_section.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';
import 'package:mocktail/mocktail.dart';

class MockCaptureStore extends Mock implements CaptureStore {}

class MockTodoApi extends Mock implements TodoApi {}

/// Construit l'application autour de `TodoSection`, avec un routeur minimal
/// pour que les navigations déclenchées par un élément trouvent une
/// destination.
Future<void> monter(
  WidgetTester tester,
  MockCaptureStore store,
  MockTodoApi api, {
  void Function(String)? onNavigate,
}) async {
  final router = GoRouter(
    initialLocation: '/',
    routes: [
      GoRoute(
        path: '/',
        builder: (_, _) => BlocProvider(
          create: (_) => TodoCubit(store, api, pollInterval: Duration.zero)
            ..start(),
          child: const Scaffold(body: SingleChildScrollView(child: TodoSection())),
        ),
      ),
      GoRoute(
        path: '/dictees/:captureId/transcription',
        builder: (_, state) {
          onNavigate?.call(state.uri.toString());
          return const SizedBox.shrink();
        },
      ),
      GoRoute(
        path: '/comptes-rendus/:reportId',
        builder: (_, state) {
          onNavigate?.call(state.uri.toString());
          return const SizedBox.shrink();
        },
      ),
    ],
  );

  await tester.pumpWidget(MaterialApp.router(routerConfig: router));
  await tester.pump();
  await tester.pump();
}

void main() {
  late MockCaptureStore store;
  late MockTodoApi api;

  setUp(() {
    store = MockCaptureStore();
    api = MockTodoApi();
    when(() => store.watchAll()).thenAnswer((_) => const Stream.empty());
  });

  testWidgets(
    'une ligne par élément, avec le libellé comme sous-titre, jamais l\'identifiant technique',
    (tester) async {
      when(() => api.list()).thenAnswer(
        (_) async => Success([
          TodoItem(
            kind: TodoKind.toAttach,
            captureId: 'c-1',
            patientName: 'Filou',
            updatedAt: DateTime(2026, 9, 3),
          ),
          TodoItem(
            kind: TodoKind.reportToValidate,
            captureId: 'c-2',
            reportId: 'r-2',
            updatedAt: DateTime(2026, 9, 3),
          ),
        ]),
      );

      await monter(tester, store, api);

      expect(find.text('À traiter'), findsOneWidget);
      expect(find.text('Filou'), findsOneWidget);
      expect(find.text(todoLabels[TodoKind.toAttach]!), findsOneWidget);
      expect(find.text('Capture libre'), findsOneWidget);
      expect(find.text(todoLabels[TodoKind.reportToValidate]!), findsOneWidget);

      // Aucun libellé ne montre l'identifiant technique du genre.
      expect(find.text('toAttach'), findsNothing);
      expect(find.text('to_attach'), findsNothing);
      expect(find.text('reportToValidate'), findsNothing);
      expect(find.text('report_to_validate'), findsNothing);
    },
  );

  testWidgets('liste vide : « Rien à traiter. »', (tester) async {
    when(() => api.list()).thenAnswer((_) async => const Success(<TodoItem>[]));

    await monter(tester, store, api);

    expect(find.text('Rien à traiter.'), findsOneWidget);
  });

  testWidgets('un échec réseau garde la liste et affiche le bandeau hors ligne', (
    tester,
  ) async {
    when(() => api.list()).thenAnswer((_) async => const Err(NetworkFailure()));

    await monter(tester, store, api);

    expect(find.textContaining('Connexion indisponible'), findsOneWidget);
  });

  testWidgets('ouvre l\'écran qui répond au geste', (tester) async {
    when(() => api.list()).thenAnswer(
      (_) async => Success([
        TodoItem(
          kind: TodoKind.reportToValidate,
          captureId: 'c-2',
          reportId: 'r-2',
          patientName: 'Filou',
          updatedAt: DateTime(2026, 9, 3),
        ),
      ]),
    );

    final destinations = <String>[];
    await monter(tester, store, api, onNavigate: destinations.add);

    await tester.tap(find.text('Filou'));
    await tester.pump();

    expect(destinations, ['/comptes-rendus/r-2']);
  });
}
