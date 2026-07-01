
import { useState, useEffect } from "react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sparkles,
  Copy,
  RotateCcw,
  X,
  Send,
  CheckIcon,
} from "lucide-react";
import { useVulgarisationAgent } from "@/hooks/useVulgarisationAgent";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/style";

interface VulgarisationPanelProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  reportId?: string;
  initialText?: string;
  onTextInsert?: (text: string) => void;
}

const messageVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.3, ease: "easeOut" as const },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.2 },
  },
} as const;

// Fonction utilitaire pour extraire le texte d'un message
function getMessageText(message: any): string {
  if (message.parts && Array.isArray(message.parts)) {
    const textParts = message.parts
      .filter((part: any) => part.type === "text")
      .map((part: any) => part.text || "")
      .filter((text: string) => text.length > 0);
    return textParts.join("\n\n");
  }

  if (typeof message.content === "string") {
    return message.content;
  }

  return "";
}

export function VulgarisationPanel({
  isOpen,
  onOpenChange,
  reportId,
  initialText = "",
  onTextInsert,
}: VulgarisationPanelProps) {
  const { messages, isLoading, error, sendMessage, reset } =
    useVulgarisationAgent();
  const [inputText, setInputText] = useState(initialText);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Mettre à jour le texte initial quand le panel s'ouvre ou que initialText change
  useEffect(() => {
    if (isOpen && initialText) {
      setInputText(initialText);
    }
  }, [isOpen, initialText]);

  const handleSend = async () => {
    if (!inputText.trim()) {
      toast.error("Veuillez saisir du texte à vulgariser");
      return;
    }

    await sendMessage(inputText, reportId);
    setInputText("");
  };

  const handleCopy = async (text: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(messageId);
      toast.success("Texte copié dans le presse-papier");
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      toast.error("Erreur lors de la copie");
    }
  };

  const handleReset = () => {
    reset();
    setInputText("");
    toast.info("Conversation réinitialisée");
  };

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="h-full w-full sm:max-w-md ml-auto">
        <DrawerHeader className="border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <DrawerTitle>Assistant de vulgarisation</DrawerTitle>
            </div>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon">
                <X className="h-4 w-4" />
              </Button>
            </DrawerClose>
          </div>
          <DrawerDescription>
            Transformez le langage technique en texte clair pour vos clients
          </DrawerDescription>
        </DrawerHeader>

        <div className="flex-1 flex flex-col min-h-0 p-4 space-y-4">
          {/* Zone de saisie */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Texte technique :</label>
            <Textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Collez ou saisissez le texte technique à vulgariser..."
              className="min-h-[100px] resize-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.ctrlKey) {
                  handleSend();
                }
              }}
            />
            <div className="flex gap-2">
              <Button
                onClick={handleSend}
                disabled={isLoading || !inputText.trim()}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <Skeleton className="h-4 w-4 mr-2" />
                    Vulgarisation...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Vulgariser
                  </>
                )}
              </Button>
              {messages.length > 0 && (
                <Button
                  onClick={handleReset}
                  variant="outline"
                  size="icon"
                  title="Réinitialiser"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 min-h-0">
            <ScrollArea className="h-full">
              <div className="space-y-4 pr-4">
                <AnimatePresence mode="popLayout">
                  {messages.map((message) => {
                    const messageText = getMessageText(message);
                    return (
                      <motion.div
                        key={message.id}
                        variants={messageVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className={cn(
                          "rounded-lg p-4",
                          message.role === "user"
                            ? "bg-primary/10 border border-primary/20"
                            : "bg-muted border",
                        )}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <Badge variant={message.role === "user" ? "default" : "secondary"}>
                            {message.role === "user" ? "Vous" : "Assistant"}
                          </Badge>
                          {message.role === "assistant" && messageText && (
                            <div className="flex gap-1">
                              {onTextInsert && (
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => {
                                    onTextInsert(messageText);
                                    toast.success("Texte inséré dans le champ notes");
                                  }}
                                  className="h-6 px-2 text-xs"
                                >
                                  Utiliser
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCopy(messageText, message.id)}
                                className="h-6 px-2"
                              >
                                {copiedId === message.id ? (
                                  <CheckIcon className="h-3 w-3" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </Button>
                            </div>
                          )}
                        </div>
                        <p className="text-sm whitespace-pre-wrap">
                          {messageText}
                        </p>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-2"
                  >
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-5/6" />
                  </motion.div>
                )}

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-destructive/10 border border-destructive/20 rounded-lg p-4"
                  >
                    <p className="text-sm text-destructive">
                      Une erreur est survenue. Veuillez réessayer.
                    </p>
                  </motion.div>
                )}
              </div>
            </ScrollArea>
          </div>

          {messages.length === 0 && !isLoading && (
            <div className="flex-1 flex items-center justify-center text-center text-muted-foreground text-sm p-8">
              <div className="space-y-2">
                <Sparkles className="h-8 w-8 mx-auto opacity-50" />
                <p>
                  Saisissez un texte technique et cliquez sur "Vulgariser" pour
                  le transformer en langage clair.
                </p>
                <p className="text-xs">Astuce : Utilisez Ctrl+Entrée pour envoyer</p>
              </div>
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}







