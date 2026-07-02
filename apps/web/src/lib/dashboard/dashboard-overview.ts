import {
  buildDayAgendaModel,
  type AgendaAppointmentInput,
  type AgendaTodoItem,
  type DayAgendaAppointment,
} from "./day-agenda";

type RecentActivityInput = {
  id: string;
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
          ? getAppointmentAnimalLabel(nextAppointment)
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
        detail: "À créer, finaliser ou envoyer",
        tone: reportTodoCount > 0 ? "warning" : "success",
      },
      {
        id: "followUps",
        label: "Suivis",
        value: "0",
        detail: "Module dédié à venir",
        tone: "neutral",
      },
    ],
    priorities,
    recentActivity,
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
    timeZone: "UTC",
  }).format(value);
}
