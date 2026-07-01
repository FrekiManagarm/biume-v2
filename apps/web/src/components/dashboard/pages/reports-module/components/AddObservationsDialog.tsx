
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Credenza,
  CredenzaContent,
  CredenzaHeader,
  CredenzaTitle,
} from "@/components/ui/credenza";
import { interventionZones } from "../data/dog/typesDog";
import type {
  InterventionZone,
  NewObservation,
} from "../data/dog/typesDog";
import {
  ListChecksIcon,
  EyeIcon,
  Activity,
  XIcon,
  Search,
  CheckIcon,
  Ban,
} from "lucide-react";
import { cn } from "@/lib/style";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { getAnatomicalParts } from "@/lib/api/actions/reports.action";
import type { AnatomicalPart } from "@/lib/schemas/anatomicalPart";
import { AnatomicalHistoryAndDiagnosticPanel } from "./AnatomicalHistoryAndDiagnosticPanel";
import { VulgarisationPanel } from "@/components/ai/VulgarisationPanel";
import { SparklesIcon } from "@/components/ui/sparkles-icon";

interface AddObservationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  newObservation: NewObservation;
  setNewObservation: (observation: NewObservation) => void;
  onAdd: (observationWithAnatomicalPart: NewObservation) => void;
  animalData?: {
    name?: string | null;
    code?: string | null;
  } | null;
  selectedZone?: string;
  submitLabel?: string;
  petId?: string;
}

export function AddObservationDialog({
  isOpen,
  onOpenChange,
  newObservation,
  setNewObservation,
  onAdd,
  animalData,
  selectedZone,
  submitLabel,
  petId,
}: AddObservationDialogProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [regionSearchTerm, setRegionSearchTerm] = useState("");
  const [openRegionPopover, setOpenRegionPopover] = useState(false);
  const [hoveredSeverity, setHoveredSeverity] = useState<number | null>(null);
  const [isHistoryPanelOpen, setIsHistoryPanelOpen] = useState(false);
  const [isVulgarisationOpen, setIsVulgarisationOpen] = useState(false);

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

  // Récupérer les données anatomiques depuis la base de données
  const { data: anatomicalPartsResponse } = useQuery({
    queryKey: ["anatomicalParts", animalType, zone],
    queryFn: async () => {
      const result = await getAnatomicalParts({ animalType, zone });
      console.log("🔍 Données récupérées de la base:", result);
      return result || [];
    },
    enabled: isOpen && !!animalType && !!zone,
  });

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

  const handleReset = () => {
    setRegionSearchTerm("");
    setOpenRegionPopover(false);
    setCurrentStep(1);
    onOpenChange(false);
  };

  // Vérifier si le step est complet
  const isStepComplete = (step: number) => {
    switch (step) {
      case 1:
        return !!newObservation.type;
      case 2:
        return (
          !!newObservation.region &&
          !!newObservation.interventionZone &&
          !!newObservation.laterality
        );
      case 3:
        return true; // Le step 3 est toujours complet
      default:
        return false;
    }
  };

  // Vérifier si le formulaire est valide
  const isFormValid = () => {
    return (
      !!newObservation.type &&
      !!newObservation.region &&
      !!newObservation.interventionZone &&
      !!newObservation.laterality
    );
  };

  // Filtrer les régions anatomiques selon le terme de recherche
  const filteredRegions = anatomicalPartsResponse
    ? anatomicalPartsResponse.filter((part) =>
      part.name.toLowerCase().includes(regionSearchTerm.toLowerCase()),
    )
    : [];

  // Plus besoin de mapping complexe ! Les données SVG sont directement dans la DB

  // Obtenir le nom de la région sélectionnée (on stocke directement le nom)
  const getRegionName = () => {
    return newObservation.region || "Sélectionner une région";
  };

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

  return (
    <Credenza open={isOpen} onOpenChange={onOpenChange}>
      <CredenzaContent className="sm:max-w-[500px] p-0 rounded-xl overflow-hidden border-none shadow-xl max-h-[90vh] flex flex-col">
        <CredenzaHeader className="relative h-16 flex items-center justify-center bg-gradient-to-r from-primary to-primary/80 text-white flex-shrink-0">
          <CredenzaTitle className="text-xl font-medium text-white z-10">
            {currentStep === 1 && "Choisir le type d'observation"}
            {currentStep === 2 && "Localiser l'observation"}
            {currentStep === 3 && "Détails de l'observation"}
          </CredenzaTitle>

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
        </CredenzaHeader>

        <div className="p-5 pt-4 flex-1 overflow-y-auto">
          {/* Étape 1: Type d'observation */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                {/* Observation statique */}
                <button
                  type="button"
                  className={cn(
                    "relative p-3 rounded-xl border-2 transition-all cursor-pointer overflow-hidden group hover:border-primary/60",
                    newObservation.type === "static"
                      ? "border-primary bg-primary/10 ring-1 ring-primary/30 shadow-sm"
                      : "border-border bg-muted/20",
                  )}
                  onClick={() =>
                    setNewObservation({
                      ...newObservation,
                      type: "static",
                    })
                  }
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "p-2 rounded-lg transition-colors",
                        newObservation.type === "static"
                          ? "bg-primary/20"
                          : "bg-muted group-hover:bg-primary/10",
                      )}
                    >
                      <EyeIcon
                        className={cn(
                          "h-6 w-6 transition-colors",
                          newObservation.type === "static"
                            ? "text-primary"
                            : "text-foreground/70",
                        )}
                      />
                    </div>
                    <div>
                      <h3
                        className={cn(
                          "font-medium transition-colors text-base",
                          newObservation.type === "static"
                            ? "text-primary"
                            : "text-foreground",
                        )}
                      >
                        Observation statique
                      </h3>
                      <p className="text-sm mt-0.5 {newObservation.type === 'static' ? 'text-foreground/80' : 'text-muted-foreground'}">
                        Observation immédiate de l&apos;état
                      </p>
                    </div>
                  </div>
                </button>

                {/* Observation dynamique */}
                <button
                  type="button"
                  className={cn(
                    "relative p-3 rounded-xl border-2 transition-all cursor-pointer overflow-hidden group hover:border-primary/60",
                    newObservation.type === "dynamic"
                      ? "border-primary bg-primary/10 ring-1 ring-primary/30 shadow-sm"
                      : "border-border bg-muted/20",
                  )}
                  onClick={() =>
                    setNewObservation({
                      ...newObservation,
                      type: "dynamic",
                    })
                  }
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "p-2 rounded-lg transition-colors",
                        newObservation.type === "dynamic"
                          ? "bg-primary/20"
                          : "bg-muted group-hover:bg-primary/10",
                      )}
                    >
                      <Activity
                        className={cn(
                          "h-6 w-6 transition-colors",
                          newObservation.type === "dynamic"
                            ? "text-primary"
                            : "text-foreground/70",
                        )}
                      />
                    </div>
                    <div>
                      <h3
                        className={cn(
                          "font-medium transition-colors text-base",
                          newObservation.type === "dynamic"
                            ? "text-primary"
                            : "text-foreground",
                        )}
                      >
                        Observation dynamique
                      </h3>
                      <p className="text-sm mt-0.5 {newObservation.type === 'dynamic' ? 'text-foreground/80' : 'text-muted-foreground'}">
                        Observation pendant le mouvement
                      </p>
                    </div>
                  </div>
                </button>

                {/* Diagnostic d'exclusion */}
                <button
                  type="button"
                  className={cn(
                    "relative p-3 rounded-xl border-2 transition-all cursor-pointer overflow-hidden group hover:border-red-500/60",
                    newObservation.type === "diagnosticExclusion"
                      ? "border-red-500 bg-red-500/10 ring-1 ring-red-400/30 shadow-sm"
                      : "border-border bg-muted/20",
                  )}
                  onClick={() =>
                    setNewObservation({
                      ...newObservation,
                      type: "diagnosticExclusion",
                    })
                  }
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "p-2 rounded-lg transition-colors",
                        newObservation.type === "diagnosticExclusion"
                          ? "bg-red-500/15"
                          : "bg-muted group-hover:bg-red-50/70",
                      )}
                    >
                      <Ban
                        className={cn(
                          "h-6 w-6 transition-colors",
                          newObservation.type === "diagnosticExclusion"
                            ? "text-red-500"
                            : "text-foreground/70",
                        )}
                      />
                    </div>
                    <div>
                      <h3
                        className={cn(
                          "font-medium transition-colors text-base",
                          newObservation.type === "diagnosticExclusion"
                            ? "text-red-600"
                            : "text-foreground",
                        )}
                      >
                        Diagnostic d&apos;exclusion
                      </h3>
                      <p className="text-sm mt-0.5 {newObservation.type === 'diagnosticExclusion' ? 'text-foreground/80' : 'text-muted-foreground'}">
                        Élimination d&apos;une hypothèse diagnostique
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Étape 2: Localisation */}
          {currentStep === 2 && (
            <div className="space-y-4">
              {/* Zone d'intervention */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Zone d&apos;intervention{" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={newObservation.interventionZone}
                  onValueChange={(value) =>
                    setNewObservation({
                      ...newObservation,
                      interventionZone: value as InterventionZone,
                    })
                  }
                >
                  <SelectTrigger
                    className={cn(
                      "w-full justify-between h-10",
                      !newObservation.interventionZone
                        ? "text-muted-foreground"
                        : "",
                      newObservation.interventionZone
                        ? "border-primary bg-primary/5"
                        : "",
                    )}
                  >
                    <SelectValue placeholder="Sélectionner une zone d'intervention" />
                  </SelectTrigger>
                  <SelectContent>
                    {interventionZones.map((zone) => (
                      <SelectItem key={zone.value} value={zone.value}>
                        {zone.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Région anatomique */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Région anatomique <span className="text-destructive">*</span>
                </Label>
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
                          !newObservation.region ? "text-muted-foreground" : "",
                          newObservation.region
                            ? "border-primary bg-primary/5"
                            : "",
                        )}
                      >
                        {newObservation.region
                          ? getRegionName()
                          : "Sélectionner une région"}
                        <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className="w-[var(--radix-dropdown-menu-trigger-width)] p-0"
                      align="start"
                    >
                      <div className="flex flex-col">
                        <div className="flex items-center border-b px-3">
                          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                          <input
                            className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
                            placeholder="Rechercher une région..."
                            value={regionSearchTerm}
                            onChange={(e) => setRegionSearchTerm(e.target.value)}
                            autoFocus
                          />
                        </div>

                        <ScrollArea className="h-[250px]">
                          <div className="p-1">
                            {regionSearchTerm && filteredRegions.length === 0 && (
                              <div className="py-6 text-center text-sm">
                                Aucune région trouvée
                              </div>
                            )}

                            {filteredRegions.map((part) => (
                              <div key={part.id} className="mb-2">
                                <div
                                  className={cn(
                                    "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 my-0.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                                    part.name === newObservation.region &&
                                    "bg-accent text-accent-foreground",
                                  )}
                                  onClick={() => {
                                    setNewObservation({
                                      ...newObservation,
                                      region: part.name,
                                    });
                                    setOpenRegionPopover(false);
                                  }}
                                >
                                  {part.name}
                                  {part.name === newObservation.region && (
                                    <CheckIcon className="ml-auto h-4 w-4 text-primary" />
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  {newObservation.region &&
                    petId &&
                    anatomicalPartsResponse?.find(
                      (p) => p.name === newObservation.region,
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
                              id="history-gradient-observations"
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
                            stroke="url(#history-gradient-observations)"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </Button>
                    )}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Latéralité <span className="text-destructive">*</span>
                </Label>
                <div className="mt-2 flex rounded-md overflow-hidden border mb-3">
                  <button
                    type="button"
                    className={cn(
                      "flex-1 py-1.5 text-sm font-medium transition-colors border-r",
                      newObservation.laterality === "left"
                        ? "bg-primary text-white"
                        : "bg-transparent text-gray-700 hover:bg-gray-50",
                    )}
                    onClick={() =>
                      setNewObservation({
                        ...newObservation,
                        laterality: "left",
                      })
                    }
                  >
                    Gauche
                  </button>
                  <button
                    type="button"
                    className={cn(
                      "flex-1 py-1.5 text-sm font-medium transition-colors border-r",
                      newObservation.laterality === "bilateral"
                        ? "bg-primary text-white"
                        : "bg-transparent text-gray-700 hover:bg-gray-50",
                    )}
                    onClick={() =>
                      setNewObservation({
                        ...newObservation,
                        laterality: "bilateral",
                      })
                    }
                  >
                    Bilatéral
                  </button>
                  <button
                    type="button"
                    className={cn(
                      "flex-1 py-1.5 text-sm font-medium transition-colors",
                      newObservation.laterality === "right"
                        ? "bg-primary text-white"
                        : "bg-transparent text-gray-700 hover:bg-gray-50",
                    )}
                    onClick={() =>
                      setNewObservation({
                        ...newObservation,
                        laterality: "right",
                      })
                    }
                  >
                    Droite
                  </button>
                </div>
                <div className="flex items-center bg-muted/20 rounded-lg p-2 gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                  <p className="text-xs text-muted-foreground">
                    {newObservation.laterality === "left" &&
                      "Affecte uniquement le côté gauche du patient"}
                    {newObservation.laterality === "right" &&
                      "Affecte uniquement le côté droit du patient"}
                    {newObservation.laterality === "bilateral" &&
                      "Affecte les deux côtés du patient"}
                    {!newObservation.laterality &&
                      "Veuillez sélectionner la latéralité concernée"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Gravité
                </Label>
                <div className="mb-2 mt-2 flex items-center justify-between">
                  <span
                    className={cn(
                      "text-sm font-medium px-3 py-1 rounded-full",
                      newObservation.severity === 1
                        ? "bg-green-100 text-green-700"
                        : newObservation.severity === 2
                          ? "bg-yellow-100 text-yellow-700"
                          : newObservation.severity === 3
                            ? "bg-orange-100 text-orange-700"
                            : newObservation.severity === 4
                              ? "bg-red-100 text-red-700"
                              : "bg-purple-100 text-purple-700",
                    )}
                  >
                    {getLevelLabel(newObservation.severity)}
                  </span>
                </div>
                <div className="flex justify-between gap-1 mt-2">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <div
                      key={level}
                      className="flex-1"
                      onMouseEnter={() => setHoveredSeverity(level)}
                      onMouseLeave={() => setHoveredSeverity(null)}
                    >
                      <div
                        className={cn(
                          "w-full aspect-square rounded-md cursor-pointer transition-all relative overflow-hidden",
                          newObservation.severity === level ||
                            hoveredSeverity === level
                            ? "ring-2 ring-offset-1"
                            : "opacity-70 hover:opacity-100",
                        )}
                        style={{ backgroundColor: getSeverityColor(level) }}
                        onClick={() =>
                          setNewObservation({
                            ...newObservation,
                            severity: level,
                          })
                        }
                      >
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-white font-bold text-xl">
                            {level}
                          </span>
                        </div>
                      </div>
                      <span className="block text-center text-xs mt-1 text-gray-600">
                        {level === 1 && "Légère"}
                        {level === 3 && "Modérée"}
                        {level === 5 && "Critique"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-gray-700">
                    Observations
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsVulgarisationOpen(true)}
                    className="h-8 text-xs gap-1.5 group hover:bg-gradient-to-r hover:from-purple-50/30 hover:via-pink-50/30 hover:to-orange-50/30 dark:hover:from-purple-950/20 dark:hover:via-pink-950/20 dark:hover:to-orange-950/20"
                  >
                    <SparklesIcon className="h-3.5 w-3.5" gradientId="sparkles-gradient-observations" />
                    <span className="bg-gradient-to-r from-purple-600/80 via-pink-600/80 to-orange-600/80 bg-clip-text text-transparent group-hover:from-purple-600 group-hover:via-pink-600 group-hover:to-orange-600">
                      Vulgariser
                    </span>
                  </Button>
                </div>
                <Textarea
                  value={newObservation.notes}
                  onChange={(e) =>
                    setNewObservation({
                      ...newObservation,
                      notes: e.target.value,
                    })
                  }
                  placeholder="Décrivez vos observations..."
                  className="resize-none min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
                {newObservation.notes && (
                  <p className="text-xs text-muted-foreground mt-1.5">
                    Utilisez le bouton "Vulgariser" pour transformer le texte technique en langage clair pour vos clients.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="py-3 px-5 border-t flex items-center justify-between flex-shrink-0">
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
                className="shadow-sm bg-primary hover:bg-primary/90"
              >
                Continuer
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => {
                  // Récupérer l'objet anatomique depuis les données de l'API
                  const anatomicalPart = anatomicalPartsResponse?.find(
                    (part) => part.name === newObservation.region,
                  );

                  // Ajouter l'objet anatomique à l'observation
                  const observationWithAnatomicalPart = {
                    ...newObservation,
                    anatomicalPart: anatomicalPart as AnatomicalPart,
                  };

                  onAdd(observationWithAnatomicalPart);
                  setCurrentStep(1);
                }}
                disabled={!isFormValid()}
                className="shadow-sm bg-primary hover:bg-primary/90"
              >
                <ListChecksIcon className="h-3.5 w-3.5 mr-1" />
                {submitLabel || "Ajouter"}
              </Button>
            )}
          </div>

          {/* Bouton d'annulation */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="text-gray-500 hover:bg-gray-100/50"
          >
            <XIcon className="h-3.5 w-3.5 mr-1" />
            Annuler
          </Button>
        </div>
      </CredenzaContent>

      {/* Panneau d'historique et diagnostic IA */}
      {petId &&
        newObservation.region &&
        anatomicalPartsResponse?.find(
          (p) => p.name === newObservation.region,
        )?.id && (
          <AnatomicalHistoryAndDiagnosticPanel
            petId={petId}
            anatomicalPartId={
              anatomicalPartsResponse.find(
                (p) => p.name === newObservation.region,
              )?.id || ""
            }
            type="observation"
            currentIssue={{
              type: "observation",
              severity: newObservation.severity,
              laterality: newObservation.laterality,
              notes: newObservation.notes,
            }}
            isOpen={isHistoryPanelOpen}
            onOpenChange={setIsHistoryPanelOpen}
          />
        )}

      {/* Panel de vulgarisation */}
      <VulgarisationPanel
        isOpen={isVulgarisationOpen}
        onOpenChange={setIsVulgarisationOpen}
        initialText={newObservation.notes || ""}
        onTextInsert={(text) => {
          setNewObservation({ ...newObservation, notes: text });
        }}
      />
    </Credenza>
  );
}
