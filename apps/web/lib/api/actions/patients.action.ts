import { internalGet } from "#/lib/http/internal-fetch";
import type {
  AnimalOption,
  GetAllPatientsParams,
} from "#/functions/patients.function";

export type {
  AnimalOption,
  CreatePatientInput,
  DeletePatientInput,
  GetAllPatientsParams,
  UpdatePatientInput,
} from "#/functions/patients.function";

// Les mutations sont des Server Actions ; les réexporter d'ici garde le
// contrat que les composants consomment déjà.
export { createPatient, updatePatient, deletePatient } from "./patients.mutations";

// Règle à respecter dans ce fichier : tout import venant de `*.function.ts`
// y reste en position de type (`import type`, ou `typeof import(...)`
// ci-dessous). C'est ce qui garde `db`, `next/headers` et le reste des
// dépendances serveur de la fonction pure hors du bundle client — un import
// de valeur romprait cette propriété sans qu'aucun test ne le signale.
type PatientDetail = Awaited<
  ReturnType<typeof import("#/functions/patients.function").getPatientById>
>;

export function getAllPatients(params: GetAllPatientsParams = {}) {
  return internalGet<
    Awaited<
      ReturnType<typeof import("#/functions/patients.function").getAllPatients>
    >
  >("/api/internal/patients", params);
}

export function getAllAnimals() {
  return internalGet<AnimalOption[]>("/api/internal/animals");
}

export function getPatientById(id: string) {
  return internalGet<PatientDetail>(`/api/internal/patients/${encodeURIComponent(id)}`);
}
