import type { Message } from "../types/chat";

export interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${
          isUser ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
        }`}
      >
        <p>{message.content}</p>
        {message.status === "error" ? (
          <p className="mt-1 text-xs opacity-80">Lỗi/timeout — thử gửi lại.</p>
        ) : null}
        {message.status === "interrupted" ? (
          <p className="mt-1 text-xs opacity-80">Phản hồi bị ngắt giữa chừng.</p>
        ) : null}
      </div>
    </div>
  );
}
