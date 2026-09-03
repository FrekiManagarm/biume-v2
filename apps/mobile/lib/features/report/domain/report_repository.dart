import 'package:flutter/foundation.dart';

import '../../../core/result.dart';
import 'proposal.dart';

class ReportProposals {
  const ReportProposals({
    required this.reportId,
    required this.status,
    required this.patientName,
    required this.owner,
    required this.captureId,
    required this.transcript,
    required this.proposals,
    required this.sections,
  });

  final String reportId;

  final ReportStatus status;

  final String patientName;

  /// Le destinataire du compte rendu.
  final ReportOwner owner;

  /// Identifiant de parcours de télémétrie, porté de la dictée au suivi.
  final String? captureId;

  /// La transcription voyage avec les propositions : le mobile surligne la
  /// source sans second appel. C'est la traçabilité rendue visible.
  final String transcript;

  final List<Proposal> proposals;
  final Map<ReportSection, SectionState> sections;

  /// Un rapport finalisé ou envoyé est en lecture seule : aucune décision,
  /// aucune finalisation. C'est ce qui permet de le rouvrir plus tard sans
  /// risquer de le modifier.
  bool get isReadOnly => status != ReportStatus.draft;

  /// Le rapport ne peut être finalisé que quand chaque section est décidée.
  bool get canFinalize => sections.values.every(
    (state) =>
        state == SectionState.confirmed || state == SectionState.notApplicable,
  );

  ReportProposals withOwnerEmail(String email) => ReportProposals(
    reportId: reportId,
    status: status,
    patientName: patientName,
    owner: owner.withEmail(email),
    captureId: captureId,
    transcript: transcript,
    proposals: proposals,
    sections: sections,
  );
}

@immutable
class FinalizeOutcome {
  const FinalizeOutcome({required this.status, required this.sentToOwner});

  final ReportStatus status;
  final bool sentToOwner;

  @override
  bool operator ==(Object other) =>
      other is FinalizeOutcome &&
      other.status == status &&
      other.sentToOwner == sentToOwner;

  @override
  int get hashCode => Object.hash(status, sentToOwner);
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

  Future<Result<FinalizeOutcome>> finalize(
    String reportId, {
    required bool sendToOwner,
  });

  Future<Result<void>> updateOwnerEmail(String ownerId, String email);
}
