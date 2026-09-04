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

/// Comment le propriétaire décrit l'évolution, dans ses mots à lui.
enum Evolution { better, same, worse }

Evolution? evolutionFrom(String value) => switch (value) {
  'better' => Evolution.better,
  'same' => Evolution.same,
  'worse' => Evolution.worse,
  _ => null,
};

/// Les trois réponses du questionnaire standard, telles que le propriétaire
/// les a saisies. Le mobile les lit, ne les modifie jamais.
@immutable
class FollowUpAnswer {
  const FollowUpAnswer({
    required this.evolution,
    required this.reaction,
    required this.wantsContact,
  });

  final Evolution evolution;
  final String reaction;
  final bool wantsContact;

  @override
  bool operator ==(Object other) =>
      other is FollowUpAnswer &&
      other.evolution == evolution &&
      other.reaction == reaction &&
      other.wantsContact == wantsContact;

  @override
  int get hashCode => Object.hash(evolution, reaction, wantsContact);
}

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
    required this.reportId,
    required this.patientName,
    required this.ownerName,
    required this.reasons,
    required this.handled,
    this.answer,
    this.answeredAt,
    this.ownerPhone,
    this.ownerEmail,
    this.patientId,
  });

  final String id;
  final String reportId;
  final String patientName;
  final String ownerName;
  final List<AlertReason> reasons;
  final bool handled;
  final FollowUpAnswer? answer;
  final DateTime? answeredAt;

  // Nullables parce qu'une fiche client peut être incomplète : sans
  // téléphone le bouton « Appeler » est éteint, le suivi reste lisible.
  final String? ownerPhone;
  final String? ownerEmail;
  final String? patientId;

  /// Ce qui mérite d'interrompre un praticien : une réponse arrivée, qui a
  /// déclenché une règle, et qu'il n'a pas encore traitée. Rien d'autre.
  bool get isActionable => reasons.isNotEmpty && !handled;

  String get summary => reasons.map((r) => alertSentences[r]!).join(' ');

  /// Ce que le praticien lit avant d'appeler. Trois phrases au plus, dans
  /// l'ordre des questions posées au propriétaire.
  List<String> get answerSentences {
    final a = answer;
    if (a == null) return const [];
    return [
      'État : ${switch (a.evolution) {
        Evolution.better => 'mieux',
        Evolution.same => 'pareil',
        Evolution.worse => 'moins bien',
      }}.',
      if (a.reaction.trim().isNotEmpty)
        'Réaction observée : « ${a.reaction.trim()} ».',
      if (a.wantsContact) 'Souhaite être recontacté.',
    ];
  }

  @override
  bool operator ==(Object other) =>
      other is FollowUp && other.id == id && other.handled == handled;

  @override
  int get hashCode => Object.hash(id, handled);
}
