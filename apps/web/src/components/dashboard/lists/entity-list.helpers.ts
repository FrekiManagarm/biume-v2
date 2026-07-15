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

export type PatientFormDefaults = {
  ownerId: string;
  type: string;
};

export type PatientMutationFormValues = {
  name: string;
  ownerId: string;
  type: string;
  breed: string;
  gender: "Male" | "Female";
  birthDate: string;
  weight: number;
  height: number;
  description?: string;
};

type PatientMutationValues = Omit<PatientMutationFormValues, "birthDate"> & {
  birthDate: Date;
  description: string | undefined;
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
    return "Cette action est irréversible. La fiche client et ses données enregistrées dans Biume seront supprimées définitivement. 0 patient : aucune fiche patient ne sera supprimée. Les éventuelles références à des documents seront supprimées définitivement. Les fichiers hébergés par le service de stockage ne seront pas supprimés.";
  }

  if (patientCount === 1) {
    return "Cette action est irréversible. La fiche client, la fiche de son unique patient (1 patient), leurs données enregistrées dans Biume et les références à leurs documents seront supprimées définitivement. Les fichiers hébergés par le service de stockage ne seront pas supprimés.";
  }

  return `Cette action est irréversible. La fiche client, les fiches de ses ${patientCount} patients, leurs données enregistrées dans Biume et les références à leurs documents seront supprimées définitivement. Les fichiers hébergés par le service de stockage ne seront pas supprimés.`;
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

export function getPatientFormValues(
  patient?: PatientFormSource | null,
  defaults: PatientFormDefaults = { ownerId: "", type: "" },
) {
  if (!patient) {
    return {
      name: "",
      ownerId: defaults.ownerId,
      type: defaults.type,
      breed: "",
      gender: "Male" as const,
      birthDate: "",
      weight: 0,
      height: 0,
      description: "",
    };
  }

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

export function getPatientDeletionDescription() {
  return "Cette action est irréversible. La fiche patient, ses données enregistrées dans Biume et les références à ses documents seront supprimées définitivement. Les fichiers hébergés par le service de stockage ne seront pas supprimés.";
}

export function getPatientDisplayName(name?: string | null) {
  return name?.trim() || "Patient sans nom";
}

export function getPatientMutationValues(
  values: PatientMutationFormValues,
): PatientMutationValues;
export function getPatientMutationValues(
  values: PatientMutationFormValues,
  patientId: string,
): PatientMutationValues & { id: string };
export function getPatientMutationValues(
  values: PatientMutationFormValues,
  patientId?: string,
) {
  const [year, month, day] = values.birthDate.split("-").map(Number);

  return {
    ...values,
    ...(patientId ? { id: patientId } : {}),
    birthDate: new Date(year, month - 1, day, 12),
    description: values.description?.trim() || undefined,
  };
}

export function getPageAfterDeletion(
  currentPage: number,
  itemCountOnPage: number,
) {
  return itemCountOnPage === 1 ? Math.max(1, currentPage - 1) : currentPage;
}

export function getPageAfterEntityRemoval(
  currentPage: number,
  visibleIds: readonly string[],
  removedId: string,
) {
  const remainingVisibleIds = visibleIds.filter((id) => id !== removedId);

  return currentPage > 1 && remainingVisibleIds.length === 0
    ? currentPage - 1
    : currentPage;
}

type ClientListRefreshOptions = {
  currentPage: number;
  visibleIds: readonly string[];
  removedId: string;
  invalidateQuery: (queryKey: readonly string[]) => Promise<unknown>;
  navigateToPage: (page: number) => Promise<unknown>;
};

type ClientDeletionOptions = ClientListRefreshOptions & {
  close: () => void;
};

type EntityListRefreshOptions = ClientListRefreshOptions;

type EntityDeletionOptions = EntityListRefreshOptions & {
  close: (entityId: string) => void;
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

export const canChangeEntityFormOpenState = canChangeClientFormOpenState;

export function reconcileEditedClient<T extends { id: string }>(
  currentClient: T | null,
  editedClientId: string,
) {
  return currentClient?.id === editedClientId ? null : currentClient;
}

export const reconcileEditedEntity = reconcileEditedClient;

export async function invalidateEntityLists(
  invalidateQuery: (queryKey: readonly string[]) => Promise<unknown>,
) {
  await Promise.all([
    invalidateQuery(["patients"]),
    invalidateQuery(["clients"]),
  ]);
}

export async function refreshEntityListsAfterRemoval({
  currentPage,
  invalidateQuery,
  navigateToPage,
  removedId,
  visibleIds,
}: EntityListRefreshOptions) {
  const nextPage = getPageAfterEntityRemoval(
    currentPage,
    visibleIds,
    removedId,
  );

  await invalidateEntityLists(invalidateQuery);
  if (nextPage !== currentPage) {
    await navigateToPage(nextPage);
  }

  return nextPage;
}

export async function completeEntityDeletion({
  close,
  removedId,
  ...refreshOptions
}: EntityDeletionOptions) {
  close(removedId);
  return refreshEntityListsAfterRemoval({ removedId, ...refreshOptions });
}

export async function handleEntityDeletionError({
  error,
  isStaleError = isStaleEntityError,
  ...deletionOptions
}: EntityDeletionOptions & {
  error: unknown;
  isStaleError?: (error: unknown) => boolean;
}) {
  if (!isStaleError(error)) {
    return false;
  }

  await completeEntityDeletion(deletionOptions);
  return true;
}

export async function handleEntityEditError({
  entityId,
  error,
  isStaleError = isStaleEntityError,
  onStale,
}: {
  entityId: string;
  error: unknown;
  isStaleError?: (error: unknown) => boolean;
  onStale: (entityId: string) => Promise<void>;
}) {
  if (!isStaleError(error)) {
    return false;
  }

  await onStale(entityId);
  return true;
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
  invalidateQuery,
  navigateToPage,
  removedId,
  visibleIds,
}: ClientListRefreshOptions) {
  const nextPage = getPageAfterEntityRemoval(
    currentPage,
    visibleIds,
    removedId,
  );

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
  if (!isStaleClientError(error)) {
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
  if (!isStaleClientError(error)) {
    return false;
  }

  await onStale(clientId);
  return true;
}

export function isStaleEntityError(error: unknown) {
  return isStalePatientError(error) || isStaleClientError(error);
}

export function isStalePatientError(error: unknown) {
  return matchesStaleEntityError(error, "patient");
}

export function isStaleClientError(error: unknown) {
  return matchesStaleEntityError(error, "client");
}

function matchesStaleEntityError(error: unknown, entityName: string) {
  if (!(error instanceof Error)) return false;

  const escapedName = entityName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(
    `\\b${escapedName}(?: est)? introuvable ou inaccessible\\b`,
    "i",
  ).test(error.message);
}
