import { ArrowRight, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "#/lib/utils";

import { IconTile } from "./icon-tile";
import type { Tone } from "./tone";

type GroupedListProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Une liste d'éléments de même nature.
 *
 * Motif structurant de `select-organization` : **une seule** surface, dont les
 * lignes sont séparées par un filet. Empiler une carte par élément fabrique un
 * bruit visuel qui fait perdre la colonne de lecture, et `AGENTS.md` réserve la
 * carte aux éléments répétés encadrés, pas à chaque ligne.
 */
export function GroupedList({ children, className }: GroupedListProps) {
  return (
    <div
      className={cn(
        "divide-y divide-border overflow-hidden rounded-card border border-border bg-card",
        className,
      )}
    >
      {children}
    </div>
  );
}

type GroupedListRowProps = {
  icon?: LucideIcon;
  iconTone?: Tone;
  /** Un logo, à la place de l'icône. */
  iconContent?: ReactNode;
  title: string;
  meta?: string;
  badge?: ReactNode;
  /**
   * Le statut porté par `badge`, en toutes lettres, quand il change la
   * décision du praticien (« Annulé »). `button` a `nameFrom: contents` :
   * l'`aria-label` de la ligne remplace tout son sous-arbre, donc un badge
   * seulement visuel ne serait jamais annoncé. Il est ajouté après le titre —
   * on entend d'abord de quoi il s'agit, puis son état.
   */
  statusLabel?: string;
  /** Remplace l'affordance de droite : un bouton, un menu, un état. */
  trailing?: ReactNode;
  onSelect?: () => void;
  disabled?: boolean;
};

export function GroupedListRow({
  badge,
  disabled,
  icon,
  iconContent,
  iconTone = "neutral",
  meta,
  onSelect,
  statusLabel,
  title,
  trailing,
}: GroupedListRowProps) {
  const content = (
    <>
      <IconTile icon={icon} tone={iconTone}>
        {iconContent}
      </IconTile>

      <span className="min-w-0">
        <span className="flex items-center gap-2">
          <span className="truncate text-sm font-semibold text-foreground sm:text-base">
            {title}
          </span>
          {badge}
        </span>
        {meta ? (
          <span className="mt-1 block truncate text-sm text-muted-foreground">
            {meta}
          </span>
        ) : null}
      </span>

      {trailing ?? (onSelect ? <GroupedListAffordance /> : <span />)}
    </>
  );

  const layout =
    "grid w-full grid-cols-[auto_1fr_auto] items-center gap-4 px-4 py-4 text-left sm:px-5";

  if (!onSelect) {
    return <div className={layout}>{content}</div>;
  }

  // Le nom accessible part du titre : `aria-label` remplace le calcul par
  // défaut, qui aurait concaténé titre, badge et meta sans séparateur
  // (« Cabinet du Vieux ChêneActivecabinet-vieux-chene.biume »). Un lecteur
  // d'écran énoncerait tout ça avant que le praticien sache quelle
  // organisation il s'apprête à ouvrir — cf. `apps/mobile/src/design/row.tsx`,
  // qui documente et résout déjà ce même problème côté mobile.
  //
  // Le statut, lui, est composé après le titre quand l'appelant le déclare :
  // savoir qu'une séance est annulée décide de ce que le praticien fait
  // ensuite, et cette information ne doit pas rester purement visuelle. Le
  // `meta` reste exclu dans tous les cas : c'est un identifiant technique ou
  // un rappel, jamais ce qui fait choisir la ligne.
  const accessibleName = statusLabel ? `${title}, ${statusLabel}` : title;

  return (
    <button
      type="button"
      aria-label={accessibleName}
      disabled={disabled}
      onClick={onSelect}
      className={cn(
        layout,
        "group transition duration-300 ease-out hover:bg-muted active:scale-[0.99]",
        "disabled:cursor-not-allowed disabled:opacity-70 disabled:active:scale-100",
      )}
    >
      {content}
    </button>
  );
}

function GroupedListAffordance() {
  return (
    <span className="flex size-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition duration-300 group-hover:-translate-y-px group-hover:text-foreground">
      <ArrowRight className="size-4" aria-hidden />
    </span>
  );
}
