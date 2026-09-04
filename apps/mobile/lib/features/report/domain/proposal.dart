import 'package:flutter/foundation.dart';

enum ReportSection { clinical, anatomical, recommendations, notes }

enum SectionState { empty, proposed, needsConfirmation, confirmed, notApplicable }

/// États d'un compte rendu, imposés par le contrat serveur.
enum ReportStatus { draft, finalized, sent }

ReportStatus reportStatusFrom(String value) => switch (value) {
  'finalized' => ReportStatus.finalized,
  'sent' => ReportStatus.sent,
  _ => ReportStatus.draft,
};

/// L'inverse de `reportStatusFrom` : sert à ranger un statut dans le cache
/// local (`CachedPatientHistoryEntries`) sous la même forme que le contrat
/// serveur, pour le relire sans ambiguïté.
String reportStatusToApi(ReportStatus status) => switch (status) {
  ReportStatus.draft => 'draft',
  ReportStatus.finalized => 'finalized',
  ReportStatus.sent => 'sent',
};

SectionState sectionStateFrom(String value) => switch (value) {
  'proposed' => SectionState.proposed,
  'needs_confirmation' => SectionState.needsConfirmation,
  'confirmed' => SectionState.confirmed,
  'not_applicable' => SectionState.notApplicable,
  _ => SectionState.empty,
};

String sectionStateToApi(SectionState state) => switch (state) {
  SectionState.empty => 'empty',
  SectionState.proposed => 'proposed',
  SectionState.needsConfirmation => 'needs_confirmation',
  SectionState.confirmed => 'confirmed',
  SectionState.notApplicable => 'not_applicable',
};

ReportSection reportSectionFrom(String value) => switch (value) {
  'anatomical' => ReportSection.anatomical,
  'recommendations' => ReportSection.recommendations,
  'notes' => ReportSection.notes,
  _ => ReportSection.clinical,
};

String sectionToApi(ReportSection section) => switch (section) {
  ReportSection.clinical => 'clinical',
  ReportSection.anatomical => 'anatomical',
  ReportSection.recommendations => 'recommendations',
  ReportSection.notes => 'notes',
};

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

/// Le propriétaire de l'animal — destinataire du compte rendu. L'e-mail est
/// une fiche, pas une édition de rapport : le mobile peut la compléter sans
/// jamais réécrire le contenu du compte rendu.
@immutable
class ReportOwner {
  const ReportOwner({required this.id, required this.name, this.email});

  final String id;
  final String name;
  final String? email;

  ReportOwner withEmail(String email) =>
      ReportOwner(id: id, name: name, email: email);

  @override
  bool operator ==(Object other) =>
      other is ReportOwner &&
      other.id == id &&
      other.name == name &&
      other.email == email;

  @override
  int get hashCode => Object.hash(id, name, email);
}

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
