// @vitest-environment jsdom

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, test, vi } from "vitest";

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

describe("client list actions", () => {
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
          itemCountOnPage: 1,
          invalidateQuery,
          navigateToPage,
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
      itemCountOnPage: 1,
      close,
      invalidateQuery,
      navigateToPage,
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
      itemCountOnPage: 1,
      close,
      invalidateQuery,
      navigateToPage,
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
      itemCountOnPage: 1,
      close,
      invalidateQuery,
      navigateToPage,
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
