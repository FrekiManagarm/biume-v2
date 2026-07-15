import { describe, expect, test, vi } from "vitest";

import {
  createPatientWithOwnerIsolation,
  deleteClientWithPatientIsolation,
} from "./tenant-mutation-isolation";

describe("createPatientWithOwnerIsolation", () => {
  test("rejects a missing or cross-organization owner before insert", async () => {
    const findOwner = vi.fn(async () => null);
    const insertPatient = vi.fn(async () => ({ id: "patient-1" }));

    await expect(
      createPatientWithOwnerIsolation({ findOwner, insertPatient }),
    ).rejects.toThrow("Propriétaire introuvable ou inaccessible.");
    expect(insertPatient).not.toHaveBeenCalled();
  });

  test("inserts only after finding the scoped owner", async () => {
    const calls: string[] = [];
    const findOwner = vi.fn(async () => {
      calls.push("owner");
      return { id: "client-1" };
    });
    const insertPatient = vi.fn(async () => {
      calls.push("insert");
      return { id: "patient-1" };
    });

    await expect(
      createPatientWithOwnerIsolation({ findOwner, insertPatient }),
    ).resolves.toEqual({ id: "patient-1" });
    expect(calls).toEqual(["owner", "insert"]);
  });
});

describe("deleteClientWithPatientIsolation", () => {
  test("never deletes when a linked patient belongs to another organization", async () => {
    const findClient = vi.fn(async () => ({ id: "client-1" }));
    const findForeignPatient = vi.fn(async () => ({ id: "patient-other-org" }));
    const deleteClient = vi.fn(async () => ({ id: "client-1" }));

    await expect(
      deleteClientWithPatientIsolation({
        deleteClient,
        findClient,
        findForeignPatient,
      }),
    ).rejects.toThrow("intégrité");
    expect(deleteClient).not.toHaveBeenCalled();
  });

  test("deletes a scoped client when every linked patient is isolated", async () => {
    const findClient = vi.fn(async () => ({ id: "client-1" }));
    const findForeignPatient = vi.fn(async () => null);
    const deleteClient = vi.fn(async () => ({ id: "client-1" }));

    await expect(
      deleteClientWithPatientIsolation({
        deleteClient,
        findClient,
        findForeignPatient,
      }),
    ).resolves.toEqual({ id: "client-1" });
    expect(deleteClient).toHaveBeenCalledOnce();
  });
});
