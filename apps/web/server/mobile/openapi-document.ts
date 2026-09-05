import { createMobileApiApp, type MobileApiPorts } from "./mobile-api";

/**
 * Les ports ne sont jamais appelés : seule la description des routes est lue.
 * Construire le document ne doit toucher ni la base, ni le stockage objet, ni
 * la configuration — il doit pouvoir tourner en intégration continue sans le
 * moindre secret. Le proxy rend cette contrainte exécutable plutôt que
 * seulement documentée.
 */
const unusedPorts = new Proxy({} as MobileApiPorts, {
  get() {
    throw new Error(
      "La génération du document OpenAPI ne doit appeler aucun port.",
    );
  },
});

export function buildOpenApiDocument() {
  return createMobileApiApp(unusedPorts).getOpenAPI31Document({
    openapi: "3.1.0",
    info: {
      title: "Biume — API mobile",
      version: "1",
      description:
        "Surface consommée par l'application mobile Biume. Authentification par jeton porteur.",
    },
  });
}
