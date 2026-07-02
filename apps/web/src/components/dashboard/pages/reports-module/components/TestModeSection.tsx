
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { TestTubeIcon, DogIcon, CatIcon, PawPrint } from "lucide-react";
import { cn } from "@/lib/style";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TestModeSectionProps {
  isTestMode: boolean;
  onTestModeChange: (enabled: boolean) => void;
  selectedAnimalType: string;
  onAnimalTypeChange: (animalType: string) => void;
  isCollapsed?: boolean;
}

const animalTypes = [
  { value: "dog", label: "Chien", icon: DogIcon },
  { value: "cat", label: "Chat", icon: CatIcon },
  { value: "horse", label: "Cheval", icon: PawPrint },
  { value: "other", label: "Autre", icon: TestTubeIcon },
];

export function TestModeSection({
  isTestMode,
  onTestModeChange,
  selectedAnimalType,
  onAnimalTypeChange,
  isCollapsed = false,
}: TestModeSectionProps) {
  const selectedAnimal = animalTypes.find(
    (animal) => animal.value === selectedAnimalType,
  );

  // Ne pas afficher le mode test en production
  if (process.env.NODE_ENV === "production") {
    // Désactiver le mode test si on est en production
    if (isTestMode) {
      onTestModeChange(false);
    }
    return null;
  }

  return (
    <TooltipProvider delayDuration={300}>
      <Card 
        className={cn(
          "flex flex-col p-0 transition-all duration-300 ease-in-out",
          isCollapsed ? "w-[72px]" : "w-full"
        )}
        data-state={isCollapsed ? "collapsed" : "expanded"}
      >
        <div className={cn(
          "p-4",
          isCollapsed && "flex flex-col items-center"
        )}>
          {isCollapsed ? (
            // Mode rétracté : icône avec tooltip
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex flex-col items-center gap-2">
                  <div 
                    className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center transition-all cursor-pointer",
                      isTestMode 
                        ? "bg-orange-100 dark:bg-orange-900/20" 
                        : "bg-muted/50"
                    )}
                    onClick={() => onTestModeChange(!isTestMode)}
                  >
                    <TestTubeIcon className={cn(
                      "h-5 w-5",
                      isTestMode ? "text-orange-600 dark:text-orange-400" : "text-muted-foreground"
                    )} />
                  </div>
                  {isTestMode && (
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent side="right" className="flex flex-col gap-2 max-w-xs">
                <div className="flex items-center gap-2">
                  <TestTubeIcon className="h-4 w-4" />
                  <p className="font-medium">Mode test</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  {isTestMode ? "Actif" : "Désactivé"}
                </p>
                {isTestMode && selectedAnimal && (
                  <div className="flex items-center gap-1 pt-1 border-t">
                    <p className="text-xs font-medium">Type:</p>
                    <p className="text-xs text-muted-foreground">{selectedAnimal.label}</p>
                  </div>
                )}
                <p className="text-xs text-muted-foreground pt-1 border-t">
                  Cliquer pour {isTestMode ? "désactiver" : "activer"}
                </p>
              </TooltipContent>
            </Tooltip>
          ) : (
            // Mode étendu : affichage complet
            <>
              {/* Toggle mode test */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="test-mode" className="text-sm font-medium">
                    Mode test
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Utilise les données de test pour les listes anatomiques
                  </p>
                </div>
                <Switch
                  id="test-mode"
                  checked={isTestMode}
                  onCheckedChange={onTestModeChange}
                />
              </div>

              {/* Sélecteur d'animal */}
              {isTestMode && (
                <div className="space-y-2 mt-4">
                  <Label className="text-sm font-medium">Type d&apos;animal</Label>
                  <Select
                    value={selectedAnimalType}
                    onValueChange={onAnimalTypeChange}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Sélectionner un type d'animal" />
                    </SelectTrigger>
                    <SelectContent>
                      {animalTypes.map((animal) => {
                        const IconComponent = animal.icon;
                        return (
                          <SelectItem key={animal.value} value={animal.value}>
                            <div className="flex items-center gap-2">
                              <IconComponent className="h-4 w-4" />
                              {animal.label}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Badge d'état */}
              {isTestMode && (
                <div className="flex items-center gap-2 mt-4">
                  <Badge
                    variant="secondary"
                    className={cn(
                      "text-xs",
                      isTestMode
                        ? "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400"
                        : "",
                    )}
                  >
                    <TestTubeIcon className="h-3 w-3 mr-1" />
                    Mode test actif
                  </Badge>
                  {selectedAnimal && (
                    <Badge variant="outline" className="text-xs">
                      {selectedAnimal.label}
                    </Badge>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </Card>
    </TooltipProvider>
  );
}
