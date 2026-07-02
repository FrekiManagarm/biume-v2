export type AgendaAppointmentStatus =
  | "CREATED"
  | "CONFIRMED"
  | "CANCELLED"
  | "COMPLETED";

export type AgendaDbReportStatus = "draft" | "finalized" | "sent";

export type AgendaReportStatus =
  | "none"
  | "to_create"
  | "draft"
  | "ready_to_send"
  | "sent";

export type AgendaActionKind =
  | "prepare"
  | "create_report"
  | "finalize_report"
  | "send_report"
  | "view_report";

export type AgendaReportInput = {
  id: string;
  status: AgendaDbReportStatus;
  updatedAt: Date | string | null;
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
};

export type DayAgendaAppointment = AgendaAppointmentInput & {
  beginAt: Date;
  endAt: Date;
  reportStatus: AgendaReportStatus;
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

export function deriveAgendaReportStatus(
  reports: AgendaReportInput[] = [],
  appointmentStatus: AgendaAppointmentStatus,
): AgendaReportStatus {
  const latestReport = getLatestAgendaReport(reports);

  if (!latestReport) {
    return appointmentStatus === "COMPLETED" ? "to_create" : "none";
  }

  if (latestReport.status === "sent") return "sent";
  if (latestReport.status === "finalized") {
    return "ready_to_send";
  }
  if (latestReport.status === "draft") return "draft";

  return appointmentStatus === "COMPLETED" ? "to_create" : "none";
}

export function getAgendaPrimaryAction(
  status: AgendaReportStatus,
  appointmentStatus: AgendaAppointmentStatus,
): AgendaPrimaryAction {
  if (status === "sent") return { kind: "view_report", label: "Voir le CR" };
  if (status === "ready_to_send") {
    return { kind: "send_report", label: "Envoyer" };
  }
  if (status === "draft") return { kind: "finalize_report", label: "Finaliser" };
  if (status === "to_create") {
    return { kind: "create_report", label: "Créer le compte rendu" };
  }
  if (appointmentStatus === "CANCELLED") {
    return { kind: "prepare", label: "Préparer" };
  }
  return { kind: "prepare", label: "Préparer" };
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
      const reportStatus = deriveAgendaReportStatus(
        appointment.reports ?? [],
        appointment.status,
      );

      return {
        ...appointment,
        beginAt,
        endAt,
        reports: appointment.reports ?? [],
        reportStatus,
        primaryAction: getAgendaPrimaryAction(reportStatus, appointment.status),
      };
    })
    .sort((a, b) => a.beginAt.getTime() - b.beginAt.getTime());

  const todo: AgendaTodoGroup = {
    beforeSession: [],
    afterSession: [],
  };

  for (const appointment of normalizedAppointments) {
    if (appointment.status === "CANCELLED") continue;

    const item: AgendaTodoItem = {
      id: `${appointment.id}-${appointment.primaryAction.kind}`,
      appointmentId: appointment.id,
      action: appointment.primaryAction,
      animalName: appointment.patient?.name ?? "Animal non renseigné",
      ownerName: appointment.patient?.owner?.name ?? "Propriétaire inconnu",
      timeLabel: formatAgendaTime(appointment.beginAt),
    };

    if (
      appointment.primaryAction.kind === "prepare" &&
      appointment.beginAt.getTime() >= now.getTime()
    ) {
      todo.beforeSession.push(item);
    }

    if (
      appointment.primaryAction.kind === "create_report" ||
      appointment.primaryAction.kind === "finalize_report" ||
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

function getLatestAgendaReport(reports: AgendaReportInput[]) {
  let latestReport: AgendaReportInput | null = null;
  let latestScore = Number.NEGATIVE_INFINITY;
  let latestIndex = -1;

  reports.forEach((report, index) => {
    const score = getAgendaReportUpdatedAtScore(report.updatedAt);

    if (
      score > latestScore ||
      (score === latestScore && index > latestIndex)
    ) {
      latestReport = report;
      latestScore = score;
      latestIndex = index;
    }
  });

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
