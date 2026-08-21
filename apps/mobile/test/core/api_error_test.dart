import 'package:biume_mobile/core/failure.dart';
import 'package:biume_mobile/core/network/api_error.dart';
import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';

DioException responseWith(int status, Map<String, dynamic> body) {
  final options = RequestOptions(path: '/captures');
  return DioException(
    requestOptions: options,
    response: Response(requestOptions: options, statusCode: status, data: body),
    type: DioExceptionType.badResponse,
  );
}

void main() {
  group('traduction des erreurs du serveur', () {
    test('lit le code normalisé du contrat', () {
      final failure = failureFromDioException(
        responseWith(409, {
          'code': 'active_organization_required',
          'message': 'Sélectionnez une entreprise.',
          'retryable': false,
        }),
      );

      expect(failure, isA<OrganizationRequiredFailure>());
      expect(failure.retryable, isFalse);
    });

    test('respecte le caractère réessayable annoncé par le serveur', () {
      final failure = failureFromDioException(
        responseWith(503, {
          'code': 'storage_unavailable',
          'message': 'Stockage indisponible.',
          'retryable': true,
        }),
      );

      expect(failure.retryable, isTrue);
    });

    test('traduit une coupure réseau', () {
      final failure = failureFromDioException(
        DioException(
          requestOptions: RequestOptions(path: '/captures'),
          type: DioExceptionType.connectionError,
        ),
      );

      expect(failure, isA<NetworkFailure>());
      expect(failure.retryable, isTrue);
    });

    /// Le serveur peut renvoyer une page d'erreur d'infrastructure au lieu du
    /// contrat. L'application doit rester utilisable, pas planter.
    test('survit à un corps qui ne suit pas le contrat', () {
      final failure = failureFromDioException(responseWith(502, {'oops': true}));

      expect(failure, isA<ServerFailure>());
      expect(failure.message, isNotEmpty);
    });

    /// Une URL signée dans un message d'erreur finirait dans les journaux de
    /// plantage. Aucun message issu du transport ne doit remonter tel quel.
    test('ne laisse jamais remonter une url', () {
      final failure = failureFromDioException(
        DioException(
          requestOptions: RequestOptions(path: '/captures'),
          message:
              'connexion à https://bucket.r2.example/abc?X-Amz-Signature=zzz échouée',
          type: DioExceptionType.connectionError,
        ),
      );

      expect(failure.message, isNot(contains('http')));
      expect(failure.message, isNot(contains('Signature')));
    });
  });

  group('consommation de tentative', () {
    /// Ces échecs ne seront jamais résolus par une nouvelle tentative. Ils
    /// arrêtent la boucle et ne consomment aucune tentative — c'est la règle du
    /// serveur, l'application s'y conforme exactement.
    test('les échecs à intervention manuelle ne consomment rien', () {
      expect(consumesAttempt(const AuthFailure()), isFalse);
      expect(consumesAttempt(const OrganizationRequiredFailure()), isFalse);
      expect(consumesAttempt(const ValidationFailure()), isFalse);
      expect(consumesAttempt(const ConflictFailure()), isFalse);
      expect(consumesAttempt(const ForbiddenFailure()), isFalse);
    });

    test('un échec transitoire consomme une tentative', () {
      expect(consumesAttempt(const NetworkFailure()), isTrue);
      expect(consumesAttempt(const ServerFailure()), isTrue);
    });
  });
}
