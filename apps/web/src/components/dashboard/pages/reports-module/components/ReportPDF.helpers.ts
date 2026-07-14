import {
  buildOwnerSourceItems,
  type OwnerContentRecord,
} from "../owner-content";
import { buildOwnerReportViewModel } from "../owner-report-view-model";

export type ReportPdfIssue = {
  id?: string | null;
  type?: string | null;
  observationType?: string | null;
  notes?: string | null;
  laterality?: string | null;
  severity?: number | null;
  anatomicalPartId?: string | null;
  anatomicalPart?: {
    name?: string | null;
    pathLeft?: string | null;
    pathRight?: string | null;
    transformLeft?: string | null;
    transformRight?: string | null;
  } | null;
};

export type ReportPdfRecommendation = {
  id?: string | null;
  recommendation?: string | null;
  description?: string | null;
};

export type ReportPdfReport = {
  id: string;
  title: string;
  createdAt: Date | string | null;
  consultationReason?: string | null;
  notes?: string | null;
  patient?: {
    id?: string | null;
    name?: string | null;
    type?: string | null;
    breed?: string | null;
    weight?: number | null;
    height?: number | null;
    gender?: string | null;
    birthDate?: Date | string | null;
    nacType?: string | null;
    owner?: {
      id?: string | null;
      name?: string | null;
      email?: string | null;
      phone?: string | null;
    } | null;
    animal?: {
      id?: string | null;
      code?: string | null;
      name?: string | null;
    } | null;
  } | null;
  organization?: {
    id?: string | null;
    name?: string | null;
    logo?: string | null;
    email?: string | null;
  } | null;
  anatomicalIssues?: ReportPdfIssue[] | null;
  recommendations?: ReportPdfRecommendation[] | null;
  ownerContents?: OwnerContentRecord[] | null;
};

export type ReportMetricTone = "accent" | "forest" | "ink" | "sand";

export type ReportMetric = {
  label: string;
  value: string;
  tone: ReportMetricTone;
};

export type SeverityTone = {
  fill: string;
  stroke: string;
  soft: string;
  label: string;
};

export const reportPalette = {
  paper: "#FFFFFF",
  surface: "#FFFFFF",
  ink: "#0F172A",
  muted: "#64748B",
  faint: "#F1F5F9",
  line: "#E2E8F0",
  accent: "#A78BFA",
  accentSoft: "#EDE9FE",
  forest: "#10B981",
  forestSoft: "#ECFDF5",
  sand: "#F59E0B",
  sandSoft: "#FFFBEB",
  slate: "#334155",
} as const;

const severityTones: Record<number, SeverityTone> = {
  1: {
    fill: "#10B981",
    stroke: "#059669",
    soft: "#ECFDF5",
    label: "Priorite 1",
  },
  2: {
    fill: "#84CC16",
    stroke: "#65A30D",
    soft: "#F7FEE7",
    label: "Priorite 2",
  },
  3: {
    fill: "#F59E0B",
    stroke: "#D97706",
    soft: "#FFFBEB",
    label: "Priorite 3",
  },
  4: {
    fill: "#F43F5E",
    stroke: "#E11D48",
    soft: "#FFF1F2",
    label: "Priorite 4",
  },
  5: {
    fill: "#B91C1C",
    stroke: "#991B1B",
    soft: "#FEF2F2",
    label: "Priorite 5",
  },
};

export function getSeverityTone(severity?: number | null): SeverityTone {
  return severityTones[severity ?? 2] ?? severityTones[2];
}

export function getIssueTypeLabel(type?: string | null): string {
  if (type === "dysfunction") return "Dysfonction";
  if (type === "anatomicalSuspicion") return "Suspicion";
  if (type === "observation") return "Observation";
  return "Point clinique";
}

export function getLateralityLabel(laterality?: string | null): string {
  if (laterality === "left") return "Gauche";
  if (laterality === "right") return "Droite";
  if (laterality === "bilateral") return "Bilateral";
  return "Non precisee";
}

export function getAnimalKind(report: ReportPdfReport): "cat" | "dog" | "horse" {
  const animalCode =
    report.patient?.animal?.code?.toLowerCase() ||
    report.patient?.type?.toLowerCase() ||
    "";

  if (animalCode.includes("cat") || animalCode.includes("chat")) return "cat";
  if (animalCode.includes("horse") || animalCode.includes("cheval")) {
    return "horse";
  }
  return "dog";
}

export function buildReportPdfViewModel(report: ReportPdfReport) {
  const issues = report.anatomicalIssues ?? [];
  const recommendations = report.recommendations ?? [];
  const observations = issues.filter((issue) => issue.type === "observation");
  const dysfunctions = issues.filter((issue) => issue.type === "dysfunction");
  const suspicions = issues.filter(
    (issue) => issue.type === "anatomicalSuspicion",
  );
  const patient = report.patient;
  const animalLabel = patient?.animal?.name || patient?.type || "Animal";
  const breed = patient?.breed || patient?.nacType;
  const owner = patient?.owner;
  const ownerContact = owner?.phone || owner?.email;
  const ownerSources = buildOwnerSourceItems({
    reportId: report.id,
    consultationReason: report.consultationReason ?? "",
    observations: observations.map((item) => ({
      id: item.id ?? "",
      region: item.anatomicalPart?.name ?? "Zone non précisée",
      severity: item.severity ?? 2,
      notes: item.notes ?? "",
      type:
        item.observationType === "static" ||
        item.observationType === "dynamic" ||
        item.observationType === "diagnosticExclusion"
          ? item.observationType
          : "none",
      laterality:
        item.laterality === "left" ||
        item.laterality === "right" ||
        item.laterality === "bilateral"
          ? item.laterality
          : "bilateral",
    })),
    anatomicalIssues: [...dysfunctions, ...suspicions].map((item) => ({
      id: item.id ?? "",
      type:
        item.type === "anatomicalSuspicion"
          ? "anatomicalSuspicion"
          : "dysfunction",
      region: item.anatomicalPart?.name ?? "Zone non précisée",
      severity: item.severity ?? 2,
      notes: item.notes ?? "",
      laterality:
        item.laterality === "left" ||
        item.laterality === "right" ||
        item.laterality === "bilateral"
          ? item.laterality
          : "bilateral",
    })),
    recommendations: recommendations.map((item) => ({
      id: item.id ?? "",
      content: item.recommendation ?? item.description ?? "",
    })),
    notes: report.notes ?? "",
  });
  const ownerView = buildOwnerReportViewModel(
    ownerSources,
    report.ownerContents ?? [],
  );
  const ownerText = (key: string, professionalText: string) =>
    ownerView.byKey[key]?.text ?? professionalText;
  const resolvedIssues = issues.map((issue) => ({
    ...issue,
    notes: ownerText(
      `${issue.type === "observation" ? "observation" : "anatomicalIssue"}:${issue.id ?? ""}`,
      issue.notes?.trim() ||
        issue.anatomicalPart?.name ||
        "Aucune note clinique precisee pour ce point.",
    ),
  }));
  const resolvedRecommendations = recommendations.map((recommendation) => ({
    ...recommendation,
    recommendation: ownerText(
      `recommendation:${recommendation.id ?? ""}`,
      recommendation.recommendation?.trim() ||
        recommendation.description?.trim() ||
        "Recommandation a completer.",
    ),
  }));

  const patientFacts = [
    patient?.gender,
    typeof patient?.weight === "number" ? `${patient.weight} kg` : null,
    typeof patient?.height === "number" ? `${patient.height} cm` : null,
  ].filter(Boolean);

  return {
    reportTitle: report.title || "Compte rendu de seance",
    patientName: patient?.name || "Animal non renseigne",
    patientDescriptor: [animalLabel, breed].filter(Boolean).join(" - "),
    patientFacts: patientFacts.join(" - ") || "Informations a completer",
    ownerLine: [owner?.name || "Proprietaire non renseigne", ownerContact]
      .filter(Boolean)
      .join(" - "),
    organizationName: report.organization?.name || "Biume",
    consultationReason:
      ownerText(
        "consultationReason:consultationReason",
        report.consultationReason?.trim() || "",
      ) || "Motif de consultation non renseigne",
    practitionerNotes: ownerText("notes:notes", report.notes?.trim() || ""),
    issues: resolvedIssues,
    recommendations: resolvedRecommendations,
    animalKind: getAnimalKind(report),
    hasClinicalContent: issues.length > 0 || recommendations.length > 0,
    metrics: [
      { label: "Observations", value: String(observations.length), tone: "ink" },
      {
        label: "Dysfonctions",
        value: String(dysfunctions.length),
        tone: "accent",
      },
      { label: "Suspicions", value: String(suspicions.length), tone: "sand" },
      {
        label: "Recommandations",
        value: String(recommendations.length),
        tone: "forest",
      },
    ] satisfies ReportMetric[],
  };
}
