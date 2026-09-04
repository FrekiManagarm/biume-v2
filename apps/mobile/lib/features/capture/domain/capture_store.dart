import '../../../core/database/app_database.dart';
import 'sync_decision.dart';

/// La file de dictées, vue par le domaine.
abstract class CaptureStore {
  Future<void> create({
    required String id,
    required String? appointmentId,
    required int durationMs,
    required int byteSize,
    required String sha256,
    required String filePath,
    required DateTime createdAt,
    required DateTime expiresAt,
    String? patientId,
  });

  /// Refuse la transition si elle n'est pas autorisée, et retourne `false`
  /// plutôt que de lever : une transition interdite est un état de programme,
  /// pas une panne à faire remonter au praticien.
  Future<bool> transition(
    String id,
    LocalCaptureStatus to, {
    int? attemptCount,
    String? errorCode,
    DateTime? nextAttemptAt,
  });

  Future<List<SyncCandidate>> pending();

  /// Mémorise l'animal d'une capture libre. Sans effet sur le serveur : c'est
  /// le moteur de synchronisation qui portera ce choix après la déclaration.
  Future<void> attachPatient(String id, String patientId);

  Future<void> markExtractionRequested(String id, DateTime at);

  Future<LocalCapture?> byId(String id);

  Stream<List<LocalCapture>> watchAll();

  Future<String?> filePathOf(String id);
}
