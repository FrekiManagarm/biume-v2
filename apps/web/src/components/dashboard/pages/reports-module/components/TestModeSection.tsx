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
    <TooltipProvider delay={300}>
      <section
        className={cn(
          "flex flex-col rounded-2xl border border-border bg-card p-2 text-card-foreground shadow-sm shadow-foreground/5 transition-all duration-200 ease-out",
          isCollapsed ? "w-18 p-2" : "w-full",
        )}
        data-state={isCollapsed ? "collapsed" : "expanded"}
      >
        <div
          className={cn("p-1", isCollapsed && "flex flex-col items-center p-0")}
        >
          {isCollapsed ? (
            // Mode rétracté : icône avec tooltip
            <Tooltip>
              <TooltipTrigger
                render={
                  <div className="flex flex-col items-center gap-2">
                    <div
                      className={cn(
                        "flex h-11 w-11 cursor-pointer items-center justify-center rounded-2xl transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5",
                        isTestMode
                          ? "bg-amber-50 text-amber-800"
                          : "bg-muted text-muted-foreground",
                      )}
                      onClick={() => onTestModeChange(!isTestMode)}
                    >
                      <TestTubeIcon
                        className={cn(
                          "h-5 w-5",
                          isTestMode
                            ? "text-amber-800"
                            : "text-muted-foreground",
                        )}
                      />
                    </div>
                    {isTestMode && (
                      <div className="size-2 rounded-full bg-amber-500 animate-pulse" />
                    )}
                  </div>
                }
              />
              <TooltipContent
                side="right"
                className="flex flex-col gap-2 max-w-xs"
              >
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
                    <p className="text-xs text-muted-foreground">
                      {selectedAnimal.label}
                    </p>
                  </div>
                )}
                <p className="text-xs text-muted-foreground pt-1 border-t">
                  Cliquer pour {isTestMode ? "désactiver" : "activer"}
                </p>
              </TooltipContent>
            </Tooltip>
          ) : (
            <>
              <div className="flex items-center justify-between gap-3 rounded-xl px-2 py-2">
                <div className="flex min-w-0 items-center gap-2">
                  <div
                    className={cn(
                      "flex size-8 shrink-0 items-center justify-center rounded-lg",
                      isTestMode
                        ? "bg-amber-50 text-amber-800"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    <TestTubeIcon className="size-4" />
                  </div>
                  <Label
                    htmlFor="test-mode"
                    className="truncate text-sm font-semibold text-foreground"
                  >
                    Mode test
                  </Label>
                </div>
                <Switch
                  id="test-mode"
                  checked={isTestMode}
                  onCheckedChange={onTestModeChange}
                  className="data-[state=checked]:bg-amber-600"
                />
              </div>

              {isTestMode && (
                <div className="px-2 pb-2">
                  <Select
                    value={selectedAnimalType}
                    onValueChange={onAnimalTypeChange}
                  >
                    <SelectTrigger className="h-9 w-full rounded-xl border-border bg-background text-xs shadow-none">
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
            </>
          )}
        </div>
      </section>
    </TooltipProvider>
  );
}
