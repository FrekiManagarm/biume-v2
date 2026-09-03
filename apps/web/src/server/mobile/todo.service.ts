import type { ServerCaptureStatus } from "@biume/contracts/capture";
import { canFinalizeReport, type ReportSectionStates, type ReportStatus } from "@biume/contracts/report";
import type { TodoItemKind } from "@biume/contracts/mobile-todo";
import type { TranscriptStatus } from "@biume/contracts/transcript";

/**
 * Les captures que « À traiter » retient.
 *
 * `expired` en fait partie : la purge d'audio ne retire son travail à
 * personne. L'audio n'est qu'un intermédiaire, c'est la transcription qui
 * porte la valeur, et elle survit à la purge — comme le rapport qu'elle a
 * nourri. Sans `expired` ici, toute dictée non terminée le jour même
 * disparaissait de la seule route de l'application vers sa transcription et
 * son compte rendu.
 */
export const todoCaptureStatuses = [
  "uploaded",
  "expired",
] as const satisfies readonly ServerCaptureStatus[];

export type TodoSource = {
  reportId: string | null;
  reportStatus: ReportStatus | null;
  transcriptStatus: TranscriptStatus | null;
  proposalCount: number;
  sectionStates: ReportSectionStates | null;
  /** L'audio a été purgé. La transcription et le rapport, eux, sont intacts. */
  audioExpired: boolean;
};

/**
 * L'ordre des tests est l'ordre des priorités du praticien : une dictée
 * inaudible se réenregistre avant toute autre considération, un rattachement
 * peut se faire pendant que le serveur transcrit.
 */
export function classifyTodo(source: TodoSource): TodoItemKind | null {
  if (source.reportStatus === "finalized" || source.reportStatus === "sent") return null;
  // Une capture dont l'audio est parti sans qu'aucune transcription n'ait
  // jamais été ouverte n'a plus rien à offrir : l'annoncer « en cours »
  // indéfiniment serait un mensonge, et il n'y a aucun geste à proposer.
  if (source.audioExpired && source.transcriptStatus === null) return null;
  if (source.transcriptStatus === "inaudible") return "inaudible";
  if (source.transcriptStatus === "failed") return "transcription_failed";
  if (!source.reportId) return "to_attach";
  if (
    source.transcriptStatus === null ||
    source.transcriptStatus === "pending" ||
    source.transcriptStatus === "running"
  ) {
    return "transcribing";
  }
  if (source.proposalCount === 0) return "transcript_to_review";
  if (source.sectionStates && canFinalizeReport(source.sectionStates)) return "ready_to_send";
  return "report_to_validate";
}
