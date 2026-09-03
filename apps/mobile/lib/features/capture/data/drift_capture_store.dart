import 'package:drift/drift.dart';

import '../../../core/database/app_database.dart';
import '../domain/capture_store.dart';
import '../domain/local_capture_rules.dart';
import '../domain/sync_decision.dart';

class DriftCaptureStore implements CaptureStore {
  const DriftCaptureStore(this._db);

  final AppDatabase _db;

  @override
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
  }) async {
    await _db
        .into(_db.localCaptures)
        .insert(
          LocalCapturesCompanion.insert(
            id: id,
            appointmentId: Value(appointmentId),
            // Créée directement en `review` : le fichier existe et attend la
            // relecture du praticien. Seule sa validation la met en file.
            status: LocalCaptureStatus.review,
            durationMs: durationMs,
            byteSize: byteSize,
            sha256: sha256,
            filePath: Value(filePath),
            createdAt: createdAt,
            expiresAt: expiresAt,
            patientId: Value(patientId),
          ),
        );
  }

  /// Vérifie la transition avant d'écrire, et retourne `false` si elle est
  /// interdite. Une transition refusée est un état de programme, pas une panne
  /// à faire remonter au praticien.
  @override
  Future<bool> transition(
    String id,
    LocalCaptureStatus to, {
    int? attemptCount,
    String? errorCode,
    DateTime? nextAttemptAt,
  }) async {
    final current = await byId(id);
    if (current == null) return false;
    if (!canTransitionLocal(current.status, to)) return false;

    await (_db.update(_db.localCaptures)..where((row) => row.id.equals(id)))
        .write(
          LocalCapturesCompanion(
            status: Value(to),
            attemptCount: attemptCount == null
                ? const Value.absent()
                : Value(attemptCount),
            lastErrorCode: Value(errorCode),
            nextAttemptAt: Value(nextAttemptAt),
          ),
        );

    return true;
  }

  @override
  Future<List<SyncCandidate>> pending() async {
    final rows =
        await (_db.select(_db.localCaptures)
              ..where(
                (row) => row.status.isInValues([
                  LocalCaptureStatus.queued,
                  LocalCaptureStatus.uploading,
                ]),
              )
              ..orderBy([(row) => OrderingTerm.asc(row.createdAt)]))
            .get();

    return rows
        .map(
          (row) => SyncCandidate(
            id: row.id,
            status: row.status,
            attemptCount: row.attemptCount,
            nextAttemptAt: row.nextAttemptAt,
            expiresAt: row.expiresAt,
            patientId: row.patientId,
          ),
        )
        .toList();
  }

  @override
  Future<void> attachPatient(String id, String patientId) =>
      (_db.update(_db.localCaptures)..where((c) => c.id.equals(id))).write(
        LocalCapturesCompanion(patientId: Value(patientId)),
      );

  @override
  Future<void> markExtractionRequested(String id, DateTime at) =>
      (_db.update(_db.localCaptures)..where((c) => c.id.equals(id))).write(
        LocalCapturesCompanion(extractionRequestedAt: Value(at)),
      );

  @override
  Future<LocalCapture?> byId(String id) =>
      (_db.select(_db.localCaptures)..where((row) => row.id.equals(id)))
          .getSingleOrNull();

  @override
  Stream<List<LocalCapture>> watchAll() =>
      (_db.select(_db.localCaptures)
            ..orderBy([(row) => OrderingTerm.desc(row.createdAt)]))
          .watch();

  @override
  Future<String?> filePathOf(String id) async => (await byId(id))?.filePath;
}
