export const QUICK_REPORT_IDEMPOTENCY_CONFLICT_MESSAGE =
  "Cette demande de création a déjà été utilisée avec des informations différentes.";

type QuickReportInput = {
  clientRequestId: string;
  ownerName: string;
  ownerEmail?: string;
  animalName: string;
  title: string;
  consultationReason: string;
};

type QuickReportKey = {
  organizationId: string;
  clientRequestId: string;
};

type ExistingQuickReport = {
  reportId: string;
  requestFingerprint: string;
};

type QuickReportCreateInput = QuickReportKey & {
  input: QuickReportInput;
  requestFingerprint: string;
};

export type QuickReportCreationPorts = {
  findByKey: (
    key: QuickReportKey,
  ) => Promise<ExistingQuickReport | null | undefined>;
  createAtomic: (
    input: QuickReportCreateInput,
  ) => Promise<{ reportId: string }>;
  findAfterConflict: (
    key: QuickReportKey,
  ) => Promise<ExistingQuickReport | null | undefined>;
};

function assertCompatibleRetry(
  existing: ExistingQuickReport,
  requestFingerprint: string,
) {
  if (existing.requestFingerprint !== requestFingerprint) {
    throw new Error(QUICK_REPORT_IDEMPOTENCY_CONFLICT_MESSAGE);
  }
  return { reportId: existing.reportId, status: "draft" as const };
}

export async function createQuickReportFingerprint(input: QuickReportInput) {
  const normalized = JSON.stringify({
    clientRequestId: input.clientRequestId,
    ownerName: input.ownerName.trim(),
    ownerEmail: input.ownerEmail?.trim() || null,
    animalName: input.animalName.trim(),
    title: input.title.trim(),
    consultationReason: input.consultationReason.trim(),
  });
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(normalized),
  );
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

export async function createIdempotentQuickReport(
  request: { organizationId: string; input: QuickReportInput },
  ports: QuickReportCreationPorts,
) {
  const key = {
    organizationId: request.organizationId,
    clientRequestId: request.input.clientRequestId,
  };
  const requestFingerprint = await createQuickReportFingerprint(request.input);
  const existing = await ports.findByKey(key);
  if (existing) return assertCompatibleRetry(existing, requestFingerprint);

  try {
    const created = await ports.createAtomic({
      ...key,
      input: request.input,
      requestFingerprint,
    });
    return { reportId: created.reportId, status: "draft" as const };
  } catch (error) {
    const winner = await ports.findAfterConflict(key);
    if (!winner) throw error;
    return assertCompatibleRetry(winner, requestFingerprint);
  }
}
