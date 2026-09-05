// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import { OwnerPreparationWarningDialog } from "./OwnerPreparationWarningDialog";

describe("OwnerPreparationWarningDialog", () => {
  test("offers preparation without blocking explicit finalization", () => {
    const onPrepare = vi.fn();
    const onFinalize = vi.fn();
    render(
      <OwnerPreparationWarningDialog
        open
        missingCount={2}
        staleCount={1}
        onOpenChange={vi.fn()}
        onPrepare={onPrepare}
        onFinalize={onFinalize}
      />,
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Préparer maintenant" }),
    );
    expect(onPrepare).toHaveBeenCalledOnce();
    fireEvent.click(
      screen.getByRole("button", { name: "Finaliser quand même" }),
    );
    expect(onFinalize).toHaveBeenCalledOnce();
  });
});
