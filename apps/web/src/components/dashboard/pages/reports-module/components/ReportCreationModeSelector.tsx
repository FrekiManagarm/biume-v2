import { Button } from "@/components/ui/button";
import type { ReportCreationMode } from "./InitializationDialog.helpers";

export function ReportCreationModeSelector({
  mode,
  onModeChange,
}: {
  mode: ReportCreationMode;
  onModeChange: (mode: ReportCreationMode) => void;
}) {
  return (
    <div
      className="grid grid-cols-2 gap-2"
      role="group"
      aria-label="Mode de création"
    >
      <Button
        type="button"
        variant={mode === "existing" ? "secondary" : "outline"}
        aria-pressed={mode === "existing"}
        onClick={() => onModeChange("existing")}
      >
        Animal existant
      </Button>
      <Button
        type="button"
        variant={mode === "quick" ? "secondary" : "outline"}
        aria-pressed={mode === "quick"}
        onClick={() => onModeChange("quick")}
      >
        Nouveau dossier rapide
      </Button>
    </div>
  );
}
