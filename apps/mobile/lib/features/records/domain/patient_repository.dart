import '../../../core/result.dart';
import 'patient.dart';
import 'patient_history.dart';

abstract class PatientRepository {
  /// Flux depuis le cache local. Le sélecteur d'une dictée libre doit
  /// toujours afficher une liste déjà remplie, réseau ou pas.
  Stream<List<Patient>> watchAll();

  /// Remplit le cache en suivant le curseur du serveur jusqu'au bout. Un
  /// échec ne vide jamais ce qui y est déjà : un praticien dans une écurie
  /// sans réseau doit garder son sélecteur d'animaux.
  Future<Result<void>> refresh();

  /// Lecture ponctuelle du cache, pour la fiche animal : elle s'affiche
  /// depuis le cache avant même que le réseau ait répondu. `null` si cet
  /// animal n'a jamais été mis en cache.
  Future<Patient?> byId(String id);

  /// Séances récentes de l'animal et état de leur compte rendu — première
  /// page du serveur, sans suivre le curseur : la fiche montre les dernières
  /// visites, pas l'historique complet.
  Future<Result<List<PatientHistoryEntry>>> history(String patientId);

  /// Lecture locale de l'historique déjà mis en cache par `refreshSheetsFor`
  /// (`CachedPatientHistoryEntries`). Vide si cet animal n'a jamais été
  /// préchargé — jamais une erreur, c'est un simple repli hors ligne pour la
  /// fiche animal.
  Future<List<PatientHistoryEntry>> cachedHistory(String patientId);

  /// Remplit les fiches hors ligne des animaux passés en paramètre : leurs
  /// propriétaires (`CachedOwners`), leur historique de séances
  /// (`CachedPatientHistoryEntries`) et, pour chacun, le dernier compte rendu
  /// finalisé (`CachedReports`). Les fiches des animaux eux-mêmes sont déjà
  /// couvertes par `refresh()`. Un échec sur les propriétaires laisse le
  /// cache intact ; un échec isolé sur un animal n'empêche pas les autres
  /// d'être mis à jour. Les animaux sont traités par lots concurrents
  /// bornés : sur un réseau de campagne, vingt animaux en file indienne
  /// retarderaient tout ce que `refreshForeground` fait par ailleurs.
  Future<Result<void>> refreshSheetsFor(Iterable<String> patientIds);
}
