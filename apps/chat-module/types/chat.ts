import type { ChatMessage, ChatMessageStatus, ChatRole } from "@tessera/integration-store";

export type MessageRole = ChatRole;
export type MessageStatus = ChatMessageStatus;

/**
 * Message của Chat module. Kiểu thật nằm ở Integration Layer (`ChatMessage`) vì transcript được
 * giữ trong store dùng chung để sống sót khi remote bị unmount (specs/002 §9).
 */
export type Message = ChatMessage;
