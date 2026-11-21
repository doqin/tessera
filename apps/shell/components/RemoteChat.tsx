"use client";

import { useT } from "@tessera/shared-ui";
import { loadChatRemote } from "./chatRemote";
import { ModuleLoading } from "./ModuleLoading";
import { RemoteModuleBoundary } from "./RemoteModuleBoundary";
import { useRemoteComponent } from "./useRemoteComponent";

function ChatLoader() {
  const t = useT();
  const ChatModule = useRemoteComponent(loadChatRemote);
  if (!ChatModule) {
    return <ModuleLoading label={t("loading.chat")} />;
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
