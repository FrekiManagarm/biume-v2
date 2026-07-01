
import { useQuery } from "@tanstack/react-query";
import { getPatientAnatomicalHistory } from "@/lib/api/actions/reports.action";
import {
  Credenza,
  CredenzaContent,
  CredenzaHeader,
  CredenzaTitle,
  CredenzaBody,
} from "@/components/ui/credenza";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  HistoryIcon,
  CalendarIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  MinusIcon,
} from "lucide-react";
import { cn } from "@/lib/style";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface AnatomicalHistoryPanelProps {
  petId: string;
  anatomicalPartId: string;
  type?: "dysfunction" | "anatomicalSuspicion" | "observation";
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AnatomicalHistoryPanel({
  petId,
  anatomicalPartId,
  type,
  isOpen,
  onOpenChange,
}: AnatomicalHistoryPanelProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["anatomicalHistory", petId, anatomicalPartId, type],
    queryFn: () =>
      getPatientAnatomicalHistory({
        petId,
        anatomicalPartId,
        type,
      }),
    enabled: isOpen && !!petId && !!anatomicalPartId,
  });

  const history = data?.success ? data.data : [];

  const getSeverityColor = (severity: number) => {
    switch (severity) {
      case 1:
        return "bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/50";
      case 2:
        return "bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-500/50";
      case 3:
        return "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/50";
      case 4:
        return "bg-orange-500/20 text-orange-700 dark:text-orange-400 border-orange-500/50";
      case 5:
        return "bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/50";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getLateralityLabel = (laterality: string) => {
    switch (laterality) {
      case "left":
        return "Gauche";
      case "right":
        return "Droite";
      case "bilateral":
        return "Bilatéral";
      default:
        return laterality;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "dysfunction":
        return "Dysfonction";
      case "anatomicalSuspicion":
        return "Suspicion anatomique";
      case "observation":
        return "Observation";
      default:
        return type;
    }
  };

  // Calculer l'évolution de sévérité
  const calculateSeverityEvolution = (index: number) => {
    if (index === history.length - 1) return null;
    const current = history[index].severity;
    const previous = history[index + 1].severity;
    if (current < previous) return "improving";
    if (current > previous) return "worsening";
    return "stable";
  };

  return (
    <Credenza open={isOpen} onOpenChange={onOpenChange}>
      <CredenzaContent className="sm:max-w-[700px]">
        <CredenzaHeader>
          <CredenzaTitle className="flex items-center gap-2">
            <HistoryIcon className="h-5 w-5" />
            Historique anatomique
          </CredenzaTitle>
        </CredenzaHeader>
        <CredenzaBody>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-muted-foreground">
                Chargement de l'historique...
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-destructive">
                Erreur lors du chargement de l'historique
              </div>
            </div>
          ) : history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <HistoryIcon className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-sm text-muted-foreground">
                Aucun antécédent sur cette partie anatomique
              </p>
            </div>
          ) : (
            <Tabs defaultValue="list" className="w-full">
              <TabsList className="w-full">
                <TabsTrigger value="list" className="flex-1">
                  Liste ({history.length})
                </TabsTrigger>
                <TabsTrigger value="details" className="flex-1">
                  Détails
                </TabsTrigger>
              </TabsList>

              <TabsContent value="list" className="mt-4">
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {history.map((item, index) => {
                      const evolution = calculateSeverityEvolution(index);
                      return (
                        <Card key={item.id} className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-2">
                                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium">
                                  {format(
                                    new Date(item.reportDate),
                                    "dd MMM yyyy",
                                    { locale: fr },
                                  )}
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  {getTypeLabel(item.type)}
                                </Badge>
                              </div>
                              <div className="text-sm font-semibold">
                                {item.reportTitle}
                              </div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge
                                  className={cn(
                                    "border",
                                    getSeverityColor(item.severity),
                                  )}
                                >
                                  Sévérité: {item.severity}/5
                                </Badge>
                                <Badge variant="outline">
                                  {getLateralityLabel(item.laterality)}
                                </Badge>
                                {evolution && (
                                  <div className="flex items-center gap-1">
                                    {evolution === "improving" && (
                                      <TrendingDownIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
                                    )}
                                    {evolution === "worsening" && (
                                      <TrendingUpIcon className="h-4 w-4 text-red-600 dark:text-red-400" />
                                    )}
                                    {evolution === "stable" && (
                                      <MinusIcon className="h-4 w-4 text-muted-foreground" />
                                    )}
                                    <span className="text-xs text-muted-foreground">
                                      {evolution === "improving"
                                        ? "Amélioration"
                                        : evolution === "worsening"
                                          ? "Dégradation"
                                          : "Stable"}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="details" className="mt-4">
                <ScrollArea className="h-[400px]">
                  <div className="space-y-4">
                    {history.map((item, index) => {
                      const evolution = calculateSeverityEvolution(index);
                      return (
                        <Card key={item.id} className="p-4">
                          <CardHeader className="p-0 pb-3">
                            <div className="flex items-start justify-between">
                              <CardTitle className="text-base">
                                {item.reportTitle}
                              </CardTitle>
                              <Badge
                                className={cn(
                                  "border",
                                  getSeverityColor(item.severity),
                                )}
                              >
                                {item.severity}/5
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="p-0 space-y-3">
                            <div className="flex items-center gap-4 text-sm">
                              <div className="flex items-center gap-2">
                                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">
                                  {format(
                                    new Date(item.reportDate),
                                    "dd MMMM yyyy 'à' HH:mm",
                                    { locale: fr },
                                  )}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant="outline">
                                {getTypeLabel(item.type)}
                              </Badge>
                              <Badge variant="outline">
                                {getLateralityLabel(item.laterality)}
                              </Badge>
                              <Badge variant="outline">
                                {item.anatomicalPartName}
                              </Badge>
                              {evolution && (
                                <Badge
                                  variant={
                                    evolution === "improving"
                                      ? "default"
                                      : evolution === "worsening"
                                        ? "destructive"
                                        : "secondary"
                                  }
                                  className="flex items-center gap-1"
                                >
                                  {evolution === "improving" && (
                                    <TrendingDownIcon className="h-3 w-3" />
                                  )}
                                  {evolution === "worsening" && (
                                    <TrendingUpIcon className="h-3 w-3" />
                                  )}
                                  {evolution === "stable" && (
                                    <MinusIcon className="h-3 w-3" />
                                  )}
                                  {evolution === "improving"
                                    ? "Amélioration"
                                    : evolution === "worsening"
                                      ? "Dégradation"
                                      : "Stable"}
                                </Badge>
                              )}
                            </div>
                            {item.notes && (
                              <div className="pt-2 border-t">
                                <p className="text-sm text-muted-foreground">
                                  <span className="font-medium">Notes: </span>
                                  {item.notes}
                                </p>
                              </div>
                            )}
                            {index < history.length - 1 && (
                              <div className="pt-2 border-t">
                                <div className="text-xs text-muted-foreground">
                                  Comparaison avec la séance précédente:
                                  {evolution === "improving" && (
                                    <span className="text-green-600 dark:text-green-400 ml-1">
                                      Sévérité en baisse (amélioration)
                                    </span>
                                  )}
                                  {evolution === "worsening" && (
                                    <span className="text-red-600 dark:text-red-400 ml-1">
                                      Sévérité en hausse (dégradation)
                                    </span>
                                  )}
                                  {evolution === "stable" && (
                                    <span className="ml-1">
                                      Sévérité stable
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          )}
        </CredenzaBody>
      </CredenzaContent>
    </Credenza>
  );
}

