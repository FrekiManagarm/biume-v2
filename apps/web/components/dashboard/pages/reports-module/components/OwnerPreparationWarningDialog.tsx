import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

export function OwnerPreparationWarningDialog({
  open,
  missingCount,
  staleCount,
  onOpenChange,
  onPrepare,
  onFinalize,
}: {
  open: boolean;
  missingCount: number;
  staleCount: number;
  onOpenChange: (open: boolean) => void;
  onPrepare: () => void;
  onFinalize: () => void;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Préparation propriétaire incomplète
          </AlertDialogTitle>
          <AlertDialogDescription>
            {missingCount} contenu(s) à préparer et {staleCount} à actualiser.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button variant="outline" onClick={onPrepare}>
            Préparer maintenant
          </Button>
          <Button onClick={onFinalize}>Finaliser quand même</Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
