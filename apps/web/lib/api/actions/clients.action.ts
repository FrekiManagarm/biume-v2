import { internalGet } from "#/lib/http/internal-fetch";
import type { GetAllClientsParams } from "#/functions/clients.function";

export type {
  CreateClientInput,
  DeleteClientInput,
  GetAllClientsParams,
  UpdateClientInput,
} from "#/functions/clients.function";

// Les mutations sont des Server Actions ; les réexporter d'ici garde le
// contrat que les composants consomment déjà.
export { createClient, updateClient, deleteClient } from "./clients.mutations";

type ClientWithRelations = Awaited<
  ReturnType<typeof import("#/functions/clients.function").getAllClients>
>[number];

export function getAllClients(params: GetAllClientsParams = {}) {
  return internalGet<ClientWithRelations[]>("/api/internal/clients", params);
}
