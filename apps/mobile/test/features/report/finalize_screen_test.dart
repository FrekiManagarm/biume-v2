import 'package:biume_mobile/config/app_palette.dart';
import 'package:biume_mobile/config/app_theme.dart';
import 'package:biume_mobile/core/result.dart';
import 'package:biume_mobile/core/ui/biume_widgets.dart';
import 'package:biume_mobile/features/report/domain/proposal.dart';
import 'package:biume_mobile/features/report/domain/report_repository.dart';
import 'package:biume_mobile/features/report/presentation/finalize_screen.dart';
import 'package:biume_mobile/features/report/presentation/report_cubit.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';
import 'package:mocktail/mocktail.dart';

class MockReportRepository extends Mock implements ReportRepository {}

const ancre = TranscriptAnchor(
  start: 19,
  end: 44,
  quote: 'tension lombaire à droite',
);

ReportProposals fabriquer({String? email = 'camille@example.org'}) =>
    ReportProposals(
      reportId: 'report-1',
      status: ReportStatus.draft,
      patientName: 'Filou',
      owner: ReportOwner(id: 'owner-1', name: 'Camille Roux', email: email),
      captureId: 'capture-1',
      transcript: 'Filou présente une tension lombaire à droite.',
      proposals: const [
        Proposal(
          id: 'proposal-1',
          section: ReportSection.clinical,
          text: 'Tension lombaire droite',
          state: SectionState.confirmed,
          anchor: ancre,
        ),
      ],
      sections: const {
        ReportSection.clinical: SectionState.confirmed,
        ReportSection.anatomical: SectionState.confirmed,
        ReportSection.recommendations: SectionState.notApplicable,
        ReportSection.notes: SectionState.notApplicable,
      },
    );

void main() {
  late MockReportRepository repository;

  setUp(() {
    repository = MockReportRepository();
    when(() => repository.load(any()))
        .thenAnswer((_) async => Success(fabriquer()));
  });

  /// Construit l'écran avec un routeur minimal : la finalisation quitte cette
  /// route pour le suivi, elle a besoin d'une destination.
  Future<List<String>> monter(WidgetTester tester) async {
    final visites = <String>[];
    final router = GoRouter(
      initialLocation: '/finaliser',
      routes: [
        GoRoute(
          path: '/finaliser',
          builder: (_, _) => BlocProvider(
            create: (_) => ReportCubit(repository)..load('report-1'),
            child: const FinalizeScreen(),
          ),
        ),
        GoRoute(
          path: '/comptes-rendus/:reportId/suivi',
          builder: (_, state) {
            visites.add(state.uri.toString());
            return const SizedBox.shrink();
          },
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
    return visites;
  }

  testWidgets('récapitule ce qui part, et à qui', (tester) async {
    await monter(tester);

    expect(find.text('Filou'), findsOneWidget);
    expect(find.text('Camille Roux'), findsOneWidget);
    expect(find.text('camille@example.org'), findsOneWidget);
    expect(find.text('2 SECTIONS VALIDÉES'), findsOneWidget);
  });

  /// L'irréversible s'annonce avant le geste, pas après.
  testWidgets("prévient de l'irréversibilité avant le geste", (tester) async {
    await monter(tester);

    expect(
      find.textContaining("n'est plus modifiable depuis le mobile"),
      findsOneWidget,
    );
  });

  testWidgets('finalise et envoie', (tester) async {
    when(() => repository.finalize('report-1', sendToOwner: true)).thenAnswer(
      (_) async => const Success(
        FinalizeOutcome(status: ReportStatus.sent, sentToOwner: true),
      ),
    );

    final visites = await monter(tester);

    await tester.tap(find.widgetWithText(BrandAction, 'Finaliser et envoyer'));
    await tester.pumpAndSettle();

    verify(() => repository.finalize('report-1', sendToOwner: true)).called(1);
    // L'identifiant de parcours voyage jusqu'au suivi.
    expect(visites, ['/comptes-rendus/report-1/suivi?capture=capture-1']);
  });

  testWidgets('finalise sans envoyer', (tester) async {
    when(() => repository.finalize('report-1', sendToOwner: false)).thenAnswer(
      (_) async => const Success(
        FinalizeOutcome(status: ReportStatus.finalized, sentToOwner: false),
      ),
    );

    await monter(tester);

    await tester.tap(
      find.widgetWithText(TextButton, 'Finaliser sans envoyer'),
    );
    await tester.pumpAndSettle();

    verify(() => repository.finalize('report-1', sendToOwner: false)).called(1);
  });

  /// Sans adresse, l'envoi ne peut pas aboutir. Le bouton s'éteint et
  /// « Ajouter » dit quoi faire — au lieu d'une feuille qui surgit quand le
  /// praticien croyait avoir envoyé.
  testWidgets("éteint l'envoi quand le propriétaire n'a pas d'adresse", (
    tester,
  ) async {
    when(() => repository.load(any()))
        .thenAnswer((_) async => Success(fabriquer(email: null)));

    await monter(tester);

    expect(find.text('Aucune adresse enregistrée'), findsOneWidget);
    expect(
      tester
          .widget<BrandAction>(
            find.widgetWithText(BrandAction, 'Finaliser et envoyer'),
          )
          .onPressed,
      isNull,
    );
    // Finaliser sans envoyer reste possible : le compte rendu existe, seul
    // son acheminement manque.
    expect(
      find.widgetWithText(TextButton, 'Finaliser sans envoyer'),
      findsOneWidget,
    );
    expect(find.text('Ajouter'), findsOneWidget);
  });

  /// Une adresse vide ou malformée est refusée sur place, avec ce qu'il faut
  /// corriger : un aller-retour serveur pour revenir en message générique
  /// ferait perdre le geste au praticien.
  testWidgets("refuse une adresse malformée sans appeler le serveur", (
    tester,
  ) async {
    when(() => repository.load(any()))
        .thenAnswer((_) async => Success(fabriquer(email: null)));

    await monter(tester);

    await tester.tap(find.text('Ajouter'));
    await tester.pumpAndSettle();

    await tester.tap(find.widgetWithText(FilledButton, "Enregistrer l'adresse"));
    await tester.pumpAndSettle();
    expect(
      find.text("Indiquez l'adresse e-mail du propriétaire."),
      findsOneWidget,
    );

    await tester.enterText(find.byType(TextField), 'camille');
    await tester.tap(find.widgetWithText(FilledButton, "Enregistrer l'adresse"));
    await tester.pumpAndSettle();
    expect(find.byType(TextField), findsOneWidget);

    verifyNever(() => repository.updateOwnerEmail(any(), any()));
  });

  /// Enregistrer l'adresse ne finalise rien : le praticien revient au
  /// récapitulatif et décide ensuite.
  testWidgets("enregistrer l'adresse ne finalise pas", (tester) async {
    when(() => repository.load(any()))
        .thenAnswer((_) async => Success(fabriquer(email: null)));
    when(() => repository.updateOwnerEmail('owner-1', 'camille@example.org'))
        .thenAnswer((_) async => const Success(null));

    await monter(tester);

    await tester.tap(find.text('Ajouter'));
    await tester.pumpAndSettle();
    await tester.enterText(find.byType(TextField), 'camille@example.org');
    await tester.tap(find.widgetWithText(FilledButton, "Enregistrer l'adresse"));
    await tester.pumpAndSettle();

    verify(
      () => repository.updateOwnerEmail('owner-1', 'camille@example.org'),
    ).called(1);
    verifyNever(
      () => repository.finalize(any(), sendToOwner: any(named: 'sendToOwner')),
    );
    expect(find.text('camille@example.org'), findsOneWidget);
  });
}
