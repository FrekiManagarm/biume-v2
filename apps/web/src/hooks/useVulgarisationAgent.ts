import { useCallback } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";

type VulgarisationRequestOptions = {
  reportId: string;
  sourceKind:
    | "consultationReason"
    | "observation"
    | "anatomicalIssue"
    | "recommendation"
    | "notes";
  sourceId: string;
};

export function useVulgarisationAgent() {
  const {
    messages,
    status,
    error,
    sendMessage: send,
    setMessages,
  } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/vulgarisation",
    }),
  });

  const isLoading = status === "submitted" || status === "streaming";

  const sendMessage = useCallback(
    async (text: string, options: VulgarisationRequestOptions) => {
      await send(
        {
          text,
        },
        {
          body: options,
        },
      );
    },
    [send],
  );

  const reset = useCallback(() => setMessages([]), [setMessages]);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    reset,
  };
}
