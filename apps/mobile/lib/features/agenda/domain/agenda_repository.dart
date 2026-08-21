import '../../../core/result.dart';
import 'appointment.dart';

abstract class AgendaRepository {
  /// Flux depuis le cache local. L'écran s'affiche sans réseau et se met à jour
  /// tout seul quand un rafraîchissement écrit dans le cache.
  Stream<List<Appointment>> watchDay(DateTime day);

  /// Remplit le cache. Un échec ne vide jamais ce qui y est déjà : un
  /// praticien dans une écurie sans réseau doit garder son agenda.
  Future<Result<void>> refresh(DateTime day);
}
