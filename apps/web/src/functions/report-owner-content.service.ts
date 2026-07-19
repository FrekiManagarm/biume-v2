import type { OwnerSourceKind } from "@biume/contracts/report";
import type { ReportOwnerContent } from "@biume/db/schema/index";

type OwnerContentValues = {
  sourceKind: OwnerSourceKind;
  sourceId: string;
  ownerText: string;
  sourceFingerprint: string;
  updatedAt: Date;
};

type OwnerContentRevisionOperations = {
  organizationId: string;
  reportId: string;
  ownerContent: {
    operation: "upsert";
    values: OwnerContentValues;
  };
  reportRevision: {
    operation: "increment";
    by: 1;
    updatedAt: Date;
  };
};

export type OwnerContentRevisionPort = {
  persist: (
    operations: OwnerContentRevisionOperations,
  ) => Promise<ReportOwnerContent | undefined>;
};

export type OwnerContentRevisionInput = {
  organizationId: string;
  reportId: string;
  ownerContent: OwnerContentValues;
};

export async function saveOwnerContentWithRevision(
  input: OwnerContentRevisionInput,
  port: OwnerContentRevisionPort,
) {
  const saved = await port.persist({
    organizationId: input.organizationId,
    reportId: input.reportId,
    ownerContent: {
      operation: "upsert",
      values: {
        sourceKind: input.ownerContent.sourceKind,
        sourceId: input.ownerContent.sourceId,
        ownerText: input.ownerContent.ownerText,
        sourceFingerprint: input.ownerContent.sourceFingerprint,
        updatedAt: input.ownerContent.updatedAt,
      },
    },
    reportRevision: {
      operation: "increment",
      by: 1,
      updatedAt: input.ownerContent.updatedAt,
    },
  });

  if (!saved)
    throw new Error("Impossible d’enregistrer la version propriétaire");
  return saved;
}
