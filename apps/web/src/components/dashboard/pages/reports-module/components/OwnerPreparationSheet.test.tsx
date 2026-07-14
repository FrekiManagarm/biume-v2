// @vitest-environment jsdom
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { OwnerPreparationSheet } from "./OwnerPreparationSheet";

const sendMessage = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));
const agentState = vi.hoisted(() => ({
  messages: [] as Array<{
    id: string;
    role: string;
    parts: Array<{ type: string; text: string }>;
  }>,
  isLoading: false,
  error: null as Error | null,
  sendMessage,
  reset: vi.fn(),
}));

vi.mock("@/hooks/useVulgarisationAgent", () => ({
  useVulgarisationAgent: () => agentState,
}));

afterEach(cleanup);

const first = {
  key: "observation:obs_01",
  sourceKind: "observation" as const,
  sourceId: "obs_01",
  section: "clinical" as const,
  professionalText: "Restriction gléno-humérale",
  context: "Épaule gauche",
  fingerprint: "one",
  order: 0,
  status: "missing" as const,
};
const second = {
  key: "notes:notes",
  sourceKind: "notes" as const,
  sourceId: "notes",
  section: "notes" as const,
  professionalText: "Surveillance",
  context: "Notes",
  fingerprint: "two",
  order: 1,
  status: "missing" as const,
};
const existingFirst = {
  id: "owner_01",
  reportId: "report_01",
  sourceKind: "observation" as const,
  sourceId: "obs_01",
  ownerText: "Version déjà relue.",
  sourceFingerprint: "outdated",
};

describe("OwnerPreparationSheet", () => {
  beforeEach(() => {
    agentState.messages = [];
    agentState.isLoading = false;
    agentState.error = null;
    sendMessage.mockClear();
    agentState.reset.mockClear();
  });

  test("validates an editable proposal and advances", async () => {
    const onSave = vi.fn().mockResolvedValue({ success: true });
    render(
      <OwnerPreparationSheet
        open
        onOpenChange={vi.fn()}
        reportId="report_01"
        queue={[first, second]}
        records={[]}
        onSave={onSave}
      />,
    );
    fireEvent.change(screen.getByLabelText("Version propriétaire"), {
      target: { value: "L’épaule gauche manque de mobilité." },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Valider et continuer" }),
    );
    await waitFor(() => expect(onSave).toHaveBeenCalledOnce());
    expect(screen.getByText("2 sur 2")).not.toBeNull();
  });

  test("keeps the next item focused when the saved item leaves the queue", async () => {
    let resolveSave!: () => void;
    let rerender!: ReturnType<typeof render>["rerender"];
    const savePromise = new Promise<void>((resolve) => {
      resolveSave = resolve;
    });
    const onSave = vi.fn(() => {
      rerender(
        <OwnerPreparationSheet
          open
          onOpenChange={vi.fn()}
          reportId="report_01"
          queue={[second]}
          records={[existingFirst]}
          onSave={onSave}
        />,
      );
      return savePromise;
    });
    ({ rerender } = render(
      <OwnerPreparationSheet
        open
        onOpenChange={vi.fn()}
        reportId="report_01"
        queue={[first, second]}
        records={[]}
        onSave={onSave}
      />,
    ));
    fireEvent.change(screen.getByLabelText("Version propriétaire"), {
      target: { value: "Version enregistrée" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Valider et continuer" }),
    );

    expect(screen.getByDisplayValue("Surveillance")).not.toBeNull();
    await act(async () => resolveSave());

    expect(screen.queryByText("Préparation terminée")).toBeNull();
    expect(screen.getByDisplayValue("Surveillance")).not.toBeNull();
  });

  test("keeps the proposal visible when saving fails", async () => {
    render(
      <OwnerPreparationSheet
        open
        onOpenChange={vi.fn()}
        reportId="report_01"
        queue={[first]}
        records={[]}
        onSave={vi.fn().mockRejectedValue(new Error("save failed"))}
      />,
    );
    fireEvent.change(screen.getByLabelText("Version propriétaire"), {
      target: { value: "Texte à conserver" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Valider et continuer" }),
    );
    expect(await screen.findByText("Enregistrement impossible")).not.toBeNull();
    expect(screen.getByDisplayValue("Texte à conserver")).not.toBeNull();
  });

  test("generates on demand and passes the focused source context", () => {
    render(
      <OwnerPreparationSheet
        open
        onOpenChange={vi.fn()}
        reportId="report_01"
        queue={[first]}
        records={[]}
        onSave={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Générer" }));
    expect(sendMessage).toHaveBeenCalledWith("Restriction gléno-humérale", {
      reportId: "report_01",
      sourceKind: "observation",
      sourceId: "obs_01",
    });
  });

  test("copies a completed generated proposal into the editable draft", () => {
    const props = {
      open: true,
      onOpenChange: vi.fn(),
      reportId: "report_01",
      queue: [first],
      records: [],
      onSave: vi.fn(),
    };
    const { rerender } = render(<OwnerPreparationSheet {...props} />);

    fireEvent.click(screen.getByRole("button", { name: "Générer" }));
    agentState.messages = [
      {
        id: "assistant_01",
        role: "assistant",
        parts: [
          {
            type: "text",
            text: "L’épaule gauche manque de mobilité.",
          },
        ],
      },
    ];
    rerender(<OwnerPreparationSheet {...props} />);

    expect(
      screen.getByDisplayValue("L’épaule gauche manque de mobilité."),
    ).not.toBeNull();
    expect(props.onSave).not.toHaveBeenCalled();
  });

  test("ignores a partial assistant message when generation fails", () => {
    const props = {
      open: true,
      onOpenChange: vi.fn(),
      reportId: "report_01",
      queue: [first],
      records: [existingFirst],
      onSave: vi.fn(),
    };
    const { rerender } = render(<OwnerPreparationSheet {...props} />);

    fireEvent.click(screen.getByRole("button", { name: "Régénérer" }));
    agentState.messages = [
      {
        id: "assistant_partial",
        role: "assistant",
        parts: [{ type: "text", text: "Réponse partielle à ignorer" }],
      },
    ];
    agentState.error = new Error("stream failed");
    rerender(<OwnerPreparationSheet {...props} />);

    expect(screen.getByDisplayValue("Version déjà relue.")).not.toBeNull();
    expect(
      screen.queryByDisplayValue("Réponse partielle à ignorer"),
    ).toBeNull();
  });

  test.each([
    ["clinical", "Observations"],
    ["anatomical", "Anatomie"],
    ["recommendations", "Recommandations"],
    ["notes", "Notes additionnelles"],
  ] as const)(
    "shows the %s content section as %s in the queue header",
    (section, label) => {
      render(
        <OwnerPreparationSheet
          open
          onOpenChange={vi.fn()}
          reportId="report_01"
          queue={[{ ...first, key: `${section}:source`, section }]}
          records={[]}
          onSave={vi.fn()}
        />,
      );

      expect(screen.getByText(label)).not.toBeNull();
    },
  );

  test("preserves edits made while the latest of successive generations is streaming", () => {
    const props = {
      open: true,
      onOpenChange: vi.fn(),
      reportId: "report_01",
      records: [],
      onSave: vi.fn(),
    };
    const { rerender } = render(
      <OwnerPreparationSheet {...props} queue={[first]} />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Générer" }));
    agentState.messages = [
      {
        id: "assistant_01",
        role: "assistant",
        parts: [{ type: "text", text: "Première proposition" }],
      },
    ];
    rerender(<OwnerPreparationSheet {...props} queue={[first]} />);
    expect(screen.getByDisplayValue("Première proposition")).not.toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Régénérer" }));
    agentState.isLoading = true;
    rerender(<OwnerPreparationSheet {...props} queue={[{ ...first }]} />);
    fireEvent.change(screen.getByLabelText("Version propriétaire"), {
      target: { value: "Correction saisie pendant la génération" },
    });
    rerender(<OwnerPreparationSheet {...props} queue={[{ ...first }]} />);

    agentState.messages = [
      {
        id: "assistant_02",
        role: "assistant",
        parts: [{ type: "text", text: "Seconde proposition" }],
      },
    ];
    agentState.isLoading = false;
    rerender(<OwnerPreparationSheet {...props} queue={[{ ...first }]} />);

    expect(
      screen.getByDisplayValue("Correction saisie pendant la génération"),
    ).not.toBeNull();
    expect(screen.queryByDisplayValue("Seconde proposition")).toBeNull();
    expect(sendMessage).toHaveBeenCalledTimes(2);
  });

  test("preserves a manual correction after a generated proposal", () => {
    const props = {
      open: true,
      onOpenChange: vi.fn(),
      reportId: "report_01",
      records: [],
      onSave: vi.fn(),
    };
    const { rerender } = render(
      <OwnerPreparationSheet {...props} queue={[first]} />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Générer" }));
    agentState.messages = [
      {
        id: "assistant_01",
        role: "assistant",
        parts: [
          {
            type: "text",
            text: "L’épaule gauche manque de mobilité.",
          },
        ],
      },
    ];
    rerender(<OwnerPreparationSheet {...props} queue={[first]} />);
    fireEvent.change(screen.getByLabelText("Version propriétaire"), {
      target: { value: "Correction manuelle à conserver." },
    });

    rerender(<OwnerPreparationSheet {...props} queue={[{ ...first }]} />);

    expect(
      screen.getByDisplayValue("Correction manuelle à conserver."),
    ).not.toBeNull();
  });

  test("offers retry after generation failure", () => {
    agentState.error = new Error("generation failed");
    render(
      <OwnerPreparationSheet
        open
        onOpenChange={vi.fn()}
        reportId="report_01"
        queue={[first]}
        records={[]}
        onSave={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Réessayer" }));
    expect(sendMessage).toHaveBeenCalledOnce();
    expect(
      screen.getByLabelText("Version propriétaire").hasAttribute("disabled"),
    ).toBe(false);
  });

  test("asks before skipping an edited draft so it is never silently lost", () => {
    const onSave = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <OwnerPreparationSheet
        open
        onOpenChange={onOpenChange}
        reportId="report_01"
        queue={[first, second]}
        records={[]}
        onSave={onSave}
      />,
    );
    fireEvent.change(screen.getByLabelText("Version propriétaire"), {
      target: { value: "Brouillon non enregistré" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Passer" }));

    expect(screen.getByText("1 sur 2")).not.toBeNull();
    expect(
      screen.getByRole("button", { name: "Passer sans enregistrer" }),
    ).not.toBeNull();
    fireEvent.click(
      screen.getByRole("button", { name: "Continuer la préparation" }),
    );
    expect(screen.getByDisplayValue("Brouillon non enregistré")).not.toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Passer" }));
    fireEvent.click(
      screen.getByRole("button", { name: "Passer sans enregistrer" }),
    );
    expect(screen.getByText("2 sur 2")).not.toBeNull();
    expect(onSave).not.toHaveBeenCalled();
  });

  test("confirms before closing an edited draft", () => {
    const onOpenChange = vi.fn();
    render(
      <OwnerPreparationSheet
        open
        onOpenChange={onOpenChange}
        reportId="report_01"
        queue={[first]}
        records={[]}
        onSave={vi.fn()}
      />,
    );
    fireEvent.change(screen.getByLabelText("Version propriétaire"), {
      target: { value: "Brouillon non enregistré" },
    });
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(
      screen.getByRole("button", { name: "Fermer sans enregistrer" }),
    ).not.toBeNull();
    fireEvent.click(
      screen.getByRole("button", { name: "Fermer sans enregistrer" }),
    );
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  test("keeps initial focus inside the sheet and closes a clean draft with Escape", async () => {
    const onOpenChange = vi.fn();
    render(
      <OwnerPreparationSheet
        open
        onOpenChange={onOpenChange}
        reportId="report_01"
        queue={[first]}
        records={[]}
        onSave={vi.fn()}
      />,
    );

    const dialog = screen.getByRole("dialog");
    await waitFor(() =>
      expect(dialog.contains(document.activeElement)).toBe(true),
    );

    fireEvent.keyDown(document, { key: "Escape" });
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(
      screen.queryByRole("button", { name: "Fermer sans enregistrer" }),
    ).toBeNull();
  });

  test("shows the owner preview action after the last saved item", async () => {
    const onViewPreview = vi.fn();
    render(
      <OwnerPreparationSheet
        open
        onOpenChange={vi.fn()}
        reportId="report_01"
        queue={[first]}
        records={[]}
        onSave={vi.fn().mockResolvedValue({ success: true })}
        onViewPreview={onViewPreview}
      />,
    );
    fireEvent.change(screen.getByLabelText("Version propriétaire"), {
      target: { value: "Version finale" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Valider et continuer" }),
    );

    const previewButton = await screen.findByRole("button", {
      name: "Voir l’aperçu propriétaire",
    });
    fireEvent.click(previewButton);

    expect(onViewPreview).toHaveBeenCalledOnce();
  });
});
