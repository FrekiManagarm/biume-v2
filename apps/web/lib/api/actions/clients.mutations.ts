"use server";

import {
  createClient as createClientFn,
  deleteClient as deleteClientFn,
  updateClient as updateClientFn,
  type CreateClientInput,
  type DeleteClientInput,
  type UpdateClientInput,
} from "#/functions/clients.function";

export async function createClient(input: CreateClientInput) {
  return createClientFn(input);
}

export async function updateClient(input: UpdateClientInput) {
  return updateClientFn(input);
}

export async function deleteClient(input: DeleteClientInput) {
  return deleteClientFn(input);
}
