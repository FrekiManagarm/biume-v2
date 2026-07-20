import type { REPORT_TRANSFORMATION_DEMO } from "../landing/report-transformation-demo";

type Demo = typeof REPORT_TRANSFORMATION_DEMO;

/** Tampon de validation éditorial. */
export function Stamp({ children }: { children: string }) {
  return (
    <span className="v2-stamp v2-mono inline-block px-3 py-1.5 text-[0.65rem] font-medium uppercase tracking-[0.14em]">
      {children}
    </span>
  );
}

/** Feuille de notes de séance — papier réglé, marge rouge, légèrement penchée. */
export function NotesSheet({
  note,
  className = "",
}: {
  note: Demo["note"];
  className?: string;
}) {
  return (
    <figure
      className={`v2-ruled v2-margin-line relative rotate-[-1.6deg] border border-[color:var(--v2-line)] bg-[color:var(--v2-sheet)] px-6 py-5 pl-16 shadow-[0_18px_36px_-24px_rgba(28,25,23,0.45)] ${className}`}
    >
      <figcaption className="v2-mono mb-4 flex items-baseline justify-between gap-4 text-[0.65rem] uppercase tracking-[0.14em] text-[color:var(--v2-ink-faint)]">
        <span>Feuille de séance</span>
        <span>14:32</span>
      </figcaption>
      <p className="v2-mono text-[0.8rem] leading-7 text-[color:var(--v2-ink-soft)]">
        {note}
      </p>
    </figure>
  );
}

/** Résumé propriétaire — citation éditoriale. */
export function OwnerSummary({
  summary,
  className = "",
}: {
  summary: Demo["ownerSummary"];
  className?: string;
}) {
  return (
    <p
      className={`v2-display v2-pullquote text-[1.05rem] leading-snug text-[color:var(--v2-ink)] italic ${className}`}
    >
      «&nbsp;{summary}&nbsp;»
    </p>
  );
}
