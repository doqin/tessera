export type MessageRole = "user" | "agent";
export type MessageStatus = "sent" | "error" | "interrupted";

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  status: MessageStatus;
  createdAt: string;
}
