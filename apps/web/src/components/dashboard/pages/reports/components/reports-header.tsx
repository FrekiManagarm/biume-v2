import { FileText, Plus, Sparkles } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { InitializationDialog } from "#/components/dashboard/pages/reports-module/components/InitializationDialog";

interface ReportsHeaderProps {
  disabled?: boolean;
  total?: number;
  drafts?: number;
}

export function ReportsHeader({
  disabled = false,
  total = 0,
  drafts = 0,
}: ReportsHeaderProps) {
  const [showInitialization, setShowInitialization] = useState(false);

  return (
    <>
      <header className="grid gap-5 border-b border-slate-200 pb-6 pt-2 lg:grid-cols-[1fr_auto] lg:items-end">
        <div className="min-w-0">
          <div className="mb-4 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.45)]">
            <Sparkles className="size-3.5 text-emerald-700" />
            Suivi clinique
          </div>
          <h1 className="text-3xl font-semibold leading-none tracking-tight text-slate-950 md:text-5xl">
            Rapports.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600 md:text-base">
            Retrouvez vos comptes rendus, suivez leur avancement et préparez les
            prochaines transmissions client.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-[auto_auto] sm:items-center">
          <div className="grid grid-cols-[auto_1fr] items-center gap-3 rounded-[1.25rem] border border-slate-200 bg-white px-4 py-3 shadow-[0_24px_70px_-46px_rgba(15,23,42,0.5)]">
            <div className="flex size-11 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800">
              <FileText className="size-4" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-950">
                {total} compte{total > 1 ? "s" : ""} rendu
                {total > 1 ? "s" : ""}
              </p>
              <p className="mt-0.5 truncate text-xs text-slate-500">
                {drafts} brouillon{drafts > 1 ? "s" : ""} à finaliser
              </p>
            </div>
          </div>

          <Button
            onClick={() => setShowInitialization(true)}
            disabled={disabled}
            className="h-10 active:scale-[0.98]"
          >
            Nouveau rapport
            <Plus className="size-4" data-icon="inline-end" />
          </Button>
        </div>
      </header>
      <InitializationDialog
        showInitDialog={showInitialization}
        setShowInitDialog={setShowInitialization}
      />
    </>
  );
}
