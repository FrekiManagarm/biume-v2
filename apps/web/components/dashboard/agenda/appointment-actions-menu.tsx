import { CalendarX2, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import { Button } from "#/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu";

type AppointmentActionsMenuProps = {
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
 */
export function AppointmentActionsMenu({
  disabled,
  onCancel,
  onDelete,
  onEdit,
}: AppointmentActionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={disabled}
          >
            <MoreHorizontal className="size-4" />
            <span className="sr-only">Actions du rendez-vous</span>
          </Button>
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
        <DropdownMenuItem variant="destructive" onClick={onDelete}>
          <Trash2 className="size-4" />
          Supprimer
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
