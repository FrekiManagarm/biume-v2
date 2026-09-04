import 'package:biume_mobile/core/database/app_database.dart';
import 'package:biume_mobile/core/failure.dart';
import 'package:biume_mobile/features/agenda/data/agenda_repository_impl.dart';
import 'package:dio/dio.dart';
import 'package:drift/native.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  late AppDatabase db;
  late Dio dio;
  late AgendaRepositoryImpl repository;

  final from = DateTime.utc(2026, 9, 3);
  final to = from.add(const Duration(days: 8));

  setUp(() {
    db = AppDatabase.forTesting(NativeDatabase.memory());
    dio = Dio(BaseOptions(baseUrl: 'https://api.test'));
    repository = AgendaRepositoryImpl(db, dio);
  });

  tearDown(() => db.close());

  test(
    'remplace toute la fenêtre par les pages du serveur, en suivant le curseur',
    () async {
      dio.interceptors.add(
        InterceptorsWrapper(
          onRequest: (options, handler) {
            expect(options.queryParameters['limit'], mobileAppointmentsPageSize);
            final cursor = options.queryParameters['cursor'];
            if (cursor == null) {
              handler.resolve(
                Response(
                  requestOptions: options,
                  statusCode: 200,
                  data: {
                    'items': [
                      {
                        'id': 'appointment-1',
                        'patientId': 'pet-1',
                        'patientName': 'Filou',
                        'animalType': 'DOG',
                        'beginAt': '2026-09-05T09:00:00.000Z',
                        'endAt': '2026-09-05T10:00:00.000Z',
                        'status': 'CONFIRMED',
                      },
                    ],
                    'nextCursor': 'c2',
                  },
                ),
              );
              return;
            }

            expect(cursor, 'c2');
            handler.resolve(
              Response(
                requestOptions: options,
                statusCode: 200,
                data: {
                  'items': [
                    {
                      'id': 'appointment-2',
                      'patientId': 'pet-2',
                      'patientName': 'Rex',
                      'animalType': 'DOG',
                      'beginAt': '2026-09-06T09:00:00.000Z',
                      'endAt': '2026-09-06T10:00:00.000Z',
                      'status': 'CONFIRMED',
                    },
                  ],
                  'nextCursor': null,
                },
              ),
            );
          },
        ),
      );

      final result = await repository.refreshWindow(from, to);

      expect(result.isSuccess, isTrue);
      expect(
        (await repository.watchWindow(from, to).first).map((a) => a.id),
        ['appointment-1', 'appointment-2'],
      );
    },
  );

  /// Un praticien dans une écurie sans réseau doit garder son agenda : le
  /// cache déjà là n'est jamais touché par un échec réseau.
  test('garde le cache quand le réseau échoue', () async {
    await db
        .into(db.cachedAppointments)
        .insert(
          CachedAppointmentsCompanion.insert(
            id: 'appointment-1',
            patientId: 'pet-1',
            patientName: 'Filou',
            species: 'DOG',
            beginAt: DateTime.utc(2026, 9, 5, 9),
            endAt: DateTime.utc(2026, 9, 5, 10),
            status: 'CONFIRMED',
          ),
        );

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

    final result = await repository.refreshWindow(from, to);

    expect(result.failureOrNull, isA<NetworkFailure>());
    expect(
      (await repository.watchWindow(from, to).first).single.id,
      'appointment-1',
    );
  });

  test("fetchDay lit hors cache et n'y écrit rien", () async {
    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) {
          handler.resolve(
            Response(
              requestOptions: options,
              statusCode: 200,
              data: {
                'items': [
                  {
                    'id': 'appointment-3',
                    'patientId': 'pet-3',
                    'patientName': 'Milo',
                    'animalType': 'CAT',
                    'beginAt': '2026-10-01T09:00:00.000Z',
                    'endAt': '2026-10-01T10:00:00.000Z',
                    'status': 'CONFIRMED',
                  },
                ],
                'nextCursor': null,
              },
            ),
          );
        },
      ),
    );

    final result = await repository.fetchDay(DateTime.utc(2026, 10, 1));

    expect(result.isSuccess, isTrue);
    expect(result.valueOrNull!.single.id, 'appointment-3');
    expect(await db.select(db.cachedAppointments).get(), isEmpty);
  });

  test('fetchDay dit hors ligne sans toucher le cache', () async {
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

    final result = await repository.fetchDay(DateTime.utc(2026, 10, 1));

    expect(result.failureOrNull, isA<NetworkFailure>());
    expect(await db.select(db.cachedAppointments).get(), isEmpty);
  });
}
