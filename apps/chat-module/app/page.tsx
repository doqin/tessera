import ChatModule from "../components/ChatModule";

/**
 * Trang chạy độc lập của Chat module (dev/test riêng ở :3001). Khi tích hợp, Shell không dùng trang
 * này mà nạp `ChatModule` qua Module Federation (xem next.config.js).
 */
export default function Page() {
  return (
    <div className="dq-stack" style={{ height: "100%" }}>
      <ChatModule />
    </div>
  );
}
