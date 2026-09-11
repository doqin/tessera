"use client";

import { Card } from "@tessera/shared-ui";
import { useChatViewModel } from "../hooks/useChatViewModel";
import { ChatWindow } from "./ChatWindow";
import { PromptInput } from "./PromptInput";

/**
 * Entry point expose qua Module Federation (`chat_module/ChatModule`) — Shell mount component
 * này vào vùng nội dung route `/chat` (specs/001-shell-app/plan.md §4).
 */
export default function ChatModule() {
  const { messages, submitPrompt } = useChatViewModel();

  return (
    <Card className="flex h-full flex-col">
      <ChatWindow messages={messages} />
      <PromptInput onSubmit={submitPrompt} />
    </Card>
  );
}
