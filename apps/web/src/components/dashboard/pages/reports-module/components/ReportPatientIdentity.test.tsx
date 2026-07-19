// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { ReportPatientIdentity } from "./ReportPatientIdentity";

afterEach(cleanup);

describe("ReportPatientIdentity", () => {
  it("shows honest quick-created patient identity without fabricating a species", () => {
    render(
      <ReportPatientIdentity
        patient={{
          name: "Nox",
          type: null,
          animal: null,
          owner: { name: "Camille" },
        }}
      />,
    );

    expect(screen.getByText("Nox")).not.toBeNull();
    expect(screen.getByText("Espèce non renseignée")).not.toBeNull();
    expect(screen.getByText("Camille")).not.toBeNull();
  });

  it("uses an honest owner fallback when no owner name is available", () => {
    render(
      <ReportPatientIdentity
        patient={{ name: "Nox", type: null, animal: null, owner: null }}
      />,
    );

    expect(screen.getByText("Propriétaire non renseigné")).not.toBeNull();
  });
});
