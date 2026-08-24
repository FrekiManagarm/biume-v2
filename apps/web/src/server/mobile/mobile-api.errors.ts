import type {
  CaptureErrorCode,
  MobileApiError,
} from "@biume/contracts/capture";

/**
 * Messages délibérément génériques et localisés. Rien issu d'une exception,
 * d'une base de données ou d'un fournisseur de stockage n'atteint le client.
 */
export const errorMessages: Record<CaptureErrorCode, string> = {
  validation: "Requête invalide.",
  unauthorized: "Session expirée, reconnectez-vous.",
  active_organization_required: "Sélectionnez une entreprise.",
  forbidden: "Accès refusé.",
  method_not_allowed: "Méthode non supportée.",
  not_found: "Ressource introuvable.",
  conflict: "Cette dictée est dans un état incompatible.",
  rate_limited: "Trop de requêtes, réessayez plus tard.",
  server_error: "Une erreur interne est survenue.",
  storage_unavailable: "Stockage indisponible, réessayez plus tard.",
  object_incomplete: "L'audio envoyé est incomplet, relancez l'envoi.",
  expired: "Cette dictée a expiré.",
  network: "Connexion indisponible.",
  unknown: "Une erreur est survenue.",
};

export const errorStatuses: Record<CaptureErrorCode, number> = {
  validation: 400,
  unauthorized: 401,
  active_organization_required: 409,
  forbidden: 403,
  method_not_allowed: 405,
  not_found: 404,
  conflict: 409,
  rate_limited: 429,
  server_error: 500,
  storage_unavailable: 503,
  object_incomplete: 409,
  expired: 410,
  network: 503,
  unknown: 500,
};

const retryableByDefault = new Set<CaptureErrorCode>([
  "rate_limited",
  "server_error",
  "storage_unavailable",
  "object_incomplete",
  "network",
]);

export function buildMobileApiError(
  code: CaptureErrorCode,
  options: { retryable?: boolean } = {},
): { status: number; body: MobileApiError } {
  return {
    status: errorStatuses[code],
    body: {
      code,
      message: errorMessages[code],
      retryable: options.retryable ?? retryableByDefault.has(code),
    },
  };
}

/**
 * Échec d'une requête mobile hors du domaine de la capture.
 *
 * `CaptureServiceError` porte une `CaptureFailureReason`, union fermée décrivant
 * les échecs d'une dictée. Y ajouter « propriétaire introuvable » étirerait ce
 * vocabulaire jusqu'à ce qu'il ne dise plus rien ; les fiches, l'agenda et les
 * rapports lèvent donc leur propre erreur.
 */
export class MobileRequestError extends Error {
  readonly code: CaptureErrorCode;
  readonly retryable: boolean;

  constructor(code: CaptureErrorCode, options: { retryable?: boolean } = {}) {
    super(code);
    this.name = "MobileRequestError";
    this.code = code;
    this.retryable = options.retryable ?? false;
  }
}
