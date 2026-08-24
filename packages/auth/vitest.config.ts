import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Les variables doivent être posées avant que le premier fichier de test
    // n'importe `@biume/env/server`, qui valide à l'évaluation du module.
    setupFiles: ["./vitest.setup.ts"],
  },
});
