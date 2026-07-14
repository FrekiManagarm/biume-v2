import { useEffect, useState } from "react";
import type { UIMessage } from "ai";
import { CheckCircle2, LoaderCircle, Sparkles } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { useVulgarisationAgent } from "@/hooks/useVulgarisationAgent";
import type { OwnerContentRecord, OwnerSourceItem } from "../owner-content";

export type OwnerPreparationSaveInput = {
  reportId: string;
  sourceKind: OwnerSourceItem["sourceKind"];
  sourceId: string;
  ownerText: string;
};

export function OwnerPreparationSheet({
  open,
  onOpenChange,
  reportId,
  queue,
  records,
  initialSourceKey,
  onSave,
  onViewPreview,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportId: string;
  queue: Array<OwnerSourceItem & { status: "missing" | "stale" }>;
  records: OwnerContentRecord[];
  initialSourceKey?: string;
  onSave: (input: OwnerPreparationSaveInput) => Promise<unknown>;
  onViewPreview?: () => void;
}) {
  const { messages, isLoading, error, sendMessage, reset } =
    useVulgarisationAgent();
  const [index, setIndex] = useState(() => {
    if (!initialSourceKey) return 0;
    const requested = queue.findIndex((item) => item.key === initialSourceKey);
    return requested >= 0 ? requested : 0;
  });
  const active = queue[index];
  const existing = active
    ? records.find(
        (record) =>
          record.sourceKind === active.sourceKind &&
          record.sourceId === active.sourceId,
      )
    : undefined;
  const [draft, setDraft] = useState(existing?.ownerText ?? "");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [generationSourceKey, setGenerationSourceKey] = useState<string | null>(
    null,
  );
  const [isSaving, setIsSaving] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);

  useEffect(() => {
    setDraft(existing?.ownerText ?? "");
    setSaveError(null);
    setGenerationError(null);
    setGenerationSourceKey(null);
    reset();
  }, [active?.key, existing?.ownerText, reset]);

  const latestAssistantText = getLatestAssistantText(messages);
  const activeKey = active?.key;

  useEffect(() => {
    if (
      !isLoading &&
      activeKey &&
      generationSourceKey === activeKey &&
      latestAssistantText
    ) {
      setDraft(latestAssistantText);
    }
  }, [activeKey, generationSourceKey, isLoading, latestAssistantText]);

  const hasUnsavedOwnerDraft = draft !== (existing?.ownerText ?? "");

  function requestOpenChange(nextOpen: boolean) {
    if (!nextOpen && hasUnsavedOwnerDraft) {
      setConfirmClose(true);
      return;
    }
    onOpenChange(nextOpen);
  }

  async function generateProposal() {
    if (!active || isLoading) return;
    setGenerationError(null);
    reset();
    setGenerationSourceKey(active.key);
    try {
      await sendMessage(active.professionalText, {
        reportId,
        sourceKind: active.sourceKind,
        sourceContext: active.context,
      });
    } catch {
      setGenerationError("Génération impossible");
    }
  }

  async function validateAndContinue() {
    if (!active || !draft.trim() || isSaving) return;
    setSaveError(null);
    setIsSaving(true);
    try {
      await onSave({
        reportId,
        sourceKind: active.sourceKind,
        sourceId: active.sourceId,
        ownerText: draft,
      });
      if (index < queue.length - 1) setIndex(index + 1);
      else setIndex(queue.length);
    } catch {
      setSaveError("Enregistrement impossible");
    } finally {
      setIsSaving(false);
    }
  }

  function skip() {
    if (index < queue.length - 1) setIndex(index + 1);
    else setIndex(queue.length);
  }

  const isComplete = index >= queue.length;
  const generationFailed = Boolean(error || generationError);

  return (
    <Sheet open={open} onOpenChange={requestOpenChange}>
      <SheetContent
        side="right"
        className="w-screen max-w-none gap-0 p-0 sm:w-[32rem] sm:max-w-[32rem] data-[side=right]:w-screen data-[side=right]:sm:w-[32rem] data-[side=right]:sm:max-w-[32rem]"
      >
        <SheetHeader className="border-b border-border px-5 py-4 text-left">
          <SheetTitle>Préparation guidée</SheetTitle>
          <SheetDescription>
            Préparez une version claire sans modifier le texte professionnel.
          </SheetDescription>
        </SheetHeader>

        {isComplete ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-5 px-6 py-10 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
              <CheckCircle2 className="size-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-base font-semibold text-foreground">
                Préparation terminée
              </h3>
              <p className="max-w-sm text-sm leading-6 text-muted-foreground">
                Toutes les versions de cette file ont été traitées.
              </p>
            </div>
            <Button onClick={onViewPreview} disabled={!onViewPreview}>
              Voir l’aperçu propriétaire
            </Button>
          </div>
        ) : active ? (
          <>
            <div className="flex items-center justify-between border-b border-border bg-muted/30 px-5 py-3 text-xs">
              <span className="font-medium text-foreground">
                {index + 1} sur {queue.length}
              </span>
              <span className="text-muted-foreground">
                {active.status === "stale" ? "À mettre à jour" : "À préparer"}
              </span>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
              <div className="space-y-2">
                <Label htmlFor="owner-professional-source">
                  Texte professionnel
                </Label>
                <Textarea
                  id="owner-professional-source"
                  value={active.professionalText}
                  readOnly
                  aria-readonly="true"
                  className="min-h-28 resize-none bg-muted/40 text-muted-foreground"
                />
                <p className="text-xs text-muted-foreground">
                  {active.context}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <Label htmlFor="owner-version">Version propriétaire</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={generateProposal}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <LoaderCircle className="animate-spin" />
                    ) : (
                      <Sparkles />
                    )}
                    {isLoading
                      ? "Génération…"
                      : generationFailed
                        ? "Réessayer"
                        : draft.trim()
                          ? "Régénérer"
                          : "Générer"}
                  </Button>
                </div>
                <Textarea
                  id="owner-version"
                  value={draft}
                  onChange={(event) => {
                    setDraft(event.target.value);
                    setSaveError(null);
                  }}
                  placeholder="Rédigez ou générez une version claire pour le propriétaire."
                  className="min-h-40 resize-y"
                />
                {generationFailed && (
                  <p role="alert" className="text-sm text-destructive">
                    Génération impossible. Vous pouvez réessayer ou continuer
                    manuellement.
                  </p>
                )}
                {saveError && (
                  <p role="alert" className="text-sm text-destructive">
                    {saveError}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-[auto_1fr] gap-2 border-t border-border px-5 py-4">
              <Button type="button" variant="ghost" onClick={skip}>
                Passer
              </Button>
              <Button
                type="button"
                onClick={validateAndContinue}
                disabled={!draft.trim() || isSaving}
              >
                {isSaving ? "Enregistrement…" : "Valider et continuer"}
              </Button>
            </div>
          </>
        ) : null}
      </SheetContent>

      <AlertDialog open={confirmClose} onOpenChange={setConfirmClose}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Fermer sans enregistrer ?</AlertDialogTitle>
            <AlertDialogDescription>
              La version propriétaire en cours de modification sera perdue.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continuer la préparation</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                setConfirmClose(false);
                onOpenChange(false);
              }}
            >
              Fermer sans enregistrer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Sheet>
  );
}

function getLatestAssistantText(messages: UIMessage[]) {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];
    if (message?.role !== "assistant") continue;
    return message.parts
      .filter((part) => part.type === "text")
      .map((part) => part.text)
      .join("")
      .trim();
  }
  return "";
}
