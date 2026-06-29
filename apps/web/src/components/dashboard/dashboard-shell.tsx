import type { ReactNode } from "react";

import { cn } from "@biume/ui/lib/utils";

type DashboardPageProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
};

type DashboardMetricProps = {
  label: string;
  value: string;
  delta: string;
  glyph: string;
};

type StatusPillProps = {
  tone?: "neutral" | "success" | "warning" | "danger";
  children: ReactNode;
};

type ProgressBarProps = {
  value: number;
};

type EmptyPanelProps = {
  glyph: string;
  title: string;
  description: string;
  action?: ReactNode;
};

function DashboardPage({
  eyebrow,
  title,
  description,
  actions,
  children,
}: DashboardPageProps) {
  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          {eyebrow ? (
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            {title}
          </h1>
          {description ? (
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
        {actions ? <div className="flex shrink-0 gap-2">{actions}</div> : null}
      </div>
      {children}
    </div>
  );
}

function DashboardMetric({ label, value, delta, glyph }: DashboardMetricProps) {
  return (
    <article className="rounded-lg border border-border bg-card p-4 shadow-sm shadow-foreground/5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
        </div>
        <div className="flex size-9 items-center justify-center rounded-lg bg-muted font-mono text-sm font-semibold text-muted-foreground">
          {glyph}
        </div>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">{delta}</p>
    </article>
  );
}

function StatusPill({ tone = "neutral", children }: StatusPillProps) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center rounded-md border px-2 text-xs font-medium",
        tone === "neutral" &&
          "border-border bg-muted text-muted-foreground",
        tone === "success" &&
          "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
        tone === "warning" &&
          "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300",
        tone === "danger" &&
          "border-destructive/20 bg-destructive/10 text-destructive",
      )}
    >
      {children}
    </span>
  );
}

function ProgressBar({ value }: ProgressBarProps) {
  const normalizedValue = Math.max(0, Math.min(100, value));

  return (
    <div className="h-2 overflow-hidden rounded-full bg-muted">
      <div
        className="h-full rounded-full bg-primary transition-all"
        style={{ width: `${normalizedValue}%` }}
      />
    </div>
  );
}

function EmptyPanel({ glyph, title, description, action }: EmptyPanelProps) {
  return (
    <div className="grid min-h-80 place-items-center rounded-lg border border-dashed border-border bg-card p-8 text-center">
      <div className="max-w-sm">
        <div className="mx-auto flex size-12 items-center justify-center rounded-lg bg-muted font-mono text-base font-semibold text-muted-foreground">
          {glyph}
        </div>
        <h1 className="mt-4 text-lg font-semibold tracking-tight">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {description}
        </p>
        {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
      </div>
    </div>
  );
}

export {
  DashboardMetric,
  DashboardPage,
  EmptyPanel,
  ProgressBar,
  StatusPill,
};
