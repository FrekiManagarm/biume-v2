
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Scan, ChevronLeft, ChevronRight } from "lucide-react";
import { AnatomicalImageWithOverlay } from "./AnatomicalImageWithOverlay";
import { cn } from "@/lib/style";
import type { AnatomicalIssue as DBAnatomicalIssue } from "@/lib/schemas/advancedReport/anatomicalIssue";
import type { AnatomicalIssue as UIAnatomicalIssue } from "../types";

interface AnatomicalVisualizationProps {
  anatomicalIssues: DBAnatomicalIssue[];
  animalData?: {
    name?: string | null;
    code?: string | null;
  } | null;
}

export function AnatomicalVisualization({
  anatomicalIssues,
  animalData,
}: AnatomicalVisualizationProps) {
  const [anatomicalView, setAnatomicalView] = useState<"gauche" | "droite">(
    "gauche",
  );

  // Convertir les données DB vers le format UI
  const convertToUIFormat = (issue: DBAnatomicalIssue): UIAnatomicalIssue => {
    return {
      id: issue.id,
      type: issue.type as "dysfunction" | "anatomicalSuspicion",
      region: issue.anatomicalPartId, // Utiliser l'ID comme région
      severity: issue.severity,
      notes: issue.notes || "",
      laterality: issue.laterality,
      anatomicalPart: issue.anatomicalPart,
      interventionZone: undefined, // Optionnel dans le type UI
    };
  };

  // Séparer les observations des problèmes anatomiques
  const observations = anatomicalIssues.filter(
    (issue) => issue.type === "observation",
  );
  const anatomicalProblems = anatomicalIssues.filter(
    (issue) => issue.type !== "observation",
  );

  // Combiner pour la visualisation
  const allIssues = [...observations, ...anatomicalProblems];

  // Filtrer selon la vue
  const filteredIssues = allIssues.filter((issue) => {
    if (issue.laterality === "bilateral") return true;
    if (anatomicalView === "gauche" && issue.laterality === "left") return true;
    if (anatomicalView === "droite" && issue.laterality === "right")
      return true;
    return false;
  });

  const getSeverityLabel = (severity: number) => {
    switch (severity) {
      case 1:
        return "Légère";
      case 2:
        return "Modérée";
      case 3:
        return "Importante";
      case 4:
        return "Sévère";
      case 5:
        return "Critique";
      default:
        return "Modérée";
    }
  };

  const getSeverityColor = (severity: number) => {
    switch (severity) {
      case 1:
        return "text-green-600 bg-green-50 border-green-200";
      case 2:
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case 3:
        return "text-orange-600 bg-orange-50 border-orange-200";
      case 4:
        return "text-red-600 bg-red-50 border-red-200";
      case 5:
        return "text-purple-600 bg-purple-50 border-purple-200";
      default:
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
    }
  };

  const getSeverityFillColor = (severity: number) => {
    switch (severity) {
      case 1:
        return "rgba(74, 222, 128, 0.5)"; // green-400
      case 2:
        return "rgba(250, 204, 21, 0.5)"; // yellow-400
      case 3:
        return "rgba(251, 146, 60, 0.5)"; // orange-400
      case 4:
        return "rgba(248, 113, 113, 0.5)"; // red-400
      case 5:
        return "rgba(192, 132, 252, 0.5)"; // purple-400
      default:
        return "rgba(250, 204, 21, 0.5)"; // yellow-400
    }
  };

  const getLateralityLabel = (laterality: "left" | "right" | "bilateral") => {
    switch (laterality) {
      case "left":
        return "Gauche";
      case "right":
        return "Droite";
      case "bilateral":
        return "Bilatéral";
      default:
        return "Gauche";
    }
  };

  const getIssueTypeLabel = (type: string) => {
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

  const getIssueTypeBadgeColor = (type: string) => {
    switch (type) {
      case "dysfunction":
        return "bg-red-100 text-red-700 border-red-200";
      case "anatomicalSuspicion":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "observation":
        return "bg-blue-100 text-blue-700 border-blue-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const renderAnatomicalSVG = (
    dysfunctions: UIAnatomicalIssue[],
    side: "left" | "right",
  ) => {
    return (
      <svg
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
        preserveAspectRatio="xMidYMid meet"
        viewBox="0 0 500 380"
      >
        {dysfunctions.map((dysfunction) => {
          const anatomicalPart = dysfunction.anatomicalPart;
          if (!anatomicalPart) return null;

          const path =
            side === "left"
              ? anatomicalPart.pathLeft
              : anatomicalPart.pathRight;
          const transform =
            side === "left"
              ? anatomicalPart.transformLeft
              : anatomicalPart.transformRight;

          if (!path) return null;

          return (
            <g key={dysfunction.id}>
              <path
                d={path}
                transform={transform || ""}
                fill={getSeverityFillColor(dysfunction.severity || 2)}
                stroke={getSeverityFillColor(dysfunction.severity || 2).replace(
                  "0.5",
                  "0.8",
                )}
                strokeWidth="2"
              />
            </g>
          );
        })}
      </svg>
    );
  };

  if (allIssues.length === 0) {
    return null;
  }

  return (
    <Card className="no-print">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scan className="h-5 w-5" />
          Visualisation anatomique
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Contrôles de vue */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button
                variant={anatomicalView === "gauche" ? "default" : "outline"}
                size="sm"
                onClick={() => setAnatomicalView("gauche")}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Vue gauche
              </Button>
              <Button
                variant={anatomicalView === "droite" ? "default" : "outline"}
                size="sm"
                onClick={() => setAnatomicalView("droite")}
              >
                Vue droite
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
            <div className="text-sm text-muted-foreground">
              {filteredIssues.length} élément
              {filteredIssues.length > 1 ? "s" : ""} affiché
              {filteredIssues.length > 1 ? "s" : ""}
            </div>
          </div>

          {/* Image anatomique */}
          <div className="bg-muted/10 rounded-lg p-4 border">
            <AnatomicalImageWithOverlay
              anatomicalView={anatomicalView}
              filteredDysfunctions={filteredIssues.map(convertToUIFormat)}
              renderAnatomicalSVG={renderAnatomicalSVG}
              animalData={animalData}
              isTestMode={false}
            />
          </div>

          {/* Légende */}
          <div className="bg-muted/30 rounded-lg p-4 border">
            <p className="text-sm font-medium mb-3">Légende des sévérités :</p>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <span className="text-xs">Légère</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <span className="text-xs">Modérée</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-400" />
                <span className="text-xs">Importante</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <span className="text-xs">Sévère</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-400" />
                <span className="text-xs">Critique</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
