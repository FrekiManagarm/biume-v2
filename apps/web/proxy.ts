import { NextResponse, type NextRequest } from "next/server";

import { PATHNAME_HEADER } from "#/lib/pathname-header";

/**
 * Next ne donne pas le chemin courant à un layout : il n'est pas re-rendu par
 * segment et ne reçoit rien de la route. Or la garde de facturation en dépend
 * — elle redirige vers `/dashboard/settings` sauf si on y est déjà, et sans
 * cette exception la redirection boucle indéfiniment.
 *
 * Le proxy, lui, connaît le chemin nativement. Il se contente de le recopier
 * dans un en-tête : aucun accès base, aucune session lue, donc aucune raison
 * de le faire grossir.
 *
 * `new Headers(request.headers)` puis `set` : toute valeur de
 * `x-biume-pathname` qu'un client enverrait lui-même est écrasée ici avant
 * de repartir vers l'application — non usurpable.
 */
export function proxy(request: NextRequest) {
  const headers = new Headers(request.headers);
  headers.set(PATHNAME_HEADER, request.nextUrl.pathname);

  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: "/dashboard/:path*",
};
