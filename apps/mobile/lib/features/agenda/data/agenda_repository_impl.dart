import 'package:dio/dio.dart';
import 'package:drift/drift.dart';

import '../../../core/database/app_database.dart';
import '../../../core/network/api_error.dart';
import '../../../core/result.dart';
import '../domain/agenda_repository.dart';
import '../domain/appointment.dart';

class AgendaRepositoryImpl implements AgendaRepository {
  const AgendaRepositoryImpl(this._db, this._dio);

  final AppDatabase _db;
  final Dio _dio;

  @override
  Stream<List<Appointment>> watchDay(DateTime day) =>
      _db.watchAppointmentsOn(day).map(
            (rows) => rows
                .map(
                  (row) => Appointment(
                    id: row.id,
                    patientId: row.patientId,
                    patientName: row.patientName,
                    species: row.species,
                    beginAt: row.beginAt,
                    endAt: row.endAt,
                    status: row.status,
                  ),
                )
                .toList(),
          );

  @override
  Future<Result<void>> refresh(DateTime day) async {
    final start = DateTime.utc(day.year, day.month, day.day);
    final end = start.add(const Duration(days: 1));

    try {
      final response = await _dio.get<Map<String, dynamic>>(
        '/api/mobile/v1/appointments',
        queryParameters: {
          'from': start.toIso8601String(),
          'to': end.toIso8601String(),
        },
      );

      final items = (response.data?['items'] as List<dynamic>? ?? const [])
          .whereType<Map<String, dynamic>>()
          .toList();

      // Remplacement du seul jour concerné, dans une transaction : un
      // rafraîchissement interrompu ne laisse jamais l'agenda à moitié écrit.
      await _db.transaction(() async {
        await (_db.delete(_db.cachedAppointments)
              ..where((row) => row.beginAt.isBiggerOrEqualValue(start))
              ..where((row) => row.beginAt.isSmallerThanValue(end)))
            .go();

        for (final item in items) {
          await _db.into(_db.cachedAppointments).insert(
                CachedAppointmentsCompanion.insert(
                  id: item['id'] as String,
                  patientId: item['patientId'] as String,
                  patientName: item['patientName'] as String,
                  species: item['animalType'] as String,
                  beginAt: DateTime.parse(item['beginAt'] as String),
                  endAt: DateTime.parse(item['endAt'] as String),
                  status: item['status'] as String,
                ),
                mode: InsertMode.insertOrReplace,
              );
        }
      });

      return const Success(null);
    } on DioException catch (error) {
      // Le cache n'est pas touché : il vaut mieux un agenda qui date qu'un
      // écran vide dans une écurie sans réseau.
      return Err(failureFromDioException(error));
    }
  }
}
