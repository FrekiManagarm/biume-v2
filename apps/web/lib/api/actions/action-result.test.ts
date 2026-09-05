import { describe, expect, it } from "vitest";

import { toActionResult } from "./action-result";

describe("toActionResult", () => {
  it("rend le résultat de la fonction en cas de succès", async () => {
    const run = toActionResult(async (n: number) => n * 2);

    await expect(run(21)).resolves.toEqual({ success: true, data: 42 });
  });

  it("capture le message d'une Error plutôt que de la laisser remonter", async () => {
    // C'est tout l'objet du contrat : une Error qui traverse la frontière
    // Server Action voit son message remplacé par un texte générique en
    // production. Capturé ici, le message français atteint le praticien.
    const run = toActionResult(async () => {
      throw new Error("Client introuvable ou inaccessible.");
    });

    await expect(run()).resolves.toEqual({
      success: false,
      error: "Client introuvable ou inaccessible.",
    });
  });

  it("rend un message générique pour une valeur levée qui n'est pas une Error", async () => {
    const run = toActionResult(async () => {
      throw "chaîne nue";
    });

    const result = await run();

    expect(result.success).toBe(false);
    expect(typeof (result as { error: string }).error).toBe("string");
  });

  it("laisse passer les erreurs de contrôle de flux de Next", async () => {
    // `redirect()` et `notFound()` de Next lèvent une erreur que le framework
    // intercepte. La capturer la transformerait en message affiché, et la
    // redirection n'aurait jamais lieu.
    const digest = Object.assign(new Error("NEXT_REDIRECT"), {
      digest: "NEXT_REDIRECT;replace;/signin;307;",
    });
    const run = toActionResult(async () => {
      throw digest;
    });

    await expect(run()).rejects.toBe(digest);
  });
});
