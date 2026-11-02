import type { Message } from "../types/chat";

export interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div
      className="dq-row"
      style={{ justifyContent: isUser ? "flex-end" : "flex-start", gap: "var(--dq-space-2)" }}
    >
      <div
        className="dq-panel"
        style={{
          maxWidth: "75%",
          padding: "var(--dq-space-2) var(--dq-space-3)",
          border: "2px solid var(--dq-color-primary)",
          background: isUser ? "var(--dq-color-primary)" : "var(--dq-color-secondary)",
          color: isUser ? "var(--dq-color-primary-fg)" : "var(--dq-color-secondary-fg)",
        }}
      >
        <p>{message.content}</p>
        {message.status === "error" ? (
          <p style={{ fontSize: "var(--dq-text-sm)", marginTop: "var(--dq-space-1)" }}>
            Lỗi/timeout — thử gửi lại.
          </p>
        ) : null}
        {message.status === "interrupted" ? (
          <p style={{ fontSize: "var(--dq-text-sm)", marginTop: "var(--dq-space-1)" }}>
            Phản hồi bị ngắt giữa chừng.
          </p>
        ) : null}
      </div>
    </div>
  );
}
