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
import type { InterventionZone, NewObservation } from "../data/dog/typesDog";
import {
  ActivityLogIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  CircleBackslashIcon,
  CounterClockwiseClockIcon,
  Cross2Icon,
  EyeOpenIcon,
  ListBulletIcon,
  MagnifyingGlassIcon,
} from "@radix-ui/react-icons";
import { cn } from "@/lib/style";
import { useEffect, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { getAnatomicalParts } from "@/lib/api/actions/reports.action";
import type { AnatomicalPart } from "@/lib/schemas/anatomicalPart";
import { AnatomicalHistoryAndDiagnosticPanel } from "./AnatomicalHistoryAndDiagnosticPanel";
import { resolveAnatomicalAnimalType } from "../anatomical-species";

type AnatomicalZone = "articulation" | "fascias" | "organes" | "muscles";

const dialogSteps = [
  { value: 1, label: "Type" },
  { value: 2, label: "Localisation" },
  { value: 3, label: "Détails" },
];

const observationTypeOptions = [
  {
    value: "static",
    title: "Observation statique",
    description: "Observation immédiate de l'état",
    Icon: EyeOpenIcon,
    selectedClasses: "border-sky-300 bg-sky-50/80 text-sky-950",
    iconClasses: "bg-sky-100 text-sky-700",
  },
  {
    value: "dynamic",
    title: "Observation dynamique",
    description: "Observation pendant le mouvement",
    Icon: ActivityLogIcon,
    selectedClasses: "border-teal-300 bg-teal-50/80 text-teal-950",
    iconClasses: "bg-teal-100 text-teal-700",
  },
  {
    value: "diagnosticExclusion",
    title: "Diagnostic d'exclusion",
    description: "Élimination d'une hypothèse diagnostique",
    Icon: CircleBackslashIcon,
    selectedClasses: "border-rose-300 bg-rose-50/80 text-rose-950",
    iconClasses: "bg-rose-100 text-rose-700",
  },
] as const;

const severityOptions = [
  {
    value: 1,
    label: "Légère",
    dot: "bg-emerald-500",
    selected: "border-emerald-300 bg-emerald-50 text-emerald-800",
  },
  {
    value: 2,
    label: "Modérée",
    dot: "bg-amber-500",
    selected: "border-amber-300 bg-amber-50 text-amber-800",
  },
  {
    value: 3,
    label: "Importante",
    dot: "bg-orange-500",
    selected: "border-orange-300 bg-orange-50 text-orange-800",
  },
  {
    value: 4,
    label: "Sévère",
    dot: "bg-red-500",
    selected: "border-red-300 bg-red-50 text-red-800",
  },
  {
    value: 5,
    label: "Critique",
    dot: "bg-rose-600",
    selected: "border-rose-300 bg-rose-50 text-rose-800",
  },
];

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
  const [isInterventionZoneSelectOpen, setIsInterventionZoneSelectOpen] =
    useState(false);
  const [hoveredSeverity, setHoveredSeverity] = useState<number | null>(null);
  const [isHistoryPanelOpen, setIsHistoryPanelOpen] = useState(false);

  const animalType = resolveAnatomicalAnimalType(animalData);
  const zone = selectedZone as AnatomicalZone | undefined;

  useEffect(() => {
    if (isOpen && !animalType) onOpenChange(false);
  }, [animalType, isOpen, onOpenChange]);

  // Récupérer les données anatomiques depuis la base de données
  const { data: anatomicalPartsResponse } = useQuery({
    queryKey: ["anatomicalParts", animalType, zone],
    queryFn: async () => {
      if (!animalType || !zone) {
        return [];
      }
      const result = await getAnatomicalParts({ animalType, zone });
      return result || [];
    },
    enabled: isOpen && !!animalType && !!selectedZone,
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

  const isSelectOpen = isInterventionZoneSelectOpen;

  return (
    <Credenza
      open={isOpen && !!animalType}
      onOpenChange={onOpenChange}
      disablePointerDismissal={isSelectOpen}
    >
      <CredenzaContent className="flex max-h-[90vh] flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-slate-50 p-0 shadow-[0_28px_90px_-48px_rgba(15,23,42,0.65)] sm:max-w-160">
        <CredenzaHeader className="shrink-0 border-b border-slate-200/70 bg-white px-5 py-5 sm:px-6">
          <div className="min-w-0 space-y-1.5 pr-10">
            <CredenzaTitle className="text-xl font-semibold tracking-tight text-slate-950">
              Ajouter une observation
            </CredenzaTitle>
            <p className="text-sm leading-relaxed text-slate-500">
              {currentStep === 1 &&
                "Choisissez la nature de ce que vous observez."}
              {currentStep === 2 &&
                "Renseignez la zone, la région et la latéralité."}
              {currentStep === 3 &&
                "Qualifiez la gravité et ajoutez vos notes."}
            </p>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2">
            {dialogSteps.map((step) => {
              const isActive = currentStep === step.value;
              const isComplete =
                step.value < currentStep && isStepComplete(step.value);

              return (
                <button
                  key={step.value}
                  type="button"
                  onClick={() => {
                    if (
                      step.value < currentStep ||
                      isStepComplete(currentStep)
                    ) {
                      setCurrentStep(step.value);
                    }
                  }}
                  className={cn(
                    "flex min-w-0 items-center gap-2 rounded-xl border px-3 py-2 text-left text-xs font-medium transition-all duration-200",
                    isActive
                      ? "border-slate-950 bg-slate-950 text-white shadow-sm"
                      : "border-slate-200 bg-slate-50 text-slate-500",
                    isComplete &&
                      "border-emerald-200 bg-emerald-50 text-emerald-700",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-5 shrink-0 items-center justify-center rounded-full text-[0.68rem] tabular-nums",
                      isActive
                        ? "bg-white/15 text-white"
                        : "bg-white text-slate-500",
                      isComplete && "bg-emerald-100 text-emerald-700",
                    )}
                  >
                    {isComplete ? (
                      <CheckIcon className="h-3 w-3" />
                    ) : (
                      step.value
                    )}
                  </span>
                  <span className="truncate">{step.label}</span>
                </button>
              );
            })}
          </div>
        </CredenzaHeader>

        <div className="flex-1 overflow-y-auto p-3 sm:p-4">
          {/* Étape 1: Type d'observation */}
          {currentStep === 1 && (
            <div className="grid gap-2.5">
              {observationTypeOptions.map((option) => {
                const isSelected = newObservation.type === option.value;
                const Icon = option.Icon;

                return (
                  <button
                    key={option.value}
                    type="button"
                    className={cn(
                      "group grid grid-cols-[2.35rem_minmax(0,1fr)_1.5rem] items-center gap-3 rounded-2xl border bg-white px-3.5 py-3 text-left shadow-[0_18px_45px_-38px_rgba(15,23,42,0.5)] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
                      "hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_22px_55px_-38px_rgba(15,23,42,0.62)] active:translate-y-0 active:scale-[0.99]",
                      isSelected
                        ? option.selectedClasses
                        : "border-slate-200 text-slate-950",
                    )}
                    onClick={() =>
                      setNewObservation({
                        ...newObservation,
                        type: option.value,
                      })
                    }
                  >
                    <span
                      className={cn(
                        "flex size-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition-colors",
                        isSelected && option.iconClasses,
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold tracking-tight">
                        {option.title}
                      </span>
                      <span
                        className={cn(
                          "mt-0.5 block text-sm leading-snug text-slate-500",
                          isSelected && "text-current/70",
                        )}
                      >
                        {option.description}
                      </span>
                    </span>
                    <span
                      className={cn(
                        "flex size-5 items-center justify-center rounded-full border border-slate-200 bg-white text-transparent transition-all",
                        isSelected &&
                          "border-slate-950 bg-slate-950 text-white",
                      )}
                    >
                      <CheckIcon className="h-3 w-3" />
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Étape 2: Localisation */}
          {currentStep === 2 && (
            <div className="space-y-4">
              {/* Zone d'intervention */}
              <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_18px_45px_-40px_rgba(15,23,42,0.45)]">
                <Label className="text-sm font-semibold text-slate-800">
                  Zone d&apos;intervention{" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Select
                  open={isInterventionZoneSelectOpen}
                  onOpenChange={setIsInterventionZoneSelectOpen}
                  value={newObservation.interventionZone}
                  onValueChange={(value) => {
                    setNewObservation({
                      ...newObservation,
                      interventionZone: value as InterventionZone,
                      region: "",
                    });
                    setRegionSearchTerm("");
                    setOpenRegionPopover(false);
                  }}
                >
                  <SelectTrigger
                    className={cn(
                      "h-11 w-full justify-between rounded-xl border-slate-200 bg-slate-50 text-sm shadow-none transition-all focus:ring-2 focus:ring-slate-950/10",
                      !newObservation.interventionZone ? "text-slate-400" : "",
                      newObservation.interventionZone
                        ? "border-slate-300 bg-white text-slate-950"
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
              <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_18px_45px_-40px_rgba(15,23,42,0.45)]">
                <Label className="text-sm font-semibold text-slate-800">
                  Région anatomique <span className="text-destructive">*</span>
                </Label>
                <div className="flex items-center gap-2">
                  <Popover
                    modal={false}
                    open={openRegionPopover}
                    onOpenChange={setOpenRegionPopover}
                  >
                    <PopoverTrigger
                      render={
                        <Button
                          variant="outline"
                          role="combobox"
                          disabled={!selectedZone}
                          className={cn(
                            "h-11 flex-1 justify-between rounded-xl border-slate-200 bg-slate-50 text-sm shadow-none transition-all hover:bg-white active:scale-[0.99]",
                            !newObservation.region ? "text-slate-400" : "",
                            newObservation.region
                              ? "border-slate-300 bg-white text-slate-950"
                              : "",
                          )}
                        >
                          {newObservation.region
                            ? getRegionName()
                            : selectedZone
                              ? "Sélectionner une région"
                              : "Sélectionner d'abord une zone"}
                          <MagnifyingGlassIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      }
                    />
                    <PopoverContent
                      className="w-(--anchor-width) gap-0 overflow-hidden rounded-2xl border-slate-200 bg-white p-0 shadow-[0_24px_80px_-42px_rgba(15,23,42,0.75)]"
                      align="start"
                    >
                      <div className="flex flex-col">
                        <div className="flex items-center border-b border-slate-100 bg-slate-50/80 px-3">
                          <MagnifyingGlassIcon className="mr-2 h-4 w-4 shrink-0 text-slate-400" />
                          <input
                            className="flex h-11 w-full bg-transparent py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                            placeholder="Rechercher une région..."
                            value={regionSearchTerm}
                            onChange={(e) =>
                              setRegionSearchTerm(e.target.value)
                            }
                            autoFocus
                          />
                        </div>

                        <ScrollArea className="h-62.5">
                          <div className="p-1">
                            {regionSearchTerm &&
                              filteredRegions.length === 0 && (
                                <div className="py-6 text-center text-sm text-slate-500">
                                  Aucune région trouvée
                                </div>
                              )}

                            {filteredRegions.map((part) => (
                              <div key={part.id} className="mb-1">
                                <div
                                  className={cn(
                                    "relative my-0.5 flex cursor-pointer select-none items-center rounded-xl px-3 py-2 text-sm text-slate-700 outline-none transition-colors hover:bg-slate-100 hover:text-slate-950",
                                    part.name === newObservation.region &&
                                      "bg-slate-950 text-white hover:bg-slate-950 hover:text-white",
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
                                    <CheckIcon className="ml-auto h-4 w-4" />
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </div>
                    </PopoverContent>
                  </Popover>
                  {newObservation.region &&
                    petId &&
                    anatomicalPartsResponse?.find(
                      (p) => p.name === newObservation.region,
                    )?.id && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setIsHistoryPanelOpen(true)}
                        className="group h-11 w-11 shrink-0 rounded-xl border border-slate-200 bg-white text-slate-500 transition-all hover:bg-slate-950 hover:text-white active:scale-[0.98]"
                        title="Voir l'historique et le diagnostic IA"
                      >
                        <CounterClockwiseClockIcon className="h-4 w-4" />
                      </Button>
                    )}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_18px_45px_-40px_rgba(15,23,42,0.45)]">
                <Label className="text-sm font-semibold text-slate-800">
                  Latéralité <span className="text-destructive">*</span>
                </Label>
                <div className="mt-3 grid grid-cols-3 gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1">
                  <button
                    type="button"
                    className={cn(
                      "rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 active:scale-[0.98]",
                      newObservation.laterality === "left"
                        ? "bg-slate-950 text-white shadow-sm"
                        : "text-slate-600 hover:bg-white hover:text-slate-950",
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
                      "rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 active:scale-[0.98]",
                      newObservation.laterality === "bilateral"
                        ? "bg-slate-950 text-white shadow-sm"
                        : "text-slate-600 hover:bg-white hover:text-slate-950",
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
                      "rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 active:scale-[0.98]",
                      newObservation.laterality === "right"
                        ? "bg-slate-950 text-white shadow-sm"
                        : "text-slate-600 hover:bg-white hover:text-slate-950",
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
                <div className="mt-3 flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <div className="size-1.5 shrink-0 rounded-full bg-slate-400" />
                  <p className="text-xs leading-relaxed text-slate-500">
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
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_18px_45px_-40px_rgba(15,23,42,0.45)]">
                <div className="flex items-center justify-between gap-3">
                  <Label className="text-sm font-semibold text-slate-800">
                    Gravité
                  </Label>
                  <span
                    className={cn(
                      "rounded-full border px-2.5 py-1 text-xs font-medium",
                      severityOptions.find(
                        (option) => option.value === newObservation.severity,
                      )?.selected,
                    )}
                  >
                    {getLevelLabel(newObservation.severity)}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-5 gap-2">
                  {severityOptions.map((option) => {
                    const isSelected = newObservation.severity === option.value;
                    const isPreviewed = hoveredSeverity === option.value;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        className={cn(
                          "group flex min-h-20 flex-col items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2 text-slate-500 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white active:translate-y-0 active:scale-[0.98]",
                          (isSelected || isPreviewed) && option.selected,
                        )}
                        onMouseEnter={() => setHoveredSeverity(option.value)}
                        onMouseLeave={() => setHoveredSeverity(null)}
                        onClick={() =>
                          setNewObservation({
                            ...newObservation,
                            severity: option.value,
                          })
                        }
                      >
                        <span
                          className={cn(
                            "flex size-8 items-center justify-center rounded-full bg-white text-sm font-semibold tabular-nums text-slate-700 shadow-sm",
                            isSelected && "text-slate-950",
                          )}
                        >
                          {option.value}
                        </span>
                        <span className="max-w-full truncate text-[0.68rem] font-medium">
                          {option.label}
                        </span>
                        <span
                          className={cn("h-1 w-7 rounded-full", option.dot)}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_18px_45px_-40px_rgba(15,23,42,0.45)]">
                <Label className="text-sm font-semibold text-slate-800">
                  Observations
                </Label>
                <Textarea
                  value={newObservation.notes}
                  onChange={(e) =>
                    setNewObservation({
                      ...newObservation,
                      notes: e.target.value,
                    })
                  }
                  placeholder="Décrivez vos observations..."
                  className="min-h-32 resize-none rounded-2xl border-slate-200 bg-slate-50 px-3.5 py-3 text-sm leading-relaxed text-slate-900 shadow-none placeholder:text-slate-400 focus-visible:border-slate-300 focus-visible:ring-2 focus-visible:ring-slate-950/10"
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-slate-200/70 bg-white px-5 py-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="rounded-xl text-slate-500 transition-all hover:bg-slate-100 hover:text-slate-950 active:scale-[0.98]"
          >
            <Cross2Icon className="mr-1 h-3.5 w-3.5" />
            Annuler
          </Button>

          <div className="flex items-center gap-2">
            {currentStep > 1 && (
              <Button
                variant="outline"
                size="sm"
                onClick={prevStep}
                className="rounded-xl border-slate-200 bg-white text-slate-700 shadow-none transition-all hover:bg-slate-100 hover:text-slate-950 active:scale-[0.98]"
              >
                <ArrowLeftIcon className="mr-1 h-3.5 w-3.5" />
                Retour
              </Button>
            )}

            {currentStep < 3 ? (
              <Button
                size="sm"
                onClick={nextStep}
                disabled={!isStepComplete(currentStep)}
                className="rounded-xl bg-slate-950 text-white shadow-sm transition-all hover:bg-slate-800 active:scale-[0.98]"
              >
                Continuer
                <ArrowRightIcon className="ml-1 h-3.5 w-3.5" />
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
                className="rounded-xl bg-slate-950 text-white shadow-sm transition-all hover:bg-slate-800 active:scale-[0.98]"
              >
                <ListBulletIcon className="mr-1 h-3.5 w-3.5" />
                {submitLabel || "Ajouter"}
              </Button>
            )}
          </div>
        </div>
      </CredenzaContent>

      {/* Panneau d'historique et diagnostic IA */}
      {petId &&
        newObservation.region &&
        anatomicalPartsResponse?.find((p) => p.name === newObservation.region)
          ?.id && (
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
    </Credenza>
  );
}
