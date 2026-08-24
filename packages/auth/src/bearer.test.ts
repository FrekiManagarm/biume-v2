import { describe, expect, it } from "vitest";

import { createAuth } from "./index";

/**
 * Le client Flutter n'a pas de cookies. Sans ce plugin, chaque requête mobile
 * repartirait en 401 sans aucun message exploitable côté client.
 */
describe("plugins d'authentification", () => {
  const pluginIds = createAuth().options.plugins.map(
    (plugin: { id?: string }) => plugin.id,
  );

  it("accepte un jeton porteur", () => {
    expect(pluginIds).toContain("bearer");
  });

  /**
   * Les deux cohabitent sans conflit. Retirer `expo` maintenant casserait
   * l'application Expo avant que la Flutter ne la remplace : sa suppression
   * appartient au plan 6, avec celle de `apps/mobile`.
   */
  it("conserve le plugin Expo pendant la transition", () => {
    expect(pluginIds).toContain("expo");
  });

  it("conserve les organisations", () => {
    expect(pluginIds).toContain("organization");
  });
});
