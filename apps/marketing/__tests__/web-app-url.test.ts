import { describe, expect, test } from "bun:test";

import { resolveWebAppUrl } from "../lib/web-app-url";

describe("web application URL", () => {
  test("normalizes a configured non-local URL", () => {
    expect(
      resolveWebAppUrl("https://preview.biume.com///", "production"),
    ).toBe("https://preview.biume.com");
  });

  test("uses the safe application domain when production has no URL", () => {
    expect(resolveWebAppUrl(undefined, "production")).toBe(
      "https://app.biume.com",
    );
  });

  test.each([
    "http://localhost:3001",
    "//localhost:3001",
    "http://localhost.:3001",
    "http://127.0.0.1:3001",
    "http://[::1]:3001",
  ])("rejects %s as a production destination", (configuredUrl) => {
    expect(resolveWebAppUrl(configuredUrl, "production")).toBe(
      "https://app.biume.com",
    );
  });

  test.each([
    "//preview.biume.com",
    "/sign-in",
    "not a valid URL",
    "localhost:3001",
  ])(
    "fails closed for non-absolute or invalid production URL %s",
    (configuredUrl) => {
      expect(resolveWebAppUrl(configuredUrl, "production")).toBe(
        "https://app.biume.com",
      );
    },
  );

  test.each(["development", "test", undefined])(
    "keeps the local fallback in %s",
    (nodeEnv) => {
      expect(resolveWebAppUrl(undefined, nodeEnv)).toBe(
        "http://localhost:3001",
      );
    },
  );

  test("declares the public URL as a Turbo build input", async () => {
    const turbo = (await Bun.file(
      new URL("../../../turbo.json", import.meta.url),
    ).json()) as { tasks: { build: { env: string[] } } };

    expect(turbo.tasks.build.env).toContain("NEXT_PUBLIC_WEB_APP_URL");
  });
});
