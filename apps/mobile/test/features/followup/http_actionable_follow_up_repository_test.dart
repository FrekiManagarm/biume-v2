import 'package:biume_mobile/core/failure.dart';
import 'package:biume_mobile/features/followup/data/http_actionable_follow_up_repository.dart';
import 'package:biume_mobile/features/followup/domain/follow_up.dart';
import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';

Map<String, dynamic> suiviJson({
  String id = 'followup-1',
  List<String> alertReasons = const ['declared_worsening'],
  Map<String, dynamic>? answer,
  String? answeredAt = '2026-09-03T09:00:00.000Z',
  String? handledAt,
  String? ownerPhone = '+33600000000',
  String? ownerEmail = 'camille.roux@example.test',
  String? patientId = 'pet-1',
}) => {
  'id': id,
  'reportId': 'report-1',
  'patientName': 'Filou',
  'ownerName': 'Camille Roux',
  'status': 'answered',
  'dueAt': '2026-09-01T09:00:00.000Z',
  'answeredAt': answeredAt,
  'answer': answer,
  'alertReasons': alertReasons,
  'handledAt': handledAt,
  'ownerPhone': ownerPhone,
  'ownerEmail': ownerEmail,
  'patientId': patientId,
};

void main() {
  late Dio dio;
  late HttpActionableFollowUpRepository repository;

  setUp(() {
    dio = Dio(BaseOptions(baseUrl: 'https://api.test'));
    repository = HttpActionableFollowUpRepository(dio);
  });

  test('traduit ce que renvoie le serveur en suivi de domaine', () async {
    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) => handler.resolve(
          Response(
            requestOptions: options,
            statusCode: 200,
            data: {
              'items': [
                suiviJson(
                  alertReasons: const ['declared_worsening', 'inconnue'],
                  answer: const {
                    'evolution': 'worse',
                    'reaction': 'Boite depuis hier',
                    'wantsContact': true,
                  },
                ),
              ],
              'nextCursor': null,
            },
          ),
        ),
      ),
    );

    final result = await repository.listActionable();
    final suivi = result.valueOrNull!.single;

    expect(suivi.id, 'followup-1');
    expect(suivi.reasons, [AlertReason.declaredWorsening]);
    expect(suivi.answer!.evolution, Evolution.worse);
    expect(suivi.answer!.reaction, 'Boite depuis hier');
    expect(suivi.answer!.wantsContact, isTrue);
    expect(suivi.answeredAt, DateTime.utc(2026, 9, 3, 9));
    expect(suivi.handled, isFalse);
    expect(suivi.ownerPhone, '+33600000000');
    expect(suivi.patientId, 'pet-1');
  });

  test('lit une fiche client incomplète sans rien inventer', () async {
    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) => handler.resolve(
          Response(
            requestOptions: options,
            statusCode: 200,
            data: {
              'items': [
                suiviJson(
                  answer: null,
                  answeredAt: null,
                  ownerPhone: null,
                  ownerEmail: null,
                  patientId: null,
                ),
              ],
              'nextCursor': null,
            },
          ),
        ),
      ),
    );

    final suivi = (await repository.listActionable()).valueOrNull!.single;

    expect(suivi.answer, isNull);
    expect(suivi.answeredAt, isNull);
    expect(suivi.ownerPhone, isNull);
    expect(suivi.ownerEmail, isNull);
    expect(suivi.patientId, isNull);
  });

  test('un suivi déjà traité arrive marqué traité', () async {
    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) => handler.resolve(
          Response(
            requestOptions: options,
            statusCode: 200,
            data: {
              'items': [suiviJson(handledAt: '2026-09-03T10:00:00.000Z')],
              'nextCursor': null,
            },
          ),
        ),
      ),
    );

    final suivi = (await repository.listActionable()).valueOrNull!.single;

    expect(suivi.handled, isTrue);
  });

  /// Le serveur pagine à cinquante. Un praticien qui rentre de tournée avec
  /// soixante réponses en attente doit toutes les voir, pas les cinquante
  /// premières.
  test('suit le curseur jusqu\'à la dernière page', () async {
    final chemins = <String>[];
    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) {
          chemins.add(options.uri.toString());
          final curseur = options.queryParameters['cursor'] as String?;
          handler.resolve(
            Response(
              requestOptions: options,
              statusCode: 200,
              data: curseur == null
                  ? {
                      'items': [suiviJson(id: 'f-1')],
                      'nextCursor': 'page-2',
                    }
                  : {
                      'items': [suiviJson(id: 'f-2')],
                      'nextCursor': null,
                    },
            ),
          );
        },
      ),
    );

    final result = await repository.listActionable();

    expect(result.valueOrNull!.map((f) => f.id), ['f-1', 'f-2']);
    expect(chemins, hasLength(2));
    expect(chemins.last, contains('cursor=page-2'));
  });

  test('marque un suivi traité et renvoie ce que dit le serveur', () async {
    String? chemin;
    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) {
          chemin = options.path;
          handler.resolve(
            Response(
              requestOptions: options,
              statusCode: 200,
              data: suiviJson(handledAt: '2026-09-03T10:00:00.000Z'),
            ),
          );
        },
      ),
    );

    final result = await repository.markHandled('followup-1');

    expect(chemin, '/api/mobile/v1/followups/followup-1/handled');
    expect(result.valueOrNull!.handled, isTrue);
  });

  test('traduit une panne réseau, jamais le message de transport', () async {
    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) => handler.reject(
          DioException(
            requestOptions: options,
            type: DioExceptionType.connectionError,
          ),
        ),
      ),
    );

    expect(
      (await repository.listActionable()).failureOrNull,
      isA<NetworkFailure>(),
    );
    expect(
      (await repository.markHandled('followup-1')).failureOrNull,
      isA<NetworkFailure>(),
    );
  });
}
