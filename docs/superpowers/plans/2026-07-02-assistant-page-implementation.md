# Assistant Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a dedicated `/dashboard/assistant` page for the Biume AI assistant and remove the dashboard header drawer access.

**Architecture:** The route file only registers metadata and renders a focused page component. The page component owns the full assistant layout, while a chat workspace component owns `useChat`, suggestions, slash commands, messages, input, loading, error, and reset behavior. Sidebar navigation keeps its existing patterns, with one special-case assistant item that still uses the same route/menu data model.

**Tech Stack:** TanStack Start, TanStack Router file routes, React, Vercel AI SDK `useChat`, OpenAI-backed `/api/chat`, Tailwind CSS v4, shadcn AI `Message`, `Bubble`, `MessageScroller`, `Streamdown`, Bun.

## Global Constraints

- Use route `/dashboard/assistant`.
- Add a sidebar item labeled `Assistant` with the `Sparkles` icon.
- Place the assistant item in the first menu group, directly after `Agenda` and before dossier-oriented links.
- Remove the dashboard header assistant trigger completely.
- Keep shadcn AI `Message`, `Bubble`, and `MessageScroller`.
- Keep Vercel AI SDK chat flow through `/api/chat`.
- Use a neutral/slate base with one accent color: emerald/sage.
- Do not use purple or blue AI gradient aesthetics.
- Do not use emojis.
- Do not introduce decorative blobs or generic AI effects.
- Regenerate the TanStack route tree after adding the route.
- Use Bun commands.
- Do not manually edit `apps/web/src/routeTree.gen.ts`.

---

## File Structure

- Modify `apps/web/src/lib/menu-list.tsx`: add the assistant menu item and include enough metadata for the sidebar to render it specially.
- Modify `apps/web/src/components/dashboard/layout/dashboard-sidebar.tsx`: render the special assistant item with distinct expanded, collapsed, and active states.
- Modify `apps/web/src/components/dashboard/layout/dashboard-header.tsx`: remove `AISearch`, `AIChatDialog`, and local assistant state.
- Delete `apps/web/src/components/dashboard/layout/ai-search.tsx`: no longer used after header removal.
- Delete `apps/web/src/components/dashboard/layout/ai-chat-dialog.tsx`: no longer used after moving to the page.
- Create `apps/web/src/components/dashboard/assistant/assistant-page.tsx`: route-level page layout and contextual side panel.
- Create `apps/web/src/components/dashboard/assistant/assistant-chat-workspace.tsx`: chat behavior and shadcn AI message rendering.
- Create `apps/web/src/routes/dashboard/assistant.tsx`: TanStack file route for `/dashboard/assistant`.
- Modify `apps/web/src/lib/breadcrumb-list.tsx`: add the assistant breadcrumb item.
- Regenerate `apps/web/src/routeTree.gen.ts` with `bun --filter @biume/web generate-routes`.

---

### Task 1: Sidebar Assistant Entry And Header Cleanup

**Files:**
- Modify: `apps/web/src/lib/menu-list.tsx`
- Modify: `apps/web/src/components/dashboard/layout/dashboard-sidebar.tsx`
- Modify: `apps/web/src/components/dashboard/layout/dashboard-header.tsx`
- Delete: `apps/web/src/components/dashboard/layout/ai-search.tsx`
- Delete: `apps/web/src/components/dashboard/layout/ai-chat-dialog.tsx`

**Interfaces:**
- Consumes: current `proMenuList(pathname: string): Group[]`.
- Produces: `Menu` gains optional `variant?: "default" | "assistant"` and `badge?: string`; sidebar renders assistant menu using those fields.

- [ ] **Step 1: Update menu types and insert the assistant item**

In `apps/web/src/lib/menu-list.tsx`, add `Sparkles` to the lucide import and extend `Menu` and `Submenu`:

```tsx
import {
  CalendarDays,
  Contact2,
  LayoutDashboard,
  type LucideIcon,
  NotepadText,
  PawPrint,
  Settings,
  Sparkles,
} from "lucide-react";

export type Submenu = {
  href: string;
  label: string;
  active: boolean;
  comingSoon?: boolean;
  icon: LucideIcon;
  variant?: "default" | "assistant";
  badge?: string;
};

export type Menu = {
  href: string;
  label: string;
  active: boolean;
  icon: LucideIcon;
  submenus?: Submenu[];
  comingSoon?: boolean;
  variant?: "default" | "assistant";
  badge?: string;
};
```

Then add the assistant item directly after `Agenda`:

```tsx
{
  href: `/dashboard/assistant`,
  label: "Assistant",
  active: pathname.startsWith(`/dashboard/assistant`),
  icon: Sparkles,
  variant: "assistant",
  badge: "IA",
},
```

- [ ] **Step 2: Add assistant-specific sidebar rendering**

In `apps/web/src/components/dashboard/layout/dashboard-sidebar.tsx`, keep `NavLink` for normal items and add this helper below `NavLink`:

```tsx
  const AssistantNavLink = ({ menu }: { menu: Menu }) => {
    const Icon = menu.icon;

    return (
      <Link
        to={menu.href}
        title={isCollapsed ? menu.label : undefined}
        data-active={menu.active ? true : undefined}
        className={cn(
          "group/nav relative flex h-11 w-full items-center gap-3 overflow-hidden rounded-lg border border-emerald-200/70 bg-emerald-50/80 px-3 text-sm font-semibold text-emerald-950 outline-none shadow-sm shadow-emerald-950/5 transition-[background,color,box-shadow,transform,border-color] duration-200 hover:-translate-y-[1px] hover:border-emerald-300 hover:bg-emerald-100/80 hover:text-emerald-950 focus-visible:ring-2 focus-visible:ring-emerald-500/30 active:translate-y-0 group-data-[collapsible=icon]:size-9 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0",
          menu.active &&
            "border-emerald-300 bg-emerald-100 text-emerald-950 shadow-md shadow-emerald-950/10 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:rounded-full before:bg-emerald-700 group-data-[collapsible=icon]:before:top-auto group-data-[collapsible=icon]:before:bottom-1 group-data-[collapsible=icon]:before:left-1/2 group-data-[collapsible=icon]:before:h-1 group-data-[collapsible=icon]:before:w-4 group-data-[collapsible=icon]:before:-translate-x-1/2",
        )}
      >
        <Icon className="size-4 shrink-0 text-emerald-700 transition-transform duration-200 group-hover/nav:scale-105" />
        <span className="truncate group-data-[collapsible=icon]:hidden">
          {menu.label}
        </span>
        {menu.badge ? (
          <span className="ml-auto rounded-full border border-emerald-200 bg-white/80 px-1.5 py-0.5 text-[0.65rem] font-bold leading-none text-emerald-700 group-data-[collapsible=icon]:hidden">
            {menu.badge}
          </span>
        ) : null}
      </Link>
    );
  };
```

Then update `NavItem` so the special variant renders before submenu logic:

```tsx
  const NavItem = ({ menu }: { menu: Menu }) => {
    if (menu.variant === "assistant") {
      return <AssistantNavLink menu={menu} />;
    }

    if (menu.submenus) {
      return isCollapsed ? (
        <CollapsedSubMenu menu={menu} />
      ) : (
        <ExpandedSubMenu menu={menu} />
      );
    }

    return <NavLink menu={menu} />;
  };
```

- [ ] **Step 3: Remove assistant trigger from dashboard header**

In `apps/web/src/components/dashboard/layout/dashboard-header.tsx`, remove `useState` from the React import, remove the `AISearch` and `AIChatDialog` imports, remove the `aiDialogOpen` state, remove the right-side assistant button block, and return only the header container.

The top import section should become:

```tsx
import { useMemo, Fragment } from "react";
import { Link, useLocation, useParams } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { PanelLeft } from "lucide-react";
import { useSidebar } from "#/components/ui/sidebar";
import { breadcrumbProList } from "#/lib/breadcrumb-list";
```

The component body should no longer contain:

```tsx
const [aiDialogOpen, setAiDialogOpen] = useState(false);
```

Keep the existing breadcrumb calculation unchanged. Replace the returned JSX with this header-only structure:

```tsx
  return (
    <div className="flex flex-row justify-between items-center h-16 px-4 py-4">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          className="h-10 w-10 rounded-xl border-border transition-all duration-300 hover:shadow-md p-0 m-0 bg-sidebar"
          onClick={toggleSidebar}
        >
          <PanelLeft size={24} />
        </Button>
        <Separator orientation="vertical" className="mx-2 h-4 bg-accent" />
        <Breadcrumb>
          <BreadcrumbList>
            {trail.map((crumb, index) => {
              const isLast = index === trail.length - 1;
              return (
                <Fragment key={crumb.href}>
                  <BreadcrumbItem>
                    {isLast ? (
                      <BreadcrumbPage>{crumb.title}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink
                        render={<Link to={crumb.href}>{crumb.title}</Link>}
                      />
                    )}
                  </BreadcrumbItem>
                  {!isLast ? <BreadcrumbSeparator /> : null}
                </Fragment>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </div>
  );
```

- [ ] **Step 4: Delete unused drawer/header components**

Remove:

```bash
rm apps/web/src/components/dashboard/layout/ai-search.tsx
rm apps/web/src/components/dashboard/layout/ai-chat-dialog.tsx
```

- [ ] **Step 5: Run focused static check**

Run:

```bash
rg "AISearch|AIChatDialog|aiDialogOpen|ai-search|ai-chat-dialog" apps/web/src
```

Expected: no matches.

---

### Task 2: Dedicated Assistant Page And Chat Workspace

**Files:**
- Create: `apps/web/src/components/dashboard/assistant/assistant-page.tsx`
- Create: `apps/web/src/components/dashboard/assistant/assistant-chat-workspace.tsx`

**Interfaces:**
- Consumes: `useAppContext(): AppContext` from `#/hooks/useAppContext`.
- Consumes: `addActionToHistory(action: string): void` from `#/lib/ai/context-builder`.
- Produces: `AssistantPage(): JSX.Element`.
- Produces: `AssistantChatWorkspace(): JSX.Element`.

- [ ] **Step 1: Create the assistant page shell**

Create `apps/web/src/components/dashboard/assistant/assistant-page.tsx`:

```tsx
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
```

- [ ] **Step 2: Create the chat workspace**

Create `apps/web/src/components/dashboard/assistant/assistant-chat-workspace.tsx` with the existing drawer chat behavior adapted to a page:

```tsx
import { useMemo, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart3,
  Calendar,
  ClipboardCheck,
  FileText,
  ListChecks,
  MessageCircle,
  RotateCcw,
  Send,
  Sparkles,
  Stethoscope,
} from "lucide-react";
import { toast } from "sonner";
import { Streamdown } from "streamdown";

import { Button } from "@/components/ui/button";
import { useAppContext } from "@/hooks/useAppContext";
import { cn } from "@/lib/style";
import { Bubble, BubbleContent } from "@biume/ui/components/bubble";
import { Input } from "@biume/ui/components/input";
import {
  Message,
  MessageContent,
  MessageHeader,
} from "@biume/ui/components/message";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@biume/ui/components/message-scroller";
import { Spinner } from "@biume/ui/components/spinner";
import { addActionToHistory } from "#/lib/ai/context-builder";

const quickSuggestions = [
  {
    title: "Préparer une consultation",
    prompt:
      "Aide-moi à préparer une consultation avec les points à vérifier, les questions utiles et les informations à noter.",
    icon: Stethoscope,
  },
  {
    title: "Structurer un rapport",
    prompt:
      "Aide-moi à structurer mon prochain rapport avec un plan simple, professionnel et facile à relire.",
    icon: FileText,
  },
  {
    title: "Organiser les relances",
    prompt:
      "Aide-moi à organiser mes relances patients et à identifier les prochaines actions importantes.",
    icon: ClipboardCheck,
  },
  {
    title: "Résumer une situation",
    prompt:
      "Résume cette situation en points importants, risques à surveiller et prochaines étapes possibles.",
    icon: MessageCircle,
  },
];

const commands = [
  {
    name: "/create",
    description: "Préparer la création d'un client, patient ou rapport",
    icon: FileText,
  },
  {
    name: "/resume",
    description: "Résumer un patient, un rapport ou des notes",
    icon: Stethoscope,
  },
  {
    name: "/analyse",
    description: "Analyser des consultations ou observations",
    icon: BarChart3,
  },
  {
    name: "/synthese",
    description: "Créer une synthèse narrative claire",
    icon: ListChecks,
  },
  {
    name: "/schedule",
    description: "Aider à organiser l'agenda",
    icon: Calendar,
  },
  {
    name: "/todo",
    description: "Transformer une situation en prochaines actions",
    icon: ClipboardCheck,
  },
];

const messageVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
  exit: { opacity: 0, y: 8, transition: { duration: 0.15 } },
} as const;

function getMessageText(message: UIMessage): string {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("\n\n");
}

export function AssistantChatWorkspace() {
  const [inputText, setInputText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const appContext = useAppContext();
  const { messages, status, error, sendMessage, setMessages } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
  });

  const isLoading = status === "submitted" || status === "streaming";
  const filteredCommands = useMemo(() => {
    if (!inputText.startsWith("/") || inputText.includes(" ")) return [];
    return commands.filter((command) =>
      command.name.toLowerCase().includes(inputText.toLowerCase()),
    );
  }, [inputText]);

  const handleSend = async (text = inputText) => {
    const message = text.trim();

    if (!message) {
      toast.error("Veuillez saisir une question");
      return;
    }

    addActionToHistory(
      `Assistant : ${message.slice(0, 60)}${message.length > 60 ? " (suite)" : ""}`,
    );
    await sendMessage({ text: message }, { body: { context: appContext } });
    setInputText("");
  };

  const handleReset = () => {
    setMessages([]);
    setInputText("");
    toast.info("Conversation réinitialisée");
  };

  return (
    <section className="grid min-h-[calc(100dvh-9rem)] overflow-hidden rounded-[1.75rem] border border-slate-200/70 bg-white shadow-[0_24px_60px_-32px_rgba(15,23,42,0.32)]">
      <div className="flex min-h-0 flex-col">
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
              <Sparkles className="size-5" />
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-sm font-semibold text-slate-950">
                Conversation
              </h2>
              <p className="truncate text-xs text-slate-500">
                Posez une question naturelle ou utilisez une commande.
              </p>
            </div>
          </div>
          {messages.length > 0 ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="gap-2 rounded-full text-slate-500 hover:bg-emerald-50 hover:text-emerald-700"
            >
              <RotateCcw className="size-4" />
              Recommencer
            </Button>
          ) : null}
        </div>

        <MessageScrollerProvider>
          <MessageScroller className="min-h-0 flex-1">
            <MessageScrollerViewport>
              <MessageScrollerContent className="gap-5 p-5">
                {messages.length === 0 && !isLoading ? (
                  <div className="grid min-h-[24rem] content-center gap-5">
                    <div>
                      <p className="text-sm font-medium text-emerald-700">
                        Bonjour, je suis là.
                      </p>
                      <h3 className="mt-2 max-w-xl text-2xl font-semibold tracking-tight text-slate-950">
                        Déposez une idée brute, je vous aide à la rendre claire.
                      </h3>
                      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                        Vous pouvez partir d'une note, d'une question ou d'un
                        objectif. L'assistant peut structurer, reformuler,
                        synthétiser et préparer les prochaines actions.
                      </p>
                    </div>

                    <div className="grid gap-2 sm:grid-cols-2">
                      {quickSuggestions.map((suggestion) => {
                        const Icon = suggestion.icon;

                        return (
                          <button
                            key={suggestion.title}
                            type="button"
                            className="group rounded-2xl border border-slate-200 bg-slate-50/70 p-3 text-left transition hover:-translate-y-[1px] hover:border-emerald-200 hover:bg-emerald-50/70 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 active:translate-y-0"
                            onClick={() => handleSend(suggestion.prompt)}
                          >
                            <span className="flex items-center gap-3">
                              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm transition group-hover:text-emerald-700">
                                <Icon className="size-4" />
                              </span>
                              <span className="text-sm font-medium text-slate-900">
                                {suggestion.title}
                              </span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : null}

                <AnimatePresence mode="popLayout">
                  {messages.map((message) => {
                    const isUser = message.role === "user";
                    const messageText = getMessageText(message);

                    return (
                      <MessageScrollerItem key={message.id}>
                        <motion.div
                          variants={messageVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                        >
                          <Message align={isUser ? "end" : "start"}>
                            <MessageContent>
                              <MessageHeader
                                className={cn(
                                  "text-slate-500",
                                  isUser && "justify-end",
                                )}
                              >
                                {isUser ? "Vous" : "Assistant Biume"}
                              </MessageHeader>
                              <Bubble
                                align={isUser ? "end" : "start"}
                                variant={isUser ? "default" : "outline"}
                                className={cn(
                                  "max-w-[88%]",
                                  isUser
                                    ? "*:data-[slot=bubble-content]:border-emerald-700 *:data-[slot=bubble-content]:bg-emerald-700 *:data-[slot=bubble-content]:text-white"
                                    : "*:data-[slot=bubble-content]:border-slate-200 *:data-[slot=bubble-content]:bg-white *:data-[slot=bubble-content]:text-slate-800 *:data-[slot=bubble-content]:shadow-sm",
                                )}
                              >
                                <BubbleContent className="rounded-2xl px-4 py-3">
                                  <Streamdown className="text-sm leading-6 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                                    {messageText}
                                  </Streamdown>
                                </BubbleContent>
                              </Bubble>
                            </MessageContent>
                          </Message>
                        </motion.div>
                      </MessageScrollerItem>
                    );
                  })}
                </AnimatePresence>

                {isLoading ? (
                  <MessageScrollerItem>
                    <div className="flex w-fit max-w-[88%] items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
                      <Spinner className="size-4 text-emerald-600" />
                      Je prépare une réponse claire
                    </div>
                  </MessageScrollerItem>
                ) : null}

                {error ? (
                  <MessageScrollerItem>
                    <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
                      Une erreur est survenue. Veuillez réessayer.
                    </div>
                  </MessageScrollerItem>
                ) : null}

                <MessageScrollerItem scrollAnchor />
              </MessageScrollerContent>
            </MessageScrollerViewport>
            <MessageScrollerButton className="border-slate-200 bg-white shadow-md hover:bg-emerald-50" />
          </MessageScroller>
        </MessageScrollerProvider>

        <div className="border-t border-slate-100 p-4">
          <div className="relative">
            {filteredCommands.length > 0 ? (
              <div className="absolute bottom-full left-0 right-0 mb-3 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl">
                {filteredCommands.map((command) => {
                  const Icon = command.icon;

                  return (
                    <button
                      key={command.name}
                      type="button"
                      className="flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                      onClick={() => {
                        setInputText(`${command.name} `);
                        inputRef.current?.focus();
                      }}
                    >
                      <Icon className="mt-0.5 size-4 text-emerald-700" />
                      <span>
                        <span className="block font-medium text-slate-900">
                          {command.name}
                        </span>
                        <span className="block text-xs leading-5 text-slate-500">
                          {command.description}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : null}

            <div className="rounded-[1.35rem] border border-slate-200 bg-white p-2 shadow-sm">
              <div className="flex items-center gap-2">
                <Input
                  ref={inputRef}
                  value={inputText}
                  onChange={(event) => setInputText(event.target.value)}
                  placeholder="Écrivez une question, une note ou tapez /"
                  disabled={isLoading}
                  className="h-11 border-0 bg-transparent px-3 shadow-none focus-visible:ring-0"
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      handleSend();
                    }
                  }}
                />
                <Button
                  type="button"
                  size="icon"
                  disabled={isLoading || !inputText.trim()}
                  onClick={() => handleSend()}
                  aria-label="Envoyer le message"
                  className="size-11 shrink-0 rounded-2xl bg-emerald-700 text-white shadow-sm hover:bg-emerald-800"
                >
                  {isLoading ? (
                    <Spinner className="size-4" />
                  ) : (
                    <Send className="size-4" />
                  )}
                </Button>
              </div>
            </div>
            <p className="mt-2 px-2 text-xs text-slate-500">
              Les commandes commencent par /, mais une phrase naturelle suffit toujours.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Run focused compile check for imports**

Run:

```bash
bun run check-types
```

Expected: exits `0`.

---

### Task 3: Route, Breadcrumb, And Route Tree

**Files:**
- Create: `apps/web/src/routes/dashboard/assistant.tsx`
- Modify: `apps/web/src/lib/breadcrumb-list.tsx`
- Generate: `apps/web/src/routeTree.gen.ts`

**Interfaces:**
- Consumes: `AssistantPage` from `#/components/dashboard/assistant/assistant-page`.
- Produces: TanStack route `/dashboard/assistant`.

- [ ] **Step 1: Add the route file**

Create `apps/web/src/routes/dashboard/assistant.tsx`:

```tsx
import { createFileRoute } from "@tanstack/react-router";

import { AssistantPage } from "#/components/dashboard/assistant/assistant-page";

export const Route = createFileRoute("/dashboard/assistant")({
  head: () => ({
    meta: [
      { title: "Assistant | Biume" },
      {
        name: "description",
        content:
          "Utilisez l'assistant Biume pour préparer les consultations, structurer les rapports et organiser les prochaines actions.",
      },
    ],
  }),
  component: AssistantPage,
});
```

- [ ] **Step 2: Add assistant breadcrumb**

In `apps/web/src/lib/breadcrumb-list.tsx`, add the assistant item after `Agenda`:

```tsx
  {
    title: "Assistant",
    href: `/dashboard/assistant`,
  },
```

- [ ] **Step 3: Regenerate route tree**

Run:

```bash
bun --filter @biume/web generate-routes
```

Expected: exits `0` and updates `apps/web/src/routeTree.gen.ts`.

- [ ] **Step 4: Verify generated route includes assistant**

Run:

```bash
rg "/dashboard/assistant|DashboardAssistant" apps/web/src/routeTree.gen.ts
```

Expected: output includes `/dashboard/assistant`.

---

### Task 4: Full Verification And Visual Smoke Test

**Files:**
- Verify working tree changes from Tasks 1-3.

**Interfaces:**
- Consumes: completed route, sidebar item, page components, and route tree.
- Produces: verified assistant page reachable from sidebar.

- [ ] **Step 1: Run app build**

Run from `apps/web`:

```bash
bun run build
```

Expected: exits `0`. Existing Vite chunk-size warnings are acceptable.

- [ ] **Step 2: Run workspace type check**

Run from workspace root:

```bash
bun run check-types
```

Expected: exits `0`.

- [ ] **Step 3: Start dev server**

Run from `apps/web`:

```bash
bun run dev -- --host 127.0.0.1
```

Expected: Vite prints a local URL such as `http://127.0.0.1:3001/`.

- [ ] **Step 4: Manual visual checks**

Open the local URL and verify:

```text
1. Dashboard header no longer has an Assistant button.
2. Sidebar expanded state shows Assistant after Agenda with Sparkles and IA badge.
3. Sidebar collapsed state shows the special Sparkles assistant item.
4. /dashboard/assistant renders the page header, conversation area, and context panel.
5. Mobile-width layout collapses into one column with no horizontal overflow.
6. Empty state suggestions are visible.
7. Typing / shows slash commands.
8. Empty input disables send.
```

- [ ] **Step 5: Review final diff**

Run:

```bash
git diff -- apps/web/src/lib/menu-list.tsx apps/web/src/components/dashboard/layout/dashboard-sidebar.tsx apps/web/src/components/dashboard/layout/dashboard-header.tsx apps/web/src/components/dashboard/assistant apps/web/src/routes/dashboard/assistant.tsx apps/web/src/lib/breadcrumb-list.tsx apps/web/src/routeTree.gen.ts
```

Expected: diff is scoped to assistant navigation, assistant page, header removal, breadcrumb, and route tree.
