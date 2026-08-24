import 'package:flutter/foundation.dart';

/// Les échecs que le domaine connaît, dans son propre vocabulaire.
///
/// Le dépôt de référence fait porter son type de résultat par une
/// `DioException` : sa couche domaine dépend alors du client HTTP, et un
/// timeout réseau y devient indistinguable d'une erreur métier. Ce défaut n'est
/// pas reproduit — rien ici ne connaît dio.
@immutable
sealed class Failure {
  const Failure({
    required this.code,
    required this.message,
    required this.retryable,
  });

  /// Le code normalisé du contrat serveur. Jamais un message de transport.
  final String code;

  /// Ce que le praticien lit. Français, métier, sans jargon technique.
  final String message;

  final bool retryable;
}

class NetworkFailure extends Failure {
  const NetworkFailure()
    : super(
        code: 'network',
        message: 'Connexion indisponible.',
        retryable: true,
      );
}

class AuthFailure extends Failure {
  const AuthFailure()
    : super(
        code: 'unauthorized',
        message: 'Session expirée, reconnectez-vous.',
        retryable: false,
      );
}

class OrganizationRequiredFailure extends Failure {
  const OrganizationRequiredFailure()
    : super(
        code: 'active_organization_required',
        message: 'Sélectionnez une entreprise.',
        retryable: false,
      );
}

class ForbiddenFailure extends Failure {
  const ForbiddenFailure()
    : super(code: 'forbidden', message: 'Accès refusé.', retryable: false);
}

class NotFoundFailure extends Failure {
  const NotFoundFailure()
    : super(
        code: 'not_found',
        message: 'Introuvable.',
        retryable: false,
      );
}

class ConflictFailure extends Failure {
  const ConflictFailure({String? message})
    : super(
        code: 'conflict',
        message: message ?? 'Cette dictée est dans un état incompatible.',
        retryable: false,
      );
}

class ValidationFailure extends Failure {
  const ValidationFailure({String? message})
    : super(
        code: 'validation',
        message: message ?? 'Requête invalide.',
        retryable: false,
      );
}

class RateLimitedFailure extends Failure {
  const RateLimitedFailure()
    : super(
        code: 'rate_limited',
        message: 'Trop de requêtes, réessayez plus tard.',
        retryable: true,
      );
}

class ServerFailure extends Failure {
  const ServerFailure({String? message, super.retryable = true})
    : super(
        code: 'server_error',
        message: message ?? 'Une erreur est survenue.',
      );
}

class UnknownFailure extends Failure {
  const UnknownFailure()
    : super(
        code: 'unknown',
        message: 'Une erreur est survenue.',
        retryable: false,
      );
}

/// Le serveur a répondu sans erreur mais sans session exploitable. Rare, et
/// distinct d'un refus d'authentification : le jeton peut être bon alors que
/// la réponse ne suit pas le contrat.
class AuthFailureFallback extends Failure {
  const AuthFailureFallback()
    : super(
        code: 'server_error',
        message: 'Session indisponible, réessayez.',
        retryable: true,
      );
}
