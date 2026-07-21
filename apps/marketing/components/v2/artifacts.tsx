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
