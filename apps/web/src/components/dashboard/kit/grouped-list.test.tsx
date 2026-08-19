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

  test("le nom accessible est le titre seul, sans le badge ni le meta", () => {
    const onSelect = vi.fn();
    render(
      <GroupedList>
        <GroupedListRow
          icon={Building2}
          title="Cabinet du Vieux Chêne"
          meta="cabinet-vieux-chene.biume"
          badge={<span>Active</span>}
          onSelect={onSelect}
        />
      </GroupedList>,
    );

    // Correspondance exacte : si le badge ou le meta se glissaient dans le nom
    // accessible, ce nom deviendrait
    // "Cabinet du Vieux ChêneActivecabinet-vieux-chene.biume" et cette requête
    // ne trouverait plus rien.
    const row = screen.getByRole("button", {
      name: "Cabinet du Vieux Chêne",
    });

    expect(row).toBeTruthy();
  });

  test("le statut déclaré est annoncé après le titre, et le meta reste exclu", () => {
    const onSelect = vi.fn();
    render(
      <GroupedList>
        <GroupedListRow
          icon={Building2}
          title="Nox"
          meta="lundi 17 août · 09:00"
          badge={<span>Annulé</span>}
          statusLabel="Annulé"
          onSelect={onSelect}
        />
      </GroupedList>,
    );

    // Correspondance exacte, dans cet ordre : le praticien doit entendre de
    // quoi il s'agit avant son état, et le meta ne doit jamais s'y glisser.
    // Sans `statusLabel` composé dans le nom accessible, « Annulé » resterait
    // purement visuel et cette requête ne trouverait rien.
    expect(screen.getByRole("button", { name: "Nox, Annulé" })).toBeTruthy();
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
