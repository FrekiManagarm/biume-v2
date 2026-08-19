import {
  CheckCircle2,
  Clock,
  FileText,
  Home,
  MapPin,
  PawPrint,
  Send,
} from "lucide-react";

import { Button } from "#/components/ui/button";
import type {
  AgendaReportState,
  DayAgendaAppointment,
} from "#/lib/dashboard/day-agenda";
import { cn } from "#/lib/utils";

type DayAgendaCardProps = {
  appointment: DayAgendaAppointment;
};

const reportStatusConfig: Record<
  AgendaReportState,
  { label: string; className: string }
> = {
  absent: {
    label: "À préparer",
    className: "border-slate-200 bg-white text-slate-600",
  },
  empty: {
    label: "Brouillon vide",
    className: "border-blue-200 bg-blue-50 text-blue-800",
  },
  started: {
    label: "Brouillon",
    className: "border-amber-200 bg-amber-50 text-amber-800",
  },
  finalized: {
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

export function DayAgendaCard({ appointment }: DayAgendaCardProps) {
  const animalName = appointment.patient?.name ?? "Animal non renseigné";
  const species = appointment.patient?.animal?.name ?? "Espèce inconnue";
  const breed = appointment.patient?.breed;
  const ownerName = appointment.patient?.owner?.name ?? "Propriétaire inconnu";
  const reportStatus =
    appointment.status === "CANCELLED"
      ? cancelledStatusConfig
      : reportStatusConfig[appointment.reportState];

  return (
    <article
      className={cn(
        "grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_18px_50px_-44px_rgba(15,23,42,0.45)] md:grid-cols-[minmax(0,1fr)_auto]",
        appointment.reportState === "finalized" &&
          "border-emerald-200 bg-emerald-50/40",
      )}
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600">
            <Clock className="size-3.5" />
            {formatTime(appointment.beginAt)} - {formatTime(appointment.endAt)}
          </span>
          <span
            className={cn(
              "inline-flex rounded-lg border px-2.5 py-1 text-xs font-semibold",
              reportStatus.className,
            )}
          >
            {reportStatus.label}
          </span>
        </div>

        <h3 className="mt-3 truncate text-base font-semibold tracking-tight text-slate-950">
          {animalName}
        </h3>
        <p className="mt-1 truncate text-sm text-slate-600">{ownerName}</p>

        <div className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
          <span className="flex min-w-0 items-center gap-2">
            <PawPrint className="size-4 shrink-0 text-slate-400" />
            <span className="truncate">{breed ? `${species} · ${breed}` : species}</span>
          </span>
          <span className="flex min-w-0 items-center gap-2">
            {appointment.atHome ? (
              <Home className="size-4 shrink-0 text-slate-400" />
            ) : (
              <MapPin className="size-4 shrink-0 text-slate-400" />
            )}
            <span className="truncate">
              {appointment.atHome ? "À domicile" : "Cabinet"}
            </span>
          </span>
        </div>

        {appointment.note ? (
          <p className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-sm leading-6 text-slate-600">
            {appointment.note}
          </p>
        ) : null}
      </div>

      <div className="flex items-center justify-start md:justify-end">
        {appointment.primaryAction.kind === "cancelled" ? (
          <span className="text-sm font-medium text-slate-500">
            {appointment.primaryAction.label}
          </span>
        ) : (
          <Button className="h-10 w-full md:w-auto">
            {appointment.primaryAction.label}
            {appointment.primaryAction.kind === "send_report" ? (
              <Send className="size-4" data-icon="inline-end" />
            ) : appointment.primaryAction.kind === "view_report" ? (
              <CheckCircle2 className="size-4" data-icon="inline-end" />
            ) : (
              <FileText className="size-4" data-icon="inline-end" />
            )}
          </Button>
        )}
      </div>
    </article>
  );
}

function formatTime(value: Date | string) {
  return new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
