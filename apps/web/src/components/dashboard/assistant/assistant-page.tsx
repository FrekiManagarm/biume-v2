import {
  ClipboardCheck,
  FileText,
  ListChecks,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Stethoscope,
} from "lucide-react";

import { useAppContext } from "#/hooks/useAppContext";
import { AssistantChatWorkspace } from "./assistant-chat-workspace";

const contextActions = [
  {
    label: "Préparer une consultation",
    description: "Questions, points à vérifier et notes utiles.",
    icon: Stethoscope,
  },
  {
    label: "Structurer un rapport",
    description: "Plan clair pour transformer des notes en document.",
    icon: FileText,
  },
  {
    label: "Clarifier les relances",
    description: "Priorités et prochaines actions à garder en tête.",
    icon: ClipboardCheck,
  },
  {
    label: "Faire une synthèse",
    description: "Résumé exploitable sans perdre le contexte.",
    icon: ListChecks,
  },
];

function getContextLabel(pathname: string) {
  if (pathname.includes("/agenda")) return "Agenda";
  if (pathname.includes("/patients")) return "Animaux";
  if (pathname.includes("/clients")) return "Propriétaires";
  if (pathname.includes("/reports")) return "Comptes rendus";
  if (pathname.includes("/settings")) return "Paramètres";

  return "Dashboard";
}

export function AssistantPage() {
  const appContext = useAppContext();
  const contextLabel = getContextLabel(appContext.currentPage);

  return (
    <div className="mx-auto grid w-full max-w-[1400px] gap-5 pb-8 text-slate-950">
      <header className="grid gap-3 border-b border-slate-200 pb-5 pt-2 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-sm font-medium text-emerald-700">
            <Sparkles className="size-4" />
            Assistant Biume
          </div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">
            Un espace calme pour clarifier, rédiger et avancer.
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
            Posez une question, déposez des notes ou préparez une consultation.
            L'assistant garde le contexte de votre espace Biume pour vous aider
            à formuler des réponses utiles.
          </p>
        </div>
        <div className="w-fit rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800">
          Mode assistance
        </div>
      </header>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <AssistantChatWorkspace />

        <aside className="grid gap-4 xl:sticky xl:top-4 xl:self-start">
          <section className="rounded-[1.5rem] border border-slate-200/70 bg-white p-5 shadow-[0_20px_40px_-24px_rgba(15,23,42,0.18)]">
            <div className="flex items-center gap-2">
              <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
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

            <dl className="mt-4 grid gap-3 text-sm">
              <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
                <dt className="text-slate-500">Espace</dt>
                <dd className="font-medium text-slate-900">{contextLabel}</dd>
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
                <dt className="text-slate-500">Patient</dt>
                <dd className="font-medium text-slate-900">
                  {appContext.selectedPatient ? "Sélectionné" : "Non sélectionné"}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
                <dt className="text-slate-500">Client</dt>
                <dd className="font-medium text-slate-900">
                  {appContext.selectedClient ? "Sélectionné" : "Non sélectionné"}
                </dd>
              </div>
            </dl>
          </section>

          <section className="rounded-[1.5rem] border border-slate-200/70 bg-white p-5 shadow-[0_20px_40px_-24px_rgba(15,23,42,0.18)]">
            <div className="flex items-center gap-2">
              <MessageCircle className="size-4 text-emerald-700" />
              <h2 className="text-sm font-semibold text-slate-950">
                Raccourcis utiles
              </h2>
            </div>
            <div className="mt-4 grid gap-2">
              {contextActions.map((action) => {
                const Icon = action.icon;

                return (
                  <div
                    key={action.label}
                    className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3"
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
                  </div>
                );
              })}
            </div>
          </section>

          <section className="rounded-[1.5rem] border border-emerald-200/70 bg-emerald-50/80 p-5">
            <h2 className="text-sm font-semibold text-emerald-950">
              À savoir
            </h2>
            <p className="mt-2 text-xs leading-5 text-emerald-900/75">
              L'assistant peut aider à rédiger, structurer et prioriser. Il ne
              réalise pas d'action destructive dans l'application sans votre
              intervention.
            </p>
          </section>
        </aside>
      </section>
    </div>
  );
}
