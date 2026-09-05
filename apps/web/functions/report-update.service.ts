export const REPORT_REVISION_CONFLICT_MESSAGE =
  "Ce rapport a été modifié ailleurs. Rechargez-le avant de réessayer.";

export class ReportRevisionConflictError extends Error {
  override readonly name = "ReportRevisionConflictError";

  constructor() {
    super(REPORT_REVISION_CONFLICT_MESSAGE);
  }
}

export type AtomicReportUpdatePort<Replacement> = {
  persistAtomic: (input: {
    expectedRevision: number;
    replacement: Replacement;
  }) => Promise<{ revision: number } | undefined>;
};

export async function updateReportWithExpectedRevision<Replacement>(
  input: { expectedRevision: number; replacement: Replacement },
  port: AtomicReportUpdatePort<Replacement>,
) {
  const persisted = await port.persistAtomic(input);
  if (!persisted) throw new ReportRevisionConflictError();
  return persisted;
}
