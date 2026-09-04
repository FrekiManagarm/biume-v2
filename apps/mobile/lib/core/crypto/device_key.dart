import 'dart:math';
import 'dart:typed_data';

import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import 'capture_envelope.dart';

/// Ce qui rend la clé de chiffrement locale, à la demande.
///
/// Une fonction plutôt qu'une classe : ce qui s'injecte est « comment obtenir
/// la clé », pas « d'où elle vient ». Les tests passent une clé fixe sans
/// toucher au trousseau.
typedef DeviceKeyReader = Future<List<int>> Function();

/// Une seule clé par installation et par [name], générée au premier usage et
/// rangée dans le trousseau système — jamais dans des préférences en clair.
///
/// Elle ne quitte pas l'appareil : le chiffrement protège un téléphone perdu
/// ou volé, pas le transit, que TLS couvre déjà.
DeviceKeyReader deviceKeyFromSecureStorage(
  FlutterSecureStorage storage, {
  required String name,
  Random? random,
}) {
  final generator = random ?? Random.secure();

  return () async {
    final existing = await storage.read(key: name);
    if (existing != null) {
      return Uint8List.fromList(
        List<int>.generate(
          existing.length ~/ 2,
          (i) => int.parse(existing.substring(i * 2, i * 2 + 2), radix: 16),
        ),
      );
    }

    final fresh = Uint8List.fromList(
      List<int>.generate(captureKeyLength, (_) => generator.nextInt(256)),
    );
    await storage.write(
      key: name,
      value: fresh.map((b) => b.toRadixString(16).padLeft(2, '0')).join(),
    );
    return fresh;
  };
}
