/** Khai báo kiểu cho remote Module Federation (chỉ expose đúng 1 default export). */
declare module "chat_module/ChatModule" {
  import type { ComponentType } from "react";
  const ChatModule: ComponentType;
  export default ChatModule;
}

declare module "dashboard_module/DashboardModule" {
  import type { ComponentType } from "react";
  const DashboardModule: ComponentType;
  export default DashboardModule;
}
