import 'package:biume_mobile/core/database/app_database.dart';
import 'package:biume_mobile/core/failure.dart';
import 'package:biume_mobile/features/agenda/data/http_appointment_write_repository.dart';
import 'package:dio/dio.dart';
import 'package:drift/native.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  late AppDatabase db;
  late Dio dio;
  late HttpAppointmentWriteRepository repository;

  /// Toutes les séances des tests de durée sont datées autour de cet
  /// instant : « la dernière séance » est une notion relative à maintenant.
  final maintenant = DateTime.utc(2026, 9, 10, 12);

  setUp(() {
    db = AppDatabase.forTesting(NativeDatabase.memory());
    dio = Dio(BaseOptions(baseUrl: 'https://api.test'));
    repository = HttpAppointmentWriteRepository(
      dio,
      db,
      now: () => maintenant,
    );
  });

  tearDown(() => db.close());

  test('crée une séance et remonte ses conflits', () async {
    String? chemin;
    Map<String, dynamic>? envoye;
    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) {
          chemin = options.path;
          envoye = (options.data as Map).cast<String, dynamic>();
          handler.resolve(
            Response(
              requestOptions: options,
              statusCode: 201,
              data: {
                'appointmentId': 'a-1',
                'reportId': 'r-1',
                'beginAt': '2026-09-04T13:30:00.000Z',
                'endAt': '2026-09-04T14:30:00.000Z',
                'conflicts': [
                  {
                    'appointmentId': 'a-2',
                    'beginAt': '2026-09-04T14:00:00.000Z',
                    'patientName': 'Rex',
                  },
                ],
              },
            ),
          );
        },
      ),
    );

    final result = await repository.create(
      patientId: 'pet-1',
      beginAt: DateTime.utc(2026, 9, 4, 13, 30),
      endAt: DateTime.utc(2026, 9, 4, 14, 30),
      atHome: true,
    );

    expect(chemin, '/api/mobile/v1/appointments');
    expect(envoye!['patientId'], 'pet-1');
    expect(envoye!['atHome'], true);
    expect(envoye!['beginAt'], '2026-09-04T13:30:00.000Z');
    final outcome = result.valueOrNull!;
    expect(outcome.appointmentId, 'a-1');
    expect(outcome.reportId, 'r-1');
    expect(outcome.conflicts.single.appointmentId, 'a-2');
    expect(outcome.conflicts.single.patientName, 'Rex');
  });

  test('déplace une séance vers /move', () async {
    String? chemin;
    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) {
          chemin = options.path;
          handler.resolve(
            Response(
              requestOptions: options,
              statusCode: 200,
              data: {
                'appointmentId': 'a-1',
                'reportId': null,
                'beginAt': '2026-09-05T09:00:00.000Z',
                'endAt': '2026-09-05T10:00:00.000Z',
                'conflicts': <Map<String, dynamic>>[],
              },
            ),
          );
        },
      ),
    );

    final result = await repository.move(
      'a-1',
      beginAt: DateTime.utc(2026, 9, 5, 9),
      endAt: DateTime.utc(2026, 9, 5, 10),
    );

    expect(chemin, '/api/mobile/v1/appointments/a-1/move');
    expect(result.valueOrNull!.conflicts, isEmpty);
    expect(result.valueOrNull!.reportId, isNull);
  });

  test('traduit une panne réseau, jamais le message de transport', () async {
    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) {
          handler.reject(
            DioException(
              requestOptions: options,
              type: DioExceptionType.connectionError,
            ),
          );
        },
      ),
    );

    final result = await repository.create(
      patientId: 'pet-1',
      beginAt: DateTime.utc(2026, 9, 4, 13, 30),
      endAt: DateTime.utc(2026, 9, 4, 14, 30),
      atHome: false,
    );

    expect(result.failureOrNull, isA<NetworkFailure>());
  });

  test('sans séance en cache, la durée par défaut est une heure', () async {
    expect(await repository.defaultDuration(), const Duration(hours: 1));
  });

  /// La spécification, 5.8 : « la durée par défaut est celle de la dernière
  /// séance du praticien ». Le cache couvre aujourd'hui à J+8 : prendre la
  /// ligne dont le début est le plus grand donnait la séance la plus
  /// **lointaine à venir**, pas la dernière tenue. Une séance de deux heures
  /// posée dans huit jours proposait deux heures pour tout ce qui se prend
  /// aujourd'hui.
  test('la durée par défaut vient de la dernière séance tenue', () async {
    await db
        .into(db.cachedAppointments)
        .insert(
          CachedAppointmentsCompanion.insert(
            id: 'appointment-a-venir',
            patientId: 'pet-3',
            patientName: 'Bella',
            species: 'DOG',
            beginAt: DateTime.utc(2026, 9, 18, 9),
            endAt: DateTime.utc(2026, 9, 18, 11),
            status: 'CONFIRMED',
          ),
        );
    await db
        .into(db.cachedAppointments)
        .insert(
          CachedAppointmentsCompanion.insert(
            id: 'appointment-tenue',
            patientId: 'pet-1',
            patientName: 'Filou',
            species: 'DOG',
            beginAt: DateTime.utc(2026, 9, 10, 9),
            endAt: DateTime.utc(2026, 9, 10, 9, 30),
            status: 'CONFIRMED',
          ),
        );

    expect(await repository.defaultDuration(), const Duration(minutes: 30));
  });

  test('sans séance tenue en cache, la durée reste une heure', () async {
    await db
        .into(db.cachedAppointments)
        .insert(
          CachedAppointmentsCompanion.insert(
            id: 'appointment-a-venir',
            patientId: 'pet-3',
            patientName: 'Bella',
            species: 'DOG',
            beginAt: DateTime.utc(2026, 9, 18, 9),
            endAt: DateTime.utc(2026, 9, 18, 11),
            status: 'CONFIRMED',
          ),
        );

    expect(await repository.defaultDuration(), const Duration(hours: 1));
  });

  test('parmi les séances tenues, la plus récente gagne', () async {
    await db
        .into(db.cachedAppointments)
        .insert(
          CachedAppointmentsCompanion.insert(
            id: 'appointment-1',
            patientId: 'pet-1',
            patientName: 'Filou',
            species: 'DOG',
            beginAt: DateTime.utc(2026, 9, 3, 9),
            endAt: DateTime.utc(2026, 9, 3, 9, 45),
            status: 'CONFIRMED',
          ),
        );
    await db
        .into(db.cachedAppointments)
        .insert(
          CachedAppointmentsCompanion.insert(
            id: 'appointment-2',
            patientId: 'pet-2',
            patientName: 'Rex',
            species: 'DOG',
            beginAt: DateTime.utc(2026, 9, 5, 9),
            endAt: DateTime.utc(2026, 9, 5, 10, 30),
            status: 'CONFIRMED',
          ),
        );

    expect(
      await repository.defaultDuration(),
      const Duration(hours: 1, minutes: 30),
    );
  });

  /// Même garde que côté serveur (`defaultDurationMs`, dans
  /// `appointment-write.service.ts`) : une ligne dont la fin ne suit pas le
  /// début n'est pas une durée exploitable, et ne doit jamais traverser
  /// `submit()` jusqu'à un `endAt` nul ou antérieur à `beginAt`.
  test(
    'une dernière séance dont la fin précède le début retombe sur une heure',
    () async {
      await db
          .into(db.cachedAppointments)
          .insert(
            CachedAppointmentsCompanion.insert(
              id: 'appointment-1',
              patientId: 'pet-1',
              patientName: 'Filou',
              species: 'DOG',
              beginAt: DateTime.utc(2026, 9, 5, 10),
              endAt: DateTime.utc(2026, 9, 5, 9),
              status: 'CONFIRMED',
            ),
          );

      expect(await repository.defaultDuration(), const Duration(hours: 1));
    },
  );

  test(
    'une dernière séance de durée nulle retombe aussi sur une heure',
    () async {
      await db
          .into(db.cachedAppointments)
          .insert(
            CachedAppointmentsCompanion.insert(
              id: 'appointment-1',
              patientId: 'pet-1',
              patientName: 'Filou',
              species: 'DOG',
              beginAt: DateTime.utc(2026, 9, 5, 9),
              endAt: DateTime.utc(2026, 9, 5, 9),
              status: 'CONFIRMED',
            ),
          );

      expect(await repository.defaultDuration(), const Duration(hours: 1));
    },
  );
}
