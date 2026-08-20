import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "#/lib/utils";

import { toneSoftClassName, type Tone } from "./tone";

type IconTileProps = {
  icon?: LucideIcon;
  tone?: Tone;
  size?: "sm" | "md";
  /** Un logo ou une image, à la place de l'icône. */
  children?: ReactNode;
  className?: string;
};

/**
 * Le carré qui identifie une ligne ou une carte.
 *
 * Repris de `select-organization`, où il porte le logo d'une entreprise ou son
 * initiale par défaut. Sa taille est fixe : c'est ce qui aligne verticalement
 * toutes les lignes d'une liste, quelle que soit la longueur de leur contenu.
 */
export function IconTile({
  children,
  className,
  icon: Icon,
  size = "md",
  tone = "neutral",
}: IconTileProps) {
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden border transition duration-300",
        size === "md" ? "size-12 rounded-xl" : "size-9 rounded-lg",
        toneSoftClassName(tone),
        className,
      )}
    >
      {children ?? (Icon ? <IconTileGlyph icon={Icon} size={size} /> : null)}
    </span>
  );
}

function IconTileGlyph({
  icon: Icon,
  size,
}: {
  icon: LucideIcon;
  size: "sm" | "md";
}) {
  return <Icon className={size === "md" ? "size-5" : "size-4"} aria-hidden />;
}
