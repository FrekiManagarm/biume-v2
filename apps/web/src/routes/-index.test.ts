import { describe, expect, test } from "vitest";

describe("index route", () => {
  test("redirects to the sign in page", async () => {
    const { Route } = await import("./index");

    let thrownRedirect: unknown;

    try {
      Route.options.beforeLoad?.({} as never);
    } catch (error) {
      thrownRedirect = error;
    }

    expect(thrownRedirect).toMatchObject({
      options: {
        to: "/signin",
      },
    });
  });
});
