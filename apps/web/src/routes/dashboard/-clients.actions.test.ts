import { readFileSync } from "node:fs";

import { describe, expect, test } from "vitest";

const source = readFileSync(new URL("./clients.tsx", import.meta.url), "utf8");

describe("client list actions", () => {
  test("wires the shared actions to view, update, and delete flows", () => {
    expect(source).toContain("EntityRowActions");
    expect(source).toContain("ClientDetailsDialog");
    expect(source).toContain("getClientDeletionDescription");
    expect(source).toMatch(/updateClient\(\{[\s\S]*?id:\s*client\.id/);
    expect(source).toMatch(/deleteMutation\.mutate\(\{\s*id:/);
  });
});
