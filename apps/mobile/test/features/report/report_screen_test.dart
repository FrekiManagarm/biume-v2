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

final donnees = ReportProposals(
  reportId: 'report-1',
  transcript: 'Filou présente une tension lombaire à droite.',
  proposals: const [
    Proposal(
      id: 'proposal-1',
      section: ReportSection.clinical,
      text: 'Tension lombaire droite',
      state: SectionState.proposed,
      anchor: ancre,
    ),
  ],
  sections: const {
    ReportSection.clinical: SectionState.proposed,
    ReportSection.anatomical: SectionState.empty,
    ReportSection.recommendations: SectionState.empty,
    ReportSection.notes: SectionState.empty,
  },
);

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
}
