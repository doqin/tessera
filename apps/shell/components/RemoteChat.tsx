"use client";

import { loadChatRemote } from "./chatRemote";
import { RemoteModuleBoundary } from "./RemoteModuleBoundary";
import { useRemoteComponent } from "./useRemoteComponent";

function ChatLoader() {
  const ChatModule = useRemoteComponent(loadChatRemote);
  if (!ChatModule) {
    return <p style={{ color: "var(--dq-color-muted)" }}>Đang tải Chat module…</p>;
  }
  return <ChatModule />;
}

/** Mount Chat module (remote Module Federation) vào vùng nội dung route `/chat`. */
export function RemoteChat() {
  return (
    <RemoteModuleBoundary moduleName="chat_module">
      <ChatLoader />
    </RemoteModuleBoundary>
  );
}
