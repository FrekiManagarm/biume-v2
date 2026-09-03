import 'package:biume_mobile/config/app_palette.dart';
import 'package:biume_mobile/config/app_theme.dart';
import 'package:biume_mobile/core/result.dart';
import 'package:biume_mobile/features/report/domain/proposal.dart';
import 'package:biume_mobile/features/report/domain/report_repository.dart';
import 'package:biume_mobile/features/report/presentation/report_cubit.dart';
import 'package:biume_mobile/features/report/presentation/report_screen.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';

class MockReportRepository extends Mock implements ReportRepository {}

const ancre = TranscriptAnchor(
  start: 19,
  end: 44,
  quote: 'tension lombaire à droite',
);

const proprietaire = ReportOwner(
  id: 'owner-1',
  name: 'Camille Roux',
  email: 'camille@example.org',
);

ReportProposals fabriquer({
  ReportStatus status = ReportStatus.draft,
  List<Proposal> proposals = const [
    Proposal(
      id: 'proposal-1',
      section: ReportSection.clinical,
      text: 'Tension lombaire droite',
      state: SectionState.proposed,
      anchor: ancre,
    ),
  ],
  Map<ReportSection, SectionState> sections = const {
    ReportSection.clinical: SectionState.proposed,
    ReportSection.anatomical: SectionState.empty,
    ReportSection.recommendations: SectionState.empty,
    ReportSection.notes: SectionState.empty,
  },
  ReportOwner owner = proprietaire,
}) => ReportProposals(
  reportId: 'report-1',
  status: status,
  patientName: 'Filou',
  owner: owner,
  captureId: null,
  transcript: 'Filou présente une tension lombaire à droite.',
  proposals: proposals,
  sections: sections,
);

final donnees = fabriquer();

Future<void> monter(WidgetTester tester, MockReportRepository repository) async {
  await tester.pumpWidget(
    MaterialApp(
      theme: buildAppTheme(AppPalette.light, Brightness.light),
      home: BlocProvider(
        create: (_) => ReportCubit(repository)..load('report-1'),
        child: const ReportScreen(),
      ),
    ),
  );
}

void main() {
  late MockReportRepository repository;

  setUp(() {
    repository = MockReportRepository();
    when(() => repository.load(any()))
        .thenAnswer((_) async => Success(donnees));
  });

  testWidgets('affiche la proposition et sa source', (tester) async {
    await monter(tester, repository);
    await tester.pump();
    await tester.pump();

    expect(find.text('Tension lombaire droite'), findsOneWidget);
    expect(find.textContaining('tension lombaire à droite'), findsOneWidget);
  });

  /// L'outil anatomique demande de la précision de pointage sur un schéma
  /// corporel : le pire écran possible sur un téléphone tenu à bout de bras.
  testWidgets("renvoie l'anatomie vers le web", (tester) async {
    await monter(tester, repository);
    await tester.pump();
    await tester.pump();

    expect(find.textContaining('biume.app'), findsOneWidget);
  });

  /// Le mobile valide, il n'édite pas.
  testWidgets("n'offre aucun champ de saisie de texte libre", (tester) async {
    await monter(tester, repository);
    await tester.pump();
    await tester.pump();

    expect(find.byType(TextField), findsNothing);
    expect(find.byType(TextFormField), findsNothing);
  });

  testWidgets("n'affiche jamais un état machine", (tester) async {
    await monter(tester, repository);
    await tester.pump();
    await tester.pump();

    expect(find.text('proposed'), findsNothing);
    expect(find.text('À vérifier'), findsWidgets);
  });

  testWidgets('interdit de finaliser tant que tout n\'est pas décidé', (
    tester,
  ) async {
    await monter(tester, repository);
    await tester.pump();
    await tester.pump();

    final bouton = tester.widget<FilledButton>(
      find.widgetWithText(FilledButton, 'Finaliser et partager'),
    );

    expect(bouton.onPressed, isNull);
  });

  testWidgets("n'affiche aucun bouton sur un rapport finalisé", (
    tester,
  ) async {
    when(() => repository.load(any())).thenAnswer(
      (_) async => Success(
        fabriquer(
          status: ReportStatus.finalized,
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
            ReportSection.anatomical: SectionState.notApplicable,
            ReportSection.recommendations: SectionState.notApplicable,
            ReportSection.notes: SectionState.notApplicable,
          },
        ),
      ),
    );

    await monter(tester, repository);
    await tester.pump();
    await tester.pump();

    expect(find.widgetWithText(FilledButton, 'Valider'), findsNothing);
    expect(find.widgetWithText(OutlinedButton, 'Sans objet'), findsNothing);
    expect(
      find.widgetWithText(FilledButton, 'Finaliser et partager'),
      findsNothing,
    );
    expect(find.textContaining('Compte rendu finalisé'), findsOneWidget);
  });

  testWidgets("propose d'ajouter l'e-mail quand le propriétaire n'en a pas", (
    tester,
  ) async {
    when(() => repository.load(any())).thenAnswer(
      (_) async => Success(
        fabriquer(
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
            ReportSection.anatomical: SectionState.notApplicable,
            ReportSection.recommendations: SectionState.notApplicable,
            ReportSection.notes: SectionState.notApplicable,
          },
          owner: const ReportOwner(
            id: 'owner-1',
            name: 'Camille Roux',
            email: null,
          ),
        ),
      ),
    );

    await monter(tester, repository);
    await tester.pump();
    await tester.pump();

    await tester.tap(find.widgetWithText(FilledButton, 'Finaliser et partager'));
    await tester.pumpAndSettle();

    expect(find.byType(TextField), findsOneWidget);
    expect(
      find.widgetWithText(FilledButton, 'Enregistrer et envoyer'),
      findsOneWidget,
    );
    expect(
      find.widgetWithText(TextButton, 'Finaliser sans envoyer'),
      findsOneWidget,
    );

    // Une adresse vide ou malformée est refusée sur place, avec ce qu'il faut
    // corriger : un aller-retour serveur pour revenir en message générique
    // ferait perdre le geste au praticien.
    await tester.tap(
      find.widgetWithText(FilledButton, 'Enregistrer et envoyer'),
    );
    await tester.pumpAndSettle();
    expect(
      find.text("Indiquez l'adresse e-mail du propriétaire."),
      findsOneWidget,
    );
    expect(find.byType(TextField), findsOneWidget);

    await tester.enterText(find.byType(TextField), 'camille');
    await tester.tap(
      find.widgetWithText(FilledButton, 'Enregistrer et envoyer'),
    );
    await tester.pumpAndSettle();
    expect(find.byType(TextField), findsOneWidget);
    verifyNever(() => repository.updateOwnerEmail(any(), any()));
  });

  testWidgets(
    'affiche « Biume prépare le compte rendu » pendant l\'attente',
    (tester) async {
      when(() => repository.load(any())).thenAnswer(
        (_) async => Success(fabriquer(proposals: const [])),
      );

      // Un intervalle court et un plafond bas : le test observe l'attente,
      // puis la laisse se résoudre pour ne pas quitter avec un minuteur
      // encore en suspens.
      const intervalle = Duration(milliseconds: 10);
      await tester.pumpWidget(
        MaterialApp(
          theme: buildAppTheme(AppPalette.light, Brightness.light),
          home: BlocProvider(
            create: (_) => ReportCubit(
              repository,
              pollInterval: intervalle,
              maxPolls: 2,
            )..load('report-1'),
            child: const ReportScreen(),
          ),
        ),
      );
      await tester.pump();
      await tester.pump();

      expect(
        find.textContaining('Biume prépare le compte rendu'),
        findsOneWidget,
      );

      await tester.pump(intervalle);
      await tester.pump();
    },
  );
}
