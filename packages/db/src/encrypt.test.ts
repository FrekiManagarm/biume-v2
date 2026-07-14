import { describe, expect, test, vi } from "vitest";

vi.mock("@biume/env/server", () => ({
  env: {
    ENCRYPTION_KEY:
      "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
  },
}));

import { decrypt, encrypt } from "./encrypt";

describe("field encryption", () => {
  test("roundtrips Unicode plaintext", () => {
    const plaintext = "Épaule gauche — 🐕 Mistral";

    expect(decrypt(encrypt(plaintext))).toBe(plaintext);
  });

  test("rejects ciphertext with an invalid format", () => {
    expect(() => decrypt("not-a-valid-ciphertext")).toThrow(
      "Invalid ciphertext format",
    );
  });
});
