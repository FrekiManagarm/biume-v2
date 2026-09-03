import 'package:biume_mobile/features/report/domain/owner_email.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  test('accepte une adresse ordinaire', () {
    expect(ownerEmailError('camille@example.org'), isNull);
    expect(ownerEmailError('  camille.roux@cabinet-biume.fr  '), isNull);
  });

  /// Le praticien est debout, souvent à une main : le message doit dire quoi
  /// corriger, pas seulement que c'est refusé.
  test('dit ce qui manque quand rien n\'est saisi', () {
    expect(ownerEmailError(''), contains('adresse'));
    expect(ownerEmailError('   '), ownerEmailError(''));
  });

  test('refuse une adresse sans arobase ni domaine', () {
    expect(ownerEmailError('camille'), isNotNull);
    expect(ownerEmailError('camille@'), isNotNull);
    expect(ownerEmailError('camille@example'), isNotNull);
    expect(ownerEmailError('@example.org'), isNotNull);
    expect(ownerEmailError('camille roux@example.org'), isNotNull);
  });

  test('normalise ce qui part vers le serveur', () {
    expect(
      normalizeOwnerEmail('  Camille@Example.ORG '),
      'camille@example.org',
    );
  });
}
