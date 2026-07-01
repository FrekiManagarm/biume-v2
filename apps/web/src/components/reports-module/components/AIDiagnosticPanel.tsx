
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  AlertTriangleIcon,
  InfoIcon,
  LoaderIcon,
} from "lucide-react";
import { cn } from "@/lib/style";

interface AIDiagnosticPanelProps {
  petId: string;
  anatomicalPartId: string;
  currentIssue: {
    type: "dysfunction" | "anatomicalSuspicion" | "observation";
    severity: number;
    laterality: "left" | "right" | "bilateral";
    notes?: string;
  };
  isOpen: boolean;
  onOpenChange?: (open: boolean) => void;
}

type DiagnosticData = {
  hasHistory: boolean;
  totalOccurrences: number;
  averageSeverity: number;
  severityTrend: "improving" | "stable" | "worsening" | "new";
  recurrenceLevel: "none" | "low" | "medium" | "high";
  evolution: string;
  trends: string[];
  alerts: string[];
  similarPatterns: Array<{
    partName: string;
    partId: string;
    similarity: string;
  }>;
  summary: string;
  detailedAnalysis: string;
};

export function AIDiagnosticPanel({
  petId,
  anatomicalPartId,
  currentIssue,
  isOpen,
  onOpenChange,
}: AIDiagnosticPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [autoAnalyzed, setAutoAnalyzed] = useState(false);

  const { data, isLoading, error, refetch } = useQuery<{
    success: boolean;
    data?: DiagnosticData;
    error?: string;
  }>({
    queryKey: [
      "aiDiagnostic",
      petId,
      anatomicalPartId,
      currentIssue.type,
      currentIssue.severity,
    ],
    queryFn: async () => {
      const response = await fetch("/api/reports/analyze-history", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          petId,
          anatomicalPartId,
          currentIssue,
        }),
      });
      if (!response.ok) {
        throw new Error("Erreur lors de l'analyse");
      }
      return response.json();
    },
    enabled: isOpen && !!petId && !!anatomicalPartId,
    retry: 1,
  });

  // Analyse automatique quand la partie anatomique est sélectionnée
  useEffect(() => {
    if (isOpen && anatomicalPartId && !autoAnalyzed) {
      setAutoAnalyzed(true);
      refetch();
    }
  }, [isOpen, anatomicalPartId, autoAnalyzed, refetch]);

  const diagnostic = data?.success ? data.data : null;

  const getSeverityTrendIcon = (trend: string) => {
    switch (trend) {
      case "improving":
        return (
          <TrendingDownIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
        );
      case "worsening":
        return (
          <TrendingUpIcon className="h-4 w-4 text-red-600 dark:text-red-400" />
        );
      default:
        return null;
    }
  };

  const getRecurrenceColor = (level: string) => {
    switch (level) {
      case "high":
        return "bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/50";
      case "medium":
        return "bg-orange-500/20 text-orange-700 dark:text-orange-400 border-orange-500/50";
      case "low":
        return "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/50";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="relative mb-4">
            <div className="h-12 w-12 rounded-full border-4 border-muted animate-pulse" />
            <div className="absolute inset-0 flex items-center justify-center">
              <LoaderIcon className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Analyse en cours...
          </p>
        </div>
      ) : error ? (
        <div className="p-4 rounded-lg border border-destructive/30 bg-destructive/5">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 shrink-0">
              <AlertTriangleIcon className="h-5 w-5 text-destructive" />
            </div>
            <div className="flex-1 space-y-2">
              <h4 className="text-sm font-semibold text-destructive">
                Erreur d'analyse
              </h4>
              <p className="text-xs text-muted-foreground">
                Impossible de charger le diagnostic
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="h-7 text-xs"
              >
                Réessayer
              </Button>
            </div>
          </div>
        </div>
      ) : diagnostic ? (
        <>
          {/* En-tête avec résumé */}
          <div className="p-4 rounded-lg border bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-orange-500/5">
            <div className="flex items-start gap-3">
              <div className="mt-1 shrink-0">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <linearGradient
                      id="diagnostic-icon-gradient"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="0%"
                    >
                      <stop offset="0%" stopColor="rgb(147 51 234)" stopOpacity="0.9" />
                      <stop offset="50%" stopColor="rgb(219 39 119)" stopOpacity="0.9" />
                      <stop offset="100%" stopColor="rgb(249 115 22)" stopOpacity="0.9" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.583a.5.5 0 0 1 0 .96L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"
                    fill="url(#diagnostic-icon-gradient)"
                  />
                </svg>
              </div>
              <div className="flex-1 space-y-3">
                <p className="text-sm text-foreground leading-relaxed">
                  {diagnostic.summary}
                </p>

                {/* Indicateurs compacts */}
                {diagnostic.hasHistory && (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Badge variant="secondary" className="h-6 px-2 text-[10px] font-medium">
                      {diagnostic.totalOccurrences} occurrence{diagnostic.totalOccurrences > 1 ? "s" : ""}
                    </Badge>
                    <Badge variant="secondary" className="h-6 px-2 text-[10px] font-medium">
                      Moy. {diagnostic.averageSeverity.toFixed(1)}/5
                    </Badge>
                    {diagnostic.severityTrend !== "new" && (
                      <Badge
                        variant="outline"
                        className={cn(
                          "h-6 px-2 text-[10px] font-medium flex items-center gap-1",
                          diagnostic.severityTrend === "improving" &&
                          "border-green-500/50 bg-green-500/5 text-green-700",
                          diagnostic.severityTrend === "worsening" &&
                          "border-red-500/50 bg-red-500/5 text-red-700",
                        )}
                      >
                        {diagnostic.severityTrend === "improving" && (
                          <TrendingDownIcon className="h-3 w-3" />
                        )}
                        {diagnostic.severityTrend === "worsening" && (
                          <TrendingUpIcon className="h-3 w-3" />
                        )}
                        {diagnostic.severityTrend === "improving"
                          ? "Amélioration"
                          : diagnostic.severityTrend === "worsening"
                            ? "Dégradation"
                            : "Stable"}
                      </Badge>
                    )}
                    {diagnostic.recurrenceLevel !== "none" && (
                      <Badge
                        variant="outline"
                        className={cn(
                          "h-6 px-2 text-[10px] font-medium",
                          getRecurrenceColor(diagnostic.recurrenceLevel),
                        )}
                      >
                        {diagnostic.recurrenceLevel === "high" && "Récurrence élevée"}
                        {diagnostic.recurrenceLevel === "medium" && "Récurrence moyenne"}
                        {diagnostic.recurrenceLevel === "low" && "Récurrence faible"}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Alertes */}
          {diagnostic.alerts.length > 0 && (
            <div className="space-y-2">
              {diagnostic.alerts.map((alert, index) => (
                <div
                  key={index}
                  className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/5"
                >
                  <div className="flex items-start gap-2">
                    <AlertTriangleIcon className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                    <p className="text-xs text-foreground leading-relaxed">
                      {alert}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Détails collapsibles */}
          <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
            <div className="flex items-center justify-between py-2 border-t">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Analyse détaillée
              </h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-7 text-xs -mr-2"
              >
                {isExpanded ? (
                  <>
                    Réduire
                    <ChevronUpIcon className="h-3 w-3 ml-1" />
                  </>
                ) : (
                  <>
                    Développer
                    <ChevronDownIcon className="h-3 w-3 ml-1" />
                  </>
                )}
              </Button>
            </div>

            <CollapsibleContent className="space-y-4 pt-3">
              {/* Évolution */}
              <div className="space-y-2">
                <h5 className="text-xs font-semibold text-foreground">
                  Évolution
                </h5>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {diagnostic.evolution}
                </p>
              </div>

              {/* Tendances */}
              {diagnostic.trends.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-xs font-semibold text-foreground">
                    Tendances
                  </h5>
                  <ul className="space-y-1.5">
                    {diagnostic.trends.map((trend, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 text-xs text-muted-foreground"
                      >
                        <span className="mt-1.5 h-1 w-1 rounded-full bg-primary shrink-0" />
                        <span className="flex-1">{trend}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Patterns similaires */}
              {diagnostic.similarPatterns.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-xs font-semibold text-foreground">
                    Patterns similaires
                  </h5>
                  <div className="space-y-1.5">
                    {diagnostic.similarPatterns.map((pattern, index) => (
                      <div
                        key={index}
                        className="p-2.5 rounded-md bg-muted/50 border"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-xs font-medium text-foreground">
                            {pattern.partName}
                          </span>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {pattern.similarity}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Analyse détaillée */}
              <div className="space-y-2">
                <h5 className="text-xs font-semibold text-foreground">
                  Conclusion
                </h5>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {diagnostic.detailedAnalysis}
                </p>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
            <InfoIcon className="h-6 w-6 text-muted-foreground/60" />
          </div>
          <p className="text-sm text-muted-foreground">
            Aucun diagnostic disponible
          </p>
        </div>
      )}
    </div>
  );
}

