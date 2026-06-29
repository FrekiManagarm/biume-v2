import {
  SIDEBAR_COOKIE_NAME,
  SIDEBAR_LEGACY_COOKIE_NAME,
} from "#/lib/sidebar";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";

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

export const getSidebarDefaultOpen = createServerFn({ method: "GET" }).handler(
  async () => {
    const headers = getRequestHeaders();
    const cookies = parseCookieHeader(headers.get("cookie"));
    const value =
      cookies.get(SIDEBAR_COOKIE_NAME) ?? cookies.get(SIDEBAR_LEGACY_COOKIE_NAME);

    if (value === "false" || value === "collapsed" || value === "closed") {
      return false;
    }

    return true;
  },
);
