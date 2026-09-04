import 'dart:convert';

import 'package:biume_mobile/core/crypto/local_cipher.dart';
import 'package:biume_mobile/core/database/app_database.dart';
import 'package:biume_mobile/core/failure.dart';
import 'package:biume_mobile/features/records/data/patient_repository_impl.dart';
import 'package:biume_mobile/features/report/domain/proposal.dart';
import 'package:dio/dio.dart';
import 'package:drift/drift.dart' hide isNull;
import 'package:drift/native.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  late AppDatabase db;
  late Dio dio;
  late PatientRepositoryImpl repository;

  final cipher = LocalCipher(() async => List<int>.generate(32, (i) => i));

  setUp(() {
    db = AppDatabase.forTesting(NativeDatabase.memory());
    dio = Dio(BaseOptions(baseUrl: 'https://api.test'));
    repository = PatientRepositoryImpl(db, dio, cipher);
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

  group('byId', () {
    test('lit une fiche depuis le cache, avec sa date de naissance', () async {
      await db.into(db.cachedPatients).insert(
            CachedPatientsCompanion.insert(
              id: 'pet-1',
              ownerId: 'owner-1',
              ownerName: 'Camille Roux',
              name: 'Filou',
              species: 'DOG',
              breed: const Value('Berger'),
              birthDate: Value(DateTime(2020, 10, 1)),
            ),
          );

      final patient = await repository.byId('pet-1');

      expect(patient?.name, 'Filou');
      expect(patient?.birthDate, DateTime(2020, 10, 1));
    });

    test('renvoie null pour un animal jamais mis en cache', () async {
      expect(await repository.byId('inconnu'), isNull);
    });
  });

  group('history', () {
    test('lit la première page, sans suivre le curseur', () async {
      String? chemin;
      Map<String, dynamic>? requete;
      dio.interceptors.add(
        InterceptorsWrapper(
          onRequest: (options, handler) {
            chemin = options.path;
            requete = options.queryParameters;
            handler.resolve(
              Response(
                requestOptions: options,
                statusCode: 200,
                data: {
                  'items': [
                    {
                      'appointmentId': 'appt-1',
                      'beginAt': '2026-08-20T09:00:00.000Z',
                      'reportId': 'report-1',
                      'reportStatus': 'finalized',
                      'consultationReason': 'Suivi lombaire',
                    },
                    {
                      'appointmentId': 'appt-0',
                      'beginAt': '2026-07-01T09:00:00.000Z',
                      'reportId': null,
                      'reportStatus': null,
                      'consultationReason': '',
                    },
                  ],
                  'nextCursor': 'c2',
                },
              ),
            );
          },
        ),
      );

      final result = await repository.history('pet-1');

      expect(chemin, '/api/mobile/v1/patients/pet-1/history');
      expect(requete!['limit'], 50);
      expect(requete!.containsKey('cursor'), isFalse);
      final entries = result.valueOrNull!;
      expect(entries, hasLength(2));
      expect(entries.first.appointmentId, 'appt-1');
      expect(entries.first.reportStatus, ReportStatus.finalized);
      expect(entries.first.consultationReason, 'Suivi lombaire');
      expect(entries.last.reportId, isNull);
      expect(entries.last.reportStatus, isNull);
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

      final result = await repository.history('pet-1');

      expect(result.failureOrNull, isA<NetworkFailure>());
    });
  });

  group('cachedHistory', () {
    test(
      'lit les entrées mises en cache par refreshSheetsFor, la plus récente en premier',
      () async {
        await db.into(db.cachedPatientHistoryEntries).insert(
              CachedPatientHistoryEntriesCompanion.insert(
                appointmentId: 'appt-1',
                patientId: 'pet-1',
                beginAt: DateTime(2026, 8, 1),
                reportId: const Value('report-1'),
                reportStatus: const Value('finalized'),
                consultationReason: 'Suivi lombaire',
              ),
            );
        await db.into(db.cachedPatientHistoryEntries).insert(
              CachedPatientHistoryEntriesCompanion.insert(
                appointmentId: 'appt-2',
                patientId: 'pet-1',
                beginAt: DateTime(2026, 9, 1),
                consultationReason: '',
              ),
            );

        final entries = await repository.cachedHistory('pet-1');

        expect(entries, hasLength(2));
        expect(entries.first.appointmentId, 'appt-2');
        expect(entries.last.reportStatus, ReportStatus.finalized);
      },
    );

    test(
      "renvoie une liste vide pour un animal jamais préchargé, jamais une erreur",
      () async {
        expect(await repository.cachedHistory('inconnu'), isEmpty);
      },
    );
  });

  group('refreshSheetsFor', () {
    Map<String, dynamic> historyResponse(
      List<Map<String, dynamic>> items,
    ) => {'items': items, 'nextCursor': null};

    test(
      'met en cache les propriétaires et le dernier compte rendu finalisé de chaque animal',
      () async {
        final requetes = <String>[];
        dio.interceptors.add(
          InterceptorsWrapper(
            onRequest: (options, handler) {
              requetes.add(options.path);
              switch (options.path) {
                case '/api/mobile/v1/owners':
                  final cursor = options.queryParameters['cursor'];
                  handler.resolve(
                    Response(
                      requestOptions: options,
                      statusCode: 200,
                      data: cursor == null
                          ? {
                              'items': [
                                {
                                  'id': 'owner-1',
                                  'name': 'Camille Roux',
                                  'email': 'camille@example.org',
                                  'phone': '0600000000',
                                  'city': 'Lyon',
                                  'patientCount': 1,
                                },
                              ],
                              'nextCursor': 'oc2',
                            }
                          : {
                              'items': [
                                {
                                  'id': 'owner-2',
                                  'name': 'Jean Martin',
                                  'email': null,
                                  'phone': null,
                                  'city': null,
                                  'patientCount': 1,
                                },
                              ],
                              'nextCursor': null,
                            },
                    ),
                  );
                case '/api/mobile/v1/patients/pet-1/history':
                  handler.resolve(
                    Response(
                      requestOptions: options,
                      statusCode: 200,
                      data: historyResponse([
                        // La séance la plus récente n'a pas encore de compte
                        // rendu finalisé : c'est la précédente qu'il faut
                        // mettre en cache.
                        {
                          'appointmentId': 'appt-2',
                          'beginAt': '2026-09-01T09:00:00.000Z',
                          'reportId': 'report-2',
                          'reportStatus': 'draft',
                          'consultationReason': '',
                        },
                        {
                          'appointmentId': 'appt-1',
                          'beginAt': '2026-08-01T09:00:00.000Z',
                          'reportId': 'report-1',
                          'reportStatus': 'finalized',
                          'consultationReason': 'Suivi lombaire',
                        },
                      ]),
                    ),
                  );
                case '/api/mobile/v1/reports/report-1/proposals':
                  handler.resolve(
                    Response(
                      requestOptions: options,
                      statusCode: 200,
                      data: {
                        'reportId': 'report-1',
                        'status': 'finalized',
                        'patientName': 'Filou',
                      },
                    ),
                  );
                default:
                  handler.reject(
                    DioException(
                      requestOptions: options,
                      type: DioExceptionType.badResponse,
                      response: Response(
                        requestOptions: options,
                        statusCode: 404,
                      ),
                    ),
                  );
              }
            },
          ),
        );

        final result = await repository.refreshSheetsFor(['pet-1']);

        expect(result.isSuccess, isTrue);

        final owners = await db.select(db.cachedOwners).get();
        expect(owners.map((o) => o.id), containsAll(['owner-1', 'owner-2']));

        final cached = await (db.select(
          db.cachedReports,
        )..where((r) => r.patientId.equals('pet-1'))).getSingle();
        expect(cached.reportId, 'report-1');
        expect(cached.appointmentId, 'appt-1');
        expect(cached.status, 'finalized');
        // La transcription intégrale et les propositions cliniques ne
        // descendent jamais en clair dans une base SQLite non chiffrée : la
        // menace est un appareil perdu ou volé (design parent, section 3).
        expect(cached.payload, isNot(contains('Filou')));
        expect(cached.payload, isNot(contains('reportId')));
        expect(
          jsonDecode(
            (await cipher.open(id: 'report-1', sealed: cached.payload))!,
          ),
          {'reportId': 'report-1', 'status': 'finalized', 'patientName': 'Filou'},
        );

        // C'est ce qui permet à la fiche de survivre à l'absence de réseau :
        // les deux séances, pas seulement celle dont le compte rendu est
        // finalisé.
        final history = await repository.cachedHistory('pet-1');
        expect(history, hasLength(2));
        expect(history.first.appointmentId, 'appt-2');
        expect(history.last.reportId, 'report-1');
      },
    );

    test(
      "remplace l'ancien compte rendu en cache d'un animal, jamais n'en garde deux",
      () async {
        await db.into(db.cachedReports).insert(
              CachedReportsCompanion.insert(
                reportId: 'ancien-report',
                patientId: 'pet-1',
                status: 'finalized',
                payload: '{}',
                cachedAt: DateTime(2026, 1, 1),
              ),
            );

        dio.interceptors.add(
          InterceptorsWrapper(
            onRequest: (options, handler) {
              switch (options.path) {
                case '/api/mobile/v1/owners':
                  handler.resolve(
                    Response(
                      requestOptions: options,
                      statusCode: 200,
                      data: {'items': <dynamic>[], 'nextCursor': null},
                    ),
                  );
                case '/api/mobile/v1/patients/pet-1/history':
                  handler.resolve(
                    Response(
                      requestOptions: options,
                      statusCode: 200,
                      data: historyResponse([
                        {
                          'appointmentId': 'appt-2',
                          'beginAt': '2026-09-01T09:00:00.000Z',
                          'reportId': 'report-2',
                          'reportStatus': 'finalized',
                          'consultationReason': '',
                        },
                      ]),
                    ),
                  );
                case '/api/mobile/v1/reports/report-2/proposals':
                  handler.resolve(
                    Response(
                      requestOptions: options,
                      statusCode: 200,
                      data: {'reportId': 'report-2', 'status': 'finalized'},
                    ),
                  );
                default:
                  handler.reject(
                    DioException(
                      requestOptions: options,
                      type: DioExceptionType.badResponse,
                    ),
                  );
              }
            },
          ),
        );

        final result = await repository.refreshSheetsFor(['pet-1']);

        expect(result.isSuccess, isTrue);
        final cached = await (db.select(
          db.cachedReports,
        )..where((r) => r.patientId.equals('pet-1'))).get();
        expect(cached.map((r) => r.reportId), ['report-2']);
      },
    );

    test(
      "n'écrit rien pour un animal sans aucun compte rendu finalisé",
      () async {
        dio.interceptors.add(
          InterceptorsWrapper(
            onRequest: (options, handler) {
              switch (options.path) {
                case '/api/mobile/v1/owners':
                  handler.resolve(
                    Response(
                      requestOptions: options,
                      statusCode: 200,
                      data: {'items': <dynamic>[], 'nextCursor': null},
                    ),
                  );
                case '/api/mobile/v1/patients/pet-1/history':
                  handler.resolve(
                    Response(
                      requestOptions: options,
                      statusCode: 200,
                      data: historyResponse([
                        {
                          'appointmentId': 'appt-1',
                          'beginAt': '2026-08-01T09:00:00.000Z',
                          'reportId': 'report-1',
                          'reportStatus': 'draft',
                          'consultationReason': '',
                        },
                      ]),
                    ),
                  );
                default:
                  handler.reject(
                    DioException(
                      requestOptions: options,
                      type: DioExceptionType.badResponse,
                    ),
                  );
              }
            },
          ),
        );

        final result = await repository.refreshSheetsFor(['pet-1']);

        expect(result.isSuccess, isTrue);
        expect(await db.select(db.cachedReports).get(), isEmpty);
      },
    );

    test('garde le cache intact quand les propriétaires ne répondent pas', () async {
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

      final result = await repository.refreshSheetsFor(['pet-1']);

      expect(result.failureOrNull, isA<NetworkFailure>());
      expect(await db.select(db.cachedOwners).get(), isEmpty);
      expect(await db.select(db.cachedReports).get(), isEmpty);
    });

    test(
      "un historique en échec pour un animal n'empêche pas les autres",
      () async {
        dio.interceptors.add(
          InterceptorsWrapper(
            onRequest: (options, handler) {
              switch (options.path) {
                case '/api/mobile/v1/owners':
                  handler.resolve(
                    Response(
                      requestOptions: options,
                      statusCode: 200,
                      data: {'items': <dynamic>[], 'nextCursor': null},
                    ),
                  );
                case '/api/mobile/v1/patients/pet-1/history':
                  handler.reject(
                    DioException(
                      requestOptions: options,
                      type: DioExceptionType.connectionError,
                    ),
                  );
                case '/api/mobile/v1/patients/pet-2/history':
                  handler.resolve(
                    Response(
                      requestOptions: options,
                      statusCode: 200,
                      data: historyResponse([
                        {
                          'appointmentId': 'appt-9',
                          'beginAt': '2026-08-01T09:00:00.000Z',
                          'reportId': 'report-9',
                          'reportStatus': 'sent',
                          'consultationReason': '',
                        },
                      ]),
                    ),
                  );
                case '/api/mobile/v1/reports/report-9/proposals':
                  handler.resolve(
                    Response(
                      requestOptions: options,
                      statusCode: 200,
                      data: {'reportId': 'report-9', 'status': 'sent'},
                    ),
                  );
                default:
                  handler.reject(
                    DioException(
                      requestOptions: options,
                      type: DioExceptionType.badResponse,
                    ),
                  );
              }
            },
          ),
        );

        final result = await repository.refreshSheetsFor(['pet-1', 'pet-2']);

        expect(result.isSuccess, isTrue);
        final cached = await db.select(db.cachedReports).get();
        expect(cached.single.reportId, 'report-9');
      },
    );

    /// Vingt animaux en file indienne, sur un réseau de campagne, retardent
    /// tout ce que `refreshForeground` fait par ailleurs : les historiques
    /// doivent partir en parallèle, avec une limite de front raisonnable.
    test(
      'traite les historiques des animaux par lots concurrents, jamais un par un',
      () async {
        final patientIds = List.generate(8, (i) => 'pet-$i');
        var enCours = 0;
        var maxEnCours = 0;

        dio.interceptors.add(
          InterceptorsWrapper(
            onRequest: (options, handler) async {
              if (options.path == '/api/mobile/v1/owners') {
                handler.resolve(
                  Response(
                    requestOptions: options,
                    statusCode: 200,
                    data: {'items': <dynamic>[], 'nextCursor': null},
                  ),
                );
                return;
              }
              enCours++;
              maxEnCours = enCours > maxEnCours ? enCours : maxEnCours;
              await Future<void>.delayed(const Duration(milliseconds: 20));
              enCours--;
              handler.resolve(
                Response(
                  requestOptions: options,
                  statusCode: 200,
                  data: historyResponse(const []),
                ),
              );
            },
          ),
        );

        final result = await repository.refreshSheetsFor(patientIds);

        expect(result.isSuccess, isTrue);
        expect(
          maxEnCours,
          greaterThan(1),
          reason: 'les historiques ne doivent pas partir un par un',
        );
        expect(
          maxEnCours,
          lessThan(patientIds.length),
          reason: 'la concurrence doit rester bornée, pas tout d\'un coup',
        );
      },
    );

    /// Une exception qui n'est pas une erreur de transport — une date
    /// serveur malformée qui casse `DateTime.parse`, par exemple — ne doit
    /// ni priver les autres animaux de leur fiche, ni faire rejeter le
    /// résultat rendu par `refreshSheetsFor` : une erreur asynchrone non
    /// rattrapée dans un rafraîchissement d'arrière-plan ne se diagnostique
    /// jamais.
    test(
      "une erreur qui n'est pas une erreur de transport sur un animal n'empêche pas les autres, et le résultat est toujours rendu",
      () async {
        dio.interceptors.add(
          InterceptorsWrapper(
            onRequest: (options, handler) {
              switch (options.path) {
                case '/api/mobile/v1/owners':
                  handler.resolve(
                    Response(
                      requestOptions: options,
                      statusCode: 200,
                      data: {'items': <dynamic>[], 'nextCursor': null},
                    ),
                  );
                case '/api/mobile/v1/patients/pet-1/history':
                  // Une date malformée fait lever une FormatException à
                  // DateTime.parse — pas une DioException.
                  handler.resolve(
                    Response(
                      requestOptions: options,
                      statusCode: 200,
                      data: historyResponse([
                        {
                          'appointmentId': 'appt-1',
                          'beginAt': 'pas-une-date',
                          'reportId': null,
                          'reportStatus': null,
                          'consultationReason': '',
                        },
                      ]),
                    ),
                  );
                case '/api/mobile/v1/patients/pet-2/history':
                  handler.resolve(
                    Response(
                      requestOptions: options,
                      statusCode: 200,
                      data: historyResponse([
                        {
                          'appointmentId': 'appt-9',
                          'beginAt': '2026-08-01T09:00:00.000Z',
                          'reportId': 'report-9',
                          'reportStatus': 'sent',
                          'consultationReason': '',
                        },
                      ]),
                    ),
                  );
                case '/api/mobile/v1/reports/report-9/proposals':
                  handler.resolve(
                    Response(
                      requestOptions: options,
                      statusCode: 200,
                      data: {'reportId': 'report-9', 'status': 'sent'},
                    ),
                  );
                default:
                  handler.reject(
                    DioException(
                      requestOptions: options,
                      type: DioExceptionType.badResponse,
                    ),
                  );
              }
            },
          ),
        );

        final result = await repository.refreshSheetsFor(['pet-1', 'pet-2']);

        expect(result.isSuccess, isTrue);
        expect(await repository.cachedHistory('pet-1'), isEmpty);
        expect(await repository.cachedHistory('pet-2'), hasLength(1));
        final cached = await db.select(db.cachedReports).get();
        expect(cached.single.reportId, 'report-9');
      },
    );
  });

  /// Le cas du changement d'entreprise : les requêtes du cabinet précédent
  /// sont encore en vol quand le cache est vidé. Ce qu'elles rapportent —
  /// des animaux, des propriétaires, un compte rendu entier — ne doit rien
  /// laisser derrière lui dans le cache du cabinet suivant.
  group('vidage du cache pendant une requête en vol', () {
    test("refresh n'écrit rien après un vidage", () async {
      dio.interceptors.add(
        InterceptorsWrapper(
          onRequest: (options, handler) async {
            await db.clearReadCache();
            handler.resolve(
              Response(
                requestOptions: options,
                statusCode: 200,
                data: {
                  'items': [
                    {
                      'id': 'pet-cabinet-precedent',
                      'ownerId': 'owner-1',
                      'ownerName': 'Camille Roux',
                      'name': 'Filou',
                      'species': 'DOG',
                      'breed': null,
                    },
                  ],
                  'nextCursor': null,
                },
              ),
            );
          },
        ),
      );

      await repository.refresh();

      expect(await db.select(db.cachedPatients).get(), isEmpty);
    });

    test("refreshSheetsFor n'écrit rien après un vidage", () async {
      dio.interceptors.add(
        InterceptorsWrapper(
          onRequest: (options, handler) async {
            await db.clearReadCache();
            switch (options.path) {
              case '/api/mobile/v1/owners':
                handler.resolve(
                  Response(
                    requestOptions: options,
                    statusCode: 200,
                    data: {
                      'items': [
                        {
                          'id': 'owner-1',
                          'name': 'Camille Roux',
                          'email': null,
                          'phone': null,
                          'city': null,
                          'patientCount': 1,
                        },
                      ],
                      'nextCursor': null,
                    },
                  ),
                );
              case '/api/mobile/v1/patients/pet-1/history':
                handler.resolve(
                  Response(
                    requestOptions: options,
                    statusCode: 200,
                    data: {
                      'items': [
                        {
                          'appointmentId': 'appt-1',
                          'beginAt': '2026-08-01T09:00:00.000Z',
                          'reportId': 'report-1',
                          'reportStatus': 'finalized',
                          'consultationReason': 'Suivi lombaire',
                        },
                      ],
                      'nextCursor': null,
                    },
                  ),
                );
              case '/api/mobile/v1/reports/report-1/proposals':
                handler.resolve(
                  Response(
                    requestOptions: options,
                    statusCode: 200,
                    data: {
                      'reportId': 'report-1',
                      'status': 'finalized',
                      'patientName': 'Filou',
                    },
                  ),
                );
              default:
                handler.reject(
                  DioException(
                    requestOptions: options,
                    type: DioExceptionType.badResponse,
                    response: Response(
                      requestOptions: options,
                      statusCode: 404,
                    ),
                  ),
                );
            }
          },
        ),
      );

      await repository.refreshSheetsFor(['pet-1']);

      expect(await db.select(db.cachedOwners).get(), isEmpty);
      expect(await db.select(db.cachedPatientHistoryEntries).get(), isEmpty);
      expect(await db.select(db.cachedReports).get(), isEmpty);
    });
  });
}
