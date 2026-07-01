import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty";
import { ReportsHeader } from "./reports-header";

interface ReportsErrorProps {
  error: string;
  onRetry: () => void;
}

export function ReportsError({ error, onRetry }: ReportsErrorProps) {
  return (
    <div className="grid w-full gap-5 pb-8 text-slate-950">
      <ReportsHeader disabled />
      <div className="rounded-[1.5rem] border border-slate-200 bg-white px-6 py-12 shadow-[0_24px_70px_-46px_rgba(15,23,42,0.5)]">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FileText />
            </EmptyMedia>
            <EmptyTitle>Erreur de chargement</EmptyTitle>
            <EmptyDescription>{error}</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button onClick={onRetry} className="h-10">
              Réessayer
            </Button>
          </EmptyContent>
        </Empty>
      </div>
    </div>
  );
}
