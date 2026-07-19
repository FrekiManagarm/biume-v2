import { describe, expect, it } from "vitest";
import { canSubmitReportDraft } from "./InitializationDialog.helpers";

const idle = {
  isLoadingPets: false,
  isLoadingPet: false,
  isCreatingReport: false,
};

describe("canSubmitReportDraft", () => {
  it("allows an existing animal with a consultation reason", () => {
    expect(
      canSubmitReportDraft({
        ...idle,
        mode: "existing",
        selectedPetId: "pet-1",
        consultationReason: "Suivi locomoteur",
        ownerName: "",
        animalName: "",
      }),
    ).toBe(true);
  });

  it("allows quick creation with only owner and animal names", () => {
    expect(
      canSubmitReportDraft({
        ...idle,
        mode: "quick",
        selectedPetId: null,
        consultationReason: "",
        ownerName: "Camille",
        animalName: "Nox",
      }),
    ).toBe(true);
  });

  it("rejects quick creation when either required name is blank", () => {
    expect(
      canSubmitReportDraft({
        ...idle,
        mode: "quick",
        selectedPetId: null,
        consultationReason: "",
        ownerName: "Camille",
        animalName: " ",
      }),
    ).toBe(false);
  });
});
