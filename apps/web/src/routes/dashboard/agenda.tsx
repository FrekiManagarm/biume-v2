import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import type { Appointment } from "@biume/db/schema/index";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  Home,
  MapPin,
  PawPrint,
  Plus,
  Sparkles,
  Stethoscope,
  UserRound,
} from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "#/components/ui/button";
import { appointmentsQueryOptions } from "#/lib/api/queries/appointments.query";
import { cn } from "#/lib/utils";

export const Route = createFileRoute("/dashboard/agenda")({
  head: () => ({
    meta: [
      { title: "Agenda | Biume" },
      {
        name: "description",
        content: "Coordonnez les rendez-vous et consultations de votre espace.",
      },
    ],
  }),
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(appointmentsQueryOptions()),
  component: AgendaPage,
});

function AgendaPage() {
  const { data: appointments } = useSuspenseQuery(appointmentsQueryOptions());
  const [currentMonth, setCurrentMonth] = useState(() =>
    startOfMonth(new Date()),
  );
  const [selectedDate, setSelectedDate] = useState(() =>
    startOfDay(new Date()),
  );
  const monthDays = useMemo(() => buildMonthDays(currentMonth), [currentMonth]);
  const selectedAppointments = appointments
    .filter((appointment) =>
      isSameDay(new Date(appointment.beginAt), selectedDate),
    )
    .sort(
      (a, b) => new Date(a.beginAt).getTime() - new Date(b.beginAt).getTime(),
    );
  const todayAppointments = appointments.filter((appointment) =>
    isSameDay(new Date(appointment.beginAt), new Date()),
  );
  const upcomingAppointments = appointments
    .filter(
      (appointment) => new Date(appointment.beginAt) >= startOfDay(new Date()),
    )
    .sort(
      (a, b) => new Date(a.beginAt).getTime() - new Date(b.beginAt).getTime(),
    )
    .slice(0, 5);
  const completedThisMonth = appointments.filter(
    (appointment) =>
      appointment.status === "COMPLETED" &&
      isSameMonth(new Date(appointment.beginAt), currentMonth),
  ).length;

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

  return (
    <div className="grid w-full gap-5 pb-8 text-slate-950">
      <header className="grid gap-5 border-b border-slate-200 pb-6 pt-2 lg:grid-cols-[1fr_auto] lg:items-end">
        <div className="min-w-0">
          <div className="mb-4 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.45)]">
            <Sparkles className="size-3.5 text-emerald-700" />
            Planning clinique
          </div>
          <h1 className="text-3xl font-semibold leading-none tracking-tight text-slate-950 md:text-5xl">
            Agenda.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600 md:text-base">
            Visualisez les rendez-vous, les créneaux du jour et les séances à
            suivre dans votre espace Biume.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-[auto_auto] sm:items-center">
          <div className="grid grid-cols-[auto_1fr] items-center gap-3 rounded-[1.25rem] border border-slate-200 bg-white px-4 py-3 shadow-[0_24px_70px_-46px_rgba(15,23,42,0.5)]">
            <div className="flex size-11 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800">
              <CalendarDays className="size-4" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-950">
                {todayAppointments.length} rendez-vous aujourd'hui
              </p>
              <p className="mt-0.5 truncate text-xs text-slate-500">
                {completedThisMonth} séance
                {completedThisMonth > 1 ? "s" : ""} terminée
                {completedThisMonth > 1 ? "s" : ""} ce mois
              </p>
            </div>
          </div>
          <Button className="h-10 active:scale-[0.98]">
            Nouveau rendez-vous
            <Plus className="size-4" data-icon="inline-end" />
          </Button>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard
          detail="Sur la date sélectionnée"
          icon={Clock}
          label="Journée"
          tone="emerald"
          value={selectedAppointments.length}
        />
        <MetricCard
          detail="À partir d'aujourd'hui"
          icon={CalendarDays}
          label="À venir"
          tone="sky"
          value={upcomingAppointments.length}
        />
        <MetricCard
          detail="Sur le mois affiché"
          icon={Stethoscope}
          label="Terminés"
          tone="amber"
          value={completedThisMonth}
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1fr_24rem]">
        <Panel>
          <div className="mb-5 grid gap-4 border-b border-slate-200 pb-5 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-sm font-medium text-emerald-700">Calendrier</p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
                {formatMonth(currentMonth)}.
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
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
            </div>
          </div>

          <div className="grid grid-cols-7 gap-px overflow-hidden rounded-[1.25rem] border border-slate-200 bg-slate-200">
            {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((day) => (
              <div
                key={day}
                className="bg-slate-50 px-2 py-3 text-center text-xs font-semibold uppercase text-slate-500"
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
                    "min-h-24 bg-white p-2 text-left transition duration-200 hover:bg-slate-50",
                    !day.inMonth && "bg-slate-50 text-slate-400",
                    isSelected &&
                      "bg-emerald-50 ring-2 ring-inset ring-emerald-500",
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={cn(
                        "flex size-7 items-center justify-center rounded-lg text-sm font-semibold",
                        isToday && "bg-slate-950 text-white",
                        isSelected &&
                          !isToday &&
                          "bg-emerald-100 text-emerald-900",
                      )}
                    >
                      {day.date.getDate()}
                    </span>
                    {dayAppointments.length > 0 ? (
                      <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-xs font-semibold text-slate-600">
                        {dayAppointments.length}
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-3 grid gap-1">
                    {dayAppointments.slice(0, 2).map((appointment) => (
                      <span
                        key={appointment.id}
                        className="truncate rounded-md bg-white/70 px-2 py-1 text-xs text-slate-600 ring-1 ring-slate-200"
                      >
                        {formatTime(appointment.beginAt)} ·{" "}
                        {appointment.patient?.name ?? "Patient"}
                      </span>
                    ))}
                    {dayAppointments.length > 2 ? (
                      <span className="text-xs font-medium text-emerald-700">
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
            <div className="mb-5 border-b border-slate-200 pb-5">
              <p className="text-sm font-medium text-emerald-700">
                Journée sélectionnée
              </p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
                {formatLongDate(selectedDate)}.
              </h2>
            </div>

            <div className="grid gap-3">
              {selectedAppointments.length > 0 ? (
                selectedAppointments.map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                  />
                ))
              ) : (
                <div className="rounded-[1.25rem] border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center">
                  <CalendarDays className="mx-auto size-6 text-slate-400" />
                  <p className="mt-3 text-sm font-semibold text-slate-950">
                    Aucun rendez-vous
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Cette journée est libre pour le moment.
                  </p>
                </div>
              )}
            </div>
          </Panel>

          <Panel>
            <div className="mb-5 border-b border-slate-200 pb-5">
              <p className="text-sm font-medium text-emerald-700">À venir</p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
                Prochains rendez-vous.
              </h2>
            </div>
            <div className="grid gap-3">
              {upcomingAppointments.length > 0 ? (
                upcomingAppointments.map((appointment) => (
                  <button
                    key={appointment.id}
                    type="button"
                    onClick={() => {
                      const date = new Date(appointment.beginAt);
                      setSelectedDate(startOfDay(date));
                      setCurrentMonth(startOfMonth(date));
                    }}
                    className="grid grid-cols-[auto_1fr] items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3 text-left transition hover:bg-slate-50"
                  >
                    <div className="flex size-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500">
                      <Clock className="size-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-950">
                        {appointment.patient?.name ?? "Patient"}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-slate-500">
                        {formatLongDate(appointment.beginAt)} ·{" "}
                        {formatTime(appointment.beginAt)}
                      </p>
                    </div>
                  </button>
                ))
              ) : (
                <p className="text-sm leading-6 text-slate-500">
                  Aucun rendez-vous à venir.
                </p>
              )}
            </div>
          </Panel>
        </aside>
      </section>
    </div>
  );
}

function AppointmentCard({ appointment }: { appointment: Appointment }) {
  return (
    <article className="rounded-[1.25rem] border border-slate-200 bg-white p-4 shadow-[0_18px_50px_-42px_rgba(15,23,42,0.5)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-950">
            {formatTime(appointment.beginAt)} - {formatTime(appointment.endAt)}
          </p>
          <h3 className="mt-2 truncate text-base font-semibold tracking-tight text-slate-950">
            {appointment.patient?.name ?? "Patient non renseigné"}
          </h3>
          <p className="mt-1 truncate text-sm text-slate-500">
            {appointment.patient?.owner?.name ?? "Propriétaire inconnu"}
          </p>
        </div>
        <StatusPill status={appointment.status} />
      </div>

      <div className="mt-4 grid gap-2 text-sm text-slate-600">
        <span className="flex items-center gap-2">
          <PawPrint className="size-3.5 text-slate-400" />
          {appointment.patient?.animal?.name ?? "Espèce inconnue"}
        </span>
        <span className="flex items-center gap-2">
          {appointment.atHome ? (
            <Home className="size-3.5 text-slate-400" />
          ) : (
            <MapPin className="size-3.5 text-slate-400" />
          )}
          {appointment.atHome ? "À domicile" : "Cabinet"}
        </span>
        {appointment.note ? (
          <p className="rounded-xl bg-slate-50 px-3 py-2 text-sm leading-6 text-slate-600">
            {appointment.note}
          </p>
        ) : null}
      </div>
    </article>
  );
}

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <section className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_24px_70px_-40px_rgba(15,23,42,0.5)] sm:p-6">
      {children}
    </section>
  );
}

function MetricCard({
  detail,
  icon: Icon,
  label,
  tone,
  value,
}: {
  detail: string;
  icon: typeof CalendarDays;
  label: string;
  tone: "emerald" | "sky" | "amber" | "slate";
  value: number | string;
}) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_24px_70px_-46px_rgba(15,23,42,0.5)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
            {value}
          </p>
          <p className="mt-2 text-xs font-medium text-slate-500">{detail}</p>
        </div>
        <div
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-xl border",
            tone === "emerald" &&
              "border-emerald-200 bg-emerald-50 text-emerald-800",
            tone === "sky" && "border-sky-200 bg-sky-50 text-sky-800",
            tone === "amber" && "border-amber-200 bg-amber-50 text-amber-800",
            tone === "slate" && "border-slate-200 bg-slate-50 text-slate-600",
          )}
        >
          <Icon className="size-5" />
        </div>
      </div>
    </div>
  );
}

function StatusPill({
  status,
}: {
  status: "CREATED" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
}) {
  const config = {
    CREATED: {
      label: "Créé",
      className: "border-slate-200 bg-slate-50 text-slate-600",
    },
    CONFIRMED: {
      label: "Confirmé",
      className: "border-sky-200 bg-sky-50 text-sky-800",
    },
    CANCELLED: {
      label: "Annulé",
      className: "border-red-200 bg-red-50 text-red-700",
    },
    COMPLETED: {
      label: "Terminé",
      className: "border-emerald-200 bg-emerald-50 text-emerald-800",
    },
  }[status];

  return (
    <span
      className={cn(
        "inline-flex h-7 shrink-0 items-center rounded-lg border px-2.5 text-xs font-semibold",
        config.className,
      )}
    >
      {config.label}
    </span>
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
