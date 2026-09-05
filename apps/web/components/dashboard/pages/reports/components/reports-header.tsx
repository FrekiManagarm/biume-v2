import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Database, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { seedAnatomicalParts } from "@/lib/api/actions/reports.action";
import { InitializationDialog } from "#/components/dashboard/pages/reports-module/components/InitializationDialog";

interface ReportsHeaderProps {
  disabled?: boolean;
}

export function ReportsHeader({ disabled = false }: ReportsHeaderProps) {
  const [showInitialization, setShowInitialization] = useState(false);
  const queryClient = useQueryClient();

  const seedMutation = useMutation({
    mutationFn: seedAnatomicalParts,
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: ["anatomicalParts"] });
      toast.success(
        result?.message ?? "Parties anatomiques insérées avec succès.",
      );
    },
    onError: (error) => {
      console.error("Erreur lors du seed des parties anatomiques:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Erreur lors du seed des parties anatomiques.",
      );
    },
  });

  return (
    <>
      {process.env.NODE_ENV !== "production" ? (
        <Button
          type="button"
          variant="outline"
          onClick={() => seedMutation.mutate()}
          disabled={disabled || seedMutation.isPending}
          className="h-10 border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 hover:text-emerald-900"
        >
          <Database className="size-4" />
          {seedMutation.isPending ? "Insertion..." : "Seed anatomie"}
        </Button>
      ) : null}
      <Button
        onClick={() => setShowInitialization(true)}
        disabled={disabled}
        className="h-10 bg-slate-950 text-white shadow-[0_18px_40px_-24px_rgba(15,23,42,0.8)] hover:bg-slate-800 active:scale-[0.98]"
      >
        Nouveau rapport
        <Plus className="size-4" data-icon="inline-end" />
      </Button>
      <InitializationDialog
        showInitDialog={showInitialization}
        setShowInitDialog={setShowInitialization}
      />
    </>
  );
}
