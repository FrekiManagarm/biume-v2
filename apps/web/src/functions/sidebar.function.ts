import { readSidebarDefaultOpen } from "#/lib/sidebar-cookie";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";

export const getSidebarDefaultOpen = createServerFn({ method: "GET" }).handler(
  async () => {
    const headers = getRequestHeaders();

    return readSidebarDefaultOpen(headers.get("cookie"));
  },
);
