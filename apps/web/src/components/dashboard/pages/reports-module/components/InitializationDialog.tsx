import { useState, type ReactNode } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ChevronRightIcon, Loader2Icon, Search } from "lucide-react";
import { toast } from "sonner";

import { AnimalCredenza } from "@/components/animal-folder";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Credenza,
  CredenzaContent,
  CredenzaDescription,
  CredenzaFooter,
  CredenzaHeader,
  CredenzaTitle,
} from "@/components/ui/credenza";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getAppointmentsByPatientId } from "@/lib/api/actions/appointments.action";
import {
  getAllPatients,
  getPatientById,
} from "@/lib/api/actions/patients.action";
import { createReport } from "@/lib/api/actions/reports.action";
import { canSubmitReportDraft } from "./InitializationDialog.helpers";

type InitializationDialogProps = {
  showInitDialog: boolean;
  setShowInitDialog: (show: boolean) => void;
};

type PetOwner = { name?: string | null };
type PetAnimal = { name?: string | null };
type PetListItem = {
  id: string;
  name: string;
  type?: string | null;
  breed?: string | null;
  image?: string | null;
  owner?: PetOwner | null;
  animal?: PetAnimal | null;
};

const NO_APPOINTMENT_VALUE = "__no_appointment__";

export function InitializationDialog({
  showInitDialog,
  setShowInitDialog,
}: InitializationDialogProps) {
  const navigate = useNavigate();
  const [isAnimalCredenzaOpen, setIsAnimalCredenzaOpen] = useState(false);
  const [petSearchTerm, setPetSearchTerm] = useState("");
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<
    string | null
  >(null);
  const [consultationReason, setConsultationReason] = useState("");
  const [title, setTitle] = useState("Nouveau rapport");
  const [isPetSelectOpen, setIsPetSelectOpen] = useState(false);
  const [isAppointmentSelectOpen, setIsAppointmentSelectOpen] = useState(false);

  const { data: allPetsData, isLoading: isLoadingPets } = useQuery({
    queryKey: ["pro-patients"],
    queryFn: () => getAllPatients(),
  });

  const pets: PetListItem[] = (allPetsData ?? []) as PetListItem[];
  const filteredPets = pets.filter(
    (pet) =>
      pet.name.toLowerCase().includes(petSearchTerm.toLowerCase()) ||
      (pet.type?.toLowerCase() ?? "").includes(petSearchTerm.toLowerCase()) ||
      (pet.breed ?? "").toLowerCase().includes(petSearchTerm.toLowerCase()) ||
      (pet.owner?.name ?? "")
        .toLowerCase()
        .includes(petSearchTerm.toLowerCase()),
  );
  const selectedPet = pets.find((pet) => pet.id === selectedPetId);

  const { isLoading: isLoadingPet } = useQuery({
    queryKey: ["pet", selectedPetId],
    queryFn: async () => getPatientById(selectedPetId ?? ""),
    enabled: !!selectedPetId,
  });

  const { data: appointmentsData, isLoading: isLoadingAppointments } = useQuery(
    {
      queryKey: ["appointments", selectedPetId],
      queryFn: async () => getAppointmentsByPatientId(selectedPetId ?? ""),
      enabled: !!selectedPetId,
    },
  );

  const { mutateAsync: createReportMutation, isPending: isCreatingReport } =
    useMutation({
      mutationFn: createReport,
      onSuccess: (data) => {
        if (data.success) {
          toast.success("Rapport créé avec succès");
          navigate({
            to: "/dashboard/reports/$id/edit",
            params: { id: data.reportId },
          });
        }
      },
      onError: (error) => {
        toast.error("Erreur lors de la création du rapport");
        console.error(error);
      },
    });

  const canCreate = canSubmitReportDraft({
    selectedPetId,
    consultationReason,
    isLoadingPets,
    isLoadingPet,
    isCreatingReport,
  });

  const handlePetChange = (petId: string) => {
    setSelectedPetId(petId);
    setSelectedAppointmentId(null);
  };

  const onComplete = async () => {
    if (!canCreate) {
      return;
    }

    await createReportMutation({
      title: title.trim() || "Nouveau rapport",
      petId: selectedPetId ?? "",
      appointmentId: selectedAppointmentId ?? undefined,
      consultationReason: consultationReason.trim(),
      status: "draft",
    });
  };

  const isSelectOpen = isPetSelectOpen || isAppointmentSelectOpen;

  return (
    <>
      <Credenza
        open={showInitDialog}
        onOpenChange={setShowInitDialog}
        disablePointerDismissal={isSelectOpen}
      >
        <CredenzaContent className="overflow-hidden rounded-xl border border-border bg-background p-0 sm:max-w-[560px]">
          <CredenzaHeader className="border-b px-5 py-4 text-left">
            <CredenzaTitle className="text-lg font-semibold tracking-tight">
              Créer un rapport
            </CredenzaTitle>
            <CredenzaDescription className="text-sm text-muted-foreground">
              Renseignez les informations de départ, puis ouvrez le brouillon.
            </CredenzaDescription>
          </CredenzaHeader>

          <div className="grid max-h-[68vh] gap-5 overflow-y-auto px-5 py-5">
            <FieldGroup label="Titre" htmlFor="report-title">
              <Input
                id="report-title"
                placeholder="Nouveau rapport"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="h-10"
              />
            </FieldGroup>

            <FieldGroup label="Animal" htmlFor="pet-select">
              <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                <Select
                  open={isPetSelectOpen}
                  onOpenChange={setIsPetSelectOpen}
                  value={selectedPetId ?? ""}
                  onValueChange={handlePetChange}
                  disabled={isLoadingPets}
                >
                  <SelectTrigger id="pet-select" className="h-10 w-full">
                    {isLoadingPets ? (
                      <div className="flex items-center gap-2">
                        <Loader2Icon className="size-4 animate-spin" />
                        <span>Chargement des animaux...</span>
                      </div>
                    ) : (
                      <SelectValue placeholder="Sélectionner un animal" />
                    )}
                  </SelectTrigger>
                  <SelectContent>
                    {pets.length > 0 ? (
                      <>
                        <div className="px-2 py-2">
                          <div className="flex items-center rounded-md border bg-muted/50 px-2">
                            <Search className="mr-2 size-4 text-muted-foreground" />
                            <Input
                              placeholder="Rechercher un animal..."
                              className="h-9 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
                              value={petSearchTerm}
                              onChange={(event) =>
                                setPetSearchTerm(event.target.value)
                              }
                            />
                          </div>
                        </div>

                        {filteredPets.length > 0 ? (
                          filteredPets.map((pet) => (
                            <SelectItem
                              key={pet.id}
                              value={pet.id}
                              className="h-auto p-0 pl-8 pr-2"
                            >
                              <div className="flex min-w-0 items-center gap-3 py-2">
                                <Avatar className="size-8 shrink-0 rounded-xl">
                                  <AvatarImage
                                    src={pet.image ?? undefined}
                                    alt={pet.name ?? ""}
                                  />
                                  <AvatarFallback className="rounded-xl bg-muted text-xs">
                                    {getInitials(pet.name)}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="min-w-0">
                                  <span className="block truncate text-sm font-medium">
                                    {pet.name}
                                  </span>
                                  <span className="block truncate text-xs text-muted-foreground">
                                    {pet.animal?.name ?? "Animal"}
                                    {pet.breed ? ` - ${pet.breed}` : ""}
                                    {pet.owner?.name
                                      ? ` - ${pet.owner.name}`
                                      : ""}
                                  </span>
                                </span>
                              </div>
                            </SelectItem>
                          ))
                        ) : (
                          <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                            Aucun animal trouvé
                          </div>
                        )}
                      </>
                    ) : (
                      <SelectItem value="no-pets" disabled>
                        Aucun animal trouvé
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAnimalCredenzaOpen(true)}
                  disabled={!selectedPetId}
                  className="h-10 justify-start sm:w-10 sm:px-0"
                >
                  <Search className="size-4" />
                  <span className="sm:sr-only">Ouvrir le dossier animal</span>
                </Button>
              </div>

              {selectedPet ? (
                <div className="mt-3 grid grid-cols-[auto_1fr] items-center gap-3 rounded-lg border bg-muted/40 px-3 py-2">
                  <Avatar className="size-8 rounded-lg">
                    <AvatarImage
                      src={selectedPet.image ?? undefined}
                      alt={selectedPet.name}
                    />
                    <AvatarFallback className="rounded-lg bg-background text-xs font-semibold">
                      {getInitials(selectedPet.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {selectedPet.name}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {selectedPet.animal?.name ?? "Animal"}
                      {selectedPet.owner?.name
                        ? ` - ${selectedPet.owner.name}`
                        : ""}
                    </p>
                  </div>
                </div>
              ) : null}
            </FieldGroup>

            <FieldGroup
              label="Rendez-vous (optionnel)"
              htmlFor="appointment-select"
            >
              <Select
                open={isAppointmentSelectOpen}
                onOpenChange={setIsAppointmentSelectOpen}
                value={selectedAppointmentId ?? NO_APPOINTMENT_VALUE}
                onValueChange={(value) => {
                  setSelectedAppointmentId(
                    value === NO_APPOINTMENT_VALUE ? null : value,
                  );
                }}
                disabled={!selectedPetId || isLoadingAppointments}
              >
                <SelectTrigger id="appointment-select" className="h-10 w-full">
                  {isLoadingAppointments ? (
                    <div className="flex items-center gap-2">
                      <Loader2Icon className="size-4 animate-spin" />
                      <span>Chargement des rendez-vous...</span>
                    </div>
                  ) : (
                    <SelectValue placeholder="Aucun rendez-vous" />
                  )}
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_APPOINTMENT_VALUE}>
                    Aucun rendez-vous
                  </SelectItem>
                  {appointmentsData?.length ? (
                    appointmentsData.map((appointment) => (
                      <SelectItem key={appointment.id} value={appointment.id}>
                        {format(
                          new Date(appointment.beginAt),
                          "dd MMMM yyyy 'à' HH:mm",
                          {
                            locale: fr,
                          },
                        )}
                        {getAppointmentStatusLabel(appointment.status)}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="__no_available__" disabled>
                      Aucun rendez-vous disponible
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </FieldGroup>

            <FieldGroup
              label="Motif de la séance"
              htmlFor="consultation-reason"
            >
              <Textarea
                id="consultation-reason"
                placeholder="Boiterie, suivi post-opératoire, contrôle..."
                value={consultationReason}
                onChange={(event) => setConsultationReason(event.target.value)}
                className="min-h-24 resize-y"
              />
            </FieldGroup>
          </div>

          <CredenzaFooter className="mx-0 mb-0 flex flex-col-reverse gap-3 rounded-none border-t bg-muted/40 px-5 py-4 sm:flex-row sm:items-center sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowInitDialog(false)}
              className="h-10 w-full sm:w-auto"
            >
              Annuler
            </Button>
            <Button
              onClick={() => void onComplete()}
              disabled={!canCreate}
              className="h-10 w-full active:scale-[0.98] sm:w-auto"
            >
              {isCreatingReport ? (
                <>
                  Création...
                  <Loader2Icon
                    className="size-4 animate-spin"
                    data-icon="inline-end"
                  />
                </>
              ) : (
                <>
                  Créer le rapport
                  <ChevronRightIcon className="size-4" data-icon="inline-end" />
                </>
              )}
            </Button>
          </CredenzaFooter>
        </CredenzaContent>
      </Credenza>

      {isAnimalCredenzaOpen ? (
        <AnimalCredenza
          isOpen={isAnimalCredenzaOpen}
          onOpenChange={setIsAnimalCredenzaOpen}
          petId={selectedPetId ?? ""}
        />
      ) : null}
    </>
  );
}

function FieldGroup({
  children,
  htmlFor,
  label,
}: {
  children: ReactNode;
  htmlFor: string;
  label: string;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={htmlFor} className="text-sm font-medium">
        {label}
      </Label>
      {children}
    </div>
  );
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function getAppointmentStatusLabel(status: string) {
  const labels: Record<string, string> = {
    COMPLETED: " (Terminé)",
    CONFIRMED: " (Confirmé)",
    CREATED: " (Créé)",
    CANCELLED: " (Annulé)",
  };

  return labels[status] ?? "";
}
