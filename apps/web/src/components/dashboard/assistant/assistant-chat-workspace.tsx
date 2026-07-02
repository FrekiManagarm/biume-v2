import { useEffect, useMemo, useRef, useState } from "react";
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
import {
  addActionToHistory,
  getActionsHistory,
} from "#/lib/ai/context-builder";
import type { AssistantPromptRequest } from "./assistant-page";

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

type AssistantChatWorkspaceProps = {
  promptRequest?: AssistantPromptRequest | null;
  onLoadingChange?: (isLoading: boolean) => void;
  onPromptRequestHandled?: () => void;
};

export function AssistantChatWorkspace({
  onLoadingChange,
  promptRequest,
  onPromptRequestHandled,
}: AssistantChatWorkspaceProps) {
  const [inputText, setInputText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const handledPromptRequestIdRef = useRef<string | null>(null);
  const appContext = useAppContext();
  const { messages, status, error, sendMessage, setMessages } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
  });

  const isLoading = status === "submitted" || status === "streaming";
  useEffect(() => {
    onLoadingChange?.(isLoading);
  }, [isLoading, onLoadingChange]);

  const filteredCommands = useMemo(() => {
    if (!inputText.startsWith("/") || inputText.includes(" ")) return [];
    return commands.filter((command) =>
      command.name.toLowerCase().includes(inputText.toLowerCase()),
    );
  }, [inputText]);

  const handleSend = async (text = inputText) => {
    const message = text.trim();

    if (isLoading) {
      return;
    }

    if (!message) {
      toast.error("Veuillez saisir une question");
      return;
    }

    const actionLabel = `Assistant : ${message.slice(0, 60)}${message.length > 60 ? " (suite)" : ""}`;

    addActionToHistory(actionLabel);
    const recentActions = getActionsHistory();
    await sendMessage(
      { text: message },
      {
        body: {
          context: {
            ...appContext,
            recentActions,
          },
        },
      },
    );
    setInputText("");
  };

  useEffect(() => {
    if (!promptRequest) {
      return;
    }

    if (handledPromptRequestIdRef.current === promptRequest.id) {
      return;
    }

    if (isLoading) {
      onPromptRequestHandled?.();
      return;
    }

    handledPromptRequestIdRef.current = promptRequest.id;
    void handleSend(promptRequest.prompt);
    onPromptRequestHandled?.();
  }, [handleSend, isLoading, onPromptRequestHandled, promptRequest]);

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
