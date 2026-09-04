import type { ReportStatus } from "@biume/contracts/report";

import { MobileRequestError } from "./mobile-api.errors";

/**
 * La lecture des propositions accepte un rapport finalisé et le renvoie tel
 * quel : la fiche animal ouvre les comptes rendus passés en lecture seule
 * (spécification 5.10). Les endpoints de décision, eux, le refusent.
 *
 * Un compte rendu finalisé a été figé, lié à une version partagée et envoyé au
 * propriétaire. Le laisser bouger ferait diverger ce que le praticien voit de
 * ce que le propriétaire a reçu — et cette divergence ne se rattrape pas.
 */
export function assertReportDecidable(status: ReportStatus): void {
  if (status !== "draft") throw new MobileRequestError("conflict");
}
