import { SIDEBAR_COOKIE_NAME, SIDEBAR_LEGACY_COOKIE_NAME } from "#/lib/sidebar";

function parseCookieHeader(cookieHeader: string | null) {
  if (!cookieHeader) {
    return new Map<string, string>();
  }

  return new Map(
    cookieHeader.split(";").flatMap((cookie) => {
      const [name, ...valueParts] = cookie.trim().split("=");

      if (!name) {
        return [];
      }

      return [[name, decodeURIComponent(valueParts.join("="))]];
    }),
  );
}

/**
 * Fonction pure, appelable depuis n'importe quel gestionnaire serveur.
 *
 * Elle existait à l'identique dans `sidebar.function.ts`, enfermée dans un
 * `createServerFn`. Appeler cette fonction serveur depuis le gestionnaire
 * d'une autre produisait, au build de production, une référence RPC absente
 * du manifeste : `/dashboard` répondait 500 avec « Server function info not
 * found ». Le transport reste dans `sidebar.function.ts` pour les appels
 * client ; la logique vit ici et se compose librement côté serveur.
 */
export function readSidebarDefaultOpen(cookieHeader: string | null): boolean {
  const cookies = parseCookieHeader(cookieHeader);
  const value =
    cookies.get(SIDEBAR_COOKIE_NAME) ?? cookies.get(SIDEBAR_LEGACY_COOKIE_NAME);

  if (value === "false" || value === "collapsed" || value === "closed") {
    return false;
  }

  return true;
}
