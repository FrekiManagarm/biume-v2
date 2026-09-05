import type { AgendaAppointmentStatus } from "./day-agenda";

export type ConflictCandidate = {
  id: string;
  beginAt: Date | string;
  endAt: Date | string;
  status: AgendaAppointmentStatus;
  patientName: string | null;
};

type Slot = { beginAt: Date; endAt: Date };

/**
 * Bornes ouvertes : deux séances qui se touchent ne se chevauchent pas.
 * Enchaîner un rendez-vous sur la fin du précédent est le fonctionnement
 * normal d'une tournée, pas une erreur à signaler.
 */
export function overlaps(a: Slot, b: Slot): boolean {
  return (
    a.beginAt.getTime() < b.endAt.getTime() &&
    b.beginAt.getTime() < a.endAt.getTime()
  );
}

export function findAppointmentConflicts({
  beginAt,
  endAt,
  excludeAppointmentId,
  candidates,
}: {
  beginAt: Date;
  endAt: Date;
  excludeAppointmentId?: string;
  candidates: ConflictCandidate[];
}): ConflictCandidate[] {
  return candidates
    .filter((candidate) => candidate.status !== "CANCELLED")
    .filter((candidate) => candidate.id !== excludeAppointmentId)
    .filter((candidate) =>
      overlaps(
        { beginAt, endAt },
        {
          beginAt: new Date(candidate.beginAt),
          endAt: new Date(candidate.endAt),
        },
      ),
    )
    .sort(
      (left, right) =>
        new Date(left.beginAt).getTime() - new Date(right.beginAt).getTime(),
    );
}

function timeLabel(value: Date | string): string {
  return new Date(value).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Le message dit ce que le praticien doit décider, pas ce que le système a
 * calculé. Au-delà d'un conflit, nommer chaque animal allongerait la phrase
 * sans l'aider : le nombre suffit à lui faire ouvrir son agenda.
 */
export function conflictWarning(conflicts: ConflictCandidate[]): string | null {
  if (conflicts.length === 0) return null;

  if (conflicts.length === 1) {
    const [conflict] = conflicts;
    const when = timeLabel(conflict.beginAt);

    return conflict.patientName
      ? `Ce créneau chevauche la séance de ${conflict.patientName} à ${when}.`
      : `Ce créneau chevauche une séance à ${when}.`;
  }

  return `Ce créneau chevauche ${conflicts.length} séances déjà prévues.`;
}
