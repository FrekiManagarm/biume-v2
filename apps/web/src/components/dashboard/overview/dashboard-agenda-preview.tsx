import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CalendarDays,
  Clock,
  Home,
  MapPin,
  PawPrint,
} from "lucide-react";

import { Button } from "#/components/ui/button";
import type {
  AgendaReportState,
  DayAgendaAppointment,
} from "#/lib/dashboard/day-agenda";
import { cn } from "#/lib/utils";

type DashboardAgendaPreviewProps = {
  appointments: DayAgendaAppointment[];
  emptyLabel: string;
};

const reportStatusConfig: Record<
  AgendaReportState,
  { label: string; indicatorClassName: string; labelClassName: string }
> = {
  absent: {
    label: "À préparer",
    indicatorClassName: "bg-slate-400",
    labelClassName: "text-slate-500",
  },
  empty: {
    label: "Compte rendu à créer",
    indicatorClassName: "bg-sky-500",
    labelClassName: "text-sky-700",
  },
  started: {
    label: "Compte rendu à terminer",
    indicatorClassName: "bg-amber-500",
    labelClassName: "text-amber-700",
  },
  finalized: {
    label: "Prêt à envoyer",
    indicatorClassName: "bg-emerald-500",
    labelClassName: "text-emerald-700",
  },
  sent: {
    label: "Envoyé",
    indicatorClassName: "bg-slate-300",
    labelClassName: "text-slate-500",
  },
};

const cancelledStatusConfig = {
  label: "Annulé",
  indicatorClassName: "bg-rose-400",
  labelClassName: "text-rose-700",
};

export function DashboardAgendaPreview({
  appointments,
  emptyLabel,
}: DashboardAgendaPreviewProps) {
  const visibleAppointments = appointments.slice(0, 6);

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_50px_-46px_rgba(15,23,42,0.45)]">
      <div className="grid gap-3 px-4 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start sm:px-5">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-950">
            <CalendarDays className="size-4 text-emerald-700" />
            <h2>Agenda du jour</h2>
          </div>
          <p className="mt-1 text-sm leading-5 text-slate-600">
            Les prochaines séances et l'action utile pour chacune.
          </p>
        </div>
        <Button
          asChild
          variant="outline"
          size="sm"
          className="w-full sm:w-auto"
        >
          <Link to="/dashboard/agenda">
            Ouvrir l'agenda
            <ArrowRight className="size-4" data-icon="inline-end" />
          </Link>
        </Button>
      </div>

      {visibleAppointments.length > 0 ? (
        <ul
          aria-label="Séances du jour"
          className="divide-y divide-slate-100 border-t border-slate-100"
        >
          {visibleAppointments.map((appointment) => (
            <AgendaPreviewRow key={appointment.id} appointment={appointment} />
          ))}
        </ul>
      ) : (
        <p className="m-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
          {emptyLabel}
        </p>
      )}
    </section>
  );
}

function AgendaPreviewRow({
  appointment,
}: {
  appointment: DayAgendaAppointment;
}) {
  const animalName = appointment.patient?.name ?? "Animal non renseigné";
  const ownerName = appointment.patient?.owner?.name ?? "Propriétaire inconnu";
  const species = appointment.patient?.animal?.name ?? "Espèce inconnue";
  const breed = appointment.patient?.breed;
  const locationLabel = appointment.atHome ? "À domicile" : "Lieu fixe";
  const status =
    appointment.status === "CANCELLED"
      ? cancelledStatusConfig
      : reportStatusConfig[appointment.reportState];

  return (
    <li className="group relative grid gap-x-4 gap-y-3 px-4 py-4 transition-colors duration-200 hover:bg-slate-50/80 sm:grid-cols-[4.75rem_minmax(0,1fr)_auto] sm:items-center sm:px-5">
      <span
        aria-hidden="true"
        className={cn(
          "absolute inset-y-0 left-0 w-1 rounded-r-full",
          status.indicatorClassName,
        )}
      />

      <div className="flex items-center gap-2 sm:block">
        <Clock className="size-3.5 text-slate-400 sm:mb-1" />
        <time
          dateTime={new Date(appointment.beginAt).toISOString()}
          className="whitespace-nowrap text-base font-semibold tracking-tight tabular-nums text-slate-950"
        >
          {formatTime(appointment.beginAt)}
        </time>
      </div>

      <div className="min-w-0">
        <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <p className="truncate text-sm font-semibold text-slate-950">
            {animalName}
          </p>
          <p className="truncate text-sm text-slate-500">{ownerName}</p>
        </div>
        <p className="mt-1 flex min-w-0 items-center gap-1.5 truncate text-xs text-slate-500">
          <PawPrint className="size-3.5 shrink-0 text-slate-400" />
          <span className="truncate">
            {breed ? `${species} · ${breed}` : species}
          </span>
          <span aria-hidden="true" className="text-slate-300">
            ·
          </span>
          <Clock className="size-3.5 shrink-0 text-slate-400" />
          <span className="truncate">{appointment.durationLabel}</span>
          <span aria-hidden="true" className="text-slate-300">
            ·
          </span>
          {appointment.atHome ? (
            <Home className="size-3.5 shrink-0 text-slate-400" />
          ) : (
            <MapPin className="size-3.5 shrink-0 text-slate-400" />
          )}
          <span className="truncate">{locationLabel}</span>
        </p>
        {appointment.note ? (
          <p className="mt-1 truncate text-xs text-slate-400">
            {appointment.note}
          </p>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 sm:justify-end">
        <span className={cn("text-xs font-medium", status.labelClassName)}>
          {status.label}
        </span>
        <AgendaAction appointment={appointment} />
      </div>
    </li>
  );
}

function AgendaAction({ appointment }: { appointment: DayAgendaAppointment }) {
  const reportId = appointment.primaryAction.reportId;
  if (appointment.primaryAction.kind === "cancelled") {
    return (
      <span className="text-sm font-medium text-slate-500 md:text-right">
        {appointment.primaryAction.label}
      </span>
    );
  }

  const shouldEditReport =
    reportId &&
    (appointment.primaryAction.kind === "create_report" ||
      appointment.primaryAction.kind === "fill_report" ||
      appointment.primaryAction.kind === "continue_report" ||
      appointment.primaryAction.kind === "send_report");

  if (shouldEditReport) {
    return (
      <Button asChild size="sm" variant="outline" className="w-full md:w-auto">
        <Link to="/dashboard/reports/$id/edit" params={{ id: reportId }}>
          {appointment.primaryAction.label}
        </Link>
      </Button>
    );
  }

  if (reportId && appointment.primaryAction.kind === "view_report") {
    return (
      <Button asChild size="sm" variant="outline" className="w-full md:w-auto">
        <Link to="/dashboard/reports/$id" params={{ id: reportId }}>
          {appointment.primaryAction.label}
        </Link>
      </Button>
    );
  }

  return (
    <span className="text-sm font-medium text-slate-500 md:text-right">
      {appointment.primaryAction.label}
    </span>
  );
}

function formatTime(value: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}
