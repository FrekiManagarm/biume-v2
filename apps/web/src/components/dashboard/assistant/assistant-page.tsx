import { AssistantChatWorkspace } from "./assistant-chat-workspace";

export function AssistantPage() {
  return (
    <div className="flex h-[calc(100dvh-12rem)] min-h-[34rem] flex-col overflow-hidden bg-[#f9fafb] text-slate-950">
      <AssistantChatWorkspace />
    </div>
  );
}
