import {
  ClipboardCheck,
  FileText,
  ListChecks,
  MessageCircle,
  PanelLeft,
  ShieldCheck,
  Sparkles,
  Stethoscope,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useSidebar } from "#/components/ui/sidebar";
import { useAppContext } from "#/hooks/useAppContext";
import { AssistantChatWorkspace } from "./assistant-chat-workspace";

const contextActions = [
  {
    label: "Préparer une consultation",
    description: "Questions, points à vérifier et notes utiles.",
    icon: Stethoscope,
    prompt:
      "Aide-moi à préparer une consultation avec les points à vérifier, les questions utiles et les informations à noter.",
  },
  {
    label: "Structurer un rapport",
    description: "Plan clair pour transformer des notes en document.",
    icon: FileText,
    prompt:
      "Aide-moi à structurer mon prochain rapport avec un plan simple, professionnel et facile à relire.",
  },
  {
    label: "Clarifier les relances",
    description: "Priorités et prochaines actions à garder en tête.",
    icon: ClipboardCheck,
    prompt:
      "Aide-moi à organiser mes relances patients et à identifier les prochaines actions importantes.",
  },
  {
    label: "Faire une synthèse",
    description: "Résumé exploitable sans perdre le contexte.",
    icon: ListChecks,
    prompt:
      "Résume cette situation en points importants, risques à surveiller et prochaines étapes possibles.",
  },
];

function getContextLabel(pathname: string) {
  if (pathname.includes("/assistant")) return "Assistant";
  if (pathname.includes("/agenda")) return "Agenda";
  if (pathname.includes("/patients")) return "Animaux";
  if (pathname.includes("/clients")) return "Propriétaires";
  if (pathname.includes("/reports")) return "Comptes rendus";
  if (pathname.includes("/settings")) return "Paramètres";

  return "Dashboard";
}

export type AssistantPromptRequest = {
  id: string;
  prompt: string;
  source: "shortcut";
};

function buildPromptRequest(prompt: string): AssistantPromptRequest {
  return {
    id: `${Date.now()}-${prompt}`,
    prompt,
    source: "shortcut",
  };
}

export function AssistantPage() {
  const appContext = useAppContext();
  const { toggleSidebar } = useSidebar();
  const contextLabel = getContextLabel(appContext.currentPage);
  const [isAssistantBusy, setIsAssistantBusy] = useState(false);
  const [promptRequest, setPromptRequest] =
    useState<AssistantPromptRequest | null>(null);

  const handleShortcutClick = (prompt: string) => {
    if (isAssistantBusy) {
      return;
    }

    setPromptRequest(buildPromptRequest(prompt));
  };

  return (
    <div className="mx-auto grid w-full max-w-[1400px] gap-3 text-slate-950 xl:h-[calc(100dvh-1rem)] xl:grid-rows-[auto_minmax(0,1fr)] xl:overflow-hidden">
      <header className="grid gap-3 border-b border-slate-200 pb-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-9 rounded-xl border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-emerald-50 hover:text-emerald-700"
              onClick={toggleSidebar}
              aria-label="Afficher ou masquer la navigation"
            >
              <PanelLeft className="size-4" />
            </Button>
            <div className="flex items-center gap-2 text-sm font-medium text-emerald-700">
              <Sparkles className="size-4" />
              Assistant Biume
            </div>
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 md:text-3xl">
            Un espace calme pour clarifier, rédiger et avancer.
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Posez une question, déposez des notes ou préparez une consultation.
            L'assistant garde le contexte de votre espace Biume pour vous aider
            à formuler des réponses utiles.
          </p>
        </div>
        <div className="w-fit rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-800">
          Mode assistance
        </div>
      </header>

      <section className="grid min-h-0 gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <AssistantChatWorkspace
          promptRequest={promptRequest}
          onLoadingChange={setIsAssistantBusy}
          onPromptRequestHandled={() => setPromptRequest(null)}
        />

        <aside className="grid min-h-0 gap-3 xl:grid-rows-[auto_minmax(0,1fr)]">
          <section className="rounded-[1.35rem] border border-slate-200/70 bg-white p-4 shadow-[0_20px_40px_-24px_rgba(15,23,42,0.18)]">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                <ShieldCheck className="size-4" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-950">
                  Contexte actif
                </h2>
                <p className="text-xs text-slate-500">
                  Utilisé pour orienter les réponses.
                </p>
              </div>
            </div>

            <dl className="mt-3 grid text-sm">
              <div className="flex items-center justify-between gap-3 border-t border-slate-100 py-2">
                <dt className="text-slate-500">Espace</dt>
                <dd className="font-medium text-slate-900">{contextLabel}</dd>
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-slate-100 py-2">
                <dt className="text-slate-500">Patient</dt>
                <dd className="font-medium text-slate-900">
                  {appContext.selectedPatient ? "Sélectionné" : "Non sélectionné"}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-2">
                <dt className="text-slate-500">Client</dt>
                <dd className="font-medium text-slate-900">
                  {appContext.selectedClient ? "Sélectionné" : "Non sélectionné"}
                </dd>
              </div>
            </dl>
          </section>

          <section className="flex min-h-0 flex-col rounded-[1.35rem] border border-slate-200/70 bg-white p-4 shadow-[0_20px_40px_-24px_rgba(15,23,42,0.18)]">
            <div className="flex items-center gap-2">
              <MessageCircle className="size-4 text-emerald-700" />
              <h2 className="text-sm font-semibold text-slate-950">
                Raccourcis utiles
              </h2>
            </div>
            <div className="mt-3 grid min-h-0 gap-2 overflow-y-auto pr-1">
              {contextActions.map((action) => {
                const Icon = action.icon;

                return (
                  <Button
                    key={action.label}
                    type="button"
                    variant="ghost"
                    disabled={isAssistantBusy}
                    className="h-auto justify-start rounded-2xl border border-slate-100 bg-slate-50/70 p-3 text-left hover:border-emerald-200 hover:bg-emerald-50/80 xl:p-2.5"
                    onClick={() => handleShortcutClick(action.prompt)}
                  >
                    <div className="flex items-start gap-3">
                      <Icon className="mt-0.5 size-4 shrink-0 text-emerald-700" />
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {action.label}
                        </p>
                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          {action.description}
                        </p>
                      </div>
                    </div>
                  </Button>
                );
              })}
            </div>
          </section>
        </aside>
      </section>
    </div>
  );
}
