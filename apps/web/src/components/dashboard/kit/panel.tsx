import type { ReactNode } from "react";

import { cn } from "#/lib/utils";

type PanelProps = {
  children: ReactNode;
  className?: string;
};

type PanelHeaderProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
};

/**
 * Une surface groupant du contenu de même nature.
 *
 * Elle est tenue par sa bordure, pas par une ombre : les ombres profondes du
 * dashboard précédent créaient une profondeur de page vitrine sur une
 * interface de travail, et coûtaient une passe de rendu pour rien.
 */
export function Panel({ children, className }: PanelProps) {
  return (
    <section
      className={cn(
        "rounded-card border border-border bg-card p-4 sm:p-5",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function PanelHeader({
  actions,
  description,
  title,
}: PanelHeaderProps) {
  return (
    <div className="mb-4 flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <h2 className="text-base font-semibold tracking-tight text-foreground">
          {title}
        </h2>
        {description ? (
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>
      ) : null}
    </div>
  );
}
