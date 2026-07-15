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

export function getClientDeletionDescription(patientCount: number) {
  if (patientCount === 0) {
    return "Cette action est irréversible. Ce client n’a aucun patient rattaché ; aucune fiche patient ne sera supprimée.";
  }

  if (patientCount === 1) {
    return "Cette action est irréversible. La suppression entraînera également celle de 1 patient, de son dossier et de ses données associées.";
  }

  return `Cette action est irréversible. La suppression entraînera également celle de ${patientCount} patients, de leurs dossiers et de leurs données associées.`;
}

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

type ClientListRefreshOptions = {
  currentPage: number;
  itemCountOnPage: number;
  invalidateQuery: (queryKey: readonly string[]) => Promise<unknown>;
  navigateToPage: (page: number) => Promise<unknown>;
};

type ClientDeletionOptions = ClientListRefreshOptions & {
  close: () => void;
};

export function getClientDisplayName(name?: string | null) {
  return name?.trim() || "Client sans nom";
}

export function canChangeClientFormOpenState(
  nextOpen: boolean,
  isSubmitting: boolean,
) {
  return nextOpen || !isSubmitting;
}

export function reconcileEditedClient<T extends { id: string }>(
  currentClient: T | null,
  editedClientId: string,
) {
  return currentClient?.id === editedClientId ? null : currentClient;
}

export async function invalidateClientLists(
  invalidateQuery: (queryKey: readonly string[]) => Promise<unknown>,
) {
  await Promise.all([
    invalidateQuery(["clients"]),
    invalidateQuery(["patients"]),
  ]);
}

export async function refreshClientListsAfterRemoval({
  currentPage,
  itemCountOnPage,
  invalidateQuery,
  navigateToPage,
}: ClientListRefreshOptions) {
  const nextPage = getPageAfterDeletion(currentPage, itemCountOnPage);

  await invalidateClientLists(invalidateQuery);
  if (nextPage !== currentPage) {
    await navigateToPage(nextPage);
  }

  return nextPage;
}

export async function completeClientDeletion({
  close,
  ...refreshOptions
}: ClientDeletionOptions) {
  close();
  return refreshClientListsAfterRemoval(refreshOptions);
}

export async function handleClientDeletionError({
  error,
  ...deletionOptions
}: ClientDeletionOptions & { error: unknown }) {
  if (!isStaleEntityError(error)) {
    return false;
  }

  await completeClientDeletion(deletionOptions);
  return true;
}

export async function handleClientEditError({
  clientId,
  error,
  onStale,
}: {
  clientId: string;
  error: unknown;
  onStale: (clientId: string) => Promise<void>;
}) {
  if (!isStaleEntityError(error)) {
    return false;
  }

  await onStale(clientId);
  return true;
}

export function isStaleEntityError(error: unknown) {
  return (
    error instanceof Error &&
    error.message.includes("introuvable ou inaccessible")
  );
}
