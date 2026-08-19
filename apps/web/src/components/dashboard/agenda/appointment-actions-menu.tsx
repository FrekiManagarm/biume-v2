import { CalendarX2, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

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
import { buttonVariants } from "#/components/ui/button";
import { cn } from "#/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@biume/ui/components/dropdown-menu";

type AppointmentActionsMenuProps = {
  /**
   * Phrase substantive qui identifie le rendez-vous concerné, ex.
   * « rendez-vous de Nox à 14:00 » (même construction que `cardLabel` dans
   * `AppointmentCard`, sans la majuscule). `button` a `nameFrom: contents` :
   * sans texte visible, le déclencheur `⋯` n'a que `aria-label` pour se faire
   * entendre, et sur une journée à dix rendez-vous, « Actions » répété dix
   * fois ne distingue plus rien pour un lecteur d'écran.
   */
  appointmentLabel: string;
  onEdit: () => void;
  onCancel: () => void;
  onDelete: () => void;
  disabled?: boolean;
};

/**
 * Les gestes secondaires d'un rendez-vous.
 *
 * Ils sont regroupés ici, et seulement eux : ce qui compte — l'état de la
 * séance et l'action attendue — reste visible sur la carte. Un menu est
 * acceptable pour modifier ou supprimer, pas pour « remplir le compte rendu ».
 *
 * La suppression est irréversible et détruit aussi le compte rendu du
 * rendez-vous s'il est resté vide (tâche 4) : contrairement à l'annulation,
 * qui ne fait que changer un statut, un simple clic ne doit pas suffire à la
 * déclencher devant un praticien non technicien. La confirmation vit ici,
 * à l'intérieur du menu — `onDelete` n'est appelé qu'une fois le geste
 * confirmé, la tâche 12 n'a rien à faire de plus pour en bénéficier.
 */
export function AppointmentActionsMenu({
  appointmentLabel,
  disabled,
  onCancel,
  onDelete,
  onEdit,
}: AppointmentActionsMenuProps) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <button
              type="button"
              disabled={disabled}
              aria-label={`Actions – ${appointmentLabel}`}
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
            >
              <MoreHorizontal className="size-4" />
            </button>
          }
        />
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onEdit}>
            <Pencil className="size-4" />
            Modifier
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onCancel}>
            <CalendarX2 className="size-4" />
            Annuler la séance
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={() => setConfirmingDelete(true)}
          >
            <Trash2 className="size-4" />
            Supprimer
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={confirmingDelete} onOpenChange={setConfirmingDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="size-5 text-destructive" />
              Supprimer ce rendez-vous ?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est définitive : le {appointmentLabel} et son
              compte rendu s'il est resté vide seront supprimés.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            {/* « Annuler la séance » (ci-dessus, dans le menu) marque le
              rendez-vous comme annulé ; ce bouton-ci referme simplement la
              confirmation sans rien supprimer. Les deux gestes n'ont rien en
              commun : reprendre le mot « Annuler » ici les aurait rendus
              indiscernables l'un de l'autre sur le même écran. */}
            <AlertDialogCancel>Ne pas supprimer</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={() => {
                setConfirmingDelete(false);
                onDelete();
              }}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
