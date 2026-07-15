// @vitest-environment jsdom

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import {
  createElement,
  type ButtonHTMLAttributes,
  type ComponentType,
  type ReactNode,
} from "react";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const patientPageMocks = vi.hoisted(() => ({
  animals: [{ id: "animal-1", name: "Chat", code: "CAT" }],
  clients: [{ id: "client-1", name: "Marie Dupont" }],
  deleteAction: vi.fn(async (input: { id: string }) => input),
  invalidateQueries: vi.fn(async (_filters: unknown) => undefined),
  mutationInput: vi.fn((_input: unknown) => undefined),
  navigate: vi.fn(async (_options: unknown) => undefined),
  patients: [] as Array<Record<string, unknown>>,
  search: { page: 2, search: "", type: "tous" },
  toastSuccess: vi.fn((_message: string) => undefined),
}));

vi.mock("react", async () => {
  const { resolve } = await import("node:path");

  return vi.importActual<typeof import("react")>(
    resolve(process.cwd(), "../../node_modules/react"),
  );
});

vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => (config: Record<string, unknown>) => ({
    ...config,
    useSearch: () => patientPageMocks.search,
  }),
  useNavigate: () => patientPageMocks.navigate,
}));

vi.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({
    invalidateQueries: patientPageMocks.invalidateQueries,
  }),
  useSuspenseQuery: (options: { queryKey: readonly string[] }) => {
    if (options.queryKey[0] === "patients") {
      return { data: patientPageMocks.patients };
    }
    if (options.queryKey[0] === "clients") {
      return { data: patientPageMocks.clients };
    }
    return { data: patientPageMocks.animals };
  },
  useMutation: (options: {
    mutationFn: (input: { id: string }) => Promise<unknown>;
    onSuccess?: (data: unknown, input: { id: string }) => void | Promise<void>;
  }) => ({
    isPending: false,
    mutate: (input: { id: string }) => {
      patientPageMocks.mutationInput(input);
      void options
        .mutationFn(input)
        .then((data) => options.onSuccess?.(data, input));
    },
  }),
}));

vi.mock("#/components/animal-folder", () => ({
  AnimalCredenza: () => null,
}));

vi.mock("#/lib/api/actions/patients.action", () => ({
  createPatient: vi.fn(),
  deletePatient: patientPageMocks.deleteAction,
  updatePatient: vi.fn(),
}));

vi.mock("#/lib/api/queries/clients.query", () => ({
  clientsQueryOptions: vi.fn(() => ({ queryKey: ["clients"] })),
}));

vi.mock("#/lib/api/queries/patients.query", () => ({
  animalsQueryOptions: vi.fn(() => ({ queryKey: ["animals"] })),
  patientsQueryOptions: vi.fn(() => ({ queryKey: ["patients"] })),
}));

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: patientPageMocks.toastSuccess,
  },
}));

vi.mock("#/components/dashboard/lists/entity-row-actions", async () => {
  const { createElement, useState } = await import("react");

  return {
    EntityRowActions: ({
      entityName,
      onDelete,
    }: {
      entityName: string;
      onDelete: () => void;
    }) => {
      const [isMenuOpen, setIsMenuOpen] = useState(false);

      return createElement(
        "div",
        null,
        createElement(
          "button",
          {
            "aria-expanded": isMenuOpen,
            "aria-haspopup": "menu",
            "aria-label": `Actions pour ${entityName}`,
            onClick: () => setIsMenuOpen((open) => !open),
            type: "button",
          },
          "Actions",
        ),
        isMenuOpen
          ? createElement(
              "div",
              { role: "menu" },
              createElement(
                "button",
                {
                  onClick: () => {
                    setIsMenuOpen(false);
                    onDelete();
                  },
                  role: "menuitem",
                  type: "button",
                },
                "Supprimer",
              ),
            )
          : null,
      );
    },
    DeleteEntityDialog: ({
      description,
      onConfirm,
      open,
    }: {
      description: string;
      onConfirm: () => void | Promise<void>;
      open: boolean;
    }) =>
      open
        ? createElement(
            "div",
            { "data-testid": "delete-dialog" },
            createElement("p", null, description),
            createElement(
              "button",
              { type: "button", onClick: () => void onConfirm() },
              "Confirmer",
            ),
          )
        : null,
  };
});

vi.mock("#/components/ui/select", async () => {
  const { createElement } = await import("react");
  const Container = ({ children }: { children?: ReactNode }) =>
    createElement("div", null, children);

  return {
    Select: Container,
    SelectContent: Container,
    SelectItem: ({ children }: { children?: ReactNode }) =>
      createElement("div", null, children),
    SelectTrigger: Container,
    SelectValue: ({ placeholder }: { placeholder?: string }) =>
      createElement("span", null, placeholder),
  };
});

vi.mock("#/components/ui/button", async () => {
  const { createElement } = await import("react");

  return {
    Button: ({
      asChild: _asChild,
      children,
      size: _size,
      variant: _variant,
      ...props
    }: ButtonHTMLAttributes<HTMLButtonElement> & {
      asChild?: boolean;
      size?: string;
      variant?: string;
    }) => createElement("button", props, children),
  };
});

vi.mock("#/components/ui/badge", async () => {
  const { createElement } = await import("react");

  return {
    Badge: ({
      children,
      variant: _variant,
      ...props
    }: {
      children?: ReactNode;
      className?: string;
      variant?: string;
    }) => createElement("span", props, children),
  };
});

vi.mock("#/components/ui/table", async () => {
  const { createElement } = await import("react");

  const tableComponent = (tag: string) =>
    function TableComponent({
      children,
      ...props
    }: {
      children?: ReactNode;
      className?: string;
    }) {
      return createElement(tag, props, children);
    };

  return {
    Table: tableComponent("table"),
    TableBody: tableComponent("tbody"),
    TableCell: tableComponent("td"),
    TableHead: tableComponent("th"),
    TableHeader: tableComponent("thead"),
    TableRow: tableComponent("tr"),
  };
});

import {
  canChangeEntityFormOpenState,
  completeEntityDeletion,
  getPatientDeletionDescription,
  handleEntityDeletionError,
  handleEntityEditError,
  invalidateEntityLists,
  isStalePatientError,
  reconcileEditedEntity,
  refreshEntityListsAfterRemoval,
} from "#/components/dashboard/lists/entity-list.helpers";

const source = readFileSync(
  resolve(process.cwd(), "src/routes/dashboard/patients.tsx"),
  "utf8",
);

function buildPatient(index: number) {
  return {
    id: `patient-${index}`,
    name: `Patient ${index}`,
    ownerId: "client-1",
    type: "animal-1",
    breed: "Européen",
    gender: "Female",
    birthDate: new Date(2024, 0, index),
    weight: 4,
    height: 25,
    description: null,
    image: null,
    animal: { id: "animal-1", name: "Chat", code: "CAT" },
    owner: { id: "client-1", name: "Marie Dupont" },
    advancedReport: [],
    createdAt: new Date(2026, 0, index),
    updatedAt: null,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  patientPageMocks.patients = Array.from({ length: 11 }, (_, index) =>
    buildPatient(index + 1),
  );
  patientPageMocks.search = { page: 2, search: "", type: "tous" };
});

afterEach(cleanup);

describe("patient list actions", () => {
  test("deletes the only patient on page two through the composed page flow", async () => {
    const routeModule =
      (await import("./patients")) as typeof import("./patients") & {
        PatientsPage: ComponentType;
      };

    render(createElement(routeModule.PatientsPage));

    fireEvent.click(
      screen.getByRole("button", { name: "Actions pour Patient 11" }),
    );
    fireEvent.click(screen.getByRole("menuitem", { name: "Supprimer" }));
    expect(screen.getByTestId("delete-dialog")).toBeTruthy();
    expect(screen.getByText(getPatientDeletionDescription())).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Confirmer" }));

    expect(patientPageMocks.mutationInput).toHaveBeenCalledWith({
      id: "patient-11",
    });
    await waitFor(() => {
      expect(patientPageMocks.invalidateQueries.mock.calls).toEqual([
        [{ queryKey: ["patients"] }],
        [{ queryKey: ["clients"] }],
      ]);
      expect(screen.queryByTestId("delete-dialog")).toBeNull();
    });

    const navigation = patientPageMocks.navigate.mock.calls.at(-1)?.[0] as {
      search: (previous: Record<string, unknown>) => Record<string, unknown>;
    };
    expect(navigation.search(patientPageMocks.search)).toEqual({
      ...patientPageMocks.search,
      page: 1,
    });
    expect(patientPageMocks.toastSuccess).toHaveBeenCalledWith(
      "Patient supprimé.",
    );
  });

  test("wires view, prefilled edit, update, and deletion flows", () => {
    expect(source).toContain("EntityRowActions");
    expect(source).toContain("setSelectedPatientId(patient.id)");
    expect(source).toContain("getPatientFormValues(patient");
    expect(source).toContain("getPatientMutationValues(parsed)");
    expect(source).toContain(
      "updatePatient(getPatientMutationValues(parsed, patient.id))",
    );
    expect(source).toMatch(/deleteMutation\.mutate\(\{\s*id:/);
    expect(source).toContain("completeEntityDeletion");
    expect(source).toContain("handleEntityDeletionError");
    expect(source).toContain("handleEntityEditError");
    expect(source).toContain("isStaleError: isStalePatientError");
    expect(source).toContain("refreshEntityListsAfterRemoval");
    expect(source).toContain("reconcileEditedEntity");
    expect(source).toContain("form.state.isSubmitting");
  });

  test("blocks only user close requests while the form is submitting", () => {
    expect(canChangeEntityFormOpenState(false, true)).toBe(false);
    expect(canChangeEntityFormOpenState(false, false)).toBe(true);
    expect(canChangeEntityFormOpenState(true, true)).toBe(true);
  });

  test("invalidates patients and clients after a mutation", async () => {
    const invalidateQuery = vi.fn(async () => undefined);

    await invalidateEntityLists(invalidateQuery);

    expect(invalidateQuery.mock.calls).toEqual([[["patients"]], [["clients"]]]);
  });

  test("a stale edit keeps a newer patient open and moves back from an empty page", async () => {
    const invalidateQuery = vi.fn(async () => undefined);
    const navigateToPage = vi.fn(async () => undefined);
    let editedPatient: { id: string } | null = { id: "patient-b" };

    const wasHandled = await handleEntityEditError({
      error: new Error("Patient introuvable ou inaccessible."),
      entityId: "patient-a",
      isStaleError: isStalePatientError,
      onStale: async (editedId) => {
        editedPatient = reconcileEditedEntity(editedPatient, editedId);
        await refreshEntityListsAfterRemoval({
          currentPage: 3,
          invalidateQuery,
          navigateToPage,
          removedId: editedId,
          visibleIds: ["patient-a"],
        });
      },
    });

    expect(wasHandled).toBe(true);
    expect(editedPatient).toEqual({ id: "patient-b" });
    expect(invalidateQuery).toHaveBeenCalledTimes(2);
    expect(navigateToPage).toHaveBeenCalledWith(2);
  });

  test("a missing owner keeps the patient edit open without refreshing pagination", async () => {
    const onStale = vi.fn(async () => undefined);

    const wasHandled = await handleEntityEditError({
      error: new Error("Propriétaire introuvable ou inaccessible."),
      entityId: "patient-a",
      isStaleError: isStalePatientError,
      onStale,
    });

    expect(wasHandled).toBe(false);
    expect(onStale).not.toHaveBeenCalled();
  });

  test("successful deletion closes, refreshes both lists, and corrects pagination", async () => {
    const close = vi.fn();
    const invalidateQuery = vi.fn(async () => undefined);
    const navigateToPage = vi.fn(async () => undefined);

    await completeEntityDeletion({
      currentPage: 4,
      close,
      invalidateQuery,
      navigateToPage,
      removedId: "patient-a",
      visibleIds: ["patient-a"],
    });

    expect(close).toHaveBeenCalledWith("patient-a");
    expect(invalidateQuery.mock.calls).toEqual([[["patients"]], [["clients"]]]);
    expect(navigateToPage).toHaveBeenCalledWith(3);
  });

  test("handles a stale deletion without closing a newer patient", async () => {
    const invalidateQuery = vi.fn(async () => undefined);
    const navigateToPage = vi.fn(async () => undefined);
    let patientToDelete: { id: string } | null = { id: "patient-b" };

    const wasHandled = await handleEntityDeletionError({
      error: new Error("Patient introuvable ou inaccessible."),
      currentPage: 2,
      close: (removedId) => {
        patientToDelete = reconcileEditedEntity(patientToDelete, removedId);
      },
      invalidateQuery,
      isStaleError: isStalePatientError,
      navigateToPage,
      removedId: "patient-a",
      visibleIds: ["patient-a"],
    });

    expect(wasHandled).toBe(true);
    expect(patientToDelete).toEqual({ id: "patient-b" });
    expect(invalidateQuery).toHaveBeenCalledTimes(2);
    expect(navigateToPage).toHaveBeenCalledWith(1);
  });
});
