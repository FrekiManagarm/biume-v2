import type { FormEvent, InputHTMLAttributes, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { AlertCircle, Sparkles } from "lucide-react";

import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { cn } from "#/lib/utils";

type AuthShellProps = {
  children: ReactNode;
};

const MARKETING_APP_URL =
  import.meta.env.VITE_MARKETING_APP_URL?.replace(/\/$/, "") ??
  "http://localhost:3000";

function BiumeLogo({ className = "size-8" }: { className?: string }) {
  return (
    <img
      src="/assets/images/biume-logo.png"
      alt=""
      className={cn("shrink-0 rounded-lg", className)}
      width={40}
      height={40}
    />
  );
}

function MarketingLogoLink({ className }: { className?: string }) {
  return (
    <a
      href={MARKETING_APP_URL}
      className={cn(
        "inline-flex w-fit items-center gap-2 text-sm font-semibold tracking-wide",
        className,
      )}
      aria-label="Biume landing page"
    >
      <BiumeLogo />
      Biume
    </a>
  );
}

export function AuthShell({ children }: AuthShellProps) {
  return (
    <main className="min-h-svh bg-[radial-gradient(circle_at_top_left,color-mix(in_oklch,var(--primary),transparent_82%),transparent_34rem),linear-gradient(135deg,var(--background),var(--muted))] text-foreground">
      <div className="mx-auto grid min-h-svh w-full max-w-6xl grid-cols-1 lg:grid-cols-[0.9fr_1.1fr]">
        <aside className="hidden border-r border-border/70 px-10 py-10 lg:flex lg:flex-col lg:justify-between">
          <MarketingLogoLink />

          <div className="max-w-sm">
            <div className="mb-5 inline-flex items-center gap-2 rounded-lg border border-border bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground shadow-xs">
              <Sparkles className="size-3.5" aria-hidden="true" />
              Espace sécurisé
            </div>
            <h1 className="text-4xl font-semibold leading-tight">
              Retrouvez vos opérations sans friction.
            </h1>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              Accédez à vos dossiers, propriétaires et rapports depuis un point
              d'entrée clair, rapide et protégé.
            </p>
          </div>

          <p className="text-xs text-muted-foreground">
            Biume protège chaque session avec Better Auth.
          </p>
        </aside>

        <section className="flex min-h-svh items-center justify-center px-4 py-8 sm:px-6 lg:px-10">
          <div className="w-full max-w-[430px]">{children}</div>
        </section>
      </div>
    </main>
  );
}

type AuthPanelProps = {
  title: string;
  description: string;
  children: ReactNode;
  footer: ReactNode;
};

export function AuthPanel({
  title,
  description,
  children,
  footer,
}: AuthPanelProps) {
  return (
    <div className="rounded-lg border border-border bg-background/92 p-5 shadow-xl shadow-foreground/5 backdrop-blur sm:p-6">
      <div className="mb-6">
        <MarketingLogoLink className="mb-6 lg:hidden" />
        <h2 className="text-2xl font-semibold leading-tight">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      </div>

      {children}

      <div className="mt-6 border-t border-border pt-5 text-center text-sm text-muted-foreground">
        {footer}
      </div>
    </div>
  );
}

type AuthFormProps = {
  children: ReactNode;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function AuthForm({ children, onSubmit }: AuthFormProps) {
  return (
    <form className="grid gap-4" onSubmit={onSubmit}>
      {children}
    </form>
  );
}

type AuthFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  icon: LucideIcon;
  label: string;
  hint?: string;
};

export function AuthField({
  icon: Icon,
  label,
  id,
  className,
  hint,
  ...props
}: AuthFieldProps) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Icon
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input id={id} className={cn("h-10 pl-9", className)} {...props} />
      </div>
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

type AuthMessageProps = {
  tone?: "error" | "success";
  children: ReactNode;
};

export function AuthMessage({ tone = "error", children }: AuthMessageProps) {
  return (
    <div
      className={cn(
        "flex items-start gap-2 rounded-lg border px-3 py-2 text-sm leading-5",
        tone === "error"
          ? "border-destructive/35 bg-destructive/10 text-destructive"
          : "border-primary/25 bg-primary/10 text-foreground",
      )}
      role={tone === "error" ? "alert" : "status"}
    >
      <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <span>{children}</span>
    </div>
  );
}

type SubmitButtonProps = {
  children: ReactNode;
  icon: LucideIcon;
  isPending: boolean;
};

export function SubmitButton({
  children,
  icon: Icon,
  isPending,
}: SubmitButtonProps) {
  return (
    <Button className="mt-1 h-10 w-full" disabled={isPending} type="submit">
      {children}
      <Icon
        className={cn("size-4", isPending && "animate-spin")}
        data-icon="inline-end"
        aria-hidden="true"
      />
    </Button>
  );
}
