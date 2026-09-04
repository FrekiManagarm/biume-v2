import 'dart:convert';

import 'package:collection/collection.dart';
import 'package:dio/dio.dart';
import 'package:drift/drift.dart';

import '../../../core/crypto/local_cipher.dart';
import '../../../core/database/app_database.dart';
import '../../../core/network/api_error.dart';
import '../../../core/result.dart';
import '../../report/domain/proposal.dart';
import '../domain/patient.dart';
import '../domain/patient_history.dart';
import '../domain/patient_repository.dart';

/// Combien d'animaux `refreshSheetsFor` traite à la fois. Quelques requêtes
/// de front — pas quarante d'un coup sur un réseau de campagne, pas une
/// seule à la fois qui mettrait des minutes pour la fenêtre d'une semaine.
const _sheetsConcurrency = 4;

class PatientRepositoryImpl implements PatientRepository {
  const PatientRepositoryImpl(this._db, this._dio, this._cipher);

  final AppDatabase _db;
  final Dio _dio;

  /// Le dernier compte rendu finalisé mis en cache porte la transcription
  /// intégrale de la séance et les propositions cliniques. Il ne descend
  /// jamais en clair dans SQLite : la menace posée par le design parent
  /// (section 3) est un appareil perdu ou volé.
  final LocalCipher _cipher;

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
    // Capturée avant le départ des requêtes : si le cache est vidé pendant
    // qu'elles sont en vol — un changement d'entreprise — ce qu'elles
    // rapportent appartient au cabinet précédent et ne doit rien écrire.
    final generation = _db.readCacheGeneration;

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

    await _db.writeReadCache(generation, () async {
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
  Future<Set<String>> cachedReportIds(String patientId) async {
    final rows = await (_db.select(
      _db.cachedReports,
    )..where((r) => r.patientId.equals(patientId))).get();
    return rows.map((row) => row.reportId).toSet();
  }

  @override
  Future<Result<void>> refreshSheetsFor(Iterable<String> patientIds) async {
    // Même génération pour toutes les écritures de ce rafraîchissement :
    // propriétaires, historiques et comptes rendus partent ensemble et
    // doivent renoncer ensemble si l'entreprise change entre-temps.
    final generation = _db.readCacheGeneration;

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

    await _db.writeReadCache(generation, () async {
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

    // Le dernier compte rendu finalisé de chaque animal, par lots concurrents
    // bornés : vingt animaux en file indienne, sur un réseau de campagne,
    // retarderaient tout ce que `refreshForeground` fait par ailleurs. Un
    // échec isolé — réseau coupé en cours de route, animal sans historique —
    // ne doit pas priver les autres animaux de leur fiche hors ligne.
    await _forEachWithConcurrency(
      patientIds,
      _sheetsConcurrency,
      (patientId) => _refreshSheetFor(patientId, generation),
    );

    return const Success(null);
  }

  Future<void> _refreshSheetFor(String patientId, int generation) async {
    final List<PatientHistoryEntry> entries;
    try {
      final historyResult = await history(patientId);
      if (historyResult is! Success<List<PatientHistoryEntry>>) return;
      entries = historyResult.value;

      // L'historique lui-même doit survivre à l'absence de réseau : lui
      // seul porte la date et le motif des séances passées, que
      // `CachedReports` ne porte pas et que la fenêtre d'agenda en cache ne
      // couvre plus. Capture large — pas seulement une panne réseau : un
      // défaut de données sur un animal (une date serveur malformée, par
      // exemple) ne doit ni faire échouer les autres animaux du bassin de
      // travailleurs, ni faire rejeter le résultat rendu par
      // `refreshSheetsFor` — une erreur asynchrone non rattrapée dans un
      // rafraîchissement d'arrière-plan ne se diagnostique jamais.
      await _db.writeReadCache(generation, () async {
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
    } catch (_) {
      // Cet animal restera sans historique en cache jusqu'au prochain
      // rafraîchissement, sans bloquer les autres.
      return;
    }

    final lastFinalized = entries.firstWhereOrNull(
      (entry) => entry.hasFinalizedReport,
    );
    if (lastFinalized == null) return;

    try {
      final response = await _dio.get<Map<String, dynamic>>(
        '/api/mobile/v1/reports/${lastFinalized.reportId}/proposals',
      );
      final data = response.data!;
      // Chiffré avant d'entrer dans la transaction : le clair ne touche pas
      // le disque, même le temps d'une écriture interrompue.
      final sealed = await _cipher.seal(
        id: lastFinalized.reportId!,
        clear: jsonEncode(data),
      );
      await _db.writeReadCache(generation, () async {
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
                payload: sealed,
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

  /// Un petit bassin de travailleurs plutôt qu'un `Future.wait` sur toute la
  /// liste : `limit` tâches tirent chacune le prochain animal d'une file
  /// partagée, sans jamais dépasser cette concurrence, et sans attendre
  /// qu'un lot entier se termine avant d'entamer le suivant.
  Future<void> _forEachWithConcurrency<T>(
    Iterable<T> items,
    int limit,
    Future<void> Function(T item) action,
  ) async {
    final iterator = items.iterator;

    Future<void> worker() async {
      while (iterator.moveNext()) {
        await action(iterator.current);
      }
    }

    await Future.wait(List.generate(limit, (_) => worker()));
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
