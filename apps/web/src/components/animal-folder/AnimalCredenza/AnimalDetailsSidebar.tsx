
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { useState } from "react";
import {
  ChevronRight,
  HeartPulseIcon,
  Info,
  Mail,
  User,
  PawPrint,
  FileText,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Credenza,
  CredenzaContent,
  CredenzaHeader,
  CredenzaTitle,
  CredenzaBody,
} from "@/components/ui/credenza";
import { Separator } from "@/components/ui/separator";

import type { Pet } from "@/lib/schemas/pets";
import type { ActiveTab } from "../types";

interface AnimalDetailsSidebarProps {
  animal: Pet;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export const AnimalDetailsSidebar = ({
  animal,
  activeTab,
  setActiveTab,
}: AnimalDetailsSidebarProps) => {
  const [showOwnerDetails, setShowOwnerDetails] = useState(false);

  // Calcul de l'âge basé sur la date de naissance
  const getAge = () => {
    if (!animal.birthDate) return "Âge inconnu";

    const age = formatDistanceToNow(new Date(animal.birthDate), {
      addSuffix: false,
      locale: fr,
    });

    return age;
  };

  return (
    <div className="w-full md:w-60 border-r flex flex-col h-full bg-muted/30">
      {/* En-tête simplifié */}
      <div className="p-4 text-center border-b">
        <Avatar className="h-16 w-16 mx-auto mb-3">
          <AvatarImage src={animal.image || ""} alt={animal.name} />
          <AvatarFallback className="text-lg bg-primary/10 text-primary font-semibold">
            {animal.name.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <h2 className="font-bold text-lg mb-2">{animal.name}</h2>
        <div className="space-y-1 text-sm text-muted-foreground">
          <div className="flex items-center justify-center gap-1">
            <PawPrint className="h-3 w-3" />
            {animal.animal?.name || "Animal"}
          </div>
          <div>
            {animal.breed} • {animal.gender === "Male" ? "Mâle" : "Femelle"}
          </div>
          <div>{getAge()}</div>
        </div>
      </div>

      {/* Section Propriétaire simplifiée */}
      {animal.owner && (
        <div className="p-3 border-b">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            Propriétaire
          </h3>
          <button
            className="w-full flex items-center gap-3 p-2 text-left transition-colors hover:bg-muted/20 rounded"
            onClick={() => setShowOwnerDetails(true)}
          >
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={animal.owner?.image || ""}
                alt={animal.owner?.name || "Propriétaire"}
              />
              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                {animal.owner?.name ? (
                  animal.owner.name.substring(0, 2).toUpperCase()
                ) : (
                  <User className="h-4 w-4" />
                )}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">
                {animal.owner?.name || "Non défini"}
              </p>
            </div>

            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      )}

      {/* Navigation simplifiée */}
      <div className="flex-1 p-3">
        <div className="space-y-2">
          <Button
            variant={activeTab === "info" ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => setActiveTab("info")}
          >
            <Info className="h-4 w-4 mr-2" />
            Informations
          </Button>
          <Button
            variant={activeTab === "medical-documents" ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => setActiveTab("medical-documents")}
          >
            <HeartPulseIcon className="h-4 w-4 mr-2" />
            Comptes rendus
          </Button>
          <Button
            variant={activeTab === "medical-files" ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => setActiveTab("medical-files")}
          >
            <FileText className="h-4 w-4 mr-2" />
            Documents médicaux
          </Button>
        </div>
      </div>

      {/* Modale avec détails du propriétaire */}
      <Credenza open={showOwnerDetails} onOpenChange={setShowOwnerDetails}>
        <CredenzaContent className="max-w-[400px]">
          <CredenzaHeader>
            <CredenzaTitle>Détails du propriétaire</CredenzaTitle>
          </CredenzaHeader>

          <CredenzaBody>
            {animal.owner ? (
              <div className="space-y-4 py-2">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage
                      src={animal.owner.image || ""}
                      alt={animal.owner.name || "Propriétaire"}
                    />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {animal.owner.name ? (
                        animal.owner.name.substring(0, 2).toUpperCase()
                      ) : (
                        <User className="h-6 w-6" />
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">{animal.owner.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Propriétaire de {animal.name}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  {animal.owner.email && (
                    <div className="flex items-start gap-3">
                      <Mail className="h-4 w-4 text-primary mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Email</p>
                        <p className="text-sm">{animal.owner.email}</p>
                        <Button
                          variant="link"
                          size="sm"
                          className="h-6 p-0 text-primary"
                          onClick={() =>
                            window.open(
                              `mailto:${animal.owner.email}`,
                              "_blank",
                            )
                          }
                        >
                          Envoyer un email
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-4 text-center text-muted-foreground">
                <p>Aucun propriétaire associé à cet animal</p>
              </div>
            )}
          </CredenzaBody>
        </CredenzaContent>
      </Credenza>
    </div>
  );
};
