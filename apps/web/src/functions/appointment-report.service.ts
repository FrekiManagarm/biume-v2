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
