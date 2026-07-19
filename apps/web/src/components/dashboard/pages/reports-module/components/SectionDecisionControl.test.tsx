// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SectionDecisionControl } from "./SectionDecisionControl";

afterEach(cleanup);

describe("SectionDecisionControl", () => {
  it("lets the practitioner confirm a section", () => {
    const onChange = vi.fn();
    render(
      <SectionDecisionControl state="needs_confirmation" onChange={onChange} />,
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Confirmer la section" }),
    );
    expect(onChange).toHaveBeenCalledWith("confirmed");
  });

  it("requires an explicit click to mark a section non applicable", () => {
    const onChange = vi.fn();
    render(<SectionDecisionControl state="empty" onChange={onChange} />);
    fireEvent.click(
      screen.getByRole("button", { name: "Marquer non applicable" }),
    );
    expect(onChange).toHaveBeenCalledWith("not_applicable");
  });
});
