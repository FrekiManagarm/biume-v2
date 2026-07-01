import {
  getAllPatients as getAllPatientsFn,
  getPatientById as getPatientByIdFn,
  type GetAllPatientsParams,
} from "#/functions/patients.function";

export function getAllPatients(params: GetAllPatientsParams = {}) {
  return getAllPatientsFn({ data: params });
}

export function getPatientById(id: string) {
  return getPatientByIdFn({ data: { id } });
}
