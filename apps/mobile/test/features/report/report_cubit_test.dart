import 'package:biume_mobile/core/failure.dart';
import 'package:biume_mobile/core/result.dart';
import 'package:biume_mobile/features/report/domain/proposal.dart';
import 'package:biume_mobile/features/report/domain/report_repository.dart';
import 'package:biume_mobile/features/report/presentation/report_cubit.dart';
import 'package:bloc_test/bloc_test.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';

class MockReportRepository extends Mock implements ReportRepository {}

const ancre = TranscriptAnchor(
  start: 19,
  end: 44,
  quote: 'tension lombaire à droite',
);

const proposition = Proposal(
  id: 'proposal-1',
  section: ReportSection.clinical,
  text: 'Tension lombaire droite',
  state: SectionState.proposed,
  anchor: ancre,
);

ReportProposals propositions({
  List<Proposal> items = const [proposition],
  Map<ReportSection, SectionState>? sections,
}) => ReportProposals(
  reportId: 'report-1',
  transcript: 'Filou présente une tension lombaire à droite.',
  proposals: items,
  sections:
      sections ??
      const {
        ReportSection.clinical: SectionState.proposed,
        ReportSection.anatomical: SectionState.empty,
        ReportSection.recommendations: SectionState.empty,
        ReportSection.notes: SectionState.empty,
      },
);

void main() {
  late MockReportRepository repository;

  setUp(() {
    repository = MockReportRepository();
    registerFallbackValue(SectionState.proposed);
    registerFallbackValue(ReportSection.clinical);
  });

  blocTest<ReportCubit, ReportState>(
    'affiche les propositions et la transcription qui les justifie',
    setUp: () {
      when(() => repository.load(any()))
          .thenAnswer((_) async => Success(propositions()));
    },
    build: () => ReportCubit(repository),
    act: (cubit) => cubit.load('report-1'),
    verify: (cubit) {
      final state = cubit.state as ReportLoaded;
      expect(state.data.proposals, hasLength(1));
      expect(state.data.transcript, contains('tension lombaire'));
    },
  );

  blocTest<ReportCubit, ReportState>(
    'confirme une proposition',
    setUp: () {
      when(
        () => repository.decide(
          reportId: any(named: 'reportId'),
          proposalId: any(named: 'proposalId'),
          decision: any(named: 'decision'),
        ),
      ).thenAnswer(
        (_) async => Success(
          propositions(
            items: const [
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
              ReportSection.anatomical: SectionState.empty,
              ReportSection.recommendations: SectionState.empty,
              ReportSection.notes: SectionState.empty,
            },
          ),
        ),
      );
    },
    build: () => ReportCubit(repository),
    seed: () => ReportLoaded(propositions()),
    act: (cubit) => cubit.confirm('proposal-1'),
    verify: (cubit) {
      final state = cubit.state as ReportLoaded;
      expect(state.data.proposals.first.state, SectionState.confirmed);
    },
  );

  /// « proposed » ne veut rien dire pour un ostéopathe. « À vérifier » lui dit
  /// quoi faire.
  test("n'expose jamais un état machine à l'écran", () {
    for (final state in SectionState.values) {
      final label = sectionLabels[state]!;
      expect(label, isNot(contains('_')));
      expect(label, isNot(matches(RegExp('proposed|confirmed|empty'))));
    }
  });

  blocTest<ReportCubit, ReportState>(
    "n'autorise la finalisation que quand tout est décidé",
    build: () => ReportCubit(repository),
    seed: () => ReportLoaded(propositions()),
    act: (cubit) async {},
    verify: (cubit) {
      expect((cubit.state as ReportLoaded).data.canFinalize, isFalse);
    },
  );

  test('autorise la finalisation quand chaque section est décidée', () {
    final tout = propositions(
      sections: const {
        ReportSection.clinical: SectionState.confirmed,
        ReportSection.anatomical: SectionState.notApplicable,
        ReportSection.recommendations: SectionState.confirmed,
        ReportSection.notes: SectionState.notApplicable,
      },
    );

    expect(tout.canFinalize, isTrue);
  });

  /// La traçabilité rendue visible : le praticien doit pouvoir vérifier d'où
  /// vient chaque phrase avant de l'envoyer au propriétaire.
  test('retrouve le passage de transcription d\'une proposition', () {
    final data = propositions();
    final quote = data.proposals.first.anchor.quote;

    expect(data.transcript, contains(quote));
  });

  blocTest<ReportCubit, ReportState>(
    'signale un échec sans perdre les propositions affichées',
    setUp: () {
      when(
        () => repository.decide(
          reportId: any(named: 'reportId'),
          proposalId: any(named: 'proposalId'),
          decision: any(named: 'decision'),
        ),
      ).thenAnswer((_) async => const Err(NetworkFailure()));
    },
    build: () => ReportCubit(repository),
    seed: () => ReportLoaded(propositions()),
    act: (cubit) => cubit.confirm('proposal-1'),
    verify: (cubit) {
      final state = cubit.state as ReportLoaded;
      expect(state.data.proposals, hasLength(1));
      expect(state.message, 'Connexion indisponible.');
    },
  );
}
