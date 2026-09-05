"use client";

import { AssistantChatWorkspace } from "./assistant-chat-workspace";

export function AssistantPage() {
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-[#f9fafb] text-slate-950">
      <AssistantChatWorkspace />
    </div>
  );
}
