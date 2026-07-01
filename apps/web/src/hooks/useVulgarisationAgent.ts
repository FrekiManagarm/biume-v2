"use client";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";

export function useVulgarisationAgent() {
  const { messages, status, error, sendMessage: send, setMessages } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/vulgarisation",
    }),
  });

  const isLoading = status === "streaming";

  const sendMessage = async (text: string, reportId?: string) => {
    await send({
      text,
    }, {
      body: {
        reportId,
      },
    });
  };

  const reset = () => setMessages([]);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    reset,
  };
}



