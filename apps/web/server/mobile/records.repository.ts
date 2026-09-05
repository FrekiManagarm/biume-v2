import {
  patientSpeciesCodes,
  type PatientSpecies,
} from "@biume/contracts/capture";
import type {
  MobileOwner,
  MobilePatient,
  MobilePatientHistoryEntry,
} from "@biume/contracts/mobile-records";
import type { ReportStatus } from "@biume/contracts/report";

const knownSpecies = new Set<string>(patientSpeciesCodes);

/**
 * Le catalogue d'espèces évolue et des fiches importées portent des codes qui
 * n'y figurent plus. Une espèce inconnue devient `OTHER` plutôt que de faire
 * échouer la lecture : c'est un libellé, pas une donnée clinique.
 */
export function resolveSpecies(code: string | null | undefined): PatientSpecies {
  if (!code) return "OTHER";
  const normalized = code.trim().toUpperCase();
  return knownSpecies.has(normalized) ? (normalized as PatientSpecies) : "OTHER";
}

function orNull(value: string | null | undefined): string | null {
  if (value === null || value === undefined) return null;
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}

function isoOrNull(value: Date | null | undefined): string | null {
  return value ? value.toISOString() : null;
}

export const ownerWithoutNameLabel = "Propriétaire sans nom";

export type OwnerRow = {
  id: string;
  name: string | null;
  email: string | null | undefined;
  phone: string | null | undefined;
  city: string | null | undefined;
  patientCount: number;
};

export function toMobileOwner(row: OwnerRow): MobileOwner {
  return {
    id: row.id,
    name: orNull(row.name) ?? ownerWithoutNameLabel,
    email: orNull(row.email),
    phone: orNull(row.phone),
    city: orNull(row.city),
    patientCount: row.patientCount,
  };
}

export type PatientRow = {
  id: string;
  ownerId: string;
  ownerName: string | null;
  name: string;
  speciesCode: string | null;
  breed: string | null;
  birthDate: Date | null;
  lastAppointmentAt: Date | null;
};

export function toMobilePatient(row: PatientRow): MobilePatient {
  return {
    id: row.id,
    ownerId: row.ownerId,
    ownerName: orNull(row.ownerName) ?? ownerWithoutNameLabel,
    name: row.name,
    species: resolveSpecies(row.speciesCode),
    breed: orNull(row.breed),
    birthDate: isoOrNull(row.birthDate),
    lastAppointmentAt: isoOrNull(row.lastAppointmentAt),
  };
}

export type HistoryRow = {
  appointmentId: string;
  beginAt: Date;
  reportId: string | null;
  reportStatus: ReportStatus | null;
  consultationReason: string | null;
};

export function toHistoryEntry(row: HistoryRow): MobilePatientHistoryEntry {
  return {
    appointmentId: row.appointmentId,
    beginAt: row.beginAt.toISOString(),
    reportId: row.reportId,
    reportStatus: row.reportStatus,
    consultationReason: row.consultationReason ?? "",
  };
}
