import 'dart:io';
import 'dart:math';
import 'dart:typed_data';

import 'package:crypto/crypto.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:path/path.dart' as p;
import 'package:path_provider/path_provider.dart';

import '../../../core/crypto/capture_envelope.dart';
import '../domain/audio_recorder.dart';

/// Clé de chiffrement des dictées, dans le trousseau système.
const String _captureKeyName = 'biume.capture.key';

class FileCaptureFiles implements CaptureFiles {
  FileCaptureFiles(this._storage, {Random? random})
    : _random = random ?? Random.secure();

  final FlutterSecureStorage _storage;
  final Random _random;

  /// Une seule clé par installation, générée à la première dictée et rangée
  /// dans le trousseau — jamais dans des préférences en clair.
  ///
  /// Elle ne quitte pas l'appareil : le chiffrement protège un téléphone perdu,
  /// pas le transit, que TLS couvre déjà.
  Future<Uint8List> _key() async {
    final existing = await _storage.read(key: _captureKeyName);
    if (existing != null) {
      return Uint8List.fromList(
        List<int>.generate(
          existing.length ~/ 2,
          (i) => int.parse(existing.substring(i * 2, i * 2 + 2), radix: 16),
        ),
      );
    }

    final fresh = Uint8List.fromList(
      List<int>.generate(captureKeyLength, (_) => _random.nextInt(256)),
    );
    await _storage.write(
      key: _captureKeyName,
      value: fresh.map((b) => b.toRadixString(16).padLeft(2, '0')).join(),
    );
    return fresh;
  }

  Future<Directory> _directory() async {
    final base = await getApplicationDocumentsDirectory();
    final dir = Directory(p.join(base.path, 'captures'));
    if (!dir.existsSync()) await dir.create(recursive: true);
    return dir;
  }

  @override
  Future<String> pathFor(String captureId) async =>
      p.join((await _directory()).path, '$captureId.m4a');

  @override
  Future<int> sizeOf(String path) => File(path).length();

  @override
  Future<String> sha256Of(String path) async =>
      sha256.convert(await File(path).readAsBytes()).toString();

  @override
  Future<String> encryptInPlace(String path, String captureId) async {
    final source = File(path);
    final envelope = await encryptCapture(
      key: await _key(),
      nonce: Uint8List.fromList(
        List<int>.generate(captureNonceLength, (_) => _random.nextInt(256)),
      ),
      captureId: captureId,
      plaintext: await source.readAsBytes(),
    );

    final target = File('$path.enc');
    await target.writeAsBytes(envelope, flush: true);
    // Le clair disparaît dès que l'enveloppe est écrite : sur un téléphone
    // perdu, il ne doit rester que du chiffré.
    await source.delete();

    return target.path;
  }

  @override
  Future<List<int>> readDecrypted(String path, String captureId) async =>
      decryptCapture(
        key: await _key(),
        captureId: captureId,
        envelope: await File(path).readAsBytes(),
      );

  @override
  Future<void> delete(String path) async {
    final file = File(path);
    if (file.existsSync()) await file.delete();
  }

  @override
  Future<bool> exists(String path) async => File(path).existsSync();
}
