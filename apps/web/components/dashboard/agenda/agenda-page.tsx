"use client";

import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  CalendarX2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
} from "lucide-react";
import { useMemo, useState } from "react";

import {
  ConfirmActionDialog,
  DeleteEntityDialog,
} from "#/components/dashboard/lists/entity-row-actions";
import {
  EmptyState,
  ListRow,
  Panel,
  PanelHeader,
} from "#/components/dashboard/kit";
import { Button } from "#/components/ui/button";
import {
  createAppointment,
  deleteAppointment,
  updateAppointment,
  type getAppointments as getAppointmentsFn,
} from "#/lib/api/actions/appointments.action";
import { createReport } from "#/lib/api/actions/reports.action";
import {
  appointmentsQueryOptions,
  type AppointmentWindow,
} from "#/lib/api/queries/appointments.query";
import { patientsQueryOptions } from "#/lib/api/queries/patients.query";
import {
  buildDayAgendaModel,
  type DayAgendaAppointment,
} from "#/lib/dashboard/day-agenda";
import { buildReportCreationInput } from "#/lib/dashboard/report-creation";
import { cn } from "#/lib/utils";

import { AppointmentActionsMenu } from "./appointment-actions-menu";
import { AppointmentCard } from "./appointment-card";
import { EditAppointmentDialog } from "./edit-appointment-dialog";
import { NewAppointmentDialog } from "./new-appointment-dialog";

type AgendaAppointment = Awaited<ReturnType<typeof getAppointmentsFn>>[number];

type AgendaPageProps = {
  /**
   * Calculée une seule fois par la route, puis transmise ici : c'est ce qui
   * garantit que la clé de requête du chargement serveur et celle de ce
   * composant coïncident au millisecond près, et que le SSR alimente bien le
   * cache que ce composant va lire.
   */
  appointmentWindow: AppointmentWindow;
};

const WEEKDAY_LABELS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

export function AgendaPage({ appointmentWindow }: AgendaPageProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const appointmentsQuery = appointmentsQueryOptions(appointmentWindow);
  const { data: appointments } = useSuspenseQuery(appointmentsQuery);
  const { data: patients } = useSuspenseQuery(patientsQueryOptions());

  const [currentMonth, setCurrentMonth] = useState(() =>
    startOfMonth(new Date()),
  );
  const [selectedDate, setSelectedDate] = useState(() =>
    startOfDay(new Date()),
  );
  const [isNewAppointmentOpen, setIsNewAppointmentOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] =
    useState<DayAgendaAppointment | null>(null);
  const [deletingAppointment, setDeletingAppointment] =
    useState<DayAgendaAppointment | null>(null);
  const [cancellingAppointment, setCancellingAppointment] =
    useState<DayAgendaAppointment | null>(null);

  function invalidateAppointments() {
    return queryClient.invalidateQueries({
      queryKey: appointmentsQuery.queryKey,
    });
  }

  const createAppointmentMutation = useMutation({
    mutationFn: createAppointment,
    onSuccess: invalidateAppointments,
  });
  const updateAppointmentMutation = useMutation({
    mutationFn: updateAppointment,
    onSuccess: () => {
      invalidateAppointments();
      setCancellingAppointment(null);
    },
  });
  const deleteAppointmentMutation = useMutation({
    mutationFn: deleteAppointment,
    onSuccess: () => {
      invalidateAppointments();
      setDeletingAppointment(null);
    },
  });
  const createReportMutation = useMutation({
    mutationFn: createReport,
    onSuccess: invalidateAppointments,
  });

  const dayModel = useMemo(
    () => buildDayAgendaModel({ appointments, now: new Date(), selectedDate }),
    [appointments, selectedDate],
  );
  const monthDays = useMemo(() => buildMonthDays(currentMonth), [currentMonth]);
  /**
   * Les candidats au chevauchement, tirés de l'agenda déjà chargé : détecter un
   * conflit ne justifie pas une requête de plus.
   */
  const conflictCandidates = useMemo(
    () =>
      appointments.map((appointment) => ({
        id: appointment.id,
        beginAt: appointment.beginAt,
        endAt: appointment.endAt,
        status: appointment.status,
        patientName: appointment.patient?.name ?? null,
      })),
    [appointments],
  );
  const upcomingAppointments = useMemo(() => {
    const now = startOfDay(new Date());

    return appointments
      .filter((appointment) => new Date(appointment.beginAt) >= now)
      .sort(
        (a, b) => new Date(a.beginAt).getTime() - new Date(b.beginAt).getTime(),
      )
      .slice(0, 5);
  }, [appointments]);

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

  function jumpToAppointment(appointment: AgendaAppointment) {
    const date = new Date(appointment.beginAt);
    setSelectedDate(startOfDay(date));
    setCurrentMonth(startOfMonth(date));
  }

  function handlePrimaryAction(appointment: DayAgendaAppointment) {
    const { primaryAction } = appointment;

    if (primaryAction.reportId) {
      if (primaryAction.kind === "view_report") {
        router.push(`/dashboard/reports/${primaryAction.reportId}`);
      } else {
        router.push(`/dashboard/reports/${primaryAction.reportId}/edit`);
      }

      return;
    }

    // Défense en profondeur contre le double-clic : le bouton se désactive au
    // prochain rendu via `isPrimaryActionPending`, mais un second clic tiré
    // avant ce rendu (souris rapide, tests, etc.) doit être ignoré ici aussi.
    if (createReportMutation.isPending) return;

    const reportCreationInput = buildReportCreationInput(appointment);
    if (!reportCreationInput) return;

    createReportMutation.mutate(reportCreationInput, {
      onSuccess: (result) => {
        router.push(`/dashboard/reports/${result.reportId}/edit`);
      },
    });
  }

  return (
    <div className="grid w-full gap-5 pb-8">
      <div className="flex justify-end">
        <Button onClick={() => setIsNewAppointmentOpen(true)}>
          Nouveau rendez-vous
          <Plus className="size-4" data-icon="inline-end" />
        </Button>
      </div>

      <section className="grid gap-5 xl:grid-cols-[1fr_24rem]">
        <Panel>
          <PanelHeader
            title={`${formatMonth(currentMonth)}.`}
            description="Sélectionnez un jour pour afficher son détail à droite."
            actions={
              <>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={goToPreviousMonth}
                >
                  <ChevronLeft className="size-4" />
                  <span className="sr-only">Mois précédent</span>
                </Button>
                <Button variant="outline" onClick={goToToday}>
                  Aujourd'hui
                </Button>
                <Button variant="outline" size="icon" onClick={goToNextMonth}>
                  <ChevronRight className="size-4" />
                  <span className="sr-only">Mois suivant</span>
                </Button>
              </>
            }
          />

          <div className="grid grid-cols-7 gap-px overflow-hidden rounded-card border border-border bg-border">
            {WEEKDAY_LABELS.map((day) => (
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
                        isSelected &&
                          !isToday &&
                          "bg-primary-surface text-primary",
                      )}
                    >
                      {day.date.getDate()}
                    </span>
                    {dayAppointments.length > 0 ? (
                      <span className="rounded-md bg-muted px-1.5 py-0.5 text-xs font-semibold text-muted-foreground">
                        {dayAppointments.length}
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-3 grid gap-1">
                    {dayAppointments.slice(0, 2).map((appointment) => (
                      <span
                        key={appointment.id}
                        className="truncate rounded-md bg-card/70 px-2 py-1 text-xs text-muted-foreground ring-1 ring-border"
                      >
                        {formatTime(appointment.beginAt)} ·{" "}
                        {appointment.patient?.name ?? "Patient"}
                      </span>
                    ))}
                    {dayAppointments.length > 2 ? (
                      <span className="text-xs font-medium text-primary">
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

        <aside className="grid gap-5 self-start">
          <Panel>
            <PanelHeader
              title={`${formatLongDate(selectedDate)}.`}
              description={`Journée sélectionnée · ${dayModel.summary.appointmentCount} rendez-vous.`}
            />

            <div className="grid max-h-[28rem] gap-3 overflow-y-auto pr-1">
              {dayModel.appointments.length > 0 ? (
                dayModel.appointments.map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    onPrimaryAction={handlePrimaryAction}
                    isPrimaryActionPending={
                      createReportMutation.isPending &&
                      createReportMutation.variables?.appointmentId ===
                        appointment.id
                    }
                    actions={
                      <AppointmentActionsMenu
                        disabled={
                          updateAppointmentMutation.isPending ||
                          deleteAppointmentMutation.isPending
                        }
                        onCancel={() => setCancellingAppointment(appointment)}
                        onDelete={() => setDeletingAppointment(appointment)}
                        onEdit={() => setEditingAppointment(appointment)}
                      />
                    }
                  />
                ))
              ) : (
                <EmptyState
                  icon={CalendarDays}
                  title="Aucun rendez-vous"
                  description="Cette journée est libre pour le moment."
                />
              )}
            </div>
          </Panel>

          <Panel>
            <PanelHeader
              title="Prochains rendez-vous."
              description="À venir, du plus proche au plus lointain."
            />
            <div className="grid gap-2">
              {upcomingAppointments.length > 0 ? (
                upcomingAppointments.map((appointment) => (
                  <ListRow
                    key={appointment.id}
                    icon={Clock}
                    title={appointment.patient?.name ?? "Patient"}
                    meta={`${formatLongDate(appointment.beginAt)} · ${formatTime(appointment.beginAt)}`}
                    action={
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => jumpToAppointment(appointment)}
                      >
                        Voir
                      </Button>
                    }
                  />
                ))
              ) : (
                <p className="text-sm leading-6 text-muted-foreground">
                  Aucun rendez-vous à venir.
                </p>
              )}
            </div>
          </Panel>
        </aside>
      </section>

      <NewAppointmentDialog
        existingAppointments={conflictCandidates}
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
        appointment={editingAppointment}
        existingAppointments={conflictCandidates}
        isSubmitting={updateAppointmentMutation.isPending}
        open={editingAppointment !== null}
        onOpenChange={(open) => {
          if (!open) setEditingAppointment(null);
        }}
        onSubmit={(input) => updateAppointmentMutation.mutateAsync(input)}
      />

      <DeleteEntityDialog
        confirmLabel="Supprimer"
        description={
          deletingAppointment
            ? `Le rendez-vous du ${formatLongDate(deletingAppointment.beginAt)} à ${formatTime(deletingAppointment.beginAt)} sera supprimé. Un compte rendu déjà rempli reste disponible dans Comptes rendus.`
            : ""
        }
        isPending={deleteAppointmentMutation.isPending}
        open={deletingAppointment !== null}
        title="Supprimer ce rendez-vous ?"
        onConfirm={() => {
          if (!deletingAppointment) return;
          deleteAppointmentMutation.mutate(deletingAppointment.id);
        }}
        onOpenChange={(open) => {
          if (!open) setDeletingAppointment(null);
        }}
      />

      <ConfirmActionDialog
        icon={CalendarX2}
        title="Annuler ce rendez-vous ?"
        description={
          cancellingAppointment
            ? `Le rendez-vous du ${formatLongDate(cancellingAppointment.beginAt)} à ${formatTime(cancellingAppointment.beginAt)} sera marqué comme annulé et sortira du planning actif. Il n'existe pas de geste, dans l'agenda, pour revenir en arrière ensuite.`
            : ""
        }
        confirmLabel="Annuler la séance"
        pendingLabel="Annulation…"
        cancelLabel="Retour"
        isPending={updateAppointmentMutation.isPending}
        open={cancellingAppointment !== null}
        onConfirm={() => {
          if (!cancellingAppointment) return;
          updateAppointmentMutation.mutate({
            appointmentId: cancellingAppointment.id,
            status: "CANCELLED",
          });
        }}
        onOpenChange={(open) => {
          if (!open) setCancellingAppointment(null);
        }}
      />
    </div>
  );
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
