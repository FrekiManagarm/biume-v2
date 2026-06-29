const WEB_APP_URL =
  process.env.NEXT_PUBLIC_WEB_APP_URL?.replace(/\/$/, "") ??
  "http://localhost:3001";

export function webAppPath(path: `/${string}`) {
  return `${WEB_APP_URL}${path}`;
}
