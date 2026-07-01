import type { AnatomicalPart } from "@/lib/schemas/anatomicalPart";

export interface ReportItem {
  id: string;
  type: "observation" | "intervention" | "recommendation";
  content: string;
}

export type NewReportItem = Omit<ReportItem, "id">;

export type ObservationType =
  | "static"
  | "dynamic"
  | "diagnosticExclusion"
  | "none";
export type DysfunctionType = "confirmed" | "suspected";
export type InterventionZone =
  | "articulations"
  | "fascias"
  | "organes"
  | "muscles";

interface Observation {
  id: string;
  region: string;
  severity: number;
  notes: string;
  type: ObservationType;
  dysfunctionType?: DysfunctionType;
  interventionZone?: InterventionZone;
  laterality: "left" | "right" | "bilateral";
  anatomicalPart?: AnatomicalPart; // Objet complet de la partie anatomique avec données SVG
}

type NewObservation = Omit<Observation, "id">;

interface AppointmentReference {
  appointmentId: string;
  petId: string;
}

interface AdvancedReportBuilderProps {
  orgId: string;
}

// Interface pour les problèmes anatomiques (dysfonctions et suspicions)
interface AnatomicalIssue {
  id: string;
  type: "dysfunction" | "anatomicalSuspicion";
  region: string;
  severity: number;
  notes: string;
  interventionZone?: string;
  laterality: "left" | "right" | "bilateral";
  anatomicalPart?: AnatomicalPart; // Objet complet de la partie anatomique avec données SVG
}

export type {
  Observation,
  NewObservation,
  AppointmentReference,
  AdvancedReportBuilderProps,
  AnatomicalIssue,
};

export const observationTypes = [
  { value: "staticObservation", label: "Observation statique" },
  { value: "dynamicObservation", label: "Observation dynamique" },
  { value: "exclusionDiagnosis", label: "Diagnostic d'exclusion" },
];

export const dysfunctionTypes = [
  { value: "confirmed", label: "Dysfonction" },
  { value: "suspected", label: "Suspicion d'atteinte anatomique" },
];

// Zones d'intervention du professionnel
export const interventionZones = [
  { value: "articulation", label: "Os/Articulations" },
  { value: "fascias", label: "Fascias" },
  { value: "organes", label: "Organes" },
  { value: "muscles", label: "Muscles" },
];
