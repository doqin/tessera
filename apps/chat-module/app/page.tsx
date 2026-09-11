import ChatModule from "../components/ChatModule";

/**
 * Trang chính của zone Chat module (Next.js Multi-Zones — basePath "/chat", xem next.config.ts).
 * Shell proxy `/chat` → zone này qua rewrites (specs/001-shell-app/plan.md §2).
 */
export default function Page() {
  return (
    <div className="flex h-full flex-col">
      <ChatModule />
    </div>
  );
}
