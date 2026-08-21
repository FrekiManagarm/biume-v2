import 'package:biume_mobile/core/database/app_database.dart';
import 'package:drift/native.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  late AppDatabase db;

  setUp(() => db = AppDatabase.forTesting(NativeDatabase.memory()));
  tearDown(() => db.close());

  Future<void> insertCapture(String id, LocalCaptureStatus status) =>
      db.into(db.localCaptures).insert(
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

  Future<void> insertAppointment(String id) =>
      db.into(db.cachedAppointments).insert(
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

    await db.clearReadCache();

    expect(await db.select(db.localCaptures).get(), hasLength(1));
    expect(await db.select(db.cachedAppointments).get(), isEmpty);
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
}
