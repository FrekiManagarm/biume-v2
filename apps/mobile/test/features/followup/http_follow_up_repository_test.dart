import 'package:biume_mobile/core/failure.dart';
import 'package:biume_mobile/features/followup/data/http_follow_up_repository.dart';
import 'package:biume_mobile/features/followup/domain/follow_up_questionnaire.dart';
import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  late Dio dio;
  late HttpFollowUpRepository repository;

  setUp(() {
    dio = Dio(BaseOptions(baseUrl: 'https://api.test'));
    repository = HttpFollowUpRepository(dio);
  });

  test(
    'poste l\'échéance en UTC et le questionnaire exact du contrat',
    () async {
      String? chemin;
      Map<String, dynamic>? envoye;
      dio.interceptors.add(
        InterceptorsWrapper(
          onRequest: (options, handler) {
            chemin = options.path;
            envoye = (options.data as Map).cast<String, dynamic>();
            handler.resolve(
              Response(
                requestOptions: options,
                statusCode: 200,
                data: const <String, dynamic>{},
              ),
            );
          },
        ),
      );

      final dueAt = DateTime(2026, 9, 10, 10);
      final result = await repository.schedule('report-1', dueAt);

      expect(result.isSuccess, isTrue);
      expect(chemin, '/api/mobile/v1/reports/report-1/followup');
      expect(envoye!['dueAt'], dueAt.toUtc().toIso8601String());
      expect(envoye!['questionnaire'], defaultFollowUpQuestionnaire);
    },
  );

  test('traduit un refus de brouillon en échec de domaine', () async {
    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) {
          handler.reject(
            DioException(
              requestOptions: options,
              response: Response(
                requestOptions: options,
                statusCode: 409,
                data: {'code': 'conflict', 'message': 'Rapport en brouillon.'},
              ),
            ),
          );
        },
      ),
    );

    final result = await repository.schedule('report-1', DateTime(2026, 9, 10));

    expect(result.failureOrNull, isA<ConflictFailure>());
    expect(result.failureOrNull!.message, 'Rapport en brouillon.');
  });

  test('traduit une panne réseau, jamais le message de transport', () async {
    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) {
          handler.reject(
            DioException(
              requestOptions: options,
              type: DioExceptionType.connectionError,
            ),
          );
        },
      ),
    );

    final result = await repository.schedule('report-1', DateTime(2026, 9, 10));

    expect(result.failureOrNull, isA<NetworkFailure>());
  });
}
