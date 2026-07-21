import type { REPORT_TRANSFORMATION_DEMO } from "../landing/report-transformation-demo";

type Demo = typeof REPORT_TRANSFORMATION_DEMO;

/** Badge discret de validation praticien. */
export function V2Badge({ children }: { children: string }) {
  return (
    <span className="v2-badge">
      <svg
        aria-hidden="true"
        viewBox="0 0 12 12"
        className="size-3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M2 6.5 4.8 9 10 3.5" />
      </svg>
      {children}
    </span>
  );
}

/** Notes de séance brutes — la saisie du praticien, en mono. */
export function NotesSheet({
  note,
  className = "",
}: {
  note: Demo["note"];
  className?: string;
}) {
  return (
    <figure
      className={`relative rounded-xl border border-[color:var(--v2-line)] bg-[color:var(--v2-canvas)] px-5 py-4 ${className}`}
    >
      <figcaption className="v2-mono mb-3 flex items-baseline justify-between gap-4 text-[0.62rem] uppercase tracking-[0.14em] text-[color:var(--v2-ink-faint)]">
        <span>Notes de séance</span>
        <span>14:32</span>
      </figcaption>
      <p className="v2-mono text-[0.8rem] leading-6 text-[color:var(--v2-ink-soft)]">
        {note}
      </p>
    </figure>
  );
}
