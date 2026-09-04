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
import 'package:go_router/go_router.dart';
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

  // `any(named: 'section')` a besoin d'une valeur de repli : mocktail ne
  // l'interroge jamais, il la fait seulement circuler.
  setUpAll(() {
    registerFallbackValue(ReportSection.clinical);
    registerFallbackValue(SectionState.proposed);
  });

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
    expect(find.text('empty'), findsNothing);
    // La pastille crie en capitales et parle normalement à la synthèse
    // vocale.
    expect(find.text('À VÉRIFIER'), findsWidgets);
    expect(
      tester.widget<Text>(find.text('À VÉRIFIER').first).semanticsLabel,
      'À vérifier',
    );
  });

  /// Éteint, le bouton garde sa place et dit ce qui manque : une proposition
  /// à trancher, plus trois sections que rien ne viendra remplir.
  testWidgets("le bouton final reste éteint et dit ce qui manque", (
    tester,
  ) async {
    await monter(tester, repository);
    await tester.pump();
    await tester.pump();

    final bouton = tester.widget<FilledButton>(
      find.widgetWithText(FilledButton, 'Terminer — 4 à vérifier'),
    );

    expect(bouton.onPressed, isNull);
  });

  /// Sept cartes dépliées se lisent comme un formulaire à remplir ; une seule
  /// se lit comme une question posée.
  testWidgets("n'ouvre qu'une proposition à la fois", (tester) async {
    when(() => repository.load(any())).thenAnswer(
      (_) async => Success(
        fabriquer(
          proposals: const [
            Proposal(
              id: 'proposal-1',
              section: ReportSection.clinical,
              text: 'Tension lombaire droite',
              state: SectionState.proposed,
              anchor: ancre,
            ),
            Proposal(
              id: 'proposal-2',
              section: ReportSection.clinical,
              text: 'Bassin équilibré',
              state: SectionState.proposed,
              anchor: ancre,
            ),
          ],
        ),
      ),
    );

    await monter(tester, repository);
    await tester.pump();
    await tester.pump();

    expect(find.text('Tension lombaire droite'), findsOneWidget);
    expect(find.text('Bassin équilibré'), findsNothing);
    expect(
      find.text('1 proposition restante dans cette section'),
      findsOneWidget,
    );
    expect(find.widgetWithText(FilledButton, 'Valider'), findsOneWidget);
  });

  /// Ce qui est tranché se replie : le travail fait doit se voir sans
  /// reprendre la place du travail restant.
  testWidgets('replie ce qui est décidé', (tester) async {
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
        ),
      ),
    );

    await monter(tester, repository);
    await tester.pump();
    await tester.pump();

    expect(find.text('Tension lombaire droite'), findsOneWidget);
    expect(find.text('Validé'), findsOneWidget);
    // Repliée, la proposition ne montre plus ni sa source ni ses gestes.
    expect(find.textContaining('tension lombaire à droite'), findsNothing);
    expect(find.widgetWithText(FilledButton, 'Valider'), findsNothing);
  });

  /// Sans ce geste, une section que rien ne remplit resterait indécise pour
  /// toujours et le compte rendu ne se fermerait jamais.
  testWidgets('permet de clore une section vide', (tester) async {
    when(() => repository.decideSection(
          reportId: any(named: 'reportId'),
          section: any(named: 'section'),
          decision: any(named: 'decision'),
        )).thenAnswer((_) async => Success(donnees));

    await monter(tester, repository);
    await tester.pump();
    await tester.pump();

    // Une par section vide : recommandations et notes. La première suffit à
    // vérifier le geste.
    // Les sections vides ferment la liste, qui construit ses éléments à la
    // demande : il faut les amener à l'écran avant de les viser.
    await tester.drag(find.byType(ListView), const Offset(0, -600));
    await tester.pumpAndSettle();

    // Une par section vide — recommandations et notes ; la première suffit à
    // vérifier le geste.
    await tester.tap(
      find.widgetWithText(OutlinedButton, 'Sans objet pour cette séance').first,
    );
    await tester.pump();

    verify(() => repository.decideSection(
          reportId: 'report-1',
          section: any(named: 'section'),
          decision: SectionState.notApplicable,
        )).called(1);
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
    expect(find.byType(FilledButton), findsNothing);
    expect(find.textContaining('Compte rendu finalisé'), findsOneWidget);
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

  /// Tout est tranché : le bouton s'allume et mène à la finalisation, qui
  /// est l'écran où l'irréversible se décide — jamais ici.
  testWidgets('tout décidé, « Terminer » mène à la finalisation', (
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
        ),
      ),
    );

    final visites = <String>[];
    final router = GoRouter(
      initialLocation: '/comptes-rendus/report-1',
      routes: [
        GoRoute(
          path: '/comptes-rendus/:reportId',
          builder: (_, _) => BlocProvider(
            create: (_) => ReportCubit(repository)..load('report-1'),
            child: const ReportScreen(),
          ),
        ),
        GoRoute(
          path: '/comptes-rendus/:reportId/finaliser',
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

    await tester.tap(find.widgetWithText(FilledButton, 'Terminer'));
    await tester.pumpAndSettle();

    expect(visites, ['/comptes-rendus/report-1/finaliser']);
  });
}
