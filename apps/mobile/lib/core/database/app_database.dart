import 'dart:io';

import 'package:drift/drift.dart';
import 'package:drift/native.dart';
import 'package:path/path.dart' as p;
import 'package:path_provider/path_provider.dart';

part 'app_database.g.dart';

/// États locaux d'une dictée, imposés par le serveur.
///
/// Seul `review` atteint `queued` : valider une dictée est un acte délibéré du
/// praticien, et rien ne doit mettre en file un audio qu'il n'a jamais
/// réécouté et accepté.
enum LocalCaptureStatus {
  recording,
  review,
  queued,
  uploading,
  uploaded,
  needsAction,
  cancelled,
  expired,
}

/// La file de dictées : écriture, durable, critique. Perdre une dictée est
/// inacceptable, donc rien ici n'est purgé en dehors de la règle des
/// vingt-quatre heures.
class LocalCaptures extends Table {
  TextColumn get id => text()();
  TextColumn get appointmentId => text().nullable()();
  IntColumn get status => intEnum<LocalCaptureStatus>()();
  IntColumn get durationMs => integer()();
  IntColumn get byteSize => integer()();
  TextColumn get sha256 => text()();
  TextColumn get filePath => text().nullable()();
  IntColumn get attemptCount => integer().withDefault(const Constant(0))();
  TextColumn get lastErrorCode => text().nullable()();
  DateTimeColumn get nextAttemptAt => dateTime().nullable()();
  DateTimeColumn get createdAt => dateTime()();
  DateTimeColumn get expiresAt => dateTime()();

  @override
  Set<Column> get primaryKey => {id};
}

/// Le cache de lecture : jetable et reconstructible. En lecture seule côté
/// application — aucune écriture n'y est mise en file, donc aucun conflit n'est
/// possible par construction.
class CachedAppointments extends Table {
  TextColumn get id => text()();
  TextColumn get patientId => text()();
  TextColumn get patientName => text()();
  TextColumn get species => text()();
  DateTimeColumn get beginAt => dateTime()();
  DateTimeColumn get endAt => dateTime()();
  TextColumn get status => text()();

  @override
  Set<Column> get primaryKey => {id};
}

class CachedOwners extends Table {
  TextColumn get id => text()();
  TextColumn get name => text()();
  TextColumn get email => text().nullable()();
  TextColumn get phone => text().nullable()();
  TextColumn get city => text().nullable()();

  @override
  Set<Column> get primaryKey => {id};
}

class CachedPatients extends Table {
  TextColumn get id => text()();
  TextColumn get ownerId => text()();
  TextColumn get ownerName => text()();
  TextColumn get name => text()();
  TextColumn get species => text()();
  TextColumn get breed => text().nullable()();

  @override
  Set<Column> get primaryKey => {id};
}

@DriftDatabase(
  tables: [LocalCaptures, CachedAppointments, CachedOwners, CachedPatients],
)
class AppDatabase extends _$AppDatabase {
  AppDatabase() : super(_openConnection());

  AppDatabase.forTesting(super.executor);

  @override
  int get schemaVersion => 1;

  /// Vide **uniquement** le cache de lecture. La file de dictées n'est jamais
  /// touchée ici : elle porte du travail que le praticien ne peut pas refaire.
  Future<void> clearReadCache() async {
    await batch((batch) {
      batch.deleteWhere(cachedAppointments, (_) => const Constant(true));
      batch.deleteWhere(cachedOwners, (_) => const Constant(true));
      batch.deleteWhere(cachedPatients, (_) => const Constant(true));
    });
  }

  /// Flux plutôt que lecture ponctuelle : l'écran d'agenda se met à jour tout
  /// seul quand la synchronisation écrit dans le cache, sans invalidation
  /// manuelle.
  Stream<List<CachedAppointment>> watchAppointmentsOn(DateTime day) {
    final start = DateTime.utc(day.year, day.month, day.day);
    final end = start.add(const Duration(days: 1));

    return (select(cachedAppointments)
          ..where((row) => row.beginAt.isBiggerOrEqualValue(start))
          ..where((row) => row.beginAt.isSmallerThanValue(end))
          ..orderBy([(row) => OrderingTerm.asc(row.beginAt)]))
        .watch();
  }
}

LazyDatabase _openConnection() {
  return LazyDatabase(() async {
    final directory = await getApplicationDocumentsDirectory();
    return NativeDatabase.createInBackground(
      File(p.join(directory.path, 'biume.sqlite')),
    );
  });
}
