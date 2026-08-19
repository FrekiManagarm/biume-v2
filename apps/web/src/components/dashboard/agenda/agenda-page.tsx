import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
  CalendarClock,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Plus,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import {
  EmptyState,
  GroupedList,
  GroupedListRow,
  PageHeader,
  Panel,
  PanelHeader,
  SectionHeader,
  StatusPill,
  type Tone,
} from "#/components/dashboard/kit";
import { Button } from "#/components/ui/button";
import {
  createAppointment,
  deleteAppointment,
  updateAppointment,
} from "#/lib/api/actions/appointments.action";
import { createReport } from "#/lib/api/actions/reports.action";
import {
  appointmentsQueryKeyPrefix,
  appointmentsQueryOptions,
  defaultAppointmentWindow,
} from "#/lib/api/queries/appointments.query";
import { patientsQueryOptions } from "#/lib/api/queries/patients.query";
import {
  buildDayAgendaModel,
  type AgendaAppointmentStatus,
  type DayAgendaAppointment,
} from "#/lib/dashboard/day-agenda";
import {
  deriveSessionState,
  sessionStateLabel,
  type SessionState,
} from "#/lib/dashboard/session-state";
import { cn } from "#/lib/utils";

import { AppointmentActionsMenu } from "./appointment-actions-menu";
import { AppointmentCard } from "./appointment-card";
import { EditAppointmentDialog } from "./edit-appointment-dialog";
import { NewAppointmentDialog } from "./new-appointment-dialog";

// Le vert porte l'état atteint, jamais l'action : une séance terminée est un
// fait, une séance annulée est un problème, une séance prévue n'est rien de
// plus qu'une ligne du planning.
const sessionTone: Record<SessionState, Tone> = {
  scheduled: "neutral",
  done: "done",
  cancelled: "problem",
};

export function AgendaPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  // Calculée une seule fois par montage : `defaultAppointmentWindow()` est
  // déjà stable à la journée près, mais la recalculer à chaque rendu
  // recréerait un nouvel objet (et un appel `Date.now()`) pour rien.
  const appointmentWindow = useMemo(() => defaultAppointmentWindow(), []);
  const { data: appointments } = useSuspenseQuery(
    appointmentsQueryOptions(appointmentWindow),
  );
  const { data: patients } = useSuspenseQuery(patientsQueryOptions());
  const [currentMonth, setCurrentMonth] = useState(() =>
    startOfMonth(new Date()),
  );
  const [selectedDate, setSelectedDate] = useState(() =>
    startOfDay(new Date()),
  );
  const [isNewAppointmentOpen, setIsNewAppointmentOpen] = useState(false);
  const [editedAppointment, setEditedAppointment] =
    useState<DayAgendaAppointment | null>(null);

  // On invalide le préfixe, pas une fenêtre précise : la liste peut être en
  // cache sous la fenêtre calculée par le loader SSR (à un instant différent
  // de celui-ci) plutôt que sous `appointmentWindow`.
  function invalidateAppointments() {
    return queryClient.invalidateQueries({
      queryKey: appointmentsQueryKeyPrefix,
    });
  }

  const createAppointmentMutation = useMutation({
    mutationFn: createAppointment,
    onSuccess: invalidateAppointments,
  });
  const updateAppointmentMutation = useMutation({
    mutationFn: updateAppointment,
    onSuccess: invalidateAppointments,
  });
  const deleteAppointmentMutation = useMutation({
    mutationFn: deleteAppointment,
    onSuccess: invalidateAppointments,
  });
  // Le compte rendu qui vient d'être créé change l'action attendue sur son
  // rendez-vous (« Créer » devient « Continuer ») : la liste des rendez-vous
  // porte les comptes rendus, elle doit donc être rechargée elle aussi.
  const createReportMutation = useMutation({
    mutationFn: createReport,
    onSuccess: invalidateAppointments,
  });

  const isMutating =
    updateAppointmentMutation.isPending || deleteAppointmentMutation.isPending;

  const monthDays = useMemo(() => buildMonthDays(currentMonth), [currentMonth]);
  const dayAgenda = useMemo(
    () =>
      buildDayAgendaModel({
        appointments,
        now: new Date(),
        selectedDate,
      }),
    [appointments, selectedDate],
  );
  const upcomingAppointments = useMemo(
    () => buildUpcomingAppointments(appointments),
    [appointments],
  );

  function goToPreviousMonth() {
    setCurrentMonth(addMonths(currentMonth, -1));
  }

  function goToNextMonth() {
    setCurrentMonth(addMonths(currentMonth, 1));
  }

  function goToToday() {
    const today = new Date();
    setCurrentMonth(startOfMonth(today));
    setSelectedDate(startOfDay(today));
  }

  function goToDay(date: Date) {
    setSelectedDate(startOfDay(date));
    setCurrentMonth(startOfMonth(date));
  }

  /**
   * L'unique geste que le rendez-vous attend.
   *
   * Le modèle a déjà tranché ce qu'il faut faire ; il reste à savoir si le
   * compte rendu existe. S'il existe, on l'ouvre — en lecture seule quand il
   * est déjà parti chez le propriétaire, en édition sinon. S'il n'existe pas,
   * on le crée avant d'y emmener le praticien : lui demander de le créer
   * d'abord puis de revenir serait un aller-retour de plus à comprendre.
   */
  async function handlePrimaryAction(appointment: DayAgendaAppointment) {
    const { primaryAction } = appointment;

    if (primaryAction.reportId) {
      if (primaryAction.kind === "view_report") {
        void navigate({
          to: "/dashboard/reports/$id",
          params: { id: primaryAction.reportId },
        });
        return;
      }

      void navigate({
        to: "/dashboard/reports/$id/edit",
        params: { id: primaryAction.reportId },
      });
      return;
    }

    const patientId = appointment.patient?.id;

    if (!patientId) {
      toast.error(
        "Ce rendez-vous n'a pas de patient : son compte rendu ne peut pas être créé.",
      );
      return;
    }

    try {
      const created = await createReportMutation.mutateAsync({
        petId: patientId,
        appointmentId: appointment.id,
        status: "draft",
      });

      void navigate({
        to: "/dashboard/reports/$id/edit",
        params: { id: created.reportId },
      });
    } catch {
      toast.error("Le compte rendu n'a pas pu être créé. Réessayez.");
    }
  }

  /**
   * Annuler la séance, ce qui n'est pas la supprimer : le rendez-vous reste
   * dans l'agenda, marqué « Annulé », parce qu'un créneau annulé fait partie
   * de l'historique de l'animal.
   */
  async function handleCancelSession(appointment: DayAgendaAppointment) {
    try {
      await updateAppointmentMutation.mutateAsync({
        appointmentId: appointment.id,
        status: "CANCELLED",
      });
      toast.success("Séance annulée.");
    } catch {
      toast.error("La séance n'a pas pu être annulée. Réessayez.");
    }
  }

  async function handleDeleteAppointment(appointment: DayAgendaAppointment) {
    try {
      await deleteAppointmentMutation.mutateAsync(appointment.id);
      toast.success("Rendez-vous supprimé.");
    } catch {
      toast.error("Le rendez-vous n'a pas pu être supprimé. Réessayez.");
    }
  }

  async function handleEditSubmit(input: {
    appointmentId: string;
    beginAt: Date;
    endAt: Date;
    atHome: boolean;
    note?: string;
  }) {
    try {
      await updateAppointmentMutation.mutateAsync(input);
      toast.success("Rendez-vous modifié.");
    } catch {
      toast.error("La modification n'a pas pu être enregistrée. Réessayez.");
    }
  }

  return (
    <div className="grid w-full gap-6 pb-8">
      <PageHeader
        eyebrow="Agenda"
        title="Vos séances"
        description="Chaque rendez-vous porte l'état de sa séance et le geste qu'elle attend, sans avoir à l'ouvrir."
        actions={
          <Button onClick={() => setIsNewAppointmentOpen(true)}>
            Nouveau rendez-vous
            <Plus className="size-4" data-icon="inline-end" />
          </Button>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_24rem]">
        <Panel>
          <PanelHeader
            title={formatMonth(currentMonth)}
            description="Sélectionnez une journée pour voir ses rendez-vous."
            actions={
              <>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={goToPreviousMonth}
                >
                  <ChevronLeft className="size-4" aria-hidden />
                  <span className="sr-only">Mois précédent</span>
                </Button>
                <Button variant="outline" onClick={goToToday}>
                  Aujourd'hui
                </Button>
                <Button variant="outline" size="icon" onClick={goToNextMonth}>
                  <ChevronRight className="size-4" aria-hidden />
                  <span className="sr-only">Mois suivant</span>
                </Button>
              </>
            }
          />

          <div className="grid grid-cols-7 gap-px overflow-hidden rounded-card border border-border bg-border">
            {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((day) => (
              <div
                key={day}
                className="bg-muted px-2 py-3 text-center text-xs font-semibold uppercase text-muted-foreground"
              >
                {day}
              </div>
            ))}
            {monthDays.map((day) => {
              const dayAppointments = appointments.filter((appointment) =>
                isSameDay(new Date(appointment.beginAt), day.date),
              );
              const isSelected = isSameDay(day.date, selectedDate);
              const isToday = isSameDay(day.date, new Date());

              return (
                <button
                  key={day.date.toISOString()}
                  type="button"
                  onClick={() => setSelectedDate(day.date)}
                  className={cn(
                    "min-h-24 bg-card p-2 text-left transition duration-200 hover:bg-muted",
                    !day.inMonth && "bg-muted text-muted-foreground",
                    isSelected &&
                      "bg-primary-surface ring-2 ring-inset ring-primary",
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={cn(
                        "flex size-7 items-center justify-center rounded-lg text-sm font-semibold",
                        isToday && "bg-primary text-primary-foreground",
                        isSelected && !isToday && "text-primary",
                      )}
                    >
                      {day.date.getDate()}
                    </span>
                    {dayAppointments.length > 0 ? (
                      <span className="rounded-chip border border-border bg-card px-1.5 py-0.5 text-xs font-semibold text-muted-foreground">
                        {dayAppointments.length}
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-3 grid gap-1">
                    {dayAppointments.slice(0, 2).map((appointment) => (
                      <span
                        key={appointment.id}
                        className="truncate rounded-md border border-border bg-card px-2 py-1 text-xs text-muted-foreground"
                      >
                        {formatTime(appointment.beginAt)} ·{" "}
                        {appointment.patient?.name ?? "Animal"}
                      </span>
                    ))}
                    {dayAppointments.length > 2 ? (
                      <span className="text-xs font-medium text-muted-foreground">
                        +{dayAppointments.length - 2} autre
                        {dayAppointments.length - 2 > 1 ? "s" : ""}
                      </span>
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>
        </Panel>

        <aside className="grid gap-6 self-start">
          <Panel>
            <PanelHeader
              title={formatLongDate(selectedDate)}
              description={formatDayCount(dayAgenda.summary.appointmentCount)}
            />

            <div className="grid gap-3">
              {dayAgenda.appointments.length > 0 ? (
                dayAgenda.appointments.map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    onPrimaryAction={handlePrimaryAction}
                    actions={
                      <AppointmentActionsMenu
                        appointmentLabel={buildAppointmentLabel(appointment)}
                        disabled={isMutating}
                        onEdit={() => setEditedAppointment(appointment)}
                        onCancel={() => void handleCancelSession(appointment)}
                        onDelete={() =>
                          void handleDeleteAppointment(appointment)
                        }
                      />
                    }
                  />
                ))
              ) : (
                <EmptyState
                  icon={CalendarDays}
                  title="Aucun rendez-vous"
                  description="Cette journée est libre. Créez-y une séance si un propriétaire vous appelle."
                  action={
                    <Button onClick={() => setIsNewAppointmentOpen(true)}>
                      Nouveau rendez-vous
                    </Button>
                  }
                />
              )}
            </div>
          </Panel>

          {/* Pas de `Panel` autour de la liste groupée : `GroupedList` est
            elle-même une surface bordée, l'imbriquer dans un panneau
            dessinerait deux cadres l'un dans l'autre. */}
          <section>
            <SectionHeader eyebrow="À venir" title="Prochains rendez-vous" />

            {upcomingAppointments.length > 0 ? (
              <GroupedList>
                {upcomingAppointments.map((appointment) => (
                  <GroupedListRow
                    key={appointment.id}
                    icon={CalendarClock}
                    title={appointment.animalName}
                    meta={appointment.whenLabel}
                    badge={
                      appointment.statusLabel ? (
                        <StatusPill
                          tone={sessionTone[appointment.sessionState]}
                        >
                          {appointment.statusLabel}
                        </StatusPill>
                      ) : undefined
                    }
                    statusLabel={appointment.statusLabel}
                    onSelect={() => goToDay(appointment.beginAt)}
                  />
                ))}
              </GroupedList>
            ) : (
              <EmptyState
                icon={CalendarClock}
                title="Rien de prévu"
                description="Les rendez-vous que vous planifierez apparaîtront ici, du plus proche au plus lointain."
              />
            )}
          </section>
        </aside>
      </div>

      <NewAppointmentDialog
        isSubmitting={createAppointmentMutation.isPending}
        open={isNewAppointmentOpen}
        patients={patients}
        selectedDate={selectedDate}
        onCreateAppointment={(input) =>
          createAppointmentMutation.mutateAsync(input)
        }
        onOpenChange={setIsNewAppointmentOpen}
      />

      <EditAppointmentDialog
        appointment={editedAppointment}
        isSubmitting={updateAppointmentMutation.isPending}
        open={editedAppointment !== null}
        onOpenChange={(open) => {
          if (!open) setEditedAppointment(null);
        }}
        onSubmit={handleEditSubmit}
      />
    </div>
  );
}

/**
 * La phrase qui identifie un rendez-vous dans un libellé accessible.
 *
 * Même formulation que le `cardLabel` d'`AppointmentCard`, en minuscule :
 * elle est enchâssée dans d'autres phrases (« Actions – rendez-vous de Nox à
 * 14:00 », « le rendez-vous de Nox à 14:00 … sera supprimé »). Sans nom
 * d'animal, on n'invente pas un « de … » bancal.
 */
function buildAppointmentLabel(appointment: DayAgendaAppointment) {
  const animalName = appointment.patient?.name;
  const timeLabel = formatTime(appointment.beginAt);

  return animalName
    ? `rendez-vous de ${animalName} à ${timeLabel}`
    : `rendez-vous à ${timeLabel}`;
}

type UpcomingAppointmentInput = {
  id: string;
  beginAt: Date | string;
  endAt: Date | string;
  status: AgendaAppointmentStatus;
  patient?: { name: string | null } | null;
};

type UpcomingAppointment = {
  id: string;
  beginAt: Date;
  animalName: string;
  whenLabel: string;
  sessionState: SessionState;
  /** Absent quand la séance est simplement prévue : dans une liste intitulée
   * « à venir », dire « Prévu » sur chaque ligne n'apprend rien. Une séance
   * annulée, elle, change ce que le praticien fera de sa journée. */
  statusLabel?: string;
};

function buildUpcomingAppointments(
  appointments: UpcomingAppointmentInput[],
): UpcomingAppointment[] {
  const now = new Date();
  const today = startOfDay(now);

  return appointments
    .filter((appointment) => new Date(appointment.beginAt) >= today)
    .sort(
      (a, b) => new Date(a.beginAt).getTime() - new Date(b.beginAt).getTime(),
    )
    .slice(0, 5)
    .map((appointment) => {
      const beginAt = new Date(appointment.beginAt);
      const sessionState = deriveSessionState({
        status: appointment.status,
        endAt: new Date(appointment.endAt),
        now,
      });

      return {
        id: appointment.id,
        beginAt,
        animalName: appointment.patient?.name ?? "Animal non renseigné",
        whenLabel: `${formatLongDate(beginAt)} · ${formatTime(beginAt)}`,
        sessionState,
        statusLabel:
          sessionState === "scheduled"
            ? undefined
            : sessionStateLabel(sessionState),
      };
    });
}

function formatDayCount(count: number) {
  if (count === 0) return "Aucun rendez-vous sur cette journée.";
  if (count === 1) return "1 rendez-vous sur cette journée.";

  return `${count} rendez-vous sur cette journée.`;
}

function buildMonthDays(month: Date) {
  const firstDay = startOfMonth(month);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const startDate = addDays(firstDay, -startOffset);

  return Array.from({ length: 42 }, (_, index) => {
    const date = startOfDay(addDays(startDate, index));
    return {
      date,
      inMonth: isSameMonth(date, month),
    };
  });
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function addMonths(date: Date, months: number) {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return startOfMonth(next);
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isSameMonth(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

function formatMonth(date: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatLongDate(value: Date | string) {
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  }).format(new Date(value));
}

function formatTime(value: Date | string) {
  return new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
