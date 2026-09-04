import '../../../core/result.dart';
import 'appointment.dart';

abstract class AgendaRepository {
  /// Flux depuis le cache local sur la fenêtre `[from, to)`. L'écran s'affiche
  /// sans réseau et se met à jour tout seul quand un rafraîchissement écrit
  /// dans le cache.
  Stream<List<Appointment>> watchWindow(DateTime from, DateTime to);

  /// Remplit le cache pour toute la fenêtre, en suivant `nextCursor` jusqu'au
  /// bout. Un échec ne vide jamais ce qui y est déjà : un praticien dans une
  /// écurie sans réseau doit garder son agenda.
  Future<Result<void>> refreshWindow(DateTime from, DateTime to);

  /// Lecture directe, hors cache : pour un jour choisi par le sélecteur de
  /// date en dehors de la fenêtre de huit jours. N'écrit jamais dans le cache.
  Future<Result<List<Appointment>>> fetchDay(DateTime day);
}
