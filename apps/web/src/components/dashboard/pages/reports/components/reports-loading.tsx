import { ReportsHeader } from "./reports-header";
import { LoaderCircle } from "lucide-react";

export function ReportsLoading() {
  return (
    <div className="grid w-full gap-5 pb-8 text-slate-950">
      <ReportsHeader disabled />
      <div className="rounded-[1.5rem] border border-slate-200 bg-white p-8 shadow-[0_24px_70px_-46px_rgba(15,23,42,0.5)]">
        <div className="flex min-h-40 items-center justify-center">
          <div className="text-center">
            <LoaderCircle className="mx-auto mb-4 size-8 animate-spin text-slate-500" />
            <p className="text-sm text-slate-500">Chargement des rapports...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
