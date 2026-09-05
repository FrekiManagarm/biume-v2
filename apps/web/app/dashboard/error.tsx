"use client";

import { useEffect } from "react";

import { Alert, AlertDescription, AlertTitle } from "#/components/ui/alert";

// Filet générique pour tout `/dashboard/*` : un `error.tsx` Next s'applique
// au sous-arbre entier de son dossier, hors des dossiers qui portent leur
// propre `error.tsx` (voir `(overview)/error.tsx`, scopé à la seule page
// d'accueil). Ce fichier ne doit jamais nommer une page précise — les sept
// pages du lot D (clients, patients, agenda, réglages, rapports,
// assistant, …) n'ont pas de `errorComponent` dédié sous TanStack et
// tomberaient ici : le message doit rester vrai pour n'importe laquelle
// d'entre elles.
//
// Un `error.tsx` Next est un client boundary : il reçoit `{ error, reset }`
// et doit porter `"use client"`. `reset` n'est pas câblé à un bouton, comme
// aucun des anciens `errorComponent` de ce sous-arbre n'en offrait.
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
        <AlertTitle>Impossible de charger cette page</AlertTitle>
        <AlertDescription>
          Les données demandées ne sont pas disponibles pour le moment.
          Rechargez la page ou réessayez dans quelques instants.
        </AlertDescription>
      </Alert>
    </div>
  );
}
