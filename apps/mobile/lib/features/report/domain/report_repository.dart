import '../../../core/result.dart';
import 'proposal.dart';


class ReportProposals {
  const ReportProposals({
    required this.reportId,
    required this.transcript,
    required this.proposals,
    required this.sections,
  });

  final String reportId;

  /// La transcription voyage avec les propositions : le mobile surligne la
  /// source sans second appel. C'est la traçabilité rendue visible.
  final String transcript;

  final List<Proposal> proposals;
  final Map<ReportSection, SectionState> sections;

  /// Le rapport ne peut être finalisé que quand chaque section est décidée.
  bool get canFinalize => sections.values.every(
    (state) =>
        state == SectionState.confirmed || state == SectionState.notApplicable,
  );
}

abstract class ReportRepository {
  Future<Result<ReportProposals>> load(String reportId);

  Future<Result<ReportProposals>> decide({
    required String reportId,
    required String proposalId,
    required SectionState decision,
  });

  Future<Result<ReportProposals>> decideSection({
    required String reportId,
    required ReportSection section,
    required SectionState decision,
  });

  Future<Result<ReportProposals>> regenerate(String reportId);
}
