export type {
  CreateClientInput,
  DeleteClientInput,
  GetAllClientsParams,
  UpdateClientInput,
} from "#/functions/clients.function";
import {
  createClient as createClientFn,
  deleteClient as deleteClientFn,
  getAllClients as getAllClientsFn,
  updateClient as updateClientFn,
  type CreateClientInput,
  type DeleteClientInput,
  type GetAllClientsParams,
  type UpdateClientInput,
} from "#/functions/clients.function";

export function getAllClients(params: GetAllClientsParams = {}) {
  return getAllClientsFn({ data: params });
}

export function createClient(input: CreateClientInput) {
  return createClientFn({ data: input });
}

export function updateClient(input: UpdateClientInput) {
  return updateClientFn({ data: input });
}

export function deleteClient(input: DeleteClientInput) {
  return deleteClientFn({ data: input });
}
