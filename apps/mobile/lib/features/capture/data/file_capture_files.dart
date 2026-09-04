import 'dart:io';
import 'dart:math';

import 'package:crypto/crypto.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:path/path.dart' as p;
import 'package:path_provider/path_provider.dart';

import '../../../core/crypto/capture_envelope.dart';
import '../../../core/crypto/device_key.dart';
import '../domain/audio_recorder.dart';

/// Clé de chiffrement des dictées, dans le trousseau système. Distincte de
/// celle du cache de lecture (`localCacheKeyName`) : une dictée porte du
/// travail irremplaçable, un cache se refait — les deux clés n'ont pas la
/// même valeur et ne doivent pas se perdre ensemble.
const String captureKeyName = 'biume.capture.key';

class FileCaptureFiles implements CaptureFiles {
  FileCaptureFiles(FlutterSecureStorage storage, {Random? random})
    : _random = random ?? Random.secure(),
      _key = deviceKeyFromSecureStorage(
        storage,
        name: captureKeyName,
        random: random,
      );

  final Random _random;
  final DeviceKeyReader _key;

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
      nonce: newCaptureNonce(_random),
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
