import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

import { buildOpenApiDocument } from "../src/server/mobile/openapi-document";

/**
 * `node:fs` plutôt que `Bun.write`, contrairement à la préférence habituelle du
 * dépôt : `apps/web/tsconfig.json` restreint les types ambiants à
 * `vite/client`, et déclarer ceux de Bun injecterait ses globales dans tout le
 * code navigateur de l'application pour un unique script.
 */
const target = fileURLToPath(new URL("../openapi.json", import.meta.url));

await writeFile(
  target,
  `${JSON.stringify(buildOpenApiDocument(), null, 2)}\n`,
  "utf8",
);

console.log(`openapi.json écrit dans ${target}`);
