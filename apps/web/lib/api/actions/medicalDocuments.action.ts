import { internalGet } from "#/lib/http/internal-fetch";
import type { MedicalDocument } from "@biume/db/schema/index";

import {
  deleteMedicalDocument as deleteMedicalDocumentFn,
  updateMedicalDocument as updateMedicalDocumentFn,
} from "./medicalDocuments.mutations";

// Les mutations sont des Server Actions ; les réexporter d'ici garde le
// contrat que les composants consomment déjà. `createMedicalDocument` a la
// même forme d'entrée côté fonction que côté composant : réexport direct.
export { createMedicalDocument } from "./medicalDocuments.mutations";

// Règle à respecter dans ce fichier : tout import venant de `*.function.ts`
// y reste en position de type (`import type`, ou `typeof import(...)`
// ci-dessous). C'est ce qui garde `db`, `next/headers` et le reste des
// dépendances serveur de la fonction pure hors du bundle client — un import
// de valeur romprait cette propriété sans qu'aucun test ne le signale.
type MedicalDocumentWithUploader = Awaited<
  ReturnType<
    typeof import("#/functions/medical-documents.function").getMedicalDocumentsByPetId
  >
>;

export function getMedicalDocumentsByPetId(petId: string) {
  return internalGet<MedicalDocumentWithUploader>(
    `/api/internal/patients/${encodeURIComponent(petId)}/medical-documents`,
  );
}

export function deleteMedicalDocument(documentId: string) {
  return deleteMedicalDocumentFn({ documentId });
}

export function updateMedicalDocument(
  documentId: string,
  data: Partial<Pick<MedicalDocument, "title" | "description" | "fileType">>,
) {
  return updateMedicalDocumentFn({ documentId, data });
}
