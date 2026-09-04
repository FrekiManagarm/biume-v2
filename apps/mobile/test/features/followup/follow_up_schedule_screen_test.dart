import 'package:biume_mobile/core/result.dart';
import 'package:biume_mobile/features/followup/domain/follow_up_questionnaire.dart';
import 'package:biume_mobile/features/followup/domain/follow_up_repository.dart';
import 'package:biume_mobile/features/followup/presentation/follow_up_schedule_cubit.dart';
import 'package:biume_mobile/features/followup/presentation/follow_up_schedule_screen.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';
import 'package:mocktail/mocktail.dart';

class MockFollowUpRepository extends Mock implements FollowUpRepository {}

/// Un routeur minimal pour que le geste terminal (programmer ou refuser)
/// trouve une destination — l'écran renvoie systématiquement à l'accueil.
Future<void> ouvrirLEcran(
  WidgetTester tester,
  MockFollowUpRepository repository, {
  bool? routeurAccueilAtteinte,
  VoidCallback? onAccueil,
}) async {
  final router = GoRouter(
    initialLocation: '/comptes-rendus/report-1/suivi',
    routes: [
      GoRoute(
        path: '/',
        builder: (_, _) {
          onAccueil?.call();
          return const SizedBox.shrink();
        },
      ),
      GoRoute(
        path: '/comptes-rendus/:reportId/suivi',
        builder: (_, _) => BlocProvider(
          create: (_) => FollowUpScheduleCubit(
            repository,
            reportId: 'report-1',
            now: () => DateTime(2026, 9, 3, 10),
          ),
          child: FollowUpScheduleScreen(now: DateTime(2026, 9, 3, 10)),
        ),
      ),
    ],
  );

  await tester.pumpWidget(MaterialApp.router(routerConfig: router));
  await tester.pump();
}

void main() {
  late MockFollowUpRepository repository;

  setUp(() {
    repository = MockFollowUpRepository();
    registerFallbackValue(DateTime(2026));
  });

  testWidgets('affiche les trois libellés en lecture seule', (tester) async {
    await ouvrirLEcran(tester, repository);

    for (final label in defaultFollowUpQuestionLabels) {
      expect(find.textContaining(label), findsOneWidget);
    }
    expect(find.byType(TextField), findsNothing);
    expect(find.byType(TextFormField), findsNothing);
  });

  testWidgets('propose exactement deux boutons de décision', (tester) async {
    await ouvrirLEcran(tester, repository);

    expect(
      find.widgetWithText(FilledButton, 'Programmer le suivi'),
      findsOneWidget,
    );
    expect(
      find.widgetWithText(TextButton, 'Pas de suivi pour cette séance'),
      findsOneWidget,
    );
  });

  testWidgets('programmer le suivi appelle le dépôt puis revient à l\'accueil', (
    tester,
  ) async {
    when(
      () => repository.schedule('report-1', any()),
    ).thenAnswer((_) async => const Success(null));
    var accueilAtteint = false;

    await ouvrirLEcran(tester, repository, onAccueil: () => accueilAtteint = true);

    await tester.tap(find.widgetWithText(FilledButton, 'Programmer le suivi'));
    await tester.pumpAndSettle();

    verify(() => repository.schedule('report-1', any())).called(1);
    expect(accueilAtteint, isTrue);
  });

  testWidgets(
    "refuser ne déclenche aucun appel réseau et revient à l'accueil",
    (tester) async {
      var accueilAtteint = false;

      await ouvrirLEcran(
        tester,
        repository,
        onAccueil: () => accueilAtteint = true,
      );

      await tester.tap(
        find.widgetWithText(TextButton, 'Pas de suivi pour cette séance'),
      );
      await tester.pumpAndSettle();

      verifyNever(() => repository.schedule(any(), any()));
      expect(accueilAtteint, isTrue);
    },
  );

  /// Trois délais en un geste. Un sélecteur de date par défaut demanderait
  /// trois tapes et une lecture de calendrier pour ce qui est, neuf fois sur
  /// dix, « la semaine prochaine ».
  testWidgets('offre trois délais, celui par défaut déjà retenu', (
    tester,
  ) async {
    await ouvrirLEcran(tester, repository);

    expect(find.text('J+5'), findsOneWidget);
    expect(find.text('J+7'), findsOneWidget);
    expect(find.text('J+10'), findsOneWidget);
    // Le cubit part à J+7 : l'échéance se lit en toutes lettres, pas en
    // nombre de jours à compter soi-même.
    expect(find.text('Jeudi 10 septembre'), findsOneWidget);
  });

  testWidgets('choisir un délai déplace l\'échéance', (tester) async {
    await ouvrirLEcran(tester, repository);

    await tester.tap(find.text('J+10'));
    await tester.pump();

    expect(find.text('Dimanche 13 septembre'), findsOneWidget);
  });
}
