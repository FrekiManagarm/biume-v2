import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { MobileRequestError } from "./mobile-api.errors";
import { assertReportDecidable } from "./report-decision.service";

describe("garde de décision sur un compte rendu", () => {
  it("laisse passer un brouillon", () => {
    expect(() => assertReportDecidable("draft")).not.toThrow();
  });

  it("refuse un compte rendu finalisé", () => {
    expect(() => assertReportDecidable("finalized")).toThrow(
      MobileRequestError,
    );
    expect(() => assertReportDecidable("finalized")).toThrow(/conflict/);
  });

  /**
   * Le cas qui coûte : le propriétaire a reçu le compte rendu. Ce qu'il a lu
   * et ce que le praticien voit ne doivent plus pouvoir diverger.
   */
  it("refuse un compte rendu envoyé au propriétaire", () => {
    expect(() => assertReportDecidable("sent")).toThrow(MobileRequestError);
  });
});

describe("les deux endpoints de décision portent la garde", () => {
  const source = readFileSync(
    new URL("./mobile-api.ports.ts", import.meta.url),
    "utf8",
  );

  function bodyOf(start: string, end: string) {
    return source.slice(source.indexOf(start), source.indexOf(end));
  }

  it("decideProposal refuse un rapport qui n'est plus un brouillon", () => {
    expect(bodyOf("async decideProposal(", "async decideSection(")).toContain(
      "assertReportDecidable(current.status)",
    );
  });

  it("decideSection refuse un rapport qui n'est plus un brouillon", () => {
    expect(
      bodyOf("async decideSection(", "async regenerateProposals("),
    ).toContain("assertReportDecidable(current.status)");
  });
});
