import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

/**
 * `apps/web/node_modules` porte sa propre copie de React, alors que
 * `react-dom` se résout depuis la racine du monorepo. Les composants montaient
 * donc avec une instance de React pendant que le renderer en utilisait une
 * autre, et tout appel de hook échouait — 30 tests de `reports-module` en
 * dépendaient.
 *
 * `resolve.dedupe` ne suffit pas ici : les deux copies sont physiquement
 * présentes et chacune est une résolution légitime. On pointe donc
 * explicitement vers celle de la racine, la même que `vite.config.ts`
 * dédoublonne pour l'application.
 */
const rootModule = (specifier: string) =>
  fileURLToPath(new URL(`../../node_modules/${specifier}`, import.meta.url));

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
    dedupe: ["react", "react-dom"],
    alias: {
      "react-dom/client": rootModule("react-dom/client.js"),
      "react-dom": rootModule("react-dom"),
      "react/jsx-dev-runtime": rootModule("react/jsx-dev-runtime.js"),
      "react/jsx-runtime": rootModule("react/jsx-runtime.js"),
      react: rootModule("react"),
    },
  },
});
