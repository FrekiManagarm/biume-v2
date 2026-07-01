import { Card } from "@/components/ui/card";
import { cn } from "@/lib/style";
import { UserIcon, ChevronRightIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Pet } from "@/lib/schemas";

interface PatientCardProps {
  patient: Pet;
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
      <Card
        className={cn(
          "flex flex-col p-0 transition-all duration-300 ease-in-out",
          isCollapsed ? "w-[72px]" : "w-full",
        )}
        data-state={isCollapsed ? "collapsed" : "expanded"}
      >
        <div className="p-4">
          {/* Header */}
          {!isCollapsed && (
            <div className="flex items-center gap-2 px-2 mb-2">
              <UserIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">
                Patient
              </span>
            </div>
          )}

          {/* Contenu de la carte patient */}
          {isCollapsed ? (
            <Tooltip>
              <TooltipTrigger
                render={
                  <button
                    onClick={onPatientClick}
                    className="w-full flex items-center justify-center"
                  >
                    <div className="w-10 h-10 bg-linear-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center shrink-0 hover:from-primary/30 hover:to-primary/20 transition-all group relative">
                      <span className="text-base font-semibold text-primary">
                        {patient.name.charAt(0).toUpperCase()}
                      </span>
                      <div className="absolute inset-0 rounded-lg ring-2 ring-transparent group-hover:ring-primary/30 transition-all" />
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
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-colors group"
            >
              <div className="w-9 h-9 bg-linear-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center shrink-0 group-hover:from-primary/30 group-hover:to-primary/20 transition-all">
                <span className="text-sm font-semibold text-primary">
                  {patient.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-medium text-foreground truncate">
                    {patient.name}
                  </h4>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-muted-foreground">
                    {patient.animal?.name || patient.type}
                  </span>
                  {patient.gender && (
                    <>
                      <span className="text-xs text-muted-foreground/50">
                        •
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {patient.gender}
                      </span>
                    </>
                  )}
                </div>
              </div>
              <ChevronRightIcon className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
            </button>
          )}
        </div>
      </Card>
    </TooltipProvider>
  );
}
