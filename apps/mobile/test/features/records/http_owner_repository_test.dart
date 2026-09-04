import 'package:biume_mobile/core/failure.dart';
import 'package:biume_mobile/features/records/data/http_owner_repository.dart';
import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  late Dio dio;
  late HttpOwnerRepository repository;

  setUp(() {
    dio = Dio(BaseOptions(baseUrl: 'https://api.test'));
    repository = HttpOwnerRepository(dio);
  });

  group('create', () {
    test(
      'omet les clés optionnelles nulles : le contrat est strict, jamais nullable',
      () async {
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
                    'id': 'owner-1',
                    'name': 'Camille Roux',
                    'email': null,
                    'phone': null,
                    'city': null,
                  },
                ),
              );
            },
          ),
        );

        final result = await repository.create(name: 'Camille Roux');

        expect(chemin, '/api/mobile/v1/owners');
        expect(envoye, {'name': 'Camille Roux'});
        expect(result.valueOrNull!.id, 'owner-1');
        expect(result.valueOrNull!.email, isNull);
      },
    );

    test('inclut les champs optionnels renseignés', () async {
      Map<String, dynamic>? envoye;
      dio.interceptors.add(
        InterceptorsWrapper(
          onRequest: (options, handler) {
            envoye = (options.data as Map).cast<String, dynamic>();
            handler.resolve(
              Response(
                requestOptions: options,
                statusCode: 201,
                data: {
                  'id': 'owner-1',
                  'name': 'Camille Roux',
                  'email': 'camille@example.com',
                  'phone': '0600000000',
                  'city': 'Lyon',
                },
              ),
            );
          },
        ),
      );

      final result = await repository.create(
        name: 'Camille Roux',
        email: 'camille@example.com',
        phone: '0600000000',
        city: 'Lyon',
      );

      expect(envoye, {
        'name': 'Camille Roux',
        'email': 'camille@example.com',
        'phone': '0600000000',
        'city': 'Lyon',
      });
      expect(result.valueOrNull!.email, 'camille@example.com');
      expect(result.valueOrNull!.phone, '0600000000');
      expect(result.valueOrNull!.city, 'Lyon');
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

      final result = await repository.create(name: 'Camille Roux');

      expect(result.failureOrNull, isA<NetworkFailure>());
    });
  });

  group('createPatient', () {
    test('omet race et date de naissance quand elles manquent', () async {
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
                  'id': 'pet-1',
                  'ownerId': 'owner-1',
                  'ownerName': 'Camille Roux',
                  'name': 'Filou',
                  'species': 'DOG',
                  'breed': null,
                  'birthDate': null,
                  'lastAppointmentAt': null,
                },
              ),
            );
          },
        ),
      );

      final result = await repository.createPatient(
        ownerId: 'owner-1',
        name: 'Filou',
        species: 'DOG',
      );

      expect(chemin, '/api/mobile/v1/patients');
      expect(envoye, {'ownerId': 'owner-1', 'name': 'Filou', 'species': 'DOG'});
      expect(result.valueOrNull!.id, 'pet-1');
      expect(result.valueOrNull!.ownerName, 'Camille Roux');
      expect(result.valueOrNull!.breed, isNull);
    });

    test('envoie la date de naissance en ISO UTC quand elle est fournie', () async {
      Map<String, dynamic>? envoye;
      dio.interceptors.add(
        InterceptorsWrapper(
          onRequest: (options, handler) {
            envoye = (options.data as Map).cast<String, dynamic>();
            handler.resolve(
              Response(
                requestOptions: options,
                statusCode: 201,
                data: {
                  'id': 'pet-1',
                  'ownerId': 'owner-1',
                  'ownerName': 'Camille Roux',
                  'name': 'Filou',
                  'species': 'DOG',
                  'breed': 'Berger',
                  'birthDate': '2020-01-01T00:00:00.000Z',
                  'lastAppointmentAt': null,
                },
              ),
            );
          },
        ),
      );

      final result = await repository.createPatient(
        ownerId: 'owner-1',
        name: 'Filou',
        species: 'DOG',
        breed: 'Berger',
        birthDate: DateTime.utc(2020, 1, 1),
      );

      expect(envoye!['birthDate'], '2020-01-01T00:00:00.000Z');
      expect(envoye!['breed'], 'Berger');
      expect(result.valueOrNull!.breed, 'Berger');
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

      final result = await repository.createPatient(
        ownerId: 'owner-1',
        name: 'Filou',
        species: 'DOG',
      );

      expect(result.failureOrNull, isA<NetworkFailure>());
    });
  });
}
