/**
 * Nom de l'en-tête que `proxy.ts` (matcher `/dashboard/:path*`) recopie
 * depuis `request.nextUrl.pathname`.
 *
 * Vit dans un module neutre plutôt que dans `proxy.ts` lui-même : un Server
 * Component (`app/dashboard/layout.tsx`) qui importerait la constante
 * directement depuis le fichier de convention du proxy se retrouverait
 * couplé à son nom de fichier — un renommage futur de cette convention
 * (comme celui qui vient de se produire, `middleware.ts` → `proxy.ts`)
 * casserait alors aussi la compilation du layout.
 */
export const PATHNAME_HEADER = "x-biume-pathname";
