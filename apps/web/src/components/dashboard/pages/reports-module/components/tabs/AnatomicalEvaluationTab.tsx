
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/style";
import {
  PlusIcon,
  TrashIcon,
  AlertCircleIcon,
  ActivityIcon,
  ListIcon,
  Pencil,
} from "lucide-react";
import { interventionZones } from "../../data/dog/typesDog";
import { anatomicalRegionsByCategory } from "../../data/dog/typesDog";
import { anatomicalRegionsByCategoryCat } from "../../data/cat/typesCat";
import { anatomicalRegionsByCategoryHorse } from "../../data/horse/typesHorse";
import { anatomicalCatRegionPaths } from "../../data/cat/dataCat";
import { anatomicalHorseRegionPaths } from "../../data/horse/dataHorse";
import { anatomicalRegionPaths } from "../../data/dog/dataDog";
import { QuestionMarkCircledIcon } from "@radix-ui/react-icons";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { AnatomicalImageWithOverlay } from "../AnatomicalImageWithOverlay";
import { useQuery } from "@tanstack/react-query";
import { getAnatomicalParts } from "@/lib/api/actions/reports.action";
import type { AnatomicalIssue } from "../../types";

interface AnatomicalEvaluationTabProps {
  dysfunctions: AnatomicalIssue[];
  setDysfunctions: (dysfunctions: AnatomicalIssue[]) => void;
  onAddDysfunction: (dysfunction: Omit<AnatomicalIssue, "id">) => void;
  isAddModalOpen: boolean;
  setIsAddModalOpen: (open: boolean) => void;
  animalData?: {
    name?: string | null;
    code?: string | null;
  } | null;
  isTestMode?: boolean;
  selectedAnimalType?: string;
  anatomicalView?: "gauche" | "droite";
  setAnatomicalView?: (view: "gauche" | "droite") => void;
  onEditDysfunction?: (id: string) => void;
}

export function AnatomicalEvaluationTab({
  dysfunctions,
  setDysfunctions,
  setIsAddModalOpen,
  animalData,
  isTestMode = false,
  selectedAnimalType = "dog",
  anatomicalView: externalAnatomicalView,
  setAnatomicalView: externalSetAnatomicalView,
  onEditDysfunction,
}: AnatomicalEvaluationTabProps) {
  const [internalAnatomicalView, setInternalAnatomicalView] = useState<
    "gauche" | "droite"
  >("gauche");

  // Utiliser les props externes si disponibles, sinon utiliser l'état interne
  const anatomicalView = externalAnatomicalView ?? internalAnatomicalView;
  const setAnatomicalView =
    externalSetAnatomicalView ?? setInternalAnatomicalView;

  // Déterminer le type d'animal pour la requête (seulement en mode normal)
  const getAnimalType = () => {
    if (isTestMode) return null;

    const animalName = animalData?.name?.toLowerCase() || "";
    const animalCode = animalData?.code?.toLowerCase() || "";

    if (
      animalName.includes("chat") ||
      animalName.includes("cat") ||
      animalCode.includes("cat")
    ) {
      return "CAT";
    } else if (
      animalName.includes("cheval") ||
      animalName.includes("horse") ||
      animalCode.includes("horse")
    ) {
      return "HORSE";
    } else {
      return "DOG";
    }
  };

  const animalType = getAnimalType();

  // Récupérer toutes les données anatomiques depuis la base de données (seulement en mode normal)
  const { data: anatomicalPartsResponse } = useQuery({
    queryKey: ["anatomicalParts", animalType, "all"],
    queryFn: async () => {
      if (!animalType) return [];
      const zones = ["articulation", "fascias", "organes", "muscles"] as const;
      const allParts = await Promise.all(
        zones.map(async (zone) => {
          const result = await getAnatomicalParts({ animalType, zone });
          return result || [];
        }),
      );
      return allParts.flat();
    },
    enabled: !!animalType && !isTestMode,
  });

  const handleRemoveDysfunction = (id: string) => {
    setDysfunctions(dysfunctions.filter((d) => d.id !== id));
  };

  // La fonction d'ajout est gérée au niveau du composant parent

  const handleOpenAddModal = () => {
    setIsAddModalOpen(true);
  };

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
        return "bg-green-500";
      case 2:
        return "bg-yellow-500";
      case 3:
        return "bg-orange-500";
      case 4:
        return "bg-red-500";
      case 5:
        return "bg-purple-500";
      default:
        return "bg-yellow-500";
    }
  };
  const getSeverityFillColor = (severity: number) => {
    switch (severity) {
      case 1:
        return "rgba(34, 197, 94, 0.5)";
      case 2:
        return "rgba(234, 179, 8, 0.5)";
      case 3:
        return "rgba(249, 115, 22, 0.5)";
      case 4:
        return "rgba(239, 68, 68, 0.5)";
      case 5:
        return "rgba(168, 85, 247, 0.5)";
      default:
        return "rgba(234, 179, 8, 0.5)";
    }
  };
  const getTypeIcon = (type: "dysfunction" | "anatomicalSuspicion") => {
    return type === "dysfunction" ? (
      <ActivityIcon className="h-4 w-4 text-primary" />
    ) : (
      <AlertCircleIcon className="h-4 w-4 text-amber-500" />
    );
  };
  const getTypeLabel = (type: "dysfunction" | "anatomicalSuspicion") => {
    return type === "dysfunction" ? "Dysfonction" : "Suspicion d'atteinte";
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
  // Amélioration du filtrage des dysfunctions selon la latéralité et la vue
  const filteredDysfunctions = dysfunctions.filter((dysfunction) => {
    // Toujours afficher les éléments bilatéraux
    if (dysfunction.laterality === "bilateral") return true;

    // Afficher selon la vue sélectionnée
    if (anatomicalView === "gauche" && dysfunction.laterality === "left")
      return true;
    if (anatomicalView === "droite" && dysfunction.laterality === "right")
      return true;

    return false;
  });
  const renderAnatomicalSVG = (
    dysfunctions: AnatomicalIssue[],
    side: "left" | "right",
  ) => {
    return (
      <svg
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
        preserveAspectRatio="xMidYMid meet"
        viewBox="0 0 500 380"
      >
        {dysfunctions.map((dysfunction) => {
          // En mode test, utiliser les données SVG selon le type d'animal sélectionné
          if (isTestMode) {
            let svgData;
            switch (selectedAnimalType) {
              case "cat":
                svgData = anatomicalCatRegionPaths;
                break;
              case "horse":
                svgData = anatomicalHorseRegionPaths;
                break;
              case "dog":
              default:
                svgData = anatomicalRegionPaths;
                break;
            }

            const regionData = svgData[dysfunction.region];
            if (!regionData) {
              console.warn(
                "Données SVG manquantes pour la région:",
                dysfunction.region,
                "type:",
                selectedAnimalType,
              );
              return null;
            }

            const sideData =
              side === "left" ? regionData.left : regionData.right;
            if (!sideData?.path) {
              console.warn(
                "Path SVG manquant pour:",
                dysfunction.region,
                "côté:",
                side,
              );
              return null;
            }

            return (
              <g key={dysfunction.id}>
                <path
                  d={sideData.path}
                  transform={sideData.transform || ""}
                  fill={getSeverityFillColor(dysfunction.severity)}
                  stroke={getSeverityFillColor(dysfunction.severity).replace(
                    "0.5",
                    "0.8",
                  )}
                  strokeWidth="2"
                />
              </g>
            );
          }

          // Mode normal : utiliser les données anatomiques complètes stockées avec la dysfonction
          const anatomicalPart = dysfunction.anatomicalPart;
          if (!anatomicalPart) {
            console.warn(
              "Données anatomiques manquantes pour la dysfonction:",
              dysfunction.id,
            );
            return null;
          }

          // Utiliser directement les données SVG de l'objet anatomicalPart
          const path =
            side === "left"
              ? anatomicalPart.pathLeft
              : anatomicalPart.pathRight;
          const transform =
            side === "left"
              ? anatomicalPart.transformLeft
              : anatomicalPart.transformRight;

          if (!path) {
            console.warn(
              "Path SVG manquant pour:",
              anatomicalPart.name,
              "côté:",
              side,
            );
            return null;
          }

          return (
            <g key={dysfunction.id}>
              <path
                d={path}
                transform={transform || ""}
                fill={getSeverityFillColor(dysfunction.severity)}
                stroke={getSeverityFillColor(dysfunction.severity).replace(
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

  return (
    <div className="w-full h-full flex flex-col">
      {/* Zone principale avec header intégré */}
      <div className="bg-muted/10 rounded-2xl border shadow-sm relative flex-1 min-h-0 overflow-hidden">
        {/* Header intégré dans la card - positionné en haut */}
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-background/90 to-transparent p-4 z-20 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <ActivityIcon className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Visualisation anatomique</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={anatomicalView === "gauche" ? "default" : "outline"}
                size="sm"
                className={cn("px-3 relative group")}
                onClick={() => setAnatomicalView("gauche")}
              >
                Vue gauche
                <span className="ml-1 text-xs opacity-60 group-hover:opacity-100 transition-opacity">
                  <kbd className="px-1 py-0.5 bg-black/10 rounded text-xs">
                    1
                  </kbd>
                </span>
              </Button>
              <Button
                variant={anatomicalView === "droite" ? "default" : "outline"}
                size="sm"
                className={cn("px-3 relative group")}
                onClick={() => setAnatomicalView("droite")}
              >
                Vue droite
                <span className="ml-1 text-xs opacity-60 group-hover:opacity-100 transition-opacity">
                  <kbd className="px-1 py-0.5 bg-black/10 rounded text-xs">
                    2
                  </kbd>
                </span>
              </Button>
            </div>
          </div>
        </div>

        {/* Légende - positionnée en bas à gauche */}
        <div className="absolute bottom-20 left-4 z-10">
          <div className="group relative">
            <div className="bg-background/80 backdrop-blur-sm rounded-lg p-2 shadow-sm cursor-pointer hover:bg-background/90 transition-colors">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <QuestionMarkCircledIcon className="w-3 h-3" />
                <span>Légende</span>
              </div>
            </div>
            <div className="absolute bottom-full left-0 mb-2 opacity-0 translate-x-[-100%] group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 ease-in-out">
              <div className="bg-background/95 backdrop-blur-sm rounded-lg p-3 shadow-lg">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-muted-foreground">Légère</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-2 h-2 rounded-full bg-yellow-500" />
                    <span className="text-muted-foreground">Modérée</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-2 h-2 rounded-full bg-orange-500" />
                    <span className="text-muted-foreground">Importante</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <span className="text-muted-foreground">Sévère</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-2 h-2 rounded-full bg-purple-500" />
                    <span className="text-muted-foreground">Critique</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Bouton Éléments - positionné en bas à gauche */}
        <div className="absolute bottom-4 left-4 z-10">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="default"
                size="sm"
                className="h-8 px-2"
              >
                <ListIcon className="h-3.5 w-3.5 mr-1.5" />
                <span className="text-xs">
                  Éléments ({dysfunctions.length})
                </span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px] p-0">
              <SheetHeader className="p-4 border-b">
                <SheetTitle>Éléments identifiés</SheetTitle>
              </SheetHeader>
              <div className="p-4 overflow-y-auto h-[calc(100vh-4rem)]">
                {dysfunctions.length > 0 ? (
                  <div className="space-y-3">
                    {dysfunctions.map((issue) => (
                      <div
                        key={issue.id}
                        className="group relative bg-background rounded-lg border p-3 hover:border-primary/50 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={cn(
                              "w-2 h-2 rounded-full mt-1.5",
                              getSeverityColor(issue.severity),
                            )}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium truncate">
                                {isTestMode
                                  ? // En mode test, utiliser les données selon le type d'animal
                                  (() => {
                                    let regionsData;
                                    switch (selectedAnimalType) {
                                      case "cat":
                                        regionsData =
                                          anatomicalRegionsByCategoryCat;
                                        break;
                                      case "horse":
                                        regionsData =
                                          anatomicalRegionsByCategoryHorse;
                                        break;
                                      case "dog":
                                      default:
                                        regionsData =
                                          anatomicalRegionsByCategory;
                                        break;
                                    }
                                    return (
                                      regionsData
                                        .find((r) =>
                                          r.items.find(
                                            (i) => i.value === issue.region,
                                          ),
                                        )
                                        ?.items.find(
                                          (i) => i.value === issue.region,
                                        )?.label || "Région inconnue"
                                    );
                                  })()
                                  : // Mode normal : utiliser les données de l'API avec anatomicalPart
                                  issue.anatomicalPart?.name ||
                                  "Région inconnue"}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {getLateralityLabel(issue.laterality)}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                {getTypeIcon(issue.type)}
                                {getTypeLabel(issue.type)}
                              </span>
                              <span>{getSeverityLabel(issue.severity)}</span>
                              {issue.interventionZone && (
                                <span>
                                  {
                                    interventionZones.find(
                                      (z) => z.value === issue.interventionZone,
                                    )?.label
                                  }
                                </span>
                              )}
                            </div>
                            {issue.notes && (
                              <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
                                {issue.notes}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onEditDysfunction?.(issue.id)}
                              className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveDysfunction(issue.id)}
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            >
                              <TrashIcon className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6">
                    <div className="w-12 h-12 rounded-full bg-muted/10 flex items-center justify-center mb-3">
                      <ActivityIcon className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Aucun élément anatomique identifié
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleOpenAddModal}
                      className="flex items-center gap-2"
                    >
                      <PlusIcon className="h-4 w-4" />
                      Ajouter un élément
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
        {/* Boutons d'aide et d'ajout - positionnés en bas à droite */}
        <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-2">
          <div className="group relative">
            <div className="bg-background/80 backdrop-blur-sm rounded-lg p-2 shadow-sm cursor-pointer hover:bg-background/90 transition-colors">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <QuestionMarkCircledIcon className="w-3 h-3" />
                <span>Aide</span>
              </div>
            </div>
            <div className="absolute bottom-full right-0 mb-2 opacity-0 translate-x-[100%] group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 ease-in-out">
              <div className="bg-background/95 backdrop-blur-sm rounded-lg p-3 shadow-lg w-72">
                <div className="space-y-3 text-xs text-muted-foreground">
                  <p>
                    Cette section vous permet d&apos;identifier et de documenter
                    les problèmes anatomiques :
                  </p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>
                      Cliquez sur le bouton + pour ajouter un nouvel élément
                    </li>
                    <li>Sélectionnez la région anatomique concernée</li>
                    <li>
                      Définissez la sévérité et ajoutez des notes si nécessaire
                    </li>
                    <li>
                      Utilisez les vues gauche/droite pour une meilleure
                      précision
                    </li>
                    <li>
                      Le bouton Éléments (en bas à gauche) ouvre un panneau
                      listant tous les problèmes identifiés avec leurs détails
                    </li>
                  </ul>

                  <div className="border-t pt-2 mt-3">
                    <p className="font-medium text-xs mb-2">
                      Raccourcis clavier :
                    </p>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span>Nouvel élément</span>
                        <div className="flex gap-1">
                          <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded border">
                            N
                          </kbd>
                          <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded border">
                            ⇧N
                          </kbd>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Vue gauche</span>
                        <div className="flex gap-1">
                          <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded border">
                            1
                          </kbd>
                          <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded border">
                            ⇧1
                          </kbd>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Vue droite</span>
                        <div className="flex gap-1">
                          <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded border">
                            2
                          </kbd>
                          <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded border">
                            ⇧2
                          </kbd>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Supprimer dernier</span>
                        <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded border">
                          ⇧D
                        </kbd>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Effacer tout</span>
                        <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded border">
                          ⇧C
                        </kbd>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Fermer modale</span>
                        <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded border">
                          Échap
                        </kbd>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <Button
            variant="default"
            size="icon"
            onClick={handleOpenAddModal}
            className="h-10 w-10 rounded-full relative group"
          >
            <PlusIcon className="h-5 w-5" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-background text-primary rounded-full flex items-center justify-center text-xs font-medium border opacity-80 group-hover:opacity-100 transition-opacity">
              N
            </div>
          </Button>
        </div>
        {/* Image anatomique avec overlay - zone fixe sans scroll */}
        <div className="h-full">
          <div className="flex items-center justify-center h-full">
            <AnatomicalImageWithOverlay
              anatomicalView={anatomicalView}
              filteredDysfunctions={filteredDysfunctions}
              renderAnatomicalSVG={renderAnatomicalSVG}
              animalData={animalData}
              isTestMode={isTestMode}
              selectedAnimalType={selectedAnimalType}
            />
          </div>
        </div>
      </div>
      {/* AddAnatomicalIssueDialog est géré au niveau du composant parent (advanced-report-builder) */}
    </div>
  );
}
