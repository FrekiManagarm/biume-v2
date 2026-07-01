
import { Database, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { InitializationDialog } from "@/components/reports-module/components/InitializationDialog";
// import { useMutation } from "@tanstack/react-query";
// import { toast } from "sonner";
// import { seedAnatomicalParts } from "@/lib/api/actions/reports.action";

interface ReportsHeaderProps {
  disabled?: boolean;
}

export function ReportsHeader({ disabled = false }: ReportsHeaderProps) {
  const [showInitialization, setShowInitialization] = useState(false);
  // const seedMutation = useMutation({
  //   mutationFn: seedAnatomicalParts,
  //   onSuccess: () => {
  //     toast.success("Anatomical parts seeded successfully");
  //   },
  //   onError: (error) => {
  //     console.error(error, "error");
  //     toast.error(`Error seeding anatomical parts: ${error.message}`);
  //   },
  // });

  // const handleSeedAnatomicalParts = async () => {
  //   try {
  //     await seedMutation.mutateAsync();
  //   } catch (error) {
  //     console.error(error, "error");
  //     toast.error(
  //       `Error seeding anatomical parts: ${error instanceof Error ? error.message : "Unknown error"}`,
  //     );
  //   }
  // };

  return (
    <>
      <Card className="border-border/70 bg-card/80 backdrop-blur-sm">
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <h1 className="bg-linear-to-r from-primary to-secondary bg-clip-text text-3xl font-bold tracking-tight text-transparent">
                Comptes rendus
              </h1>
              <p className="text-muted-foreground text-sm">
                Gestion de vos comptes rendus de consultation détaillés
              </p>
            </div>
            <Button onClick={() => setShowInitialization(true)} disabled={disabled}>
              <Plus />
              Nouveau compte rendu
            </Button>
            {/* {process.env.NODE_ENV === "development" && (
              <Button
                variant="default"
                className="bg-green-600 hover:bg-green-700 text-white border-green-600"
                onClick={handleSeedAnatomicalParts}
                disabled={seedMutation.isPending}
              >
                <Database className="h-4 w-4 mr-2" />
                {seedMutation.isPending
                  ? "Insertion..."
                  : "Seed Anatomical Parts"}
              </Button>
            )} */}
          </div>
        </CardContent>
      </Card>
      <InitializationDialog
        showInitDialog={showInitialization}
        setShowInitDialog={setShowInitialization}
      />
    </>
  );
}
