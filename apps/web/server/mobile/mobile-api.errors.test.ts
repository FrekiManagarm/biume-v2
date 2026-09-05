import { captureErrorCodes } from "@biume/contracts/capture";
import { describe, expect, it } from "vitest";

import {
  buildMobileApiError,
  errorMessages,
  errorStatuses,
} from "./mobile-api.errors";

describe("table des erreurs de l'api mobile", () => {
  it("couvre chaque code du contrat partagé", () => {
    for (const code of captureErrorCodes) {
      expect(errorMessages[code]).toBeTruthy();
      expect(errorStatuses[code]).toBeGreaterThanOrEqual(400);
    }
  });

  it("ne laisse fuir aucun détail technique dans les messages", () => {
    for (const code of captureErrorCodes) {
      expect(errorMessages[code]).not.toMatch(/error|exception|stack|sql/i);
    }
  });

  it("marque réessayable ce qui l'est par nature", () => {
    expect(buildMobileApiError("storage_unavailable").body.retryable).toBe(true);
    expect(buildMobileApiError("rate_limited").body.retryable).toBe(true);
    expect(buildMobileApiError("network").body.retryable).toBe(true);
  });

  /**
   * Réessayer une requête refusée ne la fera jamais aboutir. Le client mobile
   * s'appuie dessus pour arrêter sa boucle sans consommer de tentative.
   */
  it("ne marque pas réessayable ce qui exige une intervention", () => {
    expect(buildMobileApiError("unauthorized").body.retryable).toBe(false);
    expect(buildMobileApiError("forbidden").body.retryable).toBe(false);
    expect(buildMobileApiError("validation").body.retryable).toBe(false);
    expect(buildMobileApiError("conflict").body.retryable).toBe(false);
  });

  it("laisse l'appelant forcer le caractère réessayable", () => {
    expect(
      buildMobileApiError("conflict", { retryable: true }).body.retryable,
    ).toBe(true);
  });

  it("associe le bon statut à chaque famille", () => {
    expect(buildMobileApiError("unauthorized").status).toBe(401);
    expect(buildMobileApiError("active_organization_required").status).toBe(409);
    expect(buildMobileApiError("expired").status).toBe(410);
    expect(buildMobileApiError("rate_limited").status).toBe(429);
  });
});
