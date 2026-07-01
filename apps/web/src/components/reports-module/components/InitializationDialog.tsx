
import { useState } from "react";
import { AnimalCredenza } from "@/components/animal-folder";
import {
  PawPrintIcon,
  CheckIcon,
  ChevronRightIcon,
  ClipboardIcon,
  Loader2Icon,
  Search,
  CalendarIcon,
} from "lucide-react";
import { getPatientById } from "@/lib/api/actions/patients.action";
import { getAllPatients } from "@/lib/api/actions/patients.action";
import { getAppointmentsByPatientId } from "@/lib/api/actions/appointments.action";
import { useMutation, useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Credenza,
  CredenzaContent,
  CredenzaDescription,
  CredenzaFooter,
  CredenzaHeader,
  CredenzaTitle,
} from "@/components/ui/credenza";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createReport } from "@/lib/api/actions/reports.action";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";

type InitializationDialogProps = {
  showInitDialog: boolean;
  setShowInitDialog: (show: boolean) => void;
};

export function InitializationDialog({
  showInitDialog,
  setShowInitDialog,
}: InitializationDialogProps) {
  const NO_APPOINTMENT_VALUE = "__no_appointment__";
  const [appointmentChoiceMade, setAppointmentChoiceMade] = useState(false);
  const [isAnimalCredenzaOpen, setIsAnimalCredenzaOpen] = useState(false);
  const [petSearchTerm, setPetSearchTerm] = useState<string>("");
  const navigate = useNavigate();
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  const [consultationReason, setConsultationReason] = useState<string>("");
  const [title, setTitle] = useState<string>("Nouveau rapport");

  // Récupération de tous les animaux liés au professionnel
  const { data: allPetsData, isLoading: isLoadingPets } = useQuery({
    queryKey: ["pro-patients"],
    queryFn: () => getAllPatients(),
  });

  // Filtrer les animaux selon le terme de recherche
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

  const pets: PetListItem[] = (allPetsData ?? []) as PetListItem[];
  const filteredPets: PetListItem[] = pets.filter(
    (pet) =>
      pet.name.toLowerCase().includes(petSearchTerm.toLowerCase()) ||
      (pet.type?.toLowerCase() ?? "").includes(petSearchTerm.toLowerCase()) ||
      (pet.breed ?? "").toLowerCase().includes(petSearchTerm.toLowerCase()),
  );

  // Récupération des détails de l'animal sélectionné
  const { data: petData, isLoading: isLoadingPet } = useQuery({
    queryKey: ["pet", selectedPetId],
    queryFn: async () => getPatientById(selectedPetId ?? ""),
    enabled: !!selectedPetId,
  });

  // Récupération des rendez-vous de l'animal sélectionné
  const { data: appointmentsData, isLoading: isLoadingAppointments } = useQuery({
    queryKey: ["appointments", selectedPetId],
    queryFn: async () => getAppointmentsByPatientId(selectedPetId ?? ""),
    enabled: !!selectedPetId,
  });

  const handleOpenAnimalSelector = () => {
    setIsAnimalCredenzaOpen(true);
  };

  const { mutateAsync: createReportMutation, isPending: isCreatingReport } = useMutation({
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

  const onComplete = async () => {
    if (!selectedPetId || !consultationReason) return;
    await createReportMutation({
      title: title?.trim() || "Nouveau rapport",
      petId: selectedPetId ?? "",
      appointmentId: selectedAppointmentId ?? undefined,
      consultationReason: consultationReason,
      status: "draft",
    });
  }

  // Réinitialiser le rendez-vous sélectionné quand l'animal change
  const handlePetChange = (petId: string) => {
    setSelectedPetId(petId);
    setSelectedAppointmentId(null);
    setAppointmentChoiceMade(false);
  };

  return (
    <>
      <Credenza open={showInitDialog} onOpenChange={setShowInitDialog}>
        <CredenzaContent className="sm:max-w-[550px]">
          <CredenzaHeader>
            <CredenzaTitle className="text-xl flex items-center gap-2">
              <ClipboardIcon className="h-5 w-5 text-primary" />
              Nouveau compte rendu
            </CredenzaTitle>
            <CredenzaDescription className="text-base">
              Sélectionnez l&apos;animal et le motif de la consultation pour créer un nouveau compte rendu.
            </CredenzaDescription>
          </CredenzaHeader>

          <div className="space-y-8 py-4">
            {/* Titre du rapport */}
            <div className="space-y-3">
              <div>
                <Label
                  htmlFor="report-title"
                  className="flex items-center gap-2 text-base font-medium"
                >
                  <ClipboardIcon className="h-4 w-4 text-primary" />
                  Titre du rapport
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Donnez un titre court et explicite au rapport
                </p>
              </div>
              <Input
                id="report-title"
                placeholder="Exemple : Séance du 12/10 — Max"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-base"
              />
            </div>

            {/* Sélection de l'animal */}
            <div className="space-y-3">
              <Label
                htmlFor="pet-select"
                className="flex items-center gap-2 text-base font-medium"
              >
                <PawPrintIcon className="h-4 w-4 text-primary" />
                Animal concerné
              </Label>
              <div className="flex items-center gap-2">
                <Select
                  value={selectedPetId ?? ""}
                  onValueChange={handlePetChange}
                  disabled={isLoadingPets}
                >
                  <SelectTrigger id="pet-select" className="w-full">
                    {isLoadingPets ? (
                      <div className="flex items-center gap-2">
                        <Loader2Icon className="h-4 w-4 animate-spin" />
                        <span>Chargement des animaux...</span>
                      </div>
                    ) : (
                      <SelectValue placeholder="Sélectionner un animal" />
                    )}
                  </SelectTrigger>
                  <SelectContent>
                    {(allPetsData?.length ?? 0) > 0 ? (
                      <>
                        <div className="px-2 py-2">
                          <div className="flex items-center px-1 mb-2 border rounded-md">
                            <Search className="h-4 w-4 text-muted-foreground ml-1 mr-1" />
                            <Input
                              placeholder="Rechercher un animal..."
                              className="h-8 border-0 text-base focus-visible:ring-0 focus-visible:ring-offset-0"
                              value={petSearchTerm}
                              onChange={(e) => setPetSearchTerm(e.target.value)}
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
                              <div className="flex items-center gap-2 py-1.5">
                                <Avatar className="h-6 w-6 shrink-0">
                                  <AvatarImage
                                    src={pet.image ?? undefined}
                                    alt={pet.name ?? ""}
                                  />
                                  <AvatarFallback className="text-xs bg-muted">
                                    <PawPrintIcon className="h-3.5 w-3.5" />
                                  </AvatarFallback>
                                </Avatar>
                                <span className="truncate">
                                  {pet.name} ({pet.animal?.name}
                                  {pet.breed ? ` - ${pet.breed}` : ""}) -{" "}
                                  {pet.owner?.name}
                                </span>
                              </div>
                            </SelectItem>
                          ))
                        ) : (
                          <div className="px-2 py-4 text-center text-sm text-muted-foreground">
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
                  variant="outline"
                  size="icon"
                  onClick={handleOpenAnimalSelector}
                  className="shrink-0"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.3-4.3" />
                  </svg>
                </Button>
              </div>
            </div>

            {selectedPetId && (
              <>
                {/* Sélection du rendez-vous (optionnel) */}
                <div className="space-y-3">
                  <div>
                    <Label
                      htmlFor="appointment-select"
                      className="flex items-center gap-2 text-base font-medium"
                    >
                      <CalendarIcon className="h-4 w-4 text-primary" />
                      Rendez-vous associé (optionnel)
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Liez ce rapport à un rendez-vous existant
                    </p>
                  </div>
                  <Select
                    value={appointmentChoiceMade ? selectedAppointmentId ?? NO_APPOINTMENT_VALUE : undefined}
                    onValueChange={(value) => {
                      setAppointmentChoiceMade(true);
                      setSelectedAppointmentId(value === NO_APPOINTMENT_VALUE ? null : value);
                    }}
                    disabled={isLoadingAppointments}
                  >
                    <SelectTrigger id="appointment-select" className="w-full">
                      {isLoadingAppointments ? (
                        <div className="flex items-center gap-2">
                          <Loader2Icon className="h-4 w-4 animate-spin" />
                          <span>Chargement des rendez-vous...</span>
                        </div>
                      ) : (
                        <SelectValue placeholder="Sélectionner un rendez-vous (ou aucun)" />
                      )}
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NO_APPOINTMENT_VALUE}>
                        Aucun rendez-vous
                      </SelectItem>
                      {appointmentsData?.length ? (
                        appointmentsData.map((appointment) => (
                          <SelectItem key={appointment.id} value={appointment.id}>
                            {format(new Date(appointment.beginAt), "dd MMMM yyyy 'à' HH:mm", {
                              locale: fr,
                            })}
                            {appointment.status === "COMPLETED" && " (Terminé)"}
                            {appointment.status === "CONFIRMED" && " (Confirmé)"}
                            {appointment.status === "CREATED" && " (Créé)"}
                            {appointment.status === "CANCELLED" && " (Annulé)"}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="__no_available__" disabled>
                          Aucun rendez-vous disponible
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {appointmentChoiceMade && (
                  <div className="space-y-3">
                    <div>
                      <Label
                        htmlFor="consultation-reason"
                        className="flex items-center gap-2 text-base font-medium"
                      >
                        <CheckIcon className="h-4 w-4 text-primary" />
                        Motif de la séance
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Indiquez le motif principal de la consultation
                      </p>
                    </div>
                    <Textarea
                      id="consultation-reason"
                      placeholder="Exemple : Boiterie membre postérieur gauche, Suivi post-opératoire..."
                      value={consultationReason}
                      onChange={(e) => setConsultationReason(e.target.value)}
                      className="w-full text-base min-h-[80px] resize-y"
                    />
                  </div>
                )}
              </>
            )}
          </div>

          <CredenzaFooter>
            <Button
              onClick={async () => await onComplete()}
              disabled={!selectedPetId || isLoadingPets || isLoadingPet || !consultationReason || isCreatingReport}
              className="w-full sm:w-auto"
            >
              {isCreatingReport ? (
                <>
                  <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                  Création du rapport...
                </>
              ) : (
                "Créer le rapport"
              )}
            </Button>
          </CredenzaFooter>
        </CredenzaContent>
      </Credenza>

      {isAnimalCredenzaOpen && (
        <AnimalCredenza
          isOpen={isAnimalCredenzaOpen}
          onOpenChange={setIsAnimalCredenzaOpen}
          petId={selectedPetId ?? ""}
        />
      )}
    </>
  );
}
