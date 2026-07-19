import { cn } from "@/lib/style";
import { ChevronRightIcon, PawPrintIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
type PatientCardPatient = {
  name: string;
  type?: string | null;
  gender?: "Male" | "Female" | null;
  animal?: { name?: string | null } | null;
};

interface PatientCardProps {
  patient: PatientCardPatient;
  onPatientClick: () => void;
  isCollapsed?: boolean;
}

export function PatientCard({
  patient,
  onPatientClick,
  isCollapsed = false,
}: PatientCardProps) {
  return (
    <TooltipProvider>
      <section
        className={cn(
          "flex flex-col rounded-2xl border border-border bg-card p-3 text-card-foreground shadow-sm shadow-foreground/5 transition-all duration-200 ease-out",
          isCollapsed ? "w-18 p-2" : "w-full",
        )}
        data-state={isCollapsed ? "collapsed" : "expanded"}
      >
        <div>
          {/* Header */}
          {!isCollapsed && (
            <div className="mb-3 flex items-center justify-between px-1">
              <span className="text-xs font-medium text-muted-foreground">
                Patient
              </span>
              <PawPrintIcon className="h-4 w-4 text-muted-foreground" />
            </div>
          )}

          {/* Contenu de la carte patient */}
          {isCollapsed ? (
            <Tooltip>
              <TooltipTrigger
                render={
                  <button
                    onClick={onPatientClick}
                    className="flex w-full items-center justify-center"
                  >
                    <div className="group relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors hover:bg-primary/15">
                      <span className="text-base font-semibold">
                        {patient.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </button>
                }
              />
              <TooltipContent
                side="right"
                className="flex flex-col gap-1.5 p-3"
              >
                <div className="flex flex-col gap-0.5">
                  <p className="font-semibold text-sm leading-tight">
                    {patient.name}
                  </p>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span>{patient.animal?.name || patient.type}</span>
                    {patient.gender && (
                      <>
                        <span className="text-muted-foreground/50">•</span>
                        <span>{patient.gender}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="h-px bg-border/50 my-0.5" />
                <p className="text-xs text-muted-foreground/80 italic">
                  Cliquer pour voir le dossier
                </p>
              </TooltipContent>
            </Tooltip>
          ) : (
            <button
              onClick={onPatientClick}
              className="group flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors hover:bg-muted active:scale-[0.99]"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                <span className="text-sm font-semibold">
                  {patient.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="min-w-0 flex-1 text-left">
                <div className="flex items-center gap-2">
                  <h4 className="truncate text-sm font-semibold text-foreground">
                    {patient.name}
                  </h4>
                </div>
                <div className="mt-0.5 flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {patient.animal?.name || patient.type}
                  </span>
                  {patient.gender && (
                    <>
                      <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
                      <span className="text-xs text-muted-foreground">
                        {patient.gender}
                      </span>
                    </>
                  )}
                </div>
              </div>
              <ChevronRightIcon className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
            </button>
          )}
        </div>
      </section>
    </TooltipProvider>
  );
}
