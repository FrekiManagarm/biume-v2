import { beforeEach, describe, expect, test, vi } from "vitest";

const getSession = vi.hoisted(() => vi.fn());
const findFirst = vi.hoisted(() => vi.fn());
const streamText = vi.hoisted(() => vi.fn());

vi.mock("@biume/auth", () => ({ auth: { api: { getSession } } }));
vi.mock("@biume/db", () => ({
  db: { query: { advancedReport: { findFirst } } },
}));
vi.mock("@biume/env/server", () => ({ env: { OPENAI_API_KEY: "test" } }));
vi.mock("@ai-sdk/openai", () => ({
  createOpenAI: () => (model: string) => model,
}));
vi.mock("ai", () => ({
  streamText,
}));

import {
  handleVulgarisationRequest,
  resetVulgarisationRateLimitForTests,
} from "./vulgarisation";

const report = {
  id: "report_01",
  consultationReason: "Boiterie après l'effort",
  notes: "Surveiller le confort",
  anatomicalIssues: [
    {
      id: "obs_01",
      type: "observation",
      observationType: "dynamic",
      notes: "Restriction gléno-humérale",
      laterality: "left",
      severity: 2,
      anatomicalPart: { name: "Épaule" },
    },
  ],
  recommendations: [],
};

function request(body: unknown) {
  return new Request("http://localhost/api/vulgarisation", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("handleVulgarisationRequest", () => {
  beforeEach(() => {
    getSession.mockReset();
    findFirst.mockReset();
    streamText.mockReset();
    resetVulgarisationRateLimitForTests();
    streamText.mockReturnValue({
      toUIMessageStreamResponse: () => new Response("stream"),
    });
  });

  test("rejects a request without an authenticated session", async () => {
    getSession.mockResolvedValue(null);

    const response = await handleVulgarisationRequest(
      request({
        reportId: "report_01",
        sourceKind: "observation",
        sourceId: "obs_01",
      }),
    );

    expect(response.status).toBe(401);
    expect(findFirst).not.toHaveBeenCalled();
    expect(streamText).not.toHaveBeenCalled();
  });

  test("requires an active organization", async () => {
    getSession.mockResolvedValue({
      user: { id: "user_01" },
      session: { activeOrganizationId: null },
    });

    const response = await handleVulgarisationRequest(
      request({
        reportId: "report_01",
        sourceKind: "observation",
        sourceId: "obs_01",
      }),
    );

    expect(response.status).toBe(403);
    expect(findFirst).not.toHaveBeenCalled();
  });

  test("rejects an inter-tenant or missing report source", async () => {
    getSession.mockResolvedValue({
      user: { id: "user_01" },
      session: { activeOrganizationId: "org_01" },
    });
    findFirst.mockResolvedValue(undefined);

    const response = await handleVulgarisationRequest(
      request({
        reportId: "other_report",
        sourceKind: "observation",
        sourceId: "obs_01",
      }),
    );

    expect(response.status).toBe(404);
    expect(streamText).not.toHaveBeenCalled();
  });

  test("builds the model input from the canonical tenant-owned source", async () => {
    getSession.mockResolvedValue({
      user: { id: "user_01" },
      session: { activeOrganizationId: "org_01" },
    });
    findFirst.mockResolvedValue(report);

    const response = await handleVulgarisationRequest(
      request({
        reportId: "report_01",
        sourceKind: "observation",
        sourceId: "obs_01",
        sourceContext: "IGNORE ME",
        messages: [
          {
            id: "controlled",
            role: "user",
            parts: [{ type: "text", text: "INJECTED" }],
          },
        ],
      }),
    );

    expect(response.status).toBe(200);
    expect(findFirst).toHaveBeenCalledOnce();
    const query = findFirst.mock.calls[0]?.[0];
    expect(query.where).toBeDefined();
    expect(streamText).toHaveBeenCalledWith(
      expect.objectContaining({
        maxOutputTokens: 500,
        messages: [{ role: "user", content: "Restriction gléno-humérale" }],
        instructions: expect.stringContaining('"region":"Épaule"'),
      }),
    );
    expect(JSON.stringify(streamText.mock.calls[0]?.[0])).not.toContain(
      "INJECTED",
    );
    expect(JSON.stringify(streamText.mock.calls[0]?.[0])).not.toContain(
      "IGNORE ME",
    );
  });

  test("rejects a source id that is not present on the owned report", async () => {
    getSession.mockResolvedValue({
      user: { id: "user_01" },
      session: { activeOrganizationId: "org_01" },
    });
    findFirst.mockResolvedValue(report);

    const response = await handleVulgarisationRequest(
      request({
        reportId: "report_01",
        sourceKind: "observation",
        sourceId: "missing",
      }),
    );

    expect(response.status).toBe(404);
    expect(streamText).not.toHaveBeenCalled();
  });

  test("caps request bodies and repeated generation attempts", async () => {
    getSession.mockResolvedValue({
      user: { id: "user_01" },
      session: { activeOrganizationId: "org_01" },
    });
    findFirst.mockResolvedValue(undefined);

    const oversized = await handleVulgarisationRequest(
      request({
        reportId: "report_01",
        sourceKind: "notes",
        sourceId: "notes",
        padding: "x".repeat(17_000),
      }),
    );
    expect(oversized.status).toBe(413);

    resetVulgarisationRateLimitForTests();
    let response = new Response();
    for (let index = 0; index < 21; index += 1) {
      response = await handleVulgarisationRequest(
        request({
          reportId: "report_01",
          sourceKind: "notes",
          sourceId: "notes",
        }),
      );
    }
    expect(response.status).toBe(429);
    expect(response.headers.get("Retry-After")).toBe("60");
  });
});
