import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeftIcon,
  FilePenLineIcon,
  TriangleAlertIcon,
} from "lucide-react";

interface ExitConfirmationDialogProps {
  showExitConfirmDialog: boolean;
  setShowExitConfirmDialog: (show: boolean) => void;
  onConfirmExit: () => void;
}

export function ExitConfirmationDialog({
  showExitConfirmDialog,
  setShowExitConfirmDialog,
  onConfirmExit,
}: ExitConfirmationDialogProps) {
  return (
    <AlertDialog
      open={showExitConfirmDialog}
      onOpenChange={setShowExitConfirmDialog}
    >
      <AlertDialogContent className="max-w-[calc(100%-2rem)] overflow-hidden rounded-2xl border border-border/80 bg-popover p-0 shadow-[0_24px_70px_-32px_rgba(15,23,42,0.35)] ring-1 ring-foreground/5 sm:max-w-104">
        <div className="grid gap-4 p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-amber-500/25 bg-amber-500/10 text-amber-600 dark:text-amber-300">
              <TriangleAlertIcon className="size-5" />
            </div>
            <div className="min-w-0 space-y-1.5">
              <AlertDialogTitle className="text-base font-semibold tracking-tight text-foreground">
                Quitter sans enregistrer ?
              </AlertDialogTitle>
              <AlertDialogDescription className="max-w-[32ch] text-sm leading-6 text-muted-foreground">
                Vous avez des modifications non enregistrées. En retournant au
                tableau de bord, elles seront définitivement perdues.
              </AlertDialogDescription>
            </div>
          </div>
        </div>

        <AlertDialogFooter className="mx-0 mb-0 grid grid-cols-1 gap-2 border-t bg-muted/40 p-3 min-[420px]:grid-cols-2">
          <AlertDialogCancel className="w-full min-w-0 max-w-full">
            <FilePenLineIcon className="size-4" />
            Continuer l&apos;édition
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            className="w-full min-w-0 max-w-full"
            onClick={onConfirmExit}
          >
            <ArrowLeftIcon className="size-4" />
            Retour au tableau
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
