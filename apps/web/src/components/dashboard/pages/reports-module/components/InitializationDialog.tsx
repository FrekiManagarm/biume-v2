import { useState, type ReactNode } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  CalendarIcon,
  CheckIcon,
  ChevronRightIcon,
  ClipboardIcon,
  Loader2Icon,
  PawPrintIcon,
  Search,
} from "lucide-react";
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
  const [appointmentChoiceMade, setAppointmentChoiceMade] = useState(false);
  const [isAnimalCredenzaOpen, setIsAnimalCredenzaOpen] = useState(false);
  const [petSearchTerm, setPetSearchTerm] = useState("");
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<
    string | null
  >(null);
  const [consultationReason, setConsultationReason] = useState("");
  const [title, setTitle] = useState("Nouveau rapport");

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

  const canCreate =
    !!selectedPetId &&
    appointmentChoiceMade &&
    !!consultationReason.trim() &&
    !isLoadingPets &&
    !isLoadingPet &&
    !isCreatingReport;

  const handlePetChange = (petId: string) => {
    setSelectedPetId(petId);
    setSelectedAppointmentId(null);
    setAppointmentChoiceMade(false);
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

  return (
    <>
      <Credenza open={showInitDialog} onOpenChange={setShowInitDialog}>
        <CredenzaContent className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white p-0 shadow-[0_24px_70px_-32px_rgba(15,23,42,0.45)] sm:max-w-[680px]">
          <CredenzaHeader className="border-b border-slate-200 px-5 py-5 text-left sm:px-6">
            <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.45)]">
              <ClipboardIcon className="size-3.5 text-emerald-700" />
              Nouveau document
            </div>
            <CredenzaTitle className="text-2xl font-semibold tracking-tight text-slate-950">
              Préparer un rapport.
            </CredenzaTitle>
            <CredenzaDescription className="max-w-xl text-sm leading-6 text-slate-600">
              Choisissez l&apos;animal, rattachez un rendez-vous si besoin, puis
              indiquez le motif de la séance avant d&apos;ouvrir l&apos;éditeur.
            </CredenzaDescription>
          </CredenzaHeader>

          <div className="grid max-h-[68vh] gap-4 overflow-y-auto px-5 py-5 sm:px-6">
            <SetupBlock
              description="Un titre court facilite la recherche dans la bibliothèque."
              icon={ClipboardIcon}
              step="01"
              title="Identifier le rapport"
            >
              <FieldGroup label="Titre du rapport" htmlFor="report-title">
                <Input
                  id="report-title"
                  placeholder="Exemple : Séance du 12/10 - Max"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  className="h-11 bg-white"
                />
              </FieldGroup>
            </SetupBlock>

            <SetupBlock
              description="Sélectionnez le patient concerné pour préremplir le dossier."
              icon={PawPrintIcon}
              step="02"
              title="Choisir l'animal"
            >
              <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                <Select
                  value={selectedPetId ?? ""}
                  onValueChange={handlePetChange}
                  disabled={isLoadingPets}
                >
                  <SelectTrigger
                    id="pet-select"
                    className="h-11 w-full bg-white"
                  >
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
                          <div className="flex items-center rounded-md border border-slate-200 bg-slate-50 px-2">
                            <Search className="mr-2 size-4 text-slate-400" />
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
                                  <AvatarFallback className="rounded-xl bg-emerald-50 text-xs text-emerald-800">
                                    {getInitials(pet.name)}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="min-w-0">
                                  <span className="block truncate text-sm font-medium text-slate-950">
                                    {pet.name}
                                  </span>
                                  <span className="block truncate text-xs text-slate-500">
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
                          <div className="px-3 py-6 text-center text-sm text-slate-500">
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
                  className="h-11 justify-start sm:w-11 sm:px-0"
                >
                  <Search className="size-4" />
                  <span className="sm:sr-only">Ouvrir le dossier animal</span>
                </Button>
              </div>

              {selectedPet ? (
                <div className="mt-3 grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-3">
                  <Avatar className="size-10 rounded-xl">
                    <AvatarImage
                      src={selectedPet.image ?? undefined}
                      alt={selectedPet.name}
                    />
                    <AvatarFallback className="rounded-xl bg-white text-sm font-semibold text-emerald-800">
                      {getInitials(selectedPet.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-950">
                      {selectedPet.name}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-emerald-800">
                      {selectedPet.animal?.name ?? "Animal"}
                      {selectedPet.owner?.name
                        ? ` - ${selectedPet.owner.name}`
                        : ""}
                    </p>
                  </div>
                  <CheckIcon className="size-4 text-emerald-700" />
                </div>
              ) : null}
            </SetupBlock>

            {selectedPetId ? (
              <SetupBlock
                description="Le rendez-vous reste optionnel, mais le choix doit être confirmé."
                icon={CalendarIcon}
                step="03"
                title="Rattacher la séance"
              >
                <Select
                  value={
                    appointmentChoiceMade
                      ? (selectedAppointmentId ?? NO_APPOINTMENT_VALUE)
                      : undefined
                  }
                  onValueChange={(value) => {
                    setAppointmentChoiceMade(true);
                    setSelectedAppointmentId(
                      value === NO_APPOINTMENT_VALUE ? null : value,
                    );
                  }}
                  disabled={isLoadingAppointments}
                >
                  <SelectTrigger
                    id="appointment-select"
                    className="h-11 w-full bg-white"
                  >
                    {isLoadingAppointments ? (
                      <div className="flex items-center gap-2">
                        <Loader2Icon className="size-4 animate-spin" />
                        <span>Chargement des rendez-vous...</span>
                      </div>
                    ) : (
                      <SelectValue placeholder="Sélectionner un rendez-vous ou aucun" />
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
              </SetupBlock>
            ) : null}

            {appointmentChoiceMade ? (
              <SetupBlock
                description="Cette information apparaîtra comme point de départ du rapport."
                icon={CheckIcon}
                step="04"
                title="Décrire le motif"
              >
                <FieldGroup
                  label="Motif de la séance"
                  htmlFor="consultation-reason"
                >
                  <Textarea
                    id="consultation-reason"
                    placeholder="Exemple : Boiterie membre postérieur gauche, suivi post-opératoire..."
                    value={consultationReason}
                    onChange={(event) =>
                      setConsultationReason(event.target.value)
                    }
                    className="min-h-24 resize-y bg-white"
                  />
                </FieldGroup>
              </SetupBlock>
            ) : null}
          </div>

          <CredenzaFooter className="mx-0 mb-0 flex flex-col-reverse gap-3 rounded-none border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p className="text-xs leading-5 text-slate-500">
              Le rapport sera créé en brouillon et ouvert dans l&apos;éditeur.
            </p>
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

function SetupBlock({
  children,
  description,
  icon: Icon,
  step,
  title,
}: {
  children: ReactNode;
  description: string;
  icon: typeof ClipboardIcon;
  step: string;
  title: string;
}) {
  return (
    <section className="rounded-[1.25rem] border border-slate-200 bg-white p-4 shadow-[0_18px_50px_-38px_rgba(15,23,42,0.45)]">
      <div className="mb-4 grid grid-cols-[auto_1fr] gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800">
          <Icon className="size-4" />
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <StepBadge>{step}</StepBadge>
            <h3 className="font-semibold tracking-tight text-slate-950">
              {title}
            </h3>
          </div>
          <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function StepBadge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex h-6 items-center rounded-md border border-slate-200 bg-slate-50 px-2 text-xs font-semibold text-slate-500">
      {children}
    </span>
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
      <Label htmlFor={htmlFor} className="text-sm font-medium text-slate-700">
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
