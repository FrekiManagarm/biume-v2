import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "#/lib/utils";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
};

/**
 * Un endroit vide.
 *
 * Trois obligations : dire que c'est normal, dire pourquoi c'est vide, et
 * proposer le geste qui le remplit. Un vide qui ne propose rien laisse le
 * praticien chercher ailleurs ce qu'il aurait pu faire ici.
 */
export function EmptyState({
  action,
  className,
  description,
  icon: Icon,
  title,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "grid place-items-center rounded-card border border-dashed border-border bg-muted/40 px-6 py-10 text-center",
        className,
      )}
    >
      <div className="max-w-sm">
        <div className="mx-auto flex size-10 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground">
          <Icon className="size-5" aria-hidden />
        </div>
        <p className="mt-3 text-sm font-semibold text-foreground">{title}</p>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          {description}
        </p>
        {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
      </div>
    </div>
  );
}
