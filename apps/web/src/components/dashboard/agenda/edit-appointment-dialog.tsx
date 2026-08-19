import { Pencil } from "lucide-react";
import type { FormEvent } from "react";

import { Button } from "#/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "#/components/ui/dialog";
import { Label } from "#/components/ui/label";
import { Textarea } from "#/components/ui/textarea";
import type { DayAgendaAppointment } from "#/lib/dashboard/day-agenda";
import {
  AppointmentScheduleFields,
  buildLocalDate,
  formatDateInput,
  formatTimeInput,
} from "./appointment-schedule-fields";

export type EditAppointmentDialogProps = {
  appointment: DayAgendaAppointment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: {
    appointmentId: string;
    beginAt: Date;
    endAt: Date;
    atHome: boolean;
    note?: string;
  }) => Promise<unknown>;
  isSubmitting: boolean;
};

/**
 * Modifier un rendez-vous existant.
 *
 * Reprend la structure de `NewAppointmentDialog` — mêmes champs date, début,
 * fin, à domicile, note, factorisés dans `AppointmentScheduleFields` — sans
 * le sélecteur d'animal (un rendez-vous ne change pas de patient depuis cet
 * écran) ni la case du compte rendu (elle ne concerne que la création).
 *
 * Le bouton qui referme le dialogue sans enregistrer s'appelle « Fermer », et
 * non « Annuler » : le menu d'actions du rendez-vous propose juste à côté un
 * geste nommé « Annuler la séance », qui change le statut du rendez-vous.
 * Les deux ne doivent jamais pouvoir être confondus par le praticien.
 */
export function EditAppointmentDialog({
  appointment,
  isSubmitting,
  onOpenChange,
  onSubmit,
  open,
}: EditAppointmentDialogProps) {
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!appointment) return;

    // Même précaution que `NewAppointmentDialog` : `event.currentTarget` est
    // vidé par React dès la fin du traitement synchrone, on garde donc une
    // référence directe au formulaire pour lire ses valeurs après l'`await`.
    const form = event.currentTarget;
    const formData = new FormData(form);
    const date = String(formData.get("date") ?? "");
    const startTime = String(formData.get("startTime") ?? "");
    const endTime = String(formData.get("endTime") ?? "");
    const note = String(formData.get("note") ?? "").trim();

    if (!date || !startTime || !endTime) return;

    await onSubmit({
      appointmentId: appointment.id,
      atHome: formData.get("atHome") === "on",
      beginAt: buildLocalDate(date, startTime),
      endAt: buildLocalDate(date, endTime),
      note: note.length > 0 ? note : undefined,
    });

    onOpenChange(false);
  }

  const animalName = appointment?.patient?.name;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-2xl">
        {appointment ? (
          // Une `key` sur le formulaire force son remontage si l'appelant
          // changeait de rendez-vous sans fermer le dialogue entre-temps : les
          // champs, en `defaultValue` non contrôlé, ne se resynchroniseraient
          // pas sinon avec les valeurs du nouveau rendez-vous.
          <form key={appointment.id} onSubmit={handleSubmit}>
            <DialogHeader>
              <div className="mb-1 flex size-10 items-center justify-center rounded-xl border border-primary-border bg-primary-surface text-primary">
                <Pencil className="size-4" />
              </div>
              <DialogTitle className="text-xl font-semibold tracking-tight text-foreground">
                Modifier le rendez-vous
              </DialogTitle>
              <DialogDescription>
                {animalName
                  ? `Ajustez les informations de la séance de ${animalName}.`
                  : "Ajustez les informations de cette séance."}
              </DialogDescription>
            </DialogHeader>

            <div className="mt-6 grid gap-5">
              <AppointmentScheduleFields
                idPrefix="edit-appointment"
                defaultDate={formatDateInput(appointment.beginAt)}
                defaultStartTime={formatTimeInput(appointment.beginAt)}
                defaultEndTime={formatTimeInput(appointment.endAt)}
                defaultAtHome={appointment.atHome ?? false}
              />

              <div className="grid gap-2">
                <Label htmlFor="edit-appointment-note">Note</Label>
                <Textarea
                  id="edit-appointment-note"
                  name="note"
                  placeholder="Motif, consigne d'accès, contexte de séance..."
                  className="min-h-24"
                  defaultValue={appointment.note ?? ""}
                />
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Fermer
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </DialogFooter>
          </form>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
