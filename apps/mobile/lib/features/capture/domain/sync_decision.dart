import '../../../core/database/app_database.dart';
import '../../../core/failure.dart';
import '../../../core/network/api_error.dart';
import 'local_capture_rules.dart';

/// Ce que le moteur fait d'une dictée à un instant donné.
enum SyncDecision { upload, wait, offline, skip, purge }

class SyncCandidate {
  const SyncCandidate({
    required this.id,
    required this.status,
    required this.attemptCount,
    required this.nextAttemptAt,
    required this.expiresAt,
    this.patientId,
  });

  final String id;
  final LocalCaptureStatus status;
  final int attemptCount;
  final DateTime? nextAttemptAt;
  final DateTime expiresAt;
  final String? patientId;
}

/// Décision pure : aucune entrée-sortie, donc testable sans réseau ni base.
///
/// L'ordre des tests n'est pas cosmétique. La rétention prime sur tout : une
/// dictée expirée ne part plus, même en ligne et même jamais tentée. Et
/// l'absence de réseau est vérifiée avant l'échéance, parce que patienter hors
/// ligne n'aurait aucun sens.
SyncDecision decideSync(
  SyncCandidate capture, {
  required bool online,
  required DateTime now,
}) {
  if (isExpired(capture.expiresAt, now)) return SyncDecision.purge;
  if (capture.status != LocalCaptureStatus.queued) return SyncDecision.skip;
  if (!online) return SyncDecision.offline;

  final next = capture.nextAttemptAt;
  if (next != null && next.isAfter(now)) return SyncDecision.wait;

  return SyncDecision.upload;
}

class FailureOutcome {
  const FailureOutcome({
    required this.status,
    required this.attemptCount,
    required this.errorCode,
    required this.retryAfter,
  });

  final LocalCaptureStatus status;
  final int attemptCount;

  /// Le code normalisé du contrat, jamais un message : celui-ci peut porter
  /// une URL signée qui survivrait à la purge des vingt-quatre heures.
  final String errorCode;

  /// `null` quand la boucle automatique s'arrête et attend le praticien.
  final Duration? retryAfter;
}

/// Traduit un échec en suite à donner.
///
/// Un échec qui exige une intervention arrête la boucle **immédiatement** et ne
/// consomme aucune tentative : réessayer ne le résoudra jamais, et gâcher le
/// crédit de tentatives ferait perdre les reprises utiles.
FailureOutcome resolveFailure(
  Failure failure, {
  required int attemptCount,
  required double Function() random,
}) {
  if (!consumesAttempt(failure)) {
    return FailureOutcome(
      status: LocalCaptureStatus.needsAction,
      attemptCount: attemptCount,
      errorCode: failure.code,
      retryAfter: null,
    );
  }

  final next = attemptCount + 1;
  if (hasExhaustedAttempts(next)) {
    return FailureOutcome(
      status: LocalCaptureStatus.needsAction,
      attemptCount: next,
      errorCode: failure.code,
      retryAfter: null,
    );
  }

  return FailureOutcome(
    status: LocalCaptureStatus.queued,
    attemptCount: next,
    errorCode: failure.code,
    retryAfter: computeBackoff(next, random),
  );
}
