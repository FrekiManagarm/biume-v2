import { renderToString } from "react-dom/server";
import { describe, expect, test, vi } from "vitest";

import type { NormalizedAdvancedReport } from "#/functions/reports.function";

vi.mock("@tanstack/react-router", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@tanstack/react-router")>()),
  Link: ({ children }: { children: React.ReactNode }) => <a>{children}</a>,
  useNavigate: () => vi.fn(),
}));

vi.mock("#/components/animal-folder", () => ({
  AnimalCredenza: () => null,
}));

import ReportDetails from "./reports-details";

describe("ReportDetails SSR", () => {
  test("renders without invoking browser-only PDF APIs", () => {
    const report = {
      id: "report-1",
      title: "Compte rendu de consultation",
      status: "draft",
      createdAt: new Date("2026-07-14T10:00:00Z"),
      updatedAt: new Date("2026-07-14T10:00:00Z"),
      anatomicalIssues: [],
      recommendations: [],
      ownerContents: [],
      sectionStates: {
        clinical: "empty",
        anatomical: "empty",
        recommendations: "empty",
        notes: "empty",
      },
    } as unknown as NormalizedAdvancedReport;

    expect(() =>
      renderToString(<ReportDetails report={report} />),
    ).not.toThrow();
  });
});
