import 'dart:convert';
import 'dart:math';
import 'dart:typed_data';

import 'package:cryptography/cryptography.dart';

/// Version du format d'enveloppe posée sur disque.
const int captureEnvelopeVersion = 1;

const String _versionMarker = 'BIUME1';
const int captureNonceLength = 12;
const int captureKeyLength = 32;
const int _gcmTagLength = 16;

final _marker = Uint8List.fromList(utf8.encode(_versionMarker));
final _aesGcm = AesGcm.with256bits();

final _nonces = Random.secure();

/// Un nonce neuf pour chaque enveloppe. Le réutiliser sur deux textes avec la
/// même clé casserait GCM : c'est la seule règle que l'appelant ne doit pas
/// avoir à réinventer.
List<int> newCaptureNonce([Random? random]) => List<int>.generate(
  captureNonceLength,
  (_) => (random ?? _nonces).nextInt(256),
);

/// L'identifiant de capture est lié en données authentifiées supplémentaires :
/// une enveloppe ne peut pas être déplacée sur une autre capture, même par
/// quelqu'un qui détient la clé.
List<int> _additionalData(String captureId) => utf8.encode(captureId);

void _assertKey(List<int> key) {
  if (key.length != captureKeyLength) {
    throw ArgumentError('La clé de capture doit faire 256 bits.');
  }
}

/// Disposition sur disque : `BIUME1` | nonce 12 octets | chiffré et tag GCM.
///
/// Le tag suit le chiffré, comme le fait l'implémentation serveur. Inverser cet
/// ordre rendrait toute enveloppe illisible côté serveur sans qu'aucun test
/// local ne s'en aperçoive.
Future<Uint8List> encryptCapture({
  required List<int> key,
  required List<int> nonce,
  required String captureId,
  required List<int> plaintext,
}) async {
  _assertKey(key);
  if (nonce.length != captureNonceLength) {
    throw ArgumentError('Le nonce de capture doit faire 96 bits.');
  }

  final box = await _aesGcm.encrypt(
    plaintext,
    secretKey: SecretKey(key),
    nonce: nonce,
    aad: _additionalData(captureId),
  );

  final envelope = Uint8List(
    _marker.length + nonce.length + box.cipherText.length + _gcmTagLength,
  );
  envelope.setAll(0, _marker);
  envelope.setAll(_marker.length, nonce);
  envelope.setAll(_marker.length + nonce.length, box.cipherText);
  envelope.setAll(
    _marker.length + nonce.length + box.cipherText.length,
    box.mac.bytes,
  );

  return envelope;
}

/// `null` si le marqueur n'est pas reconnu. Une enveloppe d'un format futur ne
/// doit jamais être interprétée en devinant ce qu'elle contient.
int? readEnvelopeVersion(List<int> envelope) {
  if (envelope.length < _marker.length) return null;
  final marker = utf8.decode(
    envelope.sublist(0, _marker.length),
    allowMalformed: true,
  );
  return marker == _versionMarker ? captureEnvelopeVersion : null;
}

Future<Uint8List> decryptCapture({
  required List<int> key,
  required String captureId,
  required List<int> envelope,
}) async {
  _assertKey(key);

  if (readEnvelopeVersion(envelope) != captureEnvelopeVersion) {
    throw ArgumentError("Version d'enveloppe de capture inconnue.");
  }

  final nonceStart = _marker.length;
  final cipherStart = nonceStart + captureNonceLength;
  if (envelope.length < cipherStart + _gcmTagLength) {
    throw ArgumentError('Enveloppe de capture tronquée.');
  }

  final nonce = envelope.sublist(nonceStart, cipherStart);
  final cipherEnd = envelope.length - _gcmTagLength;

  final box = SecretBox(
    envelope.sublist(cipherStart, cipherEnd),
    nonce: nonce,
    mac: Mac(envelope.sublist(cipherEnd)),
  );

  final clear = await _aesGcm.decrypt(
    box,
    secretKey: SecretKey(key),
    aad: _additionalData(captureId),
  );

  return Uint8List.fromList(clear);
}
