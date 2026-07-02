type CanSubmitReportDraftInput = {
  selectedPetId: string | null;
  consultationReason: string;
  isLoadingPets: boolean;
  isLoadingPet: boolean;
  isCreatingReport: boolean;
};

export function canSubmitReportDraft({
  selectedPetId,
  consultationReason,
  isLoadingPets,
  isLoadingPet,
  isCreatingReport,
}: CanSubmitReportDraftInput) {
  return (
    !!selectedPetId &&
    !!consultationReason.trim() &&
    !isLoadingPets &&
    !isLoadingPet &&
    !isCreatingReport
  );
}
