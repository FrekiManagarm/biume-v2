import 'package:biume_mobile/core/database/app_database.dart';
import 'package:biume_mobile/core/failure.dart';
import 'package:biume_mobile/core/result.dart';
import 'package:biume_mobile/features/capture/domain/capture_store.dart';
import 'package:biume_mobile/features/followup/domain/actionable_follow_up_repository.dart';
import 'package:biume_mobile/features/followup/domain/follow_up.dart';
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

class MockActionableFollowUpRepository extends Mock
    implements ActionableFollowUpRepository {}

/// Construit l'application autour de `TodoSection`, avec un routeur minimal
/// pour que les navigations déclenchées par un élément trouvent une
/// destination.
Future<void> monter(
  WidgetTester tester,
  MockCaptureStore store,
  MockTodoApi api, {
  ActionableFollowUpRepository? followUps,
  void Function(String)? onNavigate,
  Future<void> Function()? onForegroundRefresh,
}) async {
  final router = GoRouter(
    initialLocation: '/',
    routes: [
      GoRoute(
        path: '/',
        builder: (_, _) => BlocProvider(
          create: (_) =>
              TodoCubit(
                store,
                api,
                followUps: followUps ?? _aucunSuivi(),
                pollInterval: Duration.zero,
              )..start(),
          child: Scaffold(
            body: SingleChildScrollView(
              child: TodoSection(
                onForegroundRefresh: onForegroundRefresh ?? () async {},
              ),
            ),
          ),
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

  setUpAll(() => registerFallbackValue(LocalCaptureStatus.queued));

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
      expect(find.text('Capture libre'), findsOneWidget);
      // La pastille porte le genre en capitales, et le dit en clair à la
      // synthèse vocale.
      expect(
        find.text(todoLabels[TodoKind.toAttach]!.toUpperCase()),
        findsOneWidget,
      );
      expect(
        find.text(todoLabels[TodoKind.reportToValidate]!.toUpperCase()),
        findsOneWidget,
      );
      // Lue lettre par lettre, « À RATTACHER À UN ANIMAL » ne veut plus
      // rien dire : la synthèse vocale reçoit la phrase, pas les capitales.
      expect(
        tester
            .widget<Text>(
              find.text(todoLabels[TodoKind.toAttach]!.toUpperCase()),
            )
            .semanticsLabel,
        todoLabels[TodoKind.toAttach],
      );

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

  testWidgets(
    'un échec réseau garde la liste et affiche le bandeau hors ligne',
    (tester) async {
      when(() => api.list())
          .thenAnswer((_) async => const Err(NetworkFailure()));

      await monter(tester, store, api);

      expect(find.textContaining('Connexion indisponible'), findsOneWidget);
    },
  );

  /// Le geste de reprise doit remettre la dictée en file **avant** de
  /// relancer la synchronisation : le moteur ne reprend que `queued` et
  /// `uploading`, jamais une dictée abandonnée.
  testWidgets(
    'la reprise d\'une dictée bloquée la remet en file puis synchronise',
    (tester) async {
      when(() => api.list())
          .thenAnswer((_) async => const Success(<TodoItem>[]));
      when(() => store.watchAll()).thenAnswer(
        (_) => Stream.value([
          LocalCapture(
            id: 'c-1',
            status: LocalCaptureStatus.needsAction,
            durationMs: 12000,
            byteSize: 400000,
            sha256: 'sha',
            attemptCount: 5,
            createdAt: DateTime(2026, 9, 3, 9),
            expiresAt: DateTime(2026, 9, 4, 9),
          ),
        ]),
      );

      final gestes = <String>[];
      when(
        () => store.transition(
          any(),
          any(),
          attemptCount: any(named: 'attemptCount'),
        ),
      ).thenAnswer((invocation) async {
        gestes.add(
          'file:${invocation.positionalArguments[1]}'
          ':${invocation.namedArguments[#attemptCount]}',
        );
        return true;
      });

      await monter(
        tester,
        store,
        api,
        onForegroundRefresh: () async => gestes.add('synchronise'),
      );

      await tester.tap(find.text(todoLabels[TodoKind.uploadBlocked]!.toUpperCase()));
      await tester.pumpAndSettle();

      expect(gestes, ['file:LocalCaptureStatus.queued:0', 'synchronise']);
    },
  );

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

/// Par défaut, aucun suivi en attente : chaque test de la section décrit ce
/// qu'il montre, et n'a pas à câbler une source qu'il n'exerce pas.
ActionableFollowUpRepository _aucunSuivi() {
  final repository = MockActionableFollowUpRepository();
  when(
    () => repository.listActionable(),
  ).thenAnswer((_) async => const Success(<FollowUp>[]));
  return repository;
}
