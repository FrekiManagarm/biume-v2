import 'package:dio/dio.dart';

import '../failure.dart';

/// Table des codes du contrat serveur. Le message affiché vient du contrat
/// quand le corps le fournit, et d'un repli local sinon.
Failure _fromCode(String code, String? message, bool? retryable) =>
    switch (code) {
      'unauthorized' => const AuthFailure(),
      'active_organization_required' => const OrganizationRequiredFailure(),
      'forbidden' => const ForbiddenFailure(),
      'not_found' => const NotFoundFailure(),
      'conflict' => ConflictFailure(message: message),
      'validation' => ValidationFailure(message: message),
      'rate_limited' => const RateLimitedFailure(),
      'network' => const NetworkFailure(),
      'storage_unavailable' ||
      'object_incomplete' ||
      'server_error' => ServerFailure(
        message: message,
        retryable: retryable ?? true,
      ),
      _ => const UnknownFailure(),
    };

/// Traduit une exception de transport en échec de domaine.
///
/// Le `message` de `DioException` n'est **jamais** propagé : il peut contenir
/// l'URL signée d'un téléversement, qui finirait dans un journal de plantage et
/// survivrait à la purge des vingt-quatre heures.
Failure failureFromDioException(DioException error) {
  final data = error.response?.data;

  if (data is Map) {
    final code = data['code'];
    if (code is String) {
      final message = data['message'];
      final retryable = data['retryable'];
      return _fromCode(
        code,
        message is String ? message : null,
        retryable is bool ? retryable : null,
      );
    }
  }

  // Le serveur a répondu autre chose que le contrat — une page d'erreur
  // d'infrastructure, par exemple. L'application reste utilisable.
  final status = error.response?.statusCode;
  if (status != null) {
    if (status == 401) return const AuthFailure();
    if (status == 403) return const ForbiddenFailure();
    if (status == 404) return const NotFoundFailure();
    if (status == 429) return const RateLimitedFailure();
    return const ServerFailure();
  }

  return switch (error.type) {
    DioExceptionType.connectionError ||
    DioExceptionType.connectionTimeout ||
    DioExceptionType.sendTimeout ||
    DioExceptionType.receiveTimeout => const NetworkFailure(),
    DioExceptionType.cancel => const UnknownFailure(),
    _ => const ServerFailure(),
  };
}

/// Les échecs qui n'ont aucune chance d'être résolus par une nouvelle
/// tentative arrêtent la boucle immédiatement et ne consomment aucune
/// tentative. C'est la règle du serveur ; l'application s'y conforme
/// exactement.
const _manualInterventionCodes = {
  'unauthorized',
  'active_organization_required',
  'forbidden',
  'conflict',
  'validation',
};

bool consumesAttempt(Failure failure) =>
    !_manualInterventionCodes.contains(failure.code);
