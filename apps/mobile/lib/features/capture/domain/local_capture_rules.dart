import 'dart:math';

import '../../../core/database/app_database.dart';

/// Nombre d'échecs automatiques avant que la boucle ne s'arrête et que la
/// dictée n'attende une décision du praticien.
const int captureMaxAutomaticFailures = 5;

/// Plafond de temporisation entre deux tentatives.
const Duration captureBackoffCap = Duration(minutes: 15);

/// Durée de conservation d'une dictée sur l'appareil.
const Duration captureRetention = Duration(hours: 24);

/// Transitions autorisées, imposées par le serveur.
///
/// Seul `review` atteint `queued`. Valider une dictée est un acte délibéré du
/// praticien, et rien ne doit mettre en file un audio qu'il n'a jamais
/// réécouté et accepté.
const Map<LocalCaptureStatus, List<LocalCaptureStatus>> _allowedTransitions = {
  LocalCaptureStatus.recording: [
    LocalCaptureStatus.review,
    LocalCaptureStatus.cancelled,
    LocalCaptureStatus.needsAction,
  ],
  LocalCaptureStatus.review: [
    LocalCaptureStatus.queued,
    LocalCaptureStatus.cancelled,
  ],
  LocalCaptureStatus.queued: [
    LocalCaptureStatus.uploading,
    LocalCaptureStatus.cancelled,
    LocalCaptureStatus.expired,
    LocalCaptureStatus.needsAction,
  ],
  LocalCaptureStatus.uploading: [
    LocalCaptureStatus.uploaded,
    LocalCaptureStatus.queued,
    LocalCaptureStatus.needsAction,
    LocalCaptureStatus.cancelled,
    LocalCaptureStatus.expired,
  ],
  LocalCaptureStatus.uploaded: [LocalCaptureStatus.expired],
  LocalCaptureStatus.needsAction: [
    LocalCaptureStatus.queued,
    LocalCaptureStatus.cancelled,
    LocalCaptureStatus.expired,
  ],
  LocalCaptureStatus.cancelled: [],
  LocalCaptureStatus.expired: [],
};

bool canTransitionLocal(LocalCaptureStatus from, LocalCaptureStatus to) =>
    _allowedTransitions[from]?.contains(to) ?? false;

/// Temporisation exponentielle à fenêtre pleine avec aléa.
///
/// L'aléa porte sur toute la fenêtre, et non sur une marge : des appareils
/// tombés en panne au même moment ne doivent pas réessayer au même moment.
Duration computeBackoff(int attemptCount, double Function() random) {
  final exponent = max(0, attemptCount - 1);
  final base = min(1000 * pow(2, exponent).toInt(), captureBackoffCap.inMilliseconds);
  final delay = (base / 2 + random() * (base / 2)).round();

  return Duration(
    milliseconds: min(delay, captureBackoffCap.inMilliseconds),
  );
}

bool hasExhaustedAttempts(int attemptCount) =>
    attemptCount >= captureMaxAutomaticFailures;

DateTime computeExpiry(DateTime createdAt) => createdAt.add(captureRetention);

bool isExpired(DateTime expiresAt, DateTime now) => !expiresAt.isAfter(now);
