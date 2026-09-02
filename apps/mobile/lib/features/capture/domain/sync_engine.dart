// Les champs sont privés et les paramètres nommés publics : Dart n'autorise pas
// les paramètres formels d'initialisation sur un champ privé, et rendre ces
// champs publics exposerait les dépendances internes.
// ignore_for_file: prefer_initializing_formals

import '../../../core/database/app_database.dart';
import '../../../core/failure.dart';
import '../../../core/result.dart';
import 'audio_recorder.dart';
import 'capture_store.dart';
import 'sync_decision.dart';
import 'upload_client.dart';

class SyncOutcome {
  const SyncOutcome({
    required this.uploaded,
    required this.retried,
    required this.stopped,
    required this.purged,
  });

  final int uploaded;
  final int retried;
  final int stopped;
  final int purged;
}

/// Exécute, pour chaque dictée en file, ce que `decideSync` a décidé.
///
/// Toute la logique décidable vit dans `sync_decision.dart` ; ce moteur ne fait
/// qu'enchaîner les effets. C'est ce qui rend les règles vérifiables sans
/// réseau ni base.
class SyncEngine {
  SyncEngine({
    required CaptureStore store,
    required CaptureApi api,
    required CaptureFiles files,
    required Future<bool> Function() isOnline,
    required DateTime Function() now,
    required double Function() random,
    void Function(String)? log,
  }) : _store = store,
       _api = api,
       _files = files,
       _isOnline = isOnline,
       _now = now,
       _random = random,
       _log = log ?? _ignore;

  final CaptureStore _store;
  final CaptureApi _api;
  final CaptureFiles _files;
  final Future<bool> Function() _isOnline;
  final DateTime Function() _now;
  final double Function() _random;
  final void Function(String) _log;

  static void _ignore(String _) {}

  Future<SyncOutcome> runOnce() async {
    final online = await _isOnline();
    final now = _now();

    var uploaded = 0;
    var retried = 0;
    var stopped = 0;
    var purged = 0;

    for (final capture in await _store.pending()) {
      switch (decideSync(capture, online: online, now: now)) {
        case SyncDecision.purge:
          await _purge(capture.id);
          purged += 1;
        case SyncDecision.offline:
        case SyncDecision.wait:
        case SyncDecision.skip:
          continue;
        case SyncDecision.upload:
          final result = await _upload(capture);
          switch (result) {
            case _UploadOutcome.done:
              uploaded += 1;
            case _UploadOutcome.retry:
              retried += 1;
            case _UploadOutcome.stop:
              stopped += 1;
          }
      }
    }

    return SyncOutcome(
      uploaded: uploaded,
      retried: retried,
      stopped: stopped,
      purged: purged,
    );
  }

  /// La rétention prime sur tout : les octets quittent l'appareil, et la ligne
  /// reste pour que l'écran puisse expliquer ce qui s'est passé.
  Future<void> _purge(String captureId) async {
    final path = await _store.filePathOf(captureId);
    if (path != null) await _files.delete(path);
    await _store.transition(captureId, LocalCaptureStatus.expired);
    _log('capture expirée: $captureId');
  }

  Future<_UploadOutcome> _upload(SyncCandidate capture) async {
    final row = await _store.byId(capture.id);
    if (row == null) return _UploadOutcome.stop;

    await _store.transition(capture.id, LocalCaptureStatus.uploading);

    // La déclaration porte l'identifiant produit par l'appareil : la rejouer
    // ne crée pas de doublon côté serveur.
    final declared = await _api.declare(
      id: row.id,
      appointmentId: row.appointmentId,
      durationMs: row.durationMs,
      byteSize: row.byteSize,
      sha256: row.sha256,
      createdAt: row.createdAt,
    );
    if (declared case Err(:final failure)) {
      return _handleFailure(capture, failure);
    }

    final session = await _api.requestUpload(capture.id);
    if (session case Err(:final failure)) {
      return _handleFailure(capture, failure);
    }

    final path = await _store.filePathOf(capture.id);
    if (path == null) {
      await _store.transition(
        capture.id,
        LocalCaptureStatus.needsAction,
        errorCode: 'local_file_missing',
      );
      _log('fichier local introuvable: ${capture.id}');
      return _UploadOutcome.stop;
    }

    // Déchiffré juste avant l'envoi. Le chiffrement protège l'appareil, TLS
    // protège le transit — et le serveur doit pouvoir transcrire.
    final bytes = await _files.readDecrypted(path, capture.id);

    final put = await _api.putBytes((session as Success<UploadSession>).value, bytes);
    if (put case Err(:final failure)) {
      return _handleFailure(capture, failure);
    }

    final completed = await _api.complete(
      capture.id,
      (put as Success<String>).value,
    );
    if (completed case Err(:final failure)) {
      return _handleFailure(capture, failure);
    }

    await _store.transition(capture.id, LocalCaptureStatus.uploaded);
    _log('dictée envoyée: ${capture.id}');
    return _UploadOutcome.done;
  }

  /// Traduit l'échec en suite à donner, et journalise **le code seul**.
  ///
  /// Le message peut porter l'URL signée : la journaliser survivrait à la purge
  /// des vingt-quatre heures et donnerait accès à l'audio.
  Future<_UploadOutcome> _handleFailure(
    SyncCandidate capture,
    Failure failure,
  ) async {
    final outcome = resolveFailure(
      failure,
      attemptCount: capture.attemptCount,
      random: _random,
    );

    await _store.transition(
      capture.id,
      outcome.status,
      attemptCount: outcome.attemptCount,
      errorCode: outcome.errorCode,
      nextAttemptAt: outcome.retryAfter == null
          ? null
          : _now().add(outcome.retryAfter!),
    );

    _log('échec ${outcome.errorCode} sur ${capture.id}');

    return outcome.status == LocalCaptureStatus.needsAction
        ? _UploadOutcome.stop
        : _UploadOutcome.retry;
  }
}

enum _UploadOutcome { done, retry, stop }
