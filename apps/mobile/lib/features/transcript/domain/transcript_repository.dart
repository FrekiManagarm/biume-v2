import '../../../core/result.dart';
import 'transcript.dart';

abstract class TranscriptRepository {
  Future<Result<Transcript>> load(String captureId);

  Future<Result<Transcript>> correct(String captureId, String text);

  Future<Result<void>> attach(String captureId, String patientId);

  /// Lance l'extraction du compte rendu. Renvoie l'identifiant du rapport
  /// produit, pas le rapport lui-même : le mobile valide, il n'édite pas.
  Future<Result<String>> extract(String captureId);
}
