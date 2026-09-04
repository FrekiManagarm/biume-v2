import 'dart:convert';

import 'package:biume_mobile/core/database/app_database.dart';
import 'package:biume_mobile/core/failure.dart';
import 'package:biume_mobile/features/report/data/http_report_repository.dart';
import 'package:biume_mobile/features/report/domain/proposal.dart';
import 'package:dio/dio.dart';
import 'package:drift/native.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  late AppDatabase db;
  late Dio dio;
  late HttpReportRepository repository;

  setUp(() {
    db = AppDatabase.forTesting(NativeDatabase.memory());
    dio = Dio(BaseOptions(baseUrl: 'https://api.test'));
    repository = HttpReportRepository(dio, db);
  });

  tearDown(() => db.close());

  Map<String, dynamic> reponse({
    String status = 'draft',
    String? ownerEmail = 'camille@example.org',
    Map<String, dynamic>? sections,
  }) => {
    'reportId': 'report-1',
    'status': status,
    'patientName': 'Filou',
    'owner': {'id': 'owner-1', 'name': 'Camille Roux', 'email': ownerEmail},
    'captureId': 'capture-1',
    'transcript': 'Filou présente une tension lombaire à droite.',
    'items': [
      {
        'id': 'proposal-1',
        'section': 'clinical',
        'text': 'Tension lombaire droite',
        'state': 'needs_confirmation',
        'anchor': {'start': 19, 'end': 44, 'quote': 'tension lombaire à droite'},
      },
    ],
    'sections':
        sections ??
        {
          'clinical': 'needs_confirmation',
          'anatomical': 'not_applicable',
        },
  };

  test('mappe needs_confirmation et not_applicable dans les deux sens', () async {
    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) {
          expect(options.path, '/api/mobile/v1/reports/report-1/proposals');
          handler.resolve(
            Response(requestOptions: options, statusCode: 200, data: reponse()),
          );
        },
      ),
    );

    final result = await repository.load('report-1');

    expect(result.isSuccess, isTrue);
    final data = result.valueOrNull!;
    expect(data.sections[ReportSection.clinical], SectionState.needsConfirmation);
    expect(data.sections[ReportSection.anatomical], SectionState.notApplicable);
    expect(data.proposals.single.state, SectionState.needsConfirmation);
  });

  test('mappe le statut sent', () async {
    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) {
          handler.resolve(
            Response(
              requestOptions: options,
              statusCode: 200,
              data: reponse(status: 'sent'),
            ),
          );
        },
      ),
    );

    final result = await repository.load('report-1');

    expect(result.valueOrNull!.status, ReportStatus.sent);
    expect(result.valueOrNull!.isReadOnly, isTrue);
  });

  test('un e-mail absent devient null, jamais une chaîne vide', () async {
    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) {
          handler.resolve(
            Response(
              requestOptions: options,
              statusCode: 200,
              data: reponse(ownerEmail: null),
            ),
          );
        },
      ),
    );

    final result = await repository.load('report-1');

    expect(result.valueOrNull!.owner.email, isNull);
  });

  /// Les quatre sections sont toujours présentes à l'écran, même si le
  /// serveur n'en renvoie que certaines.
  test('complète les sections absentes avec "empty"', () async {
    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) {
          handler.resolve(
            Response(
              requestOptions: options,
              statusCode: 200,
              data: reponse(sections: const {'clinical': 'confirmed'}),
            ),
          );
        },
      ),
    );

    final result = await repository.load('report-1');
    final sections = result.valueOrNull!.sections;

    expect(sections.keys.toSet(), ReportSection.values.toSet());
    expect(sections[ReportSection.notes], SectionState.empty);
  });

  test('envoie l\'état encodé lors d\'une décision', () async {
    String? envoye;
    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) {
          envoye = (options.data as Map)['state'] as String;
          handler.resolve(
            Response(requestOptions: options, statusCode: 200, data: reponse()),
          );
        },
      ),
    );

    await repository.decide(
      reportId: 'report-1',
      proposalId: 'proposal-1',
      decision: SectionState.notApplicable,
    );

    expect(envoye, 'not_applicable');
  });

  test('finalise et rapporte si le compte rendu a été envoyé', () async {
    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) {
          expect(options.path, '/api/mobile/v1/reports/report-1/finalize');
          expect((options.data as Map)['sendToOwner'], isTrue);
          handler.resolve(
            Response(
              requestOptions: options,
              statusCode: 200,
              data: {'reportId': 'report-1', 'status': 'sent', 'sentToOwner': true},
            ),
          );
        },
      ),
    );

    final result = await repository.finalize('report-1', sendToOwner: true);

    expect(result.isSuccess, isTrue);
    expect(result.valueOrNull!.status, ReportStatus.sent);
    expect(result.valueOrNull!.sentToOwner, isTrue);
  });

  test("met à jour l'e-mail du propriétaire", () async {
    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) {
          expect(options.path, '/api/mobile/v1/owners/owner-1/email');
          expect((options.data as Map)['email'], 'camille@example.org');
          handler.resolve(
            Response(
              requestOptions: options,
              statusCode: 200,
              data: const <String, dynamic>{},
            ),
          );
        },
      ),
    );

    final result = await repository.updateOwnerEmail(
      'owner-1',
      'camille@example.org',
    );

    expect(result.isSuccess, isTrue);
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

    final result = await repository.load('report-1');

    expect(result.failureOrNull, isA<NetworkFailure>());
  });

  group('loadCachedOrRemote', () {
    test('lit le réseau quand il répond, sans toucher au cache', () async {
      dio.interceptors.add(
        InterceptorsWrapper(
          onRequest: (options, handler) {
            handler.resolve(
              Response(
                requestOptions: options,
                statusCode: 200,
                data: reponse(status: 'sent'),
              ),
            );
          },
        ),
      );

      final result = await repository.loadCachedOrRemote('report-1');

      expect(result.valueOrNull?.status, ReportStatus.sent);
    });

    test(
      'retombe sur le cache quand le réseau manque, et parse son payload brut',
      () async {
        await db.into(db.cachedReports).insert(
              CachedReportsCompanion.insert(
                reportId: 'report-1',
                patientId: 'pet-1',
                status: 'finalized',
                payload: jsonEncode(reponse(status: 'finalized')),
                cachedAt: DateTime.now(),
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

        final result = await repository.loadCachedOrRemote('report-1');

        expect(result.isSuccess, isTrue);
        expect(result.valueOrNull?.status, ReportStatus.finalized);
        expect(result.valueOrNull?.patientName, 'Filou');
      },
    );

    test(
      'sans réseau et sans rien en cache, propage la panne réseau',
      () async {
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

        final result = await repository.loadCachedOrRemote('report-1');

        expect(result.failureOrNull, isA<NetworkFailure>());
      },
    );

    test(
      "ne retombe jamais sur le cache pour un échec qui n'est pas réseau",
      () async {
        await db.into(db.cachedReports).insert(
              CachedReportsCompanion.insert(
                reportId: 'report-1',
                patientId: 'pet-1',
                status: 'finalized',
                payload: jsonEncode(reponse(status: 'finalized')),
                cachedAt: DateTime.now(),
              ),
            );
        dio.interceptors.add(
          InterceptorsWrapper(
            onRequest: (options, handler) {
              handler.reject(
                DioException(
                  requestOptions: options,
                  response: Response(
                    requestOptions: options,
                    statusCode: 404,
                    data: {'code': 'not_found', 'message': 'Introuvable.'},
                  ),
                  type: DioExceptionType.badResponse,
                ),
              );
            },
          ),
        );

        final result = await repository.loadCachedOrRemote('report-1');

        expect(result.failureOrNull, isA<NotFoundFailure>());
      },
    );
  });
}
