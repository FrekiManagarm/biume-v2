import 'package:dio/dio.dart';
import 'package:drift/drift.dart';

import '../../../core/database/app_database.dart';
import '../../../core/network/api_error.dart';
import '../../../core/result.dart';
import '../domain/patient.dart';
import '../domain/patient_repository.dart';

class PatientRepositoryImpl implements PatientRepository {
  const PatientRepositoryImpl(this._db, this._dio);

  final AppDatabase _db;
  final Dio _dio;

  @override
  Stream<List<Patient>> watchAll() =>
      (_db.select(_db.cachedPatients)..orderBy([(p) => OrderingTerm.asc(p.name)]))
          .watch()
          .map((rows) => rows
              .map((r) => Patient(
                    id: r.id,
                    ownerId: r.ownerId,
                    ownerName: r.ownerName,
                    name: r.name,
                    species: r.species,
                    breed: r.breed,
                  ))
              .toList());

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
              ),
              mode: InsertMode.insertOrReplace,
            );
      }
    });
    return const Success(null);
  }
}
