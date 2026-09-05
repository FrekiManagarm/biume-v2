export type ReportCreationMode = "existing" | "quick";

type CanSubmitReportDraftInput = {
  mode: ReportCreationMode;
  selectedPetId: string | null;
  consultationReason: string;
  ownerName: string;
  animalName: string;
  isLoadingPets: boolean;
  isLoadingPet: boolean;
  isCreatingReport: boolean;
};

export function canSubmitReportDraft(input: CanSubmitReportDraftInput) {
  if (input.isLoadingPets || input.isLoadingPet || input.isCreatingReport) {
    return false;
  }
  if (input.mode === "quick") {
    return Boolean(input.ownerName.trim() && input.animalName.trim());
  }
  return Boolean(input.selectedPetId && input.consultationReason.trim());
}
