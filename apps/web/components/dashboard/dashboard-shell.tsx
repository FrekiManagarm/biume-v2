import { FileQuestion } from "lucide-react";
import type { ReactNode } from "react";

import { EmptyState } from "./kit";

type EmptyPanelProps = {
  /**
   * Ancienne API : une lettre affichée dans un pavé. Ignorée — le kit utilise
   * des icônes `lucide`, conformément aux conventions du dépôt.
   */
  glyph?: string;
  title: string;
  description: string;
  action?: ReactNode;
};

/**
 * Compatibilité pour les deux routes de rapport qui l'importent encore.
 *
 * Ce fichier exportait aussi `DashboardPage`, `DashboardMetric`, `StatusPill`
 * et `ProgressBar` : personne ne les utilisait, chaque page réécrivait les
 * siens en couleurs codées en dur. Ils sont supprimés au profit de
 * `components/dashboard/kit`. Ce dernier alias disparaîtra quand les routes de
 * rapport seront migrées.
 *
 * @deprecated Utiliser `EmptyState` de `components/dashboard/kit`.
 */
export function EmptyPanel({ action, description, title }: EmptyPanelProps) {
  return (
    <EmptyState
      icon={FileQuestion}
      title={title}
      description={description}
      action={action}
      className="min-h-80"
    />
  );
}
