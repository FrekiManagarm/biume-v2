
import type { ActiveTab } from "../types";
import { Button } from "@/components/ui/button";
import type { Pet } from "@/lib/schemas";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface MobileNavigationProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  tabs: { id: ActiveTab; label: string; icon: React.ReactNode }[];
  animal: Pet;
}

export const MobileNavigation = ({
  activeTab,
  setActiveTab,
  tabs,
  animal,
}: MobileNavigationProps) => {
  return (
    <div className="md:hidden border-b bg-muted/20 p-4">
      {/* Informations de l'animal simplifiées */}
      <div className="flex items-center gap-3 mb-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={animal.image || ""} alt={animal.name} />
          <AvatarFallback className="bg-primary/10 text-primary">
            {animal.name?.[0] || "A"}
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-semibold">{animal.name}</h3>
          <p className="text-sm text-muted-foreground">
            {animal.animal?.name || "Animal"} • {animal.breed} •{" "}
            {animal.gender === "Male" ? "Mâle" : "Femelle"}
          </p>
        </div>
      </div>

      {/* Navigation simplifiée */}
      <div className="flex gap-2 overflow-x-auto">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? "default" : "outline"}
            size="sm"
            className="flex items-center gap-2 whitespace-nowrap"
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon}
            {tab.label}
          </Button>
        ))}
      </div>
    </div>
  );
};
