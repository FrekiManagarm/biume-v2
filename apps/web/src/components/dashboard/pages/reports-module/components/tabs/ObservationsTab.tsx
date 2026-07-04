import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/style";
import {
  ActivityLogIcon,
  Component1Icon,
  EyeOpenIcon,
  FileTextIcon,
  Pencil1Icon,
  PlusIcon,
  TrashIcon,
} from "@radix-ui/react-icons";
import { anatomicalRegions } from "../../data/dog/typesDog";
import type { Observation } from "../../data/dog/typesDog";

interface ObservationsTabProps {
  observations: Observation[];
  onRemoveObservation: (id: string) => void;
  onOpenAddSheet: () => void;
  onEditObservation?: (id: string) => void;
}

const getSeverityConfig = (severity: number) => {
  const configs = {
    1: {
      color: "bg-emerald-500",
      textColor: "text-emerald-700",
      bgColor: "bg-emerald-50/80",
      borderColor: "border-emerald-200/80",
      label: "Légère",
    },
    2: {
      color: "bg-amber-500",
      textColor: "text-amber-700",
      bgColor: "bg-amber-50/80",
      borderColor: "border-amber-200/80",
      label: "Modérée",
    },
    3: {
      color: "bg-orange-500",
      textColor: "text-orange-700",
      bgColor: "bg-orange-50/80",
      borderColor: "border-orange-200/80",
      label: "Importante",
    },
    4: {
      color: "bg-red-500",
      textColor: "text-red-700",
      bgColor: "bg-red-50/80",
      borderColor: "border-red-200/80",
      label: "Sévère",
    },
    5: {
      color: "bg-rose-600",
      textColor: "text-rose-700",
      bgColor: "bg-rose-50/80",
      borderColor: "border-rose-200/80",
      label: "Critique",
    },
  };
  return configs[severity as keyof typeof configs] || configs[1];
};

const getObservationTypeConfig = (type: string) => {
  const configs = {
    static: {
      icon: EyeOpenIcon,
      label: "Observation statique",
      color: "text-sky-700",
      bg: "bg-sky-50/80",
      border: "border-sky-200/80",
    },
    dynamic: {
      icon: ActivityLogIcon,
      label: "Observation dynamique",
      color: "text-teal-700",
      bg: "bg-teal-50/80",
      border: "border-teal-200/80",
    },
    none: {
      icon: Component1Icon,
      label: "Diagnostic d'exclusion",
      color: "text-zinc-700",
      bg: "bg-zinc-100/80",
      border: "border-zinc-200",
    },
  };
  return configs[type as keyof typeof configs] || configs.static;
};

export function ObservationsTab({
  observations,
  onRemoveObservation,
  onOpenAddSheet,
  onEditObservation,
}: ObservationsTabProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-2">
        {observations.length > 0 ? (
          <div className="grid gap-3">
            {observations.map((obs, index) => {
              const severityConfig = getSeverityConfig(obs.severity);
              const typeConfig = getObservationTypeConfig(obs.type);
              const TypeIcon = typeConfig.icon;
              const regionLabel =
                anatomicalRegions.find((r) => r.value === obs.region)?.label ||
                obs.region;

              return (
                <Card
                  key={obs.id}
                  className={cn(
                    "group relative isolate overflow-hidden rounded-2xl border border-slate-200/70 bg-white [--card-spacing:0]",
                    "shadow-[0_18px_45px_-34px_rgba(15,23,42,0.45)] transition-[border-color,box-shadow,transform] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
                    "hover:-translate-y-0.5 hover:border-slate-300/90 hover:shadow-[0_24px_55px_-36px_rgba(15,23,42,0.58)] active:translate-y-0",
                  )}
                >
                  <div
                    className={cn(
                      "absolute inset-y-3 left-3 w-1 rounded-full",
                      severityConfig.color,
                    )}
                  />

                  <div className="grid gap-4 p-4 pl-6 sm:p-5 sm:pl-7">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="grid min-w-0 grid-cols-[2.5rem_minmax(0,1fr)] gap-3">
                        <div
                          className={cn(
                            "flex size-10 items-center justify-center rounded-xl border bg-slate-50 text-[0.72rem] font-semibold tabular-nums text-slate-700",
                            severityConfig.borderColor,
                          )}
                        >
                          {String(index + 1).padStart(2, "0")}
                        </div>

                        <div className="flex min-w-0 flex-col gap-2">
                          <h3 className="truncate text-base font-semibold tracking-tight text-slate-950 sm:text-lg">
                            {regionLabel}
                          </h3>
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge
                              variant="outline"
                              className={cn(
                                "h-6 gap-1.5 rounded-full border px-2.5 text-xs font-medium",
                                typeConfig.bg,
                                typeConfig.color,
                                typeConfig.border,
                              )}
                            >
                              <TypeIcon className="h-3 w-3" />
                              {typeConfig.label}
                            </Badge>

                            <Badge
                              variant="outline"
                              className={cn(
                                "h-6 gap-1.5 rounded-full border px-2.5 text-xs font-medium",
                                severityConfig.bgColor,
                                severityConfig.textColor,
                                severityConfig.borderColor,
                              )}
                            >
                              <div
                                className={cn(
                                  "size-1.5 rounded-full",
                                  severityConfig.color,
                                )}
                              />
                              {severityConfig.label}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 self-end rounded-xl border border-slate-200/70 bg-white/80 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] transition-opacity duration-200 sm:self-start sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
                        {onEditObservation && (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => onEditObservation(obs.id)}
                            aria-label={`Modifier l'observation ${regionLabel}`}
                            className="size-8 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-950 active:scale-[0.98]"
                          >
                            <Pencil1Icon className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => onRemoveObservation(obs.id)}
                          aria-label={`Supprimer l'observation ${regionLabel}`}
                          className="size-8 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-700 active:scale-[0.98]"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {obs.notes && (
                      <div className="rounded-xl border border-slate-200/70 bg-slate-50/70 p-3.5 sm:ml-[3.25rem]">
                        <p className="text-sm leading-relaxed text-slate-700">
                          {obs.notes}
                        </p>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3 text-xs text-slate-500 sm:ml-[3.25rem]">
                      {obs.dysfunctionType && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium uppercase tracking-[0.12em] text-slate-400">
                            Type
                          </span>
                          <Badge
                            variant="outline"
                            className="h-6 rounded-full border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700"
                          >
                            {obs.dysfunctionType === "confirmed"
                              ? "Confirmé"
                              : "Suspecté"}
                          </Badge>
                        </div>
                      )}
                      {obs.interventionZone && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium uppercase tracking-[0.12em] text-slate-400">
                            Zone
                          </span>
                          <Badge
                            variant="outline"
                            className="h-6 rounded-full border-slate-200 bg-white px-2.5 text-xs font-medium capitalize text-slate-700"
                          >
                            {obs.interventionZone}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center space-y-5 text-center">
            <div className="flex size-16 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-[0_18px_45px_-34px_rgba(15,23,42,0.5)]">
              <FileTextIcon className="h-7 w-7 text-slate-400" />
            </div>
            <div className="space-y-2">
              <h3 className="text-base font-semibold tracking-tight text-slate-950">
                Aucune observation
              </h3>
              <p className="max-w-md text-sm leading-relaxed text-slate-500">
                Commencez par ajouter vos premières observations cliniques pour
                ce patient.
              </p>
            </div>
            <Button
              onClick={onOpenAddSheet}
              variant="outline"
              className="gap-2 rounded-xl border-slate-200 bg-white text-slate-800 shadow-sm transition-all duration-200 hover:bg-slate-950 hover:text-white active:scale-[0.98]"
            >
              <PlusIcon className="h-4 w-4" />
              Ajouter une observation
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
