import '../../../core/result.dart';

/// Programme le questionnaire de suivi envoyé au propriétaire.
///
/// Une seule opération : le mobile propose une échéance, le serveur applique
/// lui-même le plancher métier et refuse un rapport en brouillon. Rien
/// d'autre n'est éditable depuis l'application.
abstract class FollowUpRepository {
  Future<Result<void>> schedule(String reportId, DateTime dueAt);
}
