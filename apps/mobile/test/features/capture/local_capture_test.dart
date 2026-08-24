import 'package:biume_mobile/core/database/app_database.dart';
import 'package:biume_mobile/features/capture/domain/local_capture_rules.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('transitions locales', () {
    /// Valider une dictée est un acte délibéré du praticien : rien ne doit
    /// mettre en file un audio qu'il n'a jamais réécouté et accepté.
    test('seul review atteint queued', () {
      expect(
        canTransitionLocal(LocalCaptureStatus.review, LocalCaptureStatus.queued),
        isTrue,
      );
      expect(
        canTransitionLocal(
          LocalCaptureStatus.recording,
          LocalCaptureStatus.queued,
        ),
        isFalse,
      );
    });

    test('cancelled et expired sont terminaux', () {
      for (final target in LocalCaptureStatus.values) {
        expect(canTransitionLocal(LocalCaptureStatus.cancelled, target), isFalse);
        expect(canTransitionLocal(LocalCaptureStatus.expired, target), isFalse);
      }
    });

    test('uploading peut revenir en queued', () {
      expect(
        canTransitionLocal(
          LocalCaptureStatus.uploading,
          LocalCaptureStatus.queued,
        ),
        isTrue,
      );
    });

    test("uploaded ne mene qu'a expired", () {
      expect(
        canTransitionLocal(
          LocalCaptureStatus.uploaded,
          LocalCaptureStatus.expired,
        ),
        isTrue,
      );
      expect(
        canTransitionLocal(
          LocalCaptureStatus.uploaded,
          LocalCaptureStatus.queued,
        ),
        isFalse,
      );
    });

    test("needs_action peut etre relance par le praticien", () {
      expect(
        canTransitionLocal(
          LocalCaptureStatus.needsAction,
          LocalCaptureStatus.queued,
        ),
        isTrue,
      );
    });
  });

  group('temporisation', () {
    test('croît exponentiellement', () {
      final premier = computeBackoff(1, () => 1.0);
      final deuxieme = computeBackoff(2, () => 1.0);
      final troisieme = computeBackoff(3, () => 1.0);

      expect(deuxieme, greaterThan(premier));
      expect(troisieme, greaterThan(deuxieme));
    });

    /// Aléa sur toute la fenêtre : des appareils tombés en panne ensemble ne
    /// doivent pas réessayer ensemble.
    test('reste entre la moitié et la totalité de la fenêtre', () {
      const tentative = 4;
      final plancher = computeBackoff(tentative, () => 0.0);
      final plafond = computeBackoff(tentative, () => 1.0);

      expect(plancher.inMilliseconds * 2, plafond.inMilliseconds);
    });

    test('plafonne à quinze minutes', () {
      expect(computeBackoff(20, () => 1.0), const Duration(minutes: 15));
    });

    test('la première tentative attend environ une seconde', () {
      expect(
        computeBackoff(1, () => 1.0).inMilliseconds,
        lessThanOrEqualTo(1000),
      );
    });
  });

  group('abandon automatique', () {
    test('cinq échecs suffisent', () {
      expect(hasExhaustedAttempts(4), isFalse);
      expect(hasExhaustedAttempts(5), isTrue);
    });
  });

  group('rétention', () {
    test('une dictée expire vingt-quatre heures après sa création', () {
      final creation = DateTime.utc(2026, 8, 21, 10);

      expect(computeExpiry(creation), DateTime.utc(2026, 8, 22, 10));
    });

    test('une dictée dont la date est passée est expirée', () {
      final creation = DateTime.utc(2026, 8, 21, 10);
      final expiry = computeExpiry(creation);

      expect(isExpired(expiry, DateTime.utc(2026, 8, 22, 10)), isTrue);
      expect(isExpired(expiry, DateTime.utc(2026, 8, 22, 9, 59)), isFalse);
    });
  });
}
