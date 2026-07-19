export type AnatomicalAnimalType = "DOG" | "CAT" | "HORSE";

export type AnimalSpecies = {
  code?: string | null;
  name?: string | null;
};

const supportedSpecies: Record<AnatomicalAnimalType, readonly string[]> = {
  DOG: ["dog", "chien"],
  CAT: ["cat", "chat"],
  HORSE: ["horse", "cheval"],
};

export function resolveAnatomicalAnimalType(
  animal?: AnimalSpecies | null,
): AnatomicalAnimalType | null {
  const explicitValues = [animal?.code, animal?.name]
    .map((value) => value?.trim().toLowerCase())
    .filter((value): value is string => Boolean(value));

  for (const [type, aliases] of Object.entries(supportedSpecies) as Array<
    [AnatomicalAnimalType, readonly string[]]
  >) {
    if (explicitValues.some((value) => aliases.includes(value))) return type;
  }

  return null;
}

type ReportEntryTab = "clinical" | "anatomical" | "recommendations" | "notes";

export function canOpenAnatomicalEntryShortcut(
  activeTab: ReportEntryTab,
  animal?: AnimalSpecies | null,
): boolean {
  return (
    (activeTab === "clinical" || activeTab === "anatomical") &&
    resolveAnatomicalAnimalType(animal) !== null
  );
}
