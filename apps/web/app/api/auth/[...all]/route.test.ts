import { describe, expect, it, vi } from "vitest";

vi.mock("@biume/auth", () => ({
  auth: {
    handler: vi.fn(
      async (request: Request) =>
        new Response(
          JSON.stringify({ url: request.url, method: request.method }),
          { status: 200, headers: { "content-type": "application/json" } },
        ),
    ),
  },
}));

describe("route /api/auth/[...all]", () => {
  it("transmet une requête GET intacte à auth.handler", async () => {
    const { GET } = await import("./route");
    const request = new Request(
      "http://localhost:3001/api/auth/get-session?x=1",
      { method: "GET" },
    );

    const response = await GET(request);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      url: "http://localhost:3001/api/auth/get-session?x=1",
      method: "GET",
    });
  });

  it("transmet une requête POST intacte à auth.handler", async () => {
    const { POST } = await import("./route");
    const request = new Request("http://localhost:3001/api/auth/sign-in/email", {
      method: "POST",
      body: JSON.stringify({ email: "a@b.c" }),
    });

    const response = await POST(request);

    await expect(response.json()).resolves.toEqual({
      url: "http://localhost:3001/api/auth/sign-in/email",
      method: "POST",
    });
  });
});
