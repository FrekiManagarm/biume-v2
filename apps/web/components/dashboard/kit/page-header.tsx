import type { ReactNode } from "react";

import { Eyebrow } from "./eyebrow";

type PageHeaderProps = {
  /** Intitulé court au-dessus du titre, repris de `select-organization`. */
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
};

/**
 * L'en-tête d'une page du dashboard.
 *
 * Le titre dit où on est, la description dit à quoi sert la page, et les
 * actions sont l'unique endroit où chercher le bouton principal. Cette
 * position fixe compte plus que sa forme : c'est ce qui permet de ne plus
 * chercher.
 */
export function PageHeader({
  actions,
  description,
  eyebrow,
  title,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          {title}
        </h1>
        {description ? (
          <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
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
