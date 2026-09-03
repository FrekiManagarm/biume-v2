import { canFinalizeReport, type ReportSectionStates, type ReportStatus } from "@biume/contracts/report";
import type { TodoItemKind } from "@biume/contracts/mobile-todo";
import type { TranscriptStatus } from "@biume/contracts/transcript";

export type TodoSource = {
  reportId: string | null;
  reportStatus: ReportStatus | null;
  transcriptStatus: TranscriptStatus | null;
  proposalCount: number;
  sectionStates: ReportSectionStates | null;
};

/**
 * L'ordre des tests est l'ordre des priorités du praticien : une dictée
 * inaudible se réenregistre avant toute autre considération, un rattachement
 * peut se faire pendant que le serveur transcrit.
 */
export function classifyTodo(source: TodoSource): TodoItemKind | null {
  if (source.reportStatus === "finalized" || source.reportStatus === "sent") return null;
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
