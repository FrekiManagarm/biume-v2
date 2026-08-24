import 'package:biume_mobile/features/followup/domain/follow_up.dart';
import 'package:flutter_test/flutter_test.dart';

FollowUp suivi({
  List<AlertReason> reasons = const [AlertReason.contactRequested],
  bool handled = false,
}) => FollowUp(
  id: 'followup-1',
  patientName: 'Filou',
  ownerName: 'Camille Roux',
  reasons: reasons,
  handled: handled,
);

void main() {
  group('suivi actionnable', () {
    test('une alerte non traitée demande une action', () {
      expect(suivi().isActionable, isTrue);
    });

    test('une alerte traitée ne demande plus rien', () {
      expect(suivi(handled: true).isActionable, isFalse);
    });

    /// Une réponse sans motif d'alerte est une bonne nouvelle. L'afficher
    /// noierait les vraies alertes.
    test('une réponse sans motif ne demande rien', () {
      expect(suivi(reasons: const []).isActionable, isFalse);
    });
  });

  group('résumé', () {
    test('dit le motif en français, jamais son code', () {
      final texte = suivi(
        reasons: const [AlertReason.declaredWorsening],
      ).summary;

      expect(texte, 'Le propriétaire signale que son animal va moins bien.');
      expect(texte, isNot(contains('_')));
    });

    test('compose plusieurs motifs', () {
      final texte = suivi(
        reasons: const [
          AlertReason.declaredWorsening,
          AlertReason.contactRequested,
        ],
      ).summary;

      expect(texte, contains('moins bien'));
      expect(texte, contains('recontacté'));
    });
  });

  group('lecture des motifs du serveur', () {
    test('reconnaît les trois règles', () {
      expect(alertReasonFrom('declared_worsening'), AlertReason.declaredWorsening);
      expect(alertReasonFrom('reported_reaction'), AlertReason.reportedReaction);
      expect(alertReasonFrom('contact_requested'), AlertReason.contactRequested);
    });

    /// Un motif inconnu vient d'un serveur plus récent. L'ignorer vaut mieux
    /// que planter : le suivi reste lisible, simplement sans ce motif.
    test('ignore un motif inconnu plutôt que de planter', () {
      expect(alertReasonFrom('nouvelle_regle'), isNull);
    });
  });
}
