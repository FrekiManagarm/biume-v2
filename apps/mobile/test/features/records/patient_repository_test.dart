import 'package:biume_mobile/core/database/app_database.dart';
import 'package:biume_mobile/core/failure.dart';
import 'package:biume_mobile/features/records/data/patient_repository_impl.dart';
import 'package:dio/dio.dart';
import 'package:drift/drift.dart';
import 'package:drift/native.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  late AppDatabase db;
  late Dio dio;
  late PatientRepositoryImpl repository;

  setUp(() {
    db = AppDatabase.forTesting(NativeDatabase.memory());
    dio = Dio(BaseOptions(baseUrl: 'https://api.test'));
    repository = PatientRepositoryImpl(db, dio);
  });

  tearDown(() => db.close());

  test(
    'remplace le cache par les pages du serveur, en suivant le curseur',
    () async {
      dio.interceptors.add(
        InterceptorsWrapper(
          onRequest: (options, handler) {
            final cursor = options.queryParameters['cursor'];
            if (cursor == null) {
              handler.resolve(
                Response(
                  requestOptions: options,
                  statusCode: 200,
                  data: {
                    'items': [
                      {
                        'id': 'pet-1',
                        'ownerId': 'owner-1',
                        'ownerName': 'Camille Roux',
                        'name': 'Filou',
                        'species': 'DOG',
                        'breed': null,
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
                      'id': 'pet-2',
                      'ownerId': 'owner-2',
                      'ownerName': 'Julie Martin',
                      'name': 'Rex',
                      'species': 'DOG',
                      'breed': 'Berger',
                    },
                  ],
                  'nextCursor': null,
                },
              ),
            );
          },
        ),
      );

      final result = await repository.refresh();

      expect(result.isSuccess, isTrue);
      expect(
        (await repository.watchAll().first).map((p) => p.name),
        ['Filou', 'Rex'],
      );
    },
  );

  test('garde le cache quand le réseau échoue', () async {
    await db.into(db.cachedPatients).insert(
          CachedPatientsCompanion.insert(
            id: 'pet-1',
            ownerId: 'owner-1',
            ownerName: 'Camille Roux',
            name: 'Filou',
            species: 'DOG',
            breed: const Value(null),
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

    final result = await repository.refresh();

    expect(result.failureOrNull, isA<NetworkFailure>());
    expect((await repository.watchAll().first).single.name, 'Filou');
  });
}
