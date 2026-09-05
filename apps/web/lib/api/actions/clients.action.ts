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

// Règle à respecter dans ce fichier : tout import venant de `*.function.ts`
// y reste en position de type (`import type`, ou `typeof import(...)`
// ci-dessous). C'est ce qui garde `db`, `next/headers` et le reste des
// dépendances serveur de la fonction pure hors du bundle client — un import
// de valeur (`import { getAllClients } from "#/functions/clients.function"`)
// romprait cette propriété sans qu'aucun test ne le signale.
type ClientWithRelations = Awaited<
  ReturnType<typeof import("#/functions/clients.function").getAllClients>
>[number];

export function getAllClients(params: GetAllClientsParams = {}) {
  return internalGet<ClientWithRelations[]>("/api/internal/clients", params);
}
