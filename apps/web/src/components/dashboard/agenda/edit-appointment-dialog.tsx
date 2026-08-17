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
  AppointmentFormFields,
  buildLocalDate,
  formatTimeInput,
} from "./appointment-form-fields";

/**
 * Normalise la valeur soumise pour la note à partir du `FormData` brut.
 *
 * Renvoie toujours une chaîne — jamais `undefined` — même quand le champ est
 * vidé : `updateAppointment` fait un `.set({...values})` Drizzle qui ignore
 * silencieusement les clés `undefined` (`mapUpdateSet`), donc envoyer
 * `undefined` ici laisserait l'ancienne note intacte en base alors que
 * l'interface l'affiche comme effacée.
 */
export function resolveNoteForSubmit(
  rawNote: FormDataEntryValue | null,
): string {
  return String(rawNote ?? "").trim();
}

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
 * Reprend les champs communs de `NewAppointmentDialog` (date, horaires,
 * lieu, note) mais ni le patient ni la case du compte rendu ne s'y
 * modifient : le patient est fixé à la création, et le compte rendu se
 * pilote depuis sa propre action sur la carte.
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

    const formData = new FormData(event.currentTarget);
    const date = String(formData.get("date") ?? "");
    const startTime = String(formData.get("startTime") ?? "");
    const endTime = String(formData.get("endTime") ?? "");

    if (!date || !startTime || !endTime) {
      return;
    }

    await onSubmit({
      appointmentId: appointment.id,
      atHome: formData.get("atHome") === "on",
      beginAt: buildLocalDate(date, startTime),
      endAt: buildLocalDate(date, endTime),
      note: resolveNoteForSubmit(formData.get("note")),
    });

    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <div className="mb-1 flex size-10 items-center justify-center rounded-xl border border-primary-border bg-primary-surface text-primary">
              <Pencil className="size-4" />
            </div>
            <DialogTitle className="text-xl font-semibold tracking-tight text-foreground">
              Modifier le rendez-vous
            </DialogTitle>
            <DialogDescription>
              Ajustez la date, les horaires ou le lieu de cette séance.
            </DialogDescription>
          </DialogHeader>

          {appointment ? (
            <div className="mt-6 grid gap-5">
              <AppointmentFormFields
                idPrefix="edit-appointment"
                defaultDate={appointment.beginAt}
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
                  defaultValue={appointment.note ?? undefined}
                />
              </div>
            </div>
          ) : null}

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting || !appointment}>
              {isSubmitting ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
