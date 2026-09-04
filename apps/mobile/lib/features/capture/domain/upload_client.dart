import '../../../core/result.dart';

/// Ce que le serveur renvoie pour téléverser une dictée.
class UploadSession {
  const UploadSession({
    required this.url,
    required this.headers,
    required this.expiresAt,
  });

  /// URL signée, valable dix minutes. **Ne doit jamais être journalisée** : elle
  /// donnerait accès à l'audio, et survivrait à la purge des vingt-quatre
  /// heures dans un journal de plantage.
  final String url;
  final Map<String, String> headers;
  final DateTime expiresAt;
}

/// Le dialogue avec `/api/mobile/v1` pour une dictée.
abstract class CaptureApi {
  /// Déclare la dictée. Idempotent : l'identifiant vient de l'appareil, donc
  /// renvoyer la même déclaration ne crée pas de doublon.
  Future<Result<void>> declare({
    required String id,
    required String? appointmentId,
    required int durationMs,
    required int byteSize,
    required String sha256,
    required DateTime createdAt,
  });

  Future<Result<UploadSession>> requestUpload(String captureId);

  /// Rattache une capture libre à un animal. Idempotent sur le même animal.
  Future<Result<void>> attach(String captureId, String patientId);

  /// Envoie les octets **en clair** vers l'URL signée. Le chiffrement est
  /// local : il protège l'appareil, pas le transit, que TLS couvre déjà. Sans
  /// ça le serveur ne pourrait pas transcrire.
  Future<Result<String>> putBytes(UploadSession session, List<int> bytes);

  /// Confirme l'arrivée de l'objet, avec l'étiquette rendue par le stockage.
  Future<Result<void>> complete(String captureId, String etag);
}
