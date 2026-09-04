import 'package:dio/dio.dart';

import '../../../core/network/api_error.dart';
import '../../../core/result.dart';
import '../domain/actionable_follow_up_repository.dart';
import '../domain/follow_up.dart';

/// Suit le gabarit de `HttpTodoApi` : chaque appel traduit son
/// `DioException` en échec de domaine, jamais en message de transport.
class HttpActionableFollowUpRepository implements ActionableFollowUpRepository {
  const HttpActionableFollowUpRepository(this._dio);

  final Dio _dio;

  /// La taille de page du contrat serveur. Au-delà, le serveur tronque.
  static const int _pageSize = 50;

  @override
  Future<Result<List<FollowUp>>> listActionable() async {
    try {
      final items = <FollowUp>[];
      String? cursor;
      do {
        final response = await _dio.get<Map<String, dynamic>>(
          '/api/mobile/v1/followups/actionable',
          queryParameters: {'limit': _pageSize, 'cursor': ?cursor},
        );
        final data = response.data!;
        items.addAll(
          (data['items'] as List<dynamic>)
              .whereType<Map<String, dynamic>>()
              .map(_followUpFrom),
        );
        cursor = data['nextCursor'] as String?;
      } while (cursor != null);
      return Success(items);
    } on DioException catch (error) {
      return Err(failureFromDioException(error));
    }
  }

  @override
  Future<Result<FollowUp>> markHandled(String followUpId) async {
    try {
      final response = await _dio.post<Map<String, dynamic>>(
        '/api/mobile/v1/followups/$followUpId/handled',
      );
      return Success(_followUpFrom(response.data!));
    } on DioException catch (error) {
      return Err(failureFromDioException(error));
    }
  }
}

FollowUp _followUpFrom(Map<String, dynamic> json) {
  final answer = json['answer'] as Map<String, dynamic>?;
  return FollowUp(
    id: json['id'] as String,
    reportId: json['reportId'] as String,
    patientName: json['patientName'] as String,
    ownerName: json['ownerName'] as String,
    // Un motif inconnu vient d'un serveur plus récent : on le laisse tomber
    // plutôt que de refuser tout le suivi.
    reasons: (json['alertReasons'] as List<dynamic>)
        .whereType<String>()
        .map(alertReasonFrom)
        .nonNulls
        .toList(),
    handled: json['handledAt'] != null,
    answer: answer == null ? null : _answerFrom(answer),
    answeredAt: switch (json['answeredAt']) {
      final String at => DateTime.parse(at),
      _ => null,
    },
    ownerPhone: json['ownerPhone'] as String?,
    ownerEmail: json['ownerEmail'] as String?,
    patientId: json['patientId'] as String?,
  );
}

FollowUpAnswer? _answerFrom(Map<String, dynamic> json) {
  final evolution = evolutionFrom(json['evolution'] as String);
  if (evolution == null) return null;
  return FollowUpAnswer(
    evolution: evolution,
    reaction: json['reaction'] as String? ?? '',
    wantsContact: json['wantsContact'] as bool? ?? false,
  );
}
