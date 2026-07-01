
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { getPatientAnatomicalHistory } from "@/lib/api/actions/reports.action";
import { AIDiagnosticPanel } from "./AIDiagnosticPanel";
import {
  HistoryIcon,
  SparklesIcon,
  CalendarIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  MinusIcon,
  ClockIcon,
  FileTextIcon,
} from "lucide-react";
import { cn } from "@/lib/style";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface AnatomicalHistoryAndDiagnosticPanelProps {
  petId: string;
  anatomicalPartId: string;
  type: "dysfunction" | "anatomicalSuspicion" | "observation";
  currentIssue: {
    type: "dysfunction" | "anatomicalSuspicion" | "observation";
    severity: number;
    laterality: "left" | "right" | "bilateral";
    notes?: string;
  };
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AnatomicalHistoryAndDiagnosticPanel({
  petId,
  anatomicalPartId,
  type,
  currentIssue,
  isOpen,
  onOpenChange,
}: AnatomicalHistoryAndDiagnosticPanelProps) {
  const [activeTab, setActiveTab] = useState<"history" | "diagnostic">(
    "history",
  );

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

  const calculateSeverityEvolution = (index: number) => {
    if (index === history.length - 1) return null;
    const current = history[index].severity;
    const previous = history[index + 1].severity;
    if (current < previous) return "improving";
    if (current > previous) return "worsening";
    return "stable";
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-[600px] sm:w-[600px] p-0 flex flex-col gap-0">
        {/* Header épuré */}
        <div className="px-6 py-5 border-b bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-orange-500/10">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient
                    id="sheet-header-gradient"
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
                  d="M3 3v5h5M21 21v-5h-5M3 21l7-7m11-11l-7 7"
                  stroke="url(#sheet-header-gradient)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="flex-1">
              <SheetTitle className="text-base font-semibold">
                Analyse de la région
              </SheetTitle>
              <SheetDescription className="text-xs text-muted-foreground mt-0.5">
                Historique et diagnostic IA
              </SheetDescription>
            </div>
          </div>
        </div>

        {/* Tabs épurés */}
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as "history" | "diagnostic")}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <div className="border-b bg-background">
            <TabsList className="w-full h-12 rounded-none border-0 bg-transparent p-0">
              <TabsTrigger
                value="history"
                className="flex-1 h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                <ClockIcon className="h-4 w-4 mr-2" />
                <span className="text-sm font-medium">Historique</span>
              </TabsTrigger>
              <TabsTrigger
                value="diagnostic"
                className="flex-1 h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="mr-2"
                >
                  <defs>
                    <linearGradient
                      id="tab-sparkle-gradient"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="0%"
                    >
                      <stop offset="0%" stopColor="rgb(147 51 234)" stopOpacity="0.8" />
                      <stop offset="50%" stopColor="rgb(219 39 119)" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="rgb(249 115 22)" stopOpacity="0.8" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.583a.5.5 0 0 1 0 .96L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"
                    fill="url(#tab-sparkle-gradient)"
                  />
                </svg>
                <span className="text-sm font-medium">Diagnostic IA</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="history" className="flex-1 mt-0 overflow-hidden data-[state=active]:flex data-[state=active]:flex-col">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center flex-1 py-16">
                <div className="relative mb-4">
                  <div className="h-12 w-12 rounded-full border-4 border-muted animate-pulse" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ClockIcon className="h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Chargement de l'historique...
                </p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center flex-1 py-16 px-6">
                <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center mb-3">
                  <HistoryIcon className="h-6 w-6 text-destructive" />
                </div>
                <p className="text-sm font-medium text-foreground">
                  Erreur de chargement
                </p>
                <p className="text-xs text-muted-foreground mt-1 text-center max-w-[240px]">
                  Impossible de récupérer l'historique
                </p>
              </div>
            ) : history.length === 0 ? (
              <div className="flex flex-col items-center justify-center flex-1 py-16 px-6 text-center">
                <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
                  <FileTextIcon className="h-6 w-6 text-muted-foreground/60" />
                </div>
                <p className="text-sm font-medium text-foreground mb-1.5">
                  Aucun antécédent trouvé
                </p>
                <p className="text-xs text-muted-foreground max-w-[280px] leading-relaxed">
                  Cette région n'a pas encore été mentionnée dans les rapports précédents
                </p>
              </div>
            ) : (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header avec compteur */}
                <div className="px-6 pt-4 pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                      <p className="text-xs font-semibold text-foreground uppercase tracking-wide">
                        {history.length} Occurrence{history.length > 1 ? "s" : ""}
                      </p>
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      Du plus récent au plus ancien
                    </p>
                  </div>
                </div>

                {/* Timeline */}
                <ScrollArea className="flex-1 px-6">
                  <div className="relative pb-4">
                    {/* Ligne verticale de timeline */}
                    <div className="absolute left-[17px] top-2 bottom-2 w-px bg-linear-to-b from-primary via-primary/50 to-transparent" />

                    <div className="space-y-3 relative">
                      {history.map((item, index) => {
                        const evolution = calculateSeverityEvolution(index);
                        const isFirst = index === 0;
                        const isLast = index === history.length - 1;

                        return (
                          <div key={item.id} className="relative pl-9">
                            {/* Dot sur la timeline */}
                            <div className={cn(
                              "absolute left-0 top-3 h-[10px] w-[10px] rounded-full border-2 bg-background transition-all",
                              isFirst ? "border-primary shadow-sm shadow-primary/50" : "border-primary/40"
                            )} />

                            {/* Card */}
                            <div
                              className={cn(
                                "group p-3 rounded-lg border transition-all",
                                isFirst
                                  ? "bg-linear-to-br from-primary/5 via-primary/3 to-transparent border-primary/20 shadow-sm"
                                  : "bg-card hover:bg-accent/30 hover:border-primary/20"
                              )}
                            >
                              <div className="space-y-2">
                                {/* Header */}
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1 min-w-0">
                                    <h4 className={cn(
                                      "text-sm font-medium leading-tight mb-1 line-clamp-1",
                                      isFirst && "text-primary"
                                    )}>
                                      {item.reportTitle}
                                    </h4>
                                    <time className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium">
                                      <CalendarIcon className="h-3 w-3 shrink-0" />
                                      {format(
                                        new Date(item.reportDate),
                                        "d MMMM yyyy",
                                        { locale: fr },
                                      )}
                                    </time>
                                  </div>

                                  {/* Badges */}
                                  <div className="flex items-center gap-1 shrink-0">
                                    <Badge
                                      variant="outline"
                                      className={cn(
                                        "h-6 px-1.5 text-xs font-bold min-w-[28px] justify-center",
                                        getSeverityColor(item.severity),
                                      )}
                                    >
                                      {item.severity}
                                    </Badge>
                                    {evolution && (
                                      <div
                                        className={cn(
                                          "h-6 w-6 rounded flex items-center justify-center",
                                          evolution === "improving" && "bg-green-500/15",
                                          evolution === "worsening" && "bg-red-500/15",
                                          evolution === "stable" && "bg-muted",
                                        )}
                                        title={
                                          evolution === "improving"
                                            ? "Amélioration"
                                            : evolution === "worsening"
                                              ? "Dégradation"
                                              : "Stable"
                                        }
                                      >
                                        {evolution === "improving" && (
                                          <TrendingDownIcon className="h-3.5 w-3.5 text-green-600" />
                                        )}
                                        {evolution === "worsening" && (
                                          <TrendingUpIcon className="h-3.5 w-3.5 text-red-600" />
                                        )}
                                        {evolution === "stable" && (
                                          <MinusIcon className="h-3.5 w-3.5 text-muted-foreground" />
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Métadonnées inline */}
                                <div className="flex items-center gap-2 text-[10px]">
                                  <Badge variant="secondary" className="h-5 px-1.5 text-[10px] font-medium">
                                    {getLateralityLabel(item.laterality)}
                                  </Badge>
                                  {evolution && (
                                    <span className={cn(
                                      "font-medium",
                                      evolution === "improving" && "text-green-600",
                                      evolution === "worsening" && "text-red-600",
                                      evolution === "stable" && "text-muted-foreground"
                                    )}>
                                      {evolution === "improving"
                                        ? "↓ Amélioration"
                                        : evolution === "worsening"
                                          ? "↑ Dégradation"
                                          : "→ Stable"}
                                    </span>
                                  )}
                                  {isFirst && (
                                    <Badge variant="default" className="h-5 px-1.5 text-[10px] font-medium bg-primary/10 text-primary border-primary/20">
                                      Plus récent
                                    </Badge>
                                  )}
                                </div>

                                {/* Notes */}
                                {item.notes && (
                                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 border-t pt-2">
                                    {item.notes}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </ScrollArea>
              </div>
            )}
          </TabsContent>

          <TabsContent value="diagnostic" className="flex-1 mt-0 overflow-hidden data-[state=active]:flex data-[state=active]:flex-col">
            <div className="flex-1 overflow-hidden px-6 py-4">
              <ScrollArea className="h-full -mx-6 px-6">
                <div className="pb-4">
                  <AIDiagnosticPanel
                    petId={petId}
                    anatomicalPartId={anatomicalPartId}
                    currentIssue={currentIssue}
                    isOpen={true}
                  />
                </div>
              </ScrollArea>
            </div>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}

