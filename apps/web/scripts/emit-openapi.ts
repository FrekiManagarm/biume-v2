import { buildOpenApiDocument } from "../src/server/mobile/openapi-document";

const target = new URL("../openapi.json", import.meta.url);

await Bun.write(target, `${JSON.stringify(buildOpenApiDocument(), null, 2)}\n`);

console.log(`openapi.json écrit dans ${target.pathname}`);
