import type { Message } from "../types/chat";
import { MessageBubble } from "./MessageBubble";

export interface ChatWindowProps {
  messages: Message[];
}

export function ChatWindow({ messages }: ChatWindowProps) {
  if (messages.length === 0) {
    return (
      <div
        className="dq-stack"
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: "var(--dq-space-4)",
        }}
      >
        Chưa có tin nhắn — nhập prompt bên dưới để bắt đầu.
      </div>
    );
  }

  return (
    <div
      className="dq-stack"
      style={{ flex: 1, overflowY: "auto", padding: "var(--dq-space-2)" }}
      role="log"
      aria-live="polite"
    >
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
    </div>
  );
}
