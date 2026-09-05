import { describe, expect, it } from "vitest";
import { z } from "zod";

import { toInternalRouteErrorResponse } from "./internal-route";

describe("toInternalRouteErrorResponse", () => {
  it("répond 401 quand l'organisation n'est pas résolue", async () => {
    const response = toInternalRouteErrorResponse(
      new Error("Organization not found"),
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: "Organization not found",
    });
  });

  it("répond 400 sur une erreur de validation Zod", async () => {
    const result = z.object({ page: z.number() }).safeParse({ page: "abc" });
    if (result.success) {
      throw new Error("le safeParse aurait dû échouer");
    }

    const response = toInternalRouteErrorResponse(result.error);

    expect(response.status).toBe(400);
  });

  it("relance toute autre erreur, qui doit rester un 500", () => {
    expect(() =>
      toInternalRouteErrorResponse(new Error("boom")),
    ).toThrowError("boom");
  });
});
