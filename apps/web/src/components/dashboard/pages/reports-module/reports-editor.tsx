import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPatientById } from "@/lib/api/actions/patients.action";
import { updateReport } from "@/lib/api/actions/reports.action";
import type { InferSelectModel } from "drizzle-orm";
import type { advancedReport } from "@/lib/schemas/advancedReport/advancedReport";
import { AnimalCredenza } from "@/components/animal-folder";
import { ObservationsTab } from "./components/tabs/ObservationsTab";
import { NotesTab } from "./components/tabs/NotesTab";
import { RecommendationsTab } from "./components/tabs/RecommendationsTab";
import { AnatomicalEvaluationTab } from "./components/tabs/AnatomicalEvaluationTab";
import { AddObservationDialog } from "./components/AddObservationsDialog";
import { AddAnatomicalIssueDialog } from "./components/AddAnatomicalIssueDialog";
import { ReportPreview } from "./components/ReportPreview";
import { ExitConfirmationDialog } from "./components/ExitConfirmationDialog";
import { ReportSidebarNavigation } from "./components/ReportSidebarNavigation";
import { PatientCard } from "./components/PatientCard";
import { VulgarisationPanel } from "@/components/ai/VulgarisationPanel";
import { ReportReminderDialog } from "./components/ReportReminderDialog";
import { TestModeSection } from "./components/TestModeSection";
import {
  buildReportUpdatePayload,
  invalidateReportUpdateQueries,
  type ReportUpdateStatus,
} from "./reports-editor.helpers";

import type {
  Observation,
  NewObservation,
  AnatomicalIssue,
  InterventionZone,
} from "./types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ListTodoIcon,
  ActivityIcon,
  CheckIcon,
  FileTextIcon,
  ClipboardListIcon,
  HeartHandshakeIcon,
  ChevronLeftIcon,
  EyeIcon,
  SaveIcon,
  PlusIcon,
  KeyboardIcon,
  AlertTriangle,
  MessageCircleIcon,
} from "lucide-react";
import { cn } from "@/lib/style";
import { toast } from "sonner";
import { useHotkeys } from "react-hotkeys-hook";
import {
  Credenza,
  CredenzaContent,
  CredenzaHeader,
  CredenzaTitle,
  CredenzaBody,
  CredenzaFooter,
} from "@/components/ui/credenza";
import type {
  AdvancedReportRecommendations,
  Pet,
  AnatomicalIssue as AnatomicalIssueSchema,
  Appointment,
} from "@/lib/schemas";

type ReportData = InferSelectModel<typeof advancedReport> & {
  patient?: Pet;
  anatomicalIssues?: AnatomicalIssueSchema[];
  recommendations?: AdvancedReportRecommendations[];
  appointment?: Appointment | null;
};

interface AdvancedReportEditorProps {
  reportId: string;
  orgId: string;
  initialData: ReportData;
}

export function AdvancedReportEditor({
  reportId,
  orgId,
  initialData,
}: AdvancedReportEditorProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fonction helper pour charger les observations
  const getObservationType = (
    observationType: string,
  ): "static" | "dynamic" | "none" => {
    switch (observationType) {
      case "dynamic":
        return "dynamic";
      case "static":
        return "static";
      default:
        return "none";
    }
  };

  // Préparer les observations initiales
  const initialObservations: Observation[] =
    initialData.anatomicalIssues
      ?.filter((issue: AnatomicalIssueSchema) => issue.type === "observation")
      .map((issue: AnatomicalIssueSchema) => ({
        id: issue.id,
        region: issue.anatomicalPart?.name || issue.notes || "",
        severity: issue.severity,
        notes: issue.notes || "",
        type: getObservationType(issue.observationType || "none"),
        dysfunctionType: undefined,
        interventionZone: issue.anatomicalPart?.zone as
          InterventionZone | undefined,
        laterality: issue.laterality,
        anatomicalPart: issue.anatomicalPart,
      })) || [];

  // Préparer les problèmes anatomiques initiaux
  const initialAnatomicalIssues: AnatomicalIssue[] =
    initialData.anatomicalIssues
      ?.filter((issue: AnatomicalIssueSchema) => issue.type !== "observation")
      .map((issue: AnatomicalIssueSchema) => ({
        id: issue.id,
        type: issue.type as "dysfunction" | "anatomicalSuspicion",
        region: issue.anatomicalPart?.name || issue.notes || "",
        severity: issue.severity,
        notes: issue.notes || "",
        interventionZone: issue.anatomicalPart?.zone as
          InterventionZone | undefined,
        laterality: issue.laterality,
        anatomicalPart: issue.anatomicalPart,
      })) || [];

  // Préparer les recommandations initiales
  const initialRecommendations: { id: string; content: string }[] =
    initialData.recommendations?.map((rec) => ({
      id: rec.id || crypto.randomUUID(),
      content: rec.recommendation || "",
    })) || [];

  const appointmentDetails = initialData.appointment
    ? {
        beginAt: new Date(initialData.appointment.beginAt),
        endAt: new Date(initialData.appointment.endAt),
        status: initialData.appointment.status,
        atHome: initialData.appointment.atHome,
      }
    : undefined;

  // Initialisation directe des états avec les données
  const [selectedPetId, setSelectedPetId] = useState<string>(
    initialData.patientId || "",
  );
  const [title, setTitle] = useState(
    initialData.title ||
      "Compte rendu détaillé du " + new Date().toLocaleDateString(),
  );
  const [observations, setObservations] =
    useState<Observation[]>(initialObservations);
  const [notes, setNotes] = useState(initialData.notes || "");
  const [showPreview, setShowPreview] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "clinical" | "notes" | "recommendations" | "anatomical"
  >("clinical");
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const [editingObservationId, setEditingObservationId] = useState<
    string | null
  >(null);
  const [consultationReason, setConsultationReason] = useState<string>(
    initialData.consultationReason || "",
  );
  const [recommendations, setRecommendations] = useState<
    { id: string; content: string }[]
  >(initialRecommendations);
  const [anatomicalIssues, setAnatomicalIssues] = useState<AnatomicalIssue[]>(
    initialAnatomicalIssues,
  );
  const [showExitConfirmDialog, setShowExitConfirmDialog] = useState(false);
  const [isAddAnatomicalIssueOpen, setIsAddAnatomicalIssueOpen] =
    useState(false);
  const [isAnimalCredenzaOpen, setIsAnimalCredenzaOpen] = useState(false);
  const [editingAnatomicalIssueId, setEditingAnatomicalIssueId] = useState<
    string | null
  >(null);
  const [isTestMode, setIsTestMode] = useState(false);
  const [selectedAnimalType, setSelectedAnimalType] = useState("dog");
  const [anatomicalView, setAnatomicalView] = useState<"gauche" | "droite">(
    "gauche",
  );
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isVulgarisationOpen, setIsVulgarisationOpen] = useState(false);
  const [isReminderDialogOpen, setIsReminderDialogOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // État initial sauvegardé pour la détection des changements
  const [lastSavedState, setLastSavedState] = useState({
    title:
      initialData.title ||
      "Compte rendu détaillé du " + new Date().toLocaleDateString(),
    observations: initialObservations,
    notes: initialData.notes || "",
    consultationReason: initialData.consultationReason || "",
    recommendations: initialRecommendations,
    anatomicalIssues: initialAnatomicalIssues,
  });

  // État temporaire pour le nouveau problème anatomique
  const [newAnatomicalIssue, setNewAnatomicalIssue] = useState<
    Omit<AnatomicalIssue, "id">
  >({
    type: "dysfunction",
    region: "",
    severity: 2,
    notes: "",
    interventionZone: "",
    laterality: "left",
  });

  // Fonction pour vérifier si l'état actuel a des modifications
  const checkForUnsavedChanges = useCallback(() => {
    const currentState = {
      title,
      observations,
      notes,
      consultationReason,
      recommendations,
      anatomicalIssues,
    };

    const hasChanges =
      currentState.title !== lastSavedState.title ||
      JSON.stringify(currentState.observations) !==
        JSON.stringify(lastSavedState.observations) ||
      currentState.notes !== lastSavedState.notes ||
      currentState.consultationReason !== lastSavedState.consultationReason ||
      JSON.stringify(currentState.recommendations) !==
        JSON.stringify(lastSavedState.recommendations) ||
      JSON.stringify(currentState.anatomicalIssues) !==
        JSON.stringify(lastSavedState.anatomicalIssues);

    setHasUnsavedChanges(hasChanges);
  }, [
    title,
    observations,
    notes,
    consultationReason,
    recommendations,
    anatomicalIssues,
    lastSavedState,
  ]);

  // Effet pour détecter les changements
  useEffect(() => {
    checkForUnsavedChanges();
  }, [
    title,
    observations,
    notes,
    consultationReason,
    recommendations,
    anatomicalIssues,
    checkForUnsavedChanges,
  ]);

  // Configuration des raccourcis clavier globaux
  useHotkeys(
    "shift+n",
    () => {
      if (activeTab === "anatomical") {
        setIsAddAnatomicalIssueOpen(true);
      } else if (activeTab === "clinical") {
        setIsAddSheetOpen(true);
      }
    },
    {
      description: "Ouvrir la modale d'ajout d'élément (Shift+N)",
      enabled: activeTab === "anatomical" || activeTab === "clinical",
      preventDefault: true,
      enableOnFormTags: true,
      enableOnContentEditable: true,
    },
  );

  useHotkeys(
    "shift+1",
    () => {
      if (activeTab === "anatomical") {
        setAnatomicalView("gauche");
      }
    },
    {
      description: "Basculer vers la vue gauche (Shift+1)",
      enabled: activeTab === "anatomical",
      preventDefault: true,
      enableOnFormTags: true,
      enableOnContentEditable: true,
    },
  );

  useHotkeys(
    "shift+2",
    () => {
      if (activeTab === "anatomical") {
        setAnatomicalView("droite");
      }
    },
    {
      description: "Basculer vers la vue droite (Shift+2)",
      enabled: activeTab === "anatomical",
      preventDefault: true,
      enableOnFormTags: true,
      enableOnContentEditable: true,
    },
  );

  useHotkeys(
    "shift+d",
    () => {
      if (activeTab === "anatomical" && anatomicalIssues.length > 0) {
        const lastIssue = anatomicalIssues[anatomicalIssues.length - 1];
        setAnatomicalIssues(
          anatomicalIssues.filter((d) => d.id !== lastIssue.id),
        );
      }
    },
    {
      description: "Supprimer le dernier élément ajouté",
      enabled: activeTab === "anatomical" && anatomicalIssues.length > 0,
      preventDefault: true,
      enableOnFormTags: true,
      enableOnContentEditable: true,
    },
  );

  useHotkeys(
    "shift+c",
    () => {
      if (activeTab === "anatomical" && anatomicalIssues.length > 0) {
        setAnatomicalIssues([]);
      }
    },
    {
      description: "Effacer tous les éléments",
      enabled: activeTab === "anatomical" && anatomicalIssues.length > 0,
      preventDefault: true,
      enableOnFormTags: true,
      enableOnContentEditable: true,
    },
  );

  useHotkeys(
    "escape",
    () => {
      if (activeTab === "anatomical" && isAddAnatomicalIssueOpen) {
        setIsAddAnatomicalIssueOpen(false);
      }
    },
    {
      description: "Fermer la modale d'ajout",
      enabled: activeTab === "anatomical" && isAddAnatomicalIssueOpen,
      preventDefault: true,
      enableOnFormTags: true,
      enableOnContentEditable: true,
    },
  );

  useHotkeys(
    "mod+s",
    async () => {
      await handleUpdateReport("draft");
    },
    {
      description: "Sauvegarder le rapport (Cmd/Ctrl+S)",
      preventDefault: true,
      enableOnFormTags: true,
      enableOnContentEditable: true,
    },
  );

  // Récupération des détails de l'animal sélectionné
  const { data: petData } = useQuery({
    queryKey: ["pet", selectedPetId],
    queryFn: () => getPatientById(selectedPetId),
    enabled: !!selectedPetId,
  });

  // État temporaire pour la nouvelle observation
  const [newObservation, setNewObservation] = useState<NewObservation>({
    region: "",
    severity: 1,
    notes: "",
    type: "static",
    dysfunctionType: undefined,
    interventionZone: undefined,
    laterality: "left",
  });

  const handleAddObservation = (
    observationWithAnatomicalPart: NewObservation,
  ) => {
    if (
      !observationWithAnatomicalPart.region ||
      !observationWithAnatomicalPart.type
    )
      return;

    if (editingObservationId) {
      setObservations((prev) =>
        prev.map((obs) =>
          obs.id === editingObservationId
            ? {
                ...obs,
                ...observationWithAnatomicalPart,
                id: editingObservationId,
              }
            : obs,
        ),
      );
    } else {
      const observation: Observation = {
        id: crypto.randomUUID(),
        ...observationWithAnatomicalPart,
      };
      setObservations([...observations, observation]);
    }
    setNewObservation({
      region: "",
      severity: 1,
      notes: "",
      type: newObservation.type,
      dysfunctionType: undefined,
      interventionZone: undefined,
      laterality: "left",
    });
    setEditingObservationId(null);
    setIsAddSheetOpen(false);
  };

  const handleRemoveObservation = (id: string) => {
    setObservations(observations.filter((obs) => obs.id !== id));
  };

  const handleOpenAddObservation = () => {
    setEditingObservationId(null);
    setIsAddSheetOpen(true);
  };

  const handleEditObservation = (id: string) => {
    const obs = observations.find((o) => o.id === id);
    if (!obs) return;
    setEditingObservationId(id);
    setNewObservation({
      region: obs.region,
      severity: obs.severity,
      notes: obs.notes,
      type: obs.type,
      dysfunctionType: obs.dysfunctionType,
      interventionZone: obs.interventionZone,
      laterality: obs.laterality,
    });
    setIsAddSheetOpen(true);
  };

  // Mutation pour mettre à jour le rapport
  const updateReportMutation = useMutation({
    mutationFn: updateReport,
    onSuccess: async (data) => {
      if (data?.success) {
        toast.success("Rapport mis à jour avec succès");
        await invalidateReportUpdateQueries(queryClient, reportId);
        // Mettre à jour l'état de sauvegarde après succès
        setLastSavedState({
          title,
          observations,
          notes,
          consultationReason,
          recommendations,
          anatomicalIssues,
        });
        setHasUnsavedChanges(false);
        if (data.status === "finalized") {
          navigate({
            to: "/dashboard/reports/$id",
            params: { id: reportId },
          });
        }
      } else {
        toast.error("Erreur lors de la mise à jour du rapport");
      }
    },
    onError: (_) => {
      toast.error("Erreur lors de la mise à jour du rapport");
    },
  });

  const handleUpdateReport = async (status: ReportUpdateStatus = "draft") => {
    const reportDataToSend = buildReportUpdatePayload({
      reportId,
      title,
      selectedPetId,
      consultationReason,
      notes,
      observations,
      anatomicalIssues,
      recommendations,
      status,
    });

    console.log(reportDataToSend, "reportDataToSend");

    try {
      await updateReportMutation.mutateAsync(reportDataToSend);
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
    }
  };

  // Fonction pour ouvrir le dialog de rappel
  const handleOpenReminderDialog = () => {
    setIsReminderDialogOpen(true);
  };

  const handleTabChange = (
    tab: "clinical" | "notes" | "recommendations" | "anatomical",
  ) => {
    setActiveTab(tab);
  };

  const handleAddAnatomicalIssue = (
    issueWithAnatomicalPart: Omit<AnatomicalIssue, "id">,
  ) => {
    if (!issueWithAnatomicalPart.region) return;

    if (editingAnatomicalIssueId) {
      setAnatomicalIssues((prev) =>
        prev.map((issue) =>
          issue.id === editingAnatomicalIssueId
            ? {
                ...issue,
                ...issueWithAnatomicalPart,
                id: editingAnatomicalIssueId,
              }
            : issue,
        ),
      );
    } else {
      const newIssue: AnatomicalIssue = {
        id: crypto.randomUUID(),
        ...issueWithAnatomicalPart,
      };
      setAnatomicalIssues([...anatomicalIssues, newIssue]);
    }

    // Reset du formulaire
    setNewAnatomicalIssue({
      type: "dysfunction",
      region: "",
      severity: 2,
      notes: "",
      interventionZone: "",
      laterality: "left",
    });
    setEditingAnatomicalIssueId(null);
    setIsAddAnatomicalIssueOpen(false);
  };

  const selectedPet = petData;

  const isCat =
    (selectedPet?.animal?.code &&
      selectedPet.animal.code.toUpperCase() === "CAT") ||
    (selectedPet?.animal?.name &&
      ["cat", "chat"].includes(selectedPet.animal.name.toLowerCase()));

  const handleGoBack = () => {
    if (hasUnsavedChanges) {
      setShowExitConfirmDialog(true);
    } else {
      navigateBack();
    }
  };

  const navigateBack = () => {
    history.back();
  };

  const getTabProgress = (tab: string) => {
    switch (tab) {
      case "clinical":
        return observations.length > 0;
      case "anatomical":
        return anatomicalIssues.length > 0;
      case "recommendations":
        return recommendations.length > 0;
      case "notes":
        return notes.trim().length > 0;
      default:
        return false;
    }
  };

  const getTabCount = (tab: string) => {
    switch (tab) {
      case "clinical":
        return observations.length;
      case "anatomical":
        return anatomicalIssues.length;
      case "recommendations":
        return recommendations.length;
      case "notes":
        return notes.trim().length > 0 ? 1 : 0;
      default:
        return 0;
    }
  };

  // Fonction pour générer le texte du rapport à vulgariser
  const generateReportText = useCallback(() => {
    const sections: string[] = [];

    // Raison de consultation
    if (consultationReason) {
      sections.push(`Raison de consultation : ${consultationReason}`);
    }

    // Observations cliniques
    if (observations.length > 0) {
      sections.push("\nObservations cliniques :");
      observations.forEach((obs) => {
        const severityLabel =
          obs.severity === 1
            ? "légère"
            : obs.severity === 2
              ? "modérée"
              : obs.severity === 3
                ? "importante"
                : obs.severity === 4
                  ? "sévère"
                  : "très sévère";
        const typeLabel = obs.type === "static" ? "statique" : "dynamique";
        const lateralityLabel =
          obs.laterality === "left"
            ? "gauche"
            : obs.laterality === "right"
              ? "droite"
              : "bilatéral";
        sections.push(
          `- ${obs.region} (${severityLabel}, ${typeLabel}, ${lateralityLabel})${obs.notes ? ` : ${obs.notes}` : ""}`,
        );
      });
    }

    // Problèmes anatomiques
    if (anatomicalIssues.length > 0) {
      sections.push("\nProblèmes anatomiques :");
      anatomicalIssues.forEach((issue) => {
        const typeLabel =
          issue.type === "dysfunction" ? "dysfonction" : "suspicion d'atteinte";
        const severityLabel =
          issue.severity === 1
            ? "légère"
            : issue.severity === 2
              ? "modérée"
              : issue.severity === 3
                ? "importante"
                : issue.severity === 4
                  ? "sévère"
                  : "très sévère";
        const lateralityLabel =
          issue.laterality === "left"
            ? "gauche"
            : issue.laterality === "right"
              ? "droite"
              : "bilatéral";
        sections.push(
          `- ${issue.region} (${typeLabel}, ${severityLabel}, ${lateralityLabel})${issue.notes ? ` : ${issue.notes}` : ""}`,
        );
      });
    }

    // Recommandations
    if (recommendations.length > 0) {
      sections.push("\nRecommandations :");
      recommendations.forEach((rec, index) => {
        sections.push(`${index + 1}. ${rec.content}`);
      });
    }

    // Notes générales
    if (notes.trim()) {
      sections.push(`\nNotes générales :\n${notes}`);
    }

    return sections.join("\n");
  }, [
    consultationReason,
    observations,
    anatomicalIssues,
    recommendations,
    notes,
  ]);

  // Configuration des catégories et de leurs onglets
  const categories = [
    {
      id: "evaluation",
      name: "Évaluation clinique",
      icon: <ClipboardListIcon className="h-5 w-5" />,
      tabs: [
        {
          id: "clinical",
          label: "Observations",
          icon: <ListTodoIcon className="h-4 w-4" />,
        },
        {
          id: "anatomical",
          label: "Anatomie",
          icon: <ActivityIcon className="h-4 w-4" />,
        },
      ],
    },
    {
      id: "recommendations",
      name: "Recommandations & Notes",
      icon: <HeartHandshakeIcon className="h-5 w-5" />,
      tabs: [
        {
          id: "recommendations",
          label: "Recommandations",
          icon: <CheckIcon className="h-4 w-4" />,
        },
        {
          id: "notes",
          label: "Notes additionnelles",
          icon: <FileTextIcon className="h-4 w-4" />,
        },
      ],
    },
  ];

  const flatTabs = categories.flatMap((category) =>
    category.tabs.map((tab) => ({
      ...tab,
      categoryName: category.name,
    })),
  );
  const activeTabMeta = flatTabs.find((tab) => tab.id === activeTab);
  const progressSummary = flatTabs.reduce(
    (acc, tab) => {
      acc.total += 1;
      if (getTabProgress(String(tab.id))) acc.completed += 1;
      return acc;
    },
    { completed: 0, total: 0 },
  );
  const progressPercent =
    progressSummary.total > 0
      ? Math.round((progressSummary.completed / progressSummary.total) * 100)
      : 0;
  const selectedPetSummary = selectedPet
    ? `${selectedPet.name} · ${selectedPet.animal?.name || selectedPet.type}`
    : "Aucun patient sélectionné";

  return (
    <div className="min-h-[100dvh] w-full bg-slate-50 text-slate-950">
      {/* Desktop Layout */}
      <div className="hidden h-[100dvh] lg:block">
        <div
          className={cn(
            "grid h-full w-full gap-5 p-4 transition-all duration-200 ease-out",
            isSidebarCollapsed
              ? "grid-cols-[72px_minmax(0,1fr)]"
              : "grid-cols-[20rem_minmax(0,1fr)]",
          )}
        >
          {/* Navigation latérale */}
          <div className="flex h-full min-h-0 flex-col gap-3 overflow-y-auto overflow-x-hidden">
            <ReportSidebarNavigation
              title={title}
              onTitleChange={setTitle}
              appointment={appointmentDetails}
              categories={categories}
              activeTab={activeTab}
              onChangeTab={(tab) => setActiveTab(tab)}
              onGoBack={handleGoBack}
              onPreview={() => setShowPreview(true)}
              onShortcuts={() => setIsShortcutsModalOpen(true)}
              onSave={() => void handleUpdateReport("draft")}
              onFinalize={handleOpenReminderDialog}
              isSaving={updateReportMutation.isPending}
              getTabProgress={getTabProgress}
              getTabCount={getTabCount}
              hasUnsavedChanges={hasUnsavedChanges}
              isCollapsed={isSidebarCollapsed}
              onToggleCollapse={() =>
                setIsSidebarCollapsed(!isSidebarCollapsed)
              }
            />

            {/* Patient sélectionné - design épuré */}
            {selectedPet && (
              <PatientCard
                patient={selectedPet}
                onPatientClick={() => setIsAnimalCredenzaOpen(true)}
                isCollapsed={isSidebarCollapsed}
              />
            )}
            <TestModeSection
              isTestMode={isTestMode}
              onTestModeChange={setIsTestMode}
              selectedAnimalType={selectedAnimalType}
              onAnimalTypeChange={setSelectedAnimalType}
              isCollapsed={isSidebarCollapsed}
            />
          </div>

          {/* Contenu principal */}
          <main className="grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)] overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-[0_24px_70px_-46px_rgba(15,23,42,0.5)]">
            <header className="border-b border-slate-200 bg-white px-5 py-4">
              <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center">
                <div className="min-w-0">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <Badge
                      variant="outline"
                      className="rounded-lg border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800"
                    >
                      {activeTabMeta?.categoryName || "Édition"}
                    </Badge>
                    <span className="text-xs font-semibold text-slate-500">
                      {progressPercent}% complété
                    </span>
                    {hasUnsavedChanges ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700">
                        <span className="size-2 rounded-full bg-amber-500" />
                        Modifications non sauvegardées
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                        <span className="size-2 rounded-full bg-emerald-500" />À
                        jour
                      </span>
                    )}
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 [&_svg]:size-5">
                      {activeTabMeta?.icon || <FileTextIcon />}
                    </div>
                    <div className="min-w-0">
                      <h1 className="truncate text-2xl font-semibold leading-none tracking-tight text-slate-950">
                        {activeTabMeta?.label || "Édition"}
                      </h1>
                      <p className="mt-2 truncate text-sm font-medium text-slate-500">
                        {selectedPetSummary}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-2 sm:grid-cols-2 xl:flex xl:items-center">
                  {activeTab === "clinical" && (
                    <Button
                      onClick={handleOpenAddObservation}
                      className="h-10 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98]"
                    >
                      <PlusIcon className="size-4" />
                      Nouvelle observation
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => setIsVulgarisationOpen(true)}
                    className="h-10 rounded-xl border-slate-200 bg-white text-slate-700 hover:bg-slate-50 active:scale-[0.98]"
                  >
                    <MessageCircleIcon className="size-4" />
                    Assistant
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowPreview(true)}
                    className="h-10 rounded-xl border-slate-200 bg-white text-slate-700 hover:bg-slate-50 active:scale-[0.98]"
                  >
                    <EyeIcon className="size-4" />
                    Aperçu
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleUpdateReport("draft")}
                    disabled={updateReportMutation.isPending}
                    className="h-10 rounded-xl border-slate-200 bg-white text-slate-700 hover:bg-slate-50 active:scale-[0.98]"
                  >
                    <SaveIcon className="size-4" />
                    Sauvegarder
                  </Button>
                  <Button
                    onClick={handleOpenReminderDialog}
                    disabled={updateReportMutation.isPending}
                    className="h-10 rounded-xl bg-slate-950 text-white hover:bg-slate-800 active:scale-[0.98]"
                  >
                    <CheckIcon className="size-4" />
                    Finaliser
                  </Button>
                </div>
              </div>
            </header>

            <section className="min-h-0 overflow-hidden bg-slate-50/60">
              {isCat ? (
                <div className="flex h-full w-full items-center justify-center p-6">
                  <Card className="w-full max-w-xl rounded-2xl border-border shadow-sm">
                    <div className="flex items-start gap-4 p-8">
                      <div className="mt-1 text-primary">
                        <AlertTriangle className="h-6 w-6" />
                      </div>
                      <div className="space-y-2">
                        <h2 className="text-lg font-semibold text-foreground">
                          Module rapports bientôt disponible pour le chat
                        </h2>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          Le module de comptes rendus n&apos;est pas encore
                          disponible pour les chats. Sélectionnez un autre type
                          d&apos;animal pour continuer, ou sélectionnez un autre
                          type de rapport. Merci de votre compréhension.
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>
              ) : (
                <div className="flex h-full min-h-0 flex-col">
                  <div className="min-h-0 flex-1 overflow-hidden">
                    {activeTab === "clinical" && (
                      <div className="h-full min-h-0 p-5 xl:p-6">
                        <ObservationsTab
                          observations={observations}
                          onRemoveObservation={handleRemoveObservation}
                          onOpenAddSheet={handleOpenAddObservation}
                          onEditObservation={handleEditObservation}
                        />
                      </div>
                    )}

                    {activeTab === "anatomical" && (
                      <AnatomicalEvaluationTab
                        dysfunctions={anatomicalIssues}
                        setDysfunctions={setAnatomicalIssues}
                        onAddDysfunction={(issue) => {
                          const newIssue: AnatomicalIssue = {
                            id: crypto.randomUUID(),
                            ...issue,
                            laterality: issue.laterality || "left",
                          };
                          setAnatomicalIssues([...anatomicalIssues, newIssue]);
                        }}
                        isAddModalOpen={isAddAnatomicalIssueOpen}
                        setIsAddModalOpen={setIsAddAnatomicalIssueOpen}
                        animalData={petData?.animal}
                        isTestMode={isTestMode}
                        selectedAnimalType={selectedAnimalType}
                        anatomicalView={anatomicalView}
                        setAnatomicalView={setAnatomicalView}
                        onEditDysfunction={(id) => {
                          const it = anatomicalIssues.find((d) => d.id === id);
                          if (!it) return;
                          setEditingAnatomicalIssueId(id);
                          setNewAnatomicalIssue({
                            type: it.type,
                            region: it.region,
                            severity: it.severity,
                            notes: it.notes,
                            interventionZone: it.interventionZone || "",
                            laterality: it.laterality,
                          });
                          setIsAddAnatomicalIssueOpen(true);
                        }}
                      />
                    )}

                    {activeTab === "recommendations" && (
                      <div className="h-full min-h-0 p-5 xl:p-6">
                        <RecommendationsTab
                          recommendations={recommendations}
                          setRecommendations={setRecommendations}
                        />
                      </div>
                    )}

                    {activeTab === "notes" && (
                      <div className="h-full min-h-0 p-5 xl:p-6">
                        <NotesTab notes={notes} setNotes={setNotes} />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </section>
          </main>
        </div>
      </div>

      {/* Mobile/Tablet Layout */}
      <div className="min-h-[100dvh] bg-slate-50 lg:hidden">
        <div className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="grid gap-4 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-start gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleGoBack}
                  className="mt-0.5 shrink-0 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-950 active:scale-[0.98]"
                >
                  <ChevronLeftIcon className="h-5 w-5" />
                </Button>
                <div className="min-w-0">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <Badge
                      variant="outline"
                      className="rounded-lg border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-800"
                    >
                      {activeTabMeta?.categoryName || "Édition"}
                    </Badge>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 text-[11px] font-semibold",
                        hasUnsavedChanges
                          ? "text-amber-700"
                          : "text-emerald-700",
                      )}
                    >
                      <span
                        className={cn(
                          "size-2 rounded-full",
                          hasUnsavedChanges ? "bg-amber-500" : "bg-emerald-500",
                        )}
                      />
                      {hasUnsavedChanges ? "Non sauvegardé" : "À jour"}
                    </span>
                  </div>
                  <h1 className="truncate text-lg font-semibold tracking-tight text-slate-950">
                    {activeTabMeta?.label || "Modifier le rapport"}
                  </h1>
                  <p className="mt-1 truncate text-xs font-medium text-slate-500">
                    {selectedPetSummary}
                  </p>
                </div>
              </div>

              <Button
                variant="default"
                size="icon"
                onClick={handleOpenReminderDialog}
                disabled={updateReportMutation.isPending}
                className="shrink-0 rounded-xl bg-slate-950 text-white hover:bg-slate-800 active:scale-[0.98]"
                aria-label="Finaliser le rapport"
              >
                <CheckIcon className="h-4 w-4" />
              </Button>
            </div>

            <div
              className={cn(
                "grid gap-2",
                activeTab === "clinical" ? "grid-cols-5" : "grid-cols-4",
              )}
            >
              {activeTab === "clinical" && (
                <Button
                  size="sm"
                  onClick={handleOpenAddObservation}
                  className="h-9 rounded-xl bg-primary text-primary-foreground active:scale-[0.98]"
                  aria-label="Nouvelle observation"
                >
                  <PlusIcon className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsVulgarisationOpen(true)}
                className="h-9 rounded-xl border-slate-200 bg-white text-slate-700 active:scale-[0.98]"
                aria-label="Assistant"
              >
                <MessageCircleIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(true)}
                className="h-9 rounded-xl border-slate-200 bg-white text-slate-700 active:scale-[0.98]"
                aria-label="Aperçu"
              >
                <EyeIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsShortcutsModalOpen(true)}
                className="h-9 rounded-xl border-slate-200 bg-white text-slate-700 active:scale-[0.98]"
                aria-label="Raccourcis"
              >
                <KeyboardIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleUpdateReport("draft")}
                disabled={updateReportMutation.isPending}
                className="h-9 rounded-xl border-slate-200 bg-white text-slate-700 active:scale-[0.98]"
                aria-label="Sauvegarder"
              >
                <SaveIcon className="h-4 w-4" />
              </Button>
            </div>

            <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-emerald-600 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Content mobile avec padding bottom pour navigation */}
        <div className="pb-20">
          <div
            className={cn(
              "px-4 py-6",
              activeTab === "clinical" ? "block" : "hidden",
            )}
          >
            <ObservationsTab
              observations={observations}
              onRemoveObservation={handleRemoveObservation}
              onOpenAddSheet={handleOpenAddObservation}
              onEditObservation={handleEditObservation}
            />
          </div>

          <div
            className={cn(
              "h-full",
              activeTab === "anatomical" ? "block" : "hidden",
            )}
          >
            <AnatomicalEvaluationTab
              dysfunctions={anatomicalIssues}
              setDysfunctions={setAnatomicalIssues}
              onAddDysfunction={(issue) => {
                const newIssue: AnatomicalIssue = {
                  id: crypto.randomUUID(),
                  ...issue,
                  laterality: issue.laterality || "left",
                };
                setAnatomicalIssues([...anatomicalIssues, newIssue]);
              }}
              isAddModalOpen={isAddAnatomicalIssueOpen}
              setIsAddModalOpen={setIsAddAnatomicalIssueOpen}
              animalData={petData?.animal}
              isTestMode={isTestMode}
              selectedAnimalType={selectedAnimalType}
              anatomicalView={anatomicalView}
              setAnatomicalView={setAnatomicalView}
            />
          </div>

          <div
            className={cn(
              "px-4 py-6",
              activeTab === "recommendations" ? "block" : "hidden",
            )}
          >
            <RecommendationsTab
              recommendations={recommendations}
              setRecommendations={setRecommendations}
            />
          </div>

          <div
            className={cn(
              "px-4 py-6",
              activeTab === "notes" ? "block" : "hidden",
            )}
          >
            <NotesTab notes={notes} setNotes={setNotes} />
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-slate-200 bg-white lg:hidden">
        <div className="grid h-16 grid-cols-4">
          <button
            onClick={() => handleTabChange("clinical")}
            className={cn(
              "flex flex-col items-center justify-center gap-1 p-2 transition-colors duration-200 active:scale-[0.98]",
              activeTab === "clinical"
                ? "bg-slate-950 text-white"
                : "text-slate-500 hover:bg-slate-100 hover:text-slate-950",
            )}
          >
            <div className="relative">
              <ListTodoIcon
                className={cn(
                  "h-5 w-5 transition-colors duration-200",
                  getTabProgress("clinical") &&
                    activeTab !== "clinical" &&
                    "text-emerald-700",
                )}
              />
              {getTabCount("clinical") > 0 && (
                <Badge
                  variant="secondary"
                  className="absolute -top-1 -right-1 h-4 min-w-4 px-1 text-[10px] leading-none"
                >
                  {getTabCount("clinical")}
                </Badge>
              )}
            </div>
            <span className="text-[10px] font-medium">Obs.</span>
          </button>

          <button
            onClick={() => handleTabChange("anatomical")}
            className={cn(
              "flex flex-col items-center justify-center gap-1 p-2 transition-colors duration-200 active:scale-[0.98]",
              activeTab === "anatomical"
                ? "bg-slate-950 text-white"
                : "text-slate-500 hover:bg-slate-100 hover:text-slate-950",
            )}
          >
            <div className="relative">
              <ActivityIcon
                className={cn(
                  "h-5 w-5 transition-colors duration-200",
                  getTabProgress("anatomical") &&
                    activeTab !== "anatomical" &&
                    "text-emerald-700",
                )}
              />
              {getTabCount("anatomical") > 0 && (
                <Badge
                  variant="secondary"
                  className="absolute -top-1 -right-1 h-4 min-w-4 px-1 text-[10px] leading-none"
                >
                  {getTabCount("anatomical")}
                </Badge>
              )}
            </div>
            <span className="text-[10px] font-medium">Anat.</span>
          </button>

          <button
            onClick={() => handleTabChange("recommendations")}
            className={cn(
              "flex flex-col items-center justify-center gap-1 p-2 transition-colors duration-200 active:scale-[0.98]",
              activeTab === "recommendations"
                ? "bg-slate-950 text-white"
                : "text-slate-500 hover:bg-slate-100 hover:text-slate-950",
            )}
          >
            <div className="relative">
              <CheckIcon
                className={cn(
                  "h-5 w-5 transition-colors duration-200",
                  getTabProgress("recommendations") &&
                    activeTab !== "recommendations" &&
                    "text-emerald-700",
                )}
              />
              {getTabCount("recommendations") > 0 && (
                <Badge
                  variant="secondary"
                  className="absolute -top-1 -right-1 h-4 min-w-4 px-1 text-[10px] leading-none"
                >
                  {getTabCount("recommendations")}
                </Badge>
              )}
            </div>
            <span className="text-[10px] font-medium">Conseils</span>
          </button>

          <button
            onClick={() => handleTabChange("notes")}
            className={cn(
              "flex flex-col items-center justify-center gap-1 p-2 transition-colors duration-200 active:scale-[0.98]",
              activeTab === "notes"
                ? "bg-slate-950 text-white"
                : "text-slate-500 hover:bg-slate-100 hover:text-slate-950",
            )}
          >
            <div className="relative">
              <FileTextIcon
                className={cn(
                  "h-5 w-5 transition-colors duration-200",
                  getTabProgress("notes") &&
                    activeTab !== "notes" &&
                    "text-emerald-700",
                )}
              />
              {getTabProgress("notes") && (
                <Badge
                  variant="secondary"
                  className="absolute -top-1 -right-1 h-4 min-w-4 px-1 text-[10px] leading-none"
                >
                  <CheckIcon className="h-3 w-3" />
                </Badge>
              )}
            </div>
            <span className="text-[10px] font-medium">Notes</span>
          </button>
        </div>
      </div>

      <ExitConfirmationDialog
        showExitConfirmDialog={showExitConfirmDialog}
        setShowExitConfirmDialog={setShowExitConfirmDialog}
        onConfirmExit={navigateBack}
      />

      <AddObservationDialog
        isOpen={isAddSheetOpen}
        onOpenChange={setIsAddSheetOpen}
        newObservation={newObservation}
        setNewObservation={setNewObservation}
        onAdd={handleAddObservation}
        animalData={selectedPet}
        selectedZone={newObservation.interventionZone}
        submitLabel={editingObservationId ? "Mettre à jour" : "Ajouter"}
        petId={selectedPetId}
      />

      <AddAnatomicalIssueDialog
        isOpen={isAddAnatomicalIssueOpen}
        onOpenChange={setIsAddAnatomicalIssueOpen}
        issueType={newAnatomicalIssue.type}
        newIssue={newAnatomicalIssue}
        setNewIssue={setNewAnatomicalIssue}
        onAdd={handleAddAnatomicalIssue}
        animalData={selectedPet}
        selectedZone={newAnatomicalIssue.interventionZone}
        isTestMode={isTestMode}
        selectedAnimalType={selectedAnimalType}
        submitLabel={editingAnatomicalIssueId ? "Mettre à jour" : "Ajouter"}
        petId={selectedPetId}
      />

      <ReportPreview
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        title={title}
        observations={observations}
        notes={notes}
        recommendations={recommendations}
        anatomicalIssues={anatomicalIssues}
        images={[]}
      />

      <AnimalCredenza
        isOpen={isAnimalCredenzaOpen}
        onOpenChange={setIsAnimalCredenzaOpen}
        petId={selectedPetId}
      />

      <VulgarisationPanel
        isOpen={isVulgarisationOpen}
        onOpenChange={setIsVulgarisationOpen}
        reportId={reportId}
        initialText={generateReportText()}
      />

      {/* Modale des raccourcis clavier */}
      <Credenza
        open={isShortcutsModalOpen}
        onOpenChange={setIsShortcutsModalOpen}
      >
        <CredenzaContent className="sm:max-w-[600px]">
          <CredenzaHeader>
            <CredenzaTitle className="flex items-center gap-2">
              <KeyboardIcon className="h-5 w-5" />
              Raccourcis clavier
            </CredenzaTitle>
          </CredenzaHeader>
          <CredenzaBody className="space-y-6">
            {/* Raccourcis généraux */}
            <div className="space-y-3">
              <h3 className="text-base font-semibold text-foreground">
                Raccourcis généraux
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between py-1">
                  <span className="text-sm text-muted-foreground">
                    Nouvel élément
                  </span>
                  <div className="flex gap-1">
                    <kbd className="px-2 py-1 text-xs bg-muted rounded border font-mono">
                      ⇧N
                    </kbd>
                  </div>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-sm text-muted-foreground">
                    Vue gauche / droite (onglet anatomique)
                  </span>
                  <div className="flex gap-1">
                    <kbd className="px-2 py-1 text-xs bg-muted rounded border font-mono">
                      1
                    </kbd>
                    <kbd className="px-2 py-1 text-xs bg-muted rounded border font-mono">
                      2
                    </kbd>
                  </div>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-sm text-muted-foreground">
                    Supprimer dernier élément (onglet anatomique)
                  </span>
                  <kbd className="px-2 py-1 text-xs bg-muted rounded border font-mono">
                    ⇧D
                  </kbd>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-sm text-muted-foreground">
                    Effacer tous les éléments (onglet anatomique)
                  </span>
                  <kbd className="px-2 py-1 text-xs bg-muted rounded border font-mono">
                    ⇧C
                  </kbd>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-sm text-muted-foreground">
                    Sauvegarder le rapport
                  </span>
                  <kbd className="px-2 py-1 text-xs bg-muted rounded border font-mono">
                    Cmd+S
                  </kbd>
                </div>
              </div>
            </div>

            {/* Raccourcis dans les modales */}
            <div className="space-y-3">
              <h3 className="text-base font-semibold text-foreground">
                Dans les modales
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between py-1">
                  <span className="text-sm text-muted-foreground">
                    Navigation entre étapes
                  </span>
                  <div className="flex gap-1">
                    <kbd className="px-2 py-1 text-xs bg-muted rounded border font-mono">
                      ←
                    </kbd>
                    <kbd className="px-2 py-1 text-xs bg-muted rounded border font-mono">
                      →
                    </kbd>
                  </div>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-sm text-muted-foreground">
                    Valider / Continuer
                  </span>
                  <kbd className="px-2 py-1 text-xs bg-muted rounded border font-mono">
                    Entrée
                  </kbd>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-sm text-muted-foreground">
                    Fermer modale
                  </span>
                  <kbd className="px-2 py-1 text-xs bg-muted rounded border font-mono">
                    Échap
                  </kbd>
                </div>
              </div>
            </div>

            {/* Raccourcis spécifiques aux modales anatomiques */}
            <div className="space-y-3">
              <h3 className="text-base font-semibold text-foreground">
                Modale d&apos;ajout anatomique
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between py-1">
                  <span className="text-sm text-muted-foreground">
                    Sélection rapide du type
                  </span>
                  <div className="flex gap-1">
                    <kbd className="px-2 py-1 text-xs bg-muted rounded border font-mono">
                      ⇧F
                    </kbd>
                    <kbd className="px-2 py-1 text-xs bg-muted rounded border font-mono">
                      ⇧S
                    </kbd>
                  </div>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-sm text-muted-foreground">
                    Latéralité (Gauche / Droite / Bilatéral)
                  </span>
                  <div className="flex gap-1">
                    <kbd className="px-2 py-1 text-xs bg-muted rounded border font-mono">
                      G
                    </kbd>
                    <kbd className="px-2 py-1 text-xs bg-muted rounded border font-mono">
                      D
                    </kbd>
                    <kbd className="px-2 py-1 text-xs bg-muted rounded border font-mono">
                      B
                    </kbd>
                  </div>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-sm text-muted-foreground">
                    Niveaux de sévérité
                  </span>
                  <kbd className="px-2 py-1 text-xs bg-muted rounded border font-mono">
                    1-5
                  </kbd>
                </div>
              </div>
            </div>

            {/* Astuce */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="flex items-start gap-2">
                <KeyboardIcon className="mt-0.5 h-4 w-4 text-slate-500" />
                <div className="text-sm text-slate-700">
                  <strong>Astuce :</strong> La plupart des raccourcis
                  fonctionnent avec ou sans Shift pour plus de flexibilité. Les
                  raccourcis s&apos;adaptent automatiquement selon l&apos;onglet
                  actif.
                </div>
              </div>
            </div>
          </CredenzaBody>
          <CredenzaFooter>
            <Button
              variant="outline"
              onClick={() => setIsShortcutsModalOpen(false)}
            >
              Fermer
            </Button>
          </CredenzaFooter>
        </CredenzaContent>
      </Credenza>

      {/* Dialog de rappel */}
      <ReportReminderDialog
        isOpen={isReminderDialogOpen}
        onOpenChange={setIsReminderDialogOpen}
        reportId={reportId}
        onFinalize={() => handleUpdateReport("finalized")}
        isFinalizing={updateReportMutation.isPending}
      />
    </div>
  );
}
