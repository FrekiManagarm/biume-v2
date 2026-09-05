import { cache } from "react";

import { auth } from "@biume/auth";
import { headers } from "next/headers";

/**
 * Une résolution d'organisation par requête HTTP, et une seule.
 *
 * Chaque fonction serveur de données appelait `getCurrentOrganization()`,
 * c'est-à-dire `auth.api.getFullOrganization()` : mesuré sur la base de dev,
 * ~170 ms par appel (session, organisation, membres, invitations) contre
 * ~50 ms pour la session seule. Or ces fonctions n'ont besoin que de
 * l'identifiant, que la session porte déjà dans `activeOrganizationId`.
 *
 * Le rendu d'une page exécute plusieurs de ces fonctions dans la même
 * requête — douze sur la page Animaux. `cache()` de React ramène ça à une
 * seule lecture de session, et couvre en plus les Server Actions de la même
 * requête, ce que la `WeakMap<Request>` précédente ne savait pas faire.
 *
 * NE PAS retirer `cache()` en le croyant décoratif : aucun test ne protège
 * cette mémoïsation. Elle n'opère que dans un contexte de requête React, que
 * Vitest ne fournit pas — une fonction `cache()`-ée y est appelée autant de
 * fois qu'on l'invoque. La suite resterait donc verte en perdant douze fois
 * la performance de la page Animaux.
 */
export const requireOrganizationId = cache(async (): Promise<string> => {
  const session = await auth.api.getSession({ headers: await headers() });
  const organizationId = session?.session.activeOrganizationId;

  if (!organizationId) {
    throw new Error("Organization not found");
  }

  return organizationId;
});
