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
 *
 * ATTENTION (revue finale du lot B) — ce contrat 401 n'est honoré que par
 * 7 des 13 handlers de lecture sous `app/api/internal/`. Les six exceptions
 * ci-dessous tiennent aux fonctions sous-jacentes dans `functions/*.function.ts`,
 * pas à ce fichier ; elles ne sont volontairement pas corrigées ici (voir le
 * rapport de la revue finale du lot B) — elles se traitent au lot C. Le lot C
 * doit connaître cette liste avant d'écrire sa logique de redirection sur 401 :
 * ce contrat n'est vrai qu'aux deux tiers.
 *
 * - `GET /api/internal/reports` → 500 (pas 401) sans session.
 *   `functions/reports.function.ts` (`getAllReports`, autour des lignes
 *   230-232) attrape toute erreur de `requireOrganizationId()` et la
 *   réécrit en `throw new Error("Error getting all reports")`, qui n'est
 *   plus reconnaissable comme un défaut d'autorisation.
 *
 * - `GET /api/internal/reports/[id]` → 200 `{ success: false, data: null }`
 *   sans session. `functions/reports.function.ts` (`getReportById`, autour
 *   des lignes 392-395) avale toute erreur et répond une forme "succès
 *   structuré" au lieu de lever.
 *
 * - `GET /api/internal/patients/[id]/anatomical-history` → 200
 *   `{ success: false, data: [] }` sans session. Même motif :
 *   `functions/reports.function.ts` (autour des lignes 828-831) avale
 *   toute erreur et répond une liste vide au lieu de lever.
 *
 * - `GET /api/internal/patients/[id]/medical-documents` → 500 (pas 401)
 *   sans session. La fonction appelle `getCurrentOrganization()`
 *   (`functions/auth.function.ts:45`), qui lève `"Unauthorized"` — un
 *   message différent de `ORGANIZATION_NOT_FOUND_MESSAGE` — donc ce
 *   handler ne matche jamais la branche 401 ci-dessous et retombe sur 500.
 *
 * - `GET /api/internal/anatomical-parts` → 200 avec les données, même sans
 *   session. `getAnatomicalParts` (`functions/reports.function.ts`) n'a
 *   aucune garde d'autorisation.
 *
 * - `GET /api/internal/animals` → 200 avec les données, même sans session.
 *   `getAllAnimals` (`functions/patients.function.ts`) n'a aucune garde
 *   d'autorisation.
 *
 *   Ces deux derniers cas ne fuient pas de donnée d'entreprise : `animals`
 *   et `anatomicalPart` sont des tables de référence globales, sans colonne
 *   d'organisation, et l'ancien code (TanStack) les exposait déjà sans
 *   garde. Mais elles sont désormais à une URL stable et devinable — à
 *   garder en tête si une garde devient nécessaire plus tard.
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
