import type { ActiveTab } from "./types";
import { CredenzaContent, CredenzaTitle } from "@/components/ui/credenza";
import { HeartPulseIcon, Info, FileText, PawPrintIcon } from "lucide-react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/style";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

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

  const getAge = () => {
    if (!pet?.birthDate) return "Âge inconnu";

    return formatDistanceToNow(new Date(pet.birthDate), {
      addSuffix: false,
      locale: fr,
    });
  };

  const genderLabel = pet?.gender === "Male" ? "Mâle" : "Femelle";

  return (
    <Credenza open={isOpen} onOpenChange={onOpenChange}>
      <VisuallyHidden asChild>
        <CredenzaTitle>Fiche de l&apos;animal</CredenzaTitle>
      </VisuallyHidden>
      <CredenzaContent className="overflow-hidden p-0 sm:max-w-[900px]">
        <div className="flex h-[72vh] max-h-[640px] min-h-[480px] flex-col bg-slate-50">
          {isLoadingPet ? (
            <div className="flex h-full w-full items-center justify-center">
              <div className="w-[82%] space-y-4">
                <Skeleton className="h-16 w-full rounded-2xl" />
                <Skeleton className="h-10 w-[320px] rounded-xl" />
                <Skeleton className="h-[300px] w-full rounded-2xl" />
              </div>
            </div>
          ) : !pet ? (
            <div className="flex h-full w-full items-center justify-center">
              <div className="space-y-4 text-center">
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
              <header className="border-b border-slate-200 bg-white px-4 py-4 md:px-5">
                <div className="flex flex-col gap-4 pr-8 md:flex-row md:items-start md:justify-between">
                  <div className="flex min-w-0 items-start gap-3">
                    <Avatar className="size-14 rounded-2xl border border-slate-200 bg-slate-50">
                      <AvatarImage src={pet.image || ""} alt={pet.name} />
                      <AvatarFallback className="rounded-2xl bg-primary/10 text-lg font-semibold text-primary">
                        {pet.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="truncate text-xl font-semibold tracking-tight text-slate-950">
                          {pet.name}
                        </h2>
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600">
                          {genderLabel}
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-medium text-slate-500">
                        <span className="inline-flex items-center gap-1.5">
                          <PawPrintIcon className="size-4" />
                          {pet.animal?.name || "Animal"}
                        </span>
                        {pet.breed && <span>{pet.breed}</span>}
                        <span>{getAge()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <nav className="mt-4 flex gap-6 overflow-x-auto border-t border-slate-100 pt-3">
                  {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;

                    return (
                      <Button
                        key={tab.id}
                        variant="ghost"
                        className={cn(
                          "h-8 flex-none rounded-none border-x-0 border-t-0 border-b-2 border-transparent bg-transparent px-0 pb-2 text-sm font-semibold text-slate-500 shadow-none hover:bg-transparent hover:text-slate-950 [&_svg]:size-4",
                          isActive &&
                            "border-slate-950 text-slate-950 hover:bg-transparent",
                        )}
                        onClick={() => setActiveTab(tab.id)}
                      >
                        {tab.icon}
                        {tab.label}
                      </Button>
                    );
                  })}
                </nav>
              </header>

              <div className="min-h-0 flex-1 overflow-y-auto">
                {activeTab === "info" && <InfoTab animal={pet} />}
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
