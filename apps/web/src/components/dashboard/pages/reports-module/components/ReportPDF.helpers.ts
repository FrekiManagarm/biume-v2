export type ReportPdfIssue = {
  id?: string | null;
  type?: string | null;
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
  paper: "#F6F8F7",
  surface: "#FFFFFF",
  ink: "#202522",
  muted: "#65736C",
  faint: "#E8EEEA",
  line: "#CBD7D0",
  accent: "#2F6B5D",
  accentSoft: "#DDEBE6",
  forest: "#315C48",
  forestSoft: "#E2ECE6",
  sand: "#637047",
  sandSoft: "#E8EEDF",
  slate: "#45514C",
} as const;

const severityTones: Record<number, SeverityTone> = {
  1: {
    fill: "#315C48",
    stroke: "#254637",
    soft: "#E2ECE6",
    label: "Priorite 1",
  },
  2: {
    fill: "#637047",
    stroke: "#4D5935",
    soft: "#E8EEDF",
    label: "Priorite 2",
  },
  3: {
    fill: "#52766E",
    stroke: "#3B5A53",
    soft: "#E0ECE9",
    label: "Priorite 3",
  },
  4: {
    fill: "#2F6B5D",
    stroke: "#245146",
    soft: "#DDEBE6",
    label: "Priorite 4",
  },
  5: {
    fill: "#234E45",
    stroke: "#173A32",
    soft: "#D5E5E0",
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
      report.consultationReason?.trim() || "Motif de consultation non renseigne",
    practitionerNotes: report.notes?.trim() || "",
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
