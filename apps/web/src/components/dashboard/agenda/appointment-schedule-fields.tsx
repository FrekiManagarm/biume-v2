import { Clock, Home, MapPin } from "lucide-react";

import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { Switch } from "#/components/ui/switch";

export type AppointmentScheduleFieldsProps = {
  /**
   * Préfixe des identifiants de champ. Chaque dialogue est démonté à sa
   * fermeture (Base UI ne garde pas le popup en vie), donc deux instances ne
   * coexistent jamais dans le DOM — un préfixe distinct par appelant reste
   * néanmoins la façon la plus sûre d'éviter toute collision d'id.
   */
  idPrefix: string;
  defaultDate: string;
  defaultStartTime: string;
  defaultEndTime: string;
  defaultAtHome: boolean;
};

/**
 * La grille date / heures / lieu, commune à la création et à la modification
 * d'un rendez-vous.
 *
 * Extraite ici plutôt que dupliquée entre `NewAppointmentDialog` et
 * `EditAppointmentDialog` : les deux dialogues partagent la même mise en
 * page et la même validation native (`required`, `type="date"`,
 * `type="time"`) — dupliquer ce bloc aurait fait diverger silencieusement les
 * deux formulaires au premier ajustement futur.
 */
export function AppointmentScheduleFields({
  defaultAtHome,
  defaultDate,
  defaultEndTime,
  defaultStartTime,
  idPrefix,
}: AppointmentScheduleFieldsProps) {
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
            defaultValue={defaultDate}
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
