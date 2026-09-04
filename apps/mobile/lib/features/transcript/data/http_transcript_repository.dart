import 'package:dio/dio.dart';

import '../../../core/network/api_error.dart';
import '../../../core/result.dart';
import '../domain/transcript.dart';
import '../domain/transcript_repository.dart';

/// Suit le gabarit de `HttpCaptureApi` : chaque appel traduit son
/// `DioException` en échec de domaine, jamais en message de transport.
class HttpTranscriptRepository implements TranscriptRepository {
  const HttpTranscriptRepository(this._dio);

  final Dio _dio;

  @override
  Future<Result<Transcript>> load(String captureId) async {
    try {
      final response = await _dio.get<Map<String, dynamic>>(
        '/api/mobile/v1/captures/$captureId/transcript',
      );
      final data = response.data!;

      return Success(
        Transcript(
          captureId: captureId,
          status: transcriptStatusFrom(data['status'] as String),
          text: data['text'] as String,
        ),
      );
    } on DioException catch (error) {
      return Err(failureFromDioException(error));
    }
  }

  @override
  Future<Result<Transcript>> correct(String captureId, String text) async {
    try {
      final response = await _dio.post<Map<String, dynamic>>(
        '/api/mobile/v1/captures/$captureId/transcript',
        data: {'text': text},
      );
      final data = response.data!;

      return Success(
        Transcript(
          captureId: captureId,
          status: transcriptStatusFrom(data['status'] as String),
          text: data['text'] as String,
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
  Future<Result<String>> extract(String captureId) async {
    try {
      final response = await _dio.post<Map<String, dynamic>>(
        '/api/mobile/v1/captures/$captureId/extract',
      );
      final data = response.data!;

      return Success(data['reportId'] as String);
    } on DioException catch (error) {
      return Err(failureFromDioException(error));
    }
  }
}
