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

  /// Animal choisi pour une capture libre. Écrit localement, envoyé au
  /// serveur juste après la déclaration : c'est la seule « écriture » hors
  /// ligne, et elle appartient à la dictée en file, pas au cache.
  TextColumn get patientId => text().nullable()();

  /// Le moment où « Valider la transcription » a été pressé. Sert à afficher
  /// « Biume prépare le compte rendu » sans que le serveur ait à le savoir.
  DateTimeColumn get extractionRequestedAt => dateTime().nullable()();

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

  /// Séance à domicile plutôt qu'au cabinet. Un défaut à `false` garde les
  /// lignes déjà en cache avant la migration v3 lisibles sans exception.
  BoolColumn get atHome => boolean().withDefault(const Constant(false))();

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
  DateTimeColumn get birthDate => dateTime().nullable()();
  DateTimeColumn get lastAppointmentAt => dateTime().nullable()();

  @override
  Set<Column> get primaryKey => {id};
}

/// Le dernier compte rendu finalisé d'un animal, mis en cache pour la fiche
/// hors ligne. Cache de lecture comme les autres tables `Cached*` : jetable,
/// jamais mis en file, vidé avec le reste au changement d'entreprise.
class CachedReports extends Table {
  TextColumn get reportId => text()();
  TextColumn get patientId => text()();
  TextColumn get appointmentId => text().nullable()();
  TextColumn get status => text()();
  TextColumn get payload => text()();
  DateTimeColumn get cachedAt => dateTime()();

  @override
  Set<Column> get primaryKey => {reportId};
}

/// Les séances passées d'un animal et l'état de leur compte rendu, mises en
/// cache pour que la fiche animal survive à l'absence de réseau — au moins
/// pour les animaux dont la fiche a été préchargée par `refreshSheetsFor`.
/// `CachedReports` ne suffit pas seul : il ne porte ni la date de la séance
/// ni son motif, et ces séances passées sont hors de la fenêtre d'agenda
/// mise en cache, donc irrécupérables autrement hors ligne.
class CachedPatientHistoryEntries extends Table {
  TextColumn get appointmentId => text()();
  TextColumn get patientId => text()();
  DateTimeColumn get beginAt => dateTime()();
  TextColumn get reportId => text().nullable()();
  TextColumn get reportStatus => text().nullable()();
  TextColumn get consultationReason => text()();

  @override
  Set<Column> get primaryKey => {appointmentId};
}

@DriftDatabase(
  tables: [
    LocalCaptures,
    CachedAppointments,
    CachedOwners,
    CachedPatients,
    CachedReports,
    CachedPatientHistoryEntries,
  ],
)
class AppDatabase extends _$AppDatabase {
  AppDatabase() : super(_openConnection());

  AppDatabase.forTesting(super.executor);

  @override
  int get schemaVersion => 4;

  @override
  MigrationStrategy get migration => MigrationStrategy(
    onUpgrade: (migrator, from, to) async {
      if (from < 2) {
        await migrator.addColumn(localCaptures, localCaptures.patientId);
        await migrator.addColumn(
          localCaptures,
          localCaptures.extractionRequestedAt,
        );
      }
      if (from < 3) {
        await migrator.addColumn(
          cachedAppointments,
          cachedAppointments.atHome,
        );
        await migrator.addColumn(cachedPatients, cachedPatients.birthDate);
        await migrator.addColumn(
          cachedPatients,
          cachedPatients.lastAppointmentAt,
        );
        await migrator.createTable(cachedReports);
      }
      if (from < 4) {
        await migrator.createTable(cachedPatientHistoryEntries);
      }
    },
  );

  /// Génération du cache de lecture, en mémoire. Incrémentée à chaque vidage
  /// — changement d'entreprise, déconnexion.
  ///
  /// Un rafraîchissement part sur le réseau avec plusieurs requêtes en vol :
  /// trois listes paginées et deux appels par animal de la fenêtre d'agenda.
  /// Leurs réponses reviennent bien après leur départ, et rien dans leur
  /// contenu ne dit de quel cabinet elles parlent — le client ne porte pas
  /// l'entreprise, le serveur la lit dans la session. Sans ce compteur, une
  /// réponse du cabinet précédent réécrirait ses propriétaires, ses
  /// historiques et ses comptes rendus dans le cache du cabinet suivant.
  int _readCacheGeneration = 0;

  int get readCacheGeneration => _readCacheGeneration;

  /// Applique [writes] dans une transaction, et **seulement si** le cache n'a
  /// pas été vidé depuis [generation]. Renvoie `false` quand l'écriture a été
  /// abandonnée.
  ///
  /// Le contrôle est fait à l'intérieur de la transaction : drift sérialise
  /// les accès à la connexion, donc aucun vidage ne peut s'intercaler entre
  /// lui et les écritures qui suivent.
  Future<bool> writeReadCache(
    int generation,
    Future<void> Function() writes,
  ) async {
    var applied = false;
    await transaction(() async {
      if (generation != _readCacheGeneration) return;
      await writes();
      applied = true;
    });
    return applied;
  }

  /// Vide **uniquement** le cache de lecture. La file de dictées n'est jamais
  /// touchée ici : elle porte du travail que le praticien ne peut pas refaire.
  Future<void> clearReadCache() async {
    // Incrémentée avant la suppression : toute écriture partie avant cet
    // instant est déjà périmée, même si elle revient pendant le vidage.
    _readCacheGeneration++;
    await batch((batch) {
      batch.deleteWhere(cachedAppointments, (_) => const Constant(true));
      batch.deleteWhere(cachedOwners, (_) => const Constant(true));
      batch.deleteWhere(cachedPatients, (_) => const Constant(true));
      batch.deleteWhere(cachedReports, (_) => const Constant(true));
      batch.deleteWhere(
        cachedPatientHistoryEntries,
        (_) => const Constant(true),
      );
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

  /// Même requête que `watchAppointmentsOn`, avec les deux bornes fournies par
  /// l'appelant : c'est ce qui porte la fenêtre de huit jours de l'agenda.
  Stream<List<CachedAppointment>> watchAppointmentsBetween(
    DateTime from,
    DateTime to,
  ) {
    return (select(cachedAppointments)
          ..where((row) => row.beginAt.isBiggerOrEqualValue(from))
          ..where((row) => row.beginAt.isSmallerThanValue(to))
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
