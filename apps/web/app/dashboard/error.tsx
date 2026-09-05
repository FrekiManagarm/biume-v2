"use client";

import { useEffect } from "react";

import { Alert, AlertDescription, AlertTitle } from "#/components/ui/alert";

// Reprend telle quelle la JSX de l'ancien `errorComponent` TanStack
// (`routes/dashboard/index.tsx`, `DashboardOverviewError`). Un `error.tsx`
// Next est un client boundary : il reçoit `{ error, reset }` et doit porter
// `"use client"`. `reset` n'est pas câblé à un bouton ici, comme
// `DashboardOverviewError` n'en offrait pas — préserver l'apparence exclut
// d'en ajouter un.
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
        <AlertTitle>Impossible de charger la vue d'ensemble</AlertTitle>
        <AlertDescription>
          Les données de votre activité ne sont pas disponibles pour le
          moment. Rechargez la page ou réessayez dans quelques instants.
        </AlertDescription>
      </Alert>
    </div>
  );
}
