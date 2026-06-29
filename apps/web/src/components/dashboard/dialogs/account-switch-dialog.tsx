"use client";

import { Building2, Check, Loader2, UserRound } from "lucide-react";
import { useEffect } from "react";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@biume/ui/components/alert-dialog";
import { Badge } from "@biume/ui/components/badge";
import { cn } from "@biume/ui/lib/utils";

interface AccountSwitchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "personal" | "professional";
  organizationName?: string;
  isLoading: boolean;
}

export function AccountSwitchDialog({
  open,
  onOpenChange,
  type,
  organizationName,
  isLoading,
}: AccountSwitchDialogProps) {
  useEffect(() => {
    if (open && !isLoading) {
      const timer = setTimeout(() => {
        onOpenChange(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [open, isLoading, onOpenChange]);

  const isProfessional = type === "professional";
  const accountLabel = isProfessional ? "Espace pro" : "Espace personnel";
  const destination = isProfessional
    ? organizationName || "Organisation"
    : "Compte personnel";
  const title = isLoading
    ? `Changement vers ${destination}`
    : `${destination} est actif`;
  const description = isLoading
    ? "Préparation du contexte, des permissions et de vos raccourcis."
    : "Vos données et votre navigation viennent d'être actualisées.";

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-[25rem] overflow-hidden rounded-2xl border border-border/80 bg-popover p-0 text-popover-foreground shadow-[0_24px_70px_-32px_rgba(15,23,42,0.35)] ring-1 ring-foreground/5">
        <div className="relative p-5">
          <div className="absolute inset-x-0 top-0 h-px bg-foreground/10" />
          <div className="grid grid-cols-[auto_1fr] gap-4">
            <div
              className={cn(
                "relative flex size-12 items-center justify-center rounded-2xl border bg-background shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]",
                isProfessional ? "border-primary/25" : "border-border",
              )}
            >
              <span
                className={cn(
                  "absolute -right-1 -top-1 size-3 rounded-full border-2 border-popover",
                  isLoading ? "animate-pulse bg-primary/70" : "bg-primary",
                )}
              />
              {isLoading ? (
                <Loader2 className="size-5 animate-spin text-primary" />
              ) : isProfessional ? (
                <Building2 className="size-5 text-primary" />
              ) : (
                <UserRound className="size-5 text-primary" />
              )}
            </div>

            <div className="min-w-0 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 space-y-1">
                  <Badge variant="outline" className="bg-background/80">
                    {accountLabel}
                  </Badge>
                  <AlertDialogTitle className="text-base font-semibold tracking-tight text-foreground">
                    {title}
                  </AlertDialogTitle>
                </div>
                {!isLoading && (
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_8px_18px_-12px_rgba(15,23,42,0.55)]">
                    <Check className="size-4" />
                  </div>
                )}
              </div>

              <AlertDialogDescription className="text-sm leading-relaxed text-muted-foreground">
                {description}
              </AlertDialogDescription>

              <div className="space-y-2">
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn(
                      "h-full rounded-full bg-primary transition-all duration-500 ease-out",
                      isLoading ? "w-2/3 animate-pulse" : "w-full",
                    )}
                  />
                </div>
                <div className="flex items-center justify-between text-[0.7rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  <span>{isLoading ? "Synchronisation" : "Terminé"}</span>
                  <span>{isLoading ? "En cours" : "Actif"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
