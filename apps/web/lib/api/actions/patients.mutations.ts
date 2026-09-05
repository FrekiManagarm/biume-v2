"use server";

import {
  createPatient as createPatientFn,
  deletePatient as deletePatientFn,
  updatePatient as updatePatientFn,
  type CreatePatientInput,
  type DeletePatientInput,
  type UpdatePatientInput,
} from "#/functions/patients.function";

export async function createPatient(input: CreatePatientInput) {
  return createPatientFn(input);
}

export async function updatePatient(input: UpdatePatientInput) {
  return updatePatientFn(input);
}

export async function deletePatient(input: DeletePatientInput) {
  return deletePatientFn(input);
}
