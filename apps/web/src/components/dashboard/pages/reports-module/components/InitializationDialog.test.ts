import { describe, expect, test } from "vitest";

import { canSubmitReportDraft } from "./InitializationDialog.helpers";

describe("canSubmitReportDraft", () => {
  test("allows creation without an appointment choice when a patient and reason are present", () => {
    expect(
      canSubmitReportDraft({
        mode: "existing",
        selectedPetId: "pet_123",
        consultationReason: "Suivi locomoteur",
        ownerName: "",
        animalName: "",
        isLoadingPets: false,
        isLoadingPet: false,
        isCreatingReport: false,
      }),
    ).toBe(true);
  });
});
