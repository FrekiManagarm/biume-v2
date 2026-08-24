import 'package:biume_mobile/core/database/app_database.dart';
import 'package:biume_mobile/core/failure.dart';
import 'package:biume_mobile/features/capture/domain/sync_decision.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  final now = DateTime.utc(2026, 8, 21, 10);

  SyncCandidate candidate({
    LocalCaptureStatus status = LocalCaptureStatus.queued,
    int attemptCount = 0,
    DateTime? nextAttemptAt,
    DateTime? expiresAt,
  }) => SyncCandidate(
    id: 'capture-1',
    status: status,
    attemptCount: attemptCount,
    nextAttemptAt: nextAttemptAt,
    expiresAt: expiresAt ?? DateTime.utc(2026, 8, 22, 10),
  );

  group('éligibilité', () {
    test('une dictée en file et arrivée à échéance part', () {
      expect(
        decideSync(candidate(), online: true, now: now),
        SyncDecision.upload,
      );
    });

    /// Hors ligne, la boucle ne consomme aucune tentative : le réseau absent
    /// n'est pas un échec de la dictée.
    test('hors ligne, rien ne part et rien ne se consomme', () {
      expect(
        decideSync(candidate(), online: false, now: now),
        SyncDecision.offline,
      );
    });

    test('une dictée en attente de temporisation patiente', () {
      expect(
        decideSync(
          candidate(nextAttemptAt: now.add(const Duration(minutes: 5))),
          online: true,
          now: now,
        ),
        SyncDecision.wait,
      );
    });

    test("une dictée pas encore validee ne part pas", () {
      expect(
        decideSync(
          candidate(status: LocalCaptureStatus.review),
          online: true,
          now: now,
        ),
        SyncDecision.skip,
      );
    });

    /// La rétention prime sur tout : une dictée expirée ne part plus, même en
    /// ligne et même si elle n'a jamais été tentée.
    test('une dictée expirée est purgée plutôt qu\'envoyée', () {
      expect(
        decideSync(
          candidate(expiresAt: now.subtract(const Duration(minutes: 1))),
          online: true,
          now: now,
        ),
        SyncDecision.purge,
      );
    });

    test('une dictée déjà envoyée ne repart pas', () {
      expect(
        decideSync(
          candidate(status: LocalCaptureStatus.uploaded),
          online: true,
          now: now,
        ),
        SyncDecision.skip,
      );
    });
  });

  group('suite d\'un échec', () {
    test('un échec transitoire consomme une tentative et replanifie', () {
      final outcome = resolveFailure(
        const NetworkFailure(),
        attemptCount: 1,
        random: () => 1.0,
      );

      expect(outcome.status, LocalCaptureStatus.queued);
      expect(outcome.attemptCount, 2);
      expect(outcome.retryAfter, isNotNull);
    });

    /// Ces échecs ne seront jamais résolus par une nouvelle tentative : ils
    /// arrêtent la boucle immédiatement et ne consomment aucune tentative.
    test("un refus d'authentification arrête tout sans consommer", () {
      final outcome = resolveFailure(
        const AuthFailure(),
        attemptCount: 1,
        random: () => 1.0,
      );

      expect(outcome.status, LocalCaptureStatus.needsAction);
      expect(outcome.attemptCount, 1);
      expect(outcome.retryAfter, isNull);
    });

    test('un conflit arrête tout sans consommer', () {
      final outcome = resolveFailure(
        const ConflictFailure(),
        attemptCount: 3,
        random: () => 1.0,
      );

      expect(outcome.status, LocalCaptureStatus.needsAction);
      expect(outcome.attemptCount, 3);
    });

    test('le cinquième échec transitoire arrête la boucle', () {
      final outcome = resolveFailure(
        const ServerFailure(),
        attemptCount: 4,
        random: () => 1.0,
      );

      expect(outcome.attemptCount, 5);
      expect(outcome.status, LocalCaptureStatus.needsAction);
      expect(outcome.retryAfter, isNull);
    });

    test('le quatrième échec laisse encore une chance', () {
      final outcome = resolveFailure(
        const ServerFailure(),
        attemptCount: 3,
        random: () => 1.0,
      );

      expect(outcome.status, LocalCaptureStatus.queued);
      expect(outcome.retryAfter, isNotNull);
    });

    test("le code d'erreur conserve est celui du contrat, jamais un message", () {
      final outcome = resolveFailure(
        const ServerFailure(message: 'https://bucket.example/signed?sig=zzz'),
        attemptCount: 1,
        random: () => 1.0,
      );

      expect(outcome.errorCode, 'server_error');
      expect(outcome.errorCode, isNot(contains('http')));
    });
  });
}
