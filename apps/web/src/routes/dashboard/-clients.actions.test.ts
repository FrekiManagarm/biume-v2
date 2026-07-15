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

const clientPageMocks = vi.hoisted(() => ({
  clients: [] as Array<Record<string, unknown>>,
  deleteAction: vi.fn(async (input: { id: string }) => input),
  invalidateQueries: vi.fn(async (_filters: unknown) => undefined),
  mutationInput: vi.fn((_input: unknown) => undefined),
  navigate: vi.fn(async (_options: unknown) => undefined),
  search: { page: 2, search: "", status: "tous" },
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
    useSearch: () => clientPageMocks.search,
  }),
  useNavigate: () => clientPageMocks.navigate,
}));

vi.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({
    invalidateQueries: clientPageMocks.invalidateQueries,
  }),
  useSuspenseQuery: () => ({ data: clientPageMocks.clients }),
  useMutation: (options: {
    mutationFn: (input: { id: string }) => Promise<unknown>;
    onSuccess?: (data: unknown, input: { id: string }) => void | Promise<void>;
  }) => ({
    isPending: false,
    mutate: (input: { id: string }) => {
      clientPageMocks.mutationInput(input);
      void options
        .mutationFn(input)
        .then((data) => options.onSuccess?.(data, input));
    },
  }),
}));

vi.mock("#/lib/api/actions/clients.action", () => ({
  createClient: vi.fn(),
  deleteClient: clientPageMocks.deleteAction,
  updateClient: vi.fn(),
}));

vi.mock("#/lib/api/queries/clients.query", () => ({
  clientsQueryOptions: vi.fn(() => ({ queryKey: ["clients"] })),
}));

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: clientPageMocks.toastSuccess,
  },
}));

vi.mock("#/components/dashboard/lists/entity-row-actions", async () => {
  const { createElement } = await import("react");

  return {
    EntityRowActions: ({
      entityName,
      onDelete,
    }: {
      entityName: string;
      onDelete: () => void;
    }) =>
      createElement(
        "button",
        { type: "button", onClick: onDelete },
        `Delete ${entityName}`,
      ),
    DeleteEntityDialog: ({
      onConfirm,
      open,
    }: {
      onConfirm: () => void | Promise<void>;
      open: boolean;
    }) =>
      open
        ? createElement(
            "div",
            { "data-testid": "delete-dialog" },
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
  canChangeClientFormOpenState,
  completeClientDeletion,
  getClientDisplayName,
  handleClientEditError,
  handleClientDeletionError,
  invalidateClientLists,
  reconcileEditedClient,
  refreshClientListsAfterRemoval,
} from "#/components/dashboard/lists/entity-list.helpers";

const source = readFileSync(
  resolve(process.cwd(), "src/routes/dashboard/clients.tsx"),
  "utf8",
);

function buildClient(index: number) {
  return {
    id: `client-${index}`,
    name: `Client ${index}`,
    email: `client-${index}@example.com`,
    phone: null,
    address: null,
    city: null,
    country: null,
    zip: null,
    pets: [],
    createdAt: new Date(2026, 0, index),
    updatedAt: null,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  clientPageMocks.clients = Array.from({ length: 11 }, (_, index) =>
    buildClient(index + 1),
  );
  clientPageMocks.search = { page: 2, search: "", status: "tous" };
});

afterEach(cleanup);

describe("client list actions", () => {
  test("deletes the only client on page two through the composed page flow", async () => {
    const routeModule =
      (await import("./clients")) as typeof import("./clients") & {
        ClientsPage: ComponentType;
      };

    render(createElement(routeModule.ClientsPage));

    fireEvent.click(screen.getByRole("button", { name: "Delete Client 11" }));
    expect(screen.getByTestId("delete-dialog")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Confirmer" }));

    expect(clientPageMocks.mutationInput).toHaveBeenCalledWith({
      id: "client-11",
    });
    await waitFor(() => {
      expect(clientPageMocks.invalidateQueries.mock.calls).toEqual([
        [{ queryKey: ["clients"] }],
        [{ queryKey: ["patients"] }],
      ]);
      expect(screen.queryByTestId("delete-dialog")).toBeNull();
    });

    const navigation = clientPageMocks.navigate.mock.calls.at(-1)?.[0] as {
      search: (previous: Record<string, unknown>) => Record<string, unknown>;
    };
    expect(navigation.search(clientPageMocks.search)).toEqual({
      ...clientPageMocks.search,
      page: 1,
    });
    expect(clientPageMocks.toastSuccess).toHaveBeenCalledWith(
      "Client supprimé.",
    );
  });

  test("wires the shared actions to view, update, and delete flows", () => {
    expect(source).toContain("EntityRowActions");
    expect(source).toContain("ClientDetailsDialog");
    expect(source).toContain("getClientDeletionDescription");
    expect(source).toMatch(/updateClient\(\{[\s\S]*?id:\s*client\.id/);
    expect(source).toMatch(/deleteMutation\.mutate\(\{\s*id:/);
    expect(source).toContain("completeClientDeletion");
    expect(source).toContain("handleClientDeletionError");
    expect(source).toContain("handleClientEditError");
    expect(source).toContain("refreshClientListsAfterRemoval");
    expect(source).toContain("reconcileEditedClient");
    expect(source).toContain("form.state.isSubmitting");
  });

  test("blocks only user close requests while the form is submitting", () => {
    expect(canChangeClientFormOpenState(false, true)).toBe(false);
    expect(canChangeClientFormOpenState(false, false)).toBe(true);
    expect(canChangeClientFormOpenState(true, true)).toBe(true);
  });

  test("invalidates clients and patients after an update", async () => {
    const invalidateQuery = vi.fn(async () => undefined);

    await invalidateClientLists(invalidateQuery);

    expect(invalidateQuery.mock.calls).toEqual([[["clients"]], [["patients"]]]);
  });

  test("a stale edit keeps a newer entity open and moves back from an empty page", async () => {
    const invalidateQuery = vi.fn(async () => undefined);
    const navigateToPage = vi.fn(async () => undefined);
    let editedClient: { id: string } | null = { id: "client-b" };

    const wasHandled = await handleClientEditError({
      error: new Error("Client introuvable ou inaccessible."),
      clientId: "client-a",
      onStale: async (editedId) => {
        editedClient = reconcileEditedClient(editedClient, editedId);
        await refreshClientListsAfterRemoval({
          currentPage: 3,
          invalidateQuery,
          navigateToPage,
          removedId: editedId,
          visibleIds: ["client-a"],
        });
      },
    });

    expect(wasHandled).toBe(true);
    expect(editedClient).toEqual({ id: "client-b" });
    expect(invalidateQuery).toHaveBeenCalledTimes(2);
    expect(navigateToPage).toHaveBeenCalledWith(2);
  });

  test("closes the matching stale edit", () => {
    expect(reconcileEditedClient({ id: "client-a" }, "client-a")).toBeNull();
  });

  test("generic edit errors keep the current edit open", async () => {
    const onStale = vi.fn(async () => undefined);
    const editedClient = { id: "client-a" };

    const wasHandled = await handleClientEditError({
      error: new Error("Network error"),
      clientId: editedClient.id,
      onStale,
    });

    expect(wasHandled).toBe(false);
    expect(editedClient).toEqual({ id: "client-a" });
    expect(onStale).not.toHaveBeenCalled();
  });

  test("successful deletion closes, refreshes both lists, and corrects pagination", async () => {
    const close = vi.fn();
    const invalidateQuery = vi.fn(async () => undefined);
    const navigateToPage = vi.fn(async () => undefined);

    await completeClientDeletion({
      currentPage: 4,
      close,
      invalidateQuery,
      navigateToPage,
      removedId: "client-a",
      visibleIds: ["client-a"],
    });

    expect(close).toHaveBeenCalledOnce();
    expect(invalidateQuery.mock.calls).toEqual([[["clients"]], [["patients"]]]);
    expect(navigateToPage).toHaveBeenCalledWith(3);
  });

  test("stale deletion closes, refreshes both lists, and corrects pagination", async () => {
    const close = vi.fn();
    const invalidateQuery = vi.fn(async () => undefined);
    const navigateToPage = vi.fn(async () => undefined);

    const wasHandled = await handleClientDeletionError({
      error: new Error("Client introuvable ou inaccessible."),
      currentPage: 2,
      close,
      invalidateQuery,
      navigateToPage,
      removedId: "client-a",
      visibleIds: ["client-a"],
    });

    expect(wasHandled).toBe(true);
    expect(close).toHaveBeenCalledOnce();
    expect(invalidateQuery).toHaveBeenCalledTimes(2);
    expect(navigateToPage).toHaveBeenCalledWith(1);
  });

  test("generic deletion errors keep the current state untouched", async () => {
    const close = vi.fn();
    const invalidateQuery = vi.fn(async () => undefined);
    const navigateToPage = vi.fn(async () => undefined);

    const wasHandled = await handleClientDeletionError({
      error: new Error("Network error"),
      currentPage: 2,
      close,
      invalidateQuery,
      navigateToPage,
      removedId: "client-a",
      visibleIds: ["client-a"],
    });

    expect(wasHandled).toBe(false);
    expect(close).not.toHaveBeenCalled();
    expect(invalidateQuery).not.toHaveBeenCalled();
    expect(navigateToPage).not.toHaveBeenCalled();
  });

  test("normalizes blank client names for accessible labels", () => {
    expect(getClientDisplayName("   ")).toBe("Client sans nom");
    expect(getClientDisplayName("  Marie Dupont  ")).toBe("Marie Dupont");
  });
});
