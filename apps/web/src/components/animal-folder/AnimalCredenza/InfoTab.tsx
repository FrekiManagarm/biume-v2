import {
  CalendarDaysIcon,
  ChevronRight,
  FingerprintIcon,
  MailIcon,
  PawPrintIcon,
  RulerIcon,
  ScaleIcon,
  UserIcon,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/style";

import type { ActiveTab } from "../types";
import type { Pet } from "@/lib/schemas";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface InfoTabProps {
  animal: Pet;
  setActiveTab: (tab: ActiveTab) => void;
}

type DetailRowProps = {
  label: string;
  value: string;
};

type SummaryTileProps = DetailRowProps & {
  icon: React.ReactNode;
};

const DetailRow = ({ label, value }: DetailRowProps) => (
  <div className="flex items-center justify-between gap-4 border-b border-slate-100 py-2.5 last:border-0">
    <span className="text-sm font-medium text-slate-500">{label}</span>
    <span className="min-w-0 text-right text-sm font-semibold text-slate-950">
      {value}
    </span>
  </div>
);

const SummaryTile = ({ icon, label, value }: SummaryTileProps) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
    <div className="flex items-center gap-3">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-600">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-normal text-slate-400">
          {label}
        </p>
        <p className="truncate text-sm font-semibold text-slate-950">{value}</p>
      </div>
    </div>
  </div>
);

export const InfoTab = ({ animal, setActiveTab }: InfoTabProps) => {
  const formatDate = (date: Date | string | undefined | null) => {
    if (!date) return "Non défini";

    const dateObject = date instanceof Date ? date : new Date(date);

    return dateObject.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getAge = () => {
    if (!animal.birthDate) return "Âge inconnu";

    return formatDistanceToNow(new Date(animal.birthDate), {
      addSuffix: false,
      locale: fr,
    });
  };

  const genderLabel = animal.gender === "Male" ? "Mâle" : "Femelle";
  const weightLabel = animal.weight ? `${animal.weight} kg` : "Non défini";
  const heightLabel = animal.height ? `${animal.height} cm` : "Non défini";

  return (
    <div className="space-y-4 p-4 md:p-5">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <SummaryTile
          icon={<PawPrintIcon className="size-5" />}
          label="Type"
          value={animal.animal?.name || "Non défini"}
        />
        <SummaryTile
          icon={<CalendarDaysIcon className="size-5" />}
          label="Âge"
          value={getAge()}
        />
        <SummaryTile
          icon={<ScaleIcon className="size-5" />}
          label="Poids"
          value={weightLabel}
        />
        <SummaryTile
          icon={<RulerIcon className="size-5" />}
          label="Taille"
          value={heightLabel}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-2 flex items-center justify-between gap-3">
            <h3 className="text-base font-semibold text-slate-950">Identité</h3>
            {animal.chippedNumber && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600">
                <FingerprintIcon className="size-3.5" />
                Identifié
              </span>
            )}
          </div>

          <div>
            <DetailRow
              label="Espèce"
              value={animal.animal?.name || "Non défini"}
            />
            <DetailRow label="Race" value={animal.breed || "Non défini"} />
            <DetailRow label="Sexe" value={genderLabel} />
            <DetailRow
              label="Date de naissance"
              value={formatDate(animal.birthDate)}
            />
            {animal.chippedNumber && (
              <DetailRow label="Puce" value={String(animal.chippedNumber)} />
            )}
            {animal.nacType && (
              <DetailRow label="Type NAC" value={animal.nacType} />
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-base font-semibold text-slate-950">
            Propriétaire
          </h3>

          {animal.owner ? (
            <div className="mt-3 space-y-3">
              <div className="flex items-center gap-3">
                <Avatar className="size-10">
                  <AvatarImage
                    src={animal.owner.image || ""}
                    alt={animal.owner.name || "Propriétaire"}
                  />
                  <AvatarFallback className="bg-primary/10 font-semibold text-primary">
                    {animal.owner.name?.substring(0, 2).toUpperCase() || (
                      <UserIcon className="size-5" />
                    )}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-950">
                    {animal.owner.name || "Non renseigné"}
                  </p>
                  <p className="text-xs font-medium text-slate-500">
                    Propriétaire de {animal.name}
                  </p>
                </div>
              </div>

              {animal.owner.email && (
                <Button
                  variant="outline"
                  className="h-10 w-full justify-start rounded-xl border-slate-200 bg-white text-slate-700"
                  onClick={() => window.open(`mailto:${animal.owner?.email}`)}
                >
                  <MailIcon className="size-4" />
                  <span className="truncate">{animal.owner.email}</span>
                </Button>
              )}
            </div>
          ) : (
            <p className="mt-4 text-sm font-medium text-slate-500">
              Aucun propriétaire associé.
            </p>
          )}
        </section>
      </div>

      <div
        className={cn(
          "grid gap-4",
          animal.description && "lg:grid-cols-[minmax(0,1fr)_280px]",
        )}
      >
        {animal.description && (
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-base font-semibold text-slate-950">Notes</h3>
            <p className="mt-3 text-sm font-medium leading-6 text-slate-600">
              {animal.description}
            </p>
          </section>
        )}

        <Button
          variant="outline"
          className="h-auto min-h-14 justify-between rounded-2xl border-slate-200 bg-white px-4 text-left text-sm font-semibold text-slate-950 shadow-sm hover:bg-slate-50"
          onClick={() => setActiveTab("medical-documents")}
        >
          <span>Dossier médical & comptes rendus</span>
          <ChevronRight className="size-5 text-slate-400" />
        </Button>
      </div>
    </div>
  );
};
