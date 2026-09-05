import { CalendarClockIcon, CheckIcon, EyeIcon, SaveIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type ReportWorkspaceHeaderProps = {
  title: string;
  onTitleChange: (title: string) => void;
  patientSummary: ReactNode;
  appointment?: { beginAt: Date; endAt: Date };
  onPreview: () => void;
  onSave: () => void;
  onFinalize: () => void;
  isSaving: boolean;
};

function formatAppointment({
  beginAt,
  endAt,
}: NonNullable<ReportWorkspaceHeaderProps["appointment"]>) {
  const date = new Intl.DateTimeFormat("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(beginAt);
  const time = new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${date} · ${time.format(beginAt)}–${time.format(endAt)}`;
}

export function ReportWorkspaceHeader({
  title,
  onTitleChange,
  patientSummary,
  appointment,
  onPreview,
  onSave,
  onFinalize,
  isSaving,
}: ReportWorkspaceHeaderProps) {
  return (
    <header className="border-b border-border bg-background px-5 py-4">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center">
        <div className="min-w-0 space-y-2">
          <Input
            aria-label="Titre du rapport"
            value={title}
            onChange={(event) => onTitleChange(event.target.value)}
            className="h-auto border-0 bg-transparent px-0 text-xl font-semibold shadow-none focus-visible:ring-2 focus-visible:ring-primary"
          />
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span className="truncate font-medium">{patientSummary}</span>
            {appointment ? (
              <span className="flex items-center gap-1.5">
                <CalendarClockIcon className="size-4" />
                {formatAppointment(appointment)}
              </span>
            ) : null}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={onPreview}>
            <EyeIcon className="size-4" />
            Aperçu
          </Button>
          <Button variant="outline" onClick={onSave} disabled={isSaving}>
            <SaveIcon className="size-4" />
            Sauvegarder
          </Button>
          <Button onClick={onFinalize} disabled={isSaving}>
            <CheckIcon className="size-4" />
            Finaliser
          </Button>
        </div>
      </div>
    </header>
  );
}
