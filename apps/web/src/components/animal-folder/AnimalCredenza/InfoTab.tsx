
import { ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import type { ActiveTab } from "../types";
import type { Pet } from "@/lib/schemas";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface InfoTabProps {
  animal: Pet;
  setActiveTab: (tab: ActiveTab) => void;
}

export const InfoTab = ({ animal, setActiveTab }: InfoTabProps) => {
  // Formater la date au format lisible
  const formatDate = (date: Date | string | undefined | null) => {
    if (!date) return "Non défini";

    const dateObject = date instanceof Date ? date : new Date(date);

    return dateObject.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Calcul de l'âge basé sur la date de naissance
  const getAge = () => {
    if (!animal.birthDate) return "Âge inconnu";

    return formatDistanceToNow(new Date(animal.birthDate), {
      addSuffix: false,
      locale: fr,
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Détails de l'animal simplifié */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Informations de l&apos;animal
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent>
              <h3 className="font-medium text-foreground mb-3">
                Informations générales
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Type</span>
                  <span className="text-sm font-medium">
                    {animal.animal?.name || "Non défini"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Race</span>
                  <span className="text-sm font-medium">
                    {animal.breed || "Non défini"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Genre</span>
                  <span className="text-sm font-medium">
                    {animal.gender === "Male" ? "Mâle" : "Femelle"}
                  </span>
                </div>
                {animal.chippedNumber && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Puce électronique
                    </span>
                    <span className="text-sm font-medium">
                      {animal.chippedNumber}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <h3 className="font-medium text-foreground mb-3">
                Âge et mensurations
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Date de naissance
                  </span>
                  <span className="text-sm font-medium">
                    {formatDate(animal.birthDate)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Âge</span>
                  <span className="text-sm font-medium">{getAge()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Poids</span>
                  <span className="text-sm font-medium">
                    {animal.weight ? `${animal.weight} kg` : "Non défini"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Taille</span>
                  <span className="text-sm font-medium">
                    {animal.height ? `${animal.height} cm` : "Non défini"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {animal.description && (
          <Card className="mt-4">
            <CardContent>
              <h3 className="font-medium text-foreground mb-3">Description</h3>
              <p className="text-sm text-muted-foreground">
                {animal.description}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Propriétaire simplifié */}
      {animal.owner && (
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Propriétaire
          </h2>

          <Card>
            <CardContent>
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage
                    src={animal.owner?.image || ""}
                    alt={animal.owner?.name || ""}
                  />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {animal.owner?.name?.substring(0, 2).toUpperCase() || "?"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">
                    {animal.owner?.name || "Non renseigné"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Propriétaire de {animal.name}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {animal.owner?.email && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Email</span>
                    <span className="text-sm font-medium">
                      {animal.owner.email}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Accès rapide aux autres onglets */}
      <div className="grid grid-cols-1 gap-4">
        <Button
          variant="outline"
          className="justify-between w-full"
          onClick={() => setActiveTab("medical-documents")}
        >
          <span>Dossier médical & Documents</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
