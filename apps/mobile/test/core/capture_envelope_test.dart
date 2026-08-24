import 'dart:typed_data';

import 'package:biume_mobile/core/crypto/capture_envelope.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  final key = Uint8List.fromList(List<int>.generate(32, (i) => i));
  final nonce = Uint8List.fromList(List<int>.generate(12, (i) => i * 2));
  const captureId = '6f1a6d5e-3f2b-4c1d-9a7e-2b8c4d5e6f70';
  final plaintext = Uint8List.fromList(List<int>.generate(256, (i) => i % 251));

  group("format d'enveloppe", () {
    test('commence par le marqueur puis le nonce', () async {
      final envelope = await encryptCapture(
        key: key,
        nonce: nonce,
        captureId: captureId,
        plaintext: plaintext,
      );

      expect(String.fromCharCodes(envelope.sublist(0, 6)), 'BIUME1');
      expect(envelope.sublist(6, 18), nonce);
    });

    test('fait un aller-retour', () async {
      final envelope = await encryptCapture(
        key: key,
        nonce: nonce,
        captureId: captureId,
        plaintext: plaintext,
      );

      expect(
        await decryptCapture(
          key: key,
          captureId: captureId,
          envelope: envelope,
        ),
        plaintext,
      );
    });

    test('reconnaît sa version', () async {
      final envelope = await encryptCapture(
        key: key,
        nonce: nonce,
        captureId: captureId,
        plaintext: plaintext,
      );

      expect(readEnvelopeVersion(envelope), 1);
      expect(
        readEnvelopeVersion(Uint8List.fromList('AUTRE1'.codeUnits)),
        isNull,
      );
    });
  });

  group('garde-fous', () {
    /// L'identifiant de capture est lié en données authentifiées : une
    /// enveloppe ne peut pas être déplacée sur une autre capture, même en
    /// détenant la clé.
    test("refuse de déchiffrer sous un autre identifiant", () async {
      final envelope = await encryptCapture(
        key: key,
        nonce: nonce,
        captureId: captureId,
        plaintext: plaintext,
      );

      expect(
        () => decryptCapture(
          key: key,
          captureId: '00000000-0000-4000-8000-000000000000',
          envelope: envelope,
        ),
        throwsA(anything),
      );
    });

    test('refuse une clé qui ne fait pas 256 bits', () {
      expect(
        () => encryptCapture(
          key: Uint8List(16),
          nonce: nonce,
          captureId: captureId,
          plaintext: plaintext,
        ),
        throwsA(anything),
      );
    });

    test('refuse un nonce qui ne fait pas 96 bits', () {
      expect(
        () => encryptCapture(
          key: key,
          nonce: Uint8List(8),
          captureId: captureId,
          plaintext: plaintext,
        ),
        throwsA(anything),
      );
    });

    test("refuse une enveloppe dont le marqueur est inconnu", () {
      expect(
        () => decryptCapture(
          key: key,
          captureId: captureId,
          envelope: Uint8List(64),
        ),
        throwsA(anything),
      );
    });

    test('refuse une enveloppe altérée', () async {
      final envelope = await encryptCapture(
        key: key,
        nonce: nonce,
        captureId: captureId,
        plaintext: plaintext,
      );
      envelope[envelope.length - 1] ^= 0xFF;

      expect(
        () => decryptCapture(
          key: key,
          captureId: captureId,
          envelope: envelope,
        ),
        throwsA(anything),
      );
    });
  });
}
