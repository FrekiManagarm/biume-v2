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
  test: {
    env: {
      // Épingle le fuseau des tests pour un résultat déterministe quel que
      // soit celui de la machine qui les exécute. Des fixtures antérieures à
      // ce chantier écrivent des instants UTC (`new Date("...T00:00:00.000Z")`)
      // là où la logique attend une journée civile locale ; sous un fuseau
      // très à l'ouest (ex. America/Los_Angeles), ces instants retombent la
      // veille et font échouer des tests qui passent pourtant en production,
      // où la date vient toujours du calendrier local du praticien. Le public
      // visé est francophone : Europe/Paris est le fuseau de référence. La
      // vraie correction — réécrire les ~30 littéraux en dates civiles — est
      // repoussée au moment où ces fixtures seront retouchées pour autre chose.
      TZ: "Europe/Paris",
    },
  },
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
