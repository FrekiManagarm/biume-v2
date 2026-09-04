import '../../../core/result.dart';
import 'follow_up.dart';

/// Les suivis dont un propriétaire attend quelque chose, et le geste qui les
/// referme.
///
/// Séparé de [FollowUpRepository] — qui programme un questionnaire à la fin
/// d'une séance — parce que ce sont deux moments opposés du parcours : l'un
/// clôt un compte rendu, l'autre ouvre une journée.
abstract class ActionableFollowUpRepository {
  /// Tout ce qui demande une action, curseur suivi jusqu'au bout : un
  /// praticien qui rentre de tournée doit voir toutes les réponses, pas la
  /// première page.
  Future<Result<List<FollowUp>>> listActionable();

  /// « Traité » est un geste explicite du praticien. Appeler, écrire ou
  /// reprendre un rendez-vous ne ferme rien.
  Future<Result<FollowUp>> markHandled(String followUpId);
}
