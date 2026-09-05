import { ZodError } from "zod";

/**
 * Mapping d'erreur partagé par les route handlers de `app/api/internal/*`.
 *
 * Deux catégories d'erreur, deux codes :
 *
 * - `requireOrganizationId` lève ce message précis quand la session n'a pas
 *   d'organisation active. C'est un défaut d'autorisation, pas une panne :
 *   le client doit pouvoir le distinguer d'un 500 pour rediriger plutôt que
 *   réessayer.
 * - Un `ZodError` (paramètre malformé, ex. `?page=abc` → `NaN` → rejeté par
 *   le schéma) est une faute du client, donc 400 — pas 500.
 *
 * Centralisé ici parce que ce mapping est identique pour les six ressources
 * de ce lot ; le retaper à chaque route handler est une faute de frappe en
 * attente, en particulier sur le littéral `"Organization not found"`.
 */
export const ORGANIZATION_NOT_FOUND_MESSAGE = "Organization not found";

export function toInternalRouteErrorResponse(error: unknown): Response {
  if (error instanceof ZodError) {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  if (error instanceof Error && error.message === ORGANIZATION_NOT_FOUND_MESSAGE) {
    return Response.json(
      { error: ORGANIZATION_NOT_FOUND_MESSAGE },
      { status: 401 },
    );
  }

  throw error;
}
