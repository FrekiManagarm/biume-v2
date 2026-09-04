import 'dart:convert';

import 'capture_envelope.dart';
import 'device_key.dart';

/// Clé du cache de lecture, dans le trousseau système. Distincte de
/// `captureKeyName` : une dictée porte du travail irremplaçable, un cache se
/// refait — les deux clés n'ont pas la même valeur.
const String localCacheKeyName = 'biume.cache.key';

/// Chiffre un texte avant qu'il ne touche le disque, avec la même enveloppe
/// que les dictées (`capture_envelope.dart`) et une clé qui ne quitte pas
/// l'appareil.
///
/// La menace est celle que pose le design parent, section 3 : **un appareil
/// perdu ou volé contenant des données de santé de clients**. La base SQLite
/// locale n'est pas chiffrée ; ce qui y est rangé en clair est lisible par
/// quiconque tient le téléphone. Le dernier compte rendu finalisé mis en
/// cache pour la fiche hors ligne porte la transcription intégrale de la
/// séance et les propositions cliniques : il ne peut pas y descendre en
/// clair.
class LocalCipher {
  const LocalCipher(this._key);

  final DeviceKeyReader _key;

  /// [id] est lié en données authentifiées supplémentaires : une enveloppe
  /// ne peut pas être déplacée sur un autre compte rendu, même par quelqu'un
  /// qui détient la clé.
  Future<String> seal({required String id, required String clear}) async {
    return base64Encode(
      await encryptCapture(
        key: await _key(),
        nonce: newCaptureNonce(),
        captureId: id,
        plaintext: utf8.encode(clear),
      ),
    );
  }

  /// `null` — jamais une exception — quand l'enveloppe ne s'ouvre pas : clé
  /// remplacée par une réinstallation, enveloppe tronquée, ligne écrite avant
  /// que le chiffrement n'existe. C'est un cache : il se refait au prochain
  /// rafraîchissement, il ne doit rien faire tomber.
  Future<String?> open({required String id, required String sealed}) async {
    try {
      return utf8.decode(
        await decryptCapture(
          key: await _key(),
          captureId: id,
          envelope: base64Decode(sealed),
        ),
      );
    } catch (_) {
      return null;
    }
  }
}
