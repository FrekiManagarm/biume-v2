import 'package:dio/dio.dart';

import '../../../core/network/api_error.dart';
import '../../../core/result.dart';
import '../domain/todo_api.dart';
import '../domain/todo_item.dart';

/// Suit le gabarit de `HttpTranscriptRepository` et `HttpCaptureApi` : chaque
/// appel traduit son `DioException` en échec de domaine, jamais en message de
/// transport.
class HttpTodoApi implements TodoApi {
  const HttpTodoApi(this._dio);

  final Dio _dio;

  @override
  Future<Result<List<TodoItem>>> list() async {
    try {
      final response = await _dio.get<Map<String, dynamic>>(
        '/api/mobile/v1/todo',
      );
      final items = (response.data!['items'] as List<dynamic>)
          .whereType<Map<String, dynamic>>()
          .map(
            (item) => TodoItem(
              kind: todoKindFromApi(item['kind'] as String),
              captureId: item['captureId'] as String,
              reportId: item['reportId'] as String?,
              appointmentId: item['appointmentId'] as String?,
              patientName: item['patientName'] as String?,
              updatedAt: DateTime.parse(item['updatedAt'] as String),
            ),
          )
          .toList();
      return Success(items);
    } on DioException catch (error) {
      return Err(failureFromDioException(error));
    }
  }
}
