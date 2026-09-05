import { auth } from "@biume/auth";
import { getRequest, getRequestHeaders } from "@tanstack/react-start/server";

/**
 * Une résolution d'organisation par requête HTTP, et une seule.
 *
 * Chaque fonction serveur de données appelait `getCurrentOrganization()`,
 * c'est-à-dire `auth.api.getFullOrganization()` : mesuré sur la base de dev,
 * ~170 ms par appel (session, organisation, membres, invitations) contre
 * ~50 ms pour la session seule. Or ces fonctions n'ont besoin que de
 * l'identifiant, que la session porte déjà dans `activeOrganizationId`.
 *
 * Le rendu serveur d'une page exécute plusieurs de ces fonctions dans la
 * même requête — douze sur la page Animaux. La mémoïsation par `Request`
 * ramène ça à une seule lecture de session. En navigation client chaque
 * fonction reste une requête distincte, donc une lecture chacune : le gain
 * y vient de `getFullOrganization` qu'on n'appelle plus.
 */
const organizationIdByRequest = new WeakMap<Request, Promise<string>>();

export function requireOrganizationId(): Promise<string> {
  const request = getRequest();
  const cached = organizationIdByRequest.get(request);

  if (cached) {
    return cached;
  }

  const resolved = (async () => {
    const session = await auth.api.getSession({ headers: getRequestHeaders() });
    const organizationId = session?.session.activeOrganizationId;

    if (!organizationId) {
      throw new Error("Organization not found");
    }

    return organizationId;
  })();

  // Une résolution qui échoue ne doit pas rester en cache : la requête
  // suivante sur le même objet `Request` doit pouvoir réessayer.
  resolved.catch(() => organizationIdByRequest.delete(request));
  organizationIdByRequest.set(request, resolved);

  return resolved;
}
