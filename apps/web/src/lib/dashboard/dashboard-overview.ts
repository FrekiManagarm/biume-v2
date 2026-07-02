import {
  buildDayAgendaModel,
  type AgendaAppointmentInput,
  type AgendaActionKind,
  type AgendaTodoItem,
  type DayAgendaAppointment,
} from "./day-agenda";

export type RecentActivityInput = {
  id: string;
  type?: "report" | "new_patient";
  title: string;
  description: string;
  timestamp: string;
};

type ActivityMetricsInput = {
  newAnimals: number;
  newOwners: number;
  sentReports: number;
};

export type DashboardSummaryItem = {
  id: "next" | "appointments" | "reports" | "followUps";
  label: string;
  value: string;
  detail: string;
  tone: "neutral" | "warning" | "success";
};

export type DashboardPriorityItem = {
  id: string;
  appointmentId: string;
  reportId?: string;
  title: string;
  description: string;
  timeLabel: string;
  actionLabel: string;
  actionKind: AgendaActionKind;
  tone: "neutral" | "warning" | "success";
};

export type DashboardActivitySignal = {
  label: string;
  value: string;
  detail: string;
};

export type DashboardOverviewModel = {
  heroLabel: "Vue d'ensemble";
  selectedDate: Date;
  nextAppointment: DayAgendaAppointment | null;
  agenda: DayAgendaAppointment[];
  summary: DashboardSummaryItem[];
  priorities: DashboardPriorityItem[];
  recentActivity: RecentActivityInput[];
  activitySignals: DashboardActivitySignal[];
  emptyStates: {
    agenda: string;
    priorities: string;
    recentActivity: string;
  };
};

export type DashboardOverviewInput = {
  selectedDate: Date;
  now: Date;
  appointments: AgendaAppointmentInput[];
  metrics: ActivityMetricsInput;
  recentActivity: RecentActivityInput[];
};

export function buildDashboardOverviewModel({
  appointments,
  metrics,
  now,
  recentActivity,
  selectedDate,
}: DashboardOverviewInput): DashboardOverviewModel {
  const dayAgenda = buildDayAgendaModel({
    appointments,
    now,
    selectedDate,
  });
  const nextAppointment =
    dayAgenda.appointments.find(
      (appointment) =>
        appointment.status !== "CANCELLED" &&
        appointment.endAt.getTime() >= now.getTime(),
    ) ?? null;
  const reportTodoCount = dayAgenda.todo.afterSession.length;
  const normalizedRecentActivity = recentActivity.map(normalizeRecentActivity);
  const priorities = [
    ...dayAgenda.todo.beforeSession.map((item) =>
      toPriorityItem(item, "neutral"),
    ),
    ...dayAgenda.todo.afterSession.map((item) =>
      toPriorityItem(
        item,
        item.action.kind === "send_report" ? "success" : "warning",
      ),
    ),
  ];

  return {
    heroLabel: "Vue d'ensemble",
    selectedDate,
    nextAppointment,
    agenda: dayAgenda.appointments,
    summary: [
      {
        id: "next",
        label: "Prochaine séance",
        value: nextAppointment ? formatTime(nextAppointment.beginAt) : "-",
        detail: nextAppointment
          ? `${getAppointmentAnimalLabel(nextAppointment)} · ${formatTimeUntil(
              nextAppointment,
              now,
            )}`
          : "Aucune séance à venir aujourd'hui",
        tone: "neutral",
      },
      {
        id: "appointments",
        label: "Séances aujourd'hui",
        value: String(dayAgenda.summary.appointmentCount),
        detail: `${dayAgenda.summary.beforeSessionCount} préparation${dayAgenda.summary.beforeSessionCount > 1 ? "s" : ""}`,
        tone: "neutral",
      },
      {
        id: "reports",
        label: "Comptes rendus",
        value: String(reportTodoCount),
        detail:
          reportTodoCount > 0
            ? `${reportTodoCount} action${reportTodoCount > 1 ? "s" : ""} en attente`
            : "Aucun compte rendu en retard",
        tone: reportTodoCount > 0 ? "warning" : "success",
      },
      {
        id: "followUps",
        label: "Suivis",
        value: "-",
        detail: "À connecter aux rappels programmés",
        tone: "neutral",
      },
    ],
    priorities,
    recentActivity: normalizedRecentActivity,
    activitySignals: [
      {
        label: "Animaux ajoutés",
        value: String(metrics.newAnimals),
        detail: "90 derniers jours",
      },
      {
        label: "Propriétaires ajoutés",
        value: String(metrics.newOwners),
        detail: "90 derniers jours",
      },
      {
        label: "Comptes rendus envoyés",
        value: String(metrics.sentReports),
        detail: "30 derniers jours",
      },
    ],
    emptyStates: {
      agenda: "Aucune séance prévue aujourd'hui.",
      priorities: "Rien d'urgent à traiter.",
      recentActivity: "Aucune activité récente à afficher.",
    },
  };
}

function toPriorityItem(
  item: AgendaTodoItem,
  tone: DashboardPriorityItem["tone"],
): DashboardPriorityItem {
  return {
    id: item.id,
    appointmentId: item.appointmentId,
    reportId: item.action.reportId,
    title: `${item.action.label} · ${item.animalName}`,
    description: item.ownerName,
    timeLabel: item.timeLabel,
    actionLabel: item.action.label,
    actionKind: item.action.kind,
    tone,
  };
}

function getAppointmentAnimalLabel(appointment: DayAgendaAppointment) {
  return appointment.patient?.name ?? "Animal non renseigné";
}

function formatTime(value: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

function formatTimeUntil(appointment: DayAgendaAppointment, now: Date) {
  if (
    appointment.beginAt.getTime() <= now.getTime() &&
    appointment.endAt.getTime() >= now.getTime()
  ) {
    return "En cours";
  }

  const minutes = Math.max(
    0,
    Math.round((appointment.beginAt.getTime() - now.getTime()) / 60000),
  );

  if (minutes < 60) return `dans ${minutes} min`;

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return remainingMinutes === 0
    ? `dans ${hours} h`
    : `dans ${hours} h ${remainingMinutes}`;
}

function normalizeRecentActivity(activity: RecentActivityInput) {
  if (activity.type === "new_patient") {
    return {
      ...activity,
      title: "Nouvel animal",
      description: replaceLegacyVocabulary(activity.description),
    };
  }

  return {
    ...activity,
    title: replaceLegacyVocabulary(activity.title),
    description: replaceLegacyVocabulary(activity.description),
  };
}

function replaceLegacyVocabulary(value: string) {
  return value
    .replaceAll("Rapport", "Compte rendu")
    .replaceAll("rapport", "compte rendu")
    .replaceAll("Patient", "Animal")
    .replaceAll("patient", "animal");
}
