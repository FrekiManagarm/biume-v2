
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { BellIcon } from "lucide-react";
import {
  Credenza,
  CredenzaContent,
  CredenzaHeader,
  CredenzaTitle,
  CredenzaBody,
  CredenzaFooter,
} from "@/components/ui/credenza";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { scheduleReportReminder } from "@/lib/api/actions/report-reminder.action";

interface ReportReminderDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  reportId: string;
  onFinalize: () => Promise<void>;
  isFinalizing?: boolean;
}

export function ReportReminderDialog({
  isOpen,
  onOpenChange,
  reportId,
  onFinalize,
  isFinalizing = false,
}: ReportReminderDialogProps) {
  const [reminderDate, setReminderDate] = useState<Date | undefined>(undefined);
  const [reminderTime, setReminderTime] = useState("");
  const [reminderMessage, setReminderMessage] = useState("");

  // Initialiser avec une date par défaut quand le dialog s'ouvre
  useEffect(() => {
    if (isOpen && !reminderDate) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(9, 0, 0, 0);
      setReminderDate(tomorrow);
      setReminderTime("09:00");
    }
  }, [isOpen, reminderDate]);

  const handleClose = () => {
    setReminderDate(undefined);
    setReminderTime("");
    setReminderMessage("");
    onOpenChange(false);
  };

  const handleFinalizeWithoutReminder = async () => {
    try {
      await onFinalize();
      toast.success("Rapport finalisé avec succès");
      handleClose();
    } catch (error) {
      console.error("Erreur lors de la finalisation:", error);
      toast.error("Erreur lors de la finalisation du rapport");
    }
  };

  const handleScheduleReminder = async () => {
    if (!reminderDate) {
      toast.error("Veuillez sélectionner une date pour le rappel");
      return;
    }

    // Combiner date et heure
    const [hours, minutes] = reminderTime.split(":").map(Number);
    const reminderDateTime = new Date(reminderDate);
    reminderDateTime.setHours(hours || 9, minutes || 0, 0, 0);

    // Vérifier que la date est dans le futur
    if (reminderDateTime <= new Date()) {
      toast.error("La date du rappel doit être dans le futur");
      return;
    }

    try {
      // Programmer le rappel
      const reminderResult = await scheduleReportReminder({
        reportId,
        reminderDate: reminderDateTime.toISOString(),
        reminderMessage: reminderMessage.trim() || undefined,
      });

      if (reminderResult.success) {
        toast.success("Rappel programmé avec succès");
        handleClose();
      } else {
        toast.error(
          reminderResult.error || "Erreur lors de la programmation du rappel",
        );
      }
    } catch (error) {
      console.error("Erreur lors de la programmation du rappel:", error);
      toast.error("Erreur lors de la programmation du rappel");
    }
  };

  const handleFinalizeWithReminder = async () => {
    if (!reminderDate) {
      toast.error("Veuillez sélectionner une date pour le rappel");
      return;
    }

    // Combiner date et heure
    const [hours, minutes] = reminderTime.split(":").map(Number);
    const reminderDateTime = new Date(reminderDate);
    reminderDateTime.setHours(hours || 9, minutes || 0, 0, 0);

    // Vérifier que la date est dans le futur
    if (reminderDateTime <= new Date()) {
      toast.error("La date du rappel doit être dans le futur");
      return;
    }

    try {
      // Finaliser le rapport
      await onFinalize();

      // Programmer le rappel
      const reminderResult = await scheduleReportReminder({
        reportId,
        reminderDate: reminderDateTime.toISOString(),
        reminderMessage: reminderMessage.trim() || undefined,
      });

      if (reminderResult.success) {
        toast.success("Rapport finalisé et rappel programmé avec succès");
        handleClose();
      } else {
        toast.error(
          reminderResult.error || "Erreur lors de la programmation du rappel",
        );
      }
    } catch (error) {
      console.error("Erreur lors de la finalisation:", error);
      toast.error("Erreur lors de la finalisation du rapport");
    }
  };

  return (
    <Credenza open={isOpen} onOpenChange={onOpenChange}>
      <CredenzaContent className="sm:max-w-[500px]">
        <CredenzaHeader>
          <CredenzaTitle className="flex items-center gap-2">
            <BellIcon className="h-5 w-5" />
            Programmer un rappel pour le client
          </CredenzaTitle>
        </CredenzaHeader>
        <CredenzaBody className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Configurez un rappel qui sera envoyé au client pour lui rappeler
              de reprendre rendez-vous. Le client recevra un email à la date et
              l&apos;heure choisies.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reminder-date">Date du rappel</Label>

              {/* Presets de dates */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                {[
                  { label: "1 semaine", days: 7 },
                  { label: "2 semaines", days: 14 },
                  { label: "3 semaines", days: 21 },
                  { label: "1 mois", days: 30 },
                  { label: "6 semaines", days: 42 },
                  { label: "2 mois", days: 60 },
                  { label: "3 mois", days: 90 },
                  { label: "6 mois", days: 180 },
                ].map((preset) => {
                  const presetDate = new Date();
                  presetDate.setDate(presetDate.getDate() + preset.days);
                  presetDate.setHours(9, 0, 0, 0);
                  const isSelected =
                    reminderDate &&
                    reminderDate.toDateString() === presetDate.toDateString();

                  return (
                    <Button
                      key={preset.label}
                      type="button"
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      className="text-xs"
                      onClick={() => {
                        setReminderDate(presetDate);
                        setReminderTime("09:00");
                      }}
                    >
                      {preset.label}
                    </Button>
                  );
                })}
              </div>

              <DatePicker
                label=""
                date={reminderDate}
                onSelect={(date) => {
                  setReminderDate(date);
                  if (date && !reminderTime) {
                    setReminderTime("09:00");
                  }
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reminder-time">Heure du rappel</Label>
              <Input
                id="reminder-time"
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reminder-message">
                Message pour le client (optionnel)
              </Label>
              <Textarea
                id="reminder-message"
                placeholder="Ajoutez un message personnalisé pour le client..."
                value={reminderMessage}
                onChange={(e) => setReminderMessage(e.target.value)}
                rows={3}
              />
            </div>
          </div>
        </CredenzaBody>
        <CredenzaFooter>
          <div className="flex items-center gap-2 w-full sm:w-auto sm:justify-end">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1 sm:flex-initial"
            >
              Annuler
            </Button>
            <Button
              variant="outline"
              onClick={handleFinalizeWithoutReminder}
              disabled={isFinalizing}
              className="flex-1 sm:flex-initial"
            >
              {isFinalizing ? "Finalisation..." : "Finaliser sans rappel"}
            </Button>
            <Button
              onClick={handleScheduleReminder}
              disabled={
                !reminderDate ||
                !reminderTime
              }
              className="flex-1 sm:flex-initial"
            >
              Programmer un rappel
            </Button>
          </div>
        </CredenzaFooter>
      </CredenzaContent>
    </Credenza>
  );
}

