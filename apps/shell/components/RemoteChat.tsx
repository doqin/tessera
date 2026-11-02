"use client";

import dynamic from "next/dynamic";
import { loadChatRemote } from "./chatRemote";
import { RemoteModuleBoundary } from "./RemoteModuleBoundary";

const ChatModule = dynamic(loadChatRemote, {
  ssr: false,
  // next/dynamic báo lỗi nạp qua prop `error` của `loading` thay vì throw — ném lại để
  // RemoteModuleBoundary bắt được (spec FR5/AC5).
  loading: ({ error }) => {
    if (error) throw error;
    return <p className="text-sm text-foreground/70">Đang tải Chat module…</p>;
  },
});

/** Mount Chat module (remote Module Federation) vào vùng nội dung route `/chat`. */
export function RemoteChat() {
  return (
    <RemoteModuleBoundary moduleName="chat_module">
      <ChatModule />
    </RemoteModuleBoundary>
  );
}
