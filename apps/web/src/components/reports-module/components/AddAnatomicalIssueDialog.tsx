
import { Button } from "@/components/ui/button";
import {
  Credenza,
  CredenzaContent,
  CredenzaHeader,
  CredenzaTitle,
  CredenzaBody,
  CredenzaFooter,
} from "@/components/ui/credenza";
import {
  PlusIcon,
  ActivityIcon,
  AlertCircleIcon,
  Search,
  CheckIcon,
  XIcon,
  TestTubeIcon,
} from "lucide-react";
import { cn } from "@/lib/style";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuery } from "@tanstack/react-query";
import { getAnatomicalParts } from "@/lib/api/actions/reports.action";
import type { AnatomicalIssue } from "../types";
import { AnatomicalHistoryAndDiagnosticPanel } from "./AnatomicalHistoryAndDiagnosticPanel";
import {
  anatomicalRegionsByCategory,
  interventionZones,
} from "../data/dog/typesDog";
import { anatomicalRegionsByCategoryCat } from "../data/cat/typesCat";
import { anatomicalRegionsByCategoryHorse } from "../data/horse/typesHorse";
import type { AnatomicalPart } from "@/lib/schemas/anatomicalPart";
import { useHotkeys } from "react-hotkeys-hook";
import { VulgarisationPanel } from "@/components/ai/VulgarisationPanel";
import { SparklesIcon } from "@/components/ui/sparkles-icon";

interface AddAnatomicalIssueDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  issueType: "dysfunction" | "anatomicalSuspicion";
  newIssue: Omit<AnatomicalIssue, "id">;
  setNewIssue: (issue: Omit<AnatomicalIssue, "id">) => void;
  onAdd: (issueWithAnatomicalPart: Omit<AnatomicalIssue, "id">) => void;
  animalData?: {
    name?: string | null;
    code?: string | null;
  } | null;
  selectedZone?: string;
  isTestMode?: boolean;
  selectedAnimalType?: string;
  submitLabel?: string;
  petId?: string;
}

export function AddAnatomicalIssueDialog({
  isOpen,
  onOpenChange,
  newIssue,
  setNewIssue,
  onAdd,
  animalData,
  selectedZone,
  isTestMode = false,
  selectedAnimalType = "dog",
  submitLabel,
  petId,
}: AddAnatomicalIssueDialogProps) {
  const [regionSearchTerm, setRegionSearchTerm] = useState("");
  const [openRegionPopover, setOpenRegionPopover] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [hoveredSeverity, setHoveredSeverity] = useState<number | null>(null);
  const [isHistoryPanelOpen, setIsHistoryPanelOpen] = useState(false);
  const [isVulgarisationOpen, setIsVulgarisationOpen] = useState(false);

  // Configuration des raccourcis clavier pour la modale
  useHotkeys(
    "enter",
    () => {
      if (currentStep < 3 && isStepComplete(currentStep)) {
        nextStep();
      } else if (currentStep === 3 && isFormValid()) {
        // Valider et ajouter l'élément
        if (isTestMode) {
          onAdd(newIssue);
        } else {
          const anatomicalPart = currentAnatomicalData?.find(
            (part) => part.id === newIssue.region,
          );
          onAdd({
            ...newIssue,
            anatomicalPart: anatomicalPart as AnatomicalPart,
          });
        }
        setCurrentStep(1);
      }
    },
    {
      enabled: isOpen,
      preventDefault: true,
    },
  );

  useHotkeys(
    "arrowright",
    () => {
      if (currentStep < 3 && isStepComplete(currentStep)) {
        nextStep();
      }
    },
    {
      enabled: isOpen,
      preventDefault: true,
    },
  );

  useHotkeys(
    "arrowleft",
    () => {
      if (currentStep > 1) {
        prevStep();
      }
    },
    {
      enabled: isOpen,
      preventDefault: true,
    },
  );

  // Raccourcis pour la latéralité (étape 2)
  useHotkeys(
    "shift+g",
    () => {
      if (currentStep === 2) {
        setNewIssue({ ...newIssue, laterality: "left" });
      }
    },
    {
      enabled: isOpen && currentStep === 2,
      preventDefault: true,
    },
  );

  useHotkeys(
    "shift+d",
    () => {
      if (currentStep === 2) {
        setNewIssue({ ...newIssue, laterality: "right" });
      }
    },
    {
      enabled: isOpen && currentStep === 2,
      preventDefault: true,
    },
  );

  useHotkeys(
    "shift+b",
    () => {
      if (currentStep === 2) {
        setNewIssue({ ...newIssue, laterality: "bilateral" });
      }
    },
    {
      enabled: isOpen && currentStep === 2,
      preventDefault: true,
    },
  );

  // Raccourcis pour la sévérité (étape 3)
  useHotkeys(
    "shift+1, shift+2, shift+3, shift+4, shift+5",
    (_, hotkey) => {
      if (currentStep === 3) {
        const keyPressed = hotkey.keys?.[0] || "2";
        const severity = parseInt(keyPressed);
        setNewIssue({ ...newIssue, severity });
      }
    },
    {
      enabled: isOpen && currentStep === 3,
      preventDefault: true,
    },
  );

  // Raccourcis pour sélection rapide du type (étape 1)
  useHotkeys(
    "shift+f", // F pour dysFunction
    () => {
      if (currentStep === 1) {
        setNewIssue({ ...newIssue, type: "dysfunction" });
      }
    },
    {
      enabled: isOpen && currentStep === 1,
      preventDefault: true,
    },
  );

  useHotkeys(
    "shift+s", // S pour Suspicion
    () => {
      if (currentStep === 1) {
        setNewIssue({ ...newIssue, type: "anatomicalSuspicion" });
      }
    },
    {
      enabled: isOpen && currentStep === 1,
      preventDefault: true,
    },
  );

  // Déterminer le type d'animal pour la requête
  const getAnimalType = () => {
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
  const zone = (selectedZone || "articulation") as
    | "articulation"
    | "fascias"
    | "organes"
    | "muscles";

  // Fonction pour obtenir les données anatomiques selon le mode
  const getTestModeRegionsData = () => {
    switch (selectedAnimalType) {
      case "cat":
        return anatomicalRegionsByCategoryCat;
      case "horse":
        return anatomicalRegionsByCategoryHorse;
      case "dog":
      default:
        return anatomicalRegionsByCategory;
    }
  };

  // Récupérer les données anatomiques depuis la base de données (seulement si pas en mode test)
  const { data: anatomicalPartsResponse, isLoading } = useQuery({
    queryKey: ["anatomicalParts", animalType, zone],
    queryFn: async () => {
      const result = await getAnatomicalParts({ animalType, zone });
      console.log("🔍 Données récupérées de la base:", result);
      return result || [];
    },
    enabled: isOpen && !!animalType && !!zone && !isTestMode,
  });

  // Utiliser les données de test ou de la base selon le mode
  const currentAnatomicalData = isTestMode ? null : anatomicalPartsResponse;
  const currentRegionsData = isTestMode ? getTestModeRegionsData() : null;

  // Fonction pour obtenir le libellé d'un niveau de sévérité
  const getLevelLabel = (severity: number) => {
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

  // Fonction pour obtenir la couleur en fonction de la sévérité
  const getSeverityColor = (severity: number) => {
    switch (severity) {
      case 1:
        return "#4ade80"; // green-400
      case 2:
        return "#facc15"; // yellow-400
      case 3:
        return "#fb923c"; // orange-400
      case 4:
        return "#f87171"; // red-400
      case 5:
        return "#c084fc"; // purple-400
      default:
        return "#facc15"; // yellow-400
    }
  };

  // Obtenir les couleurs pour les types d'éléments
  const getTypeColors = (type: "dysfunction" | "anatomicalSuspicion") => {
    if (type === "dysfunction") {
      return {
        primaryColor: "text-primary",
        bgLight: "bg-primary/10",
        bgLighter: "bg-primary/5",
        borderSelected: "border-primary",
        iconBg: "bg-primary/20",
        buttonBg: "bg-primary hover:bg-primary/90",
        checkBg: "bg-primary",
        hoverBorder: "hover:border-primary/60",
      };
    } else {
      return {
        primaryColor: "text-primary",
        bgLight: "bg-primary/10",
        bgLighter: "bg-primary/5",
        borderSelected: "border-primary",
        iconBg: "bg-primary/20",
        buttonBg: "bg-primary hover:bg-primary/90",
        checkBg: "bg-primary",
        hoverBorder: "hover:border-primary/60",
      };
    }
  };

  // Filtrer les régions anatomiques selon le terme de recherche
  const filteredRegions =
    isTestMode && currentRegionsData
      ? currentRegionsData
        .map((category) => ({
          ...category,
          items: category.items.filter((region) =>
            region.label
              .toLowerCase()
              .includes(regionSearchTerm.toLowerCase()),
          ),
        }))
        .filter((category) => category.items.length > 0)
      : currentAnatomicalData
        ? currentAnatomicalData.filter((part) =>
          part.name.toLowerCase().includes(regionSearchTerm.toLowerCase()),
        )
        : [];

  // Obtenir le nom de la région sélectionnée
  const getRegionName = () => {
    if (isTestMode && currentRegionsData) {
      const allRegions = currentRegionsData.flatMap(
        (category) => category.items,
      );
      const region = allRegions.find((r) => r.value === newIssue.region);
      return region ? region.label : "Sélectionner une région";
    } else if (!isTestMode && currentAnatomicalData) {
      const region = currentAnatomicalData.find(
        (r) => r.id === newIssue.region,
      );
      return region ? region.name : "Sélectionner une région";
    }
    return "Sélectionner une région";
  };

  // Obtenir le nom de la zone d'intervention
  const getZoneName = () => {
    const zone = interventionZones.find(
      (z) => z.value === newIssue.interventionZone,
    );
    return zone ? zone.label : "Sélectionner une zone (optionnel)";
  };

  // Fonction pour avancer au prochain step
  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Fonction pour revenir au step précédent
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Vérifier si le step est complet
  const isStepComplete = (step: number) => {
    switch (step) {
      case 1:
        return !!newIssue.type;
      case 2:
        return !!newIssue.region && !!newIssue.laterality;
      case 3:
        return true; // Le step 3 est toujours complet
      default:
        return false;
    }
  };

  const isFormValid = () => {
    return !!newIssue.type && !!newIssue.region && !!newIssue.laterality;
  };

  return (
    <Credenza open={isOpen} onOpenChange={onOpenChange}>
      <CredenzaContent className="w-full sm:max-w-[550px] p-0 rounded-xl overflow-hidden border-none shadow-xl">
        {/* En-tête avec l'étape actuelle */}
        <div className="relative h-16 flex items-center justify-center bg-primary text-white">
          <CredenzaHeader className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center gap-1">
              <CredenzaTitle className="text-xl font-medium text-white z-10">
                {currentStep === 1 && "Choisir le type d'élément"}
                {currentStep === 2 && "Localiser l'élément"}
                {currentStep === 3 &&
                  (newIssue.type === "dysfunction"
                    ? "Sévérité & détails"
                    : "Indice de suspicion & détails")}
              </CredenzaTitle>
              {isTestMode && (
                <div className="flex items-center gap-1 text-xs bg-orange-500/20 px-2 py-1 rounded-full">
                  <TestTubeIcon className="h-3 w-3" />
                  Mode test - {selectedAnimalType}
                </div>
              )}
            </div>
          </CredenzaHeader>

          {/* Indicateur d'étapes */}
          <div className="absolute bottom-0 left-0 right-0 flex justify-center pb-1">
            <div className="flex gap-1">
              {[1, 2, 3].map((step) => (
                <div
                  key={step}
                  className={cn(
                    "h-1 rounded-full transition-all",
                    currentStep === step ? "w-10 bg-white" : "w-3 bg-white/40",
                    isStepComplete(step) && currentStep !== step
                      ? "bg-white/70"
                      : "",
                  )}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        <CredenzaBody className="p-6 pt-5">
          {/* Étape 1: Type d'élément */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4 px-6">
                {/* Card pour Dysfonction */}
                <div
                  className={cn(
                    "relative p-4 rounded-xl border-2 transition-all cursor-pointer overflow-hidden group hover:border-primary/60",
                    newIssue.type === "dysfunction"
                      ? "border-primary bg-primary/5"
                      : "border-gray-200",
                  )}
                  onClick={() =>
                    setNewIssue({ ...newIssue, type: "dysfunction" })
                  }
                >
                  {newIssue.type === "dysfunction" && (
                    <div className="absolute top-2 right-2 w-5 h-5 flex items-center justify-center rounded-full bg-primary text-white">
                      <CheckIcon className="h-3 w-3" />
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "p-2 rounded-lg transition-colors",
                        newIssue.type === "dysfunction"
                          ? "bg-primary/20"
                          : "bg-gray-100 group-hover:bg-primary/10",
                      )}
                    >
                      <ActivityIcon
                        className={cn(
                          "h-6 w-6 transition-colors",
                          newIssue.type === "dysfunction"
                            ? "text-primary"
                            : "text-gray-700",
                        )}
                      />
                    </div>
                    <div>
                      <h3
                        className={cn(
                          "font-medium transition-colors",
                          newIssue.type === "dysfunction"
                            ? "text-primary"
                            : "text-gray-200",
                        )}
                      >
                        Dysfonction
                      </h3>
                      <p className="text-sm text-gray-500 mt-0.5">
                        Problème fonctionnel affectant les mouvements ou la
                        proprioception
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card pour Suspicion d'atteinte */}
                <div
                  className={cn(
                    "relative p-4 rounded-xl border-2 transition-all cursor-pointer overflow-hidden group hover:border-amber-500/60",
                    newIssue.type === "anatomicalSuspicion"
                      ? "border-amber-500 bg-amber-500/5"
                      : "border-gray-200",
                  )}
                  onClick={() =>
                    setNewIssue({ ...newIssue, type: "anatomicalSuspicion" })
                  }
                >
                  {newIssue.type === "anatomicalSuspicion" && (
                    <div className="absolute top-2 right-2 w-5 h-5 flex items-center justify-center rounded-full bg-amber-500 text-white">
                      <CheckIcon className="h-3 w-3" />
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "p-2 rounded-lg transition-colors",
                        newIssue.type === "anatomicalSuspicion"
                          ? "bg-amber-100"
                          : "bg-gray-100 group-hover:bg-amber-50/70",
                      )}
                    >
                      <AlertCircleIcon
                        className={cn(
                          "h-6 w-6 transition-colors",
                          newIssue.type === "anatomicalSuspicion"
                            ? "text-amber-500"
                            : "text-gray-700",
                        )}
                      />
                    </div>
                    <div>
                      <h3
                        className={cn(
                          "font-medium transition-colors",
                          newIssue.type === "anatomicalSuspicion"
                            ? "text-amber-600"
                            : "text-gray-200",
                        )}
                      >
                        Suspicion d&apos;atteinte
                      </h3>
                      <p className="text-sm text-gray-500 mt-0.5">
                        Suspicion d&apos;une lésion ou pathologie anatomique à
                        investiguer
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Étape 2: Localisation */}
          {currentStep === 2 && (
            <div className="space-y-6 px-4 sm:px-6">
              {/* Sélecteur de zone d'intervention avec select - Maintenant placé en premier */}
              <div>
                <h3 className="text-sm font-medium mb-3 text-gray-700">
                  Zone d&apos;intervention{" "}
                  <span className="text-destructive">*</span>
                </h3>
                <Select
                  value={newIssue.interventionZone || ""}
                  onValueChange={(value) =>
                    setNewIssue({ ...newIssue, interventionZone: value })
                  }
                >
                  <SelectTrigger
                    className={cn(
                      "w-full justify-between h-10",
                      !newIssue.interventionZone ? "text-muted-foreground" : "",
                      newIssue.interventionZone
                        ? "border-primary bg-primary/5"
                        : "",
                    )}
                  >
                    <SelectValue placeholder="Sélectionner une zone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {interventionZones.map((zone) => (
                        <SelectItem key={zone.value} value={zone.value}>
                          {zone.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              {/* Sélecteur de région avec dropdown - Maintenant second élément */}
              <div>
                <h3 className="text-sm font-medium mb-3 text-gray-700">
                  Région anatomique <span className="text-destructive">*</span>
                </h3>
                <div className="flex items-center gap-2">
                  <DropdownMenu
                    open={openRegionPopover}
                    onOpenChange={setOpenRegionPopover}
                  >
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "flex-1 justify-between h-10",
                          !newIssue.region ? "text-muted-foreground" : "",
                          newIssue.region ? "border-primary bg-primary/5" : "",
                        )}
                      >
                        {newIssue.region
                          ? getRegionName()
                          : "Sélectionner une région"}
                        <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className="w-full p-0"
                      align="start"
                    >
                      <div className="flex flex-col">
                        <div className="flex items-center border-b px-3">
                          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                          <input
                            className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
                            placeholder="Rechercher une région..."
                            value={regionSearchTerm}
                            onChange={(e) => setRegionSearchTerm(e.target.value)}
                            autoFocus
                          />
                        </div>

                        <ScrollArea className="h-[300px]">
                          <div className="p-1">
                            {isLoading && (
                              <div className="py-6 text-center text-sm">
                                Chargement des données...
                              </div>
                            )}

                            {!isLoading &&
                              !isTestMode &&
                              currentAnatomicalData &&
                              currentAnatomicalData.length === 0 && (
                                <div className="py-6 text-center text-sm">
                                  <div className="text-muted-foreground">
                                    Aucune donnée trouvée dans la base
                                  </div>
                                  <div className="text-xs text-muted-foreground mt-1">
                                    Type: {animalType} | Zone: {zone}
                                  </div>
                                </div>
                              )}

                            {regionSearchTerm && filteredRegions.length === 0 && (
                              <div className="py-6 text-center text-sm">
                                Aucune région trouvée
                              </div>
                            )}

                            {/* Mode test : affichage par catégories */}
                            {isTestMode &&
                              Array.isArray(filteredRegions) &&
                              (
                                filteredRegions as {
                                  items: { value: string; label: string }[];
                                  category: string;
                                }[]
                              ).map((category, index) => (
                                <div key={index} className="mb-2">
                                  <h4 className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                                    {category.category}
                                  </h4>
                                  <div>
                                    {category.items.map(
                                      (
                                        region: { value: string; label: string },
                                        index2: number,
                                      ) => (
                                        <div
                                          key={index2}
                                          className={cn(
                                            "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 my-0.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                                            region.value === newIssue.region &&
                                            "bg-accent text-accent-foreground",
                                          )}
                                          onClick={() => {
                                            setNewIssue({
                                              ...newIssue,
                                              region: region.value,
                                            });
                                            setOpenRegionPopover(false);
                                          }}
                                        >
                                          {region.label}
                                          {region.value === newIssue.region && (
                                            <CheckIcon className="ml-auto h-4 w-4 text-primary" />
                                          )}
                                        </div>
                                      ),
                                    )}
                                  </div>
                                </div>
                              ))}

                            {/* Mode normal : affichage des données de l'API */}
                            {!isTestMode &&
                              Array.isArray(filteredRegions) &&
                              (
                                filteredRegions as { id: string; name: string }[]
                              ).map((part) => (
                                <div
                                  key={part.id}
                                  className={cn(
                                    "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 my-0.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                                    part.id === newIssue.region &&
                                    "bg-accent text-accent-foreground",
                                  )}
                                  onClick={() => {
                                    setNewIssue({ ...newIssue, region: part.id });
                                    setOpenRegionPopover(false);
                                  }}
                                >
                                  {part.name}
                                  {part.id === newIssue.region && (
                                    <CheckIcon className="ml-auto h-4 w-4 text-primary" />
                                  )}
                                </div>
                              ))}
                          </div>
                        </ScrollArea>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  {newIssue.region &&
                    petId &&
                    !isTestMode &&
                    currentAnatomicalData?.find(
                      (p) => p.id === newIssue.region,
                    )?.id && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsHistoryPanelOpen(true)}
                        className="h-10 w-10 shrink-0 group"
                        title="Voir l'historique et le diagnostic IA"
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="transition-all"
                        >
                          <defs>
                            <linearGradient
                              id="history-gradient-issues"
                              x1="0%"
                              y1="0%"
                              x2="100%"
                              y2="0%"
                            >
                              <stop
                                offset="0%"
                                stopColor="rgb(147 51 234)"
                                stopOpacity="0.8"
                                className="transition-all group-hover:[stop-opacity:1]"
                              />
                              <stop
                                offset="50%"
                                stopColor="rgb(219 39 119)"
                                stopOpacity="0.8"
                                className="transition-all group-hover:[stop-opacity:1]"
                              />
                              <stop
                                offset="100%"
                                stopColor="rgb(249 115 22)"
                                stopOpacity="0.8"
                                className="transition-all group-hover:[stop-opacity:1]"
                              />
                            </linearGradient>
                          </defs>
                          <path
                            d="M3 3v5h5M21 21v-5h-5M3 21l7-7m11-11l-7 7"
                            stroke="url(#history-gradient-issues)"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </Button>
                    )}
                </div>
              </div>

              {/* Sélection de latéralité avec visualisation - design compact */}
              <div>
                <h3 className="text-sm font-medium mb-3 text-gray-700">
                  Latéralité <span className="text-destructive">*</span>
                </h3>

                <div className="flex rounded-md overflow-hidden border mb-3">
                  <button
                    type="button"
                    className={cn(
                      "flex-1 py-1.5 text-sm font-medium transition-colors border-r",
                      newIssue.laterality === "left"
                        ? "bg-primary text-white"
                        : "bg-transparent text-gray-700 hover:bg-gray-50",
                    )}
                    onClick={() =>
                      setNewIssue({ ...newIssue, laterality: "left" })
                    }
                  >
                    Gauche
                  </button>
                  <button
                    type="button"
                    className={cn(
                      "flex-1 py-1.5 text-sm font-medium transition-colors border-r",
                      newIssue.laterality === "bilateral"
                        ? "bg-primary text-white"
                        : "bg-transparent text-gray-700 hover:bg-gray-50",
                    )}
                    onClick={() =>
                      setNewIssue({ ...newIssue, laterality: "bilateral" })
                    }
                  >
                    Bilatéral
                  </button>
                  <button
                    type="button"
                    className={cn(
                      "flex-1 py-1.5 text-sm font-medium transition-colors",
                      newIssue.laterality === "right"
                        ? "bg-primary text-white"
                        : "bg-transparent text-gray-700 hover:bg-gray-50",
                    )}
                    onClick={() =>
                      setNewIssue({ ...newIssue, laterality: "right" })
                    }
                  >
                    Droite
                  </button>
                </div>

                <div className="flex items-center bg-muted/20 rounded-lg p-2 gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary shrink-0"></div>
                  <p className="text-xs text-muted-foreground">
                    {newIssue.laterality === "left" &&
                      "Affecte uniquement le côté gauche du patient"}
                    {newIssue.laterality === "right" &&
                      "Affecte uniquement le côté droit du patient"}
                    {newIssue.laterality === "bilateral" &&
                      "Affecte les deux côtés du patient"}
                    {!newIssue.laterality &&
                      "Veuillez sélectionner la latéralité concernée"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Étape 3: Sévérité et notes */}
          {currentStep === 3 && (
            <div className="space-y-6 px-6">
              {/* Sélecteur de sévérité visuel */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-4">
                  {newIssue.type === "dysfunction"
                    ? "Sévérité"
                    : "Indice de suspicion"}
                </h3>

                <div className="mb-2 flex items-center justify-between">
                  <span
                    className={cn(
                      "text-sm font-medium px-3 py-1 rounded-full",
                      newIssue.severity === 1
                        ? "bg-green-100 text-green-700"
                        : newIssue.severity === 2
                          ? "bg-yellow-100 text-yellow-700"
                          : newIssue.severity === 3
                            ? "bg-orange-100 text-orange-700"
                            : newIssue.severity === 4
                              ? "bg-red-100 text-red-700"
                              : "bg-purple-100 text-purple-700",
                    )}
                  >
                    {getLevelLabel(newIssue.severity)}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <button
                      key={level}
                      type="button"
                      className={cn(
                        "w-full aspect-square rounded-md cursor-pointer transition-all relative overflow-hidden focus:outline-none",
                        newIssue.severity === level || hoveredSeverity === level
                          ? "ring-2 ring-offset-1"
                          : "opacity-80 hover:opacity-100",
                      )}
                      style={{ backgroundColor: getSeverityColor(level) }}
                      onMouseEnter={() => setHoveredSeverity(level)}
                      onMouseLeave={() => setHoveredSeverity(null)}
                      onClick={() =>
                        setNewIssue({ ...newIssue, severity: level })
                      }
                    >
                      <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-xl">
                        {level}
                      </span>
                      <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] text-gray-600">
                        {level === 1 && "Légère"}
                        {level === 3 && "Modérée"}
                        {level === 5 && "Critique"}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-700">
                    Notes
                  </h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsVulgarisationOpen(true)}
                    className="h-8 text-xs gap-1.5 group hover:bg-gradient-to-r hover:from-purple-50/30 hover:via-pink-50/30 hover:to-orange-50/30 dark:hover:from-purple-950/20 dark:hover:via-pink-950/20 dark:hover:to-orange-950/20"
                  >
                    <SparklesIcon className="h-3.5 w-3.5" gradientId="sparkles-gradient-anatomical" />
                    <span className="bg-gradient-to-r from-purple-600/80 via-pink-600/80 to-orange-600/80 bg-clip-text text-transparent group-hover:from-purple-600 group-hover:via-pink-600 group-hover:to-orange-600">
                      Vulgariser
                    </span>
                  </Button>
                </div>
                <div className="relative">
                  <textarea
                    value={newIssue.notes}
                    onChange={(e) =>
                      setNewIssue({ ...newIssue, notes: e.target.value })
                    }
                    placeholder={`Détails sur ${newIssue.type === "dysfunction" ? "la dysfonction" : "la suspicion d'atteinte"}...`}
                    className="w-full min-h-[100px] resize-none rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </div>
                {newIssue.notes && (
                  <p className="text-xs text-muted-foreground mt-1.5">
                    Utilisez le bouton "Vulgariser" pour transformer le texte technique en langage clair pour vos clients.
                  </p>
                )}
              </div>
            </div>
          )}
        </CredenzaBody>

        {/* Actions du footer */}
        <CredenzaFooter className="py-4 px-4 sm:px-6 border-t flex items-center justify-between flex-wrap gap-2">
          {/* Aide raccourcis clavier */}
          <div className="max-sm:hidden flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-muted rounded border text-xs">
                ←/→
              </kbd>
              <span>Navigation</span>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-muted rounded border text-xs">
                Entrée
              </kbd>
              <span>Valider</span>
            </div>
          </div>

          {/* Boutons de navigation */}
          <div className="flex items-center gap-2">
            {currentStep > 1 && (
              <Button variant="outline" size="sm" onClick={prevStep}>
                Retour
              </Button>
            )}

            {currentStep < 3 ? (
              <Button
                size="sm"
                onClick={nextStep}
                disabled={!isStepComplete(currentStep)}
                className={cn(
                  "shadow-sm",
                  currentStep === 1 && newIssue.type === "dysfunction"
                    ? "bg-primary hover:bg-primary/90"
                    : "",
                  currentStep === 1 && newIssue.type === "anatomicalSuspicion"
                    ? "bg-amber-500 hover:bg-amber-600"
                    : "",
                  !newIssue.type ? "bg-primary hover:bg-primary/90" : "",
                )}
              >
                Continuer
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => {
                  if (isTestMode) {
                    // Mode test : passer simplement les données
                    onAdd(newIssue);
                  } else {
                    // Mode normal : récupérer l'objet anatomique depuis les données de l'API
                    const anatomicalPart = currentAnatomicalData?.find(
                      (part) => part.id === newIssue.region,
                    );
                    onAdd({
                      ...newIssue,
                      anatomicalPart: anatomicalPart as AnatomicalPart,
                    });
                  }
                  setCurrentStep(1);
                }}
                disabled={!isFormValid()}
                className={cn(
                  "shadow-sm",
                  newIssue.type === "dysfunction"
                    ? "bg-primary hover:bg-primary/90"
                    : "bg-amber-500 hover:bg-amber-600",
                )}
              >
                <PlusIcon className="h-3.5 w-3.5 mr-1" />
                {submitLabel || "Ajouter"}
              </Button>
            )}
          </div>

          {/* Bouton d'annulation */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onOpenChange(false);
              setCurrentStep(1);
            }}
            className="text-gray-500 hover:bg-gray-100/50"
          >
            <XIcon className="h-3.5 w-3.5 mr-1" />
            Annuler
          </Button>
        </CredenzaFooter>
      </CredenzaContent>

      {/* Panneau d'historique et diagnostic IA */}
      {petId &&
        newIssue.region &&
        !isTestMode &&
        currentAnatomicalData?.find((p) => p.id === newIssue.region)?.id && (
          <AnatomicalHistoryAndDiagnosticPanel
            petId={petId}
            anatomicalPartId={newIssue.region}
            type={newIssue.type}
            currentIssue={{
              type: newIssue.type,
              severity: newIssue.severity,
              laterality: newIssue.laterality,
              notes: newIssue.notes,
            }}
            isOpen={isHistoryPanelOpen}
            onOpenChange={setIsHistoryPanelOpen}
          />
        )}

      {/* Panel de vulgarisation */}
      <VulgarisationPanel
        isOpen={isVulgarisationOpen}
        onOpenChange={setIsVulgarisationOpen}
        initialText={newIssue.notes || ""}
        onTextInsert={(text) => {
          setNewIssue({ ...newIssue, notes: text });
        }}
      />
    </Credenza>
  );
}
