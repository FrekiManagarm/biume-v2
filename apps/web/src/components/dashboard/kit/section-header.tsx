import type { ReactNode } from "react";

type SectionHeaderProps = {
  /** Intitulé court au-dessus du titre. Nomme la nature de ce qui suit. */
  eyebrow: string;
  title: string;
  actions?: ReactNode;
};

/**
 * L'en-tête d'une section, repris de `select-organization`.
 *
 * L'intitulé coloré porte la catégorie, le titre porte la question à laquelle
 * la section répond. Cette paire donne au praticien un repère de lecture
 * constant d'une page à l'autre. Nommé `SectionHeader` pour porter le même nom
 * que son équivalent mobile (`apps/mobile/src/design/screen.tsx` exporte déjà
 * `SectionHeader`) — les deux plateformes doivent partager le même vocabulaire
 * pour le même concept.
 */
export function SectionHeader({ actions, eyebrow, title }: SectionHeaderProps) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <p className="text-sm font-medium text-primary">{eyebrow}</p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight text-foreground">
          {title}
        </h2>
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>
      ) : null}
    </div>
  );
}
