import 'package:flutter/foundation.dart';

/// Les trois règles explicites qui déclenchent une alerte. Le praticien doit
/// pouvoir prédire ce qui va le déranger : une alerte imprévisible finit
/// ignorée, et une alerte ignorée ne protège personne.
enum AlertReason { declaredWorsening, reportedReaction, contactRequested }

AlertReason? alertReasonFrom(String value) => switch (value) {
  'declared_worsening' => AlertReason.declaredWorsening,
  'reported_reaction' => AlertReason.reportedReaction,
  'contact_requested' => AlertReason.contactRequested,
  _ => null,
};

/// Ce que le praticien lit, en français, sans jargon.
const Map<AlertReason, String> alertSentences = {
  AlertReason.declaredWorsening:
      'Le propriétaire signale que son animal va moins bien.',
  AlertReason.reportedReaction:
      'Le propriétaire a observé une réaction après la séance.',
  AlertReason.contactRequested: 'Le propriétaire souhaite être recontacté.',
};

@immutable
class FollowUp {
  const FollowUp({
    required this.id,
    required this.patientName,
    required this.ownerName,
    required this.reasons,
    required this.handled,
  });

  final String id;
  final String patientName;
  final String ownerName;
  final List<AlertReason> reasons;
  final bool handled;

  /// Ce qui mérite d'interrompre un praticien : une réponse arrivée, qui a
  /// déclenché une règle, et qu'il n'a pas encore traitée. Rien d'autre.
  bool get isActionable => reasons.isNotEmpty && !handled;

  String get summary => reasons.map((r) => alertSentences[r]!).join(' ');

  @override
  bool operator ==(Object other) =>
      other is FollowUp && other.id == id && other.handled == handled;

  @override
  int get hashCode => Object.hash(id, handled);
}
