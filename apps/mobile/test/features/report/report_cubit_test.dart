import 'dart:async';

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

const toutesDecidees = {
  ReportSection.clinical: SectionState.confirmed,
  ReportSection.anatomical: SectionState.notApplicable,
  ReportSection.recommendations: SectionState.confirmed,
  ReportSection.notes: SectionState.notApplicable,
};

ReportProposals propositions({
  List<Proposal> items = const [proposition],
  Map<ReportSection, SectionState>? sections,
  ReportStatus status = ReportStatus.draft,
  ReportOwner owner = const ReportOwner(
    id: 'owner-1',
    name: 'Camille Roux',
    email: 'camille@example.org',
  ),
}) => ReportProposals(
  reportId: 'report-1',
  status: status,
  patientName: 'Filou',
  owner: owner,
  captureId: null,
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

  blocTest<ReportCubit, ReportState>(
    'attend l\'extraction puis affiche les propositions',
    setUp: () {
      var calls = 0;
      when(() => repository.load(any())).thenAnswer((_) async {
        calls++;
        return Success(calls < 3 ? propositions(items: const []) : propositions());
      });
    },
    build: () => ReportCubit(repository, pollInterval: Duration.zero),
    act: (cubit) => cubit.load('report-1'),
    expect: () => [
      const ReportLoading(),
      const ReportPreparing(),
      isA<ReportLoaded>().having((s) => s.data.proposals.length, 'propositions', 1),
    ],
  );

  blocTest<ReportCubit, ReportState>(
    'renonce à attendre après le nombre maximal d\'interrogations',
    setUp: () {
      when(() => repository.load(any())).thenAnswer((_) async => Success(propositions(items: const [])));
    },
    build: () => ReportCubit(repository, pollInterval: Duration.zero, maxPolls: 2),
    act: (cubit) => cubit.load('report-1'),
    expect: () => [
      const ReportLoading(),
      const ReportPreparing(),
      isA<ReportLoaded>().having((s) => s.message, 'message', contains('plus long que prévu')),
    ],
  );

  blocTest<ReportCubit, ReportState>(
    'n\'attend pas sur un rapport finalisé sans proposition',
    setUp: () {
      when(() => repository.load(any())).thenAnswer(
        (_) async => Success(propositions(items: const [], status: ReportStatus.sent)),
      );
    },
    build: () => ReportCubit(repository, pollInterval: Duration.zero),
    act: (cubit) => cubit.load('report-1'),
    expect: () => [const ReportLoading(), isA<ReportLoaded>()],
  );

  blocTest<ReportCubit, ReportState>(
    'finalise et envoie',
    setUp: () {
      when(() => repository.load(any())).thenAnswer((_) async => Success(propositions(sections: toutesDecidees)));
      when(() => repository.finalize('report-1', sendToOwner: true)).thenAnswer(
        (_) async => const Success(FinalizeOutcome(status: ReportStatus.sent, sentToOwner: true)),
      );
    },
    build: () => ReportCubit(repository, pollInterval: Duration.zero),
    act: (cubit) async {
      await cubit.load('report-1');
      await cubit.finalize(sendToOwner: true);
    },
    verify: (cubit) => expect(cubit.state, isA<ReportFinalized>().having((s) => s.outcome.sentToOwner, 'envoyé', true)),
  );

  blocTest<ReportCubit, ReportState>(
    'complète l\'e-mail puis finalise',
    setUp: () {
      when(() => repository.load(any())).thenAnswer(
        (_) async => Success(propositions(sections: toutesDecidees, owner: const ReportOwner(id: 'owner-1', name: 'Camille Roux', email: null))),
      );
      when(() => repository.updateOwnerEmail('owner-1', 'camille@example.org')).thenAnswer((_) async => const Success(null));
      when(() => repository.finalize('report-1', sendToOwner: true)).thenAnswer(
        (_) async => const Success(FinalizeOutcome(status: ReportStatus.sent, sentToOwner: true)),
      );
    },
    build: () => ReportCubit(repository, pollInterval: Duration.zero),
    act: (cubit) async {
      await cubit.load('report-1');
      await cubit.addOwnerEmailThenFinalize('camille@example.org');
    },
    verify: (_) => verifyInOrder([
      () => repository.updateOwnerEmail('owner-1', 'camille@example.org'),
      () => repository.finalize('report-1', sendToOwner: true),
    ]),
  );

  blocTest<ReportCubit, ReportState>(
    'refuse de finaliser tant qu\'une section reste à vérifier',
    setUp: () {
      when(() => repository.load(any())).thenAnswer((_) async => Success(propositions()));
    },
    build: () => ReportCubit(repository, pollInterval: Duration.zero),
    act: (cubit) async {
      await cubit.load('report-1');
      await cubit.finalize(sendToOwner: true);
    },
    verify: (_) => verifyNever(() => repository.finalize(any(), sendToOwner: any(named: 'sendToOwner'))),
  );

  /// L'écran de préparation dit au praticien qu'il peut partir. S'il le fait
  /// pendant que `load` interroge le serveur, `BlocProvider` ferme le cubit
  /// avant que la réponse ne revienne : émettre dessus lèverait un
  /// `StateError` non rattrapé.
  test('load ne plante pas si le cubit est fermé pendant la requête', () async {
    final completer = Completer<Result<ReportProposals>>();
    when(() => repository.load(any())).thenAnswer((_) => completer.future);

    final cubit = ReportCubit(repository);
    final loadFuture = cubit.load('report-1');

    await cubit.close();
    completer.complete(Success(propositions()));

    await expectLater(loadFuture, completes);
  });

  test('finalize ne plante pas si le cubit est fermé pendant la requête', () async {
    when(() => repository.load(any()))
        .thenAnswer((_) async => Success(propositions(sections: toutesDecidees)));
    final completer = Completer<Result<FinalizeOutcome>>();
    when(
      () => repository.finalize(any(), sendToOwner: any(named: 'sendToOwner')),
    ).thenAnswer((_) => completer.future);

    final cubit = ReportCubit(repository);
    await cubit.load('report-1');
    final finalizeFuture = cubit.finalize(sendToOwner: true);

    await cubit.close();
    completer.complete(
      const Success(FinalizeOutcome(status: ReportStatus.sent, sentToOwner: true)),
    );

    await expectLater(finalizeFuture, completes);
  });
}
