import 'package:dio/dio.dart';
import 'package:drift/drift.dart';

import '../../../core/database/app_database.dart';
import '../../../core/network/api_error.dart';
import '../../../core/result.dart';
import '../domain/appointment_write_repository.dart';

/// Suit le gabarit de `HttpTranscriptRepository` et `HttpCaptureApi` : chaque
/// appel traduit son `DioException` en échec de domaine, jamais en message de
/// transport.
class HttpAppointmentWriteRepository implements AppointmentWriteRepository {
  const HttpAppointmentWriteRepository(this._dio, this._db);

  final Dio _dio;
  final AppDatabase _db;

  AppointmentWriteOutcome _parse(Map<String, dynamic> data) {
    return AppointmentWriteOutcome(
      appointmentId: data['appointmentId'] as String,
      reportId: data['reportId'] as String?,
      conflicts: (data['conflicts'] as List<dynamic>? ?? const [])
          .whereType<Map<String, dynamic>>()
          .map(
            (item) => AppointmentConflict(
              appointmentId: item['appointmentId'] as String,
              beginAt: DateTime.parse(item['beginAt'] as String),
              patientName: item['patientName'] as String?,
            ),
          )
          .toList(),
    );
  }

  @override
  Future<Result<AppointmentWriteOutcome>> create({
    required String patientId,
    required DateTime beginAt,
    required DateTime endAt,
    required bool atHome,
  }) async {
    try {
      final response = await _dio.post<Map<String, dynamic>>(
        '/api/mobile/v1/appointments',
        data: {
          'patientId': patientId,
          'beginAt': beginAt.toUtc().toIso8601String(),
          'endAt': endAt.toUtc().toIso8601String(),
          'atHome': atHome,
        },
      );
      return Success(_parse(response.data!));
    } on DioException catch (error) {
      return Err(failureFromDioException(error));
    }
  }

  @override
  Future<Result<AppointmentWriteOutcome>> move(
    String appointmentId, {
    required DateTime beginAt,
    required DateTime endAt,
  }) async {
    try {
      final response = await _dio.post<Map<String, dynamic>>(
        '/api/mobile/v1/appointments/$appointmentId/move',
        data: {
          'beginAt': beginAt.toUtc().toIso8601String(),
          'endAt': endAt.toUtc().toIso8601String(),
        },
      );
      return Success(_parse(response.data!));
    } on DioException catch (error) {
      return Err(failureFromDioException(error));
    }
  }

  @override
  Future<Duration> defaultDuration() async {
    final row =
        await (_db.select(_db.cachedAppointments)
              ..orderBy([(row) => OrderingTerm.desc(row.beginAt)])
              ..limit(1))
            .getSingleOrNull();
    if (row == null) return const Duration(hours: 1);
    final duration = row.endAt.difference(row.beginAt);
    // Une ligne dont la fin précède ou égale le début n'est pas une durée
    // exploitable — la même garde existe côté serveur (`defaultDurationMs`)
    // : les deux moitiés du produit doivent s'accorder sur ce qu'est une
    // durée acceptable.
    return duration.isNegative || duration == Duration.zero
        ? const Duration(hours: 1)
        : duration;
  }
}
