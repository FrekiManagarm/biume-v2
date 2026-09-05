type ReportPatientIdentityPatient = {
  name?: string | null;
  type?: string | null;
  animal?: { name?: string | null } | null;
  owner?: { name?: string | null } | null;
};

export function ReportPatientIdentity({
  patient,
}: {
  patient?: ReportPatientIdentityPatient | null;
}) {
  const animalName = patient?.name?.trim() || "Animal non renseigné";
  const species =
    patient?.animal?.name?.trim() ||
    patient?.type?.trim() ||
    "Espèce non renseignée";
  const ownerName =
    patient?.owner?.name?.trim() || "Propriétaire non renseigné";

  return (
    <span className="flex flex-wrap items-center gap-1.5">
      <span>{animalName}</span>
      <span aria-hidden="true">·</span>
      <span>{species}</span>
      <span aria-hidden="true">·</span>
      <span>{ownerName}</span>
    </span>
  );
}
