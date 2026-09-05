"use client";

import { useEffect } from "react";

import { Alert, AlertDescription, AlertTitle } from "#/components/ui/alert";

// Reprend telle quelle la JSX de l'ancien `errorComponent` TanStack
// (`routes/dashboard/index.tsx`, `DashboardOverviewError`). Un `error.tsx`
// Next est un client boundary : il reçoit `{ error, reset }` et doit porter
// `"use client"`. `reset` n'est pas câblé à un bouton ici, comme
// `DashboardOverviewError` n'en offrait pas — préserver l'apparence exclut
// d'en ajouter un.
//
// Vit dans `(overview)` — groupe de routes sans effet sur l'URL — plutôt que
// directement sous `app/dashboard/` : un `error.tsx` Next s'applique à tout
// le sous-arbre de son dossier. Posé au niveau `app/dashboard/`, ce message
// spécifique à la vue d'ensemble s'affichait pour une erreur sur n'importe
// quelle page du dashboard (clients, patients, …). Sous TanStack, seul
// `routes/dashboard/index.tsx` déclarait un `errorComponent` — les six
// autres routes n'en avaient pas — donc cette portée page-only est celle
// d'origine, pas une nouveauté. Voir `app/dashboard/error.tsx` pour le
// filet générique qui couvre désormais le reste du sous-arbre.
export default function DashboardError({
  error,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="grid gap-5 pb-8">
      <Alert variant="destructive">
        <AlertTitle>Impossible de charger la vue d&apos;ensemble</AlertTitle>
        <AlertDescription>
          Les données de votre activité ne sont pas disponibles pour le
          moment. Rechargez la page ou réessayez dans quelques instants.
        </AlertDescription>
      </Alert>
    </div>
  );
}
