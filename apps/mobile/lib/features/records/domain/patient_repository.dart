import '../../../core/result.dart';
import 'patient.dart';

abstract class PatientRepository {
  /// Flux depuis le cache local. Le sélecteur d'une dictée libre doit
  /// toujours afficher une liste déjà remplie, réseau ou pas.
  Stream<List<Patient>> watchAll();

  /// Remplit le cache en suivant le curseur du serveur jusqu'au bout. Un
  /// échec ne vide jamais ce qui y est déjà : un praticien dans une écurie
  /// sans réseau doit garder son sélecteur d'animaux.
  Future<Result<void>> refresh();
}
