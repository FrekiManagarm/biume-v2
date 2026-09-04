import 'package:dio/dio.dart';
import 'package:drift/drift.dart';

import '../../../core/database/app_database.dart';
import '../../../core/network/api_error.dart';
import '../../../core/result.dart';
import '../domain/agenda_repository.dart';
import '../domain/appointment.dart';

/// Taille de page imposée par le contrat serveur pour la pagination de
/// l'agenda mobile.
const mobileAppointmentsPageSize = 50;

class AgendaRepositoryImpl implements AgendaRepository {
  const AgendaRepositoryImpl(this._db, this._dio);

  final AppDatabase _db;
  final Dio _dio;

  @override
  Stream<List<Appointment>> watchWindow(DateTime from, DateTime to) =>
      _db.watchAppointmentsBetween(from, to).map(
            (rows) => rows.map(_rowToAppointment).toList(),
          );

  @override
  Future<Result<void>> refreshWindow(DateTime from, DateTime to) async {
    final List<Map<String, dynamic>> items;
    switch (await _fetchAll(from, to)) {
      case Success(:final value):
        items = value;
      case Err(:final failure):
        // Le cache n'est pas touché : il vaut mieux un agenda qui date qu'un
        // écran vide dans une écurie sans réseau.
        return Err(failure);
    }

    // Remplacement de toute la fenêtre, dans une transaction : un
    // rafraîchissement interrompu ne laisse jamais l'agenda à moitié écrit.
    await _db.transaction(() async {
      await (_db.delete(_db.cachedAppointments)
            ..where((row) => row.beginAt.isBiggerOrEqualValue(from))
            ..where((row) => row.beginAt.isSmallerThanValue(to)))
          .go();

      for (final item in items) {
        await _db.into(_db.cachedAppointments).insert(
              _itemToCompanion(item),
              mode: InsertMode.insertOrReplace,
            );
      }
    });

    return const Success(null);
  }

  @override
  Future<Result<List<Appointment>>> fetchDay(DateTime day) async {
    final start = DateTime.utc(day.year, day.month, day.day);
    final end = start.add(const Duration(days: 1));

    return switch (await _fetchAll(start, end)) {
      Success(:final value) => Success(value.map(_itemToAppointment).toList()),
      Err(:final failure) => Err(failure),
    };
  }

  /// Suit `nextCursor` jusqu'au bout, pages de [mobileAppointmentsPageSize],
  /// pour que la fenêtre — ou le jour — soit complet en un seul appel côté
  /// domaine.
  Future<Result<List<Map<String, dynamic>>>> _fetchAll(
    DateTime from,
    DateTime to,
  ) async {
    final items = <Map<String, dynamic>>[];
    String? cursor;
    try {
      do {
        final response = await _dio.get<Map<String, dynamic>>(
          '/api/mobile/v1/appointments',
          queryParameters: {
            'from': from.toIso8601String(),
            'to': to.toIso8601String(),
            'limit': mobileAppointmentsPageSize,
            'cursor': ?cursor,
          },
        );
        items.addAll(
          (response.data?['items'] as List<dynamic>? ?? const [])
              .whereType<Map<String, dynamic>>(),
        );
        cursor = response.data?['nextCursor'] as String?;
      } while (cursor != null);
    } on DioException catch (error) {
      return Err(failureFromDioException(error));
    }
    return Success(items);
  }

  Appointment _rowToAppointment(CachedAppointment row) => Appointment(
        id: row.id,
        patientId: row.patientId,
        patientName: row.patientName,
        species: row.species,
        beginAt: row.beginAt,
        endAt: row.endAt,
        status: row.status,
      );

  Appointment _itemToAppointment(Map<String, dynamic> item) => Appointment(
        id: item['id'] as String,
        patientId: item['patientId'] as String,
        patientName: item['patientName'] as String,
        species: item['animalType'] as String,
        beginAt: DateTime.parse(item['beginAt'] as String),
        endAt: DateTime.parse(item['endAt'] as String),
        status: item['status'] as String,
      );

  CachedAppointmentsCompanion _itemToCompanion(Map<String, dynamic> item) =>
      CachedAppointmentsCompanion.insert(
        id: item['id'] as String,
        patientId: item['patientId'] as String,
        patientName: item['patientName'] as String,
        species: item['animalType'] as String,
        beginAt: DateTime.parse(item['beginAt'] as String),
        endAt: DateTime.parse(item['endAt'] as String),
        status: item['status'] as String,
      );
}
