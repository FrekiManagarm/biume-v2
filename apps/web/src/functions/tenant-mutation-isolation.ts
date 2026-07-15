type EntityReference = { id: string };

export async function createPatientWithOwnerIsolation<T>({
  findOwner,
  insertPatient,
}: {
  findOwner: () => Promise<EntityReference | null | undefined>;
  insertPatient: () => Promise<T>;
}) {
  const owner = await findOwner();
  if (!owner) {
    throw new Error("Propriétaire introuvable ou inaccessible.");
  }

  return insertPatient();
}

export async function deleteClientWithPatientIsolation<T>({
  deleteClient,
  findClient,
  findForeignPatient,
}: {
  deleteClient: () => Promise<T>;
  findClient: () => Promise<EntityReference | null | undefined>;
  findForeignPatient: () => Promise<EntityReference | null | undefined>;
}) {
  const client = await findClient();
  if (!client) {
    throw new Error("Client introuvable ou inaccessible.");
  }

  const foreignPatient = await findForeignPatient();
  if (foreignPatient) {
    throw new Error(
      "Suppression impossible : l’intégrité des données liées à ce client ne peut pas être garantie.",
    );
  }

  return deleteClient();
}
