import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPatientById } from "@/lib/api/actions/patients.action";
import { updateReport } from "@/lib/api/actions/reports.action";
import { upsertReportOwnerContent } from "@/lib/api/actions/report-owner-content.action";
import type { InferSelectModel } from "drizzle-orm";
import type { advancedReport } from "@/lib/schemas/advancedReport/advancedReport";
import { AnimalCredenza } from "@/components/animal-folder";
import { ObservationsTab } from "./components/tabs/ObservationsTab";
import { NotesTab } from "./components/tabs/NotesTab";
import { RecommendationsTab } from "./components/tabs/RecommendationsTab";
import { AnatomicalEvaluationTab } from "./components/tabs/AnatomicalEvaluationTab";
import { AddObservationDialog } from "./components/AddObservationsDialog";
import { AddAnatomicalIssueDialog } from "./components/AddAnatomicalIssueDialog";
import { ExitConfirmationDialog } from "./components/ExitConfirmationDialog";
import { ReportSidebarNavigation } from "./components/ReportSidebarNavigation";
import { SectionDecisionControl } from "./components/SectionDecisionControl";
import { ReportReminderDialog } from "./components/ReportReminderDialog";
import { TestModeSection } from "./components/TestModeSection";
import { ReportWorkspaceHeader } from "./components/ReportWorkspaceHeader";
import { ReportPatientIdentity } from "./components/ReportPatientIdentity";
import { OwnerPreparationWarningDialog } from "./components/OwnerPreparationWarningDialog";
import {
  ReportPanelController,
  type ReportPanelState,
} from "./components/ReportPanelController";
import {
  buildReportUpdatePayload,
  deriveProfessionalSectionStatus,
  getEffectiveSectionState,
  getAnatomicalProfessionalItemText,
  getReportDraftRevision,
  getReportDesktopGridClassName,
  invalidateReportDetailQuery,
  invalidateReportUpdateQueries,
  openOwnerPreparation,
  replaceOwnerContentRecord,
  runExclusiveReportSave,
  getSectionStatesAfterEdit,
  type ReportUpdateStatus,
} from "./reports-editor.helpers";
import {
  buildOwnerPreparationQueue,
  buildOwnerSourceItems,
  type OwnerContentRecord,
  type OwnerContentStatus,
  type OwnerSourceItem,
  type OwnerSourceKind,
  type ReportSectionId,
} from "./owner-content";
import { buildOwnerReportViewModel } from "./owner-report-view-model";

import type {
  Observation,
  NewObservation,
  AnatomicalIssue,
  InterventionZone,
} from "./types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ChevronLeftIcon,
  PlusIcon,
  KeyboardIcon,
  AlertTriangle,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  canFinalizeReport,
  createInitialReportSectionStates,
  type ReportSectionStates,
} from "@biume/contracts/report";

type ReportData = InferSelectModel<typeof advancedReport> & {
  patient?: Pet | null;
  anatomicalIssues?: AnatomicalIssueSchema[];
  recommendations?: AdvancedReportRecommendations[];
  ownerContents?: OwnerContentRecord[];
  appointment?: Appointment | null;
  sectionStates?: ReportSectionStates;
};

interface AdvancedReportEditorProps {
  reportId: string;
  orgId: string;
  initialData: ReportData;
}

export function AdvancedReportEditor({
  reportId,
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
  const [selectedPetId] = useState<string>(initialData.patientId || "");
  const [title, setTitle] = useState(
    initialData.title ||
      "Compte rendu détaillé du " + new Date().toLocaleDateString(),
  );
  const [observations, setObservations] =
    useState<Observation[]>(initialObservations);
  const [notes, setNotes] = useState(initialData.notes || "");
  const [panelState, setPanelState] = useState<ReportPanelState>({
    type: "closed",
  });
  const [ownerContents, setOwnerContents] = useState<OwnerContentRecord[]>(
    initialData.ownerContents ?? [],
  );
  const [activeTab, setActiveTab] = useState<
    "clinical" | "notes" | "recommendations" | "anatomical"
  >("clinical");
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const [editingObservationId, setEditingObservationId] = useState<
    string | null
  >(null);
  const [consultationReason] = useState<string>(
    initialData.consultationReason || "",
  );
  const [recommendations, setRecommendations] = useState<
    { id: string; content: string }[]
  >(initialRecommendations);
  const [anatomicalIssues, setAnatomicalIssues] = useState<AnatomicalIssue[]>(
    initialAnatomicalIssues,
  );
  const [sectionStates, setSectionStates] = useState<ReportSectionStates>(
    initialData.sectionStates ?? createInitialReportSectionStates(),
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
  const [isReminderDialogOpen, setIsReminderDialogOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isOwnerWarningOpen, setIsOwnerWarningOpen] = useState(false);

  const ownerSources = useMemo(
    () =>
      buildOwnerSourceItems({
        reportId,
        consultationReason,
        observations,
        anatomicalIssues,
        recommendations,
        notes,
      }),
    [
      reportId,
      consultationReason,
      observations,
      anatomicalIssues,
      recommendations,
      notes,
    ],
  );
  const ownerQueue = useMemo(
    () =>
      buildOwnerPreparationQueue(ownerSources, ownerContents) as Array<
        OwnerSourceItem & { status: "missing" | "stale" }
      >,
    [ownerSources, ownerContents],
  );
  const ownerDocument = useMemo(
    () => buildOwnerReportViewModel(ownerSources, ownerContents),
    [ownerSources, ownerContents],
  );
  const ownerPreviewEntries = useMemo(() => {
    const labels: Record<OwnerSourceKind, string> = {
      consultationReason: "Motif de consultation",
      observation: "Observation",
      anatomicalIssue: "Point anatomique",
      recommendation: "Recommandation",
      notes: "Note additionnelle",
    };
    return ownerSources.map((source) => {
      const resolved = ownerDocument.byKey[source.key]!;
      return {
        key: source.key,
        label: labels[source.sourceKind],
        text: resolved.text,
        status: resolved.status,
        usedFallback: resolved.usedFallback,
        section: source.section,
      };
    });
  }, [ownerDocument, ownerSources]);

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
    sectionStates:
      initialData.sectionStates ?? createInitialReportSectionStates(),
  });
  const currentDraftState = {
    title,
    observations,
    notes,
    consultationReason,
    recommendations,
    anatomicalIssues,
    sectionStates,
  };
  const currentDraftRevision = getReportDraftRevision(currentDraftState);
  const currentDraftRevisionRef = useRef(currentDraftRevision);
  currentDraftRevisionRef.current = currentDraftRevision;
  const reportSaveGuard = useRef<Promise<boolean> | null>(null);

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
      sectionStates,
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
        JSON.stringify(lastSavedState.anatomicalIssues) ||
      JSON.stringify(currentState.sectionStates) !==
        JSON.stringify(lastSavedState.sectionStates);

    setHasUnsavedChanges(hasChanges);
  }, [
    title,
    observations,
    notes,
    consultationReason,
    recommendations,
    anatomicalIssues,
    sectionStates,
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
    sectionStates,
    checkForUnsavedChanges,
  ]);

  const markSectionEdited = (section: ReportSectionId) => {
    setSectionStates((current) => getSectionStatesAfterEdit(current, section));
  };

  const updateAnatomicalIssues = (next: AnatomicalIssue[]) => {
    setAnatomicalIssues(next);
    markSectionEdited("anatomical");
  };

  const updateRecommendations = (next: { id: string; content: string }[]) => {
    setRecommendations(next);
    markSectionEdited("recommendations");
  };

  const updateNotes = (next: string) => {
    setNotes(next);
    markSectionEdited("notes");
  };

  const resolveSection = (
    section: ReportSectionId,
    state: "confirmed" | "not_applicable",
  ) => {
    setSectionStates((current) => ({ ...current, [section]: state }));
  };

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
        updateAnatomicalIssues(
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
        updateAnatomicalIssues([]);
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
    markSectionEdited("clinical");
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
    markSectionEdited("clinical");
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
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "Erreur lors de la mise à jour du rapport",
      );
    },
  });

  const ownerContentMutation = useMutation({
    mutationFn: upsertReportOwnerContent,
    onSuccess: async (result) => {
      if (!result.success || !result.data) return;
      setOwnerContents((current) =>
        replaceOwnerContentRecord(current, result.data),
      );
      await invalidateReportDetailQuery(queryClient, reportId);
    },
  });

  const handleUpdateReport = async (
    status: ReportUpdateStatus = "draft",
  ): Promise<boolean> => {
    const submittedState = {
      title,
      observations,
      notes,
      consultationReason,
      recommendations,
      anatomicalIssues,
      sectionStates,
    };
    const submittedRevision = getReportDraftRevision(submittedState);
    const reportDataToSend = buildReportUpdatePayload({
      reportId,
      title,
      selectedPetId,
      consultationReason,
      notes,
      observations,
      anatomicalIssues,
      recommendations,
      sectionStates,
      status,
    });

    return runExclusiveReportSave(reportSaveGuard, async () => {
      try {
        const result = await updateReportMutation.mutateAsync(reportDataToSend);
        if (!result?.success) {
          toast.error(
            result?.error || "Erreur lors de la mise à jour du rapport",
          );
          return false;
        }

        toast.success("Rapport mis à jour avec succès");
        await invalidateReportUpdateQueries(queryClient, reportId);
        setLastSavedState(submittedState);
        setHasUnsavedChanges(
          currentDraftRevisionRef.current !== submittedRevision,
        );
        if (result.status === "finalized") {
          navigate({
            to: "/dashboard/reports/$id",
            params: { id: reportId },
          });
        }
        return true;
      } catch (error) {
        console.error("Erreur lors de la mise à jour:", error);
        return false;
      }
    });
  };

  const handleOpenOwnerPreparation = async (sourceKey?: string) => {
    if (reportSaveGuard.current) return false;
    return openOwnerPreparation({
      hasUnsavedChanges,
      saveDraft: () => handleUpdateReport("draft"),
      openPanel: () => setPanelState({ type: "owner-preparation", sourceKey }),
      getRevision: () => currentDraftRevisionRef.current,
    });
  };

  // Fonction pour ouvrir le dialog de rappel
  const handleOpenReminderDialog = () => {
    setIsReminderDialogOpen(true);
  };

  const missingOwnerCount = ownerQueue.filter(
    (item) => item.status === "missing",
  ).length;
  const staleOwnerCount = ownerQueue.filter(
    (item) => item.status === "stale",
  ).length;

  function handleFinalizeRequest() {
    if (!canFinalizeReport(sectionStates)) {
      toast.error(
        "Confirmez ou marquez non applicable chaque section du rapport.",
      );
      return;
    }
    if (missingOwnerCount === 0 && staleOwnerCount === 0) {
      handleOpenReminderDialog();
      return;
    }
    setIsOwnerWarningOpen(true);
  }

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
      updateAnatomicalIssues(
        anatomicalIssues.map((issue) =>
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
      updateAnatomicalIssues([...anatomicalIssues, newIssue]);
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

  const selectedPet = petData ?? initialData.patient;

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

  const tabs = [
    {
      id: "clinical" as const,
      label: "Observations",
      count: observations.length,
      professionalStatus: getEffectiveSectionState({
        persisted: sectionStates.clinical,
        hasContent:
          deriveProfessionalSectionStatus("clinical", {
            consultationReason,
            itemTexts: observations.map((item) => item.notes || item.region),
          }) !== "empty",
      }),
    },
    {
      id: "anatomical" as const,
      label: "Anatomie",
      count: anatomicalIssues.length,
      professionalStatus: getEffectiveSectionState({
        persisted: sectionStates.anatomical,
        hasContent:
          deriveProfessionalSectionStatus("anatomical", {
            consultationReason: "",
            itemTexts: anatomicalIssues.map(getAnatomicalProfessionalItemText),
          }) !== "empty",
      }),
    },
    {
      id: "recommendations" as const,
      label: "Recommandations",
      count: recommendations.length,
      professionalStatus: getEffectiveSectionState({
        persisted: sectionStates.recommendations,
        hasContent:
          deriveProfessionalSectionStatus("recommendations", {
            consultationReason: "",
            itemTexts: recommendations.map((item) => item.content),
          }) !== "empty",
      }),
    },
    {
      id: "notes" as const,
      label: "Notes additionnelles",
      count: notes.trim() ? 1 : 0,
      professionalStatus: getEffectiveSectionState({
        persisted: sectionStates.notes,
        hasContent:
          deriveProfessionalSectionStatus("notes", {
            consultationReason: "",
            itemTexts: notes.trim() ? [notes] : [],
          }) !== "empty",
      }),
    },
  ];
  const ownerStatuses = Object.fromEntries(
    tabs.map((tab) => {
      const sectionStatuses = ownerSources
        .filter((source) => source.section === tab.id)
        .map((source) => ownerDocument.byKey[source.key]!.status);
      const status: OwnerContentStatus | "not-applicable" =
        sectionStatuses.length === 0
          ? "not-applicable"
          : sectionStatuses.includes("stale")
            ? "stale"
            : sectionStatuses.includes("missing")
              ? "missing"
              : "ready";
      return [tab.id, status];
    }),
  ) as Record<ReportSectionId, OwnerContentStatus | "not-applicable">;
  const selectedPetSummary = <ReportPatientIdentity patient={selectedPet} />;

  return (
    <div className="min-h-dvh w-full bg-slate-50 text-slate-950">
      {/* Desktop Layout */}
      <div className="hidden h-dvh lg:block">
        <div className={getReportDesktopGridClassName(isSidebarCollapsed)}>
          {/* Navigation latérale */}
          <div className="flex h-full min-h-0 flex-col gap-3 overflow-y-auto overflow-x-hidden">
            <ReportSidebarNavigation
              tabs={tabs}
              activeTab={activeTab}
              onChangeTab={(tab) => setActiveTab(tab)}
              onGoBack={handleGoBack}
              onShortcuts={() => setIsShortcutsModalOpen(true)}
              ownerStatuses={ownerStatuses}
              pendingOwnerCount={ownerQueue.length}
              onPrepareOwnerContent={() => {
                void handleOpenOwnerPreparation();
              }}
              isPreparationDisabled={updateReportMutation.isPending}
              isCollapsed={isSidebarCollapsed}
              onToggleCollapse={() =>
                setIsSidebarCollapsed(!isSidebarCollapsed)
              }
            />
            <TestModeSection
              isTestMode={isTestMode}
              onTestModeChange={setIsTestMode}
              selectedAnimalType={selectedAnimalType}
              onAnimalTypeChange={setSelectedAnimalType}
              isCollapsed={isSidebarCollapsed}
            />
          </div>

          {/* Contenu principal */}
          <main className="grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)] overflow-hidden rounded-3xl border border-border bg-background shadow-sm">
            <ReportWorkspaceHeader
              title={title}
              onTitleChange={setTitle}
              patientSummary={selectedPetSummary}
              appointment={appointmentDetails}
              onPreview={() => setPanelState({ type: "owner-preview" })}
              onSave={() => {
                void handleUpdateReport("draft");
              }}
              onFinalize={handleFinalizeRequest}
              isSaving={updateReportMutation.isPending}
            />

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
                <div className="grid h-full min-h-0 grid-rows-[minmax(0,1fr)_auto]">
                  <div className="h-full min-h-0 overflow-hidden">
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
                        setDysfunctions={updateAnatomicalIssues}
                        onAddDysfunction={(issue) => {
                          const newIssue: AnatomicalIssue = {
                            id: crypto.randomUUID(),
                            ...issue,
                            laterality: issue.laterality || "left",
                          };
                          updateAnatomicalIssues([
                            ...anatomicalIssues,
                            newIssue,
                          ]);
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
                          setRecommendations={updateRecommendations}
                        />
                      </div>
                    )}

                    {activeTab === "notes" && (
                      <div className="h-full min-h-0 p-5 xl:p-6">
                        <NotesTab notes={notes} setNotes={updateNotes} />
                      </div>
                    )}
                  </div>
                  <div className="border-t border-border bg-background px-5 py-3 xl:px-6">
                    <SectionDecisionControl
                      state={sectionStates[activeTab]}
                      onChange={(state) => resolveSection(activeTab, state)}
                    />
                  </div>
                </div>
              )}
            </section>
          </main>
        </div>
      </div>

      {/* Mobile/Tablet Layout */}
      <div className="min-h-dvh bg-slate-50 lg:hidden">
        <div className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
          <ReportWorkspaceHeader
            title={title}
            onTitleChange={setTitle}
            patientSummary={selectedPetSummary}
            appointment={appointmentDetails}
            onPreview={() => setPanelState({ type: "owner-preview" })}
            onSave={() => {
              void handleUpdateReport("draft");
            }}
            onFinalize={handleFinalizeRequest}
            isSaving={updateReportMutation.isPending}
          />
          <div className="grid gap-3 p-4 pt-3">
            <Select
              value={activeTab}
              onValueChange={(value) =>
                handleTabChange(value as ReportSectionId)
              }
            >
              <SelectTrigger
                className="h-10 w-full"
                aria-label="Section du rapport"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {tabs.map((tab) => (
                  <SelectItem key={tab.id} value={tab.id}>
                    {tab.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleGoBack}
                aria-label="Retour"
              >
                <ChevronLeftIcon className="size-4" />
              </Button>
              {activeTab === "clinical" && (
                <Button
                  size="sm"
                  onClick={handleOpenAddObservation}
                  className="h-9 rounded-xl bg-primary text-primary-foreground active:scale-[0.98]"
                  aria-label="Nouvelle observation"
                >
                  <PlusIcon className="h-4 w-4" />
                  Nouvelle observation
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsShortcutsModalOpen(true)}
                className="h-9 rounded-xl border-slate-200 bg-white text-slate-700 active:scale-[0.98]"
                aria-label="Raccourcis"
              >
                <KeyboardIcon className="h-4 w-4" />
                Raccourcis
              </Button>
            </div>
          </div>
        </div>

        <div>
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
              setDysfunctions={updateAnatomicalIssues}
              onAddDysfunction={(issue) => {
                const newIssue: AnatomicalIssue = {
                  id: crypto.randomUUID(),
                  ...issue,
                  laterality: issue.laterality || "left",
                };
                updateAnatomicalIssues([...anatomicalIssues, newIssue]);
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
              setRecommendations={updateRecommendations}
            />
          </div>

          <div
            className={cn(
              "px-4 py-6",
              activeTab === "notes" ? "block" : "hidden",
            )}
          >
            <NotesTab notes={notes} setNotes={updateNotes} />
          </div>

          <div className="border-t border-border bg-background px-4 py-3">
            <SectionDecisionControl
              state={sectionStates[activeTab]}
              onChange={(state) => resolveSection(activeTab, state)}
            />
          </div>
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
        animalData={selectedPet?.animal}
        selectedZone={newAnatomicalIssue.interventionZone}
        isTestMode={isTestMode}
        selectedAnimalType={selectedAnimalType}
        submitLabel={editingAnatomicalIssueId ? "Mettre à jour" : "Ajouter"}
        petId={selectedPetId}
      />

      <ReportPanelController
        state={panelState}
        onClose={() => setPanelState({ type: "closed" })}
        preview={{
          title,
          patientName: selectedPet?.name,
          entries: ownerPreviewEntries,
          onStartPreparation: () => {
            void handleOpenOwnerPreparation();
          },
          isPreparationDisabled: updateReportMutation.isPending,
          onJumpToSection: (section) => {
            setActiveTab(section);
            setPanelState({ type: "closed" });
          },
        }}
        preparation={{
          reportId,
          queue: ownerQueue,
          records: ownerContents,
          onSave: async (input) => {
            const result = await ownerContentMutation.mutateAsync(input);
            if (!result.success) {
              throw new Error("Enregistrement impossible");
            }
            return result;
          },
          onViewPreview: () => setPanelState({ type: "owner-preview" }),
        }}
      />

      <OwnerPreparationWarningDialog
        open={isOwnerWarningOpen}
        missingCount={missingOwnerCount}
        staleCount={staleOwnerCount}
        onOpenChange={setIsOwnerWarningOpen}
        onPrepare={() => {
          setIsOwnerWarningOpen(false);
          void handleOpenOwnerPreparation();
        }}
        onFinalize={() => {
          setIsOwnerWarningOpen(false);
          handleOpenReminderDialog();
        }}
      />

      <AnimalCredenza
        isOpen={isAnimalCredenzaOpen}
        onOpenChange={setIsAnimalCredenzaOpen}
        petId={selectedPetId}
      />

      {/* Modale des raccourcis clavier */}
      <Credenza
        open={isShortcutsModalOpen}
        onOpenChange={setIsShortcutsModalOpen}
      >
        <CredenzaContent className="sm:max-w-150">
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
        onFinalize={async () => {
          if (!canFinalizeReport(sectionStates)) {
            toast.error(
              "Confirmez ou marquez non applicable chaque section du rapport.",
            );
            return false;
          }
          return handleUpdateReport("finalized");
        }}
        isFinalizing={updateReportMutation.isPending}
      />
    </div>
  );
}
