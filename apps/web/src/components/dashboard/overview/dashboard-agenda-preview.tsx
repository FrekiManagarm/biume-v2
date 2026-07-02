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
  AgendaReportStatus,
  DayAgendaAppointment,
} from "#/lib/dashboard/day-agenda";
import { cn } from "#/lib/utils";

type DashboardAgendaPreviewProps = {
  appointments: DayAgendaAppointment[];
  emptyLabel: string;
};

const reportStatusConfig: Record<
  AgendaReportStatus,
  { label: string; className: string }
> = {
  none: {
    label: "À préparer",
    className: "border-slate-200 bg-slate-50 text-slate-600",
  },
  to_create: {
    label: "Compte rendu à créer",
    className: "border-blue-200 bg-blue-50 text-blue-800",
  },
  draft: {
    label: "Brouillon",
    className: "border-amber-200 bg-amber-50 text-amber-800",
  },
  ready_to_send: {
    label: "Prêt à envoyer",
    className: "border-emerald-200 bg-emerald-50 text-emerald-800",
  },
  sent: {
    label: "Envoyé",
    className: "border-slate-200 bg-slate-50 text-slate-600",
  },
};

const cancelledStatusConfig = {
  label: "Annulée",
  className: "border-rose-200 bg-rose-50 text-rose-700",
};

export function DashboardAgendaPreview({
  appointments,
  emptyLabel,
}: DashboardAgendaPreviewProps) {
  const visibleAppointments = appointments.slice(0, 6);

  return (
    <section className="grid gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-[0_18px_50px_-46px_rgba(15,23,42,0.45)]">
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
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
        <div className="grid gap-2">
          {visibleAppointments.map((appointment) => (
            <AgendaPreviewRow key={appointment.id} appointment={appointment} />
          ))}
        </div>
      ) : (
        <p className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
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
      : reportStatusConfig[appointment.reportStatus];

  return (
    <article className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50/60 px-3 py-3 md:grid-cols-[5.5rem_minmax(0,1fr)_minmax(8rem,auto)_auto] md:items-center">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-950 md:block">
        <Clock className="size-4 text-slate-400 md:mb-1" />
        <span className="whitespace-nowrap">
          {formatTime(appointment.beginAt)}
        </span>
      </div>

      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-slate-950">
          {animalName}
        </p>
        <p className="mt-1 truncate text-xs text-slate-500">{ownerName}</p>
        <div className="mt-2 grid gap-1 text-xs text-slate-500 sm:grid-cols-2">
          <span className="flex min-w-0 items-center gap-1.5">
            <PawPrint className="size-3.5 shrink-0 text-slate-400" />
            <span className="truncate">
              {breed ? `${species} · ${breed}` : species}
            </span>
          </span>
          <span className="flex min-w-0 items-center gap-1.5">
            <Clock className="size-3.5 shrink-0 text-slate-400" />
            <span className="truncate">{appointment.durationLabel}</span>
          </span>
          <span className="flex min-w-0 items-center gap-1.5">
            {appointment.atHome ? (
              <Home className="size-3.5 shrink-0 text-slate-400" />
            ) : (
              <MapPin className="size-3.5 shrink-0 text-slate-400" />
            )}
            <span className="truncate">{locationLabel}</span>
          </span>
          {appointment.note ? (
            <span className="truncate">{appointment.note}</span>
          ) : null}
        </div>
      </div>

      <span
        className={cn(
          "inline-flex w-fit rounded-md border px-2 py-1 text-xs font-semibold",
          status.className,
        )}
      >
        {status.label}
      </span>

      <AgendaAction appointment={appointment} />
    </article>
  );
}

function AgendaAction({
  appointment,
}: {
  appointment: DayAgendaAppointment;
}) {
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
    (appointment.primaryAction.kind === "finalize_report" ||
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
