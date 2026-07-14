import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { OwnerContentRecord, OwnerSourceItem } from "../owner-content";

export type OwnerPreparationSaveInput = {
  reportId: string;
  sourceKind: OwnerSourceItem["sourceKind"];
  sourceId: string;
  ownerText: string;
};

export function OwnerPreparationSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportId: string;
  queue: Array<OwnerSourceItem & { status: "missing" | "stale" }>;
  records: OwnerContentRecord[];
  initialSourceKey?: string;
  onSave: (input: OwnerPreparationSaveInput) => Promise<unknown>;
  onViewPreview?: () => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-screen max-w-none p-0 sm:w-[32rem] sm:max-w-[32rem] data-[side=right]:w-screen data-[side=right]:sm:w-[32rem] data-[side=right]:sm:max-w-[32rem]"
      >
        <SheetHeader className="border-b border-border px-5 py-4 text-left">
          <SheetTitle>Préparation guidée</SheetTitle>
          <SheetDescription>
            Préparez une version claire sans modifier le texte professionnel.
          </SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
}
