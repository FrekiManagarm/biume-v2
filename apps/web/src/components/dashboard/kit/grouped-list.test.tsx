// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Building2 } from "lucide-react";
import { afterEach, describe, expect, test, vi } from "vitest";

import { GroupedList, GroupedListRow } from "./grouped-list";

afterEach(() => {
  cleanup();
});

describe("GroupedListRow", () => {
  test("une ligne sélectionnable est un bouton nommé par son titre", () => {
    const onSelect = vi.fn();
    render(
      <GroupedList>
        <GroupedListRow
          icon={Building2}
          title="Cabinet du Vieux Chêne"
          meta="cabinet-vieux-chene.biume"
          onSelect={onSelect}
        />
      </GroupedList>,
    );

    const row = screen.getByRole("button", {
      name: /Cabinet du Vieux Chêne/,
    });
    fireEvent.click(row);

    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  test("une ligne désactivée n'appelle pas onSelect", () => {
    const onSelect = vi.fn();
    render(
      <GroupedList>
        <GroupedListRow
          icon={Building2}
          title="Cabinet du Vieux Chêne"
          onSelect={onSelect}
          disabled
        />
      </GroupedList>,
    );

    fireEvent.click(
      screen.getByRole("button", { name: /Cabinet du Vieux Chêne/ }),
    );

    expect(onSelect).not.toHaveBeenCalled();
  });

  test("une ligne sans onSelect n'est pas un bouton", () => {
    render(
      <GroupedList>
        <GroupedListRow icon={Building2} title="Cabinet du Vieux Chêne" />
      </GroupedList>,
    );

    expect(screen.queryByRole("button")).toBeNull();
    expect(screen.getByText("Cabinet du Vieux Chêne")).toBeTruthy();
  });
});
