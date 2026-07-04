import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type ComponentType,
} from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import {
  ActivityLogIcon,
  BarChartIcon,
  CalendarIcon,
  ChatBubbleIcon,
  CheckCircledIcon,
  ClipboardIcon,
  CrossCircledIcon,
  FileTextIcon,
  ListBulletIcon,
  ResetIcon,
} from "@radix-ui/react-icons";
import { toast } from "sonner";

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message as AIMessage,
  MessageContent as AIMessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import { Button } from "@/components/ui/button";
import { useAppContext } from "@/hooks/useAppContext";
import { cn } from "@/lib/style";
import {
  addActionToHistory,
  getActionsHistory,
} from "#/lib/ai/context-builder";

type IconComponent = ComponentType<{ className?: string }>;

const quickSuggestions: {
  title: string;
  prompt: string;
  icon: IconComponent;
}[] = [
  {
    title: "Préparer une consultation",
    prompt:
      "Aide-moi à préparer une consultation avec les points à vérifier, les questions utiles et les informations à noter.",
    icon: ActivityLogIcon,
  },
  {
    title: "Structurer un rapport",
    prompt:
      "Aide-moi à structurer mon prochain rapport avec un plan simple, professionnel et facile à relire.",
    icon: FileTextIcon,
  },
  {
    title: "Organiser les relances",
    prompt:
      "Aide-moi à organiser mes relances patients et à identifier les prochaines actions importantes.",
    icon: CheckCircledIcon,
  },
  {
    title: "Résumer une situation",
    prompt:
      "Résume cette situation en points importants, risques à surveiller et prochaines étapes possibles.",
    icon: ChatBubbleIcon,
  },
];

const commands: {
  name: string;
  description: string;
  icon: IconComponent;
}[] = [
  {
    name: "/create",
    description: "Préparer la création d'un client, patient ou rapport",
    icon: FileTextIcon,
  },
  {
    name: "/resume",
    description: "Résumer un patient, un rapport ou des notes",
    icon: ActivityLogIcon,
  },
  {
    name: "/analyse",
    description: "Analyser des consultations ou observations",
    icon: BarChartIcon,
  },
  {
    name: "/synthese",
    description: "Créer une synthèse narrative claire",
    icon: ListBulletIcon,
  },
  {
    name: "/schedule",
    description: "Aider à organiser l'agenda",
    icon: CalendarIcon,
  },
  {
    name: "/todo",
    description: "Transformer une situation en prochaines actions",
    icon: ClipboardIcon,
  },
];

const assistantMarkdownClassName = [
  "text-sm leading-6 text-slate-800",
  "[&>*:first-child]:mt-0 [&>*:last-child]:mb-0",
  "[&_p]:my-2",
  "[&_h1]:mb-2 [&_h1]:mt-4 [&_h1]:text-base [&_h1]:font-semibold [&_h1]:leading-6",
  "[&_h2]:mb-2 [&_h2]:mt-4 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:leading-6",
  "[&_h3]:mb-1.5 [&_h3]:mt-3 [&_h3]:text-sm [&_h3]:font-semibold",
  "[&_ul]:my-2 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5",
  "[&_ol]:my-2 [&_ol]:list-decimal [&_ol]:space-y-1 [&_ol]:pl-5",
  "[&_li]:my-0 [&_li]:pl-1",
  "[&_strong]:font-semibold [&_strong]:text-slate-900",
  "[&_a]:break-all [&_a]:text-violet-700 [&_a]:underline",
].join(" ");

function getMessageText(message: UIMessage): string {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("\n\n");
}

export function AssistantChatWorkspace() {
  const [inputText, setInputText] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const appContext = useAppContext();
  const { messages, status, error, sendMessage, setMessages, stop } = useChat({
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

  const handleSend = useCallback(
    async (text = inputText) => {
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
    },
    [appContext, inputText, isLoading, sendMessage],
  );

  const handleReset = () => {
    setMessages([]);
    setInputText("");
    inputRef.current?.focus();
    toast.info("Conversation réinitialisée");
  };

  return (
    <section className="relative flex h-full min-h-0 flex-1 overflow-hidden bg-[#f9fafb]">
      <div className="relative flex h-full min-h-0 w-full flex-col">
        {messages.length > 0 ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleReset}
            title="Réinitialiser la conversation"
            aria-label="Réinitialiser la conversation"
            className="absolute right-3 top-3 size-9 rounded-full bg-white/80 text-slate-500 shadow-[0_12px_30px_-22px_rgba(15,23,42,0.45)] backdrop-blur transition-[background,color,transform] duration-300 hover:bg-white hover:text-emerald-800 active:scale-[0.98]"
          >
            <ResetIcon className="size-4" />
          </Button>
        ) : null}

        <Conversation className="min-h-0 flex-1 bg-[#f9fafb]">
          <ConversationContent className="min-h-full gap-4 px-3 py-5 sm:px-6 sm:py-7">
            {messages.length === 0 && !isLoading ? (
              <div className="mx-auto flex w-full max-w-3xl flex-col gap-5 py-4 sm:py-8">
                <AIMessage from="assistant" className="max-w-[min(92%,52rem)]">
                  <AIMessageContent className="rounded-[1.35rem] border border-slate-200 bg-white px-4 py-3 text-slate-800 shadow-[0_18px_42px_-28px_rgba(15,23,42,0.35)] sm:px-5 sm:py-4">
                    <div className="space-y-2 text-sm leading-6">
                      <p className="font-medium text-slate-950">
                        Je suis prêt.
                      </p>
                      <p className="text-slate-600">
                        Déposez une question, une note brute ou un objectif. Je
                        vous aide à clarifier, rédiger et préparer la suite.
                      </p>
                    </div>
                  </AIMessageContent>
                </AIMessage>

                <div className="flex flex-wrap gap-2 pl-3 sm:pl-11">
                  {quickSuggestions.map((suggestion) => {
                    const Icon = suggestion.icon;

                    return (
                      <button
                        key={suggestion.title}
                        type="button"
                        className="group inline-flex h-9 items-center gap-2 rounded-full border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-[0_10px_26px_-22px_rgba(15,23,42,0.5)] transition-[background,border-color,color,transform] duration-300 hover:-translate-y-[1px] hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-900 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-[0.98]"
                        onClick={() => handleSend(suggestion.prompt)}
                      >
                        <Icon className="size-3.5 text-slate-400 transition-colors group-hover:text-emerald-700" />
                        <span>{suggestion.title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {messages.length > 0 ? (
              <div aria-hidden className="mt-auto" />
            ) : null}

            {messages.map((message) => {
              const isUser = message.role === "user";
              const messageText = getMessageText(message);

              return (
                <AIMessage
                  key={message.id}
                  from={message.role}
                  className={cn(
                    "max-w-[92%] sm:max-w-[min(82%,52rem)]",
                    isUser && "ml-auto",
                  )}
                >
                  <AIMessageContent
                    className={cn(
                      "rounded-[1.35rem] px-4 py-3 shadow-[0_18px_42px_-30px_rgba(15,23,42,0.35)]",
                      isUser
                        ? "border border-emerald-800 bg-emerald-800 text-white"
                        : "border border-slate-200 bg-white text-slate-800",
                    )}
                  >
                    {isUser ? (
                      <div className="text-sm leading-6">{messageText}</div>
                    ) : (
                      <MessageResponse className={assistantMarkdownClassName}>
                        {messageText}
                      </MessageResponse>
                    )}
                  </AIMessageContent>
                </AIMessage>
              );
            })}

            {isLoading ? (
              <AIMessage from="assistant" className="max-w-[18rem]">
                <AIMessageContent className="rounded-[1.35rem] border border-slate-200 bg-white px-4 py-3 text-slate-700 shadow-[0_18px_42px_-30px_rgba(15,23,42,0.35)]">
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                    <span className="size-2 rounded-full bg-emerald-600 motion-safe:animate-pulse" />
                    {status === "submitted"
                      ? "Connexion à l'assistant"
                      : "L'assistant écrit"}
                  </div>
                </AIMessageContent>
              </AIMessage>
            ) : null}

            {error ? (
              <div className="flex w-fit max-w-[92%] items-start gap-3 rounded-[1.35rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <CrossCircledIcon className="mt-0.5 size-4 shrink-0" />
                <div>
                  <p className="font-medium">La réponse a échoué.</p>
                  <p className="mt-1 text-red-600">
                    Réessayez dans un instant ou reformulez votre demande.
                  </p>
                </div>
              </div>
            ) : null}
          </ConversationContent>
          <ConversationScrollButton className="border-slate-200 bg-white shadow-[0_12px_30px_-18px_rgba(15,23,42,0.45)] hover:bg-emerald-50" />
        </Conversation>

        <div className="border-t border-slate-200/70 bg-[#f9fafb] p-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] sm:p-3">
          <div className="relative mx-auto max-w-4xl">
            {filteredCommands.length > 0 ? (
              <div className="absolute bottom-full left-0 right-0 mb-3 overflow-hidden rounded-[1.35rem] border border-slate-200 bg-white p-1.5 shadow-[0_22px_60px_-28px_rgba(15,23,42,0.36)]">
                {filteredCommands.map((command) => {
                  const Icon = command.icon;

                  return (
                    <button
                      key={command.name}
                      type="button"
                      className="flex w-full items-start gap-3 rounded-2xl px-3 py-2.5 text-left text-sm transition-[background,transform] duration-300 hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-[0.99]"
                      onClick={() => {
                        setInputText(`${command.name} `);
                        inputRef.current?.focus();
                      }}
                    >
                      <Icon className="mt-0.5 size-4 text-emerald-800" />
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

            <PromptInput
              className="flex min-h-12 items-center gap-2 rounded-[1.45rem] border border-slate-200 bg-white py-1.5 pl-4 pr-2 shadow-[0_18px_42px_-30px_rgba(15,23,42,0.35)]"
              onSubmit={({ text }) => void handleSend(text)}
            >
              <PromptInputTextarea
                ref={inputRef}
                value={inputText}
                onChange={(event) => setInputText(event.currentTarget.value)}
                placeholder="Écrivez une question, une note ou tapez /"
                disabled={isLoading}
                rows={1}
                className="max-h-28 min-h-9 border-0 bg-transparent px-0 py-2 text-sm leading-6 shadow-none focus-visible:ring-0"
              />
              <PromptInputSubmit
                status={status}
                onStop={stop}
                disabled={!isLoading && !inputText.trim()}
                size="icon-sm"
                className="size-8 shrink-0 rounded-full bg-emerald-800 text-white shadow-none transition-[background,color,transform] duration-200 hover:bg-emerald-900 active:scale-[0.96] disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none"
              />
            </PromptInput>
          </div>
        </div>
      </div>
    </section>
  );
}
