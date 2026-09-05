/**
 * Les tons du dashboard, alignés sur la sémantique du système de design :
 * le violet porte l'action qui fait avancer le praticien, le vert porte l'état
 * atteint. Un ton n'est donc pas un choix esthétique — il dit au praticien si
 * on attend quelque chose de lui ou si c'est réglé.
 */
export type Tone = "neutral" | "action" | "done" | "attention" | "problem";

type ToneClassNames = {
  /** Pastille et pavé d'icône : fond teinté, bordure teintée, texte lisible. */
  soft: string;
  /** L'icône seule, posée sur une surface neutre. */
  icon: string;
};

const toneClassNames: Record<Tone, ToneClassNames> = {
  neutral: {
    soft: "border-border bg-muted text-muted-foreground",
    icon: "text-muted-foreground",
  },
  action: {
    soft: "border-primary-border bg-primary-surface text-primary",
    icon: "text-primary",
  },
  done: {
    soft: "border-success-border bg-success-surface text-success",
    icon: "text-success",
  },
  attention: {
    soft: "border-warning-border bg-warning-surface text-warning",
    icon: "text-warning",
  },
  problem: {
    soft: "border-destructive-border bg-destructive-surface text-destructive",
    icon: "text-destructive",
  },
};

export function toneSoftClassName(tone: Tone) {
  return toneClassNames[tone].soft;
}

export function toneIconClassName(tone: Tone) {
  return toneClassNames[tone].icon;
}
