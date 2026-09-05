import type { LucideIcon } from "lucide-react";

import { cn } from "#/lib/utils";

import { toneSoftClassName, type Tone } from "./tone";

type MetricProps = {
  label: string;
  value: number | string;
  hint?: string;
  icon?: LucideIcon;
  tone?: Tone;
};

/**
 * Un chiffre qui déclenche une décision.
 *
 * À n'utiliser que si le praticien fait quelque chose de différent selon la
 * valeur affichée. Un compteur qu'on regarde sans jamais agir dessus occupe la
 * place de ce qui compte : il ne mérite pas une carte.
 */
export function Metric({ hint, icon: Icon, label, tone = "neutral", value }: MetricProps) {
  return (
    <div className="rounded-card border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
            {value}
          </p>
        </div>
        {Icon ? (
          <div
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-lg border",
              toneSoftClassName(tone),
            )}
          >
            <Icon className="size-4" aria-hidden />
          </div>
        ) : null}
      </div>
      {hint ? (
        <p className="mt-2 text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}
