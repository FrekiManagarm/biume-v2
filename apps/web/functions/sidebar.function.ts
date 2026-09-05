import { readSidebarDefaultOpen } from "#/lib/sidebar-cookie";
import { createServerFn } from "@tanstack/react-start";
import { headers } from "next/headers";

export const getSidebarDefaultOpen = createServerFn({ method: "GET" }).handler(
  async () => {
    const requestHeaders = await headers();

    return readSidebarDefaultOpen(requestHeaders.get("cookie"));
  },
);
