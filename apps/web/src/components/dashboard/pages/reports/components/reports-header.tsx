import { Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { InitializationDialog } from "#/components/dashboard/pages/reports-module/components/InitializationDialog";

interface ReportsHeaderProps {
  disabled?: boolean;
}

export function ReportsHeader({ disabled = false }: ReportsHeaderProps) {
  const [showInitialization, setShowInitialization] = useState(false);

  return (
    <>
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
