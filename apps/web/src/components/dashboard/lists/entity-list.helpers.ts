export type ClientFormSource = {
  name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  zip: string | null;
  country: string | null;
};

export type PatientFormSource = {
  name: string;
  ownerId: string | null;
  type: string | null;
  breed: string;
  gender: "Male" | "Female";
  birthDate: Date;
  weight: number;
  height: number;
  description: string | null;
};

export const emptyClientFormValues = {
  name: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  zip: "",
  country: "France",
};

export function getClientFormValues(client?: ClientFormSource | null) {
  if (!client) return { ...emptyClientFormValues };

  return {
    name: client.name ?? "",
    email: client.email ?? "",
    phone: client.phone ?? "",
    address: client.address ?? "",
    city: client.city ?? "",
    zip: client.zip ?? "",
    country: client.country ?? "",
  };
}

export function getPatientFormValues(patient: PatientFormSource) {
  const year = patient.birthDate.getFullYear();
  const month = String(patient.birthDate.getMonth() + 1).padStart(2, "0");
  const day = String(patient.birthDate.getDate()).padStart(2, "0");

  return {
    name: patient.name,
    ownerId: patient.ownerId ?? "",
    type: patient.type ?? "",
    breed: patient.breed,
    gender: patient.gender,
    birthDate: `${year}-${month}-${day}`,
    weight: patient.weight,
    height: patient.height,
    description: patient.description ?? "",
  };
}

export function getPageAfterDeletion(
  currentPage: number,
  itemCountOnPage: number,
) {
  return itemCountOnPage === 1 ? Math.max(1, currentPage - 1) : currentPage;
}

export function isStaleEntityError(error: unknown) {
  return (
    error instanceof Error &&
    error.message.includes("introuvable ou inaccessible")
  );
}
