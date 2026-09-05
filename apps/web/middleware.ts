import { NextResponse, type NextRequest } from "next/server";

/**
 * Next ne donne pas le chemin courant à un layout : il n'est pas re-rendu par
 * segment et ne reçoit rien de la route. Or la garde de facturation en dépend
 * — elle redirige vers `/dashboard/settings` sauf si on y est déjà, et sans
 * cette exception la redirection boucle indéfiniment.
 *
 * Le middleware, lui, connaît le chemin nativement. Il se contente de le
 * recopier dans un en-tête : aucun accès base, aucune session lue, donc
 * aucune raison de le faire grossir.
 */
export const PATHNAME_HEADER = "x-biume-pathname";

export function middleware(request: NextRequest) {
  const headers = new Headers(request.headers);
  headers.set(PATHNAME_HEADER, request.nextUrl.pathname);

  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: "/dashboard/:path*",
};
