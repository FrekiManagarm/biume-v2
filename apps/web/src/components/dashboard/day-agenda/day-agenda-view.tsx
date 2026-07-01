import { CalendarDays, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "#/components/ui/button";
import {
  buildDayAgendaModel,
  type AgendaAppointmentInput,
} from "#/lib/dashboard/day-agenda";
import { cn } from "#/lib/utils";
import { DayAgendaCard } from "./day-agenda-card";
import { DayAgendaTodo } from "./day-agenda-todo";

type DayAgendaViewProps = {
  appointments: AgendaAppointmentInput[];
  selectedDate: Date;
  onDateChange: (date: Date) => void;
};

export function DayAgendaView({
  appointments,
  onDateChange,
  selectedDate,
}: DayAgendaViewProps) {
  const [mobileTab, setMobileTab] = useState<"agenda" | "todo">("agenda");
  const model = useMemo(
    () =>
      buildDayAgendaModel({
        appointments,
        now: new Date(),
        selectedDate,
      }),
    [appointments, selectedDate],
  );
  const weekDays = useMemo(() => buildWeekDays(selectedDate), [selectedDate]);

  return (
    <div className="grid w-full gap-5 pb-8 text-slate-950">
      <header className="grid gap-5 border-b border-slate-200 pb-6 pt-2 lg:grid-cols-[1fr_auto] lg:items-end">
        <div className="min-w-0">
          <div className="mb-4 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.45)]">
            <CalendarDays className="size-3.5 text-emerald-700" />
            Agenda du jour
          </div>
          <h1 className="text-3xl font-semibold leading-none tracking-tight text-slate-950 md:text-5xl">
            {formatLongDate(selectedDate)}.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600 md:text-base">
            {model.summary.appointmentCount} séance
            {model.summary.appointmentCount > 1 ? "s" : ""} ·{" "}
            {model.summary.beforeSessionCount} préparation
            {model.summary.beforeSessionCount > 1 ? "s" : ""} ·{" "}
            {model.summary.afterSessionCount} compte rendu
            {model.summary.afterSessionCount > 1 ? "s" : ""} à traiter
          </p>
        </div>

        <div className="flex flex-wrap gap-2 lg:justify-end">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => onDateChange(addDays(selectedDate, -1))}
          >
            <ChevronLeft className="size-4" />
            <span className="sr-only">Jour précédent</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => onDateChange(startOfDay(new Date()))}
          >
            Aujourd'hui
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => onDateChange(addDays(selectedDate, 1))}
          >
            <ChevronRight className="size-4" />
            <span className="sr-only">Jour suivant</span>
          </Button>
          <Button type="button" variant="outline">
            Semaine
          </Button>
          <Button type="button">
            Nouveau rendez-vous
            <Plus className="size-4" data-icon="inline-end" />
          </Button>
        </div>
      </header>

      <section className="grid grid-cols-7 gap-2">
        {weekDays.map((day) => {
          const isSelected = isSameDay(day, selectedDate);
          return (
            <button
              key={day.toISOString()}
              type="button"
              onClick={() => onDateChange(day)}
              className={cn(
                "rounded-xl border border-slate-200 bg-white px-2 py-3 text-center text-sm font-semibold text-slate-600 transition hover:bg-slate-50",
                isSelected && "border-emerald-300 bg-emerald-50 text-emerald-900",
              )}
            >
              <span className="block text-xs font-medium uppercase text-slate-500">
                {formatWeekday(day)}
              </span>
              <span className="mt-1 block text-lg text-slate-950">
                {day.getDate()}
              </span>
            </button>
          );
        })}
      </section>

      <div className="grid grid-cols-2 gap-2 rounded-xl border border-slate-200 bg-white p-1 md:hidden">
        <button
          type="button"
          onClick={() => setMobileTab("agenda")}
          className={cn(
            "rounded-lg px-3 py-2 text-sm font-semibold text-slate-600",
            mobileTab === "agenda" && "bg-slate-950 text-white",
          )}
        >
          Agenda
        </button>
        <button
          type="button"
          onClick={() => setMobileTab("todo")}
          className={cn(
            "rounded-lg px-3 py-2 text-sm font-semibold text-slate-600",
            mobileTab === "todo" && "bg-slate-950 text-white",
          )}
        >
          À faire
        </button>
      </div>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <div className={cn("grid gap-3", mobileTab !== "agenda" && "hidden md:grid")}>
          {model.appointments.length > 0 ? (
            model.appointments.map((appointment) => (
              <DayAgendaCard key={appointment.id} appointment={appointment} />
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
              <CalendarDays className="mx-auto size-7 text-slate-400" />
              <h2 className="mt-4 text-base font-semibold text-slate-950">
                Aucun rendez-vous ce jour
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
                Les séances planifiées apparaîtront ici avec leurs actions de
                préparation et de compte rendu.
              </p>
            </div>
          )}
        </div>

        <div className={cn(mobileTab !== "todo" && "hidden md:block")}>
          <DayAgendaTodo todo={model.todo} />
        </div>
      </section>
    </div>
  );
}

function buildWeekDays(date: Date) {
  const start = addDays(startOfDay(date), -((date.getDay() + 6) % 7));
  return Array.from({ length: 7 }, (_, index) => addDays(start, index));
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return startOfDay(next);
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatLongDate(date: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  }).format(date);
}

function formatWeekday(date: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "short",
  }).format(date);
}
