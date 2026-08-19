import {
  isReportEmpty,
  type ReportContentSummary,
} from "@biume/contracts/report";

export type CreateSessionReportInput = {
  appointmentId: string;
  patientId: string;
  animalName: string | null;
  beginAt: Date;
  note: string | null;
  withReport: boolean;
};

export type CreateSessionReportPorts = {
  insertReport: (values: {
    appointmentId: string;
    patientId: string;
    title: string;
    consultationReason: string;
  }) => Promise<string>;
};

export function buildSessionReportTitle(
  animalName: string | null,
  beginAt: Date,
): string {
  const date = new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(beginAt);

  return animalName ? `Séance ${animalName} — ${date}` : `Séance — ${date}`;
}

/**
 * Crée le compte rendu en même temps que le rendez-vous.
 *
 * Le motif de consultation reste vide volontairement : la note d'un rendez-vous
 * est logistique, pas clinique. La recopier remplirait le compte rendu d'un
 * contenu que le praticien n'a pas dicté, et le ferait sortir de l'état « vide »
 * qui le garde hors de la liste des comptes rendus.
 */
export async function createSessionReport(
  ports: CreateSessionReportPorts,
  input: CreateSessionReportInput,
): Promise<{ reportId: string } | null> {
  if (!input.withReport) return null;

  const reportId = await ports.insertReport({
    appointmentId: input.appointmentId,
    patientId: input.patientId,
    title: buildSessionReportTitle(input.animalName, input.beginAt),
    consultationReason: "",
  });

  return { reportId };
}

/**
 * Supprimer un rendez-vous ne doit jamais détruire un compte rendu que le
 * praticien a commencé — il peut avoir été finalisé et envoyé au propriétaire.
 * Seule la coquille encore vide, créée automatiquement avec le rendez-vous,
 * part avec lui.
 */
export function resolveReportsOnAppointmentDeletion(
  reports: Array<ReportContentSummary & { id: string }>,
): { deleteIds: string[]; detachIds: string[] } {
  const deleteIds: string[] = [];
  const detachIds: string[] = [];

  for (const report of reports) {
    if (isReportEmpty(report)) {
      deleteIds.push(report.id);
    } else {
      detachIds.push(report.id);
    }
  }

  return { deleteIds, detachIds };
}
