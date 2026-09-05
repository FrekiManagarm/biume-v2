"use server";

import {
  createMedicalDocument as createMedicalDocumentFn,
  deleteMedicalDocument as deleteMedicalDocumentFn,
  updateMedicalDocument as updateMedicalDocumentFn,
  type CreateMedicalDocumentInput,
  type DocumentIdInput,
  type UpdateMedicalDocumentInput,
} from "#/functions/medical-documents.function";

export async function createMedicalDocument(input: CreateMedicalDocumentInput) {
  return createMedicalDocumentFn(input);
}

export async function deleteMedicalDocument(input: DocumentIdInput) {
  return deleteMedicalDocumentFn(input);
}

export async function updateMedicalDocument(input: UpdateMedicalDocumentInput) {
  return updateMedicalDocumentFn(input);
}
