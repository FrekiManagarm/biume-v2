import { Button } from "@/components/ui/button";
import {
  Credenza,
  CredenzaContent,
  CredenzaHeader,
  CredenzaTitle,
} from "@/components/ui/credenza";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import {
  ActivityLogIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  CounterClockwiseClockIcon,
  Cross2Icon,
  ExclamationTriangleIcon,
  ListBulletIcon,
  MagicWandIcon,
  MagnifyingGlassIcon,
  MixerHorizontalIcon,
} from "@radix-ui/react-icons";
import { cn } from "@/lib/style";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useHotkeys } from "react-hotkeys-hook";
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
import { VulgarisationPanel } from "@/components/ai/VulgarisationPanel";

type AnatomicalZone = "articulation" | "fascias" | "organes" | "muscles";

const dialogSteps = [
  { value: 1, label: "Type" },
  { value: 2, label: "Localisation" },
  { value: 3, label: "Détails" },
];

const issueTypeOptions = [
  {
    value: "dysfunction",
    title: "Dysfonction",
    description:
      "Problème fonctionnel affectant les mouvements ou la proprioception",
    Icon: ActivityLogIcon,
    selectedClasses: "border-sky-300 bg-sky-50/80 text-sky-950",
    iconClasses: "bg-sky-100 text-sky-700",
  },
  {
    value: "anatomicalSuspicion",
    title: "Suspicion d'atteinte",
    description:
      "Suspicion d'une lésion ou pathologie anatomique à investiguer",
    Icon: ExclamationTriangleIcon,
    selectedClasses: "border-amber-300 bg-amber-50/80 text-amber-950",
    iconClasses: "bg-amber-100 text-amber-700",
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
  const [isInterventionZoneSelectOpen, setIsInterventionZoneSelectOpen] =
    useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [hoveredSeverity, setHoveredSeverity] = useState<number | null>(null);
  const [isHistoryPanelOpen, setIsHistoryPanelOpen] = useState(false);
  const [isVulgarisationOpen, setIsVulgarisationOpen] = useState(false);

  const getAnimalType = () => {
    const animalName = animalData?.name?.toLowerCase() || "";
    const animalCode = animalData?.code?.toLowerCase() || "";

    if (
      animalName.includes("chat") ||
      animalName.includes("cat") ||
      animalCode.includes("cat")
    ) {
      return "CAT";
    }

    if (
      animalName.includes("cheval") ||
      animalName.includes("horse") ||
      animalCode.includes("horse")
    ) {
      return "HORSE";
    }

    return "DOG";
  };

  const animalType = getAnimalType();
  const zone = selectedZone as AnatomicalZone | undefined;

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

  const { data: anatomicalPartsResponse, isLoading } = useQuery({
    queryKey: ["anatomicalParts", animalType, zone],
    queryFn: async () => {
      if (!zone) {
        return [];
      }
      const result = await getAnatomicalParts({ animalType, zone });
      return result || [];
    },
    enabled: isOpen && !!animalType && !!selectedZone && !isTestMode,
  });

  const currentAnatomicalData = isTestMode ? null : anatomicalPartsResponse;
  const currentRegionsData = isTestMode ? getTestModeRegionsData() : null;

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

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

  const isStepComplete = (step: number) => {
    switch (step) {
      case 1:
        return !!newIssue.type;
      case 2:
        return !!newIssue.region && !!newIssue.laterality;
      case 3:
        return true;
      default:
        return false;
    }
  };

  const isFormValid = () => {
    return !!newIssue.type && !!newIssue.region && !!newIssue.laterality;
  };

  const addIssue = () => {
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
  };

  useHotkeys(
    "enter",
    () => {
      if (currentStep < 3 && isStepComplete(currentStep)) {
        nextStep();
      } else if (currentStep === 3 && isFormValid()) {
        addIssue();
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

  useHotkeys(
    "shift+1, shift+2, shift+3, shift+4, shift+5",
    (_, hotkey) => {
      if (currentStep === 3) {
        const keyPressed = hotkey.keys?.[0] || "2";
        const severity = Number.parseInt(keyPressed);
        setNewIssue({ ...newIssue, severity });
      }
    },
    {
      enabled: isOpen && currentStep === 3,
      preventDefault: true,
    },
  );

  useHotkeys(
    "shift+f",
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
    "shift+s",
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

  const getRegionName = () => {
    if (isTestMode && currentRegionsData) {
      const allRegions = currentRegionsData.flatMap(
        (category) => category.items,
      );
      const region = allRegions.find((r) => r.value === newIssue.region);
      return region ? region.label : "Sélectionner une région";
    }

    if (!isTestMode && currentAnatomicalData) {
      const region = currentAnatomicalData.find(
        (r) => r.id === newIssue.region,
      );
      return region ? region.name : "Sélectionner une région";
    }

    return "Sélectionner une région";
  };

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

  const selectedSeverity = severityOptions.find(
    (option) => option.value === newIssue.severity,
  );
  const isSelectOpen = isInterventionZoneSelectOpen;

  return (
    <Credenza
      open={isOpen}
      onOpenChange={onOpenChange}
      disablePointerDismissal={isSelectOpen}
    >
      <CredenzaContent className="flex max-h-[90vh] flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-slate-50 p-0 shadow-[0_28px_90px_-48px_rgba(15,23,42,0.65)] sm:max-w-[640px]">
        <CredenzaHeader className="shrink-0 border-b border-slate-200/70 bg-white px-5 py-5 sm:px-6">
          <div className="min-w-0 space-y-1.5 pr-10">
            <CredenzaTitle className="text-xl font-semibold tracking-tight text-slate-950">
              Ajouter un élément anatomique
            </CredenzaTitle>
            <p className="text-sm leading-relaxed text-slate-500">
              {currentStep === 1 &&
                "Choisissez la nature de l'élément à documenter."}
              {currentStep === 2 &&
                "Renseignez la zone, la région et la latéralité."}
              {currentStep === 3 &&
                (newIssue.type === "anatomicalSuspicion"
                  ? "Qualifiez l'indice de suspicion et ajoutez vos notes."
                  : "Qualifiez la sévérité et ajoutez vos notes.")}
            </p>
            {isTestMode && (
              <div className="inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-2.5 py-1 text-xs font-medium text-orange-700">
                <MixerHorizontalIcon className="h-3 w-3" />
                Mode test - {selectedAnimalType}
              </div>
            )}
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
          {currentStep === 1 && (
            <div className="grid gap-2.5">
              {issueTypeOptions.map((option) => {
                const isSelected = newIssue.type === option.value;
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
                      setNewIssue({
                        ...newIssue,
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

          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_18px_45px_-40px_rgba(15,23,42,0.45)]">
                <Label className="text-sm font-semibold text-slate-800">
                  Zone d&apos;intervention{" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Select
                  open={isInterventionZoneSelectOpen}
                  onOpenChange={setIsInterventionZoneSelectOpen}
                  value={newIssue.interventionZone || ""}
                  onValueChange={(value) => {
                    setNewIssue({
                      ...newIssue,
                      interventionZone: value,
                      region: "",
                    });
                    setRegionSearchTerm("");
                    setOpenRegionPopover(false);
                  }}
                >
                  <SelectTrigger
                    className={cn(
                      "h-11 w-full justify-between rounded-xl border-slate-200 bg-slate-50 text-sm shadow-none transition-all focus:ring-2 focus:ring-slate-950/10",
                      !newIssue.interventionZone ? "text-slate-400" : "",
                      newIssue.interventionZone
                        ? "border-slate-300 bg-white text-slate-950"
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

              <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_18px_45px_-40px_rgba(15,23,42,0.45)]">
                <Label className="text-sm font-semibold text-slate-800">
                  Région anatomique <span className="text-destructive">*</span>
                </Label>
                <div className="flex items-center gap-2">
                  <DropdownMenu
                    modal={false}
                    open={openRegionPopover}
                    onOpenChange={setOpenRegionPopover}
                  >
                    <DropdownMenuTrigger
                      render={
                        <Button
                          variant="outline"
                          role="combobox"
                          disabled={!selectedZone}
                          className={cn(
                            "h-11 flex-1 justify-between rounded-xl border-slate-200 bg-slate-50 text-sm shadow-none transition-all hover:bg-white active:scale-[0.99]",
                            !newIssue.region ? "text-slate-400" : "",
                            newIssue.region
                              ? "border-slate-300 bg-white text-slate-950"
                              : "",
                          )}
                        >
                          {newIssue.region
                            ? getRegionName()
                            : selectedZone
                              ? "Sélectionner une région"
                              : "Sélectionner d'abord une zone"}
                          <MagnifyingGlassIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      }
                    />
                    <DropdownMenuContent
                      className="w-[var(--radix-dropdown-menu-trigger-width)] overflow-hidden rounded-2xl border-slate-200 bg-white p-0 shadow-[0_24px_80px_-42px_rgba(15,23,42,0.75)]"
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

                        <ScrollArea className="h-[250px]">
                          <div className="p-1">
                            {isLoading && (
                              <div className="py-6 text-center text-sm text-slate-500">
                                Chargement des données...
                              </div>
                            )}

                            {!isLoading &&
                              !isTestMode &&
                              currentAnatomicalData &&
                              currentAnatomicalData.length === 0 && (
                                <div className="py-6 text-center text-sm">
                                  <div className="text-slate-500">
                                    Aucune donnée trouvée dans la base
                                  </div>
                                  <div className="mt-1 text-xs text-slate-400">
                                    Type: {animalType} | Zone: {zone}
                                  </div>
                                </div>
                              )}

                            {regionSearchTerm &&
                              filteredRegions.length === 0 && (
                                <div className="py-6 text-center text-sm text-slate-500">
                                  Aucune région trouvée
                                </div>
                              )}

                            {isTestMode &&
                              Array.isArray(filteredRegions) &&
                              (
                                filteredRegions as {
                                  items: { value: string; label: string }[];
                                  category: string;
                                }[]
                              ).map((category, index) => (
                                <div key={index} className="mb-2">
                                  <h4 className="px-3 py-1.5 text-xs font-medium text-slate-400">
                                    {category.category}
                                  </h4>
                                  <div>
                                    {category.items.map(
                                      (
                                        region: {
                                          value: string;
                                          label: string;
                                        },
                                        index2: number,
                                      ) => (
                                        <div
                                          key={index2}
                                          className={cn(
                                            "relative my-0.5 flex cursor-pointer select-none items-center rounded-xl px-3 py-2 text-sm text-slate-700 outline-none transition-colors hover:bg-slate-100 hover:text-slate-950",
                                            region.value === newIssue.region &&
                                              "bg-slate-950 text-white hover:bg-slate-950 hover:text-white",
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
                                            <CheckIcon className="ml-auto h-4 w-4" />
                                          )}
                                        </div>
                                      ),
                                    )}
                                  </div>
                                </div>
                              ))}

                            {!isTestMode &&
                              Array.isArray(filteredRegions) &&
                              (
                                filteredRegions as {
                                  id: string;
                                  name: string;
                                }[]
                              ).map((part) => (
                                <div
                                  key={part.id}
                                  className={cn(
                                    "relative my-0.5 flex cursor-pointer select-none items-center rounded-xl px-3 py-2 text-sm text-slate-700 outline-none transition-colors hover:bg-slate-100 hover:text-slate-950",
                                    part.id === newIssue.region &&
                                      "bg-slate-950 text-white hover:bg-slate-950 hover:text-white",
                                  )}
                                  onClick={() => {
                                    setNewIssue({
                                      ...newIssue,
                                      region: part.id,
                                    });
                                    setOpenRegionPopover(false);
                                  }}
                                >
                                  {part.name}
                                  {part.id === newIssue.region && (
                                    <CheckIcon className="ml-auto h-4 w-4" />
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
                    currentAnatomicalData?.find((p) => p.id === newIssue.region)
                      ?.id && (
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
                  {[
                    { value: "left", label: "Gauche" },
                    { value: "bilateral", label: "Bilatéral" },
                    { value: "right", label: "Droite" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={cn(
                        "rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 active:scale-[0.98]",
                        newIssue.laterality === option.value
                          ? "bg-slate-950 text-white shadow-sm"
                          : "text-slate-600 hover:bg-white hover:text-slate-950",
                      )}
                      onClick={() =>
                        setNewIssue({
                          ...newIssue,
                          laterality: option.value as
                            "left" | "right" | "bilateral",
                        })
                      }
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                <div className="mt-3 flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <div className="size-1.5 shrink-0 rounded-full bg-slate-400" />
                  <p className="text-xs leading-relaxed text-slate-500">
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

          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_18px_45px_-40px_rgba(15,23,42,0.45)]">
                <div className="flex items-center justify-between gap-3">
                  <Label className="text-sm font-semibold text-slate-800">
                    {newIssue.type === "anatomicalSuspicion"
                      ? "Indice de suspicion"
                      : "Sévérité"}
                  </Label>
                  <span
                    className={cn(
                      "rounded-full border px-2.5 py-1 text-xs font-medium",
                      selectedSeverity?.selected,
                    )}
                  >
                    {getLevelLabel(newIssue.severity)}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-5 gap-2">
                  {severityOptions.map((option) => {
                    const isSelected = newIssue.severity === option.value;
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
                          setNewIssue({
                            ...newIssue,
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
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold text-slate-800">
                    Notes
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsVulgarisationOpen(true)}
                    className="h-8 gap-1.5 rounded-xl border-slate-200 bg-white text-xs text-slate-700 shadow-none transition-all hover:bg-slate-950 hover:text-white active:scale-[0.98]"
                  >
                    <MagicWandIcon className="h-3.5 w-3.5" />
                    Vulgariser
                  </Button>
                </div>
                <Textarea
                  value={newIssue.notes}
                  onChange={(e) =>
                    setNewIssue({ ...newIssue, notes: e.target.value })
                  }
                  placeholder={`Détails sur ${newIssue.type === "dysfunction" ? "la dysfonction" : "la suspicion d'atteinte"}...`}
                  className="min-h-[128px] resize-none rounded-2xl border-slate-200 bg-slate-50 px-3.5 py-3 text-sm leading-relaxed text-slate-900 shadow-none placeholder:text-slate-400 focus-visible:border-slate-300 focus-visible:ring-2 focus-visible:ring-slate-950/10"
                />
                {newIssue.notes && (
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
                    Utilisez le bouton "Vulgariser" pour transformer le texte
                    technique en langage clair pour vos clients.
                  </p>
                )}
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
                onClick={addIssue}
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
