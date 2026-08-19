import {
  CalendarDays,
  Clock,
  Home,
  MapPin,
  NotepadText,
  PawPrint,
} from "lucide-react";
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
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { Switch } from "#/components/ui/switch";
import { Textarea } from "#/components/ui/textarea";

export type NewAppointmentDialogProps = {
  isSubmitting: boolean;
  open: boolean;
  patients: Array<{
    id: string;
    name: string | null;
    owner?: { name: string | null } | null;
    animal?: { name: string | null } | null;
  }>;
  selectedDate: Date;
  onCreateAppointment: (input: {
    atHome: boolean;
    beginAt: Date;
    endAt: Date;
    note?: string;
    patientId: string;
    withReport: boolean;
  }) => Promise<unknown> | unknown;
  onOpenChange: (open: boolean) => void;
};

export function NewAppointmentDialog({
  isSubmitting,
  onCreateAppointment,
  onOpenChange,
  open,
  patients,
  selectedDate,
}: NewAppointmentDialogProps) {
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const patientId = String(formData.get("patientId") ?? "");
    const date = String(formData.get("date") ?? "");
    const startTime = String(formData.get("startTime") ?? "");
    const endTime = String(formData.get("endTime") ?? "");
    const note = String(formData.get("note") ?? "").trim();

    if (!patientId || !date || !startTime || !endTime) {
      return;
    }

    await onCreateAppointment({
      atHome: formData.get("atHome") === "on",
      beginAt: buildLocalDate(date, startTime),
      endAt: buildLocalDate(date, endTime),
      note: note.length > 0 ? note : undefined,
      patientId,
      withReport: formData.get("withReport") === "on",
    });

    onOpenChange(false);
    event.currentTarget.reset();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <div className="mb-1 flex size-10 items-center justify-center rounded-xl border border-primary-border bg-primary-surface text-primary">
              <CalendarDays className="size-4" />
            </div>
            <DialogTitle className="text-xl font-semibold tracking-tight text-foreground">
              Créer un rendez-vous
            </DialogTitle>
            <DialogDescription>
              Planifiez une séance depuis l'agenda, avec le patient et les
              informations utiles au suivi.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-6 grid gap-5">
            <div className="grid gap-2">
              <Label htmlFor="appointment-patient">Patient</Label>
              <div className="relative">
                <PawPrint className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <select
                  id="appointment-patient"
                  name="patientId"
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background py-2 pl-9 pr-3 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
                  defaultValue=""
                >
                  <option value="" disabled>
                    Sélectionner un patient
                  </option>
                  {patients.map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {formatPatientOption(patient)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="grid gap-2">
                <Label htmlFor="appointment-date">Date</Label>
                <Input
                  id="appointment-date"
                  name="date"
                  required
                  type="date"
                  defaultValue={formatDateInput(selectedDate)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="appointment-start-time">Début</Label>
                <div className="relative">
                  <Clock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="appointment-start-time"
                    name="startTime"
                    required
                    type="time"
                    className="pl-9"
                    defaultValue="09:00"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="appointment-end-time">Fin</Label>
                <Input
                  id="appointment-end-time"
                  name="endTime"
                  required
                  type="time"
                  defaultValue="10:00"
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-muted px-4 py-3">
              <div className="min-w-0">
                <Label
                  htmlFor="appointment-at-home"
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
              <Switch id="appointment-at-home" name="atHome" />
            </div>

            <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-muted px-4 py-3">
              <div className="min-w-0">
                <Label
                  htmlFor="appointment-with-report"
                  className="flex items-center gap-2"
                >
                  <NotepadText className="size-4 text-muted-foreground" />
                  Préparer le compte rendu de cette séance
                </Label>
                <p className="mt-1 text-xs text-muted-foreground">
                  Il vous attendra sur ce rendez-vous après la séance.
                </p>
              </div>
              <Switch
                id="appointment-with-report"
                name="withReport"
                defaultChecked
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="appointment-note">Note</Label>
              <Textarea
                id="appointment-note"
                name="note"
                placeholder="Motif, consigne d'accès, contexte de séance..."
                className="min-h-24"
              />
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || patients.length === 0}
            >
              {isSubmitting ? "Création..." : "Créer le rendez-vous"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function formatPatientOption(
  patient: NewAppointmentDialogProps["patients"][number],
) {
  const segments = [
    patient.name ?? "Patient sans nom",
    patient.animal?.name,
    patient.owner?.name,
  ].filter(Boolean);

  return segments.join(" · ");
}

function formatDateInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function buildLocalDate(date: string, time: string) {
  const [year, month, day] = date.split("-").map(Number);
  const [hours, minutes] = time.split(":").map(Number);

  return new Date(year, month - 1, day, hours, minutes);
}
