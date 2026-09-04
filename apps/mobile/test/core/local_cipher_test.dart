import 'dart:convert';
import 'dart:math';

import 'package:biume_mobile/core/crypto/device_key.dart';
import 'package:biume_mobile/core/crypto/local_cipher.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:flutter_test/flutter_test.dart';

/// Générateur reproductible : les tests ne dépendent pas d'une clé tirée au
/// hasard, mais la clé reste de la bonne longueur.
final _key = List<int>.generate(32, (i) => i);

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  final cipher = LocalCipher(() async => _key);

  const clinique =
      '{"transcript":"palpation lombaire douloureuse chez Filou",'
      '"items":[{"text":"restriction L3-L4"}]}';

  test('ce qui est rangé sur le disque ne contient plus le contenu', () async {
    final sealed = await cipher.seal(id: 'report-1', clear: clinique);

    expect(sealed, isNot(contains('palpation')));
    expect(sealed, isNot(contains('L3-L4')));
    expect(sealed, isNot(contains('transcript')));
  });

  test('se relit à l\'identique avec le même identifiant', () async {
    final sealed = await cipher.seal(id: 'report-1', clear: clinique);

    expect(await cipher.open(id: 'report-1', sealed: sealed), clinique);
  });

  /// L'identifiant du compte rendu est lié en données authentifiées : une
  /// enveloppe ne peut pas être déplacée sur un autre compte rendu, même par
  /// quelqu'un qui détient la clé.
  test("refuse de s'ouvrir sur un autre compte rendu", () async {
    final sealed = await cipher.seal(id: 'report-1', clear: clinique);

    expect(await cipher.open(id: 'report-2', sealed: sealed), isNull);
  });

  /// Une clé perdue ou remplacée — réinstallation, restauration — rend le
  /// cache illisible. C'est un cache : il se refait au prochain
  /// rafraîchissement, il ne doit jamais faire lever une exception.
  test('rend null plutôt que de lever sur une enveloppe illisible', () async {
    expect(await cipher.open(id: 'report-1', sealed: 'pas une enveloppe'),
        isNull);
    expect(
      await cipher.open(id: 'report-1', sealed: base64Encode(const [1, 2, 3])),
      isNull,
    );

    final autre = LocalCipher(
      () async => List<int>.generate(32, (i) => 255 - i),
    );
    final sealed = await cipher.seal(id: 'report-1', clear: clinique);
    expect(await autre.open(id: 'report-1', sealed: sealed), isNull);
  });

  group('clé de l\'appareil', () {
    test('génère une clé de 256 bits et la range dans le trousseau', () async {
      FlutterSecureStorage.setMockInitialValues({});
      const storage = FlutterSecureStorage();

      final read = deviceKeyFromSecureStorage(
        storage,
        name: 'test.key',
        random: Random(1),
      );

      final first = await read();
      expect(first, hasLength(32));

      // Une seule clé par installation : le second appel relit la même.
      expect(await read(), first);
    });
  });
}
