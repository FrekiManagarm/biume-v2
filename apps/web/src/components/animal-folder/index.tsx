
import type { ActiveTab } from "./types";
import { CredenzaContent, CredenzaTitle } from "@/components/ui/credenza";
import { HeartPulseIcon, Info, FileText } from "lucide-react";
import { AnimalDetailsSidebar } from "./AnimalCredenza/AnimalDetailsSidebar";
import { Button } from "@/components/ui/button";
import { Credenza } from "@/components/ui/credenza";
import { InfoTab } from "./AnimalCredenza/InfoTab";
import { MedicalDocumentsTab } from "./AnimalCredenza/MedicalDocumentsTab";
import { MedicalFilesTab } from "./AnimalCredenza/MedicalFilesTab";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getPatientById } from "@/lib/api/actions/patients.action";
import { Skeleton } from "@/components/ui/skeleton";
import { MobileNavigation } from "./AnimalCredenza/MobileNavigation";

interface AnimalCredenzaProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  petId: string;
  client?: boolean;
}

const tabs = [
  {
    id: "info" as ActiveTab,
    label: "Informations",
    icon: <Info className="h-4 w-4" />,
  },
  {
    id: "medical-documents" as ActiveTab,
    label: "Comptes rendus",
    icon: <HeartPulseIcon className="h-4 w-4" />,
  },
  {
    id: "medical-files" as ActiveTab,
    label: "Documents médicaux",
    icon: <FileText className="h-4 w-4" />,
  },
];

export const AnimalCredenza = ({
  isOpen,
  onOpenChange,
  petId,
  client,
}: AnimalCredenzaProps) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>("info");

  const { data: pet, isLoading: isLoadingPet } = useQuery({
    queryKey: ["pet-informations", petId],
    queryFn: () => getPatientById(petId),
    enabled: !!petId,
  });

  return (
    <Credenza open={isOpen} onOpenChange={onOpenChange}>
      <VisuallyHidden asChild>
        <CredenzaTitle>Fiche de l&apos;animal</CredenzaTitle>
      </VisuallyHidden>
      <CredenzaContent className="sm:max-w-[1000px] p-0 overflow-hidden">
        <div className="flex flex-col md:flex-row h-[80vh] max-h-[650px]">
          {isLoadingPet ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="space-y-4 w-[80%]">
                <Skeleton className="h-8 w-[200px]" />
                <Skeleton className="h-[400px] w-full" />
              </div>
            </div>
          ) : !pet ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center space-y-4">
                <p className="text-lg font-medium text-muted-foreground">
                  Aucune donnée disponible pour cet animal
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onOpenChange(false)}
                >
                  Fermer
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Navigation mobile */}
              <MobileNavigation
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                tabs={tabs}
                animal={pet}
              />

              {/* Sidebar avec photo et navigation - visible uniquement sur desktop */}
              <div className="hidden md:block border-r">
                <AnimalDetailsSidebar
                  animal={pet}
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                />
              </div>

              {/* Contenu principal */}
              <div className="flex-1 overflow-y-auto">
                {/* Contenu dynamique en fonction de l'onglet actif */}
                {activeTab === "info" && (
                  <InfoTab animal={pet} setActiveTab={setActiveTab} />
                )}
                {activeTab === "medical-documents" && (
                  <MedicalDocumentsTab animal={pet} client={client} />
                )}
                {activeTab === "medical-files" && (
                  <MedicalFilesTab animal={pet} client={client} />
                )}
              </div>
            </>
          )}
        </div>
      </CredenzaContent>
    </Credenza>
  );
};
