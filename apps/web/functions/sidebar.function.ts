import { readSidebarDefaultOpen } from "#/lib/sidebar-cookie";
import { headers } from "next/headers";

export async function getSidebarDefaultOpen() {
  const requestHeaders = await headers();

  return readSidebarDefaultOpen(requestHeaders.get("cookie"));
}
