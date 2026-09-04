import 'package:dio/dio.dart';

import '../../../core/network/api_error.dart';
import '../../../core/result.dart';
import '../domain/follow_up_questionnaire.dart';
import '../domain/follow_up_repository.dart';

/// Suit le gabarit de `HttpTranscriptRepository` : chaque appel traduit son
/// `DioException` en échec de domaine, jamais en message de transport.
class HttpFollowUpRepository implements FollowUpRepository {
  const HttpFollowUpRepository(this._dio);

  final Dio _dio;

  @override
  Future<Result<void>> schedule(String reportId, DateTime dueAt) async {
    try {
      await _dio.post<Map<String, dynamic>>(
        '/api/mobile/v1/reports/$reportId/followup',
        data: {
          'dueAt': dueAt.toUtc().toIso8601String(),
          'questionnaire': defaultFollowUpQuestionnaire,
        },
      );
      return const Success(null);
    } on DioException catch (error) {
      return Err(failureFromDioException(error));
    }
  }
}
