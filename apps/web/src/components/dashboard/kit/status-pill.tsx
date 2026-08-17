import type { LucideIcon } from "lucide-react";

import { cn } from "#/lib/utils";

import { toneSoftClassName, type Tone } from "./tone";

type StatusPillProps = {
  children: string;
  icon?: LucideIcon;
  tone?: Tone;
};

/**
 * L'état d'un élément, en toutes lettres.
 *
 * Le libellé passé ici doit être lisible par un ostéopathe qui n'a jamais
 * ouvert un logiciel de gestion : « À remplir », pas « draft ». Les états
 * techniques se traduisent avant d'arriver dans ce composant.
 */
export function StatusPill({
  children,
  icon: Icon,
  tone = "neutral",
}: StatusPillProps) {
  return (
    <span
      className={cn(
        "inline-flex h-6 shrink-0 items-center gap-1.5 rounded-chip border px-2 text-xs font-medium",
        toneSoftClassName(tone),
      )}
    >
      {Icon ? <Icon className="size-3.5" aria-hidden /> : null}
      {children}
    </span>
  );
}
