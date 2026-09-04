import 'package:biume_mobile/core/database/app_database.dart';
import 'package:drift/drift.dart' hide isNull;
import 'package:drift/native.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  late AppDatabase db;

  setUp(() => db = AppDatabase.forTesting(NativeDatabase.memory()));
  tearDown(() => db.close());

  Future<void> insertCapture(String id, LocalCaptureStatus status) => db
      .into(db.localCaptures)
      .insert(
        LocalCapturesCompanion.insert(
          id: id,
          status: status,
          durationMs: 120000,
          byteSize: 1048576,
          sha256: 'a' * 64,
          createdAt: DateTime.utc(2026, 8, 21),
          expiresAt: DateTime.utc(2026, 8, 22),
        ),
      );

  Future<void> insertAppointment(String id) => db
      .into(db.cachedAppointments)
      .insert(
        CachedAppointmentsCompanion.insert(
          id: id,
          patientId: 'pet-1',
          patientName: 'Filou',
          species: 'DOG',
          beginAt: DateTime.utc(2026, 8, 21, 9),
          endAt: DateTime.utc(2026, 8, 21, 10),
          status: 'CONFIRMED',
        ),
      );

  test('conserve une dictée mise en file', () async {
    await insertCapture('capture-1', LocalCaptureStatus.queued);

    final rows = await db.select(db.localCaptures).get();
    expect(rows, hasLength(1));
    expect(rows.first.status, LocalCaptureStatus.queued);
  });

  /// Le cache est jetable, la file ne l'est jamais. Vider le cache au retour du
  /// réseau ne doit pas pouvoir emporter une dictée non synchronisée : ce
  /// serait la pire panne possible pour ce produit.
  test('vider le cache ne touche pas la file de dictées', () async {
    await insertCapture('capture-1', LocalCaptureStatus.queued);
    await insertAppointment('appointment-1');
    await db
        .into(db.cachedOwners)
        .insert(
          CachedOwnersCompanion.insert(id: 'owner-1', name: 'Camille Roux'),
        );
    await db
        .into(db.cachedPatients)
        .insert(
          CachedPatientsCompanion.insert(
            id: 'pet-1',
            ownerId: 'owner-1',
            ownerName: 'Camille Roux',
            name: 'Filou',
            species: 'DOG',
          ),
        );

    await db.clearReadCache();

    expect(await db.select(db.localCaptures).get(), hasLength(1));
    expect(await db.select(db.cachedAppointments).get(), isEmpty);
    // Ce sont ces deux tables qui exposeraient les clients d'un cabinet dans
    // un autre si elles survivaient à un changement d'entreprise.
    expect(await db.select(db.cachedOwners).get(), isEmpty);
    expect(await db.select(db.cachedPatients).get(), isEmpty);
  });

  test("émet un flux quand l'agenda en cache change", () async {
    final emissions = <int>[];
    final subscription = db
        .watchAppointmentsOn(DateTime.utc(2026, 8, 21))
        .listen((rows) => emissions.add(rows.length));

    await insertAppointment('appointment-1');
    await Future<void>.delayed(const Duration(milliseconds: 50));
    await subscription.cancel();

    expect(emissions.last, 1);
  });

  test('refuse deux dictées avec le même identifiant', () async {
    await insertCapture('capture-1', LocalCaptureStatus.queued);

    expect(
      () => insertCapture('capture-1', LocalCaptureStatus.review),
      throwsA(anything),
    );
  });

  test("ne rend que l'agenda du jour demandé", () async {
    await insertAppointment('appointment-1');

    final autreJour = await db
        .watchAppointmentsOn(DateTime.utc(2026, 8, 22))
        .first;

    expect(autreJour, isEmpty);
  });

  test('conserve l\'animal rattaché à une dictée en file', () async {
    await db
        .into(db.localCaptures)
        .insert(
          LocalCapturesCompanion.insert(
            id: 'c-1',
            status: LocalCaptureStatus.queued,
            durationMs: 1000,
            byteSize: 10,
            sha256: 'x',
            createdAt: DateTime.utc(2026, 9, 3),
            expiresAt: DateTime.utc(2026, 9, 4),
            patientId: const Value('pet-1'),
          ),
        );
    final row = await (db.select(
      db.localCaptures,
    )..where((c) => c.id.equals('c-1'))).getSingle();
    expect(row.patientId, 'pet-1');
    expect(row.extractionRequestedAt, isNull);
  });

  /// Schéma v3 : les lignes déjà en cache avant la migration n'ont jamais
  /// porté cette colonne. Un défaut sûr évite de la rendre obligatoire à la
  /// lecture pour des données qui existent déjà.
  test("une séance en cache n'est pas à domicile par défaut", () async {
    await insertAppointment('appointment-1');

    final row = await db.select(db.cachedAppointments).getSingle();
    expect(row.atHome, isFalse);
  });

  test('la date de naissance et le dernier rendez-vous sont nullables', () async {
    await db
        .into(db.cachedPatients)
        .insert(
          CachedPatientsCompanion.insert(
            id: 'pet-1',
            ownerId: 'owner-1',
            ownerName: 'Camille Roux',
            name: 'Filou',
            species: 'DOG',
          ),
        );

    final row = await db.select(db.cachedPatients).getSingle();
    expect(row.birthDate, isNull);
    expect(row.lastAppointmentAt, isNull);
  });

  test('conserve un compte rendu mis en cache', () async {
    await db
        .into(db.cachedReports)
        .insert(
          CachedReportsCompanion.insert(
            reportId: 'report-1',
            patientId: 'pet-1',
            status: 'FINALIZED',
            payload: '{"summary":"RAS"}',
            cachedAt: DateTime.utc(2026, 9, 3),
          ),
        );

    final rows = await db.select(db.cachedReports).get();
    expect(rows, hasLength(1));
    expect(rows.first.appointmentId, isNull);
  });

  /// Un compte rendu en cache décrit un animal d'un cabinet précis : il doit
  /// disparaître avec le reste du cache de lecture au changement
  /// d'entreprise, sous peine d'exposer un cabinet dans un autre.
  test('vider le cache emporte aussi les comptes rendus en cache', () async {
    await db
        .into(db.cachedReports)
        .insert(
          CachedReportsCompanion.insert(
            reportId: 'report-1',
            patientId: 'pet-1',
            status: 'FINALIZED',
            payload: '{}',
            cachedAt: DateTime.utc(2026, 9, 3),
          ),
        );

    await db.clearReadCache();

    expect(await db.select(db.cachedReports).get(), isEmpty);
  });

  test('émet un flux sur une fenêtre de plusieurs jours', () async {
    await insertAppointment('appointment-1');

    final dansLaFenetre = await db
        .watchAppointmentsBetween(
          DateTime.utc(2026, 8, 20),
          DateTime.utc(2026, 8, 23),
        )
        .first;
    expect(dansLaFenetre, hasLength(1));

    final horsFenetre = await db
        .watchAppointmentsBetween(
          DateTime.utc(2026, 8, 22),
          DateTime.utc(2026, 8, 25),
        )
        .first;
    expect(horsFenetre, isEmpty);
  });
}
