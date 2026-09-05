import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "#/lib/utils";

import { toneSoftClassName, type Tone } from "./tone";

type ListRowProps = {
  icon?: LucideIcon;
  iconTone?: Tone;
  title: string;
  meta?: string;
  status?: ReactNode;
  /**
   * L'action principale de la ligne. Toujours rendue visible plutôt que
   * révélée au survol : une action qui n'apparaît qu'au passage de la souris
   * n'existe pas pour quelqu'un qui ne sait pas qu'elle est là.
   */
  action?: ReactNode;
  className?: string;
};

/** Une ligne d'élément répété : rendez-vous, compte rendu, animal, propriétaire. */
export function ListRow({
  action,
  className,
  icon: Icon,
  iconTone = "neutral",
  meta,
  status,
  title,
}: ListRowProps) {
  return (
    <article
      className={cn(
        "flex flex-col gap-3 rounded-lg border border-border bg-card px-3 py-3 sm:flex-row sm:items-center sm:gap-4",
        className,
      )}
    >
      {Icon ? (
        <div
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-lg border",
            toneSoftClassName(iconTone),
          )}
        >
          <Icon className="size-4" aria-hidden />
        </div>
      ) : null}

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-sm font-semibold text-foreground">
            {title}
          </p>
          {status}
        </div>
        {meta ? (
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{meta}</p>
        ) : null}
      </div>

      {action ? <div className="flex shrink-0 gap-2">{action}</div> : null}
    </article>
  );
}
