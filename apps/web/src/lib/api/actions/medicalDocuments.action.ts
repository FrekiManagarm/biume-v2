import {
  createMedicalDocument as createMedicalDocumentFn,
  deleteMedicalDocument as deleteMedicalDocumentFn,
  getMedicalDocumentsByPetId as getMedicalDocumentsByPetIdFn,
  updateMedicalDocument as updateMedicalDocumentFn,
} from "#/functions/medical-documents.function";
import type {
  CreateMedicalDocument,
  MedicalDocument,
} from "@biume/db/schema/index";

export function getMedicalDocumentsByPetId(petId: string) {
  return getMedicalDocumentsByPetIdFn({ data: { petId } });
}

export function createMedicalDocument(
  data: Omit<CreateMedicalDocument, "uploadedBy">,
) {
  return createMedicalDocumentFn({ data });
}

export function deleteMedicalDocument(documentId: string) {
  return deleteMedicalDocumentFn({ data: { documentId } });
}

export function updateMedicalDocument(
  documentId: string,
  data: Partial<Pick<MedicalDocument, "title" | "description" | "fileType">>,
) {
  return updateMedicalDocumentFn({ data: { documentId, data } });
}
