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
  if (reports.some((report) => report.status === "sent")) return "sent";
  if (reports.some((report) => report.status === "finalized")) {
    return "ready_to_send";
  }
  if (reports.some((report) => report.status === "draft")) return "draft";
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
    return { kind: "view_report", label: "Voir" };
  }
  return { kind: "prepare", label: "Préparer" };
}

export function buildDayAgendaModel({
  appointments,
  now,
}: BuildDayAgendaInput): DayAgendaModel {
  const normalizedAppointments = appointments
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
