
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/style";
import { Plus, Trash2, FileText, Eye, Activity, Pencil } from "lucide-react";
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
      bgColor: "bg-emerald-50",
      label: "Légère",
      ring: "ring-emerald-200",
    },
    2: {
      color: "bg-amber-500",
      textColor: "text-amber-700",
      bgColor: "bg-amber-50",
      label: "Modérée",
      ring: "ring-amber-200",
    },
    3: {
      color: "bg-orange-500",
      textColor: "text-orange-700",
      bgColor: "bg-orange-50",
      label: "Importante",
      ring: "ring-orange-200",
    },
    4: {
      color: "bg-red-500",
      textColor: "text-red-700",
      bgColor: "bg-red-50",
      label: "Sévère",
      ring: "ring-red-200",
    },
    5: {
      color: "bg-purple-500",
      textColor: "text-purple-700",
      bgColor: "bg-purple-50",
      label: "Critique",
      ring: "ring-purple-200",
    },
  };
  return configs[severity as keyof typeof configs] || configs[1];
};

const getObservationTypeConfig = (type: string) => {
  const configs = {
    static: {
      icon: Eye,
      label: "Observation statique",
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    dynamic: {
      icon: Activity,
      label: "Observation dynamique",
      color: "text-green-600",
      bg: "bg-green-50",
    },
    none: {
      icon: FileText,
      label: "Diagnostic d'exclusion",
      color: "text-purple-600",
      bg: "bg-purple-50",
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
      {/* Header moderne */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold text-foreground">
            Observations cliniques
          </h2>
          <p className="text-sm text-muted-foreground">
            {observations.length === 0
              ? "Aucune observation ajoutée"
              : `${observations.length} observation${observations.length > 1 ? "s" : ""} enregistrée${observations.length > 1 ? "s" : ""}`}
          </p>
        </div>
        <Button
          onClick={onOpenAddSheet}
          className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all duration-200 gap-2"
        >
          <Plus className="h-4 w-4" />
          Nouvelle observation
        </Button>
      </div>

      {/* Contenu */}
      <div className="flex-1 overflow-y-auto p-2 mt-2">
        {observations.length > 0 ? (
          <div className="grid gap-4">
            {observations.map((obs, index) => {
              const severityConfig = getSeverityConfig(obs.severity);
              const typeConfig = getObservationTypeConfig(obs.type);
              const TypeIcon = typeConfig.icon;

              return (
                <Card
                  key={obs.id}
                  className={cn(
                    "group relative px-4 py-4 overflow-hidden border-0 shadow-sm hover:shadow-md transition-all duration-300",
                  )}
                >
                  {/* Indicateur de sévérité - barre latérale */}
                  <div
                    className={cn(
                      "absolute left-0 top-0 bottom-0 w-1",
                      severityConfig.color,
                    )}
                  />

                  <div className="p-2">
                    {/* En-tête de l'observation */}
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex items-center gap-3 flex-1">
                        {/* Badge numérique moderne */}
                        <div
                          className={cn(
                            "flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold",
                            "bg-primary/10 text-primary border border-primary/20",
                          )}
                        >
                          {index + 1}
                        </div>

                        {/* Région anatomique */}
                        <div className="flex flex-col gap-1">
                          <h3 className="font-semibold text-lg text-foreground">
                            {anatomicalRegions.find(
                              (r) => r.value === obs.region,
                            )?.label || obs.region}
                          </h3>
                          <div className="flex items-center gap-2">
                            {/* Badge de type */}
                            <Badge
                              variant="secondary"
                              className={cn(
                                "gap-1",
                                typeConfig.bg,
                                typeConfig.color,
                              )}
                            >
                              <TypeIcon className="h-3 w-3" />
                              {typeConfig.label}
                            </Badge>

                            {/* Badge de sévérité */}
                            <Badge
                              variant="secondary"
                              className={cn(
                                "gap-1.5 font-medium border-0",
                                severityConfig.bgColor,
                                severityConfig.textColor,
                              )}
                            >
                              <div
                                className={cn(
                                  "w-2 h-2 rounded-full",
                                  severityConfig.color,
                                )}
                              />
                              {severityConfig.label}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEditObservation?.(obs.id)}
                          className="hover:bg-muted/50"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onRemoveObservation(obs.id)}
                          className="hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Notes de l'observation */}
                    {obs.notes && (
                      <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
                        <p className="text-sm text-foreground leading-relaxed">
                          {obs.notes}
                        </p>
                      </div>
                    )}

                    {/* Informations additionnelles */}
                    <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border/30">
                      {obs.dysfunctionType && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="font-medium">Type:</span>
                          <Badge variant="outline" className="text-xs">
                            {obs.dysfunctionType === "confirmed"
                              ? "Confirmé"
                              : "Suspecté"}
                          </Badge>
                        </div>
                      )}
                      {obs.interventionZone && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="font-medium">Zone:</span>
                          <Badge
                            variant="outline"
                            className="text-xs capitalize"
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
          // État vide moderne
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-muted/30 flex items-center justify-center">
              <FileText className="h-10 w-10 text-muted-foreground/60" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-foreground">
                Aucune observation
              </h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Commencez par ajouter vos premières observations cliniques pour
                ce patient.
              </p>
            </div>
            <Button
              onClick={onOpenAddSheet}
              variant="outline"
              className="gap-2 hover:bg-primary hover:text-primary-foreground transition-colors duration-200"
            >
              <Plus className="h-4 w-4" />
              Ajouter une observation
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
