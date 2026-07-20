// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it } from "vitest";

import type { ReportCreationMode } from "./InitializationDialog.helpers";
import { ReportCreationModeSelector } from "./ReportCreationModeSelector";

afterEach(cleanup);

function Harness() {
  const [mode, setMode] = useState<ReportCreationMode>("existing");
  return <ReportCreationModeSelector mode={mode} onModeChange={setMode} />;
}

describe("ReportCreationModeSelector", () => {
  it("exposes a semantic group and updates the pressed mode", () => {
    render(<Harness />);

    expect(
      screen.getByRole("group", { name: "Mode de création" }),
    ).not.toBeNull();
    const existing = screen.getByRole("button", { name: "Animal existant" });
    const quick = screen.getByRole("button", {
      name: "Nouveau dossier rapide",
    });

    expect(existing.getAttribute("aria-pressed")).toBe("true");
    expect(quick.getAttribute("aria-pressed")).toBe("false");

    fireEvent.click(quick);

    expect(existing.getAttribute("aria-pressed")).toBe("false");
    expect(quick.getAttribute("aria-pressed")).toBe("true");
  });
});
