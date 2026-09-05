"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AutumnProvider } from "autumn-js/react";
import { useState } from "react";

import { Toaster } from "@biume/ui/components/sonner";
import { TooltipProvider } from "@biume/ui/components/tooltip";

export function Providers({ children }: { children: React.ReactNode }) {
  // Un QueryClient par montage, créé dans l'état plutôt qu'au niveau du
  // module. Un client de portée module serait partagé entre les requêtes du
  // serveur, donc entre praticiens : le cache de l'un servirait à l'autre.
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <AutumnProvider pathPrefix="/api/autumn" includeCredentials>
        <TooltipProvider>{children}</TooltipProvider>
        <Toaster />
      </AutumnProvider>
    </QueryClientProvider>
  );
}
