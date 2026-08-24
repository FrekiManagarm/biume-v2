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

  Future<LocalCapture?> byId(String id);

  Stream<List<LocalCapture>> watchAll();

  Future<String?> filePathOf(String id);
}
