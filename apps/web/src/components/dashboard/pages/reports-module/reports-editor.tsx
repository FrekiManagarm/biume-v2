
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
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
import { useFocusMode } from "@/lib/context/focus-mode-context";

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
  KeyboardIcon,
  AlertTriangle,
  UserIcon,
  ChevronRightIcon,
} from "lucide-react";
import { SparklesIcon } from "@/components/ui/sparkles-icon";
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
  const { setFocusMode } = useFocusMode();

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
          | InterventionZone
          | undefined,
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
          | InterventionZone
          | undefined,
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
  const { isFocusMode, toggleFocusMode } = useFocusMode();

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

  useHotkeys(
    "mod+f",
    () => {
      toggleFocusMode();
    },
    {
      description: "Activer/désactiver le mode focus (Cmd/Ctrl+F)",
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
    onSuccess: (data) => {
      if (data?.success) {
        toast.success("Rapport mis à jour avec succès");
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
          toggleFocusMode();
        }
      } else {
        toast.error("Erreur lors de la mise à jour du rapport");
      }
    },
    onError: (_) => {
      toast.error("Erreur lors de la mise à jour du rapport");
    },
  });

  const handleUpdateReport = async (
    status: "draft" | "finalized" = "draft",
  ) => {
    const reportDataToSend = {
      reportId,
      title: title,
      petId: selectedPetId || undefined,
      consultationReason: consultationReason || undefined,
      notes: notes || undefined,
      observations: observations || [],
      anatomicalIssues: anatomicalIssues || [],
      recommendations: recommendations || [],
      status: status,
    };

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
    setFocusMode(false);
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
      icon: <ClipboardListIcon className="h-5 w-5 mr-2" />,
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
      icon: <HeartHandshakeIcon className="h-5 w-5 mr-2" />,
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

  // Trouver la catégorie du tab actif
  const findCategoryForTab = (tabId: string) => {
    return (
      categories.find((category) =>
        category.tabs.some((tab) => tab.id === tabId),
      )?.id || categories[0].id
    );
  };

  return (
    <div className="h-full w-full bg-background flex flex-col">
      {/* Desktop Layout */}
      <div className="hidden lg:block h-full">
        <div
          className={cn(
            "grid w-full h-full gap-4 transition-all duration-300",
            isSidebarCollapsed
              ? "grid-cols-[88px_1fr]"
              : "grid-cols-[18rem_1fr]",
          )}
        >
          {/* Navigation latérale */}
          <div className="h-full overflow-y-auto overflow-x-hidden space-y-4">
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
              onSave={handleOpenReminderDialog}
              isSaving={updateReportMutation.isPending}
              getTabProgress={getTabProgress}
              getTabCount={getTabCount}
              hasUnsavedChanges={hasUnsavedChanges}
              focusMode={isFocusMode}
              onToggleFocusMode={toggleFocusMode}
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
          <div className="h-full flex flex-col min-h-0 overflow-x-hidden">
            {isCat ? (
              <div className="h-full w-full flex items-center justify-center">
                <Card className="max-w-xl w-full rounded-2xl shadow-sm">
                  <div className="p-8 flex items-start gap-4">
                    <div className="mt-1 text-yellow-600 dark:text-yellow-400">
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
              <div className="h-full flex flex-col">
                <div className="flex-1 min-h-0">
                  {activeTab === "clinical" && (
                    <ObservationsTab
                      observations={observations}
                      onRemoveObservation={handleRemoveObservation}
                      onOpenAddSheet={() => {
                        setEditingObservationId(null);
                        setIsAddSheetOpen(true);
                      }}
                      onEditObservation={handleEditObservation}
                    />
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
                    <RecommendationsTab
                      recommendations={recommendations}
                      setRecommendations={setRecommendations}
                    />
                  )}

                  {activeTab === "notes" && (
                    <NotesTab notes={notes} setNotes={setNotes} />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile/Tablet Layout */}
      <div className="lg:hidden">
        {/* Header mobile simple */}
        <div className="sticky top-0 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 border-b border-border z-10">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleGoBack}
                className="rounded-full hover:bg-primary/10 transition-colors"
              >
                <ChevronLeftIcon className="h-5 w-5" />
              </Button>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-semibold">Modifier le rapport</h1>
                  {hasUnsavedChanges && (
                    <div
                      className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"
                      title="Modifications non sauvegardées"
                    />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {selectedPet
                    ? `${selectedPet.name} • ${selectedPet.animal?.name || selectedPet.type}`
                    : "Compte rendu détaillé"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPreview(true)}
                className="flex items-center gap-2"
              >
                <EyeIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsShortcutsModalOpen(true)}
                className="flex items-center gap-2"
              >
                <KeyboardIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={handleOpenReminderDialog}
                disabled={updateReportMutation.isPending}
                className="flex items-center gap-2"
              >
                <SaveIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Content mobile avec padding bottom pour navigation */}
        <div className="pb-20">
          <div
            className={cn(
              "py-6",
              activeTab === "clinical" ? "block" : "hidden",
            )}
          >
            <ObservationsTab
              observations={observations}
              onRemoveObservation={handleRemoveObservation}
              onOpenAddSheet={() => {
                setEditingObservationId(null);
                setIsAddSheetOpen(true);
              }}
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
              "py-6",
              activeTab === "recommendations" ? "block" : "hidden",
            )}
          >
            <RecommendationsTab
              recommendations={recommendations}
              setRecommendations={setRecommendations}
            />
          </div>

          <div
            className={cn("py-6", activeTab === "notes" ? "block" : "hidden")}
          >
            <NotesTab notes={notes} setNotes={setNotes} />
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border z-10">
        <div className="grid grid-cols-4 h-16">
          <button
            onClick={() => handleTabChange("clinical")}
            className={cn(
              "flex flex-col items-center justify-center gap-1 p-2 transition-colors duration-200",
              activeTab === "clinical"
                ? "text-primary bg-primary/5"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
            )}
          >
            <div className="relative">
              <ListTodoIcon
                className={cn(
                  "h-5 w-5 transition-colors duration-200",
                  getTabProgress("clinical") &&
                  "text-green-600 dark:text-green-400",
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
              "flex flex-col items-center justify-center gap-1 p-2 transition-colors duration-200",
              activeTab === "anatomical"
                ? "text-primary bg-primary/5"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
            )}
          >
            <div className="relative">
              <ActivityIcon
                className={cn(
                  "h-5 w-5 transition-colors duration-200",
                  getTabProgress("anatomical") &&
                  "text-blue-600 dark:text-blue-400",
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
              "flex flex-col items-center justify-center gap-1 p-2 transition-colors duration-200",
              activeTab === "recommendations"
                ? "text-primary bg-primary/5"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
            )}
          >
            <div className="relative">
              <CheckIcon
                className={cn(
                  "h-5 w-5 transition-colors duration-200",
                  getTabProgress("recommendations") &&
                  "text-orange-600 dark:text-orange-400",
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
              "flex flex-col items-center justify-center gap-1 p-2 transition-colors duration-200",
              activeTab === "notes"
                ? "text-primary bg-primary/5"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
            )}
          >
            <div className="relative">
              <FileTextIcon
                className={cn(
                  "h-5 w-5 transition-colors duration-200",
                  getTabProgress("notes") &&
                  "text-purple-600 dark:text-purple-400",
                )}
              />
              {getTabProgress("notes") && (
                <Badge
                  variant="secondary"
                  className="absolute -top-1 -right-1 h-4 min-w-4 px-1 text-[10px] leading-none"
                >
                  ✓
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
                <div className="flex items-center justify-between py-1">
                  <span className="text-sm text-muted-foreground">
                    Mode focus (masquer le layout)
                  </span>
                  <kbd className="px-2 py-1 text-xs bg-muted rounded border font-mono">
                    Cmd+F
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
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 text-sm">
                  💡
                </span>
                <div className="text-sm text-blue-800 dark:text-blue-200">
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
