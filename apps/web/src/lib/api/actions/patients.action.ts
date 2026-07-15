export type {
  AnimalOption,
  CreatePatientInput,
  DeletePatientInput,
  GetAllPatientsParams,
  UpdatePatientInput,
} from "#/functions/patients.function";
import {
  createPatient as createPatientFn,
  deletePatient as deletePatientFn,
  getAllAnimals as getAllAnimalsFn,
  getAllPatients as getAllPatientsFn,
  getPatientById as getPatientByIdFn,
  updatePatient as updatePatientFn,
  type CreatePatientInput,
  type DeletePatientInput,
  type GetAllPatientsParams,
  type UpdatePatientInput,
} from "#/functions/patients.function";

export function getAllPatients(params: GetAllPatientsParams = {}) {
  return getAllPatientsFn({ data: params });
}

export function getPatientById(id: string) {
  return getPatientByIdFn({ data: { id } });
}

export function getAllAnimals() {
  return getAllAnimalsFn();
}

export function createPatient(input: CreatePatientInput) {
  return createPatientFn({ data: input });
}

export function updatePatient(input: UpdatePatientInput) {
  return updatePatientFn({ data: input });
}

export function deletePatient(input: DeletePatientInput) {
  return deletePatientFn({ data: input });
}
