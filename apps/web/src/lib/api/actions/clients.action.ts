export type {
  CreateClientInput,
  GetAllClientsParams,
} from "#/functions/clients.function";
import {
  createClient as createClientFn,
  getAllClients as getAllClientsFn,
  type CreateClientInput,
  type GetAllClientsParams,
} from "#/functions/clients.function";

export function getAllClients(params: GetAllClientsParams = {}) {
  return getAllClientsFn({ data: params });
}

export function createClient(input: CreateClientInput) {
  return createClientFn({ data: input });
}
