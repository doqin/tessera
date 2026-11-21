import { RemoteChat } from "../../components/RemoteChat";
import { RemotePreload } from "../../components/RemotePreload";

export default function ChatPage() {
  return (
    <div className="dq-stack" style={{ height: "100%" }}>
      <RemotePreload entryUrl={process.env.NEXT_PUBLIC_CHAT_MODULE_ENTRY ?? ""} />
      <RemoteChat />
    </div>
  );
}
