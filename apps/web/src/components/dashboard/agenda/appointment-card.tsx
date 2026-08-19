import { Home, MapPin, PawPrint } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "#/components/ui/button";
import { StatusPill, type Tone } from "#/components/dashboard/kit";
import type { DayAgendaAppointment } from "#/lib/dashboard/day-agenda";
import { sessionStateLabel } from "#/lib/dashboard/session-state";

type AppointmentCardProps = {
  appointment: DayAgendaAppointment;
  onPrimaryAction: (appointment: DayAgendaAppointment) => void;
  actions?: ReactNode;
};

// Le vert porte l'état atteint (une séance terminée), pas l'action qui
// pousse le praticien à agir : c'est le bouton, toujours violet via la
// variante par défaut de `Button`, qui porte ce rôle-là.
const sessionTone: Record<DayAgendaAppointment["sessionState"], Tone> = {
  scheduled: "neutral",
  done: "done",
  cancelled: "problem",
};

/**
 * Un rendez-vous et ce qu'il attend du praticien.
 *
 * L'état et l'action sont posés à même la carte, jamais derrière un clic : les
 * ostéopathes n'exploreront pas l'interface pour découvrir qu'un compte rendu
 * les attend. Un bouton n'apparaît que si `getAgendaPrimaryAction` a produit
 * une action réelle — une séance annulée ou à venir sans urgence n'en affiche
 * aucun, pour ne pas fabriquer un geste qui n'a pas lieu d'être.
 */
export function AppointmentCard({
  actions,
  appointment,
  onPrimaryAction,
}: AppointmentCardProps) {
  const { primaryAction } = appointment;
  const showPrimaryAction =
    primaryAction.kind !== "cancelled" && primaryAction.kind !== "upcoming";

  return (
    <article className="rounded-card border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted-foreground">
            {formatTime(appointment.beginAt)} – {formatTime(appointment.endAt)}
            <span className="ml-2">· {appointment.durationLabel}</span>
          </p>
          <h3 className="mt-1 truncate text-base font-semibold tracking-tight text-foreground">
            {appointment.patient?.name ?? "Animal non renseigné"}
          </h3>
          <p className="mt-0.5 truncate text-sm text-muted-foreground">
            {appointment.patient?.owner?.name ?? "Propriétaire inconnu"}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <StatusPill tone={sessionTone[appointment.sessionState]}>
            {sessionStateLabel(appointment.sessionState)}
          </StatusPill>
          {actions}
        </div>
      </div>

      <div className="mt-3 grid gap-1.5 text-sm text-ink-muted">
        <span className="flex items-center gap-2">
          <PawPrint className="size-3.5 text-muted-foreground" aria-hidden />
          {appointment.patient?.animal?.name ?? "Espèce non renseignée"}
        </span>
        <span className="flex items-center gap-2">
          {appointment.atHome ? (
            <Home className="size-3.5 text-muted-foreground" aria-hidden />
          ) : (
            <MapPin className="size-3.5 text-muted-foreground" aria-hidden />
          )}
          {appointment.atHome ? "À domicile" : "Au cabinet"}
        </span>
        {appointment.note ? (
          <p className="mt-1 rounded-lg bg-muted px-3 py-2 text-sm leading-6">
            {appointment.note}
          </p>
        ) : null}
      </div>

      {showPrimaryAction ? (
        <Button
          className="mt-4 w-full sm:w-auto"
          onClick={() => onPrimaryAction(appointment)}
        >
          {primaryAction.label}
        </Button>
      ) : primaryAction.kind === "upcoming" ? (
        // « Annulé » est déjà porté par la pastille d'état juste au-dessus :
        // répéter le libellé ici ferait doublon. « Séance à venir » n'y est
        // en revanche pas dit, donc ce texte reste la seule source pour ce cas.
        <p className="mt-4 text-sm text-muted-foreground">
          {primaryAction.label}
        </p>
      ) : null}
    </article>
  );
}

function formatTime(value: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}
