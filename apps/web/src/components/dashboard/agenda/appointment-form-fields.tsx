import { Clock, Home, MapPin } from "lucide-react";

import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { Switch } from "#/components/ui/switch";

export type AppointmentFormFieldsProps = {
  /** Préfixe des `id`/`htmlFor` pour éviter toute collision entre dialogues. */
  idPrefix?: string;
  defaultDate: Date;
  /** Heure au format `HH:mm`. */
  defaultStartTime: string;
  /** Heure au format `HH:mm`. */
  defaultEndTime: string;
  defaultAtHome?: boolean;
};

/**
 * Les champs communs à la création et à la modification d'un rendez-vous :
 * date, horaires et lieu.
 *
 * Le patient, la note et la case « préparer le compte rendu » restent
 * propres à chaque dialogue — leur position varie d'un formulaire à l'autre,
 * ils ne sont pas mutualisés ici.
 */
export function AppointmentFormFields({
  idPrefix = "appointment",
  defaultDate,
  defaultStartTime,
  defaultEndTime,
  defaultAtHome = false,
}: AppointmentFormFieldsProps) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="grid gap-2">
          <Label htmlFor={`${idPrefix}-date`}>Date</Label>
          <Input
            id={`${idPrefix}-date`}
            name="date"
            required
            type="date"
            defaultValue={formatDateInput(defaultDate)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor={`${idPrefix}-start-time`}>Début</Label>
          <div className="relative">
            <Clock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id={`${idPrefix}-start-time`}
              name="startTime"
              required
              type="time"
              className="pl-9"
              defaultValue={defaultStartTime}
            />
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor={`${idPrefix}-end-time`}>Fin</Label>
          <Input
            id={`${idPrefix}-end-time`}
            name="endTime"
            required
            type="time"
            defaultValue={defaultEndTime}
          />
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-muted px-4 py-3">
        <div className="min-w-0">
          <Label
            htmlFor={`${idPrefix}-at-home`}
            className="flex items-center gap-2"
          >
            <Home className="size-4 text-muted-foreground" />
            Rendez-vous à domicile
          </Label>
          <p className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
            <MapPin className="size-3.5" />
            Désactivez pour une séance au cabinet.
          </p>
        </div>
        <Switch
          id={`${idPrefix}-at-home`}
          name="atHome"
          defaultChecked={defaultAtHome}
        />
      </div>
    </>
  );
}

export function formatDateInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function formatTimeInput(date: Date) {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${hours}:${minutes}`;
}

export function buildLocalDate(date: string, time: string) {
  const [year, month, day] = date.split("-").map(Number);
  const [hours, minutes] = time.split(":").map(Number);

  return new Date(year, month - 1, day, hours, minutes);
}
