import 'package:dio/dio.dart';

import '../../../core/failure.dart';
import '../../../core/network/api_error.dart';
import '../../../core/result.dart';
import '../domain/upload_client.dart';

/// Le PUT présigné et le corps binaire passent par **dio nu**, pas par
/// retrofit : le modèle déclaratif décrit des corps JSON, pas un transfert
/// d'octets vers une URL fournie à l'exécution. C'est la frontière posée pour
/// tout le projet, et c'est le seul endroit où elle s'applique.
class HttpCaptureApi implements CaptureApi {
  const HttpCaptureApi(this._dio);

  final Dio _dio;

  @override
  Future<Result<void>> declare({
    required String id,
    required String? appointmentId,
    required int durationMs,
    required int byteSize,
    required String sha256,
    required DateTime createdAt,
  }) async {
    try {
      await _dio.post<Map<String, dynamic>>(
        '/api/mobile/v1/captures',
        data: {
          'id': id,
          'appointmentId': appointmentId,
          'durationMs': durationMs,
          'mimeType': 'audio/mp4',
          'byteSize': byteSize,
          'sha256': sha256,
          'createdAt': createdAt.toUtc().toIso8601String(),
        },
      );
      return const Success(null);
    } on DioException catch (error) {
      // Une dictée déjà déclarée n'est pas un échec : l'identifiant vient de
      // l'appareil, et rejouer la déclaration est le comportement attendu
      // après une reprise.
      if (error.response?.statusCode == 409) return const Success(null);
      return Err(failureFromDioException(error));
    }
  }

  @override
  Future<Result<UploadSession>> requestUpload(String captureId) async {
    try {
      final response = await _dio.post<Map<String, dynamic>>(
        '/api/mobile/v1/captures/$captureId/upload-session',
      );
      final data = response.data!;

      return Success(
        UploadSession(
          url: data['url'] as String,
          headers: Map<String, String>.from(
            data['headers'] as Map? ?? const {},
          ),
          expiresAt: DateTime.parse(data['expiresAt'] as String),
        ),
      );
    } on DioException catch (error) {
      return Err(failureFromDioException(error));
    }
  }

  @override
  Future<Result<void>> attach(String captureId, String patientId) async {
    try {
      await _dio.post<Map<String, dynamic>>(
        '/api/mobile/v1/captures/$captureId/attach',
        data: {'patientId': patientId},
      );
      return const Success(null);
    } on DioException catch (error) {
      return Err(failureFromDioException(error));
    }
  }

  @override
  Future<Result<String>> putBytes(
    UploadSession session,
    List<int> bytes,
  ) async {
    try {
      // Client neuf, sans base ni intercepteurs : le jeton porteur ne doit
      // jamais partir vers le stockage objet, qui n'a rien à en faire.
      final response = await Dio().put<void>(
        session.url,
        data: Stream.fromIterable([bytes]),
        options: Options(
          headers: {...session.headers, 'content-length': bytes.length},
          contentType: session.headers['content-type'] ?? 'audio/mp4',
        ),
      );

      final etag = response.headers.value('etag');
      if (etag == null) {
        return const Err(
          ServerFailure(message: "Le stockage n'a pas confirmé l'envoi."),
        );
      }

      return Success(etag);
    } on DioException catch (error) {
      return Err(failureFromDioException(error));
    }
  }

  @override
  Future<Result<void>> complete(String captureId, String etag) async {
    try {
      await _dio.post<Map<String, dynamic>>(
        '/api/mobile/v1/captures/$captureId/complete',
        data: {'etag': etag},
      );
      return const Success(null);
    } on DioException catch (error) {
      return Err(failureFromDioException(error));
    }
  }
}
