import 'dart:convert';

import 'package:collection/collection.dart';
import 'package:dio/dio.dart';
import 'package:drift/drift.dart';

import '../../../core/database/app_database.dart';
import '../../../core/network/api_error.dart';
import '../../../core/result.dart';
import '../../report/domain/proposal.dart';
import '../domain/patient.dart';
import '../domain/patient_history.dart';
import '../domain/patient_repository.dart';

class PatientRepositoryImpl implements PatientRepository {
  const PatientRepositoryImpl(this._db, this._dio);

  final AppDatabase _db;
  final Dio _dio;

  @override
  Stream<List<Patient>> watchAll() =>
      (_db.select(_db.cachedPatients)..orderBy([(p) => OrderingTerm.asc(p.name)]))
          .watch()
          .map((rows) => rows.map(_rowToPatient).toList());

  @override
  Future<Patient?> byId(String id) async {
    final row = await (_db.select(
      _db.cachedPatients,
    )..where((p) => p.id.equals(id))).getSingleOrNull();
    return row == null ? null : _rowToPatient(row);
  }

  @override
  Future<Result<void>> refresh() async {
    final items = <Map<String, dynamic>>[];
    String? cursor;
    try {
      // Pages de cinquante, bornées par le contrat ; on suit le curseur
      // jusqu'au bout pour que le sélecteur hors ligne soit complet.
      do {
        final response = await _dio.get<Map<String, dynamic>>(
          '/api/mobile/v1/patients',
          queryParameters: {'limit': 50, 'cursor': ?cursor},
        );
        items.addAll(
          (response.data?['items'] as List<dynamic>? ?? const [])
              .whereType<Map<String, dynamic>>(),
        );
        cursor = response.data?['nextCursor'] as String?;
      } while (cursor != null);
    } on DioException catch (error) {
      // Le cache n'est pas touché : il vaut mieux un sélecteur qui date
      // qu'une liste vide dans une écurie sans réseau.
      return Err(failureFromDioException(error));
    }

    await _db.transaction(() async {
      await _db.delete(_db.cachedPatients).go();
      for (final item in items) {
        await _db.into(_db.cachedPatients).insert(
              CachedPatientsCompanion.insert(
                id: item['id'] as String,
                ownerId: item['ownerId'] as String,
                ownerName: item['ownerName'] as String,
                name: item['name'] as String,
                species: item['species'] as String,
                breed: Value(item['breed'] as String?),
                birthDate: Value(_parseDate(item['birthDate'])),
                lastAppointmentAt: Value(_parseDate(item['lastAppointmentAt'])),
              ),
              mode: InsertMode.insertOrReplace,
            );
      }
    });
    return const Success(null);
  }

  @override
  Future<Result<List<PatientHistoryEntry>>> history(String patientId) async {
    try {
      final response = await _dio.get<Map<String, dynamic>>(
        '/api/mobile/v1/patients/$patientId/history',
        queryParameters: {'limit': 50},
      );
      final entries = (response.data?['items'] as List<dynamic>? ?? const [])
          .whereType<Map<String, dynamic>>()
          .map(_itemToHistoryEntry)
          .toList();
      return Success(entries);
    } on DioException catch (error) {
      return Err(failureFromDioException(error));
    }
  }

  @override
  Future<List<PatientHistoryEntry>> cachedHistory(String patientId) async {
    final rows = await (_db.select(_db.cachedPatientHistoryEntries)
          ..where((h) => h.patientId.equals(patientId))
          ..orderBy([(h) => OrderingTerm.desc(h.beginAt)]))
        .get();
    return rows.map(_rowToHistoryEntry).toList();
  }

  @override
  Future<Result<void>> refreshSheetsFor(Iterable<String> patientIds) async {
    final owners = <Map<String, dynamic>>[];
    String? cursor;
    try {
      do {
        final response = await _dio.get<Map<String, dynamic>>(
          '/api/mobile/v1/owners',
          queryParameters: {'limit': 50, 'cursor': ?cursor},
        );
        owners.addAll(
          (response.data?['items'] as List<dynamic>? ?? const [])
              .whereType<Map<String, dynamic>>(),
        );
        cursor = response.data?['nextCursor'] as String?;
      } while (cursor != null);
    } on DioException catch (error) {
      // Le cache n'est pas touché : sans propriétaires, aucune fiche ne peut
      // être construite hors ligne — autant garder ce qui y est déjà.
      return Err(failureFromDioException(error));
    }

    await _db.transaction(() async {
      await _db.delete(_db.cachedOwners).go();
      for (final owner in owners) {
        await _db.into(_db.cachedOwners).insert(
              CachedOwnersCompanion.insert(
                id: owner['id'] as String,
                name: owner['name'] as String,
                email: Value(owner['email'] as String?),
                phone: Value(owner['phone'] as String?),
                city: Value(owner['city'] as String?),
              ),
              mode: InsertMode.insertOrReplace,
            );
      }
    });

    // Le dernier compte rendu finalisé de chaque animal, un par un : un échec
    // isolé — réseau coupé en cours de route, animal sans historique — ne doit
    // pas priver les autres animaux de leur fiche hors ligne.
    for (final patientId in patientIds) {
      await _refreshSheetFor(patientId);
    }

    return const Success(null);
  }

  Future<void> _refreshSheetFor(String patientId) async {
    final historyResult = await history(patientId);
    if (historyResult is! Success<List<PatientHistoryEntry>>) return;
    final entries = historyResult.value;

    // L'historique lui-même doit survivre à l'absence de réseau : lui seul
    // porte la date et le motif des séances passées, que `CachedReports` ne
    // porte pas et que la fenêtre d'agenda en cache ne couvre plus.
    await _db.transaction(() async {
      await (_db.delete(
        _db.cachedPatientHistoryEntries,
      )..where((h) => h.patientId.equals(patientId))).go();
      for (final entry in entries) {
        await _db.into(_db.cachedPatientHistoryEntries).insert(
              CachedPatientHistoryEntriesCompanion.insert(
                appointmentId: entry.appointmentId,
                patientId: patientId,
                beginAt: entry.beginAt,
                reportId: Value(entry.reportId),
                reportStatus: Value(
                  entry.reportStatus != null
                      ? reportStatusToApi(entry.reportStatus!)
                      : null,
                ),
                consultationReason: entry.consultationReason,
              ),
              mode: InsertMode.insertOrReplace,
            );
      }
    });

    final lastFinalized = entries.firstWhereOrNull(
      (entry) => entry.hasFinalizedReport,
    );
    if (lastFinalized == null) return;

    try {
      final response = await _dio.get<Map<String, dynamic>>(
        '/api/mobile/v1/reports/${lastFinalized.reportId}/proposals',
      );
      final data = response.data!;
      await _db.transaction(() async {
        // Un seul compte rendu en cache par animal : si celui qui était
        // « le dernier finalisé » a changé depuis la dernière synchronisation,
        // l'ancien ne doit pas traîner indéfiniment.
        await (_db.delete(
          _db.cachedReports,
        )..where((r) => r.patientId.equals(patientId))).go();
        await _db.into(_db.cachedReports).insert(
              CachedReportsCompanion.insert(
                reportId: lastFinalized.reportId!,
                patientId: patientId,
                appointmentId: Value(lastFinalized.appointmentId),
                status: data['status'] as String,
                payload: jsonEncode(data),
                cachedAt: DateTime.now(),
              ),
              mode: InsertMode.insertOrReplace,
            );
      });
    } on DioException {
      // Ce compte rendu restera indisponible hors ligne pour cet animal,
      // sans bloquer les suivants.
    }
  }

  Patient _rowToPatient(CachedPatient r) => Patient(
    id: r.id,
    ownerId: r.ownerId,
    ownerName: r.ownerName,
    name: r.name,
    species: r.species,
    breed: r.breed,
    birthDate: r.birthDate,
  );

  PatientHistoryEntry _itemToHistoryEntry(Map<String, dynamic> item) =>
      PatientHistoryEntry(
        appointmentId: item['appointmentId'] as String,
        beginAt: DateTime.parse(item['beginAt'] as String),
        reportId: item['reportId'] as String?,
        reportStatus: item['reportStatus'] != null
            ? reportStatusFrom(item['reportStatus'] as String)
            : null,
        consultationReason: item['consultationReason'] as String? ?? '',
      );

  PatientHistoryEntry _rowToHistoryEntry(CachedPatientHistoryEntry row) =>
      PatientHistoryEntry(
        appointmentId: row.appointmentId,
        beginAt: row.beginAt,
        reportId: row.reportId,
        reportStatus: row.reportStatus != null
            ? reportStatusFrom(row.reportStatus!)
            : null,
        consultationReason: row.consultationReason,
      );

  DateTime? _parseDate(dynamic value) =>
      value == null ? null : DateTime.parse(value as String);
}
