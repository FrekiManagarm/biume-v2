export type {
  AnimalOption,
  CreatePatientInput,
  GetAllPatientsParams,
} from "#/functions/patients.function";
import {
  createPatient as createPatientFn,
  getAllAnimals as getAllAnimalsFn,
  getAllPatients as getAllPatientsFn,
  getPatientById as getPatientByIdFn,
  type CreatePatientInput,
  type GetAllPatientsParams,
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
