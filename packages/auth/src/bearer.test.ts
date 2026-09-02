import { describe, expect, it } from "vitest";

import { createAuth } from "./index";

/**
 * Le client Flutter n'a pas de cookies. Sans ce plugin, chaque requête mobile
 * repartirait en 401 sans aucun message exploitable côté client.
 */
describe("plugins d'authentification", () => {
  const plugins = createAuth().options.plugins as Array<{
    id?: string;
    hooks?: { after?: unknown[] };
  }>;
  const pluginIds = plugins.map((plugin) => plugin.id);

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

  /**
   * `tanstackStartCookies` recopie les `Set-Cookie` accumulés dans le magasin
   * de cookies de TanStack Start, depuis un `hooks.after`. Il ne voit que les
   * cookies posés par les plugins qui le précèdent : placé ailleurs qu'en
   * dernier, les cookies des plugins suivants sont perdus sans erreur.
   * better-auth le signalait en production à chaque démarrage.
   */
  it("garde le plugin de cookies en dernier", () => {
    expect(pluginIds.at(-1)).toBe("tanstack-start-cookies");
  });

  it("ne laisse aucun `hooks.after` s'exécuter après le plugin de cookies", () => {
    // La condition exacte que better-auth teste pour émettre son
    // avertissement : ce test échoue donc pour la même raison que le log,
    // y compris si un futur plugin est ajouté au mauvais endroit.
    const cookieIndex = pluginIds.indexOf("tanstack-start-cookies");
    const after = plugins
      .slice(cookieIndex + 1)
      .filter((plugin) => (plugin.hooks?.after?.length ?? 0) > 0)
      .map((plugin) => plugin.id);

    expect(after).toEqual([]);
  });
});
