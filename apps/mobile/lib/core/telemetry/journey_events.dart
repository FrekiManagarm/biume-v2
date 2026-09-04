/// Les moments du parcours de compte rendu, sous le même identifiant de
/// parcours, de la dictée au suivi.
///
/// Le refus de suivi ([followUpDeclined]) est un événement à part entière,
/// distinct de la programmation ([followUpScheduled]) : un praticien qui
/// refuse explicitement n'est pas un praticien qui abandonne, et la mesure
/// d'activation perdrait cette distinction si seul le suivi programmé était
/// tracé.
abstract final class JourneyEvents {
  static const dictationSaved = 'mobile.dictation_saved';
  static const transcriptValidated = 'mobile.transcript_validated';
  static const extractionRequested = 'mobile.extraction_requested';
  static const reportFinalized = 'mobile.report_finalized';
  static const followUpScheduled = 'mobile.followup_scheduled';
  static const followUpDeclined = 'mobile.followup_declined';

  /// Le seul événement que le mobile émet sans geste du praticien : c'est la
  /// mesure du délai entre la réponse du propriétaire et le moment où le
  /// praticien l'apprend.
  static const followUpNotified = 'mobile.followup_notified';

  static const List<String> all = [
    dictationSaved,
    transcriptValidated,
    extractionRequested,
    reportFinalized,
    followUpScheduled,
    followUpDeclined,
    followUpNotified,
  ];
}
