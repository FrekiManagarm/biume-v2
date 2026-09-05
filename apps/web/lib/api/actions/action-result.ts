/**
 * La forme de retour des Server Actions.
 *
 * `createServerFn` de TanStack propageait le message d'une `Error` jusqu'au
 * client. Une Server Action de Next le remplace en production par un texte
 * générique, pour ne pas fuiter d'information serveur — et `apps/web/functions`
 * contient 26 `throw new Error("<message français destiné au praticien>")`
 * qui deviendraient tous illisibles. En développement Next ne censure pas :
 * le défaut ne se verrait qu'en production.
 *
 * Capturer le message côté serveur et le renvoyer comme donnée le fait
 * traverser intact.
 */
export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

const GENERIC_ERROR = "Une erreur est survenue. Réessayez.";

/**
 * Les erreurs de contrôle de flux de Next — celles que lèvent `redirect()` et
 * `notFound()` — portent un `digest` que le framework intercepte plus haut.
 * Les capturer transformerait une redirection en message affiché.
 */
function isFrameworkControlFlow(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    typeof (error as { digest?: unknown }).digest === "string" &&
    (error as { digest: string }).digest.startsWith("NEXT_")
  );
}

export function toActionResult<Args extends unknown[], T>(
  fn: (...args: Args) => Promise<T>,
): (...args: Args) => Promise<ActionResult<T>> {
  return async (...args: Args) => {
    try {
      return { success: true, data: await fn(...args) };
    } catch (error) {
      if (isFrameworkControlFlow(error)) {
        throw error;
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : GENERIC_ERROR,
      };
    }
  };
}
