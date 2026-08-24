import 'package:flutter/foundation.dart';

enum ReportSection { clinical, anatomical, recommendations, notes }

enum SectionState { empty, proposed, needsConfirmation, confirmed, notApplicable }

/// Ce que le praticien lit. Jamais l'état machine : « proposed » ne veut rien
/// dire pour un ostéopathe, « À vérifier » lui dit quoi faire.
const Map<SectionState, String> sectionLabels = {
  SectionState.empty: 'À remplir',
  SectionState.proposed: 'À vérifier',
  SectionState.needsConfirmation: 'À vérifier',
  SectionState.confirmed: 'Validé',
  SectionState.notApplicable: 'Sans objet',
};

const Map<ReportSection, String> sectionTitles = {
  ReportSection.clinical: 'Observations',
  ReportSection.anatomical: 'Anatomie',
  ReportSection.recommendations: 'Recommandations',
  ReportSection.notes: 'Notes',
};

@immutable
class TranscriptAnchor {
  const TranscriptAnchor({
    required this.start,
    required this.end,
    required this.quote,
  });

  final int start;
  final int end;

  /// La citation fait foi, pas les indices : elle survit à une correction de
  /// transcription qui les décale.
  final String quote;

  @override
  bool operator ==(Object other) =>
      other is TranscriptAnchor &&
      other.start == start &&
      other.end == end &&
      other.quote == quote;

  @override
  int get hashCode => Object.hash(start, end, quote);
}

@immutable
class Proposal {
  const Proposal({
    required this.id,
    required this.section,
    required this.text,
    required this.state,
    required this.anchor,
  });

  final String id;
  final ReportSection section;
  final String text;
  final SectionState state;
  final TranscriptAnchor anchor;

  bool get isDecided =>
      state == SectionState.confirmed || state == SectionState.notApplicable;

  @override
  bool operator ==(Object other) =>
      other is Proposal && other.id == id && other.state == state;

  @override
  int get hashCode => Object.hash(id, state);
}
