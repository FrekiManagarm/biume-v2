import type { ReportSectionState } from "@biume/contracts/report";
import { CheckIcon, CircleSlash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SectionDecisionControl({
  state,
  onChange,
}: {
  state: ReportSectionState;
  onChange: (state: "confirmed" | "not_applicable") => void;
}) {
  return (
    <div
      className="flex flex-wrap items-center gap-2"
      role="group"
      aria-label="Décision de section"
    >
      <Button
        type="button"
        size="sm"
        variant={state === "confirmed" ? "default" : "outline"}
        aria-pressed={state === "confirmed"}
        onClick={() => onChange("confirmed")}
      >
        <CheckIcon className="size-4" />
        Confirmer la section
      </Button>
      <Button
        type="button"
        size="sm"
        variant={state === "not_applicable" ? "secondary" : "ghost"}
        aria-pressed={state === "not_applicable"}
        onClick={() => onChange("not_applicable")}
      >
        <CircleSlash2Icon className="size-4" />
        Marquer non applicable
      </Button>
    </div>
  );
}
