import { describe, expect, it } from "vitest";
import { resolveTrustedOrigins } from "./trusted-origins";

describe("trusted origins", () => {
  it("keeps the web origin alongside the mobile deep link in production", () => {
    expect(
      resolveTrustedOrigins({
        corsOrigin: "https://app.biume.com",
        mobileTrustedOrigins: "biume://",
      }),
    ).toEqual(["https://app.biume.com", "biume://"]);
  });

  it("lists explicit Expo origins during development", () => {
    expect(
      resolveTrustedOrigins({
        corsOrigin: "http://localhost:3000",
        mobileTrustedOrigins:
          "biume://, exp://192.168.1.20:8081 , http://localhost:8081",
      }),
    ).toEqual([
      "http://localhost:3000",
      "biume://",
      "exp://192.168.1.20:8081",
      "http://localhost:8081",
    ]);
  });

  it("drops empty entries left by a trailing comma", () => {
    expect(
      resolveTrustedOrigins({
        corsOrigin: "https://app.biume.com",
        mobileTrustedOrigins: "biume://,,  ,",
      }),
    ).toEqual(["https://app.biume.com", "biume://"]);
  });

  it.each(["*", "exp://*", "https://*.biume.com", "*.biume.com"])(
    "refuses the wildcard origin %s",
    (origin) => {
      expect(() =>
        resolveTrustedOrigins({
          corsOrigin: "https://app.biume.com",
          mobileTrustedOrigins: origin,
        }),
      ).toThrow(/wildcard/i);
    },
  );

  it("refuses a wildcard smuggled among valid origins", () => {
    expect(() =>
      resolveTrustedOrigins({
        corsOrigin: "https://app.biume.com",
        mobileTrustedOrigins: "biume://,exp://*",
      }),
    ).toThrow(/wildcard/i);
  });

  it("never emits a duplicate origin", () => {
    expect(
      resolveTrustedOrigins({
        corsOrigin: "https://app.biume.com",
        mobileTrustedOrigins: "https://app.biume.com,biume://",
      }),
    ).toEqual(["https://app.biume.com", "biume://"]);
  });
});
