import { Ellipsis, Eye, Pencil, Trash2, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "#/components/ui/alert-dialog";
import { Button } from "#/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu";
import { cn } from "#/lib/utils";

export function EntityRowActions({
  entityName,
  onView,
  onEdit,
  onDelete,
}: {
  entityName: string;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={`Actions pour ${entityName}`}
          >
            <Ellipsis />
            <span className="sr-only">Actions</span>
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-36">
        <DropdownMenuItem onClick={onView}>
          <Eye />
          Consulter
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onEdit}>
          <Pencil />
          Modifier
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={onDelete}>
          <Trash2 />
          Supprimer
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * Confirmation générique pour un geste qu'on ne veut pas déclencher d'un
 * simple clic — suppression, annulation, tout ce qui n'a pas de retour en
 * arrière depuis l'écran courant. `DeleteEntityDialog` ci-dessous en est la
 * spécialisation "suppression" ; d'autres écrans (ex. l'annulation d'un
 * rendez-vous dans l'agenda) branchent directement sur celui-ci avec leur
 * propre icône et leur propre vocabulaire métier.
 */
export function ConfirmActionDialog({
  open,
  onOpenChange,
  title,
  description,
  icon: Icon = Trash2,
  tone = "destructive",
  confirmLabel,
  pendingLabel,
  cancelLabel = "Annuler",
  isPending = false,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description: ReactNode;
  icon?: LucideIcon;
  tone?: "destructive" | "default";
  confirmLabel: string;
  pendingLabel: string;
  cancelLabel?: string;
  isPending?: boolean;
  onConfirm: () => void | Promise<void>;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Icon
              className={cn(
                "size-5",
                tone === "destructive" ? "text-destructive" : "text-primary",
              )}
            />
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            variant={tone === "destructive" ? "destructive" : "default"}
            className={
              tone === "destructive"
                ? "bg-destructive text-white hover:bg-destructive/90"
                : undefined
            }
            disabled={isPending}
            onClick={(event) => {
              event.preventDefault();
              void onConfirm();
            }}
          >
            {isPending ? pendingLabel : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function DeleteEntityDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Supprimer",
  isPending = false,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description: ReactNode;
  confirmLabel?: string;
  isPending?: boolean;
  onConfirm: () => void | Promise<void>;
}) {
  return (
    <ConfirmActionDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      icon={Trash2}
      tone="destructive"
      confirmLabel={confirmLabel}
      pendingLabel="Suppression…"
      onConfirm={onConfirm}
      isPending={isPending}
    />
  );
}
