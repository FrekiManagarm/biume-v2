import { isReportEmpty } from "@biume/contracts/report";

import { deriveSessionState, type SessionState } from "./session-state";

export type AgendaAppointmentStatus =
  | "CREATED"
  | "CONFIRMED"
  | "CANCELLED"
  | "COMPLETED";

export type AgendaDbReportStatus = "draft" | "finalized" | "sent";

export type AgendaReportState =
  | "absent"
  | "empty"
  | "started"
  | "finalized"
  | "sent";

export type AgendaActionKind =
  | "cancelled"
  | "upcoming"
  | "prepare_report"
  | "create_report"
  | "fill_report"
  | "continue_report"
  | "send_report"
  | "view_report";

export type AgendaReportInput = {
  id: string;
  status: AgendaDbReportStatus;
  updatedAt: Date | string | null;
  consultationReason: string;
  notes: string | null;
  anatomicalIssueCount: number;
  recommendationCount: number;
};

export type AgendaAnimalInput = {
  name: string | null;
  code?: string | null;
};

export type AgendaOwnerInput = {
  id: string;
  name: string | null;
};

export type AgendaPatientInput = {
  id: string;
  name: string | null;
  breed?: string | null;
  animal?: AgendaAnimalInput | null;
  owner?: AgendaOwnerInput | null;
};

export type AgendaAppointmentInput = {
  id: string;
  beginAt: Date | string;
  endAt: Date | string;
  status: AgendaAppointmentStatus;
  atHome?: boolean | null;
  note?: string | null;
  reports?: AgendaReportInput[];
  patient?: AgendaPatientInput | null;
};

export type AgendaPrimaryAction = {
  kind: AgendaActionKind;
  label: string;
  appointmentId?: string;
  reportId?: string;
};

export type DayAgendaAppointment = AgendaAppointmentInput & {
  beginAt: Date;
  endAt: Date;
  durationLabel: string;
  sessionState: SessionState;
  reportState: AgendaReportState;
  primaryAction: AgendaPrimaryAction;
};

export type AgendaTodoItem = {
  id: string;
  appointmentId: string;
  action: AgendaPrimaryAction;
  animalName: string;
  ownerName: string;
  timeLabel: string;
};

export type AgendaTodoGroup = {
  beforeSession: AgendaTodoItem[];
  afterSession: AgendaTodoItem[];
};

export type DayAgendaModel = {
  appointments: DayAgendaAppointment[];
  todo: AgendaTodoGroup;
  summary: {
    appointmentCount: number;
    beforeSessionCount: number;
    afterSessionCount: number;
  };
};

export type BuildDayAgendaInput = {
  appointments: AgendaAppointmentInput[];
  now: Date;
  selectedDate: Date;
};

export function deriveAgendaReportState(
  reports: AgendaReportInput[] = [],
): AgendaReportState {
  const latestReport = getLatestAgendaReport(reports);

  if (!latestReport) return "absent";
  if (latestReport.status === "sent") return "sent";
  if (latestReport.status === "finalized") return "finalized";

  return isReportEmpty(latestReport) ? "empty" : "started";
}

/**
 * Le couple (état de séance, état du compte rendu) détermine l'unique action
 * proposée. Le libellé est celui que lit le praticien : il dit le geste, pas
 * l'état interne du système.
 */
export function getAgendaPrimaryAction(
  sessionState: SessionState,
  reportState: AgendaReportState,
): { kind: AgendaActionKind; label: string } {
  if (sessionState === "cancelled") {
    return { kind: "cancelled", label: "Annulé" };
  }

  if (reportState === "sent") {
    return { kind: "view_report", label: "Voir le compte rendu" };
  }

  if (reportState === "finalized") {
    return sessionState === "done"
      ? { kind: "send_report", label: "Envoyer au propriétaire" }
      : { kind: "view_report", label: "Voir le compte rendu" };
  }

  if (reportState === "started") {
    return { kind: "continue_report", label: "Continuer le compte rendu" };
  }

  if (sessionState === "done") {
    return reportState === "absent"
      ? { kind: "create_report", label: "Créer le compte rendu" }
      : { kind: "fill_report", label: "Remplir le compte rendu" };
  }

  return reportState === "absent"
    ? { kind: "prepare_report", label: "Préparer le compte rendu" }
    : { kind: "upcoming", label: "Séance à venir" };
}

export function buildDayAgendaModel({
  appointments,
  selectedDate,
  now,
}: BuildDayAgendaInput): DayAgendaModel {
  const selectedDay = startOfDay(selectedDate);
  const normalizedAppointments = appointments
    .filter((appointment) =>
      isSameDay(new Date(appointment.beginAt), selectedDay),
    )
    .map((appointment): DayAgendaAppointment => {
      const beginAt = new Date(appointment.beginAt);
      const endAt = new Date(appointment.endAt);
      const reports = appointment.reports ?? [];
      const sessionState = deriveSessionState({
        status: appointment.status,
        endAt,
        now,
      });
      const reportState = deriveAgendaReportState(reports);
      const primaryAction = {
        ...getAgendaPrimaryAction(sessionState, reportState),
        ...getAgendaPrimaryActionTarget(appointment.id, reports),
      };

      return {
        ...appointment,
        beginAt,
        endAt,
        durationLabel: formatDurationLabel(beginAt, endAt),
        reports,
        sessionState,
        reportState,
        primaryAction,
      };
    })
    .sort((a, b) => a.beginAt.getTime() - b.beginAt.getTime());

  const todo: AgendaTodoGroup = {
    beforeSession: [],
    afterSession: [],
  };

  for (const appointment of normalizedAppointments) {
    if (appointment.sessionState === "cancelled") continue;

    const item: AgendaTodoItem = {
      id: `${appointment.id}-${appointment.primaryAction.kind}`,
      appointmentId: appointment.id,
      action: appointment.primaryAction,
      animalName: appointment.patient?.name ?? "Animal non renseigné",
      ownerName: appointment.patient?.owner?.name ?? "Propriétaire inconnu",
      timeLabel: formatAgendaTime(appointment.beginAt),
    };

    if (appointment.primaryAction.kind === "prepare_report") {
      todo.beforeSession.push(item);
    }

    if (
      appointment.primaryAction.kind === "create_report" ||
      appointment.primaryAction.kind === "fill_report" ||
      appointment.primaryAction.kind === "continue_report" ||
      appointment.primaryAction.kind === "send_report"
    ) {
      todo.afterSession.push(item);
    }
  }

  return {
    appointments: normalizedAppointments,
    todo,
    summary: {
      appointmentCount: normalizedAppointments.length,
      beforeSessionCount: todo.beforeSession.length,
      afterSessionCount: todo.afterSession.length,
    },
  };
}

function formatAgendaTime(value: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

function getAgendaPrimaryActionTarget(
  appointmentId: string,
  reports: AgendaReportInput[],
) {
  const latestReport = getLatestAgendaReport(reports);

  return {
    appointmentId,
    reportId: latestReport?.id,
  };
}

function formatDurationLabel(beginAt: Date, endAt: Date) {
  const durationMinutes = Math.max(
    0,
    Math.round((endAt.getTime() - beginAt.getTime()) / 60000),
  );

  if (durationMinutes < 60) return `${durationMinutes} min`;

  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;

  return minutes === 0 ? `${hours} h` : `${hours} h ${minutes}`;
}

function getLatestAgendaReport(
  reports: AgendaReportInput[],
): AgendaReportInput | null {
  let latestReport: AgendaReportInput | null = null;
  let latestScore = Number.NEGATIVE_INFINITY;
  let latestIndex = -1;

  for (const [index, report] of reports.entries()) {
    const score = getAgendaReportUpdatedAtScore(report.updatedAt);

    if (
      score > latestScore ||
      (score === latestScore && index > latestIndex)
    ) {
      latestReport = report;
      latestScore = score;
      latestIndex = index;
    }
  }

  return latestReport;
}

function getAgendaReportUpdatedAtScore(value: Date | string | null) {
  if (value === null) return Number.NEGATIVE_INFINITY;

  const updatedAt = value instanceof Date ? value : new Date(value);
  const time = updatedAt.getTime();

  return Number.isNaN(time) ? Number.NEGATIVE_INFINITY : time;
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
