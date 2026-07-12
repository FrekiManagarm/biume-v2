const PRODUCTION_WEB_APP_URL = "https://app.biume.com";
const LOCAL_WEB_APP_URL = "http://localhost:3001";
const localHostnames = new Set(["localhost", "127.0.0.1", "::1"]);

function isSafeProductionUrl(value: string) {
  try {
    const hostname = new URL(value).hostname
      .replace(/^\[|\]$/g, "")
      .replace(/\.+$/, "");

    return Boolean(hostname) && !localHostnames.has(hostname);
  } catch {
    return false;
  }
}

export function resolveWebAppUrl(
  configuredUrl: string | undefined,
  nodeEnv: string | undefined,
) {
  const normalized = configuredUrl?.trim().replace(/\/+$/, "");

  if (
    normalized &&
    (nodeEnv !== "production" || isSafeProductionUrl(normalized))
  ) {
    return normalized;
  }

  return nodeEnv === "production"
    ? PRODUCTION_WEB_APP_URL
    : LOCAL_WEB_APP_URL;
}

export function webAppPath(path: `/${string}`) {
  return `${resolveWebAppUrl(
    process.env.NEXT_PUBLIC_WEB_APP_URL,
    process.env.NODE_ENV,
  )}${path}`;
}
