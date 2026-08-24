import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { buildOpenApiDocument } from "./openapi-document";

describe("contrat openapi commité", () => {
  /**
   * Ce test est le garde-fou de tout le projet mobile : les modèles Dart sont
   * écrits à la main contre ce fichier. S'il ment, l'application ment.
   *
   * Régénérer avec `bun --filter @biume/web emit-openapi`.
   */
  it("correspond exactement aux routes de l'application", () => {
    // `node:fs` plutôt que `Bun.file` : vitest s'exécute sous Node, où les
    // globales de Bun n'existent pas.
    const committed = JSON.parse(
      readFileSync(
        fileURLToPath(new URL("../../../openapi.json", import.meta.url)),
        "utf8",
      ),
    );

    expect(committed).toEqual(
      JSON.parse(JSON.stringify(buildOpenApiDocument())),
    );
  });
});
