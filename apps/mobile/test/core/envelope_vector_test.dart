import 'dart:io';
import 'dart:typed_data';

import 'package:biume_mobile/core/crypto/capture_envelope.dart';
import 'package:flutter_test/flutter_test.dart';

/// Vecteur de compatibilité binaire avec l'implémentation serveur.
///
/// Un aller-retour en Dart seul ne prouve rien : il passerait aussi bien avec
/// le tag GCM placé avant le chiffré, ce que le serveur ne saurait pas relire.
/// Ce vecteur a été déchiffré par `@noble/ciphers` côté TypeScript, et le test
/// échoue si le format produit par Dart s'en écarte.
///
/// Contre-vérification :
///   `bun run apps/web/scripts/verify-envelope.ts`
void main() {
  test('produit exactement le vecteur que le serveur sait relire', () async {
    final key = Uint8List.fromList(List<int>.generate(32, (i) => i));
    final nonce = Uint8List.fromList(List<int>.generate(12, (i) => i * 2));
    const captureId = '6f1a6d5e-3f2b-4c1d-9a7e-2b8c4d5e6f70';
    final plaintext = Uint8List.fromList(
      List<int>.generate(256, (i) => i % 251),
    );

    final envelope = await encryptCapture(
      key: key,
      nonce: nonce,
      captureId: captureId,
      plaintext: plaintext,
    );

    final produced =
        envelope.map((b) => b.toRadixString(16).padLeft(2, '0')).join();
    final expected =
        File('test/fixtures/envelope-vector.hex').readAsStringSync().trim();

    expect(produced, expected);
  });
}
