// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SectionDecisionControl } from "./SectionDecisionControl";

afterEach(cleanup);

describe("SectionDecisionControl", () => {
  it("lets the practitioner confirm a section", () => {
    const onChange = vi.fn();
    render(
      <SectionDecisionControl state="needs_confirmation" onChange={onChange} />,
    );
    const group = screen.getByRole("group", { name: "Décision de section" });
    const confirm = within(group).getByRole("button", {
      name: "Confirmer la section",
    });
    const notApplicable = within(group).getByRole("button", {
      name: "Marquer non applicable",
    });
    expect(confirm.getAttribute("aria-pressed")).toBe("false");
    expect(notApplicable.getAttribute("aria-pressed")).toBe("false");
    fireEvent.click(confirm);
    expect(onChange).toHaveBeenCalledWith("confirmed");
  });

  it("requires an explicit click to mark a section non applicable", () => {
    const onChange = vi.fn();
    render(
      <SectionDecisionControl state="not_applicable" onChange={onChange} />,
    );
    const group = screen.getByRole("group", { name: "Décision de section" });
    const confirm = within(group).getByRole("button", {
      name: "Confirmer la section",
    });
    const notApplicable = within(group).getByRole("button", {
      name: "Marquer non applicable",
    });
    expect(confirm.getAttribute("aria-pressed")).toBe("false");
    expect(notApplicable.getAttribute("aria-pressed")).toBe("true");
    fireEvent.click(notApplicable);
    expect(onChange).toHaveBeenCalledWith("not_applicable");
  });

  it("exposes the confirmed button as pressed", () => {
    render(<SectionDecisionControl state="confirmed" onChange={vi.fn()} />);
    const group = screen.getByRole("group", { name: "Décision de section" });
    expect(
      within(group)
        .getByRole("button", { name: "Confirmer la section" })
        .getAttribute("aria-pressed"),
    ).toBe("true");
  });
});
