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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import { resolveAnatomicalAnimalType } from "../../anatomical-species";

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
  selectedAnimalType,
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

  const animalType = resolveAnatomicalAnimalType(
    isTestMode ? { code: selectedAnimalType } : animalData,
  );

  // Récupérer toutes les données anatomiques depuis la base de données (seulement en mode normal)
  useQuery({
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

  if (!animalType) {
    return (
      <div className="flex h-full w-full items-center justify-center p-6">
        <div
          className="max-w-lg rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-950"
          role="status"
        >
          <p className="font-semibold">Espèce requise</p>
          <p className="mt-2 text-sm leading-relaxed">
            Complétez l’espèce dans la fiche de l’animal avant d’utiliser
            l’évaluation anatomique. Aucune anatomie n’est déduite
            automatiquement.
          </p>
        </div>
      </div>
    );
  }

  const testRegionPaths =
    animalType === "CAT"
      ? anatomicalCatRegionPaths
      : animalType === "HORSE"
        ? anatomicalHorseRegionPaths
        : anatomicalRegionPaths;
  const testRegionCategories =
    animalType === "CAT"
      ? anatomicalRegionsByCategoryCat
      : animalType === "HORSE"
        ? anatomicalRegionsByCategoryHorse
        : anatomicalRegionsByCategory;

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
            const regionData = testRegionPaths[dysfunction.region];
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
      <div className="relative isolate flex-1 min-h-0 overflow-hidden">
        {/* Image anatomique avec overlay - zone fixe sans scroll */}
        <div className="pointer-events-none absolute inset-0 z-0">
          <div className="flex h-full w-full items-center justify-center">
            <AnatomicalImageWithOverlay
              anatomicalView={anatomicalView}
              filteredDysfunctions={filteredDysfunctions}
              renderAnatomicalSVG={renderAnatomicalSVG}
              animalData={animalData}
              isTestMode={isTestMode}
              selectedAnimalType={selectedAnimalType}
              anatomicalAnimalType={animalType}
            />
          </div>
        </div>

        <div className="pointer-events-auto absolute right-4 top-4 z-30 inline-flex rounded-2xl border border-border bg-background/90 p-1 shadow-sm backdrop-blur">
          <Button
            variant="ghost"
            size="sm"
            aria-pressed={anatomicalView === "gauche"}
            className={cn(
              "h-9 rounded-xl px-3 text-sm font-semibold text-muted-foreground shadow-none hover:bg-muted hover:text-foreground",
              anatomicalView === "gauche" &&
              "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
            )}
            onClick={() => setAnatomicalView("gauche")}
          >
            Vue gauche
            <kbd
              className={cn(
                "ml-2 rounded-md bg-muted px-1.5 py-0.5 text-xs font-semibold text-muted-foreground",
                anatomicalView === "gauche" &&
                "bg-primary-foreground/15 text-primary-foreground/80",
              )}
            >
              1
            </kbd>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            aria-pressed={anatomicalView === "droite"}
            className={cn(
              "h-9 rounded-xl px-3 text-sm font-semibold text-muted-foreground shadow-none hover:bg-muted hover:text-foreground",
              anatomicalView === "droite" &&
              "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
            )}
            onClick={() => setAnatomicalView("droite")}
          >
            Vue droite
            <kbd
              className={cn(
                "ml-2 rounded-md bg-muted px-1.5 py-0.5 text-xs font-semibold text-muted-foreground",
                anatomicalView === "droite" &&
                "bg-primary-foreground/15 text-primary-foreground/80",
              )}
            >
              2
            </kbd>
          </Button>
        </div>

        <div className="pointer-events-auto absolute left-4 top-4 z-30 flex max-w-[calc(100%-17rem)] flex-wrap items-center gap-1 rounded-2xl border border-border bg-background/90 p-1 shadow-sm backdrop-blur">
          <Popover>
            <PopoverTrigger
              render={
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 gap-1.5 rounded-xl px-3 text-xs font-medium text-muted-foreground shadow-none hover:bg-muted hover:text-foreground data-[state=open]:bg-muted data-[state=open]:text-foreground"
                >
                  <QuestionMarkCircledIcon className="h-3.5 w-3.5" />
                  <span>Guide</span>
                </Button>
              }
            />
            <PopoverContent
              align="start"
              side="bottom"
              sideOffset={8}
              className="w-[22rem] gap-3 rounded-xl p-3 shadow-lg"
            >
              <div className="space-y-1">
                <p className="text-sm font-semibold">Évaluation anatomique</p>
                <p className="text-xs text-muted-foreground">
                  Ajoutez les zones concernées, qualifiez leur sévérité, puis
                  retrouvez-les dans le panneau Éléments.
                </p>
              </div>

              <div className="rounded-lg border bg-muted/30 p-2.5">
                <p className="mb-2 text-xs font-medium">
                  Légende des sévérités
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2 text-xs">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <span className="text-muted-foreground">Légère</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="h-2 w-2 rounded-full bg-yellow-500" />
                    <span className="text-muted-foreground">Modérée</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="h-2 w-2 rounded-full bg-orange-500" />
                    <span className="text-muted-foreground">Importante</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="h-2 w-2 rounded-full bg-red-500" />
                    <span className="text-muted-foreground">Sévère</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="h-2 w-2 rounded-full bg-purple-500" />
                    <span className="text-muted-foreground">Critique</span>
                  </div>
                </div>
              </div>

              <div className="grid gap-2 text-xs text-muted-foreground">
                <div className="rounded-lg border bg-background/70 p-2">
                  Utilisez les vues gauche/droite pour positionner les
                  observations avec plus de précision.
                </div>
                <div className="rounded-lg border bg-background/70 p-2">
                  Le panneau Éléments liste toutes les observations avec les
                  actions d&apos;édition et de suppression.
                </div>
              </div>

              <div className="border-t pt-3">
                <p className="mb-2 text-xs font-medium">Raccourcis clavier</p>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <div className="flex items-center justify-between gap-4">
                    <span>Nouvel élément</span>
                    <div className="flex gap-1">
                      <kbd className="rounded border bg-muted px-1.5 py-0.5 text-xs">
                        N
                      </kbd>
                      <kbd className="rounded border bg-muted px-1.5 py-0.5 text-xs">
                        ⇧N
                      </kbd>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span>Vue gauche</span>
                    <div className="flex gap-1">
                      <kbd className="rounded border bg-muted px-1.5 py-0.5 text-xs">
                        1
                      </kbd>
                      <kbd className="rounded border bg-muted px-1.5 py-0.5 text-xs">
                        ⇧1
                      </kbd>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span>Vue droite</span>
                    <div className="flex gap-1">
                      <kbd className="rounded border bg-muted px-1.5 py-0.5 text-xs">
                        2
                      </kbd>
                      <kbd className="rounded border bg-muted px-1.5 py-0.5 text-xs">
                        ⇧2
                      </kbd>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span>Supprimer dernier</span>
                    <kbd className="rounded border bg-muted px-1.5 py-0.5 text-xs">
                      ⇧D
                    </kbd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span>Effacer tout</span>
                    <kbd className="rounded border bg-muted px-1.5 py-0.5 text-xs">
                      ⇧C
                    </kbd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span>Fermer modale</span>
                    <kbd className="rounded border bg-muted px-1.5 py-0.5 text-xs">
                      Échap
                    </kbd>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <div>
            <Sheet>
              <SheetTrigger
                render={
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 gap-1.5 rounded-xl px-3 text-xs font-medium text-muted-foreground shadow-none hover:bg-muted hover:text-foreground"
                  >
                    <ListIcon className="h-3.5 w-3.5" />
                    <span>Éléments</span>
                    <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                      {dysfunctions.length}
                    </span>
                  </Button>
                }
              />
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
                                      return (
                                        testRegionCategories
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
                                        (z) =>
                                          z.value === issue.interventionZone,
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
                                onClick={() =>
                                  handleRemoveDysfunction(issue.id)
                                }
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

          <div className="flex items-center gap-1">
            <Button
              variant="default"
              size="sm"
              onClick={handleOpenAddModal}
              className="h-9 gap-2 rounded-xl px-3 text-xs font-semibold shadow-sm"
            >
              <PlusIcon className="h-3.5 w-3.5" />
              <span>Ajouter</span>
              <kbd className="rounded-md bg-primary-foreground/15 px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground/80">
                N
              </kbd>
            </Button>
          </div>
        </div>
      </div>
      {/* AddAnatomicalIssueDialog est géré au niveau du composant parent (advanced-report-builder) */}
    </div>
  );
}
